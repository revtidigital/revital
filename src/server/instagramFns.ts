import { createServerFn } from "@tanstack/react-start";

export interface InstagramPost {
  id: string;
  caption?: string;
  mediaUrl: string;
  permalink: string;
  mediaType: "IMAGE" | "VIDEO" | "CAROUSEL_ALBUM";
  thumbnailUrl?: string;
}

// Set INSTAGRAM_ACCESS_TOKEN (long-lived Graph API token) and
// INSTAGRAM_BUSINESS_ACCOUNT_ID as env vars to enable the real feed.
export const getInstagramFeedFn = createServerFn({ method: "GET" }).handler(
  async (): Promise<{ connected: boolean; posts: InstagramPost[] }> => {
    const token = process.env.INSTAGRAM_ACCESS_TOKEN;
    const accountId = process.env.INSTAGRAM_BUSINESS_ACCOUNT_ID;

    if (!token || !accountId) {
      return { connected: false, posts: [] };
    }

    try {
      const fields = "id,caption,media_url,permalink,media_type,thumbnail_url";
      const url = `https://graph.instagram.com/${accountId}/media?fields=${fields}&limit=6&access_token=${token}`;
      const res = await fetch(url);
      if (!res.ok) return { connected: false, posts: [] };
      const json = (await res.json()) as {
        data?: Array<{
          id: string;
          caption?: string;
          media_url: string;
          permalink: string;
          media_type: "IMAGE" | "VIDEO" | "CAROUSEL_ALBUM";
          thumbnail_url?: string;
        }>;
      };
      const posts: InstagramPost[] = (json.data ?? []).map((p) => ({
        id: p.id,
        caption: p.caption,
        mediaUrl: p.media_url,
        permalink: p.permalink,
        mediaType: p.media_type,
        thumbnailUrl: p.thumbnail_url,
      }));
      return { connected: true, posts };
    } catch {
      return { connected: false, posts: [] };
    }
  },
);
