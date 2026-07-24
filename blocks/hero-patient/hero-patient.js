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

  // Art direction: the image row may carry two pictures — the first is the
  // portrait mobile banner, the second the widescreen desktop (≥768px) banner.
  // Tag each so CSS can show the right one per breakpoint. A single image keeps
  // its default behaviour (shown at all breakpoints).
  const imageRow = rows.find((row) => row.querySelector('picture'));
  if (imageRow) {
    const pictures = [...imageRow.querySelectorAll('picture')];
    if (pictures.length > 1) {
      pictures[0].classList.add('hero-patient-image-mobile');
      pictures.slice(1).forEach((pic) => pic.classList.add('hero-patient-image-desktop'));
    }
  }
}
