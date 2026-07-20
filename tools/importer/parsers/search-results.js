/* eslint-disable */
/* global WebImporter */

/**
 * Parser: search-results
 * Replaces the source dynamic search widget (backend-powered query + results
 * overlay) with the EDS `search-results` block. Per the block convention the
 * block has a single column: the block-name row plus one row holding a link to
 * the query index the block searches. The block's JS builds the search box +
 * results list and queries that index.
 * Selector: div.responsivegrid.cmp-layout__searchresult form.component
 * Generated: 2026-07-20
 */
const QUERY_INDEX = '/query-index.json';

export default function parse(element, { document }) {
  const link = document.createElement('a');
  link.setAttribute('href', QUERY_INDEX);
  link.textContent = QUERY_INDEX;

  const block = WebImporter.Blocks.createBlock(document, {
    name: 'search-results',
    cells: [[link]],
  });
  element.replaceWith(block);
}
