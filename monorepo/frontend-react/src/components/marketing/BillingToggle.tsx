/**
 * Three-way billing period toggle (Monthly / Quarterly / Yearly).
 */

import { BILLING_DISCOUNTS, type BillingPeriod } from '../../constants/pricing';

interface Props {
  period: BillingPeriod;
  onChange: (period: BillingPeriod) => void;
}

const PERIODS = Object.keys(BILLING_DISCOUNTS) as BillingPeriod[];

export function BillingToggle({ period, onChange }: Props) {
  return (
    <div className="m-billing-toggle">
      <div className="m-billing-toggle-inner" role="group" aria-label="Billing period">
        {PERIODS.map((key) => (
          <button
            key={key}
            type="button"
            className={`m-billing-toggle-btn${period === key ? ' active' : ''}`}
            onClick={() => onChange(key)}
            aria-pressed={period === key}
          >
            {BILLING_DISCOUNTS[key].label}
          </button>
        ))}
      </div>
    </div>
  );
}
