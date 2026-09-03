import { useEffect } from "react";

// Add permalink URLs of the Instagram posts you want to feature here.
// Get them from the post's "Copy link" option on instagram.com/revital.uae
const INSTAGRAM_POST_URLS: string[] = [
  // "https://www.instagram.com/p/XXXXXXXXXXX/",
];

declare global {
  interface Window {
    instgrm?: {
      Embeds: { process: () => void };
    };
  }
}

export function InstagramFeed() {
  useEffect(() => {
    if (INSTAGRAM_POST_URLS.length === 0) return;

    const existing = document.getElementById("instagram-embed-script");
    if (existing) {
      window.instgrm?.Embeds.process();
      return;
    }

    const script = document.createElement("script");
    script.id = "instagram-embed-script";
    script.src = "https://www.instagram.com/embed.js";
    script.async = true;
    script.onload = () => window.instgrm?.Embeds.process();
    document.body.appendChild(script);
  }, []);

  if (INSTAGRAM_POST_URLS.length === 0) {
    return (
      <div className="text-center">
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
      {INSTAGRAM_POST_URLS.map((url) => (
        <blockquote
          key={url}
          className="instagram-media"
          data-instgrm-permalink={url}
          data-instgrm-version="14"
          style={{ margin: 0 }}
        />
      ))}
    </div>
  );
}
