/* eslint-disable */
/* global WebImporter */

/**
 * Parser: columns-supine
 * Base block: columns (variant styling in blocks/columns — `.columns.supine`).
 *
 * Columns convention — first row = block name; the second row holds one cell
 * per column. Here two "reduce the risk" items (icon + caption), each an
 * `.cmp-layout__imagetext` teaser, become the two column cells of one row.
 * Selector: .cmp-layout__reduce-the-risk .reduce-hyp-risk (the imagetext group)
 * Generated: 2026-07-20
 */
export default function parse(element, { document }) {
  // Each item is an `.image` + `.text` pair inside a nested grid. Pair them up
  // by walking the images and taking the caption from the sibling `.text`.
  // The source nests a mobile duplicate of the first item, so dedupe by alt.
  const seenAlts = new Set();
  const images = [...element.querySelectorAll('.image')].filter((im) => {
    const pic = im.querySelector('img');
    if (!pic) return false;
    const alt = (pic.getAttribute('alt') || '').trim();
    if (alt && seenAlts.has(alt)) return false;
    if (alt) seenAlts.add(alt);
    return true;
  });
  const cells = images.map((imageWrap) => {
    const cell = document.createElement('div');

    const img = imageWrap.querySelector('img');
    if (img) {
      const el = document.createElement('img');
      el.setAttribute('src', img.getAttribute('src') || img.src || '');
      el.setAttribute('alt', img.getAttribute('alt') || '');
      cell.appendChild(el);
    }

    // caption: the sibling .text within the same grid
    const grid = imageWrap.parentElement;
    const textWrap = grid && grid.querySelector('.text');
    if (textWrap) {
      [...textWrap.querySelectorAll('p')].forEach((p) => {
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

  // One content row with one column cell per reduce-the-risk item.
  const block = WebImporter.Blocks.createBlock(document, {
    name: 'columns (supine)',
    cells: [cells],
  });
  element.replaceWith(block);
}
