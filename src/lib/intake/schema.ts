import type { IntakeAnswers } from "@/lib/types";

export type QuestionType = "text" | "number" | "select" | "bool" | "date" | "country_list";

export type QuestionSection = "about_you" | "your_trip" | "your_background" | "your_ties" | "visa_history";

export interface SectionMeta {
  id: QuestionSection;
  title: string;
  subtitle: string;
}

export const INTAKE_SECTIONS: SectionMeta[] = [
  { id: "about_you", title: "About You", subtitle: "We need your basic identity details as they appear on your passport." },
  { id: "your_trip", title: "Your Trip", subtitle: "Tell us about your planned visit so we can tailor your application." },
  { id: "your_background", title: "Your Background", subtitle: "Employment and financial details help demonstrate strong ties to India." },
  { id: "your_ties", title: "Your Ties", subtitle: "Property, dependents, and travel history strengthen your 214(b) case." },
  { id: "visa_history", title: "Visa History", subtitle: "Prior visa outcomes help us prepare you for officer expectations." },
];

export interface IntakeQuestion {
  id: keyof IntakeAnswers | string;
  label: string;
  description?: string;
  type: QuestionType;
  options?: { value: string; label: string }[];
  placeholder?: string;
  showIf?: (answers: Partial<IntakeAnswers>) => boolean;
  validate?: (value: unknown, answers: Partial<IntakeAnswers>) => string | null;
  required?: boolean;
  section: QuestionSection;
  whyItMatters?: string;
}

