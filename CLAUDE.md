# CLAUDE.md — VisaPath AI (read this every session)

## What we're building
A demo-safe web app that helps Indian B-1/B-2 visa applicants beat the 214(b)
refusal: ~20-question intake -> AI-generated package (statement + checklist +
0-100 readiness score + interview Q&A) -> in-browser spoken AI mock consular
interview -> 7-stage tracker. Goal: win the buildathon with a 5-min live demo.

## Read first, in this order, every new session
1. docs/00-briefing.md        (mission, locked decisions, teams)
2. docs/02-technical-prd.md   (ENGINEERING SOURCE OF TRUTH - read fully)
3. docs/01-product-prd.md     (the why/positioning only)
4. docs/03-agent-prompts-kb.md(ElevenLabs persona + 214(b) question bank)
5. docs/04-kickoff.md         (build plan SS3, team prompts SS4/SS5, DoD SS7)

## Session bootstrap - do this FIRST (including restarts after context fills)
1. read AGENTS.md + context/memory/agents/<you>.md -> recover state + next step
2. read context/status.json + context/contracts/  -> current project state
3. read context/memory/users/<id>.md if a user is involved
4. RESUME where you left off; never restart from scratch
5. as you work: update your memory file + append to context/handoffs.jsonl

## Hard rules (non-negotiable)
- Stack: Next.js 14+ App Router + TypeScript 7 (typescript@rc, ALREADY installed
  via npm install -D typescript@rc - do NOT downgrade) + Tailwind + shadcn/ui;
  Zustand + localStorage (NO database); deploy on Replit.
- LLM + voice = ElevenLabs Agents ONLY; model = Claude Sonnet; ONE API key for
  BOTH text (package) and voice (interview). 200k ElevenLabs credits available.
- SECURITY: ELEVENLABS_API_KEY lives in server routes / Replit Secrets ONLY.
  Never reaches the client; browser only gets a short-lived signed URL. Never
  hardcode or print the key.
- Contracts first: context/contracts/types.ts + api.md + tokens.ts are law.
- Use ONLY the design tokens + fixed component API (Button, Card, ScoreRing,
  MicButton, Stepper). No ad-hoc colors/styles.
- Demo-safe: cached fallback for everything; never show a dead screen.
- Scope: B-1/B-2 only; Copilot = static teaser screen, no logic.

## Build plan & done
Follow docs/04-kickoff.md SS3 phase plan; nothing is "done" until it passes the
SS7 Definition of Done. Edge cases = technical PRD SS20.

## Commands
- install: npm install   - dev: npm run dev   - build: npm run build
- typecheck: npx tsc --noEmit
