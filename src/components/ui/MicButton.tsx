"use client";
import React from "react";

interface MicButtonProps {
  status: "idle" | "listening" | "officer";
  onClick?: () => void;
  disabled?: boolean;
  size?: number;
}

export function MicButton({ status, onClick, disabled = false, size = 80 }: MicButtonProps) {
  const colors: Record<string, string> = {
    idle: "var(--trust-blue)",
    listening: "var(--score-strong)",
    officer: "var(--score-weak)",
  };

  const labels: Record<string, string> = {
    idle: "Tap to speak",
    listening: "Listening...",
    officer: "Officer speaking",
  };

  const bgColor = colors[status];
  const animClass = status === "listening" ? "animate-mic-pulse" : "";

  return (
    <div className="flex flex-col items-center gap-3">
      <button
        onClick={onClick}
        disabled={disabled}
        className={`
          rounded-full flex items-center justify-center transition-all duration-300
          disabled:opacity-40 disabled:cursor-not-allowed
          ${animClass}
        `}
        style={{
          width: size,
          height: size,
          backgroundColor: bgColor,
          boxShadow: `0 0 20px ${bgColor}40`,
        }}
      >
        {status === "officer" ? (
          /* Speaker icon */
          <svg width={size * 0.4} height={size * 0.4} viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" />
            <path d="M15.54 8.46a5 5 0 0 1 0 7.07" />
            <path d="M19.07 4.93a10 10 0 0 1 0 14.14" />
          </svg>
        ) : (
          /* Mic icon */
          <svg width={size * 0.4} height={size * 0.4} viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <rect x="9" y="2" width="6" height="11" rx="3" />
            <path d="M5 10a7 7 0 0 0 14 0" />
            <line x1="12" y1="19" x2="12" y2="22" />
            <line x1="8" y1="22" x2="16" y2="22" />
          </svg>
        )}
      </button>
      <span
        className="text-xs font-medium"
        style={{ color: bgColor }}
      >
        {labels[status]}
      </span>
    </div>
  );
}
