/* eslint-disable */
/* global WebImporter */

/**
 * Parser: quote-patient
 * Base block: quote (variant styling in blocks/quote — `.quote.patient`).
 *
 * Quote convention — 1 column. The patient variant carries three rows:
 *   row 1: patient photo (image only)
 *   row 2: quotation (first paragraph)
 *   row 3: attribution (the —NAME line)
 * blocks/quote/quote.js detects the image-only row and renders it above the
 * quotation; the plain 2-row quote remains supported.
 * Selector: #patient-banner.cmp-container
 * Generated: 2026-07-20
 */
export default function parse(element, { document }) {
  // Photo: the source shows the patient photo as background art (the only inline
  // <img> here is a decorative, empty-alt sprite hidden on desktop), so include
  // an inline image ONLY when it carries a real (non-empty) alt — otherwise emit
  // a text-only quote (matching the desktop source).
  const img = [...element.querySelectorAll('img')].find((im) => (im.getAttribute('alt') || '').trim());
  let photoCell = '';
  if (img) {
    const el = document.createElement('img');
    el.setAttribute('src', img.getAttribute('src') || img.src || '');
    el.setAttribute('alt', img.getAttribute('alt') || '');
    photoCell = el;
  }

  // Quotation + attribution. The attribution is the —NAME line; the quotation
  // is the long quote paragraph. Dedupe (the source repeats the quote text).
  const paragraphs = [...element.querySelectorAll('p')]
    .map((p) => p.textContent.trim())
    .filter((t) => t.length);

  const attributionText = paragraphs.find((t) => /^[—–-]/.test(t))
    || [...element.querySelectorAll('h2, h3')].map((h) => h.textContent.trim()).find((t) => /^[—–-]/.test(t));
  const quotationText = paragraphs.find((t) => /[“"]/.test(t) && t.length > 60)
    || paragraphs.sort((a, b) => b.length - a.length)[0];

  if (!quotationText) {
    element.replaceWith(...element.childNodes);
    return;
  }

  const quotation = document.createElement('p');
  // strip surrounding curly/straight quotes — the block CSS adds them back
  quotation.textContent = quotationText.replace(/^[“"]+/, '').replace(/[”"]+$/, '');

  const cells = [];
  if (photoCell) cells.push([photoCell]);
  cells.push([quotation]);
  if (attributionText) {
    const attribution = document.createElement('p');
    attribution.textContent = attributionText.replace(/^[—–-]+\s*/, '');
    cells.push([attribution]);
  }

  const block = WebImporter.Blocks.createBlock(document, {
    name: 'quote (patient)',
    cells,
  });
  element.replaceWith(block);
}
