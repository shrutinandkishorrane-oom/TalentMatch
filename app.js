/* ==========================================================================
   TALENTMATCH - Main Application Controller & UI State Manager
   Hackathon Web Application Entry Point
   ========================================================================== */

import { SAMPLE_JOB_DESCRIPTION, SAMPLE_CANDIDATES } from './sampleData.js';
import { extractTextFromFile } from './pdfParser.js';
import { parseJobDescription } from './jdExtractor.js';
import { extractCandidateInformation } from './resumeExtractor.js';
import { calculateCandidateMatch } from './matchEngine.js';
import { calculateTruthConfidenceScore } from './truthScoreEngine.js';
import { generateCandidateRecommendation } from './recommendationEngine.js';
import { renderAnalyticsCharts } from './analytics.js';

// Application State
const state = {
  activeTab: 'screen', // 'screen', 'candidates', 'analytics', 'about'
  activeStep: 1,       // 1: JD, 2: Resumes, 3: Analyzing, 4: Results
  jobDescriptionText: '',
  jobRequirements: null,
  uploadedFiles: [],   // Array of { file, text, isDemo, id, name, size, parsedInfo }
  analyzedCandidates: [],
  filteredCandidates: [],
  selectedCandidate: null,
  searchQuery: '',
  filterMinScore: 0,
  filterRecommendation: 'all',
  filterSkill: 'all',
  sortOption: 'score-desc',
  isAnalyzing: false
};

// Initialize Application on DOM Ready
document.addEventListener('DOMContentLoaded', () => {
  initEventListeners();
  updateUI();
  
  // Render Lucide SVG icons if library loaded
  if (window.lucide) {
    window.lucide.createIcons();
  }
});

function initEventListeners() {
  // Navigation Tabs
  document.querySelectorAll('.nav-item').forEach(item => {
    item.addEventListener('click', (e) => {
      e.preventDefault();
      const tab = item.dataset.tab;
      switchTab(tab);
    });
  });

  // Hero Section Buttons
  const startScreeningBtn = document.getElementById('btn-start-screening');
  if (startScreeningBtn) {
    startScreeningBtn.addEventListener('click', () => {
      switchTab('screen');
      scrollToSection('screening-section');
    });
  }

  const loadDemoBtn = document.getElementById('btn-load-demo');
  if (loadDemoBtn) {
    loadDemoBtn.addEventListener('click', loadHackathonDemoData);
  }

  // Job Description Input
  const jdInput = document.getElementById('jd-textarea');
  if (jdInput) {
    jdInput.addEventListener('input', (e) => {
      state.jobDescriptionText = e.target.value;
      updateJobRequirementPreview();
      updateAnalyzeButtonState();
    });
  }

  const loadSampleJdBtn = document.getElementById('btn-sample-jd');
  if (loadSampleJdBtn) {
    loadSampleJdBtn.addEventListener('click', () => {
      state.jobDescriptionText = SAMPLE_JOB_DESCRIPTION.rawText;
      const jdTextarea = document.getElementById('jd-textarea');
      if (jdTextarea) jdTextarea.value = SAMPLE_JOB_DESCRIPTION.rawText;
      updateJobRequirementPreview();
      updateAnalyzeButtonState();
      showToast('Sample Job Description loaded!', 'success');
    });
  }

  // File Upload Elements
  const dropzone = document.getElementById('resume-dropzone');
  const fileInput = document.getElementById('file-input-hidden');
  const browseFilesBtn = document.getElementById('btn-browse-files');

  if (browseFilesBtn && fileInput) {
    browseFilesBtn.addEventListener('click', () => fileInput.click());
  }

  if (fileInput) {
    fileInput.addEventListener('change', (e) => {
      handleFilesSelected(Array.from(e.target.files));
      fileInput.value = ''; // Reset
    });
  }

  if (dropzone) {
    ['dragenter', 'dragover', 'dragleave', 'drop'].forEach(eventName => {
      dropzone.addEventListener(eventName, preventDefaults, false);
    });

    ['dragenter', 'dragover'].forEach(eventName => {
      dropzone.addEventListener(eventName, () => dropzone.classList.add('dragover'), false);
    });

    ['dragleave', 'drop'].forEach(eventName => {
      dropzone.addEventListener(eventName, () => dropzone.classList.remove('dragover'), false);
    });

    dropzone.addEventListener('drop', (e) => {
      const dt = e.dataTransfer;
      const files = Array.from(dt.files);
      handleFilesSelected(files);
    });
  }

  // "Use Demo Resumes" button
  const loadDemoResumesBtn = document.getElementById('btn-demo-resumes');
  if (loadDemoResumesBtn) {
    loadDemoResumesBtn.addEventListener('click', () => {
      loadDemoResumesOnly();
    });
  }

  // "Analyze Candidates" Button
  const analyzeBtn = document.getElementById('btn-analyze-candidates');
  if (analyzeBtn) {
    analyzeBtn.addEventListener('click', runCandidateAnalysis);
  }

  // Search & Filter Listeners
  const searchInput = document.getElementById('input-search-candidate');
  if (searchInput) {
    searchInput.addEventListener('input', (e) => {
      state.searchQuery = e.target.value.toLowerCase().trim();
      applyFiltersAndSort();
    });
  }

  const filterScoreSelect = document.getElementById('select-filter-score');
  if (filterScoreSelect) {
    filterScoreSelect.addEventListener('change', (e) => {
      state.filterMinScore = parseInt(e.target.value, 10) || 0;
      applyFiltersAndSort();
    });
  }

  const filterRecSelect = document.getElementById('select-filter-rec');
  if (filterRecSelect) {
    filterRecSelect.addEventListener('change', (e) => {
      state.filterRecommendation = e.target.value;
      applyFiltersAndSort();
    });
  }

  const filterSkillSelect = document.getElementById('select-filter-skill');
  if (filterSkillSelect) {
    filterSkillSelect.addEventListener('change', (e) => {
      state.filterSkill = e.target.value;
      applyFiltersAndSort();
    });
  }

  const sortSelect = document.getElementById('select-sort');
  if (sortSelect) {
    sortSelect.addEventListener('change', (e) => {
      state.sortOption = e.target.value;
      applyFiltersAndSort();
    });
  }

  // Modal Close Listeners
  const modalOverlay = document.getElementById('candidate-modal');
  const modalCloseBtn = document.getElementById('modal-close-btn');

  if (modalOverlay) {
    modalOverlay.addEventListener('click', (e) => {
      if (e.target === modalOverlay) closeModal();
    });
  }
  if (modalCloseBtn) {
    modalCloseBtn.addEventListener('click', closeModal);
  }
}

