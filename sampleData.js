/* ==========================================================================
   TALENTMATCH - Hackathon Sample Demo Data
   Provides 1 Sample Job Description and 5 Realistic Candidate Resumes
   ========================================================================== */

export const SAMPLE_JOB_DESCRIPTION = {
  title: "Senior Full-Stack & AI Systems Engineer",
  company: "TechPulse Solutions",
  rawText: `Job Title: Senior Full-Stack & AI Systems Engineer
Location: Hybrid / Remote

About the Role:
We are looking for a Senior Full-Stack & AI Systems Engineer to join our core engineering team. You will be responsible for building scalable web applications, integrating modern Machine Learning models, writing robust APIs, and optimizing database performance.

Required Skills & Qualifications:
- Proficiency in Python, JavaScript / TypeScript, Node.js, and React.
- Hands-on experience with PostgreSQL, MongoDB, or SQL databases.
- Experience building and deploying REST APIs and Microservices.
- Experience with Machine Learning frameworks (PyTorch, TensorFlow, or Scikit-Learn).
- Solid understanding of Docker, AWS, and CI/CD pipelines.
- Bachelor's or Master's degree in Computer Science, Software Engineering, or related field.
- Minimum 3+ years of relevant industry experience in full-stack development.

Preferred / Bonus Skills:
- Experience with Docker, Kubernetes, and Cloud Deployment (AWS / GCP).
- Familiarity with NLP (Natural Language Processing), LLMs, and Vector Databases (Pinecone/Faiss).
- Strong system design skills and experience leading agile software projects.`,
  requiredSkills: ["Python", "JavaScript", "TypeScript", "Node.js", "React", "SQL", "PostgreSQL", "Machine Learning", "REST API"],
  preferredSkills: ["Docker", "AWS", "NLP", "PyTorch", "Kubernetes", "Vector Databases", "CI/CD"],
  minExperienceYears: 3,
  requiredEducation: "Bachelor's in Computer Science"
};

