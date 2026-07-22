/* eslint-disable */
/* global WebImporter */

/**
 * Parser: columns-stacked
 * Base block: columns (variant styling in blocks/columns — `.columns.stacked`).
 *
 * Rebuilds the source Medicare-vs-Commercial comparison <table> as a columns
 * block with one cell per comparison column, so the layout can stack on mobile
 * and sit side-by-side at >=768px.
 *
 * Columns convention: the block table's first row holds only the block name
 * (with the `(stacked)` variant); the second row has one cell per column. Here
 * the source table is row-major:
 *   row0 = headers (Medicare | Commercial health insurance)
 *   row1..n = paired items (uneven; Medicare has one extra item)
 * We TRANSPOSE it to one cell per column — each cell is an <h3> header followed
 * by one <p> per non-empty item. The stacked variant CSS renders the first
 * child of each cell as a gradient header bar and the <p> items as
 * grey-bordered rows.
 * Selector: the desktop table container
 *   .cmp-text__table.aem-GridColumn--phone--hide table
 * Generated: 2026-07-21
 */
export default function parse(element, { document }) {
  const table = element.matches('table') ? element : element.querySelector('table');
  if (!table) {
    element.replaceWith(...element.childNodes);
    return;
  }

  const trs = [...table.querySelectorAll('tr')];
  if (!trs.length) {
    element.replaceWith(...element.childNodes);
    return;
  }

  const colCount = trs.reduce((max, tr) => Math.max(max, tr.children.length), 0);

  // Build one cell per column (transpose).
  const cells = [];
  for (let c = 0; c < colCount; c += 1) {
    const cell = document.createElement('div');
    trs.forEach((tr, r) => {
      const src = tr.children[c];
      const text = src ? src.textContent.trim() : '';
      if (!text) return; // skip empty (e.g. the Commercial column's missing 4th row)
      if (r === 0) {
        const h = document.createElement('h3');
        h.textContent = text;
        cell.appendChild(h);
      } else {
        const p = document.createElement('p');
        // preserve any inline markup (links etc.) from the source cell
        if (src.children.length) {
          [...src.childNodes].forEach((n) => p.appendChild(n.cloneNode(true)));
        } else {
          p.textContent = text;
        }
        cell.appendChild(p);
      }
    });
    if (cell.children.length) cells.push(cell);
  }

  if (!cells.length) {
    element.replaceWith(...element.childNodes);
    return;
  }

  // Second row: one cell per comparison column.
  const block = WebImporter.Blocks.createBlock(document, {
    name: 'columns (stacked)',
    cells: [cells],
  });
  element.replaceWith(block);
}
