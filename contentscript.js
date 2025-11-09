// contentScript.js
// Smoothly scrolls to and briefly highlights the relevant paragraph when the user clicks a claim in the popup.

chrome.runtime.onMessage.addListener((msg, sender, sendResponse) => {
  if (msg.type === "HIGHLIGHT_ISSUE") {
    if (highlightByIssueId(msg.issueId)) {
      sendResponse?.({ ok: true, via: "issueId" });
      return true;
    }
    if (msg.textTitle && highlightByBestMatch(msg.textTitle)) {
      sendResponse?.({ ok: true, via: "title" });
      return true;
    }
    if (msg.textFull && highlightByBestMatch(msg.textFull)) {
      sendResponse?.({ ok: true, via: "full" });
      return true;
    }

    const header =
      document.querySelector("article h1, article h2") ||
      document.querySelector("h1, h2");
    if (header) {
      scrollAndPulse(header);
      sendResponse?.({ ok: true, via: "fallback" });
      return true;
    }

    sendResponse?.({ ok: false });
  }
});

/* ================= Core Highlight Helpers ================= */

function scrollAndPulse(elem) {
  if (!elem) return;
  elem.scrollIntoView({ behavior: "smooth", block: "center" });

  // add subtle glow
  elem.style.transition = "box-shadow 0.3s ease-out";
  const prevShadow = elem.style.boxShadow;
  elem.style.boxShadow = "0 0 0 3px rgba(255, 99, 71, 0.6)";

  setTimeout(() => {
    elem.style.boxShadow = prevShadow || "none";
  }, 1200);
}

/* ================= Issue Specific Targeting ================= */

function highlightByIssueId(issueId) {
  if (!issueId) return false;

  if (issueId === "no-author") {
    const el =
      document.querySelector("meta[name='author']") ||
      document.querySelector("[itemprop='author']") ||
      document.querySelector(".author, .byline, .article-byline") ||
      document.querySelector("h1, h2");
    if (el) {
      scrollAndPulse(el);
      return true;
    }
  }

  if (issueId === "no-trusted-sources" || issueId === "unrecognized-domain") {
    const el = document.querySelector("article a[href^='http'], a[href^='http']");
    if (el) {
      scrollAndPulse(el);
      return true;
    }
  }

  if (issueId === "possible-commercial-bias") {
    const el =
      document.querySelector("a[href*='shop'], a[href*='buy'], a[href*='product']") ||
      document.querySelector("button");
    if (el) {
      scrollAndPulse(el);
      return true;
    }
  }

  if (issueId === "sensational-language") {
    const el = document.querySelector("strong, b, h1, h2");
    if (el) {
      scrollAndPulse(el);
      return true;
    }
  }

  return false;
}

/* ================= Smart Text Matcher ================= */

function highlightByBestMatch(text) {
  const words = normalizeToWords(text);
  if (!words.length) return false;

  const candidates = document.querySelectorAll("article p, article li, p, li, div");
  let bestEl = null;
  let bestScore = 0;

  candidates.forEach((el) => {
    const score = scoreElement(el, words);
    if (score > bestScore) {
      bestScore = score;
      bestEl = el;
    }
  });

  if (!bestEl || bestScore < 2) return false;

  const rect = bestEl.getBoundingClientRect();
  const isHuge = rect.height > 400 || rect.width > window.innerWidth * 0.7;
  if (isHuge) {
    const inner = findBestChild(bestEl, words);
    if (inner) {
      scrollAndPulse(inner);
      return true;
    }
  }

  scrollAndPulse(bestEl);
  return true;
}

/* ================= Utility Functions ================= */

function normalizeToWords(text) {
  if (!text) return [];
  return text
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, " ")
    .split(/\s+/)
    .filter((w) => w.length > 3);
}

function scoreElement(el, words) {
  const t = (el.innerText || "").toLowerCase();
  if (!t) return 0;
  let score = 0;
  words.forEach((w) => {
    if (t.includes(w)) score++;
  });
  if (t.length < 25) score -= 1;
  return score;
}

function findBestChild(root, words) {
  const inner = root.querySelectorAll("p, li, span, div");
  let best = null;
  let bestScore = 0;
  inner.forEach((el) => {
    const score = scoreElement(el, words);
    if (score > bestScore) {
      bestScore = score;
      best = el;
    }
  });
  if (best && bestScore >= 2) return best;
  return null;
}
