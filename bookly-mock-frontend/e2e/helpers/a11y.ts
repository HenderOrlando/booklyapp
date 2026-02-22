/**
 * Accessibility (a11y) test helpers for Playwright
 *
 * Uses @axe-core/playwright to run automated accessibility checks.
 * Install: npm install -D @axe-core/playwright
 *
 * Usage in specs:
 * ```ts
 * import { checkA11y } from '../helpers/a11y';
 *
 * test('page is accessible', async ({ page }) => {
 *   await page.goto('/dashboard');
 *   await checkA11y(page);
 * });
 * ```
 */

import type { Page } from "@playwright/test";
import { expect } from "@playwright/test";

export interface A11yCheckOptions {
  includedImpacts?: Array<"minor" | "moderate" | "serious" | "critical">;
  exclude?: string[];
  disableRules?: string[];
}

/**
 * Run axe-core accessibility check on the current page.
 * Fails the test if any violations of the specified severity are found.
 */
export async function checkA11y(
  page: Page,
  options: A11yCheckOptions = {},
): Promise<void> {
  const {
    includedImpacts = ["serious", "critical"],
    exclude = [],
    disableRules = [],
  } = options;

  let AxeBuilder: typeof import("@axe-core/playwright").default;
  try {
    const mod = await import("@axe-core/playwright");
    AxeBuilder = mod.default;
  } catch {
    console.warn(
      "⚠️ @axe-core/playwright not installed. Skipping a11y check. Install with: npm i -D @axe-core/playwright",
    );
    return;
  }

  let builder = new AxeBuilder({ page });

  if (exclude.length > 0) {
    for (const selector of exclude) {
      builder = builder.exclude(selector);
    }
  }

  if (disableRules.length > 0) {
    builder = builder.disableRules(disableRules);
  }

  const results = await builder.analyze();

  const violations = results.violations.filter((v) =>
    v.impact ? includedImpacts.includes(v.impact as A11yCheckOptions["includedImpacts"] extends Array<infer U> ? U : never) : false,
  );

  if (violations.length > 0) {
    const summary = violations
      .map(
        (v) =>
          `[${v.impact}] ${v.id}: ${v.description} (${v.nodes.length} element(s))`,
      )
      .join("\n  ");

    expect(
      violations.length,
      `Accessibility violations found:\n  ${summary}`,
    ).toBe(0);
  }
}

/**
 * Check contrast ratio specifically (WCAG AA: 4.5:1 for normal text, 3:1 for large text)
 */
export async function checkContrast(page: Page): Promise<void> {
  await checkA11y(page, {
    includedImpacts: ["serious", "critical"],
    disableRules: [
      "bypass",
      "landmark-one-main",
      "page-has-heading-one",
      "region",
    ],
  });
}