function preventDefaults(e) {
  e.preventDefault();
  e.stopPropagation();
}

function switchTab(tab) {
  state.activeTab = tab;
  
  // Update Navbar Active State
  document.querySelectorAll('.nav-item').forEach(item => {
    item.classList.toggle('active', item.dataset.tab === tab);
  });

  // Views Visibility Toggle
  const viewScreen = document.getElementById('view-screening');
  const viewCandidates = document.getElementById('view-candidates');
  const viewAnalytics = document.getElementById('view-analytics');
  const viewAbout = document.getElementById('view-about');

  if (viewScreen) viewScreen.style.display = (tab === 'screen') ? 'block' : 'none';
  if (viewCandidates) viewCandidates.style.display = (tab === 'candidates') ? 'block' : 'none';
  if (viewAnalytics) viewAnalytics.style.display = (tab === 'analytics') ? 'block' : 'none';
  if (viewAbout) viewAbout.style.display = (tab === 'about') ? 'block' : 'none';

  if (tab === 'analytics' && state.analyzedCandidates.length > 0) {
    setTimeout(() => renderAnalyticsCharts(state.analyzedCandidates), 100);
  }

  if (window.lucide) window.lucide.createIcons();
}

function updateJobRequirementPreview() {
  const reqContainer = document.getElementById('jd-requirements-preview');
  if (!reqContainer) return;

  if (!state.jobDescriptionText.trim()) {
    reqContainer.innerHTML = '<span class="req-tag">Enter job description to parse skills</span>';
    return;
  }

  const parsed = parseJobDescription(state.jobDescriptionText);
  state.jobRequirements = parsed;

  let html = `<div style="font-size: 0.8rem; font-weight: 600; margin-bottom: 0.35rem;">Detected Requirements (${parsed.title}):</div>`;
  html += '<div class="requirements-tag-cloud">';
  
  parsed.requiredSkills.forEach(skill => {
    html += `<span class="req-tag required">✓ ${skill}</span>`;
  });
  parsed.preferredSkills.forEach(skill => {
    html += `<span class="req-tag">+ ${skill}</span>`;
  });
  html += `<span class="req-tag">${parsed.minExperienceYears}+ yrs Exp</span>`;
  html += `<span class="req-tag">${parsed.requiredEducation}</span>`;
  html += '</div>';

  reqContainer.innerHTML = html;
}

