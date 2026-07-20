/* eslint-disable */
/* global WebImporter */

/**
 * Parser: treatment-form
 * Static visual replica of the HCP "NORTHERA Treatment Form" wizard. The live
 * 6-step form POSTs PHI to a backend, generates a PDF and shows session-timeout
 * modals — none of which is migrated. The 189-field wizard chrome is rendered
 * client-side by the block JS; this parser only extracts the portable authored
 * copy into a predictable 3-row table:
 *   Row 1: the blue fax callout (cmp-specialty__pharmacy).
 *   Row 2: the "Please ensure the following" check-list (cmp-treatment__list).
 *   Row 3: the two entry CTAs (proceedoptions) — H2 + START/DOWNLOAD links with
 *          helper paragraphs.
 *
 * Anchored on `.cmp-specialty__pharmacy` (the callout). The banner
 * (hero-hcp-internal) and the intro H2 + paragraphs that precede the callout
 * are left in place as their own section content. The consumed list, the hidden
 * interactive form (cmp-treatmentform_2) and the proceedoptions block are
 * removed after the block is built.
 * Selector: div.cmp-specialty__pharmacy
 * Generated: 2026-07-20
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
  const cells = [];

  // Row 1: blue fax callout. Wrap the fax phone number so block CSS can render
  // it yellow.
  const calloutCell = document.createElement('div');
  calloutCell.innerHTML = element.innerHTML;
  calloutCell.querySelectorAll('.cmp-pharma__phone').forEach((span) => {
    const s = document.createElement('span');
    s.className = 'treatment-form-phone';
    s.textContent = span.textContent.trim();
    span.replaceWith(s);
  });
  cells.push([calloutCell]);

  // Row 2: "Please ensure the following" check-list (sibling of the callout).
  const container = element.closest('.cmp-treatment__textcontainer') || document;
  const list = container.querySelector('.cmp-treatment__list ul, .cmp-treatment__list');
  const listCell = document.createElement('div');
  if (list) {
    const ul = document.createElement('ul');
    [...list.querySelectorAll('li')].forEach((li) => {
      const item = document.createElement('li');
      item.textContent = li.textContent.trim();
      ul.appendChild(item);
    });
    listCell.appendChild(ul);
  }
  cells.push([listCell]);

  // Row 3: entry CTAs from the proceedoptions block elsewhere on the page.
  const proceed = document.querySelector('.proceedoptions .get_started-blk')
    || document.querySelector('.proceedoptions');
  const ctaCell = document.createElement('div');
  if (proceed) {
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
  }
  cells.push([ctaCell]);

  const block = WebImporter.Blocks.createBlock(document, {
    name: 'treatment-form',
    cells,
  });

  // Insert the block where the callout was, then drop consumed source nodes.
  element.replaceWith(block);
  if (list) {
    const listWrap = list.closest('.cmp-treatment__list') || list;
    listWrap.remove();
  }
  const formBlk = document.querySelector('.container-fluid.cmp-treatmentform_2');
  if (formBlk) formBlk.remove();
  const proceedBlk = document.querySelector('.proceedoptions');
  if (proceedBlk) proceedBlk.remove();
}
