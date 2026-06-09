/**
 * Limbu AI pricing page — all content and plan data.
 */

export type BillingPeriod = 'monthly' | 'quarterly' | 'yearly';
export type BadgeType = 'most-popular' | 'best-seller';
export type ButtonVariant = 'solid' | 'outline';
export type BorderVariant = 'default' | 'purple';

export interface PricingPlan {
  id: string;
  name: string;
  basePrice: number;
  priceLabel?: string;
  period: string;
  features: string[];
  featured?: boolean;
  badge?: BadgeType;
  borderVariant?: BorderVariant;
  buttonVariant: ButtonVariant;
  cta: string;
}

export interface PricingSectionData {
  id: string;
  label?: string;
  title: string;
  highlightWord: string;
  subtitle?: string;
  columns: 2 | 3;
  showBillingToggle?: boolean;
  plans: PricingPlan[];
}

export const BILLING_DISCOUNTS: Record<BillingPeriod, { label: string; multiplier: number }> = {
  monthly: { label: 'Monthly', multiplier: 1 },
  quarterly: { label: 'Quarterly (10% discount)', multiplier: 0.9 },
  yearly: { label: 'Yearly (20% discount)', multiplier: 0.8 },
};

export {
  CONTACT_ADDRESS,
  CONTACT_EMAIL,
  CONTACT_PHONE,
  FOOTER_COMPANY_LINKS,
  FOOTER_PLATFORM_LINKS,
  NAV_LINKS,
  SOCIAL_LINKS,
} from './marketing-site';