async function handleFilesSelected(files) {
  if (!files || files.length === 0) return;

  for (const file of files) {
    // Avoid duplicates
    if (state.uploadedFiles.some(f => f.name === file.name)) {
      continue;
    }

    const fileObj = {
      id: 'file-' + Math.random().toString(36).substring(2, 9),
      file: file,
      name: file.name,
      size: (file.size / 1024).toFixed(1) + ' KB',
      isDemo: false,
      status: 'reading',
      text: ''
    };

    state.uploadedFiles.push(fileObj);
    renderFileList();

    try {
      const extractedText = await extractTextFromFile(file);
      fileObj.text = extractedText;
      fileObj.status = 'ready';
      renderFileList();
    } catch (err) {
      fileObj.status = 'error';
      fileObj.errorMessage = err.message;
      renderFileList();
      showToast(err.message, 'error');
    }
  }

  updateAnalyzeButtonState();
}

function loadDemoResumesOnly() {
  SAMPLE_CANDIDATES.forEach(cand => {
    if (!state.uploadedFiles.some(f => f.name === cand.filename)) {
      state.uploadedFiles.push({
        id: cand.id,
        name: cand.filename,
        size: '15.4 KB',
        isDemo: true,
        status: 'ready',
        text: cand.rawText,
        candidateName: cand.candidateName
      });
    }
  });

  renderFileList();
  updateAnalyzeButtonState();
  showToast(`5 Sample Demo Resumes loaded into pipeline!`, 'info');
}

function loadHackathonDemoData() {
  switchTab('screen');
  
  // Load Sample JD
  state.jobDescriptionText = SAMPLE_JOB_DESCRIPTION.rawText;
  const jdTextarea = document.getElementById('jd-textarea');
  if (jdTextarea) jdTextarea.value = SAMPLE_JOB_DESCRIPTION.rawText;
  updateJobRequirementPreview();

  // Load Demo Resumes
  loadDemoResumesOnly();

  // Scroll down to action button
  scrollToSection('screening-section');
  showToast('Loaded complete Hackathon Demo Data (JD + 5 Resumes)', 'success');
}

function renderFileList() {
  const container = document.getElementById('uploaded-files-container');
  if (!container) return;

  if (state.uploadedFiles.length === 0) {
    container.innerHTML = '<div style="color: var(--text-muted); font-size: 0.85rem; text-align: center; padding: 1rem;">No resumes uploaded yet.</div>';
    return;
  }

  let html = '';
  state.uploadedFiles.forEach(f => {
    let statusBadge = '';
    if (f.status === 'reading') {
      statusBadge = '<span class="file-status-badge">Reading...</span>';
    } else if (f.status === 'ready') {
      statusBadge = f.isDemo ? '<span class="file-status-badge demo">DEMO DATA</span>' : '<span class="file-status-badge parsed">READY</span>';
    } else {
      statusBadge = '<span class="file-status-badge" style="background:var(--danger-bg);color:var(--danger-text);">ERROR</span>';
    }

    html += `
      <div class="file-item">
        <div class="file-info">
          <i data-lucide="file-text" style="width:16px;height:16px;color:var(--primary);"></i>
          <span class="file-name" title="${f.name}">${f.name}</span>
          <span class="file-size">${f.size}</span>
          ${statusBadge}
        </div>
        <button class="file-remove-btn" onclick="window.removeUploadedFile('${f.id}')" title="Remove resume">
          <i data-lucide="trash-2" style="width:14px;height:14px;"></i>
        </button>
      </div>
    `;
  });

  container.innerHTML = html;
  if (window.lucide) window.lucide.createIcons();
}

window.removeUploadedFile = function(id) {
  state.uploadedFiles = state.uploadedFiles.filter(f => f.id !== id);
  renderFileList();
  updateAnalyzeButtonState();
};

