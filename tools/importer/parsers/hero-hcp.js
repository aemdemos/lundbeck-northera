/* eslint-disable */
/* global WebImporter */

/**
 * Parser: hero-hcp
 * Base block: hero (variant styling in blocks/hero-hcp)
 * Description: HCP landing hero banner — heading ("Distinctive. Effective.
 * Focused."), subhead (H5, with superscript refs), and indication paragraph,
 * overlaid on a flamingo/sky background.
 *
 * Follows the Hero convention: 1 column, rows =
 *   row 1: block name
 *   row 2: background image (the source flamingo art)
 *   row 3: content (title + subheading + indication paragraph)
 * The block CSS also carries responsive background art (mobile/desktop) so the
 * banner renders correctly at every breakpoint.
 * Selector: .lu-cmp-teaser.aem-GridColumn--phone--hide (the desktop teaser)
 * Generated: 2026-07-17
 */
export default function parse(element, { document }) {
  // Row 2: the hero image. The inline <img> is shown only on mobile (a top
  // banner above the text card); desktop hides it and uses the CSS background.
  // The source swaps art by breakpoint, so use the MOBILE art for the inline
  // banner (desktop art is applied via CSS tokens).
  const bgImg = element.querySelector('img');
  let bgCell = '';
  if (bgImg) {
    const src = (bgImg.getAttribute('src') || bgImg.src || '')
      .replace(/northera-HCP-bg-desktop\.png/i, 'northera-HCP-bg-mobile.png');
    const img = document.createElement('img');
    img.setAttribute('src', src);
    img.setAttribute('alt', bgImg.getAttribute('alt') || '');
    bgCell = img;
  }

  // Row 3: content — title + subhead + indication paragraph.
  const content = document.createElement('div');

  const h1 = element.querySelector('h1');
  if (h1) {
    const el = document.createElement('h1');
    el.textContent = h1.textContent.trim();
    content.appendChild(el);
  }

  const h5 = element.querySelector('h5');
  if (h5) {
    const el = document.createElement('h5');
    el.innerHTML = h5.innerHTML; // preserve superscript reference markers (1,2)
    content.appendChild(el);
  }

  const indication = [...element.querySelectorAll('p')]
    .map((p) => p.textContent.trim())
    .filter((t) => t.length > 40)
    .sort((a, b) => b.length - a.length)[0];
  if (indication) {
    const p = document.createElement('p');
    p.textContent = indication;
    content.appendChild(p);
  }

  const block = WebImporter.Blocks.createBlock(document, {
    name: 'hero-hcp',
    cells: [
      [bgCell],
      [content],
    ],
  });
  element.replaceWith(block);
}
