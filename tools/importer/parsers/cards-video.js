/* eslint-disable */
/* global WebImporter */

/**
 * Parser: cards-video
 * Base block: cards
 * Description: Grid of video thumbnail cards. Follows the Cards convention:
 * a 2-column table, first row = block name ("Cards (video)"), each subsequent
 * row = one card with an image in cell 1 and text content (heading styled as a
 * heading + a call-to-action link) in cell 2. Source: .cmp-videothumbnail cards
 * inside .cmp-videothumbnail__container on the Real Experiences page. Each card
 * links to its video experience fragment.
 * Selector: .cmp-videothumbnail__container
 * Generated: 2026-07-17
 */

function normalizeHref(raw) {
  if (!raw) return '';
  try {
    const u = new URL(raw, 'https://northera-stage.d.lundbeckus.com');
    if (/(^|\.)northera-stage\.d\.lundbeckus\.com$/.test(u.hostname)) {
      return `${u.pathname}${u.search}${u.hash}`;
    }
    u.username = '';
    u.password = '';
    return u.toString();
  } catch (e) {
    return raw;
  }
}

// Brightcove account + player for the HCP video library (extracted from the
// source experience fragments — all four videos share the same account/player).
const BRIGHTCOVE_ACCOUNT = '4804905851001';
const BRIGHTCOVE_PLAYER = 'zVTrglcf3';

