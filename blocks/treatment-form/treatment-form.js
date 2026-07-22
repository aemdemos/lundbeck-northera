/**
 * treatment-form — static visual replica of the source HCP "NORTHERA Treatment
 * Form" wizard. The live form collects PHI, runs backend step-validation, PDF
 * generation, session-timeout modals and (typically) reCAPTCHA — none of which
 * are migrated. This reproduces the source chrome only: the 6-step progress
 * bar, every labeled field (text/select/radio/checkbox/dosing tables), and the
 * BACK / NEXT / REVIEW buttons, with client-side step navigation (show/hide
 * only — nothing is submitted anywhere).
 *
 * The 189-field wizard is a fixed medical document, so its model lives in this
 * file (STEPS) rather than in authored content. The one portable, page-editable
 * row is:
 *   Row 1 (cta): H2 "There are 2 ways to proceed" + the two CTA links and their
 *                helper paragraphs.
 * The 6-step wizard is rendered by JS after this row. The blue fax callout and
 * "Please ensure the following" check-list live in a separate columns.form
 * block in the intro section above.
 *
 * @param {Element} block
 */

const US_STATES = [
  'Alabama', 'Alaska', 'Arizona', 'Arkansas', 'California', 'Colorado',
  'Connecticut', 'Delaware', 'District Of Columbia', 'Florida', 'Georgia',
  'Hawaii', 'Idaho', 'Illinois', 'Indiana', 'Iowa', 'Kansas', 'Kentucky',
  'Louisiana', 'Maine', 'Maryland', 'Massachusetts', 'Michigan', 'Minnesota',
  'Mississippi', 'Missouri', 'Montana', 'Nebraska', 'Nevada', 'New Hampshire',
  'New Jersey', 'New Mexico', 'New York', 'North Carolina', 'North Dakota',
  'Ohio', 'Oklahoma', 'Oregon', 'Pennsylvania', 'Puerto Rico', 'Rhode Island',
  'South Carolina', 'South Dakota', 'Tennessee', 'Texas', 'Utah', 'Vermont',
  'Virginia', 'Washington', 'West Virginia', 'Wisconsin', 'Wyoming',
];

const STEP_LABELS = [
  'PATIENT INFO', 'INSURANCE INFO', 'CLINICAL INFO', 'PRESCRIBER INFO',
  'INITIAL NORTHERA PRESCRIPTION INFO', 'GENERATE PDF',
];

