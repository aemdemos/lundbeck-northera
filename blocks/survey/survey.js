/**
 * Multi-step survey / quiz block.
 *
 * Authoring contract (one row per block table):
 *   Each row (step): [ prompt (+ optional help paragraph) ] | [ checkbox|radio ] | [ options list ]
 *
 * The heading + intro paragraph live in their own page section above the block.
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

  // Parse each question row into { prompt, help, type, options }.
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

  // amber track fills from the left up to the center of the active circle.
  // Measure with bounding rects (relative to the progress box) and defer to
  // the next frame so layout/fonts are ready — offsetLeft reads 0 pre-layout.
  const updateFill = () => {
    if (!progress) return;
    const activeCircle = progressSteps[current];
    if (!activeCircle) return;
    requestAnimationFrame(() => {
      const progRect = progress.getBoundingClientRect();
      const circleRect = activeCircle.getBoundingClientRect();
      const fill = (circleRect.left + circleRect.width / 2) - progRect.left;
      progress.style.setProperty('--survey-progress-fill', `${fill}px`);
    });
  };

  const render = () => {
    steps.forEach((step, i) => step.classList.toggle('active', i === current));
    progressSteps.forEach((step, i) => {
      step.classList.toggle('active', i === current);
      step.classList.toggle('done', i < current);
    });
    updateFill();
    next.textContent = current === questions.length - 1 ? 'VIEW YOUR RESULTS' : 'NEXT';
  };

  const currentHasSelection = () => [...steps[current].querySelectorAll('input')]
    .some((input) => input.checked);

  // collect the checked option labels for a given step index
  const selectionsFor = (index) => [...steps[index].querySelectorAll('input:checked')]
    .map((input) => input.value);

  // Build the results view: navy hero with actions, then each question with the
  // chosen answer(s) highlighted. Rendered on "VIEW YOUR RESULTS".
  const buildResults = () => {
    const results = document.createElement('div');
    results.className = 'survey-results';

    const hero = document.createElement('div');
    hero.className = 'survey-results-hero';
    const heading = document.createElement('h2');
    heading.className = 'survey-results-title';
    heading.textContent = 'Symptomatic nOH Survey: your results';
    hero.append(heading);

    const actions = document.createElement('div');
    actions.className = 'survey-results-actions';
    const download = document.createElement('button');
    download.type = 'button';
    download.className = 'survey-results-download';
    download.textContent = 'DOWNLOAD AND PRINT MY RESULTS';
    download.addEventListener('click', () => window.print());
    const email = document.createElement('button');
    email.type = 'button';
    email.className = 'survey-results-email';
    email.textContent = 'EMAIL MY RESULTS';
    email.addEventListener('click', () => {
      const body = questions.map((q, i) => {
        const answers = selectionsFor(i).join(', ') || '—';
        return `${q.prompt}\n${answers}`;
      }).join('\n\n');
      const subject = 'Symptomatic nOH Survey: my results';
      window.location.href = `mailto:?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
    });
    actions.append(download, email);
    hero.append(actions);

    // "Print full Prescribing Information" — reuse the PI link found on the page
    const piLink = document.querySelector('main a[href$=".pdf"], main a[href*="Prescribing" i]');
    const piHref = piLink ? piLink.getAttribute('href') : '';
    if (piHref) {
      const pi = document.createElement('a');
      pi.className = 'survey-results-pi';
      pi.href = piHref;
      pi.target = '_blank';
      pi.rel = 'noopener';
      pi.textContent = 'Print full Prescribing Information';
      hero.append(pi);
    }

    results.append(hero);

    const list = document.createElement('ol');
    list.className = 'survey-results-list';
    questions.forEach((question, index) => {
      const item = document.createElement('li');
      item.className = 'survey-results-item';

      const q = document.createElement('p');
      q.className = 'survey-results-question';
      q.textContent = question.prompt;

      const a = document.createElement('p');
      a.className = 'survey-results-answer';
      const answers = selectionsFor(index);
      a.textContent = answers.length ? answers.join(', ') : 'No answer selected';

      item.append(q, a);
      list.append(item);
    });
    results.append(list);

    return results;
  };

  const showResults = () => {
    if (block.querySelector('.survey-results')) return;
    block.classList.add('survey-complete');
    const results = buildResults();
    // replace the interactive survey view with the results
    block.prepend(results);
    results.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  back.addEventListener('click', () => {
    if (current > 0) {
      current -= 1;
      render();
    }
  });

  next.addEventListener('click', () => {
    if (!currentHasSelection()) return;
    if (current < questions.length - 1) {
      current += 1;
      render();
    } else {
      showResults();
    }
  });

  window.addEventListener('resize', updateFill);
  // recompute the amber fill once the progress bar has a measurable width
  if (progress && 'ResizeObserver' in window) {
    const ro = new ResizeObserver(updateFill);
    ro.observe(progress);
  }

  render();
}
