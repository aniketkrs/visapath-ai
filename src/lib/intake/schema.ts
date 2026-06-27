import type { IntakeAnswers } from "@/lib/types";

export type QuestionType = "text" | "number" | "select" | "bool" | "date" | "country_list";

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
}

export const intakeSchema: IntakeQuestion[] = [
  // --- Always asked ---
  {
    id: "fullName",
    label: "What is your full name?",
    description: "As it appears on your passport",
    type: "text",
    placeholder: "e.g. Priya Sharma",
    required: true,
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
  },
  {
    id: "travelStartDate",
    label: "When do you plan to travel?",
    type: "date",
    required: true,
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
    validate: (v) => {
      const n = Number(v);
      if (!n || n < 1) return "Please enter the number of days";
      if (n > 180) return "B-1/B-2 visa stay is typically under 180 days";
      return null;
    },
  },
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
  },

  // --- Salaried branches ---
  {
    id: "employerName",
    label: "What is the name of your employer?",
    type: "text",
    placeholder: "e.g. Tata Consultancy Services",
    showIf: (a) => a.employmentStatus === "salaried",
    required: true,
  },
  {
    id: "monthlyIncomeINR",
    label: "What is your monthly income (₹)?",
    type: "number",
    placeholder: "e.g. 85000",
    showIf: (a) => a.employmentStatus === "salaried",
    required: true,
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
  },

  // --- Self-employed branches ---
  {
    id: "annualTurnoverINR",
    label: "What is your annual business turnover (₹)?",
    type: "number",
    placeholder: "e.g. 5000000",
    showIf: (a) => a.employmentStatus === "self_employed",
    required: true,
  },
  {
    id: "gstRegistered",
    label: "Is your business GST registered?",
    type: "bool",
    showIf: (a) => a.employmentStatus === "self_employed",
  },
  {
    id: "businessHeadcount",
    label: "How many employees does your business have?",
    type: "number",
    placeholder: "e.g. 12",
    showIf: (a) => a.employmentStatus === "self_employed",
  },

  // --- Retired branch ---
  {
    id: "pensionSource",
    label: "What is your source of pension?",
    type: "text",
    placeholder: "e.g. Government pension, EPF",
    showIf: (a) => a.employmentStatus === "retired",
  },

  // --- Assets & ties ---
  {
    id: "assetsINR",
    label: "What is the approximate total value of your assets in India (₹)?",
    description: "Include property, investments, savings, FDs",
    type: "number",
    placeholder: "e.g. 5000000",
  },
  {
    id: "ownsProperty",
    label: "Do you own property (house/land) in India?",
    type: "bool",
  },
  {
    id: "dependentsInIndia",
    label: "How many dependents do you have in India?",
    description: "Family members who depend on you (spouse, children, parents)",
    type: "number",
    placeholder: "e.g. 3",
    required: true,
    validate: (v) => {
      if (v === undefined || v === null || v === "") return "Please enter a number (0 if none)";
      return null;
    },
  },

  // --- Prior US visa ---
  {
    id: "priorUsVisa",
    label: "Have you applied for a US visa before?",
    type: "bool",
    required: true,
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
  },
  {
    id: "changedSinceRefusal",
    label: "What has changed since your refusal?",
    description: "Describe what's different now — new job, higher income, property, family changes",
    type: "text",
    placeholder: "e.g. I now have a permanent job at TCS with ₹1.2L/month salary and own a flat in Pune",
    showIf: (a) => a.priorUsVisaOutcome === "refused_214b",
    required: true,
  },

  // --- Purpose-specific branches ---
  {
    id: "hospitalName",
    label: "Which hospital will you visit?",
    type: "text",
    placeholder: "e.g. Mayo Clinic, Rochester",
    showIf: (a) => a.purposeOfVisit === "medical",
    required: true,
  },
  {
    id: "appointmentDate",
    label: "Appointment date",
    type: "date",
    showIf: (a) => a.purposeOfVisit === "medical",
  },
  {
    id: "invitingCompany",
    label: "Which company is inviting you?",
    type: "text",
    placeholder: "e.g. Microsoft Corporation",
    showIf: (a) => a.purposeOfVisit === "business" || a.purposeOfVisit === "conference",
    required: true,
  },
  {
    id: "meetingPurpose",
    label: "What is the purpose of the meeting/event?",
    type: "text",
    placeholder: "e.g. Annual partner summit, product launch review",
    showIf: (a) => a.purposeOfVisit === "business" || a.purposeOfVisit === "conference",
  },

  // --- Travel history ---
  {
    id: "internationalTravelHistory",
    label: "Which countries have you visited before?",
    description: "Select all that apply (leave empty if none)",
    type: "country_list",
  },

  // --- US contact ---
  {
    id: "usPointOfContact",
    label: "Do you have a point of contact in the US?",
    description: "Name, relation, and city (leave blank if none)",
    type: "text",
    placeholder: "e.g. Rahul Sharma, cousin, San Francisco",
  },
];

export function getVisibleQuestions(answers: Partial<IntakeAnswers>): IntakeQuestion[] {
  return intakeSchema.filter((q) => !q.showIf || q.showIf(answers));
}