// t=text, sel=US-state select, radio, check (single), checks (group), note,
// note-bold, sub (subheading), h4, h5, helper.
const STEPS = [
  {
    header: 'Patient contact information',
    helper: 'Complete all required and applicable fields below.',
    topNote: 'In adherence with privacy guidelines, this form will time out after 20 minutes. Please ensure you have uninterrupted time to complete this form. After completion, fax all pages to the NSC.',
    fields: [
      { t: 't', label: 'Patient First Name:', req: true },
      { t: 't', label: 'Patient Middle Name:' },
      { t: 't', label: 'Patient Last Name:', req: true },
      { t: 't', label: 'Patient Date of Birth:', req: true, caption: 'MM/DD/YYYY' },
      { t: 'radio', label: 'Patient Gender:', req: true, options: ['Male', 'Female'] },
      { t: 't', label: 'Patient Primary Language:' },
      {
        t: 't', label: 'Patient Primary Phone:', req: true, caption: '(XXX) XXX-XXXX', link: 'Why the Patient Primary Phone is important', sub: { t: 'radio', label: '', options: ['Home', 'Cell', 'Work'] },
      },
      {
        t: 't', label: 'Patient Secondary Phone:', caption: '(XXX) XXX-XXXX', sub: { t: 'radio', label: '', options: ['Home', 'Cell', 'Work'] },
      },
      { t: 'checks', label: 'Patient Preferred Contact Time:', options: ['Morning', 'Afternoon', 'Evening'] },
      { t: 't', label: 'Patient Email Address:', req: true },
      { t: 't', label: 'Patient Mailing Address:', req: true },
      { t: 't', label: 'City:', req: true },
      { t: 'sel', label: 'State:', req: true },
      { t: 't', label: 'ZIP:', req: true, caption: 'XXXXX' },
      { t: 'check', label: 'Your patient has authorized the following person to discuss treatment with the Northera Support Center:' },
      { t: 'radio', label: 'Is the patient currently in the hospital?', req: true, options: ['Yes', 'No'] },
    ],
  },
  {
    header: 'Patient insurance information',
    helper: "Attach copies of both sides of the patient's pharmacy benefit card(s) and/or insurance card(s) when you fax this form OR complete the following:",
    fields: [
      { t: 'check', label: "Check if you wish to manually enter the patient's insurance card information." },
      { t: 't', label: 'Patient Primary Insurance:', req: true },
      { t: 't', label: 'Patient Insurance Phone Number:', req: true, caption: '(XXX) XXX-XXXX' },
      { t: 't', label: 'Patient Insurance ID Number:', req: true },
      { t: 't', label: 'Patient Insurance Plan Number:' },
      { t: 't', label: 'Patient Insurance Group Number:' },
      { t: 't', label: 'Cardholder Name:' },
      { t: 'radio', label: 'Relationship to Cardholder:', options: ['Self', 'Spouse', 'Child', 'Other'] },
      { t: 'check', label: 'Check if no coverage.' },
    ],
  },
  {
    header: 'Clinical information',
    fields: [
      { t: 'radio', label: "Has a clinical evaluation of the patient's current medications been performed to evaluate for any medications that may precipitate hypotension?", options: ['Yes', 'No'] },
      { t: 't', label: 'Patient concomitant medications:' },
      { t: 't', label: 'Drug allergies:' },
      { t: 'check', label: 'No known drug allergies (NKDA)' },
      { t: 'radio', label: 'Does your patient have any known allergies?', req: true, options: ['Yes', 'No'], note: "If Yes, attach patient's current medications and known drug allergies." },
      { t: 'radio', label: 'Will the patient be monitored for supine hypertension prior to and during treatment?', options: ['Yes', 'No'] },
      { t: 'radio', label: 'Does the patient have any contraindications to the use of NORTHERA (eg, hypersensitivity to NORTHERA or any of its components)?', options: ['Yes', 'No'] },
      {
        t: 'radio',
        label: "What is the patient's primary diagnosis? (Check ONE of the following):",
        req: true,
        options: [
          "G20 Parkinson's disease (PD)",
          'G23.2 Striatonigral degeneration',
          'G90.3 Multi-system degeneration of the autonomic nervous system*',
          'G90.9 Disorder of the autonomic nervous system, unspecified*',
          'G99.0 Autonomic neuropathy in diseases classified elsewhere',
          'Dopamine beta-hydroxylase (DBH) deficiency — attach chart notes',
          'Non-diabetic autonomic neuropathy (NDAN) — attach chart notes',
          'Other (Include ICD code):',
        ],
        footnote: '*NORTHERA is not indicated for the treatment of symptomatic neurogenic orthostatic hypotension (nOH) caused by diabetic autonomic neuropathy.',
      },
      {
        t: 'checks',
        label: 'Symptomatic condition(s) (Check all that apply):',
        req: true,
        options: [
          'Neurogenic orthostatic hypotension (nOH)',
          'R42 Dizziness and giddiness',
          'I95.1 Orthostatic hypotension',
          'I95.89 Other hypotension',
          'R55 Syncope and collapse',
          'Other (Include ICD code):',
        ],
      },
      { t: 'sub', label: 'Treatment History:' },
      {
        t: 'radio',
        label: 'Has the patient tried and failed or is intolerant to midodrine?',
        options: ['Yes', 'No'],
      },
      {
        t: 'radio',
        label: 'Has the patient tried and failed or is intolerant to fludrocortisone?',
        options: ['Yes', 'No'],
      },
      {
        t: 'checks',
        label: 'Has the patient tried any of the following non-pharmacologic interventions? (Check all that apply):',
        options: [
          'Discontinuation of drugs, which can cause orthostatic hypotension '
            + '(eg, diuretics, antihypertensive medications [primarily sympathetic blockers], '
            + 'anti-anginal drugs [nitrates], alpha-adrenergic antagonists and antidepressants)',
          'Increased salt and water intake, if appropriate',
          'Raising the head of the bed 10 to 20 degrees',
          'Compression stockings',
          'Physical maneuvers to improve venous return',
          'Avoiding precipitating factors (eg, overexertion in hot weather, arising too quickly from supine to sitting or standing)',
          'Other:',
        ],
      },
      {
        t: 'note',
        label: 'REMEMBER: Patient clinical notes from up to the last three visits should be faxed along with the rest of the paperwork.',
      },
      {
        t: 'note-bold',
        label: 'Once you print the NORTHERA Treatment form, please provide the HIPAA release on page 1 for your patient or their caregiver to read and sign.',
      },
    ],
  },
  {
    header: 'Prescriber information',
    fields: [
      { t: 't', label: 'Prescriber Name:', req: true },
      { t: 't', label: 'NPI#:', req: true },
      { t: 't', label: 'State ID:', req: true },
      {
        t: 'checks',
        label: 'Prescriber Specialty:',
        req: true,
        options: ['Neurologist', 'Cardiologist', 'Nephrologist', 'Other:'],
      },
      { t: 't', label: 'Practice/Facility Name:' },
      { t: 't', label: 'Mailing Address:', req: true },
      { t: 't', label: 'City:', req: true },
      { t: 'sel', label: 'State:', req: true },
      { t: 't', label: 'ZIP:', req: true, caption: 'XXXXX' },
      { t: 't', label: 'Office Contact Name:', req: true },
      { t: 't', label: 'Office Contact Phone:', req: true, caption: '(XXX) XXX-XXXX' },
      { t: 't', label: 'Office Contact Fax:', req: true, caption: '(XXX) XXX-XXXX' },
      { t: 't', label: 'Office/Prescriber Email:' },
    ],
  },
  {
    header: 'Initial NORTHERA prescription information',
    intro: {
      h5: 'Select Titration Schedule',
      helper: 'You have the option to select a titration or fixed dosing schedule below '
        + 'that will be automatically populated into the treatment form. There will be an '
        + 'opportunity to review the form before printing. Alternatively, you can continue '
        + 'to generate the treatment form PDF by clicking the NEXT button and hand write '
        + 'the prescription information.',
    },
    fields: [
      {
        t: 'radio',
        label: 'Standard Titration Schedules',
        helper: 'Select a standard titration schedule from the options below to automatically fill out the treatment form.',
        options: [
          'Every 24 hrs titrate up 100 mg - start @100 mg, TID, QTY=495',
          'Every 48 hrs titrate up 100 mg - start @100 mg, TID, QTY=450',
        ],
        dispenseNote: 'Dispense: NORTHERA 100mg capsules (30-day supply)',
      },
      {
        t: 'radio',
        label: 'Custom Titration Schedule',
        helper: 'Select this option if the standard titration schedules do not meet the needs of your patient.',
        options: ['Custom Titration Schedule'],
        note: 'NORTHERA will be dispensed as 100 mg capsules (30-day supply). '
          + 'Sig: To be filled by the pharmacy to reflect indicated titration schedule. Refills = 0',
      },
      {
        t: 'radio',
        label: 'None - I wish to prescribe a fixed dosing schedule',
        options: ['None - I wish to prescribe a fixed dosing schedule'],
      },
      {
        t: 'check',
        label: 'Patient Dosing Guide (optional)',
        helper: 'Filling out this portion will provide a guide to helping your patient understand their NORTHERA titration schedule.',
      },
    ],
  },
  {
    header: 'Review the Treatment Form',
    content: [
      'This is a preview of the PDF you will fax to the Specialty Pharmacy.',
      'Please review below and ensure that all content is accurate, then click NEXT.',
    ],
    fields: [
      { t: 'check', label: 'The content on the form is accurate.', req: true },
    ],
    finalScreen: {
      h2: 'You are almost finished',
      notes: [
        'THE PROVIDER MUST SIGN THE PRESCRIPTION FORM BEFORE FAXING THE COMPLETED FORM. '
          + 'IN ADDITION, THE PATIENT OR THEIR CAREGIVER SHOULD SIGN THE HIPAA RELEASE '
          + 'TO ENSURE THAT THE NSC CAN CONTACT HIM OR HER DIRECTLY IF MORE INFORMATION IS NEEDED.',
        'TO ENSURE THE NSC CAN HELP PROVIDE MEDICATION TO YOUR PATIENT, PLEASE PRINT THE SIGNED NORTHERA TREATMENT FORM IN ITS ENTIRETY AND FAX ALL PAGES TO: 1-844-601-0102',
      ],
      checklist: [
        'The patient (or authorized representative) signed HIPAA release',
        'The completed and signed Initial NORTHERA Prescription Information Section. If you select the Custom Titration or the Fixed Dose Schedule, ensure ALL form fields are completed',
        'Patient clinical notes from up to the last three visits',
        "Front and back of patient's insurance card (if applicable)",
        'Obtain any incomplete but necessary information',
        'Clarify the prescription for the Specialty Pharmacy',
        'The NSC requires verbal confirmation of the delivery address from your patient prior to mailing his or her medication',
      ],
    },
  },
];

