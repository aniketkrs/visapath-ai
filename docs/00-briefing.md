# VisaPath AI — Build Context & Agent Briefing (START HERE)

<aside>
🚀

**This is the single entry point for the build squad.** Read this page top to bottom, then open the three linked docs. It captures what we're building, every locked decision, how the agents work together, and each agent's first task. Goal: a working, demo-safe web app in **one ~5-hour buildathon session** that wins the trophy.

</aside>

## 0. The three source docs (read in this order)

- 📘 [**VisaPath AI — Product PRD**](https://app.notion.com/p/VisaPath-AI-PRD-Problem-15-Buildathon-Trophy-Edition-500c40f6e09d497ab02bc5ba0f0cd0af?pvs=21) — the *why* and *what*: problem, market, features, positioning.
- ⚙️ [**VisaPath AI — Technical PRD**](https://app.notion.com/p/VisaPath-AI-Technical-PRD-Engineering-Spec-for-Build-Agents-d48a135541494bccbcbcea5b29b39973?pvs=21) — the *how*: architecture, data models, APIs, edge cases, design system, build sequence.
- 🗂️ [**VisaPath AI — Agent Prompts & 214(b) Knowledge Base**](https://app.notion.com/p/VisaPath-AI-Agent-Prompts-214-b-Knowledge-Base-5ea5aa6c4faf4b47bfcc5899b887e38f?pvs=21) — paste-ready system prompts + the question bank for the ElevenLabs agents.

## 1. The mission in one paragraph

VisaPath AI helps **Indian B-1/B-2 (visitor) visa applicants** prepare for the U.S. visa process and beat the **214(b)** refusal. From a ~20-question intake it generates a personalized **package** (consulate statement + document checklist + 0–100 readiness score + likely interview Q&A), then runs a **spoken AI mock consular interview** so the applicant walks in rehearsed. India-first, mobile-first, “AI-assisted preparation — never an AI attorney.”

## 2. Locked decisions (non-negotiable — do not relitigate)

| Decision | Locked value |
| --- | --- |
| Problem statement | **#15 — VisaPath AI** (visa preparation) |
| Goal | **Win the trophy** — optimize for a 5-minute demo, not feature breadth |
| Market | **India-first** (Indian applicants, Indian docs: PAN/ITR/GST/NOC) |
| Beachhead | **B-1/B-2 first** (F-1 student = v2) |
| Hero feature | **In-browser spoken mock consular interview** (214(b)-tuned), NOT a phone call |
| LLM + Voice | **ElevenLabs Agents ONLY** — one provider, one SDK, one API key for BOTH chat + voice; agent brain = **Claude Sonnet**; **200k ElevenLabs credits granted** |
| Retention | **VisaPath Copilot** (immigration system-of-record + proactive deadlines) — v2, not in the 5-hour build |
| Positioning | “AI-assisted preparation,” anti-scam, never auto-file or cold-call |
| Tech stack | Next.js 14+ (App Router) + TS + Tailwind + shadcn/ui; Zustand + localStorage (no DB); Replit → Vercel |
| Design | Premium dark, **ink-navy + Trust-Blue** accent; green/amber/red = the score bands |

## 3. What the product does (the 5 features)

1. **Intake Wizard** — ~20 adaptive questions, branching on employment / prior refusal / first-timer; autosaves to localStorage.
2. **Package Generator (⭐ core)** — one call returns the statement + tailored checklist + readiness score + interview questions as strict JSON.
3. **Voice Mock Interview (🎙️ hero)** — ElevenLabs consular-officer agent; Practice (text) + Exam (voice) modes; scores each answer.
4. **Status Tracker** — 7-stage journey (package → docs → DS-160 → fee → appointment → interview → visa), localStorage-persisted.
5. **VisaPath Copilot (v2)** — document vault + proactive deadline radar + lifecycle pathway; the retention engine ChatGPT structurally can't replicate.

## 4. The build squad — who does what

<aside>
🤖

Build as a **team of focused sub-agents**, each with ONE job and a typed input→output contract. Six do the work; three keep it consistent and improving. Full roster + skills live in **Technical PRD §13.1 and §22**.

</aside>

- **🧠 Orchestrator** — routing, session state, stage transitions, enforces the design contract.
- **📝 Intake** — question schema + branching + validation.
- **⭐ Package Generator** — statement + checklist + score (ElevenLabs text agent + deterministic scoring).
- **🎙️ Voice Interview** — consular-officer role-play + per-answer scoring (ElevenLabs voice agent).
- **📄 Document/Checklist** — personalized doc list + freshness rules.
- **🛡️ Review/Guardrail** — “prepare not file,” risk flags, no hallucinated facts.
- **🎨 Design/UX** — owns shared design tokens + component API so every screen is consistent.
- **⚖️ Critic/Evaluator (meta)** + **🔧 Optimizer (meta)** — judge outputs and propose improvements via the self-improving loop (§13.2): OBSERVE → EVALUATE → DIAGNOSE → IMPROVE → VALIDATE → PROMOTE.

**How they work together — two teams, one brain:** the squad splits into a **🎨 Frontend Team** and an **⚙️ Backend Team**, each with its own sub-agents and workflow. But every agent reads/writes the **same shared project memory** and posts a **handoff record** after each task (what it did, artifacts, contracts touched, who's next), so progress and decisions propagate automatically — **you never copy-paste context between agents.** They all share ONE source of truth for data models (§5), API contracts (§12), and design tokens + component API (§21); the Orchestrator rejects any screen that uses raw styles instead of tokens. Full model: **Technical PRD §23**. **Memory & session continuity:** user memory + agent memory are kept as markdown files so the ElevenLabs agent recalls each applicant like a real person, and any agent (or a fresh session started after the context window fills up) can read the memory and resume exactly where it left off — no re-explaining (**Technical PRD §24**).

## 5. ElevenLabs setup (the spine of the app)

<aside>
✅

**Verified working:** the live agent does BOTH voice and text-chat on a single API key (test agent “I am surbhi”, ID `agent_0801kw3y6m0yfm8ae5whtg262329`). Voice = `audio_interface=DefaultAudioInterface()`; chat = `audio_interface=None` + `send_user_message(...)`. Browser equivalent = `@elevenlabs/react` `useConversation`.

</aside>

- **One provider, one key.** Voice agent (consular officer) + text agent (package generator) both run on ElevenLabs with **Claude Sonnet** as the selected model; ElevenLabs granted **200k credits**. The agent handles its own reasoning / turn-taking / response logic — no need to micro-spec it.
- **Before building:** reconfigure the agent (or make a new one) with the **consular-officer prompt + 214(b) knowledge base** from the [prompts doc](https://app.notion.com/p/VisaPath-AI-Agent-Prompts-214-b-Knowledge-Base-5ea5aa6c4faf4b47bfcc5899b887e38f?pvs=21); set its ID as `ELEVENLABS_VOICE_AGENT_ID`.
- **Env vars:** `ELEVENLABS_API_KEY`, `ELEVENLABS_VOICE_AGENT_ID`, `ELEVENLABS_TEXT_AGENT_ID`, `NEXT_PUBLIC_APP_ENV=demo`.

## 6. 🔐 Security must-dos (do this first)

- **Rotate the exposed keys NOW.** The ElevenLabs (and old Fireworks) keys were shared in chat — treat them as compromised and regenerate.
- **Keys live in Replit Secrets ONLY**, referenced as env vars. Never paste a real key into code, this page, or any doc.
- The browser only ever receives a **short-lived signed URL**, never the API key.

## 7. Decision log (how we got here — brutally honest)

- Considered #6 (scam shield), #4 (procurement), #2 (medical); **locked #15 VisaPath** as the most real, demo-able, India-sized problem.
- Market validated India-first: 1M+ U.S. visas to Indians/yr, high B/F refusal rates, large + growing visa-services market; incumbents (Atlys, Y-Axis, VFS) don't do 214(b) coaching or a voice mock interview.
- Voice decided as **in-app mock interview**, not a phone-call gimmick.
- Copilot reframed from generic “travel copilot” to an **immigration compliance system-of-record** (defensible vs ChatGPT via private state + proactivity).
- Provider consolidated to **ElevenLabs-only** after verifying it handles chat + voice on one key.
- Design adapted from a Spotify-style dark theme → **VisaPath ink-navy + Trust-Blue**, with score-band colors.

## 8. Kickoff checklist (first tasks)

- [ ]  **You:** rotate keys → add to Replit Secrets → paste the 3 prompts + KB into the ElevenLabs agents → record the two agent IDs.
- [ ]  **🎨 Design/UX:** scaffold tokens (`npx getdesign@latest add spotify`) → apply VisaPath palette → build the component library (Technical PRD §21).
- [ ]  **🧠 Orchestrator:** scaffold Next.js routes + Zustand store + landing + B-1/B-2 selector (build block 1).
- [ ]  **📝 Intake:** implement `lib/intake/schema.ts` + wizard + branching + autosave (block 2).
- [ ]  **⭐ Package Generator:** `/api/generate-package` + ElevenLabs text agent + deterministic scoring + dashboard tabs (block 3).
- [ ]  **🎙️ Voice Interview:** signed-url route + `useConversation` UI + turn scoring + Practice/Exam toggle (block 4).
- [ ]  **All:** wire the cached fallback (package + voice) so the demo survives dead WiFi (block 6).

## 9. The 4 decisions — recommended defaults (build to these unless overridden)

<aside>
✅

These were the open questions; here are the recommended calls so agents start with **zero ambiguity**. Each is a default — override only with a deliberate reason.

</aside>

| Decision | Recommended default | Why |
| --- | --- | --- |
| **1. LLM model in the agent** | **Claude Sonnet** for both agents (locked by you) — **200k ElevenLabs credits** granted | Strong reasoning + excellent statement prose; the ElevenLabs agent handles turn-taking, reasoning, and response logic itself. Generous credit budget removes cost pressure for build + testing. |
| **2. Demo officer persona** | **“Fair but firm”** demo persona (asks real 214(b) questions, leans APPROVE on a solid answer); keep **strict** as the product default | A live on-stage refusal is a bad look; a pushover officer undersells the product. Fair-but-firm shows realism AND a win. Ship BOTH persona prompts. |
| **3. Copilot teaser** | **Static visual teaser only** (a “Coming soon: Copilot” screen + deadline-radar mockup); NO real logic | ~10 min to communicate the retention/revenue story to judges, zero risk to the core build. Real Copilot stays v2. |
| **4. Voice fallback** | **3 tiers:** live ElevenLabs voice → live **text-chat** (same agent) if mic/account fails → **cached recorded exchange** if network is dead. **Skip Web Speech API.** | Text-chat reuses the same agent (no new build); cached audio is bulletproof for bad WiFi. Web Speech API is a time-sink with worse quality. |

**Action items from these defaults:** add the **“fair but firm” demo-officer persona** to the [prompts doc](https://app.notion.com/p/VisaPath-AI-Agent-Prompts-214-b-Knowledge-Base-5ea5aa6c4faf4b47bfcc5899b887e38f?pvs=21) (alongside the strict one); select **Claude Sonnet** in both ElevenLabs agents; add a static Copilot teaser screen to the build (block 5); wire the 3-tier voice fallback (block 4 + 6).