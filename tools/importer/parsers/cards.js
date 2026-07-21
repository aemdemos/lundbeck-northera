/* eslint-disable */
/* global WebImporter */
/**
 * Parser for cards (variant: image-left).
 * Base block: cards
 * Source: https://northera-stage.d.lundbeckus.com/about-northera/taking-northera
 * Generated: 2026-07-08
 *
 * Structure (Cards): 2 columns, one row per card.
 *   Cell 1: icon image (from .cmp-teaser__image img).
 *   Cell 2: description content (from .cmp-teaser__description) — includes the
 *           "If you miss a dose:" line + nested <ul> for the calendar card.
 *
 * Notes:
 *  - Each card is a .lu-cmp-teaser (6 total). hr.cmp-separator dividers are skipped.
 *  - The section H2 heading (#text-470fe187bf) and trailing paragraph (#text-ad410d480e)
 *    are default content OUTSIDE the block and are NOT included.
 *  - Variant "image-left" is carried via the createBlock name.
 */
export default function parse(element, { document }) {
  const teasers = [...element.querySelectorAll('.lu-cmp-teaser')];
  const cells = [];

  teasers.forEach((teaser) => {
    // Cell 1: icon image.
    const img = teaser.querySelector('.cmp-teaser__image img, img');

    // Cell 2: description content, filtered to meaningful elements only.
    const desc = teaser.querySelector('.cmp-teaser__description');
    // Source highlights key phrases with an inline gold color
    // (<span style="color: rgb(255,183,28)">…</span>). DA strips style/class,
    // so convert those spans to <strong> — a semantic marker that survives the
    // import and is styled gold in cards.css (.cards.reminders … strong).
    if (desc) {
      const goldSpans = [
        ...desc.querySelectorAll('span[style*="color"], span.cmp-rest-content'),
      ];
      goldSpans.forEach((span) => {
        const strong = document.createElement('strong');
        strong.innerHTML = span.innerHTML;
        span.replaceWith(strong);
      });
    }
    const contentCell = [];
    if (desc) {
      [...desc.children].forEach((child) => {
        const hasText = child.textContent.trim().length > 0;
        const hasMedia = child.querySelector && child.querySelector('li, img, a');
        if (hasText || hasMedia) {
          contentCell.push(child);
        }
      });
    }

    // Only emit rows that have real content; skip empty teasers / separators.
    if (img || contentCell.length) {
      cells.push([
        img || '',
        contentCell.length ? contentCell : '',
      ]);
    }
  });

  if (!cells.length) {
    element.replaceWith(...element.childNodes);
    return;
  }

  // Build with the base block name, then set the exact variant label.
  // The "reminders" variant renders the source .cmp-image__textlist teasers:
  // circular icons on the left, white text on the right, thin white dividers
  // between rows, on the brand-blue section background (see cards.css
  // `.cards.reminders` + styles.css `.section.reminders`).
  const block = WebImporter.Blocks.createBlock(document, { name: 'cards', cells });
  const nameCell = block.querySelector('tr th, tr td');
  if (nameCell) {
    nameCell.textContent = 'Cards (reminders)';
  }

  // Insert the block where the teasers live and remove ONLY the source teasers
  // and their separators — preserving the surrounding `#importantreminders`
  // container and its H2 heading ("Important reminders when taking NORTHERA").
  // Keeping the container intact is what lets the sections transformer match
  // its selector and apply the brand-blue "reminders" section style + break;
  // replacing the whole container (as before) dropped the heading and left the
  // cards merged into the preceding section on a white background.
  const firstTeaser = teasers[0];
  firstTeaser.parentNode.insertBefore(block, firstTeaser);
  teasers.forEach((teaser) => teaser.remove());
  [...element.querySelectorAll('.separator')].forEach((sep) => sep.remove());
}
