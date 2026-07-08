/* eslint-disable */
/* global WebImporter */

// PARSER IMPORTS
import embedParser from './parsers/embed.js';
import accordionParser from './parsers/accordion.js';
import quoteParser from './parsers/quote.js';
import cardsParser from './parsers/cards.js';
import isiParser from './parsers/isi.js';

// TRANSFORMER IMPORTS
import cleanupTransformer from './transformers/northera-cleanup.js';
import sectionsTransformer from './transformers/northera-sections.js';

// PAGE TEMPLATE CONFIGURATION - Embedded from page-templates.json
const PAGE_TEMPLATE = {
  name: 'content-page',
  description: 'Standard patient content page: hero/title + intro, Brightcove video with transcript accordion, image+text blocks, patient quote, icon step callouts (reminders), and safety/ISI content.',
  urls: [
    'https://northera-stage.d.lundbeckus.com/about-northera/taking-northera',
  ],
  blocks: [
    {
      name: 'embed',
      instances: [
        'div.container.responsivegrid.cmp-video_bglightblue',
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
      name: 'quote',
      instances: [
        'div.cmp-imagetext__verticalmiddle div.cmp-text',
      ],
    },
    {
      name: 'cards',
      instances: [
        'div#importantreminders.cmp-container',
        'div.cmp-image__textlist.cmp-layout-imagetext_teaser',
      ],
      section: 'image-left',
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
    { id: 'rc2-intro-titration', name: 'Page intro + What is titration', selector: 'div.responsivegrid.taking-northera', style: null, blocks: [], defaultContent: [] },
    { id: 'rc2-video-transcript', name: 'Titration explainer video + Read the transcript', selector: 'div.container.responsivegrid.cmp-video_bglightblue.cmp-videobutton__center', style: null, blocks: ['embed', 'accordion'], defaultContent: [] },
    { id: 'rc2-patient-quote', name: 'Patient quote (Gail)', selector: 'div.responsivegrid.cmp-imagetext__verticalmiddle', style: null, blocks: ['quote'], defaultContent: [] },
    { id: 'rc2-capsules-imagetext', name: 'Capsules image + text; How will I know', selector: 'div#container-fb2722e6a6.cmp-container', style: null, blocks: [], defaultContent: [] },
    { id: 'rc2-important-reminders', name: 'Important reminders when taking NORTHERA', selector: 'div#importantreminders.cmp-container', style: null, blocks: ['cards'], defaultContent: [] },
    { id: 'rc2-safety-side-effects', name: 'NORTHERA safety and side effects', selector: 'div.responsivegrid.cmp-bullet__list', style: null, blocks: [], defaultContent: [] },
    { id: 'rc2-isi', name: 'Important Safety Information', selector: 'div.responsivegrid.cmp-layout-isi__phone', style: null, blocks: ['isi'], defaultContent: [] },
  ],
};

// PARSER REGISTRY
const parsers = {
  embed: embedParser,
  accordion: accordionParser,
  quote: quoteParser,
  cards: cardsParser,
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
