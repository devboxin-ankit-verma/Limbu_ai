import { registerTool } from "@limbu/ai-core";
import { retrieveKnowledgeContext } from "@limbu/rag";
import { KnowledgeBaseScope } from "@limbu/db";

let registered = false;

export function registerAgentTools() {
  if (registered) return;
  registered = true;

  registerTool({
    name: "rag_search",
    description: "Search workspace, organization, and personal knowledge bases for relevant context.",
    permission: "workspace",
    parameters: {
      type: "object",
      properties: {
        query: { type: "string", description: "Search query" },
        topK: { type: "number", description: "Number of results (max 10)" },
      },
      required: ["query"],
    },
    handler: async (args, ctx) => {
      const query = String(args.query ?? "");
      const topK = Math.min(10, Number(args.topK ?? 5));
      const result = await retrieveKnowledgeContext({
        query,
        organizationId: ctx.organizationId,
        workspaceId: ctx.workspaceId,
        userId: ctx.userId,
        scopes: [
          KnowledgeBaseScope.workspace,
          KnowledgeBaseScope.organization,
          KnowledgeBaseScope.personal,
        ],
        topK,
        hybrid: true,
      });
      return {
        context: result.contextBlock,
        citations: result.citations.map((c) => ({
          key: c.citationKey,
          filename: c.filename,
          excerpt: c.excerpt,
        })),
      };
    },
  });

  registerTool({
    name: "summarize_metrics",
    description: "Summarize available workspace analytics metrics for the current period.",
    permission: "workspace",
    parameters: {
      type: "object",
      properties: {
        period: { type: "string", enum: ["7d", "30d", "90d"] },
      },
    },
    handler: async (args) => ({
      period: args.period ?? "30d",
      metrics: {
        note: "Connect analytics integrations for live metrics. Returning placeholder structure.",
        engagement: null,
        reach: null,
        conversions: null,
      },
    }),
  });
}
