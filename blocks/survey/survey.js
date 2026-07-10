/**
 * Multi-step survey / quiz block.
 *
 * Authoring contract (one row per block table):
 *   Row 1 (intro):    [ heading + intro paragraph ] | (empty) | (empty)
 *   Rows 2..n (step): [ prompt (+ optional help paragraph) ] | [ checkbox|radio ] | [ options list ]
 *
 * The last cell of each question row holds a <ul> whose items are the answer
 * options. Cell 2 holds the single word "checkbox" (multi-select) or "radio"
 * (single-select). One question is shown at a time with BACK / NEXT navigation
 * and a numbered progress indicator; the final step swaps NEXT for a
 * "VIEW YOUR RESULTS" action.
 */

function buildProgress(count) {
  const nav = document.createElement('ol');
  nav.className = 'survey-progress';
  for (let i = 0; i < count; i += 1) {
    const step = document.createElement('li');
    step.className = 'survey-progress-step';
    step.textContent = String(i + 1);
    nav.append(step);
  }
  return nav;
}

function buildOptions(question, index) {
  const list = document.createElement('ul');
  list.className = 'survey-options';
  const groupName = `survey-question-${index + 1}`;

  question.options.forEach((label, optIndex) => {
    const item = document.createElement('li');
    item.className = 'survey-option';

    const id = `${groupName}-opt-${optIndex + 1}`;
    const input = document.createElement('input');
    input.type = question.type;
    input.name = groupName;
    input.id = id;
    input.value = label;

    const optLabel = document.createElement('label');
    optLabel.setAttribute('for', id);

    // custom visual box (native input is visually hidden); checkmark drawn in CSS
    const box = document.createElement('span');
    box.className = 'survey-option-box';

    const text = document.createElement('span');
    text.className = 'survey-option-text';
    text.textContent = label;

    optLabel.append(box, text);
    item.append(input, optLabel);
    list.append(item);
  });

  return { list, groupName };
}

export default function decorate(block) {
  const rows = [...block.children];
  if (rows.length === 0) return;

  // Row 1 is the intro (heading + paragraph); it always shows above the steps.
  const [introRow, ...questionRows] = rows;
  const intro = document.createElement('div');
  intro.className = 'survey-intro';
  while (introRow.firstElementChild) {
    const cell = introRow.firstElementChild;
    while (cell.firstElementChild) intro.append(cell.firstElementChild);
    cell.remove();
  }

  // Parse each question row into { prompt, help, type, options }.
  const questions = questionRows.map((row) => {
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
  block.append(intro);

  if (questions.length === 0) return;

  block.append(buildProgress(questions.length));

  const panel = document.createElement('div');
  panel.className = 'survey-panel';
  block.append(panel);

  // Build every step once; toggle visibility with the active step index.
  const steps = questions.map((question, index) => {
    const step = document.createElement('div');
    step.className = 'survey-step';

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

    const { list } = buildOptions(question, index);
    step.append(list);
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
  next.className = 'survey-next';
  next.textContent = 'NEXT';
  controls.append(back, next);
  block.append(controls);

  const progress = block.querySelector('.survey-progress');
  const progressSteps = [...block.querySelectorAll('.survey-progress-step')];
  let current = 0;

  const render = () => {
    steps.forEach((step, i) => step.classList.toggle('active', i === current));
    progressSteps.forEach((step, i) => {
      step.classList.toggle('active', i === current);
      step.classList.toggle('done', i < current);
    });
    // amber track fills from the start up to the active step's center
    if (progress && questions.length > 1) {
      const pct = (current / (questions.length - 1)) * 100;
      progress.style.setProperty('--survey-progress-fill', `${pct}%`);
    }
    back.disabled = current === 0;
    next.textContent = current === questions.length - 1 ? 'VIEW YOUR RESULTS' : 'NEXT';
  };

  back.addEventListener('click', () => {
    if (current > 0) {
      current -= 1;
      render();
    }
  });

  next.addEventListener('click', () => {
    if (current < questions.length - 1) {
      current += 1;
      render();
    } else {
      block.classList.add('survey-complete');
    }
  });

  render();
}