let uid = 0;
function nextId(prefix) {
  uid += 1;
  return `${prefix}-${uid}`;
}

function requiredMark() {
  const span = document.createElement('span');
  span.className = 'treatment-form-required';
  span.textContent = ' *';
  return span;
}

function fieldLabel(text, req) {
  const label = document.createElement('label');
  label.className = 'treatment-form-label';
  label.textContent = text;
  if (req) label.append(requiredMark());
  return label;
}

function caption(text) {
  const el = document.createElement('span');
  el.className = 'treatment-form-caption';
  el.textContent = text;
  return el;
}

function renderText(f) {
  const wrap = document.createElement('div');
  wrap.className = 'treatment-form-field';
  wrap.append(fieldLabel(f.label, f.req));
  if (f.link) {
    const a = document.createElement('a');
    a.href = '#';
    a.className = 'treatment-form-inline-link';
    a.textContent = f.link;
    a.addEventListener('click', (e) => e.preventDefault());
    wrap.append(a);
  }
  const input = document.createElement('input');
  input.type = 'text';
  input.className = 'treatment-form-input';
  input.setAttribute('aria-label', f.label.replace(/:$/, ''));
  wrap.append(input);
  if (f.caption) wrap.append(caption(f.caption));
  if (f.sub) wrap.append(renderRadio(f.sub, true)); // eslint-disable-line no-use-before-define
  return wrap;
}

