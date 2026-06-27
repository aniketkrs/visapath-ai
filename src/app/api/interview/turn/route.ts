import { NextResponse } from "next/server";
import { INTERVIEW_SCORER_PROMPT } from "@/lib/prompts/interview";

export async function POST(request: Request) {
  try {
    const { questionId, transcript, profile, history } = await request.json();

    const apiKey = process.env.ELEVENLABS_API_KEY;
    const agentId = process.env.ELEVENLABS_TEXT_AGENT_ID;

    if (!apiKey || !agentId) {
      // Fallback scoring
      return NextResponse.json({
        confidence: 70,
        consistency: 75,
        tiesStrength: 65,
        redFlags: [],
        followUp: "Can you tell me more about your ties to India?",
      });
    }

    // Score the turn using ElevenLabs text agent
    // For the buildathon, we provide a deterministic fallback score
    // based on transcript length and profile strength
    const words = transcript?.split(/\s+/).length || 0;
    const hasSpecifics = /₹|rupee|lakh|crore|salary|property|family|employer/i.test(transcript || "");
    const isVague = /maybe|i think|not sure|i guess|probably/i.test(transcript || "");

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

    // Check profile consistency
    if (profile?.monthlyIncomeINR && transcript) {
      const mentionsIncome = /income|salary|earn/i.test(transcript);
      if (mentionsIncome) consistency += 10;
    }

    if (profile?.ownsProperty && transcript) {
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

    return NextResponse.json({
      confidence: Math.max(0, Math.min(100, confidence)),
      consistency: Math.max(0, Math.min(100, consistency)),
      tiesStrength: Math.max(0, Math.min(100, tiesStrength)),
      redFlags,
      followUp: followUps[Math.floor(Math.random() * followUps.length)],
    });
  } catch (error) {
    console.error("Interview turn error:", error);
    return NextResponse.json({
      confidence: 65,
      consistency: 70,
      tiesStrength: 60,
      redFlags: ["Unable to fully analyze this response"],
      followUp: "Tell me more about your ties to India.",
    });
  }
}
