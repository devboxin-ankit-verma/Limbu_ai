import { ToolNotFoundError, ToolPermissionError } from "../errors";
import { getTool, type ToolExecutionContext } from "./registry";
import { logToolExecution } from "./logger";

export async function assertToolPermission(
  toolName: string,
  context: ToolExecutionContext,
  enabledTools?: string[],
) {
  const tool = getTool(toolName);
  if (!tool) throw new ToolNotFoundError(toolName);

  if (enabledTools && !enabledTools.includes(toolName) && tool.permission !== "public") {
    throw new ToolPermissionError(toolName);
  }

  if (tool.permission === "admin") {
    throw new ToolPermissionError(toolName);
  }

  return tool;
}

export async function executeTool(input: {
  toolName: string;
  args: Record<string, unknown>;
  context: ToolExecutionContext;
  enabledTools?: string[];
}) {
  const tool = await assertToolPermission(input.toolName, input.context, input.enabledTools);
  const startedAt = Date.now();

  try {
    const result = await tool.handler(input.args, input.context);
    await logToolExecution({
      ...input.context,
      toolName: input.toolName,
      args: input.args,
      result,
      durationMs: Date.now() - startedAt,
      success: true,
    });
    return result;
  } catch (err) {
    await logToolExecution({
      ...input.context,
      toolName: input.toolName,
      args: input.args,
      error: err instanceof Error ? err.message : "Tool failed",
      durationMs: Date.now() - startedAt,
      success: false,
    });
    throw err;
  }
}
