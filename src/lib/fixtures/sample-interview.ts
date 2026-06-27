import type { TurnScore, IntakeAnswers } from "@/lib/types";

export interface CachedTurn {
  officer: string;
  applicant: string;
  score: TurnScore;
}

const baseScores: TurnScore = {
  confidence: 88,
  consistency: 90,
  tiesStrength: 75,
  redFlags: [],
  followUp: "",
};

function purposeQuestion(answers: Partial<IntakeAnswers>): CachedTurn {
  const purpose = answers.purposeOfVisit || "tourism";
  const name = answers.fullName || "the applicant";

  const purposeMap: Record<string, { q: string; a: string }> = {
    tourism: {
      q: "Why do you want to go to the United States?",
      a: `I'm planning a tourism visit to the United States for ${answers.travelDurationDays || 14} days. I want to experience American culture and visit popular destinations. I have a confirmed return ticket and my employer has approved my leave.`,
    },
    business: {
      q: "What is the purpose of your business trip to the United States?",
      a: `I'm travelling to the United States for business meetings${answers.invitingCompany ? ` with ${answers.invitingCompany}` : ""}${answers.meetingPurpose ? ` regarding ${answers.meetingPurpose}` : ""}. My employer has approved my leave and provided a No Objection Certificate.`,
    },
    medical: {
      q: "Why do you need to travel to the United States for medical treatment?",
      a: `I need to visit ${answers.hospitalName || "a hospital"} in the United States for medical treatment${answers.appointmentDate ? `, with an appointment scheduled for ${answers.appointmentDate}` : ""}. I have the necessary medical documentation and can fund the treatment myself.`,
    },
    family_visit: {
      q: "Why do you want to visit the United States?",
      a: `I'm planning to visit my family in the United States. ${answers.usPointOfContact ? `My ${answers.usPointOfContact.relation}, ${answers.usPointOfContact.name}, lives in ${answers.usPointOfContact.city}.` : ""} I have strong ties to India and plan to return after my visit.`,
    },
    conference: {
      q: "What conference are you attending in the United States?",
      a: `I'm attending a professional conference${answers.invitingCompany ? ` hosted by ${answers.invitingCompany}` : ""}${answers.meetingPurpose ? ` focused on ${answers.meetingPurpose}` : ""}. It's directly relevant to my professional development. My employer has approved my leave.`,
    },
  };

  const { q, a } = purposeMap[purpose] || purposeMap.tourism;
  return { officer: q, applicant: a, score: { ...baseScores, confidence: 88, tiesStrength: 75 } };
}

function employmentQuestion(answers: Partial<IntakeAnswers>): CachedTurn {
  const status = answers.employmentStatus || "salaried";
  const name = answers.fullName || "the applicant";

  const employmentMap: Record<string, { q: string; a: string }> = {
    salaried: {
      q: "What do you do for a living and how long have you been at your current job?",
      a: `I'm employed at ${answers.employerName || "my company"}${answers.yearsAtJob ? ` where I've been working for ${answers.yearsAtJob} years` : ""}. ${answers.monthlyIncomeINR ? `My monthly salary is ₹${answers.monthlyIncomeINR.toLocaleString("en-IN")}.` : ""} I have a stable position with good career growth.`,
    },
    self_employed: {
      q: "Tell me about your business. How long have you been running it?",
      a: `I'm a self-employed business owner${answers.annualTurnoverINR ? ` with an annual turnover of ₹${answers.annualTurnoverINR.toLocaleString("en-IN")}` : ""}. ${answers.gstRegistered ? "My business is GST registered." : ""} ${answers.businessHeadcount ? `I employ ${answers.businessHeadcount} people.` : ""} The business is well-established and requires my presence in India.`,
    },
    student: {
      q: "Are you currently studying? What are you studying?",
      a: "I'm currently a student in India. I have strong academic ties and my family is here. I plan to return to complete my education after my visit.",
    },
    retired: {
      q: "What do you do now that you're retired?",
      a: `I'm retired${answers.pensionSource ? ` and receive pension from ${answers.pensionSource}` : ""}. ${answers.assetsINR ? `I have assets valued at approximately ₹${answers.assetsINR.toLocaleString("en-IN")}.` : ""} My family and life are rooted in India.`,
    },
    homemaker: {
      q: "What do you do during the day? Are you employed?",
      a: "I'm a homemaker. My family, dependents, and entire life are in India. I have strong ties that ensure my return.",
    },
  };

  const { q, a } = employmentMap[status] || employmentMap.salaried;
  return { officer: q, applicant: a, score: { ...baseScores, confidence: 92, tiesStrength: 88 } };
}

