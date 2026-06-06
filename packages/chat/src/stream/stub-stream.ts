export const STUB_ASSISTANT_RESPONSE = `Thanks for your message. **AI responses are not connected yet** — this is a streaming placeholder from Limbu Chat.

Here's what the interface supports today:

- Markdown rendering
- Code blocks
- Copy, edit, and regenerate actions
- Conversation history in the sidebar

\`\`\`typescript
export async function streamAssistantResponse(input: string) {
  // AI provider integration goes here
  return "Coming soon";
}
\`\`\`

When you're ready, wire your model provider into the stream endpoint.`;

export type StreamEvent =
  | { type: "delta"; content: string }
  | { type: "done"; messageId: string }
  | { type: "error"; message: string };

export function encodeSseEvent(event: StreamEvent): string {
  return `data: ${JSON.stringify(event)}\n\n`;
}

export async function* iterateStubStream(text: string, chunkSize = 8): AsyncGenerator<string> {
  for (let i = 0; i < text.length; i += chunkSize) {
    yield text.slice(i, i + chunkSize);
    await new Promise((resolve) => setTimeout(resolve, 16));
  }
}

export function createStubSseStream(
  onComplete: (fullText: string) => Promise<{ messageId: string }>,
): ReadableStream<Uint8Array> {
  const encoder = new TextEncoder();
  let fullText = "";

  return new ReadableStream({
    async start(controller) {
      try {
        for await (const chunk of iterateStubStream(STUB_ASSISTANT_RESPONSE)) {
          fullText += chunk;
          controller.enqueue(encoder.encode(encodeSseEvent({ type: "delta", content: chunk })));
        }

        const { messageId } = await onComplete(fullText);
        controller.enqueue(
          encoder.encode(encodeSseEvent({ type: "done", messageId })),
        );
        controller.close();
      } catch (err) {
        const message = err instanceof Error ? err.message : "Stream failed";
        controller.enqueue(encoder.encode(encodeSseEvent({ type: "error", message })));
        controller.close();
      }
    },
  });
}
