export const resumes: Resume[] = [
  {
    id: "1",
    companyName: "Google",
    jobTitle: "Frontend Developer",
    imagePath: "/images/resume_01.png",
    resumePath: "/resumes/resume-1.pdf",
    feedback: {
      overallScore: 85,
      ATS: {
        score: 90,
        tips: [],
      },
      toneAndStyle: {
        score: 90,
        tips: [],
      },
      content: {
        score: 90,
        tips: [],
      },
      structure: {
        score: 90,
        tips: [],
      },
      skills: {
        score: 90,
        tips: [],
      },
    },
  },
  {
    id: "2",
    companyName: "Microsoft",
    jobTitle: "Cloud Engineer",
    imagePath: "/images/resume_02.png",
    resumePath: "/resumes/resume-2.pdf",
    feedback: {
      overallScore: 55,
      ATS: {
        score: 90,
        tips: [],
      },
      toneAndStyle: {
        score: 90,
        tips: [],
      },
      content: {
        score: 90,
        tips: [],
      },
      structure: {
        score: 90,
        tips: [],
      },
      skills: {
        score: 90,
        tips: [],
      },
    },
  },
  {
    id: "3",
    companyName: "Apple",
    jobTitle: "iOS Developer",
    imagePath: "/images/resume_03.png",
    resumePath: "/resumes/resume-3.pdf",
    feedback: {
      overallScore: 75,
      ATS: {
        score: 90,
        tips: [],
      },
      toneAndStyle: {
        score: 90,
        tips: [],
      },
      content: {
        score: 90,
        tips: [],
      },
      structure: {
        score: 90,
        tips: [],
      },
      skills: {
        score: 90,
        tips: [],
      },
    },
  },
  {
    id: "4",
    companyName: "Google",
    jobTitle: "Frontend Developer",
    imagePath: "/images/resume_01.png",
    resumePath: "/resumes/resume-1.pdf",
    feedback: {
      overallScore: 85,
      ATS: {
        score: 90,
        tips: [],
      },
      toneAndStyle: {
        score: 90,
        tips: [],
      },
      content: {
        score: 90,
        tips: [],
      },
      structure: {
        score: 90,
        tips: [],
      },
      skills: {
        score: 90,
        tips: [],
      },
    },
  },
  {
    id: "5",
    companyName: "Microsoft",
    jobTitle: "Cloud Engineer",
    imagePath: "/images/resume_02.png",
    resumePath: "/resumes/resume-2.pdf",
    feedback: {
      overallScore: 55,
      ATS: {
        score: 90,
        tips: [],
      },
      toneAndStyle: {
        score: 90,
        tips: [],
      },
      content: {
        score: 90,
        tips: [],
      },
      structure: {
        score: 90,
        tips: [],
      },
      skills: {
        score: 90,
        tips: [],
      },
    },
  },
  {
    id: "6",
    companyName: "Apple",
    jobTitle: "iOS Developer",
    imagePath: "/images/resume_03.png",
    resumePath: "/resumes/resume-3.pdf",
    feedback: {
      overallScore: 75,
      ATS: {
        score: 90,
        tips: [],
      },
      toneAndStyle: {
        score: 90,
        tips: [],
      },
      content: {
        score: 90,
        tips: [],
      },
      structure: {
        score: 90,
        tips: [],
      },
      skills: {
        score: 90,
        tips: [],
      },
    },
  },
];

export const AIResponseFormat = `
      interface Feedback {
      overallScore: number; //max 100
      ATS: {
        score: number; //rate based on ATS suitability
        tips: {
          type: "good" | "improve";
          tip: string; //give 3-4 tips
        }[];
      };
      toneAndStyle: {
        score: number; //max 100
        tips: {
          type: "good" | "improve";
          tip: string; //make it a short "title" for the actual explanation
          explanation: string; //explain in detail here
        }[]; //give 3-4 tips
      };
      content: {
        score: number; //max 100
        tips: {
          type: "good" | "improve";
          tip: string; //make it a short "title" for the actual explanation
          explanation: string; //explain in detail here
        }[]; //give 3-4 tips
      };
      structure: {
        score: number; //max 100
        tips: {
          type: "good" | "improve";
          tip: string; //make it a short "title" for the actual explanation
          explanation: string; //explain in detail here
        }[]; //give 3-4 tips
      };
      skills: {
        score: number; //max 100
        tips: {
          type: "good" | "improve";
          tip: string; //make it a short "title" for the actual explanation
          explanation: string; //explain in detail here
        }[]; //give 3-4 tips
      };
    }`;

export const prepareInstructions = ({jobTitle, jobDescription}: { jobTitle: string; jobDescription: string; }) =>
  `You are an expert in ATS (Applicant Tracking System) and resume analysis.
      Please analyze and rate this resume and suggest how to improve it.
      The rating can be low if the resume is bad.
      Be thorough and detailed. Don't be afraid to point out any mistakes or areas for improvement.
      If there is a lot to improve, don't hesitate to give low scores. This is to help the user to improve their resume.
      If available, use the job description for the job user is applying to to give more detailed feedback.
      If provided, take the job description into consideration.
      The job title is: ${jobTitle}
      The job description is: ${jobDescription}
      Provide the feedback using the following format:
      ${AIResponseFormat}
      Return the analysis as an JSON object, without any other text and without the backticks.
      Do not include any other text or comments.`;


