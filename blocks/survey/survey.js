/**
 * Multi-step survey / quiz block (also renders the /results page).
 *
 * Authoring — quiz page (one row per step):
 *   [ prompt (+ optional help paragraph) ] | [ checkbox|radio ] | [ options list ]
 *
 * Authoring — results page (one row per question, prompt only):
 *   [ question prompt ]
 *
 * Heading + intro live in the section above the block.
 * Quiz submit saves answers to sessionStorage and navigates to sibling /results.
 */

import { decorateExternalLinks } from '../../scripts/scripts.js';
import { PDFDocument, rgb, StandardFonts } from '../../scripts/pdf-lib.esm.min.js';

const SURVEY_STORAGE_KEY = 'northera-survey-results';

const ANSWER_SLOTS = [
  { x: 110.8, y: 601.7, maxWidth: 440, maxLines: 4 },
  { x: 110.8, y: 516.6, maxWidth: 440, maxLines: 3 },
  { x: 110.8, y: 450.2, maxWidth: 440, maxLines: 5 },
  { x: 110.8, y: 337.8, maxWidth: 440, maxLines: 4 },
];

const ANSWER_COLOR = rgb(0x24 / 255, 0x57 / 255, 0x78 / 255);
const ANSWER_SIZE = 10;
const ANSWER_LEADING = 13;

function isResultsPage() {
  return /\/results\/?$/.test(window.location.pathname);
}

function surveyPageUrl() {
  const { pathname } = window.location;
  return pathname.replace(/\/results\/?$/, '') || '/';
}

function resultsPageUrl() {
  const { pathname } = window.location;
  const path = pathname.endsWith('/') ? pathname.slice(0, -1) : pathname;
  return `${path}/results`;
}

function readStoredResults() {
  try {
    const raw = sessionStorage.getItem(SURVEY_STORAGE_KEY);
    if (!raw) return null;
    const data = JSON.parse(raw);
    if (!data?.questions?.length) return null;
    return data;
  } catch {
    return null;
  }
}

function answersBody(questions) {
  return questions.map((q) => {
    const answers = (q.answers || []).join(', ') || '—';
    return `${q.prompt}\n${answers}`;
  }).join('\n\n');
}

function wrapLine(text, font, size, maxWidth) {
  const words = String(text).split(/\s+/).filter(Boolean);
  if (words.length === 0) return [''];
  const lines = [];
  let current = words[0];
  for (let i = 1; i < words.length; i += 1) {
    const next = `${current} ${words[i]}`;
    if (font.widthOfTextAtSize(next, size) <= maxWidth) {
      current = next;
    } else {
      lines.push(current);
      current = words[i];
    }
  }
  lines.push(current);
  return lines;
}

function toPdfText(text) {
  return String(text)
    .replace(/[\u2018\u2019]/g, "'")
    .replace(/[\u201C\u201D]/g, '"')
    .replace(/[\u2013\u2014]/g, '-')
    .replace(/\u2026/g, '...')
    .replace(/\u00AE/g, '(R)')
    .replace(/[^\t\n\r\x20-\x7E]/g, '?');
}

function answerLinesForQuestion(question, font, slot) {
  const answers = question.answers?.length ? question.answers : ['No answer selected'];
  const lines = [];
  answers.forEach((answer) => {
    wrapLine(toPdfText(answer), font, ANSWER_SIZE, slot.maxWidth).forEach((line) => {
      if (lines.length < slot.maxLines) lines.push(line);
    });
  });
  return lines;
}

