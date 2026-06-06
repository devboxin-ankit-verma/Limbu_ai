import type { Permission } from "../types";

export type RouteScope = "platform" | "org" | "workspace" | "session";

export type RouteRule = {
  pattern: RegExp;
  permission: Permission;
  scope: RouteScope;
};

/**
 * Route → permission mapping for middleware and page guards.
 * First matching rule wins (most specific routes listed first).
 */
export const ROUTE_RULES: RouteRule[] = [
  { pattern: /^\/workflows(?:\/|$)/, permission: "content:view", scope: "session" },
  { pattern: /^\/agents(?:\/|$)/, permission: "content:view", scope: "session" },
  { pattern: /^\/knowledge(?:\/|$)/, permission: "content:view", scope: "session" },
  { pattern: /^\/chat(?:\/|$)/, permission: "content:view", scope: "session" },
  { pattern: /^\/organizations\/[^/]+\/analytics(?:\/|$)/, permission: "org:analytics:read", scope: "org" },
  { pattern: /^\/organizations\/[^/]+\/billing(?:\/|$)/, permission: "org:billing:manage", scope: "org" },
  {
    pattern: /^\/organizations\/[^/]+\/settings(?:\/|$)/,
    permission: "org:manage",
    scope: "org",
  },
  {
    pattern: /^\/organizations\/[^/]+\/members(?:\/|$)/,
    permission: "org:members:read",
    scope: "org",
  },
  {
    pattern: /^\/organizations\/[^/]+\/workspaces\/new(?:\/|$)/,
    permission: "workspace:create",
    scope: "org",
  },
  {
    pattern: /^\/organizations\/[^/]+\/workspaces\/[^/]+\/settings(?:\/|$)/,
    permission: "workspace:read",
    scope: "workspace",
  },
  {
    pattern: /^\/organizations\/[^/]+\/workspaces\/[^/]+\/members(?:\/|$)/,
    permission: "workspace:members:read",
    scope: "workspace",
  },
  {
    pattern: /^\/organizations\/[^/]+\/workspaces(?:\/|$)/,
    permission: "workspace:read",
    scope: "org",
  },
  {
    pattern: /^\/organizations(?:\/|$)/,
    permission: "org:read",
    scope: "org",
  },
  { pattern: /^\/settings\/notifications(?:\/|$)/, permission: "user:notifications:manage", scope: "session" },
  { pattern: /^\/notifications(?:\/|$)/, permission: "user:notifications:read", scope: "session" },
  { pattern: /^\/dashboard(?:\/|$)/, permission: "org:read", scope: "session" },
];

export function matchRouteRule(pathname: string): RouteRule | null {
  return ROUTE_RULES.find((rule) => rule.pattern.test(pathname)) ?? null;
}

export function extractOrgId(pathname: string): string | null {
  const match = pathname.match(/^\/organizations\/([^/]+)/);
  return match?.[1] ?? null;
}

export function extractWorkspaceId(pathname: string): string | null {
  const match = pathname.match(/^\/organizations\/[^/]+\/workspaces\/([^/]+)/);
  return match?.[1] ?? null;
}
