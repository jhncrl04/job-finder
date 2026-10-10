export function cn(...parts: Array<string | false | null | undefined>) {
  return parts.filter(Boolean).join(" ");
}

export function timeAgo(iso: string | null): string {
  if (!iso) return "Date unknown";
  const diff = Date.now() - new Date(iso).getTime();
  if (Number.isNaN(diff)) return "Date unknown";
  const mins = Math.floor(diff / 60000);
  if (mins < 60) return mins <= 1 ? "Just now" : `${mins} min ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 30) return days === 1 ? "Yesterday" : `${days} days ago`;
  const months = Math.floor(days / 30);
  return months === 1 ? "1 month ago" : `${months} months ago`;
}

// Company monogram tiles rotate through the pastel palette.
// Full class names are written out so Tailwind can see them.
export const TILE_TONES = [
  "bg-lav text-lav-deep",
  "bg-mint text-mint-deep",
  "bg-peach text-peach-deep",
  "bg-sky text-sky-deep",
  "bg-rose text-rose-deep",
  "bg-butter text-butter-deep",
];

export function toneFor(text: string): string {
  let h = 0;
  for (let i = 0; i < text.length; i++) h = (h * 31 + text.charCodeAt(i)) >>> 0;
  return TILE_TONES[h % TILE_TONES.length];
}
