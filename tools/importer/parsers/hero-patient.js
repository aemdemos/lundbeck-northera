/* eslint-disable */
/* global WebImporter */

/**
 * Parser for hero-patient
 * Base block: hero
 * Source: https://northera-stage.d.lundbeckus.com/
 * Selector: .cmp-layout__herobanner
 * Description: Patient-photography hero with a full-bleed background image and a
 *   call-to-action button. The source cycles several randomized teasers; we take
 *   the first teaser's image and the shared survey CTA.
 *
 * Follows the Hero block convention — 1 column, 3 rows:
 *   Row 1: block name ("hero-patient")   ← added by createBlock
 *   Row 2: background image
 *   Row 3: content — survey lead line + call-to-action (text + link)
 * Generated: 2026-06-03
 */
export default function parse(element, { document }) {
  // Extract the first teaser instance (source has multiple randomized teasers)
  const firstTeaser = element.querySelector('.cmp-teaser');

  // Extract image from the first teaser (background image row)
  const image = firstTeaser
    ? firstTeaser.querySelector('.cmp-teaser__image .cmp-image__image, img')
    : element.querySelector('img.cmp-image__image, img');

  // Extract CTA link. The randomized hero splits image and CTA across sibling
  // teasers — the first teaser may hold only the image — so search the whole
  // block. Prefer the labelled action link (e.g. "GO TO SURVEY"); all teasers
  // share the same CTA target. Rebuild a clean anchor so sibling teaser links
  // and empty image anchors are not carried into the block.
  const actionLinks = [...element.querySelectorAll('a.cmp-teaser__action-link')];
  const sourceCta = actionLinks.find((a) => a.textContent.trim())
    || element.querySelector('a[href]')
    || null;

  // Extract the survey lead line that sits above the CTA (source: a <p> inside
  // .cmp-imagetext__description, e.g. "Take a survey to find out if NORTHERA…").
  const leadEl = element.querySelector('.cmp-imagetext__description p, .cmp-imagetext__description');

  const cells = [];

  // Row 2: background image (single cell).
  cells.push([image || '']);

  // Row 3: content — survey lead line (if present) + CTA button.
  const contentCell = [];
  if (leadEl && leadEl.textContent.trim()) {
    const lead = document.createElement('p');
    lead.textContent = leadEl.textContent.trim();
    contentCell.push(lead);
  }
  if (sourceCta) {
    const cta = document.createElement('a');
    cta.setAttribute('href', sourceCta.getAttribute('href') || sourceCta.href || '');
    cta.textContent = sourceCta.textContent.trim() || 'Learn More';
    const p = document.createElement('p');
    p.appendChild(cta);
    contentCell.push(p);
  }
  cells.push([contentCell.length ? contentCell : '']);

  // The photography disclaimer ("All individuals featured on this website…")
  // is default content inside the hero section, rendered below the photo (source:
  // .text.cmp-text__home_page). Preserve it as a paragraph after the block so it
  // stays in the same section instead of being discarded with the herobanner.
  const disclaimerEl = element.querySelector('.cmp-text__home_page p, .cmp-text__home_page');
  let disclaimer = null;
  if (disclaimerEl && /real patients and care partners/i.test(disclaimerEl.textContent)) {
    disclaimer = document.createElement('p');
    disclaimer.textContent = disclaimerEl.textContent.trim();
  }

  const block = WebImporter.Blocks.createBlock(document, { name: 'hero-patient', cells });
  element.replaceWith(block);
  if (disclaimer) block.after(disclaimer);
}
