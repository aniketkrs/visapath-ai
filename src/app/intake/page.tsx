"use client";
import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { useVisaStore } from "@/store/useVisaStore";
import { intakeSchema, getVisibleQuestions, getSectionForQuestion, INTAKE_SECTIONS } from "@/lib/intake/schema";
import type { IntakeAnswers } from "@/lib/types";

const COUNTRIES = [
  "US", "UK", "CA", "AU", "DE", "FR", "SG", "AE", "JP", "TH", "MY", "NZ",
  "IT", "ES", "NL", "CH", "SE", "KR", "HK", "SA", "QA", "CN", "BR", "ZA",
];
const COUNTRY_NAMES: Record<string, string> = {
  US: "🇺🇸 United States", UK: "🇬🇧 United Kingdom", CA: "🇨🇦 Canada",
  AU: "🇦🇺 Australia", DE: "🇩🇪 Germany", FR: "🇫🇷 France", SG: "🇸🇬 Singapore",
  AE: "🇦🇪 UAE", JP: "🇯🇵 Japan", TH: "🇹🇭 Thailand", MY: "🇲🇾 Malaysia",
  NZ: "🇳🇿 New Zealand", IT: "🇮🇹 Italy", ES: "🇪🇸 Spain", NL: "🇳🇿 Netherlands",
  CH: "🇨🇭 Switzerland", SE: "🇸🇪 Sweden", KR: "🇰🇷 South Korea", HK: "🇭🇰 Hong Kong",
  SA: "🇸🇦 Saudi Arabia", QA: "🇶🇦 Qatar", CN: "🇨🇳 China", BR: "🇧🇷 Brazil",
  ZA: "🇿🇦 South Africa",
};

