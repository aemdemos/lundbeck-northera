/* eslint-disable */
/* global WebImporter */

/**
 * Parser: hero-hcp-internal
 * Base block: hero (variant styling in blocks/hero-hcp-internal).
 *
 * Hero convention — 1 column, 3 rows:
 *   row 1: block name ("hero-hcp-internal")
 *   row 2: background image (the source banner art)
 *   row 3: content — title (H1), plus an optional CTA link. A small circular
 *          icon image precedes the title inside the content cell.
 *
 * Internal HCP-page icon banner: full-width sky/blue banner background with a
 * small circular icon, a single H1, and a CTA link ("For Healthcare
 * Professionals"). Distinct from hero-hcp (the landing hero).
 * Selector: the desktop teaser `.cmp-teaser[class*="bannericondesktop"]`.
 * Generated: 2026-07-20
 */
function normalizeHref(raw) {
  if (!raw) return '';
  try {
    const u = new URL(raw, 'https://northera-stage.d.lundbeckus.com');
    if (/(^|\.)northera-stage\.d\.lundbeckus\.com$/.test(u.hostname)) {
      return `${u.pathname}${u.search}${u.hash}`;
    }
    u.username = '';
    u.password = '';
    return u.toString();
  } catch (e) {
    return raw;
  }
}

export default function parse(element, { document }) {
  // Row 2: banner background art.
  const bgImg = element.querySelector('.cmp-teaser__image img, img');
  let bgCell = '';
  if (bgImg) {
    const img = document.createElement('img');
    img.setAttribute('src', bgImg.getAttribute('src') || bgImg.src || '');
    img.setAttribute('alt', bgImg.getAttribute('alt') || '');
    bgCell = img;
  }

  // Row 3: content — icon + H1 (title) + CTA (call-to-action).
  const content = document.createElement('div');

  const iconImg = element.querySelector('.cmp-teaser__icon img');
  if (iconImg) {
    const icon = document.createElement('img');
    icon.setAttribute('src', iconImg.getAttribute('src') || iconImg.src || '');
    icon.setAttribute('alt', iconImg.getAttribute('alt') || '');
    content.appendChild(icon);
  }

  const h1 = element.querySelector('h1');
  if (h1) {
    const el = document.createElement('h1');
    el.textContent = h1.textContent.trim();
    content.appendChild(el);
  }

  const cta = element.querySelector('.cmp-teaser__action-link, a[href]');
  if (cta) {
    const p = document.createElement('p');
    const a = document.createElement('a');
    a.setAttribute('href', normalizeHref(cta.getAttribute('href') || cta.href || ''));
    a.textContent = (cta.textContent || '').trim();
    p.appendChild(a);
    content.appendChild(p);
  }

  const block = WebImporter.Blocks.createBlock(document, {
    name: 'hero-hcp-internal',
    cells: [
      [bgCell],
      [content],
    ],
  });
  element.replaceWith(block);
}
