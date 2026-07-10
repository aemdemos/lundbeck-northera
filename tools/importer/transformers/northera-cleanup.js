/* eslint-disable */
/* global WebImporter */

/**
 * Transformer: NORTHERA (Lundbeck) site-wide cleanup.
 *
 * Removes non-authorable page chrome and tracking from the legacy AEM Sites
 * (Bootstrap + AEM Core Components) DOM before/after block parsing so the
 * imported document contains only page-level authorable content.
 *
 * All selectors below were verified against migration-work/cleaned.html for
 * https://northera-stage.d.lundbeckus.com/about-northera/taking-northera.
 *
 * IMPORTANT: header (rc1) and footer are migrated by separate orchestrators
 * and are removed here. The single canonical ISI experience-fragment lives at
 * `div.responsivegrid.cmp-layout-isi__phone .experiencefragment` (the selector
 * the `isi` block maps to) and is intentionally KEPT — only the duplicate
 * desktop ISI variant and the ISI modal popup are removed. A blanket
 * `.experiencefragment` selector is deliberately NOT used because it would
 * also strip the canonical ISI fragment.
 */

const TransformHook = { beforeTransform: 'beforeTransform', afterTransform: 'afterTransform' };

export default function transform(hookName, element, payload) {
  if (hookName === TransformHook.beforeTransform) {
    // Site-leave / HCP interstitial modal popups (block/overlay parsing).
    // Found in cleaned.html: <div class="leavingsite ...">, and modal shells
    // #hcpInterstitial, #externallundbecksite, #thirdpartyiInterstital, #hcpWarning.
    WebImporter.DOMUtils.remove(element, [
      '.leavingsite',
      '#hcpInterstitial',
      '#externallundbecksite',
      '#thirdpartyiInterstital',
      '#hcpWarning',
    ]);

    // ISI modal popup (found: <div class="cmp-isi__model">) — the persistent
    // ISI content is captured by the isi block; this popup variant is not authorable.
    WebImporter.DOMUtils.remove(element, ['.cmp-isi__model']);

    // Duplicate/hidden ISI variants that are NOT the canonical .cmp-layout-isi__phone
    // fragment the isi block maps to:
    //  - .cmp-layout-isi__desktop  (found line ~1252, desktop-only duplicate: aem-GridColumn--phone--hide)
    WebImporter.DOMUtils.remove(element, ['.cmp-layout-isi__desktop']);
  }

  if (hookName === TransformHook.afterTransform) {
    // Non-authorable global chrome — header + footer regions (handled by
    // separate orchestrators). Found: .cmp-layout-header (+ desktop-header /
    // touch-device-header variants) and .cmp-layout-footer.
    WebImporter.DOMUtils.remove(element, [
      '.cmp-layout-header',
      '.desktop-header',
      '.touch-device-header',
      '.cmp-layout-footer',
    ]);

    // Back-to-top control (found: <a id="toTop" href="#top">) — site shell UI.
    WebImporter.DOMUtils.remove(element, ['#toTop']);

    // Tracking pixels / analytics iframes. Found in cleaned.html: the Adobe
    // Audience Manager (demdex) ID-syncing iframe. Also cover common ad/analytics
    // trackers defensively via src-attribute selectors.
    WebImporter.DOMUtils.remove(element, [
      '#destination_publishing_iframe_lundbeck_0',
      '.aamIframeLoaded',
      'iframe[src*="demdex.net"]',
      'iframe[src*="doubleclick"]',
      'iframe[src*="analytics.twitter"]',
      'iframe[src*="googletagmanager"]',
      'iframe[src*="facebook.com"]',
    ]);

    // Non-content elements: scripts, styles, noscript, injected clientlib <link>s.
    // Found: multiple <link href="/etc.clientlibs/...clientlibs.min...css"> tags.
    WebImporter.DOMUtils.remove(element, [
      'script',
      'style',
      'noscript',
      'link',
      'source',
    ]);
  }
}
