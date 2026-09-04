// Neutral placeholder avatar (no gender/hair cues) shown for players who
// haven't uploaded a profile picture yet.
export function GenericAvatar({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 100 100" className={className} role="img" aria-label="Default profile picture">
      <circle cx="50" cy="50" r="50" fill="var(--garnet)" opacity="0.12" />
      <circle cx="50" cy="40" r="18" fill="var(--garnet)" opacity="0.55" />
      <path
        d="M18 88c3-20 16-32 32-32s29 12 32 32z"
        fill="var(--garnet)"
        opacity="0.55"
      />
    </svg>
  );
}
