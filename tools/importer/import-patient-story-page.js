/* eslint-disable */
/* global WebImporter */

// PARSER IMPORTS
import columnsTeaserParser from './parsers/columns-teaser.js';
import quotePatientParser from './parsers/quote-patient.js';
import cardsCtaParser from './parsers/cards-cta.js';
import fragmentIsiParser from './parsers/fragment-isi.js';

// TRANSFORMER IMPORTS
import cleanupTransformer from './transformers/northera-cleanup.js';
import sectionsTransformer from './transformers/northera-sections.js';

// PAGE TEMPLATE CONFIGURATION
const PAGE_TEMPLATE = {
  name: 'patient-story-page',
  description: 'Patient support "Every Patient Story Matters" page: an intro (H1 + paragraphs + hero image, default content) with a dark-blue "Increase / Empower" awareness band (columns-teaser) and an "Introducing Bob" patient quote banner (quote-patient: photo + pull-quote + attribution); then two quicklink CTA cards (cards-cta: symptom survey + real patient stories); then the shared ISI fragment.',
  urls: [
    'https://northera-stage.d.lundbeckus.com/patient-support/every-patient-story-matters',
  ],
  blocks: [
    {
      name: 'columns-teaser',
      instances: [
        '#patientbannertext.cmp-container',
      ],
    },
    {
      name: 'quote-patient',
      instances: [
        '#patient-banner.cmp-container',
      ],
    },
    {
      name: 'cards-cta',
      instances: [
        '.cmp-layout-quicklinks .image-text-cta',
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
    { id: 'eps-intro', name: 'Intro + awareness band + Bob quote', selector: '.responsivegrid.patient-story-page', style: null, blocks: ['columns-teaser', 'quote-patient'], defaultContent: [] },
    { id: 'eps-quicklinks', name: 'Quicklink CTA cards', selector: '.responsivegrid.cmp-layout-quicklinks', style: null, blocks: ['cards-cta'], defaultContent: [] },
    { id: 'eps-isi', name: 'Important Safety Information', selector: 'div.responsivegrid.cmp-layout-isi__phone', style: null, blocks: ['fragment-isi'], defaultContent: [] },
  ],
};

// PARSER REGISTRY
const parsers = {
  'columns-teaser': columnsTeaserParser,
  'quote-patient': quotePatientParser,
  'cards-cta': cardsCtaParser,
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

    // The source renders mobile-only duplicate copies of the awareness band and
    // the Bob quote (shown <768px, hidden on desktop). We import the desktop
    // teasers/banner and reproduce responsive layout in CSS, so remove the
    // mobile duplicates to avoid repeated content.
    main.querySelectorAll('#patientbannercontainer-mobile, #patientbannerbob-mob').forEach((el) => el.remove());

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
