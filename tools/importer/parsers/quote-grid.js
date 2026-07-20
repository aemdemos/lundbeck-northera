/* eslint-disable */
/* global WebImporter */

/**
 * Parser: quote-grid
 * Base block: quote-grid
 * Description: A row of physician/patient quote cards on the HCP landing page.
 * Each source card (.cmp-teaser inside .cmp-layout__searchresult) has a
 * quotation (H2) and an attribution paragraph. A trailing footnote paragraph
 * ("*Patient experiences vary…") is appended as a single-cell row.
 * Block table: 2 columns per card row [quotation | attribution], plus an
 * optional final 1-cell row for the footnote.
 * Selector: .cmp-layout__searchresult
 * Generated: 2026-07-17
 */
export default function parse(element, { document }) {
  const cards = [...element.querySelectorAll('.cmp-teaser')]
    .filter((t) => t.querySelector('.cmp-teaser__title, h2'));
  const cells = [];

  cards.forEach((card) => {
    const quotationEl = card.querySelector('.cmp-teaser__title, h2');
    const attributionEl = card.querySelector('.cmp-teaser__description p, p');
    const quotation = quotationEl ? quotationEl.textContent.trim() : '';
    const attribution = attributionEl ? attributionEl.textContent.trim() : '';
    if (!quotation) return;

    const qCell = document.createElement('div');
    qCell.textContent = quotation;
    const aCell = document.createElement('div');
    aCell.textContent = attribution;
    cells.push([qCell, aCell]);
  });

  if (!cells.length) {
    element.replaceWith(document.createTextNode(''));
    return;
  }

  // Footnote: the "*Patient experiences vary…" paragraph, if present.
  const footnoteEl = [...element.querySelectorAll('p')]
    .find((p) => /^\*/.test(p.textContent.trim()));
  if (footnoteEl) {
    const fnCell = document.createElement('div');
    fnCell.textContent = footnoteEl.textContent.trim();
    cells.push([fnCell]);
  }

  const block = WebImporter.Blocks.createBlock(document, { name: 'quote-grid', cells });
  element.replaceWith(block);
}
