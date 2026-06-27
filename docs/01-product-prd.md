# VisaPath AI — PRD (Problem #15 · Buildathon Trophy Edition)

<aside>
🛂

**One-line pitch:** The AI that does what your ₹40,000 immigration attorney does — in 20 minutes, for ₹2,999.
*Problem Statement #15 · The AI Immigration Lawyer · Version 1.0 · Buildathon Trophy Edition.*

</aside>

<aside>
📦

**Handover pack:** this is the **product PRD** (the *why* and *what*). The engineering build spec — architecture, data models, ElevenLabs agent prompts, voice wiring, API contracts, build sequence — lives in the [VisaPath AI — Technical PRD](https://app.notion.com/p/VisaPath-AI-Technical-PRD-Engineering-Spec-for-Build-Agents-d48a135541494bccbcbcea5b29b39973?pvs=21).

</aside>

## The story (open the pitch with this)

Meet Priya. She's 27, a software engineer in Pune, and last week she got the email she'd been working toward for three years: a US company wants to sponsor her H-1B. Then the second email arrived — from the immigration attorney her HR recommended. ₹45,000, three months, and a 40-item document request written in language she doesn't understand. She doesn't know if the fee is fair. She doesn't know what half the documents are. She doesn't know if she'll be rejected, and if she is, she won't know why.

Here's the thing: **90% of what that attorney will do for ₹45,000 is not legal judgment.** It's collecting the same documents, filling the same forms, and writing the same structured letter — tailored to Priya's profile. It's pattern work. The legal review is maybe three hours; the other forty are coordination and paperwork.

VisaPath does that 90%. Priya answers 20 plain-language questions, and in 20 minutes she has a complete, personalized application package — a cover letter in her voice, a checklist built for *her* situation, a strength score, and an interview prep guide. For ₹2,999. The attorney becomes an optional ₹500 review, not a ₹45,000 gatekeeper.

That's the demo. That's the company. And every judge in the room who has ever filed a visa will feel it in their chest.

## Why this wins the trophy (the honest case)

<aside>
🏆

Across a full council sweep of all 15 statements — scored purely on what wins a 5-minute room demo — #15 won decisively. It has the highest demo *floor* and *ceiling*, output that looks finished, no two-sided setup, real money attached from minute one, and a paying user the judges personally relate to.

</aside>

| Trophy criterion | Why #15 wins |
| --- | --- |
| Demo "wow" | A stranger answers 20 questions → a 450-word personalized cover letter appears in 30 seconds referencing their exact job, income, family, and trip. |
| Output looks finished | Three professional documents, not a wireframe with AI text. |
| Self-contained | One user, one flow, one screen. No marketplace, no pre-loaded second persona to fake. |
| Won't break on stage | Cacheable, single API path, no live video, no external integrations. |
| Real money | ₹2,999 today, clear SKU expansion. Survives investor Q&A. |
| Judge relatability | Half the room has filed a visa or knows someone who has. |

## First-principles reasoning

Immigration paperwork is not a legal problem dressed as one — it's a **coordination and documentation problem.** The attorney's value is knowing which box to check, which letter format passes the officer's review, and which document is missing. That is pattern recognition over a fixed, well-documented ruleset — exactly what a strong LLM does better than a junior associate, in minutes instead of months.

The arbitrage is brutal: a ₹25,000–₹60,000 fee exists only because nobody productized the document-assembly layer. The barrier was never expertise; the rules are public. The barrier is *access to someone who knows the pattern.* VisaPath is that pattern, productized.

## Council pass (the four voices)

- 🧐 Skeptic
    
    The personal statement has to genuinely beat a Google template, because a judge who's filed a visa will evaluate quality instantly. *Mitigation:* the output's specificity (exact employer, income, dependants, trip purpose, denial-mitigation) is what no template can match — and we demo that specificity live.
    
- 📊 Strategist
    
    India files 1M+ US/UK applications a year at ₹2,999 a package. Each visa type is a new SKU with high-intent buyers who already search for help. The optional attorney-review marketplace both monetizes and de-risks legally.
    
- 🌅 Optimist
    
    The personal statement is a jaw-dropper. "I would have paid ₹45,000 for this" is the exact sentence we want the judges thinking.
    
- 🎯 Tactician
    
    Single-sided, 4-minute demo from login to full package. Nothing to fake, nothing to break. Easiest clean execution on the sheet.
    

## Three blind spots we name out loud (honesty is a feature)

<aside>
🫡

Judges fund founders who already see the holes. We say these *in the pitch*, before anyone asks.

</aside>

1. **We don't file for you — we prepare you.** Positioning is "AI-assisted preparation," the same way TurboTax prepares a return without being a CPA. This is the liability shield, stated proudly, not hidden.
2. **The hard 10% is real.** Prior denials, RFEs, complex H-1B specialty arguments — that's exactly what the optional ₹500 attorney-review marketplace handles. We don't pretend the edge cases don't exist; we route them.
3. **Output quality is the whole product.** A generic letter kills trust. So our wedge is one visa type done exceptionally, with adaptive logic that makes the output unmistakably personal — not five visa types done shallowly.

## Why now

A strong LLM can now generate a consulate-ready personal statement that reads like senior-attorney work, identify missing documents before the applicant discovers them at the consulate, and adapt to each applicant's employment, education, and visa category. The model capability just crossed the threshold — and while US-focused players already exist, the **India-first product layer does not**.

## Market & competition (India-first)

<aside>
🇮🇳

**The bet:** not "AI for visas" in general — a **rupee-priced, mobile-first, 214(b)-optimized prep tool for Indian *outbound* applicants** (B-1/B-2 and F-1 first). That specific wedge is wide open; the broad category is not.

</aside>

### The India opportunity (the demand is real and measured)

- **1M+ US visas issued to Indians two years running (2023–2024)**; India is the **#1 source of US student visas** in the world.
- **≈1 in 6 Indian B-1/B-2 applicants is refused** (≈16.3%, FY2024) — almost entirely under **Section 214(b)** ("failed to prove ties to India / intent to return"). Beating that one test is the product's entire reason to exist.
- **Global B-1/B-2 refusal ≈28%; F-1 refusal ≈41%** — the pain is large, repeated, and emotionally charged.
- Immigration consulting is a **≈$17.8B global market (2026), heading to ≈$29.5B by 2035**; the **India sub-market is growing ≈7–10% a year**, today served mostly by opaque ₹8k–₹45k agents and consultants.

### Who else is in the space (say this honestly in the room)

| Player | What they do | Who they actually serve |
| --- | --- | --- |
| **SimpleCitizen** | "TurboTax for immigration," ≈$249 + attorney-review network | US-based green card / citizenship |
| **Boundless** (≈$45M raised) | Green card & citizenship guidance | US-based immigrants |
| **LegalOS / Formally / CaseBlink** | AI petition generation, attorney-signed | Complex US work visas (O-1, H-1B, EB) |
| [**VisaCompanion.ai**](http://VisaCompanion.ai) | Petition drafts, RFE analyzer, interview simulator | US employment / family petitions |
| [**VisaLaw.ai](http://VisaLaw.ai) / [Visas.AI](http://Visas.AI)** | AI research & drafting sold *to* lawyers | Immigration attorneys |
| **ChatGPT + free PS generators** | Generic statement drafting | Anyone, ₹0 — our quality floor to beat |

### The Indian players (the ones you'll actually fight)

| Player | Scale / note | Gap we exploit |
| --- | --- | --- |
| **Atlys** | App-first, 500k+ visas processed, "scan passport, done in 4 min," reviews applications pre-submission | Speed/booking focus — no 214(b)-tuned statement or spoken mock interview |
| **Y-Axis** | "World's largest B2C immigration co.," 1M+ customers/yr, ~100k inquiries/mo, 1,500 consultants — but unfunded, weak product/tech | Offline, consultant-heavy, opaque pricing — we are self-serve, transparent, ₹-priced |
| **VFS Global** | Runs official submission centres; **ViVA** AI chatbot since 2018 + a 2025 GenAI assistant | FAQ/process chatbot, not personalized prep or interview rehearsal |
| **BLS International** | 360M+ applications processed for 46+ governments | Pure outsourced submission rails — zero applicant-facing AI prep |

<aside>
💡

**The opening:** the funded modern player (Atlys) optimises *speed and booking*; the giant (Y-Axis) is *offline consultants*; the infra players (VFS/BLS) just *submit*. Nobody owns **214(b)-tuned output quality + a spoken AI mock interview** — that's our standout lane.

</aside>

### Why we win where they don't (the wedge)

<aside>
🎯

Every serious incumbent prices in **dollars** and targets people **already in or immigrating to** the US (green cards, complex work visas) — or sells to **attorneys**. **Almost nobody serves the Indian *outbound* applicant** doing a high-volume, lower-complexity visa.

</aside>

1. **India-first, not US-first.** Rupee pricing (₹2,999 vs $249+), Indian payment rails, Indian documents (PAN, ITR, GST, employer NOC, property papers), and the cultural specifics of an Indian application.
2. **214(b)-specialized.** Output tuned to the *one* test Indians actually fail — proving ties to India and intent to return. Generic tools don't optimize for this; it is our core IP.
3. **High-volume, low-complexity wedge.** B-1/B-2 + F-1 first — the categories with the most Indian applicants and the cleanest, most repeatable rules — instead of fighting incumbents in O-1/EB petitions.
4. **Mobile-first & plain-language.** Built for a phone and a non-expert, optionally vernacular — not a desktop legal workflow.
5. **Prepare, don't file.** "AI-assisted preparation," with the hard 10% routed to an optional attorney review — the same liability shield SimpleCitizen uses, localized for India.
6. **Spoken 214(b) mock interview.** The one thing no Indian player offers — rehearse the consular interview out loud against an AI officer that scores your answers (see Feature 3). This is our hero differentiator.

<aside>
🗣️

**Answer to "isn't this just SimpleCitizen?":** "SimpleCitizen is TurboTax for *Americans* getting green cards. We're built for the *Indian applicant* trying to pass the 214(b) interview — rupee-priced, mobile, and tuned to the exact test they fail. Different user, different visa, different country, different price."

</aside>

## Council refinements (v1.1 — founder · YC · angel · operator · judge)

<aside>
🧭

A five-seat council (operator-founder, YC partner, angel, India market operator, buildathon judge) stress-tested the plan. Five changes stuck.

</aside>

1. **Beachhead = F-1 students first, B-1/B-2 second.** Students are younger, more digital, refused at ~41%, terrified of the interview, and travel in WhatsApp/Telegram herds that spread tools virally. They also carry the most *recurring* deadlines — perfect fuel for the retention engine. We still **build and demo B-1/B-2** because its rules are the cleanest for a 5-hour build. *Students are how we grow; B-1/B-2 is how we demo.*
2. **The moat is not voice — it's the 214(b) engine.** Anyone can call the ElevenLabs API on Monday. Defensibility is the **214(b) “ties to India” scoring rubric + an India-specific consular question bank + the user's document/history vault.** Voice is the magnet; the rubric is the moat.
3. **B2B / white-label is the venture-scale answer.** B2C is the funnel; the scale revenue is selling VisaPath as white-label prep to India's 50,000+ study-abroad agents, IELTS centres, and visa consultants who'd pay monthly to look 10x more competent. *Consumer is distribution; agents are revenue.*
4. **Trust is a visible feature (anti-scam stance).** “AI visa help” pattern-matches to fraud in India — the government literally warns about visa phone calls. So we say it loud: **we never file for you, we never cold-call you, we only prepare you.** Making *not* being a scammer explicit is part of the product.
5. **Demo cold-opens on the voice interview.** No preamble, no market slide — open with the AI officer asking a volunteer “What ties you to India that ensures you'll return?”, reveal the live score, then talk about the company. Always pre-cache the exchange so venue WiFi can't kill the magic moment.

## Target personas

- 👩‍💻 Priya — first-time H-1B applicant, 27, Pune
    
    **Reality:** ₹45,000 attorney quote, 3-month timeline, total dependence and zero transparency.
    **Frustrations:** Can't tell if the fee is fair; can't track status; if rejected, won't know why.
    **Needs:** A system that walks her through exactly what's needed, explains *why* each document matters, writes the statement in her voice, and tells her if her package is strong before she submits.
    **Goal:** Submit a clean, complete application with confidence, without paying ₹45,000.
    
- 🧑‍💼 Rohan — self-employed founder, UK business visitor visa, 34, Bangalore
    
    **Reality:** Tried the form himself, got stuck on "maintenance funds," gave up; consultant wanted ₹15,000 and 3 weeks.
    **Needs:** A 20-minute guided process that asks smart questions and produces a strong cover letter explaining his ties to India and purpose of visit, plus a checklist he can verify himself.
    **Goal:** Get it done and get back to running his company.
    
- 👩 Anjali — first-time US tourist visa, 54, Jaipur
    
    **Reality:** Daughter helping remotely; a ₹8,000 travel agent "handled it" with zero transparency; terrified of the interview.
    **Needs:** Plain-language guidance, a statement reflecting her genuine reason to visit and intent to return, and clear interview prep.
    **Goal:** Understand what's happening and walk into the consulate confident.
    
- 🏢 Amit — HR manager, 41, Hyderabad (B2B expansion persona)
    
    **Reality:** Files 15–25 petitions/year; pays a firm ₹1.5–2.5L each; slow, opaque.
    **Needs:** A low-cost option for standard cases, reserving the attorney retainer for complex ones.
    **Goal:** Cut visa processing cost 60–70% for routine cases without compromising quality.
    

## Product vision

VisaPath is the first AI-native immigration *preparation* platform that takes an applicant from zero to a submission-ready package in under 30 minutes. It doesn't replace attorneys — it eliminates the need for one in ~80% of cases and hands the other ~20% a nearly complete package an attorney can finalize in an hour instead of thirty. Long-term: every major visa category (US, UK, Canada, Australia) as a SKU, with an attorney-review marketplace on top.

## Buildathon scope (what gets built in 5 hours)

<aside>
🎯

**Build one visa type, end to end, exceptionally well: US B-1/B-2 (Tourist & Business Visitor).** Highest-volume category for Indian applicants, well-defined documentation, and the cover letter is the highest-value output. **Skip:** payment gate (stub it), multi-visa, document upload, WhatsApp reminders.

</aside>

## Core features (the 5 USPs)

### Feature 1 — Visa Intelligence Intake (the Smart Wizard)

**What:** A guided ~20-question flow, one plain-language question per screen, that adapts to prior answers.
**Why it's a USP:** Everyone else gives a generic checklist. VisaPath's intake is contextual — visited the US before? It asks the outcome and adjusts the statement's tone. Self-employed? It asks turnover and headcount to build the financial-ties narrative. *The intelligence is in the question logic, not the count.*
**Adaptive logic highlights:** prior denial → triggers a denial-mitigation section; self-employed → GST/registration prompts; first-time traveller → stronger ties-to-India emphasis; medical visit → unlocks hospital-appointment checklist item.
**Feel:** clean single-question screens, progress bar, mobile-friendly, no jargon, 8–12 minutes.

### Feature 2 — AI Application Package Generator (the demo closer)

Our AI processes all answers and generates three documents at once:

- **A · Personal Statement (Cover Letter):** a 400–500 word consulate-addressed letter covering who the applicant is, the trip's purpose/itinerary, financial capability, ties to India guaranteeing return, and acknowledgment of the visit's temporary nature. Formal, first-person, unique to the applicant — not a template.
- **B · Personalized Document Checklist:** 15–25 items customized to the profile. Each has the document name, one-line reason it's required, where to get it, original/copy needed, and any freshness rule (e.g., bank statements <3 months). A salaried applicant sees an employer NOC + 3 months' slips; a self-employed one sees GST returns + audited accounts; a retiree sees a pension certificate.
- **C · Application Completeness Score (0–100):** Financial strength (20) · Ties to India (25) · Travel/visa history (15) · Purpose clarity (20) · Documentation completeness (20). Each section shows its score + a one-line reason; <70 warns; <50 gives specific fixes before applying.

<aside>
⭐

**Why this wins the demo:** three polished, professional documents generated in <60 seconds from a 10-minute intake. The personal statement alone is worth ₹10,000 from a freelance writer; the completeness score is something no attorney gives you proactively.

</aside>

### Feature 3 — AI Voice Mock Consular Interview (the hero USP) 🎤

<aside>
🎙️

**This is our signature, India-first hero feature.** Not a phone hotline (which reads as a scam in India and burns margins) — an **in-app, in-browser voice agent** that role-plays a US consular officer. The applicant speaks; the AI officer listens, asks follow-ups, and grades the answer live. Built on **ElevenLabs Agents** (speech-to-text + lifelike voice) so it runs in a phone browser, in English or Hinglish.

</aside>

**What:** From the completed intake, the app spins up a personalized mock interview. ElevenLabs voices the officer; the applicant answers out loud; speech-to-text + the AI scores each answer on confidence, consistency, and 214(b) "ties to India" strength, then the officer asks a tailored follow-up (a prior-denial profile gets grilled differently than a first-timer).
**Why it's the wedge:** the consular interview is the scariest, least-prepared moment, and *no Indian incumbent lets you rehearse it by actually speaking*. Generic voice bots exist; a **214(b)-tuned mock interview that scores your spoken answers** does not.
**Demo-safe by design:** in-browser mic + WebRTC, not a phone call — cacheable, single flow, nothing to dial, nothing to break on stage.
**Modes:** *Practice* (officer + suggested answers revealed one at a time) and *Exam* (officer-only, then a scored report: tone, consistency, red-flag answers to fix).

### Feature 4 — Application Status Tracker (light)

**What:** A 7-stage checklist the applicant marks as they progress: (1) Intake complete & package generated → (2) Documents collected → (3) DS-160 completed online → (4) Visa fee paid → (5) Appointment booked → (6) Interview done → (7) Visa received. Persists via localStorage.
**Why in scope:** ~30 minutes to build and makes the product feel like a complete, end-to-end product on stage, not just a generator.

### Feature 5 — VisaPath Copilot (the retention engine) 🧭

<aside>
🧭

**The visa package is a one-time win; Copilot is the relationship.** A visa is a single transaction — but an immigrant's *journey* lasts years. Copilot is a separate **subscription** product (not part of the 5-hour build) that keeps the user with us long after the stamp.

</aside>

**What:** An always-on AI immigration companion (₹999/year) that turns a one-off applicant into a multi-year member. Three pillars:

- **📁 Document Vault** — securely stores passport, visa, I-20/DS-2019, financials, and prior statements; auto-flags expiries (passport under 6 months, visa validity) and reuses them to pre-fill the next application.
- **⏰ Deadline Radar** — proactive alerts for the recurring obligations nobody tracks: F-1 SEVIS/I-20 dates, OPT/CPT/STEM-OPT windows, travel re-entry signatures, visa-stamping renewals, DS-160 prep, and family members' visa timelines.
- **🧭 Lifecycle Pathway** — maps the next move (F-1 → OPT → STEM-OPT → H-1B → green card, or repeat tourist/business trips) and re-engages the user with the right package at the right moment.

**Why it's the retention engine, not the standout:** the **voice mock interview wins the demo and the first sale; Copilot wins the lifetime.** Each deadline alert is a re-engagement, each lifecycle step is a new package sale, each family member is a referral — converting a ₹2,999 one-time buyer into recurring ARR plus a switching-cost moat (a vault of the user's whole history).

**Beachhead fit:** this is exactly why **F-1 students are the ideal first user** — their journey has the most recurring deadlines (every semester, every OPT/STEM window), so they stay subscribed for years, not days.

<aside>
🛡️

**Why this isn't “just ChatGPT / Gemini” (the objection, answered):** a copilot you *talk to* is not a moat — anyone can ask Gemini a visa question. Copilot is **not a chatbot**; it's a **system of record + a proactive engine** that does three things a general LLM structurally cannot:
**1 · It knows *your* case.** ChatGPT has no memory of your I-20 expiry, SEVIS date, OPT window, or passport validity — every chat starts from zero. Copilot holds your actual documents and dates and acts on them.
**2 · It's proactive, not reactive.** ChatGPT only helps if you already know what to ask and when; most immigration pain is a deadline you didn't know existed. Copilot pings you (“your STEM-OPT window opens in 14 days”) without being asked — a general LLM never messages you first.
**3 · It's verified, not hallucinated.** A wrong date from ChatGPT can put you out of status or get you deported, so nobody should trust a hallucinating bot with it. Copilot is backed by a rules engine + authoritative, India-specific sources, and it *acts* (pre-fills the next package, sets the reminder, routes to attorney review) instead of just talking.
**The line:** “ChatGPT answers questions. Copilot watches your case and acts before you have to ask.”

</aside>

## Parked for post-buildathon (say "coming soon" if judges ask)

Multi-visa SKUs (H-1B, L-1, O-1, UK Skilled Worker, Canada PR) · payment gate (₹2,999 Razorpay) · **attorney-review marketplace** (₹500, 24-hour review — reviews not generates, keeping liability clean) · document upload + AI extraction to pre-fill intake · WhatsApp reminders · family bundling.

## User flow (buildathon version)

1. **Landing** — "Your complete US visa application package. Ready in 20 minutes." Free checklist vs ₹2,999 full package. *Demo: skip paywall, go to intake.*
2. **Visa type** — three cards; only B-1/B-2 live, others "Coming soon."
3. **Smart Intake** — 20 questions, one/screen, progress bar, Back button, session-saved.
4. **Generating screen** — animated: "Analysing your ties to India… Building your personal statement… Preparing your checklist…" (15–30s).
5. **Package dashboard** — tabs: Personal Statement · Document Checklist · Completeness Score; download/copy each.
6. **Interview prep** — 10–15 Q&A with Practice Mode.
7. **Tracker** — 7 stages, persistent.

## Screen inventory

| Screen | Purpose | Priority |
| --- | --- | --- |
| Landing | Explain product, entry CTA | P0 |
| Visa type selector | Route to correct flow | P0 |
| Intake wizard (20 screens) | Collect applicant data | P0 |
| Generating screen | Build anticipation | P0 |
| Package dashboard | Show 3 documents | P0 |
| Interview prep | 10–15 Q&A | P1 |
| Application tracker | 7-stage progress | P1 |
| Error screen | Failed call / incomplete intake | P2 |
| Share / export | PDF download, share link | P2 |

## Data collected → where it's used

| Data field | Used in |
| --- | --- |
| Full name | Statement header, form autofill |
| Passport details | Checklist, DS-160 guidance |
| Purpose of visit | Statement opening, checklist customization |
| Travel dates & duration | Ties-to-India section, consulate questions |
| Employment details | Financial strength, employer NOC item |
| Income / turnover | Financial sufficiency, bank-statement requirement |
| India-based assets | Ties-to-India, completeness score |
| Dependants in India | Ties-to-India, family-photos item |
| Prior US visa history | Statement tone, denial mitigation |
| International travel history | Credibility, visa-history pattern |
| US point of contact | Statement itinerary section |

*All data stays in the browser session for the buildathon — no server storage needed for the demo.*

## Revenue model

| Tier | Price | What's included |
| --- | --- | --- |
| Free | ₹0 | Personalized document checklist only (lead-gen, no signup) |
| Complete Package | ₹2,999 / application | Personal statement + full checklist + completeness score + interview prep |
| Premium Review add-on | ₹499 / review | Optional 24-hour attorney review with comments (de-risks legally) |
| VisaPath Copilot (retention) | ₹999 / year | Always-on immigration companion — document vault + deadline radar + lifecycle pathway (recurring ARR) |
| Corporate / B2B + white-label (v2) | Custom | Bulk prep for HR teams (Amit) + white-label for study-abroad agents, IELTS centres & visa consultants |

*The visa package is the one-time hook; Copilot is the recurring engine — users stay subscribed across their multi-year journey, buy a new package at each lifecycle step, and refer family. B2C is the funnel; B2B / white-label to agents is the scale revenue.*

## Go-to-market & flywheel

Seed demand where intent is highest and searchable: H-1B/visa subreddits and forums, study-abroad and IELTS communities, and immigration YouTube comment sections. Each successful package is shareable proof; each new visa type is a new high-intent search surface. Free checklist is the top-of-funnel magnet; the personal statement is the conversion moment.

## Success metrics

- **North Star:** completed packages / week.
- **Activation:** % who finish intake (target ≥70%).
- **Conversion:** free checklist → paid package.
- **Quality/trust:** package satisfaction + "would recommend" (≥85%); attorney-review acceptance rate.
- **Speed:** intake-start → package-delivered (target <20 min).
- **Expansion:** packages per user over time (repeat + family referral).

## Demo script (~4-minute trophy walkthrough)

<aside>
🎙️

**Council variant (high-risk, high-reward) — cold-open on voice:** skip the preamble and start with the AI consular officer grilling a volunteer (“What ties you to India that ensures you'll return?”), reveal the live score, *then* run the package flow below. Only do this with the pre-cached voice exchange ready as fallback.

</aside>

1. **Hook (15s):** "A US visa attorney costs ₹45,000 and three months. Watch a stranger get the same package in 20 minutes for ₹2,999."
2. **Honesty flex (15s):** "We don't file for you — we prepare you, like TurboTax for visas. The hard 10% routes to an optional ₹500 attorney review."
3. **Intake live (75s):** Have a judge/volunteer answer ~6 key questions on stage (job, income, family, trip purpose, prior travel) — show the adaptive logic firing ("because you're self-employed, we'll ask about GST…").
4. **The hero moment (75s):** Hit generate → the **personal statement** appears, referencing their exact job, income, dependants, and trip. "No template produces this. This alone is ₹10,000 of writing." Flip to the checklist + the completeness score.
5. **Depth (30s):** Open Interview Prep — personalized consulate questions with model answers. "They walk in rehearsed."
6. **Money (20s):** "₹2,999, 10x cheaper than any attorney, and we charge from day one. 1M+ Indian applications a year, each visa type a new SKU."
7. **Close (10s):** "The barrier was never expertise — it's access to the pattern. VisaPath *is* the pattern."

## Rehearsable 5-hour build plan

| Block | Time | Build | Done = |
| --- | --- | --- | --- |
| 1 | 0:00–0:45 | Scaffold app, routing, landing + visa-type selector | Clickable shell, B-1/B-2 routes |
| 2 | 0:45–2:00 | Intake wizard: 20 questions, one/screen, progress bar, state saved, adaptive branches for denial/self-employed/first-timer | Full intake completes and stores answers |
| 3 | 2:00–3:15 | Generator: single ElevenLabs text-agent call → personal statement + checklist + completeness score; tabbed dashboard; copy/download | Real package renders from real intake |
| 4 | 3:15–4:00 | Interview prep module + 7-stage tracker (localStorage) | Both work end to end |
| 5 | 4:00–4:30 | Generating-screen animation, polish, error fallback | Looks finished |
| 6 | 4:30–5:00 | **Cache a known-good sample package + rehearse demo twice** | Bulletproof 4-min run |

<aside>
🛡️

**Execution mandates:** (1) Pre-warm a sample applicant and keep a cached package as fallback so a slow model call never kills the demo. (2) Lead with the finished statement, then reveal how little input produced it. (3) End on the ₹2,999 line. (4) Say the blind spots out loud before anyone asks.

</aside>

## Build squad — the AI agents that build & run VisaPath

Split the work across focused agents, each with a clear skillset, so each does one job exceptionally.

| Agent | Job | Skills / tools |
| --- | --- | --- |
| **🧠 Orchestrator** | Routes the user through intake → package → interview → tracker; holds session state | State machine, routing, guardrails |
| **📝 Intake Agent** | Runs the adaptive ~20-question wizard; branches on denial / self-employed / first-timer | Dynamic question logic, validation |
| **⭐ Package Generator Agent** | Writes the 214(b)-tuned personal statement + checklist + completeness score | ElevenLabs text-agent prompt chain, Indian-doc knowledge (PAN/ITR/GST/NOC) |
| **🎙️ Voice Interview Agent** | Role-plays the consular officer, asks follow-ups, scores spoken answers | ElevenLabs Agents (STT + TTS), WebRTC, ElevenLabs-agent scoring, Hinglish |
| **📄 Document / Checklist Agent** | Builds the personalized doc list + freshness rules | Rules engine, profile-based templating |
| **🛡️ Review / Guardrail Agent** | Flags hard cases for optional attorney review; enforces "prepare, not file" language | Risk classification, compliance prompts |

## Voice integration reference (ElevenLabs) — for the build agent

<aside>
🔊

**Use ElevenLabs Agents for the in-app voice mock interview** (in-browser WebRTC, not telephony). The build agent should read these docs. This is a curated subset — the full index is linked from any page.

</aside>

- 🛠️ ElevenLabs build references (click to expand)
    
    **For AI coding agents:** append `.md` to any docs URL for clean Markdown; append `/llms.txt` to a section for its index; MCP server: `https://elevenlabs.io/docs/_mcp/server`
    
    **Core build:**
    • Agents overview — [https://elevenlabs.io/docs/eleven-agents/overview.md](https://elevenlabs.io/docs/eleven-agents/overview.md)
    • Quickstart (agent in ~5 min) — [https://elevenlabs.io/docs/eleven-agents/quickstart.md](https://elevenlabs.io/docs/eleven-agents/quickstart.md)
    • Prompting guide — [https://elevenlabs.io/docs/eleven-agents/best-practices/prompting-guide.md](https://elevenlabs.io/docs/eleven-agents/best-practices/prompting-guide.md)
    • Knowledge base + RAG — [https://elevenlabs.io/docs/eleven-agents/customization/knowledge-base/rag.md](https://elevenlabs.io/docs/eleven-agents/customization/knowledge-base/rag.md)
    • Multi-language / Hinglish — [https://elevenlabs.io/docs/eleven-agents/customization/voice/customization/language.md](https://elevenlabs.io/docs/eleven-agents/customization/voice/customization/language.md)
    
    **In-app (no phone):**
    • React SDK — [https://elevenlabs.io/docs/eleven-agents/libraries/react.md](https://elevenlabs.io/docs/eleven-agents/libraries/react.md)
    • Next.js quickstart — [https://elevenlabs.io/docs/eleven-agents/guides/quickstarts/next-js.md](https://elevenlabs.io/docs/eleven-agents/guides/quickstarts/next-js.md)
    • WebSocket / realtime — [https://elevenlabs.io/docs/eleven-agents/libraries/web-sockets.md](https://elevenlabs.io/docs/eleven-agents/libraries/web-sockets.md)
    
    **Scoring & analysis:**
    • Conversation analysis — [https://elevenlabs.io/docs/eleven-agents/customization/agent-analysis.md](https://elevenlabs.io/docs/eleven-agents/customization/agent-analysis.md)
    • Success evaluation — [https://elevenlabs.io/docs/eleven-agents/customization/agent-analysis/success-evaluation.md](https://elevenlabs.io/docs/eleven-agents/customization/agent-analysis/success-evaluation.md)
    • Speech to Text — [https://elevenlabs.io/docs/overview/capabilities/speech-to-text.md](https://elevenlabs.io/docs/overview/capabilities/speech-to-text.md)
    
    **LLM model (built-in GPT-4 / Claude / Gemini, selectable):** [https://elevenlabs.io/docs/eleven-agents/customization/llm/custom-llm.md](https://elevenlabs.io/docs/eleven-agents/customization/llm/custom-llm.md)
    **Cost control:** voice-only billing has a silence discount; optimise LLM costs — [https://elevenlabs.io/docs/eleven-agents/customization/llm/optimizing-costs.md](https://elevenlabs.io/docs/eleven-agents/customization/llm/optimizing-costs.md)
    

## Risks & mitigations

| Risk | Mitigation |
| --- | --- |
| Output feels generic | Adaptive intake → demonstrably specific statement (exact employer/income/family/denial-handling); demo the specificity live |
| Unauthorized-practice-of-law concern | Strict "AI-assisted preparation," never "AI attorney"; optional attorney-review marketplace for the hard cases |
| Completeness score credibility | Frame as a *preparation strength indicator*, not a rejection predictor; show the transparent rubric |
| Demo failure (slow/failed model call) | Cached fallback package + single, simple API path; no live video or external integrations |
| Sensitive personal data | Session-only storage for the demo; privacy-first + consent as the productionization fast-follow |

<aside>
✅

**Bottom line:** highest-floor, highest-ceiling trophy pick. Relatable paying user in the room, finished-looking output, no hidden hard part to expose, real money from minute one — and a pitch that names its own blind spots, which is exactly what makes judges trust the founder.

</aside>