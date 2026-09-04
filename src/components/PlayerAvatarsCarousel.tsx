import { useEffect, useRef, useState } from "react";
import Autoplay from "embla-carousel-autoplay";
import { GenericAvatar } from "@/components/GenericAvatar";
import { Carousel, CarouselContent, CarouselItem } from "@/components/ui/carousel";

interface PlayerAvatar {
  userId: string;
  name: string;
  avatarUrl?: string;
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
        <CarouselContent className="-ml-5">
          {players.map((p) => (
            <CarouselItem key={p.userId} className="basis-1/3 pl-5">
              <div className="group relative block bg-white/90 rounded-2xl overflow-hidden shadow-[0_12px_36px_-12px_oklch(0.36_0.12_30_/_0.25)]">
                <div className="relative w-full aspect-square bg-black/5 flex items-center justify-center">
                  {p.avatarUrl ? (
                    <img
                      src={p.avatarUrl}
                      alt={p.name}
                      loading="lazy"
                      className="w-full h-full object-cover group-hover:scale-[1.03] transition-transform"
                    />
                  ) : (
                    <GenericAvatar className="w-full h-full" />
                  )}
                </div>
                <p className="px-3 py-2.5 text-sm font-bold text-garnet text-center truncate">
                  {p.name}
                </p>
              </div>
            </CarouselItem>
          ))}
        </CarouselContent>
      </Carousel>
    </div>
  );
}
