import type { AgentRegistryEntry, BuiltinAgentKey, TaskRoute } from "../types";

const ROUTING_RULES: Array<{
  agent: BuiltinAgentKey;
  patterns: RegExp[];
  weight: number;
}> = [
  {
    agent: "coding",
    patterns: [
      /\b(code|bug|function|typescript|javascript|python|refactor|api|sql|debug)\b/i,
      /```/,
    ],
    weight: 2,
  },
  {
    agent: "content",
    patterns: [
      /\b(post|copy|blog|caption|headline|marketing|social|brand|campaign|email)\b/i,
    ],
    weight: 2,
  },
  {
    agent: "analytics",
    patterns: [
      /\b(analytics|metrics|kpi|conversion|report|dashboard|trend|roi|performance|data)\b/i,
    ],
    weight: 2,
  },
  {
    agent: "research",
    patterns: [
      /\b(research|find|summarize|explain|investigate|compare|source|study)\b/i,
    ],
    weight: 1.5,
  },
];

export function classifyTask(task: string, forcedAgent?: BuiltinAgentKey): TaskRoute {
  if (forcedAgent && forcedAgent !== "supervisor") {
    return {
      primary: forcedAgent,
      supporting: suggestSupportingAgents(forcedAgent, task),
      confidence: 1,
      reason: `Explicitly routed to ${forcedAgent}`,
    };
  }

  const scores = new Map<BuiltinAgentKey, number>();
  for (const rule of ROUTING_RULES) {
    let score = 0;
    for (const pattern of rule.patterns) {
      if (pattern.test(task)) score += rule.weight;
    }
    if (score > 0) scores.set(rule.agent, (scores.get(rule.agent) ?? 0) + score);
  }

  const ranked = [...scores.entries()].sort((a, b) => b[1] - a[1]);
  const primary = ranked[0]?.[0] ?? "research";
  const topScore = ranked[0]?.[1] ?? 0;
  const confidence = Math.min(1, topScore / 4);

  return {
    primary,
    supporting: suggestSupportingAgents(primary, task),
    confidence,
    reason:
      ranked.length > 0
        ? `Matched ${primary} with score ${topScore.toFixed(1)}`
        : "Defaulted to research agent",
  };
}

function suggestSupportingAgents(
  primary: BuiltinAgentKey,
  task: string,
): BuiltinAgentKey[] {
  const supporting: BuiltinAgentKey[] = [];

  if (primary === "content" && /\b(data|metric|analytics|performance)\b/i.test(task)) {
    supporting.push("analytics");
  }
  if (primary === "content" && /\b(research|competitor|market|audience)\b/i.test(task)) {
    supporting.push("research");
  }
  if (primary === "coding" && /\b(documentation|explain|research)\b/i.test(task)) {
    supporting.push("research");
  }
  if (primary === "analytics" && /\b(recommend|strategy|content)\b/i.test(task)) {
    supporting.push("content");
  }

  return supporting.slice(0, 2);
}

export function validateDelegation(
  from: AgentRegistryEntry,
  to: BuiltinAgentKey,
): boolean {
  if (from.key === "supervisor") return to !== "supervisor";
  return from.canDelegateTo.includes(to);
}
