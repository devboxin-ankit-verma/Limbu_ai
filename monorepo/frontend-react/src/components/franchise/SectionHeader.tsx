/**
 * Reusable section header with optional yellow highlight word.
 */

interface Props {
  tag?: string;
  title: string;
  highlight?: string;
  subtitle?: string;
}

export function SectionHeader({ tag, title, highlight, subtitle }: Props) {
  const titleParts = highlight ? title.split(highlight) : [title];

  return (
    <div className="franchise-section-header">
      {tag && <p className="franchise-section-tag">{tag}</p>}
      <h2 className="franchise-section-title">
        {highlight ? (
          <>
            {titleParts[0]}
            <span className="franchise-highlight">{highlight}</span>
            {titleParts[1]}
          </>
        ) : (
          title
        )}
      </h2>
      {subtitle && <p className="franchise-section-subtitle">{subtitle}</p>}
    </div>
  );
}
