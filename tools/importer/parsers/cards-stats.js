/* eslint-disable */
/* global WebImporter */

/**
 * Parser: cards-stats
 * Base block: cards (variant styling in blocks/cards — `.cards.stats`).
 *
 * Cards convention — 2 columns; row 1 = block name, each subsequent row is one
 * card: cell 1 = image/icon, cell 2 = text. Three stat tiles (infographic image
 * + bold caption, e.g. "About 1 in 5 people with PD…") separated by vertical
 * dividers on desktop, stacked on mobile.
 * Selector: .symptomatic-noh-condition
 * Generated: 2026-07-20
 */
export default function parse(element, { document }) {
  const teasers = [...element.querySelectorAll('.cmp-teaser')];
  const cells = teasers.map((teaser) => {
    const img = teaser.querySelector('.cmp-teaser__image img, img');
    let imgCell = '';
    if (img) {
      const el = document.createElement('img');
      el.setAttribute('src', img.getAttribute('src') || img.src || '');
      el.setAttribute('alt', img.getAttribute('alt') || '');
      imgCell = el;
    }
    const desc = teaser.querySelector('.cmp-teaser__description');
    const textCell = document.createElement('div');
    if (desc) {
      [...desc.children].forEach((child) => {
        if (child.textContent.trim() || child.querySelector('img, a')) {
          textCell.appendChild(child.cloneNode(true));
        }
      });
      if (!textCell.children.length) {
        const p = document.createElement('p');
        p.textContent = desc.textContent.trim();
        textCell.appendChild(p);
      }
    }
    return [imgCell, textCell];
  }).filter((c) => c[0] || c[1].children.length);

  if (!cells.length) {
    element.replaceWith(...element.childNodes);
    return;
  }

  const block = WebImporter.Blocks.createBlock(document, { name: 'cards', cells });
  const nameCell = block.querySelector('tr th, tr td');
  if (nameCell) nameCell.textContent = 'Cards (stats)';
  element.replaceWith(block);
}
