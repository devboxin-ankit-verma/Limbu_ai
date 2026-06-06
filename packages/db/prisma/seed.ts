import { AiGenerationType, PlanTier, PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  const featureFlags = [
    { key: "ai_post_generation", defaultValue: true, description: "AI-powered post composer" },
    { key: "ai_review_replies", defaultValue: true, description: "AI-generated review replies" },
    { key: "approval_workflows", defaultValue: false, description: "Multi-round post approval" },
    { key: "knowledge_base_rag", defaultValue: false, description: "Workspace knowledge base RAG" },
    { key: "meta_publishing", defaultValue: false, description: "Facebook/Instagram publishing" },
    { key: "agency_mode", defaultValue: false, description: "Multi-workspace agency features" },
  ];

  for (const flag of featureFlags) {
    await prisma.featureFlag.upsert({
      where: { key: flag.key },
      update: flag,
      create: flag,
    });
  }

  const promptTemplates = [
    {
      name: "chat_assistant",
      type: AiGenerationType.chat,
      version: 1,
      template: `You are Limbu, a helpful AI marketing assistant.
Be concise, accurate, and actionable. Use markdown when it improves clarity.
Do not invent facts about the user's business.`,
    },
    {
      name: "post_composer",
      type: AiGenerationType.post,
      version: 1,
      template: `You are a marketing copywriter for {{business_name}}.
Write a {{tone}} social media post for {{platform}} about: {{topic}}.
Keep it under {{max_length}} characters. Include a call-to-action when appropriate.`,
    },
    {
      name: "review_reply",
      type: AiGenerationType.review_reply,
      version: 1,
      template: `You are responding to a {{rating}}-star review for {{business_name}}.
Review: "{{review_text}}"
Write a professional, empathetic reply. Thank positive reviewers; address concerns in negative reviews.`,
    },
    {
      name: "qa_answer",
      type: AiGenerationType.qa_answer,
      version: 1,
      template: `Answer this customer question for {{business_name}} using the provided context.
Question: {{question}}
Context: {{context}}
Be helpful, accurate, and concise.`,
    },
  ];

  for (const template of promptTemplates) {
    await prisma.promptTemplate.upsert({
      where: {
        name_type_version: {
          name: template.name,
          type: template.type,
          version: template.version,
        },
      },
      update: { template: template.template, isActive: true },
      create: template,
    });
  }

  const entitlements = [
    {
      planTier: PlanTier.free,
      maxWorkspaces: 1,
      maxMembers: 1,
      monthlyCredits: 50,
      maxPostsPerMonth: 10,
      features: {
        channels: ["gbp"],
        approvalWorkflows: false,
        knowledgeBaseRag: false,
        aiAgents: false,
        workflows: false,
        sso: false,
        maxStorageMb: 100,
        maxKnowledgeDocuments: 5,
        maxAgentRunsPerMonth: 0,
        maxWorkflowRunsPerMonth: 0,
      },
    },
    {
      planTier: PlanTier.starter,
      maxWorkspaces: 1,
      maxMembers: 2,
      monthlyCredits: 200,
      maxPostsPerMonth: 50,
      features: {
        channels: ["gbp"],
        approvalWorkflows: false,
        knowledgeBaseRag: true,
        aiAgents: false,
        workflows: true,
        sso: false,
        maxStorageMb: 500,
        maxKnowledgeDocuments: 25,
        maxAgentRunsPerMonth: 10,
        maxWorkflowRunsPerMonth: 50,
      },
    },
    {
      planTier: PlanTier.pro,
      maxWorkspaces: 3,
      maxMembers: 5,
      monthlyCredits: 500,
      maxPostsPerMonth: null,
      features: {
        channels: ["gbp", "facebook", "instagram"],
        approvalWorkflows: false,
        knowledgeBaseRag: true,
        aiAgents: true,
        workflows: true,
        sso: false,
        maxStorageMb: 2048,
        maxKnowledgeDocuments: 100,
        maxAgentRunsPerMonth: 100,
        maxWorkflowRunsPerMonth: 500,
      },
    },
    {
      planTier: PlanTier.team,
      maxWorkspaces: 15,
      maxMembers: 10,
      monthlyCredits: 2000,
      maxPostsPerMonth: null,
      features: {
        channels: ["gbp", "facebook", "instagram"],
        approvalWorkflows: true,
        knowledgeBaseRag: true,
        aiAgents: true,
        workflows: true,
        sso: false,
        maxStorageMb: 10240,
        maxKnowledgeDocuments: 500,
        maxAgentRunsPerMonth: 500,
        maxWorkflowRunsPerMonth: 2000,
      },
    },
    {
      planTier: PlanTier.enterprise,
      maxWorkspaces: 9999,
      maxMembers: 9999,
      monthlyCredits: 10000,
      maxPostsPerMonth: null,
      features: {
        channels: ["gbp", "facebook", "instagram"],
        approvalWorkflows: true,
        knowledgeBaseRag: true,
        aiAgents: true,
        workflows: true,
        sso: true,
        maxStorageMb: 102400,
        maxKnowledgeDocuments: 10000,
        maxAgentRunsPerMonth: 10000,
        maxWorkflowRunsPerMonth: 50000,
      },
    },
  ];

  for (const e of entitlements) {
    await prisma.planEntitlement.upsert({
      where: { planTier: e.planTier },
      update: e,
      create: e,
    });
  }

  console.log("Seeded feature_flags, prompt_templates, plan_entitlements");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
