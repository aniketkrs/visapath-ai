"use client";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { useRouter } from "next/navigation";
import { useState } from "react";

const FEATURES = [
  {
    icon: "📁",
    title: "Document Vault",
    description: "Store all your visa documents securely in one place",
  },
  {
    icon: "⏰",
    title: "Smart Deadlines",
    description: "Never miss a visa deadline with proactive reminders",
  },
  {
    icon: "🛤️",
    title: "Lifecycle Pathway",
    description:
      "Guidance through every immigration stage: F-1 → OPT → H-1B → Green Card",
  },
  {
    icon: "📊",
    title: "Compliance Radar",
    description:
      "Real-time alerts on policy changes affecting your status",
  },
];

const RADAR_RINGS = [1, 0.75, 0.5, 0.25];

export default function CopilotPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [submitted, setSubmitted] = useState(false);

  return (
    <div className="max-w-4xl mx-auto px-4 py-12">
      {/* Hero */}
      <div className="text-center mb-14 animate-fade-in">
        <span className="inline-block text-xs font-semibold uppercase tracking-widest text-[var(--trust-blue)] bg-[var(--trust-blue)]/10 border border-[var(--trust-blue)]/20 rounded-full px-4 py-1.5 mb-6">
          Coming Soon
        </span>
        <h1 className="text-4xl sm:text-5xl font-bold mb-4 bg-gradient-to-r from-[var(--text-primary)] via-[var(--trust-blue)] to-[var(--indigo-deep)] bg-clip-text text-transparent">
          VisaPath Copilot
        </h1>
        <p className="text-[var(--text-secondary)] text-lg max-w-xl mx-auto">
          Your always-on immigration companion — from first application to
          permanent residency.
        </p>
      </div>

      {/* Feature cards */}
      <div className="grid sm:grid-cols-2 gap-5 mb-16">
        {FEATURES.map((feature, i) => (
          <Card
            key={i}
            className="animate-slide-up group hover:border-[var(--trust-blue)]/40 transition-all duration-300"
            style={{ animationDelay: `${i * 0.08}s` }}
          >
            <div className="flex items-start gap-4">
              <span className="text-3xl shrink-0">{feature.icon}</span>
              <div>
                <h3 className="text-lg font-bold mb-1 group-hover:text-[var(--trust-blue)] transition-colors">
                  {feature.title}
                </h3>
                <p className="text-sm text-[var(--text-secondary)] leading-relaxed">
                  {feature.description}
                </p>
              </div>
            </div>
          </Card>
        ))}
      </div>

      {/* Deadline Radar */}
      <div className="flex flex-col items-center mb-16 animate-slide-up" style={{ animationDelay: "0.3s" }}>
        <h2 className="text-sm font-semibold text-[var(--text-secondary)] uppercase tracking-wider mb-8">
          Deadline Radar Preview
        </h2>
        <div className="relative w-64 h-64">
          <svg viewBox="0 0 200 200" className="w-full h-full">
            {/* Radar rings */}
            {RADAR_RINGS.map((scale, i) => (
              <circle
                key={i}
                cx="100"
                cy="100"
                r={80 * scale}
                fill="none"
                stroke="var(--border)"
                strokeWidth="0.8"
                opacity={0.5 + i * 0.1}
              />
            ))}
            {/* Cross hairs */}
            <line x1="100" y1="10" x2="100" y2="190" stroke="var(--border)" strokeWidth="0.5" opacity="0.3" />
            <line x1="10" y1="100" x2="190" y2="100" stroke="var(--border)" strokeWidth="0.5" opacity="0.3" />
            {/* Sweep */}
            <line
              x1="100"
              y1="100"
              x2="100"
              y2="20"
              stroke="var(--trust-blue)"
              strokeWidth="2"
              strokeLinecap="round"
              className="animate-spin-slow origin-[100px_100px]"
              style={{ transformOrigin: "100px 100px" }}
            />
            {/* Sweep glow cone */}
            <path
              d="M100,100 L100,20 A80,80 0 0,0 56.6,43.4 Z"
              fill="url(#sweepGrad)"
              className="animate-spin-slow origin-[100px_100px]"
              style={{ transformOrigin: "100px 100px" }}
            />
            <defs>
              <linearGradient id="sweepGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="var(--trust-blue)" stopOpacity="0.3" />
                <stop offset="100%" stopColor="var(--trust-blue)" stopOpacity="0" />
              </linearGradient>
            </defs>
            {/* Blips */}
            <circle cx="70" cy="50" r="4" fill="var(--score-strong)" className="animate-pulse" />
            <circle cx="140" cy="70" r="3.5" fill="var(--score-moderate)" className="animate-pulse" style={{ animationDelay: "0.5s" }} />
            <circle cx="110" cy="140" r="3" fill="var(--score-weak)" className="animate-pulse" style={{ animationDelay: "1s" }} />
            {/* Center dot */}
            <circle cx="100" cy="100" r="4" fill="var(--trust-blue)" />
            <circle cx="100" cy="100" r="2" fill="white" />
          </svg>
        </div>
        <p className="text-xs text-[var(--text-secondary)] mt-4 max-w-xs text-center">
          Visualize upcoming deadlines, policy changes, and action items on your
          immigration radar
        </p>
      </div>

      {/* Notify CTA */}
      <div className="max-w-md mx-auto text-center animate-slide-up" style={{ animationDelay: "0.4s" }}>
        <h2 className="text-xl font-bold mb-2">Get Early Access</h2>
        <p className="text-sm text-[var(--text-secondary)] mb-6">
          Be the first to know when Copilot launches.
        </p>
        {submitted ? (
          <div className="bg-[var(--score-strong)]/10 border border-[var(--score-strong)]/30 rounded-xl p-4 animate-fade-in">
            <p className="text-[var(--score-strong)] font-semibold text-sm">
              You&apos;re on the list! We&apos;ll notify you at launch.
            </p>
          </div>
        ) : (
          <div className="flex gap-3">
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="your@email.com"
              className="flex-1 bg-[var(--bg-mid)] border border-[var(--border)] rounded-full px-5 py-3 text-sm text-[var(--text-primary)] placeholder:text-[var(--text-secondary)] focus:outline-none focus:border-[var(--trust-blue)] focus:ring-1 focus:ring-[var(--trust-blue)] transition-all"
            />
            <Button
              variant="primary"
              size="md"
              onClick={() => {
                if (email.includes("@")) setSubmitted(true);
              }}
            >
              Notify Me
            </Button>
          </div>
        )}
      </div>

      {/* Back button */}
      <div className="text-center mt-12 animate-fade-in" style={{ animationDelay: "0.5s" }}>
        <Button variant="ghost" onClick={() => router.push("/tracker")}>
          <svg
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="mr-2"
          >
            <polyline points="15 18 9 12 15 6" />
          </svg>
          Back to Tracker
        </Button>
      </div>
    </div>
  );
}
