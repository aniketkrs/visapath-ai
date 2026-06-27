"use client";
import React from "react";

interface StepperProps {
  steps: string[];
  currentStep: number;
  onStepClick?: (step: number) => void;
}

export function Stepper({ steps, currentStep, onStepClick }: StepperProps) {
  return (
    <div className="flex flex-col gap-0">
      {steps.map((label, i) => {
        const stepNum = i + 1;
        const isActive = stepNum === currentStep;
        const isDone = stepNum < currentStep;
        const isFuture = stepNum > currentStep;

        return (
          <div key={i} className="flex items-start gap-4">
            {/* Connector + Circle */}
            <div className="flex flex-col items-center">
              <button
                onClick={() => onStepClick?.(stepNum)}
                className={`
                  w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold
                  transition-all duration-300 shrink-0
                  ${isDone
                    ? "bg-[var(--score-strong)] text-white"
                    : isActive
                    ? "bg-[var(--trust-blue)] text-white shadow-lg animate-pulse-glow"
                    : "bg-[var(--bg-mid)] text-[var(--text-secondary)] border border-[var(--border)]"
                  }
                `}
              >
                {isDone ? (
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="20 6 9 17 4 12" />
                  </svg>
                ) : (
                  stepNum
                )}
              </button>
              {/* Connector line */}
              {i < steps.length - 1 && (
                <div
                  className={`w-0.5 h-10 transition-colors duration-300 ${
                    isDone ? "bg-[var(--score-strong)]" : "bg-[var(--border)]"
                  }`}
                />
              )}
            </div>
            {/* Label */}
            <div className="pt-1.5">
              <span
                className={`text-sm font-medium transition-colors duration-300 ${
                  isActive
                    ? "text-[var(--text-primary)]"
                    : isDone
                    ? "text-[var(--score-strong)]"
                    : "text-[var(--text-secondary)]"
                } ${isFuture ? "opacity-50" : ""}`}
              >
                {label}
              </span>
            </div>
          </div>
        );
      })}
    </div>
  );
}
