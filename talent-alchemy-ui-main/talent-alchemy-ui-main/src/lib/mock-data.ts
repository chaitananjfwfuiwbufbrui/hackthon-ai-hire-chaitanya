
// Mock data types
export interface Candidate {
  id: string;
  name: string;
  email: string;
  phone: string;
  location: string;
  skills: string[];
  experience: number;
  certifications: string[];
  education: Education[];
  workHistory: WorkExperience[];
  resumeUrl: string;
  uploadStatus: 'parsed' | 'failed' | 'processing';
  matchScore?: number;
}

export interface Education {
  degree: string;
  institution: string;
  year: string;
}

export interface WorkExperience {
  title: string;
  company: string;
  duration: string;
  description: string[];
}

// Generate mock candidates
export const mockCandidates: Candidate[] = [
  {
    id: "1",
    name: "Rahul Sharma",
    email: "rahul.sharma@example.com",
    phone: "+91 9876543210",
    location: "Bangalore",
    skills: ["React", "Node.js", "TypeScript", "MongoDB", "AWS"],
    experience: 6,
    certifications: ["AWS Solutions Architect", "MongoDB Developer"],
    education: [
      {
        degree: "B.Tech in Computer Science",
        institution: "IIT Delhi",
        year: "2017"
      }
    ],
    workHistory: [
      {
        title: "Senior Frontend Developer",
        company: "Tech Solutions Inc.",
        duration: "2020-Present",
        description: [
          "Led a team of 5 developers to build a React-based dashboard",
          "Implemented CI/CD pipeline with GitHub Actions",
          "Reduced page load time by 40% through code optimization"
        ]
      },
      {
        title: "Frontend Developer",
        company: "WebCraft",
        duration: "2017-2020",
        description: [
          "Developed responsive web applications using React and Redux",
          "Worked on optimizing application performance and user experience",
          "Integrated third-party APIs and payment gateways"
        ]
      }
    ],
    resumeUrl: "/resume-rahul.pdf",
    uploadStatus: "parsed",
    matchScore: 92
  },
  {
    id: "2",
    name: "Priya Patel",
    email: "priya.patel@example.com",
    phone: "+91 9876543211",
    location: "Hyderabad",
    skills: ["JavaScript", "React", "Node.js", "Express", "PostgreSQL"],
    experience: 4,
    certifications: ["Certified Scrum Master"],
    education: [
      {
        degree: "M.Tech in Information Technology",
        institution: "BITS Pilani",
        year: "2019"
      }
    ],
    workHistory: [
      {
        title: "Full Stack Developer",
        company: "InnovateTech",
        duration: "2019-Present",
        description: [
          "Built and maintained RESTful APIs using Node.js and Express",
          "Implemented authentication system using JWT",
          "Collaborated with UI/UX designers to implement frontend designs"
        ]
      }
    ],
    resumeUrl: "/resume-priya.pdf",
    uploadStatus: "parsed",
    matchScore: 85
  },
  {
    id: "3",
    name: "Aditya Kumar",
    email: "aditya.kumar@example.com",
    phone: "+91 9876543212",
    location: "Pune",
    skills: ["Java", "Spring Boot", "Hibernate", "MySQL", "Docker", "React"],
    experience: 7,
    certifications: ["Oracle Certified Java Programmer", "Docker Certified Associate"],
    education: [
      {
        degree: "B.E in Information Technology",
        institution: "Pune University",
        year: "2016"
      }
    ],
    workHistory: [
      {
        title: "Senior Backend Developer",
        company: "Enterprise Solutions",
        duration: "2018-Present",
        description: [
          "Designed and implemented microservices architecture",
          "Optimized database queries resulting in 30% faster response time",
          "Mentored junior developers and conducted code reviews"
        ]
      },
      {
        title: "Java Developer",
        company: "Tech Innovate",
        duration: "2016-2018",
        description: [
          "Developed and maintained Java-based web applications",
          "Implemented RESTful APIs for mobile applications",
          "Participated in Agile development processes"
        ]
      }
    ],
    resumeUrl: "/resume-aditya.pdf",
    uploadStatus: "parsed",
    matchScore: 78
  },
  {
    id: "4",
    name: "Neha Gupta",
    email: "neha.gupta@example.com",
    phone: "+91 9876543213",
    location: "Bangalore",
    skills: ["React", "Redux", "JavaScript", "CSS", "Figma", "UI/UX"],
    experience: 5,
    certifications: ["Google UX Design Professional Certificate"],
    education: [
      {
        degree: "B.Des in User Experience Design",
        institution: "NID Ahmedabad",
        year: "2018"
      }
    ],
    workHistory: [
      {
        title: "UI/UX Developer",
        company: "Creative Design Studio",
        duration: "2020-Present",
        description: [
          "Designed and implemented user interfaces for web and mobile applications",
          "Collaborated with product managers to define user requirements",
          "Conducted usability testing and incorporated feedback"
        ]
      },
      {
        title: "Frontend Developer",
        company: "Digital Solutions",
        duration: "2018-2020",
        description: [
          "Developed responsive web interfaces using React and SCSS",
          "Implemented animations and transitions for enhanced user experience",
          "Worked closely with designers to implement pixel-perfect designs"
        ]
      }
    ],
    resumeUrl: "/resume-neha.pdf",
    uploadStatus: "parsed",
    matchScore: 88
  },
  {
    id: "5",
    name: "Vikram Singh",
    email: "vikram.singh@example.com",
    phone: "+91 9876543214",
    location: "Mumbai",
    skills: ["Python", "Django", "Flask", "React", "AWS", "Docker"],
    experience: 8,
    certifications: ["AWS Certified Developer", "Certified Python Developer"],
    education: [
      {
        degree: "M.S. in Computer Science",
        institution: "Stanford University",
        year: "2015"
      }
    ],
    workHistory: [
      {
        title: "Technical Lead",
        company: "Global Tech Solutions",
        duration: "2019-Present",
        description: [
          "Led a team of 8 developers working on a cloud-based SaaS platform",
          "Architected scalable backend services using Django and AWS",
          "Implemented CI/CD pipeline and DevOps practices"
        ]
      },
      {
        title: "Senior Developer",
        company: "Innovation Labs",
        duration: "2015-2019",
        description: [
          "Developed and maintained Python-based web applications",
          "Implemented RESTful APIs and integrated third-party services",
          "Mentored junior developers and conducted technical interviews"
        ]
      }
    ],
    resumeUrl: "/resume-vikram.pdf",
    uploadStatus: "parsed",
    matchScore: 94
  },
];

