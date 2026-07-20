/* eslint-disable */
/* global WebImporter */

// PARSER IMPORTS
import dawBannerParser from './parsers/daw-banner.js';
import heroHcpParser from './parsers/hero-hcp.js';
import quoteGridParser from './parsers/quote-grid.js';
import fragmentIsiParser from './parsers/fragment-isi.js';

// TRANSFORMER IMPORTS
import cleanupTransformer from './transformers/northera-cleanup.js';
import sectionsTransformer from './transformers/northera-sections.js';

// PAGE TEMPLATE CONFIGURATION
const PAGE_TEMPLATE = {
  name: 'hcp-landing-page',
  description: 'HCP landing page: a blue "Dispense as written (DAW)" icon callout, a hero banner (flamingo/sky background with overlaid white heading + subhead + indication), a 3-up physician/patient quote grid with a footnote, then ISI content. The hero is desktop-only in the source; a matching responsive background handles mobile.',
  urls: [
    'https://northera-stage.d.lundbeckus.com/for-healthcare-professionals',
  ],
  blocks: [
    {
      name: 'daw-banner',
      instances: [
        '.write-daw',
      ],
    },
    {
      name: 'hero-hcp',
      instances: [
        '.lu-cmp-teaser.aem-GridColumn--phone--hide',
      ],
    },
    {
      name: 'quote-grid',
      instances: [
        '.cmp-layout__searchresult',
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
  sections: [
    { id: 'hcp-daw', name: 'Dispense as written callout', selector: '.write-daw', style: null, blocks: ['daw-banner'], defaultContent: [] },
    { id: 'hcp-hero', name: 'Hero banner', selector: '.lu-cmp-teaser.aem-GridColumn--phone--hide', style: null, blocks: ['hero-hcp'], defaultContent: [] },
    { id: 'hcp-quotes', name: 'Physician & patient quotes', selector: '.cmp-layout__searchresult', style: null, blocks: ['quote-grid'], defaultContent: [] },
    { id: 'hcp-isi', name: 'Important Safety Information', selector: 'div.responsivegrid.cmp-layout-isi__phone', style: null, blocks: ['fragment-isi'], defaultContent: [] },
  ],
};

// PARSER REGISTRY
const parsers = {
  'daw-banner': dawBannerParser,
  'hero-hcp': heroHcpParser,
  'quote-grid': quoteGridParser,
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

    // The hero exists twice in the source (a desktop "phone--hide" teaser and a
    // mobile "phone--none" teaser). We import the desktop one and reproduce
    // responsive art in CSS, so remove the mobile duplicate to avoid a repeat.
    main.querySelectorAll('.lu-cmp-teaser.aem-GridColumn--phone--none').forEach((el) => {
      if (/Distinctive\. Effective\. Focused\./i.test(el.textContent)) el.remove();
    });

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
