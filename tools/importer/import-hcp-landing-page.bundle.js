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

  // tools/importer/import-hcp-landing-page.js
  var import_hcp_landing_page_exports = {};
  __export(import_hcp_landing_page_exports, {
    default: () => import_hcp_landing_page_default
  });

  // tools/importer/parsers/daw-banner.js
  function parse(element, { document }) {
    const image = element.querySelector(".cmp-image img, img.cmp-image__image, img");
    const textContainer = element.querySelector(".cmp-text, .text .cmp-text");
    const heading = textContainer ? textContainer.querySelector("h4, h3, h2") : element.querySelector("h4, h3, h2");
    const paragraph = textContainer ? textContainer.querySelector("p") : element.querySelector("p");
    const contentCell = [];
    if (heading) contentCell.push(heading);
    if (paragraph) contentCell.push(paragraph);
    const cells = [
      [image || "", contentCell.length ? contentCell : ""]
    ];
    const block = WebImporter.Blocks.createBlock(document, { name: "columns-banner (daw)", cells });
    element.replaceWith(block);
  }

  // tools/importer/parsers/hero-hcp.js
  function parse2(element, { document }) {
    const bgImg = element.querySelector("img");
    let bgCell = "";
    if (bgImg) {
      const src = (bgImg.getAttribute("src") || bgImg.src || "").replace(/northera-HCP-bg-desktop\.png/i, "northera-HCP-bg-mobile.png");
      const img = document.createElement("img");
      img.setAttribute("src", src);
      img.setAttribute("alt", bgImg.getAttribute("alt") || "");
      bgCell = img;
    }
    const content = document.createElement("div");
    const h1 = element.querySelector("h1");
    if (h1) {
      const el = document.createElement("h1");
      el.textContent = h1.textContent.trim();
      content.appendChild(el);
    }
    const h5 = element.querySelector("h5");
    if (h5) {
      const el = document.createElement("h5");
      el.innerHTML = h5.innerHTML;
      content.appendChild(el);
    }
    const indication = [...element.querySelectorAll("p")].map((p) => p.textContent.trim()).filter((t) => t.length > 40).sort((a, b) => b.length - a.length)[0];
    if (indication) {
      const p = document.createElement("p");
      p.textContent = indication;
      content.appendChild(p);
    }
    const block = WebImporter.Blocks.createBlock(document, {
      name: "hero-hcp",
      cells: [
        [bgCell],
        [content]
      ]
    });
    element.replaceWith(block);
  }

  // tools/importer/parsers/quote-grid.js
  function parse3(element, { document }) {
    const cards = [...element.querySelectorAll(".cmp-teaser")].filter((t) => t.querySelector(".cmp-teaser__title, h2"));
    const cells = [];
    cards.forEach((card) => {
      const quotationEl = card.querySelector(".cmp-teaser__title, h2");
      const attributionEl = card.querySelector(".cmp-teaser__description p, p");
      const quotation = quotationEl ? quotationEl.textContent.trim() : "";
      const attribution = attributionEl ? attributionEl.textContent.trim() : "";
      if (!quotation) return;
      const qCell = document.createElement("div");
      qCell.textContent = quotation;
      const aCell = document.createElement("div");
      aCell.textContent = attribution;
      cells.push([qCell, aCell]);
    });
    if (!cells.length) {
      element.replaceWith(document.createTextNode(""));
      return;
    }
    const footnoteEl = [...element.querySelectorAll("p")].find((p) => /^\*/.test(p.textContent.trim()));
    if (footnoteEl) {
      const fnCell = document.createElement("div");
      fnCell.textContent = footnoteEl.textContent.trim();
      cells.push([fnCell]);
    }
    const block = WebImporter.Blocks.createBlock(document, { name: "quote-grid", cells });
    element.replaceWith(block);
  }

  // tools/importer/parsers/fragment-isi.js
  var ISI_FRAGMENT_PATH = "/fragments/northera-isi";
  function parse4(element, { document }) {
    const link = document.createElement("a");
    link.setAttribute("href", ISI_FRAGMENT_PATH);
    link.textContent = ISI_FRAGMENT_PATH;
    const block = WebImporter.Blocks.createBlock(document, {
      name: "Fragment",
      cells: [[link]]
    });
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
        'iframe[src*="facebook.com"]',
        // Google reCAPTCHA challenge/badge iframes (injected by the survey form's
        // reCAPTCHA JS, appended to the body outside the form). The static survey
        // replica does not include reCAPTCHA, so these are stray.
        'iframe[src*="google.com/recaptcha"]',
        'iframe[src*="recaptcha"]',
        ".grecaptcha-badge"
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

  // tools/importer/import-hcp-landing-page.js
  var PAGE_TEMPLATE = {
    name: "hcp-landing-page",
    description: 'HCP landing page: a blue "Dispense as written (DAW)" icon callout, a hero banner (flamingo/sky background with overlaid white heading + subhead + indication), a 3-up physician/patient quote grid with a footnote, then ISI content. The hero is desktop-only in the source; a matching responsive background handles mobile.',
    urls: [
      "https://northera-stage.d.lundbeckus.com/for-healthcare-professionals"
    ],
    blocks: [
      {
        name: "daw-banner",
        instances: [
          ".write-daw"
        ]
      },
      {
        name: "hero-hcp",
        instances: [
          ".lu-cmp-teaser.aem-GridColumn--phone--hide"
        ]
      },
      {
        name: "quote-grid",
        instances: [
          ".cmp-layout__searchresult"
        ]
      },
      {
        // Reference the shared ISI fragment instead of inlining the ISI content.
        name: "fragment-isi",
        instances: [
          "div.responsivegrid.cmp-layout-isi__phone .experiencefragment"
        ]
      }
    ],
    sections: [
      { id: "hcp-daw", name: "Dispense as written callout", selector: ".write-daw", style: null, blocks: ["daw-banner"], defaultContent: [] },
      { id: "hcp-hero", name: "Hero banner", selector: ".lu-cmp-teaser.aem-GridColumn--phone--hide", style: null, blocks: ["hero-hcp"], defaultContent: [] },
      { id: "hcp-quotes", name: "Physician & patient quotes", selector: ".cmp-layout__searchresult", style: null, blocks: ["quote-grid"], defaultContent: [] },
      { id: "hcp-isi", name: "Important Safety Information", selector: "div.responsivegrid.cmp-layout-isi__phone", style: null, blocks: ["fragment-isi"], defaultContent: [] }
    ]
  };
  var parsers = {
    "daw-banner": parse,
    "hero-hcp": parse2,
    "quote-grid": parse3,
    "fragment-isi": parse4
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
  var import_hcp_landing_page_default = {
    transform: (payload) => {
      const {
        document,
        url,
        html,
        params
      } = payload;
      const main = document.body;
      executeTransformers("beforeTransform", main, payload);
      main.querySelectorAll(".lu-cmp-teaser.aem-GridColumn--phone--none").forEach((el) => {
        if (/Distinctive\. Effective\. Focused\./i.test(el.textContent)) el.remove();
      });
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
  return __toCommonJS(import_hcp_landing_page_exports);
})();
