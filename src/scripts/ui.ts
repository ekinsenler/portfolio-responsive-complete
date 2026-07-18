/**
 * Progressive-enhancement UI bundle: mobile menu, theme toggle, scroll reveal,
 * and nav scroll-spy. Loaded once as a small deferred module. Everything here
 * degrades gracefully: without JS the menu is not needed (content is reachable),
 * content is visible, and the theme falls back to the OS preference.
 */
export {}; // Treat this file as a module so its top-level names stay local.

// ---------- Mobile menu ----------
const nav = document.getElementById('nav-menu');
const toggle = document.getElementById('nav-toggle');
const closeBtn = document.getElementById('nav-close');

function setMenu(open: boolean): void {
  if (!nav || !toggle) return;
  nav.classList.toggle('is-open', open);
  toggle.setAttribute('aria-expanded', String(open));
  document.body.classList.toggle('menu-open', open);
}

toggle?.addEventListener('click', () => {
  setMenu(toggle.getAttribute('aria-expanded') !== 'true');
});
closeBtn?.addEventListener('click', () => setMenu(false));
nav?.querySelectorAll('a').forEach((link) => link.addEventListener('click', () => setMenu(false)));
document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape') setMenu(false);
});

// ---------- Theme toggle ----------
const themeBtn = document.getElementById('theme-toggle');

const currentTheme = (): 'light' | 'dark' =>
  document.documentElement.dataset.theme === 'dark' ? 'dark' : 'light';

function syncThemeButton(): void {
  if (!themeBtn) return;
  const isDark = currentTheme() === 'dark';
  themeBtn.setAttribute('aria-pressed', String(isDark));
  themeBtn.setAttribute('aria-label', isDark ? 'Switch to light theme' : 'Switch to dark theme');
}

themeBtn?.addEventListener('click', () => {
  const next = currentTheme() === 'dark' ? 'light' : 'dark';
  document.documentElement.dataset.theme = next;
  try {
    localStorage.setItem('theme', next);
  } catch {
    /* storage may be unavailable (private mode) — non-fatal */
  }
  syncThemeButton();
});
syncThemeButton();

// ---------- Scroll reveal ----------
const revealEls = document.querySelectorAll('[data-reveal]');
const motionOK = window.matchMedia('(prefers-reduced-motion: no-preference)').matches;

if (revealEls.length && motionOK && 'IntersectionObserver' in window) {
  const io = new IntersectionObserver(
    (entries, obs) => {
      for (const entry of entries) {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          obs.unobserve(entry.target);
        }
      }
    },
    { threshold: 0.12, rootMargin: '0px 0px -10% 0px' }
  );
  revealEls.forEach((el) => io.observe(el));
} else {
  // Reduced motion or no IO support: show everything immediately.
  revealEls.forEach((el) => el.classList.add('is-visible'));
}

// ---------- Nav scroll-spy ----------
const navLinks = Array.from(document.querySelectorAll<HTMLAnchorElement>('.nav__link[href*="#"]'));
const sections = navLinks
  .map((link) => (link.hash ? document.getElementById(link.hash.slice(1)) : null))
  .filter((el): el is HTMLElement => el !== null);

if (sections.length && 'IntersectionObserver' in window) {
  const spy = new IntersectionObserver(
    (entries) => {
      for (const entry of entries) {
        if (!entry.isIntersecting) continue;
        const id = entry.target.id;
        for (const link of navLinks) {
          const active = link.hash === `#${id}`;
          link.classList.toggle('is-active', active);
          if (active) link.setAttribute('aria-current', 'true');
          else link.removeAttribute('aria-current');
        }
      }
    },
    { rootMargin: '-45% 0px -50% 0px' }
  );
  sections.forEach((section) => spy.observe(section));
}
