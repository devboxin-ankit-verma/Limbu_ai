import { auth } from "@/auth";
import { orgErrorResponse } from "@limbu/shared/api";
import { createOrganization, listUserOrganizations } from "@limbu/org";
import { NextResponse } from "next/server";

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const organizations = await listUserOrganizations(session.user.id);
    return NextResponse.json({ organizations });
  } catch (err) {
    return orgErrorResponse(err);
  }
}

export async function POST(request: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await request.json();
    const org = await createOrganization(session.user.id, body);
    return NextResponse.json({ organization: org }, { status: 201 });
  } catch (err) {
    return orgErrorResponse(err);
  }
}
