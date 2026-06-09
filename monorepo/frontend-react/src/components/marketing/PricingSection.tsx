/**
 * A full pricing section with header, optional toggle, and plan cards.
 */

import type { BillingPeriod, PricingSectionData } from '../../constants/pricing';
import { BillingToggle } from './BillingToggle';
import { PricingCard } from './PricingCard';
import { SectionHeader } from './SectionHeader';

interface Props {
  section: PricingSectionData;
  billingPeriod?: BillingPeriod;
  onBillingChange?: (period: BillingPeriod) => void;
}

export function PricingSection({ section, billingPeriod, onBillingChange }: Props) {
  return (
    <section className="m-pricing-section" id={section.id}>
      <div className="marketing-container">
        <SectionHeader
          label={section.label}
          title={section.title}
          highlightWord={section.highlightWord}
          subtitle={section.subtitle}
        />

        {section.showBillingToggle && billingPeriod && onBillingChange && (
          <BillingToggle period={billingPeriod} onChange={onBillingChange} />
        )}

        <div className={`m-pricing-grid cols-${section.columns}`}>
          {section.plans.map((plan) => (
            <PricingCard
              key={plan.id}
              plan={plan}
              billingPeriod={billingPeriod}
              useBillingDiscount={section.showBillingToggle}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