function updateAnalyzeButtonState() {
  const analyzeBtn = document.getElementById('btn-analyze-candidates');
  const statusText = document.getElementById('action-status-note');

  const hasJd = state.jobDescriptionText.trim().length > 0;
  const readyFiles = state.uploadedFiles.filter(f => f.status === 'ready');
  const hasFiles = readyFiles.length > 0;

  if (analyzeBtn) {
    analyzeBtn.disabled = !hasJd || !hasFiles;
  }

  if (statusText) {
    if (!hasJd && !hasFiles) {
      statusText.innerHTML = 'Enter a Job Description and upload at least 1 resume to enable analysis.';
    } else if (!hasJd) {
      statusText.innerHTML = 'Please enter or paste a Job Description.';
    } else if (!hasFiles) {
      statusText.innerHTML = `${readyFiles.length} resume(s) uploaded. Add resumes to start.`;
    } else {
      statusText.innerHTML = `Ready to analyze <strong>${readyFiles.length} candidate(s)</strong> against target job description.`;
    }
  }
}

async function runCandidateAnalysis() {
  const readyFiles = state.uploadedFiles.filter(f => f.status === 'ready');
  if (!state.jobDescriptionText.trim() || readyFiles.length === 0) {
    showToast('Please provide a job description and at least 1 ready resume.', 'error');
    return;
  }

  // Step 3: Show Loading Overlay
  state.isAnalyzing = true;
  state.activeStep = 3;
  updateStepperUI();

  const loadingOverlay = document.getElementById('loading-overlay');
  const resultsContainer = document.getElementById('results-dashboard-container');
  if (loadingOverlay) loadingOverlay.style.display = 'flex';
  if (resultsContainer) resultsContainer.style.display = 'none';

  // Parse Job Description Requirements
  state.jobRequirements = parseJobDescription(state.jobDescriptionText);

  // Artificial delay for smooth UX transition animation (1.2s)
  await new Promise(res => setTimeout(res, 1200));

  const results = [];
  readyFiles.forEach(fileObj => {
    // 1. Entity Extraction
    const candidateInfo = extractCandidateInformation(fileObj.text, fileObj.name);
    
    // 2. Compute Transparent Match Score
    const match = calculateCandidateMatch(candidateInfo, state.jobRequirements);

    // 3. Compute Truth / Confidence Score
    const truth = calculateTruthConfidenceScore(candidateInfo);

    // 4. Recommendation Classification
    const rec = generateCandidateRecommendation(match.overallScore, match, truth);

    results.push({
      id: fileObj.id,
      filename: fileObj.name,
      isDemo: fileObj.isDemo,
      candidateName: candidateInfo.candidateName,
      email: candidateInfo.email,
      phone: candidateInfo.phone,
      candidateInfo,
      matchScore: match.overallScore,
      matchDetails: match,
      truthScore: truth.truthScore,
      truthDetails: truth,
      recommendation: rec,
      rawText: fileObj.text
    });
  });

  // Rank Candidates from highest Match Score to lowest
  results.sort((a, b) => b.matchScore - a.matchScore);
  
  // Assign Rank Numbers
  results.forEach((cand, idx) => {
    cand.rank = idx + 1;
  });

  state.analyzedCandidates = results;
  state.isAnalyzing = false;
  state.activeStep = 4;

  if (loadingOverlay) loadingOverlay.style.display = 'none';
  if (resultsContainer) resultsContainer.style.display = 'block';

  updateStepperUI();
  populateSkillFilterDropdown(results);
  applyFiltersAndSort();
  renderKpiSummaryCards(results);

  // Scroll smoothly to results
  scrollToSection('results-dashboard-container');
  showToast(`Analysis complete! Successfully ranked ${results.length} candidate(s).`, 'success');
}

function updateStepperUI() {
  document.querySelectorAll('.step-item').forEach(item => {
    const step = parseInt(item.dataset.step, 10);
    item.classList.toggle('active', step === state.activeStep);
    item.classList.toggle('completed', step < state.activeStep);
  });
}

