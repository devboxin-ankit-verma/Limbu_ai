import { IMAGE_GALLERY, VIDEO_GALLERY } from "../data/landing-content";
import { ScrollReveal } from "../scroll-reveal";
import { MarketingContainer } from "../ui/marketing-container";
import { SectionHeading } from "../ui/section-heading";

type GalleryVariant = "images" | "videos";

const CONFIG = {
  images: {
    label: "AI Creations",
    title: "Limbu AI Image Creations",
    items: IMAGE_GALLERY,
    video: false,
  },
  videos: {
    label: "AI Video",
    title: "Limbu AI Video Creations",
    items: VIDEO_GALLERY,
    video: true,
  },
} as const;

export function MediaGallery({ variant }: { variant: GalleryVariant }) {
  const { label, title, items, video } = CONFIG[variant];

  return (
    <section className={`m-section${variant === "videos" ? " m-section-alt" : ""}`}>
      <MarketingContainer>
        <ScrollReveal>
          <SectionHeading label={label} title={title} />
        </ScrollReveal>

        <div className="m-gallery-scroll">
          {items.map((item) => (
            <div
              key={item.alt}
              className={`m-gallery-item${video ? " m-gallery-video" : ""}`}
              style={{ background: item.gradient }}
              role="img"
              aria-label={item.alt}
            />
          ))}
        </div>
      </MarketingContainer>
    </section>
  );
}
