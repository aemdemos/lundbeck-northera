/**
 * ISI (Important Safety Information) block.
 *
 * Authored as two blocks in one section (source parity):
 *   • "Use" block                    → .isi--use
 *   • "Important Safety Information"  → .isi--important
 * Each block has two rows:
 *   Row 1 – abbreviated "Please see…" content (source fixed-bar line)
 *   Row 2 – full inline content
 *
 * Placement:
 *   • In normal flow at the bottom of the page (full content), and
 *   • a persistent FIXED BOTTOM BAR (< 1200px) that shows the collapsed
 *     "USE" / "IMPORTANT SAFETY INFORMATION" rows with +/- toggles and a
 *     peek of the boxed warning. Clicking a toggle expands that section into
 *     a full scrollable panel. The bar hides once the in-flow ISI scrolls
 *     into view and reappears on scroll-up (source behavior).
 *   • At ≥ 1200px the bar is hidden and the ISI section becomes a right rail
 *     (see isi.css).
 *
 * @param {HTMLElement} block
 */

const BAR_ID = 'isi-bar';

function getOrCreateBar() {
  let bar = document.getElementById(BAR_ID);
  if (bar) return bar;

  bar = document.createElement('div');
  bar.id = BAR_ID;
  bar.className = 'isi-bar';
  bar.setAttribute('aria-label', 'Important Safety Information');
  const inner = document.createElement('div');
  inner.className = 'isi-bar-inner';
  bar.append(inner);
  document.body.append(bar);
  return bar;
}

function makeToggle() {
  const toggle = document.createElement('button');
  toggle.type = 'button';
  toggle.className = 'isi-bar-toggle';
  toggle.setAttribute('aria-expanded', 'false');
  const icon = document.createElement('span');
  icon.className = 'isi-bar-toggle-icon';
  toggle.append(icon);
  return toggle;
}

/**
 * Build one collapsible section in the fixed bar for this ISI block.
 * @param {HTMLElement} bar
 * @param {string} variant 'use' | 'important'
 * @param {string} label heading text
 * @param {HTMLElement} fullRow the block's full-content row (cloned into the panel)
 */
function addBarSection(bar, variant, label, fullRow) {
  const inner = bar.querySelector('.isi-bar-inner');
  const section = document.createElement('section');
  section.className = `isi-bar-section isi-bar-section-${variant}`;
  section.dataset.isi = variant;

  const header = document.createElement('div');
  header.className = 'isi-bar-header';
  const title = document.createElement('span');
  title.className = 'isi-bar-title';
  title.textContent = label;
  const toggle = makeToggle();
  toggle.setAttribute('aria-label', `Expand ${label}`);
  header.append(title, toggle);

  const panel = document.createElement('div');
  panel.className = 'isi-bar-panel';
  // clone the full content into the expandable panel
  [...fullRow.children].forEach((child) => {
    panel.append(child.cloneNode(true));
  });
  // remove the duplicate leading label paragraph inside the clone (kept in header)
  const firstStrong = panel.querySelector('p strong, p b');
  if (
    firstStrong
    && firstStrong.textContent.trim().toLowerCase().startsWith(label.toLowerCase())
  ) {
    const p = firstStrong.closest('p');
    if (p) p.remove();
  }

  section.append(header, panel);

  // collapsed peek: the important-safety section shows its warning box peeking
  if (variant === 'important') {
    const box = panel.querySelector('.isi-warningbox');
    if (box) {
      const peek = document.createElement('div');
      peek.className = 'isi-bar-peek';
      peek.append(box.cloneNode(true));
      header.after(peek);
    }
  }

  const setOpen = (open) => {
    section.classList.toggle('open', open);
    toggle.setAttribute('aria-expanded', String(open));
    toggle.setAttribute('aria-label', `${open ? 'Collapse' : 'Expand'} ${label}`);
    bar.classList.toggle('isi-bar-expanded', open);
    if (open) {
      // only one section open at a time
      inner.querySelectorAll('.isi-bar-section.open').forEach((s) => {
        if (s !== section) s.classList.remove('open');
      });
    }
  };

  toggle.addEventListener('click', (e) => {
    e.stopPropagation();
    setOpen(!section.classList.contains('open'));
    if (!inner.querySelector('.isi-bar-section.open')) bar.classList.remove('isi-bar-expanded');
  });

  inner.append(section);
}