function renderKpiSummaryCards(results) {
  const kpiTotal = document.getElementById('kpi-total-candidates');
  const kpiAvgScore = document.getElementById('kpi-avg-score');
  const kpiTopCandidate = document.getElementById('kpi-top-candidate');
  const kpiRecCount = document.getElementById('kpi-rec-count');

  if (kpiTotal) kpiTotal.innerText = results.length;

  if (kpiAvgScore) {
    const avg = results.reduce((acc, c) => acc + c.matchScore, 0) / (results.length || 1);
    kpiAvgScore.innerText = Math.round(avg) + '%';
  }

  if (kpiTopCandidate) {
    kpiTopCandidate.innerText = results.length > 0 ? results[0].candidateName : 'N/A';
  }

  if (kpiRecCount) {
    const recCount = results.filter(c => c.recommendation.key === 'strongly-recommended' || c.recommendation.key === 'recommended').length;
    kpiRecCount.innerText = recCount;
  }
}

function populateSkillFilterDropdown(results) {
  const filterSkillSelect = document.getElementById('select-filter-skill');
  if (!filterSkillSelect) return;

  const allSkills = new Set();
  results.forEach(r => {
    (r.candidateInfo.skills || []).forEach(s => allSkills.add(s));
  });

  let options = '<option value="all">All Skills</option>';
  Array.from(allSkills).sort().forEach(s => {
    options += `<option value="${s}">${s}</option>`;
  });

  filterSkillSelect.innerHTML = options;
}

function applyFiltersAndSort() {
  let list = [...state.analyzedCandidates];

  // Search by name
  if (state.searchQuery) {
    list = list.filter(c => c.candidateName.toLowerCase().includes(state.searchQuery));
  }

  // Min Match Score
  if (state.filterMinScore > 0) {
    list = list.filter(c => c.matchScore >= state.filterMinScore);
  }

  // Recommendation Level
  if (state.filterRecommendation !== 'all') {
    list = list.filter(c => c.recommendation.key === state.filterRecommendation);
  }

  // Skill Filter
  if (state.filterSkill !== 'all') {
    list = list.filter(c => 
      (c.candidateInfo.skills || []).some(s => s.toLowerCase() === state.filterSkill.toLowerCase())
    );
  }

  // Sorting
  if (state.sortOption === 'score-desc') {
    list.sort((a, b) => b.matchScore - a.matchScore);
  } else if (state.sortOption === 'score-asc') {
    list.sort((a, b) => a.matchScore - b.matchScore);
  } else if (state.sortOption === 'truth-desc') {
    list.sort((a, b) => b.truthScore - a.truthScore);
  } else if (state.sortOption === 'name-asc') {
    list.sort((a, b) => a.candidateName.localeCompare(b.candidateName));
  }

  state.filteredCandidates = list;
  renderCandidateTable(list);
  renderCandidateDirectoryGrid(list);
}

function renderCandidateTable(candidates) {
  const tbody = document.getElementById('candidate-table-body');
  if (!tbody) return;

  if (candidates.length === 0) {
    tbody.innerHTML = '<tr><td colspan="6" style="text-align:center; padding: 2rem; color: var(--text-muted);">No candidates match your search filters.</td></tr>';
    return;
  }

  let html = '';
  candidates.forEach(cand => {
    const scoreClass = cand.matchScore >= 80 ? 'high' : (cand.matchScore >= 65 ? 'medium' : 'low');
    const truthClass = cand.truthScore >= 80 ? 'high' : 'medium';
    const rankClass = cand.rank === 1 ? 'top-1' : (cand.rank === 2 ? 'top-2' : (cand.rank === 3 ? 'top-3' : ''));

    // Top skills chips
    const skillsChips = (cand.matchDetails.matchedSkills || []).slice(0, 3).map(s => 
      `<span class="skill-chip matched">${s}</span>`
    ).join(' ');

    html += `
      <tr onclick="window.openCandidateDetailModal('${cand.id}')">
        <td><span class="rank-badge ${rankClass}">#${cand.rank}</span></td>
        <td>
          <div class="candidate-name-group">
            <span class="candidate-name">${cand.candidateName} ${cand.isDemo ? '<span class="file-status-badge demo">DEMO</span>' : ''}</span>
            <span class="candidate-meta">${cand.candidateInfo.education} • ${cand.candidateInfo.experienceYears} yrs exp</span>
          </div>
        </td>
        <td><span class="score-pill ${scoreClass}">${cand.matchScore}%</span></td>
        <td><span class="score-pill ${truthClass}">${cand.truthScore}%</span></td>
        <td><span class="rec-badge ${cand.recommendation.badgeClass}">${cand.recommendation.label}</span></td>
        <td><div class="skills-cloud">${skillsChips || '<span class="skill-chip">None</span>'}</div></td>
      </tr>
    `;
  });

  tbody.innerHTML = html;
  if (window.lucide) window.lucide.createIcons();
}

