/* eslint-disable */
/* global WebImporter */

/**
 * Parser: cards-symptoms
 * Base block: cards (variant styling in blocks/cards — `.cards.symptoms`).
 *
 * Cards convention — 2 columns; the first row is the block name, each
 * subsequent row is one card: cell 1 = image/icon, cell 2 = text (title).
 * Three "common symptoms" tiles (icon on top + centered white title) on the
 * brand-blue band. The source has desktop (phone--hide) + mobile (default--hide)
 * duplicate teasers; we parse the desktop set only (importer removes mobile).
 * Selector: .cmp-carousel_bghdarkblue
 * Generated: 2026-07-20
 */
export default function parse(element, { document }) {
  let teasers = [...element.querySelectorAll('.lu-cmp-teaser.aem-GridColumn--phone--hide .cmp-teaser, .cmp-teaser')];
  const seen = new Set();
  teasers = teasers.filter((t) => {
    const key = (t.querySelector('.cmp-teaser__title, h1, h2, h3, h4, h5, h6')?.textContent || '').trim();
    if (!key || seen.has(key)) return false;
    seen.add(key);
    return true;
  });

  const cells = teasers.map((teaser) => {
    const img = teaser.querySelector('.cmp-teaser__image img, img');
    let imgCell = '';
    if (img) {
      const el = document.createElement('img');
      el.setAttribute('src', img.getAttribute('src') || img.src || '');
      el.setAttribute('alt', img.getAttribute('alt') || '');
      imgCell = el;
    }
    const title = teaser.querySelector('.cmp-teaser__title, h1, h2, h3, h4, h5, h6');
    const titleCell = document.createElement('p');
    titleCell.textContent = title ? title.textContent.trim() : '';
    return [imgCell, titleCell];
  }).filter((c) => c[0] || c[1].textContent);

  if (!cells.length) {
    element.replaceWith(...element.childNodes);
    return;
  }

  const block = WebImporter.Blocks.createBlock(document, { name: 'cards', cells });
  const nameCell = block.querySelector('tr th, tr td');
  if (nameCell) nameCell.textContent = 'Cards (symptoms)';

  // Insert the block where the teaser grid lives and remove ONLY the teaser
  // wrappers — preserving the surrounding carousel container and its section
  // H2 ("Common symptoms of nOH") + intro paragraph. Keeping the container
  // intact lets the sections transformer match its selector and apply the
  // brand-blue `noh-symptoms` section style + break.
  const teaserWrappers = [...element.querySelectorAll('.lu-cmp-teaser')];
  const anchor = teaserWrappers[0];
  if (anchor && anchor.parentNode) {
    anchor.parentNode.insertBefore(block, anchor);
    teaserWrappers.forEach((w) => w.remove());
  } else {
    element.replaceWith(block);
  }
}
