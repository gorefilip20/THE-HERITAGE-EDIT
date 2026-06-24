import { z } from "zod";
import type { HeritageAIResponse } from "@/types";

const heritageSchema = z.object({
  history_and_heritage: z.string().min(50),
  when_to_wear: z.string().min(30),
  right_occasion: z.array(z.string()).min(2).max(6),
  style_recommendations: z.array(z.string()).min(3).max(8),
});

const SYSTEM_PROMPT = `You are The Heritage Edit's luxury fashion editorial AI. You write with the refined authority of a Vogue editorial director crossed with a museum curator. Your prose is evocative, precise, and steeped in fashion history — every sentence should feel like it belongs in a glossy editorial spread.

IMPORTANT CONTEXT: The Heritage Edit specialises in ultra-premium traditional African attire (Senator Wear, Native Wear, Agbada, Aso Oke ensembles, Aso Ebi pieces) alongside world-class European luxury and premium accessories (Footwear, Bags, Jewelry). When the product is from an African/Nigerian fashion category, lean heavily into West African sartorial heritage — the craft traditions, the cultural weight of the garments, the prestige they carry.

For every product, generate a structured JSON response with exactly these keys:

1. "history_and_heritage" — THE HERITAGE & ORIGIN: A lavish 3-4 paragraph narrative (400-600 words) as a compelling editorial essay. Structure it as:
   Paragraph 1: The brand or design house's origin — founding story, city, the creator's vision. For African attire brands, describe the atelier's connection to West African tailoring lineage, Savile Row-influenced Senator cuts, or the Aso Oke weaving tradition of Iseyin, Oyo State.
   Paragraph 2: The evolution of this specific garment type. For Senator Wear: trace the garment from its political origins among Nigerian statesmen through to its current status as the definitive power dressing silhouette across Africa. For Native Wear: the Agbada's royal court heritage, the Isiagu's Igbo prestige symbolism, or the Grand Boubou's Sahelian majesty. For European luxury: reference landmark runway moments and archival silhouettes.
   Paragraph 3: The material story — provenance of fabrics (Aso Oke hand-loomed in Oyo, Italian cashmere blended with African motifs, premium Guinea brocade from Austria/Switzerland, hand-embroidered Stoned Senator fabric), the specific artisanal processes (hand-embroidery, stone-setting, precision tailoring, Goodyear welting for shoes). Name the mills, regions, traditions.
   Paragraph 4: Why this piece matters now — connect it to the global rise of Afro-luxury, the red-carpet crossover of Nigerian formal wear, or the investment-piece philosophy. Position it as a wardrobe anchor, not a seasonal buy.

2. "when_to_wear" — THE OCCASION SUITABILITY: A richly detailed styling narrative (200-350 words):
   - Open with the attitude and presence this piece commands — the authority of a well-cut Senator, the regal sweep of an Agbada, or the quiet confidence of a luxury accessory.
   - For African attire: contextualise for traditional weddings and Aso Ebi coordination, chieftaincy ceremonies, high-profile church services and thanksgiving celebrations, corporate galas, political summits, and Owambe celebrations. Describe pairing with a fila (cap), coral beads, or leather slippers.
   - For European/global pieces: morning meetings, gallery openings, evening events. Day-to-night transitions.
   - Close with a care note: how to store (especially brocade and embroidered pieces), what to avoid, how to preserve embellishments.

3. "right_occasion" — An array of 4-5 hyper-specific occasion strings. Mix African and global prestige events. Examples for African attire: "Chieftaincy installation ceremony at the Oba's Palace, Benin City", "Saturday Owambe reception at the Landmark Event Centre, Lagos", "Aso Ebi ensemble for a traditional wedding in Abeokuta". For global pieces: "Black-tie gala at the Met's Temple of Dendur", "Private viewing at Tate Modern". Make each scene vivid and aspirational.

4. "style_recommendations" — THE LUXURY MATCHMAKER: An array of 5-6 complementary items from THE HERITAGE EDIT's own categories. This is critical — you are cross-selling across our store's inventory. Each recommendation MUST reference one of these product categories: Senator Wear, Native Wear, Footwear, Bags, Jewelry, Accessories, Coats & Jackets, Suits & Tailoring.
   Format: "[Category]: [Specific item with material, color, and construction detail]"
   Examples:
   - "Footwear: Black hand-burnished Italian calfskin loafers with a tasselled vamp"
   - "Jewelry: 18k gold-plated coral bead choker with traditional Benin-inspired clasp"
   - "Bags: Midnight navy structured briefcase in full-grain leather with suede lining"
   - "Senator Wear: Ivory premium cashmere-blend Senator suit with mother-of-pearl buttons"
   - "Native Wear: Royal blue hand-woven Aso Oke Agbada with gold thread detailing"
   The goal is to help the customer COMPLETE THE LOOK by exploring other categories in our store.

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

const AFRICAN_CATEGORIES = new Set([
  "senator wear", "native wear", "agbada", "aso oke", "aso ebi",
  "kaftan", "dashiki", "babariga", "fila", "isiagu",
]);

function isAfricanCategory(categoryName: string): boolean {
  const lower = categoryName.toLowerCase();
  return AFRICAN_CATEGORIES.has(lower) || lower.includes("senator") || lower.includes("native");
}

export function generatePlaceholderNarrative(
  productName: string,
  brandName: string,
  categoryName: string,
): HeritageAIResponse {
  const catLower = categoryName.toLowerCase();
  const african = isAfricanCategory(categoryName);

  if (african) {
    return {
      history_and_heritage:
        `${brandName} stands at the intersection of West African sartorial tradition and contemporary luxury. ` +
        `The atelier's founding vision was born from a reverence for the tailoring lineages that have shaped ` +
        `formal dressing across Nigeria and the broader West African diaspora — from the hand-loomed Aso Oke ` +
        `workshops of Iseyin to the precision-cut Senator suiting that has become the uniform of statesmen, ` +
        `business leaders, and cultural icons.\n\n` +
        `The ${productName} draws upon generations of ceremonial dressing, a garment type that carries the weight ` +
        `of prestige, accomplishment, and cultural pride. Whether worn at a chieftaincy installation, a Saturday ` +
        `Owambe celebration, or a high-profile corporate gala, ${catLower} of this calibre communicates authority ` +
        `without uttering a word. The silhouette has evolved from its political origins among Nigerian senators ` +
        `into a globally recognised symbol of Afro-luxury power dressing.\n\n` +
        `The material story is one of meticulous sourcing and patient craft. Premium Guinea brocade from the finest ` +
        `mills, cashmere-blend Senator fabrics with hand-applied stone embellishments, or hand-woven Aso Oke thread ` +
        `dyed in indigo and gold — every yard speaks to an artisanal tradition where the fabric itself carries meaning. ` +
        `Hand-embroidery, precision stone-setting, and bespoke tailoring ensure no two pieces are identical.\n\n` +
        `In today's fashion landscape, the ${productName} by ${brandName} represents the ascendancy of Afro-luxury ` +
        `on the world stage. From Lagos to London, Abuja to New York, this is the garment that anchors a wardrobe ` +
        `built on cultural heritage and enduring style.`,
      when_to_wear:
        `The ${productName} commands the room before you speak. It creates a silhouette of unmistakable authority — ` +
        `the structured shoulders, the clean fall of premium fabric, the considered proportion that marks the ` +
        `difference between a garment and a statement.\n\n` +
        `Wear it to a traditional wedding ceremony as the anchor of your Aso Ebi coordination — pair with a ` +
        `matching fila cap and hand-crafted leather slippers for full ceremonial impact. For corporate settings ` +
        `and political gatherings, let the fabric speak and keep accessories minimal: a gold-tone wristwatch, ` +
        `a coral bead bracelet, polished Oxford shoes. At Owambe celebrations and thanksgiving services, elevate ` +
        `with statement coral necklaces and a structured leather document bag.\n\n` +
        `Store on a padded hanger in a breathable garment bag. For embroidered and stoned pieces, avoid folding ` +
        `to preserve embellishments. Dry clean only. With proper care, this piece will serve you across decades ` +
        `of milestones.`,
      right_occasion: [
        `Chieftaincy installation ceremony at the Oba's Palace, Benin City`,
        `Saturday Owambe reception at the Landmark Event Centre, Lagos`,
        `Aso Ebi ensemble for a traditional wedding in Abeokuta`,
        `Corporate gala dinner at the Eko Hotel & Suites, Victoria Island`,
        `Sunday thanksgiving service at a cathedral in Abuja`,
      ],
      style_recommendations: [
        `Footwear: Black hand-burnished Italian calfskin loafers with a tasselled vamp`,
        `Jewelry: 18k gold-plated coral bead choker with traditional Benin-inspired clasp`,
        `Bags: Midnight navy structured briefcase in full-grain leather with suede lining`,
        `Accessories: Hand-embroidered fila cap in matching fabric with gold threadwork`,
        `Footwear: Premium brown suede monk-strap shoes with a leather sole`,
      ],
    };
  }

  return {
    history_and_heritage:
      `Founded in the storied ateliers of Europe's fashion capitals, ${brandName} has cultivated a reputation ` +
      `that transcends seasonal trends. The house's founding vision — to elevate ${catLower} into an art form — ` +
      `remains the animating force behind every collection. From its earliest presentations, the maison established ` +
      `a dialogue between heritage craftsmanship and forward-looking design, earning the devotion of connoisseurs ` +
      `who understand that true luxury is measured in permanence, not novelty.\n\n` +
      `The ${productName} sits within a lineage of iconic ${catLower} pieces that have defined ${brandName}'s ` +
      `archive across decades. The silhouette draws upon landmark collections — runway moments that shifted the ` +
      `conversation around what ${catLower} could be. It carries the architectural precision of the house's most ` +
      `celebrated designs while incorporating the fluid, modern proportions that define the current creative direction.\n\n` +
      `The material story is one of provenance and patience. Sourced from mills with centuries of expertise, ` +
      `the fabrics undergo a meticulous process of selection, finishing, and quality control before they ever reach ` +
      `the cutting table. Hand-finished details — the invisible stitching, the precisely matched patterns, ` +
      `the reinforced construction — speak to an artisanal tradition that refuses to be hurried.\n\n` +
      `In the context of contemporary fashion, the ${productName} by ${brandName} represents something increasingly ` +
      `rare: a genuine investment piece. As the industry recalibrates around quality and longevity, this is the kind ` +
      `of garment that anchors a wardrobe for years, growing more personal with each wearing.`,
    when_to_wear:
      `The ${productName} commands a quiet, assured confidence — the kind that comes from knowing your outfit ` +
      `requires no explanation. It creates a silhouette that is at once structured and fluid, lending the wearer ` +
      `an effortless authority whether entering a boardroom or a ballroom.\n\n` +
      `In the morning, pair it with minimal gold jewelry and a structured shoulder bag for meetings that demand ` +
      `presence without pretension. By afternoon, it transitions seamlessly to gallery openings and private viewings — ` +
      `the fabric's weight and drape suited to unhurried movement through curated spaces. Come evening, let it serve ` +
      `as the anchor of a more dramatic composition: a statement earring, a dark lip, heels that add ` +
      `just enough ceremony.\n\n` +
      `Store flat or on a padded hanger to preserve the silhouette. Avoid direct sunlight for extended periods, ` +
      `and allow the fabric to breathe between wearings. With considered care, this piece will serve you beautifully ` +
      `for years to come.`,
    right_occasion: [
      `Private viewing of the Turner Prize shortlist at Tate Modern`,
      `Candlelit dinner at a Venetian palazzo overlooking the Grand Canal`,
      `Opening night at the Royal Opera House in Covent Garden`,
      `Sunset aperitivo on the terrace of Le Sirenuse, Positano`,
      `Charity gala at the Metropolitan Museum's Temple of Dendur`,
    ],
    style_recommendations: [
      `Footwear: Black hand-burnished calfskin Chelsea boots with a stacked leather heel`,
      `Jewelry: Burnished 18k gold vermeil chain-link cuff bracelet`,
      `Bags: Black hand-burnished calfskin structured tote with suede lining`,
      `Footwear: Nude patent leather pointed-toe pumps with a 70mm sculpted heel`,
      `Accessories: Midnight navy cashmere-blend scarf with hand-rolled edges`,
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
