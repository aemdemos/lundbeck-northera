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
  }
  if (contentRow) {
    const cell = contentRow.firstElementChild;
    if (cell) cell.classList.add('hero-hcp-internal-content');

    // the first image inside the content cell is the small circular icon.
    // The author markup can nest the icon <picture>, the <h1> and the CTA link
    // inside a single wrapping <p>; flatten so icon / title / CTA are direct
    // children of the flex content cell and can lay out side-by-side.
    const picture = contentRow.querySelector('picture');
    const h1 = contentRow.querySelector('h1');
    const cta = contentRow.querySelector('a');
    if (cell && picture) {
      const iconWrap = document.createElement('span');
      iconWrap.className = 'hero-hcp-internal-icon';
      iconWrap.append(picture);
      cell.prepend(iconWrap);
      if (h1) iconWrap.after(h1);
      if (cta) {
        const ctaP = cta.closest('p') || cta;
        cell.append(ctaP);
      }
      // remove any now-empty wrapper paragraphs left behind
      cell.querySelectorAll('p').forEach((p) => {
        if (!p.textContent.trim() && !p.querySelector('picture, img, a')) p.remove();
      });
    }
  }
}
