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
    <div className="mt-6">
      <p className="text-center text-xs uppercase tracking-[0.2em] font-black text-muted-foreground mb-3">
        Players Climbing the Leaderboard
      </p>
      <Carousel
        opts={{ align: "start", loop: true }}
        plugins={[autoplay.current]}
        className="mx-auto max-w-2xl"
      >
        <CarouselContent className="-ml-3">
          {players.map((p) => (
            <CarouselItem key={p.userId} className="basis-1/3 pl-3">
              <div className="flex flex-col items-center gap-1.5">
                <div className="h-14 w-14 rounded-full overflow-hidden border-2 border-[var(--garnet)]/15 bg-background/40 shrink-0">
                  {p.avatarUrl ? (
                    <img
                      src={p.avatarUrl}
                      alt={p.name}
                      loading="lazy"
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <GenericAvatar className="h-full w-full" />
                  )}
                </div>
                <p className="text-[10px] text-muted-foreground truncate w-full text-center">
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
