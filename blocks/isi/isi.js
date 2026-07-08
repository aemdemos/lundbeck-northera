/**
 * ISI (Important Safety Information) block.
 *
 * Authored as two rows:
 *   Row 1 – abbreviated content (the "Please see…" line shown in the source's
 *           fixed bar). Hidden here; the full content is shown in-flow.
 *   Row 2 – full inline content.
 *
 * Placement (CSS): the ISI block(s) render in normal flow at the bottom of the
 * page by default, and become a right-hand rail at ≥1200px — matching the
 * source's `.cmp-layout-isi__desktop` behavior (full content always visible).
 *
 * This decorator adds semantic hooks so the CSS can replicate the source visuals:
 *   • `.isi--use`        – the "Use" block
 *   • `.isi--important`  – the "Important Safety Information" block
 *   • `.isi-abbr`        – abbreviated row (hidden)
 *   • `.isi-full`        – full-content row
 *   • `.isi-warningbox`  – the boxed "WARNING: SUPINE HYPERTENSION" callout
 *
 * @param {HTMLElement} block
 */
export default function decorate(block) {
  const rows = [...block.children];
  if (rows.length === 0) return;

  /* ── 1. Split authored rows ─────────────────────────────────── */
  const [abbreviatedRow, inlineRow] = rows;
  if (abbreviatedRow) abbreviatedRow.classList.add('isi-abbr');
  if (inlineRow) inlineRow.classList.add('isi-full');

  const contentRow = inlineRow || abbreviatedRow;

  /* ── 2. Tag the block variant (Use vs Important Safety) ─────── */
  const text = (contentRow.textContent || '').trim();
  if (/^\s*Use\b/i.test(text)) {
    block.classList.add('isi--use');
  } else if (/IMPORTANT SAFETY INFORMATION/i.test(text)) {
    block.classList.add('isi--important');
  }

  /* ── 3. Wrap the boxed supine-hypertension warning ──────────── */
  const paragraphs = [...contentRow.querySelectorAll('p')];
  const warningStart = paragraphs.find((p) => /^\s*WARNING:/i.test(p.textContent));
  if (warningStart) {
    const boxItems = [warningStart];
    // include the immediately-following explanatory paragraph(s) until a list/heading
    let next = warningStart.nextElementSibling;
    while (next && next.tagName === 'P' && !/IMPORTANT SAFETY INFORMATION/i.test(next.textContent)) {
      boxItems.push(next);
      next = next.nextElementSibling;
    }
    const box = document.createElement('div');
    box.className = 'isi-warningbox';
    warningStart.before(box);
    boxItems.forEach((el) => box.append(el));
  }
}
