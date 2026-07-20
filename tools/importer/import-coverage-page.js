/* eslint-disable */
/* global WebImporter */

// PARSER IMPORTS
import tableCompareParser from './parsers/table-compare.js';
import columnsContactParser from './parsers/columns-contact.js';
import fragmentIsiParser from './parsers/fragment-isi.js';

// TRANSFORMER IMPORTS
import cleanupTransformer from './transformers/northera-cleanup.js';
import sectionsTransformer from './transformers/northera-sections.js';

// PAGE TEMPLATE CONFIGURATION
const PAGE_TEMPLATE = {
  name: 'coverage-page',
  description: 'Patient support "Coverage for NORTHERA" page: a Prescription Insurance Coverage section (H1 + intro + a Medicare-vs-Commercial comparison table [table-compare] + commercial-insurance paragraphs), a Medicare Extra Help section (heading + list + two contact columns [columns-contact: Online / Phone]), a legal disclaimer (default content), then the shared ISI fragment.',
  urls: [
    'https://northera-stage.d.lundbeckus.com/patient-support/coverage-for-northera',
  ],
  blocks: [
    {
      name: 'table-compare',
      instances: [
        '.cmp-text__table.aem-GridColumn--phone--hide table',
      ],
    },
    {
      name: 'columns-contact',
      instances: [
        '#northeramedicare .cmp-layout__two__imagetext',
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
    { id: 'cov-coverage', name: 'Prescription Insurance Coverage (intro + comparison table)', selector: '#northeracoverage.cmp-container', style: null, blocks: ['table-compare'], defaultContent: [] },
    { id: 'cov-medicare', name: 'Medicare Extra Help (+ contact columns)', selector: '#northeramedicare.cmp-container', style: null, blocks: ['columns-contact'], defaultContent: [] },
    { id: 'cov-info', name: 'Legal disclaimer', selector: '#coverageinfo.cmp-container', style: null, blocks: [], defaultContent: [] },
    { id: 'cov-isi', name: 'Important Safety Information', selector: 'div.responsivegrid.cmp-layout-isi__phone', style: null, blocks: ['fragment-isi'], defaultContent: [] },
  ],
};

// PARSER REGISTRY
const parsers = {
  'table-compare': tableCompareParser,
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

    // The comparison table renders as ONE 2-col table ≥768px but splits into two
    // stacked single-col tables <768px. Import the desktop single table and
    // remove the mobile-split duplicates to avoid repeated/partial tables.
    main.querySelectorAll('.cmp-text__table.aem-GridColumn--default--hide').forEach((el) => el.remove());

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
