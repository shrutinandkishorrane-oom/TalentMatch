/* ==========================================================================
   TALENTMATCH - Candidate Recommendation Engine
   Determines candidate recommendation tier & generates explainable rationale:
   - Strongly Recommended (90 - 100%)
   - Recommended (75 - 89%)
   - Consider (60 - 74%)
   - Not Recommended (< 60%)
   ========================================================================== */

export const RECOMMENDATION_TIERS = {
  STRONGLY_RECOMMENDED: {
    key: "strongly-recommended",
    label: "Strongly Recommended",
    badgeClass: "strongly-recommended",
    minScore: 90
  },
  RECOMMENDED: {
    key: "recommended",
    label: "Recommended",
    badgeClass: "recommended",
    minScore: 75
  },
  CONSIDER: {
    key: "consider",
    label: "Consider",
    badgeClass: "consider",
    minScore: 60
  },
  NOT_RECOMMENDED: {
    key: "not-recommended",
    label: "Not Recommended",
    badgeClass: "not-recommended",
    minScore: 0
  }
};

/**
 * Determines candidate recommendation tier and rationale.
 * @param {number} matchScore Overall Match Score (0 - 100)
 * @param {object} matchDetails Breakdown & skill matches
 * @param {object} truthDetails Truth/Confidence score details
 */
export function generateCandidateRecommendation(matchScore, matchDetails, truthDetails) {
  let tier = RECOMMENDATION_TIERS.NOT_RECOMMENDED;

  if (matchScore >= 90) {
    tier = RECOMMENDATION_TIERS.STRONGLY_RECOMMENDED;
  } else if (matchScore >= 75) {
    tier = RECOMMENDATION_TIERS.RECOMMENDED;
  } else if (matchScore >= 60) {
    tier = RECOMMENDATION_TIERS.CONSIDER;
  } else {
    tier = RECOMMENDATION_TIERS.NOT_RECOMMENDED;
  }

  // Generate explainable rationale statement
  const rationale = buildRationaleText(tier.label, matchScore, matchDetails, truthDetails);

  return {
    key: tier.key,
    label: tier.label,
    badgeClass: tier.badgeClass,
    rationale
  };
}

function buildRationaleText(tierLabel, score, matchDetails, truthDetails) {
  const matchedCount = matchDetails.matchedSkills ? matchDetails.matchedSkills.length : 0;
  const missingCount = matchDetails.missingSkills ? matchDetails.missingSkills.length : 0;
  const topMatched = matchDetails.matchedSkills ? matchDetails.matchedSkills.slice(0, 3).join(", ") : "";

  if (score >= 90) {
    return `Strong match for required skills (${topMatched}) with solid experience alignment and high evidence confidence (${truthDetails.truthScore}%).`;
  } else if (score >= 75) {
    return `Good overall candidate match covering core skills (${topMatched}) with minor skill gaps (${missingCount} missing).`;
  } else if (score >= 60) {
    return `Moderate match. Demonstrates foundational skills, but has noticeable gaps in required tech stack or experience level.`;
  } else {
    return `Low match score (${score}%). Candidate lacks multiple primary required skills and does not meet minimum experience criteria.`;
  }
}
