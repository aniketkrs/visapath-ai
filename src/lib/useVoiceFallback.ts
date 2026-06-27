"use client";

import { useState, useCallback, useRef, useEffect } from "react";
import type { TurnScore } from "@/lib/types";
import { sampleInterview } from "@/lib/fixtures/sample-interview";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export type FallbackMode = "voice" | "text" | "cached";

export type FallbackStatus =
  | "idle"
  | "connecting"
  | "listening"
  | "officer-speaking"
  | "playing-cached"
  | "error";

export interface FallbackTurn {
  officer: string;
  applicant: string;
  score?: TurnScore;
}

interface ConversationHandle {
  startSession: (opts: { signedUrl: string; dynamicVariables?: Record<string, string> }) => Promise<void>;
  endSession: () => Promise<void>;
}

// ---------------------------------------------------------------------------
// Hook
// ---------------------------------------------------------------------------

export function useVoiceFallback() {
  const [mode, setMode] = useState<FallbackMode>("text");
  const [status, setStatus] = useState<FallbackStatus>("idle");
  const [turns, setTurns] = useState<FallbackTurn[]>([]);
  const [cachedIdx, setCachedIdx] = useState(0);

  const conversationRef = useRef<ConversationHandle | null>(null);
  const turnsRef = useRef(turns);
  turnsRef.current = turns;

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      conversationRef.current?.endSession().catch(() => {});
    };
  }, []);

  // ---- Tier 3: Cached exchange --------------------------------------------

  const advanceCached = useCallback(() => {
    const idx = turnsRef.current.length;
    if (idx >= sampleInterview.length) return;

    const turn = sampleInterview[idx];
    setStatus("officer-speaking");

    // Simulate officer speaking delay, then show the full turn
    const delay = Math.min(turn.officer.length * 30, 2500);
    setTimeout(() => {
      setTurns((prev) => [
        ...prev,
        { officer: turn.officer, applicant: turn.applicant, score: turn.score },
      ]);
      setCachedIdx(idx + 1);
      if (idx + 1 >= sampleInterview.length) {
        setStatus("idle");
      } else {
        setStatus("playing-cached");
      }
    }, delay);
  }, []);

  const startCached = useCallback(() => {
    setMode("cached");
    setTurns([]);
    setCachedIdx(0);
    setStatus("playing-cached");
    // Kick off first turn after a brief pause
    setTimeout(() => {
      const turn = sampleInterview[0];
      setStatus("officer-speaking");
      const delay = Math.min(turn.officer.length * 30, 2500);
      setTimeout(() => {
        setTurns([{ officer: turn.officer, applicant: turn.applicant, score: turn.score }]);
        setCachedIdx(1);
        setStatus("playing-cached");
      }, delay);
    }, 600);
  }, []);

  // ---- Tier 1: Live voice (ElevenLabs) ------------------------------------

  const startVoice = useCallback(async (dynamicVariables?: Record<string, string>) => {
    setMode("voice");
    setTurns([]);
    setStatus("connecting");

    try {
      // 1. Get signed URL from server
      const res = await fetch("/api/voice/signed-url");
      if (!res.ok) throw new Error("Voice API unavailable");

      const { signedUrl } = await res.json();

      // 2. Dynamically import ElevenLabs hook
      let useConversationFn: (
        opts: Record<string, unknown>
      ) => ConversationHandle;

      try {
        const mod = await import("@elevenlabs/react");
        useConversationFn =
          mod.useConversation as unknown as typeof useConversationFn;
      } catch {
        throw new Error("ElevenLabs SDK not available");
      }

      // 3. Start conversation
      const conversation = useConversationFn({
        onConnect: () => setStatus("listening"),
        onDisconnect: () => {
          setStatus("idle");
        },
        onMessage: (msg: { role: string; text: string }) => {
          if (msg.role === "agent") {
            setStatus("officer-speaking");
            // Append officer message as a new turn stub
            setTurns((prev) => {
              const last = prev[prev.length - 1];
              if (last && !last.applicant) {
                // Update existing stub
                return [
                  ...prev.slice(0, -1),
                  { ...last, officer: msg.text },
                ];
              }
              return [...prev, { officer: msg.text, applicant: "" }];
            });
          } else if (msg.role === "user") {
            setStatus("listening");
            // Fill in the applicant answer on the latest turn
            setTurns((prev) => {
              if (prev.length === 0) return prev;
              const updated = [...prev];
              updated[updated.length - 1] = {
                ...updated[updated.length - 1],
                applicant: msg.text,
              };
              return updated;
            });
          }
        },
      });

      conversationRef.current = conversation;
      await conversation.startSession({
        signedUrl,
        dynamicVariables: dynamicVariables ?? {},
      });
    } catch {
      // Auto-fallback: voice → text
      setMode("text");
      setStatus("idle");
    }
  }, []);

  // ---- Tier 2: Text mode --------------------------------------------------

  const startText = useCallback(() => {
    setMode("text");
    setTurns([]);
    setStatus("idle");
  }, []);

  // ---- Public entry points ------------------------------------------------

  const startExam = useCallback(async (dynamicVariables?: Record<string, string>) => {
    await startVoice(dynamicVariables);
  }, [startVoice]);

  const startPractice = useCallback(() => {
    startText();
  }, [startText]);

  const addTurn = useCallback((turn: FallbackTurn) => {
    setTurns((prev) => [...prev, turn]);
  }, []);

  const stopVoice = useCallback(async () => {
    try {
      await conversationRef.current?.endSession();
    } catch {
      // ignore
    }
    conversationRef.current = null;
    setStatus("idle");
  }, []);

  const reset = useCallback(() => {
    setTurns([]);
    setCachedIdx(0);
    setStatus("idle");
    setMode("text");
  }, []);

  return {
    mode,
    status,
    turns,
    cachedIdx,
    startExam,
    startPractice,
    startCached,
    addTurn,
    stopVoice,
    reset,
    totalCachedTurns: sampleInterview.length,
  };
}
