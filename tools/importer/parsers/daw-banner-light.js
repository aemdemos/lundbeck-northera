/* eslint-disable */
/* global WebImporter */

/**
 * Parser: daw-banner-light
 * Base block: columns-banner (variant "daw-light")
 * Description: The "Why 'Dispense as written' matters" callout on the
 * prescribing-northera page — a light-blue tinted banner with the DAW
 * illustration on the left and a dark-blue H2 heading + paragraph on the right.
 * Distinct from the HCP-landing "daw" variant (solid blue + white text).
 *
 * Columns convention — first row = block name; the second row holds one cell
 * per column. Here one row, two columns: [ image | heading + paragraph ].
 * Selector: .responsivegrid.ask-for-northera
 * Generated: 2026-07-20
 */
export default function parse(element, { document }) {
  const image = element.querySelector('.cmp-image img, img.cmp-image__image, img');
  const textContainer = element.querySelector('.cmp-text, .text .cmp-text');
  const heading = textContainer
    ? textContainer.querySelector('h4, h3, h2')
    : element.querySelector('h4, h3, h2');
  const paragraph = textContainer
    ? textContainer.querySelector('p')
    : element.querySelector('p');

  const contentCell = [];
  if (heading) contentCell.push(heading);
  if (paragraph) contentCell.push(paragraph);

  const cells = [
    [image || '', contentCell.length ? contentCell : ''],
  ];

  const block = WebImporter.Blocks.createBlock(document, { name: 'columns-banner (daw-light)', cells });
  element.replaceWith(block);
}
