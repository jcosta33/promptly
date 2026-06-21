const LOG_PREFIX = "[Promptly]";

type LogLevel = "log" | "warn" | "error" | "info" | "debug";

// `warn` and `error` always surface; `log`/`info`/`debug` are verbose and only
// emit in dev builds. `import.meta.env.DEV` is true under `wxt`/vitest and
// false in production builds, so debug traffic (selection payloads, event-bus
// messages, mousemove logs) never reaches a published console.
function isVerboseEnabled(): boolean {
  return import.meta.env.DEV;
}

function logInternal(level: LogLevel, ...args: any[]): void {
  const isAlwaysOn = level === "error" || level === "warn";
  if (!isAlwaysOn && !isVerboseEnabled()) {
    return;
  }

  const timestamp = new Date().toISOString();
  const levelIndicator = level.toUpperCase();
  const consoleMethod = console[level] || console.log;

  if (isAlwaysOn) {
    consoleMethod(`${LOG_PREFIX} ${timestamp} [${levelIndicator}]`, ...args);
  } else {
    console.groupCollapsed(
      `${LOG_PREFIX} ${timestamp} [${levelIndicator}]`,
      args[0],
    );
    if (args.length > 1) {
      console.log(...args.slice(1));
    }
    console.groupEnd();
  }
}

export const logger = {
  log: (...args: any[]) => {
    return logInternal("log", ...args);
  },
  warn: (...args: any[]) => {
    return logInternal("warn", ...args);
  },
  error: (...args: any[]) => {
    return logInternal("error", ...args);
  },
  info: (...args: any[]) => {
    return logInternal("info", ...args);
  },
  debug: (...args: any[]) => {
    return logInternal("debug", ...args);
  },
};
