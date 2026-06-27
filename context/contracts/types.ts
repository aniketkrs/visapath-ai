export type VisaType = "B1_B2" | "F1"; // F1 = v2

export interface IntakeAnswers {
  visaType: VisaType;
  fullName: string;
  dateOfBirth: string;          // ISO
  passportNumber: string;
  passportExpiry: string;       // ISO
  purposeOfVisit: "tourism" | "business" | "medical" | "family_visit" | "conference";
  travelStartDate: string;
  travelDurationDays: number;
  employmentStatus: "salaried" | "self_employed" | "student" | "retired" | "homemaker";
  employerName?: string;
  monthlyIncomeINR?: number;
  yearsAtJob?: number;
  annualTurnoverINR?: number;   // self-employed
  gstRegistered?: boolean;      // self-employed
  businessHeadcount?: number;   // self-employed
  pensionSource?: string;       // retired
  assetsINR?: number;
  ownsProperty?: boolean;
  dependentsInIndia: number;
  priorUsVisa: boolean;
  priorUsVisaOutcome?: "approved" | "refused_214b" | "refused_other";
  changedSinceRefusal?: string; // if refused_214b
  internationalTravelHistory: string[]; // ISO country codes
  usPointOfContact?: { name: string; relation: string; city: string };
  hospitalName?: string;        // medical
  appointmentDate?: string;     // medical
  invitingCompany?: string;     // business
  meetingPurpose?: string;      // business
}

export interface PersonalStatement {
  addressedTo: string;          // "U.S. Consulate General, <city>"
  body: string;                 // 400–500 words
  wordCount: number;
}

export interface ChecklistItem {
  id: string;
  name: string;
  reason: string;               // one line
  whereToGet: string;
  copyType: "original" | "copy" | "both";
  freshnessRule?: string;       // "issued within 3 months"
  category: "identity" | "financial" | "ties" | "purpose" | "travel";
  required: boolean;
}

export interface ScoreSection {
  key: "financial" | "ties" | "history" | "purpose" | "documentation";
  score: number;
  max: number;                  // 20/25/15/20/20
  reason: string;
}

export interface CompletenessScore {
  total: number;                // 0–100
  band: "strong" | "moderate" | "weak";
  sections: ScoreSection[];
  fixes: string[];              // populated when total < 70
}

export interface InterviewQuestion {
  id: string;
  officerPrompt: string;
  intent: "ties" | "finances" | "purpose" | "history" | "consistency";
  suggestedAnswer: string;      // Practice mode only
}

export interface GeneratedPackage {
  statement: PersonalStatement;
  checklist: ChecklistItem[];
  score: CompletenessScore;
  interviewQuestions: InterviewQuestion[];
  generatedAt: string;
}

// Voice interview turn scoring
export interface TurnScore {
  confidence: number;       // 0-100
  consistency: number;      // 0-100
  tiesStrength: number;     // 0-100
  redFlags: string[];
  followUp: string;
}

// Tracker
export interface TrackerState {
  stage: number;            // 1-7
  updatedAt: string;
}

// Handoff record for shared brain
export interface HandoffRecord {
  ts: string;
  agent: string;
  team: "frontend" | "backend" | "meta";
  task: string;
  status: "todo" | "doing" | "blocked" | "done";
  artifacts: string[];
  contractsTouched: string[];
  blockers: string[];
  handoffTo: string[];
  notes: string;
}
