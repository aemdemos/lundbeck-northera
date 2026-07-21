import { createOptimizedPicture } from '../../scripts/aem.js';
import { createModal } from '../modal/modal.js';

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

function buildAutoplaySrc(playerHref) {
  if (playerHref.includes('autoplay')) return playerHref;

  const separator = playerHref.includes('?') ? '&' : '?';
  return `${playerHref}${separator}autoplay=true`;
}

function buildPlayer(href) {
  const wrapper = document.createElement('div');
  wrapper.className = 'cards-video-player';
  // Strip any deep-link fragment (e.g. #howiuse) before building the player src.
  const playerHref = href.split('#')[0];
  const iframe = document.createElement('iframe');
  iframe.src = buildAutoplaySrc(playerHref);
  iframe.setAttribute('allow', 'autoplay; encrypted-media; picture-in-picture; fullscreen');
  iframe.setAttribute('allowfullscreen', '');
  iframe.setAttribute('title', 'Video player');
  wrapper.append(iframe);
  return wrapper;
}

function buildTranscript(paragraphs) {
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

async function openVideoModal(href, hash, transcriptParas) {
  const content = document.createElement('div');
  content.className = 'cards-video-modal-content';
  content.append(buildPlayer(href));
  if (transcriptParas && transcriptParas.length) {
    content.append(buildTranscript(transcriptParas));
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

function createCard(imageCell, href, hash, headingText, transcriptParas, isVideo) {
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
      openVideoModal(href, hash, transcriptParas);
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

  return {
    hash,
    href,
    isVideo,
    transcriptParas,
    li: createCard(imageCell, href, hash, headingText, transcriptParas, isVideo),
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
        href: card.href,
        transcriptParas: card.transcriptParas,
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
    // hash is only a Map lookup key; the opened href (entry.href) is already
    // validated to an http(s) brightcove.net URL by getSafeVideoHref.
    // eslint-disable-next-line browser-security/no-insecure-redirects
    const hash = window.location.hash.replace('#', '');
    if (!hash) return;
    const entry = videoEntries.get(hash);
    if (entry) openVideoModal(entry.href, hash, entry.transcriptParas);
  };

  window.addEventListener('hashchange', openFromHash);
  openFromHash();
}
