# API Contracts — VisaPath AI

## Buildathon Endpoints

### POST /api/generate-package
- **Input:** `IntakeAnswers` (JSON body)
- **Output:** `GeneratedPackage` (JSON) | 500 → client uses cached fixture
- **Timeout:** 25s → cached fallback in demo env
- **Auth:** Server-side ElevenLabs API key (never exposed to client)

### GET /api/voice/signed-url
- **Input:** none
- **Output:** `{ signedUrl: string }`
- **Purpose:** Mint a short-lived signed URL for the ElevenLabs voice agent. API key stays server-side.

### POST /api/interview/turn
- **Input:** `{ questionId: string, transcript: string, profile: IntakeAnswers, history: string[] }`
- **Output:** `TurnScore` = `{ confidence: number, consistency: number, tiesStrength: number, redFlags: string[], followUp: string }`

## v2 Endpoints (not built)
- POST /api/copilot/scan-doc
- GET /api/copilot/deadlines
