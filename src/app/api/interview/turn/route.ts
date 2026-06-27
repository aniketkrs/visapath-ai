import { NextResponse } from "next/server";

interface TurnScore {
  confidence: number;
  consistency: number;
  tiesStrength: number;
  redFlags: string[];
  followUp: string;
}

export async function POST(request: Request) {
  try {
    const { questionId, transcript, profile, history, questionText } =
      await request.json();

    const apiKey = process.env.ELEVENLABS_API_KEY;
    const agentId = process.env.ELEVENLABS_TEXT_AGENT_ID;

    if (apiKey && agentId) {
      try {
        const score = await callElevenLabsForScore(
          apiKey,
          agentId,
          profile,
          questionText || questionId,
          transcript,
          history || []
        );
        if (score) {
          console.log("scoreSource: llm");
          return NextResponse.json(score);
        }
      } catch (llmError) {
        console.error("ElevenLabs scoring failed, using fallback:", llmError);
      }
    }

    console.log("scoreSource: fallback");
    return NextResponse.json(regexFallback(transcript, profile));
  } catch (error) {
    console.error("Interview turn error:", error);
    console.log("scoreSource: fallback");
    return NextResponse.json({
      confidence: 65,
      consistency: 70,
      tiesStrength: 60,
      redFlags: ["Unable to fully analyze this response"],
      followUp: "Tell me more about your ties to India.",
    });
  }
}

async function callElevenLabsForScore(
  apiKey: string,
  agentId: string,
  profile: Record<string, unknown>,
  questionText: string,
  transcript: string,
  history: string[]
): Promise<TurnScore | null> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 15000);

  try {
    const response = await fetch(
      `https://api.elevenlabs.io/v1/convai/conversation`,
      {
        method: "POST",
        headers: {
          "xi-api-key": apiKey,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          agent_id: agentId,
          mode: "text",
          messages: [
            {
              role: "user",
              content: buildScoringPrompt(
                profile,
                questionText,
                transcript,
                history
              ),
            },
          ],
        }),
        signal: controller.signal,
      }
    );

    clearTimeout(timeout);

    if (!response.ok) {
      console.error("ElevenLabs API error:", response.status);
      return null;
    }

    const data = await response.json();
    const raw =
      data?.statement?.body ||
      data?.output_text ||
      data?.text ||
      (typeof data === "string" ? data : null);

    if (!raw) {
      console.error("No text in ElevenLabs response:", JSON.stringify(data));
      return null;
    }

    return parseAndValidateScore(raw);
  } catch (err) {
    clearTimeout(timeout);
    throw err;
  }
}

function buildScoringPrompt(
  profile: Record<string, unknown>,
  questionText: string,
  transcript: string,
  history: string[]
): string {
  return `You are a US consular officer scoring an Indian B-1/B-2 applicant's answer.

Applicant profile:
${JSON.stringify(profile, null, 2)}

Question: ${questionText}
Applicant's answer: ${transcript}

Previous Q&A:
${history.length > 0 ? history.join("\n") : "(none)"}

Score this answer on:
- confidence (0-100): How confident and specific the answer is
- consistency (0-100): How consistent with the profile
- tiesStrength (0-100): How strong the ties to India sound
- redFlags: Any contradictions or concerning statements
- followUp: A probing follow-up question for the weakest area

Return ONLY valid JSON:
{ "confidence": N, "consistency": N, "tiesStrength": N, "redFlags": [...], "followUp": "..." }`;
}

function parseAndValidateScore(raw: string): TurnScore | null {
  const jsonMatch = raw.match(/\{[\s\S]*\}/);
  if (!jsonMatch) return null;

  try {
    const parsed = JSON.parse(jsonMatch[0]);

    if (
      typeof parsed.confidence !== "number" ||
      typeof parsed.consistency !== "number" ||
      typeof parsed.tiesStrength !== "number" ||
      !Array.isArray(parsed.redFlags) ||
      typeof parsed.followUp !== "string"
    ) {
      return null;
    }

    return {
      confidence: clamp(parsed.confidence),
      consistency: clamp(parsed.consistency),
      tiesStrength: clamp(parsed.tiesStrength),
      redFlags: parsed.redFlags.filter(
        (r: unknown) => typeof r === "string"
      ) as string[],
      followUp: parsed.followUp,
    };
  } catch {
    return null;
  }
}

function clamp(n: number): number {
  return Math.max(0, Math.min(100, Math.round(n)));
}

function regexFallback(
  transcript: string | undefined,
  profile: Record<string, unknown> | undefined
): TurnScore {
  const words = transcript?.split(/\s+/).length || 0;
  const hasSpecifics =
    /₹|rupee|lakh|crore|salary|property|family|employer/i.test(
      transcript || ""
    );
  const isVague =
    /maybe|i think|not sure|i guess|probably/i.test(transcript || "");

  let confidence = Math.min(95, 50 + words * 2);
  let consistency = 70;
  let tiesStrength = 60;
  const redFlags: string[] = [];

  if (hasSpecifics) {
    confidence += 10;
    tiesStrength += 15;
  }
  if (isVague) {
    confidence -= 15;
    redFlags.push("Answer was vague — use specific figures and facts");
  }
  if (words < 10) {
    confidence -= 20;
    redFlags.push("Answer too brief — expand with concrete details");
  }

  if (
    profile &&
    (profile as Record<string, unknown>).monthlyIncomeINR &&
    transcript
  ) {
    const mentionsIncome = /income|salary|earn/i.test(transcript);
    if (mentionsIncome) consistency += 10;
  }

  if (profile && (profile as Record<string, unknown>).ownsProperty && transcript) {
    const mentionsProperty = /property|house|flat|home|land/i.test(transcript);
    if (mentionsProperty) tiesStrength += 10;
  }

  const followUps = [
    "What specifically brings you back to India after this trip?",
    "Can you tell me more about your financial situation?",
    "How long have you been at your current job?",
    "Who will take care of your responsibilities while you're away?",
    "Why should I believe you will return on time?",
  ];

  return {
    confidence: clamp(confidence),
    consistency: clamp(consistency),
    tiesStrength: clamp(tiesStrength),
    redFlags,
    followUp: followUps[Math.floor(Math.random() * followUps.length)],
  };
}
