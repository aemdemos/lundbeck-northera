/* eslint-disable */
/* global WebImporter */

/**
 * Parser: columns-form
 * Base block: columns (variant styling in blocks/columns — `.columns.form`).
 *
 * The NSC "how to submit" callout on the Treatment Form page: a blue
 * fax-instruction box (two H5 lines, the fax number highlighted) followed by a
 * cyan-checkmark bullet list. Emitted as a single-column columns block so it
 * renders as one section-level block above the interactive treatment-form.
 *
 * Columns convention: the block table's first row holds only the block name
 * (with the `form` variant). Each subsequent row is a single-column cell:
 *   Row 1: the blue fax callout — the two H5 lines (fax number wrapped in
 *          <strong> so CSS can highlight it).
 *   Rows 2..n: one check-list item per row (one bullet each).
 * Anchored on `.cmp-specialty__pharmacy` (the blue callout); the sibling
 * `.cmp-treatment__list` bullets are pulled in and then removed from the source.
 * Selector: div.cmp-specialty__pharmacy
 * Generated: 2026-07-21
 */
export default function parse(element, { document }) {
  const rows = [];

  // Row 1: callout H5 lines. Wrap the fax phone number in <strong> so the
  // variant CSS renders it yellow.
  const calloutCell = document.createElement('div');
  [...element.querySelectorAll('h5')].forEach((h5) => {
    const el = document.createElement('h5');
    el.innerHTML = h5.innerHTML;
    el.querySelectorAll('.cmp-pharma__phone').forEach((span) => {
      const strong = document.createElement('strong');
      strong.textContent = span.textContent.trim();
      span.replaceWith(strong);
    });
    calloutCell.appendChild(el);
  });
  rows.push([calloutCell]);

  // Rows 2..n: one check-list item per row (sibling of the callout).
  const container = element.closest('.cmp-treatment__textcontainer') || document;
  const list = container.querySelector('.cmp-treatment__list ul, .cmp-treatment__list');
  if (list) {
    [...list.querySelectorAll('li')].forEach((li) => {
      const cell = document.createElement('div');
      const p = document.createElement('p');
      p.textContent = li.textContent.trim();
      cell.appendChild(p);
      rows.push([cell]);
    });
  }

  const block = WebImporter.Blocks.createBlock(document, {
    name: 'columns (form)',
    cells: rows,
  });

  // Insert where the callout was, then drop the consumed list.
  element.replaceWith(block);
  if (list) {
    const listWrap = list.closest('.cmp-treatment__list') || list;
    listWrap.remove();
  }
}