// Per-card video config + transcript, keyed by the source card's anchor id
// (which is also the URL hash the source sets, e.g. #howiuse). Transcripts were
// extracted from each video's experience fragment.
const VIDEO_DATA = {
  howiuse: {
    videoId: '6026825406001',
    transcript: [
      "How I Use Northera® (droxidopa)\n\nInsights from an electrophysiologist",
      "Text: Brian Olshansky, MD - Professor emeritus at University of Iowa Cardiac electrophysiologist practicing in Mason City and Waterloo, Iowa",
      "Text on the bottom of the screen throughout: Please see accompanying Important Safety Information, including Boxed Warning for supine hypertension, and full Prescribing Information.",
      "Dr. Olshansky: When it comes to the use of Northera, the goals in the use of Northera are to reduce patient symptoms that are due to nOH and not necessarily to normalize blood pressure.",
      "Voiceover: Northera (droxidopa) is indicated for the treatment of orthostatic dizziness, lightheadedness, or the \"feeling that you are about to black out\" in adult patients with symptomatic neurogenic orthostatic hypotension (nOH) caused by primary autonomic failure (Parkinson's disease [PD], multiple system atrophy, and pure autonomic failure) dopamine beta-hydroxylase deficiency, and non-diabetic autonomic neuropathy. Effectiveness beyond 2 weeks of treatment has not been established. The continued effectiveness of Northera should be assessed periodically.",
      "Warning: Supine Hypertension",
      "Monitor supine blood pressure prior to and during treatment and more frequently when increasing doses. Elevating the head of the bed lessens the risk of supine hypertension, and blood pressure should be measured in this position. If supine hypertension cannot be managed by elevation of the head of the bed, reduce or discontinue Northera.",
      "Dr. Olshansky: I will have to say this, which I think is critically important about using this drug:",
      "First that the patients need to understand what the problem is. They need to understand what nOH is and why we're treating the problem.",
      "Second, they need to know something about what could be potentially the adverse effects of using the drug.",
      "There is a black box warning to consider the possibility that blood pressure elevation may occur on Northera. But there are ways to mitigate the risk of excess supine hypertension. Headache, dizziness, nausea, and hypertension have been reported with the use of Northera.",
      "And third, is combining the effect of the drug with non-pharmacological approaches. What I mean by that is making sure that the patient stays reasonably well hydrated; they're doing some physical activity as much as possible; that the head of the bed at night is kept elevated about 30 degrees. In some cases, some compression hose will be effective.",
      "Northera is just one part of the entire treatment approach.",
    ],
  },
  dosingtitration: {
    videoId: '6026823050001',
    transcript: [
      "Northera® (droxidopa) Dosing & Titration Considerations\n\nInsights from an electrophysiologist",
      "Text on the bottom of the screen throughout: Please see accompanying Important Safety Information, including Boxed Warning for supine hypertension, and full Prescribing Information.",
      "Voiceover: Northera (droxidopa) is indicated for the treatment of orthostatic dizziness, lightheadedness, or the \"feeling that you are about to black out\" in adult patients with symptomatic neurogenic orthostatic hypotension (nOH) caused by primary autonomic failure (Parkinson's disease [PD], multiple system atrophy, and pure autonomic failure) dopamine beta-hydroxylase deficiency, and non-diabetic autonomic neuropathy. Effectiveness beyond 2 weeks of treatment has not been established. The continued effectiveness of Northera should be assessed periodically.",
      "Warning: Supine Hypertension",
      "Monitor supine blood pressure prior to and during treatment and more frequently when increasing doses. Elevating the head of the bed lessens the risk of supine hypertension, and blood pressure should be measured in this position. If supine hypertension cannot be managed by elevation of the head of the bed, reduce or discontinue Northera.",
      "Text: Brian Olshansky, MD - Professor emeritus at University of Iowa Cardiac electrophysiologist practicing in Mason City and Waterloo, Iowa",
      "Dr. Olshansky: When it comes to titrating Northera, I start at 100 milligrams three times a day during waking hours and then increase the dose by 100 milligrams so that the dose is increased from 100 milligrams three times a day to 200 milligrams three times a day all the way up to 600 milligrams three times a day during waking hours with the idea that symptoms are going to be improved and that there is not an excess increase in blood pressure.",
      "And I think it's very important when using this drug that the dosing should be done in a very stringent fashion --essentially by the book-- especially in the first few weeks to understand how the patients are responding to the drug. And what I mean by responding, I mean what is happening to their symptoms? Are they improving? Have they improved as much as I think they could or should? And also are there any side effects?",
      "So I follow what is recommended in terms of the dosing titration. And it's very important in the first couple of weeks to have follow-up visits. Once things stabilize, it's hard to know what's going to happen in the long term, but I make sure that we set up reasonably careful follow-up visits. I set up a very close relationship, especially with my nurse, to make sure that if the patient has any change in their symptoms that they'll call us as soon as possible.",
    ],
  },
  whatissymptomatic: {
    videoId: '6026825285001',
    transcript: [
      "What is Symptomatic Neurogenic Orthostatic Hypotension?\n\nInsights from an electrophysiologist",
      "Text: Brian Olshansky, MD - Professor emeritus at University of Iowa Cardiac electrophysiologist practicing in Mason City and Waterloo, Iowa",
      "Text on the bottom of the screen throughout: Please see accompanying Important Safety Information, including Boxed Warning for supine hypertension, and full Prescribing Information.",
      "Dr. Olshansky: Orthostatic hypotension can be due to a variety of different conditions including blood loss, dehydration, medications, but there is not necessarily a defect in the autonomic nervous system. (nOH), a subset of orthostatic hypotension, is a condition in which there is a disordered response from the autonomic nervous system such that the blood pressure drops, but there is not a compensatory increase in heart rate.",
      "Frequently, neurogenic orthostatic hypotension is associated with underlying neurological conditions that may affect the way the autonomic nervous system responds to orthostatic stress.",
      "And what I mean by that is when a patient stands up from a sitting position, the blood pressure will drop 20 millimeters of mercury or more in systolic blood pressure or 10 millimeters of mercury or more in diastolic blood pressure and this condition tends to be an ongoing and chronic condition when it occurs.",
      "Typically, when I see a patient with neurogenic orthostatic hypotension, I don't know that that's their main problem. They often come to see me with other issues and complaints or they're referred to me. And some of the reasons that patients get referred to me or come to see me is because of conditions like loss of consciousness --so syncopy-- or they're just really weak and dizzy and fatigued.",
      "Many different things can cause the same symptoms, but some of the critical issues when it comes to neurogenic orthostatic hypotension are that the symptoms occur in the standing position and they occur also under specific time intervals such as early in the morning after a big meal, especially a big meal full of carbohydrates, and sometimes it requires a little extra time talking with the patient about some of their problems to really delve into the issue, and I suspect that sometimes the symptoms are missed because people are focusing on other issues rather than these particular symptoms.",
    ],
  },
  treatmentconsiderations: {
    videoId: '6026824316001',
    transcript: [
      "Treatment Considerations for Symptomatic nOH\n\nInsights from an electrophysiologist",
      "Text: Brian Olshansky, MD - Professor emeritus at University of Iowa Cardiac electrophysiologist practicing in Mason City and Waterloo, Iowa",
      "Text on the bottom of the screen throughout: Please see accompanying Important Safety Information, including Boxed Warning for supine hypertension, and full Prescribing Information.",
      "Dr. Olshansky: Some of the reasons that patients get referred to me or come to see me is because of conditions like loss of consciousness --so syncopy-- or they're just really weak and dizzy and fatigued with prolonged standing, and they might not necessarily understand that their symptoms are related to position. And the symptoms are really often quite a problem and often this is ongoing and I will have to say as an electrophysiologist it's not uncommon that patients with these symptoms have these symptoms for months or years at a time and they've tried to accommodate.",
      "So the first thing I do is try to rule out any other potential cause for the symptoms. The goals of treating a patient with neurogenic orthostatic hypotension are to reduce symptoms that are affecting a patient in an adverse way. The goals are not to normalize blood pressure or to normalize autonomic responses. This may not be possible, but it could be possible with proper treatment to reduce symptoms in patients who have nOH.",
      "We want to make sure that the patient has the proper non-pharmacological interventions. In other words, making sure that the patient is well hydrated, is off vasodilators and other medications as can be tolerated, keeps the head of the bed, if possible, up to 30 degrees. Perhaps also is involved in some type of an exercise program and, if possible, to wear a compression hose as can be tolerated.",
    ],
  },
};

