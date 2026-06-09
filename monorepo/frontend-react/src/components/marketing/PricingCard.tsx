/**
 * Single pricing plan card with badge, border, and button variants.
 */

import type { BillingPeriod, PricingPlan } from '../../constants/pricing';
import { formatPrice, getDiscountedPrice } from '../../constants/pricing';
import { FeatureList } from './FeatureList';

interface Props {
  plan: PricingPlan;
  billingPeriod?: BillingPeriod;
  useBillingDiscount?: boolean;
}

const BADGE_LABELS = {
  'most-popular': 'Most Popular',
  'best-seller': 'Best Seller',
} as const;

export function PricingCard({ plan, billingPeriod = 'monthly', useBillingDiscount = false }: Props) {
  const priceAmount = useBillingDiscount
    ? getDiscountedPrice(plan.basePrice, billingPeriod)
    : plan.basePrice;

  const displayPrice = plan.priceLabel ?? formatPrice(priceAmount);

  const cardClass = [
    'm-price-card',
    plan.borderVariant === 'purple' ? 'featured-purple' : '',
  ]
    .filter(Boolean)
    .join(' ');

  const btnClass = `m-btn ${plan.buttonVariant === 'solid' ? 'm-btn-solid' : 'm-btn-outline'}`;

  return (
    <article className={cardClass}>
      {plan.badge && <span className="m-price-card-badge">{BADGE_LABELS[plan.badge]}</span>}

      <h3>{plan.name}</h3>

      <div className="m-price">
        <span className="m-price-amount">{displayPrice}</span>
        <span className="m-price-period">{plan.period}</span>
      </div>

      <FeatureList features={plan.features} />

      <a href="https://limbu.ai/register" className={btnClass}>
        {plan.cta}
      </a>
    </article>
  );
}
