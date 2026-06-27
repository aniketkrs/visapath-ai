import { NextResponse } from "next/server";
import { computeScore } from "@/lib/scoring";
import { samplePackage } from "@/lib/fixtures/sample-package";

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
        ws.send(JSON.stringify({ type: "user_activity" }));
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

  const codeBlockMatch = text.match(/```(?:json)?\s*([\s\S]*?)```/);
  if (codeBlockMatch) {
    try {
      return JSON.parse(codeBlockMatch[1].trim());
    } catch {}
  }

  const firstBrace = text.indexOf("{");
  if (firstBrace === -1) return null;

  let depth = 0;
  for (let i = firstBrace; i < text.length; i++) {
    if (text[i] === "{") depth++;
    else if (text[i] === "}") depth--;
    if (depth === 0) {
      try {
        return JSON.parse(text.slice(firstBrace, i + 1));
      } catch {
        break;
      }
    }
  }

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
        const packagePrompt = `Generate a US visa (B-1/B-2) preparation package for this Indian applicant. Return a JSON object with these fields: "statement" (object with "addressedTo" and "body" strings), "checklist" (array of document objects with id, name, reason, whereToGet, copyType, category, required), and "interviewQuestions" (array with id, officerPrompt, intent, suggestedAnswer). Applicant profile:\n${JSON.stringify(answers, null, 2)}\n\nReturn the JSON object. You may include explanatory text before or after it.`;

        const agentText = await callElevenLabsAgent(
          apiKey,
          agentId,
          packagePrompt
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

function formatINR(amount: number): string {
  return `₹${amount.toLocaleString("en-IN")}`;
}

function generateFallbackStatement(answers: Partial<IntakeAnswers>): string {
  const name = answers.fullName || "the applicant";
  const purpose = answers.purposeOfVisit || "tourism";
  const employer = answers.employerName || "my employer";
  const monthlyIncome = answers.monthlyIncomeINR || 0;
  const annualIncome = monthlyIncome * 12;
  const duration = answers.travelDurationDays || 14;
  const dependents = answers.dependentsInIndia || 0;
  const employment = answers.employmentStatus || "salaried";
  const assets = answers.assetsINR || 0;
  const isPriorRefusal = answers.priorUsVisaOutcome === "refused_214b";
  const isFirstTime = !answers.internationalTravelHistory || answers.internationalTravelHistory.length === 0;

  const startDate = answers.travelStartDate
    ? new Date(answers.travelStartDate).toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" })
    : "the planned dates";

  const purposeDetails: Record<string, string> = {
    tourism: `a tourism and leisure visit to explore the United States`,
    business: `a business visit${answers.invitingCompany ? ` to meet with ${answers.invitingCompany}` : ""}${answers.meetingPurpose ? ` for ${answers.meetingPurpose}` : ""}`,
    medical: `seeking medical treatment${answers.hospitalName ? ` at ${answers.hospitalName}` : ""}${answers.appointmentDate ? `, with an appointment scheduled on ${answers.appointmentDate}` : ""}`,
    family_visit: `visiting family members in the United States`,
    conference: `attending a professional conference${answers.invitingCompany ? ` hosted by ${answers.invitingCompany}` : ""}${answers.meetingPurpose ? ` — ${answers.meetingPurpose}` : ""}`,
  };

  let statement = `I, ${name}, respectfully submit this letter in support of my B-1/B-2 visitor visa application to the United States. `;
  statement += `The purpose of my visit is ${purposeDetails[purpose] || "a temporary visit"}. `;
  statement += `I plan to travel starting ${startDate} for a duration of ${duration} days.\n\n`;

  if (employment === "salaried") {
    statement += `I am currently employed at ${employer}`;
    if (answers.yearsAtJob) statement += `, where I have been working for the past ${answers.yearsAtJob} year${answers.yearsAtJob > 1 ? "s" : ""}`;
    statement += `. My monthly salary is ${formatINR(monthlyIncome)}, which amounts to an annual income of ${formatINR(annualIncome)}. `;
    statement += `My employer has approved my leave for this trip and has issued a No Objection Certificate confirming that I am expected to return to my position. `;
    statement += `I have enclosed my employment letter, recent salary slips, and Form 16 as evidence of my stable employment and income.\n\n`;
  } else if (employment === "self_employed") {
    statement += `I am a self-employed business owner`;
    if (answers.annualTurnoverINR) statement += ` with an annual turnover of ${formatINR(answers.annualTurnoverINR)}`;
    statement += `. `;
    if (answers.gstRegistered) statement += `My business is registered under GST and I have enclosed my GST returns for the last two years as proof of ongoing business operations and tax compliance. `;
    if (answers.businessHeadcount) statement += `I employ ${answers.businessHeadcount} people, which demonstrates the scale and stability of my business. `;
    statement += `I have enclosed my company registration certificate, business bank statements, and Income Tax Returns to substantiate my financial position.\n\n`;
  } else if (employment === "retired") {
    statement += `I am retired from active employment`;
    if (answers.pensionSource) statement += ` and receive a regular pension from ${answers.pensionSource}`;
    statement += `. `;
    statement += `My post-retirement income and savings are sufficient to cover all expenses for this trip. I have enclosed my pension certificate, bank statements, and investment proofs as evidence of my financial standing.\n\n`;
  } else if (employment === "student") {
    statement += `I am currently a student. My trip is being sponsored by my family, and I have enclosed my sponsor's income proof and bank statements to demonstrate adequate financial support for this visit.\n\n`;
  }

  if (monthlyIncome > 0) {
    const tripCostEstimate = Math.round(duration * 15000);
    statement += `The estimated cost of this trip is approximately ${formatINR(tripCostEstimate)}, which represents roughly ${Math.round((tripCostEstimate / annualIncome) * 100)}% of my annual income — well within my financial capacity. `;
    if (assets > 0) {
      statement += `My total assets in India, including savings, investments, and property, are valued at approximately ${formatINR(assets)}. `;
    }
    statement += `\n\n`;
  }

  statement += `I have strong ties to India that compel my return. `;
  if (employment === "salaried" && answers.yearsAtJob) {
    statement += `I hold a permanent position at ${employer} with active responsibilities and an ongoing career trajectory. `;
  }
  if (dependents > 0) {
    statement += `I have ${dependents} dependent${dependents > 1 ? "s" : ""} in India who rely on me for financial and emotional support. `;
  }
  if (answers.ownsProperty) {
    statement += `I own property in India, which represents a significant long-term investment and anchor to my home country. `;
  }
  statement += `\n\n`;

  if (answers.internationalTravelHistory && answers.internationalTravelHistory.length > 0) {
    statement += `I have a history of compliant international travel. I have previously visited ${answers.internationalTravelHistory.length} countr${answers.internationalTravelHistory.length > 1 ? "ies" : "y"} and have always returned to India within the authorized period of stay. This demonstrates my respect for immigration laws and my genuine intent to return.\n\n`;
  }

  if (isPriorRefusal && answers.changedSinceRefusal) {
    statement += `I acknowledge that my previous U.S. visa application was refused under Section 214(b) of the Immigration and Nationality Act. I have given careful thought to the reasons for that refusal and have taken concrete steps to address the concerns raised. Since that refusal, the following material changes have occurred in my circumstances: ${answers.changedSinceRefusal}. `;
    statement += `I respectfully submit that these changes demonstrate significantly stronger ties to India and a clearer, more compelling temporary purpose for my visit. I have enclosed updated financial documents, employment verification, and evidence of these changes to support my case.\n\n`;
  } else if (isPriorRefusal) {
    statement += `I acknowledge that my previous U.S. visa application was refused under Section 214(b). Since then, my circumstances have changed substantially — I have enclosed updated documentation to demonstrate my strengthened ties to India and the genuine temporary nature of this visit.\n\n`;
  }

  if (isFirstTime) {
    statement += `While this is my first visit to the United States, I wish to emphasize that I have strong roots in India — including my career, family, property, and financial commitments — that leave me with no intention of remaining beyond my authorized stay. `;
  }

  statement += `I wish to emphasize that my visit to the United States is strictly temporary. I have no intention of seeking employment, changing my immigration status, or overstaying my authorized period of stay. I am committed to returning to India to resume my ${employment === "salaried" ? "professional responsibilities" : employment === "self_employed" ? "business operations" : employment === "student" ? "studies" : "life and commitments"} immediately upon the conclusion of my trip.\n\n`;
  statement += `I kindly request that you consider my application favorably. I am happy to provide any additional documentation or information that may be required.\n\nRespectfully,\n${name}`;

  return statement;
}

function generateFallbackChecklist(
  answers: Partial<IntakeAnswers>
): GeneratedPackage["checklist"] {
  const employer = answers.employerName || "your employer";
  const inviting = answers.invitingCompany || "the host company";
  const employment = answers.employmentStatus || "salaried";
  const purpose = answers.purposeOfVisit || "tourism";
  const isFirstTime = !answers.internationalTravelHistory || answers.internationalTravelHistory.length === 0;
  const isPriorRefusal = answers.priorUsVisaOutcome === "refused_214b";

  const items: GeneratedPackage["checklist"] = [];

  // ── Always include: core identity & application documents ──
  items.push(
    {
      id: "passport",
      name: "Valid Indian Passport",
      reason: "Primary identity document. Must have at least 6 months validity beyond your planned stay in the US",
      whereToGet: "Passport Seva Kendra / already in possession",
      copyType: "original",
      category: "identity",
      required: true,
    },
    {
      id: "ds160",
      name: "DS-160 Confirmation Page",
      reason: "Required online nonimmigrant visa application — must be completed before your interview",
      whereToGet: "ceac.state.gov — complete and print confirmation page",
      copyType: "copy",
      category: "identity",
      required: true,
    },
    {
      id: "photo",
      name: "US Visa Photograph (5x5 cm)",
      reason: "Must meet US visa photo specifications — recent, white background, no glasses",
      whereToGet: "Any authorized photo studio — mention US visa photo requirements",
      copyType: "original",
      category: "identity",
      required: true,
    },
    {
      id: "fee_receipt",
      name: "MRV Fee Receipt",
      reason: "Proof of visa application fee payment ($185 for B-1/B-2)",
      whereToGet: "Pay at designated bank or online via ustraveldocs.com",
      copyType: "copy",
      category: "identity",
      required: true,
    },
    {
      id: "appointment",
      name: "Interview Appointment Letter",
      reason: "Confirms your scheduled interview date, time, and location",
      whereToGet: "ustraveldocs.com after fee payment",
      copyType: "copy",
      category: "identity",
      required: true,
    },
    {
      id: "travel_history",
      name: "Travel History Evidence",
      reason: "Previous visa copies, entry/exit stamps, and immigration records demonstrate compliant travel history",
      whereToGet: "Your passport pages, old passports, e-visa printouts",
      copyType: "copy",
      category: "travel",
      required: true,
    },
    {
      id: "ties_proof",
      name: "Proof of Ties to India",
      reason: "Property papers, family documents, or other evidence showing strong reasons to return to India",
      whereToGet: "Property registration, family certificates, school enrollment letters for dependents",
      copyType: "copy",
      category: "ties",
      required: true,
    }
  );

  // ── Employment-specific items ──
  if (employment === "salaried") {
    items.push(
      {
        id: "employer_noc",
        name: "Employer NOC (No Objection Certificate)",
        reason: `Proves that ${employer} approves your travel and expects you to return to your position`,
        whereToGet: `Request from HR department at ${employer}`,
        copyType: "original",
        freshnessRule: "Issued within 1 month of interview",
        category: "ties",
        required: true,
      },
      {
        id: "salary_slips",
        name: "Last 3 Months Salary Slips",
        reason: "Demonstrates regular, stable income and active employment",
        whereToGet: "HR department or payroll portal",
        copyType: "copy",
        freshnessRule: "Most recent 3 consecutive months",
        category: "financial",
        required: true,
      },
      {
        id: "form16",
        name: "Form 16 (Latest Assessment Year)",
        reason: "Official tax deduction certificate from employer — proves declared income",
        whereToGet: "HR department / download from TRACES portal (tdscpc.gov.in)",
        copyType: "copy",
        category: "financial",
        required: true,
      },
      {
        id: "employment_letter",
        name: "Employment Letter / Offer Letter",
        reason: "Confirms your role, tenure, and salary — establishes professional stability",
        whereToGet: `Request from HR at ${employer}`,
        copyType: "original",
        freshnessRule: "Issued within 1 month of interview",
        category: "ties",
        required: true,
      },
      {
        id: "company_id",
        name: "Company ID Card Copy",
        reason: "Additional proof of active employment and access to workplace",
        whereToGet: "Your existing employee ID card — photocopy both sides",
        copyType: "copy",
        category: "ties",
        required: false,
      }
    );
  } else if (employment === "self_employed") {
    items.push(
      {
        id: "gst_returns",
        name: "GST Returns (Last 2 Years)",
        reason: "Proves ongoing business revenue, tax compliance, and operational scale",
        whereToGet: "Download from gst.gov.in — GSTR-3B and GSTR-1 filings",
        copyType: "copy",
        category: "financial",
        required: true,
      },
      {
        id: "itr_business",
        name: "Income Tax Returns (Last 2-3 Years)",
        reason: "Comprehensive proof of business income and tax compliance",
        whereToGet: "Download from incometax.gov.in",
        copyType: "copy",
        category: "financial",
        required: true,
      },
      {
        id: "company_registration",
        name: "Company Registration Certificate",
        reason: "Establishes the legal existence and legitimacy of your business",
        whereToGet: "Ministry of Corporate Affairs (MCA) / Registrar of Firms / Udyam registration",
        copyType: "copy",
        category: "ties",
        required: true,
      },
      {
        id: "business_bank_statements",
        name: "Business Bank Statements (Last 6 Months)",
        reason: "Shows business cash flow, transaction volume, and financial health",
        whereToGet: "Request from your business bank — get stamped copies",
        copyType: "original",
        freshnessRule: "Issued within 1 week of interview",
        category: "financial",
        required: true,
      },
      {
        id: "business_pan",
        name: "Business PAN Card",
        reason: "Tax identification for your business entity",
        whereToGet: "Already in possession / NSDL portal",
        copyType: "copy",
        category: "financial",
        required: true,
      },
      {
        id: "partnership_deed",
        name: "Partnership Deed / MOA (if applicable)",
        reason: "Defines business ownership structure — only needed for partnership or private limited companies",
        whereToGet: "Already in possession from business registration",
        copyType: "copy",
        category: "ties",
        required: false,
      }
    );
  } else if (employment === "retired") {
    items.push(
      {
        id: "pension_certificate",
        name: "Pension Certificate / Pension Passbook",
        reason: "Proves regular post-retirement income stream",
        whereToGet: "Pension disbursing bank / pension authority (CGDA, SBI, etc.)",
        copyType: "copy",
        category: "financial",
        required: true,
      },
      {
        id: "bank_statements_retired",
        name: "Bank Statements (Last 6 Months)",
        reason: "Shows pension credits, savings balance, and sufficient funds for the trip",
        whereToGet: "Request from your bank — get stamped and signed copies",
        copyType: "original",
        freshnessRule: "Issued within 1 week of interview",
        category: "financial",
        required: true,
      },
      {
        id: "retirement_docs",
        name: "Retirement Order / Gratuity Documents",
        reason: "Proves retirement status and source of retirement benefits",
        whereToGet: "Former employer's HR department / pension authority",
        copyType: "copy",
        category: "financial",
        required: true,
      },
      {
        id: "investment_proofs",
        name: "FD Certificates / Investment Proofs",
        reason: "Demonstrates additional financial assets and stability beyond pension",
        whereToGet: "Bank FD receipts, mutual fund statements, demat account statements",
        copyType: "copy",
        category: "financial",
        required: true,
      }
    );
  } else if (employment === "student") {
    items.push(
      {
        id: "college_id",
        name: "College ID / Enrollment Letter",
        reason: "Proves active student status and enrollment in an educational institution",
        whereToGet: "Your college administration office",
        copyType: "copy",
        category: "ties",
        required: true,
      },
      {
        id: "sponsor_income",
        name: "Sponsor's Income Proof",
        reason: "Demonstrates that your sponsor has adequate financial resources to fund your trip",
        whereToGet: "Sponsor's salary slips, ITR, employment letter",
        copyType: "copy",
        category: "financial",
        required: true,
      },
      {
        id: "sponsor_bank",
        name: "Sponsor's Bank Statements (6 Months)",
        reason: "Shows sponsor's financial capacity and fund availability",
        whereToGet: "Sponsor's bank — stamped and signed copies",
        copyType: "original",
        freshnessRule: "Issued within 1 week of interview",
        category: "financial",
        required: true,
      },
      {
        id: "i20",
        name: "I-20 Form (if applicable)",
        reason: "Required only for F-1 student visa applicants — not needed for B-1/B-2",
        whereToGet: "US educational institution via SEVIS system",
        copyType: "original",
        category: "identity",
        required: false,
      }
    );
  }

  // ── Common financial documents for all non-student applicants ──
  if (employment !== "student") {
    items.push(
      {
        id: "bank_statements",
        name: "6 Months Personal Bank Statements",
        reason: "Shows financial stability, salary credits, and sufficient funds for the trip",
        whereToGet: "Request from your bank — get stamped and signed copies",
        copyType: "original",
        freshnessRule: "Issued within 1 week of interview",
        category: "financial",
        required: true,
      },
      {
        id: "itr",
        name: "Income Tax Returns (Last 2-3 Years)",
        reason: "Comprehensive proof of declared income and tax compliance",
        whereToGet: "Download from incometax.gov.in — ITR-V acknowledgment",
        copyType: "copy",
        category: "financial",
        required: true,
      }
    );
  }

  // ── Purpose-specific items ──
  if (purpose === "tourism") {
    items.push(
      {
        id: "travel_itinerary",
        name: "Travel Itinerary",
        reason: "Shows planned activities and destinations — demonstrates genuine tourism intent",
        whereToGet: "Create a day-by-day plan of your trip including cities, attractions, and accommodation",
        copyType: "copy",
        category: "purpose",
        required: true,
      },
      {
        id: "hotel_bookings",
        name: "Hotel Bookings / Accommodation Proof",
        reason: "Confirms where you will stay during the trip",
        whereToGet: "Hotel booking confirmations (Booking.com, Airbnb, etc.)",
        copyType: "copy",
        category: "purpose",
        required: true,
      }
    );
  } else if (purpose === "business") {
    items.push(
      {
        id: "invitation_letter",
        name: `Invitation Letter from ${inviting}`,
        reason: "Confirms the business purpose, dates, and nature of your visit",
        whereToGet: `Request from ${inviting} — should be on company letterhead`,
        copyType: "original",
        category: "purpose",
        required: true,
      },
      {
        id: "company_profile",
        name: "Company Profile of Inviting Company",
        reason: "Establishes the legitimacy and standing of the company you are visiting",
        whereToGet: "Company website, LinkedIn page, or request from the inviting company",
        copyType: "copy",
        category: "purpose",
        required: false,
      }
    );
  } else if (purpose === "medical") {
    items.push(
      {
        id: "hospital_appointment",
        name: "Hospital Appointment Letter",
        reason: "Confirms your scheduled medical appointment in the US",
        whereToGet: `Request from the US hospital${answers.hospitalName ? ` (${answers.hospitalName})` : ""}`,
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
      },
      {
        id: "cost_estimate",
        name: "Cost Estimate from US Hospital",
        reason: "Shows the expected treatment cost — needed to demonstrate financial capacity",
        whereToGet: `Request from ${answers.hospitalName || "the US hospital"}`,
        copyType: "original",
        category: "purpose",
        required: true,
      }
    );
  } else if (purpose === "family_visit") {
    items.push(
      {
        id: "invitation_relative",
        name: "Invitation Letter from Relative",
        reason: "Confirms the family relationship and purpose of your visit",
        whereToGet: "Your relative in the US — should include their contact details and address",
        copyType: "original",
        category: "purpose",
        required: true,
      },
      {
        id: "relative_status",
        name: "Relative's Immigration Status Proof",
        reason: "Establishes the legal status of your host in the United States",
        whereToGet: "Copy of relative's US passport, green card, or valid visa",
        copyType: "copy",
        category: "purpose",
        required: true,
      }
    );
  } else if (purpose === "conference") {
    items.push(
      {
        id: "conference_registration",
        name: "Conference Registration Confirmation",
        reason: "Proves you are registered for the conference and have a legitimate reason to travel",
        whereToGet: "Conference organizer — registration confirmation email or badge",
        copyType: "copy",
        category: "purpose",
        required: true,
      },
      {
        id: "presentation_acceptance",
        name: "Presentation Acceptance Letter (if applicable)",
        reason: "If you are presenting, this shows you have an active role at the conference",
        whereToGet: "Conference organizing committee",
        copyType: "copy",
        category: "purpose",
        required: false,
      }
    );
  }

  // ── Prior refusal items ──
  if (isPriorRefusal) {
    items.push(
      {
        id: "changed_circumstances",
        name: "Changed Circumstances Documentation",
        reason: "Provides evidence of the material changes in your situation since the previous refusal",
        whereToGet: "Compile documents showing career advancement, new assets, increased income, or other changes",
        copyType: "copy",
        category: "ties",
        required: true,
      },
      {
        id: "new_financial_docs",
        name: "New Financial Documents Since Refusal",
        reason: "Shows improved financial standing since the previous application",
        whereToGet: "Updated bank statements, new FD certificates, salary increments, new property documents",
        copyType: "copy",
        category: "financial",
        required: true,
      },
      {
        id: "change_letter",
        name: "Letter Explaining What Has Changed",
        reason: "A clear, written explanation addressing the 214(b) refusal and outlining concrete changes",
        whereToGet: "Write yourself — keep factual, specific, and reference supporting documents",
        copyType: "original",
        category: "ties",
        required: true,
      }
    );
  }

  // ── First-time traveler extras ──
  if (isFirstTime) {
    items.push({
      id: "stronger_ties",
      name: "Additional Ties Documentation",
      reason: "As a first-time international traveler, extra evidence of ties to India strengthens your case significantly",
      whereToGet: "Gather property papers, family dependency proof, employment letter, fixed deposit certificates, investment portfolio statements",
      copyType: "copy",
      category: "ties",
      required: true,
    });
  }

  // ── Common travel items ──
  items.push(
    {
      id: "flight_itinerary",
      name: "Flight Itinerary (Round Trip)",
      reason: "Shows confirmed return date — demonstrates temporary intent and commitment to return",
      whereToGet: "Booking confirmation from airline / travel agent (refundable booking acceptable)",
      copyType: "copy",
      category: "travel",
      required: true,
    },
    {
      id: "travel_insurance",
      name: "Travel Medical Insurance",
      reason: "Recommended coverage for the duration of your trip — covers medical emergencies in the US",
      whereToGet: "Any insurance provider (ICICI Lombard, Bajaj Allianz, TATA AIG, etc.)",
      copyType: "copy",
      category: "travel",
      required: false,
    }
  );

  return items;
}

function generateFallbackQuestions(
  answers: Partial<IntakeAnswers>
): GeneratedPackage["interviewQuestions"] {
  const name = answers.fullName || "the applicant";
  const employer = answers.employerName || "my employer";
  const inviting = answers.invitingCompany || "the host company";
  const employment = answers.employmentStatus || "salaried";
  const purpose = answers.purposeOfVisit || "tourism";
  const monthlyIncome = answers.monthlyIncomeINR || 0;
  const assets = answers.assetsINR || 0;
  const dependents = answers.dependentsInIndia || 0;
  const duration = answers.travelDurationDays || 14;
  const isPriorRefusal = answers.priorUsVisaOutcome === "refused_214b";

  const questions: GeneratedPackage["interviewQuestions"] = [];

  // ── Purpose question (always first) ──
  if (purpose === "business") {
    questions.push({
      id: "q1",
      officerPrompt: `What is the purpose of your trip to the United States?`,
      intent: "purpose",
      suggestedAnswer: `I'm travelling to the US for a business visit — specifically to meet with ${inviting}${answers.meetingPurpose ? ` for ${answers.meetingPurpose}` : ""}. My employer ${employer} has approved this trip and provided a No Objection Certificate.`,
    });
  } else if (purpose === "tourism") {
    questions.push({
      id: "q1",
      officerPrompt: `What is the purpose of your trip to the United States?`,
      intent: "purpose",
      suggestedAnswer: `I'm going on a ${duration}-day tourism trip to the United States. I plan to visit major cities and tourist attractions. I have a detailed itinerary and hotel bookings ready.`,
    });
  } else if (purpose === "medical") {
    questions.push({
      id: "q1",
      officerPrompt: `What is the purpose of your trip to the United States?`,
      intent: "purpose",
      suggestedAnswer: `I'm travelling to the US for medical treatment${answers.hospitalName ? ` at ${answers.hospitalName}` : ""}. I have an appointment letter and medical records from my doctor in India recommending this treatment.`,
    });
  } else if (purpose === "family_visit") {
    questions.push({
      id: "q1",
      officerPrompt: `What is the purpose of your trip to the United States?`,
      intent: "purpose",
      suggestedAnswer: `I'm visiting my family members in the United States. I have an invitation letter from my relative, and I plan to stay for ${duration} days before returning to India.`,
    });
  } else if (purpose === "conference") {
    questions.push({
      id: "q1",
      officerPrompt: `What is the purpose of your trip to the United States?`,
      intent: "purpose",
      suggestedAnswer: `I'm attending a professional conference${answers.invitingCompany ? ` hosted by ${answers.invitingCompany}` : ""}${answers.meetingPurpose ? ` — ${answers.meetingPurpose}` : ""}. I have my registration confirmation and am happy to share details about the event.`,
    });
  }

  // ── Employment / income question ──
  if (employment === "salaried") {
    questions.push({
      id: `q${questions.length + 1}`,
      officerPrompt: `What do you do for a living?`,
      intent: "ties",
      suggestedAnswer: `I'm employed at ${employer}${answers.yearsAtJob ? `, where I've been working for ${answers.yearsAtJob} year${answers.yearsAtJob > 1 ? "s" : ""}` : ""}. My monthly salary is ${formatINR(monthlyIncome)}. I have a permanent position with active projects and responsibilities.`,
    });
  } else if (employment === "self_employed") {
    questions.push({
      id: `q${questions.length + 1}`,
      officerPrompt: `Tell me about your business.`,
      intent: "ties",
      suggestedAnswer: `I own and operate a business${answers.annualTurnoverINR ? ` with an annual turnover of ${formatINR(answers.annualTurnoverINR)}` : ""}${answers.businessHeadcount ? ` and ${answers.businessHeadcount} employees` : ""}. ${answers.gstRegistered ? "My business is GST registered and I file regular returns." : ""} I have enclosed my registration certificate and business bank statements.`,
    });
  } else if (employment === "retired") {
    questions.push({
      id: `q${questions.length + 1}`,
      officerPrompt: `What do you do currently?`,
      intent: "ties",
      suggestedAnswer: `I'm retired${answers.pensionSource ? ` and receive a regular pension from ${answers.pensionSource}` : ""}. My post-retirement savings and investments are sufficient for this trip and I have no financial concerns.`,
    });
  } else if (employment === "student") {
    questions.push({
      id: `q${questions.length + 1}`,
      officerPrompt: `Are you currently studying?`,
      intent: "ties",
      suggestedAnswer: `Yes, I'm a student. My trip is being sponsored by my family, and I have enclosed their income proof and bank statements. I'm committed to returning to India to continue my studies.`,
    });
  }

  // ── Financial question ──
  questions.push({
    id: `q${questions.length + 1}`,
    officerPrompt: `Who is paying for this trip and what are your finances?`,
    intent: "finances",
    suggestedAnswer: employment === "student"
      ? `My sponsor is covering all expenses. I've enclosed their bank statements and income proof showing they have sufficient funds.`
      : `I'm funding the trip entirely myself. ${monthlyIncome > 0 ? `My monthly income is ${formatINR(monthlyIncome)}.` : ""} ${assets > 0 ? `My total assets in India are valued at approximately ${formatINR(assets)}.` : ""} The estimated trip cost is well within my financial capacity.`,
  });

  // ── Ties question ──
  let tiesAnswer = `I have strong reasons to return to India. `;
  if (employment === "salaried") tiesAnswer += `I have a permanent job at ${employer} with ongoing projects. `;
  if (employment === "self_employed") tiesAnswer += `I have an established business with employees who depend on me. `;
  if (dependents > 0) tiesAnswer += `I have ${dependents} dependent${dependents > 1 ? "s" : ""} in India who rely on me. `;
  if (answers.ownsProperty) tiesAnswer += `I own property in India. `;
  tiesAnswer += `My entire professional, financial, and personal life is based in India.`;

  questions.push({
    id: `q${questions.length + 1}`,
    officerPrompt: `What ties do you have to India that ensure you will return?`,
    intent: "ties",
    suggestedAnswer: tiesAnswer,
  });

  // ── Travel history ──
  if (answers.internationalTravelHistory && answers.internationalTravelHistory.length > 0) {
    questions.push({
      id: `q${questions.length + 1}`,
      officerPrompt: `Have you travelled internationally before?`,
      intent: "history",
      suggestedAnswer: `Yes, I have visited ${answers.internationalTravelHistory.length} countr${answers.internationalTravelHistory.length > 1 ? "ies" : "y"} previously${answers.internationalTravelHistory.includes("SG") ? " including Singapore" : ""}${answers.internationalTravelHistory.includes("GB") ? " and the United Kingdom" : ""}. I returned to India on time after each trip, which demonstrates my compliance with immigration rules.`,
    });
  } else {
    questions.push({
      id: `q${questions.length + 1}`,
      officerPrompt: `Have you travelled internationally before?`,
      intent: "history",
      suggestedAnswer: `This would be my first international trip. However, I have strong ties to India — my career, family, property, and financial commitments are all here. I have every reason to return and no intention of overstaying.`,
    });
  }

  // ── Prior refusal question ──
  if (isPriorRefusal) {
    questions.push({
      id: `q${questions.length + 1}`,
      officerPrompt: `I see your previous visa was refused. What has changed since then?`,
      intent: "consistency",
      suggestedAnswer: answers.changedSinceRefusal
        ? `Since my previous application, ${answers.changedSinceRefusal}. I have enclosed updated documentation to demonstrate these changes. I believe my current situation clearly shows stronger ties to India and a genuine temporary purpose for this visit.`
        : `Since my previous application, my circumstances have improved significantly. I have enclosed updated financial documents, employment verification, and evidence of stronger ties to India.`,
    });
  }

  // ── Return / intent question ──
  questions.push({
    id: `q${questions.length + 1}`,
    officerPrompt: `What is your plan after the trip ends?`,
    intent: "purpose",
    suggestedAnswer: `I will return to India immediately after my ${duration}-day trip. ${employment === "salaried" ? `I need to get back to my role at ${employer} — I have active projects and team responsibilities waiting for me.` : employment === "self_employed" ? "My business operations require my ongoing attention and presence in India." : employment === "student" ? "I need to return to continue my studies." : "My life and commitments are all based in India."}`,
  });

  // ── Consistency trap ──
  questions.push({
    id: `q${questions.length + 1}`,
    officerPrompt: `Would you take a job in the US if offered one?`,
    intent: "consistency",
    suggestedAnswer: `No. My career and life are established in India. ${employment === "salaried" ? `I have a stable position at ${employer}` : employment === "self_employed" ? "I have my own business" : "I have strong commitments"} in India${dependents > 0 ? `, and I have dependents who need me` : ""}. I have no plans to relocate and this trip is purely temporary.`,
  });

  return questions;
}
