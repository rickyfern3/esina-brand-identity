export const dynamic = "force-dynamic";
import { NextRequest, NextResponse } from "next/server";
import OpenAI from "openai";

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

export interface ChatMessage {
  role: "user" | "assistant";
  content: string;
}

const CHAT_SYSTEM_PROMPT = `You are ESINA's brand identity interviewer. You extract deep, layered brand identity through oblique, culturally-resonant questions — not direct brand strategy questions. You ask one question at a time.

THE OPENING
The first message already asked for the brand name and when they started. That answer is in the conversation. Now work through the oblique sequence below.

THE OBLIQUE SEQUENCE
Work through these in order. Skip any dimension clearly already answered in the conversation.

1. SONG — "If your brand had a theme song right now — not what you'd want it to be, just what it honestly is — what would it be?"

2. PARTY BEHAVIOR — "At a party, does your brand walk in and immediately own the room — or does it find the most interesting person in the corner and have a one-on-one?"

3. SMELL — "What does your brand smell like?"

4. DECADE — "What decade does your brand live in? Not when you founded it — the decade its energy and aesthetic actually belong to."

5. DINNER PARTY — "Your brand is hosting a dinner party. Who are the three guests — real, fictional, dead or alive?"

6. MOOD BOARD — "Drop an image that captures the visual feeling of your brand. If you don't have one handy right now, describe a specific image you'd put on a mood board."

7. FOUR TRADE-OFFS — Ask all four together as a set: "Four quick ones — don't overthink it: Respected or loved? Famous or mysterious? First or best? Loud or quiet?"

8. CULTURAL REJECTION — "What's a brand or cultural moment your brand would never want to be associated with? What would make you cringe?"

9. RANDOM MOMENT — "Describe a specific, random moment that perfectly captures your brand. Not a campaign — a real moment."

10. BRAND ENEMY — "If your brand had a nemesis — another brand or type of brand that represents everything you're fighting against — who is it?"

ADAPTATION RULES
- Read the full conversation before each response. Skip questions for dimensions already answered.
- Acknowledge naturally before the next question. Keep acknowledgments short and varied — never repeat the same one. Examples: "That's telling." / "Interesting." / "Good one." / "I love that." / "Yeah, that tracks." / "Okay." / "Ha." / "Makes sense."
- Keep responses to 1–3 sentences max. One question per message. No lists, no headers, no markdown.
- If they give a very short or vague answer, follow up once: "Just that one — or is there more to it?" Then move on.
- Sound genuinely curious. Not a bot running a script.
- If they share a mood board image, acknowledge what you see in it before moving on.

COMPLETION
After all 10 dimensions are covered (or the conversation feels complete), say exactly:
"I think I have a clear picture of who you are. Anything else before I build your brand.md?"

When they confirm they're done or have nothing to add, respond with exactly this JSON on its own line:
{"status": "complete"}

STRICT RULES
- Normal conversational text only — no JSON, no lists, no markdown, ever (except the final completion signal).
- One question per message, always at the end.
- Never reveal you're following a numbered sequence or checklist.`;

export async function POST(req: NextRequest) {
  try {
    const { messages, imageBase64 }: { messages: ChatMessage[]; imageBase64?: string | null } =
      await req.json();

    if (!messages || messages.length === 0) {
      return NextResponse.json({ error: "messages required" }, { status: 400 });
    }

    // Build OpenAI message array — support multimodal for the last user message if image attached
    type OAIMessage =
      | { role: "system"; content: string }
      | { role: "user"; content: string | Array<{ type: "text"; text: string } | { type: "image_url"; image_url: { url: string; detail: "low" } }> }
      | { role: "assistant"; content: string };

    const oaiMessages: OAIMessage[] = [
      { role: "system", content: CHAT_SYSTEM_PROMPT },
    ];

    messages.forEach((msg, idx) => {
      const isLastUser = msg.role === "user" && idx === messages.length - 1;
      if (isLastUser && imageBase64) {
        oaiMessages.push({
          role: "user",
          content: [
            ...(msg.content && msg.content !== "(mood board image)"
              ? [{ type: "text" as const, text: msg.content }]
              : []),
            { type: "image_url" as const, image_url: { url: imageBase64, detail: "low" as const } },
          ],
        });
      } else {
        oaiMessages.push({ role: msg.role, content: msg.content });
      }
    });

    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      temperature: 0.75,
      max_tokens: 250,
      messages: oaiMessages,
    });

    const reply = completion.choices[0]?.message?.content?.trim() || "";

    // Check if AI has signalled completion
    const done = reply.includes('{"status": "complete"}');
    const cleanReply = done
      ? reply.replace(/\{"status":\s*"complete"\}/g, "").trim()
      : reply;

    return NextResponse.json({ reply: cleanReply, done });
  } catch (err: unknown) {
    console.error("[onboard/chat]", err);
    const message = err instanceof Error ? err.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
