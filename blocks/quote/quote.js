import { getBlockId, ensureDOMPurify } from '../../scripts/scripts.js';
import { DOMPURIFY } from '../../scripts/aem.js';

export default async function decorate(block) {
  const blockId = getBlockId('quote');
  block.setAttribute('id', blockId);
  block.setAttribute('aria-label', `quote-${blockId}`);
  block.setAttribute('role', 'region');
  block.setAttribute('aria-roledescription', 'Quote');

  const rows = [...block.children].map((c) => c.firstElementChild).filter(Boolean);

  // Optional patient photo rows (quote-patient variant): rows whose only content
  // is an image. Pull them out so the remaining rows are quotation +
  // attribution (backward compatible with the plain 2-row quote). The variant
  // may carry two crops — a mobile portrait and a wide desktop banner —
  // distinguished by the image alt ("… (desktop)"); each is class-tagged so the
  // block CSS shows the right one per breakpoint.
  const photos = [];
  for (let i = rows.length - 1; i >= 0; i -= 1) {
    const el = rows[i];
    if (el && el.querySelector('picture, img') && !el.textContent.trim()) {
      photos.unshift(rows.splice(i, 1)[0]);
    }
  }

  const [quotation, attribution] = rows;
  const blockquote = document.createElement('blockquote');
  // patient photos (if present) render with the quote; CSS handles placement
  photos.forEach((photo) => {
    const alt = (photo.querySelector('img')?.getAttribute('alt') || '').toLowerCase();
    const which = alt.includes('desktop') ? 'quote-photo-desktop' : 'quote-photo-mobile';
    photo.className = `quote-photo ${which}`;
    blockquote.append(photo);
  });
  // decorate quotation
  quotation.className = 'quote-quotation';
  blockquote.append(quotation);
  // decoration attribution
  if (attribution) {
    attribution.className = 'quote-attribution';
    blockquote.append(attribution);
    await ensureDOMPurify();
    const ems = attribution.querySelectorAll('em');
    ems.forEach((em) => {
      const cite = document.createElement('cite');
      cite.innerHTML = window.DOMPurify.sanitize(em.innerHTML, DOMPURIFY);
      em.replaceWith(cite);
    });
  }
  block.innerHTML = '';
  block.append(blockquote);
}
