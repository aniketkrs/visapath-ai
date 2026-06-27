"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { MicButton } from "@/components/ui/MicButton";
import { ScoreRing } from "@/components/ui/ScoreRing";
import { useVisaStore } from "@/store/useVisaStore";
import { useVoiceFallback } from "@/lib/useVoiceFallback";
import type { IntakeAnswers, InterviewQuestion, TurnScore } from "@/lib/types";

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function getScoreColor(val: number) {
  if (val >= 80) return "var(--score-strong)";
  if (val >= 60) return "var(--score-moderate)";
  return "var(--score-weak)";
}

function ScoreBar({ label, value }: { label: string; value: number }) {
  return (
    <div className="flex items-center gap-3">
      <span className="text-xs text-[var(--text-secondary)] w-24 shrink-0">
        {label}
      </span>
      <div className="flex-1 h-2 rounded-full bg-[var(--bg-mid)] overflow-hidden">
        <div
          className="h-full rounded-full transition-all duration-700"
          style={{ width: `${value}%`, backgroundColor: getScoreColor(value) }}
        />
      </div>
      <span
        className="text-xs font-semibold w-8 text-right"
        style={{ color: getScoreColor(value) }}
      >
        {value}
      </span>
    </div>
  );
}

function ModeBadge({ mode }: { mode: "voice" | "text" | "cached" }) {
  const config = {
    voice: { label: "Exam · Voice", color: "var(--trust-blue)" },
    text: { label: "Practice · Text", color: "var(--score-moderate)" },
    cached: { label: "Demo · Cached", color: "var(--score-strong)" },
  };
  const { label, color } = config[mode];
  return (
    <span
      className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium"
      style={{
        backgroundColor: `${color}18`,
        color,
        border: `1px solid ${color}40`,
      }}
    >
      <span
        className="w-1.5 h-1.5 rounded-full"
        style={{ backgroundColor: color }}
      />
      {label}
    </span>
  );
}

// ---------------------------------------------------------------------------
// Page
// ---------------------------------------------------------------------------

