// popup.js

let lastPageData = null;
let lastHeuristicReport = null;

const ALWAYS_CREDIBLE = [
  "harvard.edu",
  "health.harvard.edu",
  "stanford.edu",
  "mayoclinic.org",
  "nih.gov",
  "medlineplus.gov",
  "cdc.gov",
  "who.int",
  "clevelandclinic.org",
  "hopkinsmedicine.org"
];

const TRUSTED_DOMAINS = [
  "nih.gov",
  "cdc.gov",
  "who.int",
  "mayoclinic.org",
  "medlineplus.gov",
  "fda.gov",
  "jamanetwork.com",
  "pubmed.ncbi.nlm.nih.gov"
];

const RISKY_PHRASES = [
  "miracle cure",
  "detox",
  "flush toxins",
  "cure cancer",
  "reverse diabetes",
  "one weird trick",
  "instantly",
  "secret remedy",
  "ancient remedy",
  "doctors don't want you to know"
];

const FALLBACK_EVIDENCE = [
  { name: "CDC – Health Topics", url: "https://www.cdc.gov/health-topics.html" },
  { name: "NIH – Health Information", url: "https://www.nih.gov/health-information" },
  { name: "Mayo Clinic – Patient Care & Health Info", url: "https://www.mayoclinic.org/patient-care-and-health-information" }
];

// scan click
document.getElementById("scanBtn").addEventListener("click", () => {
  chrome.tabs.query({ active: true, currentWindow: true }, tabs => {
    const tabId = tabs[0].id;
    chrome.tabs.sendMessage(tabId, { type: "GET_PAGE_DATA" }, data => {
      if (chrome.runtime.lastError || !data) {
        renderError("Can't scan this page. Try a normal https:// site.");
        return;
      }

      lastPageData = data;

      if (!isHealthPage(data.text, data.url)) {
        renderNonHealth(data.url);
        return;
      }

      const report = analyzePage(data);
      lastHeuristicReport = report;
      renderReport(report);
    });
  });
});

function isHealthPage(text, url) {
  const lower = (text || "").toLowerCase();
  const urlLower = (url || "").toLowerCase();

  const HEALTH_KEYWORDS = [
    "symptom",
    "treatment",
    "therapy",
    "disease",
    "disorder",
    "nutrition",
    "vitamin",
    "condition",
    "health",
    "medical",
    "clinical",
    "diagnosis",
    "dose",
    "side effect",
    "cdc",
    "nih",
    "mayo clinic",
    "vaccine",
    "mental health",
    "depression",
    "anxiety",
    "therapy"
  ];

  const HEALTHY_DOMAINS = [
    "nih.gov",
    "cdc.gov",
    "who.int",
    "mayoclinic.org",
    "medlineplus.gov",
    "health.harvard.edu",
    "clevelandclinic.org"
  ];

  if (HEALTHY_DOMAINS.some(d => urlLower.includes(d))) return true;
  if (HEALTH_KEYWORDS.some(k => lower.includes(k))) return true;
  return false;
}

function analyzePage({ text, links, meta, url }) {
  const hostname = (() => {
    try {
      return new URL(url).hostname;
    } catch {
      return url;
    }
  })();

  // auto-credible domains
  if (ALWAYS_CREDIBLE.some(d => hostname === d || hostname.endsWith("." + d))) {
    return {
      score: 95,
      url,
      issues: [],
      aiAdjusted: false,
      authorNames: extractAuthorNames(text, meta)
    };
  }

  let score = 50;
  const issues = [];
  const lower = (text || "").toLowerCase();

  const sourceDomains = links
    .map(u => {
      try {
        return new URL(u).hostname;
      } catch {
        return "";
      }
    })
    .filter(Boolean);

  const hasTrustedLink = sourceDomains.some(d =>
    TRUSTED_DOMAINS.some(td => d.includes(td))
  );
  if (hasTrustedLink) {
    score += 20;
  } else {
    issues.push({
      id: "no-trusted-sources",
      title: "No trusted medical sources found",
      desc: "We didn't detect links to CDC, NIH, WHO, or Mayo Clinic."
    });
  }

  const hasAuthor =
    meta?.author ||
    lower.includes("medically reviewed by") ||
    lower.includes("reviewed by") ||
    lower.includes("written by ");

  if (hasAuthor) {
    score += 8;
  } else {
    issues.push({
      id: "no-author",
      title: "No medical author/reviewer",
      desc: "Credible health pages usually list who wrote or reviewed it."
    });
  }

  const foundRisky = RISKY_PHRASES.filter(p => lower.includes(p));
  if (foundRisky.length) {
    score -= 15;
    issues.push({
      id: "sensational-language",
      title: "Sensational or unverified language",
      desc: "Found: " + foundRisky.join(", ")
    });
  }

  const buyMatches =
    lower.match(/buy |order now|add to cart|shop now|subscribe/g) || [];
  if (buyMatches.length > 2) {
    score -= 10;
    issues.push({
      id: "possible-commercial-bias",
      title: "Possible commercial bias",
      desc: "This page mixes health advice with product links."
    });
  }

  if (
    lower.includes("consult your doctor") ||
    lower.includes("talk to your doctor") ||
    lower.includes("not a substitute for professional medical advice")
  ) {
    score += 5;
  }

  score = Math.max(0, Math.min(100, score));

  return {
    score,
    url,
    issues,
    aiAdjusted: false,
    authorNames: extractAuthorNames(text, meta)
  };
}

