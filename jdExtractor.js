/* ==========================================================================
   TALENTMATCH - Job Description NLP Requirement Extractor
   Parses raw Job Description text to identify required/preferred skills,
   experience expectations, and education level.
   ========================================================================== */

const TECH_SKILL_DICTIONARY = [
  "Python", "JavaScript", "TypeScript", "Java", "C++", "C#", "Ruby", "PHP", "Go", "Rust", "Swift", "Kotlin",
  "React", "Angular", "Vue.js", "Vue", "Next.js", "Node.js", "Express", "FastAPI", "Django", "Flask", "Spring Boot",
  "SQL", "PostgreSQL", "MySQL", "MongoDB", "Redis", "Elasticsearch", "Oracle", "Cassandra", "Vector Databases",
  "Machine Learning", "Deep Learning", "PyTorch", "TensorFlow", "Scikit-Learn", "NLP", "Computer Vision", "LLMs",
  "Docker", "Kubernetes", "AWS", "GCP", "Azure", "CI/CD", "Git", "Linux", "REST API", "GraphQL", "Microservices",
  "Tailwind CSS", "HTML5", "CSS3", "Redux", "Jest", "PyTest", "System Design"
];

/**
 * Extracts structured job requirements from raw text.
 * @param {string} jdText 
 * @param {object} customFields Optional manually specified fields
 */
export function parseJobDescription(jdText, customFields = {}) {
  if (!jdText || typeof jdText !== "string") {
    return {
      title: customFields.title || "Target Position",
      requiredSkills: customFields.requiredSkills || ["Python", "JavaScript", "SQL"],
      preferredSkills: customFields.preferredSkills || ["Docker", "AWS"],
      minExperienceYears: customFields.minExperienceYears || 2,
      requiredEducation: customFields.requiredEducation || "Bachelor's Degree",
      rawText: ""
    };
  }

  const textLower = jdText.toLowerCase();

  // 1. Extract Job Title
  let title = customFields.title;
  if (!title) {
    const titleMatch = jdText.match(/(?:job title|role|position):\s*([^\n\r]+)/i) || 
                       jdText.match(/^([^\n\r]+)/);
    title = titleMatch ? titleMatch[1].trim() : "Target Role";
  }

  // 2. Extract Experience Requirement (e.g. 3+ years, 5 years)
  let minExperienceYears = customFields.minExperienceYears;
  if (minExperienceYears === undefined || minExperienceYears === null) {
    const expMatch = jdText.match(/(\d+(?:\.\d+)?)\s*(?:\+|\-|to\s*\d+)?\s*(?:years?|yrs?)/i);
    minExperienceYears = expMatch ? parseFloat(expMatch[1]) : 2;
  }

  // 3. Extract Education Requirement
  let requiredEducation = customFields.requiredEducation;
  if (!requiredEducation) {
    if (textLower.includes("phd") || textLower.includes("ph.d") || textLower.includes("doctorate")) {
      requiredEducation = "Ph.D. / Doctorate";
    } else if (textLower.includes("master") || textLower.includes("m.s") || textLower.includes("m.tech")) {
      requiredEducation = "Master's Degree";
    } else if (textLower.includes("bachelor") || textLower.includes("b.t") || textLower.includes("b.s") || textLower.includes("degree")) {
      requiredEducation = "Bachelor's Degree";
    } else {
      requiredEducation = "Bachelor's Degree or Equivalent";
    }
  }

  // 4. Extract Required & Preferred Skills
  let detectedSkills = [];
  TECH_SKILL_DICTIONARY.forEach(skill => {
    const pattern = new RegExp(`\\b${escapeRegExp(skill.toLowerCase())}\\b`, "i");
    if (pattern.test(jdText)) {
      detectedSkills.push(skill);
    }
  });

  // Split into required vs preferred based on section hints
  let requiredSkills = [];
  let preferredSkills = [];

  const preferredSectionMatch = jdText.match(/(?:preferred|bonus|nice to have|plus)[^]*$/i);
  const preferredText = preferredSectionMatch ? preferredSectionMatch[0] : "";

  detectedSkills.forEach(skill => {
    if (preferredText.toLowerCase().includes(skill.toLowerCase()) && !requiredSkills.includes(skill)) {
      preferredSkills.push(skill);
    } else {
      requiredSkills.push(skill);
    }
  });

  if (requiredSkills.length === 0) {
    requiredSkills = ["Python", "JavaScript", "SQL", "Git", "REST API"];
  }

  return {
    title,
    requiredSkills: [...new Set(requiredSkills)],
    preferredSkills: [...new Set(preferredSkills)],
    minExperienceYears,
    requiredEducation,
    rawText: jdText
  };
}

function escapeRegExp(string) {
  return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}
