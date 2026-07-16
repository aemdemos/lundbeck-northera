/* eslint-disable */
/* global WebImporter */

/**
 * Parser: cards-cta
 * Base block: cards
 * Description: CTA cards without images. Each card has a heading, description paragraph,
 * and a call-to-action button link. Cards are displayed side-by-side on desktop.
 * Selector: .cmp-layout-quicklinks .image-text-cta
 * Generated: 2026-06-03
 */

/**
 * Normalize a link href: strip any embedded basic-auth credentials and convert
 * same-host absolute URLs to root-relative paths. Keeps external links intact.
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
  // Find the parent container to collect all cards for a single Cards block.
  const container = element.closest('.cmp-layout-quicklinks') || element.parentElement;

  // Guard against duplicate processing: if a block table was already inserted
  // by a prior parser call (first card), just remove this element.
  if (container.querySelector('table')) {
    element.replaceWith(document.createTextNode(''));
    return;
  }

  const cardElements = container.querySelectorAll('.image-text-cta');

  // Fallback: some quicklinks callouts (e.g. the "Thank You" page) are authored
  // as a single centered text block (heading + description) plus a separate
  // cmp-button, rather than as .image-text-cta cards. This renders as the
  // centered cards-cta variant (centered heading + auto-width centered button).
  if (cardElements.length === 0) {
    const cellContent = document.createElement('div');

    const headingEl = container.querySelector('.cmp-text h2, .cmp-text h3, h2, h3');
    if (headingEl) {
      const h3 = document.createElement('h3');
      h3.textContent = headingEl.textContent.trim();
      cellContent.appendChild(h3);
    }

    const descEl = container.querySelector('.cmp-text p, p');
    if (descEl) {
      const p = document.createElement('p');
      p.textContent = descEl.textContent.trim();
      cellContent.appendChild(p);
    }

    const linkEl = container.querySelector('a.cmp-button, a[href]');
    if (linkEl) {
      const href = normalizeHref(linkEl.getAttribute('href') || linkEl.href || '');
      // Prefer the dedicated label span; the first <span> is often an empty icon.
      const labelEl = linkEl.querySelector('.cmp-button__text, .cmp-label-text');
      const label = (labelEl ? labelEl.textContent : linkEl.textContent).trim();
      if (href) {
        const cta = document.createElement('a');
        cta.setAttribute('href', href);
        cta.textContent = label || 'Learn More';
        const ctaP = document.createElement('p');
        ctaP.appendChild(cta);
        cellContent.appendChild(ctaP);
      }
    }

    if (cellContent.childNodes.length > 0) {
      const block = WebImporter.Blocks.createBlock(document, {
        name: 'cards-cta (centered)',
        cells: [[[cellContent]]],
      });
      element.replaceWith(block);
    } else {
      element.replaceWith(document.createTextNode(''));
    }
    return;
  }

  const cells = [];

  cardElements.forEach((card) => {
    // The card structure nests h3 and p inside the wrapping <a> element.
    // Extract text content and rebuild proper elements for the block table.

    // Extract heading text from h3
    const headingEl = card.querySelector('.cmp-imagetext__description h3, h3');

    // Extract paragraph description text
    const descEl = card.querySelector('.cmp-imagetext__description p, p');

    // Extract the CTA link - use .href property for full URL resolution
    const linkEl = card.querySelector('a.cmp-imagetext__link, a[href]');
    const href = normalizeHref(linkEl ? (linkEl.href || linkEl.getAttribute('href') || '') : '');

    // Extract the CTA button label text
    const buttonTextEl = card.querySelector('.cmp-label-text, button span, .cmp-text-cta button');
    const buttonLabel = buttonTextEl ? buttonTextEl.textContent.trim() : '';

    // Build a single container div for all card content (one cell per card row)
    const cellContent = document.createElement('div');

    if (headingEl) {
      const h3 = document.createElement('h3');
      h3.textContent = headingEl.textContent.trim();
      cellContent.appendChild(h3);
    }

    if (descEl) {
      const p = document.createElement('p');
      p.textContent = descEl.textContent.trim();
      cellContent.appendChild(p);
    }

    // Create a proper CTA anchor element
    if (href) {
      const cta = document.createElement('a');
      cta.setAttribute('href', href);
      cta.textContent = buttonLabel || 'Learn More';
      const ctaP = document.createElement('p');
      ctaP.appendChild(cta);
      cellContent.appendChild(ctaP);
    }

    if (cellContent.childNodes.length > 0) {
      cells.push([[cellContent]]);
    }
  });

  const block = WebImporter.Blocks.createBlock(document, { name: 'cards-cta', cells });
  element.replaceWith(block);
}
