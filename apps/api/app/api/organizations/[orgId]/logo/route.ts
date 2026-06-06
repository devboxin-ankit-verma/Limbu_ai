import { auth } from "@/auth";
import { orgErrorResponse } from "@limbu/shared/api";
import { findOrganizationLogoUrl, saveOrganizationLogo } from "@/lib/org/logo";
import { OrgRole } from "@limbu/db";
import { getOrganizationProfile, requireOrganizationAccess } from "@limbu/org";
import { NextResponse } from "next/server";

type Params = { params: Promise<{ orgId: string }> };

export async function GET(_request: Request, { params }: Params) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { orgId } = await params;
    await getOrganizationProfile(orgId, session.user.id);
    const logoUrl = await findOrganizationLogoUrl(orgId);
    return NextResponse.json({ logoUrl });
  } catch (err) {
    return orgErrorResponse(err);
  }
}

export async function POST(request: Request, { params }: Params) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { orgId } = await params;
    await requireOrganizationAccess(orgId, session.user.id, OrgRole.admin);

    const formData = await request.formData();
    const file = formData.get("logo");

    if (!(file instanceof File)) {
      return NextResponse.json({ error: "Logo file required" }, { status: 400 });
    }

    const logoUrl = await saveOrganizationLogo(orgId, file);
    return NextResponse.json({ logoUrl });
  } catch (err) {
    if (err instanceof Error) {
      if (err.message === "INVALID_FILE_TYPE") {
        return NextResponse.json({ error: "Invalid file type" }, { status: 400 });
      }
      if (err.message === "FILE_TOO_LARGE") {
        return NextResponse.json({ error: "File too large (max 2 MB)" }, { status: 400 });
      }
    }
    return orgErrorResponse(err);
  }
}
