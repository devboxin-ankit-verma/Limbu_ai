import type { ToolExecutionContext } from "./registry";
import { getTool } from "./registry";

export function canUseTool(
  toolName: string,
  context: ToolExecutionContext,
  enabledTools?: string[],
): boolean {
  const tool = getTool(toolName);
  if (!tool) return false;

  if (tool.permission === "public") return true;
  if (tool.permission === "admin") return false;
  if (enabledTools?.includes(toolName)) return true;
  return false;
}

export function filterPermittedTools(toolNames: string[], enabledTools?: string[]) {
  return toolNames.filter((name) => canUseTool(name, { workspaceId: "", organizationId: "", userId: "" }, enabledTools));
}
