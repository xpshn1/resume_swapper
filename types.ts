export enum AgentStep {
  IDLE = "Ready to engineer your Data Engineering resume.",
  ANALYZING_RESUME = "DE Agent 1: Parsing your resume for pipelines, tools, and metrics...",
  ANALYZING_JOB = "DE Agent 2: Deconstructing job description for key data technologies...",
  TAILORING_EXPERIENCE = "DE Agent 3: Re-architecting work experience to match data stacks...",
  CHECKING_ATS = "DE Agent 4: Performing ATS keyword alignment check...",
  ASSEMBLING_RESUME = "DE Agent 5: Assembling final resume and ATS report...",
  IMPROVING_RESUME = "DE Agent 6: Weaving in ATS suggestions for maximum impact...",
  DONE = "Your tailored resume and ATS analysis are ready!",
  ERROR = "An error occurred. Please try again."
}

export interface AtsAnalysis {
    score: number;
    matchedKeywords: string[];
    missingKeywords: string[];
    suggestions: string;
}