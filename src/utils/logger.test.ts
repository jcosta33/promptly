import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { logger } from "./logger";

// The gate reads `import.meta.env.DEV` at call time via `isVerboseEnabled()`.
// `vi.stubEnv('DEV', ...)` toggles that flag, letting us drive both build modes
// without re-importing the module.

describe("logger build-mode gate", () => {
  let groupCollapsed: ReturnType<typeof vi.spyOn>;
  let groupEnd: ReturnType<typeof vi.spyOn>;
  let logSpy: ReturnType<typeof vi.spyOn>;
  let warnSpy: ReturnType<typeof vi.spyOn>;
  let errorSpy: ReturnType<typeof vi.spyOn>;

  beforeEach(() => {
    groupCollapsed = vi
      .spyOn(console, "groupCollapsed")
      .mockImplementation(() => {});
    groupEnd = vi.spyOn(console, "groupEnd").mockImplementation(() => {});
    logSpy = vi.spyOn(console, "log").mockImplementation(() => {});
    warnSpy = vi.spyOn(console, "warn").mockImplementation(() => {});
    errorSpy = vi.spyOn(console, "error").mockImplementation(() => {});
  });

  afterEach(() => {
    vi.unstubAllEnvs();
    vi.restoreAllMocks();
  });

  describe("production build (import.meta.env.DEV === false)", () => {
    beforeEach(() => {
      vi.stubEnv("DEV", false);
    });

    it("suppresses debug/info/log — no console output at all", () => {
      logger.debug("selection payload", { secret: "leak" });
      logger.info("event-bus message");
      logger.log("mousemove");

      // The verbose levels print via groupCollapsed/log/groupEnd; none should fire.
      expect(groupCollapsed).not.toHaveBeenCalled();
      expect(groupEnd).not.toHaveBeenCalled();
      expect(logSpy).not.toHaveBeenCalled();
    });

    it("still prints warn and error", () => {
      logger.warn("a warning");
      logger.error("an error");

      expect(warnSpy).toHaveBeenCalledTimes(1);
      expect(errorSpy).toHaveBeenCalledTimes(1);
    });
  });

  describe("dev build (import.meta.env.DEV === true)", () => {
    beforeEach(() => {
      vi.stubEnv("DEV", true);
    });

    it("restores verbose debug/info/log output", () => {
      logger.debug("selection payload");
      logger.info("event-bus message");
      logger.log("mousemove");

      // Each verbose call opens a collapsed group and closes it.
      expect(groupCollapsed).toHaveBeenCalledTimes(3);
      expect(groupEnd).toHaveBeenCalledTimes(3);
    });

    it("still prints warn and error", () => {
      logger.warn("a warning");
      logger.error("an error");

      expect(warnSpy).toHaveBeenCalledTimes(1);
      expect(errorSpy).toHaveBeenCalledTimes(1);
    });
  });
});
