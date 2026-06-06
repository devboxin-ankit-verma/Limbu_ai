import type { z } from "zod";

export type ToolHandler = (
  args: Record<string, unknown>,
  context: ToolExecutionContext,
) => Promise<unknown>;

export type ToolDefinition = {
  name: string;
  description: string;
  parameters: Record<string, unknown>;
  permission: "public" | "workspace" | "admin";
  handler: ToolHandler;
};

export type ToolExecutionContext = {
  workspaceId: string;
  organizationId: string;
  userId: string;
  threadId?: string;
};

const registry = new Map<string, ToolDefinition>();

export function registerTool(tool: ToolDefinition) {
  registry.set(tool.name, tool);
}

export function getTool(name: string): ToolDefinition | undefined {
  return registry.get(name);
}

export function listTools(names?: string[]): ToolDefinition[] {
  const all = [...registry.values()];
  if (!names?.length) return all;
  return all.filter((t) => names.includes(t.name));
}

export function listProviderTools(names?: string[]) {
  return listTools(names).map((tool) => ({
    name: tool.name,
    description: tool.description,
    parameters: tool.parameters,
  }));
}

export function registerBuiltinTools() {
  if (registry.size > 0) return;

  registerTool({
    name: "get_current_time",
    description: "Returns the current UTC timestamp in ISO format.",
    permission: "public",
    parameters: {
      type: "object",
      properties: {},
    },
    handler: async () => ({ utc: new Date().toISOString() }),
  });

  registerTool({
    name: "echo",
    description: "Echoes the provided message. Useful for diagnostics.",
    permission: "workspace",
    parameters: {
      type: "object",
      properties: {
        message: { type: "string" },
      },
      required: ["message"],
    },
    handler: async (args) => ({ echo: String(args.message ?? "") }),
  });
}

export function validateToolArgs(tool: ToolDefinition, args: Record<string, unknown>, schema?: z.ZodTypeAny) {
  if (schema) schema.parse(args);
  return args;
}
