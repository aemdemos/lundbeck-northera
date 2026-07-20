/* eslint-disable */
/* global WebImporter */

/**
 * Parser: cards-pharmacy
 * Base block: cards (variant "pharmacy")
 * Description: Specialty-pharmacy cards. Each card is a .lu-cmp-teaser with a
 * logo image plus a heading (pharmacy name) and phone/fax paragraphs. Rendered
 * as a vertical stack of logo-left / text-right rows.
 * Selector: .cmp-layout_prescribing_options__teaser .lu-cmp-teaser
 */
export default function parse(element, { document }) {
  // Scope to the pharmacy sub-column only. The prescribing-options container
  // holds TWO teaser groups: the NSC benefit column
  // (.cmp-layout_prescribing_options__teaser__right) and the pharmacy column
  // (.cmp-layout_prescribing_options__teaser WITHOUT __right). Resolving to the
  // broad .cmp-layout_prescribing_options would over-capture all 6 teasers, so
  // prefer the pharmacy sub-column; fall back to the broad container only when
  // the sub-column is absent (older single-column pages).
  const container = element.closest(
    '.cmp-layout_prescribing_options__teaser:not(.cmp-layout_prescribing_options__teaser__right)',
  )
    || element.closest('.cmp-layout_prescribing_options')
    || element.parentElement;

  // Guard against duplicate processing when the parser fires per-teaser: if the
  // block table was already inserted by an earlier call, drop this element.
  if (container.querySelector('table')) {
    element.replaceWith(document.createTextNode(''));
    return;
  }

  const teasers = container.querySelectorAll('.lu-cmp-teaser');
  const cells = [];

  teasers.forEach((teaser) => {
    const img = teaser.querySelector('img');
    const headingEl = teaser.querySelector('h2, h3');
    const paras = [...teaser.querySelectorAll('p')].filter((p) => p.textContent.trim());

    // Cell 1: the logo image (re-use the existing <img> for URL/alt fidelity).
    const imageCell = document.createElement('div');
    if (img) {
      imageCell.appendChild(img);
    }

    // Cell 2: pharmacy name + phone/fax lines.
    const bodyCell = document.createElement('div');
    if (headingEl) {
      const h2 = document.createElement('h2');
      h2.textContent = headingEl.textContent.trim();
      bodyCell.appendChild(h2);
    }
    paras.forEach((p) => {
      bodyCell.appendChild(p);
    });

    cells.push([imageCell, bodyCell]);
  });

  const block = WebImporter.Blocks.createBlock(document, {
    name: 'Cards (pharmacy)',
    cells,
  });
  element.replaceWith(block);
}
