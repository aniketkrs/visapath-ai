import { NextResponse } from "next/server";
import { computeScore } from "@/lib/scoring";
import { samplePackage } from "@/lib/fixtures/sample-package";
import { generatePersonalizedInterview } from "@/lib/fixtures/sample-interview";
import type { IntakeAnswers, GeneratedPackage } from "@/lib/types";

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
        reject(new Error("ElevenLabs WebSocket timed out after 25s"));
      }
    }, 25000);

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
      }, 15000);
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
        ws.send(
          JSON.stringify({
            type: "user_message",
            text: message,
          })
        );
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

function extractJson(text: string): any | null {
  try {
    return JSON.parse(text);
  } catch {}
  const match = text.match(/\{[\s\S]*\}/);
  if (match) {
    try {
      return JSON.parse(match[0]);
    } catch {}
  }
  return null;
}

function isValidPackage(obj: any): obj is GeneratedPackage {
  return (
    obj &&
    typeof obj === "object" &&
    obj.statement &&
    typeof obj.statement.body === "string" &&
    Array.isArray(obj.checklist) &&
    obj.score &&
    typeof obj.score.total === "number" &&
    Array.isArray(obj.interviewQuestions)
  );
}

export async function POST(request: Request) {
  try {
    const answers: IntakeAnswers = await request.json();
    const apiKey = process.env.ELEVENLABS_API_KEY;
    const agentId = process.env.ELEVENLABS_TEXT_AGENT_ID;
    const score = computeScore(answers);

    if (apiKey && agentId) {
      try {
        const agentText = await callElevenLabsAgent(
          apiKey,
          agentId,
          JSON.stringify(answers)
        );

        const parsed = extractJson(agentText);
        if (parsed && isValidPackage(parsed)) {
          console.log("source: llm");
          const pkg = parsed as GeneratedPackage;
          pkg.score = score;
          pkg.generatedAt = new Date().toISOString();
          return NextResponse.json(pkg);
        }

        console.log("source: fallback");
        console.warn("Agent response was not valid JSON or missing fields:", agentText.slice(0, 200));
      } catch (agentError) {
        console.log("source: fallback");
        console.error("ElevenLabs agent call failed, using template fallback:", agentError);
      }
    }

    const fallback: GeneratedPackage = {
      ...samplePackage,
      score,
      generatedAt: new Date().toISOString(),
      statement: {
        addressedTo: `U.S. Consulate General, Mumbai`,
        body: generateFallbackStatement(answers),
        wordCount: 0,
      },
      checklist: generateFallbackChecklist(answers),
      interviewQuestions: generateFallbackQuestions(answers),
    };
    fallback.statement.wordCount = fallback.statement.body.split(/\s+/).length;

    return NextResponse.json(fallback);
  } catch (error) {
    console.error("Package generation error:", error);
    return NextResponse.json(samplePackage, { status: 200 });
  }
}

function generateFallbackStatement(answers: Partial<IntakeAnswers>): string {
  const name = answers.fullName || "the applicant";
  const purpose = answers.purposeOfVisit || "tourism";
  const employer = answers.employerName || "my employer";
  const income = answers.monthlyIncomeINR
    ? `₹${answers.monthlyIncomeINR.toLocaleString("en-IN")}`
    : "a stable income";
  const duration = answers.travelDurationDays || 14;
  const dependents = answers.dependentsInIndia || 0;
  const employment = answers.employmentStatus || "employed";

  const purposeText: Record<string, string> = {
    tourism: "a tourism and leisure visit",
    business: `business meetings${answers.invitingCompany ? ` with ${answers.invitingCompany}` : ""}`,
    medical: `medical treatment${answers.hospitalName ? ` at ${answers.hospitalName}` : ""}`,
    family_visit: "visiting family members",
    conference: `attending a professional conference${answers.invitingCompany ? ` hosted by ${answers.invitingCompany}` : ""}`,
  };

  let statement = `I, ${name}, am writing to respectfully request a B-1/B-2 visitor visa to the United States. `;
  statement += `The purpose of my visit is ${purposeText[purpose] || "a temporary visit"}, for a planned duration of ${duration} days.\n\n`;

  if (employment === "salaried") {
    statement += `I am currently employed as a professional at ${employer}, where I earn a monthly salary of ${income}. `;
    if (answers.yearsAtJob)
      statement += `I have been with this organization for ${answers.yearsAtJob} years. `;
    statement += `My employer has approved my leave for this trip and I have obtained a No Objection Certificate.\n\n`;
  } else if (employment === "self_employed") {
    statement += `I am a self-employed business owner with an annual turnover of ₹${(answers.annualTurnoverINR || 0).toLocaleString("en-IN")}. `;
    if (answers.gstRegistered) statement += `My business is GST registered. `;
    if (answers.businessHeadcount)
      statement += `I employ ${answers.businessHeadcount} people. `;
    statement += "\n\n";
  } else if (employment === "retired") {
    statement += `I am retired${answers.pensionSource ? `, receiving pension from ${answers.pensionSource}` : ""}. `;
    statement += "\n\n";
  }

  statement += `I have strong ties to India that guarantee my return. `;
  if (dependents > 0)
    statement += `I have ${dependents} dependent${dependents > 1 ? "s" : ""} in India who rely on me. `;
  if (answers.ownsProperty) statement += `I own property in India. `;
  if (answers.assetsINR)
    statement += `My total assets in India are valued at approximately ₹${answers.assetsINR.toLocaleString("en-IN")}. `;
  statement += "\n\n";

  if (
    answers.priorUsVisaOutcome === "refused_214b" &&
    answers.changedSinceRefusal
  ) {
    statement += `I acknowledge that I was previously refused a U.S. visa under Section 214(b). Since that refusal, my circumstances have significantly changed: ${answers.changedSinceRefusal}. I believe these changes demonstrate stronger ties to India and a clearer temporary intent.\n\n`;
  }

  statement += `I wish to emphasize that my visit to the United States is strictly temporary. I have no intention of seeking employment, changing my immigration status, or overstaying my authorized period of stay. I look forward to returning to India to continue my career and be with my family.\n\n`;
  statement += `I kindly request that you consider my application favorably. I am happy to provide any additional documentation that may be required.\n\nRespectfully,\n${name}`;

  return statement;
}

