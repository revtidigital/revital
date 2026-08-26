const catColors: Record<string, string> = {
  "Peak Performer": "bg-orange-500/15 text-orange-400",
  "High Energy": "bg-yellow-500/15 text-yellow-400",
  "Charged Up": "bg-green-500/15 text-green-400",
  "Warming Up": "bg-blue-500/15 text-blue-400",
  "Recharge Needed": "bg-purple-500/15 text-purple-400",
};

export function CategoryBadge({ cat }: { cat: string }) {
  return (
    <span
      className={`inline-block px-2 py-0.5 rounded-full text-[10px] font-semibold ${catColors[cat] ?? "bg-muted/30"}`}
    >
      {cat}
    </span>
  );
}

const participantTypeColors: Record<string, string> = {
  Participant: "bg-sky-500/15 text-sky-400",
  Doctor: "bg-emerald-500/15 text-emerald-400",
  Pharmacist: "bg-fuchsia-500/15 text-fuchsia-400",
};

export function ParticipantTypeBadge({ type }: { type?: string }) {
  if (!type) return <span className="text-muted-foreground text-[11px]">—</span>;
  return (
    <span
      className={`inline-block px-2 py-0.5 rounded-full text-[10px] font-semibold ${participantTypeColors[type] ?? "bg-muted/30"}`}
    >
      {type}
    </span>
  );
}
