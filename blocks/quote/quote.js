import { getBlockId, ensureDOMPurify } from '../../scripts/scripts.js';
import { DOMPURIFY } from '../../scripts/aem.js';

export default async function decorate(block) {
  const blockId = getBlockId('quote');
  block.setAttribute('id', blockId);
  block.setAttribute('aria-label', `quote-${blockId}`);
  block.setAttribute('role', 'region');
  block.setAttribute('aria-roledescription', 'Quote');

  const rows = [...block.children].map((c) => c.firstElementChild).filter(Boolean);

  // Optional leading patient photo (quote-patient variant): a row whose only
  // content is an image. Pull it out so the remaining rows are quotation +
  // attribution (backward compatible with the plain 2-row quote).
  let photo = null;
  const photoIdx = rows.findIndex(
    (el) => el && el.querySelector('picture, img') && !el.textContent.trim(),
  );
  if (photoIdx !== -1) {
    [photo] = rows.splice(photoIdx, 1);
  }

  const [quotation, attribution] = rows;
  const blockquote = document.createElement('blockquote');
  // patient photo (if present) renders above the quotation
  if (photo) {
    photo.className = 'quote-photo';
    blockquote.append(photo);
  }
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
