import { adminErrorResponse, requireAdminApi } from "@limbu/shared/api";
import {
  listFeatureFlags,
  updateFeatureFlag,
  setOrgFeatureOverride,
  updateFeatureFlagSchema,
  setOrgFeatureOverrideSchema,
} from "@limbu/admin";
import { NextResponse } from "next/server";

export async function GET() {
  const auth = await requireAdminApi();
  if ("error" in auth) return auth.error;

  try {
    const flags = await listFeatureFlags();
    return NextResponse.json({ flags });
  } catch (err) {
    return adminErrorResponse(err);
  }
}

export async function PATCH(request: Request) {
  const auth = await requireAdminApi("platform:organizations:manage");
  if ("error" in auth) return auth.error;

  try {
    const body = await request.json();
    const key = body.key as string;
    if (!key) return NextResponse.json({ error: "key required" }, { status: 400 });

    if (body.override) {
      const parsed = setOrgFeatureOverrideSchema.safeParse(body.override);
      if (!parsed.success) {
        return NextResponse.json({ error: "Invalid override" }, { status: 400 });
      }
      const result = await setOrgFeatureOverride(
        key,
        parsed.data.organizationId,
        parsed.data.value,
        auth.userId,
      );
      return NextResponse.json({ result });
    }

    const parsed = updateFeatureFlagSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: "Invalid input" }, { status: 400 });
    }
    const flag = await updateFeatureFlag(key, parsed.data, auth.userId, auth.auditOrgId);
    return NextResponse.json({ flag });
  } catch (err) {
    return adminErrorResponse(err);
  }
}
