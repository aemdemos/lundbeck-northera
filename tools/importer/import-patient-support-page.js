/* eslint-disable */
/* global WebImporter */

// PARSER IMPORTS
import cardsResourceParser from './parsers/cards-resource.js';
import cardsCtaParser from './parsers/cards-cta.js';
import isiParser from './parsers/isi.js';

// TRANSFORMER IMPORTS
import cleanupTransformer from './transformers/northera-cleanup.js';
import sectionsTransformer from './transformers/northera-sections.js';

// PAGE TEMPLATE CONFIGURATION
const PAGE_TEMPLATE = {
  name: 'patient-support-page',
  description: 'Patient support / resources landing: hero title + NSC intro, a grid of resource-download cards (PDF thumbnail + title + description + CTA), a full-width "Real patient stories" quicklink card, and ISI content.',
  urls: [
    'https://northera-stage.d.lundbeckus.com/patient-support',
  ],
  blocks: [
    {
      name: 'cards-resource',
      instances: [
        '.cmp-layout__patientsupport .cmp-imagetext__link',
      ],
      section: 'resource',
    },
    {
      name: 'cards-cta',
      instances: [
        '.cmp-layout-quicklinks .image-text-cta',
      ],
    },
    {
      name: 'isi',
      instances: [
        'div.responsivegrid.cmp-layout-isi__phone .experiencefragment',
        'div.cmp-isi__use',
      ],
    },
  ],
  sections: [
    { id: 'ps-resources', name: 'Resources created with you in mind (intro + resource cards)', selector: '.cmp-layout__patientsupport', style: null, blocks: ['cards-resource'], defaultContent: [] },
    { id: 'ps-stories', name: 'Real patient stories', selector: '.cmp-layout-quicklinks', style: null, blocks: ['cards-cta'], defaultContent: [] },
    { id: 'ps-isi', name: 'Important Safety Information', selector: 'div.responsivegrid.cmp-layout-isi__phone', style: null, blocks: ['isi'], defaultContent: [] },
  ],
};

// PARSER REGISTRY
const parsers = {
  'cards-resource': cardsResourceParser,
  'cards-cta': cardsCtaParser,
  isi: isiParser,
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