function renderSelect(f) {
  const wrap = document.createElement('div');
  wrap.className = 'treatment-form-field';
  wrap.append(fieldLabel(f.label, f.req));
  const select = document.createElement('select');
  select.className = 'treatment-form-select';
  select.setAttribute('aria-label', f.label.replace(/:$/, ''));
  const first = document.createElement('option');
  first.textContent = 'Select State';
  first.value = '';
  select.append(first);
  US_STATES.forEach((s) => {
    const opt = document.createElement('option');
    opt.textContent = s;
    opt.value = s;
    select.append(opt);
  });
  wrap.append(select);
  return wrap;
}

function renderRadio(f, inline) {
  const wrap = document.createElement('div');
  wrap.className = 'treatment-form-field';
  if (f.label) {
    const p = document.createElement('p');
    p.className = 'treatment-form-prompt';
    p.textContent = f.label;
    if (f.req) p.append(requiredMark());
    wrap.append(p);
  }
  if (f.helper) {
    const h = document.createElement('p');
    h.className = 'treatment-form-helper';
    h.textContent = f.helper;
    wrap.append(h);
  }
  const group = document.createElement('div');
  group.className = inline ? 'treatment-form-options treatment-form-options-inline' : 'treatment-form-options';
  const name = nextId('radio');
  f.options.forEach((opt) => {
    const label = document.createElement('label');
    label.className = 'treatment-form-choice';
    const input = document.createElement('input');
    input.type = 'radio';
    input.name = name;
    const span = document.createElement('span');
    span.textContent = opt;
    label.append(input, span);
    group.append(label);
  });
  wrap.append(group);
  if (f.dispenseNote) {
    const dn = document.createElement('p');
    dn.className = 'treatment-form-dispense-note';
    dn.textContent = f.dispenseNote;
    wrap.append(dn);
  }
  if (f.note) {
    const n = document.createElement('p');
    n.className = 'treatment-form-note';
    n.textContent = f.note;
    wrap.append(n);
  }
  if (f.footnote) {
    const fn = document.createElement('p');
    fn.className = 'treatment-form-footnote';
    fn.textContent = f.footnote;
    wrap.append(fn);
  }
  return wrap;
}

