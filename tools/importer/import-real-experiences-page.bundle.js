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

  // tools/importer/import-real-experiences-page.js
  var import_real_experiences_page_exports = {};
  __export(import_real_experiences_page_exports, {
    default: () => import_real_experiences_page_default
  });

  // tools/importer/parsers/cards-video.js
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
    const root = element.closest(".cmp-layout-left-section") || document.body;
    if (root.querySelector("table")) {
      element.replaceWith(document.createTextNode(""));
      return;
    }
    const containers = [...root.querySelectorAll(".cmp-videothumbnail__container")];
    const outer = containers.find((c) => !c.parentElement.closest(".cmp-videothumbnail__container")) || element;
    const cards = [...root.querySelectorAll(".cmp-videothumbnail")];
    const cells = [];
    cards.forEach((card) => {
      const link = card.querySelector("a[href]");
      const href = normalizeHref(link ? link.getAttribute("href") || link.href || "" : "");
      const img = card.querySelector("img");
      const headingEl = card.querySelector(".cmp-videothumbnail__description h3, h3, h2");
      const headingText = headingEl ? headingEl.textContent.trim() : "";
      let imageCell = "";
      if (img) {
        const newImg = document.createElement("img");
        newImg.setAttribute("src", img.getAttribute("src") || img.src || "");
        newImg.setAttribute("alt", img.getAttribute("alt") || headingText);
        imageCell = newImg;
      }
      const body = document.createElement("div");
      if (headingText) {
        const h3 = document.createElement("h3");
        h3.textContent = headingText;
        body.appendChild(h3);
      }
      if (href) {
        const cta = document.createElement("a");
        cta.setAttribute("href", href);
        cta.textContent = headingText || "Watch video";
        const p = document.createElement("p");
        p.appendChild(cta);
        body.appendChild(p);
      }
      if (imageCell || body.childNodes.length) {
        cells.push([imageCell, body]);
      }
    });
    if (!cells.length) {
      element.replaceWith(document.createTextNode(""));
      return;
    }
    const block = WebImporter.Blocks.createBlock(document, { name: "cards-video", cells });
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
  }

  // tools/importer/parsers/isi.js
  function parse2(element, { document }) {
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

  // tools/importer/import-real-experiences-page.js
  var PAGE_TEMPLATE = {
    name: "real-experiences-page",
    description: "Real experiences page: H1 + intro paragraph (default content) followed by a 2x2 grid of video thumbnail cards (cards-video: thumbnail image + heading linking to a video experience fragment), then ISI content.",
    urls: [
      "https://northera-stage.d.lundbeckus.com/about-northera/real-experiences-with-northera"
    ],
    blocks: [
      {
        name: "cards-video",
        instances: [
          ".cmp-videothumbnail__container"
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
      { id: "re-experiences", name: "Real experiences (heading + intro + video cards)", selector: ".cmp-layout-left-section", style: null, blocks: ["cards-video"], defaultContent: [] },
      { id: "re-isi", name: "Important Safety Information", selector: "div.responsivegrid.cmp-layout-isi__phone", style: null, blocks: ["isi"], defaultContent: [] }
    ]
  };
  var parsers = {
    "cards-video": parse,
    isi: parse2
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
  var import_real_experiences_page_default = {
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
  return __toCommonJS(import_real_experiences_page_exports);
})();
