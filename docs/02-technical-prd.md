# VisaPath AI — Technical PRD (Engineering Spec for Build Agents)

<aside>
⚙️

**Audience:** the engineering / build agents. **Companion doc:** the product PRD lives at [VisaPath AI — Product PRD](https://app.notion.com/p/VisaPath-AI-PRD-Problem-15-Buildathon-Trophy-Edition-500c40f6e09d497ab02bc5ba0f0cd0af?pvs=21) (the *why* and *what*). This doc is the *how*. Build target: a working, demo-safe web app in one buildathon session (~5 hours) using Replit + ElevenLabs (Agents SDK for both chat and voice). **Paste-ready agent system prompts + the 214(b) knowledge base:** [VisaPath AI — Agent Prompts & 214(b) Knowledge Base](https://app.notion.com/p/VisaPath-AI-Agent-Prompts-214-b-Knowledge-Base-5ea5aa6c4faf4b47bfcc5899b887e38f?pvs=21).

</aside>

## 0. TL;DR for the build agent

- **Ship one flow end-to-end:** Landing → Visa-type select (only **B-1/B-2** live) → 20-question adaptive Intake → an ElevenLabs text agent generates the **package** (statement + checklist + 0–100 score + interview Q&A) → **Voice mock interview** (ElevenLabs, in-browser) → 7-stage Tracker.
- **Stack:** Next.js (App Router) + TypeScript + Tailwind. **ElevenLabs Agents SDK powers BOTH the chat (text package generation) and the voice mock interview** — one provider, one API key. Voice via `@elevenlabs/react` (WebRTC, no telephony); all calls proxied by server route handlers.
- **No database for the demo.** State lives in React + `localStorage`. All secrets server-side only.
- **Non-negotiable:** a **cached fallback package + cached voice exchange** so a slow/failed API call never breaks the stage demo.
- **Copilot (Feature 5) is v2** — data models are specced here but NOT built in the 5-hour run.

## 1. System architecture

<aside>
🧱

Thin client, thin server. The browser runs the UI + the ElevenLabs WebRTC voice session. A few stateless Next.js route handlers call the ElevenLabs Agents API (text + voice) and mint short-lived signed URLs so the ElevenLabs key never reaches the client.

</aside>

```jsx
┌──────────────────────────────────────────────────────────┐
│  Browser (Next.js client, mobile-first)                   │
│   • Intake wizard (state + localStorage)                  │
│   • Package dashboard (statement/checklist/score tabs)    │
│   • Voice mock interview  ──WebRTC──┐                      │
│   • Tracker (localStorage)          │                     │
└───────────────┬─────────────────────┼────────────────────┘
                │ fetch (JSON)        │ realtime audio
                ▼                     ▼
     ┌─────────────────────┐   ┌──────────────────────────┐
     │ Next.js route        │   │ ElevenLabs Agents         │
     │ handlers (server)    │   │ (STT + TTS + turn-taking) │
     │ • /api/generate-     │   │  brain = built-in LLM (   │
     │   package            │   │  GPT/Claude/Gemini)      │
     │ • /api/interview/turn│   └──────────────┬───────────┘
     │ • /api/voice/        │                  │ transcript
     │   signed-url         │                  ▼
     │        │ ElevenLabs   │        /api/interview/turn
     └────────┼─────────────┘        (ElevenLabs scoring)
              ▼
      ┌───────────────┐
      │ ElevenLabs    │
      │ Agents (LLM)  │
      └───────────────┘
```

## 2. Tech stack & rationale

| Layer | Choice | Why |
| --- | --- | --- |
| Framework | Next.js 14+ (App Router) + TypeScript | One repo for UI + serverless API; runs on Replit/Vercel; keeps the ElevenLabs key server-side |
| UI | React + Tailwind CSS + shadcn/ui | Fast, mobile-first, professional-looking output for the demo |
| State | React state + Zustand (or Context) + `localStorage` | No backend DB needed for the demo; session survives refresh |
| LLM / agents | ElevenLabs Agents — model = **Claude Sonnet** (selected in dashboard), text + voice; **200k ElevenLabs credits granted** | ONE provider + ONE SDK + ONE key powers both the chat package generation and the voice interview; the agent handles its own reasoning/turn-taking/response logic; model swappable in the dashboard if ever needed |
| Voice | ElevenLabs Agents + `@elevenlabs/react` | In-browser WebRTC voice, STT+TTS, Hinglish; no phone, demo-safe |
| Hosting | Replit (build) → Vercel (optional) | Zero-config deploy, secrets manager for keys |
| Payments | Stubbed (Razorpay later) | Out of scope for the demo; skip the paywall |

## 3. Repository structure

```jsx
visapath/
├─ app/
│  ├─ page.tsx                  # Landing
│  ├─ select/page.tsx           # Visa-type selector
│  ├─ intake/page.tsx           # Wizard host
│  ├─ generating/page.tsx       # Animated loading
│  ├─ package/page.tsx          # Dashboard (tabs)
│  ├─ interview/page.tsx        # Voice mock interview
│  ├─ tracker/page.tsx          # 7-stage tracker
│  └─ api/
│     ├─ generate-package/route.ts
│     ├─ interview/turn/route.ts
│     └─ voice/signed-url/route.ts
├─ lib/
│  ├─ intake/schema.ts          # questions + branching
│  ├─ llm.ts                 # ElevenLabs Agents client (text + voice)
│  ├─ prompts/package.ts        # system prompt
│  ├─ prompts/interview.ts      # officer/scorer prompt
│  ├─ scoring.ts                # completeness rubric
│  ├─ fixtures/sample-package.ts # CACHED demo fallback
│  └─ types.ts                  # shared data models
├─ components/                  # wizard, tabs, score ring, mic UI
└─ store/                       # zustand store + localStorage sync
```

## 4. Environment variables & secrets

<aside>
🔑

Store in Replit Secrets / Vercel env. **Never** expose to the client; all usage is inside route handlers.

</aside>

```jsx
ELEVENLABS_API_KEY=...              # server only — the ONLY provider key needed
ELEVENLABS_VOICE_AGENT_ID=...       # consular-officer agent (voice mode)
ELEVENLABS_TEXT_AGENT_ID=...        # package-generator agent (text/chat mode)
NEXT_PUBLIC_APP_ENV=demo       # toggles cached-fallback behaviour
```

## 5. Data models (TypeScript)

```tsx
export type VisaType = "B1_B2" | "F1"; // F1 = v2

export interface IntakeAnswers {
  visaType: VisaType;
  fullName: string;
  dateOfBirth: string;          // ISO
  passportNumber: string;
  passportExpiry: string;       // ISO
  purposeOfVisit: "tourism" | "business" | "medical" | "family_visit" | "conference";
  travelStartDate: string;
  travelDurationDays: number;
  employmentStatus: "salaried" | "self_employed" | "student" | "retired" | "homemaker";
  employerName?: string;
  monthlyIncomeINR?: number;
  annualTurnoverINR?: number;   // self-employed
  assetsINR?: number;
  dependentsInIndia: number;
  priorUsVisa: boolean;
  priorUsVisaOutcome?: "approved" | "refused_214b" | "refused_other";
  internationalTravelHistory: string[]; // ISO country codes
  usPointOfContact?: { name: string; relation: string; city: string };
}

export interface PersonalStatement {
  addressedTo: string;          // "U.S. Consulate General, <city>"
  body: string;                 // 400–500 words
  wordCount: number;
}

export interface ChecklistItem {
  id: string;
  name: string;
  reason: string;               // one line
  whereToGet: string;
  copyType: "original" | "copy" | "both";
  freshnessRule?: string;       // "issued within 3 months"
  category: "identity" | "financial" | "ties" | "purpose" | "travel";
  required: boolean;
}

export interface ScoreSection {
  key: "financial" | "ties" | "history" | "purpose" | "documentation";
  score: number;
  max: number;                  // 20/25/15/20/20
  reason: string;
}

export interface CompletenessScore {
  total: number;                // 0–100
  band: "strong" | "moderate" | "weak";
  sections: ScoreSection[];
  fixes: string[];              // populated when total < 70
}

export interface InterviewQuestion {
  id: string;
  officerPrompt: string;
  intent: "ties" | "finances" | "purpose" | "history" | "consistency";
  suggestedAnswer: string;      // Practice mode only
}

export interface GeneratedPackage {
  statement: PersonalStatement;
  checklist: ChecklistItem[];
  score: CompletenessScore;
  interviewQuestions: InterviewQuestion[];
  generatedAt: string;
}
```

## 6. Intake engine spec (questions + branching)

<aside>
📝

~20 questions, one per screen, progress bar, Back button, autosave to `localStorage`. The *intelligence is in the branching*, not the count.

</aside>

**Base questions (always asked):** full name · DOB · passport number + expiry · purpose of visit · travel start + duration · employment status · dependents in India · India assets (own home / land / business) · prior US visa (Y/N) · international travel history · US point of contact.

**Branching rules:**

| Trigger | Adds questions / effect |
| --- | --- |
| employmentStatus = salaried | employer name, monthly income, years at job → drives NOC + salary-slip checklist |
| employmentStatus = self_employed | annual turnover, GST registered?, headcount → drives GST/ITR/registration checklist |
| employmentStatus = retired | pension source → pension-certificate item |
| priorUsVisa = true | outcome (approved / refused 214b / refused other) → tone + denial-mitigation |
| priorUsVisaOutcome = refused_214b | "what changed since?" → adds denial-mitigation paragraph + changed-circumstances doc |
| purpose = medical | hospital + appointment date → unlocks hospital-appointment checklist item |
| purpose = business | inviting company + meeting purpose → invitation-letter item |
| first-time traveller (no intl history) | stronger ties-to-India emphasis in statement prompt |

Implement as a declarative array in `lib/intake/schema.ts`: each question has `id`, `label`, `type` (text/number/select/bool), `showIf(answers)` predicate, and `validate`.

## 7. Package Generator — ElevenLabs text-agent prompt & output contract

<aside>
⭐

**One server call** (`POST /api/generate-package`) takes `IntakeAnswers`, returns a `GeneratedPackage` as strict JSON. The handler sends the profile as a single message to the **ElevenLabs text agent** (chat mode), whose system prompt forces ONLY `GeneratedPackage` JSON back, so parsing never relies on prose scraping.

</aside>

**System prompt (`lib/prompts/package.ts`):**

```
You are VisaPath's 214(b)-specialized US visa preparation engine for Indian
outbound applicants. Given a structured applicant profile, output ONLY valid
JSON matching the GeneratedPackage schema provided as a tool.

Rules:
- personal statement: 400–500 words, first person, addressed to the US
  Consulate. It MUST establish (a) purpose & itinerary, (b) financial
  capability using the concrete INR figures from the profile, (c) strong ties
  to India guaranteeing return (job, family, dependents, assets), (d) explicit
  acknowledgement of temporary intent.
- NEVER invent facts absent from the profile. If a fact is missing, write
  around it; do not fabricate amounts, employers, or relationships.
- checklist: tailor to employmentStatus. salaried -> employer NOC + 3 months
  salary slips + Form 16; self_employed -> GST returns + ITR + company
  registration + 6 months bank statements; retired -> pension certificate.
  Every item needs a one-line reason, whereToGet, copyType, freshnessRule.
- if priorUsVisaOutcome == 'refused_214b': add a denial-mitigation paragraph
  to the statement and a 'changed circumstances' checklist item.
- compute completenessScore using the fixed rubric (financial 20, ties 25,
  history 15, purpose 20, documentation 20). Populate 'fixes' when total < 70.
- generate 8–10 interviewQuestions with intent tags and a suggestedAnswer each.
- Output strictly the tool JSON. No prose. No markdown fences.
```

**Route handler contract:**

```tsx
// POST /api/generate-package
// body: IntakeAnswers  ->  200: GeneratedPackage | 500 -> client uses cached fixture
```

**Resilience:** wrap the call with a timeout (e.g. 25s); on error or timeout in `demo` env, return `lib/fixtures/sample-package.ts` so the UI always renders.

## 8. Completeness Score algorithm

<aside>
📊

The rubric is deterministic and transparent — compute it in `lib/scoring.ts` (do NOT let the model freestyle the number). The LLM only writes the per-section `reason` text.

</aside>

| Section (max) | Scoring logic (illustrative) |
| --- | --- |
| Financial strength (20) | income/turnover & assets vs trip cost; bands map to 0/8/14/20 |
| Ties to India (25) | job + dependents + property + business; each present adds points |
| Travel/visa history (15) | prior approvals + international travel boost; prior 214b refusal lowers |
| Purpose clarity (20) | specific purpose, dates, itinerary, POC present |
| Documentation completeness (20) | share of required checklist items the applicant confirms they can provide |

Bands: **strong ≥ 80 · moderate 60–79 · weak < 60.** Total < 70 → show warning + `fixes[]`; < 50 → block the "ready to apply" CTA with specific actions.

## 9. Voice Mock Interview — ElevenLabs architecture

<aside>
🎙️

**In-browser WebRTC, never telephony.** Create one ElevenLabs Conversational AI agent (the consular officer); the client joins via `@elevenlabs/react`; the server mints a short-lived signed URL so the API key stays server-side.

</aside>

**Setup options (pick A for speed):**

- **A — EL-hosted brain (fastest):** configure the agent in the ElevenLabs dashboard with the officer system prompt + a knowledge base = the **India 214(b) question bank**. Score the run post-call via conversation analysis / success-evaluation, or pipe the transcript to `/api/interview/turn` for ElevenLabs-agent scoring (a text-mode agent grades the transcript).
- **B — Built-in LLM (chosen):** **Claude Sonnet** is selected directly in the ElevenLabs agent dashboard — no separate provider key, no extra infra. The agent owns its own reasoning + response behavior; ElevenLabs granted **200k credits** for the build + demo.

**Client flow (`app/interview/page.tsx`):**

```tsx
import { useConversation } from "@elevenlabs/react";
// 1. GET /api/voice/signed-url -> { signedUrl }
// 2. conversation.startSession({ signedUrl })
// 3. on each user transcript turn -> POST /api/interview/turn for live score
// 4. Exam mode: hide suggestedAnswer + scores until the end report
// 5. Practice mode: reveal suggestedAnswer + per-turn score inline
```

**Scorer prompt (`lib/prompts/interview.ts`):**

```
You are a US consular officer interviewing an Indian B-1/B-2 applicant AND a
strict examiner. Given the applicant's spoken answer (STT text) plus their
profile, return JSON: { confidence, consistency, tiesStrength, redFlags[],
followUp }. Scores 0–100. Keep it realistic and terse, like a 60–90s consular
interview. Ask ONE tailored follow-up probing the weakest part of the answer.
If the answer contradicts the profile, add it to redFlags.
```

**Turn contract:**

```tsx
// POST /api/interview/turn
// body: { questionId, transcript, profile, history }
// 200: { confidence, consistency, tiesStrength, redFlags[], followUp }
```

**Demo-safety:** pre-cache one full officer↔applicant exchange + audio so the cold-open works even on bad venue WiFi.

## 10. Status Tracker spec

7 stages, `localStorage`-persisted, no backend: (1) Package generated → (2) Documents collected → (3) DS-160 done → (4) Fee paid → (5) Appointment booked → (6) Interview done → (7) Visa received. Store as `{ stage: number; updatedAt: string }`; render as a vertical stepper the user taps to advance.

## 11. VisaPath Copilot (v2) — data model & proactive engine

<aside>
🧭

**Not in the 5-hour build.** Specced here so the architecture leaves room. Copilot is a *system of record + proactive engine*, NOT a chatbot — the moat is private state + proactivity + verified rules (see product PRD).

</aside>

```tsx
export interface VaultDocument {
  id: string;
  type: "passport" | "visa" | "i20" | "ds2019" | "i797" | "ead" | "bank_statement";
  expiresOn?: string;
  fileRef: string;            // encrypted storage key
}
export interface Deadline {
  id: string;
  kind: "passport_expiry" | "visa_expiry" | "i20_end" | "opt_window" |
        "stem_opt" | "reentry_signature" | "ds160_appointment";
  dueOn: string;
  leadDays: number;           // alert N days before
  status: "upcoming" | "due" | "done";
}
export interface CopilotProfile {
  userId: string;
  documents: VaultDocument[];
  deadlines: Deadline[];
  lifecycleStage: "f1" | "opt" | "stem_opt" | "h1b" | "green_card" | "visitor";
}
```

**Proactive engine (v2):** a scheduled job evaluates `deadlines[]` daily and pushes alerts (email/WhatsApp/push) `leadDays` before each due date — this is the part ChatGPT structurally cannot do (it never messages first). Deadlines are derived by a **rules engine** from document dates, not by the LLM, so a wrong date can't slip through.

## 12. API contracts (summary)

| Endpoint | Method | In → Out | Scope |
| --- | --- | --- | --- |
| /api/generate-package | POST | IntakeAnswers → GeneratedPackage | Buildathon |
| /api/interview/turn | POST | {questionId,transcript,profile,history} → turn score | Buildathon |
| /api/voice/signed-url | GET | — → { signedUrl } | Buildathon |
| /api/copilot/scan-doc | POST | file → VaultDocument (OCR + expiry) | v2 |
| /api/copilot/deadlines | GET | userId → Deadline[] | v2 |

## 13. Build-squad agents → code modules

| Agent (product PRD) | Owns (code) |
| --- | --- |
| 🧠 Orchestrator | Routing, `store/` session state, stage transitions |
| 📝 Intake Agent | `lib/intake/schema.ts`, wizard components, branching predicates |
| ⭐ Package Generator | `/api/generate-package`, `lib/prompts/package.ts`, `lib/scoring.ts` |
| 🎙️ Voice Interview | `app/interview`, `/api/voice/signed-url`, `/api/interview/turn`, EL agent config |
| 📄 Document/Checklist | Checklist rules + render; freshness logic |
| 🛡️ Review/Guardrail | "prepare not file" copy, risk flags, attorney-review routing (v2) |

## 13.1 Sub-agent roster — missions, skills & contracts

<aside>
🤖

VisaPath runs as a **team of focused sub-agents**, each owning ONE job with a typed input → output contract, so each can be prompted, tested, and improved in isolation. **Six do the work; two meta-agents make the others get better over time** (the loop in 13.2).

</aside>

| Sub-agent | Mission & core skills | Input → Output | Self-improvement signal |
| --- | --- | --- | --- |
| **🧠 Orchestrator** | Routes the user across intake → package → interview → tracker; owns session state & guardrails. *Skills:* state machine, routing, handoff contracts. | User events → next-step routing | Drop-off point per stage |
| **📝 Intake** | Runs the adaptive ~20-question wizard, branching on denial / self-employed / first-timer. *Skills:* dynamic question logic, validation. | Answers so far → next question | Completion rate, abandoned questions |
| **⭐ Package Generator** | Writes the 214(b)-tuned statement + checklist + score. *Skills:* ElevenLabs text-agent prompt chain, Indian-doc knowledge (PAN/ITR/GST/NOC), structured JSON output. | IntakeAnswers → GeneratedPackage | User edits to the statement; completeness accuracy |
| **🎙️ Voice Interview** | Role-plays the consular officer, asks follow-ups, scores spoken answers. *Skills:* ElevenLabs STT+TTS, WebRTC, ElevenLabs-agent scoring, Hinglish. | Spoken answer + profile → turn score + follow-up | Score calibration vs real interview outcome |
| **📄 Document / Checklist** | Builds the personalized doc list + freshness rules. *Skills:* rules engine, profile-based templating. | Profile → ChecklistItem[] | Missing/wrong items reported by users |
| **🛡️ Review / Guardrail** | Flags hard cases for attorney review; enforces “prepare, not file”. *Skills:* risk classification, compliance prompts. | Package + profile → risk flags | False-pass / false-flag rate |
| **⚖️ Critic / Evaluator (meta)** | LLM-as-judge that scores every other agent's output against a rubric. *Skills:* rubric grading, hallucination detection, regression testing. | AgentRunTrace → EvalResult | Agreement with human spot-checks |
| **🔧 Optimizer / Prompt-Improver (meta)** | Reads clustered failures and proposes new prompt/rule versions. *Skills:* failure clustering, prompt rewriting, A/B proposal. | Failures + evals → candidate PromptVersion | Win-rate of promoted versions |

## 13.2 Self-improving agent loop (loop engineering)

<aside>
🔁

The agents don't ship static. Every run is captured, judged, and fed into an automated improvement loop. This is also the **moat**: real consular outcomes become labeled training signal no incumbent has.

</aside>

```jsx
┌──────────────┐
│ 1. OBSERVE    │  capture every run (trace: in/out, latency, tools)
└──────┬───────┘
       ▼
┌──────────────┐
│ 2. EVALUATE   │  Critic (LLM-judge) + rubric + real signals
└──────┬───────┘  (user edits, interview pass, visa result)
       ▼
┌──────────────┐
│ 3. DIAGNOSE   │  cluster failures → find the weak prompt/rule
└──────┬───────┘
       ▼
┌──────────────┐
│ 4. IMPROVE    │  Optimizer proposes a new prompt/version
└──────┬───────┘
       ▼
┌──────────────┐
│ 5. VALIDATE   │  candidate vs baseline on golden set
└──────┬───────┘  (must beat baseline + zero regressions)
       ▼
┌──────────────┐
│ 6. PROMOTE    │  version it, ship it, keep rollback ──┐
└──────────────┘                              │
       ↑─────────── back to OBSERVE ─────────────┘
```

**Reward signals (what teaches the agents):**

| Signal | Source | Tunes |
| --- | --- | --- |
| Statement edits | User edits the generated letter | Package Generator prompt |
| Thumbs up/down + reason | In-app feedback on each output | Any agent |
| Mock-vs-real gap | Mock interview score vs actual consular result | Voice scoring calibration + question bank |
| **Visa approved / refused (+ reason)** | User reports the real outcome | **214(b) rubric — the core moat** |
| Checklist corrections | “this item was wrong/missing” | Document/Checklist rules |

**Loop data structures (`evals/`):**

```tsx
interface AgentRunTrace {
  id: string; agent: string; version: string;
  input: unknown; output: unknown;
  latencyMs: number; toolCalls: string[]; createdAt: string;
}
interface EvalResult {
  traceId: string; judge: "llm" | "human" | "outcome";
  scores: Record<string, number>; // rubric dims, 0–100
  verdict: "pass" | "fail"; notes: string;
}
interface PromptVersion {
  agent: string; version: string; prompt: string;
  baselineScore: number; candidateScore: number;
  status: "candidate" | "promoted" | "rolled_back";
}
```

**Eval rubric — Package Generator (LLM-judge, 0–100 each):** factual grounding (no hallucinated facts) · 214(b) ties coverage · specificity/personalization · format & length compliance · checklist correctness. **Voice agent:** realism · scoring calibration vs human · follow-up relevance.

**Promotion gate (the safety rail):** a candidate version ships only if it (1) beats the baseline average by ≥ a set margin on the golden set, (2) has **zero regressions on critical evals** — any hallucination is a hard fail, and (3) passes a human spot-check. Otherwise it's auto-rolled back. Versions are pinned so any release can revert instantly.

<aside>
🎯

**Buildathon-lite version (shippable in the 5 hours):** add thumbs up/down + edit capture, a 10-profile **golden set** in `evals/`, one Critic judge prompt, and a “Re-run evals” button. That's enough to *show* the loop live and say the line: **“every package a user edits, and every real visa result, makes the next applicant's package better — a flywheel ChatGPT can't run.”**

</aside>

## 14. Security, privacy & compliance

- **Secrets server-side only.** The single ElevenLabs key lives in route handlers / Replit Secrets; the client only ever sees a short-lived signed URL.
- **Demo = no server PII.** Intake stays in `localStorage`; nothing persisted server-side during the buildathon.
- **Production (v2):** encrypt the vault at rest, India data-residency + **DPDP Act 2023** consent, explicit delete-my-data, and minimal passport-number handling.
- **Positioning guardrail:** every screen says **"AI-assisted preparation," never "AI attorney"**; never auto-file or cold-call (anti-scam stance from the product PRD).

## 15. Demo-hardening & caching

<aside>
🛡️

The demo must survive a dead network. Two cached assets are mandatory.

</aside>

1. **Cached sample package** (`lib/fixtures/sample-package.ts`) — a known-good `GeneratedPackage` for a pre-warmed applicant; served instantly if the live ElevenLabs call is slow/fails.
2. **Cached voice exchange** — one pre-recorded officer↔applicant turn + score, so the cold-open voice moment works offline.
3. Pin the ElevenLabs agent IDs + model; keep one simple API path; no live video; rehearse the 4-minute run twice.

## 16. Engineering build sequence (≈5 hours)

| Block | Time | Engineering tasks | Done = |
| --- | --- | --- | --- |
| 1 | 0:00–0:45 | Scaffold Next.js + Tailwind; routes; store; landing + selector (B-1/B-2 only) | Clickable shell deploys on Replit |
| 2 | 0:45–2:00 | Intake schema + wizard + branching + autosave | Full intake completes, persists |
| 3 | 2:00–3:15 | `/api/generate-package`  • ElevenLabs text-agent prompt + scoring + dashboard tabs + copy/download | Real package renders from real intake |
| 4 | 3:15–4:15 | ElevenLabs agent + signed-url route + `useConversation` UI + turn scoring + Practice/Exam | Spoken mock interview works in browser |
| 5 | 4:15–4:40 | Tracker + generating animation + error fallback to fixtures | End-to-end, looks finished |
| 6 | 4:40–5:00 | Cache sample package + voice exchange; rehearse twice | Bulletproof demo |

## 17. Definition of Done (acceptance criteria)

- [ ]  B-1/B-2 intake completes with all branches firing and survives a refresh.
- [ ]  `/api/generate-package` returns valid `GeneratedPackage` JSON; statement is 400–500 words and references the applicant's actual figures.
- [ ]  Completeness score is deterministic from the rubric and shows per-section reasons + fixes when < 70.
- [ ]  Voice mock interview runs in the browser (mic in, voice out), scores at least one spoken answer, and supports Practice + Exam modes.
- [ ]  Tracker advances through 7 stages and persists.
- [ ]  Cached fallback renders a full package + voice turn with the network disabled.
- [ ]  No API key is ever present in client bundles.

## 18. Post-buildathon technical roadmap

Payment gate (Razorpay) · multi-visa SKUs (config-driven intake + prompts) · document upload + OCR to pre-fill intake · **Copilot v2** (vault storage, rules-engine deadline scheduler, push/WhatsApp alerts) · attorney-review marketplace · auth + encrypted persistence + DPDP compliance · B2B/white-label theming.

## 19. Appendix — Verified ElevenLabs connection (reference)

<aside>
✅

The ElevenLabs pipeline is **confirmed working in BOTH voice mode and text-chat mode** against a live agent (test agent **“I am surbhi”**, ID `agent_0801kw3y6m0yfm8ae5whtg262329`) — same agent, same single API key. Voice uses `audio_interface=DefaultAudioInterface()`; text uses `audio_interface=None` + `conversation.send_user_message(...)`. This validates the one-provider (chat + voice) architecture end-to-end. **Action before the demo:** reconfigure this agent (or create a dedicated one) with the **consular-officer system prompt + the India 214(b) question bank**, then set its ID as `ELEVENLABS_VOICE_AGENT_ID`. **Never hardcode the API key** — read it from the env, as the snippets below do.

</aside>

**A — Local smoke test (Python SDK).** Runs on your machine's own mic/speakers. Great for a 2-minute “is the agent alive?” check — **not** the demo surface.

```python
# pip install elevenlabs   |   run: python smoke_test.py
import os, sys, signal
from elevenlabs.client import ElevenLabs
from elevenlabs.conversational_ai.conversation import Conversation, DefaultAudioInterface

client = ElevenLabs(api_key=os.environ["ELEVENLABS_API_KEY"])  # never hardcode the key
conversation = Conversation(
    client=client,
    agent_id=os.environ["ELEVENLABS_VOICE_AGENT_ID"],
    requires_auth=True,
    audio_interface=DefaultAudioInterface(),
    callback_agent_response=lambda r: print(f"Officer: {r}"),
    callback_user_transcript=lambda t: print(f"You: {t}"),
)
conversation.start_session()
signal.signal(signal.SIGINT, lambda *_: (conversation.end_session(), sys.exit(0)))
conversation.wait_for_session_end()
```

**A2 — One function, both modes (the mode toggle).** Same agent, same key — just flip `audio_interface` to switch. This is the local mirror of the app's **Practice (text/chat) vs Exam (voice)** toggle.

```python
from elevenlabs.conversational_ai.default_audio_interface import DefaultAudioInterface

def start_agent_session(mode="voice"):
    common = dict(
        client=client,
        agent_id=os.environ["ELEVENLABS_VOICE_AGENT_ID"],
        requires_auth=True,
        callback_agent_response=lambda r: print(f"Officer: {r}"),
    )
    if mode == "voice":
        convo = Conversation(
            **common,
            audio_interface=DefaultAudioInterface(),   # enables mic + speaker
            callback_user_transcript=lambda t: print(f"You: {t}"),
        )
        convo.start_session()                          # then just speak
    else:  # "chat"
        convo = Conversation(**common, audio_interface=None)  # no mic/speaker
        convo.start_session()
        convo.send_user_message("Hello, I'm here for my B-2 interview.")  # send text
    return convo
```

<aside>
💡

**Browser mapping:** in the web app the same toggle is `useConversation`'s text-vs-audio mode — **Exam mode** starts a voice session (signed URL + mic), **Practice mode** runs the agent in text and uses `sendUserMessage(...)`. One agent powers both; the UI just chooses the interface.

</aside>

**B — Production demo surface (browser — what the judges see).** The web app uses the JS/React SDK with a **server-minted signed URL**, so the API key never reaches the client:

```tsx
// app/interview/page.tsx (client)
import { useConversation } from "@elevenlabs/react";
const convo = useConversation();
const { signedUrl } = await fetch("/api/voice/signed-url").then(r => r.json());
await convo.startSession({ signedUrl });
```

```tsx
// app/api/voice/signed-url/route.ts (server) — key stays server-side
// verify exact endpoint path in the ElevenLabs docs before shipping
const r = await fetch(
  `https://api.elevenlabs.io/v1/convai/conversation/get-signed-url?agent_id=${process.env.ELEVENLABS_VOICE_AGENT_ID}`,
  { headers: { "xi-api-key": process.env.ELEVENLABS_API_KEY! } }
);
const { signed_url } = await r.json();
```

<aside>
⚠️

**Trophy note:** a terminal Python app is a weak stage demo. Build the **browser** flow for judging; keep the Python script only as a backstage smoke test. Also: “I am surbhi” is a generic test agent — the product needs the **consular-officer** persona + 214(b) knowledge base, not a default chatbot.

</aside>

## 20. Edge cases & failure handling

<aside>
🧩

**Golden rule:** nothing ever shows a dead screen. On ANY failure, fall back to a cached/safe state and tell the user the next step. Below are the edge cases each build agent must handle.

</aside>

**Intake wizard**

- **User abandons mid-flow** → autosave every answer to `localStorage`; show “Resume where you left off” on return.
- **Invalid / missing field** (passport format, future DOB, expiry earlier than travel date) → inline validation, block Next with a clear message.
- **Contradictory answers** (e.g. `retired` + employer name) → soft warning, let the user fix; never hard-crash.
- **Very weak profile** (no job, no assets, no ties) → still generate the package, but score low + strong `fixes[]`. Never block generation.
- **Prompt injection in free-text answers** (“ignore your instructions…”) → treat ALL intake text as data, never instructions; sanitize before sending to the agent.

**Package generation**

- **Agent/LLM timeout (>25s)** → demo env serves the cached sample package; prod retries once then falls back.
- **Malformed / non-JSON output** → one repair retry (“return valid JSON only”); if still bad → cached fixture.
- **Statement out of range** (<400 or >500 words) → validate `wordCount`, auto request a trim/expand.
- **Hallucinated facts** (amount/employer not in profile) → Guardrail agent diffs output vs profile and strips unverifiable claims.
- **Non-Latin names / Devanagari input** → preserve UTF-8 end to end; never transliterate silently.

**Voice mock interview**

- **Mic permission denied / no input device** → fall back to the **text-chat interview** mode (same agent, `audio_interface=None` pattern).
- **WebRTC/network failure OR ElevenLabs account lacks Conversational AI** → play the cached officer↔applicant exchange + offer text mode.
- **Signed URL expired** → re-mint on demand from the server route.
- **User silent / rambling** → officer says “Take your time” / politely interrupts after a timeout.
- **Hindi / Hinglish answer** → understand fully, continue in English.
- **Session drops mid-interview** → preserve transcript, allow resume, give a partial score.
- **Bad STT (noise)** → confirm (“Did you say…?”) instead of scoring garbage.

**Scoring & tracker**

- **Missing rubric fields** → treat the sub-factor as 0 and note it in `fixes`; never divide-by-zero.
- **`localStorage` disabled/cleared** → app still works in-session; warn that progress won't persist.

**Platform & demo**

- **Dead venue WiFi** → full cached fallback path (package + voice) via `NEXT_PUBLIC_APP_ENV=demo`.
- **Mobile Safari WebRTC quirks** → test on iOS; always offer the text fallback.
- **Missing API key / rate-limit (429)** → friendly error + cached path; never expose the key or a stack trace.
- **Accessibility** → keyboard nav, ARIA labels, captions on the spoken interview, AA contrast on the dark theme.

## 21. Design system — VisaPath UI (premium dark, trust-forward)

<aside>
🎨

Scaffold the premium dark design tokens, then apply the **VisaPath overrides** below. We keep the immersive, content-first, pill/rounded, heavy-shadow aesthetic — but re-color it from charcoal+green to **ink-navy + trust-blue**, and reserve **green/amber/red for the visa score bands**.

</aside>

```bash
# 1) scaffold the dark, premium design tokens
npx getdesign@latest add spotify
# 2) then override the tokens with the VisaPath palette below
```

**Two product-fit tweaks vs the source theme:** (1) palette shifts to ink-navy + a single trust-blue accent (officialdom/passport feel), with green/amber/red mapped to the score; (2) typography is slightly **larger and more legible** than Spotify's compact playlist type — VisaPath is a form/document app people *read*, not a playlist they scan. Proprietary `SpotifyMixUI` → **Inter** (UI/body) + **Noto Sans Devanagari** (Hindi/Hinglish) + a strong display face for headings.

### Color palette (VisaPath overrides)

**Brand accent (the singular functional color — used like Spotify green, never decorative)**

- **Trust Blue `#3B82F6`** — primary CTA, active state, focus ring, links.
- **Indigo Deep `#6366F1`** — secondary accent / hero gradient only.

