import type { IntakeAnswers, CompletenessScore, ScoreSection } from "@/lib/types";

/**
 * Deterministic completeness scoring — Technical PRD §8
 * The LLM writes the per-section reason text; this function computes the numbers.
 * Max: financial(20) + ties(25) + history(15) + purpose(20) + documentation(20) = 100
 */
export function computeScore(answers: Partial<IntakeAnswers>): CompletenessScore {
  const sections: ScoreSection[] = [];
  const fixes: string[] = [];

  // --- Financial Strength (max 20) ---
  let financial = 0;
  const income = answers.monthlyIncomeINR || 0;
  const turnover = answers.annualTurnoverINR || 0;
  const assets = answers.assetsINR || 0;
  const tripCostEstimate = (answers.travelDurationDays || 14) * 15000; // rough ₹15k/day

  const yearlyIncome = answers.employmentStatus === "self_employed" ? turnover : income * 12;
  if (yearlyIncome > tripCostEstimate * 3) financial = 20;
  else if (yearlyIncome > tripCostEstimate * 1.5) financial = 14;
  else if (yearlyIncome > tripCostEstimate * 0.5) financial = 8;
  else financial = 3;

  if (assets > 2000000) financial = Math.min(20, financial + 2);

  let financialReason = `Annual income ₹${(yearlyIncome).toLocaleString("en-IN")} vs estimated trip cost ₹${tripCostEstimate.toLocaleString("en-IN")}.`;
  if (financial < 14) {
    fixes.push("Strengthen financial proof: add FD certificates, property valuation, or investment portfolio statements.");
    financialReason += " Consider adding more financial documentation.";
  }

  sections.push({ key: "financial", score: Math.min(financial, 20), max: 20, reason: financialReason });

  // --- Ties to India (max 25) ---
  let ties = 0;
  if (answers.employmentStatus === "salaried" || answers.employmentStatus === "self_employed") ties += 8;
  if (answers.yearsAtJob && answers.yearsAtJob >= 2) ties += 3;
  if ((answers.dependentsInIndia || 0) >= 1) ties += 5;
  if ((answers.dependentsInIndia || 0) >= 3) ties += 2;
  if (answers.ownsProperty) ties += 5;
  if (answers.assetsINR && answers.assetsINR > 1000000) ties += 2;

  let tiesReason = `Employment: ${answers.employmentStatus || "unknown"}, ${answers.dependentsInIndia || 0} dependents, property: ${answers.ownsProperty ? "yes" : "no"}.`;
  if (ties < 15) {
    fixes.push("Provide stronger evidence of ties: property papers, family photos, employer NOC with return date.");
    tiesReason += " Ties evidence needs strengthening.";
  }

  sections.push({ key: "ties", score: Math.min(ties, 25), max: 25, reason: tiesReason });

  // --- Travel/Visa History (max 15) ---
  let history = 5; // baseline
  const travelCount = answers.internationalTravelHistory?.length || 0;
  if (travelCount >= 3) history += 5;
  else if (travelCount >= 1) history += 3;
  if (answers.priorUsVisaOutcome === "approved") history += 5;
  if (answers.priorUsVisaOutcome === "refused_214b") history -= 5;
  if (answers.priorUsVisaOutcome === "refused_other") history -= 3;

  let historyReason = `${travelCount} countries visited. Prior US visa: ${answers.priorUsVisa ? answers.priorUsVisaOutcome || "unknown" : "none"}.`;
  if (history < 8) {
    fixes.push("If you have any previous travel stamps or approved visas, prepare copies as evidence.");
  }

  sections.push({ key: "history", score: Math.max(0, Math.min(history, 15)), max: 15, reason: historyReason });

  // --- Purpose Clarity (max 20) ---
  let purpose = 5;
  if (answers.purposeOfVisit) purpose += 5;
  if (answers.travelStartDate && answers.travelDurationDays) purpose += 5;
  if (answers.purposeOfVisit === "business" && answers.invitingCompany) purpose += 5;
  else if (answers.purposeOfVisit === "medical" && answers.hospitalName) purpose += 5;
  else if (answers.purposeOfVisit === "tourism") purpose += 3;
  else if (answers.usPointOfContact) purpose += 3;

  let purposeReason = `Purpose: ${answers.purposeOfVisit || "not specified"}, duration: ${answers.travelDurationDays || "?"} days.`;
  if (purpose < 15) {
    fixes.push("Add a specific itinerary: dates, cities, purpose for each leg of the trip.");
  }

  sections.push({ key: "purpose", score: Math.min(purpose, 20), max: 20, reason: purposeReason });

  // --- Documentation Completeness (max 20) ---
  let docs = 8; // baseline for having filled the intake
  if (answers.passportNumber && answers.passportExpiry) docs += 4;
  if (answers.employmentStatus === "salaried" && answers.employerName && answers.monthlyIncomeINR) docs += 4;
  if (answers.employmentStatus === "self_employed" && answers.annualTurnoverINR) docs += 4;
  if (answers.employmentStatus === "retired" && answers.pensionSource) docs += 4;
  if (answers.fullName && answers.dateOfBirth) docs += 4;

  const docsReason = `Profile completeness based on intake answers provided.`;
  if (docs < 16) {
    fixes.push("Complete all intake fields to improve your documentation score.");
  }

  sections.push({ key: "documentation", score: Math.min(docs, 20), max: 20, reason: docsReason });

  // --- Compute total ---
  const total = sections.reduce((sum, s) => sum + s.score, 0);
  const band: "strong" | "moderate" | "weak" = total >= 80 ? "strong" : total >= 60 ? "moderate" : "weak";

  if (total < 50) {
    fixes.unshift("Your profile needs significant strengthening before applying. Address all items below.");
  }

  return { total, band, sections, fixes };
}
