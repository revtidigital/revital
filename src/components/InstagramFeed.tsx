import { useEffect, useState } from "react";
import type { InstagramPost } from "@/server/instagramFns";

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
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 w-full">
      {posts.slice(0, 12).map((post) => (
        <a
          key={post.id}
          href={post.permalink}
          target="_blank"
          rel="noopener noreferrer"
          className="group relative block bg-white/90 rounded-2xl overflow-hidden shadow-[0_12px_36px_-12px_oklch(0.36_0.12_30_/_0.25)]"
        >
          <div className="relative w-full aspect-[4/5] bg-black/5 flex items-center justify-center">
            <img
              src={post.mediaType === "VIDEO" ? post.thumbnailUrl : post.mediaUrl}
              alt={post.caption?.slice(0, 80) ?? "Instagram post"}
              loading="lazy"
              className="w-full h-full object-cover group-hover:scale-[1.03] transition-transform"
            />
            {(post.mediaType === "VIDEO" || post.mediaType === "CAROUSEL_ALBUM") && (
              <span className="absolute top-2 right-2 text-white drop-shadow text-base">
                {post.mediaType === "VIDEO" ? "▶" : "⧉"}
              </span>
            )}
          </div>
        </a>
      ))}
    </div>
  );
}
