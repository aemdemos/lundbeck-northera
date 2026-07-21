/* eslint-disable */
/* global WebImporter */

// PARSER IMPORTS
import embedParser from './parsers/embed.js';
import accordionParser from './parsers/accordion.js';
import cardsSymptomsParser from './parsers/cards-symptoms.js';
import cardsStatsParser from './parsers/cards-stats.js';
import columnsSupineParser from './parsers/columns-supine.js';
import fragmentIsiParser from './parsers/fragment-isi.js';

// TRANSFORMER IMPORTS
import cleanupTransformer from './transformers/northera-cleanup.js';
import sectionsTransformer from './transformers/northera-sections.js';

// PAGE TEMPLATE CONFIGURATION
const PAGE_TEMPLATE = {
  name: 'symptomatic-noh-page',
  description: 'Symptomatic nOH patient page: a Brightcove explainer video + "Read the transcript" accordion, an "Understanding symptomatic nOH" Q&A (default content), a brand-blue "Common symptoms of nOH" band with 3 icon+title tiles (cards symptoms), a "Symptomatic nOH and associated conditions" section with 3 infographic stat tiles (cards stats), an "Understanding supine hypertension" section with a 2-item icon+caption row (columns supine), then the shared ISI fragment.',
  urls: [
    'https://northera-stage.d.lundbeckus.com/symptomatic-neurogenic-orthostatic-hypotension',
  ],
  blocks: [
    {
      name: 'embed',
      instances: [
        'div.brightcoveplayer',
      ],
    },
    {
      name: 'accordion',
      instances: [
        'div.accordion.panelcontainer',
        'div.cmp-accordion',
      ],
    },
    {
      name: 'cards-symptoms',
      instances: [
        'div.container.responsivegrid.cmp-carousel_bghdarkblue',
      ],
    },
    {
      name: 'cards-stats',
      instances: [
        'div.responsivegrid.symptomatic-noh-condition',
      ],
    },
    {
      name: 'columns-supine',
      instances: [
        // the desktop instance (default--10); the mobile dup is default--none
        'div.responsivegrid.reduce-hyp-risk.aem-GridColumn--default--10',
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
    { id: 'noh-video', name: 'Explainer video + transcript', selector: 'div.container.responsivegrid.cmp-video_bglightblue', style: null, blocks: ['embed', 'accordion'], defaultContent: [] },
    { id: 'noh-understanding', name: 'Understanding symptomatic nOH (Q&A)', selector: 'div.responsivegrid.understanding-symptomatic-noh', style: null, blocks: [], defaultContent: [] },
    { id: 'noh-symptoms', name: 'Common symptoms of nOH', selector: 'div.container.responsivegrid.cmp-carousel_bghdarkblue', style: 'noh-symptoms', blocks: ['cards-symptoms'], defaultContent: [] },
    { id: 'noh-conditions', name: 'Symptomatic nOH and associated conditions', selector: 'div.responsivegrid.cmp-teaser_rightborder', style: null, blocks: ['cards-stats'], defaultContent: [] },
    { id: 'noh-supine', name: 'Understanding supine hypertension', selector: 'div.container.responsivegrid.cmp-layout__reduce-the-risk', style: null, blocks: ['columns-supine'], defaultContent: [] },
    { id: 'noh-isi', name: 'Important Safety Information', selector: 'div.responsivegrid.cmp-layout-isi__phone', style: null, blocks: ['fragment-isi'], defaultContent: [] },
  ],
};

// PARSER REGISTRY
const parsers = {
  embed: embedParser,
  accordion: accordionParser,
  'cards-symptoms': cardsSymptomsParser,
  'cards-stats': cardsStatsParser,
  'columns-supine': columnsSupineParser,
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
