import { getMetadata, decorateIcons } from '../../scripts/aem.js';

const DESKTOP_MQ = window.matchMedia('(min-width: 1201px)');

function getClosedHeaderHeight() {
  return DESKTOP_MQ.matches
    ? 'var(--header-height)'
    : 'calc(var(--header-mobile-utility-height) + var(--header-mobile-main-height))';
}

function normalizePath(pathname) {
  if (!pathname) return '/';
  let normalized = pathname.toLowerCase();

  normalized = normalized.replace(/\.html$/, '');
  if (normalized !== '/' && normalized.endsWith('/')) {
    normalized = normalized.slice(0, -1);
  }

  return normalized || '/';
}

function isPathMatch(currentPath, candidatePath) {
  if (!candidatePath) return false;
  if (currentPath === candidatePath) return true;
  return currentPath.startsWith(`${candidatePath}/`);
}

function markActiveMenu(menu) {
  if (!menu) return;

  const currentPath = normalizePath(window.location.pathname);

  menu.querySelectorAll('.nav-link-item').forEach((item) => {
    const links = item.querySelectorAll(':scope > a, :scope > .nav-dropdown a');
    let hasMatch = false;

    links.forEach((link) => {
      let url;
      try {
        url = new URL(link.href, window.location.origin);
      } catch {
        return;
      }

      const candidatePath = normalizePath(url.pathname);
      const isMatch = isPathMatch(currentPath, candidatePath);
      if (isMatch) {
        hasMatch = true;
        link.setAttribute('aria-current', 'page');
      }
    });

    item.classList.toggle('active', hasMatch);
  });
}

function setExpandedHeight(element, expanded) {
  if (!element) return;
  element.style.maxHeight = expanded ? `${element.scrollHeight}px` : '0px';
}

function updateMobileHeaderHeight(wrapper) {
  if (!wrapper) return;
  const header = wrapper.closest('header');
  if (!header) return;
  header.style.height = getClosedHeaderHeight();
}

function closeDropdowns(scope = document) {
  scope.querySelectorAll('.nav-link-item.open').forEach((item) => {
    item.classList.remove('open');
    const toggle = item.querySelector(':scope > .nav-dropdown-toggle');
    if (toggle) toggle.setAttribute('aria-expanded', 'false');
    setExpandedHeight(item.querySelector(':scope > .nav-dropdown'), false);
  });
}

/**
 * Fetch the nav fragment as plain HTML. Dual-fetch: localhost/aem up serves
 * /content/nav.plain.html; DA/EDS serves ${navPath}.plain.html.
 * @returns {Promise<DocumentFragment|null>}
 */
async function fetchNav() {
  const navMeta = getMetadata('nav');
  const navPath = navMeta ? new URL(navMeta, window.location).pathname : '/nav';
  let resp = await fetch('/content/nav.plain.html');
  if (!resp.ok) resp = await fetch(`${navPath}.plain.html`);
  if (!resp.ok) return null;
  const html = await resp.text();
  return document.createRange().createContextualFragment(html);
}

/**
 * Resolve the /search results page path, mirroring any "/content" prefix used
 * on environments that serve pages under it (e.g. local dev).
 * @returns {string}
 */
function searchPagePath() {
  const contentPrefix = window.location.pathname.startsWith('/content/') ? '/content' : '';
  return `${contentPrefix}/search`;
}

/**
 * Builds the search control: a magnifying-glass icon that expands to reveal a
 * text input. Submitting (Enter or Go) navigates to the /search page with the
 * query in ?q=, where the search-results block renders the matches.
 * @returns {HTMLElement}
 */
function buildSearch() {
  const wrapper = document.createElement('div');
  wrapper.className = 'nav-search';

  const toggle = document.createElement('button');
  toggle.className = 'nav-search-toggle';
  toggle.setAttribute('aria-label', 'Search');
  toggle.setAttribute('aria-expanded', 'false');
  const searchIcon = document.createElement('span');
  searchIcon.className = 'icon icon-search';
  const searchImg = document.createElement('img');
  searchImg.src = `${window.hlx.codeBasePath}/icons/search-icon.png`;
  searchImg.alt = 'Search';
  searchIcon.append(searchImg);
  toggle.append(searchIcon);

  // Panel: a simple form that redirects to the /search results page on submit.
  const panel = document.createElement('div');
  panel.className = 'nav-search-panel';
  const form = document.createElement('form');
  form.className = 'nav-search-form';
  form.setAttribute('role', 'search');
  const input = document.createElement('input');
  input.type = 'search';
  input.className = 'nav-search-input';
  input.name = 'q';
  input.placeholder = 'I\'m searching for...';
  input.setAttribute('aria-label', 'I\'m searching for...');
  form.append(input);

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const query = input.value.trim();
    if (!query) return;
    const url = new URL(searchPagePath(), window.location.origin);
    url.searchParams.set('q', query);
    window.location.assign(url.toString());
  });

  // Close button (white X) — matches the source's open search bar.
  const close = document.createElement('button');
  close.className = 'nav-search-close';
  close.type = 'button';
  close.setAttribute('aria-label', 'Close search');
  panel.append(form, close);

  const closeSearch = () => {
    toggle.setAttribute('aria-expanded', 'false');
    wrapper.classList.remove('nav-search-open');
  };
  close.addEventListener('click', (e) => {
    e.stopPropagation();
    closeSearch();
  });

  toggle.addEventListener('click', (e) => {
    e.stopPropagation();
    const open = toggle.getAttribute('aria-expanded') === 'true';
    toggle.setAttribute('aria-expanded', open ? 'false' : 'true');
    wrapper.classList.toggle('nav-search-open', !open);
    if (!open) input.focus();
  });

  wrapper.append(toggle, panel);
  decorateIcons(toggle);
  return wrapper;
}