export const prepareOptimizationInstructions = ({
                                                  jobTitle,
                                                  jobDescription,
                                                  companyName,
                                                  currentFeedback,
                                                }: {
  jobTitle: string;
  jobDescription: string;
  companyName: string;
  currentFeedback?: string;
}) => {
  return `You are an expert ATS optimization specialist with 15+ years of experience. Your task is to create a resume that will score 100/100 on ATS systems.

JOB DETAILS:
Position: ${jobTitle}
Company: ${companyName}
Job Description: ${jobDescription}

${currentFeedback ? `PREVIOUS ATS ANALYSIS:\n${currentFeedback}\n` : ''}

CRITICAL ATS OPTIMIZATION REQUIREMENTS (MUST FOLLOW ALL):

1. KEYWORD OPTIMIZATION (30 points):
   - Extract ALL important keywords from job description
   - Include exact phrase matches (if JD says "project management", use "project management" not "managed projects")
   - Use keywords naturally in context 3-5 times throughout resume
   - Include both spelled-out terms AND acronyms (e.g., "Application Programming Interface (API)")
   - Mirror job description language exactly where relevant

2. FORMATTING (25 points):
   - Use ONLY standard section headers: PROFESSIONAL SUMMARY, PROFESSIONAL EXPERIENCE, EDUCATION, TECHNICAL SKILLS, PROJECTS, ACHIEVEMENTS
   - NO tables, columns, text boxes, headers/footers, or graphics
   - Use simple bullet points with • character ONLY
   - Stick to standard fonts: Helvetica/Arial
   - One column layout only
   - Clear hierarchy with consistent spacing

3. CONTENT STRUCTURE (25 points):
   - Start with candidate name (UPPERCASE, bold)
   - Contact info in one line with | separators
   - Professional Summary: 3-4 lines, keyword-rich, tailored to job
   - Experience: Reverse chronological order
   - Each role: Job Title (bold), Company name, Location | Duration
   - Bullet points: Start with strong action verbs, include metrics/numbers
   - Skills section: Categorized clearly, match job requirements exactly

4. ACHIEVEMENT-FOCUSED LANGUAGE (20 points):
   - Every bullet point should follow: Action Verb + Task + Result/Impact
   - Quantify everything possible with numbers, percentages, time saved
   - Use power verbs: Led, Managed, Implemented, Developed, Optimized, Achieved, Increased, Reduced, Streamlined
   - Replace weak phrases like "responsible for" with "managed", "led", "executed"
   - Show impact: "Increased efficiency by 25%" not just "improved efficiency"

5. JOB-SPECIFIC TAILORING (CRITICAL):
   - Every section should relate back to job requirements
   - Reorder experience bullets to highlight most relevant achievements first
   - Technical skills: List job requirements first, then additional skills
   - Projects: Only include relevant ones, describe using job keywords
   - Remove or minimize irrelevant experience

MANDATORY FORMATTING RULES:
- NO markdown formatting in output (no **, no ##, no [links](url))
- Use plain text ONLY
- Name: UPPERCASE on first line
- Section headers: UPPERCASE
- Job titles: Title Case, company in italics marker (use *)
- Bullet points: Start each line with • character
- Dates: Use format "Month Year - Month Year" or "Month Year - Present"

OUTPUT STRUCTURE (FOLLOW EXACTLY):

[CANDIDATE NAME IN UPPERCASE]
[City, State | Phone | Email | LinkedIn URL]

PROFESSIONAL SUMMARY
[3-4 lines packed with keywords from job description, quantified achievements, and relevant certifications. Must include top 5 keywords from job posting.]

PROFESSIONAL EXPERIENCE

[Job Title]
*[Company Name, Location]* | [Month Year - Month Year]
• [Action verb] + [specific task using job keywords] + [quantified result with %/numbers/timeframe]
• [Action verb] + [specific task using job keywords] + [quantified result with %/numbers/timeframe]
• [Action verb] + [specific task using job keywords] + [quantified result with %/numbers/timeframe]
• [Continue with 4-6 bullets per role, prioritize most recent/relevant]

[Repeat for all relevant positions]

EDUCATION

[Degree Name]
*[Institution Name]* | [Year - Year]
CGPA: [X.XX]/10 | Relevant Coursework: [List courses matching job requirements]

TECHNICAL SKILLS
• [Category from job description]: [List skills exactly as mentioned in JD], [Additional relevant skills]
• [Category]: [Skills]
• [Category]: [Skills]

PROJECTS

[Project Name]
• [Brief description using job keywords] + [quantified impact/results]
• [Technical skills used that match job requirements]

ACHIEVEMENTS
• [Achievement with quantified result if possible]
• [Achievement with quantified result if possible]

CRITICAL REMINDERS:
- Every keyword from job description MUST appear at least once
- Use exact terminology from job posting
- Include relevant certifications if mentioned in original resume
- Technical skills section must include ALL technologies mentioned in job description
- Numbers and metrics are MANDATORY in experience bullets
- NO generic statements - everything must be specific and quantified
- Professional summary must read like it was written specifically for THIS job

Provide ONLY the optimized resume content with perfect ATS formatting. No explanations, no commentary.`;
};