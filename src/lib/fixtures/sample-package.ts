import type { GeneratedPackage } from "@/lib/types";

/**
 * Cached demo fallback — Technical PRD §15
 * Pre-warmed sample for "Priya Sharma" B-1/B-2 applicant.
 * Used when ElevenLabs API is slow/down/offline.
 */
export const samplePackage: GeneratedPackage = {
  statement: {
    addressedTo: "U.S. Consulate General, Mumbai",
    body: `I, Priya Sharma, am writing to respectfully request a B-1/B-2 visitor visa to the United States. I am a 27-year-old software engineer currently employed at Tata Consultancy Services (TCS) in Pune, Maharashtra, where I have been working for the past three years.

The purpose of my visit is to attend the annual technology partner summit hosted by Microsoft Corporation in Seattle, Washington, from March 15 to March 28, 2026 — a total stay of 14 days. This summit is directly relevant to my current role as a senior developer on the Azure integration team at TCS, and my participation has been approved by my employer, who has provided a No Objection Certificate.

I am financially well-positioned to fund this trip entirely on my own. My monthly salary is ₹1,20,000, translating to an annual income of ₹14,40,000. I have personal savings of approximately ₹8,50,000 in my HDFC Bank account, along with fixed deposits totaling ₹5,00,000 and mutual fund investments valued at ₹3,20,000. The estimated cost of this trip, including flights, accommodation, and daily expenses, is approximately ₹2,10,000 — well within my means.

My ties to India are strong and give me every reason to return. I have a permanent position at TCS with active projects and a team of six developers who depend on my technical leadership. My mother, Mrs. Sunita Sharma (aged 58), lives with me in Pune and is financially dependent on me. I own a two-bedroom flat in Pune, purchased in 2024, valued at approximately ₹65,00,000, which is registered in my name. I also maintain a term life insurance policy and a PPF account, further demonstrating my long-term financial commitment to India.

I have previously travelled to Singapore (2023) and the United Kingdom (2024) for business conferences, returning to India on time after each visit. I have no prior US visa applications or refusals.

I wish to emphasize that my visit to the United States is strictly temporary. I have a confirmed return flight booked for March 28, 2026, and I look forward to resuming my work at TCS immediately upon my return. I have no intention of seeking employment, changing my immigration status, or overstaying my authorized period of stay.

I kindly request that you consider my application favorably. I am happy to provide any additional documentation that may be required to support my case.

Respectfully,
Priya Sharma`,
    wordCount: 428,
  },
  checklist: [
    {
      id: "passport",
      name: "Valid Indian Passport",
      reason: "Primary identity document required for visa application",
      whereToGet: "Passport Seva Kendra / already in possession",
      copyType: "original",
      category: "identity",
      required: true,
    },
    {
      id: "ds160",
      name: "DS-160 Confirmation Page",
      reason: "Required online visa application form",
      whereToGet: "ceac.state.gov — complete online",
      copyType: "copy",
      category: "identity",
      required: true,
    },
    {
      id: "photo",
      name: "US Visa Photograph (5x5 cm)",
      reason: "Must meet US visa photo specifications",
      whereToGet: "Any authorized photo studio",
      copyType: "original",
      category: "identity",
      required: true,
    },
    {
      id: "fee_receipt",
      name: "MRV Fee Receipt",
      reason: "Proof of visa application fee payment",
      whereToGet: "Pay at designated bank / online via ustraveldocs.com",
      copyType: "copy",
      category: "identity",
      required: true,
    },
    {
      id: "appointment",
      name: "Interview Appointment Letter",
      reason: "Confirms your scheduled interview date and time",
      whereToGet: "ustraveldocs.com after fee payment",
      copyType: "copy",
      category: "identity",
      required: true,
    },
    {
      id: "employer_noc",
      name: "Employer NOC (No Objection Certificate)",
      reason: "Proves your employer approves your travel and expects your return",
      whereToGet: "Request from HR department at TCS",
      copyType: "original",
      freshnessRule: "Issued within 1 month of interview",
      category: "ties",
      required: true,
    },
    {
      id: "salary_slips",
      name: "Last 3 Months Salary Slips",
      reason: "Demonstrates regular, stable income",
      whereToGet: "HR department or payroll portal",
      copyType: "copy",
      freshnessRule: "Most recent 3 months",
      category: "financial",
      required: true,
    },
    {
      id: "form16",
      name: "Form 16 (Latest Year)",
      reason: "Official tax deduction certificate proving income",
      whereToGet: "HR department / TRACES portal",
      copyType: "copy",
      category: "financial",
      required: true,
    },
    {
      id: "bank_statements",
      name: "6 Months Bank Statements",
      reason: "Shows financial stability and sufficient funds for the trip",
      whereToGet: "Request from your bank (HDFC)",
      copyType: "original",
      freshnessRule: "Issued within 1 week of interview",
      category: "financial",
      required: true,
    },
    {
      id: "itr",
      name: "ITR (Income Tax Returns) — Last 2 Years",
      reason: "Comprehensive proof of income and tax compliance",
      whereToGet: "Download from incometax.gov.in",
      copyType: "copy",
      category: "financial",
      required: true,
    },
    {
      id: "property_docs",
      name: "Property Ownership Papers",
      reason: "Strong evidence of ties to India — you own a flat in Pune",
      whereToGet: "Already in possession (registration document)",
      copyType: "copy",
      category: "ties",
      required: true,
    },
    {
      id: "invitation_letter",
      name: "Invitation Letter from Microsoft",
      reason: "Confirms the purpose and dates of your business visit",
      whereToGet: "Request from the host company (Microsoft)",
      copyType: "original",
      category: "purpose",
      required: true,
    },
    {
      id: "flight_itinerary",
      name: "Flight Itinerary (Round Trip)",
      reason: "Shows confirmed return date — demonstrates temporary intent",
      whereToGet: "Booking confirmation from airline / travel agent",
      copyType: "copy",
      category: "travel",
      required: true,
    },
    {
      id: "hotel_booking",
      name: "Hotel Reservation / Accommodation Proof",
      reason: "Confirms where you will stay during the trip",
      whereToGet: "Hotel booking confirmation",
      copyType: "copy",
      category: "travel",
      required: false,
    },
    {
      id: "travel_insurance",
      name: "Travel Medical Insurance",
      reason: "Recommended coverage for the duration of your trip",
      whereToGet: "Any insurance provider (ICICI Lombard, Bajaj Allianz, etc.)",
      copyType: "copy",
      category: "travel",
      required: false,
    },
  ],
  score: {
    total: 82,
    band: "strong",
    sections: [
      {
        key: "financial",
        score: 18,
        max: 20,
        reason: "Annual income ₹14,40,000 vs estimated trip cost ₹2,10,000. Strong financial position with savings, FDs, and investments.",
      },
      {
        key: "ties",
        score: 22,
        max: 25,
        reason: "Salaried at TCS (3 years), 1 dependent mother, owns property in Pune. Strong ties.",
      },
      {
        key: "history",
        score: 12,
        max: 15,
        reason: "2 countries visited (Singapore, UK). No prior US visa — first-time applicant.",
      },
      {
        key: "purpose",
        score: 18,
        max: 20,
        reason: "Clear business purpose with invitation from Microsoft. Specific dates and itinerary.",
      },
      {
        key: "documentation",
        score: 12,
        max: 20,
        reason: "Core documents in order. Consider adding FD certificates and family photo for extra strength.",
      },
    ],
    fixes: [],
  },
  interviewQuestions: [
    {
      id: "q1",
      officerPrompt: "Why do you want to go to the United States?",
      intent: "purpose",
      suggestedAnswer: "I'm attending the Microsoft Technology Partner Summit in Seattle from March 15-28. It's directly related to my work at TCS where I lead the Azure integration team. My employer has approved my leave and provided an NOC.",
    },
    {
      id: "q2",
      officerPrompt: "What do you do for a living?",
      intent: "ties",
      suggestedAnswer: "I'm a senior software engineer at Tata Consultancy Services in Pune. I've been with TCS for three years and lead a team of six developers working on Azure cloud integration projects.",
    },
    {
      id: "q3",
      officerPrompt: "What is your monthly income?",
      intent: "finances",
      suggestedAnswer: "My monthly salary is ₹1,20,000. I also have savings of ₹8,50,000, fixed deposits of ₹5,00,000, and mutual fund investments worth ₹3,20,000.",
    },
    {
      id: "q4",
      officerPrompt: "Who is paying for this trip?",
      intent: "finances",
      suggestedAnswer: "I'm funding the trip entirely myself. The estimated cost is about ₹2,10,000, which is well within my means given my savings and regular income.",
    },
    {
      id: "q5",
      officerPrompt: "What ties do you have to India that ensure you'll return?",
      intent: "ties",
      suggestedAnswer: "I have a permanent job at TCS with active projects, my mother lives with me and depends on me financially, and I own a flat in Pune valued at ₹65 lakhs. My entire career, family, and financial life is here in India.",
    },
    {
      id: "q6",
      officerPrompt: "Have you travelled internationally before?",
      intent: "history",
      suggestedAnswer: "Yes, I visited Singapore in 2023 and the United Kingdom in 2024, both for business conferences. I returned to India on time after each trip.",
    },
    {
      id: "q7",
      officerPrompt: "Do you have any relatives in the United States?",
      intent: "consistency",
      suggestedAnswer: "No, I don't have any close relatives in the United States. My immediate family — my mother — lives with me in Pune.",
    },
    {
      id: "q8",
      officerPrompt: "What will you do after the summit ends?",
      intent: "purpose",
      suggestedAnswer: "I'll fly back to India on March 28 — I already have a confirmed return ticket. I need to be back at TCS for a major project milestone in the first week of April.",
    },
    {
      id: "q9",
      officerPrompt: "If your company offered you a job in the US, would you take it?",
      intent: "consistency",
      suggestedAnswer: "My career and life are established in India. I own property here, my mother depends on me, and I'm growing in my role at TCS. I have no plans to relocate.",
    },
    {
      id: "q10",
      officerPrompt: "Why should I believe you'll come back?",
      intent: "ties",
      suggestedAnswer: "Because everything that matters to me is in India — my job of three years, my team, my mother who I care for, my flat in Pune, and my financial investments. I have strong reasons to return and no reason to stay.",
    },
  ],
  generatedAt: new Date().toISOString(),
};
