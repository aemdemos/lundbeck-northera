import { createOptimizedPicture } from '../../scripts/aem.js';
import { createModal } from '../modal/modal.js';
import { loadFragment } from '../fragment/fragment.js';

/**
 * cards-video — a grid of video thumbnail cards (source: .cmp-videothumbnail).
 * Each card is a thumbnail image plus a caption. Clicking a card opens a modal
 * with a Brightcove video player and a "Read the transcript" accordion, and
 * sets the URL hash (e.g. #howiuse) so the video is deep-linkable — matching
 * the source behavior. 1 column on mobile, 2 columns on tablet/desktop.
 *
 * Authoring row (one per card):
 *   [ picture ] | [ heading/caption + video-link (a) + .cards-video-transcript ]
 * The link href is the Brightcove player URL; its data-hash carries the anchor.
 *
 * @param {Element} block
 */

function buildPlayer(href) {
  const wrapper = document.createElement('div');
  wrapper.className = 'cards-video-player';
  // No autoplay: open paused on the play overlay. Strip any deep-link fragment.
  const playerHref = href.split('#')[0];
  const iframe = document.createElement('iframe');
  iframe.src = playerHref;
  iframe.setAttribute('allow', 'encrypted-media; picture-in-picture; fullscreen');
  iframe.setAttribute('allowfullscreen', '');
  iframe.setAttribute('title', 'Video player');
  wrapper.append(iframe);
  return wrapper;
}

// Loads the transcript's ISI fragment into the panel. The modal is built after
// page load, so it never passes through the page-level buildAutoBlocks().
async function appendTranscriptFragment(panel, fragmentPath) {
  try {
    const fragment = await loadFragment(fragmentPath);
    if (fragment) panel.append(...fragment.childNodes);
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error('Transcript fragment loading failed', error);
  }
}

function buildTranscript(paragraphs, fragmentPath) {
  const details = document.createElement('div');
  details.className = 'cards-video-transcript-accordion';

  const button = document.createElement('button');
  button.type = 'button';
  button.className = 'cards-video-transcript-toggle';
  button.setAttribute('aria-expanded', 'false');
  button.textContent = 'Read the transcript';

  const panel = document.createElement('div');
  panel.className = 'cards-video-transcript-panel';
  panel.hidden = true;
  paragraphs.forEach((p) => panel.append(p.cloneNode(true)));
  if (fragmentPath) appendTranscriptFragment(panel, fragmentPath);

  button.addEventListener('click', () => {
    const open = button.getAttribute('aria-expanded') === 'true';
    button.setAttribute('aria-expanded', String(!open));
    panel.hidden = open;
  });

  details.append(button, panel);
  return details;
}

/**
 * Read the deep-link anchor for a video card. The parser appends the source
 * anchor (e.g. #howiuse) as a fragment on the player URL; fall back to a
 * videoId-derived hash if none is present.
 */
function hashFromHref(href) {
  if (!href) return '';
  const frag = href.split('#')[1];
  if (frag) return frag;
  const m = href.match(/videoId=(\d+)/);
  return m ? `video-${m[1]}` : '';
}

function getHeadingText(bodyCell, link) {
  const heading = bodyCell ? bodyCell.querySelector('h2, h3, h4') : null;
  if (heading) return heading.textContent.trim();
  if (link) return link.textContent.trim();
  return '';
}

function getTranscriptParas(bodyCell, link) {
  if (!bodyCell) return [];

  const linkPara = link ? link.closest('p') : null;
  return [...bodyCell.querySelectorAll(':scope > p')].filter((paragraph) => (
    paragraph !== linkPara && !paragraph.querySelector('a')
  ));
}

// Safe same-origin pathname of the transcript's `/fragments/…` link (ISI),
// mirroring any `/content` prefix like scripts.js does. Returns '' if none.
function getFragmentPath(bodyCell) {
  if (!bodyCell) return '';

  const fragmentLink = bodyCell.querySelector('a[href*="/fragments/"]');
  if (!fragmentLink) return '';

  try {
    const { pathname } = new URL(fragmentLink.getAttribute('href'), window.location.href);
    if (!/^\/(content\/)?fragments\/[a-z0-9/-]+$/i.test(pathname)) return '';
    const contentPrefix = window.location.pathname.startsWith('/content/')
      && !pathname.startsWith('/content/') ? '/content' : '';
    return `${contentPrefix}${pathname}`;
  } catch {
    return '';
  }
}

