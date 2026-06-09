/**
 * Billing period state for subscription pricing toggle.
 */

import { useState } from 'react';
import type { BillingPeriod } from '../constants/pricing';

export function useBillingPeriod(initial: BillingPeriod = 'monthly') {
  const [period, setPeriod] = useState<BillingPeriod>(initial);
  return { period, setPeriod };
}
