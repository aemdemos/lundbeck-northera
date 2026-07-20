/* eslint-disable */
/* global WebImporter */

// PARSER IMPORTS
import fragmentIsiParser from './parsers/fragment-isi.js';

// TRANSFORMER IMPORTS
import cleanupTransformer from './transformers/northera-cleanup.js';
import sectionsTransformer from './transformers/northera-sections.js';

// PAGE TEMPLATE CONFIGURATION
const PAGE_TEMPLATE = {
  name: 'sitemap-page',
  description: 'Site map page: an H1 "Site map" heading followed by a nested list of site links (4 top-level sections, some with sub-links), as default content, then ISI content (USE + IMPORTANT SAFETY INFORMATION).',
  urls: [
    'https://northera-stage.d.lundbeckus.com/site-map',
  ],
  blocks: [
    {
      // Reference the shared ISI fragment instead of inlining the ISI content.
      name: 'fragment-isi',
      instances: [
        'div.responsivegrid.cmp-layout-isi__phone .experiencefragment',
      ],
    },
  ],
  sections: [
    { id: 'sm-list', name: 'Site map heading + nested link list', selector: '.cmp-layout__sitemap', style: null, blocks: [], defaultContent: [] },
    { id: 'sm-isi', name: 'Important Safety Information', selector: 'div.responsivegrid.cmp-layout-isi__phone', style: null, blocks: ['fragment-isi'], defaultContent: [] },
  ],
};

// PARSER REGISTRY
const parsers = {
  'fragment-isi': fragmentIsiParser,
};

// TRANSFORMER REGISTRY - cleanup runs first, sections after
const transformers = [
  cleanupTransformer,
  ...(PAGE_TEMPLATE.sections && PAGE_TEMPLATE.sections.length > 1 ? [sectionsTransformer] : []),
];

/**
 * Execute all page transformers for a specific hook
 */
function executeTransformers(hookName, element, payload) {
  const enhancedPayload = { ...payload, template: PAGE_TEMPLATE };
  transformers.forEach((transformerFn) => {
    try {
      transformerFn.call(null, hookName, element, enhancedPayload);
    } catch (e) {
      console.error(`Transformer failed at ${hookName}:`, e);
    }
  });
}

/**
 * Find all blocks on the page based on the embedded template configuration
 */
function findBlocksOnPage(document, template) {
  const pageBlocks = [];
  const seen = new Set();
  template.blocks.forEach((blockDef) => {
    blockDef.instances.forEach((selector) => {
      const elements = document.querySelectorAll(selector);
      if (elements.length === 0) {
        console.warn(`Block "${blockDef.name}" selector not found: ${selector}`);
      }
      elements.forEach((element) => {
        if (seen.has(element)) return; // dedupe elements matched by multiple selectors
        seen.add(element);
        pageBlocks.push({
          name: blockDef.name,
          selector,
          element,
          section: blockDef.section || null,
        });
      });
    });
  });
  console.log(`Found ${pageBlocks.length} block instances on page`);
  return pageBlocks;
}

export default {
  transform: (payload) => {
    const {
      document, url, html, params,
    } = payload;

    const main = document.body;

    // 1. beforeTransform (initial cleanup)
    executeTransformers('beforeTransform', main, payload);

    // 2. Find blocks on page
    const pageBlocks = findBlocksOnPage(document, PAGE_TEMPLATE);

    // 3. Parse each block (skip elements already replaced by a prior parser)
    pageBlocks.forEach((block) => {
      if (!block.element.parentNode) return;
      const parser = parsers[block.name];
      if (parser) {
        try {
          parser(block.element, { document, url, params });
        } catch (e) {
          console.error(`Failed to parse ${block.name} (${block.selector}):`, e);
        }
      } else {
        console.warn(`No parser found for block: ${block.name}`);
      }
    });

    // 4. afterTransform (final cleanup + section breaks)
    executeTransformers('afterTransform', main, payload);

    // 4b. Tag the sitemap section with a `sitemap` Section Metadata style so the
    // nested link list can be styled (cyan bold top-level links + indented
    // brand-blue sub-links) via .section.sitemap in styles.css. The sitemap is
    // the first content block (holds the "Site map" H1 + nested <ul>); append
    // the metadata right after it, before the following section break.
    const smHeading = [...main.querySelectorAll('h1')].find((h) => /site map/i.test(h.textContent));
    if (smHeading) {
      // Place the metadata at the END of the sitemap section (after the nested
      // link list) so it does not split the heading from its list. Prefer the
      // sitemap list; fall back to the heading's parent.
      const smList = smHeading.parentElement
        && [...smHeading.parentElement.querySelectorAll('ul')].pop();
      const anchor = smList || smHeading;
      const meta = WebImporter.Blocks.createBlock(document, {
        name: 'Section Metadata',
        cells: { Style: 'sitemap' },
      });
      anchor.after(meta);
    }

    // 5. WebImporter built-in rules
    const hr = document.createElement('hr');
    main.appendChild(hr);
    WebImporter.rules.createMetadata(main, document);
    WebImporter.rules.transformBackgroundImages(main, document);
    WebImporter.rules.adjustImageUrls(main, url, params.originalURL);

    // 6. Generate sanitized path
    const path = WebImporter.FileUtils.sanitizePath(
      new URL(params.originalURL).pathname.replace(/\/$/, '').replace(/\.html$/, ''),
    );

    return [{
      element: main,
      path,
      report: {
        title: document.title,
        template: PAGE_TEMPLATE.name,
        blocks: pageBlocks.map((b) => b.name),
      },
    }];
  },
};
