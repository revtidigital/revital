import { useEffect, useState } from "react";
import type { InstagramPost } from "@/server/instagramFns";
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from "@/components/ui/carousel";

function PostMedia({ post }: { post: InstagramPost }) {
  const [childIndex, setChildIndex] = useState(0);
  const slides =
    post.children && post.children.length > 0
      ? post.children
      : [{ id: post.id, mediaUrl: post.mediaUrl, mediaType: post.mediaType as "IMAGE" | "VIDEO", thumbnailUrl: post.thumbnailUrl }];
  const active = slides[childIndex] ?? slides[0];
  const hasMultiple = slides.length > 1;

  return (
    <div className="relative w-full aspect-square bg-black/5 flex items-center justify-center">
      {active.mediaType === "VIDEO" ? (
        <video
          key={active.id}
          src={active.mediaUrl}
          poster={active.thumbnailUrl}
          controls
          playsInline
          className="w-full h-full object-contain"
        />
      ) : (
        <img
          src={active.mediaUrl}
          alt={post.caption?.slice(0, 80) ?? "Instagram post"}
          loading="lazy"
          className="w-full h-full object-contain"
        />
      )}
      {hasMultiple && (
        <>
          <button
            type="button"
            aria-label="Previous photo"
            onClick={() => setChildIndex((i) => (i - 1 + slides.length) % slides.length)}
            className="absolute left-2 top-1/2 -translate-y-1/2 h-8 w-8 rounded-full bg-black/45 text-white flex items-center justify-center text-sm hover:bg-black/60"
          >
            ‹
          </button>
          <button
            type="button"
            aria-label="Next photo"
            onClick={() => setChildIndex((i) => (i + 1) % slides.length)}
            className="absolute right-2 top-1/2 -translate-y-1/2 h-8 w-8 rounded-full bg-black/45 text-white flex items-center justify-center text-sm hover:bg-black/60"
          >
            ›
          </button>
          <div className="absolute bottom-2 inset-x-0 flex justify-center gap-1.5">
            {slides.map((s, i) => (
              <span
                key={s.id}
                className={`h-1.5 w-1.5 rounded-full ${i === childIndex ? "bg-white" : "bg-white/40"}`}
              />
            ))}
          </div>
        </>
      )}
    </div>
  );
}

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
    <Carousel opts={{ align: "start", loop: posts.length > 1 }} className="mx-auto max-w-md">
      <CarouselContent>
        {posts.map((post) => (
          <CarouselItem key={post.id}>
            <div className="rounded-2xl border-2 border-[var(--garnet)]/10 shadow-card overflow-hidden bg-black/5">
              <PostMedia post={post} />
              {post.caption && (
                <p className="px-4 py-3 text-sm text-foreground/80 line-clamp-3 bg-white/90">
                  {post.caption}
                </p>
              )}
              <a
                href={post.permalink}
                target="_blank"
                rel="noopener noreferrer"
                className="block px-4 py-2.5 text-center text-xs font-bold text-garnet bg-[var(--marigold)]/25 hover:bg-[var(--marigold)]/40 transition-colors"
              >
                View on Instagram →
              </a>
            </div>
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
