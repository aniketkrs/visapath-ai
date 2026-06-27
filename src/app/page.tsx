"use client";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { useRouter } from "next/navigation";
import { preloadDemo } from "@/lib/demo-preload";

export default function LandingPage() {
  const router = useRouter();
  const [hasError, setHasError] = useState(false);

  useEffect(() => {
    const handler = (e: ErrorEvent) => {
      e.preventDefault();
      setHasError(true);
    };
    window.addEventListener("error", handler);
    return () => window.removeEventListener("error", handler);
  }, []);

  if (hasError) {
    return (
      <div className="min-h-[calc(100vh-8rem)] flex flex-col items-center justify-center px-4 text-center">
        <div className="w-16 h-16 rounded-full bg-[var(--bg-mid)] flex items-center justify-center mb-6 text-3xl">
          ⚠️
        </div>
        <h2 className="text-2xl font-bold mb-2">Something went wrong</h2>
        <p className="text-[var(--text-secondary)] mb-8 max-w-sm">
          We hit an unexpected error loading this page.
        </p>
        <Button variant="primary" onClick={() => { setHasError(false); window.location.reload(); }}>
          Try Again
        </Button>
      </div>
    );
  }

  return (
    <div className="min-h-[calc(100vh-8rem)] animate-fade-in">
      {/* Hero */}
      <section className="relative overflow-hidden">
        {/* Background gradient */}
        <div className="absolute inset-0 bg-gradient-to-b from-[var(--trust-blue)]/5 via-transparent to-transparent" />
        <div className="absolute top-20 left-1/2 -translate-x-1/2 w-[600px] h-[600px] rounded-full bg-[var(--trust-blue)]/5 blur-3xl" />

        <div className="relative max-w-5xl mx-auto px-4 pt-16 pb-20 text-center">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[var(--bg-surface)] border border-[var(--border)] mb-8 animate-fade-in">
            <span className="w-2 h-2 rounded-full bg-[var(--score-strong)] animate-pulse" />
            <span className="text-sm text-[var(--text-secondary)]">
              India-first · 214(b) specialized · AI-powered
            </span>
          </div>

          {/* Headline */}
          <h1 className="text-4xl md:text-6xl font-bold leading-tight mb-6 animate-slide-up">
            Your complete US visa
            <br />
            <span className="bg-gradient-to-r from-[var(--trust-blue)] to-[var(--indigo-deep)] bg-clip-text text-transparent">
              application package
            </span>
            <br />
            Ready in 20 minutes.
          </h1>

          {/* Subheadline */}
          <p className="text-lg md:text-xl text-[var(--text-secondary)] max-w-2xl mx-auto mb-10 animate-slide-up" style={{ animationDelay: "0.1s" }}>
            What your ₹45,000 immigration attorney does — personalized statement,
            document checklist, readiness score, and mock interview prep — for{" "}
            <span className="text-[var(--trust-blue)] font-semibold">₹2,999</span>.
          </p>

          {/* CTA */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center animate-slide-up" style={{ animationDelay: "0.2s" }}>
            <Button size="lg" onClick={() => router.push("/select")}>
              Start Your Application →
            </Button>
            <Button variant="secondary" size="lg" onClick={() => router.push("/select")}>
              Free Checklist Preview
            </Button>
          </div>

          {/* Demo mode */}
          <button
            onClick={() => { preloadDemo(); router.push("/package"); }}
            className="mt-4 text-sm text-[var(--text-secondary)] hover:text-[var(--trust-blue)] underline underline-offset-2 transition-colors animate-fade-in"
            style={{ animationDelay: "0.3s" }}
          >
            Skip to Demo →
          </button>

          {/* Trust line */}
          <p className="mt-6 text-xs text-[var(--text-secondary)] animate-fade-in" style={{ animationDelay: "0.4s" }}>
            AI-assisted preparation · Never an AI attorney · Your data stays in your browser
          </p>
        </div>
      </section>

      {/* Features */}
      <section className="max-w-5xl mx-auto px-4 pb-20">
        <div className="grid md:grid-cols-3 gap-6">
          <Card className="animate-slide-up" hover>
            <div className="text-3xl mb-4">📝</div>
            <h3 className="text-lg font-bold mb-2">Smart Intake</h3>
            <p className="text-sm text-[var(--text-secondary)]">
              ~20 adaptive questions that branch intelligently based on your
              employment, travel history, and prior visa outcomes.
            </p>
          </Card>

          <Card className="animate-slide-up" hover>
            <div className="text-3xl mb-4">⭐</div>
            <h3 className="text-lg font-bold mb-2">AI Package Generator</h3>
            <p className="text-sm text-[var(--text-secondary)]">
              Personal statement, tailored document checklist, 0-100 readiness
              score, and interview Q&A — all in under 60 seconds.
            </p>
          </Card>

          <Card className="animate-slide-up" hover>
            <div className="text-3xl mb-4">🎙️</div>
            <h3 className="text-lg font-bold mb-2">Mock Interview</h3>
            <p className="text-sm text-[var(--text-secondary)]">
              Practice with an AI consular officer that asks real 214(b)
              questions and scores your spoken answers live.
            </p>
          </Card>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-4 sm:gap-6 mt-12">
          {[
            { value: "1M+", label: "Indian visa apps/year" },
            { value: "~16%", label: "B-1/B-2 refusal rate" },
            { value: "10x", label: "cheaper than attorneys" },
          ].map((stat) => (
            <div key={stat.label} className="text-center">
              <div className="text-2xl md:text-3xl font-bold text-[var(--trust-blue)]">
                {stat.value}
              </div>
              <div className="text-xs text-[var(--text-secondary)] mt-1">
                {stat.label}
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
