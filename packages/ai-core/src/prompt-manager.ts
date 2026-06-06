import { AiGenerationType, prisma } from "@limbu/db";
import type { PromptLayers, WorkspaceAiSettings } from "./types";

const DEFAULT_GLOBAL_CHAT_PROMPT = `You are Limbu, a helpful AI marketing assistant.
Be concise, accurate, and actionable. Use markdown when it improves clarity.
Do not invent facts about the user's business.`;

export async function loadGlobalPrompt(taskType: AiGenerationType = AiGenerationType.chat): Promise<string> {
  const template = await prisma.promptTemplate.findFirst({
    where: { type: taskType, isActive: true },
    orderBy: [{ name: "asc" }, { version: "desc" }],
  });

  if (taskType === AiGenerationType.chat) {
    const chatTemplate = await prisma.promptTemplate.findFirst({
      where: { name: "chat_assistant", type: AiGenerationType.chat, isActive: true },
      orderBy: { version: "desc" },
    });
    if (chatTemplate) return chatTemplate.template;
  }

  return template?.template ?? DEFAULT_GLOBAL_CHAT_PROMPT;
}

export async function loadWorkspacePrompt(workspaceId: string): Promise<string | undefined> {
  const workspace = await prisma.workspace.findUnique({
    where: { id: workspaceId },
    select: { settings: true, name: true, industry: true },
  });
  if (!workspace) return undefined;

  const settings = (workspace.settings ?? {}) as WorkspaceAiSettings;
  if (settings.systemPrompt?.trim()) return settings.systemPrompt.trim();

  const parts: string[] = [];
  if (workspace.name) parts.push(`Workspace: ${workspace.name}`);
  if (workspace.industry) parts.push(`Industry: ${workspace.industry}`);
  return parts.length > 0 ? parts.join("\n") : undefined;
}

export async function loadAgentPrompt(agentId: string): Promise<string | undefined> {
  const agent = await prisma.agent.findUnique({
    where: { id: agentId },
    select: { name: true, goal: true },
  });
  if (!agent) return undefined;
  return `Agent: ${agent.name}\nGoal: ${agent.goal}`;
}

export async function buildPromptLayers(input: {
  workspaceId: string;
  taskType?: AiGenerationType;
  agentId?: string;
  variables?: Record<string, string>;
}): Promise<PromptLayers> {
  const taskType = input.taskType ?? AiGenerationType.chat;
  const [global, workspace, agent] = await Promise.all([
    loadGlobalPrompt(taskType),
    loadWorkspacePrompt(input.workspaceId),
    input.agentId ? loadAgentPrompt(input.agentId) : Promise.resolve(undefined),
  ]);

  return {
    global: interpolate(global, input.variables),
    workspace: workspace ? interpolate(workspace, input.variables) : undefined,
    agent: agent ? interpolate(agent, input.variables) : undefined,
  };
}

export function composeSystemPrompt(layers: PromptLayers, shortTermMemory?: Record<string, string>): string {
  const sections = [layers.global];
  if (layers.workspace) sections.push(`## Workspace Instructions\n${layers.workspace}`);
  if (layers.agent) sections.push(`## Agent Instructions\n${layers.agent}`);
  if (shortTermMemory && Object.keys(shortTermMemory).length > 0) {
    sections.push(
      `## Session Memory\n${Object.entries(shortTermMemory)
        .map(([k, v]) => `- ${k}: ${v}`)
        .join("\n")}`,
    );
  }
  return sections.join("\n\n");
}

function interpolate(template: string, variables?: Record<string, string>): string {
  if (!variables) return template;
  return template.replace(/\{\{(\w+)\}\}/g, (_, key: string) => variables[key] ?? "");
}
