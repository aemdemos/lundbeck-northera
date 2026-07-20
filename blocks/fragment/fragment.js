/*
 * Fragment Block
 * Include content on a page as a fragment.
 * https://www.aem.live/developer/block-collection/fragment
 */

// eslint-disable-next-line import/no-cycle
import {
  decorateMain,
  ensureDOMPurify,
  moveInstrumentation,
} from '../../scripts/scripts.js';

import {
  loadSections,
  DOMPURIFY,
  loadBlock,
} from '../../scripts/aem.js';

/**
 * Loads a fragment.
 * @param {string} path The path to the fragment
 * @returns {Promise<HTMLElement>} The root element of the fragment
 */
export async function loadFragment(path) {
  if (path && path.startsWith('/') && !path.startsWith('//')) {
    await ensureDOMPurify();
    const resp = await fetch(`${path}.plain.html`);
    if (resp.ok) {
      const main = document.createElement('main');
      main.innerHTML = window.DOMPurify.sanitize(await resp.text(), DOMPURIFY);

      // reset base path for media to fragment base (whitelist attr to avoid prototype pollution)
      const resetAttributeBase = (tag, attr) => {
        if (attr !== 'src' && attr !== 'srcset') return;
        main.querySelectorAll(`${tag}[${attr}^="./media_"]`).forEach((elem) => {
          const { href } = new URL(elem.getAttribute(attr), new URL(path, window.location));
          if (attr === 'src') elem.src = href;
          else if (attr === 'srcset') elem.srcset = href;
        });
      };
      resetAttributeBase('img', 'src');
      resetAttributeBase('source', 'srcset');

      decorateMain(main);
      await loadSections(main);

      // Load any nested blocks that were inserted by decorateNestedSections
      const nestedBlocks = main.querySelectorAll('.nested-block');
      await Promise.all([...nestedBlocks].map((block) => loadBlock(block)));

      return main;
    }
  }
  return null;
}

/**
 * @param {Element} block
 */
export default async function decorate(block) {
  const link = block.querySelector('a');
  const path = link ? link.getAttribute('href') : block.textContent.trim();
  const fragment = await loadFragment(path);
  if (!fragment) return;

  const hostSection = block.closest('.section');
  const fragmentSections = [...fragment.querySelectorAll(':scope > .section')];

  // When the fragment block is the only content in its host section, hoist the
  // fragment's sections up so they become direct children of <main> — matching
  // the DOM of a page that authored those sections inline. Section-level
  // layouts depend on this: e.g. the ISI right rail at >= 1200px is styled via
  // `main > .section.isi-container`, which only matches a direct child of main.
  const wrappers = hostSection ? [...hostSection.children] : [];
  const fragmentAloneInSection = hostSection
    && hostSection.parentElement
    && wrappers.length === 1
    && wrappers[0].contains(block)
    && wrappers[0].querySelectorAll(':scope > *').length === 1;

  if (fragmentSections.length && fragmentAloneInSection) {
    fragmentSections.forEach((section) => hostSection.before(section));
    hostSection.remove();
    return;
  }

  // Default (nested) behavior: inline the fragment content in place.
  const fragmentSection = fragment.querySelector(':scope .section');
  if (fragmentSection) {
    hostSection.classList.add(...fragmentSection.classList);
    moveInstrumentation(block, block.parentElement);
    block.closest('.fragment').replaceWith(...fragment.childNodes);
  }
}