async function openVideoModal(href, hash, transcriptParas, fragmentPath) {
  const content = document.createElement('div');
  content.className = 'cards-video-modal-content';
  content.append(buildPlayer(href));
  if ((transcriptParas && transcriptParas.length) || fragmentPath) {
    content.append(buildTranscript(transcriptParas || [], fragmentPath));
  }

  const { showModal } = await createModal([content]);
  if (hash) {
    window.history.replaceState(null, '', `#${hash}`);
  }
  showModal();
}

function resolveCardHref(href, isVideo, hash) {
  if (isVideo) return hash ? `#${hash}` : '#';
  if (!href) return '#';

  try {
    const resolvedUrl = new URL(href, window.location.href);
    const isAllowedProtocol = resolvedUrl.protocol === 'http:' || resolvedUrl.protocol === 'https:';
    return isAllowedProtocol ? resolvedUrl.toString() : '#';
  } catch {
    return '#';
  }
}

function getSafeVideoHref(href) {
  if (!href) return '';

  try {
    const resolvedUrl = new URL(href, window.location.href);
    const isAllowedProtocol = resolvedUrl.protocol === 'http:' || resolvedUrl.protocol === 'https:';
    const isBrightcoveHost = /(^|\.)brightcove\.net$/i.test(resolvedUrl.hostname);
    return isAllowedProtocol && isBrightcoveHost ? resolvedUrl.toString() : '';
  } catch {
    return '';
  }
}

function getSafeHash() {
  const rawHash = window.location.hash.startsWith('#')
    ? window.location.hash.slice(1)
    : window.location.hash;

  if (!/^[a-z0-9-]+$/i.test(rawHash)) return '';
  return rawHash;
}

function createCard(imageCell, href, hash, headingText, transcriptParas, isVideo, fragmentPath) {
  const li = document.createElement('li');
  const trigger = document.createElement('a');
  trigger.className = 'cards-video-link';
  trigger.setAttribute('href', resolveCardHref(href, isVideo, hash));

  if (imageCell) {
    const pic = imageCell.querySelector('picture');
    if (pic) {
      const thumb = document.createElement('div');
      thumb.className = 'cards-video-thumb';
      thumb.append(pic);
      trigger.append(thumb);
    }
  }

  const desc = document.createElement('div');
  desc.className = 'cards-video-body';
  const heading = document.createElement('h3');
  heading.textContent = headingText;
  desc.append(heading);
  trigger.append(desc);

  if (isVideo) {
    if (hash) trigger.dataset.hash = hash;
    trigger.addEventListener('click', (e) => {
      e.preventDefault();
      openVideoModal(href, hash, transcriptParas, fragmentPath);
    });
  }

  li.append(trigger);
  return li;
}

function buildCardFromRow(row) {
  const cells = [...row.children];
  const imageCell = cells.find((cell) => cell.querySelector('picture'));
  const bodyCell = cells.find((cell) => cell !== imageCell) || cells[cells.length - 1];
  const link = bodyCell ? bodyCell.querySelector('a[href]') : null;
  const rawHref = link ? link.getAttribute('href') : null;
  const href = getSafeVideoHref(rawHref);
  const isVideo = Boolean(href);
  const hash = isVideo ? hashFromHref(href) : null;
  const headingText = getHeadingText(bodyCell, link);
  const transcriptParas = getTranscriptParas(bodyCell, link);
  const fragmentPath = getFragmentPath(bodyCell);

  return {
    hash,
    href,
    isVideo,
    transcriptParas,
    fragmentPath,
    li: createCard(imageCell, href, hash, headingText, transcriptParas, isVideo, fragmentPath),
  };
}

export default function decorate(block) {
  const ul = document.createElement('ul');
  const videoEntries = new Map();

  [...block.children].forEach((row) => {
    const card = buildCardFromRow(row);
    ul.append(card.li);
    if (card.isVideo && card.hash && card.href) {
      videoEntries.set(card.hash, {
        open: () => openVideoModal(card.href, card.hash, card.transcriptParas, card.fragmentPath),
      });
    }
  });

  ul.querySelectorAll('picture > img').forEach((img) => {
    const optimizedPic = createOptimizedPicture(img.src, img.alt, false, [{ width: '750' }]);
    img.closest('picture').replaceWith(optimizedPic);
  });

  block.textContent = '';
  block.append(ul);

  // Deep-link support: opening the page with a matching hash (e.g. #howiuse)
  // opens that video, matching the source's deep-linkable behavior.
  const openFromHash = () => {
    const hash = getSafeHash();
    if (!hash) return;
    const entry = videoEntries.get(hash);
    if (entry) entry.open();
  };

  window.addEventListener('hashchange', openFromHash);
  openFromHash();
}