function setupUseBody(contentRow) {
  const contentCell = contentRow.firstElementChild || contentRow;
  const kids = [...contentCell.children];
  const labelEl = kids[0];
  const bodyEls = kids.slice(1);

  if (labelEl) labelEl.classList.add('isi-use-label');
  if (!bodyEls.length) return;

  const body = document.createElement('div');
  body.className = 'isi-use-body';
  labelEl.after(body);
  bodyEls.forEach((el) => body.append(el));
}

function resolveVariant(block, contentRow) {
  const text = (contentRow.textContent || '').trim();

  if (/^\s*Use\b/i.test(text)) {
    block.classList.add('isi-use');
    setupUseBody(contentRow);
    return { variant: 'use', label: 'USE' };
  }

  if (/IMPORTANT SAFETY INFORMATION/i.test(text)) {
    block.classList.add('isi-important');
    return { variant: 'important', label: 'IMPORTANT SAFETY INFORMATION' };
  }

  return { variant: '', label: '' };
}

function wrapWarningBox(contentRow) {
  const paragraphs = [...contentRow.querySelectorAll('p')];
  const warningStart = paragraphs.find((p) => /^\s*WARNING:/i.test(p.textContent));
  if (!warningStart || warningStart.closest('.isi-warningbox')) return;

  const boxItems = [warningStart];
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

function observeSectionVisibility(block) {
  const section = block.closest('.section');
  if (!section || section.dataset.isiObserved) return;

  section.dataset.isiObserved = 'true';
  const bar = document.getElementById(BAR_ID);
  const observer = new IntersectionObserver(
    ([entry]) => {
      if (!bar) return;
      if (entry.isIntersecting) {
        bar.classList.add('isi-bar-hidden');
        bar.classList.remove('isi-bar-expanded');
        bar.querySelectorAll('.isi-bar-section.open').forEach((s) => s.classList.remove('open'));
      } else {
        bar.classList.remove('isi-bar-hidden');
      }
    },
    { threshold: 0 },
  );
  observer.observe(section);
}

/**
 * Builds the source "CLOSE X" control (button.cmp-isi-model__btn-close):
 *   CLOSE <span aria-hidden="true">X</span>
 * Shown only in the expanded full-page (desktop) state.
 */
function makeCloseButton() {
  const btn = document.createElement('button');
  btn.type = 'button';
  btn.className = 'isi-close';
  btn.setAttribute('aria-label', 'Close');
  btn.append(document.createTextNode('CLOSE '));
  const x = document.createElement('span');
  x.setAttribute('aria-hidden', 'true');
  x.className = 'isi-close-x';
  x.textContent = 'X';
  btn.append(x);
  return btn;
}

function setupDesktopExpandToggle(block, variant) {
  if (variant !== 'use') return;

  const section = block.closest('.section.isi-container');
  if (!section || section.dataset.isiDesktopToggle) return;
  section.dataset.isiDesktopToggle = 'true';

  // Collapsed affordance: the "+" open control (source rail glyph).
  const toggle = makeToggle();
  toggle.classList.add('isi-desktop-toggle');
  toggle.setAttribute('aria-label', 'Expand Important Safety Information');

  const headingRow = block.querySelector('.isi-full .isi-use-label')
    || block.querySelector('.isi-full p');
  if (headingRow) {
    headingRow.classList.add('isi-desktop-toggle-row');
    headingRow.append(toggle);
  } else {
    block.prepend(toggle);
  }

  // Expanded affordance: the exact source "CLOSE X" button (top-right of the
  // full-page overlay). Hidden until the section is expanded (see isi.css).
  const closeBtn = makeCloseButton();
  section.append(closeBtn);

  const setExpanded = (expanded) => {
    section.classList.toggle('isi-desktop-expanded', expanded);
    toggle.setAttribute('aria-expanded', String(expanded));
    toggle.setAttribute(
      'aria-label',
      expanded ? 'Collapse Important Safety Information' : 'Expand Important Safety Information',
    );
  };

  toggle.addEventListener('click', (e) => {
    e.stopPropagation();
    setExpanded(!section.classList.contains('isi-desktop-expanded'));
  });

  closeBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    setExpanded(false);
  });
}