// extract author names, but ignore "your genes"
function extractAuthorNames(text = "", meta = {}) {
  const badAuthorPhrases = ["your genes", "genes", "genetic factors"];
  const names = [];

  if (meta && meta.author && !containsBad(meta.author, badAuthorPhrases)) {
    names.push(meta.author);
  }

  const byRegex = /by\s+([A-Z][a-z]+(?:\s[A-Z][a-z]+){0,3})/gi;
  let m;
  while ((m = byRegex.exec(text)) !== null) {
    const candidate = m[1].trim();
    if (!containsBad(candidate, badAuthorPhrases)) {
      names.push(candidate);
    }
  }

  return Array.from(new Set(names));
}

function containsBad(str, badList) {
  const s = (str || "").toLowerCase();
  return badList.some(b => s.includes(b));
}

function renderReport(report) {
  const result = document.getElementById("result");

  // >=90 is credible now
  let label = "Needs verification";
  let labelClass = "status-bad";
  if (report.score >= 90) {
    label = "Credible";
    labelClass = "status-good";
  } else if (report.score >= 80) {
    label = "Looks credible";
    labelClass = "status-mid";
  }

  const factors = explainFactors(report);

  result.innerHTML = `
    <div class="result-card">
      <div class="score-row">
        <div class="score-left">
          <div class="score-val" id="scoreVal">0</div>
          <div class="score-sub">${report.url}</div>
          <div class="ai-badge" id="aiBadge">AI-adjusted</div>
        </div>
        <div class="status-pill ${labelClass}" id="statusPill">
          ${label.toUpperCase()}
        </div>
      </div>
      <div class="progress-wrap">
        <div class="progress-track">
          <div class="progress-fill" id="progressFill"></div>
        </div>
      </div>
      <div class="issues-label" style="margin-top:10px;">Why this score</div>
      <div id="factorsWrap"></div>

      <button class="accurate-btn" id="moreInfoBtn">Deeper AI analysis</button>
      <div id="aiResult"></div>
    </div>
  `;

  animateNumberNoPercent(document.getElementById("scoreVal"), report.score, 600);
  setTimeout(() => {
    document.getElementById("progressFill").style.width = report.score + "%";
  }, 80);

  const factorsWrap = document.getElementById("factorsWrap");
  factors.forEach((f, idx) => {
    const issueId = f.id || `issue-${idx}`;
    factorsWrap.innerHTML += `
      <div class="factor-card ${f.positive ? "factor-pos" : "factor-neg"}" data-issue-id="${issueId}">
        <div class="factor-title">${f.title}</div>
        <div class="factor-desc">${f.desc}</div>
      </div>
    `;
  });

  document.getElementById("moreInfoBtn").onclick = runAiDeepAnalysis;
}

function animateNumberNoPercent(el, finalValue, duration = 650) {
  const startTime = performance.now();
  function update(now) {
    const progress = Math.min((now - startTime) / duration, 1);
    const current = Math.floor(finalValue * progress);
    el.textContent = current;
    if (progress < 1) requestAnimationFrame(update);
  }
  requestAnimationFrame(update);
}

function explainFactors(report) {
  const factors = [];
  const url = report.url || "";

  const trustedDomains = [
    "harvard.edu",
    "health.harvard.edu",
    "nih.gov",
    "cdc.gov",
    "who.int",
    "mayoclinic.org",
    "medlineplus.gov"
  ];
  const isTrusted = trustedDomains.some(d => url.includes(d));
  if (isTrusted) {
    factors.push({
      id: "trusted-domain",
      title: "Trusted medical source",
      desc: "This domain is a known, reputable health source.",
      positive: true
    });
  } else {
    factors.push({
      id: "unrecognized-domain",
      title: "Unrecognized domain",
      desc: "Domain is not in the pre-approved medical list.",
      positive: false
    });
  }

  (report.issues || []).forEach(i => {
    factors.push({
      id: i.id || i.title?.toLowerCase().replace(/\s+/g, "-") || "issue",
      title: i.title,
      desc: i.desc,
      positive: false
    });
  });

  return factors;
}

