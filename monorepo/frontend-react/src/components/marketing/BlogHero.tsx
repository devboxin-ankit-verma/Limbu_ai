/**
 * Blog listing page hero section.
 */

import { BLOG_HERO } from '../../constants/blog';

export function BlogHero() {
  return (
    <section className="m-blog-hero">
      <div className="marketing-container">
        <h1>
          {BLOG_HERO.title} <span className="highlight">{BLOG_HERO.highlight}</span>
        </h1>
        <p>{BLOG_HERO.subtitle}</p>
      </div>
    </section>
  );
}
