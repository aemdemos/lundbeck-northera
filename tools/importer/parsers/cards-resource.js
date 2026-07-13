/* eslint-disable */
/* global WebImporter */

/**
 * Parser: cards-resource
 * Base block: cards (variant "resource")
 * Description: Resource-download cards. Each card is an anchor
 * (.cmp-imagetext__link) wrapping a thumbnail image, a heading, a description
 * paragraph, and a CTA button label. The whole card links to a PDF or page.
 *
 * Block table (per EDS Cards convention): 2 columns, one row per card.
 *   cell 1 = image (thumbnail)
 *   cell 2 = title (Heading) + description + Call-to-Action link (at bottom)
 *
 * Selector: .cmp-layout__patientsupport .cmp-imagetext__link
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
    // strip credentials from any other absolute URL
    u.username = '';
    u.password = '';
    return u.toString();
  } catch (e) {
    return raw;
  }
}

export default function parse(element, { document }) {
  // Collect all resource-card anchors under the shared grid so the whole set
  // becomes a single Cards block.
  const container = element.closest('.cmp-layout__patientsupport') || element.parentElement;

  // Guard against duplicate processing when the parser fires per-card: if the
  // block table was already inserted by an earlier call, drop this element.
  if (container.querySelector('table')) {
    element.replaceWith(document.createTextNode(''));
    return;
  }

  const cards = container.querySelectorAll('a.cmp-imagetext__link');
  const cells = [];

  cards.forEach((card) => {
    const href = normalizeHref(card.href || card.getAttribute('href') || '');
    const img = card.querySelector('img');
    const headingEl = card.querySelector('h3, h2');
    const descEl = card.querySelector('.cmp-imagetext__description p, p');
    const buttonEl = card.querySelector('.cmp-label-text, .cmp-text-cta, [class*="buttontext"]');
    const buttonLabel = buttonEl ? buttonEl.textContent.trim() : '';

    // Cell 1: the thumbnail image (re-use the existing <img> for URL/alt fidelity).
    const imageCell = document.createElement('div');
    if (img) {
      imageCell.appendChild(img);
    }

    // Cell 2: heading + description + CTA link (call-to-action at the bottom).
    const bodyCell = document.createElement('div');
    if (headingEl) {
      const h3 = document.createElement('h3');
      h3.textContent = headingEl.textContent.trim();
      bodyCell.appendChild(h3);
    }
    if (descEl) {
      const p = document.createElement('p');
      p.textContent = descEl.textContent.trim();
      bodyCell.appendChild(p);
    }
    // The whole source card is a link; expose it as a CTA anchor carrying the
    // button label so the block keeps the destination + call to action.
    if (href) {
      const cta = document.createElement('a');
      cta.setAttribute('href', href);
      cta.textContent = buttonLabel || 'Learn More';
      const ctaP = document.createElement('p');
      ctaP.appendChild(cta);
      bodyCell.appendChild(ctaP);
    }

    cells.push([imageCell, bodyCell]);
  });

  const block = WebImporter.Blocks.createBlock(document, {
    name: 'Cards (resource)',
    cells,
  });
  element.replaceWith(block);
}
