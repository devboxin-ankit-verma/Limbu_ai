/**
 * Reusable section header with optional label and yellow highlight word.
 */

interface Props {
  label?: string;
  title: string;
  highlightWord: string;
  subtitle?: string;
  align?: 'center' | 'left';
}

export function SectionHeader({ label, title, highlightWord, subtitle, align = 'center' }: Props) {
  const titleParts = title.split(highlightWord);
  const hasHighlight = title.includes(highlightWord);

  return (
    <div className={`m-section-header${align === 'left' ? ' left' : ''}`}>
      {label && <span className="m-section-label">{label}</span>}
      <h2>
        {hasHighlight ? (
          <>
            {titleParts[0]}
            <span className="highlight">{highlightWord}</span>
            {titleParts[1]}
          </>
        ) : (
          title
        )}
      </h2>
      {subtitle && <p>{subtitle}</p>}
    </div>
  );
}
