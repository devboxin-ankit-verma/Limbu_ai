import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

const API_URL = process.env.API_URL ?? process.env.API_INTERNAL_URL ?? "http://localhost:3002";

function buildTargetUrl(request: NextRequest, path: string[]) {
  const target = new URL(`/api/${path.join("/")}`, API_URL);
  target.search = request.nextUrl.search;
  return target;
}

async function proxyRequest(request: NextRequest, path: string[]) {
  if (path[0] === "admin") {
    return NextResponse.json({ error: "Admin API is not available on the web app" }, { status: 404 });
  }

  const target = buildTargetUrl(request, path);
  const headers = new Headers(request.headers);
  headers.delete("host");
  headers.set("x-forwarded-host", request.headers.get("host") ?? "");
  headers.set("x-forwarded-proto", request.nextUrl.protocol.replace(":", ""));

  const init: RequestInit & { duplex?: "half" } = {
    method: request.method,
    headers,
    redirect: "manual",
  };

  if (request.method !== "GET" && request.method !== "HEAD") {
    init.body = request.body;
    init.duplex = "half";
  }

  const response = await fetch(target, init);
  const responseHeaders = new Headers(response.headers);
  responseHeaders.delete("content-encoding");

  return new NextResponse(response.body, {
    status: response.status,
    statusText: response.statusText,
    headers: responseHeaders,
  });
}

type RouteContext = { params: Promise<{ path: string[] }> };

export async function GET(request: NextRequest, context: RouteContext) {
  const { path } = await context.params;
  return proxyRequest(request, path);
}

export async function POST(request: NextRequest, context: RouteContext) {
  const { path } = await context.params;
  return proxyRequest(request, path);
}

export async function PUT(request: NextRequest, context: RouteContext) {
  const { path } = await context.params;
  return proxyRequest(request, path);
}

export async function PATCH(request: NextRequest, context: RouteContext) {
  const { path } = await context.params;
  return proxyRequest(request, path);
}

export async function DELETE(request: NextRequest, context: RouteContext) {
  const { path } = await context.params;
  return proxyRequest(request, path);
}

export async function OPTIONS(request: NextRequest, context: RouteContext) {
  const { path } = await context.params;
  return proxyRequest(request, path);
}

export const runtime = "nodejs";
