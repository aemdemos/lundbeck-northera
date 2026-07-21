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
 *
 * Source layout: the patient photo shows below the quote on mobile (Bob_m.png)
 * and becomes the banner background with the quote overlaid on the left at
 * ≥768px. We emit the photo as an inline image; the block CSS renders it below
 * the text on mobile and as the overlaid background on desktop.
 * Selector: #patient-banner.cmp-container
 * Generated: 2026-07-20
 */
export default function parse(element, { document }) {
  // Patient photos. The source delivers TWO crops: the mobile portrait
  // (Bob_m.png, present inline) shown below the quote on small screens, and a
  // wide desktop crop (Bob.png, applied as a CSS background in the source) used
  // as the banner behind the quote at >= 768px. We emit both as authored
  // images (deriving the desktop filename from the mobile one) so they are
  // author-managed and auto-optimized; the block CSS shows the right one per
  // breakpoint. The mobile image carries a `mobile` class hook, desktop
  // `desktop`, via alt text the block JS reads.
  const img = element.querySelector('img');
  let mobileCell = '';
  let desktopCell = '';
  if (img) {
    const mobileSrc = img.getAttribute('src') || img.src || '';
    const desktopSrc = mobileSrc.replace(/Bob_m\.png/i, 'Bob.png');

    const m = document.createElement('img');
    m.setAttribute('src', mobileSrc);
    m.setAttribute('alt', 'Bob (mobile)');
    mobileCell = m;

    if (desktopSrc !== mobileSrc) {
      const dImg = document.createElement('img');
      dImg.setAttribute('src', desktopSrc);
      dImg.setAttribute('alt', 'Bob (desktop)');
      desktopCell = dImg;
    }
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
  if (mobileCell) cells.push([mobileCell]);
  if (desktopCell) cells.push([desktopCell]);
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
