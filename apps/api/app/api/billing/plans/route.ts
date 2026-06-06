import { PLAN_CATALOG } from "@limbu/billing";
import { NextResponse } from "next/server";

export async function GET() {
  return NextResponse.json({ plans: PLAN_CATALOG });
}
