/*
 * Randomizer Block
 * EDS doesn't allow authoring a block inside a block, so the default variant
 * is authored directly as extra rows in this table instead of as a fragment.
 * An optional "type" row (e.g. "hero-patient") renders those rows using that
 * block's own JS/CSS — author them exactly as you would in that block's own
 * table. A "randomizer urls" row holds alternate fragment URLs; on load, one
 * of (default + alternates) is picked with equal probability, so every
 * variant — including the default — gets roughly equal visibility over time.
 */

import { loadFragment } from '../fragment/fragment.js';
import { decorateBlock, loadBlock, toClassName } from '../../scripts/aem.js';
import { moveInstrumentation } from '../../scripts/scripts.js';

// Pulls the row labeled `label` (a 2-cell row whose first cell reads e.g.
// "type" or "randomizer urls") out of `rows`, wherever it is authored.
function extractLabeledRow(rows, label) {
  const index = rows.findIndex((row) => {
    const cells = [...row.children];
    return cells.length === 2 && cells[0].textContent.trim().toLowerCase() === label;
  });
  return index === -1 ? null : rows.splice(index, 1)[0];
}

// This block's whole reason for existing is to avoid the fetch that used to
// hurt LCP, so its image can't wait for aem.js's waitForFirstImage(), which
// only checks the first <img> in the first section — it misses this one
// whenever an earlier block in the same section has an image (e.g. an icon).
function prioritizeLcpImage(scope) {
  const img = scope.querySelector('img');
  if (img) {
    img.loading = 'eager';
    img.setAttribute('fetchpriority', 'high');
  }
}

/**
 * @param {Element} block
 */
export default async function decorate(block) {
  const rows = [...block.children];
  const typeRow = extractLabeledRow(rows, 'type');
  const urlsRow = extractLabeledRow(rows, 'randomizer urls');
  const defaultRows = rows;
  const blockType = typeRow ? toClassName(typeRow.children[1].textContent.trim()) : null;
  const altUrls = urlsRow
    ? [...urlsRow.querySelectorAll('a')].map((a) => a.getAttribute('href')).filter(Boolean)
    : [];

  // Not security-sensitive: only picks which variant to display, not a token/secret.
  // eslint-disable-next-line sonarjs/pseudo-random
  const pick = Math.floor(Math.random() * (altUrls.length + 1));

  if (pick > 0) {
    const fragment = await loadFragment(altUrls[pick - 1]);
    if (fragment) {
      block.replaceChildren(...fragment.childNodes);
      prioritizeLcpImage(block);
      return;
    }
  }

  // Keep the authored default content — either it was picked, or the
  // alternate fetch failed and this is the safe fallback.
  typeRow?.remove();
  urlsRow?.remove();

  if (blockType) {
    // Build a real `blockType` block from the default rows and decorate/load
    // it like any other block — nesting is fine at runtime, it's only
    // authoring a block inside a block that EDS doesn't support.
    const typed = document.createElement('div');
    typed.className = blockType;
    defaultRows.forEach((row) => {
      moveInstrumentation(row, typed);
      typed.append(row);
    });
    block.replaceChildren(typed);
    decorateBlock(typed);
    await loadBlock(typed);
    prioritizeLcpImage(block);
    return;
  }

  defaultRows.forEach((row) => {
    moveInstrumentation(row, block);
    [...row.children].forEach((cell) => {
      moveInstrumentation(cell, block);
      block.append(...cell.childNodes);
    });
    row.remove();
  });
  prioritizeLcpImage(block);
}
