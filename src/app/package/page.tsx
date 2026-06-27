"use client";
import { useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { ScoreRing } from "@/components/ui/ScoreRing";
import { useVisaStore } from "@/store/useVisaStore";
import type { ChecklistItem, InterviewQuestion, ScoreSection } from "@/lib/types";

const TABS = ["Statement", "Checklist", "Score", "Questions"] as const;
type Tab = (typeof TABS)[number];

const CATEGORY_COLORS: Record<ChecklistItem["category"], string> = {
  identity: "bg-[var(--trust-blue)]/15 text-[var(--trust-blue)] border-[var(--trust-blue)]/30",
  financial: "bg-[var(--score-strong)]/15 text-[var(--score-strong)] border-[var(--score-strong)]/30",
  ties: "bg-[var(--indigo-deep)]/15 text-[var(--indigo-deep)] border-[var(--indigo-deep)]/30",
  purpose: "bg-[var(--score-moderate)]/15 text-[var(--score-moderate)] border-[var(--score-moderate)]/30",
  travel: "bg-[var(--info)]/15 text-[var(--info)] border-[var(--info)]/30",
};

const CATEGORY_LABELS: Record<ChecklistItem["category"], string> = {
  identity: "Identity",
  financial: "Financial",
  ties: "Ties to India",
  purpose: "Purpose",
  travel: "Travel History",
};

const INTENT_LABELS: Record<InterviewQuestion["intent"], string> = {
  ties: "Ties",
  finances: "Finances",
  purpose: "Purpose",
  history: "History",
  consistency: "Consistency",
};

function getScoreColor(score: number): string {
  if (score >= 80) return "var(--score-strong)";
  if (score >= 60) return "var(--score-moderate)";
  return "var(--score-weak)";
}

function groupByCategory(items: ChecklistItem[]): Record<string, ChecklistItem[]> {
  const groups: Record<string, ChecklistItem[]> = {};
  for (const item of items) {
    if (!groups[item.category]) groups[item.category] = [];
    groups[item.category].push(item);
  }
  return groups;
}

export default function PackagePage() {
  const { generatedPackage } = useVisaStore();
  const [activeTab, setActiveTab] = useState<Tab>("Statement");
  const [expandedQ, setExpandedQ] = useState<string | null>(null);

  if (!generatedPackage) {
    return (
      <div className="min-h-[calc(100vh-8rem)] flex flex-col items-center justify-center px-4 text-center">
        <div className="w-16 h-16 rounded-full bg-[var(--bg-mid)] flex items-center justify-center mb-6 text-3xl">
          📦
        </div>
        <h2 className="text-2xl font-bold mb-2 animate-fade-in">No Package Yet</h2>
        <p className="text-[var(--text-secondary)] mb-8 max-w-sm animate-fade-in" style={{ animationDelay: "0.1s" }}>
          Complete the intake questionnaire to generate your personalized visa package.
        </p>
        <Link href="/intake">
          <Button variant="primary" size="lg">
            Start Intake →
          </Button>
        </Link>
      </div>
    );
  }

  const { statement, checklist, score, interviewQuestions } = generatedPackage;

  const handleDownload = () => {
    alert("Download feature coming soon! Your package will be exported as a PDF.");
  };

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-8 animate-fade-in">
        <h1 className="text-2xl sm:text-3xl font-bold mb-2">Your Visa Package</h1>
        <p className="text-sm text-[var(--text-secondary)]">
          Generated on {new Date(generatedPackage.generatedAt).toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" })}
        </p>
      </div>

      {/* Tab navigation */}
      <div className="flex gap-1 p-1 bg-[var(--bg-surface)] border border-[var(--border)] rounded-xl mb-6 overflow-x-auto animate-slide-up">
        {TABS.map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`flex-1 min-w-0 px-3 py-2.5 text-sm font-medium rounded-lg transition-all duration-200 whitespace-nowrap ${
              activeTab === tab
                ? "bg-[var(--trust-blue)] text-white shadow-lg"
                : "text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-mid)]"
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Statement tab */}
      {activeTab === "Statement" && (
        <div className="animate-fade-in">
          <Card>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold">Personal Statement</h2>
              <span className="text-xs px-3 py-1 rounded-full bg-[var(--bg-mid)] text-[var(--text-secondary)] border border-[var(--border)]">
                {statement.wordCount} words
              </span>
            </div>
            <p className="text-xs text-[var(--text-secondary)] mb-4">
              Addressed to: <span className="text-[var(--text-bright)]">{statement.addressedTo}</span>
            </p>
            <div className="prose prose-invert max-w-none">
              {statement.body.split("\n\n").map((paragraph, i) => (
                <p key={i} className="text-sm text-[var(--text-bright)] leading-relaxed mb-4 last:mb-0">
                  {paragraph}
                </p>
              ))}
            </div>
          </Card>
        </div>
      )}

      {/* Checklist tab */}
      {activeTab === "Checklist" && (
        <div className="animate-fade-in space-y-6">
          {Object.entries(groupByCategory(checklist)).map(([category, items]) => (
            <div key={category}>
              <div className="flex items-center gap-2 mb-3">
                <span className={`text-xs px-2.5 py-1 rounded-full border font-medium ${CATEGORY_COLORS[category as ChecklistItem["category"]]}`}>
                  {CATEGORY_LABELS[category as ChecklistItem["category"]]}
                </span>
                <span className="text-xs text-[var(--text-secondary)]">
                  {items.length} item{items.length !== 1 ? "s" : ""}
                </span>
              </div>
              <div className="space-y-2">
                {items.map((item) => (
                  <Card key={item.id} className="!p-4">
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="text-sm font-semibold text-[var(--text-primary)]">{item.name}</h3>
                          {item.required && (
                            <span className="text-[10px] px-1.5 py-0.5 rounded bg-[var(--score-weak)]/15 text-[var(--score-weak)] font-medium">
                              Required
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-[var(--text-secondary)] mb-2">{item.reason}</p>
                        <div className="flex flex-wrap gap-x-4 gap-y-1 text-[11px] text-[var(--text-secondary)]">
                          <span>
                            <span className="text-[var(--text-bright)]">Where:</span> {item.whereToGet}
                          </span>
                          <span>
                            <span className="text-[var(--text-bright)]">Copy:</span> {item.copyType}
                          </span>
                          {item.freshnessRule && (
                            <span>
                              <span className="text-[var(--text-bright)]">Freshness:</span> {item.freshnessRule}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Score tab */}
      {activeTab === "Score" && (
        <div className="animate-fade-in space-y-6">
          <Card className="flex flex-col items-center py-8">
            <ScoreRing score={score.total} size={180} strokeWidth={12} label="Readiness Score" />
            <p className="mt-4 text-xs text-[var(--text-secondary)] max-w-xs text-center">
              {score.band === "strong" && "Your application looks strong. Review the sections below for any final improvements."}
              {score.band === "moderate" && "Your application is moderate. Address the fixes below to strengthen your case."}
              {score.band === "weak" && "Your application needs improvement. Focus on the fixes below before your interview."}
            </p>
          </Card>

          {/* Per-section breakdown */}
          <div className="space-y-3">
            <h3 className="text-sm font-semibold text-[var(--text-secondary)] px-1">Section Breakdown</h3>
            {score.sections.map((section: ScoreSection) => {
              const pct = Math.round((section.score / section.max) * 100);
              const color = getScoreColor(pct);
              return (
                <Card key={section.key} className="!p-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-semibold capitalize">{section.key}</span>
                    <span className="text-sm font-bold" style={{ color }}>
                      {section.score}/{section.max}
                    </span>
                  </div>
                  <div className="h-2 bg-[var(--bg-mid)] rounded-full overflow-hidden mb-2">
                    <div
                      className="h-full rounded-full transition-all duration-700 ease-out"
                      style={{ width: `${pct}%`, backgroundColor: color }}
                    />
                  </div>
                  <p className="text-xs text-[var(--text-secondary)]">{section.reason}</p>
                </Card>
              );
            })}
          </div>

          {/* Fixes */}
          {score.fixes.length > 0 && (
            <div className="space-y-2">
              <h3 className="text-sm font-semibold text-[var(--score-moderate)] px-1">Recommended Fixes</h3>
              {score.fixes.map((fix, i) => (
                <Card key={i} className="!p-4 border-l-2 !border-l-[var(--score-moderate)]">
                  <p className="text-sm text-[var(--text-bright)]">{fix}</p>
                </Card>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Questions tab */}
      {activeTab === "Questions" && (
        <div className="animate-fade-in space-y-3">
          <p className="text-xs text-[var(--text-secondary)] px-1 mb-2">
            Tap a question to reveal the suggested answer
          </p>
          {interviewQuestions.map((q) => {
            const isExpanded = expandedQ === q.id;
            return (
              <Card
                key={q.id}
                hover
                onClick={() => setExpandedQ(isExpanded ? null : q.id)}
                className="!p-4"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-[10px] px-2 py-0.5 rounded-full bg-[var(--indigo-deep)]/15 text-[var(--indigo-deep)] border border-[var(--indigo-deep)]/30 font-medium capitalize">
                        {INTENT_LABELS[q.intent]}
                      </span>
                    </div>
                    <p className="text-sm font-medium text-[var(--text-primary)] mb-1">
                      &ldquo;{q.officerPrompt}&rdquo;
                    </p>
                    <p className="text-[11px] text-[var(--text-secondary)] italic">
                      Officer question
                    </p>
                  </div>
                  <svg
                    width="20"
                    height="20"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="var(--text-secondary)"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className={`flex-shrink-0 transition-transform duration-200 ${isExpanded ? "rotate-180" : ""}`}
                  >
                    <polyline points="6 9 12 15 18 9" />
                  </svg>
                </div>
                {isExpanded && (
                  <div className="mt-4 pt-4 border-t border-[var(--border)]">
                    <p className="text-[11px] font-semibold text-[var(--score-strong)] mb-2 uppercase tracking-wider">
                      Suggested Answer
                    </p>
                    <p className="text-sm text-[var(--text-bright)] leading-relaxed">
                      {q.suggestedAnswer}
                    </p>
                  </div>
                )}
              </Card>
            );
          })}
        </div>
      )}

      {/* Bottom actions */}
      <div className="flex flex-col sm:flex-row gap-3 mt-10 animate-slide-up">
        <Button variant="secondary" size="lg" className="flex-1" onClick={handleDownload}>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-2">
            <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4" />
            <polyline points="7 10 12 15 17 10" />
            <line x1="12" y1="15" x2="12" y2="3" />
          </svg>
          Download Package
        </Button>
        <Link href="/interview" className="flex-1">
          <Button variant="primary" size="lg" className="w-full">
            Start Mock Interview →
          </Button>
        </Link>
      </div>
    </div>
  );
}
