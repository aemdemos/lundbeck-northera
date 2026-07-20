/* eslint-disable */
/* global WebImporter */

/**
 * Parser: columns-oh-types
 * Base block: columns (variant styling in blocks/columns-oh-types).
 *
 * Columns convention — first row = block name; the second row holds one cell
 * per column. Here: three "blue card" columns listing types of orthostatic
 * hypotension (Neurogenic / Iatrogenic / Non-neurogenic). Each source column is
 * a `.cmp-text` with an H5 heading (+ superscript refs) then a list of cause
 * paragraphs; each becomes one column cell.
 * Selector: .responsivegrid.cmp-layout_blue-table
 * Generated: 2026-07-20
 */
export default function parse(element, { document }) {
  const columns = [...element.querySelectorAll('.cmp-text')];
  const cells = columns.map((col) => {
    const cell = document.createElement('div');
    [...col.children].forEach((child) => {
      if (child.textContent.trim() || child.querySelector('img, a')) {
        cell.appendChild(child.cloneNode(true));
      }
    });
    return cell;
  }).filter((c) => c.children.length);

  if (!cells.length) {
    element.replaceWith(...element.childNodes);
    return;
  }

  // One content row with N column cells (one per OH type).
  const block = WebImporter.Blocks.createBlock(document, {
    name: 'columns-oh-types',
    cells: [cells],
  });
  element.replaceWith(block);
}
