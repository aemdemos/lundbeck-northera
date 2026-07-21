/**
 * quote-grid — a row of physician/patient quote cards (HCP landing page).
 * Each card is a brand-blue quotation heading + a grey attribution line.
 * A single trailing cell (no attribution) is treated as the footnote below the
 * grid. 1 column on mobile, 3 columns on desktop.
 *
 * Authoring rows (one per card):
 *   [ quotation ] | [ attribution ]
 * Optional final row with a single cell = footnote.
 *
 * @param {Element} block
 */
export default function decorate(block) {
  const rows = [...block.children];
  const ul = document.createElement('ul');
  let footnote = null;

  rows.forEach((row) => {
    const cells = [...row.children];
    const [quotation, attribution] = cells;

    // A row with only one cell and no quote-like content is the footnote.
    if (cells.length === 1) {
      [footnote] = cells;
      return;
    }

    const li = document.createElement('li');
    const q = document.createElement('p');
    q.className = 'quote-grid-quotation';
    q.textContent = quotation ? quotation.textContent.trim() : '';
    li.append(q);

    if (attribution && attribution.textContent.trim()) {
      const a = document.createElement('p');
      a.className = 'quote-grid-attribution';
      a.textContent = attribution.textContent.trim();
      li.append(a);
    }
    ul.append(li);
  });

  block.textContent = '';
  block.append(ul);

  if (footnote) {
    const fn = document.createElement('p');
    fn.className = 'quote-grid-footnote';
    fn.textContent = footnote.textContent.trim();
    block.append(fn);
  }
}
