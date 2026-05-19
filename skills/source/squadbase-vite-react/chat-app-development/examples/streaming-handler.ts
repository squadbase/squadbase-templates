import type { Context } from "hono";
import { createOpenAI } from "@ai-sdk/openai";
import { streamText } from "ai";

const openai = createOpenAI({ apiKey: process.env.OPENAI_API_KEY });

export default async function handler(c: Context) {
  const { messages } = await c.req.json();

  const result = streamText({
    model: openai("gpt-4o"),
    system: "You are a helpful assistant.",
    messages,
  });

  return result.toDataStreamResponse();
}