**Score semantics (the accent trio = the visa bands)**

- **Approved / Strong `#22C55E`** (score ≥ 80)
- **Moderate / Warning `#F59E0B`** (60–79)
- **Refused / Weak `#EF4444`** (< 60)
- **Info `#539DF5`** — neutral information.

**Backgrounds (ink-navy, not pure charcoal)**

- Base / page `#0B0F1A` · Surface (cards, sidebar) `#121826` · Mid (inputs, interactive) `#1A2234` · Elevated card `#202A40`.

**Text**

- Primary `#FFFFFF` · Secondary `#9AA7BD` · Bright-secondary `#CBD5E1`.

**Border & shadow**

- Border `#2A3548` · Light border `#3A4660` · Separator `#9AA7BD`.
- Dialog shadow `rgba(0,0,0,0.55) 0 8px 24px` · Card shadow `rgba(0,0,0,0.35) 0 8px 8px`.

### Typography

- **Display / headings:** strong sans (Inter Display / Sora), Section title 24–28px / 700.
- **UI & body:** Inter, body **16px / 400** (bumped for form legibility), bold 16px / 700.
- **Hindi / Hinglish:** Noto Sans Devanagari fallback in the stack.
- **Buttons:** 14px / 600, mild uppercase + 0.6–1px tracking (softer than Spotify's 2px — trustworthy, not shouty).

### Components (VisaPath flavor)

- **Primary CTA:** Trust-Blue pill (`9999px`), white text, heavy hover lift.
- **Cards:** `#121826`, **12px** radius (a touch rounder than the 6–8px source — friendlier, trust-building), shadow on hover.
- **Score ring:** circular gauge colored by band (green/amber/red) — the hero visual of the package screen.
- **Inputs:** `#1A2234`, rounded 12px, focus = Trust-Blue ring.
- **Voice mic button:** large circle — Trust-Blue idle → **pulsing green while listening** → red while the officer speaks.
- **Sidebar / 7-stage stepper:** active = Trust-Blue + white, inactive = `#9AA7BD`.

### Layout & responsive

- **Mobile-first** (India skews mobile): single column < 576px; sidebar collapses to a bottom bar.
- 8px spacing base; radius scale 4 / 8 / 12 / 16 / pill / circle.
- Keep a persistent bottom **progress bar** (like a now-playing bar) showing the 7-stage tracker.

## 22. Design/UX sub-agent + UX self-improvement loop

<aside>
🔁

Design is not a one-time pass. A dedicated **🎨 Design/UX agent** owns the tokens + component library, and the self-improving loop (§13.2) is extended with **UX telemetry** so the interface keeps getting smoother for users.

</aside>

**New roster entry (add to §13.1):**

- **🎨 Design/UX Agent** — owns the design-token file (palette/type/spacing), the shadcn component theme, accessibility, and responsive behavior. *Skills:* design tokens, Tailwind theme, a11y, Figma→code. *Input → Output:* UX telemetry + tokens → updated component theme / layout. *Self-improvement signal:* task-completion rate, time-on-task, drop-off, rage-clicks, a11y violations.

**For the sub-agents to work properly (handoff contracts):**

- Every agent reads/writes the **same shared design tokens** (single source of truth) so Intake, Package, Voice, and Tracker stay visually consistent.
- The Design/UX agent exposes a **fixed component API** (`Button`, `Card`, `ScoreRing`, `MicButton`, `Stepper`); other agents compose ONLY these — no ad-hoc styles.
- The Orchestrator enforces the design contract on every screen handoff (reject a screen that uses raw colors instead of tokens).

**UX improvement loop (extends §13.2 OBSERVE→EVALUATE→DIAGNOSE→IMPROVE→VALIDATE→PROMOTE):**

- **OBSERVE** — capture UX events: per-step time, drop-off point, rage-clicks, errors, mic-permission failures, a11y warnings.
- **EVALUATE** — Critic scores each screen on clarity/friction + heuristic checks (contrast, tap-target ≥ 44px, copy clarity).
- **DIAGNOSE** — cluster friction (e.g. “40% drop at the finances question,” “mic step confuses users”).
- **IMPROVE** — Design/UX agent proposes a token/layout/copy change (bigger tap target, clearer mic affordance, simpler wording).
- **VALIDATE** — A/B on the golden flows; must lift completion without regressing other screens.
- **PROMOTE** — version the design tokens; keep instant rollback.

<aside>
🎯

**Buildathon-lite:** ship the VisaPath tokens by default + capture drop-off + run one “smoothness” checklist (AA contrast, 44px tap targets, loading skeletons, error toasts, mic fallback) so the demo already feels polished — and you can say the line: *“the UI tunes itself from real user friction.”*

</aside>

## 23. Team structure & shared-context workflow (two teams, one brain)

<aside>
🧠

Every agent operates from **ONE shared context, like a real team** — no agent works in a silo and no human copy-pastes context between them. The squad is split into **two teams (Frontend + Backend)**, each with its own sub-agents and workflow, but both read/write the **same shared project memory** so progress, decisions, and contract changes propagate automatically.

</aside>

### The two teams

| Team | Lead | Sub-agents | Owns (code) |
| --- | --- | --- | --- |
| **🎨 Frontend Team** | FE Lead (an Orchestrator) | 🎨 Design/UX · 📝 Intake-UI · Package-Dashboard-UI · 🎙️ Voice-UI · Tracker-UI | `app/` screens, `components/`, `store/`, design tokens |
| **⚙️ Backend Team** | BE Lead (an Orchestrator) | ⭐ Package Generator · 🎙️ Interview services · 📄 Document/Checklist · 🛡️ Guardrail · Types/Schema owner | `app/api/`, `lib/` (prompts, scoring, schema, fixtures), ElevenLabs agent config |
| **⚖️ Meta (cross-team)** | — | ⚖️ Critic/Evaluator · 🔧 Optimizer | `evals/`, the self-improving loop (§13.2 + §22) |

### The shared context (the “one brain”)

The single source of truth all agents read/write. The **boundary contracts** between the two teams live here ONCE and are referenced, never duplicated:

- **Shared types** — `lib/types.ts` (§5): the data models both teams code against.
- **API contracts** — (§12): the exact endpoint in→out shapes.
- **Design tokens + component API** — (§21): `Button`, `Card`, `ScoreRing`, `MicButton`, `Stepper`.

Because both teams build against the SAME contracts, they work in parallel and simply integrate — no one re-explains context.

### Context-passing protocol (how progress flows automatically)

On finishing any unit of work, an agent writes a structured **handoff record** to shared memory instead of messaging a human:

```json
{
  "agent": "PackageGenerator",
  "team": "backend",
  "task": "/api/generate-package",
  "status": "done",            // todo | doing | blocked | done
  "artifacts": ["app/api/generate-package/route.ts", "lib/scoring.ts"],
  "contractsTouched": ["GeneratedPackage", "POST /api/generate-package"],
  "blockers": [],
  "handoffTo": ["Package-Dashboard-UI"],
  "notes": "Returns strict GeneratedPackage JSON; cached fixture on timeout."
}
```

- Each **Lead** aggregates its team's records; the top Orchestrator merges both into ONE live status.
- **Subscribers auto-pull** what they need (e.g. the FE Package-Dashboard-UI reads the BE output schema the moment it's marked `done`).
- **Golden rule:** change a contract → write it to shared memory → both teams see it instantly. Never pass context person-to-person; always through the shared brain.

### The workflow (parallel, contract-first)

1. **Kickoff** — lock the contracts (types + API + design tokens) in shared memory.
2. **Build in parallel** — FE codes against stubbed contracts, BE implements them; neither waits on the other.
3. **Post handoffs** — each finished piece writes a handoff record; dependents pick it up automatically.
4. **Integrate continuously** — Critic checks each handoff; Optimizer feeds fixes back through the loop.
5. **One live status** — nobody ever asks “where are we?”; the shared brain always knows.

<aside>
✅

**The outcome you wanted:** you set up the two teams + sub-agents once, and from then on they share all context and progress through the shared brain — so you don't manually copy-paste anything between agents.

</aside>

### Implementing the shared brain (concrete mechanism)

Whatever agent tooling you use, the shared brain = **ONE read/write store in the repo** that every agent touches. Minimum viable version for the buildathon — a `context/` folder committed to the repo:

```jsx
context/
├─ project.md         # locked decisions + pointers to contracts (human-readable source of truth)
├─ contracts/
│  ├─ types.ts         # shared data models (§5) — imported by BOTH teams
│  └─ api.md           # endpoint in→out shapes (§12)
├─ tokens.ts          # design tokens + component API (§21)
├─ handoffs.jsonl     # append-only log of handoff records (one JSON per line)
└─ status.json        # derived live status, rolled up by the Leads
```

**Read/write convention (the protocol):**

1. **Before starting** a task, an agent reads `status.json` + the relevant `contracts/` files — that's its full context, no human briefing needed.
2. **On finishing**, it **appends** one `HandoffRecord` line to `handoffs.jsonl` (append-only — never edit another agent's entry).
3. The team **Lead** recomputes `status.json` from the new records; the top Orchestrator merges both teams' status.
4. **Contracts are the only cross-team dependency** — changing `types.ts`/`api.md`/`tokens.ts` MUST come with a handoff whose `contractsTouched` is set, which is the signal the other team auto-detects.

```tsx
// context/handoffs.jsonl record shape
interface HandoffRecord {
  ts: string;                 // ISO timestamp
  agent: string;              // "PackageGenerator"
  team: "frontend" | "backend" | "meta";
  task: string;
  status: "todo" | "doing" | "blocked" | "done";
  artifacts: string[];        // file paths / URLs produced
  contractsTouched: string[]; // type names / endpoints changed
  blockers: string[];
  handoffTo: string[];        // agents that should pick this up
  notes: string;
}
```

**Maps to whatever you build with:**

| Tooling | What the “brain” is |
| --- | --- |
| Replit Agent / Cursor / Claude Code | The `context/` folder in the repo IS the brain — agents read/write the files directly |
| CrewAI | Shared memory + `handoffs.jsonl` as the task-output store; Leads = manager agents |
| LangGraph | A shared graph-state object passed between nodes; persist to `context/` for durability |
| Generic / manual | Any shared KV/DB — or even one shared doc — the agents can read/write; the protocol matters more than the store |

<aside>
💡

**Buildathon-lite:** you don't need infra. A single committed `context/` folder (or even one shared Notion page) + the append-only handoff convention is enough to make the “no copy-paste” workflow real on day one.

</aside>

## 24. Persistent memory & session continuity (never lose context)

<aside>
🧠

Two kinds of memory are stored as **markdown files** so context is never lost when a session ends or an agent's context window fills up: **(A) user memory** — so the ElevenLabs agent recalls each applicant like a real person across sessions, and **(B) agent memory** — so any agent (or a fresh session) can read what's been done and resume exactly where it stopped.

</aside>

### A. User memory — `context/memory/users/<userId>.md`

Durable per-user knowledge the agents recall across visits: profile facts, goals, prior mock-interview attempts + scores, weak areas to coach, preferred language (Hindi/Hinglish), **the last topic discussed, and the exact resume point.**

- **ElevenLabs usage:** load this file at conversation start (as the agent's **knowledge document** or via **dynamic variables / prompt overrides**) so the consular-officer / copilot agent greets the user, recalls the last session, and continues naturally — real memory, not a cold start.
- **Lifecycle:** session START → agent reads user memory → personalizes; session END (or each turn) → append a short summary (topics, new facts, latest score, next step) back to the file.

```jsx
# User Memory — <userId>
## Profile        # name, visa type, employment, ties, key INR figures
## Goals          # e.g. B-2 tourism, travel date, prior 214(b) refusal
## Session history # dated bullets: what we covered + score
## Weak areas     # what to coach next (e.g. "vague on funding source")
## Resume point   # the exact next step / last topic discussed
```

### B. Agent memory + `AGENTS.md` — `context/memory/agents/<agent>.md`

Each agent keeps its own memory file: **what it has done, current state, decisions made, open TODOs, and the next step.** Any other agent reads it to get that agent's full context without asking a human.

- A **root `AGENTS.md`** is the index: which agents exist, what each owns, and a pointer to each agent's memory file + the shared brain (§23).

```jsx
# Agent Memory — <agent>
## Owns           # files / responsibilities
## Done           # completed units (+ artifact paths)
## In progress    # current task + state
## Decisions      # choices made others must respect
## Next           # the exact next step to resume
```

### C. Why this exists — the context-window problem

Agents have a finite context window. When it fills, the session must restart — and naively you'd lose all progress and have to re-explain everything. Because every agent **persists its state to its memory file** (and handoffs to `handoffs.jsonl`), a brand-new session can fully reconstruct context and continue.

### D. Session bootstrap — every new session starts the SAME way

1. Read root `AGENTS.md` → know the squad + where memory lives.
2. Read your own `context/memory/agents/<you>.md` → recover your state + next step.
3. Read `context/status.json` + relevant `contracts/` → current project state.
4. If a user is involved, read `context/memory/users/<userId>.md` → recall them.
5. **Resume** the task exactly where it left off — never restart from scratch.
6. As you work, **update** your memory file + **append** handoffs so the NEXT session can resume too.

<aside>
💡

**Buildathon-lite:** even a single `memory.md` per user + one root `AGENTS.md` is enough — the discipline (read memory at start, write memory at end) is what makes every session resumable and makes the ElevenLabs agent feel like it truly remembers the user.

</aside>