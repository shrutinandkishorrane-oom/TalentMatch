/* ==========================================================================
   TALENTMATCH - Resume Information Entity Extractor
   Extracts candidate details, technical skills, education timeline,
   experience, projects, and certifications from raw resume text.
   ========================================================================== */

const SKILL_CATALOG = [
  "Python", "JavaScript", "TypeScript", "Java", "C++", "C#", "Ruby", "PHP", "Go", "Rust", "Swift", "Kotlin",
  "React", "Angular", "Vue.js", "Vue", "Next.js", "Node.js", "Express", "FastAPI", "Django", "Flask", "Spring Boot",
  "SQL", "PostgreSQL", "MySQL", "MongoDB", "Redis", "Elasticsearch", "Oracle", "Cassandra", "Vector Databases",
  "Machine Learning", "Deep Learning", "PyTorch", "TensorFlow", "Scikit-Learn", "NLP", "Computer Vision", "LLMs",
  "Docker", "Kubernetes", "AWS", "GCP", "Azure", "CI/CD", "Git", "Linux", "REST API", "GraphQL", "Microservices",
  "Tailwind CSS", "HTML5", "CSS3", "Redux", "Jest", "PyTest", "Pandas", "NumPy", "Scrum", "Agile"
];

/**
 * Parses raw text from a candidate resume to extract key attributes.
 * @param {string} rawText 
 * @param {string} fallbackFileName 
 */
export function extractCandidateInformation(rawText, fallbackFileName = "Candidate") {
  if (!rawText || typeof rawText !== "string" || !rawText.trim()) {
    return createDefaultCandidate(fallbackFileName);
  }

  const lines = rawText.split(/\r?\n/).map(l => l.trim()).filter(Boolean);

  // 1. Candidate Name
  const name = extractName(lines, fallbackFileName);

  // 2. Email Address
  const emailMatch = rawText.match(/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/);
  const email = emailMatch ? emailMatch[0] : "Not detected";

  // 3. Phone Number
  const phoneMatch = rawText.match(/(?:\+?\d{1,3}[-.\s]?)?\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}/);
  const phone = phoneMatch ? phoneMatch[0] : "Not detected";

  // 4. Skills Extraction
  const skills = extractSkills(rawText);

  // 5. Work Experience (Total Years & Roles)
  const experienceInfo = extractExperience(rawText);

  // 6. Education
  const educationInfo = extractEducation(rawText);

  // 7. Projects
  const projects = extractProjects(rawText);

  // 8. Certifications
  const certifications = extractCertifications(rawText);

  return {
    candidateName: name,
    email,
    phone,
    skills,
    experienceYears: experienceInfo.years,
    roles: experienceInfo.roles,
    education: educationInfo.degree,
    institution: educationInfo.institution,
    projects: projects.length > 0 ? projects : ["Not detected"],
    certifications: certifications.length > 0 ? certifications : ["Not detected"],
    rawText
  };
}

function extractName(lines, fallbackFileName) {
  if (lines.length > 0) {
    // Top line is usually candidate name unless it contains header keywords
    const firstLine = lines[0].replace(/resume|curriculum|vitae|cv/i, "").trim();
    if (firstLine.length > 2 && firstLine.length < 40 && !firstLine.includes("@") && !/\d{5,}/.test(firstLine)) {
      return firstLine;
    }
  }

  // Fallback from filename
  const cleanFileName = fallbackFileName
    .replace(/\.(pdf|docx|txt)$/i, "")
    .replace(/[_-]+/g, " ")
    .replace(/resume/i, "")
    .trim();

  return cleanFileName || "Candidate";
}

function extractSkills(text) {
  const detected = [];
  SKILL_CATALOG.forEach(skill => {
    const escaped = skill.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, '\\$&');
    const regex = new RegExp(`\\b${escaped}\\b`, "i");
    if (regex.test(text)) {
      detected.push(skill);
    }
  });

  return [...new Set(detected)];
}

function extractExperience(text) {
  let totalYears = 0;

  // Search for explicit mentions like "4.5 years of experience" or "3+ yrs"
  const explicitMatch = text.match(/(\d+(?:\.\d+)?)\s*(?:\+|\-|to\s*\d+)?\s*(?:years?|yrs?)\s*(?:of\s*)?(?:experience|exp)?/i);
  if (explicitMatch) {
    totalYears = parseFloat(explicitMatch[1]);
  } else {
    // Estimate from employment date ranges like (2020 - 2024) or (2021 - Present)
    const dateRangeMatches = [...text.matchAll(/(20\d{2})\s*[-–\s]\s*(20\d{2}|Present|Current)/gi)];
    if (dateRangeMatches.length > 0) {
      const currentYear = new Date().getFullYear();
      let calculatedYears = 0;
      dateRangeMatches.forEach(m => {
        const start = parseInt(m[1], 10);
        const end = m[2].toLowerCase().includes("present") || m[2].toLowerCase().includes("current") 
          ? currentYear 
          : parseInt(m[2], 10);
        if (end >= start) {
          calculatedYears += (end - start);
        }
      });
      totalYears = calculatedYears > 0 ? calculatedYears : 1.5;
    } else {
      totalYears = 1.0;
    }
  }

  // Extract roles
  const roleKeywords = ["Senior", "Lead", "Developer", "Engineer", "Architect", "Manager", "Analyst", "Intern", "Specialist"];
  const roles = [];
  const lines = text.split("\n");
  lines.forEach(line => {
    if (roleKeywords.some(kw => line.toLowerCase().includes(kw.toLowerCase())) && line.length < 60) {
      roles.push(line.trim());
    }
  });

  return {
    years: Math.min(totalYears, 20),
    roles: roles.length > 0 ? roles.slice(0, 3) : ["Software Professional"]
  };
}

function extractEducation(text) {
  let degree = "Not detected";
  let institution = "Not detected";

  if (/b\.tech|bachelor|b\.e|b\.s/i.test(text)) {
    degree = "Bachelor's Degree";
  } else if (/m\.tech|master|m\.s|m\.b\.a/i.test(text)) {
    degree = "Master's Degree";
  } else if (/ph\.d|doctorate/i.test(text)) {
    degree = "Ph.D. / Doctorate";
  }

  const instMatch = text.match(/(?:university|institute|college|school)\s*of\s*[\w\s]+/i) ||
                    text.match(/[\w\s]+\s*(?:university|institute|college)/i);
  if (instMatch) {
    institution = instMatch[0].trim();
  }

  return { degree, institution };
}

function extractProjects(text) {
  const projects = [];
  const matches = [...text.matchAll(/(?:project|developed|built):\s*([^\n\r.]+)/gi)];
  matches.forEach(m => {
    if (m[1] && m[1].length < 70) {
      projects.push(m[1].trim());
    }
  });
  return projects.slice(0, 3);
}

function extractCertifications(text) {
  const certs = [];
  const certKeywords = ["AWS Certified", "Coursera", "Certified", "Specialization", "Azure Certified", "Google Cloud"];
  const lines = text.split("\n");
  lines.forEach(l => {
    if (certKeywords.some(kw => l.toLowerCase().includes(kw.toLowerCase())) && l.length < 70) {
      certs.push(l.trim());
    }
  });
  return certs.slice(0, 3);
}

function createDefaultCandidate(fallbackName) {
  return {
    candidateName: fallbackName,
    email: "Not detected",
    phone: "Not detected",
    skills: [],
    experienceYears: 0,
    roles: ["Not detected"],
    education: "Not detected",
    institution: "Not detected",
    projects: ["Not detected"],
    certifications: ["Not detected"],
    rawText: ""
  };
}