function generateFallbackChecklist(
  answers: Partial<IntakeAnswers>
): GeneratedPackage["checklist"] {
  const base = [...samplePackage.checklist];
  const extras: GeneratedPackage["checklist"] = [];

  if (answers.employmentStatus === "self_employed") {
    const filtered = base.filter(
      (item) => !["employer_noc", "salary_slips", "form16"].includes(item.id)
    );
    extras.push(
      {
        id: "gst_returns",
        name: "GST Returns (Last 2 Years)",
        reason: "Proves business revenue and tax compliance for self-employed applicants",
        whereToGet: "Download from gst.gov.in",
        copyType: "copy",
        category: "financial",
        required: true,
      },
      {
        id: "company_registration",
        name: "Company Registration Certificate",
        reason: "Establishes the legitimacy of your business",
        whereToGet: "Ministry of Corporate Affairs / Registrar of Firms",
        copyType: "copy",
        category: "ties",
        required: true,
      },
      {
        id: "business_bank_statements",
        name: "Business Bank Statements (Last 6 Months)",
        reason: "Shows business cash flow and financial health",
        whereToGet: "Request from your business bank",
        copyType: "original",
        freshnessRule: "Issued within 1 week of interview",
        category: "financial",
        required: true,
      }
    );
    return [...filtered, ...extras];
  }

  if (answers.employmentStatus === "retired") {
    const filtered = base.filter(
      (item) => !["employer_noc", "salary_slips", "form16"].includes(item.id)
    );
    extras.push(
      {
        id: "pension_certificate",
        name: "Pension Certificate / Pension Passbook",
        reason: "Proves regular income post-retirement",
        whereToGet: "Pension disbursing bank / pension authority",
        copyType: "copy",
        category: "financial",
        required: true,
      },
      {
        id: "retirement_bank_statements",
        name: "Bank Statements (Last 6 Months)",
        reason: "Shows pension credits and sufficient funds for the trip",
        whereToGet: "Request from your bank",
        copyType: "original",
        freshnessRule: "Issued within 1 week of interview",
        category: "financial",
        required: true,
      }
    );
    return [...filtered, ...extras];
  }

  if (answers.purposeOfVisit === "medical") {
    extras.push(
      {
        id: "hospital_appointment",
        name: "Hospital Appointment Letter",
        reason: "Confirms your scheduled medical appointment in the US",
        whereToGet: "Request from the US hospital",
        copyType: "original",
        category: "purpose",
        required: true,
      },
      {
        id: "medical_records",
        name: "Medical Records / Doctor's Referral",
        reason: "Shows medical necessity for travelling to the US for treatment",
        whereToGet: "Your treating physician in India",
        copyType: "copy",
        category: "purpose",
        required: true,
      }
    );
  }

  if (answers.purposeOfVisit === "business" || answers.purposeOfVisit === "conference") {
    if (!extras.find((e) => e.id === "invitation_letter")) {
      extras.push({
        id: "business_invitation",
        name: `Invitation Letter${answers.invitingCompany ? ` from ${answers.invitingCompany}` : " from Host Company"}`,
        reason: "Confirms the business purpose and dates of your visit",
        whereToGet: "Request from the inviting company",
        copyType: "original",
        category: "purpose",
        required: true,
      });
    }
  }

  if (!answers.internationalTravelHistory || answers.internationalTravelHistory.length === 0) {
    extras.push({
      id: "stronger_ties",
      name: "Stronger Ties Documentation",
      reason: "As a first-time international traveler, additional evidence of ties to India strengthens your case",
      whereToGet: "Gather property papers, family dependency proof, employment letter, fixed deposit certificates",
      copyType: "copy",
      category: "ties",
      required: true,
    });
  }

  return [...base, ...extras];
}

function generateFallbackQuestions(
  answers: Partial<IntakeAnswers>
): GeneratedPackage["interviewQuestions"] {
  const cached = generatePersonalizedInterview(answers);
  return cached.map((turn, i) => ({
    id: `q${i + 1}`,
    officerPrompt: turn.officer,
    intent: (["purpose", "ties", "finances", "ties", "history", "consistency"] as const)[i] || "consistency",
    suggestedAnswer: turn.applicant,
  }));
}
