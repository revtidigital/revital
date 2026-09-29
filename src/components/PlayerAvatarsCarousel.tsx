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
  avatarUrl?: string;
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
    let cancelled = false;
    const fetchPlayers = () => {
      import("@/server/userFns")
        .then((mod) => mod.getRecentPlayerAvatarsFn())
        .then((data) => {
          if (!cancelled) setPlayers(data);
        })
        .catch(() => {
          if (!cancelled) setPlayers((prev) => prev);
        });
    };
    fetchPlayers();
    // Poll so an admin toggling a winner's photo visibility shows up here
    // without the visitor needing to refresh the page.
    const interval = setInterval(fetchPlayers, 10000);
    return () => {
      cancelled = true;
      clearInterval(interval);
    };
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
        className="mx-auto max-w-4xl"
      >
        <CarouselContent className="-ml-2">
          {players.map((p) => (
            <CarouselItem key={p.userId} className="basis-1/3 sm:basis-1/4 md:basis-1/6 pl-2">
              <div className="group relative block bg-white/90 rounded-lg overflow-hidden shadow-[0_12px_36px_-12px_oklch(0.36_0.12_30_/_0.25)]">
                <div
                  className="relative w-full aspect-square bg-gradient-energy overflow-hidden flex items-end justify-center"
                  style={{ containerType: "inline-size" }}
                >
                  {p.avatarUrl ? (
                    <img
                      src={p.avatarUrl}
                      alt={p.name}
                      className="absolute inset-0 w-full h-full object-cover group-hover:scale-[1.05] transition-transform"
                    />
                  ) : (
                    <span
                      className="leading-none drop-shadow-sm origin-bottom scale-x-[1.4] scale-y-[1.3] group-hover:scale-x-[1.48] group-hover:scale-y-[1.35] transition-transform"
                      style={{ fontSize: "clamp(2.25rem, 62cqw, 6.5rem)" }}
                    >
                      👤
                    </span>
                  )}
                </div>
                <div className="px-2 pt-2 pb-1.5 text-center bg-white/95">
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
