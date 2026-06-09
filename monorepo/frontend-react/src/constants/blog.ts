/**
 * Limbu.ai blog page — post listing data.
 */

import { SITE_DEFAULT_BLOG_IMAGE } from './marketing-site';

export interface BlogPost {
  id: string;
  slug: string;
  title: string;
  excerpt: string;
  featuredImage: string;
  author: string;
  category: string;
  createdAt: string;
}

export const BLOG_HERO = {
  title: 'Our',
  highlight: 'Blog',
  subtitle:
    'Expert insights, tutorials, and strategies to help you dominate local search and automate your marketing with AI.',
} as const;

export const BLOG_POSTS: BlogPost[] = [
  {
    id: 'gmb-automation-transform-local-business-2026',
    slug: 'gmb-automation-transform-local-business-2026',
    title: 'How GMB Automation Can Transform Your Local Business in 2026',
    excerpt:
      'Learn how GMB automation helps local businesses save time, manage reviews, and dominate local search rankings in 2026.',
    featuredImage: SITE_DEFAULT_BLOG_IMAGE,
    author: 'Admin',
    category: 'Local SEO',
    createdAt: '2026-06-04T12:19:17.968Z',
  },
  {
    id: 'why-limbu-ai-for-gmb',
    slug: 'why-limbu-ai-for-gmb',
    title: 'Why Limbu AI is the Ultimate Tool for Google Business Profile Optimization',
    excerpt:
      'Struggling to rank your local business on Google? Discover how Limbu AI automates Google Business Profile (GMB) posts, reviews, and insights to skyrocket your local search rankings.',
    featuredImage:
      'https://res.cloudinary.com/dsnuzit6o/image/upload/v1776405107/nextjs_uploads/ve3w7aomqaaaddkfje7t.png',
    author: 'Admin',
    category: 'Local SEO',
    createdAt: '2026-06-04T12:19:17.968Z',
  },
];
