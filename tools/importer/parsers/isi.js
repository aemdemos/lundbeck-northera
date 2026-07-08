/* eslint-disable */
/* global WebImporter */
/**
 * Parser for isi (Important Safety Information).
 * Base block: isi
 * Source: https://northera-stage.d.lundbeckus.com/about-northera/taking-northera
 * Generated: 2026-07-08
 *
 * Project isi block contract (blocks/isi/isi.js): 1 column, 2 rows.
 *   Row 1: abbreviated content for the persistent fixed bottom bar.
 *   Row 2: full inline ISI content shown in-page.
 *
 * Sources:
 *   - Full inline content (row 2) comes from the matched element (the ISI
 *     experience-fragment): `.cmp-isi__use` (Use heading + indication + 5-item
 *     list + effectiveness paragraph) followed by `.cmp-isi__importantsafety`
 *     (IMPORTANT SAFETY INFORMATION heading, boxed WARNING: SUPINE HYPERTENSION,
 *     the full safety bulleted list, and the Prescribing Information / FDA
 *     MedWatch links).
 *   - Abbreviated bar content (row 1) lives in a separate fragment
 *     (`.isi-mobile-wrap`) outside the experience-fragment, so it is sourced via
 *     the document. Falls back to the known abbreviated copy if not found.
 */
export default function parse(element, { document }) {
  // ── Row 1: abbreviated fixed-bar content ───────────────────────────────
  const abbreviatedCell = [];
  const barWrap = document.querySelector('.isi-mobile-wrap');
  const barFragment = barWrap
    ? (barWrap.querySelector('.cq-dd-fragment') || barWrap)
    : null;

  if (barFragment) {
    const barParagraphs = [...barFragment.querySelectorAll('p')].filter((p) => p.textContent.trim());
    barParagraphs.forEach((p) => {
      const clone = p.cloneNode(true);
      // The "Important Safety Information" toggle is a JS anchor with no href
      // (bar expand/collapse is handled by the EDS isi block). Flatten it to text.
      clone.querySelectorAll('a:not([href]), .openisi a').forEach((a) => {
        a.replaceWith(document.createTextNode(a.textContent));
      });
      abbreviatedCell.push(clone);
    });
  }

  // Fallback: construct the known abbreviated bar copy if the fragment is absent.
  if (!abbreviatedCell.length) {
    const p1 = document.createElement('p');
    p1.textContent = 'Please see Important Safety Information, including Boxed Warning for supine hypertension.';
    const p2 = document.createElement('p');
    p2.append(document.createTextNode('For more information, see the full '));
    const piLink = document.createElement('a');
    piLink.href = 'https://www.lundbeck.com/upload/us/files/pdf/Products/Northera_PI_US_EN.pdf';
    piLink.textContent = 'Prescribing Information';
    p2.append(piLink);
    p2.append(document.createTextNode('.'));
    abbreviatedCell.push(p1, p2);
  }

  // ── Row 2: full inline ISI content ─────────────────────────────────────
  const fullCell = [];

  // "Use" section: heading + indication + 5-item list + effectiveness paragraph.
  const useSection = element.querySelector('.cmp-isi__use');
  if (useSection) fullCell.push(useSection);

  // IMPORTANT SAFETY INFORMATION heading, boxed WARNING, full safety list,
  // and Prescribing Information / FDA MedWatch links.
  const safetySection = element.querySelector('.cmp-isi__importantsafety, [class*="cmp-isi__importantsafety"]');
  if (safetySection) fullCell.push(safetySection);

  // Fallback: if the specific sections are not found, use the element's own
  // meaningful children so no content is lost.
  if (!fullCell.length) {
    [...element.children].forEach((child) => {
      if (child.textContent.trim()) fullCell.push(child);
    });
  }

  if (!abbreviatedCell.length && !fullCell.length) {
    element.replaceWith(...element.childNodes);
    return;
  }

  const cells = [];
  cells.push([abbreviatedCell]); // Row 1: abbreviated bar (1 cell)
  cells.push([fullCell]);        // Row 2: full inline content (1 cell)

  const block = WebImporter.Blocks.createBlock(document, { name: 'isi', cells });
  element.replaceWith(block);
}
