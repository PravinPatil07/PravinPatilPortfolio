import { PROJECT_TAGS } from "./profile";
import type {
  ActivityItem,
  ContributionData,
  ContributionDay,
  GithubData,
  LanguageStat,
  Repo,
  RepoDetail,
} from "./types";

const API = "https://api.github.com";

const cache = new Map<string, { at: number; value: unknown }>();
const TTL = 1000 * 60 * 10;

async function gh<T>(path: string, ttl = TTL): Promise<T | null> {
  const hit = cache.get(path);
  if (hit && Date.now() - hit.at < ttl) return hit.value as T;

  const headers: Record<string, string> = {
    Accept: "application/vnd.github+json",
    "User-Agent": "pravin-portfolio",
  };
  const token = process.env["GITHUB_TOKEN"];
  if (token) headers['Authorization'] = `Bearer ${token}`;

  const res = await fetch(`${API}${path}`, { headers }).catch(() => null);
  if (!res || !res.ok) {
    if (hit) return hit.value as T;
    return null;
  }
  const value = (await res.json()) as T;
  cache.set(path, { at: Date.now(), value });
  return value;
}

function classify(repo: {
  name: string;
  description: string | null;
  topics: string[];
  languages: string[];
}): string[] {
  const haystack = [repo.name, repo.description ?? "", ...repo.topics, ...repo.languages]
    .join(" ")
    .toLowerCase();
  const tags = PROJECT_TAGS.filter((t) => t.match.some((m) => haystack.includes(m))).map(
    (t) => t.id,
  );
  return tags.length ? tags : ["web"];
}

function scoreRepo(r: {
  stars: number;
  forks: number;
  description: string | null;
  homepage: string | null;
  pushed_at: string;
  tags: string[];
  size: number;
}) {
  const recency = Math.max(
    0,
    120 - (Date.now() - new Date(r.pushed_at).getTime()) / (1000 * 60 * 60 * 24),
  );
  const aiBoost = r.tags.some((t) => ["ai", "ml", "dl", "llm", "cv"].includes(t)) ? 45 : 0;
  return (
    r.stars * 30 +
    r.forks * 20 +
    (r.description ? 18 : 0) +
    (r.homepage ? 30 : 0) +
    aiBoost +
    recency * 0.5 +
    Math.min(r.size / 500, 20)
  );
}

type RawProfile = {
  login: string;
  name: string | null;
  bio: string | null;
  avatar_url: string;
  html_url: string;
  blog: string | null;
  followers: number;
  following: number;
  public_repos: number;
  created_at: string;
};

type RawEvent = {
  id: string;
  type: string;
  created_at: string;
  repo?: { name?: string };
  payload?: { commits?: { message: string }[]; ref_type?: string; action?: string };
};

type RawRepo = {
  id: number;
  name: string;
  description: string | null;
  html_url: string;
  homepage: string | null;
  language: string | null;
  topics?: string[];
  stargazers_count: number;
  forks_count: number;
  watchers_count: number;
  size: number;
  open_issues_count: number;
  license: { spdx_id?: string; name?: string } | null;
  created_at: string;
  updated_at: string;
  pushed_at: string;
  archived: boolean;
  fork: boolean;
  default_branch: string;
  languages_url: string;
};

function emptyGithubData(user: string): GithubData {
  return {
    profile: {
      login: user,
      name: null,
      bio: null,
      avatar_url: `https://github.com/${user}.png`,
      html_url: `https://github.com/${user}`,
      blog: null,
      followers: 0,
      following: 0,
      public_repos: 0,
      created_at: new Date(0).toISOString(),
    },
    repos: [],
    languages: [],
    activity: [],
    totals: { stars: 0, forks: 0, repos: 0 },
  };
}

let lastGoodGithub: { user: string; value: GithubData } | null = null;

