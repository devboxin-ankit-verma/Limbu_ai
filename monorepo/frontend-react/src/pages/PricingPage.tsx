/**
 * Limbu AI pricing page — composition only.
 */

import { PricingHero } from '../components/marketing/PricingHero';
import { PricingSection } from '../components/marketing/PricingSection';
import { PRICING_SECTIONS } from '../constants/pricing';
import { useBillingPeriod } from '../hooks/useBillingPeriod';

export default function PricingPage() {
  const { period, setPeriod } = useBillingPeriod();

  return (
    <>
      <PricingHero />
      {PRICING_SECTIONS.map((section) => (
        <PricingSection
          key={section.id}
          section={section}
          billingPeriod={section.showBillingToggle ? period : undefined}
          onBillingChange={section.showBillingToggle ? setPeriod : undefined}
        />
      ))}
    </>
  );
}