function renderChecks(f) {
  const wrap = document.createElement('div');
  wrap.className = 'treatment-form-field';
  const p = document.createElement('p');
  p.className = 'treatment-form-prompt';
  p.textContent = f.label;
  if (f.req) p.append(requiredMark());
  wrap.append(p);
  const group = document.createElement('div');
  group.className = 'treatment-form-options';
  f.options.forEach((opt) => {
    const label = document.createElement('label');
    label.className = 'treatment-form-choice';
    const input = document.createElement('input');
    input.type = 'checkbox';
    const span = document.createElement('span');
    span.textContent = opt;
    label.append(input, span);
    group.append(label);
  });
  wrap.append(group);
  if (f.footnote) {
    const fn = document.createElement('p');
    fn.className = 'treatment-form-footnote';
    fn.textContent = f.footnote;
    wrap.append(fn);
  }
  return wrap;
}

function renderCheck(f) {
  const wrap = document.createElement('div');
  wrap.className = 'treatment-form-field';
  const label = document.createElement('label');
  label.className = 'treatment-form-choice';
  const input = document.createElement('input');
  input.type = 'checkbox';
  const span = document.createElement('span');
  span.textContent = f.label;
  if (f.req) span.append(requiredMark());
  label.append(input, span);
  wrap.append(label);
  if (f.helper) {
    const h = document.createElement('p');
    h.className = 'treatment-form-helper';
    h.textContent = f.helper;
    wrap.append(h);
  }
  return wrap;
}

function renderNote(f, bold) {
  const p = document.createElement('p');
  p.className = bold ? 'treatment-form-note treatment-form-note-bold' : 'treatment-form-note';
  p.textContent = f.label;
  return p;
}

function renderSub(f) {
  const h = document.createElement('h5');
  h.className = 'treatment-form-subheading';
  h.textContent = f.label;
  return h;
}

function renderField(f) {
  switch (f.t) {
    case 't': return renderText(f);
    case 'sel': return renderSelect(f);
    case 'radio': return renderRadio(f, false);
    case 'checks': return renderChecks(f);
    case 'check': return renderCheck(f);
    case 'note': return renderNote(f, false);
    case 'note-bold': return renderNote(f, true);
    case 'sub': return renderSub(f);
    default: return document.createElement('div');
  }
}

