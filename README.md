![Static Badge](https://img.shields.io/badge/javascript-eb8f34)
![Static Badge](https://img.shields.io/badge/html-6ced55)
![Static Badge](https://img.shields.io/badge/css-5573ed)\
🧠 Powered by xAI Grok-3 • 🩺 Built for Health Information Integrity

# VeriCura

A Chrome extension that detects medical misinformation, verifies online health articles, and provides AI-driven credibility analysis to help users navigate health content safely.

## The Problem

The internet is flooded with unverified health claims and pseudoscience. From “miracle cures” to “detox remedies,” misinformation spreads faster than verified science — putting lives at risk.  
Studies show that **over 70% of health-related searches expose users to misleading or outdated advice**, eroding trust in legitimate medical sources.

Common misinformation patterns include:
- Clickbait titles and “one weird trick” claims  
- Commercial bias disguised as medical guidance  
- Lack of author or institutional credibility  
- Absence of citations from trusted health organizations  
- Sensational or fear-based language  

## The Solution

VeriCura acts as your **personal fact-checker for health information**.  
It scans web pages in real time, analyzes credibility based on trusted medical criteria, and integrates with xAI’s Grok-3 to cross-verify claims against reliable evidence from the CDC, NIH, and Mayo Clinic.

## Key Features

### 🩺 Intelligent Health Scanning
- Detects **medical misinformation patterns** using linguistic and structural cues  
- Identifies **trusted sources** (NIH, CDC, WHO, Mayo Clinic)  
- Flags **commercial bias** and promotional links  
- Highlights **author transparency** and medical review presence  

### ⚖️ Smart Scoring System
- **Heuristic Scoring**: Baseline credibility score from 0–100  
- **AI-Adjusted Scoring**: Grok-3 cross-checks medical facts and refines the score  
- **Dynamic Verdicts**:  
  - ≥90 → ✅ Credible  
  - 80–89 → 👍 Looks Credible  
  - 51–79 → ⚠️ Be Cautious  
  - ≤50 → 🚫 Misleading  

### 🤖 xAI Integration
- Uses **Grok-3** for deep semantic understanding of health claims  
- Generates **claim-specific fact-checks** and evidence links  
- Summarizes **author credibility** and data transparency  

### 🔗 Verified Evidence
- Suggests reputable sources for verification, including:
  - **CDC** – Official health guidelines  
  - **NIH** – Research and trials  
  - **Mayo Clinic** – Patient-friendly insights  
  - **WHO** – Global health updates  

### 🧩 Minimalist Design
- Clean popup interface with color-coded credibility labels  
- Real-time feedback and score animation  
- Subtle accent colors for visual clarity (green for verified, red for risk)

## Technologies Used

- **JavaScript (Vanilla)** – Core logic and DOM analysis  
- **Chrome Extensions API** – Browser integration  
- **HTML5 + CSS3** – Sleek, accessible UI  
- **xAI Grok-3** – Deep AI analysis for misinformation detection  

## Installation

1. Clone or download this repository  
2. Open Chrome and go to `chrome://extensions/`  
3. Enable **Developer mode** (top right corner)  
4. Click **Load unpacked** and select the VeriCura directory  
5. The VeriCura icon will appear in your toolbar  

## Configuration

To enable AI-powered deep analysis, add your xAI key:

```javascript
const XAI_API_KEY = "PUT_YOUR_XAI_API_KEY_HERE";
