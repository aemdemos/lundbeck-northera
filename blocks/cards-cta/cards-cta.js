import { createOptimizedPicture } from '../../scripts/aem.js';
import { moveInstrumentation, getBlockId } from '../../scripts/scripts.js';
import { createCard } from '../card/card.js';

export default function decorate(block) {
  const blockId = getBlockId('cards-cta');
  block.setAttribute('id', blockId);
  block.setAttribute('aria-label', `Cards for ${blockId}`);
  block.setAttribute('role', 'region');
  block.setAttribute('aria-roledescription', 'Cards');

  /* change to ul, li */
  const ul = document.createElement('ul');
  [...block.children].forEach((row) => {
    ul.append(createCard(row));
  });
  ul.querySelectorAll('picture > img').forEach((img) => {
    const optimizedPic = createOptimizedPicture(img.src, img.alt, false, [{ width: '750' }]);
    moveInstrumentation(img, optimizedPic.querySelector('img'));
    img.closest('picture').replaceWith(optimizedPic);
  });

  /* Source parity: the entire banner card is clickable — clicking anywhere on
     it navigates to the card's CTA link. Mark the card as a link surface and
     forward clicks that aren't already on an interactive element. */
  ul.querySelectorAll(':scope > li').forEach((li) => {
    const cta = li.querySelector('a[href]');
    if (!cta) return;
    li.classList.add('cards-cta-linked');
    li.addEventListener('click', (e) => {
      if (e.target.closest('a, button')) return;
      cta.click();
    });
  });

  block.textContent = '';
  block.append(ul);
}
