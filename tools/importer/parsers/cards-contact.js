/* eslint-disable */
/* global WebImporter */

/**
 * Parser: cards-contact
 * Base block: cards (variant styling in blocks/cards — `.cards.contact`).
 *
 * Cards convention: table has 2 columns and multiple rows; the first row holds
 * only the block name (with the `(contact)` variant). Each subsequent row is a
 * single card — first cell = image/icon (mandatory), second cell = text content
 * (bold label + cyan link). Here the two contact teasers (Online / Phone, or
 * Call / Visit) each become a card row, rendered side-by-side by the
 * `.cards.contact` variant CSS.
 * Selector: .cmp-layout__two__imagetext (the desktop instance).
 * Generated: 2026-07-21
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
  const teasers = [...element.querySelectorAll('.cmp-teaser')];
  const rows = teasers.map((teaser) => {
    const imageCell = document.createElement('div');
    const bodyCell = document.createElement('div');

    const img = teaser.querySelector('.cmp-teaser__image img, img');
    if (img) {
      const el = document.createElement('img');
      el.setAttribute('src', img.getAttribute('src') || img.src || '');
      el.setAttribute('alt', img.getAttribute('alt') || '');
      imageCell.appendChild(el);
    }

    const desc = teaser.querySelector('.cmp-teaser__description');
    if (desc) {
      [...desc.children].forEach((child) => {
        if (child.textContent.trim() || child.querySelector('a, img')) {
          const clone = child.cloneNode(true);
          clone.querySelectorAll('a[href]').forEach((a) => {
            a.setAttribute('href', normalizeHref(a.getAttribute('href') || a.href || ''));
          });
          bodyCell.appendChild(clone);
        }
      });
    }
    // One card row: [image/icon cell, text cell].
    return [imageCell, bodyCell];
  }).filter((cells) => cells[0].children.length || cells[1].children.length);

  if (!rows.length) {
    element.replaceWith(...element.childNodes);
    return;
  }

  const block = WebImporter.Blocks.createBlock(document, {
    name: 'cards (contact)',
    cells: rows,
  });
  element.replaceWith(block);
}
