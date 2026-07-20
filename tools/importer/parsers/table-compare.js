/* eslint-disable */
/* global WebImporter */

/**
 * Parser: table-compare
 * Base block: table (variant styling in blocks/table — `.table.table-compare`).
 *
 * Table convention — first row = block name; each subsequent row = a data row.
 * The table block renders the first data row as header cells (<th>). Here we
 * read the source Medicare vs Commercial comparison <table> and re-emit its
 * rows so the EDS table block rebuilds it with the teal-blue gradient header.
 * Uneven source rows (the Medicare-only last row) are padded to the column
 * count so the grid stays aligned.
 * Selector: the desktop table container `.cmp-text__table.aem-GridColumn--phone--hide table`.
 * Generated: 2026-07-20
 */
export default function parse(element, { document }) {
  const table = element.matches('table') ? element : element.querySelector('table');
  if (!table) {
    element.replaceWith(...element.childNodes);
    return;
  }

  const trs = [...table.querySelectorAll('tr')];
  const colCount = trs.reduce((max, tr) => Math.max(max, tr.children.length), 0);

  const rows = trs.map((tr) => {
    const cells = [...tr.children].map((cell) => {
      const div = document.createElement('div');
      [...cell.childNodes].forEach((n) => div.appendChild(n.cloneNode(true)));
      if (!div.childNodes.length) div.textContent = cell.textContent.trim();
      return div;
    });
    while (cells.length < colCount) cells.push(document.createElement('div'));
    return cells;
  }).filter((cells) => cells.length);

  if (!rows.length) {
    element.replaceWith(...element.childNodes);
    return;
  }

  const block = WebImporter.Blocks.createBlock(document, {
    name: 'table (table-compare)',
    cells: rows,
  });
  element.replaceWith(block);
}
