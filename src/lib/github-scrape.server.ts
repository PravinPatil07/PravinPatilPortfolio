/**
 * Fallback GitHub source: parses the public profile pages.
 * Used when the REST API returns 403 (unauthenticated rate limit is 60/hour
 * per IP and is shared, so it is frequently exhausted).
 */

const UA =
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124 Safari/537.36";

export type ScrapedProfile = {
  login: string;
  name: string | null;
  bio: string | null;
  avatar_url: string;
  html_url: string;
  followers: number;
  following: number;
  public_repos: number;
  created_at: string;
};

export type ScrapedRepo = {
  id: number;
  name: string;
  description: string | null;
  html_url: string;
  homepage: string | null;
  language: string | null;
  topics: string[];
  stargazers_count: number;
  forks_count: number;
  watchers_count: number;
  size: number;
  open_issues_count: number;
  license: null;
  created_at: string;
  updated_at: string;
  pushed_at: string;
  archived: boolean;
  fork: boolean;
  default_branch: string;
  languages_url: string;
};

function decode(input: string): string {
  return input
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&nbsp;/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

async function getHtml(url: string): Promise<string | null> {
  const res = await fetch(url, { headers: { "User-Agent": UA, Accept: "text/html" } }).catch(
    () => null,
  );
  if (!res || !res.ok) return null;
  return res.text();
}

function hashId(value: string): number {
  let h = 2166136261;
  for (let i = 0; i < value.length; i++) {
    h ^= value.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return Math.abs(h);
}

export async function scrapeGithubProfile(user: string): Promise<ScrapedProfile | null> {
  const html = await getHtml(`https://github.com/${user}`);
  if (!html) return null;

  const name = /class="[^"]*p-name[^"]*"[^>]*>\s*([^<]*)/.exec(html)?.[1];
  const bio = /class="[^"]*p-note[^"]*"[^>]*>\s*<div>\s*([^<]*)/.exec(html)?.[1];
  const avatarId = /avatars\.githubusercontent\.com\/u\/(\d+)/.exec(html)?.[1];
  const followers = /tab=followers"[^>]*>\s*<span[^>]*>\s*([\d,.]+k?)\s*</i.exec(html)?.[1];
  const following = /tab=following"[^>]*>\s*<span[^>]*>\s*([\d,.]+k?)\s*</i.exec(html)?.[1];
  const repoCount = /Repositories\s*<span[^>]*>\s*([\d,]+)/i.exec(html)?.[1];

  const toNum = (raw?: string) => {
    if (!raw) return 0;
    const cleaned = raw.replace(/,/g, "");
    return cleaned.endsWith("k")
      ? Math.round(parseFloat(cleaned) * 1000)
      : (parseInt(cleaned, 10) || 0);
  };

  return {
    login: user,
    name: name ? decode(name) : null,
    bio: bio ? decode(bio) : null,
    avatar_url: avatarId
      ? `https://avatars.githubusercontent.com/u/${avatarId}?v=4`
      : `https://github.com/${user}.png`,
    html_url: `https://github.com/${user}`,
    followers: toNum(followers),
    following: toNum(following),
    public_repos: toNum(repoCount),
    created_at: new Date(0).toISOString(),
  };
}

export async function scrapeGithubRepos(user: string): Promise<ScrapedRepo[]> {
  const repos: ScrapedRepo[] = [];

  for (let page = 1; page <= 3; page++) {
    const html = await getHtml(
      `https://github.com/${user}?tab=repositories&per_page=100&page=${page}`,
    );
    if (!html) break;

    const cards = html.split('<li class="col-12 d-flex flex-justify-between width-full').slice(1);
    if (!cards.length) break;

    for (const card of cards) {
      const nameMatch = new RegExp(`href="/${user}/([^"]+)" itemprop="name codeRepository"`).exec(
        card,
      );
      const name = nameMatch?.[1];
      if (!name) continue;

      const description = /itemprop="description"[^>]*>\s*([\s\S]*?)<\/p>/.exec(card)?.[1];
      const language = /itemprop="programmingLanguage"[^>]*>\s*([^<]+)/.exec(card)?.[1];
      const pushed = /<relative-time datetime="([^"]+)"/.exec(card)?.[1];
      const stars = /aria-label="[^"]*stargazers"[^>]*>\s*([\d,]+)/.exec(card)?.[1];
      const topics = [...card.matchAll(/topic-tag[^>]*>\s*([^<]+)/g)].map((m) =>
        decode(m[1] ?? ""),
      );
      const isFork = /\bfork\b/.test(card.slice(0, 200));
      const pushedAt = pushed ?? new Date().toISOString();

      repos.push({
        id: hashId(`${user}/${name}`),
        name,
        description: description ? decode(description) : null,
        html_url: `https://github.com/${user}/${name}`,
        homepage: null,
        language: language ? decode(language) : null,
        topics: topics.filter(Boolean),
        stargazers_count: stars ? parseInt(stars.replace(/,/g, ""), 10) || 0 : 0,
        forks_count: 0,
        watchers_count: 0,
        size: 0,
        open_issues_count: 0,
        license: null,
        created_at: pushedAt,
        updated_at: pushedAt,
        pushed_at: pushedAt,
        archived: false,
        fork: isFork,
        default_branch: "main",
        languages_url: "",
      });
    }

    if (cards.length < 30) break;
  }

  const seen = new Set<string>();
  return repos.filter((r) => (seen.has(r.name) ? false : (seen.add(r.name), true)));
}
