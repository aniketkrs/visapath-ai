import type { TurnScore } from "@/lib/types";

export interface CachedTurn {
  officer: string;
  applicant: string;
  score: TurnScore;
}

/**
 * Cached demo exchange — Technical PRD §15
 * Pre-recorded mock consular interview for Priya Sharma (B-1/B-2).
 * Plays through when ElevenLabs / network is unavailable.
 */
export const sampleInterview: CachedTurn[] = [
  {
    officer: "Why do you want to go to the United States?",
    applicant:
      "I'm attending the Microsoft Technology Partner Summit in Seattle from March 15 to March 28. It's directly related to my role at TCS where I lead the Azure integration team. My employer has approved my leave and provided a No Objection Certificate.",
    score: {
      confidence: 88,
      consistency: 90,
      tiesStrength: 75,
      redFlags: [],
      followUp: "What specific sessions will you attend at the summit?",
    },
  },
  {
    officer: "What do you do for a living and how long have you been at your current job?",
    applicant:
      "I'm a senior software engineer at Tata Consultancy Services in Pune. I've been with TCS for three years now, and I lead a team of six developers working on Azure cloud integration projects for enterprise clients.",
    score: {
      confidence: 92,
      consistency: 91,
      tiesStrength: 88,
      redFlags: [],
      followUp: "",
    },
  },
  {
    officer: "What is your monthly income and how are you funding this trip?",
    applicant:
      "My monthly salary is ₹1,20,000, which is about ₹14,40,000 annually. I'm funding the entire trip myself — the estimated cost is around ₹2,10,000. I have savings of ₹8,50,000 in my HDFC Bank account, fixed deposits of ₹5,00,000, and mutual fund investments worth ₹3,20,000.",
    score: {
      confidence: 94,
      consistency: 93,
      tiesStrength: 80,
      redFlags: [],
      followUp: "",
    },
  },
  {
    officer: "What ties do you have to India that will ensure you return?",
    applicant:
      "I have several strong ties. First, I have a permanent position at TCS with active projects and a team that depends on my leadership. Second, my mother Mrs. Sunita Sharma lives with me in Pune and is financially dependent on me. Third, I own a two-bedroom flat in Pune that I purchased in 2024, valued at about ₹65 lakhs. My entire career, family, and financial life is rooted in India.",
    score: {
      confidence: 91,
      consistency: 89,
      tiesStrength: 95,
      redFlags: [],
      followUp: "",
    },
  },
  {
    officer: "Have you travelled internationally before?",
    applicant:
      "Yes. I visited Singapore in 2023 for a technology conference and the United Kingdom in 2024 for a business summit. I returned to India on time after both trips. I have no prior US visa applications or refusals.",
    score: {
      confidence: 87,
      consistency: 92,
      tiesStrength: 82,
      redFlags: [],
      followUp: "",
    },
  },
  {
    officer: "Do you have any relatives in the United States? What will you do after the summit?",
    applicant:
      "No, I don't have any close relatives in the United States. My mother lives with me in Pune. After the summit ends on March 28, I'll fly back to India — I already have a confirmed return ticket. I need to be back at TCS for a major project milestone in the first week of April.",
    score: {
      confidence: 90,
      consistency: 94,
      tiesStrength: 88,
      redFlags: [],
      followUp: "",
    },
  },
];
