/*
 * Randomizer Block
 * Loads one fragment, chosen at random from a configured set of URLs, on each page load.
 */

import { loadFragment } from '../fragment/fragment.js';

/**
 * @param {Element} block
 */
export default async function decorate(block) {
  const [urlsRow, heightMobileRow, heightDesktopRow] = [...block.children];

  const urls = urlsRow
    ? [...urlsRow.querySelectorAll('a')].map((a) => a.getAttribute('href')).filter(Boolean)
    : [];
  const heightMobile = heightMobileRow?.textContent.trim();
  const heightDesktop = heightDesktopRow?.textContent.trim();

  if (heightMobile) block.style.setProperty('--randomizer-height-mobile', heightMobile);
  if (heightDesktop) block.style.setProperty('--randomizer-height-desktop', heightDesktop);

  block.replaceChildren();
  if (!urls.length) return;

  // Not security-sensitive: only picks which fragment to display, not a token/secret.
  // eslint-disable-next-line sonarjs/pseudo-random
  const path = urls[Math.floor(Math.random() * urls.length)];
  const fragment = await loadFragment(path);
  if (!fragment) return;

  block.append(...fragment.childNodes);
}
