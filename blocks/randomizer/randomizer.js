/*
 * Randomizer Block
 * The default variant is authored as its own section elsewhere on the page
 * (with a section-metadata id) and pulled in here via the site's [#id] nested
 * section syntax (see decorateNestedSections in scripts.js) — by the time this
 * block decorates, that row already holds the real, already-decorated content.
 * The default row is optional: with no default authored, the block picks
 * uniformly among just the "urls" alternates instead of (default + alternates).
 * A "urls" row holds alternate fragment URLs; on load, one of (default +
 * alternates) is picked with equal probability, so every variant — including
 * the default — gets roughly equal visibility over time.
 */

import { loadFragment } from '../fragment/fragment.js';
import { moveInstrumentation } from '../../scripts/scripts.js';

// Pulls the row labeled `label` (a 2-cell row whose first cell reads e.g.
// "urls") out of `rows`, wherever it is authored.
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
// Prioritize every <picture> image, not just the first: art-directed blocks
// (e.g. hero-patient) author separate mobile/desktop variants and only one
// is ever visible per viewport via CSS, so either could be the real LCP image.
function prioritizeLcpImage(scope) {
  scope.querySelectorAll('img').forEach((img) => {
    img.loading = 'eager';
    img.setAttribute('fetchpriority', 'high');
  });
}

/**
 * @param {Element} block
 */
export default async function decorate(block) {
  const rows = [...block.children];
  const urlsRow = extractLabeledRow(rows, 'urls');
  const defaultRows = rows;
  const hasDefault = defaultRows.length > 0;
  const altUrls = urlsRow
    ? [...urlsRow.querySelectorAll('a')].map((a) => a.getAttribute('href')).filter(Boolean)
    : [];

  // With a default row, index 0 means "keep it"; with no default, every pick
  // maps directly to an alternate (there's nothing to keep).
  const optionCount = altUrls.length + (hasDefault ? 1 : 0);
  // Not security-sensitive: only picks which variant to display, not a token/secret.
  // eslint-disable-next-line sonarjs/pseudo-random
  const pick = optionCount > 0 ? Math.floor(Math.random() * optionCount) : -1;
  const altIndex = hasDefault ? pick - 1 : pick;

  if (altIndex >= 0) {
    // altIndex is a numeric index derived only from Math.random() and array
    // length, never from external input — not an object-injection risk.
    // eslint-disable-next-line secure-coding/detect-object-injection
    const fragment = await loadFragment(altUrls[altIndex]);
    if (fragment) {
      block.replaceChildren(...fragment.childNodes);
      prioritizeLcpImage(block);
      return;
    }
  }

  // Keep the authored default content — either it was picked, or the
  // alternate fetch failed and this is the safe fallback.
  urlsRow?.remove();
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