// Mock skill distribution for dashboard
export const skillDistribution = [
  { name: "React", value: 65 },
  { name: "JavaScript", value: 80 },
  { name: "Node.js", value: 45 },
  { name: "TypeScript", value: 40 },
  { name: "Python", value: 30 },
  { name: "Java", value: 25 },
  { name: "AWS", value: 35 },
  { name: "Docker", value: 20 },
  { name: "MongoDB", value: 15 },
  { name: "PostgreSQL", value: 10 },
];

// Mock experience distribution for dashboard
export const experienceDistribution = [
  { name: "0-2 years", value: 15 },
  { name: "3-5 years", value: 30 },
  { name: "6-8 years", value: 25 },
  { name: "9-12 years", value: 20 },
  { name: "13+ years", value: 10 },
];

// Mock location distribution for dashboard
export const locationDistribution = [
  { name: "Bangalore", value: 40 },
  { name: "Mumbai", value: 20 },
  { name: "Hyderabad", value: 15 },
  { name: "Pune", value: 12 },
  { name: "Delhi", value: 8 },
  { name: "Chennai", value: 5 },
];

// Mock skill gaps for dashboard
export const skillGaps = [
  "30% of candidates lack Docker knowledge for DevOps roles",
  "Only 25% of React developers have experience with Next.js",
  "75% of backend developers lack cloud infrastructure experience",
  "Only 20% of candidates have experience with GraphQL"
];

// Mock screening questions based on skills
export const getScreeningQuestions = (skills: string[]) => {
  const questionBank = {
    React: [
      "What's the difference between useMemo and useCallback?",
      "Explain how React's virtual DOM works and its benefits",
      "How would you optimize performance in a React application?",
      "Explain the concept of React Hooks and give examples of built-in hooks"
    ],
    "Node.js": [
      "How does the event loop work in Node.js?",
      "What are streams in Node.js and how would you use them?",
      "Explain the difference between process.nextTick() and setImmediate()",
      "How would you handle errors in a Node.js application?"
    ],
    TypeScript: [
      "What are the benefits of using TypeScript over JavaScript?",
      "Explain the difference between interfaces and types in TypeScript",
      "How would you handle nullable properties in TypeScript?",
      "Describe how generics work in TypeScript with examples"
    ],
    Java: [
      "Explain the difference between final, finally, and finalize in Java",
      "How does garbage collection work in Java?",
      "What are the new features introduced in Java 11?",
      "Explain the principles of Object-Oriented Programming in Java"
    ],
    Python: [
      "What are decorators in Python and how would you use them?",
      "Explain the difference between lists and tuples in Python",
      "How does memory management work in Python?",
      "What is the Global Interpreter Lock (GIL) and how does it affect Python programs?"
    ]
  };

  const questions: string[] = [];

  skills.forEach(skill => {
    const skillQuestions = questionBank[skill as keyof typeof questionBank];
    if (skillQuestions) {
      questions.push(...skillQuestions.slice(0, 2)); // Get first two questions for each skill
    }
  });

  return questions.slice(0, 5); // Return max 5 questions
};

// Mock outreach templates
export const getOutreachTemplate = (candidate: Candidate) => {
  const { name, skills, location } = candidate;
  const topSkills = skills.slice(0, 3).join(", ");
  
  return `Hi ${name},

I came across your profile and was impressed by your experience with ${topSkills}. Our client is hiring in ${location} and I believe your skills would be a great fit.

We're looking for someone to join a dynamic team working on innovative projects. The role offers competitive compensation, flexibility, and opportunities for growth.

Would you be open to a quick call this week to discuss this opportunity further? If so, please suggest a convenient time.

Looking forward to connecting!

Best regards,
AI Recruiter
PeopleGPT`;
};
