import type { RuntimeContext } from "../types";

export function getVariable(ctx: RuntimeContext, path: string): unknown {
  const parts = path.split(".");
  let current: unknown = ctx.variables;
  for (const part of parts) {
    if (current == null || typeof current !== "object") return undefined;
    current = (current as Record<string, unknown>)[part];
  }
  return current;
}

export function setVariable(ctx: RuntimeContext, path: string, value: unknown) {
  const parts = path.split(".");
  if (parts.length === 1) {
    ctx.variables[parts[0]] = value;
    return;
  }
  let current: Record<string, unknown> = ctx.variables;
  for (let i = 0; i < parts.length - 1; i++) {
    const key = parts[i];
    if (typeof current[key] !== "object" || current[key] === null) {
      current[key] = {};
    }
    current = current[key] as Record<string, unknown>;
  }
  current[parts[parts.length - 1]] = value;
}

export function interpolate(template: string, ctx: RuntimeContext): string {
  return template.replace(/\{\{([^}]+)\}\}/g, (_, raw: string) => {
    const key = raw.trim();
    const value = getVariable(ctx, key) ?? getVariable(ctx, `trigger.${key}`);
    return value == null ? "" : String(value);
  });
}

export function evaluateExpression(expression: string, ctx: RuntimeContext): boolean {
  const leftRight = expression.match(/^(.+?)\s*(==|!=|>|<|>=|<=|contains)\s*(.+)$/);
  if (!leftRight) return Boolean(getVariable(ctx, expression.trim()));

  const [, leftRaw, op, rightRaw] = leftRight;
  const left = resolveValue(leftRaw.trim(), ctx);
  const right = resolveValue(rightRaw.trim(), ctx);

  switch (op) {
    case "==":
      return left == right;
    case "!=":
      return left != right;
    case ">":
      return Number(left) > Number(right);
    case "<":
      return Number(left) < Number(right);
    case ">=":
      return Number(left) >= Number(right);
    case "<=":
      return Number(left) <= Number(right);
    case "contains":
      return String(left).includes(String(right));
    default:
      return false;
  }
}

function resolveValue(raw: string, ctx: RuntimeContext): unknown {
  if (raw.startsWith('"') && raw.endsWith('"')) return raw.slice(1, -1);
  if (raw.startsWith("'") && raw.endsWith("'")) return raw.slice(1, -1);
  if (!Number.isNaN(Number(raw))) return Number(raw);
  if (raw === "true") return true;
  if (raw === "false") return false;
  return getVariable(ctx, raw);
}
