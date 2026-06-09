/**
 * Limbu.ai marketing site — shared nav, footer, and contact constants.
 */

export const SITE_LOGO_URL = 'https://www.limbu.ai/images/bg-logo.png';
export const SITE_DEFAULT_BLOG_IMAGE = 'https://www.limbu.ai/images/app_template.jpg';

export const CONTACT_PHONE = '+91 9289344726';
export const CONTACT_EMAIL = 'info@limbu.ai';
export const CONTACT_ADDRESS = '8th Floor, Unit No. 831, JMD Megapolis, Gurugram';

export const NAV_LINKS = [
  { href: '/#features', label: 'Features' },
  { href: '/pricing', label: 'Pricing' },
  { href: '/franchise', label: 'Franchise' },
  { href: '/blog', label: 'Blog' },
] as const;

export const GMB_GUIDE_LINKS = [
  { href: 'https://limbu.ai/how-to-connect-gmb', label: 'How To Connect GMB', external: true },
  { href: 'https://limbu.ai/how-to-create-post', label: 'Create AI Post', external: true },
  { href: 'https://limbu.ai/how-to-reply-review', label: 'Reply to Reviews', external: true },
  { href: 'https://limbu.ai/how-to-generate-magic-qr', label: 'Generate Magic QR', external: true },
  { href: 'https://limbu.ai/how-to-post-on-gmb', label: 'Post on GMB', external: true },
] as const;

export const FOOTER_PLATFORM_LINKS = [
  { label: 'Post Management', href: 'https://limbu.ai/dashboard/posts', external: true },
  { label: 'Review Management', href: 'https://limbu.ai/dashboard/reviews', external: true },
  { label: 'Magic QR', href: 'https://limbu.ai/dashboard/magic-qr', external: true },
  { label: 'Google Business Service', href: 'https://limbu.ai/#features', external: true },
  { label: 'Local SEO', href: 'https://limbu.ai/blog', external: true },
] as const;

export const FOOTER_COMPANY_LINKS = [
  { label: 'Contact', href: `mailto:${CONTACT_EMAIL}` },
  { label: 'Privacy Policy', href: 'https://limbu.ai/privacy-policy', external: true },
  { label: 'Terms & Conditions', href: 'https://limbu.ai/terms', external: true },
  { label: 'Work With Us', href: 'https://limbu.ai/work-with-us', external: true },
  { label: 'Blog', href: '/blog' },
] as const;

export const SOCIAL_LINKS = [
  { label: 'Facebook', href: 'https://www.facebook.com/limbuai', icon: 'facebook' },
  { label: 'LinkedIn', href: 'https://www.linkedin.com/company/limbuai', icon: 'linkedin' },
  { label: 'Instagram', href: 'https://www.instagram.com/limbuai', icon: 'instagram' },
  { label: 'Pinterest', href: 'https://www.pinterest.com/limbuai', icon: 'pinterest' },
  { label: 'YouTube', href: 'https://www.youtube.com/@limbuai', icon: 'youtube' },
] as const;
