import { MarketingPageShell } from "./marketing-page-shell";
import { ScrollReveal } from "./scroll-reveal";
import { MarketingButton } from "./ui/marketing-button";
import { MarketingContainer } from "./ui/marketing-container";
import { SectionHeading } from "./ui/section-heading";

const POSTS = [
  {
    title: "How AI Posts Improve Local SEO Rankings",
    excerpt: "Learn how consistent GMB activity signals relevance to Google's local algorithm.",
    date: "Mar 2026",
  },
  {
    title: "The Agency Guide to Multi-Location GMB Management",
    excerpt: "Scale client locations without scaling headcount using unified automation.",
    date: "Feb 2026",
  },
  {
    title: "Review Reply Automation That Sounds Human",
    excerpt: "Best practices for AI-assisted review responses that build trust.",
    date: "Jan 2026",
  },
] as const;

export function BlogPage() {
  return (
    <MarketingPageShell>
      <section className="m-section">
        <MarketingContainer>
          <ScrollReveal>
            <SectionHeading
              label="Blog"
              title="Insights on GMB & Local Growth"
              description="Tips, guides, and product updates from the Limbu.ai team."
            />
          </ScrollReveal>

          <div className="m-dominate-grid">
            {POSTS.map((post, i) => (
              <ScrollReveal key={post.title} delay={(i % 2) as 0 | 1}>
                <article className="m-dominate-card">
                  <p className="m-blog-date">{post.date}</p>
                  <h3>{post.title}</h3>
                  <p>{post.excerpt}</p>
                </article>
              </ScrollReveal>
            ))}
          </div>

          <div style={{ marginTop: "2rem", textAlign: "center" }}>
            <MarketingButton href="/register" variant="primary">
              Get Started
            </MarketingButton>
          </div>
        </MarketingContainer>
      </section>
    </MarketingPageShell>
  );
}
