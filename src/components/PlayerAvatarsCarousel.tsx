import { useEffect, useRef, useState } from "react";
import Autoplay from "embla-carousel-autoplay";
import { Carousel, CarouselContent, CarouselItem } from "@/components/ui/carousel";

interface PlayerAvatar {
  userId: string;
  name: string;
  avatarUrl?: string;
  score?: number;
  date?: string;
  isWinner?: boolean;
}

function formatDate(date?: string): string | null {
  if (!date) return null;
  return new Intl.DateTimeFormat("en-US", { month: "short", day: "numeric" }).format(
    new Date(`${date}T12:00:00Z`),
  );
}

export function PlayerAvatarsCarousel() {
  const [players, setPlayers] = useState<PlayerAvatar[]>([]);
  const autoplay = useRef(Autoplay({ delay: 2200, stopOnInteraction: false }));

  useEffect(() => {
    import("@/server/userFns")
      .then((mod) => mod.getRecentPlayerAvatarsFn())
      .then(setPlayers)
      .catch(() => setPlayers([]));
  }, []);

  if (players.length === 0) return null;

  return (
    <div className="mt-8">
      <div className="text-center mb-4">
        <div className="inline-block px-4 py-1.5 rounded-full bg-[var(--marigold)] text-garnet text-xs uppercase tracking-[0.2em] font-black">
          🔥 Players Climbing the Leaderboard
        </div>
      </div>
      <Carousel
        opts={{ align: "start", loop: true }}
        plugins={[autoplay.current]}
        className="mx-auto max-w-2xl"
      >
        <CarouselContent className="-ml-3">
          {players.map((p) => (
            <CarouselItem key={p.userId} className="basis-1/3 pl-3">
              <div className="group relative block bg-white/90 rounded-xl overflow-hidden shadow-[0_12px_36px_-12px_oklch(0.36_0.12_30_/_0.25)]">
                <div className="relative w-full aspect-square bg-black/5 flex items-center justify-center">
                  {p.avatarUrl ? (
                    <img
                      src={p.avatarUrl}
                      alt={p.name}
                      loading="lazy"
                      className="w-full h-full object-cover group-hover:scale-[1.03] transition-transform"
                    />
                  ) : (
                    <div className="w-full h-full bg-gradient-energy flex items-center justify-center">
                      <span className="text-2xl leading-none">👤</span>
                    </div>
                  )}
                  {p.isWinner && (
                    <span className="absolute top-1.5 right-1.5 text-base drop-shadow">🏆</span>
                  )}
                </div>
                <div className="px-2 py-1.5 text-center">
                  <p className="text-xs font-bold text-garnet truncate">{p.name}</p>
                  <p className="text-[10px] text-muted-foreground truncate">
                    {[formatDate(p.date), p.score != null ? `${p.score} pts` : null]
                      .filter(Boolean)
                      .join(" · ")}
                  </p>
                </div>
              </div>
            </CarouselItem>
          ))}
        </CarouselContent>
      </Carousel>
    </div>
  );
}
