/**
 * Common Utilities for Bookly Mock
 */

import { DEFAULT_PAGE_SIZE, MAX_PAGE_SIZE } from "../constants";
import { ApiError, ApiResponse, PaginationMeta } from "../interfaces";

/**
 * Response Utility
 * Standardizes API responses across all microservices
 */
export class ResponseUtil {
  static success<T>(data: T, message?: string): ApiResponse<T> {
    return {
      success: true,
      data,
      message,
      timestamp: new Date(),
    };
  }

  static paginated<T>(
    data: T[],
    total: number,
    page: number,
    limit: number,
    message?: string
  ): ApiResponse<T[]> {
    const totalPages = Math.ceil(total / limit);

    return {
      success: true,
      data,
      message,
      meta: {
        total,
        page,
        limit,
        totalPages,
      },
      timestamp: new Date(),
    };
  }

  static error(message: string, errors?: ApiError[], data?: any): ApiResponse {
    return {
      success: false,
      message,
      errors,
      data,
      timestamp: new Date(),
    };
  }

  static validationError(errors: ApiError[]): ApiResponse {
    return {
      success: false,
      message: "Validation failed",
      errors,
      timestamp: new Date(),
    };
  }
}

/**
 * Pagination Utility
 */
export class PaginationUtil {
  static normalizePagination(page?: number, limit?: number) {
    const normalizedPage = Math.max(1, page || 1);
    const normalizedLimit = Math.min(
      MAX_PAGE_SIZE,
      Math.max(1, limit || DEFAULT_PAGE_SIZE)
    );
    const skip = (normalizedPage - 1) * normalizedLimit;

    return {
      page: normalizedPage,
      limit: normalizedLimit,
      skip,
    };
  }

  static getMeta(total: number, page: number, limit: number): PaginationMeta {
    return {
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }
}

/**
 * Validation Utility
 */
export class ValidationUtil {
  static isValidEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  static isValidPassword(password: string, minLength = 6): boolean {
    return password.length >= minLength;
  }

  static isValidDate(date: any): boolean {
    return date instanceof Date && !isNaN(date.getTime());
  }

  static isValidUUID(uuid: string): boolean {
    const uuidRegex =
      /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
    return uuidRegex.test(uuid);
  }

  static sanitizeString(input: string): string {
    return input.trim().replace(/<[^>]*>/g, "");
  }

  static validateRequiredFields(
    data: Record<string, any>,
    requiredFields: string[]
  ): ApiError[] {
    const errors: ApiError[] = [];

    for (const field of requiredFields) {
      if (!data[field] || data[field] === "") {
        errors.push({
          code: "REQUIRED_FIELD_MISSING",
          message: `Field '${field}' is required`,
          field,
          type: "validation",
        });
      }
    }

    return errors;
  }
}

/**
 * Date Utility
 */
export class DateUtil {
  static addMinutes(date: Date, minutes: number): Date {
    return new Date(date.getTime() + minutes * 60000);
  }

  static addHours(date: Date, hours: number): Date {
    return new Date(date.getTime() + hours * 3600000);
  }

  static addDays(date: Date, days: number): Date {
    const result = new Date(date);
    result.setDate(result.getDate() + days);
    return result;
  }

  static isSameDay(date1: Date, date2: Date): boolean {
    return (
      date1.getFullYear() === date2.getFullYear() &&
      date1.getMonth() === date2.getMonth() &&
      date1.getDate() === date2.getDate()
    );
  }

  static isTimeInRange(
    time: Date,
    startTime: string,
    endTime: string
  ): boolean {
    const timeStr = `${time.getHours().toString().padStart(2, "0")}:${time.getMinutes().toString().padStart(2, "0")}`;
    return timeStr >= startTime && timeStr <= endTime;
  }

  static formatTime(date: Date): string {
    return `${date.getHours().toString().padStart(2, "0")}:${date.getMinutes().toString().padStart(2, "0")}`;
  }

  static parseTime(timeStr: string): { hours: number; minutes: number } {
    const [hours, minutes] = timeStr.split(":").map(Number);
    return { hours, minutes };
  }

  static isWeekend(date: Date): boolean {
    const day = date.getDay();
    return day === 0 || day === 6;
  }

  static getWeekday(date: Date): string {
    const days = [
      "SUNDAY",
      "MONDAY",
      "TUESDAY",
      "WEDNESDAY",
      "THURSDAY",
      "FRIDAY",
      "SATURDAY",
    ];
    return days[date.getDay()];
  }

  static dateToISO(date: Date): string {
    return date.toISOString();
  }

