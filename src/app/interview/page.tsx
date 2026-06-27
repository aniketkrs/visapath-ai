"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { MicButton } from "@/components/ui/MicButton";
import { ScoreRing } from "@/components/ui/ScoreRing";
import { useVisaStore } from "@/store/useVisaStore";
import type { IntakeAnswers, InterviewQuestion, TurnScore } from "@/lib/types";

interface TranscriptTurn {
  questionId: string;
  question: string;
  answer: string;
  score: TurnScore;
  mode: "practice" | "exam";
}

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

export default function InterviewPage() {
  const router = useRouter();
  const { generatedPackage, intakeAnswers, interviewMode, setInterviewMode } =
    useVisaStore();

  const questions: InterviewQuestion[] =
    generatedPackage?.interviewQuestions ?? [];

  const [currentIdx, setCurrentIdx] = useState(0);
  const [textInput, setTextInput] = useState("");
  const [turns, setTurns] = useState<TranscriptTurn[]>([]);
  const [scoring, setScoring] = useState(false);
  const [interviewOver, setInterviewOver] = useState(false);
  const [micDenied, setMicDenied] = useState(false);
  const [voiceAvailable, setVoiceAvailable] = useState(true);
  const [micStatus, setMicStatus] = useState<"idle" | "listening" | "officer">(
    "idle"
  );
  const [voiceTranscript, setVoiceTranscript] = useState("");
  const [sessionActive, setSessionActive] = useState(false);

  const transcriptRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const conversationRef = useRef<{
    startSession: (opts: { signedUrl: string }) => Promise<void>;
    endSession: () => Promise<void>;
  } | null>(null);

  const turnsRef = useRef(turns);
  turnsRef.current = turns;
  const currentIdxRef = useRef(currentIdx);
  currentIdxRef.current = currentIdx;
  const questionsRef = useRef(questions);
  questionsRef.current = questions;

  useEffect(() => {
    if (transcriptRef.current) {
      transcriptRef.current.scrollTop = transcriptRef.current.scrollHeight;
    }
  }, [turns]);

  useEffect(() => {
    if (interviewMode === "practice" && textareaRef.current) {
      textareaRef.current.focus();
    }
  }, [currentIdx, interviewMode]);

  const profile = intakeAnswers as Partial<IntakeAnswers>;
  const history = turns.map((t) => `Q: ${t.question}\nA: ${t.answer}`);
  const currentQuestion = questions[currentIdx];
  const isLastQuestion = currentIdx >= questions.length - 1;

  const scoreTurn = useCallback(
    async (questionId: string, transcript: string): Promise<TurnScore> => {
      const res = await fetch("/api/interview/turn", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ questionId, transcript, profile, history }),
      });
      if (!res.ok) throw new Error("Scoring failed");
      return res.json();
    },
    [profile, history]
  );

  const handlePracticeSubmit = useCallback(async () => {
    if (!textInput.trim() || !currentQuestion || scoring) return;
    const answer = textInput.trim();
    setScoring(true);
    try {
      const score = await scoreTurn(currentQuestion.id, answer);
      setTurns((prev) => [
        ...prev,
        {
          questionId: currentQuestion.id,
          question: currentQuestion.officerPrompt,
          answer,
          score,
          mode: "practice",
        },
      ]);
      setTextInput("");
      if (isLastQuestion) {
        setInterviewOver(true);
      } else {
        setCurrentIdx((i) => i + 1);
      }
    } catch {
      setTurns((prev) => [
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
          mode: "practice",
        },
      ]);
      setTextInput("");
      if (isLastQuestion) setInterviewOver(true);
      else setCurrentIdx((i) => i + 1);
    } finally {
      setScoring(false);
    }
  }, [textInput, currentQuestion, scoring, scoreTurn, isLastQuestion]);

  const endVoiceSession = useCallback(async () => {
    try {
      await conversationRef.current?.endSession();
    } catch {
      // ignore
    }
    conversationRef.current = null;
    setSessionActive(false);
    setMicStatus("idle");
  }, []);

  const handleMicClick = useCallback(async () => {
    if (sessionActive) {
      await endVoiceSession();
      return;
    }

    try {
      const res = await fetch("/api/voice/signed-url");
      if (!res.ok) {
        setVoiceAvailable(false);
        setMicDenied(true);
        setInterviewMode("practice");
        return;
      }
      const { signedUrl } = await res.json();

      let useConversationFn: (
        opts: Record<string, unknown>
      ) => {
        startSession: (opts: { signedUrl: string }) => Promise<void>;
        endSession: () => Promise<void>;
      };

      try {
        const mod = await import("@elevenlabs/react");
        // useConversation is a React hook — we call it here because this
        // component is the single consumer and the call site is stable.
        // The hook returns an imperative handle, not JSX.
        useConversationFn = mod.useConversation as unknown as typeof useConversationFn;
      } catch {
        setVoiceAvailable(false);
        setMicDenied(true);
        setInterviewMode("practice");
        return;
      }

      const conversation = useConversationFn({
        onConnect: () => setMicStatus("listening"),
        onDisconnect: () => {
          setMicStatus("idle");
          setSessionActive(false);
        },
        onMessage: async (msg: { role: string; text: string }) => {
          const qIdx = currentIdxRef.current;
          const qs = questionsRef.current;
          const q = qs[qIdx];
          if (msg.role === "user" && q) {
            setMicStatus("listening");
            setVoiceTranscript(msg.text);
            try {
              const hist = turnsRef.current.map(
                (t) => `Q: ${t.question}\nA: ${t.answer}`
              );
              const prof = intakeAnswers as Partial<IntakeAnswers>;
              const scoreRes = await fetch("/api/interview/turn", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                  questionId: q.id,
                  transcript: msg.text,
                  profile: prof,
                  history: hist,
                }),
              });
              if (scoreRes.ok) {
                const score: TurnScore = await scoreRes.json();
                setTurns((prev) => [
                  ...prev,
                  {
                    questionId: q.id,
                    question: q.officerPrompt,
                    answer: msg.text,
                    score,
                    mode: "exam",
                  },
                ]);
                if (qIdx >= qs.length - 1) {
                  setInterviewOver(true);
                } else {
                  setCurrentIdx((i) => i + 1);
                }
              }
            } catch {
              // ignore scoring errors in voice mode
            }
          } else if (msg.role === "agent") {
            setMicStatus("officer");
          }
        },
      });

      conversationRef.current = conversation;
      await conversation.startSession({ signedUrl });
      setSessionActive(true);
    } catch {
      setVoiceAvailable(false);
      setMicDenied(true);
      setInterviewMode("practice");
    }
  }, [
    sessionActive,
    endVoiceSession,
    setInterviewMode,
    intakeAnswers,
  ]);

  useEffect(() => {
    return () => {
      endVoiceSession();
    };
  }, [endVoiceSession]);

  // No package data
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

  // Final report
  if (interviewOver) {
    const avgConfidence =
      turns.length > 0
        ? Math.round(
            turns.reduce((s, t) => s + t.score.confidence, 0) / turns.length
          )
        : 0;
    const avgConsistency =
      turns.length > 0
        ? Math.round(
            turns.reduce((s, t) => s + t.score.consistency, 0) / turns.length
          )
        : 0;
    const avgTies =
      turns.length > 0
        ? Math.round(
            turns.reduce((s, t) => s + t.score.tiesStrength, 0) / turns.length
          )
        : 0;
    const totalRedFlags = turns.reduce(
      (s, t) => s + t.score.redFlags.length,
      0
    );
    const overall = Math.round((avgConfidence + avgConsistency + avgTies) / 3);

    return (
      <div className="max-w-2xl mx-auto px-4 py-8 pb-24 animate-fade-in">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold mb-2">Interview Report</h1>
          <p className="text-[var(--text-secondary)]">
            {interviewMode === "practice" ? "Practice" : "Exam"} mode &middot;{" "}
            {turns.length} questions answered
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
                {turns.flatMap((t) =>
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
          {turns.map((turn, i) => {
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
              setTurns([]);
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
        <span className="text-xs text-[var(--text-secondary)]">
          {currentIdx + 1} / {questions.length}
        </span>
      </div>

      {/* Mode Toggle */}
      <div className="flex bg-[var(--bg-surface)] rounded-full p-1 mb-6 border border-[var(--border)]">
        <button
          onClick={() => setInterviewMode("practice")}
          className={`flex-1 py-2.5 rounded-full text-sm font-medium transition-all duration-200 ${
            interviewMode === "practice"
              ? "bg-[var(--trust-blue)] text-white shadow-lg"
              : "text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
          }`}
        >
          Practice
        </button>
        <button
          onClick={() => {
            if (!voiceAvailable) return;
            setInterviewMode("exam");
          }}
          disabled={!voiceAvailable}
          className={`flex-1 py-2.5 rounded-full text-sm font-medium transition-all duration-200 ${
            interviewMode === "exam"
              ? "bg-[var(--trust-blue)] text-white shadow-lg"
              : voiceAvailable
                ? "text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
                : "text-[var(--text-secondary)]/40 cursor-not-allowed"
          }`}
        >
          Exam
        </button>
      </div>

      {/* Mic permission denied toast */}
      {micDenied && (
        <div className="mb-4 p-3 rounded-lg bg-[var(--score-moderate)]/10 border border-[var(--score-moderate)]/20 text-xs text-[var(--score-moderate)] flex items-center gap-2 animate-fade-in">
          <svg
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
          >
            <circle cx="12" cy="12" r="10" />
            <line x1="12" y1="8" x2="12" y2="12" />
            <line x1="12" y1="16" x2="12.01" y2="16" />
          </svg>
          Microphone unavailable — switched to text mode
        </div>
      )}

      {/* Current Question */}
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

      {/* Exam Mode — Voice */}
      {interviewMode === "exam" && (
        <div className="flex flex-col items-center py-8">
          <MicButton
            status={micStatus}
            onClick={handleMicClick}
            disabled={false}
            size={100}
          />
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
          {sessionActive && (
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

      {/* Practice Mode — Suggested Answer for last completed turn */}
      {interviewMode === "practice" && turns.length > 0 && !scoring && (
        <Card className="mb-6 !p-4">
          <p className="text-xs text-[var(--text-secondary)] mb-2 font-medium uppercase tracking-wider">
            Suggested answer (previous question)
          </p>
          <p className="text-sm text-[var(--text-bright)] leading-relaxed">
            {questions[turns.length - 1]?.suggestedAnswer}
          </p>
        </Card>
      )}

      {/* Transcript History */}
      {turns.length > 0 && (
        <div className="mb-6">
          <h2 className="text-sm font-semibold text-[var(--text-secondary)] mb-3">
            Transcript
          </h2>
          <div
            ref={transcriptRef}
            className="space-y-3 max-h-[40vh] overflow-y-auto pr-1"
          >
            {turns.map((turn, i) => {
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
      {interviewMode === "exam" && turns.length > 0 && !interviewOver && (
        <p className="text-center text-xs text-[var(--text-secondary)]">
          The officer will ask the next question automatically
        </p>
      )}
    </div>
  );
}
