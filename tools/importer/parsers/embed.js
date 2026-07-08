/* eslint-disable */
/* global WebImporter */
/**
 * Parser for embed (Brightcove video).
 * Base block: embed
 * Source: https://northera-stage.d.lundbeckus.com/about-northera/taking-northera
 * Generated: 2026-07-08
 *
 * Structure (Embed video): 1 column.
 *   Row 1: block name.
 *   Row 2: single cell containing an optional poster <img> above a link <a href> to the player URL.
 */
export default function parse(element, { document }) {
  // The Brightcove container carries the account / player / video-id data attributes.
  const container = element.querySelector('.brightcove-container, [data-video-id]');

  const account = container?.getAttribute('data-account') || '4804905851001';
  const player = container?.getAttribute('data-player') || 'zVTrglcf3';
  const videoId = container?.getAttribute('data-video-id') || '6068962892001';

  // Build the Brightcove iframe player URL from the data attributes.
  const playerUrl = `https://players.brightcove.com/${account}/${player}_default/index.html?videoId=${videoId}`;

  const contentCell = [];

  // Optional poster image (placed above the link, per the Embed video contract).
  const poster = container?.querySelector('video[poster]')?.getAttribute('poster');
  if (poster) {
    const img = document.createElement('img');
    img.src = poster;
    img.alt = '';
    contentCell.push(img);
  }

  // Link to the external player URL; link text is the URL itself.
  const link = document.createElement('a');
  link.href = playerUrl;
  link.textContent = playerUrl;
  contentCell.push(link);

  const cells = [];
  cells.push([contentCell]); // 1-column block: one row, one cell holding poster + link

  const block = WebImporter.Blocks.createBlock(document, { name: 'embed', cells });
  element.replaceWith(block);
}
