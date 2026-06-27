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
  const prompt = buildScoringPrompt(profile, questionText, transcript, history);
  const raw = await callElevenLabsAgent(apiKey, agentId, prompt);
  return parseAndValidateScore(raw);
}

async function callElevenLabsAgent(
  apiKey: string,
  agentId: string,
  message: string
): Promise<string> {
  const signedUrlRes = await fetch(
    `https://api.elevenlabs.io/v1/convai/conversation/get-signed-url?agent_id=${agentId}`,
    { headers: { "xi-api-key": apiKey } }
  );
  if (!signedUrlRes.ok) {
    throw new Error(`Signed URL request failed: ${signedUrlRes.status}`);
  }
  const { signed_url } = await signedUrlRes.json();
  if (!signed_url) throw new Error("No signed_url in response");

  return new Promise<string>((resolve, reject) => {
    const ws = new WebSocket(signed_url);
    let collected = "";
    let settled = false;
    let pingInterval: ReturnType<typeof setInterval> | null = null;

    const timeout = setTimeout(() => {
      if (!settled) {
        settled = true;
        ws.close();
        reject(new Error("ElevenLabs WebSocket timed out after 15s"));
      }
    }, 15000);

    const done = (text: string) => {
      if (settled) return;
      settled = true;
      clearTimeout(timeout);
      if (pingInterval) clearInterval(pingInterval);
      try { ws.close(); } catch {}
      resolve(text);
    };

    const fail = (err: Error) => {
      if (settled) return;
      settled = true;
      clearTimeout(timeout);
      if (pingInterval) clearInterval(pingInterval);
      try { ws.close(); } catch {}
      reject(err);
    };

    ws.onopen = () => {
      pingInterval = setInterval(() => {
        if (ws.readyState === WebSocket.OPEN) {
          ws.send(JSON.stringify({ type: "ping" }));
        }
      }, 10000);
    };

    ws.onmessage = (event: MessageEvent) => {
      let data: any;
      try {
        data = JSON.parse(typeof event.data === "string" ? event.data : event.data.toString());
      } catch {
        collected += typeof event.data === "string" ? event.data : event.data.toString();
        return;
      }

      const t = data.type;

      if (t === "conversation_initiation_metadata" || t === "initiation_response") {
        ws.send(JSON.stringify({ type: "user_message", text: message }));
        return;
      }

      if (t === "agent_response" || t === "agent_response_event") {
        const chunk = data.agent_response ?? data.text ?? data.content ?? "";
        if (chunk) collected += chunk;
        return;
      }

      if (t === "text" || t === "delta") {
        const chunk = data.text ?? data.delta?.text ?? data.content ?? "";
        if (chunk) collected += chunk;
        return;
      }

      if (t === "audio" || t === "ping" || t === "pong") return;

      if (
        t === "conversation_end" ||
        t === "agent_response_end" ||
        t === "turn_end" ||
        t === "response_done"
      ) {
        done(collected);
        return;
      }

      if (data.text && typeof data.text === "string") {
        collected += data.text;
      }
    };

    ws.onerror = (err: Event) => {
      fail(new Error(`WebSocket error: ${JSON.stringify(err)}`));
    };

    ws.onclose = (ev: CloseEvent) => {
      if (!settled) {
        if (collected.length > 0) done(collected);
        else fail(new Error(`WebSocket closed: code=${ev.code} reason=${ev.reason}`));
      }
    };
  });
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
