import { getBusinessAnalytics } from "@limbu/analytics";
import type { BusinessAnalyticsSummary } from "@limbu/analytics";

export async function getRevenueDashboard(days = 30): Promise<BusinessAnalyticsSummary> {
  return getBusinessAnalytics(undefined, days);
}
