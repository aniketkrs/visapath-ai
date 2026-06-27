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
          <p className="text-lg md:text-xl text-[var(--text-secondary)] max-w-2xl mx-auto mb-6 animate-slide-up" style={{ animationDelay: "0.1s" }}>
            What your immigration attorney charges ₹45,000 for — personalized statement,
            document checklist, readiness score, and mock interview prep — for{" "}
            <span className="text-[var(--trust-blue)] font-semibold">₹2,999</span>.
          </p>

          {/* Price comparison strip */}
          <div className="inline-flex items-center gap-4 px-6 py-3 rounded-full bg-[var(--bg-surface)] border border-[var(--border)] mb-10 animate-slide-up" style={{ animationDelay: "0.15s" }}>
            <span className="text-sm text-[var(--text-secondary)] line-through">₹45,000 attorney</span>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--score-strong)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="9 18 15 12 9 6" />
            </svg>
            <span className="text-sm font-bold text-[var(--trust-blue)]">₹2,999 AI-powered</span>
            <span className="text-xs px-2 py-0.5 rounded-full bg-[var(--score-strong)]/10 text-[var(--score-strong)] font-medium">Save 93%</span>
          </div>

          {/* CTA */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center animate-slide-up" style={{ animationDelay: "0.2s" }}>
            <Button size="lg" onClick={() => router.push("/select")}>
              Start Your Application →
            </Button>
            <Button variant="secondary" size="lg" onClick={() => { preloadDemo(); router.push("/package"); }}>
              See Sample Package
            </Button>
          </div>

          {/* Trust indicators */}
          <div className="flex flex-wrap justify-center gap-6 mt-8 animate-fade-in" style={{ animationDelay: "0.3s" }}>
            {[
              { icon: "🔒", text: "Data stays in your browser" },
              { icon: "👤", text: "No account required" },
              { icon: "⚡", text: "Results in under 60 seconds" },
            ].map((item) => (
              <div key={item.text} className="flex items-center gap-2">
                <span className="text-sm">{item.icon}</span>
                <span className="text-xs text-[var(--text-secondary)]">{item.text}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* What You'll Get */}
      <section className="max-w-5xl mx-auto px-4 pb-16">
        <div className="text-center mb-10">
          <h2 className="text-2xl sm:text-3xl font-bold mb-3">What you&apos;ll get</h2>
          <p className="text-[var(--text-secondary)] max-w-xl mx-auto">
            Everything an immigration attorney prepares — generated by AI in minutes, not weeks.
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-5">
          {[
            {
              icon: "📝",
              title: "Personalized Consulate Statement",
              desc: "A 400–500 word statement addressed to the consular officer, tailored to your profile, purpose, and ties to India.",
              badge: "400–500 words",
            },
            {
              icon: "📋",
              title: "Document Checklist",
              desc: "Category-wise checklist (Identity, Financial, Ties, Purpose) with where to get each document and freshness rules.",
              badge: "Tailored to you",
            },
            {
              icon: "📊",
              title: "Readiness Score",
              desc: "0–100 score across 5 dimensions with specific improvement tips for each weak area.",
              badge: "0–100 score",
            },
            {
              icon: "🎙️",
              title: "Mock Interview Prep",
              desc: "5–8 likely consular questions with suggested answers, plus a live AI mock interview with scoring.",
              badge: "AI consular officer",
            },
          ].map((item) => (
            <Card key={item.title} className="flex gap-4 animate-slide-up" hover>
              <div className="text-3xl shrink-0">{item.icon}</div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-2">
                  <h3 className="text-base font-bold">{item.title}</h3>
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-[var(--trust-blue)]/10 text-[var(--trust-blue)] font-medium border border-[var(--trust-blue)]/20">
                    {item.badge}
                  </span>
                </div>
                <p className="text-sm text-[var(--text-secondary)] leading-relaxed">{item.desc}</p>
              </div>
            </Card>
          ))}
        </div>
      </section>

      {/* Sample Preview */}
      <section className="max-w-5xl mx-auto px-4 pb-16">
        <div className="rounded-2xl border border-[var(--border)] bg-[var(--bg-surface)] p-6 sm:p-8 shadow-[var(--shadow-card)]">
          <div className="flex items-center gap-2 mb-6">
            <span className="w-2 h-2 rounded-full bg-[var(--score-strong)]" />
            <span className="text-xs text-[var(--text-secondary)] font-medium uppercase tracking-wider">Sample Package Preview</span>
          </div>

          <div className="grid sm:grid-cols-3 gap-6">
            {/* Sample Statement */}
            <div>
              <div className="flex items-center gap-2 mb-3">
                <span className="text-sm">📝</span>
                <span className="text-sm font-semibold">Statement</span>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-[var(--bg-mid)] text-[var(--text-secondary)]">487 words</span>
              </div>
              <div className="space-y-2">
                <div className="h-2.5 bg-[var(--bg-mid)] rounded-full w-full" />
                <div className="h-2.5 bg-[var(--bg-mid)] rounded-full w-11/12" />
                <div className="h-2.5 bg-[var(--bg-mid)] rounded-full w-full" />
                <div className="h-2.5 bg-[var(--bg-mid)] rounded-full w-9/12" />
                <div className="h-2.5 bg-[var(--bg-mid)] rounded-full w-full" />
                <div className="h-2.5 bg-[var(--bg-mid)] rounded-full w-4/5" />
              </div>
              <p className="text-[11px] text-[var(--text-secondary)] mt-3">Addressed to: Consular Officer, US Embassy, New Delhi</p>
            </div>

            {/* Sample Score */}
            <div className="flex flex-col items-center justify-center">
              <div className="relative w-24 h-24">
                <svg className="w-24 h-24 -rotate-90" viewBox="0 0 100 100">
                  <circle cx="50" cy="50" r="42" fill="none" stroke="var(--bg-mid)" strokeWidth="8" />
                  <circle cx="50" cy="50" r="42" fill="none" stroke="var(--score-strong)" strokeWidth="8" strokeDasharray={`${78 * 2.64} ${100 * 2.64}`} strokeLinecap="round" />
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <span className="text-xl font-bold text-[var(--score-strong)]">78</span>
                  <span className="text-[10px] text-[var(--text-secondary)]">/100</span>
                </div>
              </div>
              <span className="text-xs font-semibold text-[var(--score-strong)] mt-2">Strong</span>
              <span className="text-[11px] text-[var(--text-secondary)]">Readiness Score</span>
            </div>

            {/* Sample Checklist */}
            <div>
              <div className="flex items-center gap-2 mb-3">
                <span className="text-sm">📋</span>
                <span className="text-sm font-semibold">Checklist</span>
              </div>
              <div className="flex flex-wrap gap-2 mb-3">
                {[
                  { cat: "Identity", count: 5, color: "var(--trust-blue)" },
                  { cat: "Financial", count: 4, color: "var(--score-strong)" },
                  { cat: "Ties", count: 2, color: "var(--indigo-deep)" },
                ].map((c) => (
                  <span key={c.cat} className="text-[10px] px-2 py-1 rounded-full border" style={{ borderColor: `${c.color}30`, color: c.color, backgroundColor: `${c.color}10` }}>
                    {c.cat} ({c.count})
                  </span>
                ))}
              </div>
              <div className="space-y-1.5">
                {["Passport (original + copy)", "Bank statements (6 months)", "Employer letter", "Property documents"].map((item) => (
                  <div key={item} className="flex items-center gap-2">
                    <div className="w-3.5 h-3.5 rounded border border-[var(--border)]" />
                    <span className="text-[11px] text-[var(--text-secondary)]">{item}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="mt-6 pt-5 border-t border-[var(--border)] text-center">
            <p className="text-xs text-[var(--text-secondary)] mb-3">This is a sample preview. Your package will be fully personalized.</p>
            <Button size="sm" onClick={() => router.push("/select")}>
              Generate Your Package →
            </Button>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="max-w-5xl mx-auto px-4 pb-16">
        <h2 className="text-2xl font-bold text-center mb-10">How it works</h2>
        <div className="grid md:grid-cols-4 gap-6">
          {[
            { step: "1", icon: "📝", title: "Quick intake", desc: "20 questions about your trip, background, and ties to India" },
            { step: "2", icon: "🤖", title: "AI generates", desc: "Statement, checklist, score & questions — in under 60 seconds" },
            { step: "3", icon: "🎙️", title: "Practice interview", desc: "Get scored by an AI consular officer on your answers" },
            { step: "4", icon: "✈️", title: "Track your visa", desc: "7-stage tracker from package to passport stamp" },
          ].map((item) => (
            <div key={item.step} className="text-center">
              <div className="w-10 h-10 rounded-full bg-[var(--trust-blue)] text-white text-sm font-bold flex items-center justify-center mx-auto mb-3">
                {item.step}
              </div>
              <div className="text-2xl mb-2">{item.icon}</div>
              <h3 className="text-sm font-bold mb-1">{item.title}</h3>
              <p className="text-xs text-[var(--text-secondary)]">{item.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Features */}
      <section className="max-w-5xl mx-auto px-4 pb-20">
        <div className="grid md:grid-cols-3 gap-6">
          <Card className="animate-slide-up" hover>
            <div className="text-3xl mb-4">📝</div>
            <h3 className="text-lg font-bold mb-2">Smart Intake</h3>
            <p className="text-sm text-[var(--text-secondary)]">
              ~20 adaptive questions organized into 5 sections, branching intelligently based on your
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
            { value: "93%", label: "savings vs attorneys" },
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
