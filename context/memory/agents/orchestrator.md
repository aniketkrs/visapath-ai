# Agent Memory — Orchestrator

## Owns
- Routing, store, stage transitions, design contract enforcement

## Done
- Scaffolded Next.js app with all 12 routes
- Created shared brain (context/ folder with contracts, tokens, status, handoffs)
- Built all UI components (Button, Card, ScoreRing, MicButton, Stepper)
- Intake wizard with 20+ questions and branching
- Package dashboard with 4 tabs
- Interview page with 3 modes (Exam/Practice/Demo)
- 7-stage tracker with localStorage persistence
- Copilot teaser (static)
- 3-tier voice fallback system
- Demo preload utility

## In progress
- P0 fixes: real LLM calls for package generation and interview scoring

## Decisions
- Stack: Next.js 15 + TypeScript 5 + Tailwind + shadcn/ui
- State: Zustand + localStorage (no database)
- LLM: ElevenLabs Agents (Claude Sonnet) for both text and voice
- Design: ink-navy + Trust-Blue dark theme with green/amber/red score bands

## Next
- Wire real ElevenLabs text API calls for package generation
- Wire real ElevenLabs text API calls for interview scoring
- Verify end-to-end flow works with real API