  static parseISO(isoString: string): Date {
    return new Date(isoString);
  }
}

/**
 * String Utility
 */
export class StringUtil {
  static slugify(text: string): string {
    return text
      .toLowerCase()
      .replace(/\s+/g, "-")
      .replace(/[^\w-]+/g, "")
      .replace(/--+/g, "-")
      .replace(/^-+/, "")
      .replace(/-+$/, "");
  }

  static capitalize(text: string): string {
    return text.charAt(0).toUpperCase() + text.slice(1).toLowerCase();
  }

  static truncate(text: string, maxLength: number): string {
    if (text.length <= maxLength) return text;
    return text.slice(0, maxLength - 3) + "...";
  }

  static generateCode(prefix: string, length = 8): string {
    const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
    let code = prefix + "-";
    for (let i = 0; i < length; i++) {
      code += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return code;
  }

  static randomString(length: number): string {
    const chars =
      "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
    let result = "";
    for (let i = 0; i < length; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
  }
}

/**
 * Array Utility
 */
export class ArrayUtil {
  static unique<T>(array: T[]): T[] {
    return [...new Set(array)];
  }

  static chunk<T>(array: T[], size: number): T[][] {
    const chunks: T[][] = [];
    for (let i = 0; i < array.length; i += size) {
      chunks.push(array.slice(i, i + size));
    }
    return chunks;
  }

  static groupBy<T>(array: T[], key: keyof T): Record<string, T[]> {
    return array.reduce(
      (groups, item) => {
        const groupKey = String(item[key]);
        if (!groups[groupKey]) {
          groups[groupKey] = [];
        }
        groups[groupKey].push(item);
        return groups;
      },
      {} as Record<string, T[]>
    );
  }

  static shuffle<T>(array: T[]): T[] {
    const shuffled = [...array];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
  }
}

/**
 * Object Utility
 */
export class ObjectUtil {
  static pick<T extends object, K extends keyof T>(
    obj: T,
    keys: K[]
  ): Pick<T, K> {
    const result = {} as Pick<T, K>;
    for (const key of keys) {
      if (key in obj) {
        result[key] = obj[key];
      }
    }
    return result;
  }

  static omit<T extends object, K extends keyof T>(
    obj: T,
    keys: K[]
  ): Omit<T, K> {
    const result = { ...obj };
    for (const key of keys) {
      delete result[key];
    }
    return result;
  }

  static isEmpty(obj: object): boolean {
    return Object.keys(obj).length === 0;
  }

  static deepClone<T>(obj: T): T {
    return JSON.parse(JSON.stringify(obj));
  }
}

/**
 * Delay/Sleep Utility
 */
export const sleep = (ms: number): Promise<void> => {
  return new Promise((resolve) => setTimeout(resolve, ms));
};

/**
 * Random Utility
 */
export class RandomUtil {
  static integer(min: number, max: number): number {
    return Math.floor(Math.random() * (max - min + 1)) + min;
  }

  static float(min: number, max: number): number {
    return Math.random() * (max - min) + min;
  }

  static boolean(): boolean {
    return Math.random() >= 0.5;
  }

  static element<T>(array: T[]): T {
    return array[Math.floor(Math.random() * array.length)];
  }
}

/**
 * Simulation Utility
 * For realistic behavior in mock
 */
export class SimulationUtil {
  static async simulateNetworkLatency(
    minMs: number,
    maxMs: number
  ): Promise<void> {
    const latency = RandomUtil.integer(minMs, maxMs);
    await sleep(latency);
  }

  static shouldSimulateError(errorRate: number): boolean {
    return Math.random() < errorRate;
  }

  static randomError(): Error {
    const errors = [
      new Error("Network timeout"),
      new Error("Service temporarily unavailable"),
      new Error("Database connection lost"),
      new Error("Internal server error"),
    ];
    return RandomUtil.element(errors);
  }
}

/**
 * Permission Utility
 */
export class PermissionUtil {
  static hasPermission(
    userPermissions: string[],
    requiredPermission: string
  ): boolean {
    // Check for wildcard permissions
    if (userPermissions.includes("*:*")) {
      return true;
    }

    // Check exact match
    if (userPermissions.includes(requiredPermission)) {
      return true;
    }

    // Check for resource wildcard (e.g., 'resource:*')
    const [resource, action] = requiredPermission.split(":");
    if (userPermissions.includes(`${resource}:*`)) {
      return true;
    }

    return false;
  }

  static hasAnyPermission(
    userPermissions: string[],
    requiredPermissions: string[]
  ): boolean {
    return requiredPermissions.some((permission) =>
      this.hasPermission(userPermissions, permission)
    );
  }

  static hasAllPermissions(
    userPermissions: string[],
    requiredPermissions: string[]
  ): boolean {
    return requiredPermissions.every((permission) =>
      this.hasPermission(userPermissions, permission)
    );
  }
}

export * from "./ical-generator.util";
export * from "./logger.util";
export * from "./response.util";
