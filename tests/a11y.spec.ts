import { test, expect, type Page } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

// Third-party Credly badge iframes are outside our control — exclude them so the
// scan reflects only this site's markup.
const scan = (page: Page) =>
  new AxeBuilder({ page })
    .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'wcag22aa'])
    .exclude('.about__badges')
    .analyze();

const seriousOnly = (violations: Awaited<ReturnType<typeof scan>>['violations']) =>
  violations.filter((v) => v.impact === 'serious' || v.impact === 'critical');

// Load with the theme already chosen so it applies before first paint (no theme
// transition mid-scan) — exactly how a returning visitor loads the page.
async function gotoWithTheme(page: Page, theme: 'light' | 'dark') {
  await page.addInitScript((t) => {
    try {
      localStorage.setItem('theme', t);
    } catch {
      /* ignore */
    }
  }, theme);
  await page.goto('/');
  await expect(page.locator('html')).toHaveAttribute('data-theme', theme);
}

for (const theme of ['light', 'dark'] as const) {
  test(`home page: no serious/critical a11y violations (${theme} theme)`, async ({ page }) => {
    await gotoWithTheme(page, theme);
    const { violations } = await scan(page);
    const serious = seriousOnly(violations);
    expect(
      serious,
      JSON.stringify(
        serious.map((v) => ({ id: v.id, impact: v.impact, nodes: v.nodes.length })),
        null,
        2
      )
    ).toEqual([]);
  });
}
