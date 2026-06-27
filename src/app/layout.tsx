import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "VisaPath AI — Beat the 214(b) Refusal",
  description:
    "AI-powered US visa preparation for Indian applicants. Get a personalized package — statement, checklist, readiness score, and mock interview — in 20 minutes.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="min-h-screen antialiased">
        <div className="flex flex-col min-h-screen">
          {/* Header */}
          <header className="sticky top-0 z-50 border-b border-[var(--border)] bg-[var(--bg-base)]/90 backdrop-blur-md">
            <div className="max-w-5xl mx-auto px-4 h-14 flex items-center justify-between">
              <a href="/" className="flex items-center gap-2 group">
                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[var(--trust-blue)] to-[var(--indigo-deep)] flex items-center justify-center text-white font-bold text-sm">
                  V
                </div>
                <span className="text-lg font-bold text-[var(--text-primary)] group-hover:text-[var(--trust-blue)] transition-colors">
                  VisaPath<span className="text-[var(--trust-blue)]">AI</span>
                </span>
              </a>
              <div className="flex items-center gap-3">
                <span className="text-xs px-3 py-1.5 rounded-full bg-[var(--bg-mid)] text-[var(--text-secondary)] border border-[var(--border)]">
                  B-1/B-2 Visa
                </span>
              </div>
            </div>
          </header>

          {/* Main content */}
          <main className="flex-1">{children}</main>

          {/* Footer */}
          <footer className="border-t border-[var(--border)] bg-[var(--bg-surface)]">
            <div className="max-w-5xl mx-auto px-4 py-4 flex items-center justify-between text-xs text-[var(--text-secondary)]">
              <span>AI-assisted preparation · Not legal advice</span>
              <span>VisaPath AI © 2026</span>
            </div>
          </footer>
        </div>
      </body>
    </html>
  );
}
