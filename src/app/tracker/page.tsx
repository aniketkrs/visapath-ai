"use client";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Stepper } from "@/components/ui/Stepper";
import { useVisaStore } from "@/store/useVisaStore";
import { useRouter } from "next/navigation";

const STEPS = [
  "Package Generated",
  "Documents Collected",
  "DS-160 Completed",
  "Fee Paid",
  "Appointment Booked",
  "Interview Done",
  "Visa Received",
];

const DESCRIPTIONS = [
  "Your personalized visa package has been generated with statement, checklist, and readiness score.",
  "Gather all documents from your checklist. Get originals and copies as specified.",
  "Complete the DS-160 online application form at ceac.state.gov.",
  "Pay the visa application fee (MRV fee) at the designated bank.",
  "Schedule your interview appointment at the US Embassy/Consulate.",
  "Attend your interview at the consulate. Bring all documents.",
  "Congratulations! Your visa has been approved and stamped.",
];

const STAGE_ICONS = ["📦", "📁", "📝", "💳", "📅", "🎤", "✅"];

const STAGE_INSTRUCTIONS: Record<number, { instructions: string[]; documents: string[]; nextStep: string }> = {
  1: {
    instructions: [
      "Review your personalized statement and make any edits needed",
      "Go through your document checklist and note what you already have",
      "Practice your mock interview to build confidence",
    ],
    documents: [],
    nextStep: "Start gathering the documents from your checklist. Check each item as you collect it.",
  },
  2: {
    instructions: [
      "Collect every document listed in your checklist",
      "Get both originals and photocopies where specified",
      "Check freshness rules — some documents must be recent (e.g., bank statements within 30 days)",
    ],
    documents: [
      "Passport (original + photocopy of bio page)",
      "Bank statements (last 6 months, stamped by bank)",
      "Employment letter on company letterhead",
      "Property documents (if applicable)",
      "Previous passport with travel stamps (if any)",
    ],
    nextStep: "Fill out the DS-160 form online at ceac.state.gov. Have your passport and package statement ready.",
  },
  3: {
    instructions: [
      "Go to ceac.state.gov and start a new DS-160 application",
      "Fill in all details exactly as in your passport",
      "Use your personalized statement for the purpose-of-visit section",
      "Upload a compliant photo (white background, 2x2 inches)",
      "Save and print the confirmation page with barcode",
    ],
    documents: [
      "DS-160 confirmation page (print this)",
      "Passport",
      "Digital photo (white background, 600x600 px minimum)",
      "Your VisaPath statement (for reference)",
    ],
    nextStep: "Pay the MRV visa application fee. The current fee is $185 (approx ₹15,500).",
  },
  4: {
    instructions: [
      "Pay the MRV fee at an authorized bank (HDFC Bank or via NEFT)",
      "Keep the receipt number — you need it to book your appointment",
      "Payment may take up to 2 business days to reflect in the system",
    ],
    documents: [
      "MRV fee payment receipt",
      "DS-160 confirmation page",
    ],
    nextStep: "Book your interview slot at ustraveldocs.com. Use your MRV receipt number.",
  },
  5: {
    instructions: [
      "Go to ustraveldocs.com and log in with your MRV receipt number",
      "Select your preferred embassy/consulate (New Delhi, Mumbai, Chennai, Hyderabad, or Kolkata)",
      "Choose an available date and time slot",
      "Print the appointment confirmation letter",
    ],
    documents: [
      "Appointment confirmation letter (print this)",
      "DS-160 confirmation page",
      "MRV fee receipt",
      "Passport",
    ],
    nextStep: "Attend your interview. Arrive 15 minutes early. Bring ALL documents from your checklist.",
  },
  6: {
    instructions: [
      "Arrive at the consulate 15 minutes before your appointment",
      "Carry all documents in a clear folder — originals and copies separately",
      "Answer confidently and concisely — just like you practiced",
      "The officer may approve, refuse, or request additional documents (221g)",
    ],
    documents: [
      "Passport",
      "DS-160 confirmation page",
      "Appointment confirmation letter",
      "All checklist documents (originals + copies)",
      "Your VisaPath statement (for reference, not to show the officer)",
    ],
    nextStep: "If approved, your passport will be delivered via courier in 3-5 business days with the visa stamp.",
  },
};

