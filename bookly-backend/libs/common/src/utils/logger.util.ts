/**
 * Logger Utility
 * Enhanced wrapper using NestJS Logger with colors
 */

import { Logger as NestLogger, LogLevel as NestLogLevel } from "@nestjs/common";
import { LogLevel } from "../enums";

/**
 * Color codes for terminal output
 */
const colors = {
  reset: "\x1b[0m",
  bright: "\x1b[1m",
  dim: "\x1b[2m",
  // Foreground colors
  red: "\x1b[31m",
  green: "\x1b[32m",
  yellow: "\x1b[33m",
  blue: "\x1b[34m",
  magenta: "\x1b[35m",
  cyan: "\x1b[36m",
  white: "\x1b[37m",
  gray: "\x1b[90m",
  // Background colors
  bgRed: "\x1b[41m",
  bgGreen: "\x1b[42m",
  bgYellow: "\x1b[43m",
  bgBlue: "\x1b[44m",
};

export interface LogEntry {
  level: LogLevel;
  message: string;
  context?: string;
  timestamp: Date;
  data?: any;
  error?: Error;
}

export class Logger {
  private nestLogger: NestLogger;
  private context: string;
  private isProduction: boolean;

  constructor(context: string) {
    this.context = context;
    this.nestLogger = new NestLogger(context);
    this.isProduction = process.env.NODE_ENV === "production";
  }

  /**
   * Colorize text with ANSI codes
   */
  private colorize(text: string, color: string): string {
    return `${color}${text}${colors.reset}`;
  }

  /**
   * Format log with colors based on level
   */
  private formatLog(entry: LogEntry): string {
    const timestamp = entry.timestamp.toISOString();
    const contextStr = entry.context ? ` [${entry.context}]` : "";
    const dataStr = entry.data ? ` ${JSON.stringify(entry.data, null, 2)}` : "";

    let levelColor: string;
    let levelIcon: string;

    switch (entry.level) {
      case LogLevel.ERROR:
        levelColor = colors.red;
        levelIcon = "❌";
        break;
      case LogLevel.WARN:
        levelColor = colors.yellow;
        levelIcon = "⚠️";
        break;
      case LogLevel.INFO:
        levelColor = colors.green;
        levelIcon = "ℹ️";
        break;
      case LogLevel.DEBUG:
        levelColor = colors.cyan;
        levelIcon = "🔍";
        break;
      default:
        levelColor = colors.white;
        levelIcon = "📝";
    }

    const coloredTimestamp = this.colorize(timestamp, colors.gray);
    const coloredLevel = this.colorize(
      `[${entry.level.toUpperCase()}]`,
      levelColor
    );
    const coloredContext = this.colorize(contextStr, colors.magenta);
    const coloredMessage = this.colorize(entry.message, colors.bright);

    return `${levelIcon} ${coloredTimestamp} ${coloredLevel}${coloredContext} ${coloredMessage}${dataStr}`;
  }

  /**
   * Internal log method using NestJS Logger
   */
  private log(level: LogLevel, message: string, data?: any, error?: Error) {
    const entry: LogEntry = {
      level,
      message,
      context: this.context,
      timestamp: new Date(),
      data,
      error,
    };

    // Format message with colors
    const formattedLog = this.formatLog(entry);

    // Use NestJS Logger with formatted output
    switch (level) {
      case LogLevel.ERROR:
        if (error) {
          this.nestLogger.error(formattedLog, error.stack || "");
        } else {
          this.nestLogger.error(formattedLog);
        }
        break;
      case LogLevel.WARN:
        this.nestLogger.warn(formattedLog);
        break;
      case LogLevel.INFO:
        this.nestLogger.log(formattedLog);
        break;
      case LogLevel.DEBUG:
        if (!this.isProduction) {
          this.nestLogger.debug(formattedLog);
        }
        break;
    }
  }

  /**
   * Log error message with optional error object and data
   */
  error(message: string, error?: Error, data?: any) {
    this.log(LogLevel.ERROR, message, data, error);
  }

  /**
   * Log warning message with optional data
   */
  warn(message: string, data?: any) {
    this.log(LogLevel.WARN, message, data);
  }

  /**
   * Log info message with optional data
   */
  info(message: string, data?: any) {
    this.log(LogLevel.INFO, message, data);
  }

  /**
   * Log debug message with optional data (only in development)
   */
  debug(message: string, data?: any) {
    this.log(LogLevel.DEBUG, message, data);
  }

  /**
   * Log verbose message (alias for debug)
   */
  verbose(message: string, data?: any) {
    this.debug(message, data);
  }

  /**
   * Log HTTP request with method, URL and optional userId
   */
  logRequest(method: string, url: string, userId?: string) {
    const methodColor =
      method === "GET"
        ? colors.green
        : method === "POST"
          ? colors.blue
          : method === "PUT" || method === "PATCH"
            ? colors.yellow
            : method === "DELETE"
              ? colors.red
              : colors.white;

    const coloredMethod = this.colorize(method, methodColor);
    this.info(`${coloredMethod} ${url}`, userId ? { userId } : undefined);
  }

  /**
   * Log HTTP response with status code and duration
   */
  logResponse(
    method: string,
    url: string,
    statusCode: number,
    duration: number
  ) {
    const statusColor =
      statusCode >= 500
        ? colors.red
        : statusCode >= 400
          ? colors.yellow
          : statusCode >= 300
            ? colors.cyan
            : colors.green;

    const coloredStatus = this.colorize(statusCode.toString(), statusColor);
    const durationColor = duration > 1000 ? colors.red : colors.green;
    const coloredDuration = this.colorize(`${duration}ms`, durationColor);

    this.info(`${method} ${url} - ${coloredStatus} ${coloredDuration}`);
  }

  /**
   * Log event with event type and optional data
   */
  logEvent(eventType: string, data?: any) {
    const coloredEvent = this.colorize(eventType, colors.magenta);
    this.info(`📡 Event: ${coloredEvent}`, data);
  }

  /**
   * Log database query with params (debug only)
   */
  logQuery(query: string, params?: any) {
    this.debug(`🔎 Query: ${query}`, params);
  }

  /**
   * Get the underlying NestJS logger instance
   */
  getNestLogger(): NestLogger {
    return this.nestLogger;
  }

  /**
   * Set log levels for the NestJS logger
   */
  setLogLevels(levels: NestLogLevel[]) {
    this.nestLogger.localInstance?.setLogLevels?.(levels);
  }
}

export function createLogger(context: string): Logger {
  return new Logger(context);
}
