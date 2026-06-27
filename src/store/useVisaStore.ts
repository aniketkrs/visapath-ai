"use client";
import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { IntakeAnswers, GeneratedPackage, TrackerState } from "@/lib/types";

interface VisaStore {
  // Intake
  intakeAnswers: Partial<IntakeAnswers>;
  intakeStep: number;
  setIntakeAnswer: (key: string, value: unknown) => void;
  setIntakeStep: (step: number) => void;
  resetIntake: () => void;

  // Package
  generatedPackage: GeneratedPackage | null;
  isGenerating: boolean;
  setGeneratedPackage: (pkg: GeneratedPackage | null) => void;
  setIsGenerating: (v: boolean) => void;

  // Interview
  interviewMode: "practice" | "exam" | "demo";
  setInterviewMode: (mode: "practice" | "exam" | "demo") => void;

  // Tracker
  tracker: TrackerState;
  setTrackerStage: (stage: number) => void;
}

export const useVisaStore = create<VisaStore>()(
  persist(
    (set) => ({
      // Intake defaults
      intakeAnswers: { visaType: "B1_B2", internationalTravelHistory: [] },
      intakeStep: 0,
      setIntakeAnswer: (key, value) =>
        set((s) => ({
          intakeAnswers: { ...s.intakeAnswers, [key]: value },
        })),
      setIntakeStep: (step) => set({ intakeStep: step }),
      resetIntake: () =>
        set({
          intakeAnswers: { visaType: "B1_B2", internationalTravelHistory: [] },
          intakeStep: 0,
        }),

      // Package
      generatedPackage: null,
      isGenerating: false,
      setGeneratedPackage: (pkg) => set({ generatedPackage: pkg }),
      setIsGenerating: (v) => set({ isGenerating: v }),

      // Interview
      interviewMode: "practice",
      setInterviewMode: (mode) => set({ interviewMode: mode }),

      // Tracker
      tracker: { stage: 1, updatedAt: new Date().toISOString() },
      setTrackerStage: (stage) =>
        set({ tracker: { stage, updatedAt: new Date().toISOString() } }),
    }),
    {
      name: "visapath-store",
    }
  )
);
