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

  // tools/importer/parsers/columns.js
  function parse(element, { document }) {
    const image = element.querySelector(".cmp-image img, img.cmp-image__image, img");
    const textContainer = element.querySelector(".cmp-text") || element.querySelector(".text");
    const textCell = [];
    if (textContainer) {
      [...textContainer.children].forEach((child) => {
        if (child.textContent.trim() || child.querySelector("img, a")) {
          textCell.push(child);
        }
      });
    }
    if (!textCell.length) {
      [...element.querySelectorAll("p, ul")].forEach((el) => {
        if (!el.closest(".cmp-image") && (el.textContent.trim() || el.querySelector("a"))) {
          textCell.push(el);
        }
      });
    }
    if (!image && !textCell.length) {
      element.replaceWith(...element.childNodes);
      return;
    }
    const cells = [
      [image || "", textCell.length ? textCell : ""]
    ];
    const block = WebImporter.Blocks.createBlock(document, { name: "columns (icon-text)", cells });
    element.replaceWith(block);
  }

  // tools/importer/parsers/hero-patient.js
  function parse2(element, { document }) {
    const firstTeaser = element.querySelector(".cmp-teaser");
    const image = firstTeaser ? firstTeaser.querySelector(".cmp-teaser__image .cmp-image__image, img") : element.querySelector("img.cmp-image__image, img");
    const actionLinks = [...element.querySelectorAll("a.cmp-teaser__action-link")];
    const sourceCta = actionLinks.find((a) => a.textContent.trim()) || element.querySelector("a[href]") || null;
    const leadEl = element.querySelector(".cmp-imagetext__description p, .cmp-imagetext__description");
    const cells = [];
    cells.push([image || ""]);
    const contentCell = [];
    if (leadEl && leadEl.textContent.trim()) {
      const lead = document.createElement("p");
      lead.textContent = leadEl.textContent.trim();
      contentCell.push(lead);
    }
    if (sourceCta) {
      const cta = document.createElement("a");
      cta.setAttribute("href", sourceCta.getAttribute("href") || sourceCta.href || "");
      cta.textContent = sourceCta.textContent.trim() || "Learn More";
      const p = document.createElement("p");
      p.appendChild(cta);
      contentCell.push(p);
    }
    cells.push([contentCell.length ? contentCell : ""]);
    const disclaimerEl = element.querySelector(".cmp-text__home_page p, .cmp-text__home_page");
    let disclaimer = null;
    if (disclaimerEl && /real patients and care partners/i.test(disclaimerEl.textContent)) {
      disclaimer = document.createElement("p");
      disclaimer.textContent = disclaimerEl.textContent.trim();
    }
    const block = WebImporter.Blocks.createBlock(document, { name: "hero-patient", cells });
    element.replaceWith(block);
    if (disclaimer) block.after(disclaimer);
    const sectionMeta = WebImporter.Blocks.createBlock(document, {
      name: "Section Metadata",
      cells: { Style: "home-intro" }
    });
    (disclaimer || block).after(sectionMeta);
  }

  // tools/importer/parsers/cards-cta.js
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
  function parse3(element, { document }) {
    const container = element.closest(".cmp-layout-quicklinks") || element.parentElement;
    if (container.querySelector("table")) {
      element.replaceWith(document.createTextNode(""));
      return;
    }
    const cardElements = container.querySelectorAll(".image-text-cta");
    if (cardElements.length === 0) {
      const cellContent = document.createElement("div");
      const headingEl = container.querySelector(".cmp-text h2, .cmp-text h3, h2, h3");
      if (headingEl) {
        const h3 = document.createElement("h3");
        h3.textContent = headingEl.textContent.trim();
        cellContent.appendChild(h3);
      }
      const descEl = container.querySelector(".cmp-text p, p");
      if (descEl) {
        const p = document.createElement("p");
        p.textContent = descEl.textContent.trim();
        cellContent.appendChild(p);
      }
      const linkEl = container.querySelector("a.cmp-button, a[href]");
      if (linkEl) {
        const href = normalizeHref(linkEl.getAttribute("href") || linkEl.href || "");
        const labelEl = linkEl.querySelector(".cmp-button__text, .cmp-label-text");
        const label = (labelEl ? labelEl.textContent : linkEl.textContent).trim();
        if (href) {
          const cta = document.createElement("a");
          cta.setAttribute("href", href);
          cta.textContent = label || "Learn More";
          const ctaP = document.createElement("p");
          ctaP.appendChild(cta);
          cellContent.appendChild(ctaP);
        }
      }
      if (cellContent.childNodes.length > 0) {
        const block2 = WebImporter.Blocks.createBlock(document, {
          name: "cards-cta (centered)",
          cells: [[[cellContent]]]
        });
        element.replaceWith(block2);
      } else {
        element.replaceWith(document.createTextNode(""));
      }
      return;
    }
    const cells = [];
    cardElements.forEach((card) => {
      const headingEl = card.querySelector(".cmp-imagetext__description h3, h3");
      const descEl = card.querySelector(".cmp-imagetext__description p, p");
      const linkEl = card.querySelector("a.cmp-imagetext__link, a[href]");
      const href = normalizeHref(linkEl ? linkEl.href || linkEl.getAttribute("href") || "" : "");
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

  // tools/importer/parsers/isi.js
  function parse4(element, { document }) {
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

  // tools/importer/import-homepage.js
  var PAGE_TEMPLATE = {
    name: "homepage",
    description: 'NORTHERA homepage: light-cyan "Ask for NORTHERA by name" icon+text band, a randomized patient-photo hero with a survey CTA, a teal "Financial assistance" quicklink card, and ISI content.',
    urls: [
      "https://northera-stage.d.lundbeckus.com/"
    ],
    blocks: [
      {
        name: "columns",
        instances: [
          ".responsivegrid.ask-for-northera"
        ]
      },
      {
        name: "hero-patient",
        instances: [
          ".cmp-layout__herobanner"
        ]
      },
      {
        name: "cards-cta",
        instances: [
          ".cmp-layout-quicklinks .image-text-cta"
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
      { id: "hp-ask", name: "Ask for NORTHERA by name (icon + text band)", selector: ".responsivegrid.ask-for-northera", style: null, blocks: ["columns"], defaultContent: [] },
      { id: "hp-hero", name: "Random patient-photo hero + survey CTA", selector: ".cmp-layout__herobanner", style: null, blocks: ["hero-patient"], defaultContent: [] },
      { id: "hp-financial", name: "Financial assistance quicklink card", selector: ".cmp-layout-quicklinks", style: null, blocks: ["cards-cta"], defaultContent: [] },
      { id: "hp-isi", name: "Important Safety Information", selector: "div.responsivegrid.cmp-layout-isi__phone", style: null, blocks: ["isi"], defaultContent: [] }
    ]
  };
  var parsers = {
    columns: parse,
    "hero-patient": parse2,
    "cards-cta": parse3,
    isi: parse4
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
  var import_homepage_default = {
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
