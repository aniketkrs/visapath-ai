"use client";
import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useVisaStore } from "@/store/useVisaStore";
import { Button } from "@/components/ui/Button";

const steps = [
  { text: "Analysing your ties to India", icon: "🇮🇳" },
  { text: "Evaluating financial strength", icon: "💰" },
  { text: "Building your personal statement", icon: "📝" },
  { text: "Preparing your document checklist", icon: "📋" },
  { text: "Computing readiness score", icon: "📊" },
  { text: "Generating interview questions", icon: "🎙️" },
];

export default function GeneratingPage() {
  const router = useRouter();
  const { intakeAnswers, setGeneratedPackage, setIsGenerating } = useVisaStore();
  const [currentStep, setCurrentStep] = useState(0);
  const [error, setError] = useState<string | null>(null);

  const runGeneration = useCallback(() => {
    setError(null);
    setCurrentStep(0);
    setIsGenerating(true);

    const interval = setInterval(() => {
      setCurrentStep((prev) => (prev < steps.length - 1 ? prev + 1 : prev));
    }, 2500);

    const generatePackage = async () => {
      try {
        const response = await fetch("/api/generate-package", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(intakeAnswers),
        });

        if (!response.ok) {
          throw new Error(`Server error (${response.status})`);
        }

        const pkg = await response.json();
        if (!pkg?.statement || !pkg?.checklist) {
          throw new Error("Incomplete package received");
        }

        setGeneratedPackage(pkg);
        setTimeout(() => {
          setIsGenerating(false);
          router.push("/package");
        }, 2000);
      } catch (err) {
        console.error("Generation failed:", err);
        setIsGenerating(false);
        clearInterval(interval);
        setError("Something went wrong while generating your package. Please try again.");
      }
    };

    generatePackage();
    return () => clearInterval(interval);
  }, [intakeAnswers, setGeneratedPackage, setIsGenerating, router]);

  useEffect(() => {
    const cleanup = runGeneration();
    return cleanup;
  }, []);

  return (
    <div className="min-h-[calc(100vh-8rem)] flex flex-col items-center justify-center px-4 animate-fade-in">
      {/* Spinning ring */}
      <div className="relative w-24 h-24 mb-10">
        <div className="absolute inset-0 rounded-full border-2 border-[var(--bg-mid)]" />
        <div className="absolute inset-0 rounded-full border-2 border-t-[var(--trust-blue)] border-r-transparent border-b-transparent border-l-transparent animate-spin-slow" />
        <div className="absolute inset-3 rounded-full border-2 border-t-transparent border-r-[var(--indigo-deep)] border-b-transparent border-l-transparent animate-spin-slow" style={{ animationDirection: "reverse", animationDuration: "2s" }} />
        <div className="absolute inset-0 flex items-center justify-center text-3xl">
          {steps[currentStep]?.icon}
        </div>
      </div>

      {/* Current step text */}
      <h2 className="text-xl font-bold mb-3 animate-fade-in" key={currentStep}>
        {steps[currentStep]?.text}...
      </h2>

      <p className="text-sm text-[var(--text-secondary)] mb-8">
        Creating your personalized visa package
      </p>

      {/* Step indicators */}
      <div className="flex flex-col gap-3 w-full max-w-sm">
        {steps.map((step, i) => (
          <div
            key={i}
            className={`flex items-center gap-3 px-4 py-2 rounded-lg transition-all duration-500 ${
              i < currentStep
                ? "bg-[var(--score-strong)]/10 text-[var(--score-strong)]"
                : i === currentStep
                ? "bg-[var(--trust-blue)]/10 text-[var(--trust-blue)]"
                : "text-[var(--text-secondary)]/40"
            }`}
          >
            <div className="w-5 h-5 flex items-center justify-center">
              {i < currentStep ? (
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                  <polyline points="20 6 9 17 4 12" />
                </svg>
              ) : i === currentStep ? (
                <div className="w-2 h-2 rounded-full bg-current animate-pulse" />
              ) : (
                <div className="w-2 h-2 rounded-full bg-current opacity-30" />
              )}
            </div>
            <span className="text-sm">{step.text}</span>
          </div>
        ))}
      </div>

      {error && (
        <div className="mt-8 text-center animate-fade-in">
          <p className="text-sm text-[var(--score-weak)] mb-4">{error}</p>
          <Button variant="primary" onClick={() => runGeneration()}>
            Try Again
          </Button>
        </div>
      )}
    </div>
  );
}