function renderCandidateDirectoryGrid(candidates) {
  const directoryContainer = document.getElementById('candidates-directory-grid');
  if (!directoryContainer) return;

  if (candidates.length === 0) {
    directoryContainer.innerHTML = '<div style="color:var(--text-muted); text-align:center; padding:2rem;">No candidates available. Run analysis first.</div>';
    return;
  }

  let html = '';
  candidates.forEach(cand => {
    html += `
      <div class="panel-card" style="cursor:pointer;" onclick="window.openCandidateDetailModal('${cand.id}')">
        <div style="display:flex; justify-content:space-between; align-items:flex-start; margin-bottom:0.75rem;">
          <div>
            <h4 style="font-size:1.1rem; font-weight:700;">#${cand.rank} ${cand.candidateName}</h4>
            <div style="font-size:0.8rem; color:var(--text-muted);">${cand.email}</div>
          </div>
          <span class="rec-badge ${cand.recommendation.badgeClass}">${cand.recommendation.label}</span>
        </div>
        
        <div style="display:flex; gap:1rem; margin-bottom:1rem;">
          <div style="background:var(--bg-hover); padding:0.5rem 0.85rem; border-radius:var(--radius-md); text-align:center; flex:1;">
            <div style="font-size:0.7rem; color:var(--text-muted); font-weight:600;">MATCH SCORE</div>
            <div style="font-size:1.25rem; font-weight:800; color:var(--primary);">${cand.matchScore}%</div>
          </div>
          <div style="background:var(--bg-hover); padding:0.5rem 0.85rem; border-radius:var(--radius-md); text-align:center; flex:1;">
            <div style="font-size:0.7rem; color:var(--text-muted); font-weight:600;">TRUTH CONFIDENCE</div>
            <div style="font-size:1.25rem; font-weight:800; color:var(--accent);">${cand.truthScore}%</div>
          </div>
        </div>

        <div style="font-size:0.825rem; color:var(--text-secondary); margin-bottom:1rem; line-height:1.4;">
          ${cand.recommendation.rationale}
        </div>

        <div style="margin-top:auto; padding-top:0.75rem; border-top:1px solid var(--border-light); display:flex; justify-content:space-between; align-items:center;">
          <span style="font-size:0.775rem; color:var(--text-muted);">${cand.candidateInfo.experienceYears} Yrs Exp • ${cand.candidateInfo.education}</span>
          <button class="btn btn-outline-primary btn-sm">View Analysis</button>
        </div>
      </div>
    `;
  });

  directoryContainer.innerHTML = html;
}

