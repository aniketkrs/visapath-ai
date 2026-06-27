# VisaPath AI Build Squad

## Squad Index

| Agent | Owns | Memory File |
|-------|------|-------------|
| 🧠 Orchestrator | Routing, store, stage transitions | `context/memory/agents/orchestrator.md` |
| 🎨 Design/UX | Design tokens, component library | `context/memory/agents/design.md` |
| 📝 Intake | Question schema, wizard, branching | `context/memory/agents/intake.md` |
| ⭐ Package Generator | /api/generate-package, scoring | `context/memory/agents/package.md` |
| 🎙️ Voice Interview | Voice routes, interview UI | `context/memory/agents/voice.md` |
| 📄 Tracker | 7-stage tracker + copilot teaser | `context/memory/agents/tracker.md` |

## Shared Brain
- `context/project.md` — locked decisions
- `context/contracts/types.ts` — shared data models
- `context/contracts/api.md` — API endpoint contracts
- `context/tokens.ts` — design tokens
- `context/handoffs.jsonl` — append-only handoff log
- `context/status.json` — live project status

## Session Bootstrap
1. Read this file + your agent memory file
2. Read `context/status.json` + relevant contracts
3. Resume where you left off
4. Update your memory file + append handoffs as you work

## Hard Rules
- Stack: Next.js 14+ App Router + TypeScript 7 + Tailwind + shadcn/ui
- ElevenLabs ONLY for LLM + voice
- API key server-side only — never in client bundles
- Contracts are law — change with `contractsTouched` handoff
- Design tokens + component API only — no ad-hoc styles
- Demo-safe: cached fallback for everything
- Scope: B-1/B-2 only; Copilot = static teaser
