import type { Context } from "hono";
import { createOpenAI } from "@ai-sdk/openai";
import { generateText } from "ai";

const openai = createOpenAI({ apiKey: process.env.OPENAI_API_KEY });

export default async function handler(c: Context) {
  const { messages } = await c.req.json();

  const { text } = await generateText({
    model: openai("gpt-4o"),
    system: "You are a helpful assistant.",
    messages,
  });

  return new Response(JSON.stringify({ data: { reply: text } }), {
    headers: { "Content-Type": "application/json" },
  });
}
