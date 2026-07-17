import { createOptimizedPicture } from '../../scripts/aem.js';

/**
 * cards-video — a grid of video thumbnail cards (source: .cmp-videothumbnail).
 * Each card is a thumbnail image plus a heading, wrapped in a single link that
 * points to the video experience fragment. 1 column on mobile, 2 columns on
 * tablet/desktop.
 *
 * Expected authoring row (one per card):
 *   [ picture ] | [ heading + link ]
 * The heading text and the link href are read from the body cell; the whole
 * card becomes clickable.
 *
 * @param {Element} block
 */
export default function decorate(block) {
  const ul = document.createElement('ul');

  [...block.children].forEach((row) => {
    const cells = [...row.children];
    const imageCell = cells.find((c) => c.querySelector('picture'));
    const bodyCell = cells.find((c) => c !== imageCell) || cells[cells.length - 1];

    const link = bodyCell ? bodyCell.querySelector('a[href]') : null;
    const href = link ? link.getAttribute('href') : null;
    const heading = bodyCell ? bodyCell.querySelector('h2, h3, h4') : null;
    const headingText = (link ? link.textContent : (heading ? heading.textContent : '')).trim();

    const li = document.createElement('li');
    const anchor = document.createElement('a');
    anchor.className = 'cards-video-link';
    if (href) anchor.setAttribute('href', href);

    if (imageCell) {
      const pic = imageCell.querySelector('picture');
      if (pic) {
        const thumb = document.createElement('div');
        thumb.className = 'cards-video-thumb';
        thumb.append(pic);
        anchor.append(thumb);
      }
    }

    const desc = document.createElement('div');
    desc.className = 'cards-video-body';
    const h = document.createElement('h3');
    h.textContent = headingText;
    desc.append(h);
    anchor.append(desc);

    li.append(anchor);
    ul.append(li);
  });

  ul.querySelectorAll('picture > img').forEach((img) => {
    const optimizedPic = createOptimizedPicture(img.src, img.alt, false, [{ width: '750' }]);
    img.closest('picture').replaceWith(optimizedPic);
  });

  block.textContent = '';
  block.append(ul);
}
