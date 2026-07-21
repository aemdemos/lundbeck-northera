import { getBlockId } from '../../scripts/scripts.js';
import { decorateCellClass } from '../../scripts/utils.js';

/**
 * columns-oh-types — three side-by-side "blue card" columns listing the types
 * of orthostatic hypotension (Neurogenic / Iatrogenic / Non-neurogenic).
 * Each column = a heading on a dark-blue band + a list of causes on a light-blue
 * card. Base block: columns.
 *
 * @param {Element} block
 */
export default function decorate(block) {
  decorateCellClass(block);

  const blockId = getBlockId('columns-oh-types');
  block.setAttribute('id', blockId);
  block.setAttribute('aria-label', `columns-oh-types-${blockId}`);
  block.setAttribute('role', 'region');
  block.setAttribute('aria-roledescription', 'Columns');

  const cols = [...block.firstElementChild.children];
  block.classList.add(`columns-oh-types-${cols.length}-cols`);
}
