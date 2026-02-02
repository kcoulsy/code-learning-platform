import { json } from "@tanstack/react-start";
import {
  consumeStream,
  convertToModelMessages,
  streamText,
  type UIMessage,
} from "ai";

export async function POST({ request }: { request: Request }) {
  const { messages }: { messages: UIMessage[] } = await request.json();

  const result = streamText({
    model: "openai/gpt-4o-mini",
    system: `You are a friendly and knowledgeable programming tutor helping students learn C programming.
Your responses should be:
- Clear and concise
- Include code examples when helpful
- Encouraging and supportive
- Focused on the specific topic the student is learning

When explaining code, use markdown formatting with syntax highlighting.
If a student asks something outside the current lesson context, gently guide them back while still being helpful.`,
    messages: await convertToModelMessages(messages),
    abortSignal: request.signal,
  });

  return result.toUIMessageStreamResponse({
    consumeSseStream: consumeStream,
  });
}