export default function TrackerPage() {
  const router = useRouter();
  const { tracker, setTrackerStage } = useVisaStore();
  const [hasError, setHasError] = useState(false);

  useEffect(() => {
    const handler = (e: ErrorEvent) => {
      e.preventDefault();
      setHasError(true);
    };
    window.addEventListener("error", handler);
    return () => window.removeEventListener("error", handler);
  }, []);

  const safeStage = Math.max(1, Math.min(tracker.stage, STEPS.length));
  const progress = Math.round(((safeStage - 1) / (STEPS.length - 1)) * 100);
  const isLastStage = safeStage >= STEPS.length;

  const handleStepClick = (step: number) => {
    if (step <= safeStage) return;
    setTrackerStage(step);
  };

  const stageData = STAGE_INSTRUCTIONS[safeStage];

  if (hasError) {
    return (
      <div className="min-h-[calc(100vh-8rem)] flex flex-col items-center justify-center px-4 text-center">
        <div className="w-16 h-16 rounded-full bg-[var(--bg-mid)] flex items-center justify-center mb-6 text-3xl">⚠️</div>
        <h2 className="text-2xl font-bold mb-2">Something went wrong</h2>
        <p className="text-[var(--text-secondary)] mb-8 max-w-sm">We hit an error loading your tracker.</p>
        <Button variant="primary" onClick={() => { setHasError(false); window.location.reload(); }}>Try Again</Button>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto px-4 py-10">
      <div className="text-center mb-10 animate-fade-in">
        <h1 className="text-3xl font-bold mb-2">Visa Journey Tracker</h1>
        <p className="text-[var(--text-secondary)]">
          Track every step from package to passport stamp
        </p>
      </div>

      <div className="grid gap-8 lg:grid-cols-[1fr_1.2fr]">
        {/* Stepper */}
        <Card className="animate-slide-up">
          <h2 className="text-sm font-semibold text-[var(--text-secondary)] uppercase tracking-wider mb-6">
            Progress
          </h2>
          <Stepper
            steps={STEPS}
            currentStep={safeStage}
            onStepClick={handleStepClick}
          />
        </Card>

        {/* Stage detail */}
        <div className="flex flex-col gap-6">
          <Card className="animate-slide-up" style={{ animationDelay: "0.1s" }}>
            <div className="flex items-start gap-4 mb-4">
              <span className="text-3xl">{STAGE_ICONS[safeStage - 1]}</span>
              <div>
                <p className="text-xs text-[var(--trust-blue)] font-semibold uppercase tracking-wider mb-1">
                  Stage {safeStage} of {STEPS.length}
                </p>
                <h3 className="text-xl font-bold">{STEPS[safeStage - 1]}</h3>
              </div>
            </div>
            <p className="text-[var(--text-bright)] text-sm leading-relaxed mb-5">
              {DESCRIPTIONS[safeStage - 1]}
            </p>
            {safeStage > 1 && (
              <p className="text-xs text-[var(--text-secondary)]">
                Last updated: {new Date(tracker.updatedAt).toLocaleDateString("en-US", {
                  year: "numeric",
                  month: "short",
                  day: "numeric",
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </p>
            )}
          </Card>

          {/* Instructions for this stage */}
          {stageData && stageData.instructions.length > 0 && (
            <Card className="animate-slide-up" style={{ animationDelay: "0.12s" }}>
              <h3 className="text-sm font-semibold text-[var(--text-secondary)] uppercase tracking-wider mb-4">
                What to do
              </h3>
              <ul className="space-y-2.5">
                {stageData.instructions.map((instruction, i) => (
                  <li key={i} className="flex items-start gap-3">
                    <span className="w-5 h-5 rounded-full bg-[var(--trust-blue)]/10 text-[var(--trust-blue)] text-[11px] font-bold flex items-center justify-center shrink-0 mt-0.5">
                      {i + 1}
                    </span>
                    <span className="text-sm text-[var(--text-bright)]">{instruction}</span>
                  </li>
                ))}
              </ul>
            </Card>
          )}

          {/* Documents needed for this stage */}
          {stageData && stageData.documents.length > 0 && (
            <Card className="animate-slide-up" style={{ animationDelay: "0.14s" }}>
              <h3 className="text-sm font-semibold text-[var(--text-secondary)] uppercase tracking-wider mb-4">
                Documents needed
              </h3>
              <ul className="space-y-2">
                {stageData.documents.map((doc, i) => (
                  <li key={i} className="flex items-start gap-2.5">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="var(--trust-blue)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="shrink-0 mt-0.5">
                      <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" />
                      <polyline points="14 2 14 8 20 8" />
                    </svg>
                    <span className="text-sm text-[var(--text-bright)]">{doc}</span>
                  </li>
                ))}
              </ul>
            </Card>
          )}

          {/* What's next */}
          {stageData && !isLastStage && (
            <Card className="animate-slide-up border-l-2 !border-l-[var(--score-strong)]" style={{ animationDelay: "0.16s" }}>
              <h3 className="text-sm font-semibold text-[var(--score-strong)] uppercase tracking-wider mb-2">
                What&apos;s next
              </h3>
              <p className="text-sm text-[var(--text-bright)] leading-relaxed">
                {stageData.nextStep}
              </p>
            </Card>
          )}

          {/* Completed stages summary */}
          {safeStage > 1 && (
            <Card className="animate-slide-up" style={{ animationDelay: "0.15s" }}>
              <h3 className="text-sm font-semibold text-[var(--text-secondary)] uppercase tracking-wider mb-4">
                Completed
              </h3>
              <div className="flex flex-col gap-2.5">
                {STEPS.slice(0, safeStage - 1).map((step, i) => (
                  <div key={i} className="flex items-center gap-3">
                    <svg
                      width="16"
                      height="16"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="var(--score-strong)"
                      strokeWidth="3"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <polyline points="20 6 9 17 4 12" />
                    </svg>
                    <span className="text-sm text-[var(--score-strong)]">{step}</span>
                  </div>
                ))}
              </div>
            </Card>
          )}

          {/* Actions */}
          <div className="flex flex-col gap-3 animate-slide-up" style={{ animationDelay: "0.2s" }}>
            {!isLastStage && (
              <Button
                variant="primary"
                size="lg"
                className="w-full"
                onClick={() => setTrackerStage(Math.min(safeStage + 1, STEPS.length))}
              >
                Advance to Next Step
                <svg
                  width="18"
                  height="18"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="ml-2"
                >
                  <polyline points="9 18 15 12 9 6" />
                </svg>
              </Button>
            )}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <Button variant="secondary" onClick={() => router.push("/package")}>
                Back to Package
              </Button>
              <Button variant="secondary" onClick={() => router.push("/interview")}>
                Start Mock Interview
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom progress bar */}
      <div className="fixed bottom-0 left-0 right-0 z-40 bg-[var(--bg-surface)]/90 backdrop-blur-md border-t border-[var(--border)]">
        <div className="max-w-3xl mx-auto px-4 py-3 flex items-center gap-4">
          <span className="text-xs text-[var(--text-secondary)] whitespace-nowrap font-medium">
            {progress}% Complete
          </span>
          <div className="flex-1 h-2 bg-[var(--bg-mid)] rounded-full overflow-hidden">
            <div
              className="h-full rounded-full transition-all duration-700 ease-out"
              style={{
                width: `${progress}%`,
                background: `linear-gradient(90deg, var(--trust-blue), var(--indigo-deep))`,
              }}
            />
          </div>
          <span className="text-xs text-[var(--text-secondary)] whitespace-nowrap">
            {safeStage}/{STEPS.length} stages
          </span>
        </div>
      </div>
    </div>
  );
}
