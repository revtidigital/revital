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
    <div className="grid gap-5 sm:grid-cols-2 md:grid-cols-3">
      {posts.map((post) => (
        <a
          key={post.id}
          href={post.permalink}
          target="_blank"
          rel="noopener noreferrer"
          className="group relative block overflow-hidden rounded-2xl border-2 border-[var(--garnet)]/10 shadow-card"
        >
          <img
            src={post.mediaType === "VIDEO" ? post.thumbnailUrl : post.mediaUrl}
            alt={post.caption?.slice(0, 80) ?? "Instagram post"}
            loading="lazy"
            className="w-full aspect-square object-cover group-hover:scale-105 transition-transform"
          />
          {post.caption && (
            <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/70 to-transparent p-3">
              <p className="text-white text-xs line-clamp-2">{post.caption}</p>
            </div>
          )}
        </a>
      ))}
    </div>
  );
}
