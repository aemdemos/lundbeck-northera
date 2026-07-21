/* eslint-disable */
/* global WebImporter */

/**
 * Parser: cards-benefit
 * Base block: cards (variant "benefit")
 * Description: Centered icon-top feature/benefit cards. Each card is a
 * .lu-cmp-teaser with an icon image, an H2 title and a short description
 * paragraph (Insurance coverage information / The StarterRx Program* / Ongoing
 * support). Rendered center-aligned, icon on top, 1-up on mobile.
 *
 * Cards convention: 2 columns (image | text), one row per card.
 *   Cell 1: icon image (from .cmp-teaser__image img).
 *   Cell 2: H2 title + description paragraph(s).
 * Selector: .cmp-layout_prescribing_options__teaser__right .lu-cmp-teaser
 */
export default function parse(element, { document }) {
  // Scope to the NSC benefit sub-column so the pharmacy teasers are excluded.
  const container = element.closest('.cmp-layout_prescribing_options__teaser__right')
    || element.parentElement;

  // Guard against duplicate processing when the parser fires per-teaser: if the
  // block table was already inserted by an earlier call, drop this element.
  if (container.querySelector('table')) {
    element.replaceWith(document.createTextNode(''));
    return;
  }

  const teasers = container.querySelectorAll('.lu-cmp-teaser');
  const cells = [];

  teasers.forEach((teaser) => {
    const img = teaser.querySelector('.cmp-teaser__image img, img');
    const headingEl = teaser.querySelector('.cmp-teaser__title, h2, h3');
    const desc = teaser.querySelector('.cmp-teaser__description');

    // Cell 1: the icon image (re-use the existing <img> for URL/alt fidelity).
    const imageCell = document.createElement('div');
    if (img) {
      const el = document.createElement('img');
      el.setAttribute('src', img.getAttribute('src') || img.src || '');
      el.setAttribute('alt', img.getAttribute('alt') || '');
      imageCell.appendChild(el);
    }

    // Cell 2: heading + description paragraph(s).
    const bodyCell = document.createElement('div');
    if (headingEl) {
      const h2 = document.createElement('h2');
      h2.textContent = headingEl.textContent.trim();
      bodyCell.appendChild(h2);
    }
    if (desc) {
      [...desc.children].forEach((child) => {
        if (child.textContent.trim() || child.querySelector('a, img')) {
          bodyCell.appendChild(child.cloneNode(true));
        }
      });
    }

    if (imageCell.children.length || bodyCell.children.length) {
      cells.push([imageCell, bodyCell]);
    }
  });

  const block = WebImporter.Blocks.createBlock(document, { name: 'cards', cells });
  const nameCell = block.querySelector('tr th, tr td');
  if (nameCell) {
    nameCell.textContent = 'Cards (benefit)';
  }
  element.replaceWith(block);
}
