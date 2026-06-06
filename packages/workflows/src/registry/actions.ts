import { startAgentRun } from "@limbu/agents";
import { NotificationChannel, prisma, type Prisma } from "@limbu/db";
import { dispatchNotification } from "@limbu/notifications";
import type { ActionHandler, RuntimeContext, WorkflowNode } from "../types";
import { interpolate, setVariable } from "../engine/evaluator";

const actionHandlers = new Map<string, ActionHandler>();

export function registerAction(kind: string, handler: ActionHandler) {
  actionHandlers.set(kind, handler);
}

export function getActionHandler(kind: string): ActionHandler | undefined {
  return actionHandlers.get(kind);
}

export function registerBuiltinActions() {
  if (actionHandlers.size > 0) return;

  registerAction("run_agent", async (node, ctx) => {
    const task = interpolate(String(node.config.task ?? ""), ctx);
    const agentKey = node.config.agentKey as string | undefined;
    const result = await startAgentRun(
      {
        userId: ctx.userId,
        workspaceId: ctx.workspaceId,
        organizationId: ctx.organizationId,
      },
      { task, agentKey: agentKey as never },
    );
    setVariable(ctx, node.config.outputVariable as string ?? "agentResult", result.content);
    return { content: result.content, runId: result.runId };
  });

  registerAction("send_email", async (node, ctx) => {
    const to = interpolate(String(node.config.to ?? ""), ctx);
    const subject = interpolate(String(node.config.subject ?? "Workflow notification"), ctx);
    const body = interpolate(String(node.config.body ?? ""), ctx);
    const userId = String(node.config.userId ?? ctx.userId);

    await dispatchNotification({
      userId,
      eventType: "workflow.update",
      templateKey: "workflow_update",
      type: "workflow",
      payload: { title: subject, body },
      channels: [NotificationChannel.email],
      emailTo: to,
      skipPreferences: true,
    });

    return { sent: true, to };
  });

  registerAction("send_notification", async (node, ctx) => {
    const userId = String(node.config.userId ?? ctx.userId);
    const title = interpolate(String(node.config.title ?? "Workflow update"), ctx);
    const body = interpolate(String(node.config.body ?? ""), ctx);

    const result = await dispatchNotification({
      userId,
      eventType: "workflow.update",
      templateKey: "workflow_update",
      type: String(node.config.type ?? "workflow"),
      payload: {
        title,
        body,
        workflowId: ctx.workflowId,
        runId: ctx.runId,
      },
      channels: [
        NotificationChannel.in_app,
        NotificationChannel.workflow,
        NotificationChannel.email,
        NotificationChannel.push,
      ],
    });

    return { notificationId: result.notificationId, jobIds: result.jobIds };
  });

  registerAction("call_api", async (node, ctx) => {
    const url = interpolate(String(node.config.url ?? ""), ctx);
    const method = String(node.config.method ?? "GET").toUpperCase();
    const headers = (node.config.headers ?? {}) as Record<string, string>;
    const body = node.config.body ? interpolate(JSON.stringify(node.config.body), ctx) : undefined;
    const response = await fetch(url, {
      method,
      headers: { "Content-Type": "application/json", ...headers },
      body: method === "GET" ? undefined : body,
    });
    const text = await response.text();
    let parsed: unknown = text;
    try {
      parsed = JSON.parse(text);
    } catch {
      // keep text
    }
    setVariable(ctx, String(node.config.outputVariable ?? "apiResponse"), parsed);
    return { status: response.status, body: parsed };
  });

  registerAction("update_database", async (node, ctx) => {
    const model = String(node.config.model ?? "");
    if (model !== "auditLog") {
      throw new Error(`Database model '${model}' is not allowed`);
    }
    const record = await prisma.auditLog.create({
      data: {
        organizationId: ctx.organizationId,
        actorId: ctx.userId,
        action: String(node.config.action ?? "workflow.update"),
        resourceType: String(node.config.resourceType ?? "workflow"),
        resourceId: ctx.workflowId,
        metadata: {
          runId: ctx.runId,
          data: node.config.data ?? {},
        } as Prisma.InputJsonValue,
      },
    });
    return { id: record.id };
  });

  registerAction("create_document", async (node, ctx) => {
    const title = interpolate(String(node.config.title ?? "Workflow document"), ctx);
    const content = interpolate(String(node.config.content ?? ""), ctx);
    const kb = await prisma.knowledgeBase.findFirst({
      where: {
        workspaceId: ctx.workspaceId,
        organizationId: ctx.organizationId,
        scope: "workspace",
        isDefault: true,
      },
    });
    if (!kb) throw new Error("Default workspace knowledge base not found");

    const doc = await prisma.knowledgeDocument.create({
      data: {
        knowledgeBaseId: kb.id,
        organizationId: ctx.organizationId,
        workspaceId: ctx.workspaceId,
        uploadedById: ctx.userId,
        filename: `${title}.txt`,
        title,
        s3Key: `workflow/${ctx.runId}/${Date.now()}.txt`,
        mimeType: "text/plain",
        status: "ready",
        chunkCount: 1,
      },
    });
    await prisma.documentChunk.create({
      data: {
        documentId: doc.id,
        organizationId: ctx.organizationId,
        workspaceId: ctx.workspaceId,
        content,
        chunkIndex: 0,
        citationKey: `${doc.id}:0`,
      },
    });
    return { documentId: doc.id, title };
  });

  registerAction("execute_workflow", async (node, ctx) => {
    const targetWorkflowId = String(node.config.workflowId ?? "");
    const { enqueueWorkflowRun } = await import("../queue/processor");
    const job = await enqueueWorkflowRun({
      workflowId: targetWorkflowId,
      userId: ctx.userId,
      workspaceId: ctx.workspaceId,
      organizationId: ctx.organizationId,
      triggerEvent: { parentRunId: ctx.runId, ...(node.config.payload as object) },
      variables: ctx.variables,
    });
    return { jobId: job.id };
  });

  registerAction("set_variable", async (node, ctx) => {
    const key = String(node.config.key ?? "");
    const value = node.config.value;
    setVariable(ctx, key, typeof value === "string" ? interpolate(value, ctx) : value);
    return { key, value: getVariable(ctx, key) };
  });
}

function getVariable(ctx: RuntimeContext, path: string) {
  return path.split(".").reduce<unknown>((acc, part) => {
    if (acc && typeof acc === "object") return (acc as Record<string, unknown>)[part];
    return undefined;
  }, ctx.variables as unknown);
}

export async function executeAction(node: WorkflowNode, ctx: RuntimeContext) {
  registerBuiltinActions();
  const handler = getActionHandler(node.kind);
  if (!handler) throw new Error(`Unknown action kind: ${node.kind}`);
  return handler(node, ctx);
}
