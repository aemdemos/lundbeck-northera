/*
 * Embed Block
 * Show videos and social posts directly on your page
 * https://www.hlx.live/developer/block-collection/embed
 */
import { ensureDOMPurify } from '../../scripts/scripts.js';
import { DOMPURIFY } from '../../scripts/aem.js';
import { getYoutubeEmbedHtml, getVimeoEmbedHtml } from '../../scripts/utils.js';

// the shared DOMPURIFY profile strips <iframe>; embeds (Brightcove, etc.) need it
const EMBED_DOMPURIFY = {
  USE_PROFILES: { html: true },
  ADD_TAGS: ['iframe'],
  ADD_ATTR: ['allow', 'allowfullscreen', 'frameborder', 'scrolling', 'src', 'title'],
};

const loadScript = (url, callback, type) => {
  const head = document.querySelector('head');
  const script = document.createElement('script');
  script.src = url;
  if (type) {
    script.setAttribute('type', type);
  }
  script.onload = callback;
  head.append(script);
  return script;
};

async function sanitizeHtml(html, profile) {
  await ensureDOMPurify();
  return window.DOMPurify?.sanitize(html, profile) ?? html;
}

async function htmlToElement(html, profile = EMBED_DOMPURIFY) {
  const temp = document.createElement('div');
  temp.innerHTML = await sanitizeHtml(html, profile);
  return temp.firstElementChild;
}

/** Brightcove iframe hosts use .net; imported AEM links often have non-resolving .com */
const normalizeEmbedUrl = (url) => {
  const normalized = new URL(url.href);
  if (normalized.hostname === 'players.brightcove.com') {
    normalized.hostname = 'players.brightcove.net';
  }
  return normalized;
};

const buildEmbedUrl = (link, autoplay) => {
  const url = normalizeEmbedUrl(new URL(link));
  if (autoplay) {
    url.searchParams.set('autoplay', 'true');
  }
  return url;
};

/* Add iframe wrapper to the embed (Brightcove and other generic URLs) */
const getDefaultEmbed = (url) => `<div class="iframe-wrapper">
    <iframe src="${url.href}" allowfullscreen
      scrolling="no" allow="autoplay; encrypted-media; picture-in-picture; fullscreen"
      title="Content from ${url.hostname}">
    </iframe>
  </div>`;

const embedTwitter = (url) => {
  if (!url.href.startsWith('https://twitter.com')) {
    url.href = url.href.replace('https://x.com', 'https://twitter.com');
  }
  const embedHTML = `<blockquote class="twitter-tweet"><a href="${url.href}"></a></blockquote>`;
  loadScript('https://platform.twitter.com/widgets.js');
  return embedHTML;
};

const setEmbedClasses = (block, className) => {
  block.className = className;
};

const revealEmbed = (block) => {
  block.dataset.embedLoaded = 'true';
  block.classList.add('embed-is-loaded');
  block.querySelector('.embed-placeholder')?.remove();
};

const mountIframe = async (block, link, autoplay) => {
  if (block.querySelector('.iframe-wrapper')) {
    return block.querySelector('iframe');
  }

  const url = buildEmbedUrl(link, autoplay);
  const embedWrapper = await htmlToElement(getDefaultEmbed(url));
  block.append(embedWrapper);
  setEmbedClasses(block, 'block embed');
  return embedWrapper.querySelector('iframe');
};

const preloadEmbed = async (block, link) => {
  if (block.querySelector('.iframe-wrapper') || block.dataset.embedLoaded === 'true') {
    return;
  }
  // Wait for layout so the hidden iframe mounts at the poster's full dimensions.
  await new Promise((resolve) => {
    requestAnimationFrame(() => requestAnimationFrame(resolve));
  });
  await mountIframe(block, link, false);
};

const playEmbed = async (block, link) => {
  if (block.dataset.embedLoaded === 'true') {
    return;
  }

  let iframe = block.querySelector('iframe');
  if (!iframe) {
    iframe = await mountIframe(block, link, true);
  } else {
    const url = buildEmbedUrl(link, true);
    if (iframe.src !== url.href) {
      iframe.src = url.href;
    }
  }

  const onReady = () => revealEmbed(block);
  iframe.addEventListener('load', onReady, { once: true });
};

const loadEmbed = async (block, link, autoplay) => {
  if (block.classList.contains('embed-is-loaded')) {
    return;
  }

  const EMBEDS_CONFIG = [
    {
      match: ['youtube', 'youtu.be'],
      embed: (url, play) => getYoutubeEmbedHtml(url, play),
    },
    {
      match: ['vimeo'],
      embed: (url, play) => getVimeoEmbedHtml(url, play),
    },
    {
      match: ['twitter', 'x.com'],
      embed: embedTwitter,
    },
  ];
  const config = EMBEDS_CONFIG.find((e) => e.match.some((match) => link.includes(match)));
  const url = normalizeEmbedUrl(new URL(link));
  if (config) {
    const embedHtml = config.embed(url, autoplay);
    block.innerHTML = await sanitizeHtml(embedHtml, EMBED_DOMPURIFY);
    setEmbedClasses(block, `block embed embed-${config.match[0]}`);
  } else {
    const defaultHtml = getDefaultEmbed(buildEmbedUrl(link, autoplay));
    block.innerHTML = await sanitizeHtml(defaultHtml, EMBED_DOMPURIFY);
    setEmbedClasses(block, 'block embed');
  }
  block.classList.add('embed-is-loaded');
};

export default async function decorate(block) {
  const placeholder = block.querySelector('picture');
  const anchor = block.querySelector('a');
  if (!anchor?.href) {
    return;
  }
  const { href: link } = anchor;
  block.textContent = '';

  if (placeholder) {
    block.dataset.embedLoaded = 'false';
    const wrapper = document.createElement('div');
    wrapper.className = 'embed-placeholder';
    const placeholderHtml = '<div class="embed-placeholder-play"><button type="button" title="Play"></button></div>';
    wrapper.innerHTML = await sanitizeHtml(placeholderHtml, DOMPURIFY);
    wrapper.prepend(placeholder);
    wrapper.querySelector('.embed-placeholder-play button')?.addEventListener('click', () => {
      playEmbed(block, link);
    });
    block.append(wrapper);

    // Warm the Brightcove player in the background so play feels instant (source
    // site already has the player in the DOM; we keep the poster visible until ready).
    const preloadObserver = new IntersectionObserver((entries) => {
      if (entries.some((e) => e.isIntersecting)) {
        preloadObserver.disconnect();
        preloadEmbed(block, link);
      }
    }, { rootMargin: '200px' });
    preloadObserver.observe(block);
  } else {
    const observer = new IntersectionObserver((entries) => {
      if (entries.some((e) => e.isIntersecting)) {
        observer.disconnect();
        loadEmbed(block, link);
      }
    });
    observer.observe(block);
  }
}
