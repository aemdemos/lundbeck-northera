/* eslint-disable */
/* global WebImporter */

/**
 * Parser for columns
 * Base block: columns
 * Source: https://northera-stage.d.lundbeckus.com/patient-support
 * Selector: .patient-support-droxidopa
 *
 * Two-column intro row. Per the EDS "columns" convention the block table is:
 *   Row 1: block name ("Columns")            ← added by createBlock
 *   Row 2: two cells → [ icon image | rich text ]
 * Column 1 = the "NORTHERA Stands By You" icon; column 2 = the intro
 * paragraph + 5-item list + support-center link + hours + disclaimer.
 */
export default function parse(element, { document }) {
  // Column 1: the icon image
  const image = element.querySelector('.cmp-image img, img.cmp-image__image, img');

  // Column 2: the full rich-text block (keep all paragraphs + the list, in order)
  const textContainer = element.querySelector('.cmp-text') || element.querySelector('.text');
  const textCell = [];
  if (textContainer) {
    [...textContainer.children].forEach((child) => {
      if (child.textContent.trim() || child.querySelector('img, a')) {
        textCell.push(child);
      }
    });
  }

  // Fallback: gather any p/ul in the row that aren't inside the image cell.
  if (!textCell.length) {
    [...element.querySelectorAll('p, ul')].forEach((el) => {
      if (!el.closest('.cmp-image') && (el.textContent.trim() || el.querySelector('a'))) {
        textCell.push(el);
      }
    });
  }

  if (!image && !textCell.length) {
    element.replaceWith(...element.childNodes);
    return;
  }

  // One content row, two columns: [image | text].
  // The "icon-text" variant styles this to match the source NSC intro row:
  // fixed ~120px icon column, brand-blue 18px lead paragraph, 14px list/body.
  const cells = [
    [image || '', textCell.length ? textCell : ''],
  ];

  const block = WebImporter.Blocks.createBlock(document, { name: 'columns (icon-text)', cells });
  element.replaceWith(block);
}
