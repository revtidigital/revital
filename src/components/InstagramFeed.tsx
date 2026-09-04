import { useEffect, useState } from "react";
import type { InstagramPost } from "@/server/instagramFns";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";

export function InstagramFeed() {
  const [connected, setConnected] = useState(false);
  const [posts, setPosts] = useState<InstagramPost[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    import("@/server/instagramFns")
      .then((mod) => mod.getInstagramFeedFn())
      .then((result) => {
        setConnected(result.connected);
        setPosts(result.posts);
      })
      .catch(() => setConnected(false))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return <div className="text-center text-sm text-muted-foreground">Loading feed…</div>;
  }

  if (!connected || posts.length === 0) {
    return (
      <div className="text-center">
        <p className="text-sm text-muted-foreground mb-4">
          Real Instagram feed not connected yet — showing follow button for now.
        </p>
        <a
          href="https://www.instagram.com/revital.uae"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-[var(--garnet)] text-white font-bold hover:scale-105 active:scale-95 transition-transform shadow-button"
        >
          Follow @revital.uae on Instagram →
        </a>
      </div>
    );
  }

  return (
    <Carousel opts={{ align: "start", loop: posts.length > 1 }} className="w-full">
      <CarouselContent className="-ml-5">
        {posts.map((post) => (
          <CarouselItem key={post.id} className="pl-5 basis-1/2 sm:basis-1/3 md:basis-1/4 lg:basis-1/5">
            <a
              href={post.permalink}
              target="_blank"
              rel="noopener noreferrer"
              className="group relative block bg-white/90 border-2 border-[var(--garnet)]/10 rounded-2xl overflow-hidden shadow-card"
            >
              <div className="relative w-full aspect-square bg-black/5 flex items-center justify-center">
                <img
                  src={post.mediaType === "VIDEO" ? post.thumbnailUrl : post.mediaUrl}
                  alt={post.caption?.slice(0, 80) ?? "Instagram post"}
                  loading="lazy"
                  className="w-full h-full object-contain group-hover:scale-[1.03] transition-transform"
                />
                {(post.mediaType === "VIDEO" || post.mediaType === "CAROUSEL_ALBUM") && (
                  <span className="absolute top-2 right-2 text-white drop-shadow text-base">
                    {post.mediaType === "VIDEO" ? "▶" : "⧉"}
                  </span>
                )}
              </div>
            </a>
          </CarouselItem>
        ))}
      </CarouselContent>
      {posts.length > 1 && (
        <>
          <CarouselPrevious className="-left-3 sm:-left-10" />
          <CarouselNext className="-right-3 sm:-right-10" />
        </>
      )}
    </Carousel>
  );
}
