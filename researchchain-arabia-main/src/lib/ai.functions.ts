import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

const callGateway = async (system: string, user: string) => {
  const res = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${process.env.LOVABLE_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: "google/gemini-2.5-flash",
      messages: [
        { role: "system", content: system },
        { role: "user", content: user },
      ],
    }),
  });
  if (!res.ok) {
    const txt = await res.text();
    console.error("AI gateway error:", res.status, txt);
    throw new Error(`AI service error (${res.status})`);
  }
  const data = await res.json();
  return data.choices?.[0]?.message?.content ?? "";
};

export const aiSuggestStudy = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d) =>
    z.object({ topic: z.string().min(2).max(200) }).parse(d),
  )
  .handler(async ({ data }) => {
    const content = await callGateway(
      "You are an expert research advisor for Saudi Vision 2030 initiatives. Reply ONLY with valid JSON.",
      `Suggest one compelling research study about: "${data.topic}". Return JSON with keys: title (string, max 80 chars), description (string, 2-3 sentences), category (one of: Healthcare, Education, Technology, Sustainability, Social, Economic), reward_amount (number in SAR between 50-500), target_demographics (object with keys: age_min, age_max, gender, nationality).`,
    );
    try {
      const cleaned = content.replace(/```json|```/g, "").trim();
      return { suggestion: JSON.parse(cleaned), error: null };
    } catch {
      return { suggestion: null, error: "Failed to parse AI response" };
    }
  });

export const aiMatchStudies = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d) =>
    z.object({
      interests: z.string().max(500).optional(),
      studies: z.array(z.object({ id: z.string(), title: z.string(), category: z.string(), description: z.string() })).max(20),
    }).parse(d),
  )
  .handler(async ({ data }) => {
    if (data.studies.length === 0) return { recommendations: [], error: null };
    const content = await callGateway(
      "You are an AI matching engine. Reply ONLY with a JSON array of study IDs ranked best-match first.",
      `Participant interests: "${data.interests ?? "general research"}". Studies: ${JSON.stringify(data.studies)}. Return JSON array of up to 3 study IDs, ranked.`,
    );
    try {
      const cleaned = content.replace(/```json|```/g, "").trim();
      const ids = JSON.parse(cleaned) as string[];
      return { recommendations: ids.slice(0, 3), error: null };
    } catch {
      return { recommendations: data.studies.slice(0, 3).map((s) => s.id), error: null };
    }
  });
