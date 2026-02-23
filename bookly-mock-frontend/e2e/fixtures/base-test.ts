/**
 * Base test fixture for Bookly E2E tests.
 *
 * Re-exports test and expect from @playwright/test.
 * All smoke specs should import from this file so shared
 * setup can be added in a single place when needed.
 */
export { expect, test } from "@playwright/test";