function renderNonHealth(url) {
  const result = document.getElementById("result");
  result.innerHTML = `
    <div class="result-card">
      <div class="score-row">
        <div class="score-left">
          <div class="score-val" style="font-size:1.4rem;">– –</div>
          <div class="score-sub">${url}</div>
        </div>
        <div class="status-pill status-mid">NOT HEALTH CONTENT</div>
      </div>
      <div class="issues-label" style="margin-top:10px;">
        This page doesn’t look like medical or health information.
      </div>
      <div class="factor-card">
        <div class="factor-title">What to try</div>
        <div class="factor-desc">
          Open an article about a condition, treatment, symptom, or public-health guidance.
        </div>
      </div>
    </div>
  `;
}

function renderError(msg) {
  document.getElementById("result").innerHTML = `
    <div class="result-card">
      <div class="factor-title">${msg}</div>
    </div>
  `;
}

// ------------- AI -------------
async function runAiDeepAnalysis() {
  const aiBox = document.getElementById("aiResult");
  aiBox.innerHTML = `
    <div class="factor-card">
      <div class="factor-title">Analyzing with AI…</div>
      <div class="factor-desc">Checking author credibility, claims, and medical consensus.</div>
    </div>
  `;

  const XAI_API_KEY = "PUT_YOUR_XAI_API_KEY_HERE";
  const XAI_MODEL = "grok-3";

  if (!XAI_API_KEY || XAI_API_KEY.includes("PUT_YOUR_XAI_KEY_HERE")) {
    aiBox.innerHTML = `
      <div class="factor-card factor-neg">
        <div class="factor-title">AI not configured</div>
        <div class="factor-desc">Add your xAI API key in popup.js to enable deep analysis.</div>
      </div>
    `;
    return;
  }

  try {
    const aiText = lastPageData?.text || "";
    const aiUrl = lastPageData?.url || "";
    const heuristicScore = lastHeuristicReport?.score || 0;
    const authorNames = lastHeuristicReport?.authorNames || [];
    const prompt = buildAiPrompt(aiText, aiUrl, heuristicScore, authorNames);

    const res = await fetch("https://api.x.ai/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${XAI_API_KEY}`
      },
      body: JSON.stringify({
        model: XAI_MODEL,
        messages: [
          {
            role: "system",
            content: "You are MedicheckAI, an evidence-based medical fact checker. Always output valid JSON."
          },
          { role: "user", content: prompt }
        ],
        temperature: 0.2
      })
    });

    if (!res.ok) {
      const errText = await res.text();
      throw new Error(`xAI request failed (${res.status}): ${errText}`);
    }

    const data = await res.json();
    const content = data.choices[0].message.content;

    let parsed;
    try {
      parsed = JSON.parse(content);
    } catch (e) {
      aiBox.innerHTML = `
        <div class="factor-card">
          <div class="factor-title">AI analysis</div>
          <div class="factor-desc">${content}</div>
        </div>
      `;
      return;
    }

    renderAiAnalysis(parsed);

    if (typeof parsed.ai_score === "number") {
      updateScoreFromAI(parsed.ai_score);
    }
  } catch (err) {
    aiBox.innerHTML = `
      <div class="factor-card factor-neg">
        <div class="factor-title">AI analysis failed</div>
        <div class="factor-desc" style="white-space:pre-wrap;">${err.message}</div>
      </div>
    `;
  }
}

function buildAiPrompt(text, url, heuristicScore, authorNames) {
  return `
You are given a webpage that appears to contain health/medical information.

Your task:
1. Read the excerpt below.
2. Extract up to 3 main health/medical claims.
3. Check whether these claims match mainstream, evidence-based sources (CDC, NIH, WHO, Mayo Clinic).
4. Look at the author names (if any) and decide if they appear medically credible (MD, DO, NP, RN, or writing on behalf of a major medical institution).
5. Based on the content + authorship, propose an updated credibility score from 0 to 100.
6. ALSO suggest up to 3 reputable links (CDC, NIH, WHO, Mayo Clinic, or other national health authorities) that a user can read to verify these claims.
7. Respond ONLY in JSON in this shape:

{
  "ai_score": 0-100,
  "verdict": "short sentence about overall credibility",
  "claims": [
    {
      "text": "claim text",
      "assessment": "evidence-based | needs-verification | likely-false",
      "reason": "why"
    }
  ],
  "authors": [
    {
      "name": "name here",
      "credibility": "high | medium | low",
      "notes": "why"
    }
  ],
  "evidence_links": [
    {
      "name": "CDC on topic",
      "url": "https://www.cdc.gov/...",
      "why": "official guidance"
    }
  ]
}

IMPORTANT: never list "your genes", "genes", or "genetics" as an author name. Authors must be people or organizations.

Page URL: ${url}
Heuristic score (from extension): ${heuristicScore}
Author names found on page: ${authorNames.join(", ") || "none"}

Page excerpt:
${text.slice(0, 2600)}
  `.trim();
}

