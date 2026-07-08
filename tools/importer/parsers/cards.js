/* eslint-disable */
/* global WebImporter */
/**
 * Parser for cards (variant: image-left).
 * Base block: cards
 * Source: https://northera-stage.d.lundbeckus.com/about-northera/taking-northera
 * Generated: 2026-07-08
 *
 * Structure (Cards): 2 columns, one row per card.
 *   Cell 1: icon image (from .cmp-teaser__image img).
 *   Cell 2: description content (from .cmp-teaser__description) — includes the
 *           "If you miss a dose:" line + nested <ul> for the calendar card.
 *
 * Notes:
 *  - Each card is a .lu-cmp-teaser (6 total). hr.cmp-separator dividers are skipped.
 *  - The section H2 heading (#text-470fe187bf) and trailing paragraph (#text-ad410d480e)
 *    are default content OUTSIDE the block and are NOT included.
 *  - Variant "image-left" is carried via the createBlock name.
 */
export default function parse(element, { document }) {
  const teasers = [...element.querySelectorAll('.lu-cmp-teaser')];
  const cells = [];

  teasers.forEach((teaser) => {
    // Cell 1: icon image.
    const img = teaser.querySelector('.cmp-teaser__image img, img');

    // Cell 2: description content, filtered to meaningful elements only.
    const desc = teaser.querySelector('.cmp-teaser__description');
    const contentCell = [];
    if (desc) {
      [...desc.children].forEach((child) => {
        const hasText = child.textContent.trim().length > 0;
        const hasMedia = child.querySelector && child.querySelector('li, img, a');
        if (hasText || hasMedia) {
          contentCell.push(child);
        }
      });
    }

    // Only emit rows that have real content; skip empty teasers / separators.
    if (img || contentCell.length) {
      cells.push([
        img || '',
        contentCell.length ? contentCell : '',
      ]);
    }
  });

  if (!cells.length) {
    element.replaceWith(...element.childNodes);
    return;
  }

  // Build with the base block name, then set the exact variant label.
  // createBlock title-cases hyphenated names ("image-left" -> "image Left"),
  // which would break the EDS variant class. The cards block CSS targets
  // `.cards.image-left`, so the block-name row must read exactly
  // "Cards (image-left)" (hyphen preserved) to yield the `image-left` class.
  const block = WebImporter.Blocks.createBlock(document, { name: 'cards', cells });
  const nameCell = block.querySelector('tr th, tr td');
  if (nameCell) {
    nameCell.textContent = 'Cards (image-left)';
  }
  element.replaceWith(block);
}
