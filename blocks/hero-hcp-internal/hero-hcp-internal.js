import { buildPictureContentFromImageCell, collectBlockCellImageSources } from '../../scripts/utils.js';

/**
 * hero-hcp-internal — internal-page (e.g. About Northera) icon banner.
 * Source is the AEM "bannericon" teaser: a full-width sky/blue banner image with
 * a small circular icon, a single H1, and (mobile only) a yellow CTA button
 * overlaid on the lower-left. Distinct from hero-hcp (the HCP-landing hero which
 * has a subhead + indication paragraph and no icon/CTA button).
 *
 * Follows the Hero convention:
 *   row 1 (image): the banner background art (shown inline on mobile, hidden on
 *                  desktop where CSS provides the background image)
 *   row 2 (content): icon image + H1 (+ optional CTA link)
 *
 * @param {Element} block
 */
export default function decorate(block) {
  const rows = [...block.children];
  const contentRow = rows.find((r) => r.querySelector('h1, h2, h3, h4, h5, h6'));
  const imageRow = rows.find((r) => r !== contentRow && r.querySelector('picture, img'));

  if (imageRow) {
    imageRow.classList.add('hero-hcp-internal-image');

    const imageCell = imageRow.firstElementChild;
    if (imageCell && collectBlockCellImageSources(imageCell).length > 1) {
      const built = buildPictureContentFromImageCell(imageCell);
      imageCell.replaceChildren(built);
    }
  }
  if (contentRow) {
    const cell = contentRow.firstElementChild;
    if (cell) cell.classList.add('hero-hcp-internal-content');

    // the first image inside the content cell is the small circular icon
    const icon = contentRow.querySelector('img');
    if (icon) {
      const iconWrap = icon.closest('p, div') || icon.parentElement;
      if (iconWrap) iconWrap.classList.add('hero-hcp-internal-icon');
    }
  }
}