export default function IntakePage() {
  const router = useRouter();
  const { intakeAnswers, intakeStep, setIntakeAnswer, setIntakeStep } = useVisaStore();
  const [error, setError] = useState<string | null>(null);

  const visibleQuestions = getVisibleQuestions(intakeAnswers);
  const currentQuestion = visibleQuestions[intakeStep];
  const totalSteps = visibleQuestions.length;
  const progress = totalSteps > 0 ? ((intakeStep + 1) / totalSteps) * 100 : 0;

  const sectionInfo = getSectionForQuestion(visibleQuestions, intakeStep);
  const visibleSections = INTAKE_SECTIONS.filter((s) =>
    visibleQuestions.some((q) => q.section === s.id)
  );

  const getCurrentValue = useCallback(() => {
    if (!currentQuestion) return "";
    const key = currentQuestion.id as keyof IntakeAnswers;

    if (key === "usPointOfContact") {
      const poc = intakeAnswers.usPointOfContact;
      return poc ? `${poc.name}, ${poc.relation}, ${poc.city}` : "";
    }

    const val = intakeAnswers[key as keyof typeof intakeAnswers];
    if (val === undefined || val === null) return "";
    if (typeof val === "boolean") return val;
    return val;
  }, [currentQuestion, intakeAnswers]);

  const handleChange = (value: unknown) => {
    if (!currentQuestion) return;
    setError(null);

    if (currentQuestion.id === "usPointOfContact" && typeof value === "string") {
      const parts = (value as string).split(",").map((s) => s.trim());
      if (parts.length >= 3) {
        setIntakeAnswer("usPointOfContact", {
          name: parts[0],
          relation: parts[1],
          city: parts[2],
        });
      } else {
        setIntakeAnswer("usPointOfContact", value ? { name: value, relation: "", city: "" } : undefined);
      }
      return;
    }

    setIntakeAnswer(currentQuestion.id, value);
  };

  const handleNext = () => {
    if (!currentQuestion) return;

    if (currentQuestion.validate) {
      const err = currentQuestion.validate(getCurrentValue(), intakeAnswers);
      if (err) {
        setError(err);
        return;
      }
    }

    if (currentQuestion.required) {
      const val = getCurrentValue();
      if (val === "" || val === undefined || val === null) {
        setError("This field is required");
        return;
      }
    }

    setError(null);
    if (intakeStep < totalSteps - 1) {
      setIntakeStep(intakeStep + 1);
    } else {
      router.push("/generating");
    }
  };

  const handleBack = () => {
    if (intakeStep > 0) {
      setError(null);
      setIntakeStep(intakeStep - 1);
    } else {
      router.push("/select");
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && currentQuestion?.type !== "country_list") {
      e.preventDefault();
      handleNext();
    }
  };

  if (!currentQuestion) {
    return (
      <div className="max-w-lg mx-auto px-4 py-12">
        <div className="space-y-3 mb-8">
          <div className="h-1.5 shimmer-bg rounded-full" />
        </div>
        <div className="rounded-2xl border border-[var(--border)] p-6 space-y-4">
          <div className="h-6 w-48 shimmer-bg rounded-lg" />
          <div className="h-4 w-72 shimmer-bg rounded-lg" />
          <div className="h-12 shimmer-bg rounded-xl mt-4" />
        </div>
        <div className="flex justify-between items-center mt-6">
          <div className="h-10 w-20 shimmer-bg rounded-xl" />
          <div className="h-10 w-24 shimmer-bg rounded-xl" />
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-lg mx-auto px-4 py-8" onKeyDown={handleKeyDown}>
      {/* Section progress indicator */}
      {sectionInfo && (
        <div className="mb-6 animate-fade-in">
          <div className="flex items-center gap-2 mb-3">
            {visibleSections.map((s, i) => {
              const isActive = i === sectionInfo.sectionIndex;
              const isComplete = i < sectionInfo.sectionIndex;
              return (
                <div key={s.id} className="flex items-center gap-2 flex-1">
                  <div
                    className={`h-1.5 flex-1 rounded-full transition-all duration-500 ${
                      isActive
                        ? "bg-gradient-to-r from-[var(--trust-blue)] to-[var(--indigo-deep)]"
                        : isComplete
                          ? "bg-[var(--score-strong)]"
                          : "bg-[var(--bg-mid)]"
                    }`}
                  />
                </div>
              );
            })}
          </div>
          <div className="flex justify-between items-center">
            <span className="text-xs font-semibold text-[var(--trust-blue)]">
              Step {sectionInfo.sectionIndex + 1} of {visibleSections.length}: {sectionInfo.sectionMeta.title}
            </span>
            <span className="text-xs text-[var(--text-secondary)]">
              Question {intakeStep + 1} of {totalSteps}
            </span>
          </div>
        </div>
      )}

      {/* Section header (only on first question of each section) */}
      {sectionInfo?.isFirstInSection && (
        <div className="mb-4 animate-slide-up">
          <Card className="!p-4 border-l-2 !border-l-[var(--trust-blue)] bg-[var(--trust-blue)]/5">
            <h3 className="text-sm font-bold text-[var(--text-primary)] mb-1">
              {sectionInfo.sectionMeta.title}
            </h3>
            <p className="text-xs text-[var(--text-secondary)]">
              {sectionInfo.sectionMeta.subtitle}
            </p>
          </Card>
        </div>
      )}

      {/* Question card */}
      <Card className="animate-fade-in mb-6">
        <h2 className="text-xl font-bold mb-2">{currentQuestion.label}</h2>
        {currentQuestion.description && (
          <p className="text-sm text-[var(--text-secondary)] mb-4">
            {currentQuestion.description}
          </p>
        )}
        {currentQuestion.whyItMatters && (
          <div className="flex items-start gap-2 mb-5 p-3 rounded-lg bg-[var(--bg-mid)]">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="var(--trust-blue)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="shrink-0 mt-0.5">
              <circle cx="12" cy="12" r="10" />
              <path d="M12 16v-4" />
              <path d="M12 8h.01" />
            </svg>
            <span className="text-xs text-[var(--text-secondary)] leading-relaxed">
              {currentQuestion.whyItMatters}
            </span>
          </div>
        )}

        {/* Input rendering */}
        <div className="mt-2">
          {currentQuestion.type === "text" && (
            <input
              type="text"
              value={(getCurrentValue() as string) || ""}
              onChange={(e) => handleChange(e.target.value)}
              placeholder={currentQuestion.placeholder}
              autoFocus
              className="w-full bg-[var(--bg-mid)] border border-[var(--border)] rounded-xl px-4 py-3 text-[var(--text-primary)] placeholder:text-[var(--text-secondary)]/50 focus:outline-none focus:ring-2 focus:ring-[var(--trust-blue)] focus:border-transparent transition-all"
            />
          )}

          {currentQuestion.type === "number" && (
            <input
              type="number"
              value={(getCurrentValue() as number) ?? ""}
              onChange={(e) => handleChange(e.target.value === "" ? "" : Number(e.target.value))}
              placeholder={currentQuestion.placeholder}
              autoFocus
              className="w-full bg-[var(--bg-mid)] border border-[var(--border)] rounded-xl px-4 py-3 text-[var(--text-primary)] placeholder:text-[var(--text-secondary)]/50 focus:outline-none focus:ring-2 focus:ring-[var(--trust-blue)] focus:border-transparent transition-all"
            />
          )}

          {currentQuestion.type === "date" && (
            <input
              type="date"
              value={(getCurrentValue() as string) || ""}
              onChange={(e) => handleChange(e.target.value)}
              autoFocus
              className="w-full bg-[var(--bg-mid)] border border-[var(--border)] rounded-xl px-4 py-3 text-[var(--text-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--trust-blue)] focus:border-transparent transition-all [color-scheme:dark]"
            />
          )}

          {currentQuestion.type === "select" && (
            <div className="grid gap-2">
              {currentQuestion.options?.map((opt) => (
                <button
                  key={opt.value}
                  onClick={() => handleChange(opt.value)}
                  className={`text-left px-4 py-3 rounded-xl border transition-all duration-200 ${
                    getCurrentValue() === opt.value
                      ? "bg-[var(--trust-blue)]/10 border-[var(--trust-blue)] text-[var(--text-primary)]"
                      : "bg-[var(--bg-mid)] border-[var(--border)] text-[var(--text-secondary)] hover:bg-[var(--bg-elevated)] hover:border-[var(--border-light)]"
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          )}

          {currentQuestion.type === "bool" && (
            <div className="grid grid-cols-2 gap-3">
              {[
                { value: true, label: "Yes" },
                { value: false, label: "No" },
              ].map((opt) => (
                <button
                  key={String(opt.value)}
                  onClick={() => handleChange(opt.value)}
                  className={`px-6 py-4 rounded-xl border text-center font-medium transition-all duration-200 ${
                    getCurrentValue() === opt.value
                      ? "bg-[var(--trust-blue)]/10 border-[var(--trust-blue)] text-[var(--text-primary)]"
                      : "bg-[var(--bg-mid)] border-[var(--border)] text-[var(--text-secondary)] hover:bg-[var(--bg-elevated)]"
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          )}

          {currentQuestion.type === "country_list" && (
            <div className="grid grid-cols-2 gap-2 max-h-64 overflow-y-auto pr-2">
              {COUNTRIES.map((code) => {
                const selected = (intakeAnswers.internationalTravelHistory || []).includes(code);
                return (
                  <button
                    key={code}
                    onClick={() => {
                      const current = intakeAnswers.internationalTravelHistory || [];
                      const updated = selected
                        ? current.filter((c) => c !== code)
                        : [...current, code];
                      setIntakeAnswer("internationalTravelHistory", updated);
                    }}
                    className={`text-left px-3 py-2 rounded-lg text-sm border transition-all ${
                      selected
                        ? "bg-[var(--trust-blue)]/10 border-[var(--trust-blue)] text-[var(--text-primary)]"
                        : "bg-[var(--bg-mid)] border-[var(--border)] text-[var(--text-secondary)] hover:bg-[var(--bg-elevated)]"
                    }`}
                  >
                    {COUNTRY_NAMES[code] || code}
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {/* Error */}
        {error && (
          <p className="mt-3 text-sm text-[var(--score-weak)] flex items-center gap-2">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="12" cy="12" r="10" />
              <line x1="12" y1="8" x2="12" y2="12" />
              <line x1="12" y1="16" x2="12.01" y2="16" />
            </svg>
            {error}
          </p>
        )}
      </Card>

      {/* Navigation */}
      <div className="flex flex-col sm:flex-row justify-between items-center gap-3">
        <Button variant="ghost" onClick={handleBack}>
          {intakeStep === 0 ? "← Change Visa Type" : "← Back"}
        </Button>
        <Button onClick={handleNext}>
          {intakeStep === totalSteps - 1 ? "Generate Package →" : "Next →"}
        </Button>
      </div>

      {/* Keyboard hint */}
      <p className="text-center text-xs text-[var(--text-secondary)] mt-4">
        Press Enter to continue
      </p>
    </div>
  );
}