export async function fetchGithubData(user: string): Promise<GithubData> {
  const [apiProfile, apiRepos, apiEvents] = await Promise.all([
    gh<RawProfile>(`/users/${user}`),
    gh<RawRepo[]>(`/users/${user}/repos?per_page=100&sort=pushed`),
    gh<RawEvent[]>(`/users/${user}/events/public?per_page=30`),
  ]);

  let profile = apiProfile;
  let rawRepos = apiRepos;
  const events = apiEvents;

  if (!profile || !rawRepos) {
    // API rate-limited (unauthenticated limit is 60/hour, shared per IP):
    // fall back to parsing the public profile pages so data still shows.
    const fallbackKey = `scrape:${user}`;
    const cachedScrape = cache.get(fallbackKey);
    if (cachedScrape && Date.now() - cachedScrape.at < TTL) {
      const v = cachedScrape.value as { profile: RawProfile; repos: RawRepo[] };
      profile = profile ?? v.profile;
      rawRepos = rawRepos ?? v.repos;
    } else {
      const { scrapeGithubProfile, scrapeGithubRepos } = await import("./github-scrape.server");
      const [sp, sr] = await Promise.all([scrapeGithubProfile(user), scrapeGithubRepos(user)]);
      if (sp && sr.length) {
        const scraped = {
          profile: { ...sp, blog: null } as RawProfile,
          repos: sr as unknown as RawRepo[],
        };
        cache.set(fallbackKey, { at: Date.now(), value: scraped });
        profile = profile ?? scraped.profile;
        rawRepos = rawRepos ?? scraped.repos;
      }
    }
  }

  if (!profile || !rawRepos) {
    if (lastGoodGithub && lastGoodGithub.user === user) return lastGoodGithub.value;
    return emptyGithubData(user);
  }


  const langTotals = new Map<string, { bytes: number; count: number }>();

  const repos: Repo[] = await Promise.all(
    rawRepos
      .filter((r) => !r.fork)
      .map(async (r) => {
        // Skip per-repo language calls (30+ extra requests would exhaust the
        // unauthenticated rate limit); the primary language is enough.
        const languages = r.language ? [r.language] : [];
        if (r.language) {
          const prev = langTotals.get(r.language) ?? { bytes: 0, count: 0 };
          langTotals.set(r.language, { bytes: prev.bytes + r.size, count: prev.count + 1 });
        }
        const topics = r.topics ?? [];
        const base = {
          name: r.name,
          description: r.description,
          topics,
          languages: languages.length ? languages : r.language ? [r.language] : [],
        };
        const tags = classify(base);
        return {
          id: r.id,
          name: r.name,
          description: r.description,
          html_url: r.html_url,
          homepage: r.homepage && r.homepage.trim() ? r.homepage : null,
          language: r.language,
          languages: base.languages,
          topics,
          stars: r.stargazers_count,
          forks: r.forks_count,
          watchers: r.watchers_count,
          size: r.size,
          open_issues: r.open_issues_count,
          license: r.license?.spdx_id && r.license.spdx_id !== "NOASSERTION" ? r.license.spdx_id : null,
          created_at: r.created_at,
          updated_at: r.updated_at,
          pushed_at: r.pushed_at,
          archived: r.archived,
          fork: r.fork,
          default_branch: r.default_branch,
          tags,
          featured: false,
          lastCommit: null,
          score: 0,
        } satisfies Repo;
      }),
  );

  for (const r of repos) r.score = scoreRepo(r);
  repos.sort((a, b) => b.score - a.score);
  repos.slice(0, 6).forEach((r) => (r.featured = true));

  const totalBytes = [...langTotals.values()].reduce((s, v) => s + v.bytes, 0) || 1;
  const languages: LanguageStat[] = [...langTotals.entries()]
    .map(([name, v]) => ({
      name,
      bytes: v.bytes,
      count: v.count,
      percent: Math.round((v.bytes / totalBytes) * 1000) / 10,
    }))
    .sort((a, b) => b.bytes - a.bytes);

  const activity: ActivityItem[] = (events ?? []).slice(0, 15).map((e) => {
    const repoName = (e.repo?.name ?? "").split("/")[1] ?? "";
    const payload = e.payload ?? {};
    const type = e.type;
    const firstCommit = payload.commits?.[0];
    let detail = type.replace(/Event$/, "");
    if (type === "PushEvent")
      detail = `Pushed ${payload.commits?.length ?? 1} commit(s)${
        firstCommit ? ` — ${(firstCommit.message.split("\n")[0] ?? "").slice(0, 70)}` : ""
      }`;
    if (type === "CreateEvent") detail = `Created ${payload.ref_type ?? "repository"}`;
    if (type === "WatchEvent") detail = "Starred repository";
    if (type === "ReleaseEvent") detail = `Released ${payload.action ?? ""}`;
    return {
      id: e.id,
      type,
      repo: repoName,
      repoUrl: `https://github.com/${user}/${repoName}`,
      detail,
      createdAt: e.created_at,
    };
  });

  const data: GithubData = {
    profile: {
      login: profile.login,
      name: profile.name ?? null,
      bio: profile.bio ?? null,
      avatar_url: profile.avatar_url,
      html_url: profile.html_url,
      blog: profile.blog ?? null,
      followers: profile.followers ?? 0,
      following: profile.following ?? 0,
      public_repos: profile.public_repos ?? 0,
      created_at: profile.created_at,
    },
    repos,
    languages,
    activity,
    totals: {
      stars: repos.reduce((s, r) => s + r.stars, 0),
      forks: repos.reduce((s, r) => s + r.forks, 0),
      repos: repos.length,
    },
  };

  lastGoodGithub = { user, value: data };
  return data;
}

