import { prisma, WorkflowTriggerType, type Prisma } from "@limbu/db";
import type { WorkflowDefinition } from "../types";

export const BUILTIN_TEMPLATES: Array<{
  name: string;
  description: string;
  category: string;
  triggerType: WorkflowTriggerType;
  triggerConfig: Record<string, unknown>;
  definition: WorkflowDefinition;
}> = [
  {
    name: "AI Content Pipeline",
    description: "Run a content agent when manually triggered, then notify the team.",
    category: "content",
    triggerType: WorkflowTriggerType.manual,
    triggerConfig: {},
    definition: {
      nodes: [
        { id: "t1", type: "trigger", kind: "manual", label: "Manual", config: {}, position: { x: 0, y: 0 } },
        {
          id: "a1",
          type: "action",
          kind: "run_agent",
          label: "Generate content",
          config: { task: "{{brief}}", agentKey: "content", outputVariable: "content" },
          position: { x: 0, y: 120 },
        },
        {
          id: "a2",
          type: "action",
          kind: "send_notification",
          label: "Notify team",
          config: { title: "Content ready", body: "{{content}}" },
          position: { x: 0, y: 240 },
        },
      ],
      edges: [
        { id: "e1", source: "t1", target: "a1" },
        { id: "e2", source: "a1", target: "a2" },
      ],
      variables: { brief: "Write a social post about our product launch" },
    },
  },
  {
    name: "Weekly Analytics Digest",
    description: "Scheduled workflow that runs analytics agent and emails summary.",
    category: "analytics",
    triggerType: WorkflowTriggerType.scheduled,
    triggerConfig: { cron: "0 9 * * 1" },
    definition: {
      nodes: [
        { id: "t1", type: "trigger", kind: "scheduled", label: "Weekly", config: {}, position: { x: 0, y: 0 } },
        {
          id: "a1",
          type: "action",
          kind: "run_agent",
          label: "Analyze metrics",
          config: {
            task: "Summarize workspace marketing performance for the past week",
            agentKey: "analytics",
            outputVariable: "summary",
          },
          position: { x: 0, y: 120 },
        },
        {
          id: "a1b",
          type: "action",
          kind: "send_email",
          label: "Email digest",
          config: {
            to: "{{email}}",
            subject: "Weekly analytics digest",
            body: "{{summary}}",
          },
          position: { x: 0, y: 240 },
        },
      ],
      edges: [
        { id: "e1", source: "t1", target: "a1" },
        { id: "e2", source: "a1", target: "a1b" },
      ],
      variables: { email: "team@example.com" },
    },
  },
  {
    name: "Webhook → Research → Document",
    description: "Webhook trigger runs research agent and saves output as a knowledge document.",
    category: "research",
    triggerType: WorkflowTriggerType.webhook,
    triggerConfig: {},
    definition: {
      nodes: [
        { id: "t1", type: "trigger", kind: "webhook", label: "Webhook", config: {}, position: { x: 0, y: 0 } },
        {
          id: "a1",
          type: "action",
          kind: "run_agent",
          label: "Research topic",
          config: {
            task: "Research: {{topic}}",
            agentKey: "research",
            outputVariable: "research",
          },
          position: { x: 0, y: 120 },
        },
        {
          id: "a2",
          type: "action",
          kind: "create_document",
          label: "Save to KB",
          config: { title: "{{topic}}", content: "{{research}}" },
          position: { x: 0, y: 240 },
        },
      ],
      edges: [
        { id: "e1", source: "t1", target: "a1" },
        { id: "e2", source: "a1", target: "a2" },
      ],
    },
  },
];

export async function seedWorkflowTemplates() {
  for (const template of BUILTIN_TEMPLATES) {
    const existing = await prisma.workflowTemplate.findFirst({
      where: { name: template.name, organizationId: null },
    });
    if (existing) continue;

    await prisma.workflowTemplate.create({
      data: {
        name: template.name,
        description: template.description,
        category: template.category,
        triggerType: template.triggerType,
        triggerConfig: template.triggerConfig as Prisma.InputJsonValue,
        definition: template.definition as unknown as Prisma.InputJsonValue,
        isPublic: true,
      },
    });
  }
}

export async function listTemplates(organizationId: string) {
  return prisma.workflowTemplate.findMany({
    where: {
      OR: [{ organizationId: null, isPublic: true }, { organizationId }],
    },
    orderBy: [{ category: "asc" }, { name: "asc" }],
  });
}
