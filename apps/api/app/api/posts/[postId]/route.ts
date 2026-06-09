import { deletePost, getPost, updatePost } from "@limbu/content";
import { gmbErrorResponse } from "@limbu/shared/api/gmb-errors";
import { missingWorkspaceResponse } from "@limbu/shared/api";
import { requireWorkspaceSession } from "@limbu/shared/session";
import { NextResponse } from "next/server";

type Params = { params: Promise<{ postId: string }> };

export async function GET(_request: Request, { params }: Params) {
  const result = await requireWorkspaceSession();
  if (result.error === "Unauthorized") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  if (result.error === "NO_WORKSPACE") return missingWorkspaceResponse();

  try {
    const { postId } = await params;
    const post = await getPost(postId, result.context);
    return NextResponse.json({ post });
  } catch (err) {
    return gmbErrorResponse(err);
  }
}

export async function PATCH(request: Request, { params }: Params) {
  const result = await requireWorkspaceSession();
  if (result.error === "Unauthorized") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  if (result.error === "NO_WORKSPACE") return missingWorkspaceResponse();

  try {
    const { postId } = await params;
    const body = await request.json();
    const post = await updatePost(postId, result.context, body);
    return NextResponse.json({ post });
  } catch (err) {
    return gmbErrorResponse(err);
  }
}

export async function DELETE(_request: Request, { params }: Params) {
  const result = await requireWorkspaceSession();
  if (result.error === "Unauthorized") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  if (result.error === "NO_WORKSPACE") return missingWorkspaceResponse();

  try {
    const { postId } = await params;
    await deletePost(postId, result.context);
    return NextResponse.json({ ok: true });
  } catch (err) {
    return gmbErrorResponse(err);
  }
}
