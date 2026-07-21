/**
 * hero-hcp — HCP landing hero banner. Two source layouts:
 *  - Mobile: the flamingo image as a top banner, then a text card below with a
 *    brand-blue heading + subhead + indication (dark text on white).
 *  - Desktop: a full-width flamingo background with white heading + subhead +
 *    indication overlaid on the lower-left.
 * The imported image is kept and shown inline on mobile; on desktop it is
 * hidden and the background art (from CSS tokens) provides the banner.
 *
 * Follows the Hero convention (background-image row + content row).
 *
 * @param {Element} block
 */
export default function decorate(block) {
  const rows = [...block.children];
  const contentRow = rows.find((r) => r.querySelector('h1, h2, h3, h4, h5, h6, p'));
  const imageRow = rows.find((r) => r !== contentRow && r.querySelector('picture, img'));

  if (imageRow) {
    imageRow.classList.add('hero-hcp-image');
  }
  if (contentRow) {
    const cell = contentRow.firstElementChild;
    if (cell) cell.classList.add('hero-hcp-content');
  }
}
