/**
 * wmy-survey — static visual replica of the source "What Moves You" survey
 * form. The live form collects PII, uses reCAPTCHA, and POSTs to Lundbeck's
 * backend; that is NOT migrated. This reproduces the source chrome only:
 * required-fields note, text inputs, a checkbox group, free-text questions with
 * character counters, a consent line, and the SUBMIT button.
 *
 * Authoring rows (one cell each), in order:
 *   1. required-fields note
 *   2. text field labels (one per line, pipe- or newline-separated)
 *   3. checkbox group: prompt on first line, options on following lines
 *   4..n. free-text questions (each: prompt line; may contain a Privacy link)
 *   last. consent paragraph (contains the Privacy Policy link) + submit label
 *
 * To keep this robust to authoring, the parser emits a predictable structure;
 * this decorate reads that structure by row class hints it sets.
 *
 * @param {Element} block
 */

function textField(labelText) {
  const wrap = document.createElement('div');
  wrap.className = 'wmy-survey-field';
  const label = document.createElement('label');
  label.className = 'wmy-survey-label';
  label.textContent = labelText;
  const input = document.createElement('input');
  input.type = 'text';
  input.className = 'wmy-survey-input';
  input.setAttribute('aria-label', labelText.replace(/^\*/, ''));
  wrap.append(label, input);
  return wrap;
}

function checkboxGroup(prompt, options) {
  const wrap = document.createElement('div');
  wrap.className = 'wmy-survey-field';
  const p = document.createElement('p');
  p.className = 'wmy-survey-prompt';
  p.textContent = prompt;
  wrap.append(p);
  const group = document.createElement('div');
  group.className = 'wmy-survey-checkboxes';
  options.forEach((opt) => {
    const label = document.createElement('label');
    label.className = 'wmy-survey-checkbox';
    const cb = document.createElement('input');
    cb.type = 'checkbox';
    const span = document.createElement('span');
    span.textContent = opt;
    label.append(cb, span);
    group.append(label);
  });
  wrap.append(group);
  return wrap;
}

const MAX_CHARS = 2000;

function counterText(used) {
  return `You have used ${used} of ${MAX_CHARS} characters`;
}

function textarea(promptEl) {
  const wrap = document.createElement('div');
  wrap.className = 'wmy-survey-field';
  const p = document.createElement('p');
  p.className = 'wmy-survey-prompt';
  // preserve any inline markup (e.g. links) from the authored prompt
  p.innerHTML = promptEl.innerHTML;

  // The textarea + counter share a positioned wrapper so the counter can sit
  // at the bottom-right, overlaid on the textarea (matching the source).
  const box = document.createElement('div');
  box.className = 'wmy-survey-textarea-box';
  const ta = document.createElement('textarea');
  ta.className = 'wmy-survey-textarea';
  ta.setAttribute('maxlength', String(MAX_CHARS));
  ta.setAttribute('aria-label', promptEl.textContent.trim());
  const counter = document.createElement('span');
  counter.className = 'wmy-survey-counter';
  counter.textContent = counterText(0);
  // Live count as the user types.
  ta.addEventListener('input', () => {
    counter.textContent = counterText(ta.value.length);
  });
  box.append(ta, counter);

  wrap.append(p, box);
  return wrap;
}

export default function decorate(block) {
  const rows = [...block.children];
  const form = document.createElement('div');
  form.className = 'wmy-survey-form';

  // Row 0: required-fields note. Row 1: text-field labels (pipe/newline list).
  // Row 2: checkbox group (first line prompt, rest options).
  // Middle rows: free-text prompts. Last row: consent + submit label.
  const noteRow = rows[0];
  if (noteRow) {
    const note = document.createElement('p');
    note.className = 'wmy-survey-note';
    note.textContent = noteRow.textContent.trim();
    form.append(note);
  }

  const labelsRow = rows[1];
  if (labelsRow) {
    labelsRow.textContent.split('|').map((s) => s.trim()).filter(Boolean)
      .forEach((label) => form.append(textField(label)));
  }

  const checkboxRow = rows[2];
  if (checkboxRow) {
    const lines = [...checkboxRow.querySelectorAll('p, li')].map((el) => el.textContent.trim()).filter(Boolean);
    const [prompt, ...opts] = lines;
    if (prompt) form.append(checkboxGroup(prompt, opts));
  }

  // Free-text question rows: rows 3 .. n-1 (each holds one prompt paragraph).
  const consentRow = rows[rows.length - 1];
  rows.slice(3, rows.length - 1).forEach((row) => {
    const promptEl = row.querySelector('p') || row;
    form.append(textarea(promptEl));
  });

  // Consent + submit.
  if (consentRow) {
    const consent = document.createElement('p');
    consent.className = 'wmy-survey-consent';
    const consentP = consentRow.querySelector('p') || consentRow;
    consent.innerHTML = consentP.innerHTML;
    form.append(consent);
  }
  const submit = document.createElement('button');
  submit.type = 'button';
  submit.className = 'wmy-survey-submit';
  submit.textContent = 'SUBMIT';
  form.append(submit);

  block.textContent = '';
  block.append(form);
}
