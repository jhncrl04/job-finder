const escapeRe = (s: string) => s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

// Wraps every occurrence of the filter keywords in a soft yellow marker.
export default function Highlight({ text, terms }: { text: string; terms: string[] }) {
  const clean = terms.filter(Boolean);
  if (!clean.length) return <>{text}</>;
  const re = new RegExp(`(${clean.map(escapeRe).join("|")})`, "gi");
  return (
    <>
      {text.split(re).map((part, i) =>
        i % 2 === 1 ? (
          <mark key={i} className="rounded bg-butter px-0.5 text-ink">
            {part}
          </mark>
        ) : (
          <span key={i}>{part}</span>
        )
      )}
    </>
  );
}
