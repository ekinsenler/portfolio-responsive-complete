import { test, expect } from '@playwright/test';

test('homepage loads with correct title and a single h1', async ({ page }) => {
  const jsErrors: string[] = [];
  page.on('pageerror', (err) => jsErrors.push(err.message));

  await page.goto('/');
  await expect(page).toHaveTitle(/Ekin Senler/);
  await expect(page.locator('h1')).toHaveCount(1);
  await expect(page.locator('h1')).toContainText('Ekin');

  expect(jsErrors, `Uncaught JS errors: ${jsErrors.join('; ')}`).toEqual([]);
});

test('all primary sections and their anchors exist', async ({ page }) => {
  await page.goto('/');
  for (const id of ['home', 'about', 'projects', 'contact']) {
    await expect(page.locator(`#${id}`)).toBeVisible();
  }
});

test('all 12 projects render from the content collection', async ({ page }) => {
  await page.goto('/');
  await expect(page.locator('#projects article.card')).toHaveCount(12);
});

test('nav link scrolls to the contact anchor', async ({ page }) => {
  await page.goto('/');
  await page.locator('.nav__link', { hasText: 'Contact' }).click();
  await expect(page).toHaveURL(/#contact$/);
});

test('mobile menu is off-screen by default and slides in on toggle', async ({ page }) => {
  const width = 390;
  await page.setViewportSize({ width, height: 800 });
  await page.goto('/');

  const toggle = page.locator('#nav-toggle');
  const menu = page.locator('#nav-menu');

  // Closed by default: the drawer sits off the right edge of the viewport.
  await expect(toggle).toHaveAttribute('aria-expanded', 'false');
  await expect(menu).not.toBeInViewport();

  // Opens on toggle and slides into view (assertion retries through the animation).
  await toggle.click();
  await expect(toggle).toHaveAttribute('aria-expanded', 'true');
  await expect(menu).toBeInViewport({ ratio: 0.5 });

  // Selecting a destination closes the menu again.
  await page.locator('#nav-menu .nav__link', { hasText: 'About' }).click();
  await expect(toggle).toHaveAttribute('aria-expanded', 'false');
  await expect(menu).not.toBeInViewport();
});

test('theme toggle switches theme and persists across reloads', async ({ page }) => {
  await page.goto('/');
  const html = page.locator('html');
  const initial = await html.getAttribute('data-theme');

  await page.locator('#theme-toggle').click();
  const updated = await html.getAttribute('data-theme');
  expect(updated).not.toBe(initial);

  await page.reload();
  await expect(page.locator('html')).toHaveAttribute('data-theme', updated!);
});

test('contact form has labelled, required fields and preserves the Formspree action', async ({
  page,
}) => {
  await page.goto('/');
  for (const id of ['name', 'email', 'message']) {
    await expect(page.locator(`#${id}`)).toHaveJSProperty('required', true);
    await expect(page.locator(`label[for="${id}"]`)).toHaveCount(1);
  }
  await expect(page.locator('#contact-form')).toHaveAttribute(
    'action',
    /formspree\.io\/f\/xzbnkbvq/
  );
});

test('social links point to the real profiles and are safe (rel=noopener)', async ({ page }) => {
  await page.goto('/');
  const linkedin = page.locator('a[href="https://www.linkedin.com/in/ekinsenler"]').first();
  const github = page.locator('a[href="https://github.com/ekinsenler"]').first();
  await expect(linkedin).toHaveAttribute('rel', /noopener/);
  await expect(github).toHaveAttribute('rel', /noopener/);
});

test('a skip link is the first focusable element', async ({ page }) => {
  await page.goto('/');
  await page.keyboard.press('Tab');
  const focused = page.locator(':focus');
  await expect(focused).toHaveText(/skip to content/i);
});

test('404 page renders the not-found message', async ({ page }) => {
  await page.goto('/this-page-does-not-exist');
  await expect(page.locator('h1')).toContainText('Page not found');
});
