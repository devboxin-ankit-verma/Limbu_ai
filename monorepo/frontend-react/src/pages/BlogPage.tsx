/**
 * Limbu AI blog listing page — composition only.
 */

import { BlogGrid } from '../components/marketing/BlogGrid';
import { BlogHero } from '../components/marketing/BlogHero';

export default function BlogPage() {
  return (
    <>
      <BlogHero />
      <BlogGrid />
    </>
  );
}
