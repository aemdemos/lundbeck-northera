/* eslint-disable */
/* global WebImporter */

/**
 * Parser: columns-teaser
 * Base block: columns (variant styling in blocks/columns — `.columns.teaser`).
 *
 * Columns convention — first row = block name; the second row holds one cell
 * per column. Here a dark-blue "awareness" band with two teasers (Increase /
 * Empower), each an icon + heading + description; each teaser becomes one
 * column cell of the single content row.
 * Selector: #patientbannertext.cmp-container
 * Generated: 2026-07-20
 */
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

    const title = teaser.querySelector('.cmp-teaser__title, h1, h2, h3, h4, h5, h6');
    if (title) {
      const h = document.createElement('h2');
      h.textContent = (title.textContent || '').trim();
      cell.appendChild(h);
    }

    const desc = teaser.querySelector('.cmp-teaser__description');
    if (desc) {
      [...desc.querySelectorAll('p')].forEach((p) => {
        const t = p.textContent.trim();
        if (t) {
          const el = document.createElement('p');
          el.textContent = t;
          cell.appendChild(el);
        }
      });
    }
    return cell;
  }).filter((c) => c.children.length);

  if (!cells.length) {
    element.replaceWith(...element.childNodes);
    return;
  }

  // One content row with one column cell per teaser.
  const block = WebImporter.Blocks.createBlock(document, {
    name: 'columns (teaser)',
    cells: [cells],
  });
  // Mark the band so the importer can split it into its own full-bleed section
  // (the source renders this awareness band as a standalone edge-to-edge band,
  // not inside the intro column). Consumed during import; not emitted to output.
  block.setAttribute('data-eds-section-break', 'band');
  element.replaceWith(block);
}
