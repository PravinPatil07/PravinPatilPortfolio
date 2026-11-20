export type Repo = {
  id: number;
  name: string;
  description: string | null;
  html_url: string;
  homepage: string | null;
  language: string | null;
  languages: string[];
  topics: string[];
  stars: number;
  forks: number;
  watchers: number;
  size: number;
  open_issues: number;
  license: string | null;
  created_at: string;
  updated_at: string;
  pushed_at: string;
  archived: boolean;
  fork: boolean;
  default_branch: string;
  score: number;
  featured: boolean;
  tags: string[];
  lastCommit: { message: string; date: string; url: string } | null;
};

export type GithubProfile = {
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

export type LanguageStat = { name: string; count: number; bytes: number; percent: number };

export type ActivityItem = {
  id: string;
  type: string;
  repo: string;
  repoUrl: string;
  detail: string;
  createdAt: string;
};

export type GithubData = {
  profile: GithubProfile;
  repos: Repo[];
  languages: LanguageStat[];
  activity: ActivityItem[];
  totals: { stars: number; forks: number; repos: number };
};

export type ContributionDay = { date: string; count: number; level: number };

export type ContributionData = {
  total: number;
  days: ContributionDay[];
  weeks: ContributionDay[][];
  longestStreak: number;
  currentStreak: number;
  bestDay: ContributionDay | null;
};

export type RepoDetail = {
  readme: string | null;
  contributors: { login: string; avatar_url: string; html_url: string; contributions: number }[];
  releases: { name: string; tag: string; url: string; published_at: string }[];
  languages: LanguageStat[];
};

export type HfItem = {
  id: string;
  name: string;
  kind: "model" | "space" | "dataset";
  url: string;
  likes: number;
  downloads: number;
  task: string | null;
  framework: string | null;
  sdk: string | null;
  private: boolean;
  updatedAt: string | null;
  createdAt: string | null;
  tags: string[];
  description: string | null;
  runtimeUrl: string | null;
};

export type HfCollection = { title: string; slug: string; url: string; itemCount: number };

export type HfData = {
  user: {
    name: string;
    fullname: string;
    avatarUrl: string;
    url: string;
    followers: number;
    numModels: number;
    numSpaces: number;
    numDatasets: number;
    likes: number;
  };
  items: HfItem[];
  collections: HfCollection[];
  totals: { downloads: number; likes: number };
};
