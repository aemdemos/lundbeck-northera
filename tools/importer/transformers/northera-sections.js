/* eslint-disable */
/* global WebImporter */

/**
 * Transformer: NORTHERA section breaks and section metadata.
 * Creates section boundaries (<hr>) and Section Metadata blocks based on template sections.
 * All selectors verified from captured DOM (migration-work/cleaned.html).
 *
 * Template sections:
 *   1. "Ask for NORTHERA Banner" - .responsivegrid.ask-for-northera (no style)
 *   2. "Hero with Patient Stories" - .cmp-layout__herobanner (no style)
 *   3. "Quick Links Cards" - .cmp-layout-quicklinks (style: "dark-teal")
 *   4. "ISI Reference Bar" - .isi-mobile-wrap (no style)
 *   5. "ISI Full Content" - .cmp-layout-isi__phone (style: "isi")
 */
const TransformHook = { beforeTransform: 'beforeTransform', afterTransform: 'afterTransform' };

export default function transform(hookName, element, payload) {
  if (hookName === TransformHook.afterTransform) {
    const { document } = payload;
    const sections = payload.template && payload.template.sections;
    if (!sections || sections.length < 2) return;

    // Process sections in reverse order to avoid shifting DOM positions
    const reversedSections = [...sections].reverse();

    reversedSections.forEach((section, reverseIndex) => {
      const originalIndex = sections.length - 1 - reverseIndex;
      const sectionEl = element.querySelector(section.selector);

      if (!sectionEl) return;

      // Add Section Metadata block after the section element if it has a style
      if (section.style) {
        const sectionMetadata = WebImporter.Blocks.createBlock(document, {
          name: 'Section Metadata',
          cells: { style: section.style },
        });
        sectionEl.after(sectionMetadata);
      }

      // Insert <hr> before the section element (except for the first section)
      if (originalIndex > 0) {
        const hr = document.createElement('hr');
        sectionEl.before(hr);
      }
    });
  }
}