/**
 * Decorate the utility bar (row 0) from the first nav section.
 * @param {Element} section
 * @returns {HTMLElement}
 */
function decorateUtility(section) {
  const bar = document.createElement('div');
  bar.className = 'nav-utility';
  const inner = document.createElement('div');
  inner.className = 'nav-utility-inner';
  const list = section.querySelector('ul');
  if (list) {
    const links = document.createElement('ul');
    links.className = 'nav-utility-links';
    [...list.querySelectorAll(':scope > li')].forEach((li) => {
      const a = li.querySelector('a');
      const item = document.createElement('li');
      if (a) item.append(a.cloneNode(true));
      links.append(item);
    });
    inner.append(links);
  }
  bar.append(inner);
  return bar;
}

/**
 * Decorate the brand + nav + search row (rows are merged into one bar visually,
 * but semantically brand on the left, nav links + search on the right).
 * @param {Element} brandSection
 * @param {Element} navSection
 * @param {boolean} withSearch Whether ":search:" was authored in the nav.
 * @returns {HTMLElement}
 */
function decorateMain(brandSection, navSection, withSearch) {
  const bar = document.createElement('div');
  bar.className = 'nav-main';
  const inner = document.createElement('div');
  inner.className = 'nav-main-inner';

  // Brand / logo
  const brand = document.createElement('div');
  brand.className = 'nav-brand';
  const logoLink = brandSection.querySelector('a');
  if (logoLink) brand.append(logoLink.cloneNode(true));
  inner.append(brand);

  // Hamburger (mobile)
  const hamburger = document.createElement('button');
  hamburger.className = 'nav-hamburger';
  hamburger.setAttribute('aria-label', 'Toggle navigation');
  hamburger.setAttribute('aria-expanded', 'false');
  hamburger.innerHTML = '<span class=\'nav-hamburger-icon\'></span>';
  inner.append(hamburger);

  // Nav links
  const navLinks = document.createElement('nav');
  navLinks.className = 'nav-links';
  navLinks.setAttribute('aria-label', 'Main navigation');
  const topList = navSection.querySelector('ul');
  const menu = document.createElement('ul');
  menu.className = 'nav-links-list';

  [...topList.querySelectorAll(':scope > li')].forEach((li) => {
    const item = document.createElement('li');
    item.className = 'nav-link-item';
    // Top link may be a direct child or wrapped in a <p> (as delivered by DA).
    const topLink = li.querySelector(':scope > a, :scope > p > a');
    const subList = li.querySelector(':scope > ul');

    if (topLink) item.append(topLink.cloneNode(true));

    if (subList) {
      item.classList.add('has-dropdown');
      const panel = document.createElement('ul');
      panel.className = 'nav-dropdown';
      [...subList.querySelectorAll(':scope > li')].forEach((subLi) => {
        const a = subLi.querySelector('a');
        const subItem = document.createElement('li');
        if (a) subItem.append(a.cloneNode(true));
        panel.append(subItem);
      });

      // Mobile split-link: a separate chevron button expands the accordion,
      // while the text label always navigates (matches source behavior).
      const chevron = document.createElement('button');
      chevron.className = 'nav-dropdown-toggle';
      chevron.setAttribute(
        'aria-label',
        `Expand ${topLink ? topLink.textContent.trim() : 'menu'}`,
      );
      chevron.setAttribute('aria-expanded', 'false');
      chevron.addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation();
        const open = !item.classList.contains('open');
        item.classList.toggle('open', open);
        chevron.setAttribute('aria-expanded', open ? 'true' : 'false');
        setExpandedHeight(panel, open);
        requestAnimationFrame(() =>
          updateMobileHeaderHeight(bar.closest('.nav-wrapper')),
        );
      });
      item.append(chevron, panel);

      // Desktop: open on hover (CSS also handles :hover).
      item.addEventListener('mouseenter', () => {
        if (DESKTOP_MQ.matches) item.classList.add('open');
      });
      item.addEventListener('mouseleave', () => {
        if (DESKTOP_MQ.matches) item.classList.remove('open');
      });
    }
    menu.append(item);
  });

  markActiveMenu(menu);

  navLinks.append(menu);
  inner.append(navLinks);

  navLinks.addEventListener('transitionend', (event) => {
    if (event.propertyName !== 'max-height') return;
    const wrapper = bar.closest('.nav-wrapper');
    if (!wrapper || !wrapper.classList.contains('nav-mobile-open')) return;
    navLinks.classList.add('is-open-complete');
    navLinks.style.maxHeight = 'none';
    updateMobileHeaderHeight(wrapper);
  });

  // Search — only when ":search:" is authored in the nav.
  if (withSearch) inner.append(buildSearch());

  bar.append(inner);

  hamburger.addEventListener('click', () => {
    const open = hamburger.getAttribute('aria-expanded') === 'true';
    const nextOpen = !open;
    hamburger.setAttribute('aria-expanded', open ? 'false' : 'true');
    const wrapper = bar.closest('.nav-wrapper');
    wrapper.classList.toggle('nav-mobile-open', nextOpen);
    navLinks.classList.remove('is-open-complete');
    if (nextOpen) {
      setExpandedHeight(navLinks, true);
    } else {
      if (navLinks.style.maxHeight === 'none') {
        navLinks.style.maxHeight = `${navLinks.scrollHeight}px`;
      }
      requestAnimationFrame(() => setExpandedHeight(navLinks, false));
    }
    if (!nextOpen) {
      closeDropdowns(wrapper);
    }
    requestAnimationFrame(() => updateMobileHeaderHeight(wrapper));
  });

  return bar;
}

