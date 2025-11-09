![Static Badge](https://img.shields.io/badge/javascript-eb8f34)
![Static Badge](https://img.shields.io/badge/html-6ced55)
![Static Badge](https://img.shields.io/badge/css-5573ed)\
🧠 Powered by xAI Grok-3 • 🩺 Built for Health Information Integrity

# VeriCura

A premium Chrome extension that detects health misinformation, verifies online medical content, and provides AI-driven credibility insights to help users make informed health decisions.

---

## The Problem

The spread of **medical misinformation** online is one of the most pressing digital-age challenges.  
From “miracle cures” to “detox hacks,” unverified health advice circulates across social media and search results—often faster than legitimate science.  

Studies show that **over 70% of health-related search results expose users to misleading or unproven claims**, undermining trust in doctors, research institutions, and evidence-based medicine.

Common misinformation patterns include:
- Clickbait headlines and “one weird trick” remedies  
- Lack of cited sources or author credentials  
- Sensational or fear-driven language  
- Commercial bias promoting products or supplements  
- Misinterpretation of clinical research  

---

## The Solution

**VeriCura** acts as your personal **AI fact-checker for health information**.  
It scans webpages in real time, detects misinformation patterns, and uses **xAI’s Grok-3** model to cross-verify health claims with authoritative data from trusted medical sources like the **CDC**, **NIH**, **WHO**, and **Mayo Clinic**.  

By combining linguistic analysis, domain reputation checks, and AI reasoning, VeriCura empowers users to distinguish credible medical advice from misleading noise.

---

## Key Features

### 🩺 Intelligent Health Scanning
- **Source Verification:** Identifies whether the content cites trusted medical authorities (NIH, CDC, WHO, Mayo Clinic).  
- **Claim Pattern Detection:** Flags phrases suggesting pseudoscience (“miracle cure,” “flush toxins,” “doctors don’t want you to know”).  
- **Author Validation:** Detects medical review authorship or professional credentials.  
- **Commercial Bias Check:** Highlights excessive product links or sales language.  

---

### ⚖️ Smart Scoring System
- **Heuristic Scoring:** Generates an initial credibility score based on content, authorship, and source links.  
- **AI-Adjusted Scoring:** Uses xAI’s Grok-3 to cross-check claims against verified medical data.  
- **Dynamic Verdict Labels:**  
  - **≥90** → ✅ *Credible*  
  - **80-89** → 👍 *Looks Credible*  
  - **51-79** → ⚠️ *Be Cautious*  
  - **≤50** → 🚫 *Misleading*  
- **Animated Visualization:** Smooth progress bar and verdict transitions enhance clarity.

---

### 🤖 AI-Powered Analysis (xAI Integration)
- **Claim Extraction:** Identifies key medical claims from each page.  
- **Evidence Evaluation:** Verifies claims against public-health datasets and institutional reports.  
- **Author Assessment:** Evaluates medical credibility of listed authors or reviewers.  
- **Evidence Links:** Provides direct URLs to trusted health sources for further reading.  

---

### 🔗 Verified Evidence
Automatically links users to reliable references:
- [CDC – Health Topics](https://www.cdc.gov/health-topics.html)  
- [NIH – Health Information](https://www.nih.gov/health-information)  
- [Mayo Clinic – Patient Care & Info](https://www.mayoclinic.org/patient-care-and-health-information)  
- [WHO – Public Health Guidance](https://www.who.int)  

---

### 🎨 Clean, Minimalist Interface
- **Apple-inspired UI:** Elegant typography, rounded gradients, and intuitive spacing.  
- **Color Accents:** Green for verified, red for risk, teal for neutral caution.  
- **Responsive Design:** Optimized for clarity and accessibility within popup view.  
- **Instant Feedback:** Results and score updates appear in under one second.  

---

## Technologies Used

### Frontend
- **Vanilla JavaScript:** Core logic, DOM analysis, and Chrome API communication.  
- **CSS3:** Modern styling with gradients, glassmorphism, and hover animations.  
- **HTML5:** Semantic and accessible UI layout.  
- **Chrome Extensions API:** Seamless integration with user browsing experience.  

### Analysis Engine
- **Custom Heuristic Scorer:** Evaluates textual and link-based credibility metrics.  
- **Domain Reputation Filter:** Recognizes verified institutions and research portals.  
- **Bias Detector:** Flags persuasive or commercial language patterns.  

### AI Integration
- **xAI Grok-3 Model:** Performs deep reasoning on medical claims.  
- **Natural Language Understanding:** Evaluates factual consistency across reputable datasets.  
- **Evidence Linker:** Suggests external verification resources dynamically.  

### Architecture
- **Content Scripts:** Extract text, metadata, and external links securely.  
- **Popup Interface:** Displays scores, analysis summaries, and AI verdicts.  
- **Background Worker:** Manages API communication with xAI.  
- **Message Passing:** Efficient data flow between scanning, analysis, and UI modules.  

---

## Impact

### 🧑‍⚕️ For Health Professionals
- Quickly assess the credibility of viral articles shared by patients.  
- Reduce misinformation during clinical communication.  

### 🌍 For Everyday Users
- Instantly know whether a health article is credible or misleading.  
- Access verified evidence without leaving the page.  
- Build media literacy through transparent scoring.  

### 💡 For Developers
- A foundation for future misinformation-detection tools.  
- Modular, open-source architecture for easy integration or expansion.  

---

## Installation

1. Clone or download this repository.  
2. Open Chrome and navigate to `chrome://extensions/`.  
3. Enable **Developer Mode** (toggle in the top right).  
4. Click **Load unpacked** and select the VeriCura directory.  
5. The VeriCura icon will appear in your extensions toolbar.  

---

## Usage

1. Navigate to any health-related article or webpage.  
2. Click the **VeriCura** extension icon.  
3. Press **“Scan this Page”** to run heuristic analysis.  
4. Review the score, risk factors, and detected claims.  
5. Click **“Deeper AI Analysis”** to enable Grok-3 verification.  
6. View AI verdict, claim-level evidence, and recommended references.  

---

## Configuration

To enable AI-powered verification, add your xAI API key inside `popup.js`:

```javascript
const XAI_API_KEY = "PUT_YOUR_XAI_API_KEY_HERE";
