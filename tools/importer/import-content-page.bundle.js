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

  // tools/importer/import-content-page.js
  var import_content_page_exports = {};
  __export(import_content_page_exports, {
    default: () => import_content_page_default
  });

  // tools/importer/parsers/embed.js
  function parse(element, { document }) {
    var _a;
    const container = element.querySelector(".brightcove-container, [data-video-id]");
    const account = (container == null ? void 0 : container.getAttribute("data-account")) || "4804905851001";
    const player = (container == null ? void 0 : container.getAttribute("data-player")) || "zVTrglcf3";
    const videoId = (container == null ? void 0 : container.getAttribute("data-video-id")) || "6068962892001";
    const playerUrl = `https://players.brightcove.com/${account}/${player}_default/index.html?videoId=${videoId}`;
    const contentCell = [];
    const poster = (_a = container == null ? void 0 : container.querySelector("video[poster]")) == null ? void 0 : _a.getAttribute("poster");
    if (poster) {
      const img = document.createElement("img");
      img.src = poster;
      img.alt = "";
      contentCell.push(img);
    }
    const link = document.createElement("a");
    link.href = playerUrl;
    link.textContent = playerUrl;
    contentCell.push(link);
    const cells = [];
    cells.push([contentCell]);
    const block = WebImporter.Blocks.createBlock(document, { name: "embed", cells });
    element.replaceWith(block);
  }

  // tools/importer/parsers/accordion.js
  function parse2(element, { document }) {
    const items = element.querySelectorAll(".cmp-accordion__item");
    const cells = [];
    items.forEach((item) => {
      const titleEl = item.querySelector(".cmp-accordion__title, .cmp-accordion__header, .cmp-accordion__button");
      const titleText = titleEl ? titleEl.textContent.trim() : "";
      const panel = item.querySelector(".cmp-accordion__panel");
      const bodyCell = [];
      let transcript = panel == null ? void 0 : panel.querySelector("#text-3822de58db");
      if (!transcript && panel) {
        const textBlocks = [...panel.querySelectorAll(".cmp-text")].filter((tb) => !tb.closest('.experiencefragment, .cmp-isi__use, [class*="isi"]'));
        transcript = textBlocks[0] || null;
      }
      if (transcript) {
        const paragraphs = transcript.querySelectorAll("p");
        if (paragraphs.length) {
          paragraphs.forEach((p) => bodyCell.push(p));
        } else {
          bodyCell.push(transcript);
        }
      }
      if (titleText || bodyCell.length) {
        const titleCell = document.createElement("p");
        titleCell.textContent = titleText;
        cells.push([titleCell, bodyCell.length ? bodyCell : ""]);
      }
    });
    if (!cells.length) {
      element.replaceWith(...element.childNodes);
      return;
    }
    const block = WebImporter.Blocks.createBlock(document, { name: "accordion", cells });
    element.replaceWith(block);
  }

  // tools/importer/parsers/quote.js
  function parse3(element, { document }) {
    const paragraphs = [...element.querySelectorAll(":scope > p, p")];
    const quotation = paragraphs[0] || null;
    const attribution = paragraphs[1] || null;
    if (!quotation) {
      element.replaceWith(...element.childNodes);
      return;
    }
    quotation.textContent = quotation.textContent.trim().replace(/^[“"]+/, "").replace(/[”"]+$/, "");
    if (attribution) {
      attribution.textContent = attribution.textContent.trim().replace(/^[—–-]+\s*/, "");
    }
    const cells = [];
    cells.push([quotation]);
    if (attribution) {
      cells.push([attribution]);
    }
    const block = WebImporter.Blocks.createBlock(document, { name: "quote", cells });
    element.replaceWith(block);
  }

  // tools/importer/parsers/cards.js
  function parse4(element, { document }) {
    const teasers = [...element.querySelectorAll(".lu-cmp-teaser")];
    const cells = [];
    teasers.forEach((teaser) => {
      const img = teaser.querySelector(".cmp-teaser__image img, img");
      const desc = teaser.querySelector(".cmp-teaser__description");
      const contentCell = [];
      if (desc) {
        [...desc.children].forEach((child) => {
          const hasText = child.textContent.trim().length > 0;
          const hasMedia = child.querySelector && child.querySelector("li, img, a");
          if (hasText || hasMedia) {
            contentCell.push(child);
          }
        });
      }
      if (img || contentCell.length) {
        cells.push([
          img || "",
          contentCell.length ? contentCell : ""
        ]);
      }
    });
    if (!cells.length) {
      element.replaceWith(...element.childNodes);
      return;
    }
    const block = WebImporter.Blocks.createBlock(document, { name: "cards", cells });
    const nameCell = block.querySelector("tr th, tr td");
    if (nameCell) {
      nameCell.textContent = "Cards (image-left)";
    }
    element.replaceWith(block);
  }

  // tools/importer/parsers/isi.js
  function parse5(element, { document }) {
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
    }
    if (hookName === TransformHook.afterTransform) {
      WebImporter.DOMUtils.remove(element, [
        ".cmp-layout-header",
        ".desktop-header",
        ".touch-device-header",
        ".cmp-layout-footer"
      ]);
      WebImporter.DOMUtils.remove(element, ["#toTop"]);
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

  // tools/importer/import-content-page.js
  var PAGE_TEMPLATE = {
    name: "content-page",
    description: "Standard patient content page: hero/title + intro, Brightcove video with transcript accordion, image+text blocks, patient quote, icon step callouts (reminders), and safety/ISI content.",
    urls: [
      "https://northera-stage.d.lundbeckus.com/about-northera/taking-northera"
    ],
    blocks: [
      {
        name: "embed",
        instances: [
          "div.container.responsivegrid.cmp-video_bglightblue",
          "div.brightcoveplayer"
        ]
      },
      {
        name: "accordion",
        instances: [
          "div.accordion.panelcontainer",
          "div.cmp-accordion"
        ]
      },
      {
        name: "quote",
        instances: [
          "div.cmp-imagetext__verticalmiddle div.cmp-text"
        ]
      },
      {
        name: "cards",
        instances: [
          "div#importantreminders.cmp-container",
          "div.cmp-image__textlist.cmp-layout-imagetext_teaser"
        ],
        section: "image-left"
      },
      {
        name: "isi",
        instances: [
          "div.responsivegrid.cmp-layout-isi__phone .experiencefragment",
          "div.cmp-isi__use"
        ]
      }
    ],
    sections: [
      { id: "rc2-intro-titration", name: "Page intro + What is titration", selector: "div.responsivegrid.taking-northera", style: null, blocks: [], defaultContent: [] },
      { id: "rc2-video-transcript", name: "Titration explainer video + Read the transcript", selector: "div.container.responsivegrid.cmp-video_bglightblue.cmp-videobutton__center", style: null, blocks: ["embed", "accordion"], defaultContent: [] },
      { id: "rc2-patient-quote", name: "Patient quote (Gail)", selector: "div.responsivegrid.cmp-imagetext__verticalmiddle", style: null, blocks: ["quote"], defaultContent: [] },
      { id: "rc2-capsules-imagetext", name: "Capsules image + text; How will I know", selector: "div#container-fb2722e6a6.cmp-container", style: null, blocks: [], defaultContent: [] },
      { id: "rc2-important-reminders", name: "Important reminders when taking NORTHERA", selector: "div#importantreminders.cmp-container", style: null, blocks: ["cards"], defaultContent: [] },
      { id: "rc2-safety-side-effects", name: "NORTHERA safety and side effects", selector: "div.responsivegrid.cmp-bullet__list", style: null, blocks: [], defaultContent: [] },
      { id: "rc2-isi", name: "Important Safety Information", selector: "div.responsivegrid.cmp-layout-isi__phone", style: null, blocks: ["isi"], defaultContent: [] }
    ]
  };
  var parsers = {
    embed: parse,
    accordion: parse2,
    quote: parse3,
    cards: parse4,
    isi: parse5
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
  var import_content_page_default = {
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
  return __toCommonJS(import_content_page_exports);
})();
