import { createOptimizedPicture } from '../../scripts/aem.js';
import { isTranscriptLabel, buildTranscriptClose } from '../../scripts/scripts.js';
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

// Sets the modal's top once from its collapsed height (panel measured hidden),
// so expanding the transcript grows it downward with no upward shift. Desktop
// centers; mobile rests just below the top. Top-layer dialog — can't be CSS.
function positionVideoModal(el) {
  const dialog = el.closest('dialog');
  if (!dialog) return;
  const panel = dialog.querySelector('.cards-video-transcript-panel');
  const wasOpen = panel && !panel.hidden;
  if (panel) panel.hidden = true; // measure collapsed height
  const isDesktop = window.innerWidth >= 992;
  const minTop = isDesktop ? 0 : 30;
  dialog.style.top = `${minTop}px`; // reset before measuring
  const collapsedHeight = dialog.getBoundingClientRect().height;
  if (panel) panel.hidden = !wasOpen; // restore prior state
  const centered = (window.innerHeight - collapsedHeight) / 2;
  // desktop: center the collapsed modal; mobile: rest just below the top
  const resting = isDesktop ? centered : minTop + Math.max(0, (centered - minTop) * 0.35);
  dialog.style.top = `${Math.max(minTop, resting)}px`;
}

// Fetches a fresh copy of the ISI fragment's .isi-video (styled by the global
// isi-video.css). Own copy because the page's auto-loader would leave a stale ref.
async function loadIsiVideo(isiFragmentHref) {
  try {
    const { pathname } = new URL(isiFragmentHref, window.location.href);
    const frag = await loadFragment(pathname);
    return frag?.querySelector('.isi-video') || null;
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error('ISI fragment loading failed', error);
    return null;
  }
}

async function buildTranscript(paragraphs, isiFragmentHref) {
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

  if (isiFragmentHref) {
    const isiVideo = await loadIsiVideo(isiFragmentHref);
    if (isiVideo) panel.append(isiVideo);
  }

  button.addEventListener('click', () => {
    const open = button.getAttribute('aria-expanded') === 'true';
    button.setAttribute('aria-expanded', String(!open));
    panel.hidden = open;
    // no reposition here: the modal keeps its resting top and grows downward
  });

  // "Close the transcript" control at the end of the panel, mirroring the toggle.
  if (isTranscriptLabel(button.textContent)) {
    panel.append(buildTranscriptClose(() => {
      button.setAttribute('aria-expanded', 'false');
      panel.hidden = true;
      button.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }));
  }

  details.append(button, panel);
  return details;
}

// Deep-link anchor for a card: the #fragment on the player URL (e.g. #howiuse),
// falling back to a videoId-derived hash.
function hashFromHref(href) {
  if (!href) return '';
  const frag = href.split('#')[1];
  if (frag) return frag;
  const m = href.match(/videoId=(\d+)/);
  return m ? `video-${m[1]}` : '';
}

function getHeadingInfo(bodyCell, link) {
  const heading = bodyCell ? bodyCell.querySelector('h2, h3, h4') : null;
  if (heading) return { text: heading.textContent.trim(), tag: heading.tagName.toLowerCase() };
  return { text: link ? link.textContent.trim() : '', tag: 'h3' };
}

function getTranscriptParas(bodyCell, link) {
  if (!bodyCell) return [];

  const linkPara = link ? link.closest('p') : null;
  return [...bodyCell.querySelectorAll(':scope > p')].filter((paragraph) => (
    paragraph !== linkPara && !paragraph.querySelector('a')
  ));
}

// The ISI is authored as a bare /fragments/ link; getTranscriptParas already
// excludes it from the display paragraphs.
function getIsiFragmentHref(bodyCell) {
  if (!bodyCell) return null;
  const isiLink = bodyCell.querySelector(':scope > p > a[href*="/fragments/"]');
  return isiLink ? isiLink.getAttribute('href') : null;
}

async function openVideoModal(href, hash, transcriptParas, isiFragmentHref) {
  const content = document.createElement('div');
  content.className = 'cards-video-modal-content';
  content.append(buildPlayer(href));
  if ((transcriptParas && transcriptParas.length) || isiFragmentHref) {
    content.append(await buildTranscript(transcriptParas, isiFragmentHref));
  }

  const { showModal } = await createModal([content]);
  if (hash) {
    window.history.replaceState(null, '', `#${hash}`);
  }
  showModal();

  // Center/pin the dialog now and on resize (removed when the modal closes).
  positionVideoModal(content);
  const dialog = content.closest('dialog');
  const reposition = () => positionVideoModal(content);
  window.addEventListener('resize', reposition);
  dialog?.addEventListener('close', () => window.removeEventListener('resize', reposition), { once: true });
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

function createCard(imageCell, href, hash, headingText, headingTag, transcriptParas, isiFragmentHref, isVideo) {
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
  const heading = document.createElement(headingTag);
  heading.textContent = headingText;
  desc.append(heading);
  trigger.append(desc);

  if (isVideo) {
    if (hash) trigger.dataset.hash = hash;
    trigger.addEventListener('click', (e) => {
      e.preventDefault();
      openVideoModal(href, hash, transcriptParas, isiFragmentHref);
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
  const { text: headingText, tag: headingTag } = getHeadingInfo(bodyCell, link);
  const transcriptParas = getTranscriptParas(bodyCell, link);
  const isiFragmentHref = getIsiFragmentHref(bodyCell);

  return {
    hash,
    href,
    isVideo,
    transcriptParas,
    isiFragmentHref,
    li: createCard(imageCell, href, hash, headingText, headingTag, transcriptParas, isiFragmentHref, isVideo),
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
        open: () => openVideoModal(card.href, card.hash, card.transcriptParas, card.isiFragmentHref),
      });
    }
  });

  ul.querySelectorAll('picture > img').forEach((img) => {
    const optimizedPic = createOptimizedPicture(img.src, img.alt, false, [{ width: '750' }]);
    img.closest('picture').replaceWith(optimizedPic);
  });

  block.textContent = '';
  block.append(ul);

  // Deep-link: a matching hash (e.g. #howiuse) opens that video on load.
  const openFromHash = () => {
    const hash = getSafeHash();
    if (!hash) return;
    const entry = videoEntries.get(hash);
    if (entry) entry.open();
  };

  window.addEventListener('hashchange', openFromHash);
  openFromHash();
}
