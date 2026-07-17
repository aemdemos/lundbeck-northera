/* eslint-disable */
var CustomImportScript = (() => {
  var __defProp = Object.defineProperty;
  var __defProps = Object.defineProperties;
  var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
  var __getOwnPropDescs = Object.getOwnPropertyDescriptors;
  var __getOwnPropNames = Object.getOwnPropertyNames;
  var __getOwnPropSymbols = Object.getOwnPropertySymbols;
  var __hasOwnProp = Object.prototype.hasOwnProperty;
  var __propIsEnum = Object.prototype.propertyIsEnumerable;
  var __defNormalProp = (obj, key, value) => key in obj ? __defProp(obj, key, { enumerable: true, configurable: true, writable: true, value }) : obj[key] = value;
  var __spreadValues = (a, b) => {
    for (var prop in b || (b = {}))
      if (__hasOwnProp.call(b, prop))
        __defNormalProp(a, prop, b[prop]);
    if (__getOwnPropSymbols)
      for (var prop of __getOwnPropSymbols(b)) {
        if (__propIsEnum.call(b, prop))
          __defNormalProp(a, prop, b[prop]);
      }
    return a;
  };
  var __spreadProps = (a, b) => __defProps(a, __getOwnPropDescs(b));
  var __export = (target, all) => {
    for (var name in all)
      __defProp(target, name, { get: all[name], enumerable: true });
  };
  var __copyProps = (to, from, except, desc) => {
    if (from && typeof from === "object" || typeof from === "function") {
      for (let key of __getOwnPropNames(from))
        if (!__hasOwnProp.call(to, key) && key !== except)
          __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
    }
    return to;
  };
  var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);

  // tools/importer/import-additional-resources-page.js
  var import_additional_resources_page_exports = {};
  __export(import_additional_resources_page_exports, {
    default: () => import_additional_resources_page_default
  });

  // tools/importer/parsers/cards-resource.js
  function normalizeHref(raw) {
    if (!raw) return "";
    try {
      const u = new URL(raw, "https://northera-stage.d.lundbeckus.com");
      if (/(^|\.)northera-stage\.d\.lundbeckus\.com$/.test(u.hostname)) {
        return `${u.pathname}${u.search}${u.hash}`;
      }
      u.username = "";
      u.password = "";
      return u.toString();
    } catch (e) {
      return raw;
    }
  }
  function parse(element, { document }) {
    const container = element.closest(".cmp-layout__patientsupport") || element.parentElement;
    if (container.querySelector("table")) {
      element.replaceWith(document.createTextNode(""));
      return;
    }
    const cards = container.querySelectorAll("a.cmp-imagetext__link");
    const cells = [];
    cards.forEach((card) => {
      const href = normalizeHref(card.href || card.getAttribute("href") || "");
      const img = card.querySelector("img");
      const headingEl = card.querySelector("h3, h2");
      const descEl = card.querySelector(".cmp-imagetext__description p, p");
      const buttonEl = card.querySelector('.cmp-label-text, .cmp-text-cta, [class*="buttontext"]');
      const buttonLabel = buttonEl ? buttonEl.textContent.trim() : "";
      const imageCell = document.createElement("div");
      if (img) {
        imageCell.appendChild(img);
      }
      const bodyCell = document.createElement("div");
      if (headingEl) {
        const h3 = document.createElement("h3");
        h3.textContent = headingEl.textContent.trim();
        bodyCell.appendChild(h3);
      }
      if (descEl) {
        const p = document.createElement("p");
        p.textContent = descEl.textContent.trim();
        bodyCell.appendChild(p);
      }
      if (href) {
        const cta = document.createElement("a");
        cta.setAttribute("href", href);
        cta.textContent = buttonLabel || "Learn More";
        const ctaP = document.createElement("p");
        ctaP.appendChild(cta);
        bodyCell.appendChild(ctaP);
      }
      cells.push([imageCell, bodyCell]);
    });
    const block = WebImporter.Blocks.createBlock(document, {
      name: "Cards (resource)",
      cells
    });
    element.replaceWith(block);
  }

  // tools/importer/parsers/cards-video.js
  function normalizeHref2(raw) {
    if (!raw) return "";
    try {
      const u = new URL(raw, "https://northera-stage.d.lundbeckus.com");
      if (/(^|\.)northera-stage\.d\.lundbeckus\.com$/.test(u.hostname)) {
        return `${u.pathname}${u.search}${u.hash}`;
      }
      u.username = "";
      u.password = "";
      return u.toString();
    } catch (e) {
      return raw;
    }
  }
  var BRIGHTCOVE_ACCOUNT = "4804905851001";
  var BRIGHTCOVE_PLAYER = "zVTrglcf3";
  var VIDEO_DATA = {
    howiuse: {
      videoId: "6026825406001",
      transcript: [
        "How I Use Northera\xAE (droxidopa)\n\nInsights from an electrophysiologist",
        "Text: Brian Olshansky, MD - Professor emeritus at University of Iowa Cardiac electrophysiologist practicing in Mason City and Waterloo, Iowa",
        "Text on the bottom of the screen throughout: Please see accompanying Important Safety Information, including Boxed Warning for supine hypertension, and full Prescribing Information.",
        "Dr. Olshansky: When it comes to the use of Northera, the goals in the use of Northera are to reduce patient symptoms that are due to nOH and not necessarily to normalize blood pressure.",
        `Voiceover: Northera (droxidopa) is indicated for the treatment of orthostatic dizziness, lightheadedness, or the "feeling that you are about to black out" in adult patients with symptomatic neurogenic orthostatic hypotension (nOH) caused by primary autonomic failure (Parkinson's disease [PD], multiple system atrophy, and pure autonomic failure) dopamine beta-hydroxylase deficiency, and non-diabetic autonomic neuropathy. Effectiveness beyond 2 weeks of treatment has not been established. The continued effectiveness of Northera should be assessed periodically.`,
        "Warning: Supine Hypertension",
        "Monitor supine blood pressure prior to and during treatment and more frequently when increasing doses. Elevating the head of the bed lessens the risk of supine hypertension, and blood pressure should be measured in this position. If supine hypertension cannot be managed by elevation of the head of the bed, reduce or discontinue Northera.",
        "Dr. Olshansky: I will have to say this, which I think is critically important about using this drug:",
        "First that the patients need to understand what the problem is. They need to understand what nOH is and why we're treating the problem.",
        "Second, they need to know something about what could be potentially the adverse effects of using the drug.",
        "There is a black box warning to consider the possibility that blood pressure elevation may occur on Northera. But there are ways to mitigate the risk of excess supine hypertension. Headache, dizziness, nausea, and hypertension have been reported with the use of Northera.",
        "And third, is combining the effect of the drug with non-pharmacological approaches. What I mean by that is making sure that the patient stays reasonably well hydrated; they're doing some physical activity as much as possible; that the head of the bed at night is kept elevated about 30 degrees. In some cases, some compression hose will be effective.",
        "Northera is just one part of the entire treatment approach."
      ]
    },
    dosingtitration: {
      videoId: "6026823050001",
      transcript: [
        "Northera\xAE (droxidopa) Dosing & Titration Considerations\n\nInsights from an electrophysiologist",
        "Text on the bottom of the screen throughout: Please see accompanying Important Safety Information, including Boxed Warning for supine hypertension, and full Prescribing Information.",
        `Voiceover: Northera (droxidopa) is indicated for the treatment of orthostatic dizziness, lightheadedness, or the "feeling that you are about to black out" in adult patients with symptomatic neurogenic orthostatic hypotension (nOH) caused by primary autonomic failure (Parkinson's disease [PD], multiple system atrophy, and pure autonomic failure) dopamine beta-hydroxylase deficiency, and non-diabetic autonomic neuropathy. Effectiveness beyond 2 weeks of treatment has not been established. The continued effectiveness of Northera should be assessed periodically.`,
        "Warning: Supine Hypertension",
        "Monitor supine blood pressure prior to and during treatment and more frequently when increasing doses. Elevating the head of the bed lessens the risk of supine hypertension, and blood pressure should be measured in this position. If supine hypertension cannot be managed by elevation of the head of the bed, reduce or discontinue Northera.",
        "Text: Brian Olshansky, MD - Professor emeritus at University of Iowa Cardiac electrophysiologist practicing in Mason City and Waterloo, Iowa",
        "Dr. Olshansky: When it comes to titrating Northera, I start at 100 milligrams three times a day during waking hours and then increase the dose by 100 milligrams so that the dose is increased from 100 milligrams three times a day to 200 milligrams three times a day all the way up to 600 milligrams three times a day during waking hours with the idea that symptoms are going to be improved and that there is not an excess increase in blood pressure.",
        "And I think it's very important when using this drug that the dosing should be done in a very stringent fashion --essentially by the book-- especially in the first few weeks to understand how the patients are responding to the drug. And what I mean by responding, I mean what is happening to their symptoms? Are they improving? Have they improved as much as I think they could or should? And also are there any side effects?",
        "So I follow what is recommended in terms of the dosing titration. And it's very important in the first couple of weeks to have follow-up visits. Once things stabilize, it's hard to know what's going to happen in the long term, but I make sure that we set up reasonably careful follow-up visits. I set up a very close relationship, especially with my nurse, to make sure that if the patient has any change in their symptoms that they'll call us as soon as possible."
      ]
    },
    whatissymptomatic: {
      videoId: "6026825285001",
      transcript: [
        "What is Symptomatic Neurogenic Orthostatic Hypotension?\n\nInsights from an electrophysiologist",
        "Text: Brian Olshansky, MD - Professor emeritus at University of Iowa Cardiac electrophysiologist practicing in Mason City and Waterloo, Iowa",
        "Text on the bottom of the screen throughout: Please see accompanying Important Safety Information, including Boxed Warning for supine hypertension, and full Prescribing Information.",
        "Dr. Olshansky: Orthostatic hypotension can be due to a variety of different conditions including blood loss, dehydration, medications, but there is not necessarily a defect in the autonomic nervous system. (nOH), a subset of orthostatic hypotension, is a condition in which there is a disordered response from the autonomic nervous system such that the blood pressure drops, but there is not a compensatory increase in heart rate.",
        "Frequently, neurogenic orthostatic hypotension is associated with underlying neurological conditions that may affect the way the autonomic nervous system responds to orthostatic stress.",
        "And what I mean by that is when a patient stands up from a sitting position, the blood pressure will drop 20 millimeters of mercury or more in systolic blood pressure or 10 millimeters of mercury or more in diastolic blood pressure and this condition tends to be an ongoing and chronic condition when it occurs.",
        "Typically, when I see a patient with neurogenic orthostatic hypotension, I don't know that that's their main problem. They often come to see me with other issues and complaints or they're referred to me. And some of the reasons that patients get referred to me or come to see me is because of conditions like loss of consciousness --so syncopy-- or they're just really weak and dizzy and fatigued.",
        "Many different things can cause the same symptoms, but some of the critical issues when it comes to neurogenic orthostatic hypotension are that the symptoms occur in the standing position and they occur also under specific time intervals such as early in the morning after a big meal, especially a big meal full of carbohydrates, and sometimes it requires a little extra time talking with the patient about some of their problems to really delve into the issue, and I suspect that sometimes the symptoms are missed because people are focusing on other issues rather than these particular symptoms."
      ]
    },
    treatmentconsiderations: {
      videoId: "6026824316001",
      transcript: [
        "Treatment Considerations for Symptomatic nOH\n\nInsights from an electrophysiologist",
        "Text: Brian Olshansky, MD - Professor emeritus at University of Iowa Cardiac electrophysiologist practicing in Mason City and Waterloo, Iowa",
        "Text on the bottom of the screen throughout: Please see accompanying Important Safety Information, including Boxed Warning for supine hypertension, and full Prescribing Information.",
        "Dr. Olshansky: Some of the reasons that patients get referred to me or come to see me is because of conditions like loss of consciousness --so syncopy-- or they're just really weak and dizzy and fatigued with prolonged standing, and they might not necessarily understand that their symptoms are related to position. And the symptoms are really often quite a problem and often this is ongoing and I will have to say as an electrophysiologist it's not uncommon that patients with these symptoms have these symptoms for months or years at a time and they've tried to accommodate.",
        "So the first thing I do is try to rule out any other potential cause for the symptoms. The goals of treating a patient with neurogenic orthostatic hypotension are to reduce symptoms that are affecting a patient in an adverse way. The goals are not to normalize blood pressure or to normalize autonomic responses. This may not be possible, but it could be possible with proper treatment to reduce symptoms in patients who have nOH.",
        "We want to make sure that the patient has the proper non-pharmacological interventions. In other words, making sure that the patient is well hydrated, is off vasodilators and other medications as can be tolerated, keeps the head of the bed, if possible, up to 30 degrees. Perhaps also is involved in some type of an exercise program and, if possible, to wear a compression hose as can be tolerated."
      ]
    }
  };
  function brightcoveUrl(videoId) {
    return `https://players.brightcove.net/${BRIGHTCOVE_ACCOUNT}/${BRIGHTCOVE_PLAYER}_default/index.html?videoId=${videoId}`;
  }
  function parse2(element, { document }) {
    const root = element.closest(".cmp-layout-left-section") || document.body;
    const allContainers = [...root.querySelectorAll(".cmp-videothumbnail__container")];
    const topContainers = allContainers.filter((c) => !c.parentElement.closest(".cmp-videothumbnail__container"));
    const outer = topContainers[0] || element;
    const cards = [...root.querySelectorAll(".cmp-videothumbnail")].filter((c) => c.querySelector("img"));
    if (!cards.length) {
      element.replaceWith(document.createTextNode(""));
      return;
    }
    const cells = [];
    const anyHeading = cards.some((c) => c.querySelector(".cmp-videothumbnail__description h3, h3, h2"));
    cards.forEach((card) => {
      const link = card.querySelector("a[href]");
      const href = normalizeHref2(link ? link.getAttribute("href") || link.href || "" : "");
      const img = card.querySelector("img");
      const headingEl = card.querySelector(".cmp-videothumbnail__description h3, h3, h2");
      const captionEl = headingEl || card.querySelector("p");
      const captionText = captionEl ? captionEl.textContent.trim() : "";
      const anchor = link ? link.id : "";
      const video = VIDEO_DATA[anchor];
      let imageCell = "";
      if (img) {
        const newImg = document.createElement("img");
        newImg.setAttribute("src", img.getAttribute("src") || img.src || "");
        newImg.setAttribute("alt", img.getAttribute("alt") || captionText);
        imageCell = newImg;
      }
      const body = document.createElement("div");
      if (captionText) {
        const h3 = document.createElement("h3");
        h3.textContent = captionText;
        body.appendChild(h3);
      }
      const cta = document.createElement("a");
      if (video) {
        const playerUrl = brightcoveUrl(video.videoId) + (anchor ? `#${anchor}` : "");
        cta.setAttribute("href", playerUrl);
      } else if (href) {
        cta.setAttribute("href", href);
      }
      cta.textContent = captionText || "Watch video";
      const ctaP = document.createElement("p");
      ctaP.appendChild(cta);
      body.appendChild(ctaP);
      if (video && video.transcript && video.transcript.length) {
        const transcript = document.createElement("div");
        transcript.className = "cards-video-transcript";
        video.transcript.forEach((para) => {
          para.split("\n").forEach((lineRaw) => {
            const line = lineRaw.trim();
            if (!line) return;
            const p = document.createElement("p");
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
      element.replaceWith(document.createTextNode(""));
      return;
    }
    const blockName = anyHeading ? "cards-video" : "cards-video (caption)";
    const block = WebImporter.Blocks.createBlock(document, { name: blockName, cells });
    const fragment = document.createDocumentFragment();
    const title = outer.querySelector(".cmp-title h1, h1");
    if (title) {
      const h1 = document.createElement("h1");
      h1.textContent = title.textContent.trim();
      fragment.appendChild(h1);
    }
    const introEl = [...outer.querySelectorAll(".cmp-text p, p")].find((p) => !p.closest(".cmp-videothumbnail") && p.textContent.trim().length > 40);
    if (introEl) {
      const p = document.createElement("p");
      p.textContent = introEl.textContent.trim();
      fragment.appendChild(p);
    }
    fragment.appendChild(block);
    outer.replaceWith(fragment);
    topContainers.slice(1).forEach((c) => {
      if (c.parentNode) c.remove();
    });
    root.querySelectorAll(".cmp-layout-quicklinks").forEach((el) => {
      if (!el.querySelector("a[href], h1, h2, h3, h4")) el.remove();
    });
    root.querySelectorAll('img[src*="teaser-bg"]').forEach((img) => {
      const wrapper = img.closest("p, div");
      if (wrapper && wrapper.parentNode) wrapper.remove();
      else if (img.parentNode) img.remove();
    });
  }

  // tools/importer/parsers/isi.js
  function parse3(element, { document }) {
    const abbreviatedCell = [];
    const barWrap = document.querySelector(".isi-mobile-wrap");
    const barFragment = barWrap ? barWrap.querySelector(".cq-dd-fragment") || barWrap : null;
    if (barFragment) {
      const barParagraphs = [...barFragment.querySelectorAll("p")].filter((p) => p.textContent.trim());
      barParagraphs.forEach((p) => {
        const clone = p.cloneNode(true);
        clone.querySelectorAll("a:not([href]), .openisi a").forEach((a) => {
          a.replaceWith(document.createTextNode(a.textContent));
        });
        abbreviatedCell.push(clone);
      });
    }
    if (!abbreviatedCell.length) {
      const p1 = document.createElement("p");
      p1.textContent = "Please see Important Safety Information, including Boxed Warning for supine hypertension.";
      const p2 = document.createElement("p");
      p2.append(document.createTextNode("For more information, see the full "));
      const piLink = document.createElement("a");
      piLink.href = "https://www.lundbeck.com/upload/us/files/pdf/Products/Northera_PI_US_EN.pdf";
      piLink.textContent = "Prescribing Information";
      p2.append(piLink);
      p2.append(document.createTextNode("."));
      abbreviatedCell.push(p1, p2);
    }
    const fullCell = [];
    const useSection = element.querySelector(".cmp-isi__use");
    if (useSection) fullCell.push(useSection);
    const safetySection = element.querySelector('.cmp-isi__importantsafety, [class*="cmp-isi__importantsafety"]');
    if (safetySection) fullCell.push(safetySection);
    if (!fullCell.length) {
      [...element.children].forEach((child) => {
        if (child.textContent.trim()) fullCell.push(child);
      });
    }
    if (!abbreviatedCell.length && !fullCell.length) {
      element.replaceWith(...element.childNodes);
      return;
    }
    const cells = [];
    cells.push([abbreviatedCell]);
    cells.push([fullCell]);
    const block = WebImporter.Blocks.createBlock(document, { name: "isi", cells });
    element.replaceWith(block);
  }

  // tools/importer/transformers/northera-cleanup.js
  var TransformHook = { beforeTransform: "beforeTransform", afterTransform: "afterTransform" };
  function transform(hookName, element, payload) {
    if (hookName === TransformHook.beforeTransform) {
      WebImporter.DOMUtils.remove(element, [
        ".leavingsite",
        "#hcpInterstitial",
        "#externallundbecksite",
        "#thirdpartyiInterstital",
        "#hcpWarning"
      ]);
      WebImporter.DOMUtils.remove(element, [".cmp-isi__model"]);
      WebImporter.DOMUtils.remove(element, [".cmp-layout-isi__desktop"]);
      WebImporter.DOMUtils.remove(element, [".cmp-specialist__result-section"]);
      WebImporter.DOMUtils.remove(element, [".cmp-modal", ".videopopup"]);
    }
    if (hookName === TransformHook.afterTransform) {
      WebImporter.DOMUtils.remove(element, [
        ".cmp-layout-header",
        ".desktop-header",
        ".touch-device-header",
        ".cmp-layout-footer"
      ]);
      WebImporter.DOMUtils.remove(element, ["#toTop"]);
      [...element.querySelectorAll(".cq-dd-fragment, .contentfragment")].forEach((frag) => {
        if (frag.closest(".cmp-layout-isi__phone")) return;
        if (/^\s*Please see Important Safety Information/i.test(frag.textContent || "")) {
          frag.remove();
        }
      });
      WebImporter.DOMUtils.remove(element, [
        "#destination_publishing_iframe_lundbeck_0",
        ".aamIframeLoaded",
        'iframe[src*="demdex.net"]',
        'iframe[src*="doubleclick"]',
        'iframe[src*="analytics.twitter"]',
        'iframe[src*="googletagmanager"]',
        'iframe[src*="facebook.com"]'
      ]);
      WebImporter.DOMUtils.remove(element, [
        "script",
        "style",
        "noscript",
        "link",
        "source"
      ]);
    }
  }

  // tools/importer/transformers/northera-sections.js
  var TransformHook2 = { beforeTransform: "beforeTransform", afterTransform: "afterTransform" };
  function transform2(hookName, element, payload) {
    if (hookName === TransformHook2.afterTransform) {
      const template = payload && payload.template;
      const sections = template && Array.isArray(template.sections) ? template.sections : [];
      if (sections.length < 2) return;
      const doc = element.ownerDocument;
      for (let i = sections.length - 1; i >= 0; i -= 1) {
        const section = sections[i];
        if (!section || !section.selector) continue;
        const target = element.querySelector(section.selector);
        if (!target) continue;
        if (section.style) {
          const meta = WebImporter.Blocks.createBlock(doc, {
            name: "Section Metadata",
            cells: { style: section.style }
          });
          if (target.nextSibling) {
            target.parentNode.insertBefore(meta, target.nextSibling);
          } else {
            target.parentNode.appendChild(meta);
          }
        }
        if (i > 0 && target.parentNode) {
          const hr = doc.createElement("hr");
          target.parentNode.insertBefore(hr, target);
        }
      }
    }
  }

  // tools/importer/import-additional-resources-page.js
  var PAGE_TEMPLATE = {
    name: "additional-resources-page",
    description: 'HCP Additional Resources page: a grid of PDF download resource cards (cards-resource: thumbnail + heading + description + DOWNLOAD button), a grid of video thumbnail cards with plain grey captions (cards-video caption variant, each linking to a video experience fragment), then ISI content. No visible page heading (the "for HCP" H1 lives in a hidden interstitial modal).',
    urls: [
      "https://northera-stage.d.lundbeckus.com/for-healthcare-professionals/additional-resources"
    ],
    blocks: [
      {
        name: "cards-resource",
        instances: [
          ".cmp-layout__patientsupport .cmp-imagetext__link"
        ]
      },
      {
        name: "cards-video",
        instances: [
          ".cmp-videothumbnail__subcontainer"
        ]
      },
      {
        name: "isi",
        instances: [
          "div.responsivegrid.cmp-layout-isi__phone .experiencefragment"
        ]
      }
    ],
    sections: [
      { id: "ar-resources", name: "Downloadable resources (PDF cards) + video library", selector: ".cmp-layout-left-section", style: null, blocks: ["cards-resource", "cards-video"], defaultContent: [] },
      { id: "ar-isi", name: "Important Safety Information", selector: "div.responsivegrid.cmp-layout-isi__phone", style: null, blocks: ["isi"], defaultContent: [] }
    ]
  };
  var parsers = {
    "cards-resource": parse,
    "cards-video": parse2,
    isi: parse3
  };
  var transformers = [
    transform,
    ...PAGE_TEMPLATE.sections && PAGE_TEMPLATE.sections.length > 1 ? [transform2] : []
  ];
  function executeTransformers(hookName, element, payload) {
    const enhancedPayload = __spreadProps(__spreadValues({}, payload), { template: PAGE_TEMPLATE });
    transformers.forEach((transformerFn) => {
      try {
        transformerFn.call(null, hookName, element, enhancedPayload);
      } catch (e) {
        console.error(`Transformer failed at ${hookName}:`, e);
      }
    });
  }
  function findBlocksOnPage(document, template) {
    const pageBlocks = [];
    const seen = /* @__PURE__ */ new Set();
    template.blocks.forEach((blockDef) => {
      blockDef.instances.forEach((selector) => {
        const elements = document.querySelectorAll(selector);
        if (elements.length === 0) {
          console.warn(`Block "${blockDef.name}" selector not found: ${selector}`);
        }
        elements.forEach((element) => {
          if (seen.has(element)) return;
          seen.add(element);
          pageBlocks.push({
            name: blockDef.name,
            selector,
            element,
            section: blockDef.section || null
          });
        });
      });
    });
    console.log(`Found ${pageBlocks.length} block instances on page`);
    return pageBlocks;
  }
  var import_additional_resources_page_default = {
    transform: (payload) => {
      const {
        document,
        url,
        html,
        params
      } = payload;
      const main = document.body;
      executeTransformers("beforeTransform", main, payload);
      const pageBlocks = findBlocksOnPage(document, PAGE_TEMPLATE);
      pageBlocks.forEach((block) => {
        if (!block.element.parentNode) return;
        const parser = parsers[block.name];
        if (parser) {
          try {
            parser(block.element, { document, url, params });
          } catch (e) {
            console.error(`Failed to parse ${block.name} (${block.selector}):`, e);
          }
        } else {
          console.warn(`No parser found for block: ${block.name}`);
        }
      });
      executeTransformers("afterTransform", main, payload);
      const hr = document.createElement("hr");
      main.appendChild(hr);
      WebImporter.rules.createMetadata(main, document);
      WebImporter.rules.transformBackgroundImages(main, document);
      WebImporter.rules.adjustImageUrls(main, url, params.originalURL);
      const path = WebImporter.FileUtils.sanitizePath(
        new URL(params.originalURL).pathname.replace(/\/$/, "").replace(/\.html$/, "")
      );
      return [{
        element: main,
        path,
        report: {
          title: document.title,
          template: PAGE_TEMPLATE.name,
          blocks: pageBlocks.map((b) => b.name)
        }
      }];
    }
  };
  return __toCommonJS(import_additional_resources_page_exports);
})();