export const SAMPLE_CANDIDATES = [
  {
    id: "demo-1",
    filename: "Rahul_Sharma_Resume.pdf",
    isDemo: true,
    candidateName: "Rahul Sharma",
    email: "rahul.sharma@example.com",
    phone: "+91 98765 43210",
    summary: "Senior Software Engineer with 4.5 years of experience building scalable Web Apps and AI microservices using Python, React, and AWS.",
    rawText: `RAHUL SHARMA
Email: rahul.sharma@example.com | Phone: +91 98765 43210 | Location: Bengaluru, India
GitHub: github.com/rahulsharma | LinkedIn: linkedin.com/in/rahulsharma

SUMMARY
Senior Software Engineer with 4.5 years of progressive experience architecting high-availability full-stack web applications and machine learning APIs. Passionate about AI integration, scalable microservices, and modern frontend frameworks.

WORK EXPERIENCE
Senior Full Stack Engineer | TechCorp Labs (2022 - Present) | 2.5 Years
- Architected and deployed microservices using Python (FastAPI/Django) and Node.js serving over 500k monthly active users.
- Built interactive web dashboards using React, TypeScript, and Redux Toolkit with responsive UI design.
- Implemented automated ML pipelines with PyTorch and Scikit-Learn for text classification and sentiment analysis.
- Designed relational database schemas in PostgreSQL and optimized SQL queries, improving API response times by 35%.
- Maintained Docker containers and orchestrated AWS deployments (EC2, S3, RDS) using CI/CD GitHub Actions.

Software Developer | InnovateX Systems (2020 - 2022) | 2.0 Years
- Developed RESTful APIs using Python, Flask, and MongoDB for e-commerce platforms.
- Collaborated with cross-functional teams to integrate payment gateways and third-party APIs.
- Contributed to frontend component libraries using React and Tailwind CSS.

EDUCATION
Bachelor of Technology (B.Tech) in Computer Engineering
Vellore Institute of Technology (VIT), 2016 - 2020 | CGPA: 8.8/10

TECHNICAL SKILLS
- Languages: Python, JavaScript, TypeScript, SQL, HTML/CSS
- Frontend: React, Redux, Node.js, Next.js, HTML5, CSS3
- Backend & DB: FastAPI, Django, Express.js, PostgreSQL, MongoDB, REST API
- AI / ML: PyTorch, Scikit-Learn, NLP, Vector Databases, Pandas
- DevOps & Cloud: Docker, AWS (EC2, S3), Git, CI/CD, Linux

PROJECTS
- AI Document Intelligence Platform: Built an NLP-powered resume and document classifier using Python, PyTorch, and React.
- Distributed Cloud Analytics Suite: Developed a real-time tracking dashboard using Node.js, PostgreSQL, and AWS.

CERTIFICATIONS
- AWS Certified Solutions Architect - Associate (2023)
- Deep Learning Specialization - Coursera (2022)`,
    extractedInfo: {
      name: "Rahul Sharma",
      email: "rahul.sharma@example.com",
      phone: "+91 98765 43210",
      skills: ["Python", "JavaScript", "TypeScript", "Node.js", "React", "SQL", "PostgreSQL", "FastAPI", "Django", "PyTorch", "Scikit-Learn", "NLP", "Docker", "AWS", "REST API", "MongoDB", "Git", "CI/CD"],
      experienceYears: 4.5,
      education: "B.Tech in Computer Engineering",
      institution: "Vellore Institute of Technology (VIT)",
      roles: ["Senior Full Stack Engineer", "Software Developer"],
      projects: ["AI Document Intelligence Platform", "Distributed Cloud Analytics Suite"],
      certifications: ["AWS Certified Solutions Architect", "Deep Learning Specialization"]
    }
  },
  {
    id: "demo-2",
    filename: "Priya_Patil_Resume.docx",
    isDemo: true,
    candidateName: "Priya Patil",
    email: "priya.patil@example.com",
    phone: "+91 98230 11223",
    summary: "Full-Stack Engineer with 3.5 years experience specializing in React, Node.js, Python APIs, and PostgreSQL database optimization.",
    rawText: `PRIYA PATIL
Email: priya.patil@example.com | Phone: +91 98230 11223 | Location: Pune, India

PROFESSIONAL SUMMARY
Dynamic Full-Stack Software Engineer with 3.5 years of industry experience. Expertise in modern JavaScript frameworks (React, Node.js), Python backend services, and PostgreSQL database management. Demonstrated success in delivering clean, maintainable code.

EXPERIENCE
Full Stack Developer | DataTech Solutions (2021 - Present) | 3.5 Years
- Developed user-facing frontend components in React, TypeScript, and CSS modules.
- Created RESTful microservices using Node.js, Express, and Python for enterprise reporting.
- Designed complex SQL queries and index strategies in PostgreSQL to support high-throughput data processing.
- Implemented unit testing using Jest and PyTest, achieving 85% code coverage.
- Participated in Docker containerization and basic AWS deployment setup.

EDUCATION
Master of Science (M.S.) in Computer Science
Pune University (2019 - 2021)

SKILLS
- Core Skills: JavaScript, TypeScript, Python, Node.js, React, SQL, PostgreSQL, REST API, Docker, Git, HTML/CSS
- Secondary Skills: MongoDB, Express.js, Basic Machine Learning, Scikit-Learn

PROJECTS & ACHIEVEMENTS
- Enterprise Resource Planning Module: Built key reporting features using React, Node.js, and PostgreSQL.
- Predictive Customer Churn Tool: Trained a Scikit-Learn classification model in Python to identify customer churn.`,
    extractedInfo: {
      name: "Priya Patil",
      email: "priya.patil@example.com",
      phone: "+91 98230 11223",
      skills: ["JavaScript", "TypeScript", "Python", "Node.js", "React", "SQL", "PostgreSQL", "REST API", "Docker", "Git", "MongoDB", "Scikit-Learn"],
      experienceYears: 3.5,
      education: "M.S. in Computer Science",
      institution: "Pune University",
      roles: ["Full Stack Developer"],
      projects: ["Enterprise Resource Planning Module", "Predictive Customer Churn Tool"],
      certifications: ["Not detected"]
    }
  },
  {
    id: "demo-3",
    filename: "Amit_Joshi_Resume.pdf",
    isDemo: true,
    candidateName: "Amit Joshi",
    email: "amit.joshi@example.com",
    phone: "+91 97112 33445",
    summary: "Frontend Developer with 2.0 years of experience focusing on React, JavaScript, and HTML/CSS. Transitioning into full-stack role.",
    rawText: `AMIT JOSHI
Email: amit.joshi@example.com | Phone: +91 97112 33445

SUMMARY
Frontend Engineer with 2 years of hands-on experience developing intuitive web interfaces using JavaScript, React, and CSS. Looking to expand into Full-Stack and AI engineering.

EXPERIENCE
Frontend Developer | WebCraft Technologies (2022 - Present) | 2.0 Years
- Built responsive UI layouts with React, HTML5, CSS3, and JavaScript.
- Integrated REST APIs developed by backend engineers.
- Assisted in writing basic Node.js scripts and MySQL queries.

EDUCATION
Bachelor of Science (B.Sc.) in Information Technology
Mumbai University (2018 - 2021)

SKILLS
- Technical Skills: JavaScript, React, HTML, CSS, Git, REST API, basic Node.js, basic SQL.

PROJECTS
- E-Commerce Web Store Front: Responsive React e-commerce application.`,
    extractedInfo: {
      name: "Amit Joshi",
      email: "amit.joshi@example.com",
      phone: "+91 97112 33445",
      skills: ["JavaScript", "React", "HTML", "CSS", "Git", "REST API", "Node.js", "SQL"],
      experienceYears: 2.0,
      education: "B.Sc. in Information Technology",
      institution: "Mumbai University",
      roles: ["Frontend Developer"],
      projects: ["E-Commerce Web Store Front"],
      certifications: ["Not detected"]
    }
  },
  {
    id: "demo-4",
    filename: "Sneha_Verma_Resume.pdf",
    isDemo: true,
    candidateName: "Sneha Verma",
    email: "sneha.verma@example.com",
    phone: "+91 99887 66554",
    summary: "Machine Learning & NLP Specialist with 4 years experience in Python, PyTorch, Vector DBs, and cloud microservices.",
    rawText: `SNEHA VERMA
Email: sneha.verma@example.com | Phone: +91 99887 66554

SUMMARY
Senior AI/ML Research Engineer with 4 years of experience specializing in Natural Language Processing (NLP), Deep Learning models, Python, and cloud deployments.

EXPERIENCE
Lead ML Engineer | AI Dynamics Corp (2020 - Present) | 4.0 Years
- Developed end-to-end NLP semantic search engines using Python, PyTorch, Transformers, and Vector Databases (Pinecone, Faiss).
- Deployed scalable AI inference microservices on AWS using Docker, Kubernetes, and FastAPI.
- Built custom REST APIs and database connectors in PostgreSQL and MongoDB.
- Collaborated with frontend engineers using React to expose model predictions.

EDUCATION
Master of Technology (M.Tech) in Artificial Intelligence
IIT Hyderabad (2018 - 2020)

SKILLS
- AI & Data Science: Python, PyTorch, TensorFlow, NLP, Scikit-Learn, Vector Databases, Pandas
- Cloud & Web: FastAPI, REST API, Docker, Kubernetes, AWS, PostgreSQL, MongoDB, React, Git`,
    extractedInfo: {
      name: "Sneha Verma",
      email: "sneha.verma@example.com",
      phone: "+91 99887 66554",
      skills: ["Python", "PyTorch", "TensorFlow", "NLP", "Scikit-Learn", "Vector Databases", "FastAPI", "REST API", "Docker", "Kubernetes", "AWS", "PostgreSQL", "MongoDB", "React", "Git"],
      experienceYears: 4.0,
      education: "M.Tech in Artificial Intelligence",
      institution: "IIT Hyderabad",
      roles: ["Lead ML Engineer"],
      projects: ["NLP Semantic Search Engine", "AI Inference Microservice"],
      certifications: ["PyTorch Certified Developer"]
    }
  },
  {
    id: "demo-5",
    filename: "Vikram_Malhotra_Resume.docx",
    isDemo: true,
    candidateName: "Vikram Malhotra",
    email: "vikram.m@example.com",
    phone: "+91 91234 56789",
    summary: "Backend Software Engineer with 1.2 years experience focusing on Python, SQL, and Git.",
    rawText: `VIKRAM MALHOTRA
Email: vikram.m@example.com | Phone: +91 91234 56789

SUMMARY
Junior Backend Developer with 1.2 years of experience in Python scripting, SQL database operations, and Git version control.

EXPERIENCE
Junior Software Engineer | CoreBytes Software (2023 - Present) | 1.2 Years
- Wrote Python scripts to automate daily data processing.
- Executed SQL queries and database maintenance routines in MySQL.
- Managed source code branches in Git.

EDUCATION
Bachelor of Engineering (B.E.) in Electronics
RVT Institute of Technology (2019 - 2023)

SKILLS
- Core Skills: Python, SQL, Git, HTML`,
    extractedInfo: {
      name: "Vikram Malhotra",
      email: "vikram.m@example.com",
      phone: "+91 91234 56789",
      skills: ["Python", "SQL", "Git", "HTML"],
      experienceYears: 1.2,
      education: "B.E. in Electronics",
      institution: "RVT Institute of Technology",
      roles: ["Junior Software Engineer"],
      projects: ["Automated Data Scripting"],
      certifications: ["Not detected"]
    }
  }
];
