/* eslint-disable */
/* global WebImporter */
/**
 * Parser for quote.
 * Base block: quote
 * Source: https://northera-stage.d.lundbeckus.com/about-northera/taking-northera
 * Generated: 2026-07-08
 *
 * Project quote block contract (blocks/quote/quote.js): 1 column, 2 rows.
 *   Row 1: quotation (first <p>).
 *   Row 2: attribution (second <p>).
 * The block decorator reads the firstElementChild of each row, so each row's single
 * cell holds one paragraph element.
 */
export default function parse(element, { document }) {
  // Source is a cmp-text block (#text-f96ce80046) containing two paragraphs.
  const paragraphs = [...element.querySelectorAll(':scope > p, p')];

  const quotation = paragraphs[0] || null;
  const attribution = paragraphs[1] || null;

  if (!quotation) {
    element.replaceWith(...element.childNodes);
    return;
  }

  // The quote block CSS supplies decorative marks (curly quotes on the quotation,
  // an em dash before the attribution), so strip them from the source text to
  // avoid doubling them at render time.
  quotation.textContent = quotation.textContent.trim().replace(/^[“"]+/, '').replace(/[”"]+$/, '');
  if (attribution) {
    attribution.textContent = attribution.textContent.trim().replace(/^[—–-]+\s*/, '');
  }

  const cells = [];
  cells.push([quotation]); // Row 1: quotation (1 cell)
  if (attribution) {
    cells.push([attribution]); // Row 2: attribution (1 cell)
  }

  const block = WebImporter.Blocks.createBlock(document, { name: 'quote', cells });
  element.replaceWith(block);
}