function buildProgressBar(current) {
  const wrap = document.createElement('div');
  wrap.className = 'treatment-form-progress';

  const desktop = document.createElement('ul');
  desktop.className = 'treatment-form-progress-desktop';
  STEP_LABELS.forEach((label, i) => {
    const li = document.createElement('li');
    if (i === current) li.classList.add('active');
    if (i < current) li.classList.add('done');
    li.textContent = label;
    desktop.append(li);
  });

  const mobile = document.createElement('ul');
  mobile.className = 'treatment-form-progress-mobile';
  STEP_LABELS.forEach((label, i) => {
    const li = document.createElement('li');
    if (i === current) li.classList.add('active');
    const num = document.createElement('span');
    num.textContent = `${i + 1}.`;
    li.append(num, document.createTextNode(label));
    mobile.append(li);
  });

  wrap.append(desktop, mobile);
  return wrap;
}

function buildStep(step, index) {
  const section = document.createElement('div');
  section.className = 'treatment-form-step';
  section.dataset.step = String(index);
  if (index !== 0) section.hidden = true;

  if (step.topNote) {
    const note = document.createElement('p');
    note.className = 'treatment-form-topnote';
    note.textContent = step.topNote;
    section.append(note);
  }
  const header = document.createElement('h2');
  header.className = 'treatment-form-step-header';
  header.textContent = step.header;
  section.append(header);
  if (step.helper) {
    const helper = document.createElement('p');
    helper.className = 'treatment-form-step-helper';
    helper.textContent = step.helper;
    section.append(helper);
  }
  if (step.intro) {
    const h5 = document.createElement('h5');
    h5.className = 'treatment-form-subheading';
    h5.textContent = step.intro.h5;
    const helper = document.createElement('p');
    helper.className = 'treatment-form-helper';
    helper.textContent = step.intro.helper;
    section.append(h5, helper);
  }
  if (step.content) {
    step.content.forEach((c) => {
      const p = document.createElement('p');
      p.className = 'treatment-form-step-helper';
      p.textContent = c;
      section.append(p);
    });
  }
  (step.fields || []).forEach((f) => section.append(renderField(f)));

  if (step.finalScreen) {
    const fs = document.createElement('div');
    fs.className = 'treatment-form-final';
    const h2 = document.createElement('h2');
    h2.className = 'treatment-form-step-header';
    h2.textContent = step.finalScreen.h2;
    fs.append(h2);
    step.finalScreen.notes.forEach((n) => {
      const h5 = document.createElement('h5');
      h5.className = 'treatment-form-final-note';
      h5.textContent = n;
      fs.append(h5);
    });
    const ul = document.createElement('ul');
    ul.className = 'treatment-form-checklist';
    step.finalScreen.checklist.forEach((item) => {
      const li = document.createElement('li');
      li.textContent = item;
      ul.append(li);
    });
    fs.append(ul);
    section.append(fs);
  }
  return section;
}

function buildNav(index, total, onBack, onNext) {
  const nav = document.createElement('div');
  nav.className = 'treatment-form-nav';
  const back = document.createElement('button');
  back.type = 'button';
  back.className = 'treatment-form-btn treatment-form-btn-back';
  back.textContent = 'BACK';
  back.disabled = index === 0;
  back.addEventListener('click', onBack);
  const next = document.createElement('button');
  next.type = 'button';
  next.className = 'treatment-form-btn treatment-form-btn-next';
  let nextLabel = 'NEXT';
  if (index === total - 2) {
    nextLabel = 'REVIEW';
  }
  next.textContent = nextLabel;
  next.addEventListener('click', onNext);
  nav.append(back, next);
  return nav;
}

