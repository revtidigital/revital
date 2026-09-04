import { useEffect, useState } from "react";
import type { InstagramPost } from "@/server/instagramFns";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  type CarouselApi,
} from "@/components/ui/carousel";

const AUTO_SLIDE_MS = 2800;

export function InstagramFeed() {
  const [connected, setConnected] = useState(false);
  const [posts, setPosts] = useState<InstagramPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [api, setApi] = useState<CarouselApi>();

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

  useEffect(() => {
    if (!api || posts.length <= 1) return;
    const timer = window.setInterval(() => {
      if (api.canScrollNext()) api.scrollNext();
      else api.scrollTo(0);
    }, AUTO_SLIDE_MS);
    return () => window.clearInterval(timer);
  }, [api, posts.length]);

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
    <Carousel
      setApi={setApi}
      opts={{ align: "start", loop: true }}
      className="mx-auto max-w-3xl"
    >
      <CarouselContent className="-ml-3">
        {posts.map((post) => (
          <CarouselItem key={post.id} className="basis-1/3 sm:basis-1/4 md:basis-1/5 pl-3">
            <a
              href={post.permalink}
              target="_blank"
              rel="noopener noreferrer"
              className="group relative block aspect-square overflow-hidden rounded-2xl border-2 border-[var(--garnet)]/10 shadow-card"
            >
              <img
                src={post.mediaType === "VIDEO" ? post.thumbnailUrl : post.mediaUrl}
                alt={post.caption?.slice(0, 80) ?? "Instagram post"}
                loading="lazy"
                className="w-full h-full object-cover group-hover:scale-105 transition-transform"
              />
              {(post.mediaType === "VIDEO" || post.mediaType === "CAROUSEL_ALBUM") && (
                <span className="absolute top-1.5 right-1.5 text-white drop-shadow text-sm">
                  {post.mediaType === "VIDEO" ? "▶" : "⧉"}
                </span>
              )}
            </a>
          </CarouselItem>
        ))}
      </CarouselContent>
    </Carousel>
  );
}