window.openCandidateDetailModal = function(id) {
  const cand = state.analyzedCandidates.find(c => c.id === id);
  if (!cand) return;

  state.selectedCandidate = cand;
  const modal = document.getElementById('candidate-modal');
  const modalContent = document.getElementById('modal-candidate-content');
  if (!modal || !modalContent) return;

  const m = cand.matchDetails;
  const b = m.breakdown;
  const t = cand.truthDetails;

  let matchedChips = (m.matchedSkills || []).map(s => `<span class="skill-chip matched">✓ ${s}</span>`).join(' ');
  let missingChips = (m.missingSkills || []).map(s => `<span class="skill-chip missing">✗ ${s}</span>`).join(' ');
  let additionalChips = (m.additionalSkills || []).map(s => `<span class="skill-chip additional">${s}</span>`).join(' ');

  let evidenceListHtml = t.evidencePoints.map(p => `<li class="evidence-item positive">${p}</li>`).join('');
  let reviewFlagsHtml = t.reviewFlags.map(r => `<li class="evidence-item warning">${r}</li>`).join('');

  modalContent.innerHTML = `
    <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:1.5rem; padding-bottom:1rem; border-bottom:1px solid var(--border-light);">
      <div>
        <h2 style="font-size:1.6rem; font-weight:800; color:var(--text-primary);">#${cand.rank} ${cand.candidateName}</h2>
        <div style="font-size:0.875rem; color:var(--text-muted); display:flex; gap:1rem; margin-top:0.25rem;">
          <span>📧 ${cand.email}</span>
          <span>📞 ${cand.phone}</span>
          <span>🎓 ${cand.candidateInfo.education}</span>
        </div>
      </div>
      <div style="text-align:right;">
        <span class="rec-badge ${cand.recommendation.badgeClass}" style="font-size:0.9rem; padding:0.5rem 1rem;">${cand.recommendation.label}</span>
      </div>
    </div>

    <!-- Top Score Summary Banner -->
    <div style="display:grid; grid-template-columns: 1fr 1fr; gap:1.25rem; margin-bottom:1.5rem;">
      <div style="background:var(--primary-light); border:1px solid rgba(109,63,192,0.2); border-radius:var(--radius-md); padding:1.25rem;">
        <div style="font-size:0.8rem; font-weight:700; color:var(--primary); text-transform:uppercase;">Overall Match Score</div>
        <div style="font-size:2.5rem; font-weight:800; color:var(--primary); line-height:1.1; margin:0.3rem 0;">${cand.matchScore}%</div>
        <div style="font-size:0.8rem; color:var(--text-secondary);">Transparent weighted composite of skills, experience, education, and semantic NLP match.</div>
      </div>

      <div style="background:var(--info-bg); border:1px solid var(--info-border); border-radius:var(--radius-md); padding:1.25rem;">
        <div style="font-size:0.8rem; font-weight:700; color:var(--info-text); text-transform:uppercase;">Truth / Evidence Confidence</div>
        <div style="font-size:2.5rem; font-weight:800; color:var(--info-text); line-height:1.1; margin:0.3rem 0;">${cand.truthScore}%</div>
        <div style="font-size:0.8rem; color:var(--text-secondary);">${t.disclaimer}</div>
      </div>
    </div>

    <div class="detail-grid">
      <!-- Left Column: Detailed Match Analysis -->
      <div>
        <div class="detail-section">
          <div class="detail-section-title">
            <i data-lucide="bar-chart-2" style="width:18px;height:18px;color:var(--primary);"></i>
            Transparent Match Score Breakdown
          </div>
          
          <div class="score-bar-group">
            <div class="score-bar-header">
              <span>Skill Match (40% Weight)</span>
              <span>${b.skillScore} / 40 pts</span>
            </div>
            <div class="score-bar-track"><div class="score-bar-fill" style="width:${(b.skillScore/40)*100}%; background:var(--primary);"></div></div>
          </div>

          <div class="score-bar-group">
            <div class="score-bar-header">
              <span>Experience Match (25% Weight)</span>
              <span>${b.expScore} / 25 pts</span>
            </div>
            <div class="score-bar-track"><div class="score-bar-fill" style="width:${(b.expScore/25)*100}%; background:#54309A;"></div></div>
          </div>

          <div class="score-bar-group">
            <div class="score-bar-header">
              <span>Education Alignment (10% Weight)</span>
              <span>${b.eduScore} / 10 pts</span>
            </div>
            <div class="score-bar-track"><div class="score-bar-fill" style="width:${(b.eduScore/10)*100}%; background:#10b981;"></div></div>
          </div>

          <div class="score-bar-group">
            <div class="score-bar-header">
              <span>Semantic NLP Relevance (25% Weight)</span>
              <span>${b.semanticScore} / 25 pts</span>
            </div>
            <div class="score-bar-track"><div class="score-bar-fill" style="width:${(b.semanticScore/25)*100}%; background:#9333ea;"></div></div>
          </div>

          <div style="margin-top:0.85rem; font-size:0.8rem; font-weight:700; color:var(--text-primary); text-align:right;">
            Total Score: ${b.skillScore} + ${b.expScore} + ${b.eduScore} + ${b.semanticScore} = ${cand.matchScore} / 100 pts
          </div>
        </div>

        <div class="detail-section">
          <div class="detail-section-title">
            <i data-lucide="layers" style="width:18px;height:18px;color:var(--primary);"></i>
            Skill Matrix & Gap Analysis
          </div>

          <div style="margin-bottom:0.85rem;">
            <div style="font-size:0.8rem; font-weight:600; color:var(--success-text); margin-bottom:0.35rem;">Matched Required Skills:</div>
            <div class="skills-cloud">${matchedChips || '<span style="font-size:0.8rem;color:var(--text-muted);">None</span>'}</div>
          </div>

          <div style="margin-bottom:0.85rem;">
            <div style="font-size:0.8rem; font-weight:600; color:var(--danger-text); margin-bottom:0.35rem;">Missing Required Skills:</div>
            <div class="skills-cloud">${missingChips || '<span style="font-size:0.8rem;color:var(--success-text);">✓ All required skills matched!</span>'}</div>
          </div>

          <div>
            <div style="font-size:0.8rem; font-weight:600; color:var(--info-text); margin-bottom:0.35rem;">Additional Skills Detected:</div>
            <div class="skills-cloud">${additionalChips || '<span style="font-size:0.8rem;color:var(--text-muted);">None</span>'}</div>
          </div>
        </div>

        <div class="detail-section">
          <div class="detail-section-title">
            <i data-lucide="message-square" style="width:18px;height:18px;color:var(--primary);"></i>
            Explainable Candidate Reasoning
          </div>

          <div style="margin-bottom:0.85rem; font-size:0.85rem;">
            <strong style="color:var(--success-text);">Why candidate matches:</strong>
            <p style="color:var(--text-secondary); margin-top:0.25rem;">${m.whyMatches}</p>
          </div>

          <div style="font-size:0.85rem;">
            <strong style="color:var(--danger-text);">Potential missing areas / gaps:</strong>
            <p style="color:var(--text-secondary); margin-top:0.25rem;">${m.whyNotMatches}</p>
          </div>
        </div>
      </div>

      <!-- Right Column: Evidence & Resume Text -->
      <div>
        <div class="detail-section">
          <div class="detail-section-title">
            <i data-lucide="shield-check" style="width:18px;height:18px;color:var(--accent);"></i>
            Evidence & Consistency Audit
          </div>

          <div style="font-size:0.8rem; font-weight:600; color:var(--success-text); margin-bottom:0.35rem;">Supporting Evidence Found:</div>
          <ul class="evidence-list" style="margin-bottom:1rem;">
            ${evidenceListHtml || '<li class="evidence-item">No specific evidence items logged.</li>'}
          </ul>

          <div style="font-size:0.8rem; font-weight:600; color:var(--warning-text); margin-bottom:0.35rem;">Claims Needing Review:</div>
          <ul class="evidence-list">
            ${reviewFlagsHtml || '<li class="evidence-item positive">✓ No consistency flags detected.</li>'}
          </ul>
        </div>

        <div class="detail-section">
          <div class="detail-section-title">
            <i data-lucide="briefcase" style="width:18px;height:18px;color:var(--primary);"></i>
            Experience & Education Overview
          </div>
          <div style="font-size:0.825rem; color:var(--text-secondary); line-height:1.5;">
            <div><strong>Experience:</strong> ${cand.candidateInfo.experienceYears} Years</div>
            <div><strong>Institution:</strong> ${cand.candidateInfo.institution}</div>
            <div><strong>Detected Roles:</strong> ${cand.candidateInfo.roles.join(', ')}</div>
            <div><strong>Projects:</strong> ${cand.candidateInfo.projects.join(', ')}</div>
          </div>
        </div>
      </div>
    </div>
  `;

  modal.style.display = 'flex';
  if (window.lucide) window.lucide.createIcons();
};

function closeModal() {
  const modal = document.getElementById('candidate-modal');
  if (modal) modal.style.display = 'none';
}

function showToast(message, type = 'info') {
  const container = document.getElementById('toast-container');
  if (!container) return;

  const toast = document.createElement('div');
  toast.className = `toast ${type}`;
  toast.innerHTML = `<span>${message}</span>`;
  container.appendChild(toast);

  setTimeout(() => {
    toast.style.opacity = '0';
    setTimeout(() => toast.remove(), 300);
  }, 3500);
}

function scrollToSection(id) {
  const el = document.getElementById(id);
  if (el) el.scrollIntoView({ behavior: 'smooth' });
}
