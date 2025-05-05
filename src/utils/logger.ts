const LOG_PREFIX = "[Promptly]";

type LogLevel = "log" | "warn" | "error" | "info" | "debug";

const isDebugMode = true; // Or: process.env.NODE_ENV !== 'production';

function logInternal(level: LogLevel, ...args: any[]): void {
  if (!isDebugMode) {
    return;
  }

  const timestamp = new Date().toISOString();
  const levelIndicator = level.toUpperCase();
  const consoleMethod = console[level] || console.log;

  if (level === "error" || level === "warn") {
    consoleMethod(`${LOG_PREFIX} ${timestamp} [${levelIndicator}]`, ...args);
  } else {
    console.groupCollapsed(
      `${LOG_PREFIX} ${timestamp} [${levelIndicator}]`,
      args[0]
    );
    if (args.length > 1) {
      console.log(...args.slice(1));
    }
    console.groupEnd();
  }
}

export const logger = {
  log: (...args: any[]) => logInternal("log", ...args),
  warn: (...args: any[]) => logInternal("warn", ...args),
  error: (...args: any[]) => logInternal("error", ...args),
  info: (...args: any[]) => logInternal("info", ...args),
  debug: (...args: any[]) => logInternal("debug", ...args),
};
