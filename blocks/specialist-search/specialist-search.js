/**
 * specialist-search — static visual replica of the source Google Maps ZIP
 * lookup widget. The live map search is not migrated; this renders the same
 * chrome (helper line, ZIP field, Terms checkbox, SEARCH NOW button) so the
 * page matches the source visually.
 *
 * Authoring rows (one cell each):
 *   1. helper line
 *   2. ZIP field placeholder
 *   3. Terms & Conditions acknowledgement (may contain a link)
 *   4. submit button label
 *
 * @param {Element} block
 */
export default function decorate(block) {
  const rows = [...block.children];
  const [helperRow, placeholderRow, termsRow, buttonRow] = rows;

  const helper = helperRow ? helperRow.textContent.trim() : '';
  const placeholder = placeholderRow ? placeholderRow.textContent.trim() : '';
  const buttonLabel = buttonRow ? buttonRow.textContent.trim() : '';
  // preserve the Terms link markup authored in the fragment
  const termsContent = termsRow ? termsRow.querySelector(':scope > div') || termsRow : null;

  const form = document.createElement('div');
  form.className = 'specialist-search-form';

  if (helper) {
    const p = document.createElement('p');
    p.className = 'specialist-search-helper';
    p.textContent = helper;
    form.append(p);
  }

  const field = document.createElement('div');
  field.className = 'specialist-search-field';

  const input = document.createElement('input');
  input.type = 'text';
  input.className = 'specialist-search-zip';
  input.setAttribute('maxlength', '5');
  input.setAttribute('autocomplete', 'off');
  if (placeholder) input.setAttribute('placeholder', placeholder);
  input.setAttribute('aria-label', placeholder || 'ZIP code');
  field.append(input);

  if (termsContent) {
    const terms = document.createElement('label');
    terms.className = 'specialist-search-terms';
    const checkbox = document.createElement('input');
    checkbox.type = 'checkbox';
    checkbox.className = 'specialist-search-checkbox';
    const mark = document.createElement('span');
    mark.className = 'specialist-search-checkmark';
    const text = document.createElement('span');
    text.className = 'specialist-search-terms-text';
    while (termsContent.firstChild) text.append(termsContent.firstChild);
    terms.append(checkbox, mark, text);
    field.append(terms);
  }

  if (buttonLabel) {
    const button = document.createElement('button');
    button.type = 'button';
    button.className = 'specialist-search-submit';
    button.textContent = buttonLabel;
    field.append(button);
  }

  form.append(field);

  block.textContent = '';
  block.append(form);
}
