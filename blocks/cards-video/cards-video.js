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

function buildPlayer(href) {
  const wrapper = document.createElement('div');
  wrapper.className = 'cards-video-player';
  // Strip any deep-link fragment (e.g. #howiuse) before building the player src.
  const playerHref = href.split('#')[0];
  const iframe = document.createElement('iframe');
  iframe.src = playerHref.includes('autoplay') ? playerHref : `${playerHref}${playerHref.includes('?') ? '&' : '?'}autoplay=true`;
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

export default function decorate(block) {
  const ul = document.createElement('ul');

  [...block.children].forEach((row) => {
    const cells = [...row.children];
    const imageCell = cells.find((c) => c.querySelector('picture'));
    const bodyCell = cells.find((c) => c !== imageCell) || cells[cells.length - 1];

    const link = bodyCell ? bodyCell.querySelector('a[href]') : null;
    const href = link ? link.getAttribute('href') : null;
    const isVideo = href && /brightcove\.net/.test(href);
    const hash = isVideo ? hashFromHref(href) : null;
    const heading = bodyCell ? bodyCell.querySelector('h2, h3, h4') : null;
    const headingText = (heading ? heading.textContent : (link ? link.textContent : '')).trim();
    // Transcript = the paragraphs after the video link's own paragraph. DA
    // strips the wrapper div, so collect trailing <p>s (skip the link's <p>).
    const linkPara = link ? link.closest('p') : null;
    const transcriptParas = bodyCell
      ? [...bodyCell.querySelectorAll(':scope > p')].filter((p) => p !== linkPara && !p.querySelector('a'))
      : [];

    const li = document.createElement('li');
    const trigger = document.createElement('a');
    trigger.className = 'cards-video-link';
    trigger.href = href || '#';

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
    const h = document.createElement('h3');
    h.textContent = headingText;
    desc.append(h);
    trigger.append(desc);

    // A Brightcove player URL means we open the inline modal; other hrefs
    // (fragment links) just navigate normally.
    if (isVideo) {
      if (hash) trigger.dataset.hash = hash;
      trigger.addEventListener('click', (e) => {
        e.preventDefault();
        openVideoModal(href, hash, transcriptParas);
      });
    }

    li.append(trigger);
    ul.append(li);
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
    const hash = window.location.hash.replace('#', '');
    if (!hash) return;
    const match = [...block.querySelectorAll('.cards-video-link')]
      .find((a) => a.dataset.hash === hash);
    if (match) match.click();
  };
  window.addEventListener('hashchange', openFromHash);
  openFromHash();
}
