import { getBlockId } from '../../scripts/scripts.js';
import { decorateCellClass } from '../../scripts/utils.js';

export default function decorate(block) {
  decorateCellClass(block);

  const blockId = getBlockId('columns-quote');
  block.setAttribute('id', blockId);
  block.setAttribute('aria-label', `columns-quote-${blockId}`);
  block.setAttribute('role', 'region');
  block.setAttribute('aria-roledescription', 'Quotes');

  const cols = [...block.firstElementChild.children];
  block.classList.add(`columns-quote-${cols.length}-cols`);

  // each column is a quote card: first paragraph = quotation, rest = attribution
  cols.forEach((col) => {
    [...col.querySelectorAll(':scope > p')].forEach((p, i) => {
      p.classList.add(i === 0 ? 'columns-quote-quotation' : 'columns-quote-attribution');
    });
  });
}
