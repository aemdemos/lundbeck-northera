/* eslint-disable */
/* global WebImporter */

/**
 * Parser for hero-patient
 * Base block: hero
 * Source: https://www.northera.com/
 * Selector: .random-hero.cmp-hero-banner__desktop
 * Description: Patient photography hero with full-width background image and CTA button.
 *   Extracts the first randomized teaser image and CTA link.
 * Generated: 2026-06-03
 */
export default function parse(element, { document }) {
  // Extract the first teaser instance (source has multiple randomized teasers)
  const firstTeaser = element.querySelector('.cmp-teaser');

  // Extract image from first teaser
  const image = firstTeaser
    ? firstTeaser.querySelector('.cmp-teaser__image .cmp-image__image')
    : element.querySelector('img.cmp-image__image, img');

  // Extract CTA link from first teaser
  const ctaLink = firstTeaser
    ? firstTeaser.querySelector('.cmp-teaser__action-link')
    : element.querySelector('a.cmp-teaser__action-link, a');

  // Build cells: single row, single cell with image + CTA link together
  // Hero block structure: one content row with background image and call-to-action in same cell
  const cells = [];
  const contentCell = [];

  if (image) {
    contentCell.push(image);
  }

  if (ctaLink) {
    // Wrap CTA in a paragraph for proper block rendering
    const p = document.createElement('p');
    p.appendChild(ctaLink);
    contentCell.push(p);
  }

  if (contentCell.length > 0) {
    cells.push([contentCell]);
  }

  const block = WebImporter.Blocks.createBlock(document, { name: 'hero-patient', cells });
  element.replaceWith(block);
}
