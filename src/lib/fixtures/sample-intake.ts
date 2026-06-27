import type { IntakeAnswers } from "@/lib/types";

export const sampleIntake: IntakeAnswers = {
  visaType: "B1_B2",
  fullName: "Priya Sharma",
  dateOfBirth: "1997-03-15",
  passportNumber: "J8369854",
  passportExpiry: "2031-06-20",
  purposeOfVisit: "business",
  travelStartDate: "2026-09-15",
  travelDurationDays: 14,
  employmentStatus: "salaried",
  employerName: "Tata Consultancy Services",
  monthlyIncomeINR: 120000,
  yearsAtJob: 3,
  assetsINR: 8500000,
  ownsProperty: true,
  dependentsInIndia: 1,
  priorUsVisa: false,
  internationalTravelHistory: ["SG", "GB"],
  usPointOfContact: { name: "John Smith", relation: "Business partner", city: "Seattle" },
  invitingCompany: "Microsoft Corporation",
  meetingPurpose: "Annual Technology Partner Summit",
};
