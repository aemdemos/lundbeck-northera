/**
 * loads and decorates the hero-patient block
 * @param {Element} block The hero-patient block element
 */
export default function decorate(block) {
  const rows = [...block.children];
  rows.forEach((row) => {
    const cells = [...row.children];
    if (cells.length > 0) {
      cells[0].classList.add('hero-patient-content');
    }
  });
}
