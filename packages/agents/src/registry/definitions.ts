import type { AgentDefinition, AgentRegistryEntry, BuiltinAgentKey } from "../types";
import { AgentNotFoundError } from "../errors";

const BASE_RULES = `You are a specialized AI agent in the Limbu multi-agent system.
Follow your role precisely. Be concise and actionable.
When citing knowledge base sources, use [1], [2] notation.
Never claim to have taken irreversible actions unless a tool confirmed it.`;

export const BUILTIN_AGENTS: Record<BuiltinAgentKey, AgentDefinition> = {
  supervisor: {
    key: "supervisor",
    name: "Supervisor Agent",
    description: "Routes tasks to specialist agents and synthesizes multi-agent results.",
    goal: "Analyze tasks, delegate to the right specialists, and produce a coherent final answer.",
    systemPrompt: `${BASE_RULES}

You are the Supervisor Agent. You do not perform specialist work directly.
Analyze the user task, determine which specialist agents are needed, and synthesize their outputs.
When multiple agents contribute, merge insights without duplication.`,
    tools: [],
    knowledgeScopes: [],
    canDelegateTo: ["research", "coding", "content", "analytics"],
    taskType: "supervisor",
  },
  research: {
    key: "research",
    name: "Research Agent",
    description: "Finds, summarizes, and synthesizes information from knowledge bases and reasoning.",
    goal: "Research topics thoroughly using available knowledge and structured analysis.",
    systemPrompt: `${BASE_RULES}

You are the Research Agent. Gather facts, summarize sources, and provide well-structured research.
Prefer knowledge base context when available. Flag uncertainty clearly.`,
    tools: ["get_current_time", "rag_search"],
    knowledgeScopes: ["workspace", "organization", "personal"],
    canDelegateTo: [],
    taskType: "research",
  },
  coding: {
    key: "coding",
    name: "Coding Agent",
    description: "Writes, reviews, and explains code and technical implementations.",
    goal: "Produce correct, maintainable code and clear technical guidance.",
    systemPrompt: `${BASE_RULES}

You are the Coding Agent. Write clean, typed code with brief explanations.
Use markdown code blocks with language tags. Consider edge cases and security.`,
    tools: ["get_current_time", "echo"],
    knowledgeScopes: ["workspace", "personal"],
    canDelegateTo: ["research"],
    taskType: "coding",
  },
  content: {
    key: "content",
    name: "Content Agent",
    description: "Creates marketing copy, social posts, and brand-aligned content.",
    goal: "Generate compelling, on-brand marketing content for the workspace.",
    systemPrompt: `${BASE_RULES}

You are the Content Agent. Write marketing copy aligned with the workspace brand voice.
Match tone to channel. Include hooks and clear calls-to-action when appropriate.`,
    tools: ["get_current_time", "rag_search"],
    knowledgeScopes: ["workspace", "organization"],
    canDelegateTo: ["research", "analytics"],
    taskType: "content",
  },
  analytics: {
    key: "analytics",
    name: "Analytics Agent",
    description: "Interprets metrics, trends, and performance data.",
    goal: "Analyze data patterns and provide actionable business insights.",
    systemPrompt: `${BASE_RULES}

You are the Analytics Agent. Interpret metrics, identify trends, and recommend actions.
Be quantitative where possible. Distinguish correlation from causation.`,
    tools: ["get_current_time", "rag_search", "summarize_metrics"],
    knowledgeScopes: ["workspace", "organization"],
    canDelegateTo: ["research"],
    taskType: "analytics",
  },
};

const registry = new Map<BuiltinAgentKey, AgentRegistryEntry>();

export function registerBuiltinAgents() {
  if (registry.size > 0) return;
  for (const agent of Object.values(BUILTIN_AGENTS)) {
    registry.set(agent.key, { ...agent, isBuiltin: true });
  }
}

export function getAgent(key: string): AgentRegistryEntry | undefined {
  registerBuiltinAgents();
  return registry.get(key as BuiltinAgentKey);
}

export function listAgents(): AgentRegistryEntry[] {
  registerBuiltinAgents();
  return [...registry.values()];
}

export function listSpecialistAgents(): AgentRegistryEntry[] {
  return listAgents().filter((agent) => agent.key !== "supervisor");
}

export function assertAgent(key: string): AgentRegistryEntry {
  const agent = getAgent(key);
  if (!agent) throw new AgentNotFoundError(key);
  return agent;
}
