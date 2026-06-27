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
