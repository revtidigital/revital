import { createServerFn } from "@tanstack/react-start";

export interface InstagramChildMedia {
  id: string;
  mediaUrl: string;
  mediaType: "IMAGE" | "VIDEO";
  thumbnailUrl?: string;
}

export interface InstagramPost {
  id: string;
  caption?: string;
  mediaUrl: string;
  permalink: string;
  mediaType: "IMAGE" | "VIDEO" | "CAROUSEL_ALBUM";
  thumbnailUrl?: string;
  children?: InstagramChildMedia[]; // all photos/videos inside a multi-photo (carousel album) post
}

interface RawMediaNode {
  id: string;
  caption?: string;
  media_url: string;
  permalink: string;
  media_type: "IMAGE" | "VIDEO" | "CAROUSEL_ALBUM";
  thumbnail_url?: string;
}

async function fetchCarouselChildren(
  postId: string,
  token: string,
): Promise<InstagramChildMedia[]> {
  try {
    const url = `https://graph.instagram.com/${postId}/children?fields=id,media_type,media_url,thumbnail_url&access_token=${token}`;
    const res = await fetch(url);
    if (!res.ok) return [];
    const json = (await res.json()) as {
      data?: Array<{
        id: string;
        media_type: "IMAGE" | "VIDEO";
        media_url: string;
        thumbnail_url?: string;
      }>;
    };
    return (json.data ?? []).map((c) => ({
      id: c.id,
      mediaUrl: c.media_url,
      mediaType: c.media_type,
      thumbnailUrl: c.thumbnail_url,
    }));
  } catch {
    return [];
  }
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
      const url = `https://graph.instagram.com/${accountId}/media?fields=${fields}&limit=8&access_token=${token}`;
      const res = await fetch(url);
      if (!res.ok) return { connected: false, posts: [] };
      const json = (await res.json()) as { data?: RawMediaNode[] };

      const posts: InstagramPost[] = await Promise.all(
        (json.data ?? []).map(async (p) => ({
          id: p.id,
          caption: p.caption,
          mediaUrl: p.media_url,
          permalink: p.permalink,
          mediaType: p.media_type,
          thumbnailUrl: p.thumbnail_url,
          children:
            p.media_type === "CAROUSEL_ALBUM" ? await fetchCarouselChildren(p.id, token) : undefined,
        })),
      );
      return { connected: true, posts };
    } catch {
      return { connected: false, posts: [] };
    }
  },
);
