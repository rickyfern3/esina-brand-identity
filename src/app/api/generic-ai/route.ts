export const dynamic = 'force-dynamic';
import { NextRequest, NextResponse } from "next/server";
import OpenAI from "openai";

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

export async function POST(req: NextRequest) {
  try {
    const { preferenceText } = await req.json();

    if (!preferenceText || typeof preferenceText !== "string") {
      return NextResponse.json(
        { error: "preferenceText is required" },
        { status: 400 }
      );
    }

    // Ask a generic AI (GPT-4o-mini) to recommend brands WITHOUT Esina data
    // This simulates what a consumer would get from any AI assistant today
    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      temperature: 0.7,
      max_tokens: 1000,
      messages: [
        {
          role: "system",
          content:
            "You are a helpful shopping assistant. A consumer will describe their brand preferences. " +
            "Recommend real DTC / lifestyle / fashion brands that match their preferences. " +
            "Return ONLY a valid JSON array of objects, each with: " +
            '{"brand": "Brand Name", "reason": "1 sentence why"}. ' +
            "Rank by best fit first. Return 5-8 brands. No markdown, no extra text — just the JSON array.",
        },
        {
          role: "user",
          content: `Here are my brand preferences:\n\n${preferenceText}\n\nWhat brands would you recommend?`,
        },
      ],
    });

    const raw = completion.choices[0]?.message?.content?.trim() || "[]";

    // Parse the JSON response, handling potential markdown code fences
    let recommendations: { brand: string; reason: string }[];
    try {
      const cleaned = raw.replace(/^```json?\s*/i, "").replace(/\s*```$/i, "");
      recommendations = JSON.parse(cleaned);
    } catch {
      // If parsing fails, return a simple fallback
      recommendations = [
        { brand: "Unable to parse", reason: raw.slice(0, 200) },
      ];
    }

    return NextResponse.json({ recommendations });
  } catch (err: unknown) {
    console.error("generic-ai error:", err);
    const message = err instanceof Error ? err.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
