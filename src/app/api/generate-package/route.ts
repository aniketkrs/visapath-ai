import { NextResponse } from "next/server";
import { computeScore } from "@/lib/scoring";
import { samplePackage } from "@/lib/fixtures/sample-package";
import type { IntakeAnswers, GeneratedPackage } from "@/lib/types";

export async function POST(request: Request) {
  try {
    const answers: IntakeAnswers = await request.json();
    const apiKey = process.env.ELEVENLABS_API_KEY;
    const agentId = process.env.ELEVENLABS_TEXT_AGENT_ID;

    // Always compute deterministic score
    const score = computeScore(answers);

    // Try ElevenLabs text agent if credentials exist
    if (apiKey && agentId) {
      try {
        const controller = new AbortController();
        const timeout = setTimeout(() => controller.abort(), 25000);

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
                  content: JSON.stringify(answers),
                },
              ],
            }),
            signal: controller.signal,
          }
        );

        clearTimeout(timeout);

        if (response.ok) {
          const data = await response.json();
          if (data && typeof data === "object" && data.statement) {
            const pkg = data as GeneratedPackage;
            pkg.score = score;
            pkg.generatedAt = new Date().toISOString();
            return NextResponse.json(pkg);
          }
        }
      } catch (elevenLabsError) {
        console.error("ElevenLabs call failed, using template fallback:", elevenLabsError);
      }
    }

    // Fallback: generate a personalized package using templates
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

  if (answers.employmentStatus === "self_employed") {
    return base.filter(
      (item) =>
        !["employer_noc", "salary_slips", "form16"].includes(item.id)
    );
  }

  if (answers.employmentStatus === "retired") {
    return base.filter(
      (item) => !["employer_noc", "salary_slips", "form16"].includes(item.id)
    );
  }

  return base;
}

function generateFallbackQuestions(
  answers: Partial<IntakeAnswers>
): GeneratedPackage["interviewQuestions"] {
  return samplePackage.interviewQuestions;
}
