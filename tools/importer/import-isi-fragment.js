/* eslint-disable */
/* global WebImporter */

// PARSER IMPORTS
import isiParser from './parsers/isi.js';

// TRANSFORMER IMPORTS
import cleanupTransformer from './transformers/northera-cleanup.js';

/**
 * Shared ISI fragment importer.
 *
 * Produces a single reusable fragment page at /fragments/northera-isi that
 * holds ONLY the Important Safety Information (isi) block. Every content page
 * then references this fragment (via the Fragment block) instead of inlining
 * the ISI, so the safety copy has a single source of truth.
 *
 * The isi block itself (blocks/isi/isi.js) still renders the fixed bottom bar
 * (< 1200px) and right rail (>= 1200px); when the fragment is inlined into a
 * host page's <main>, the block decorates exactly as it does today.
 */
const PAGE_TEMPLATE = {
  name: 'isi-fragment',
  description: 'Shared Important Safety Information fragment (USE + IMPORTANT SAFETY INFORMATION). Referenced by all content pages via the Fragment block.',
  urls: [
    'https://northera-stage.d.lundbeckus.com/what-moves-you',
  ],
  blocks: [
    {
      name: 'isi',
      instances: [
        'div.responsivegrid.cmp-layout-isi__phone .experiencefragment',
      ],
    },
  ],
  // Single block, no section breaks needed.
  sections: [],
};

const parsers = {
  isi: isiParser,
};

// Only cleanup runs (removes header/footer/modals/etc.); no section transformer
// since the fragment is a single block.
const transformers = [cleanupTransformer];

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
        if (seen.has(element)) return;
        seen.add(element);
        pageBlocks.push({ name: blockDef.name, selector, element });
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

    executeTransformers('beforeTransform', main, payload);

    const pageBlocks = findBlocksOnPage(document, PAGE_TEMPLATE);
    pageBlocks.forEach((block) => {
      if (!block.element.parentNode) return;
      const parser = parsers[block.name];
      if (parser) {
        try {
          parser(block.element, { document, url, params });
        } catch (e) {
          console.error(`Failed to parse ${block.name} (${block.selector}):`, e);
        }
      }
    });

    executeTransformers('afterTransform', main, payload);

    // Keep only the parsed ISI block; drop everything else so the fragment page
    // contains just the ISI block (no header/footer/other content).
    const isiTable = main.querySelector('table');
    const cleanMain = document.createElement('main');
    if (isiTable) {
      cleanMain.appendChild(isiTable);
    }

    // No createMetadata — a fragment carries no page-level metadata, only the
    // ISI block. Still normalize any image URLs in the ISI content.
    WebImporter.rules.transformBackgroundImages(cleanMain, document);
    WebImporter.rules.adjustImageUrls(cleanMain, url, params.originalURL);

    // Force the fragment output path regardless of the source URL.
    const path = '/fragments/northera-isi';

    return [{
      element: cleanMain,
      path,
      report: {
        title: 'Northera ISI Fragment',
        template: PAGE_TEMPLATE.name,
        blocks: pageBlocks.map((b) => b.name),
      },
    }];
  },
};
