// content.js
// This one is ONLY for giving the popup the page data to analyze.
// Highlighting is handled in contentScript.js.

chrome.runtime.onMessage.addListener((msg, sender, sendResponse) => {
  if (msg.type === "GET_PAGE_DATA") {
    // main visible text
    const text = document.body.innerText || "";

    // all links on page
    const links = Array.from(document.querySelectorAll("a[href]")).map(a => a.href);

    // url
    const url = location.href;

    // collect common meta
    const meta = {};

    const authorMeta =
      document.querySelector("meta[name='author']") ||
      document.querySelector("meta[property='article:author']") ||
      document.querySelector("meta[name='byl']") ||
      document.querySelector("meta[name='dc.creator']");
    if (authorMeta) {
      meta.author = authorMeta.getAttribute("content") || "";
    }

    const ogTitle = document.querySelector("meta[property='og:title']");
    if (ogTitle) {
      meta.ogTitle = ogTitle.getAttribute("content") || "";
    }

    const ogDesc = document.querySelector("meta[property='og:description']");
    if (ogDesc) {
      meta.ogDescription = ogDesc.getAttribute("content") || "";
    }

    const desc = document.querySelector("meta[name='description']");
    if (desc) {
      meta.description = desc.getAttribute("content") || "";
    }

    sendResponse({ text, links, meta, url });
    return true;
  }

  // ignore other messages here — HIGHLIGHT_ISSUE is done in contentScript.js
});