function buildWizard() {
  const wizard = document.createElement('div');
  wizard.className = 'treatment-form-wizard';

  let current = 0;
  const progressHost = document.createElement('div');
  const stepsHost = document.createElement('div');
  stepsHost.className = 'treatment-form-steps';
  const navHost = document.createElement('div');

  const stepEls = STEPS.map((s, i) => buildStep(s, i));
  stepEls.forEach((el) => stepsHost.append(el));

  function render() {
    progressHost.textContent = '';
    progressHost.append(buildProgressBar(current));
    stepEls.forEach((el, i) => { el.hidden = i !== current; });
    navHost.textContent = '';
    navHost.append(buildNav(
      current,
      STEPS.length,
      () => { if (current > 0) { current -= 1; render(); wizard.scrollIntoView({ block: 'start' }); } },
      () => { if (current < STEPS.length - 1) { current += 1; render(); wizard.scrollIntoView({ block: 'start' }); } },
    ));
  }

  wizard.append(progressHost, stepsHost, navHost);
  render();
  return wizard;
}

function styleAuthoredRow(row, className) {
  // Unwrap the single-cell authoring wrapper and apply a semantic class.
  const cell = row.firstElementChild || row;
  cell.classList.add(className);
  return cell;
}

export default function decorate(block) {
  const rows = [...block.children];
  const container = document.createElement('div');
  container.className = 'treatment-form-container';

  // Row 1: entry CTAs (H2 + START/DOWNLOAD links + helper copy). The blue fax
  // callout + check-list are handled separately by the columns.form block above.
  const [ctaRow] = rows;

  const wizard = buildWizard();
  // The wizard (progress bar + form) is hidden until the "START THE ONLINE
  // TREATMENT FORM" CTA is clicked, matching the source flow (entry CTAs first,
  // then the first form page replaces them).
  wizard.hidden = true;

  let startLink;
  if (ctaRow) {
    const cta = styleAuthoredRow(ctaRow, 'treatment-form-cta');
    const paras = [...cta.querySelectorAll(':scope > p')];
    // A CTA paragraph that contains only a link is a solid button; a paragraph
    // with text (helper copy, possibly with an inline link) is not. Mark the
    // button anchors so CSS can style them distinctly from inline links.
    paras.forEach((p) => {
      const link = p.querySelector('a');
      const onlyLink = link && p.textContent.trim() === link.textContent.trim();
      if (onlyLink) link.classList.add('treatment-form-cta-button');
    });

    // Source groups each solid button with the helper copy that follows it into
    // a row (button left / helper right at desktop) and separates the two rows
    // with an "or" divider (a horizontal line broken by a small pill). Rebuild
    // that structure: a new row opens at every button paragraph and absorbs the
    // following helper paragraph(s) until the next button.
    const ctaRows = [];
    let currentRow = null;
    paras.forEach((p) => {
      if (p.querySelector('a.treatment-form-cta-button')) {
        currentRow = document.createElement('div');
        currentRow.className = 'treatment-form-cta-row';
        ctaRows.push(currentRow);
      }
      if (currentRow) currentRow.append(p);
    });
    ctaRows.forEach((row, i) => {
      if (i > 0) {
        const divider = document.createElement('div');
        divider.className = 'treatment-form-cta-divider';
        const pill = document.createElement('span');
        pill.textContent = 'or';
        divider.append(pill);
        cta.append(divider);
      }
      cta.append(row);
    });

    // The START link (href "#treatment-form") reveals the wizard in place of the
    // entry CTAs. The DOWNLOAD link is a real PDF and is left as a normal link.
    startLink = cta.querySelector('a[href$="#treatment-form"]')
      || cta.querySelector('.treatment-form-cta-button');
    if (startLink) {
      startLink.addEventListener('click', (e) => {
        e.preventDefault();
        // Source flow: the form takes over the page. Hide the entry CTAs and the
        // whole intro section above (hero banner + intro copy + fax callout), so
        // only the wizard remains.
        cta.hidden = true;
        wizard.hidden = false;
        const section = block.closest('.section');
        const introSection = section?.previousElementSibling;
        if (introSection?.classList.contains('section')) introSection.hidden = true;
        wizard.scrollIntoView({ block: 'start' });
      });
    }
    container.append(cta);
  }

  container.append(wizard);

  block.textContent = '';
  block.append(container);
}
