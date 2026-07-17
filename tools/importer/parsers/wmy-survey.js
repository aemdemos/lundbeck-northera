/* eslint-disable */
/* global WebImporter */

/**
 * Parser: wmy-survey
 * Static visual replica of the "What Moves You" survey form. Extracts the
 * required-fields note, text-field labels, the checkbox group (prompt +
 * options), the free-text question prompts, and the consent line (with its
 * Privacy Policy link) into a predictable block table. The live reCAPTCHA /
 * backend submit is NOT migrated.
 * Selector: form (inside .cmp-layout__whatyouknow .formcontainer)
 * Generated: 2026-07-17
 */

function normalizeHref(raw) {
  if (!raw) return '';
  try {
    const u = new URL(raw, 'https://northera-stage.d.lundbeckus.com');
    if (/(^|\.)northera-stage\.d\.lundbeckus\.com$/.test(u.hostname)) {
      return `${u.pathname}${u.search}${u.hash}`;
    }
    u.username = '';
    u.password = '';
    return u.toString();
  } catch (e) {
    return raw;
  }
}

export default function parse(element, { document }) {
  const form = element.matches('form') ? element : element.querySelector('form');
  if (!form) {
    element.replaceWith(document.createTextNode(''));
    return;
  }

  const cells = [];

  // Row 1: required-fields note.
  const note = [...form.querySelectorAll('p')].find((p) => /Required fields/i.test(p.textContent));
  cells.push([note ? note.textContent.trim() : '*Required fields.']);

  // Row 2: text-field labels, pipe-joined (First / Last / Phone / Email).
  const labels = [...form.querySelectorAll('input[type="text"], input[type="email"], input[type="tel"]')]
    .map((inp) => {
      const wrap = inp.closest('div');
      const lbl = wrap && (wrap.querySelector('label, .cmp-form-text__label, span'));
      return (lbl ? lbl.textContent : (inp.getAttribute('placeholder') || inp.name)).trim();
    })
    .filter(Boolean);
  cells.push([labels.join(' | ')]);

  // Row 3: checkbox group — prompt paragraph + one option per line.
  const checkboxes = [...form.querySelectorAll('input[type="checkbox"]')];
  const groupCell = document.createElement('div');
  if (checkboxes.length) {
    // The prompt is the paragraph immediately preceding the first checkbox group.
    const firstGroup = checkboxes[0].closest('div');
    let promptEl = firstGroup;
    while (promptEl && !(promptEl.previousElementSibling && /\?/.test(promptEl.previousElementSibling.textContent))) {
      promptEl = promptEl.parentElement;
      if (promptEl === form) { promptEl = null; break; }
    }
    const promptText = promptEl && promptEl.previousElementSibling
      ? promptEl.previousElementSibling.textContent.trim()
      : '*Do you have any of the following nervous system disorders?';
    const pp = document.createElement('p');
    pp.textContent = promptText;
    groupCell.appendChild(pp);
    checkboxes.forEach((cb) => {
      const label = cb.closest('label, div');
      const text = label ? label.textContent.trim() : '';
      if (text) {
        const li = document.createElement('p');
        li.textContent = text;
        groupCell.appendChild(li);
      }
    });
  }
  cells.push([groupCell]);

  // Rows 4..n: free-text question prompts (each preceding a <textarea> that is
  // not the hidden reCAPTCHA response field).
  const textareas = [...form.querySelectorAll('textarea')]
    .filter((t) => !/recaptcha|captcha/i.test(t.name || ''));
  textareas.forEach((ta) => {
    // The textarea lives in a `.text` wrapper. Its preceding siblings are:
    //   [prompt .text div] , [counter .section div] , [this .text div].
    // So the prompt is the nearest preceding sibling (walking back) whose text
    // is NOT the character counter. Fall back to any preceding paragraph.
    const wrap = ta.closest('.text') || ta.closest('div');
    let promptText = '';
    let sib = wrap ? wrap.previousElementSibling : null;
    while (sib) {
      const t = sib.textContent.trim();
      if (t && !/You have used .* characters/i.test(t)) { promptText = t; break; }
      sib = sib.previousElementSibling;
    }
    if (promptText) {
      const cell = document.createElement('div');
      const p = document.createElement('p');
      p.textContent = promptText;
      cell.appendChild(p);
      cells.push([cell]);
    }
  });

  // Last row: consent paragraph (with Privacy Policy link).
  const consent = [...form.querySelectorAll('p')].find((p) => /By clicking SUBMIT/i.test(p.textContent));
  const consentCell = document.createElement('div');
  if (consent) {
    const p = document.createElement('p');
    p.innerHTML = consent.innerHTML;
    p.querySelectorAll('a[href]').forEach((a) => a.setAttribute('href', normalizeHref(a.getAttribute('href') || a.href || '')));
    consentCell.appendChild(p);
  }
  cells.push([consentCell]);

  const block = WebImporter.Blocks.createBlock(document, { name: 'wmy-survey', cells });

  // Replace the whole form container so residual hidden inputs / reCAPTCHA are
  // dropped. Preserve the heading + intro that live above the form.
  const container = form.closest('.formcontainer') || form;
  container.replaceWith(block);
}
