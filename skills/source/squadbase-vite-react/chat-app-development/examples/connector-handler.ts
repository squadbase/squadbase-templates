import type { Context } from "hono";
import { connection } from "@squadbase/vite-server/connectors/openai";
import { createOpenAI } from "@ai-sdk/openai";
import { streamText } from "ai";

export default async function handler(c: Context) {
  const client = connection("my-openai-connection");
  const openai = createOpenAI({ apiKey: client.apiKey });

  const { messages } = await c.req.json();

  const result = streamText({
    model: openai("gpt-4o"),
    system: "You are a helpful assistant.",
    messages,
  });

  return result.toDataStreamResponse();
}
