export type WPPost = {
  id: number;
  date: string;
  link: string;
  title: { rendered: string };
  excerpt: { rendered: string };
  _embedded?: {
    ['wp:featuredmedia']?: Array<{ source_url?: string }>;
  };
};

const BLOG_BASE = 'https://onakin-blog.com';


export async function fetchLatestPosts(limit = 10): Promise<WPPost[]> {
  const url = `${BLOG_BASE}/wp-json/wp/v2/posts?_embed&per_page=${limit}`;
  const res = await fetch(url, { headers: { Accept: 'application/json' } });
  if (!res.ok) throw new Error(`WP fetch failed: ${res.status}`);
  return (await res.json()) as WPPost[];
}

export function featuredImage(post: WPPost): string | null {
  return post._embedded?.['wp:featuredmedia']?.[0]?.source_url ?? null;
}

/** HTML除去＋短縮 */
export function stripAndTrim(html: string, max = 90) {
  const text = html.replace(/<[^>]*>/g, '').replace(/\s+/g, ' ').trim();
  return text.length > max ? text.slice(0, max) + '…' : text;
}
