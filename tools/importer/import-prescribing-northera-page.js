/* eslint-disable */
/* global WebImporter */

// PARSER IMPORTS
import heroHcpInternalParser from './parsers/hero-hcp-internal.js';
import cardsBenefitParser from './parsers/cards-benefit.js';
import cardsPharmacyParser from './parsers/cards-pharmacy.js';
import dawBannerLightParser from './parsers/daw-banner-light.js';
import columnsContactParser from './parsers/columns-contact.js';
import fragmentIsiParser from './parsers/fragment-isi.js';

// TRANSFORMER IMPORTS
import cleanupTransformer from './transformers/northera-cleanup.js';
import sectionsTransformer from './transformers/northera-sections.js';

// PAGE TEMPLATE CONFIGURATION
const PAGE_TEMPLATE = {
  name: 'prescribing-northera-page',
  description: 'HCP "Prescribing NORTHERA" page: an internal-page icon hero banner, an H3 intro, a two-option prescribing comparison (NSC benefit cards + a "Start the treatment form" CTA vs specialty-pharmacy logo cards, with an "or" divider and a StarterRx footnote), a light-tint "Dispense as written" callout banner, a prior-authorization / CoverMyMeds section (headings + two icon+text contact items + logo + references), then the shared ISI fragment.',
  urls: [
    'https://northera-stage.d.lundbeckus.com/for-healthcare-professionals/prescribing-northera',
  ],
  blocks: [
    {
      name: 'hero-hcp-internal',
      instances: [
        'div.lu-cmp-teaser.aem-GridColumn--phone--hide .cmp-teaser.bannericondesktopinternal-cta-3309f33ce2',
      ],
    },
    {
      name: 'cards-benefit',
      instances: [
        'div.responsivegrid.cmp-layout_prescribing_options__teaser__right .lu-cmp-teaser',
      ],
    },
    {
      name: 'cards-pharmacy',
      instances: [
        'div.responsivegrid.cmp-layout_prescribing_options__teaser:not(.cmp-layout_prescribing_options__teaser__right) .lu-cmp-teaser',
      ],
    },
    {
      name: 'daw-banner-light',
      instances: [
        'div.responsivegrid.ask-for-northera',
      ],
    },
    {
      name: 'columns-contact',
      instances: [
        'div.responsivegrid.cmp-layout__two__imagetext',
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
    { id: 'presc-hero', name: 'HCP internal-page banner', selector: 'div.lu-cmp-teaser.aem-GridColumn--phone--hide', style: null, blocks: ['hero-hcp-internal'], defaultContent: [] },
    { id: 'presc-choose', name: 'Choose the option heading', selector: 'div#text-6b7309ab70.cmp-text', style: null, blocks: [], defaultContent: [] },
    { id: 'presc-options', name: 'Prescribing options comparison', selector: 'div.responsivegrid.cmp-layout_prescribing_options__teaser__right', style: null, blocks: ['cards-benefit', 'cards-pharmacy'], defaultContent: [] },
    { id: 'presc-daw', name: 'Why "Dispense as written" matters', selector: 'div.responsivegrid.ask-for-northera', style: null, blocks: ['daw-banner-light'], defaultContent: [] },
    { id: 'presc-pa', name: 'Prior authorization (CoverMyMeds)', selector: 'div#northeramedicare.cmp-container', style: null, blocks: ['columns-contact'], defaultContent: [] },
    { id: 'presc-isi', name: 'Important Safety Information', selector: 'div.responsivegrid.cmp-layout-isi__phone', style: null, blocks: ['fragment-isi'], defaultContent: [] },
  ],
};

// PARSER REGISTRY
const parsers = {
  'hero-hcp-internal': heroHcpInternalParser,
  'cards-benefit': cardsBenefitParser,
  'cards-pharmacy': cardsPharmacyParser,
  'daw-banner-light': dawBannerLightParser,
  'columns-contact': columnsContactParser,
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
    // mobile "phone--none" teaser nested within it). We import the desktop one
    // and reproduce responsive art in CSS, so remove the mobile duplicate to
    // avoid a repeat. Match on the mobile-only H1 text.
    main.querySelectorAll('.lu-cmp-teaser.aem-GridColumn--default--hide .cmp-teaser.bannericonmobileinternal-cta-7313956251').forEach((el) => {
      const wrapper = el.closest('.lu-cmp-teaser.aem-GridColumn--default--hide');
      (wrapper || el).remove();
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
