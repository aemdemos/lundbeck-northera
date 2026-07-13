/* eslint-disable */
/* global WebImporter */
/**
 * Parser for accordion.
 * Base block: accordion
 * Source: https://northera-stage.d.lundbeckus.com/about-northera/taking-northera
 * Generated: 2026-07-08
 *
 * Structure: 2 columns, one row per accordion item.
 *   Cell 1: title text (the clickable label).
 *   Cell 2: panel body content.
 *
 * IMPORTANT: The source accordion panel also contains a nested ISI experience-fragment
 * (div.experiencefragment / .cmp-isi__use). That belongs to the separate isi block and is
 * deliberately excluded here — only the transcript text block (#text-3822de58db) is used.
 */
export default function parse(element, { document }) {
  const items = element.querySelectorAll('.cmp-accordion__item');
  const cells = [];

  items.forEach((item) => {
    // Title: the accordion header label.
    const titleEl = item.querySelector('.cmp-accordion__title, .cmp-accordion__header, .cmp-accordion__button');
    const titleText = titleEl ? titleEl.textContent.trim() : '';

    // Body: take ONLY the transcript text block, never the nested ISI experience-fragment.
    const panel = item.querySelector('.cmp-accordion__panel');
    const bodyCell = [];

    // Prefer the specific transcript text block; fall back to text blocks that are
    // NOT part of the nested ISI experience-fragment.
    let transcript = panel?.querySelector('#text-3822de58db');
    if (!transcript && panel) {
      const textBlocks = [...panel.querySelectorAll('.cmp-text')]
        .filter((tb) => !tb.closest('.experiencefragment, .cmp-isi__use, [class*="isi"]'));
      transcript = textBlocks[0] || null;
    }

    if (transcript) {
      const paragraphs = transcript.querySelectorAll('p');
      if (paragraphs.length) {
        paragraphs.forEach((p) => bodyCell.push(p));
      } else {
        bodyCell.push(transcript);
      }
    }

    // Only emit a row when we have a title (body may be empty but is expected here).
    if (titleText || bodyCell.length) {
      const titleCell = document.createElement('p');
      titleCell.textContent = titleText;
      cells.push([titleCell, bodyCell.length ? bodyCell : '']);
    }
  });

  if (!cells.length) {
    element.replaceWith(...element.childNodes);
    return;
  }

  const block = WebImporter.Blocks.createBlock(document, { name: 'accordion', cells });
  element.replaceWith(block);
}
