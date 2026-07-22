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

  // tools/importer/import-prescribing-northera-page.js
  var import_prescribing_northera_page_exports = {};
  __export(import_prescribing_northera_page_exports, {
    default: () => import_prescribing_northera_page_default
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

  // tools/importer/parsers/cards-benefit.js
  function parse2(element, { document }) {
    const container = element.closest(".cmp-layout_prescribing_options__teaser__right") || element.parentElement;
    if (container.querySelector("table")) {
      element.replaceWith(document.createTextNode(""));
      return;
    }
    const teasers = container.querySelectorAll(".lu-cmp-teaser");
    const cells = [];
    teasers.forEach((teaser) => {
      const img = teaser.querySelector(".cmp-teaser__image img, img");
      const headingEl = teaser.querySelector(".cmp-teaser__title, h2, h3");
      const desc = teaser.querySelector(".cmp-teaser__description");
      const imageCell = document.createElement("div");
      if (img) {
        const el = document.createElement("img");
        el.setAttribute("src", img.getAttribute("src") || img.src || "");
        el.setAttribute("alt", img.getAttribute("alt") || "");
        imageCell.appendChild(el);
      }
      const bodyCell = document.createElement("div");
      if (headingEl) {
        const h2 = document.createElement("h2");
        h2.textContent = headingEl.textContent.trim();
        bodyCell.appendChild(h2);
      }
      if (desc) {
        [...desc.children].forEach((child) => {
          if (child.textContent.trim() || child.querySelector("a, img")) {
            bodyCell.appendChild(child.cloneNode(true));
          }
        });
      }
      if (imageCell.children.length || bodyCell.children.length) {
        cells.push([imageCell, bodyCell]);
      }
    });
    const block = WebImporter.Blocks.createBlock(document, { name: "cards", cells });
    const nameCell = block.querySelector("tr th, tr td");
    if (nameCell) {
      nameCell.textContent = "Cards (benefit)";
    }
    element.replaceWith(block);
  }

  // tools/importer/parsers/cards-pharmacy.js
  function parse3(element, { document }) {
    const container = element.closest(
      ".cmp-layout_prescribing_options__teaser:not(.cmp-layout_prescribing_options__teaser__right)"
    ) || element.closest(".cmp-layout_prescribing_options") || element.parentElement;
    if (container.querySelector("table")) {
      element.replaceWith(document.createTextNode(""));
      return;
    }
    const teasers = container.querySelectorAll(".lu-cmp-teaser");
    const cells = [];
    teasers.forEach((teaser) => {
      const img = teaser.querySelector("img");
      const headingEl = teaser.querySelector("h2, h3");
      const paras = [...teaser.querySelectorAll("p")].filter((p) => p.textContent.trim());
      const imageCell = document.createElement("div");
      if (img) {
        imageCell.appendChild(img);
      }
      const bodyCell = document.createElement("div");
      if (headingEl) {
        const h2 = document.createElement("h2");
        h2.textContent = headingEl.textContent.trim();
        bodyCell.appendChild(h2);
      }
      paras.forEach((p) => {
        bodyCell.appendChild(p);
      });
      cells.push([imageCell, bodyCell]);
    });
    const block = WebImporter.Blocks.createBlock(document, {
      name: "Cards (pharmacy)",
      cells
    });
    element.replaceWith(block);
  }

  // tools/importer/parsers/daw-banner-light.js
  function parse4(element, { document }) {
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
    const block = WebImporter.Blocks.createBlock(document, { name: "columns-banner (daw-light)", cells });
    element.replaceWith(block);
  }

  // tools/importer/parsers/cards-contact.js
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
  function parse5(element, { document }) {
    const teasers = [...element.querySelectorAll(".cmp-teaser")];
    const rows = teasers.map((teaser) => {
      const imageCell = document.createElement("div");
      const bodyCell = document.createElement("div");
      const img = teaser.querySelector(".cmp-teaser__image img, img");
      if (img) {
        const el = document.createElement("img");
        el.setAttribute("src", img.getAttribute("src") || img.src || "");
        el.setAttribute("alt", img.getAttribute("alt") || "");
        imageCell.appendChild(el);
      }
      const desc = teaser.querySelector(".cmp-teaser__description");
      if (desc) {
        [...desc.children].forEach((child) => {
          if (child.textContent.trim() || child.querySelector("a, img")) {
            const clone = child.cloneNode(true);
            clone.querySelectorAll("a[href]").forEach((a) => {
              a.setAttribute("href", normalizeHref2(a.getAttribute("href") || a.href || ""));
            });
            bodyCell.appendChild(clone);
          }
        });
      }
      return [imageCell, bodyCell];
    }).filter((cells) => cells[0].children.length || cells[1].children.length);
    if (!rows.length) {
      element.replaceWith(...element.childNodes);
      return;
    }
    const block = WebImporter.Blocks.createBlock(document, {
      name: "cards (contact)",
      cells: rows
    });
    element.replaceWith(block);
  }

  // tools/importer/parsers/fragment-isi.js
  var ISI_FRAGMENT_PATH = "/fragments/northera-isi";
  function parse6(element, { document }) {
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

  // tools/importer/import-prescribing-northera-page.js
  var PAGE_TEMPLATE = {
    name: "prescribing-northera-page",
    description: 'HCP "Prescribing NORTHERA" page: an internal-page icon hero banner, an H3 intro, a two-option prescribing comparison (NSC benefit cards + a "Start the treatment form" CTA vs specialty-pharmacy logo cards, with an "or" divider and a StarterRx footnote), a light-tint "Dispense as written" callout banner, a prior-authorization / CoverMyMeds section (headings + two icon+text contact items + logo + references), then the shared ISI fragment.',
    urls: [
      "https://northera-stage.d.lundbeckus.com/for-healthcare-professionals/prescribing-northera"
    ],
    blocks: [
      {
        name: "hero-hcp-internal",
        instances: [
          "div.lu-cmp-teaser.aem-GridColumn--phone--hide .cmp-teaser.bannericondesktopinternal-cta-3309f33ce2"
        ]
      },
      {
        name: "cards-benefit",
        instances: [
          "div.responsivegrid.cmp-layout_prescribing_options__teaser__right .lu-cmp-teaser"
        ]
      },
      {
        name: "cards-pharmacy",
        instances: [
          "div.responsivegrid.cmp-layout_prescribing_options__teaser:not(.cmp-layout_prescribing_options__teaser__right) .lu-cmp-teaser"
        ]
      },
      {
        name: "daw-banner-light",
        instances: [
          "div.responsivegrid.ask-for-northera"
        ]
      },
      {
        name: "cards-contact",
        instances: [
          "div.responsivegrid.cmp-layout__two__imagetext"
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
      { id: "presc-hero", name: "HCP internal-page banner", selector: "div.lu-cmp-teaser.aem-GridColumn--phone--hide", style: null, blocks: ["hero-hcp-internal"], defaultContent: [] },
      { id: "presc-choose", name: "Choose the option heading", selector: "div#text-6b7309ab70.cmp-text", style: null, blocks: [], defaultContent: [] },
      { id: "presc-options", name: "Prescribing options comparison", selector: "div.responsivegrid.cmp-layout_prescribing_options__teaser__right", style: null, blocks: ["cards-benefit", "cards-pharmacy"], defaultContent: [] },
      { id: "presc-daw", name: 'Why "Dispense as written" matters', selector: "div.responsivegrid.ask-for-northera", style: null, blocks: ["daw-banner-light"], defaultContent: [] },
      { id: "presc-pa", name: "Prior authorization (CoverMyMeds)", selector: "div#northeramedicare.cmp-container", style: null, blocks: ["cards-contact"], defaultContent: [] },
      { id: "presc-isi", name: "Important Safety Information", selector: "div.responsivegrid.cmp-layout-isi__phone", style: null, blocks: ["fragment-isi"], defaultContent: [] }
    ]
  };
  var parsers = {
    "hero-hcp-internal": parse,
    "cards-benefit": parse2,
    "cards-pharmacy": parse3,
    "daw-banner-light": parse4,
    "cards-contact": parse5,
    "fragment-isi": parse6
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
  var import_prescribing_northera_page_default = {
    transform: (payload) => {
      const {
        document,
        url,
        html,
        params
      } = payload;
      const main = document.body;
      executeTransformers("beforeTransform", main, payload);
      main.querySelectorAll(".lu-cmp-teaser.aem-GridColumn--default--hide .cmp-teaser.bannericonmobileinternal-cta-7313956251").forEach((el) => {
        const wrapper = el.closest(".lu-cmp-teaser.aem-GridColumn--default--hide");
        (wrapper || el).remove();
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
  return __toCommonJS(import_prescribing_northera_page_exports);
})();
