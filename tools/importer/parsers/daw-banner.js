/* eslint-disable */
/* global WebImporter */

/**
 * Parser: daw-banner
 * Base block: columns-banner (variant "daw")
 * Description: The "Write Dispense as written (DAW)" callout on the HCP landing
 * page — a blue banner with the Rx prescription icon on the left and a white
 * heading + paragraph on the right.
 * Selector: .write-daw
 * Generated: 2026-07-17
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

  const block = WebImporter.Blocks.createBlock(document, { name: 'columns-banner (daw)', cells });
  element.replaceWith(block);
}
