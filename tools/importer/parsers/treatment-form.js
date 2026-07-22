/* eslint-disable */
/* global WebImporter */

/**
 * Parser: treatment-form
 * Static visual replica of the HCP "NORTHERA Treatment Form" wizard. The live
 * 6-step form POSTs PHI to a backend, generates a PDF and shows session-timeout
 * modals — none of which is migrated. The 189-field wizard chrome is rendered
 * client-side by the block JS; this parser only extracts the portable authored
 * copy into a single row:
 *   Row 1: the two entry CTAs (proceedoptions) — H2 "There are 2 ways to
 *          proceed" + START/DOWNLOAD links with their helper paragraphs.
 *
 * The blue fax callout + "Please ensure the following" check-list are handled
 * separately by the columns-form parser (rendered in the intro section above).
 * Anchored on `.proceedoptions` (the CTAs). The banner (hero-hcp-internal) and
 * intro copy precede it; the hidden interactive form (cmp-treatmentform_2) is
 * removed after the block is built.
 * Selector: div.proceedoptions
 * Generated: 2026-07-21
 */

function normalizeHref(raw) {
  if (!raw) return '';
  try {
    const u = new URL(raw, 'https://northera-stage.d.lundbeckus.com');
    if (/(^|\.)northera-stage\.d\.lundbeckus\.com$/.test(u.hostname)) {
      return `${u.pathname}${u.search}${u.hash}`;
    }
    u.username = '';
    u.password = '';
    return u.toString();
  } catch (e) {
    return raw;
  }
}

export default function parse(element, { document }) {
  // Row 1: entry CTAs from the proceedoptions block.
  const proceed = element.querySelector('.get_started-blk') || element;
  const ctaCell = document.createElement('div');

  const h2 = proceed.querySelector('h2');
  if (h2) {
    const h = document.createElement('h2');
    h.textContent = h2.textContent.trim();
    ctaCell.appendChild(h);
  }
  [...proceed.querySelectorAll('.cmp-teaser__action-container')].forEach((c) => {
    const link = c.querySelector('a');
    if (link) {
      const p = document.createElement('p');
      const a = document.createElement('a');
      const href = link.getAttribute('href');
      // The START button has no href (JS-driven); anchor it to the wizard.
      a.setAttribute('href', href ? normalizeHref(href) : '#treatment-form');
      const label = c.querySelector('.cmp-button__text') || link;
      a.textContent = label.textContent.trim();
      p.appendChild(a);
      ctaCell.appendChild(p);
    }
    const right = c.querySelector('.right-blk');
    if (right) {
      [...right.querySelectorAll('p')].forEach((rp) => {
        if (!rp.textContent.trim() && !rp.querySelector('a')) return;
        const p = document.createElement('p');
        p.innerHTML = rp.innerHTML;
        p.querySelectorAll('a[href]').forEach((a) => {
          a.setAttribute('href', normalizeHref(a.getAttribute('href') || a.href || ''));
        });
        ctaCell.appendChild(p);
      });
    }
  });

  const block = WebImporter.Blocks.createBlock(document, {
    name: 'treatment-form',
    cells: [[ctaCell]],
  });

  // Insert where proceedoptions was, preceded by a section break so the
  // treatment-form block (CTAs + wizard) becomes its own EDS section, separate
  // from the intro + columns.form content above it. Then drop the hidden form.
  const hr = document.createElement('hr');
  element.replaceWith(hr, block);
  const formBlk = document.querySelector('.container-fluid.cmp-treatmentform_2');
  if (formBlk) formBlk.remove();
}
