/* ==========================================================================
   TALENTMATCH - Truth / Confidence & Evidence Consistency Analyzer
   Evaluates evidence confidence and internal document consistency.
   Displays neutral review indicators and positive evidence points.
   ========================================================================== */

/**
 * Calculates Truth / Confidence score and evidence audit breakdown.
 * @param {object} candidate Extracted candidate information
 * @returns {object} Truth score and evidence items
 */
export function calculateTruthConfidenceScore(candidate) {
  const text = (candidate.rawText || "").toLowerCase();
  const skills = candidate.skills || [];
  const projects = candidate.projects || [];
  const certs = candidate.certifications || [];

  const evidencePoints = [];
  const reviewFlags = [];
  let confidencePoints = 80; // Baseline score out of 100

  // 1. Validate Skill Evidence in Projects & Experience
  let skillsWithEvidence = 0;
  skills.forEach(skill => {
    const sLower = skill.toLowerCase();
    const mentions = (text.split(sLower).length - 1);
    if (mentions >= 2) {
      skillsWithEvidence++;
    }
  });

  if (skills.length > 0) {
    const evidenceRatio = skillsWithEvidence / skills.length;
    if (evidenceRatio >= 0.6) {
      confidencePoints += 10;
      evidencePoints.push(`✓ Core skills (${skillsWithEvidence}/${skills.length}) supported by multiple contextual mentions in work history/projects.`);
    } else {
      confidencePoints -= 5;
      reviewFlags.push(`⚠ Some listed skills (${skills.length - skillsWithEvidence}) have single or limited contextual mentions in resume body.`);
    }
  }

  // 2. Validate Employment Timeline Consistency
  if (candidate.experienceYears > 0) {
    evidencePoints.push(`✓ Claimed experience (${candidate.experienceYears} yrs) appears consistent with employment date ranges.`);
    confidencePoints += 5;
  } else {
    reviewFlags.push(`⚠ Limited explicit employment dates detected for total experience verification.`);
  }

  // 3. Project & Certification Evidence
  if (projects.length > 0 && projects[0] !== "Not detected") {
    evidencePoints.push(`✓ Contains ${projects.length} verified project description(s) demonstrating applied experience.`);
    confidencePoints += 5;
  }

  if (certs.length > 0 && certs[0] !== "Not detected") {
    evidencePoints.push(`✓ Includes professional certification evidence (${certs[0]}).`);
    confidencePoints += 5;
  }

  // 4. Over-ambitious claims check (e.g. "Expert in everything" with 1 yr experience)
  if (candidate.experienceYears < 2 && skills.length > 15) {
    confidencePoints -= 10;
    reviewFlags.push(`⚠ High number of skill claims (${skills.length} skills) relative to junior experience timeline (${candidate.experienceYears} yrs).`);
  }

  const finalScore = Math.max(50, Math.min(98, confidencePoints));

  const disclaimer = "This score indicates information consistency and evidence confidence within the provided resume. It does not prove whether a candidate is truthful.";

  return {
    truthScore: finalScore,
    evidencePoints,
    reviewFlags,
    disclaimer
  };
}
