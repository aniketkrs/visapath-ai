export type VisaType = "B1_B2" | "F1";

export interface IntakeAnswers {
  visaType: VisaType;
  fullName: string;
  dateOfBirth: string;
  passportNumber: string;
  passportExpiry: string;
  purposeOfVisit: "tourism" | "business" | "medical" | "family_visit" | "conference";
  travelStartDate: string;
  travelDurationDays: number;
  employmentStatus: "salaried" | "self_employed" | "student" | "retired" | "homemaker";
  employerName?: string;
  monthlyIncomeINR?: number;
  yearsAtJob?: number;
  annualTurnoverINR?: number;
  gstRegistered?: boolean;
  businessHeadcount?: number;
  pensionSource?: string;
  assetsINR?: number;
  ownsProperty?: boolean;
  dependentsInIndia: number;
  priorUsVisa: boolean;
  priorUsVisaOutcome?: "approved" | "refused_214b" | "refused_other";
  changedSinceRefusal?: string;
  internationalTravelHistory: string[];
  usPointOfContact?: { name: string; relation: string; city: string };
  hospitalName?: string;
  appointmentDate?: string;
  invitingCompany?: string;
  meetingPurpose?: string;
}

export interface PersonalStatement {
  addressedTo: string;
  body: string;
  wordCount: number;
}

export interface ChecklistItem {
  id: string;
  name: string;
  reason: string;
  whereToGet: string;
  copyType: "original" | "copy" | "both";
  freshnessRule?: string;
  category: "identity" | "financial" | "ties" | "purpose" | "travel";
  required: boolean;
}

export interface ScoreSection {
  key: "financial" | "ties" | "history" | "purpose" | "documentation";
  score: number;
  max: number;
  reason: string;
}

export interface CompletenessScore {
  total: number;
  band: "strong" | "moderate" | "weak";
  sections: ScoreSection[];
  fixes: string[];
}

export interface InterviewQuestion {
  id: string;
  officerPrompt: string;
  intent: "ties" | "finances" | "purpose" | "history" | "consistency";
  suggestedAnswer: string;
}

export interface GeneratedPackage {
  statement: PersonalStatement;
  checklist: ChecklistItem[];
  score: CompletenessScore;
  interviewQuestions: InterviewQuestion[];
  generatedAt: string;
}

export interface TurnScore {
  confidence: number;
  consistency: number;
  tiesStrength: number;
  redFlags: string[];
  followUp: string;
}

export interface TrackerState {
  stage: number;
  updatedAt: string;
}
