/* eslint-disable */
/* global WebImporter */

/**
 * Parser: specialist-search
 * Static visual replica of the source Google-Maps ZIP lookup form. Extracts the
 * helper line, ZIP placeholder, Terms & Conditions acknowledgement (with link),
 * and submit label into a 4-row block. The live map search is NOT migrated.
 * Selector: .cmp-specialist__zipcode-section
 * Generated: 2026-07-17
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
  const helperEl = element.querySelector('.cmp-specialist__zipcodecontent > p, p');
  const helper = helperEl ? helperEl.textContent.trim() : '';

  const zipEl = element.querySelector('.cmp-zipCode, input[type="text"]');
  const placeholder = zipEl ? (zipEl.getAttribute('placeholder') || 'Enter your ZIP code') : 'Enter your ZIP code';

  // Terms acknowledgement — preserve the link, drop credentials / same-host abs.
  const termsEl = element.querySelector('.cmp-find-specialist__labeltext, .cmp-specialist__termsConditons');
  const termsCell = document.createElement('div');
  if (termsEl) {
    const p = termsEl.querySelector('p') || termsEl;
    const clone = p.cloneNode(true);
    clone.querySelectorAll('a[href]').forEach((a) => {
      a.setAttribute('href', normalizeHref(a.getAttribute('href') || a.href || ''));
    });
    const out = document.createElement('p');
    out.innerHTML = clone.innerHTML;
    termsCell.appendChild(out);
  }

  const submitEl = element.querySelector('.cmp-zipcode__submit, input[type="submit"]');
  const buttonLabel = submitEl
    ? (submitEl.getAttribute('value') || submitEl.textContent || 'SEARCH NOW').trim()
    : 'SEARCH NOW';

  const block = WebImporter.Blocks.createBlock(document, {
    name: 'specialist-search',
    cells: [
      [helper],
      [placeholder],
      [termsCell],
      [buttonLabel],
    ],
  });

  element.replaceWith(block);
}