const DESKTOP_RAIL_MQ = window.matchMedia('(min-width: 1200px)');

/**
 * At ≥1200px the ISI is a right rail. The "Important Safety" block must have a
 * FIXED height so its long text scrolls internally (overflow-y:scroll) instead
 * of growing to full content height. The source computes this height so the
 * rail bottom aligns with the left content column; we reproduce that by sizing
 * the important block to fill from its own top down to the content column's
 * bottom. Runs on load, on resize, and when content height changes.
 */
function syncRailHeight() {
  const railSection = document.querySelector('main > .section.isi-container');
  if (!railSection) return;

  const important = railSection.querySelector('.isi.isi-important');
  if (!important) return;

  // reset before measuring so a prior fixed height doesn't skew the read
  important.style.height = '';

  // in the expanded overlay the block scrolls the whole viewport; skip sizing
  if (!DESKTOP_RAIL_MQ.matches || railSection.classList.contains('isi-desktop-expanded')) {
    return;
  }

  // Source parity: the rail's Important-Safety block runs from its own top all
  // the way to the BOTTOM OF THE PAGE — past the content column and alongside
  // the footer (measured on source: rail bottom = document bottom, below the
  // footer). So its height = footer bottom (or document bottom) − its own top.
  // The long ISI text scrolls internally within that tall box.
  const footer = document.querySelector('footer');
  const importantTopVp = important.getBoundingClientRect().top + window.scrollY;
  const footerBottomVp = footer
    ? footer.getBoundingClientRect().bottom + window.scrollY
    : document.documentElement.scrollHeight;

  const target = Math.round(footerBottomVp - importantTopVp);
  if (target > 120) important.style.height = `${target}px`;
}

let railSyncScheduled = false;
function scheduleRailSync() {
  if (railSyncScheduled) return;
  railSyncScheduled = true;
  requestAnimationFrame(() => {
    railSyncScheduled = false;
    syncRailHeight();
  });
}

export default function decorate(block) {
  const rows = [...block.children];
  if (rows.length === 0) return;

  const [abbreviatedRow, inlineRow] = rows;
  if (abbreviatedRow) abbreviatedRow.classList.add('isi-abbr');
  if (inlineRow) inlineRow.classList.add('isi-full');
  const contentRow = inlineRow || abbreviatedRow;

  const { variant, label } = resolveVariant(block, contentRow);
  wrapWarningBox(contentRow);

  /* Build the fixed bottom bar section for this block */
  if (variant) {
    const bar = getOrCreateBar();
    addBarSection(bar, variant, label, contentRow);
  }

  setupDesktopExpandToggle(block, variant);

  /* Hide the bar once the in-flow ISI section scrolls into view (source behavior) */
  observeSectionVisibility(block);

  /* Size the desktop rail so the Important Safety block scrolls internally and
     its bottom reaches the page/footer bottom (source parity). Wire listeners
     once, on the important block. */
  if (variant === 'important') {
    scheduleRailSync();
    window.addEventListener('resize', scheduleRailSync);
    window.addEventListener('load', scheduleRailSync);
    DESKTOP_RAIL_MQ.addEventListener('change', scheduleRailSync);
    // content/footer images + fonts can change page height after decorate;
    // re-sync whenever the content sections or footer resize.
    if (window.ResizeObserver) {
      const ro = new ResizeObserver(scheduleRailSync);
      const main = block.closest('main');
      if (main) {
        [...main.children]
          .filter((s) => s.classList.contains('section') && !s.classList.contains('isi-container'))
          .forEach((s) => ro.observe(s));
      }
      const footer = document.querySelector('footer');
      if (footer) ro.observe(footer);
    }
  }
}
