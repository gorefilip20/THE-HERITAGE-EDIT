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

const AI_TIMEOUT_MS = 45_000;

function getAnthropicKey(): string | null {
  const raw = process.env.ANTHROPIC_API_KEY?.trim();
  if (!raw || raw.length < 10) return null;
  return raw;
}

function getOpenAIKey(): string | null {
  const raw = process.env.OPENAI_API_KEY?.trim();
  if (!raw || raw.length < 10) return null;
  return raw;
}

async function callAnthropic(
  productName: string,
  brandName: string,
  categoryName: string,
): Promise<string> {
  const apiKey = getAnthropicKey();
  if (!apiKey) throw new Error("ANTHROPIC_API_KEY is missing or invalid");

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), AI_TIMEOUT_MS);

  let response: Response;
  try {
    response = await fetch("https://api.anthropic.com/v1/messages", {
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
      signal: controller.signal,
    });
  } catch (err) {
    clearTimeout(timer);
    if (err instanceof DOMException && err.name === "AbortError") {
      throw new Error(`Anthropic API timed out after ${AI_TIMEOUT_MS / 1000}s`);
    }
    throw new Error(
      `Anthropic API network error: ${err instanceof Error ? err.message : String(err)}`,
    );
  } finally {
    clearTimeout(timer);
  }

  if (!response.ok) {
    const errBody = await response.text().catch(() => "Unknown error");
    throw new Error(`Anthropic API error ${response.status}: ${errBody}`);
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
  const apiKey = getOpenAIKey();
  if (!apiKey) throw new Error("OPENAI_API_KEY is missing or invalid");

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), AI_TIMEOUT_MS);

  let response: Response;
  try {
    response = await fetch("https://api.openai.com/v1/chat/completions", {
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
      signal: controller.signal,
    });
  } catch (err) {
    clearTimeout(timer);
    if (err instanceof DOMException && err.name === "AbortError") {
      throw new Error(`OpenAI API timed out after ${AI_TIMEOUT_MS / 1000}s`);
    }
    throw new Error(
      `OpenAI API network error: ${err instanceof Error ? err.message : String(err)}`,
    );
  } finally {
    clearTimeout(timer);
  }

  if (!response.ok) {
    const errBody = await response.text().catch(() => "Unknown error");
    throw new Error(`OpenAI API error ${response.status}: ${errBody}`);
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

export function generatePlaceholderNarrative(
  productName: string,
  brandName: string,
  categoryName: string,
): HeritageAIResponse {
  return {
    history_and_heritage:
      `${brandName} has long been regarded as one of the most distinguished names in luxury fashion, ` +
      `a house whose design philosophy marries impeccable craftsmanship with an unwavering commitment to elegance. ` +
      `From ateliers steeped in decades of tradition, each piece emerges as a testament to the artisan's hand — ` +
      `every stitch, seam, and silhouette considered with the precision of a master sculptor.\n\n` +
      `The ${productName} exemplifies this heritage in its purest form. Rooted in the ${categoryName.toLowerCase()} ` +
      `tradition, it draws upon archival references while speaking fluently in the language of contemporary fashion. ` +
      `The construction reflects techniques handed down through generations of craftspeople, ` +
      `ensuring that the garment not only drapes beautifully but endures season after season.\n\n` +
      `To own a piece from ${brandName} is to possess a fragment of fashion history — ` +
      `a wearable archive that transcends fleeting trends and speaks instead to the enduring power of considered design.`,
    when_to_wear:
      `The ${productName} is designed for those who understand that true style is a matter of intention, not occasion. ` +
      `Worn with quiet confidence, it transitions effortlessly from a morning of curated gallery visits ` +
      `to an evening aperitivo at a candlelit terrace. Pair it with understated accessories and let the ` +
      `craftsmanship speak for itself. When the setting calls for discretion, this piece answers with authority.`,
    right_occasion: [
      `Private viewing at a contemporary art gallery`,
      `Afternoon luncheon at a heritage hotel`,
      `Evening reception at an embassy residence`,
      `Weekend retreat to a coastal villa`,
    ],
    style_recommendations: [
      `Ivory silk charmeuse camisole`,
      `Brushed gold chain-link cuff bracelet`,
      `Black calfskin structured tote`,
      `Nude patent leather pointed-toe pumps`,
    ],
  };
}

export async function generateHeritageNarrative(
  productName: string,
  brandName: string,
  categoryName: string,
): Promise<{ data: HeritageAIResponse; model: string }> {
  const anthropicKey = getAnthropicKey();
  const openaiKey = getOpenAIKey();

  if (!anthropicKey && !openaiKey) {
    console.warn(
      "[Heritage AI] No valid API key found — generating placeholder narrative.",
    );
    return {
      data: generatePlaceholderNarrative(productName, brandName, categoryName),
      model: "placeholder",
    };
  }

  let rawText: string;
  let model: string;

  try {
    if (anthropicKey) {
      rawText = await callAnthropic(productName, brandName, categoryName);
      model = "claude-sonnet-4-20250514";
    } else {
      rawText = await callOpenAI(productName, brandName, categoryName);
      model = "gpt-4o";
    }
  } catch (apiErr) {
    console.error(
      `[Heritage AI] API call failed, using placeholder:`,
      apiErr instanceof Error ? apiErr.message : apiErr,
    );
    return {
      data: generatePlaceholderNarrative(productName, brandName, categoryName),
      model: "placeholder",
    };
  }

  const jsonString = extractJSON(rawText);

  let parsed: unknown;
  try {
    parsed = JSON.parse(jsonString);
  } catch {
    console.error(
      `[Heritage AI] Failed to parse response as JSON, using placeholder. Raw:\n${rawText.substring(0, 300)}`,
    );
    return {
      data: generatePlaceholderNarrative(productName, brandName, categoryName),
      model: "placeholder",
    };
  }

  const validated = heritageSchema.safeParse(parsed);
  if (!validated.success) {
    console.error(
      `[Heritage AI] Response failed validation, using placeholder:`,
      validated.error.issues.map((i) => `${i.path.join(".")}: ${i.message}`).join("; "),
    );
    return {
      data: generatePlaceholderNarrative(productName, brandName, categoryName),
      model: "placeholder",
    };
  }

  return { data: validated.data, model };
}