export const intakeSchema: IntakeQuestion[] = [
  // --- About You ---
  {
    id: "fullName",
    label: "What is your full name?",
    description: "As it appears on your passport",
    type: "text",
    placeholder: "e.g. Priya Sharma",
    required: true,
    section: "about_you",
    whyItMatters: "Must match your passport exactly — mismatches cause delays or denials.",
    validate: (v) => {
      if (!v || (typeof v === "string" && v.trim().length < 2)) return "Please enter your full name";
      return null;
    },
  },
  {
    id: "dateOfBirth",
    label: "Date of birth",
    type: "date",
    required: true,
    section: "about_you",
    whyItMatters: "Used to match your DS-160 form and passport records.",
    validate: (v) => {
      if (!v) return "Please enter your date of birth";
      const d = new Date(v as string);
      if (d > new Date()) return "Date of birth cannot be in the future";
      return null;
    },
  },
  {
    id: "passportNumber",
    label: "Passport number",
    description: "Your Indian passport number",
    type: "text",
    placeholder: "e.g. J8369854",
    required: true,
    section: "about_you",
    whyItMatters: "We check your passport validity against your travel dates automatically.",
    validate: (v) => {
      if (!v || (typeof v === "string" && v.trim().length < 6)) return "Please enter a valid passport number";
      return null;
    },
  },
  {
    id: "passportExpiry",
    label: "Passport expiry date",
    type: "date",
    required: true,
    section: "about_you",
    whyItMatters: "US requires 6+ months validity beyond your stay. We flag expiring passports.",
    validate: (v, answers) => {
      if (!v) return "Please enter your passport expiry date";
      const expiry = new Date(v as string);
      if (expiry < new Date()) return "Your passport has expired";
      if (answers.travelStartDate) {
        const travel = new Date(answers.travelStartDate);
        if (expiry < travel) return "Passport expires before your travel date";
      }
      return null;
    },
  },

  // --- Your Trip ---
  {
    id: "purposeOfVisit",
    label: "What is the purpose of your US visit?",
    type: "select",
    options: [
      { value: "tourism", label: "🏖️ Tourism / Vacation" },
      { value: "business", label: "💼 Business meetings / Conference" },
      { value: "medical", label: "🏥 Medical treatment" },
      { value: "family_visit", label: "👨‍👩‍👧 Family visit" },
      { value: "conference", label: "🎤 Conference / Event" },
    ],
    required: true,
    section: "your_trip",
    whyItMatters: "Your purpose determines which supporting documents and questions are needed.",
  },
  {
    id: "travelStartDate",
    label: "When do you plan to travel?",
    type: "date",
    required: true,
    section: "your_trip",
    whyItMatters: "Helps us check passport validity and build a realistic itinerary for your statement.",
    validate: (v) => {
      if (!v) return "Please select your travel date";
      const d = new Date(v as string);
      if (d < new Date()) return "Travel date should be in the future";
      return null;
    },
  },
  {
    id: "travelDurationDays",
    label: "How many days will you stay in the US?",
    type: "number",
    placeholder: "e.g. 14",
    required: true,
    section: "your_trip",
    whyItMatters: "Longer stays raise more questions about ties to India. We adjust your prep accordingly.",
    validate: (v) => {
      const n = Number(v);
      if (!n || n < 1) return "Please enter the number of days";
      if (n > 180) return "B-1/B-2 visa stay is typically under 180 days";
      return null;
    },
  },

  // --- Your Background ---
  {
    id: "employmentStatus",
    label: "What is your current employment status?",
    type: "select",
    options: [
      { value: "salaried", label: "💼 Salaried employee" },
      { value: "self_employed", label: "🏢 Self-employed / Business owner" },
      { value: "student", label: "🎓 Student" },
      { value: "retired", label: "🏖️ Retired" },
      { value: "homemaker", label: "🏠 Homemaker" },
    ],
    required: true,
    section: "your_background",
    whyItMatters: "Stable employment is the #1 factor in 214(b) approvals. We tailor everything to your status.",
  },

  // --- Salaried branches ---
  {
    id: "employerName",
    label: "What is the name of your employer?",
    type: "text",
    placeholder: "e.g. Tata Consultancy Services",
    showIf: (a) => a.employmentStatus === "salaried",
    required: true,
    section: "your_background",
    whyItMatters: "A known employer adds credibility. We include it in your consular statement.",
  },
  {
    id: "monthlyIncomeINR",
    label: "What is your monthly income (₹)?",
    type: "number",
    placeholder: "e.g. 85000",
    showIf: (a) => a.employmentStatus === "salaried",
    required: true,
    section: "your_background",
    whyItMatters: "Income demonstrates financial capacity for the trip and reasons to return.",
    validate: (v) => {
      if (!v || Number(v) < 0) return "Please enter a valid income";
      return null;
    },
  },
  {
    id: "yearsAtJob",
    label: "How many years at your current job?",
    type: "number",
    placeholder: "e.g. 3",
    showIf: (a) => a.employmentStatus === "salaried",
    section: "your_background",
    whyItMatters: "Job stability (2+ years) is a strong positive signal to consular officers.",
  },

  // --- Self-employed branches ---
  {
    id: "annualTurnoverINR",
    label: "What is your annual business turnover (₹)?",
    type: "number",
    placeholder: "e.g. 5000000",
    showIf: (a) => a.employmentStatus === "self_employed",
    required: true,
    section: "your_background",
    whyItMatters: "Business scale shows strong economic ties to India.",
  },
  {
    id: "gstRegistered",
    label: "Is your business GST registered?",
    type: "bool",
    showIf: (a) => a.employmentStatus === "self_employed",
    section: "your_background",
    whyItMatters: "GST registration adds legitimacy to your business claims.",
  },
  {
    id: "businessHeadcount",
    label: "How many employees does your business have?",
    type: "number",
    placeholder: "e.g. 12",
    showIf: (a) => a.employmentStatus === "self_employed",
    section: "your_background",
    whyItMatters: "Employee count demonstrates business responsibility and ties to India.",
  },

  // --- Retired branch ---
  {
    id: "pensionSource",
    label: "What is your source of pension?",
    type: "text",
    placeholder: "e.g. Government pension, EPF",
    showIf: (a) => a.employmentStatus === "retired",
    section: "your_background",
    whyItMatters: "Stable income sources reassure the officer you won't overstay.",
  },

  // --- Assets & ties ---
  {
    id: "assetsINR",
    label: "What is the approximate total value of your assets in India (₹)?",
    description: "Include property, investments, savings, FDs",
    type: "number",
    placeholder: "e.g. 5000000",
    section: "your_ties",
    whyItMatters: "Assets prove you have strong reasons to return to India after your trip.",
  },
  {
    id: "ownsProperty",
    label: "Do you own property (house/land) in India?",
    type: "bool",
    section: "your_ties",
    whyItMatters: "Property ownership is one of the strongest ties to your home country.",
  },
  {
    id: "dependentsInIndia",
    label: "How many dependents do you have in India?",
    description: "Family members who depend on you (spouse, children, parents)",
    type: "number",
    placeholder: "e.g. 3",
    required: true,
    section: "your_ties",
    whyItMatters: "Dependents are a primary reason officers believe you'll return to India.",
    validate: (v) => {
      if (v === undefined || v === null || v === "") return "Please enter a number (0 if none)";
      return null;
    },
  },

  // --- Visa History ---
  {
    id: "priorUsVisa",
    label: "Have you applied for a US visa before?",
    type: "bool",
    required: true,
    section: "visa_history",
    whyItMatters: "Previous outcomes affect how we frame your current application.",
  },
  {
    id: "priorUsVisaOutcome",
    label: "What was the outcome?",
    type: "select",
    options: [
      { value: "approved", label: "✅ Approved" },
      { value: "refused_214b", label: "❌ Refused under 214(b)" },
      { value: "refused_other", label: "❌ Refused (other reason)" },
    ],
    showIf: (a) => a.priorUsVisa === true,
    required: true,
    section: "visa_history",
    whyItMatters: "We adjust your statement and prep to address previous outcomes directly.",
  },
  {
    id: "changedSinceRefusal",
    label: "What has changed since your refusal?",
    description: "Describe what's different now — new job, higher income, property, family changes",
    type: "text",
    placeholder: "e.g. I now have a permanent job at TCS with ₹1.2L/month salary and own a flat in Pune",
    showIf: (a) => a.priorUsVisaOutcome === "refused_214b",
    required: true,
    section: "visa_history",
    whyItMatters: "Officers want to see concrete changes since a refusal. We weave this into your statement.",
  },

  // --- Purpose-specific branches ---
  {
    id: "hospitalName",
    label: "Which hospital will you visit?",
    type: "text",
    placeholder: "e.g. Mayo Clinic, Rochester",
    showIf: (a) => a.purposeOfVisit === "medical",
    required: true,
    section: "your_trip",
    whyItMatters: "Specific hospital names make your medical visa purpose credible.",
  },
  {
    id: "appointmentDate",
    label: "Appointment date",
    type: "date",
    showIf: (a) => a.purposeOfVisit === "medical",
    section: "your_trip",
    whyItMatters: "A confirmed appointment date strengthens your application significantly.",
  },
  {
    id: "invitingCompany",
    label: "Which company is inviting you?",
    type: "text",
    placeholder: "e.g. Microsoft Corporation",
    showIf: (a) => a.purposeOfVisit === "business" || a.purposeOfVisit === "conference",
    required: true,
    section: "your_trip",
    whyItMatters: "The inviter's credibility directly impacts your application strength.",
  },
  {
    id: "meetingPurpose",
    label: "What is the purpose of the meeting/event?",
    type: "text",
    placeholder: "e.g. Annual partner summit, product launch review",
    showIf: (a) => a.purposeOfVisit === "business" || a.purposeOfVisit === "conference",
    section: "your_trip",
    whyItMatters: "Clear purpose makes your trip intent obvious and reduces suspicion of overstay.",
  },

  // --- Travel history ---
  {
    id: "internationalTravelHistory",
    label: "Which countries have you visited before?",
    description: "Select all that apply (leave empty if none)",
    type: "country_list",
    section: "your_ties",
    whyItMatters: "Travel history shows you've returned from trips abroad before — a strong positive signal.",
  },

  // --- US contact ---
  {
    id: "usPointOfContact",
    label: "Do you have a point of contact in the US?",
    description: "Name, relation, and city (leave blank if none)",
    type: "text",
    placeholder: "e.g. Rahul Sharma, cousin, San Francisco",
    section: "your_trip",
    whyItMatters: "A US contact is normal — we just need to frame it correctly in your statement.",
  },
];

export function getVisibleQuestions(answers: Partial<IntakeAnswers>): IntakeQuestion[] {
  return intakeSchema.filter((q) => !q.showIf || q.showIf(answers));
}

export function getSectionForQuestion(
  visibleQuestions: IntakeQuestion[],
  questionIndex: number
): { sectionIndex: number; sectionMeta: SectionMeta; isFirstInSection: boolean } | null {
  const question = visibleQuestions[questionIndex];
  if (!question) return null;

  const visibleSections = INTAKE_SECTIONS.filter((s) =>
    visibleQuestions.some((q) => q.section === s.id)
  );
  const sectionIndex = visibleSections.findIndex((s) => s.id === question.section);
  const isFirstInSection =
    questionIndex === 0 || visibleQuestions[questionIndex - 1].section !== question.section;

  return { sectionIndex, sectionMeta: visibleSections[sectionIndex], isFirstInSection };
}