function emptyContributions(): ContributionData {
  return { total: 0, days: [], weeks: [], longestStreak: 0, currentStreak: 0, bestDay: null };
}

export async function fetchContributions(user: string): Promise<ContributionData> {
  const key = `contrib:${user}`;
  const hit = cache.get(key);
  if (hit && Date.now() - hit.at < TTL) return hit.value as ContributionData;

  const res = await fetch(`https://github-contributions-api.jogruber.de/v4/${user}?y=last`).catch(
    () => null,
  );
  if (!res || !res.ok) return (hit?.value as ContributionData | undefined) ?? emptyContributions();

  const json = (await res.json()) as {
    total: Record<string, number>;
    contributions: { date: string; count: number; level: number }[];
  };

  const days: ContributionDay[] = json.contributions;
  const weeks: ContributionDay[][] = [];
  let week: ContributionDay[] = [];
  const firstDow = new Date(days[0]?.date ?? Date.now()).getUTCDay();
  for (let i = 0; i < firstDow; i++) week.push({ date: "", count: -1, level: 0 });
  for (const d of days) {
    week.push(d);
    if (week.length === 7) {
      weeks.push(week);
      week = [];
    }
  }
  if (week.length) weeks.push(week);

  let longest = 0;
  let run = 0;
  for (const d of days) {
    if (d.count > 0) {
      run++;
      longest = Math.max(longest, run);
    } else run = 0;
  }
  let current = 0;
  for (let i = days.length - 1; i >= 0; i--) {
    if ((days[i]?.count ?? 0) > 0) current++;
    else break;
  }

  const value: ContributionData = {
    total: Object.values(json.total).reduce((s, v) => s + v, 0),
    days,
    weeks,
    longestStreak: longest,
    currentStreak: current,
    bestDay: days.reduce<ContributionDay | null>(
      (best, d) => (!best || d.count > best.count ? d : best),
      null,
    ),
  };
  cache.set(key, { at: Date.now(), value });
  return value;
}

export async function fetchRepoDetail(user: string, repo: string): Promise<RepoDetail> {
  const headers: Record<string, string> = {
    Accept: "application/vnd.github.raw",
    "User-Agent": "pravin-portfolio",
  };
  const token = process.env["GITHUB_TOKEN"];
  if (token) headers['Authorization'] = `Bearer ${token}`;

  const readmeKey = `readme:${user}/${repo}`;
  let readme: string | null = null;
  const hit = cache.get(readmeKey);
  if (hit && Date.now() - hit.at < TTL * 6) {
    readme = hit.value as string | null;
  } else {
    const res = await fetch(`${API}/repos/${user}/${repo}/readme`, { headers }).catch(() => null);
    readme = res && res.ok ? await res.text() : null;
    if (!readme) {
      // API rate-limited: raw.githubusercontent.com has no such limit.
      for (const branch of ["main", "master"]) {
        for (const file of ["README.md", "readme.md", "README.MD"]) {
          const raw = await fetch(
            `https://raw.githubusercontent.com/${user}/${repo}/${branch}/${file}`,
          ).catch(() => null);
          if (raw?.ok) {
            readme = await raw.text();
            break;
          }
        }
        if (readme) break;
      }
    }
    cache.set(readmeKey, { at: Date.now(), value: readme });
  }


  const [contributors, releases, langMap] = await Promise.all([
    gh<{ login: string; avatar_url: string; html_url: string; contributions: number }[]>(
      `/repos/${user}/${repo}/contributors?per_page=12`,
      TTL * 6,
    ),
    gh<{ name: string | null; tag_name: string; html_url: string; published_at: string }[]>(
      `/repos/${user}/${repo}/releases?per_page=5`,
      TTL * 6,
    ),
    gh<Record<string, number>>(`/repos/${user}/${repo}/languages`, TTL * 6),
  ]);

  const total = Object.values(langMap ?? {}).reduce((s, v) => s + v, 0) || 1;

  return {
    readme,
    contributors: contributors ?? [],
    releases: (releases ?? []).map((r) => ({
      name: r.name || r.tag_name,
      tag: r.tag_name,
      url: r.html_url,
      published_at: r.published_at,
    })),
    languages: Object.entries(langMap ?? {})
      .map(([name, bytes]) => ({
        name,
        bytes,
        count: 1,
        percent: Math.round((bytes / total) * 1000) / 10,
      }))
      .sort((a, b) => b.bytes - a.bytes),
  };
}
