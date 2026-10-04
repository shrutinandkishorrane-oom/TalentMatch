# TALENTMATCH
### Intelligent Resume & Job Matching Platform

**Hackathon Problem Statement**: *AI Resume & Job Matching System*

TALENTMATCH is a complete, functional, hackathon-ready recruiter platform designed to solve manual resume screening bottlenecks. It automatically parses job descriptions and candidate resumes, calculates transparent weighted match scores, audits evidence consistency with a Truth/Confidence score, ranks candidates, generates explainable recommendations, and provides visual skill gap analytics.

---

## 🌟 Key Features

1. **Job Description Input & Auto-Extraction**:
   - Accepts large custom job descriptions or 1-click sample job description.
   - Auto-extracts required skills, preferred skills, min experience years, required education level, and job title.

2. **Multi-Format Resume Upload**:
   - Drag-and-drop or file selector supporting **PDF**, **DOCX**, and **TXT** files.
   - Client-side document text parsing with file size/format validation and graceful error notifications.
   - Pre-loaded sample candidate resumes for live demonstrations.

3. **Entity Extraction Engine**:
   - Extracts candidate name, email, phone number, technical skills, work experience timeline, roles, education, degrees, institutions, projects, and certifications.

4. **Transparent Match Score (0–100%)**:
   - **Skill Match (40%)**: Required skills coverage ratio + preferred skills bonus.
   - **Experience Match (25%)**: Candidate years vs target requirement ratio.
   - **Education Match (10%)**: Degree level and field of study alignment.
   - **Semantic NLP Relevance (25%)**: N-gram token overlap and TF-IDF cosine similarity.
   - Component scores sum *exactly* to the displayed total score.

5. **Truth / Confidence Score (0–100%)**:
   - Audits evidence consistency within the resume (e.g. verifying claimed skills against project descriptions and employment timeline).
   - Lists positive evidence points (✓) and claims needing review (⚠).
   - Includes neutral disclaimers to ensure objective candidate evaluation.

6. **Explainable Recommendation System**:
   - **Strongly Recommended** (90–100%)
   - **Recommended** (75–89%)
   - **Consider** (60–74%)
   - **Not Recommended** (<60%)
   - Generates contextual rationales explaining *why candidate matches* and *potential missing areas*.

7. **Automated Ranking & Interactive Inspection**:
   - Ranks candidates automatically from highest match score to lowest.
   - Modal inspector displaying detailed score math, skill comparison (Required, Matched, Missing, Additional), evidence audit, and parsed text.

8. **Search, Filter & Sort**:
   - Search by candidate name.
   - Filter by minimum match score, recommendation level, specific skill, or experience.
   - Sort by score, truth score, or candidate name.

9. **Live Analytics**:
   - Visual charts powered by Chart.js showing score distribution, recommendation breakdown, and top missing skills across candidate datasets.

10. **1-Click Hackathon Demo Mode**:
    - Pre-populated with realistic job descriptions and 5 diverse candidate resumes (Rahul Sharma, Priya Patil, Amit Joshi, Sneha Verma, Vikram Malhotra).

---

## 🛠 Technology Stack

- **Frontend**: HTML5, ES Modules (JavaScript), Custom CSS Design System (Inter Font, Dark/Light Theme Tokens, Glassmorphism, Micro-animations)
- **Document Parsing**: `pdfjs-dist` (Client-side PDF text extraction), `mammoth.js` (Client-side DOCX parsing)
- **Analytics & Icons**: `Chart.js`, `Lucide Icons`
- **Backend / Execution**: Python 3.x `http.server` (Zero external dependencies)

---

## 🏗 Architecture & Workflow

```
[Job Description]  +  [Uploaded Resumes (PDF / DOCX / TXT)]
         │                        │
         ▼                        ▼
[jdExtractor.js]        [pdfParser.js / resumeExtractor.js]
         │                        │
         └───────────┬────────────┘
                     ▼
             [matchEngine.js] ─────► Transparent Scoring (40% Skill, 25% Exp, 10% Edu, 25% NLP)
                     │
                     ▼
          [truthScoreEngine.js] ───► Evidence & Timeline Consistency Audit
                     │
                     ▼
       [recommendationEngine.js] ──► Recommendation Tier & Explainable Rationale
                     │
                     ▼
             [Results Dashboard] ──► Candidate Ranking, Detailed Modal, Filters & Analytics
```

---

## 📐 Scoring Formulas

### 1. Overall Match Score Formula
$$\text{Match Score} = \text{SkillScore}_{(40)} + \text{ExpScore}_{(25)} + \text{EduScore}_{(10)} + \text{SemanticScore}_{(25)}$$

- **Skill Score**: $(\frac{\text{Matched Required Skills}}{\text{Total Required Skills}} + 0.2 \times \frac{\text{Matched Preferred}}{\text{Total Preferred}}) \times 40$
- **Experience Score**: $\min(1.0, \frac{\text{Candidate Exp Yrs}}{\text{Target Exp Yrs}}) \times 25$
- **Education Score**: Degree alignment level (Ph.D. / Master's = 10 pts, Bachelor's = 9 pts, Diploma/Other = 7 pts)
- **Semantic Score**: $\text{TF-IDF Cosine Similarity}(\text{Resume Text}, \text{JD Text}) \times 25$

---

## 🚀 How to Run Locally

### Option 1: Using Python HTTP Server (Recommended)
1. Clone or download the repository.
2. Open terminal in the project directory:
   ```bash
   cd ai-resume-matcher
   ```
3. Run the local Python server:
   ```bash
   py server.py
   # or
   python server.py
   ```
4. Open your browser at `http://localhost:8000`.

### Option 2: Direct Browser Launch
Simply double-click `index.html` or open it directly in Chrome, Edge, Firefox, or Safari.

---

## 🧪 Hackathon Demonstration Walkthrough

1. Open **TALENTMATCH**.
2. Click **"Load Demo Data"** at the top navbar (or "Start Screening" -> "Load Sample JD" & "Use Sample Resumes").
3. Click **"Analyze Candidates"**.
4. Observe the smooth loading state and transition to **Ranked Results**.
5. Review candidate rankings (#1 Rahul Sharma, #2 Priya Patil, #3 Amit Joshi...).
6. Click on candidate **Rahul Sharma** to open the **Candidate Detailed Inspector Modal**:
   - Inspect the transparent score math ($38 + 22 + 10 + 23 = 93/100$).
   - Review matched skills (✓ Python, React, PostgreSQL...) and missing skills.
   - Review evidence consistency points and claims review flags.
7. Use the search bar to search for `"Priya"` or filter by score threshold.
8. Switch to the **Analytics** tab to view score distribution and skill gap charts.

---

## 🌐 Deployment Instructions

TALENTMATCH is a standard web application. It can be deployed in 1-click on:
- **Netlify**: Drag and drop the project folder into Netlify.
- **Vercel**: Run `vercel` or connect GitHub repository.
- **GitHub Pages**: Push code to GitHub repository and turn on GitHub Pages.

---

## 📝 AI-Assisted Development Disclosure

*This application was developed with AI assistance for rapid hackathon prototyping. All scoring algorithms, parsing logic, and UI components were built and verified for execution correctness.*
