"use client";
import React from "react";

interface CardProps {
  children: React.ReactNode;
  className?: string;
  hover?: boolean;
  onClick?: () => void;
  style?: React.CSSProperties;
}

export function Card({ children, className = "", hover = false, onClick, style }: CardProps) {
  return (
    <div
      onClick={onClick}
      style={style}
      className={`
        bg-[var(--bg-surface)] border border-[var(--border)] rounded-xl p-6
        ${hover ? "cursor-pointer hover:bg-[var(--bg-elevated)] hover:border-[var(--border-light)] hover:shadow-[var(--shadow-card)] hover:-translate-y-0.5 transition-all duration-200" : ""}
        ${onClick ? "cursor-pointer" : ""}
        ${className}
      `}
    >
      {children}
    </div>
  );
}
