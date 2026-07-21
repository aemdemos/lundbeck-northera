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

  // tools/importer/import-treatment-form-page.js
  var import_treatment_form_page_exports = {};
  __export(import_treatment_form_page_exports, {
    default: () => import_treatment_form_page_default
  });

  // tools/importer/parsers/hero-hcp-internal.js
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
    const bgImg = element.querySelector(".cmp-teaser__image img, .cmp-treatment__banner__image img, img");
    let bgCell = "";
    if (bgImg) {
      const img = document.createElement("img");
      img.setAttribute("src", bgImg.getAttribute("src") || bgImg.src || "");
      img.setAttribute("alt", bgImg.getAttribute("alt") || "");
      bgCell = img;
    }
    const content = document.createElement("div");
    const iconImg = element.querySelector(".cmp-teaser__icon img, .cmp-treatment__banner__icon img");
    if (iconImg) {
      const icon = document.createElement("img");
      icon.setAttribute("src", iconImg.getAttribute("src") || iconImg.src || "");
      icon.setAttribute("alt", iconImg.getAttribute("alt") || "");
      content.appendChild(icon);
    }
    const h1 = element.querySelector("h1");
    if (h1) {
      const el = document.createElement("h1");
      el.textContent = h1.textContent.trim();
      content.appendChild(el);
    }
    const cta = element.querySelector(".cmp-teaser__action-link, a[href]");
    if (cta) {
      const p = document.createElement("p");
      const a = document.createElement("a");
      a.setAttribute("href", normalizeHref(cta.getAttribute("href") || cta.href || ""));
      a.textContent = (cta.textContent || "").trim();
      p.appendChild(a);
      content.appendChild(p);
    }
    const block = WebImporter.Blocks.createBlock(document, {
      name: "hero-hcp-internal",
      cells: [
        [bgCell],
        [content]
      ]
    });
    element.replaceWith(block);
  }

  // tools/importer/parsers/treatment-form.js
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
  function parse2(element, { document }) {
    const cells = [];
    const calloutCell = document.createElement("div");
    calloutCell.innerHTML = element.innerHTML;
    calloutCell.querySelectorAll(".cmp-pharma__phone").forEach((span) => {
      const s = document.createElement("span");
      s.className = "treatment-form-phone";
      s.textContent = span.textContent.trim();
      span.replaceWith(s);
    });
    cells.push([calloutCell]);
    const container = element.closest(".cmp-treatment__textcontainer") || document;
    const list = container.querySelector(".cmp-treatment__list ul, .cmp-treatment__list");
    const listCell = document.createElement("div");
    if (list) {
      const ul = document.createElement("ul");
      [...list.querySelectorAll("li")].forEach((li) => {
        const item = document.createElement("li");
        item.textContent = li.textContent.trim();
        ul.appendChild(item);
      });
      listCell.appendChild(ul);
    }
    cells.push([listCell]);
    const proceed = document.querySelector(".proceedoptions .get_started-blk") || document.querySelector(".proceedoptions");
    const ctaCell = document.createElement("div");
    if (proceed) {
      const h2 = proceed.querySelector("h2");
      if (h2) {
        const h = document.createElement("h2");
        h.textContent = h2.textContent.trim();
        ctaCell.appendChild(h);
      }
      [...proceed.querySelectorAll(".cmp-teaser__action-container")].forEach((c) => {
        const link = c.querySelector("a");
        if (link) {
          const p = document.createElement("p");
          const a = document.createElement("a");
          const href = link.getAttribute("href");
          a.setAttribute("href", href ? normalizeHref2(href) : "#treatment-form");
          const label = c.querySelector(".cmp-button__text") || link;
          a.textContent = label.textContent.trim();
          p.appendChild(a);
          ctaCell.appendChild(p);
        }
        const right = c.querySelector(".right-blk");
        if (right) {
          [...right.querySelectorAll("p")].forEach((rp) => {
            if (!rp.textContent.trim() && !rp.querySelector("a")) return;
            const p = document.createElement("p");
            p.innerHTML = rp.innerHTML;
            p.querySelectorAll("a[href]").forEach((a) => {
              a.setAttribute("href", normalizeHref2(a.getAttribute("href") || a.href || ""));
            });
            ctaCell.appendChild(p);
          });
        }
      });
    }
    cells.push([ctaCell]);
    const block = WebImporter.Blocks.createBlock(document, {
      name: "treatment-form",
      cells
    });
    element.replaceWith(block);
    if (list) {
      const listWrap = list.closest(".cmp-treatment__list") || list;
      listWrap.remove();
    }
    const formBlk = document.querySelector(".container-fluid.cmp-treatmentform_2");
    if (formBlk) formBlk.remove();
    const proceedBlk = document.querySelector(".proceedoptions");
    if (proceedBlk) proceedBlk.remove();
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
      WebImporter.DOMUtils.remove(element, [".cmp-layout-quicklinks"]);
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

  // tools/importer/import-treatment-form-page.js
  var PAGE_TEMPLATE = {
    name: "treatment-form-page",
    description: "HCP Treatment Form page: an internal-page icon hero banner, an intro H2 + paragraphs, then a treatment-form block (blue fax callout + check-list + two entry CTAs + a static 6-step prescription wizard replica), then the shared ISI fragment. The live interactive form (backend submit, PDF, session-timeout modals) is NOT migrated.",
    urls: [
      "https://northera-stage.d.lundbeckus.com/for-healthcare-professionals/treatment-form"
    ],
    blocks: [
      {
        name: "hero-hcp-internal",
        instances: [
          "div.treatmentform .cmp-treatment__banner"
        ]
      },
      {
        name: "treatment-form",
        instances: [
          "div.cmp-treatment__textcontainer .cmp-specialty__pharmacy"
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
      { id: "tf-hero", name: "Treatment Form banner", selector: "div.treatmentform .cmp-treatment__banner", style: null, blocks: ["hero-hcp-internal"], defaultContent: [] },
      { id: "tf-intro", name: "Intro + treatment form wizard", selector: "div.cmp-treatment__textcontainer", style: null, blocks: ["treatment-form"], defaultContent: [] },
      { id: "tf-isi", name: "Important Safety Information", selector: "div.responsivegrid.cmp-layout-isi__phone", style: null, blocks: ["fragment-isi"], defaultContent: [] }
    ]
  };
  var parsers = {
    "hero-hcp-internal": parse,
    "treatment-form": parse2,
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
  var import_treatment_form_page_default = {
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
  return __toCommonJS(import_treatment_form_page_exports);
})();
