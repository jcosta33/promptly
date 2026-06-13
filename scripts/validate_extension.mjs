import http from "node:http";
import { existsSync, readFileSync } from "node:fs";
import { mkdir } from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { setTimeout as delay } from "node:timers/promises";

import { chromium } from "playwright";

const projectRoot = path.resolve(new URL("..", import.meta.url).pathname);
const extensionPath = path.join(projectRoot, ".output", "chrome-mv3");
const manifestPath = path.join(extensionPath, "manifest.json");
const browserChannel = process.env.PROMPTLY_BROWSER_CHANNEL || "chrome";
const usesBundledChromium = browserChannel === "bundled";
const profilePath =
  process.env.PROMPTLY_EXTENSION_PROFILE ||
  path.join(os.tmpdir(), `promptly-extension-profile-${Date.now()}`);
const observations = [];

function record(result, name, details) {
  observations.push({ result, name, details });
  console.log(`[${result}] ${name}: ${details}`);
}

function getExitCode() {
  if (observations.some((observation) => observation.result === "Fail")) {
    return 1;
  }

  if (observations.some((observation) => observation.result === "Blocked")) {
    return 2;
  }

  return 0;
}

function getExtensionSettingsCount() {
  const preferencesPath = path.join(profilePath, "Default", "Preferences");

  if (!existsSync(preferencesPath)) {
    return "preferences-not-written-yet";
  }

  try {
    const preferences = JSON.parse(readFileSync(preferencesPath, "utf8"));
    return String(Object.keys(preferences.extensions?.settings || {}).length);
  } catch (error) {
    return `preferences-unreadable:${error instanceof Error ? error.message : String(error)}`;
  }
}

function readManifest() {
  return JSON.parse(readFileSync(manifestPath, "utf8"));
}

function getExpectedWorkerPath(manifest) {
  return manifest.background?.service_worker || "background.js";
}

function getPopupPath(manifest) {
  return (
    manifest.action?.default_popup || manifest.browser_action?.default_popup
  );
}

