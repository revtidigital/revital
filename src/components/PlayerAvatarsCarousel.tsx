import { useEffect, useRef, useState } from "react";
import Autoplay from "embla-carousel-autoplay";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";

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
    <div className="mt-14">
      <div className="text-center mb-6">
        <div className="inline-block px-4 py-1.5 rounded-full bg-[var(--marigold)] text-garnet text-xs uppercase tracking-[0.2em] font-black">
          🔥 Players Climbing the Leaderboard
        </div>
      </div>
      <Carousel
        opts={{ align: "start", loop: true }}
        plugins={[autoplay.current]}
        className="mx-auto max-w-xl"
      >
        <CarouselContent className="-ml-3">
          {players.map((p) => (
            <CarouselItem key={p.userId} className="basis-1/3 pl-3">
              <div className="group relative block bg-white/90 rounded-lg overflow-hidden shadow-[0_12px_36px_-12px_oklch(0.36_0.12_30_/_0.25)]">
                <div className="relative w-full aspect-[4/3] bg-black/5 flex items-center justify-center">
                  {p.avatarUrl ? (
                    <img
                      src={p.avatarUrl}
                      alt={p.name}
                      loading="lazy"
                      className="w-full h-full object-cover group-hover:scale-[1.03] transition-transform"
                    />
                  ) : (
                    <div className="w-full h-full bg-gradient-energy flex items-center justify-center">
                      <span className="text-lg leading-none">👤</span>
                    </div>
                  )}
                  {p.isWinner && (
                    <span className="absolute top-1 right-1 text-sm drop-shadow">🏆</span>
                  )}
                </div>
                <div className="px-2 pt-2.5 pb-2 text-center bg-white/95">
                  <p className="text-sm font-bold text-garnet truncate">{p.name}</p>
                  <p className="text-xs text-muted-foreground truncate">
                    {[formatDate(p.date), p.score != null ? `${p.score} pts` : null]
                      .filter(Boolean)
                      .join(" · ")}
                  </p>
                </div>
              </div>
            </CarouselItem>
          ))}
        </CarouselContent>
        {players.length > 1 && (
          <>
            <CarouselPrevious className="-left-3 sm:-left-8 h-7 w-7 sm:h-8 sm:w-8" />
            <CarouselNext className="-right-3 sm:-right-8 h-7 w-7 sm:h-8 sm:w-8" />
          </>
        )}
      </Carousel>
    </div>
  );
}