export default function InterviewPage() {
  const router = useRouter();
  const { generatedPackage, intakeAnswers, interviewMode, setInterviewMode } =
    useVisaStore();

  const {
    mode: voiceMode,
    status: voiceStatus,
    turns: voiceTurns,
    cachedIdx,
    startExam,
    startPractice,
    startCached,
    addTurn,
    stopVoice,
    reset: resetVoice,
    totalCachedTurns,
  } = useVoiceFallback();

  const questions: InterviewQuestion[] =
    generatedPackage?.interviewQuestions ?? [];

  const [currentIdx, setCurrentIdx] = useState(0);
  const [textInput, setTextInput] = useState("");
  const [practiceTurns, setPracticeTurns] = useState<
    { questionId: string; question: string; answer: string; score: TurnScore }[]
  >([]);
  const [scoring, setScoring] = useState(false);
  const [interviewOver, setInterviewOver] = useState(false);
  const [voiceTranscript, setVoiceTranscript] = useState("");

  const transcriptRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Scroll transcript to bottom on new turns
  useEffect(() => {
    if (transcriptRef.current) {
      transcriptRef.current.scrollTop = transcriptRef.current.scrollHeight;
    }
  }, [practiceTurns, voiceTurns]);

  // Focus textarea when in text mode
  useEffect(() => {
    if (interviewMode === "practice" && textareaRef.current) {
      textareaRef.current.focus();
    }
  }, [currentIdx, interviewMode]);

  const profile = intakeAnswers as Partial<IntakeAnswers>;
  const currentQuestion = questions[currentIdx];
  const isLastQuestion = currentIdx >= questions.length - 1;

  // ---- Practice (text) scoring --------------------------------------------

  const scoreTurn = useCallback(
    async (questionId: string, transcript: string): Promise<TurnScore> => {
      const res = await fetch("/api/interview/turn", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ questionId, transcript, profile, history: [] }),
      });
      if (!res.ok) throw new Error("Scoring failed");
      return res.json();
    },
    [profile]
  );

  const handlePracticeSubmit = useCallback(async () => {
    if (!textInput.trim() || !currentQuestion || scoring) return;
    const answer = textInput.trim();
    setScoring(true);
    try {
      const score = await scoreTurn(currentQuestion.id, answer);
      setPracticeTurns((prev) => [
        ...prev,
        {
          questionId: currentQuestion.id,
          question: currentQuestion.officerPrompt,
          answer,
          score,
        },
      ]);
      setTextInput("");
      if (isLastQuestion) {
        setInterviewOver(true);
      } else {
        setCurrentIdx((i) => i + 1);
      }
    } catch {
      setPracticeTurns((prev) => [
        ...prev,
        {
          questionId: currentQuestion.id,
          question: currentQuestion.officerPrompt,
          answer,
          score: {
            confidence: 50,
            consistency: 50,
            tiesStrength: 50,
            redFlags: ["Could not score this response"],
            followUp: "",
          },
        },
      ]);
      setTextInput("");
      if (isLastQuestion) setInterviewOver(true);
      else setCurrentIdx((i) => i + 1);
    } finally {
      setScoring(false);
    }
  }, [textInput, currentQuestion, scoring, scoreTurn, isLastQuestion]);

  // ---- Mode switching -----------------------------------------------------

  const handleModeChange = useCallback(
    async (newMode: "practice" | "exam" | "demo") => {
      if (newMode === interviewMode) return;

      // Cleanup current mode
      if (interviewMode === "exam") {
        await stopVoice();
      }
      resetVoice();
      setPracticeTurns([]);
      setCurrentIdx(0);
      setInterviewOver(false);
      setTextInput("");
      setVoiceTranscript("");
      setInterviewMode(newMode);

      // Start new mode
      if (newMode === "exam") {
        await startExam();
      } else if (newMode === "demo") {
        startCached();
      } else {
        startPractice();
      }
    },
    [interviewMode, stopVoice, resetVoice, setInterviewMode, startExam, startCached, startPractice]
  );

  // ---- Mic click (exam mode) ----------------------------------------------

  const handleMicClick = useCallback(async () => {
    if (voiceStatus !== "idle") {
      await stopVoice();
    } else {
      await startExam();
    }
  }, [voiceStatus, stopVoice, startExam]);

  // ---- Cached mode: auto-advance ------------------------------------------

  useEffect(() => {
    if (interviewMode !== "demo" || voiceStatus !== "playing-cached") return;
    if (cachedIdx >= totalCachedTurns) {
      setInterviewOver(true);
      return;
    }

    const timer = setTimeout(() => {
      const turn = voiceTurns[voiceTurns.length - 1];
      if (turn?.score) {
        const scored = turn.score;
        setPracticeTurns((prev) => [
          ...prev,
          {
            questionId: `cached-${cachedIdx - 1}`,
            question: turn.officer,
            answer: turn.applicant,
            score: scored,
          },
        ]);
      }
    }, 400);

    return () => clearTimeout(timer);
  }, [interviewMode, voiceStatus, voiceTurns, cachedIdx, totalCachedTurns]);

  // Map voice turns to scored turns for the report
  const allScoredTurns =
    interviewMode === "demo"
      ? voiceTurns
          .filter((t) => t.score)
          .map((t, i) => ({
            questionId: `cached-${i}`,
            question: t.officer,
            answer: t.applicant,
            score: t.score!,
          }))
      : practiceTurns;

  // Combine for report display
  const reportTurns =
    interviewMode === "practice"
      ? practiceTurns
      : interviewMode === "exam"
        ? practiceTurns.length > 0
          ? practiceTurns
          : voiceTurns
              .filter((t) => t.score)
              .map((t, i) => ({
                questionId: `voice-${i}`,
                question: t.officer,
                answer: t.applicant,
                score: t.score!,
              }))
        : allScoredTurns;

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      stopVoice();
    };
  }, [stopVoice]);

  // -------------------------------------------------------------------------
  // No package
  // -------------------------------------------------------------------------

  if (!generatedPackage || questions.length === 0) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-16 text-center">
        <div className="text-6xl mb-6" style={{ filter: "grayscale(0.3)" }}>
          🎙️
        </div>
        <h1 className="text-2xl font-bold mb-3">
          No interview questions found
        </h1>
        <p className="text-[var(--text-secondary)] mb-8">
          Generate your visa package first to get personalized interview
          questions.
        </p>
        <Button onClick={() => router.push("/intake")} size="lg">
          Go to Intake
        </Button>
      </div>
    );
  }

  // -------------------------------------------------------------------------
  // Final report
  // -------------------------------------------------------------------------

  if (interviewOver) {
    const turnsForReport = reportTurns;
    const avgConfidence =
      turnsForReport.length > 0
        ? Math.round(
            turnsForReport.reduce((s, t) => s + t.score.confidence, 0) /
              turnsForReport.length
          )
        : 0;
    const avgConsistency =
      turnsForReport.length > 0
        ? Math.round(
            turnsForReport.reduce((s, t) => s + t.score.consistency, 0) /
              turnsForReport.length
          )
        : 0;
    const avgTies =
      turnsForReport.length > 0
        ? Math.round(
            turnsForReport.reduce((s, t) => s + t.score.tiesStrength, 0) /
              turnsForReport.length
          )
        : 0;
    const totalRedFlags = turnsForReport.reduce(
      (s, t) => s + t.score.redFlags.length,
      0
    );
    const overall = Math.round((avgConfidence + avgConsistency + avgTies) / 3);

    return (
      <div className="max-w-2xl mx-auto px-4 py-8 pb-24 animate-fade-in">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold mb-2">Interview Report</h1>
          <div className="flex items-center justify-center gap-3 mb-2">
            <ModeBadge mode={voiceMode} />
          </div>
          <p className="text-[var(--text-secondary)]">
            {turnsForReport.length} questions answered
          </p>
        </div>

        <Card className="mb-6">
          <div className="flex justify-center mb-6">
            <ScoreRing
              score={overall}
              size={180}
              strokeWidth={12}
              label="Overall"
            />
          </div>
          <div className="space-y-3">
            <ScoreBar label="Confidence" value={avgConfidence} />
            <ScoreBar label="Consistency" value={avgConsistency} />
            <ScoreBar label="Ties Strength" value={avgTies} />
          </div>
          {totalRedFlags > 0 && (
            <div className="mt-6 p-4 rounded-lg bg-[var(--score-weak)]/10 border border-[var(--score-weak)]/20">
              <p
                className="text-sm font-semibold mb-1"
                style={{ color: "var(--score-weak)" }}
              >
                {totalRedFlags} red flag{totalRedFlags > 1 ? "s" : ""} detected
              </p>
              <ul className="text-xs text-[var(--text-secondary)] space-y-1">
                {turnsForReport.flatMap((t) =>
                  t.score.redFlags.map((rf, i) => (
                    <li key={`${t.questionId}-${i}`}>• {rf}</li>
                  ))
                )}
              </ul>
            </div>
          )}
        </Card>

        <h2 className="text-lg font-semibold mb-4">Turn-by-Turn Breakdown</h2>
        <div className="space-y-3 mb-8">
          {turnsForReport.map((turn, i) => {
            const turnAvg = Math.round(
              (turn.score.confidence +
                turn.score.consistency +
                turn.score.tiesStrength) /
                3
            );
            return (
              <Card key={turn.questionId + i} className="!p-4">
                <div className="flex items-start justify-between gap-3 mb-2">
                  <p className="text-sm text-[var(--text-bright)] flex-1">
                    <span className="text-[var(--text-secondary)]">
                      Q{i + 1}:
                    </span>{" "}
                    {turn.question}
                  </p>
                  <span
                    className="text-sm font-bold shrink-0"
                    style={{ color: getScoreColor(turnAvg) }}
                  >
                    {turnAvg}
                  </span>
                </div>
                <p className="text-xs text-[var(--text-secondary)] mb-3 line-clamp-2">
                  {turn.answer}
                </p>
                <div className="space-y-2">
                  <ScoreBar label="Confidence" value={turn.score.confidence} />
                  <ScoreBar
                    label="Consistency"
                    value={turn.score.consistency}
                  />
                  <ScoreBar label="Ties" value={turn.score.tiesStrength} />
                </div>
                {turn.score.redFlags.length > 0 && (
                  <div className="mt-3 text-xs text-[var(--score-weak)]">
                    {turn.score.redFlags.map((rf, j) => (
                      <p key={j}>⚠ {rf}</p>
                    ))}
                  </div>
                )}
                {turn.score.followUp && (
                  <p className="mt-2 text-xs text-[var(--text-secondary)] italic">
                    Follow-up: {turn.score.followUp}
                  </p>
                )}
              </Card>
            );
          })}
        </div>

        <div className="flex gap-3">
          <Button
            variant="secondary"
            onClick={() => {
              resetVoice();
              setPracticeTurns([]);
              setCurrentIdx(0);
              setInterviewOver(false);
              setTextInput("");
              setVoiceTranscript("");
            }}
            className="flex-1"
          >
            Retake Interview
          </Button>
          <Button onClick={() => router.push("/")} className="flex-1">
            Back to Package
          </Button>
        </div>
      </div>
    );
  }

  // -------------------------------------------------------------------------
  // Main interview UI
  // -------------------------------------------------------------------------

  return (
    <div className="max-w-2xl mx-auto px-4 py-6 pb-24 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => router.push("/")}
          className="!px-3"
        >
          <svg
            width="18"
            height="18"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="mr-1"
          >
            <polyline points="15 18 9 12 15 6" />
          </svg>
          Back
        </Button>
        <ModeBadge mode={voiceMode} />
        <span className="text-xs text-[var(--text-secondary)]">
          {interviewMode === "demo"
            ? `${cachedIdx} / ${totalCachedTurns}`
            : `${currentIdx + 1} / ${questions.length}`}
        </span>
      </div>

      {/* Mode Selector — 3 tiers */}
      <div className="flex bg-[var(--bg-surface)] rounded-full p-1 mb-6 border border-[var(--border)]">
        <button
          onClick={() => handleModeChange("exam")}
          className={`flex-1 py-2.5 rounded-full text-sm font-medium transition-all duration-200 ${
            interviewMode === "exam"
              ? "bg-[var(--trust-blue)] text-white shadow-lg"
              : "text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
          }`}
        >
          Exam
        </button>
        <button
          onClick={() => handleModeChange("practice")}
          className={`flex-1 py-2.5 rounded-full text-sm font-medium transition-all duration-200 ${
            interviewMode === "practice"
              ? "bg-[var(--trust-blue)] text-white shadow-lg"
              : "text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
          }`}
        >
          Practice
        </button>
        <button
          onClick={() => handleModeChange("demo")}
          className={`flex-1 py-2.5 rounded-full text-sm font-medium transition-all duration-200 ${
            interviewMode === "demo"
              ? "bg-[var(--trust-blue)] text-white shadow-lg"
              : "text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
          }`}
        >
          Demo
        </button>
      </div>

      {/* Current Question (practice + exam modes) */}
      {interviewMode !== "demo" && currentQuestion && (
        <Card className="mb-6">
          <div className="flex items-start gap-3">
            <div
              className="w-8 h-8 rounded-full flex items-center justify-center shrink-0 text-sm font-bold"
              style={{ backgroundColor: "var(--indigo-deep)" }}
            >
              Q
            </div>
            <div className="flex-1">
              <span className="text-xs text-[var(--text-secondary)] uppercase tracking-wider">
                {currentQuestion.intent}
              </span>
              <p className="text-[var(--text-primary)] font-medium mt-1">
                {currentQuestion.officerPrompt}
              </p>
            </div>
          </div>
        </Card>
      )}

      {/* Demo mode — cached playback status */}
      {interviewMode === "demo" && (
        <Card className="mb-6">
          <div className="flex items-center gap-3 mb-2">
            <div
              className="w-8 h-8 rounded-full flex items-center justify-center shrink-0 text-sm font-bold"
              style={{ backgroundColor: "var(--score-strong)" }}
            >
              ▶
            </div>
            <div className="flex-1">
              <p className="text-[var(--text-primary)] font-medium">
                {voiceStatus === "officer-speaking"
                  ? "Officer is speaking..."
                  : voiceStatus === "playing-cached"
                    ? "Demo in progress"
                    : cachedIdx >= totalCachedTurns
                      ? "Demo complete"
                      : "Starting demo..."}
              </p>
              <p className="text-xs text-[var(--text-secondary)] mt-0.5">
                Pre-recorded exchange for Priya Sharma &middot; B-1/B-2
              </p>
            </div>
          </div>
          {cachedIdx < totalCachedTurns && (
            <div className="mt-3 h-1.5 rounded-full bg-[var(--bg-mid)] overflow-hidden">
              <div
                className="h-full rounded-full transition-all duration-500"
                style={{
                  width: `${(cachedIdx / totalCachedTurns) * 100}%`,
                  backgroundColor: "var(--score-strong)",
                }}
              />
            </div>
          )}
        </Card>
      )}

      {/* Exam Mode — Voice */}
      {interviewMode === "exam" && (
        <div className="flex flex-col items-center py-8">
          <MicButton
            status={
              voiceStatus === "officer-speaking"
                ? "officer"
                : voiceStatus === "listening"
                  ? "listening"
                  : "idle"
            }
            onClick={handleMicClick}
            disabled={voiceStatus === "connecting"}
            size={100}
          />
          {voiceStatus === "connecting" && (
            <p className="text-xs text-[var(--text-secondary)] mt-4 animate-pulse">
              Connecting to voice agent...
            </p>
          )}
          {voiceTranscript && (
            <div className="mt-6 w-full p-4 rounded-lg bg-[var(--bg-surface)] border border-[var(--border)]">
              <p className="text-xs text-[var(--text-secondary)] mb-1">
                You said:
              </p>
              <p className="text-sm text-[var(--text-bright)]">
                {voiceTranscript}
              </p>
            </div>
          )}
          {voiceStatus !== "idle" && voiceStatus !== "connecting" && (
            <p className="text-xs text-[var(--text-secondary)] mt-4">
              Tap the mic to stop the session
            </p>
          )}
        </div>
      )}

      {/* Practice Mode — Text Input */}
      {interviewMode === "practice" && (
        <div className="mb-6">
          <textarea
            ref={textareaRef}
            value={textInput}
            onChange={(e) => setTextInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                handlePracticeSubmit();
              }
            }}
            placeholder="Type your answer as if speaking to the consular officer..."
            rows={4}
            className="w-full p-4 rounded-xl text-sm text-[var(--text-primary)] placeholder-[var(--text-secondary)]/50 resize-none focus:outline-none focus:ring-2 focus:ring-[var(--trust-blue)] transition-shadow"
            style={{
              backgroundColor: "var(--bg-surface)",
              border: "1px solid var(--border)",
            }}
            disabled={scoring}
          />
          <div className="flex justify-between items-center mt-3">
            <span className="text-xs text-[var(--text-secondary)]">
              {textInput.length} characters
            </span>
            <Button
              onClick={handlePracticeSubmit}
              disabled={!textInput.trim() || scoring}
              loading={scoring}
              size="sm"
            >
              Submit Answer
            </Button>
          </div>
        </div>
      )}

      {/* Practice Mode — Suggested Answer */}
      {interviewMode === "practice" && practiceTurns.length > 0 && !scoring && (
        <Card className="mb-6 !p-4">
          <p className="text-xs text-[var(--text-secondary)] mb-2 font-medium uppercase tracking-wider">
            Suggested answer (previous question)
          </p>
          <p className="text-sm text-[var(--text-bright)] leading-relaxed">
            {questions[practiceTurns.length - 1]?.suggestedAnswer}
          </p>
        </Card>
      )}

      {/* Transcript History */}
      {voiceTurns.length > 0 && interviewMode !== "practice" && (
        <div className="mb-6">
          <h2 className="text-sm font-semibold text-[var(--text-secondary)] mb-3">
            Transcript
          </h2>
          <div
            ref={transcriptRef}
            className="space-y-3 max-h-[40vh] overflow-y-auto pr-1"
          >
            {voiceTurns.map((turn, i) => {
              const turnAvg = turn.score
                ? Math.round(
                    (turn.score.confidence +
                      turn.score.consistency +
                      turn.score.tiesStrength) /
                      3
                  )
                : null;
              return (
                <div
                  key={i}
                  className="p-3 rounded-lg animate-fade-in"
                  style={{ backgroundColor: "var(--bg-surface)" }}
                >
                  <div className="flex items-center justify-between mb-2">
                    <p className="text-xs text-[var(--text-secondary)]">
                      Officer:
                    </p>
                    {turnAvg !== null && (
                      <span
                        className="text-xs font-bold"
                        style={{ color: getScoreColor(turnAvg) }}
                      >
                        {turnAvg}
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-[var(--text-bright)] mb-2">
                    {turn.officer}
                  </p>
                  {turn.applicant && (
                    <>
                      <p className="text-xs text-[var(--text-secondary)] mb-1">
                        You:
                      </p>
                      <p className="text-sm text-[var(--text-bright)]">
                        {turn.applicant}
                      </p>
                    </>
                  )}
                  {turn.score && (
                    <div className="grid grid-cols-3 gap-2 mt-2">
                      <ScoreBar
                        label="Conf"
                        value={turn.score.confidence}
                      />
                      <ScoreBar
                        label="Cons"
                        value={turn.score.consistency}
                      />
                      <ScoreBar
                        label="Ties"
                        value={turn.score.tiesStrength}
                      />
                    </div>
                  )}
                  {turn.score?.redFlags && turn.score.redFlags.length > 0 && (
                    <div className="mt-2">
                      {turn.score.redFlags.map((rf, j) => (
                        <p
                          key={j}
                          className="text-xs text-[var(--score-weak)]"
                        >
                          ⚠ {rf}
                        </p>
                      ))}
                    </div>
                  )}
                  {turn.score?.followUp && (
                    <p className="mt-2 text-xs text-[var(--text-secondary)] italic">
                      Follow-up: {turn.score.followUp}
                    </p>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Practice mode transcript */}
      {practiceTurns.length > 0 && interviewMode === "practice" && (
        <div className="mb-6">
          <h2 className="text-sm font-semibold text-[var(--text-secondary)] mb-3">
            Transcript
          </h2>
          <div className="space-y-3 max-h-[40vh] overflow-y-auto pr-1">
            {practiceTurns.map((turn, i) => {
              const turnAvg = Math.round(
                (turn.score.confidence +
                  turn.score.consistency +
                  turn.score.tiesStrength) /
                  3
              );
              return (
                <div
                  key={turn.questionId + i}
                  className="p-3 rounded-lg animate-fade-in"
                  style={{ backgroundColor: "var(--bg-surface)" }}
                >
                  <div className="flex items-center justify-between mb-2">
                    <p className="text-xs text-[var(--text-secondary)]">
                      Q{i + 1} — {turn.question}
                    </p>
                    <span
                      className="text-xs font-bold"
                      style={{ color: getScoreColor(turnAvg) }}
                    >
                      {turnAvg}
                    </span>
                  </div>
                  <p className="text-sm text-[var(--text-bright)] mb-2">
                    {turn.answer}
                  </p>
                  <div className="grid grid-cols-3 gap-2">
                    <ScoreBar label="Conf" value={turn.score.confidence} />
                    <ScoreBar label="Cons" value={turn.score.consistency} />
                    <ScoreBar label="Ties" value={turn.score.tiesStrength} />
                  </div>
                  {turn.score.redFlags.length > 0 && (
                    <div className="mt-2">
                      {turn.score.redFlags.map((rf, j) => (
                        <p
                          key={j}
                          className="text-xs text-[var(--score-weak)]"
                        >
                          ⚠ {rf}
                        </p>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Exam mode — auto-advance note */}
      {interviewMode === "exam" && voiceTurns.length > 0 && !interviewOver && (
        <p className="text-center text-xs text-[var(--text-secondary)]">
          The officer will ask the next question automatically
        </p>
      )}
    </div>
  );
}
