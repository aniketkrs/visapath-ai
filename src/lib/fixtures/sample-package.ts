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
      reason: "Primary identity document. Must have at least 6 months validity beyond your planned stay in the US",
      whereToGet: "Passport Seva Kendra / already in possession",
      copyType: "original",
      category: "identity",
      required: true,
    },
    {
      id: "ds160",
      name: "DS-160 Confirmation Page",
      reason: "Required online nonimmigrant visa application — must be completed before your interview",
      whereToGet: "ceac.state.gov — complete and print confirmation page",
      copyType: "copy",
      category: "identity",
      required: true,
    },
    {
      id: "photo",
      name: "US Visa Photograph (5x5 cm)",
      reason: "Must meet US visa photo specifications — recent, white background, no glasses",
      whereToGet: "Any authorized photo studio — mention US visa photo requirements",
      copyType: "original",
      category: "identity",
      required: true,
    },
    {
      id: "fee_receipt",
      name: "MRV Fee Receipt",
      reason: "Proof of visa application fee payment ($185 for B-1/B-2)",
      whereToGet: "Pay at designated bank or online via ustraveldocs.com",
      copyType: "copy",
      category: "identity",
      required: true,
    },
    {
      id: "appointment",
      name: "Interview Appointment Letter",
      reason: "Confirms your scheduled interview date, time, and location",
      whereToGet: "ustraveldocs.com after fee payment",
      copyType: "copy",
      category: "identity",
      required: true,
    },
    {
      id: "travel_history",
      name: "Travel History Evidence",
      reason: "Previous visa copies, entry/exit stamps, and immigration records demonstrate compliant travel history",
      whereToGet: "Your passport pages (Singapore 2023, UK 2024 stamps), old passports, e-visa printouts",
      copyType: "copy",
      category: "travel",
      required: true,
    },
    {
      id: "ties_proof",
      name: "Proof of Ties to India",
      reason: "Property papers, family documents, or other evidence showing strong reasons to return to India",
      whereToGet: "Pune flat registration, mother's dependency proof, employment letter",
      copyType: "copy",
      category: "ties",
      required: true,
    },
    {
      id: "employer_noc",
      name: "Employer NOC (No Objection Certificate)",
      reason: "Proves that Tata Consultancy Services approves your travel and expects you to return to your position",
      whereToGet: "Request from HR department at Tata Consultancy Services",
      copyType: "original",
      freshnessRule: "Issued within 1 month of interview",
      category: "ties",
      required: true,
    },
    {
      id: "salary_slips",
      name: "Last 3 Months Salary Slips",
      reason: "Demonstrates regular, stable income and active employment",
      whereToGet: "HR department or payroll portal",
      copyType: "copy",
      freshnessRule: "Most recent 3 consecutive months",
      category: "financial",
      required: true,
    },
    {
      id: "form16",
      name: "Form 16 (Latest Assessment Year)",
      reason: "Official tax deduction certificate from employer — proves declared income",
      whereToGet: "HR department / download from TRACES portal (tdscpc.gov.in)",
      copyType: "copy",
      category: "financial",
      required: true,
    },
    {
      id: "employment_letter",
      name: "Employment Letter / Offer Letter",
      reason: "Confirms your role, tenure, and salary — establishes professional stability at TCS",
      whereToGet: "Request from HR at Tata Consultancy Services",
      copyType: "original",
      freshnessRule: "Issued within 1 month of interview",
      category: "ties",
      required: true,
    },
    {
      id: "company_id",
      name: "Company ID Card Copy",
      reason: "Additional proof of active employment and access to TCS premises",
      whereToGet: "Your existing TCS employee ID card — photocopy both sides",
      copyType: "copy",
      category: "ties",
      required: false,
    },
    {
      id: "bank_statements",
      name: "6 Months Personal Bank Statements",
      reason: "Shows financial stability, salary credits, and sufficient funds for the trip",
      whereToGet: "Request from HDFC Bank — get stamped and signed copies",
      copyType: "original",
      freshnessRule: "Issued within 1 week of interview",
      category: "financial",
      required: true,
    },
    {
      id: "itr",
      name: "Income Tax Returns (Last 2-3 Years)",
      reason: "Comprehensive proof of declared income and tax compliance",
      whereToGet: "Download from incometax.gov.in — ITR-V acknowledgment",
      copyType: "copy",
      category: "financial",
      required: true,
    },
    {
      id: "invitation_letter",
      name: "Invitation Letter from Microsoft Corporation",
      reason: "Confirms the business purpose, dates, and nature of your visit to Microsoft",
      whereToGet: "Request from Microsoft Corporation — should be on company letterhead",
      copyType: "original",
      category: "purpose",
      required: true,
    },
    {
      id: "company_profile",
      name: "Company Profile of Microsoft Corporation",
      reason: "Establishes the legitimacy and standing of the company you are visiting",
      whereToGet: "Microsoft website, LinkedIn page, or request from the inviting company",
      copyType: "copy",
      category: "purpose",
      required: false,
    },
    {
      id: "property_docs",
      name: "Property Ownership Papers",
      reason: "Strong evidence of ties to India — you own a flat in Pune valued at ~₹65,00,000",
      whereToGet: "Already in possession (registration document from 2024)",
      copyType: "copy",
      category: "ties",
      required: true,
    },
    {
      id: "flight_itinerary",
      name: "Flight Itinerary (Round Trip)",
      reason: "Shows confirmed return date — demonstrates temporary intent and commitment to return",
      whereToGet: "Booking confirmation from airline / travel agent (refundable booking acceptable)",
      copyType: "copy",
      category: "travel",
      required: true,
    },
    {
      id: "travel_insurance",
      name: "Travel Medical Insurance",
      reason: "Recommended coverage for the duration of your trip — covers medical emergencies in the US",
      whereToGet: "Any insurance provider (ICICI Lombard, Bajaj Allianz, TATA AIG, etc.)",
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
      officerPrompt: "What is the purpose of your trip to the United States?",
      intent: "purpose",
      suggestedAnswer: "I'm travelling to the US for a business visit — specifically to meet with Microsoft Corporation for the Annual Technology Partner Summit. My employer Tata Consultancy Services has approved this trip and provided a No Objection Certificate.",
    },
    {
      id: "q2",
      officerPrompt: "What do you do for a living?",
      intent: "ties",
      suggestedAnswer: "I'm employed at Tata Consultancy Services, where I've been working for 3 years. My monthly salary is ₹1,20,000. I have a permanent position with active projects and responsibilities as a senior developer on the Azure integration team.",
    },
    {
      id: "q3",
      officerPrompt: "Who is paying for this trip and what are your finances?",
      intent: "finances",
      suggestedAnswer: "I'm funding the trip entirely myself. My monthly income is ₹1,20,000. My total assets in India are valued at approximately ₹85,00,000. The estimated trip cost is well within my financial capacity.",
    },
    {
      id: "q4",
      officerPrompt: "What ties do you have to India that ensure you will return?",
      intent: "ties",
      suggestedAnswer: "I have strong reasons to return to India. I have a permanent job at Tata Consultancy Services with ongoing projects. I have 1 dependent in India who relies on me. I own property in India. My entire professional, financial, and personal life is based in India.",
    },
    {
      id: "q5",
      officerPrompt: "Have you travelled internationally before?",
      intent: "history",
      suggestedAnswer: "Yes, I have visited 2 countries previously including Singapore and the United Kingdom. I returned to India on time after each trip, which demonstrates my compliance with immigration rules.",
    },
    {
      id: "q6",
      officerPrompt: "What is your plan after the trip ends?",
      intent: "purpose",
      suggestedAnswer: "I will return to India immediately after my 14-day trip. I need to get back to my role at Tata Consultancy Services — I have active projects and team responsibilities waiting for me.",
    },
    {
      id: "q7",
      officerPrompt: "Would you take a job in the US if offered one?",
      intent: "consistency",
      suggestedAnswer: "No. My career and life are established in India. I have a stable position at Tata Consultancy Services in India, and I have dependents who need me. I have no plans to relocate and this trip is purely temporary.",
    },
    {
      id: "q8",
      officerPrompt: "Do you have any relatives in the United States?",
      intent: "consistency",
      suggestedAnswer: "No, I don't have any close relatives in the United States. My immediate family — my mother — lives with me in Pune. My US point of contact is a business partner, not a relative.",
    },
    {
      id: "q9",
      officerPrompt: "What specifically will you be doing at Microsoft?",
      intent: "purpose",
      suggestedAnswer: "I'll be attending the Annual Technology Partner Summit at Microsoft's campus in Seattle. This is directly relevant to my role on the Azure integration team at TCS. The summit runs from March 15-28 and involves technical sessions, partner meetings, and workshops.",
    },
    {
      id: "q10",
      officerPrompt: "Why should I believe you'll come back?",
      intent: "ties",
      suggestedAnswer: "Because everything that matters to me is in India — my job of three years at TCS, my team of six developers, my mother who I care for, my flat in Pune valued at ₹65 lakhs, and my financial investments totaling ₹85 lakhs. I have strong reasons to return and no reason to stay.",
    },
  ],
  generatedAt: new Date().toISOString(),
};
