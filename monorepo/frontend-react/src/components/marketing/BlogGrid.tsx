/**
 * Blog post listing grid.
 */

import { BLOG_POSTS } from '../../constants/blog';
import { BlogCard } from './BlogCard';

export function BlogGrid() {
  return (
    <section className="m-blog-section">
      <div className="marketing-container">
        <div className="m-blog-grid">
          {BLOG_POSTS.map((post) => (
            <BlogCard key={post.id} post={post} />
          ))}
        </div>
      </div>
    </section>
  );
}
