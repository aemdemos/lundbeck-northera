/* eslint-disable */
/* global WebImporter */

/**
 * Parser: columns-contact
 * Base block: columns (variant styling in blocks/columns — `.columns.contact`).
 *
 * Columns convention — first row = block name; the second row holds one cell
 * per column. Here two contact teasers (Online / Phone), each an icon image
 * above a bold label + a link, become the two column cells of one row.
 * Selector: .cmp-layout__two__imagetext (the desktop instance).
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
  const teasers = [...element.querySelectorAll('.cmp-teaser')];
  const cells = teasers.map((teaser) => {
    const cell = document.createElement('div');

    const img = teaser.querySelector('.cmp-teaser__image img, img');
    if (img) {
      const el = document.createElement('img');
      el.setAttribute('src', img.getAttribute('src') || img.src || '');
      el.setAttribute('alt', img.getAttribute('alt') || '');
      cell.appendChild(el);
    }

    const desc = teaser.querySelector('.cmp-teaser__description');
    if (desc) {
      [...desc.children].forEach((child) => {
        if (child.textContent.trim() || child.querySelector('a, img')) {
          const clone = child.cloneNode(true);
          clone.querySelectorAll('a[href]').forEach((a) => {
            a.setAttribute('href', normalizeHref(a.getAttribute('href') || a.href || ''));
          });
          cell.appendChild(clone);
        }
      });
    }
    return cell;
  }).filter((c) => c.children.length);

  if (!cells.length) {
    element.replaceWith(...element.childNodes);
    return;
  }

  // One content row with two column cells (Online | Phone).
  const block = WebImporter.Blocks.createBlock(document, {
    name: 'columns (contact)',
    cells: [cells],
  });
  element.replaceWith(block);
}