function renderAiAnalysis(parsed) {
  const aiBox = document.getElementById("aiResult");
  aiBox.innerHTML = `
    <div class="factor-card">
      <div class="factor-title">AI verdict</div>
      <div class="factor-desc">${parsed.verdict || "No verdict"}</div>
    </div>
  `;

  if (Array.isArray(parsed.claims)) {
    parsed.claims.forEach(cl => {
      aiBox.innerHTML += `
        <div class="factor-card ${cl.assessment === "evidence-based" ? "factor-pos" : "factor-neg"}">
          <div class="factor-title">${cl.text}</div>
          <div class="factor-desc">${cl.assessment} – ${cl.reason || ""}</div>
        </div>
      `;
    });
  }

  if (Array.isArray(parsed.authors) && parsed.authors.length > 0) {
    aiBox.innerHTML += `<div class="issues-label" style="margin-top:6px;">Author credibility</div>`;
    parsed.authors.forEach(a => {
      const lower = (a.name || "").toLowerCase();
      if (lower.includes("your genes") || lower.includes("genes")) return;
      aiBox.innerHTML += `
        <div class="factor-card ${a.credibility === "high" ? "factor-pos" : "factor-neg"}">
          <div class="factor-title">${a.name}</div>
          <div class="factor-desc">${a.credibility || ""} ${a.notes ? "– " + a.notes : ""}</div>
        </div>
      `;
    });
  }

  const evidence =
    Array.isArray(parsed.evidence_links) && parsed.evidence_links.length
      ? parsed.evidence_links
      : FALLBACK_EVIDENCE;

  aiBox.innerHTML += `<div class="issues-label" style="margin-top:6px;">Evidence / read more</div>`;
  evidence.forEach(ev => {
    aiBox.innerHTML += `
      <div class="factor-card factor-pos">
        <div class="factor-title">
          <a href="${ev.url}" target="_blank" style="color:#e4fff5; text-decoration:underline;">
            ${ev.name || ev.url}
          </a>
        </div>
        <div class="factor-desc">${ev.why || ev.url}</div>
      </div>
    `;
  });

  aiBox.innerHTML += `
    <div class="factor-card">
      <div class="factor-desc" style="font-size:0.58rem; opacity:0.6;">
        AI analysis is based on content provided and does not replace professional medical advice.
      </div>
    </div>
  `;
}

function updateScoreFromAI(newScore) {
  const scoreEl = document.getElementById("scoreVal");
  const bar = document.getElementById("progressFill");
  const pill = document.getElementById("statusPill");
  const aiBadge = document.getElementById("aiBadge");

  let final = Math.max(0, Math.min(100, Math.floor(newScore)));

  // Prevent AI from downgrading trusted institutions
  try {
    const host = new URL(lastPageData?.url || "").hostname;
    const alwaysCredible = [
      "harvard.edu",
      "health.harvard.edu",
      "stanford.edu",
      "mayoclinic.org",
      "nih.gov",
      "medlineplus.gov",
      "cdc.gov",
      "who.int",
      "clevelandclinic.org",
      "hopkinsmedicine.org"
    ];

    if (alwaysCredible.some(d => host === d || host.endsWith("." + d))) {
      final = Math.max(final, 95);
    }
  } catch {}

  if (scoreEl) scoreEl.textContent = final;
  if (bar) bar.style.width = final + "%";

  // NEW LABEL LOGIC FOR AI RESULT
  let label;
  let cls;
  if (final >= 90) {
    label = "CREDIBLE";
    cls = "status-good";
  } else if (final >= 80) {
    label = "LOOKS CREDIBLE";
    cls = "status-mid";
  } else if (final > 50) {
    label = "BE CAUTIOUS";
    cls = "status-mid";
  } else {
    label = "MISLEADING";
    cls = "status-bad"; // uses the base pill style
  }

  if (pill) {
    pill.textContent = label;
    pill.className = "status-pill " + cls;
  }
  if (aiBadge) {
    aiBadge.classList.add("show");
  }

  if (lastHeuristicReport) {
    lastHeuristicReport.score = final;
    lastHeuristicReport.aiAdjusted = true;
  }
}

// ========== GLOBAL CLICK: send title + full text so we can highlight exact paragraph ==========
document.addEventListener("click", (e) => {
  const card = e.target.closest(".factor-card");
  if (!card) return;

  const issueId = card.getAttribute("data-issue-id") || null;
  const titleEl = card.querySelector(".factor-title");
  const textTitle = titleEl ? titleEl.textContent.trim() : "";
  const textFull = card.innerText.trim();

  chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
    if (!tabs[0]) return;
    chrome.tabs.sendMessage(tabs[0].id, {
      type: "HIGHLIGHT_ISSUE",
      issueId,
      textTitle,
      textFull
    });
  });
});
