/* eslint-disable */
/* global WebImporter */

/**
 * Parser for columns-banner
 * Base block: columns
 * Source: https://www.northera.com/
 * Selector: .responsivegrid.ask-for-northera
 * Generated: 2026-06-03
 *
 * Two-column layout: image/icon in column 1, heading + paragraph in column 2.
 */
export default function parse(element, { document }) {
  // Extract the image from the image column
  const image = element.querySelector('.cmp-image img, img.cmp-image__image');

  // Extract the text content (heading and paragraph) from the text column
  const textContainer = element.querySelector('.cmp-text, .text .cmp-text');
  const heading = textContainer ? textContainer.querySelector('h4, h3, h2') : element.querySelector('h4, h3, h2');
  const paragraph = textContainer ? textContainer.querySelector('p') : element.querySelector('p');

  // Build cells: one row with two columns [image | text content]
  const contentCell = [];
  if (heading) contentCell.push(heading);
  if (paragraph) contentCell.push(paragraph);

  const cells = [
    [image || '', contentCell.length > 0 ? contentCell : ''],
  ];

  const block = WebImporter.Blocks.createBlock(document, { name: 'columns-banner', cells });
  element.replaceWith(block);
}
