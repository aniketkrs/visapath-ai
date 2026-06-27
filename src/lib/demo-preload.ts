"use client";
import { useVisaStore } from "@/store/useVisaStore";
import { sampleIntake } from "@/lib/fixtures/sample-intake";
import { samplePackage } from "@/lib/fixtures/sample-package";

export function preloadDemo() {
  const store = useVisaStore.getState();

  // Load all intake fields
  for (const [key, value] of Object.entries(sampleIntake)) {
    if (value !== undefined) {
      store.setIntakeAnswer(key, value);
    }
  }

  // Set the generated package
  store.setGeneratedPackage(samplePackage);

  // Advance tracker to package-ready stage
  store.setTrackerStage(4);
}
