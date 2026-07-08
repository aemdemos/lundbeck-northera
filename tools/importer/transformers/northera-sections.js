/* eslint-disable */
/* global WebImporter */

/**
 * Transformer: NORTHERA (Lundbeck) section breaks.
 *
 * Inserts EDS section breaks (`<hr>`) at the boundaries between the logical
 * sections defined for the content-page template in page-templates.json, so
 * the imported document has correct section structure.
 *
 * Runs in afterTransform only. Section boundaries are driven by
 * `payload.template.sections`; the section `selector` values were verified
 * against migration-work/cleaned.html for
 * https://northera-stage.d.lundbeckus.com/about-northera/taking-northera.
 *
 * For each section that declares a `style`, a `Section Metadata` block is
 * emitted. All 7 sections currently have `style: null` (they render on white),
 * so no Section Metadata is added — the brand-blue background of the
 * "important reminders" cards block is left to block CSS.
 */

const TransformHook = { beforeTransform: 'beforeTransform', afterTransform: 'afterTransform' };

export default function transform(hookName, element, payload) {
  if (hookName === TransformHook.afterTransform) {
    const template = payload && payload.template;
    const sections = template && Array.isArray(template.sections) ? template.sections : [];
    if (sections.length < 2) return;

    const doc = element.ownerDocument;

    // Process in reverse so inserted nodes never shift the position of
    // sections we have not handled yet.
    for (let i = sections.length - 1; i >= 0; i -= 1) {
      const section = sections[i];
      if (!section || !section.selector) continue;

      const target = element.querySelector(section.selector);
      if (!target) continue;

      // Section Metadata block (only when a style is declared).
      if (section.style) {
        const meta = WebImporter.Blocks.createBlock(doc, {
          name: 'Section Metadata',
          cells: { style: section.style },
        });
        if (target.nextSibling) {
          target.parentNode.insertBefore(meta, target.nextSibling);
        } else {
          target.parentNode.appendChild(meta);
        }
      }

      // Section break before every section except the first, when there is
      // preceding content to break away from.
      if (i > 0 && target.parentNode) {
        const hr = doc.createElement('hr');
        target.parentNode.insertBefore(hr, target);
      }
    }
  }
}