/**
 * loads and decorates the header
 * @param {Element} block The header block element
 */
export default async function decorate(block) {
  const doc = await fetchNav();
  block.textContent = '';
  if (!doc) {
    return;
  }

  const sections = [...doc.children];
  const [utilitySection, brandSection, navSection] = sections;

  // The search control is opt-in: it renders only when ":search:" is authored
  // in the nav. That token is delivered either as literal ":search:" text or,
  // once icons are decorated, as a <span class="icon icon-search">. Detect
  // either form, then strip the token so it never renders as a stray nav item.
  let withSearch = false;
  if (navSection) {
    const iconToken = navSection.querySelector('.icon-search, span.icon.icon-search');
    if (iconToken) {
      withSearch = true;
      (iconToken.closest('li') || iconToken).remove();
    } else if (/:search:/i.test(navSection.textContent)) {
      withSearch = true;
      [...navSection.querySelectorAll('li, p')].forEach((el) => {
        if (/^\s*:search:\s*$/i.test(el.textContent)) el.remove();
      });
    }
  }

  const wrapper = document.createElement('div');
  wrapper.className = 'nav-wrapper';

  if (utilitySection) {
    wrapper.append(decorateUtility(utilitySection));
  }
  if (brandSection && navSection) {
    wrapper.append(decorateMain(brandSection, navSection, withSearch));
  }

  block.append(wrapper);
  setExpandedHeight(wrapper.querySelector('.nav-links'), false);
  closeDropdowns(wrapper);

  // Close dropdowns on Escape and outside click
  window.addEventListener('keydown', (e) => {
    if (e.code === 'Escape') {
      closeDropdowns(wrapper);
      updateMobileHeaderHeight(wrapper);
    }
  });
  document.addEventListener('click', (e) => {
    if (!e.target.closest('.nav-link-item')) {
      closeDropdowns(wrapper);
      updateMobileHeaderHeight(wrapper);
    }
  });

  // Reset state when crossing the desktop/mobile breakpoint
  DESKTOP_MQ.addEventListener('change', () => {
    closeDropdowns(wrapper);
    wrapper.classList.remove('nav-mobile-open');
    setExpandedHeight(wrapper.querySelector('.nav-links'), false);
    updateMobileHeaderHeight(wrapper);
    const hb = wrapper.querySelector('.nav-hamburger');
    if (hb) {
      hb.setAttribute('aria-expanded', 'false');
    }
    const st = wrapper.querySelector('.nav-search-toggle');
    if (st) {
      st.setAttribute('aria-expanded', 'false');
      st.closest('.nav-search').classList.remove('nav-search-open');
    }
  });

  window.addEventListener('resize', () => updateMobileHeaderHeight(wrapper));
}
