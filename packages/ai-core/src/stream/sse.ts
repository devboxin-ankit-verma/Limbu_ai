import type { AiStreamEvent, OrchestratorChatRequest } from "../types";
import { aiOrchestrator } from "../orchestrator";

export type ChatSseEvent =
  | { type: "delta"; content: string }
  | { type: "done"; messageId: string }
  | { type: "error"; message: string };

export function encodeSseEvent(event: ChatSseEvent): string {
  return `data: ${JSON.stringify(event)}\n\n`;
}

export function createOrchestratorSseStream(
  request: OrchestratorChatRequest,
  onComplete: (input: {
    content: string;
    model: string;
    tokensUsed: number;
  }) => Promise<{ messageId: string }>,
): ReadableStream<Uint8Array> {
  const encoder = new TextEncoder();

  return new ReadableStream({
    async start(controller) {
      try {
        let fullText = "";
        let model = request.model ?? "unknown";
        let tokensUsed = 0;

        for await (const event of aiOrchestrator.streamChat(request)) {
          if (event.type === "delta") {
            fullText += event.content;
            controller.enqueue(encoder.encode(encodeSseEvent({ type: "delta", content: event.content })));
            continue;
          }

          if (event.type === "error") {
            controller.enqueue(
              encoder.encode(encodeSseEvent({ type: "error", message: event.message })),
            );
            controller.close();
            return;
          }

          fullText = event.content;
          model = event.usage.model;
          tokensUsed = event.usage.totalTokens;

          const { messageId } = await onComplete({ content: fullText, model, tokensUsed });
          controller.enqueue(encoder.encode(encodeSseEvent({ type: "done", messageId })));
          controller.close();
          return;
        }

        if (fullText) {
          const { messageId } = await onComplete({ content: fullText, model, tokensUsed });
          controller.enqueue(encoder.encode(encodeSseEvent({ type: "done", messageId })));
        } else {
          controller.enqueue(
            encoder.encode(encodeSseEvent({ type: "error", message: "No response generated" })),
          );
        }
        controller.close();
      } catch (err) {
        const message = err instanceof Error ? err.message : "Stream failed";
        controller.enqueue(encoder.encode(encodeSseEvent({ type: "error", message })));
        controller.close();
      }
    },
  });
}

export async function collectOrchestratorStream(
  request: OrchestratorChatRequest,
): Promise<AiStreamEvent[]> {
  const events: AiStreamEvent[] = [];
  for await (const event of aiOrchestrator.streamChat(request)) {
    events.push(event);
  }
  return events;
}
