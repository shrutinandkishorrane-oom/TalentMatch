/* ==========================================================================
   TALENTMATCH - Real-Data Analytics & Charting Module
   Renders Chart.js visual insights using actual analyzed candidate data
   ========================================================================== */

let scoreChartInstance = null;
let recChartInstance = null;
let missingSkillsChartInstance = null;

/**
 * Render or update candidate analytics charts using current analyzed results.
 * @param {Array} candidateResults Array of analyzed candidate objects
 */
export function renderAnalyticsCharts(candidateResults) {
  if (!window.Chart || !candidateResults || candidateResults.length === 0) {
    return;
  }

  // 1. Match Score Distribution Chart
  renderScoreDistributionChart(candidateResults);

  // 2. Recommendation Tier Breakdown Chart
  renderRecommendationBreakdownChart(candidateResults);

  // 3. Top Missing Skills Frequency Chart
  renderMissingSkillsChart(candidateResults);
}

function renderScoreDistributionChart(results) {
  const ctx = document.getElementById('chart-score-dist');
  if (!ctx) return;

  if (scoreChartInstance) {
    scoreChartInstance.destroy();
  }

  const names = results.map(r => r.candidateName);
  const scores = results.map(r => r.matchScore);
  const truthScores = results.map(r => r.truthScore);

  scoreChartInstance = new window.Chart(ctx, {
    type: 'bar',
    data: {
      labels: names,
      datasets: [
        {
          label: 'Overall Match Score (%)',
          data: scores,
          backgroundColor: 'rgba(109, 63, 192, 0.85)',
          borderRadius: 6
        },
        {
          label: 'Truth / Confidence Score (%)',
          data: truthScores,
          backgroundColor: 'rgba(84, 48, 154, 0.65)',
          borderRadius: 6
        }
      ]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      scales: {
        y: {
          beginAtZero: true,
          max: 100,
          grid: { color: '#E6DFC8' }
        },
        x: {
          grid: { display: false }
        }
      },
      plugins: {
        legend: { position: 'top' }
      }
    }
  });
}

function renderRecommendationBreakdownChart(results) {
  const ctx = document.getElementById('chart-rec-breakdown');
  if (!ctx) return;

  if (recChartInstance) {
    recChartInstance.destroy();
  }

  const counts = {
    "Strongly Recommended": 0,
    "Recommended": 0,
    "Consider": 0,
    "Not Recommended": 0
  };

  results.forEach(r => {
    if (counts[r.recommendation.label] !== undefined) {
      counts[r.recommendation.label]++;
    }
  });

  recChartInstance = new window.Chart(ctx, {
    type: 'doughnut',
    data: {
      labels: Object.keys(counts),
      datasets: [{
        data: Object.values(counts),
        backgroundColor: [
          '#10b981', // Strongly Recommended (Green)
          '#6D3FC0', // Recommended (Purple)
          '#f59e0b', // Consider (Amber)
          '#ef4444'  // Not Recommended (Red)
        ],
        borderWidth: 2,
        borderColor: '#FFFDF7'
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: { position: 'right' }
      }
    }
  });
}

function renderMissingSkillsChart(results) {
  const ctx = document.getElementById('chart-missing-skills');
  if (!ctx) return;

  if (missingSkillsChartInstance) {
    missingSkillsChartInstance.destroy();
  }

  const skillGaps = {};
  results.forEach(r => {
    if (r.matchDetails && r.matchDetails.missingSkills) {
      r.matchDetails.missingSkills.forEach(skill => {
        skillGaps[skill] = (skillGaps[skill] || 0) + 1;
      });
    }
  });

  const sortedSkills = Object.entries(skillGaps)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 6);

  const labels = sortedSkills.map(s => s[0]);
  const dataCounts = sortedSkills.map(s => s[1]);

  missingSkillsChartInstance = new window.Chart(ctx, {
    type: 'bar',
    data: {
      labels: labels.length > 0 ? labels : ["None"],
      datasets: [{
        label: 'Candidates Missing Skill',
        data: dataCounts.length > 0 ? dataCounts : [0],
        backgroundColor: 'rgba(239, 68, 68, 0.75)',
        borderRadius: 6
      }]
    },
    options: {
      indexAxis: 'y',
      responsive: true,
      maintainAspectRatio: false,
      scales: {
        x: {
          ticks: { stepSize: 1 },
          grid: { color: '#e2e8f0' }
        },
        y: {
          grid: { display: false }
        }
      },
      plugins: {
        legend: { display: false }
      }
    }
  });
}
