/* eslint-disable */
/* global WebImporter */

/**
 * Parser: fragment-isi
 * Emits a Fragment block referencing the shared ISI fragment page
 * (/fragments/northera-isi) in place of inlining the full ISI content. This
 * keeps the Important Safety Information as a single source of truth: editing
 * the fragment updates every page that references it.
 *
 * The referenced fragment holds the `isi` block, which still renders the fixed
 * bottom bar (< 1200px) and right rail (>= 1200px) once inlined into the host
 * page's <main>.
 * Selector: div.responsivegrid.cmp-layout-isi__phone .experiencefragment
 * Generated: 2026-07-17
 */
const ISI_FRAGMENT_PATH = '/content/fragments/northera-isi';

export default function parse(element, { document }) {
  const link = document.createElement('a');
  link.setAttribute('href', ISI_FRAGMENT_PATH);
  link.textContent = ISI_FRAGMENT_PATH;

  const block = WebImporter.Blocks.createBlock(document, {
    name: 'Fragment',
    cells: [[link]],
  });
  element.replaceWith(block);
}
