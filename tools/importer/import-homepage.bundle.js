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

  // tools/importer/import-homepage.js
  var import_homepage_exports = {};
  __export(import_homepage_exports, {
    default: () => import_homepage_default
  });

  // tools/importer/parsers/columns-banner.js
  function parse(element, { document }) {
    const image = element.querySelector(".cmp-image img, img.cmp-image__image");
    const textContainer = element.querySelector(".cmp-text, .text .cmp-text");
    const heading = textContainer ? textContainer.querySelector("h4, h3, h2") : element.querySelector("h4, h3, h2");
    const paragraph = textContainer ? textContainer.querySelector("p") : element.querySelector("p");
    const contentCell = [];
    if (heading) contentCell.push(heading);
    if (paragraph) contentCell.push(paragraph);
    const cells = [
      [image || "", contentCell.length > 0 ? contentCell : ""]
    ];
    const block = WebImporter.Blocks.createBlock(document, { name: "columns-banner", cells });
    element.replaceWith(block);
  }

  // tools/importer/parsers/hero-patient.js
  function parse2(element, { document }) {
    const firstTeaser = element.querySelector(".cmp-teaser");
    const image = firstTeaser ? firstTeaser.querySelector(".cmp-teaser__image .cmp-image__image") : element.querySelector("img.cmp-image__image, img");
    const ctaLink = firstTeaser ? firstTeaser.querySelector(".cmp-teaser__action-link") : element.querySelector("a.cmp-teaser__action-link, a");
    const cells = [];
    const contentCell = [];
    if (image) {
      contentCell.push(image);
    }
    if (ctaLink) {
      const p = document.createElement("p");
      p.appendChild(ctaLink);
      contentCell.push(p);
    }
    if (contentCell.length > 0) {
      cells.push([contentCell]);
    }
    const block = WebImporter.Blocks.createBlock(document, { name: "hero-patient", cells });
    element.replaceWith(block);
  }

  // tools/importer/parsers/cards-cta.js
  function parse3(element, { document }) {
    const container = element.closest(".cmp-layout-quicklinks") || element.parentElement;
    if (container.querySelector("table")) {
      element.replaceWith(document.createTextNode(""));
      return;
    }
    const cardElements = container.querySelectorAll(".image-text-cta");
    const cells = [];
    cardElements.forEach((card) => {
      const headingEl = card.querySelector(".cmp-imagetext__description h3, h3");
      const descEl = card.querySelector(".cmp-imagetext__description p, p");
      const linkEl = card.querySelector("a.cmp-imagetext__link, a[href]");
      const href = linkEl ? linkEl.href || linkEl.getAttribute("href") || "" : "";
      const buttonTextEl = card.querySelector(".cmp-label-text, button span, .cmp-text-cta button");
      const buttonLabel = buttonTextEl ? buttonTextEl.textContent.trim() : "";
      const cellContent = document.createElement("div");
      if (headingEl) {
        const h3 = document.createElement("h3");
        h3.textContent = headingEl.textContent.trim();
        cellContent.appendChild(h3);
      }
      if (descEl) {
        const p = document.createElement("p");
        p.textContent = descEl.textContent.trim();
        cellContent.appendChild(p);
      }
      if (href) {
        const cta = document.createElement("a");
        cta.setAttribute("href", href);
        cta.textContent = buttonLabel || "Learn More";
        const ctaP = document.createElement("p");
        ctaP.appendChild(cta);
        cellContent.appendChild(ctaP);
      }
      if (cellContent.childNodes.length > 0) {
        cells.push([[cellContent]]);
      }
    });
    const block = WebImporter.Blocks.createBlock(document, { name: "cards-cta", cells });
    element.replaceWith(block);
  }

  // tools/importer/transformers/northera-cleanup.js
  var TransformHook = { beforeTransform: "beforeTransform", afterTransform: "afterTransform" };
  function transform(hookName, element, payload) {
    if (hookName === TransformHook.beforeTransform) {
      WebImporter.DOMUtils.remove(element, [".leavingsite"]);
      WebImporter.DOMUtils.remove(element, [".isi-model"]);
      WebImporter.DOMUtils.remove(element, [".embedhtml"]);
    }
    if (hookName === TransformHook.afterTransform) {
      WebImporter.DOMUtils.remove(element, [".cmp-layout-header"]);
      WebImporter.DOMUtils.remove(element, [".cmp-layout-footer"]);
      WebImporter.DOMUtils.remove(element, [".isi-warning-wrap"]);
      WebImporter.DOMUtils.remove(element, [".cmp-layout-isi__desktop"]);
      WebImporter.DOMUtils.remove(element, ["#toTop"]);
      WebImporter.DOMUtils.remove(element, ["iframe"]);
      WebImporter.DOMUtils.remove(element, ['[id^="batBeacon"]']);
      WebImporter.DOMUtils.remove(element, ["link"]);
      WebImporter.DOMUtils.remove(element, ["noscript"]);
    }
  }

  // tools/importer/transformers/northera-sections.js
  var TransformHook2 = { beforeTransform: "beforeTransform", afterTransform: "afterTransform" };
  function transform2(hookName, element, payload) {
    if (hookName === TransformHook2.afterTransform) {
      const { document } = payload;
      const sections = payload.template && payload.template.sections;
      if (!sections || sections.length < 2) return;
      const reversedSections = [...sections].reverse();
      reversedSections.forEach((section, reverseIndex) => {
        const originalIndex = sections.length - 1 - reverseIndex;
        const sectionEl = element.querySelector(section.selector);
        if (!sectionEl) return;
        if (section.style) {
          const sectionMetadata = WebImporter.Blocks.createBlock(document, {
            name: "Section Metadata",
            cells: { style: section.style }
          });
          sectionEl.after(sectionMetadata);
        }
        if (originalIndex > 0) {
          const hr = document.createElement("hr");
          sectionEl.before(hr);
        }
      });
    }
  }

  // tools/importer/import-homepage.js
  var parsers = {
    "columns-banner": parse,
    "hero-patient": parse2,
    "cards-cta": parse3
  };
  var PAGE_TEMPLATE = {
    name: "homepage",
    description: "NORTHERA main homepage with banner, hero, CTA cards, and ISI content",
    urls: [
      "https://www.northera.com/"
    ],
    blocks: [
      {
        name: "columns-banner",
        instances: [".responsivegrid.ask-for-northera"]
      },
      {
        name: "hero-patient",
        instances: [".random-hero.cmp-hero-banner__desktop"]
      },
      {
        name: "cards-cta",
        instances: [".cmp-layout-quicklinks .image-text-cta"]
      }
    ],
    sections: [
      {
        id: "section-1",
        name: "Ask for NORTHERA Banner",
        selector: ".responsivegrid.ask-for-northera",
        style: null,
        blocks: ["columns-banner"],
        defaultContent: []
      },
      {
        id: "section-2",
        name: "Hero with Patient Stories",
        selector: ".cmp-layout__herobanner",
        style: null,
        blocks: ["hero-patient"],
        defaultContent: [".text.cmp-text__home_page"]
      },
      {
        id: "section-3",
        name: "Quick Links Cards",
        selector: ".cmp-layout-quicklinks",
        style: "dark-teal",
        blocks: ["cards-cta"],
        defaultContent: []
      },
      {
        id: "section-4",
        name: "ISI Reference Bar",
        selector: ".isi-mobile-wrap",
        style: null,
        blocks: [],
        defaultContent: [".isi-mobile-wrap .cq-dd-fragment p"]
      },
      {
        id: "section-5",
        name: "ISI Full Content",
        selector: ".cmp-layout-isi__phone",
        style: "isi",
        blocks: [],
        defaultContent: [".cmp-isi__use", ".cmp-isi__importantsafety", ".cmp-isi__warningbox"]
      }
    ]
  };
  var transformers = [
    transform,
    transform2
  ];
  function executeTransformers(hookName, element, payload) {
    const enhancedPayload = __spreadProps(__spreadValues({}, payload), {
      template: PAGE_TEMPLATE
    });
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
    template.blocks.forEach((blockDef) => {
      blockDef.instances.forEach((selector) => {
        const elements = document.querySelectorAll(selector);
        elements.forEach((element) => {
          pageBlocks.push({
            name: blockDef.name,
            selector,
            element,
            section: blockDef.section || null
          });
        });
      });
    });
    return pageBlocks;
  }
  var import_homepage_default = {
    transform: (payload) => {
      const { document, url, params } = payload;
      const main = document.body;
      executeTransformers("beforeTransform", main, payload);
      const pageBlocks = findBlocksOnPage(document, PAGE_TEMPLATE);
      pageBlocks.forEach((block) => {
        const parser = parsers[block.name];
        if (parser) {
          try {
            parser(block.element, { document, url, params });
          } catch (e) {
            console.error(`Failed to parse ${block.name} (${block.selector}):`, e);
          }
        }
      });
      executeTransformers("afterTransform", main, payload);
      const hr = document.createElement("hr");
      main.appendChild(hr);
      WebImporter.rules.createMetadata(main, document);
      WebImporter.rules.transformBackgroundImages(main, document);
      WebImporter.rules.adjustImageUrls(main, url, params.originalURL);
      const path = WebImporter.FileUtils.sanitizePath(
        new URL(params.originalURL).pathname.replace(/\/$/, "").replace(/\.html$/, "") || "/index"
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
  return __toCommonJS(import_homepage_exports);
})();
