import type { ConditionHandler, WorkflowNode } from "../types";
import { evaluateExpression } from "../engine/evaluator";
import { WORKFLOW_CONFIG } from "../config";

const conditionHandlers = new Map<string, ConditionHandler>();

export function registerCondition(kind: string, handler: ConditionHandler) {
  conditionHandlers.set(kind, handler);
}

export function registerBuiltinConditions() {
  if (conditionHandlers.size > 0) return;

  registerCondition("if", async (node, ctx) => {
    const expression = String(node.config.expression ?? "true");
    return evaluateExpression(expression, ctx);
  });

  registerCondition("filter", async (node, ctx) => {
    const field = String(node.config.field ?? "");
    const operator = String(node.config.operator ?? "exists");
    const expected = node.config.value;
    const actual = field.startsWith("trigger.")
      ? ctx.triggerEvent[field.replace("trigger.", "")]
      : ctx.variables[field];

    switch (operator) {
      case "exists":
        return actual !== undefined && actual !== null && actual !== "";
      case "equals":
        return actual == expected;
      case "not_equals":
        return actual != expected;
      default:
        return false;
    }
  });

  registerCondition("loop", async (node, ctx) => {
    const itemsPath = String(node.config.itemsPath ?? "items");
    const indexKey = String(node.config.indexVariable ?? "_loopIndex");
    const itemKey = String(node.config.itemVariable ?? "_loopItem");
    const items = ctx.variables[itemsPath];
    if (!Array.isArray(items)) return false;

    const index = Number(ctx.variables[indexKey] ?? -1) + 1;
    if (index >= items.length || index >= WORKFLOW_CONFIG.maxLoopIterations) {
      ctx.variables[indexKey] = -1;
      delete ctx.variables[itemKey];
      return false;
    }

    ctx.variables[indexKey] = index;
    ctx.variables[itemKey] = items[index];
    return true;
  });
}

export async function evaluateCondition(node: WorkflowNode, ctx: Parameters<ConditionHandler>[1]) {
  registerBuiltinConditions();
  const handler = conditionHandlers.get(node.kind);
  if (!handler) throw new Error(`Unknown condition kind: ${node.kind}`);
  return handler(node, ctx);
}

export function getConditionBranch(result: boolean) {
  return result ? "true" : "false";
}
