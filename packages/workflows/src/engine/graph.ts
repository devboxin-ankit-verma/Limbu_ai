import type { WorkflowDefinition, WorkflowNode } from "../types";

export function getTriggerNode(definition: WorkflowDefinition): WorkflowNode | undefined {
  return definition.nodes.find((n) => n.type === "trigger");
}

export function getOutgoingEdges(definition: WorkflowDefinition, nodeId: string) {
  return definition.edges.filter((e) => e.source === nodeId);
}

export function getIncomingEdges(definition: WorkflowDefinition, nodeId: string) {
  return definition.edges.filter((e) => e.target === nodeId);
}

export function topologicalOrder(definition: WorkflowDefinition): WorkflowNode[] {
  const trigger = getTriggerNode(definition);
  if (!trigger) return definition.nodes;

  const visited = new Set<string>();
  const order: WorkflowNode[] = [];

  function walk(nodeId: string) {
    if (visited.has(nodeId)) return;
    visited.add(nodeId);
    const node = definition.nodes.find((n) => n.id === nodeId);
    if (node) order.push(node);
    for (const edge of getOutgoingEdges(definition, nodeId)) {
      walk(edge.target);
    }
  }

  walk(trigger.id);
  for (const node of definition.nodes) {
    if (!visited.has(node.id)) order.push(node);
  }
  return order;
}

export function selectNextNodes(
  definition: WorkflowDefinition,
  nodeId: string,
  branch?: string,
): WorkflowNode[] {
  const edges = getOutgoingEdges(definition, nodeId);
  const filtered = branch
    ? edges.filter((e) => (e.sourceHandle ?? "default") === branch)
    : edges;
  return filtered
    .map((e) => definition.nodes.find((n) => n.id === e.target))
    .filter((n): n is WorkflowNode => Boolean(n));
}

export function parseDefinition(raw: unknown): WorkflowDefinition {
  const value = (raw ?? { nodes: [], edges: [] }) as WorkflowDefinition;
  return {
    nodes: value.nodes ?? [],
    edges: value.edges ?? [],
    variables: value.variables ?? {},
  };
}
