/* eslint-disable */
/* global WebImporter */

// PARSER IMPORTS
import columnsBannerParser from './parsers/columns-banner.js';
import heroPatientParser from './parsers/hero-patient.js';
import cardsCtaParser from './parsers/cards-cta.js';

// TRANSFORMER IMPORTS
import northeraCleanupTransformer from './transformers/northera-cleanup.js';
import northeraSectionsTransformer from './transformers/northera-sections.js';

// PARSER REGISTRY
const parsers = {
  'columns-banner': columnsBannerParser,
  'hero-patient': heroPatientParser,
  'cards-cta': cardsCtaParser,
};

// PAGE TEMPLATE CONFIGURATION
const PAGE_TEMPLATE = {
  name: 'homepage',
  description: 'NORTHERA main homepage with banner, hero, CTA cards, and ISI content',
  urls: [
    'https://www.northera.com/'
  ],
  blocks: [
    {
      name: 'columns-banner',
      instances: ['.responsivegrid.ask-for-northera']
    },
    {
      name: 'hero-patient',
      instances: ['.random-hero.cmp-hero-banner__desktop']
    },
    {
      name: 'cards-cta',
      instances: ['.cmp-layout-quicklinks .image-text-cta']
    }
  ],
  sections: [
    {
      id: 'section-1',
      name: 'Ask for NORTHERA Banner',
      selector: '.responsivegrid.ask-for-northera',
      style: null,
      blocks: ['columns-banner'],
      defaultContent: []
    },
    {
      id: 'section-2',
      name: 'Hero with Patient Stories',
      selector: '.cmp-layout__herobanner',
      style: null,
      blocks: ['hero-patient'],
      defaultContent: ['.text.cmp-text__home_page']
    },
    {
      id: 'section-3',
      name: 'Quick Links Cards',
      selector: '.cmp-layout-quicklinks',
      style: 'dark-teal',
      blocks: ['cards-cta'],
      defaultContent: []
    },
    {
      id: 'section-4',
      name: 'ISI Reference Bar',
      selector: '.isi-mobile-wrap',
      style: null,
      blocks: [],
      defaultContent: ['.isi-mobile-wrap .cq-dd-fragment p']
    },
    {
      id: 'section-5',
      name: 'ISI Full Content',
      selector: '.cmp-layout-isi__phone',
      style: 'isi',
      blocks: [],
      defaultContent: ['.cmp-isi__use', '.cmp-isi__importantsafety', '.cmp-isi__warningbox']
    }
  ]
};

// TRANSFORMER REGISTRY
const transformers = [
  northeraCleanupTransformer,
  northeraSectionsTransformer,
];

/**
 * Execute all page transformers for a specific hook
 */
function executeTransformers(hookName, element, payload) {
  const enhancedPayload = {
    ...payload,
    template: PAGE_TEMPLATE,
  };

  transformers.forEach((transformerFn) => {
    try {
      transformerFn.call(null, hookName, element, enhancedPayload);
    } catch (e) {
      console.error(`Transformer failed at ${hookName}:`, e);
    }
  });
}

/**
 * Find all blocks on the page based on template configuration
 */
function findBlocksOnPage(document, template) {
  const pageBlocks = [];

  template.blocks.forEach((blockDef) => {
    blockDef.instances.forEach((selector) => {
      const elements = document.querySelectorAll(selector);
      elements.forEach((element) => {
        pageBlocks.push({
          name: blockDef.name,
          selector,
          element,
          section: blockDef.section || null,
        });
      });
    });
  });

  return pageBlocks;
}

export default {
  transform: (payload) => {
    const { document, url, params } = payload;
    const main = document.body;

    // 1. Execute beforeTransform transformers (initial cleanup)
    executeTransformers('beforeTransform', main, payload);

    // 2. Find blocks on page using embedded template
    const pageBlocks = findBlocksOnPage(document, PAGE_TEMPLATE);

    // 3. Parse each block using registered parsers
    pageBlocks.forEach((block) => {
      const parser = parsers[block.name];
      if (parser) {
        try {
          parser(block.element, { document, url, params });
        } catch (e) {
          console.error(`Failed to parse ${block.name} (${block.selector}):`, e);
        }
      }
    });

    // 4. Execute afterTransform transformers (final cleanup + section breaks)
    executeTransformers('afterTransform', main, payload);

    // 5. Apply WebImporter built-in rules
    const hr = document.createElement('hr');
    main.appendChild(hr);
    WebImporter.rules.createMetadata(main, document);
    WebImporter.rules.transformBackgroundImages(main, document);
    WebImporter.rules.adjustImageUrls(main, url, params.originalURL);

    // 6. Generate sanitized path
    const path = WebImporter.FileUtils.sanitizePath(
      new URL(params.originalURL).pathname.replace(/\/$/, '').replace(/\.html$/, '') || '/index'
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
