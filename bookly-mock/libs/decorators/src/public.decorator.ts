import { SetMetadata } from "@nestjs/common";

/**
 * Public Decorator
 * Marks a route as public (no authentication required)
 *
 * @example
 * @Public()
 * async login() { ... }
 */
export const IS_PUBLIC_KEY = "isPublic";
export const Public = () => SetMetadata(IS_PUBLIC_KEY, true);