function workerMatches(worker, expectedWorkerPath) {
  try {
    const workerUrl = new URL(worker.url());

    return (
      workerUrl.protocol === "chrome-extension:" &&
      workerUrl.pathname.replace(/^\//, "") === expectedWorkerPath
    );
  } catch {
    return false;
  }
}

function getSeenExtensionWorkers(context) {
  return context
    .serviceWorkers()
    .filter((worker) => {
      return worker.url().startsWith("chrome-extension://");
    })
    .map((worker) => {
      return worker.url();
    });
}

async function waitForExtensionWorker(context, expectedWorkerPath) {
  const existingWorker = context
    .serviceWorkers()
    .find((worker) => workerMatches(worker, expectedWorkerPath));

  if (existingWorker) {
    return existingWorker;
  }

  const extensionsPage = await context.newPage();
  await extensionsPage.goto("chrome://extensions/");
  const deadline = Date.now() + 20000;

  try {
    while (Date.now() < deadline) {
      const remaining = Math.max(500, deadline - Date.now());
      const worker = await context
        .waitForEvent("serviceworker", { timeout: remaining })
        .catch(() => {
          return undefined;
        });

      if (workerMatches(worker, expectedWorkerPath)) {
        return worker;
      }

      const existingMatch = context.serviceWorkers().find((candidate) => {
        return workerMatches(candidate, expectedWorkerPath);
      });

      if (existingMatch) {
        return existingMatch;
      }

      await delay(250);
    }

    throw new Error(
      `Timed out waiting for Promptly service worker ${expectedWorkerPath}; seen ${getSeenExtensionWorkers(context).join(", ") || "none"}`,
    );
  } finally {
    await extensionsPage.close().catch(() => {});
  }
}

function createValidationServer() {
  const server = http.createServer((_request, response) => {
    response.writeHead(200, { "content-type": "text/html; charset=utf-8" });
    response.end(`<!doctype html>
<html>
  <head>
    <title>Promptly Extension Validation</title>
  </head>
  <body>
    <main>
      <h1>Promptly Extension Validation</h1>
      <p id="sample">Promptly should detect this selected text and mount the content script.</p>
    </main>
  </body>
</html>`);
  });

  return server;
}

function listen(server) {
  return new Promise((resolve, reject) => {
    const handleError = (error) => {
      reject(error);
    };

    server.once("error", handleError);
    server.listen(0, "127.0.0.1", () => {
      server.off("error", handleError);
      resolve();
    });
  });
}

async function main() {
  record("Info", "extension path", extensionPath);
  record("Info", "profile path", profilePath);
  record(
    "Info",
    "browser channel",
    usesBundledChromium ? "bundled chromium" : browserChannel,
  );

  if (!existsSync(manifestPath)) {
    record(
      "Blocked",
      "extension build",
      `missing ${manifestPath}; run pnpm build before pnpm validate:extension`,
    );
    return;
  }

  const manifest = readManifest();
  const expectedWorkerPath = getExpectedWorkerPath(manifest);
  const popupPath = getPopupPath(manifest);

  record("Info", "manifest service worker", expectedWorkerPath);
  record("Info", "manifest popup", popupPath || "none");

  if (!popupPath) {
    record("Fail", "popup manifest", "missing action.default_popup");
    return;
  }

  if (!existsSync(path.join(extensionPath, popupPath))) {
    record(
      "Fail",
      "popup build artifact",
      `missing ${path.join(extensionPath, popupPath)}`,
    );
    return;
  }

  await mkdir(profilePath, { recursive: true });

  const server = createValidationServer();
  try {
    await listen(server);
  } catch (error) {
    record(
      "Blocked",
      "validation server",
      error instanceof Error ? error.message : String(error),
    );
    server.close();
    return;
  }

  const port = server.address().port;
  let context;

  try {
    const launchOptions = {
      headless: false,
      ignoreDefaultArgs: [
        "--disable-extensions",
        "--disable-component-extensions-with-background-pages",
        "--no-service-autorun",
      ],
      viewport: { width: 1280, height: 900 },
      args: [
        `--disable-extensions-except=${extensionPath}`,
        `--load-extension=${extensionPath}`,
        "--disable-features=DisableLoadExtensionCommandLineSwitch",
        "--no-first-run",
        "--no-default-browser-check",
      ],
    };

    if (!usesBundledChromium) {
      launchOptions.channel = browserChannel;
    }

    context = await chromium.launchPersistentContext(
      profilePath,
      launchOptions,
    );

    let worker;
    try {
      worker = await waitForExtensionWorker(context, expectedWorkerPath);
    } catch (error) {
      record(
        "Blocked",
        "extension service worker",
        `${error instanceof Error ? error.message : String(error)}${
          usesBundledChromium
            ? ""
            : "; local Chrome may be blocking command-line extension loading, retry with PROMPTLY_BROWSER_CHANNEL=bundled to isolate browser policy from extension behavior"
        }`,
      );
      record(
        "Blocked",
        "profile extension settings",
        `${getExtensionSettingsCount()} registered extension setting(s)`,
      );
      return;
    }

    const extensionId = worker.url().split("/")[2];
    record("Pass", "extension service worker", worker.url());
    record("Pass", "extension id", extensionId);
    record(
      "Info",
      "profile extension settings",
      `${getExtensionSettingsCount()} registered extension setting(s)`,
    );

    const popup = await context.newPage();
    await popup.goto(`chrome-extension://${extensionId}/${popupPath}`);
    await popup.waitForSelector("body", { timeout: 10000 });
    const popupText = await popup.locator("body").innerText();
    record(
      popupText.trim().length > 0 ? "Pass" : "Fail",
      "popup smoke",
      popupText.replace(/\s+/g, " ").slice(0, 240),
    );
    await popup.close();

    const page = await context.newPage();
    await page.goto(`http://127.0.0.1:${port}/`);
    await page.waitForSelector("promptly-root#promptly-root", {
      state: "attached",
      timeout: 10000,
    });
    record("Pass", "content script mount", "promptly-root attached");

    await page.evaluate(() => {
      const sample = document.querySelector("#sample");
      const textNode = sample?.firstChild;

      if (!sample || !textNode) {
        throw new Error("missing validation sample text");
      }

      const range = document.createRange();
      range.setStart(textNode, 0);
      range.setEnd(textNode, 28);

      const selection = window.getSelection();
      selection?.removeAllRanges();
      selection?.addRange(range);

      document.dispatchEvent(
        new MouseEvent("mouseup", {
          bubbles: true,
          clientX: 320,
          clientY: 180,
          pageX: 320,
          pageY: 180,
        }),
      );
    });

    const trigger = page.locator(
      'promptly-root#promptly-root button[aria-label="Open Promptly"]',
    );
    await trigger.waitFor({ state: "visible", timeout: 10000 });
    record("Pass", "selection trigger", "Open Promptly trigger visible");
    await trigger.click();

    await page
      .locator(
        'promptly-root#promptly-root button[aria-label="Close Promptly overlay"]',
      )
      .waitFor({ state: "visible", timeout: 10000 });
    record("Pass", "overlay open", "Promptly overlay close control visible");

    await page.keyboard.press("Escape");
    await page
      .locator(
        'promptly-root#promptly-root button[aria-label="Close Promptly overlay"]',
      )
      .waitFor({ state: "detached", timeout: 10000 });
    record("Pass", "overlay escape close", "Promptly overlay closed");
    await page.close();
  } catch (error) {
    record(
      "Fail",
      "validation error",
      error instanceof Error ? error.stack || error.message : String(error),
    );
  } finally {
    await context?.close().catch(() => {});
    server.close();
  }
}

await main();
process.exitCode = getExitCode();