async function downloadResultsPdf(questions) {
  const base = window.hlx?.codeBasePath || '';
  const templateUrl = `${base}/resources/survey/symptomchecker-template.pdf`;
  const response = await fetch(templateUrl);
  if (!response.ok) {
    throw new Error(`Unable to load results PDF template (${response.status})`);
  }

  const templateBytes = await response.arrayBuffer();
  const pdfDoc = await PDFDocument.load(templateBytes);
  const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
  const page = pdfDoc.getPages()[0];

  questions.slice(0, ANSWER_SLOTS.length).forEach((question, index) => {
    const slot = ANSWER_SLOTS[index];
    const lines = answerLinesForQuestion(question, font, slot);
    lines.forEach((line, lineIndex) => {
      page.drawText(line, {
        x: slot.x,
        y: slot.y - (lineIndex * ANSWER_LEADING),
        size: ANSWER_SIZE,
        font,
        color: ANSWER_COLOR,
        maxWidth: slot.maxWidth,
      });
    });
  });

  const pdfBytes = await pdfDoc.save();
  const blob = new Blob([pdfBytes], { type: 'application/pdf' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'symptomchecker.pdf';
  a.rel = 'noopener';
  document.body.append(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}

function wireHeroActions(section, questions) {
  if (!section) return;

  section.classList.add('survey-results-hero');

  const paragraphs = [...section.querySelectorAll('p')];
  paragraphs.forEach((p) => {
    const text = p.textContent.trim().toUpperCase();
    const link = p.querySelector('a');

    if (text === 'DOWNLOAD AND PRINT MY RESULTS' || text.startsWith('DOWNLOAD AND PRINT')) {
      const btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'survey-results-download cmp-button';
      btn.textContent = 'DOWNLOAD AND PRINT MY RESULTS';
      btn.addEventListener('click', async () => {
        try {
          await downloadResultsPdf(questions);
        } catch (err) {
          // eslint-disable-next-line no-console
          console.error(err);
          window.print();
        }
      });
      p.replaceWith(btn);
      return;
    }

    if (link && /email my results/i.test(link.textContent || text)) {
      const btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'survey-results-email cmp-button';
      btn.textContent = 'EMAIL MY RESULTS';
      btn.addEventListener('click', () => {
        const subject = 'Symptomatic nOH Survey: my results';
        const body = answersBody(questions);
        window.location.href = `mailto:?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
      });
      p.replaceWith(btn);
      return;
    }

    if (link && /prescribing information/i.test(link.textContent || '')) {
      link.classList.add('survey-results-pi');
    }
  });

  decorateExternalLinks(section);

  const actions = [...section.querySelectorAll('button.survey-results-download, button.survey-results-email')];
  if (actions.length) {
    const wrap = document.createElement('div');
    wrap.className = 'survey-results-actions';
    actions[0].before(wrap);
    actions.forEach((btn) => wrap.append(btn));
  }
}

function buildResultItem(question, index, authoredPrompt) {
  const item = document.createElement('div');
  item.className = 'survey-results-item';

  const inner = document.createElement('div');
  inner.className = 'survey-results-item-inner';

  const numberCol = document.createElement('div');
  numberCol.className = 'survey-results-number-col';
  const number = document.createElement('span');
  number.className = 'survey-results-number';
  number.textContent = String(index + 1);
  numberCol.append(number);

  const content = document.createElement('div');
  content.className = 'survey-results-content';

  const questionWrap = document.createElement('div');
  questionWrap.className = 'survey-results-question';
  const q = document.createElement('p');
  q.textContent = authoredPrompt || question.prompt;
  questionWrap.append(q);

  const answerWrap = document.createElement('div');
  answerWrap.className = 'survey-results-answer';
  const answers = question.answers?.length ? question.answers : ['No answer selected'];
  answers.forEach((label) => {
    const span = document.createElement('span');
    span.textContent = label;
    answerWrap.append(span);
  });

  content.append(questionWrap, answerWrap);
  inner.append(numberCol, content);
  item.append(inner);
  return item;
}

function decorateResults(block) {
  const data = readStoredResults();
  if (!data) {
    window.location.replace(surveyPageUrl());
    return;
  }

  const authoredPrompts = [...block.children].map((row) => {
    const cell = row.children[0] || row;
    return cell.textContent.trim();
  }).filter(Boolean);

  block.classList.add('survey-results');

  const section = block.closest('.section');
  section?.classList.add('survey-results-container');
  const hero = section?.previousElementSibling;
  if (hero?.classList.contains('section')) {
    wireHeroActions(hero, data.questions);
  }

  const list = document.createElement('div');
  list.className = 'survey-results-list';
  data.questions.forEach((question, index) => {
    list.append(buildResultItem(question, index, authoredPrompts[index]));
  });

  block.textContent = '';
  block.append(list);
}

function buildProgress(count) {
  const wrap = document.createElement('div');
  wrap.className = 'survey-progress';

  const before = document.createElement('div');
  before.className = 'survey-progress-before';
  const after = document.createElement('div');
  after.className = 'survey-progress-after';

  const nav = document.createElement('ol');
  nav.className = 'survey-progress-container';
  for (let i = 0; i < count; i += 1) {
    const step = document.createElement('li');
    step.className = 'survey-progress-step';
    step.dataset.step = String(i + 1);
    step.textContent = String(i + 1);
    nav.append(step);
  }

  wrap.append(before, nav, after);
  return wrap;
}

function buildScaleLabelText(label) {
  const text = document.createElement('span');
  text.className = 'survey-option-text';
  const colonIdx = label.indexOf(': ');
  if (colonIdx > -1) {
    const bold = document.createElement('b');
    bold.textContent = `${label.slice(0, colonIdx + 1)} `;
    text.append(bold, document.createTextNode(label.slice(colonIdx + 2)));
  } else {
    text.textContent = label;
  }
  return text;
}

function buildOptionItem(question, index, optIndex, label) {
  const groupName = `survey-question-${index + 1}`;
  const id = `${groupName}-opt-${optIndex + 1}`;
  const isScaleStep = index === 1;

  const item = document.createElement('li');
  item.className = 'survey-option';

  const inner = document.createElement('div');
  inner.className = 'survey-option-inner';

  const input = document.createElement('input');
  input.type = question.type;
  input.name = groupName;
  input.id = id;
  input.value = label;

  const optLabel = document.createElement('label');
  optLabel.setAttribute('for', id);
  const box = document.createElement('span');
  box.className = 'survey-option-box';
  optLabel.append(box);

  const text = isScaleStep ? buildScaleLabelText(label) : (() => {
    const span = document.createElement('span');
    span.className = 'survey-option-text';
    span.textContent = label;
    return span;
  })();

  inner.append(input, optLabel, text);
  item.append(inner);
  return item;
}

function buildOptions(question, index) {
  const list = document.createElement('ul');
  list.className = 'survey-options';

  question.options.forEach((label, optIndex) => {
    list.append(buildOptionItem(question, index, optIndex, label));
  });

  return list;
}

function distributeOptionsIntoColumns(list, columnCount) {
  const items = [...list.children];
  if (items.length === 0) return list;

  const grid = document.createElement('div');
  grid.className = 'survey-options-grid';
  const columnLists = Array.from({ length: columnCount }, () => {
    const col = document.createElement('div');
    col.className = 'survey-options-col';
    const ul = document.createElement('ul');
    ul.className = 'survey-options';
    col.append(ul);
    grid.append(col);
    return ul;
  });

  items.forEach((item, i) => {
    columnLists[i % columnCount].append(item);
  });

  list.replaceWith(grid);
  return grid;
}

function scrollToTop() {
  window.scrollTo(0, 0);
}

function decorateQuiz(block) {
  const rows = [...block.children];
  if (rows.length === 0) return;

  const questions = rows.map((row) => {
    const cells = [...row.children];
    const promptCell = cells[0];
    const typeCell = cells[1];
    const optionsCell = cells[2];

    const paragraphs = [...promptCell.querySelectorAll('p')];
    const prompt = paragraphs[0] ? paragraphs[0].textContent.trim() : promptCell.textContent.trim();
    const help = paragraphs[1] ? paragraphs[1].textContent.trim() : '';

    const rawType = (typeCell ? typeCell.textContent : '').trim().toLowerCase();
    const type = rawType === 'radio' ? 'radio' : 'checkbox';

    const options = optionsCell
      ? [...optionsCell.querySelectorAll('li')].map((li) => li.textContent.trim()).filter(Boolean)
      : [];

    return { prompt, help, type, options };
  }).filter((q) => q.options.length > 0);

  block.textContent = '';

  if (questions.length === 0) return;

  const section = block.closest('.section');
  const intro = section?.previousElementSibling;
  if (intro?.classList.contains('section')) {
    intro.classList.add('survey-intro');
  }
  section?.classList.add('survey-container');

  block.append(buildProgress(questions.length));

  const panel = document.createElement('div');
  panel.className = 'survey-panel';
  block.append(panel);

  const steps = questions.map((question, index) => {
    const step = document.createElement('div');
    step.className = 'survey-step';
    step.dataset.step = String(index + 1);

    const prompt = document.createElement('p');
    prompt.className = 'survey-question';
    prompt.textContent = question.prompt;
    step.append(prompt);

    if (question.help) {
      const help = document.createElement('p');
      help.className = 'survey-help';
      help.textContent = question.help;
      step.append(help);
    }

    const list = buildOptions(question, index);
    if (index === 2 || index === 3) {
      step.append(distributeOptionsIntoColumns(list, 3));
    } else {
      step.append(list);
    }

    panel.append(step);
    return step;
  });

  const controls = document.createElement('div');
  controls.className = 'survey-controls';
  const back = document.createElement('button');
  back.type = 'button';
  back.className = 'survey-back';
  back.textContent = 'BACK';
  const next = document.createElement('button');
  next.type = 'button';
  next.className = 'survey-next cmp-button';
  next.textContent = 'NEXT';
  const submit = document.createElement('button');
  submit.type = 'button';
  submit.className = 'survey-submit cmp-button';
  submit.textContent = 'VIEW YOUR RESULTS';
  submit.hidden = true;
  controls.append(back, next, submit);
  panel.append(controls);

  const progress = block.querySelector('.survey-progress');
  const progressSteps = [...block.querySelectorAll('.survey-progress-step')];
  let current = 0;

  const updateProgressTrack = () => {
    if (!progress) return;
    progress.classList.toggle('survey-progress-complete', current === questions.length - 1);
  };

  const currentHasSelection = () => {
    const step = steps.at(current);
    if (!step) return false;
    return [...step.querySelectorAll('input')].some((input) => input.checked);
  };

  const updateButtons = () => {
    const onLast = current === questions.length - 1;
    back.disabled = current === 0;
    next.hidden = onLast;
    submit.hidden = !onLast;
    const activeBtn = onLast ? submit : next;
    activeBtn.disabled = !currentHasSelection();
  };

  const render = () => {
    steps.forEach((step, i) => step.classList.toggle('active', i === current));
    progressSteps.forEach((step, i) => {
      step.classList.toggle('active', i === current);
      step.classList.toggle('done', i < current);
    });
    updateProgressTrack();
    updateButtons();
  };

  const selectionsFor = (index) => {
    const step = steps.at(index);
    if (!step) return [];
    return [...step.querySelectorAll('input:checked')].map((input) => input.value);
  };

  const goToResults = () => {
    const payload = {
      questions: questions.map((question, index) => ({
        prompt: question.prompt,
        answers: selectionsFor(index),
      })),
    };
    sessionStorage.setItem(SURVEY_STORAGE_KEY, JSON.stringify(payload));
    window.location.assign(resultsPageUrl());
  };

  steps.forEach((step) => {
    step.addEventListener('change', () => updateButtons());
  });

  back.addEventListener('click', () => {
    if (current > 0) {
      current -= 1;
      render();
      scrollToTop();
    }
  });

  next.addEventListener('click', () => {
    if (!currentHasSelection()) return;
    if (current < questions.length - 1) {
      current += 1;
      render();
      scrollToTop();
    }
  });

  submit.addEventListener('click', () => {
    if (!currentHasSelection()) return;
    goToResults();
  });

  render();
}

export default function decorate(block) {
  if (isResultsPage()) {
    decorateResults(block);
    return;
  }
  decorateQuiz(block);
}
