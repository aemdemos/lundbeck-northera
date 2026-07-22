/* eslint-disable */
/* global WebImporter */

// PARSER IMPORTS
import heroHcpInternalParser from './parsers/hero-hcp-internal.js';
import columnsFormParser from './parsers/columns-form.js';
import treatmentFormParser from './parsers/treatment-form.js';
import fragmentIsiParser from './parsers/fragment-isi.js';

// TRANSFORMER IMPORTS
import cleanupTransformer from './transformers/northera-cleanup.js';
import sectionsTransformer from './transformers/northera-sections.js';

// PAGE TEMPLATE CONFIGURATION
const PAGE_TEMPLATE = {
  name: 'treatment-form-page',
  description: 'HCP Treatment Form page. Section 1: internal-page icon hero banner + intro H2/paragraphs + a columns.form block (blue fax callout + check-list). Section 2: a treatment-form block (two entry CTAs + a static 6-step prescription wizard replica). Section 3: the shared ISI fragment. The live interactive form (backend submit, PDF, session-timeout modals) is NOT migrated.',
  urls: [
    'https://northera-stage.d.lundbeckus.com/for-healthcare-professionals/treatment-form',
  ],
  blocks: [
    {
      name: 'hero-hcp-internal',
      instances: [
        'div.treatmentform .cmp-treatment__banner',
      ],
    },
    {
      name: 'columns-form',
      instances: [
        'div.cmp-treatment__textcontainer .cmp-specialty__pharmacy',
      ],
    },
    {
      name: 'treatment-form',
      instances: [
        'div.proceedoptions',
      ],
    },
    {
      // Reference the shared ISI fragment instead of inlining the ISI content.
      name: 'fragment-isi',
      instances: [
        'div.responsivegrid.cmp-layout-isi__phone .experiencefragment',
      ],
    },
  ],
  // Section 1 = hero + intro + columns.form (no break before the intro so it
  // joins the hero). The treatment-form parser inserts its own <hr> before the
  // wizard, starting Section 2. Section 3 = ISI (break before it here).
  sections: [
    { id: 'tf-hero', name: 'Banner + intro + how-to-submit', selector: 'div.treatmentform .cmp-treatment__banner', style: null, blocks: ['hero-hcp-internal', 'columns-form'], defaultContent: [] },
    { id: 'tf-isi', name: 'Important Safety Information', selector: 'div.responsivegrid.cmp-layout-isi__phone', style: null, blocks: ['fragment-isi'], defaultContent: [] },
  ],
};

// PARSER REGISTRY
const parsers = {
  'hero-hcp-internal': heroHcpInternalParser,
  'columns-form': columnsFormParser,
  'treatment-form': treatmentFormParser,
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

    // 3. Parse each block (skip elements already replaced by a prior parser).
    // Parse the hero first so its banner is consumed before treatment-form
    // removes the surrounding form scaffolding.
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
