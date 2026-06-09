/**
 * Single blog post preview card.
 */

import { ArrowRight, Calendar, User } from 'lucide-react';
import type { BlogPost } from '../../constants/blog';

interface Props {
  post: BlogPost;
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

export function BlogCard({ post }: Props) {
  const href = `https://limbu.ai/blog/${post.slug}`;

  return (
    <article className="m-blog-card">
      <a href={href} className="m-blog-card-media" target="_blank" rel="noreferrer">
        <img src={post.featuredImage} alt={post.title} loading="lazy" />
        <span className="m-blog-card-badge">{post.category}</span>
      </a>

      <div className="m-blog-card-body">
        <div className="m-blog-card-meta">
          <span>
            <Calendar size={12} aria-hidden="true" />
            {formatDate(post.createdAt)}
          </span>
          <span>
            <User size={12} aria-hidden="true" />
            {post.author}
          </span>
        </div>

        <a href={href} target="_blank" rel="noreferrer">
          <h3>{post.title}</h3>
        </a>

        <p>{post.excerpt}</p>

        <a href={href} className="m-blog-card-link" target="_blank" rel="noreferrer">
          Read Article
          <ArrowRight size={16} aria-hidden="true" />
        </a>
      </div>
    </article>
  );
}
