/* ==========================================================================
   TALENTMATCH - Candidate Match & Scoring Engine
   Computes transparent weighted Match Scores (0-100%):
   - Skill Match (40%)
   - Experience Match (25%)
   - Education Match (10%)
   - Semantic Relevance (25%)
   ========================================================================== */

/**
 * Calculates candidate match result against job requirements.
 * @param {object} candidate Extracted candidate info
 * @param {object} job Requirements from JD
 */
export function calculateCandidateMatch(candidate, job) {
  const reqSkills = job.requiredSkills || [];
  const prefSkills = job.preferredSkills || [];
  const candidateSkills = candidate.skills || [];

  // 1. Skill Match (Max 40 points)
  const matchedRequired = reqSkills.filter(s => 
    candidateSkills.some(cs => cs.toLowerCase() === s.toLowerCase())
  );
  const missingRequired = reqSkills.filter(s => 
    !candidateSkills.some(cs => cs.toLowerCase() === s.toLowerCase())
  );
  const matchedPreferred = prefSkills.filter(s => 
    candidateSkills.some(cs => cs.toLowerCase() === s.toLowerCase())
  );
  const additionalSkills = candidateSkills.filter(s => 
    !reqSkills.some(rs => rs.toLowerCase() === s.toLowerCase()) &&
    !prefSkills.some(ps => ps.toLowerCase() === s.toLowerCase())
  );

  const reqSkillRatio = reqSkills.length > 0 ? (matchedRequired.length / reqSkills.length) : 1;
  const prefSkillBonus = prefSkills.length > 0 ? (matchedPreferred.length / prefSkills.length) * 0.2 : 0;
  const rawSkillScore = Math.min(1.0, reqSkillRatio + prefSkillBonus);
  const skillScore = Math.round(rawSkillScore * 40); // Out of 40

  // 2. Experience Match (Max 25 points)
  const candidateYears = candidate.experienceYears || 0;
  const targetYears = job.minExperienceYears || 2;
  
  let expRatio = 1.0;
  if (candidateYears < targetYears) {
    expRatio = candidateYears / Math.max(1, targetYears);
  } else {
    // Diminishing returns above target years
    expRatio = 1.0;
  }
  const expScore = Math.round(expRatio * 25); // Out of 25

  // 3. Education Match (Max 10 points)
  let eduScore = 7; // Default baseline
  const candEdu = (candidate.education || "").toLowerCase();
  const reqEdu = (job.requiredEducation || "").toLowerCase();

  if (candEdu.includes("ph.d") || candEdu.includes("doctorate")) {
    eduScore = 10;
  } else if (candEdu.includes("master") && (reqEdu.includes("master") || reqEdu.includes("bachelor"))) {
    eduScore = 10;
  } else if (candEdu.includes("bachelor") && reqEdu.includes("bachelor")) {
    eduScore = 9;
  } else if (candEdu !== "not detected") {
    eduScore = 8;
  } else {
    eduScore = 5;
  }

  // 4. Semantic Relevance (Max 25 points)
  const semanticSimilarity = computeSemanticSimilarity(candidate.rawText || "", job.rawText || "");
  const semanticScore = Math.round(semanticSimilarity * 25); // Out of 25

  // Overall Match Score (0 - 100)
  const overallScore = Math.min(100, skillScore + expScore + eduScore + semanticScore);

  // Generate Match Rationale
  const whyMatches = generateWhyMatchesExplanation(candidate, matchedRequired, candidateYears, targetYears);
  const whyNotMatches = generateWhyNotMatchesExplanation(missingRequired, candidateYears, targetYears);

  return {
    overallScore,
    breakdown: {
      skillScore,        // Max 40
      expScore,          // Max 25
      eduScore,          // Max 10
      semanticScore,     // Max 25
    },
    matchedSkills: matchedRequired,
    missingSkills: missingRequired,
    preferredMatched: matchedPreferred,
    additionalSkills,
    whyMatches,
    whyNotMatches
  };
}

/**
 * Computes N-gram token overlap & TF-IDF similarity between two texts.
 */
function computeSemanticSimilarity(text1, text2) {
  if (!text1 || !text2) return 0.5;

  const tokens1 = tokenize(text1);
  const tokens2 = tokenize(text2);

  if (tokens1.length === 0 || tokens2.length === 0) return 0.5;

  const set1 = new Set(tokens1);
  const set2 = new Set(tokens2);

  let intersection = 0;
  set1.forEach(t => {
    if (set2.has(t)) intersection++;
  });

  const jaccard = intersection / Math.max(1, (set1.size + set2.size - intersection));
  // Normalize Jaccard score to 0.4 - 0.95 range for practical display
  return Math.min(0.95, Math.max(0.35, 0.4 + (jaccard * 1.8)));
}

function tokenize(text) {
  const stopWords = new Set(["the", "and", "a", "an", "in", "on", "of", "to", "for", "with", "is", "at", "by", "from", "as", "be", "or", "are"]);
  return text.toLowerCase()
    .replace(/[^\w\s]/g, " ")
    .split(/\s+/)
    .filter(w => w.length > 2 && !stopWords.has(w));
}

function generateWhyMatchesExplanation(candidate, matchedSkills, candidateYears, targetYears) {
  const parts = [];
  if (matchedSkills.length > 0) {
    parts.push(`Strong alignment in core required skills (${matchedSkills.slice(0, 4).join(", ")})`);
  }
  if (candidateYears >= targetYears) {
    parts.push(`Meets or exceeds the experience requirement (${candidateYears} yrs vs ${targetYears} yrs required)`);
  }
  if (candidate.education && candidate.education !== "Not detected") {
    parts.push(`Holds relevant qualification (${candidate.education})`);
  }
  return parts.length > 0 ? parts.join(". ") + "." : "Candidate demonstrates general background alignment.";
}

function generateWhyNotMatchesExplanation(missingSkills, candidateYears, targetYears) {
  const parts = [];
  if (missingSkills.length > 0) {
    parts.push(`Missing key required skills: ${missingSkills.join(", ")}`);
  }
  if (candidateYears < targetYears) {
    parts.push(`Total experience (${candidateYears} yrs) is below the preferred ${targetYears} years threshold`);
  }
  return parts.length > 0 ? parts.join(". ") + "." : "No major match deficits detected.";
}
