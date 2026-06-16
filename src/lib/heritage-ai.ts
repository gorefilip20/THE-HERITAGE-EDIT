import { z } from "zod";
import type { HeritageAIResponse } from "@/types";

const heritageSchema = z.object({
  history_and_heritage: z.string().min(50),
  when_to_wear: z.string().min(30),
  right_occasion: z.array(z.string()).min(2).max(6),
  style_recommendations: z.array(z.string()).min(3).max(8),
});

const SYSTEM_PROMPT = `You are The Heritage Edit's luxury fashion editorial AI. You write with the refined authority of a Vogue editorial director crossed with a museum curator. Your prose is evocative, precise, and steeped in fashion history.

For every product, generate a structured JSON response with exactly these keys:

1. "history_and_heritage" — A rich 3-4 paragraph narrative (300-500 words) covering:
   - The design house's founding story and creative philosophy
   - The specific silhouette or garment type's historical evolution
   - The fabric/material provenance and craftsmanship techniques
   - Why this piece matters in the context of contemporary fashion

2. "when_to_wear" — A sophisticated styling guide (150-250 words) covering:
   - Time of day and seasonal considerations
   - The attitude and confidence the piece demands
   - How it transitions between contexts (day-to-night, casual-to-formal)
   - Fabric care and presentation notes

3. "right_occasion" — An array of 3-5 specific occasion strings, each vivid and aspirational. NOT generic ("dinner") but specific ("Candlelit dinner at a Venetian palazzo", "Opening night at the Royal Opera House").

4. "style_recommendations" — An array of 4-6 complementary items to complete the look. Each should name a specific type of piece with material and color guidance (e.g., "Ivory silk charmeuse camisole", "Burnished gold chain-link cuff bracelet").

CRITICAL: Return ONLY valid JSON. No markdown, no code fences, no commentary outside the JSON object. Every value must be a string or array of strings.`;

async function callAnthropic(
  productName: string,
  brandName: string,
  categoryName: string,
): Promise<string> {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) throw new Error("ANTHROPIC_API_KEY is not configured");

  const response = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-api-key": apiKey,
      "anthropic-version": "2023-06-01",
    },
    body: JSON.stringify({
      model: "claude-sonnet-4-20250514",
      max_tokens: 2048,
      system: SYSTEM_PROMPT,
      messages: [
        {
          role: "user",
          content: `Generate the Heritage Narrative for this luxury product:\n\nProduct: ${productName}\nBrand: ${brandName}\nCategory: ${categoryName}`,
        },
      ],
    }),
  });

  if (!response.ok) {
    const err = await response.text();
    throw new Error(`Anthropic API error ${response.status}: ${err}`);
  }

  const data = await response.json();
  const text = data.content?.[0]?.text;
  if (!text) throw new Error("Empty response from Anthropic API");

  return text;
}

async function callOpenAI(
  productName: string,
  brandName: string,
  categoryName: string,
): Promise<string> {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) throw new Error("OPENAI_API_KEY is not configured");

  const response = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: "gpt-4o",
      temperature: 0.7,
      max_tokens: 2048,
      response_format: { type: "json_object" },
      messages: [
        { role: "system", content: SYSTEM_PROMPT },
        {
          role: "user",
          content: `Generate the Heritage Narrative for this luxury product:\n\nProduct: ${productName}\nBrand: ${brandName}\nCategory: ${categoryName}`,
        },
      ],
    }),
  });

  if (!response.ok) {
    const err = await response.text();
    throw new Error(`OpenAI API error ${response.status}: ${err}`);
  }

  const data = await response.json();
  const text = data.choices?.[0]?.message?.content;
  if (!text) throw new Error("Empty response from OpenAI API");

  return text;
}

function extractJSON(raw: string): string {
  const fenceMatch = raw.match(/```(?:json)?\s*([\s\S]*?)```/);
  if (fenceMatch) return fenceMatch[1].trim();

  const braceStart = raw.indexOf("{");
  const braceEnd = raw.lastIndexOf("}");
  if (braceStart !== -1 && braceEnd !== -1) {
    return raw.substring(braceStart, braceEnd + 1);
  }

  return raw.trim();
}

export async function generateHeritageNarrative(
  productName: string,
  brandName: string,
  categoryName: string,
): Promise<{ data: HeritageAIResponse; model: string }> {
  let rawText: string;
  let model: string;

  if (process.env.ANTHROPIC_API_KEY) {
    rawText = await callAnthropic(productName, brandName, categoryName);
    model = "claude-sonnet-4-20250514";
  } else if (process.env.OPENAI_API_KEY) {
    rawText = await callOpenAI(productName, brandName, categoryName);
    model = "gpt-4o";
  } else {
    throw new Error(
      "No AI API key configured. Set ANTHROPIC_API_KEY or OPENAI_API_KEY.",
    );
  }

  const jsonString = extractJSON(rawText);

  let parsed: unknown;
  try {
    parsed = JSON.parse(jsonString);
  } catch {
    throw new Error(
      `Failed to parse AI response as JSON. Raw output:\n${rawText.substring(0, 500)}`,
    );
  }

  const validated = heritageSchema.safeParse(parsed);
  if (!validated.success) {
    throw new Error(
      `AI response failed validation: ${validated.error.issues.map((i) => `${i.path.join(".")}: ${i.message}`).join("; ")}`,
    );
  }

  return { data: validated.data, model };
}
