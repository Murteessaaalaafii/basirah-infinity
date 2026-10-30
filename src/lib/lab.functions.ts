import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

const LOVABLE_AI = "https://ai.gateway.lovable.dev/v1/chat/completions";

export const generateLabImage = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input) =>
    z
      .object({
        kind: z.enum(["logo", "brand", "graphic", "icon", "poster"]),
        prompt: z.string().min(4).max(1200),
        sourceImage: z.string().optional(), // data URL for edits
      })
      .parse(input),
  )
  .handler(async ({ data, context }) => {
    const apiKey = process.env.LOVABLE_API_KEY;
    if (!apiKey) throw new Error("AI gateway not configured");

    const stylePrefix: Record<string, string> = {
      logo: "Premium minimalist vector logo, futuristic AI agency aesthetic, on solid white background, ultra clean. ",
      brand: "Cohesive brand kit board: logo, palette, typography sample, mockups, futuristic Awwwards-level. ",
      graphic: "Hero marketing graphic, liquid glass, neon cyan/violet, cinematic depth. ",
      icon: "App icon, geometric, gradient, sharp silhouette, on solid background. ",
      poster: "Editorial poster design, premium typography, bold composition. ",
    };

    const messages = data.sourceImage
      ? [
          {
            role: "user",
            content: [
              { type: "text", text: stylePrefix[data.kind] + data.prompt },
              { type: "image_url", image_url: { url: data.sourceImage } },
            ],
          },
        ]
      : [{ role: "user", content: stylePrefix[data.kind] + data.prompt }];

    const res = await fetch(LOVABLE_AI, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash-image",
        messages,
        modalities: ["image", "text"],
      }),
    });

    if (!res.ok) {
      const t = await res.text();
      throw new Error(`AI gateway: ${res.status} ${t.slice(0, 200)}`);
    }
    const json = await res.json();
    const imageUrl: string | undefined =
      json?.choices?.[0]?.message?.images?.[0]?.image_url?.url;
    if (!imageUrl) throw new Error("No image returned");

    // Save to lab_assets
    const { error } = await context.supabase.from("lab_assets").insert({
      kind: data.kind,
      prompt: data.prompt,
      image_data: imageUrl,
      created_by: context.userId,
    });
    if (error) throw new Error(error.message);

    await context.supabase.from("audit_log").insert({
      actor_id: context.userId,
      action: "lab.generate",
      target_type: data.kind,
      meta: { promptPreview: data.prompt.slice(0, 120) },
    });

    return { imageUrl };
  });
