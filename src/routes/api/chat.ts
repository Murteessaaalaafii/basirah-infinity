import { createLovableAiGatewayProvider } from "@/lib/ai-gateway";
import "@tanstack/react-start";
import { createFileRoute } from "@tanstack/react-router";
import { convertToModelMessages, streamText, type UIMessage } from "ai";

type Body = { messages?: unknown };

const SYSTEM = `You are Nova, the AI strategist for Basirah Infinity — a futuristic AI digital agency founded and owned by Murtesa Alafi.
You help founders, creators, and businesses with branding, websites, AI automation, social media growth, and content strategy.
Tone: visionary, confident, concise, modern. Use short paragraphs and bullets. End with one sharp next step.`;

export const Route = createFileRoute("/api/chat")({
  server: {
    handlers: {
      POST: async ({ request }: { request: Request }) => {
        const { messages } = (await request.json()) as Body;
        if (!Array.isArray(messages)) return new Response("Messages required", { status: 400 });
        const key = process.env.LOVABLE_API_KEY;
        if (!key) return new Response("Missing LOVABLE_API_KEY", { status: 500 });

        const gateway = createLovableAiGatewayProvider(key);
        const result = streamText({
          model: gateway("google/gemini-3-flash-preview"),
          system: SYSTEM,
          messages: await convertToModelMessages(messages as UIMessage[]),
        });
        return result.toUIMessageStreamResponse({ originalMessages: messages as UIMessage[] });
      },
    },
  },
});