/** Build the Brightcove iframe player URL for a video id. */
function brightcoveUrl(videoId) {
  return `https://players.brightcove.net/${BRIGHTCOVE_ACCOUNT}/${BRIGHTCOVE_PLAYER}_default/index.html?videoId=${videoId}`;
}

export default function parse(element, { document }) {
  // The outer .cmp-videothumbnail__container wraps the H1 title + intro
  // paragraph + the card grid + a hidden video modal. Preserve the title and
  // intro as default content, build the cards block, and drop the modal.
  const root = element.closest('.cmp-layout-left-section') || document.body;

  // Video thumbnails may be spread across several sibling
  // .cmp-videothumbnail__container blocks (HCP page) or nested in one outer
  // container that also wraps the title + intro (Real Experiences page).
  // Collect every top-level video container so we can build one block from all
  // cards and remove the leftover containers afterwards.
  const allContainers = [...root.querySelectorAll('.cmp-videothumbnail__container')];
  const topContainers = allContainers.filter((c) => !c.parentElement.closest('.cmp-videothumbnail__container'));
  const outer = topContainers[0] || element;

  const cards = [...root.querySelectorAll('.cmp-videothumbnail')].filter((c) => c.querySelector('img'));

  // Guard against duplicate processing: this parser fires once per matched
  // subcontainer, but it consumes ALL video cards in one pass. If no cards
  // remain (a prior call already folded them into a block), just drop this
  // element. Scoped to video cards so it does NOT collide with tables emitted
  // by other block parsers (e.g. cards-resource) in the same section.
  if (!cards.length) {
    element.replaceWith(document.createTextNode(''));
    return;
  }
  const cells = [];

  // Some pages label thumbnails with a bold blue <h3> (Real Experiences);
  // others use a plain grey <p> caption (HCP Additional Resources). Emit the
  // `caption` variant when no card carries a heading so the block CSS can render
  // the plainer caption style.
  const anyHeading = cards.some((c) => c.querySelector('.cmp-videothumbnail__description h3, h3, h2'));

  cards.forEach((card) => {
    const link = card.querySelector('a[href]');
    const href = normalizeHref(link ? (link.getAttribute('href') || link.href || '') : '');
    const img = card.querySelector('img');
    const headingEl = card.querySelector('.cmp-videothumbnail__description h3, h3, h2');
    const captionEl = headingEl || card.querySelector('p');
    const captionText = captionEl ? captionEl.textContent.trim() : '';
    // The source anchor id doubles as the URL hash + the VIDEO_DATA key.
    const anchor = link ? link.id : '';
    const video = VIDEO_DATA[anchor];

    // Cell 1 (mandatory): thumbnail image.
    let imageCell = '';
    if (img) {
      const newImg = document.createElement('img');
      newImg.setAttribute('src', img.getAttribute('src') || img.src || '');
      newImg.setAttribute('alt', img.getAttribute('alt') || captionText);
      imageCell = newImg;
    }

    // Cell 2: caption + the video player link (Brightcove) + transcript. The
    // block's decorate turns this into a clickable card that opens a modal with
    // the video and a "Read the transcript" accordion, setting the URL hash to
    // the anchor. When we have no video config (e.g. Real Experiences page), the
    // link falls back to the source fragment href.
    const body = document.createElement('div');
    if (captionText) {
      const h3 = document.createElement('h3');
      h3.textContent = captionText;
      body.appendChild(h3);
    }

    const cta = document.createElement('a');
    if (video) {
      // Append the source anchor (e.g. #howiuse) as a fragment on the player
      // URL. DA strips data-* attributes from block cells, but the href — and
      // its fragment — survives, so the block can read the exact hash from it.
      const playerUrl = brightcoveUrl(video.videoId) + (anchor ? `#${anchor}` : '');
      cta.setAttribute('href', playerUrl);
    } else if (href) {
      cta.setAttribute('href', href);
    }
    cta.textContent = captionText || 'Watch video';
    const ctaP = document.createElement('p');
    ctaP.appendChild(cta);
    body.appendChild(ctaP);

    // Transcript: emit as a nested container the block can lift into the modal's
    // "Read the transcript" accordion. Content-first — the copy lives here.
    if (video && video.transcript && video.transcript.length) {
      const transcript = document.createElement('div');
      transcript.className = 'cards-video-transcript';
      video.transcript.forEach((para) => {
        para.split('\n').forEach((lineRaw) => {
          const line = lineRaw.trim();
          if (!line) return;
          const p = document.createElement('p');
          p.textContent = line;
          transcript.appendChild(p);
        });
      });
      body.appendChild(transcript);
    }

    if (imageCell || body.childNodes.length) {
      cells.push([imageCell, body]);
    }
  });

  if (!cells.length) {
    element.replaceWith(document.createTextNode(''));
    return;
  }

  // Standalone cards-video block (own decorate/CSS in blocks/cards-video/).
  // Structure follows the Cards convention: 2 columns per row (image + text).
  const blockName = anyHeading ? 'cards-video' : 'cards-video (caption)';
  const block = WebImporter.Blocks.createBlock(document, { name: blockName, cells });

  // Preserve the section heading + intro paragraph (default content) that live
  // in the same container, then place the cards block after them. Extract the
  // H1 title and the intro paragraph before clearing the container.
  const fragment = document.createDocumentFragment();
  const title = outer.querySelector('.cmp-title h1, h1');
  if (title) {
    const h1 = document.createElement('h1');
    h1.textContent = title.textContent.trim();
    fragment.appendChild(h1);
  }
  // Intro paragraph: the first .cmp-text paragraph that is NOT inside a card.
  const introEl = [...outer.querySelectorAll('.cmp-text p, p')]
    .find((p) => !p.closest('.cmp-videothumbnail') && p.textContent.trim().length > 40);
  if (introEl) {
    const p = document.createElement('p');
    p.textContent = introEl.textContent.trim();
    fragment.appendChild(p);
  }
  fragment.appendChild(block);
  outer.replaceWith(fragment);

  // Remove any remaining sibling video containers (their cards were already
  // folded into the single block above).
  topContainers.slice(1).forEach((c) => {
    if (c.parentNode) c.remove();
  });

  // Drop the decorative section-background container (source: an empty
  // .cmp-layout-quicklinks div carrying a blue-teaser-bg CSS background). If
  // left in place, WebImporter.rules.transformBackgroundImages later converts
  // that background into a stray empty <picture> between the blocks. Also strip
  // any already-materialized teaser-bg <img>.
  root.querySelectorAll('.cmp-layout-quicklinks').forEach((el) => {
    if (!el.querySelector('a[href], h1, h2, h3, h4')) el.remove();
  });
  root.querySelectorAll('img[src*="teaser-bg"]').forEach((img) => {
    const wrapper = img.closest('p, div');
    if (wrapper && wrapper.parentNode) wrapper.remove();
    else if (img.parentNode) img.remove();
  });
}
