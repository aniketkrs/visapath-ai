"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useVisaStore } from "@/store/useVisaStore";

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

  useEffect(() => {
    // Animate through steps
    const interval = setInterval(() => {
      setCurrentStep((prev) => {
        if (prev < steps.length - 1) return prev + 1;
        return prev;
      });
    }, 2500);

    // Call API
    const generatePackage = async () => {
      setIsGenerating(true);
      try {
        const response = await fetch("/api/generate-package", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(intakeAnswers),
        });

        const pkg = await response.json();
        setGeneratedPackage(pkg);
        
        // Wait for animation to finish, then navigate
        setTimeout(() => {
          setIsGenerating(false);
          router.push("/package");
        }, 2000);
      } catch (err) {
        console.error("Generation failed:", err);
        setError("Generation taking longer than expected...");
        
        // Fallback after error
        setTimeout(() => {
          setIsGenerating(false);
          router.push("/package");
        }, 3000);
      }
    };

    generatePackage();
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="min-h-[calc(100vh-8rem)] flex flex-col items-center justify-center px-4">
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
        <p className="mt-6 text-sm text-[var(--score-moderate)]">{error}</p>
      )}
    </div>
  );
}