function incomeQuestion(answers: Partial<IntakeAnswers>): CachedTurn {
  const income = answers.monthlyIncomeINR
    ? `₹${answers.monthlyIncomeINR.toLocaleString("en-IN")}`
    : "a stable income";
  return {
    officer: "What is your monthly income and how are you funding this trip?",
    applicant: `My monthly income is ${income}. I'm funding the entire trip myself. I have sufficient savings and financial stability to cover all expenses.`,
    score: { ...baseScores, confidence: 94, consistency: 93, tiesStrength: 80 },
  };
}

function tiesQuestion(answers: Partial<IntakeAnswers>): CachedTurn {
  const parts: string[] = [];
  if (answers.employmentStatus === "salaried" && answers.employerName) {
    parts.push(`I have a permanent position at ${answers.employerName}`);
  } else if (answers.employmentStatus === "self_employed") {
    parts.push("I have an established business in India that requires my presence");
  }
  if (answers.dependentsInIndia && answers.dependentsInIndia > 0) {
    parts.push(`I have ${answers.dependentsInIndia} dependent${answers.dependentsInIndia > 1 ? "s" : ""} in India`);
  }
  if (answers.ownsProperty) {
    parts.push("I own property in India");
  }
  if (answers.assetsINR) {
    parts.push(`my total assets are valued at ₹${answers.assetsINR.toLocaleString("en-IN")}`);
  }
  const tiesText = parts.length > 0
    ? parts.join(". ") + ". My entire life is rooted in India."
    : "I have strong family, professional, and financial ties to India that guarantee my return.";

  return {
    officer: "What ties do you have to India that will ensure you return?",
    applicant: tiesText,
    score: { ...baseScores, confidence: 91, tiesStrength: 95 },
  };
}

function travelHistoryQuestion(answers: Partial<IntakeAnswers>): CachedTurn {
  const history = answers.internationalTravelHistory || [];
  const hasHistory = history.length > 0;

  if (answers.priorUsVisa && answers.priorUsVisaOutcome === "refused_214b") {
    return {
      officer: "I see you were previously refused a US visa. What has changed since then?",
      applicant: answers.changedSinceRefusal
        ? `Since my previous refusal, ${answers.changedSinceRefusal}. My circumstances have significantly improved and I have stronger ties to India now.`
        : "My circumstances have changed significantly since then. I have stronger financial and personal ties to India now.",
      score: { ...baseScores, confidence: 78, consistency: 80, tiesStrength: 70, redFlags: ["prior_refusal"] },
    };
  }

  return {
    officer: "Have you travelled internationally before?",
    applicant: hasHistory
      ? `Yes, I have visited ${history.join(", ")}. I returned to India on time after each trip. ${answers.priorUsVisa ? "I have prior US visa experience." : "I have no prior US visa applications or refusals."}`
      : "This would be my first international trip. However, I have strong ties to India and fully intend to return.",
    score: {
      ...baseScores,
      confidence: hasHistory ? 87 : 80,
      consistency: 92,
      tiesStrength: hasHistory ? 82 : 75,
    },
  };
}

function relativesQuestion(answers: Partial<IntakeAnswers>): CachedTurn {
  const poc = answers.usPointOfContact;
  return {
    officer: "Do you have any relatives in the United States? What will you do after your visit?",
    applicant: poc
      ? `Yes, my ${poc.relation}, ${poc.name}, lives in ${poc.city}. I'm visiting them temporarily. After my visit, I'll return to India — I have strong reasons to go back.`
      : "No, I don't have any close relatives in the United States. After my visit ends, I'll fly back to India. I have a confirmed return ticket and commitments that require my return.",
    score: { ...baseScores, confidence: 90, consistency: 94, tiesStrength: 88 },
  };
}

/**
 * Generate personalized cached interview from intake answers.
 * Falls back to Priya Sharma defaults when answers are sparse.
 */
export function generatePersonalizedInterview(
  answers: Partial<IntakeAnswers>
): CachedTurn[] {
  return [
    purposeQuestion(answers),
    employmentQuestion(answers),
    incomeQuestion(answers),
    tiesQuestion(answers),
    travelHistoryQuestion(answers),
    relativesQuestion(answers),
  ];
}

/**
 * Cached demo exchange — Technical PRD §15
 * Pre-recorded mock consular interview for Priya Sharma (B-1/B-2).
 * Plays through when ElevenLabs / network is unavailable.
 */
export const sampleInterview: CachedTurn[] = generatePersonalizedInterview({
  fullName: "Priya Sharma",
  purposeOfVisit: "conference",
  travelDurationDays: 14,
  employmentStatus: "salaried",
  employerName: "Tata Consultancy Services",
  monthlyIncomeINR: 120000,
  yearsAtJob: 3,
  dependentsInIndia: 1,
  ownsProperty: true,
  assetsINR: 16700000,
  invitingCompany: "Microsoft",
  meetingPurpose: "Technology Partner Summit",
  internationalTravelHistory: ["Singapore", "United Kingdom"],
  priorUsVisa: false,
});
