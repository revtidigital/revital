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
        className="mx-auto max-w-4xl px-8 sm:px-10"
      >
        <CarouselContent className="-ml-2 sm:-ml-3">
          {players.map((p) => (
            <CarouselItem key={p.userId} className="basis-1/3 sm:basis-1/4 md:basis-1/6 pl-2 sm:pl-3">
              <div className="group relative block bg-white/90 rounded-lg overflow-hidden shadow-[0_12px_36px_-12px_oklch(0.36_0.12_30_/_0.25)]">
                <div className="relative w-full aspect-[4/3] bg-gradient-energy flex items-center justify-center">
                  <span className="text-4xl sm:text-5xl md:text-6xl leading-none drop-shadow-sm group-hover:scale-[1.05] transition-transform">
                    👤
                  </span>
                </div>
                <div className="px-1.5 sm:px-2 pt-2 pb-1.5 sm:pt-2.5 sm:pb-2 text-center bg-white/95">
                  <p className="text-xs sm:text-sm font-bold text-garnet truncate">{p.name}</p>
                  <p className="text-[10px] sm:text-xs text-muted-foreground truncate">
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
            <CarouselPrevious className="-left-1 sm:-left-8 h-6 w-6 sm:h-8 sm:w-8" />
            <CarouselNext className="-right-1 sm:-right-8 h-6 w-6 sm:h-8 sm:w-8" />
          </>
        )}
      </Carousel>
    </div>
  );
}