export const PRICING_SECTIONS: PricingSectionData[] = [
  {
    id: 'our-package',
    title: 'Our Package',
    highlightWord: 'Package',
    subtitle: 'Choose the Package that suits your business needs',
    columns: 3,
    showBillingToggle: true,
    plans: [
      {
        id: 'base',
        name: 'Base Plan',
        basePrice: 2500,
        period: '/ month',
        features: [
          '1 Google Business Profile',
          'Basic post scheduling',
          'Review monitoring',
          'Monthly performance report',
          'Email support',
        ],
        buttonVariant: 'solid',
        cta: 'Get Started',
      },
      {
        id: 'premium',
        name: 'Premium Plan',
        basePrice: 7500,
        period: '/ month',
        features: [
          'Up to 5 Google Business Profiles',
          'AI-powered post generation',
          'Smart scheduling & calendar',
          'Review reply suggestions',
          'Magic QR review filtering',
          'Priority support',
        ],
        featured: true,
        badge: 'most-popular',
        borderVariant: 'purple',
        buttonVariant: 'solid',
        cta: 'Get Started',
      },
      {
        id: 'professional',
        name: 'Professional Plan',
        basePrice: 5500,
        period: '/ month',
        features: [
          'Up to 3 Google Business Profiles',
          'AI post generation (60/month)',
          'Auto-scheduling',
          'Review management',
          'Basic analytics dashboard',
          'Chat & email support',
        ],
        buttonVariant: 'solid',
        cta: 'Get Started',
      },
    ],
  },
  {
    id: 'service-plans',
    label: 'OUR SERVICE PLANS',
    title: 'OUR SERVICE PLANS',
    highlightWord: 'SERVICE PLANS',
    subtitle:
      'Professional Google Business Profile services tailored to grow your local visibility',
    columns: 2,
    plans: [
      {
        id: 'gmb-assistance',
        name: 'GMB Assistance Rate Plan',
        basePrice: 2500,
        priceLabel: '₹2,500',
        period: '+ 18% GST',
        features: [
          'GMB profile audit',
          'Category & attribute optimization',
          'Photo & description guidance',
          'Monthly check-in call',
          'Performance recommendations',
        ],
        buttonVariant: 'outline',
        cta: 'Get Started',
      },
      {
        id: 'gmb-creation',
        name: 'GMB Creation & Management Plan',
        basePrice: 3000,
        priceLabel: '₹3,000',
        period: '+ 18% GST',
        features: [
          'Full GMB profile creation',
          'Ongoing profile management',
          'Weekly post publishing',
          'Review monitoring & responses',
          'Monthly analytics report',
          'Dedicated account manager',
        ],
        featured: true,
        badge: 'most-popular',
        buttonVariant: 'solid',
        cta: 'Get Started',
      },
    ],
  },
  {
    id: 'web-experience',
    label: 'PREMIUM WEB EXPERIENCE',
    title: 'PREMIUM WEB EXPERIENCE',
    highlightWord: 'WEB EXPERIENCE',
    subtitle: 'Beautiful, conversion-focused websites built for local businesses',
    columns: 3,
    plans: [
      {
        id: 'starter-website',
        name: 'Starter Website',
        basePrice: 9999,
        priceLabel: '₹9,999',
        period: '/ total cost',
        features: [
          'Up to 5 pages',
          'Mobile responsive design',
          'Contact form integration',
          'Basic SEO setup',
          '1 month free support',
        ],
        buttonVariant: 'outline',
        cta: 'Get Started',
      },
      {
        id: 'business-website',
        name: 'Business Website',
        basePrice: 25000,
        priceLabel: '₹25,000',
        period: '/ total cost',
        features: [
          'Up to 15 pages',
          'Custom design & branding',
          'Blog integration',
          'Advanced SEO optimization',
          'Google Analytics setup',
          '3 months free support',
        ],
        featured: true,
        badge: 'most-popular',
        buttonVariant: 'solid',
        cta: 'Get Started',
      },
      {
        id: 'enterprise-website',
        name: 'Enterprise Website',
        basePrice: 48000,
        priceLabel: '₹48,000',
        period: '/ total cost',
        features: [
          'Unlimited pages',
          'E-commerce integration',
          'Custom functionality',
          'Performance optimization',
          'Multi-language support',
          '6 months free support',
        ],
        buttonVariant: 'outline',
        cta: 'Get Started',
      },
    ],
  },
  {
    id: 'seo-plans',
    title: 'Our SEO Plans',
    highlightWord: 'SEO Plans',
    subtitle: 'Data-driven SEO strategies to rank higher in local search results',
    columns: 3,
    plans: [
      {
        id: 'basic-seo',
        name: 'Basic SEO',
        basePrice: 5999,
        priceLabel: '₹5,999',
        period: '/ month',
        features: [
          'Keyword research (10 keywords)',
          'On-page optimization',
          'Google Search Console setup',
          'Monthly ranking report',
          'Email support',
        ],
        buttonVariant: 'outline',
        cta: 'Get Started',
      },
      {
        id: 'standard-seo',
        name: 'Standard SEO',
        basePrice: 9999,
        priceLabel: '₹9,999',
        period: '/ month',
        features: [
          'Keyword research (25 keywords)',
          'On-page & technical SEO',
          'Local citation building',
          'Content optimization',
          'Bi-weekly ranking reports',
          'Priority support',
        ],
        featured: true,
        badge: 'most-popular',
        borderVariant: 'purple',
        buttonVariant: 'solid',
        cta: 'Get Started',
      },
      {
        id: 'advanced-seo',
        name: 'Advanced SEO',
        basePrice: 15999,
        priceLabel: '₹15,999',
        period: '/ month',
        features: [
          'Keyword research (50+ keywords)',
          'Full technical SEO audit',
          'Link building campaign',
          'Content strategy & creation',
          'Weekly ranking reports',
          'Dedicated SEO manager',
        ],
        buttonVariant: 'outline',
        cta: 'Get Started',
      },
    ],
  },
  {
    id: 'account-setup',
    label: 'ACCOUNT SETUP SERVICES',
    title: 'ACCOUNT SETUP SERVICES',
    highlightWord: 'SETUP SERVICES',
    subtitle: 'Professional ad account setup to launch your campaigns the right way',
    columns: 2,
    plans: [
      {
        id: 'google-ads-setup',
        name: 'Google Ads Account Setup',
        basePrice: 2500,
        priceLabel: '₹2,500',
        period: '+ 18% GST / one time',
        features: [
          'Google Ads account creation',
          'Conversion tracking setup',
          'Campaign structure planning',
          'Keyword research',
          'Ad copy recommendations',
        ],
        buttonVariant: 'outline',
        cta: 'Get Started',
      },
      {
        id: 'meta-ads-setup',
        name: 'Meta Ads Account Setup',
        basePrice: 3500,
        priceLabel: '₹3,500',
        period: '+ 18% GST / one time',
        features: [
          'Meta Business Manager setup',
          'Facebook & Instagram ad accounts',
          'Pixel installation & events',
          'Audience targeting setup',
          'Campaign launch guidance',
          '30-day post-setup support',
        ],
        featured: true,
        badge: 'best-seller',
        buttonVariant: 'solid',
        cta: 'Get Started',
      },
    ],
  },
];

export function formatPrice(amount: number): string {
  return `₹${amount.toLocaleString('en-IN')}`;
}

export function getDiscountedPrice(basePrice: number, period: BillingPeriod): number {
  return Math.round(basePrice * BILLING_DISCOUNTS[period].multiplier);
}
