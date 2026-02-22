/**
 * Global Setup — Playwright
 *
 * Performs login for each role and saves storageState
 * so tests can reuse authenticated sessions without repeating login.
 */

import { chromium, type FullConfig } from "@playwright/test";
import * as fs from "fs";
import * as path from "path";
import { AUTH_STATE_DIR, TEST_USERS } from "./fixtures/test-users";

async function globalSetup(config: FullConfig) {
  const baseURL = config.projects[0]?.use?.baseURL || "http://localhost:4200";

  const authDir = path.resolve(AUTH_STATE_DIR);
  if (!fs.existsSync(authDir)) {
    fs.mkdirSync(authDir, { recursive: true });
  }

  const browser = await chromium.launch();

  for (const [role, creds] of Object.entries(TEST_USERS)) {
    const context = await browser.newContext();
    const page = await context.newPage();

    try {
      await page.goto(`${baseURL}/es/login`, { waitUntil: "networkidle" });

      await page.fill('[data-testid="login-email-input"]', creds.email);
      await page.fill('[data-testid="login-password-input"]', creds.password);
      await page.click('[data-testid="login-submit-btn"]');

      await page.waitForURL(/dashboard/, { timeout: 15000 });

      const statePath = path.resolve(`${AUTH_STATE_DIR}/${role}.json`);
      await context.storageState({ path: statePath });

      console.log(`✅ Auth state saved for role: ${role}`);
    } catch (error) {
      console.error(`❌ Failed to create auth state for role: ${role}`, error);
    } finally {
      await context.close();
    }
  }

  await browser.close();
}

export default globalSetup;
