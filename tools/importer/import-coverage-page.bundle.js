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

  // tools/importer/import-coverage-page.js
  var import_coverage_page_exports = {};
  __export(import_coverage_page_exports, {
    default: () => import_coverage_page_default
  });

  // tools/importer/parsers/table-compare.js
  function parse(element, { document }) {
    const table = element.matches("table") ? element : element.querySelector("table");
    if (!table) {
      element.replaceWith(...element.childNodes);
      return;
    }
    const trs = [...table.querySelectorAll("tr")];
    const colCount = trs.reduce((max, tr) => Math.max(max, tr.children.length), 0);
    const rows = trs.map((tr) => {
      const cells = [...tr.children].map((cell) => {
        const div = document.createElement("div");
        [...cell.childNodes].forEach((n) => div.appendChild(n.cloneNode(true)));
        if (!div.childNodes.length) div.textContent = cell.textContent.trim();
        return div;
      });
      while (cells.length < colCount) cells.push(document.createElement("div"));
      return cells;
    }).filter((cells) => cells.length);
    if (!rows.length) {
      element.replaceWith(...element.childNodes);
      return;
    }
    const block = WebImporter.Blocks.createBlock(document, {
      name: "table (table-compare)",
      cells: rows
    });
    element.replaceWith(block);
  }

  // tools/importer/parsers/columns-contact.js
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
  function parse2(element, { document }) {
    const teasers = [...element.querySelectorAll(".cmp-teaser")];
    const cells = teasers.map((teaser) => {
      const cell = document.createElement("div");
      const img = teaser.querySelector(".cmp-teaser__image img, img");
      if (img) {
        const el = document.createElement("img");
        el.setAttribute("src", img.getAttribute("src") || img.src || "");
        el.setAttribute("alt", img.getAttribute("alt") || "");
        cell.appendChild(el);
      }
      const desc = teaser.querySelector(".cmp-teaser__description");
      if (desc) {
        [...desc.children].forEach((child) => {
          if (child.textContent.trim() || child.querySelector("a, img")) {
            const clone = child.cloneNode(true);
            clone.querySelectorAll("a[href]").forEach((a) => {
              a.setAttribute("href", normalizeHref(a.getAttribute("href") || a.href || ""));
            });
            cell.appendChild(clone);
          }
        });
      }
      return cell;
    }).filter((c) => c.children.length);
    if (!cells.length) {
      element.replaceWith(...element.childNodes);
      return;
    }
    const block = WebImporter.Blocks.createBlock(document, {
      name: "columns (contact)",
      cells: [cells]
    });
    element.replaceWith(block);
  }

  // tools/importer/parsers/fragment-isi.js
  var ISI_FRAGMENT_PATH = "/fragments/northera-isi";
  function parse3(element, { document }) {
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

  // tools/importer/import-coverage-page.js
  var PAGE_TEMPLATE = {
    name: "coverage-page",
    description: 'Patient support "Coverage for NORTHERA" page: a Prescription Insurance Coverage section (H1 + intro + a Medicare-vs-Commercial comparison table [table-compare] + commercial-insurance paragraphs), a Medicare Extra Help section (heading + list + two contact columns [columns-contact: Online / Phone]), a legal disclaimer (default content), then the shared ISI fragment.',
    urls: [
      "https://northera-stage.d.lundbeckus.com/patient-support/coverage-for-northera"
    ],
    blocks: [
      {
        name: "table-compare",
        instances: [
          ".cmp-text__table.aem-GridColumn--phone--hide table"
        ]
      },
      {
        name: "columns-contact",
        instances: [
          "#northeramedicare .cmp-layout__two__imagetext"
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
      { id: "cov-coverage", name: "Prescription Insurance Coverage (intro + comparison table)", selector: "#northeracoverage.cmp-container", style: null, blocks: ["table-compare"], defaultContent: [] },
      { id: "cov-medicare", name: "Medicare Extra Help (+ contact columns)", selector: "#northeramedicare.cmp-container", style: null, blocks: ["columns-contact"], defaultContent: [] },
      { id: "cov-info", name: "Legal disclaimer", selector: "#coverageinfo.cmp-container", style: null, blocks: [], defaultContent: [] },
      { id: "cov-isi", name: "Important Safety Information", selector: "div.responsivegrid.cmp-layout-isi__phone", style: null, blocks: ["fragment-isi"], defaultContent: [] }
    ]
  };
  var parsers = {
    "table-compare": parse,
    "columns-contact": parse2,
    "fragment-isi": parse3
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
  var import_coverage_page_default = {
    transform: (payload) => {
      const {
        document,
        url,
        html,
        params
      } = payload;
      const main = document.body;
      executeTransformers("beforeTransform", main, payload);
      main.querySelectorAll(".cmp-text__table.aem-GridColumn--default--hide").forEach((el) => el.remove());
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
  return __toCommonJS(import_coverage_page_exports);
})();
