/* eslint-disable */
/* global WebImporter */

/**
 * Transformer: NORTHERA site-wide cleanup.
 * Removes non-authorable content (header, footer, modals, tracking, duplicates).
 * All selectors verified from captured DOM (migration-work/cleaned.html).
 */
const TransformHook = { beforeTransform: 'beforeTransform', afterTransform: 'afterTransform' };

export default function transform(hookName, element, payload) {
  if (hookName === TransformHook.beforeTransform) {
    // Remove leaving-site modal dialogs (3 instances) - blocks parsing with overlay content
    WebImporter.DOMUtils.remove(element, ['.leavingsite']);

    // Remove ISI modal popup - non-authorable overlay
    WebImporter.DOMUtils.remove(element, ['.isi-model']);

    // Remove embed HTML component (empty, just a link tag)
    WebImporter.DOMUtils.remove(element, ['.embedhtml']);
  }

  if (hookName === TransformHook.afterTransform) {
    // Remove header with utility bar, logo, navigation, and search
    // Found: .cmp-layout-header contains .multiLinks, .cmp-image (logo), .navigation-hamburger, #cmp-search
    WebImporter.DOMUtils.remove(element, ['.cmp-layout-header']);

    // Remove footer with links, disclaimer, and Lundbeck logo
    // Found: .cmp-layout-footer contains .multiLinks, .cmp-footer-disclaimer, .cmp-image (Lundbeck logo)
    WebImporter.DOMUtils.remove(element, ['.cmp-layout-footer']);

    // Remove duplicate ISI warning bar (desktop-only version, same content as .isi-mobile-wrap)
    // Found: .isi-warning-wrap with aem-GridColumn--phone--hide
    WebImporter.DOMUtils.remove(element, ['.isi-warning-wrap']);

    // Remove duplicate ISI content (desktop sidebar version, same content as .cmp-layout-isi__phone)
    // Found: .cmp-layout-isi__desktop with aem-GridColumn--phone--hide
    WebImporter.DOMUtils.remove(element, ['.cmp-layout-isi__desktop']);

    // Remove back-to-top anchor link
    WebImporter.DOMUtils.remove(element, ['#toTop']);

    // Remove tracking iframe (Adobe ID Syncing)
    WebImporter.DOMUtils.remove(element, ['iframe']);

    // Remove tracking beacon div (Bing tracking pixel)
    WebImporter.DOMUtils.remove(element, ['[id^="batBeacon"]']);

    // Remove all <link> elements (CSS references not needed in import)
    WebImporter.DOMUtils.remove(element, ['link']);

    // Remove noscript tags if any
    WebImporter.DOMUtils.remove(element, ['noscript']);
  }
}
