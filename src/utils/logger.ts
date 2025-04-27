/**
 * Simple logger utility wrapping console methods.
 * Allows for potential future enhancements like filtering or sending logs elsewhere.
 */

const LOG_PREFIX = "[Promptly]";

type LogLevel = "log" | "warn" | "error" | "info" | "debug";

// In a real scenario, this might check process.env.NODE_ENV or a debug flag
const isDebugMode = true; // Or: process.env.NODE_ENV !== 'production';

function logInternal(level: LogLevel, ...args: any[]): void {
    if (!isDebugMode && level === "debug") {
        return; // Skip debug logs if not in debug mode
    }

    const timestamp = new Date().toISOString();
    const levelIndicator = level.toUpperCase();
    const consoleMethod = console[level] || console.log;

    // Group logs for better structure, especially errors/warnings
    if (level === 'error' || level === 'warn') {
        consoleMethod(`${LOG_PREFIX} ${timestamp} [${levelIndicator}]`, ...args);
    } else {
        // Use groupCollapsed for less important logs to keep console tidy
        console.groupCollapsed(`${LOG_PREFIX} ${timestamp} [${levelIndicator}]`, args[0]);
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