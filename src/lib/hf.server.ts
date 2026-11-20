import type { HfCollection, HfData, HfItem } from "./types";

const HF = "https://huggingface.co/api";
const cache = new Map<string, { at: number; value: unknown }>();
const TTL = 1000 * 60 * 10;

async function hf<T>(path: string): Promise<T | null> {
  const hit = cache.get(path);
  if (hit && Date.now() - hit.at < TTL) return hit.value as T;
  const res = await fetch(`${HF}${path}`, { headers: { "User-Agent": "pravin-portfolio" } });
  if (!res.ok) return hit ? (hit.value as T) : null;
  const value = (await res.json()) as T;
  cache.set(path, { at: Date.now(), value });
  return value;
}

type RawItem = {
  id: string;
  likes?: number;
  downloads?: number;
  sdk?: string;
  private?: boolean;
  tags?: string[];
  pipeline_tag?: string;
  library_name?: string;
  lastModified?: string;
  createdAt?: string;
  cardData?: { short_description?: string; title?: string; license?: string };
};

type RawOverview = {
  user?: string;
  fullname?: string;
  avatarUrl?: string;
  numModels?: number;
  numSpaces?: number;
  numDatasets?: number;
  numLikes?: number;
  numFollowers?: number;
};

const FRAMEWORK_TAGS = [
  "pytorch",
  "tensorflow",
  "keras",
  "transformers",
  "diffusers",
  "sentence-transformers",
  "sklearn",
  "onnx",
  "gradio",
  "streamlit",
  "docker",
];

function prettify(name: string) {
  return name
    .replace(/[-_]+/g, " ")
    .replace(/\s+/g, " ")
    .trim()
    .replace(/\b\w/g, (c) => c.toUpperCase());
}

function mapItem(raw: RawItem, kind: HfItem["kind"], owner: string): HfItem {
  const name = raw.id.split("/")[1] ?? raw.id;
  const tags = (raw.tags ?? []).filter((t) => !t.includes(":"));
  const framework = tags.find((t) => FRAMEWORK_TAGS.includes(t.toLowerCase())) ?? raw.library_name ?? raw.sdk ?? null;
  const base =
    kind === "model"
      ? `https://huggingface.co/${raw.id}`
      : `https://huggingface.co/${kind}s/${raw.id}`;
  return {
    id: raw.id,
    name: prettify(name),
    kind,
    url: base,
    likes: raw.likes ?? 0,
    downloads: raw.downloads ?? 0,
    task: raw.pipeline_tag ?? null,
    framework,
    sdk: raw.sdk ?? null,
    private: Boolean(raw.private),
    updatedAt: raw.lastModified ?? null,
    createdAt: raw.createdAt ?? null,
    tags,
    description: raw.cardData?.short_description ?? null,
    runtimeUrl:
      kind === "space"
        ? `https://${owner.toLowerCase()}-${name.toLowerCase().replace(/[^a-z0-9-]/g, "-")}.hf.space`
        : null,
  };
}

export async function fetchHfData(user: string): Promise<HfData> {
  const [overview, models, spaces, datasets, collections] = await Promise.all([
    hf<RawOverview>(`/users/${user}/overview`),
    hf<RawItem[]>(`/models?author=${user}&full=true&limit=100`),
    hf<RawItem[]>(`/spaces?author=${user}&full=true&limit=100`),
    hf<RawItem[]>(`/datasets?author=${user}&full=true&limit=100`),
    hf<{ title: string; slug: string; items?: unknown[] }[]>(`/collections?owner=${user}&limit=50`),
  ]);

  const items: HfItem[] = [
    ...(models ?? []).map((m) => mapItem(m, "model", user)),
    ...(spaces ?? []).map((s) => mapItem(s, "space", user)),
    ...(datasets ?? []).map((d) => mapItem(d, "dataset", user)),
  ].sort((a, b) => (b.updatedAt ?? "").localeCompare(a.updatedAt ?? ""));

  const cols: HfCollection[] = (collections ?? []).map((c) => ({
    title: c.title,
    slug: c.slug,
    url: `https://huggingface.co/collections/${c.slug}`,
    itemCount: c.items?.length ?? 0,
  }));

  return {
    user: {
      name: overview?.user ?? user,
      fullname: overview?.fullname ?? user,
      avatarUrl: overview?.avatarUrl?.startsWith("http")
        ? overview.avatarUrl
        : `https://huggingface.co${overview?.avatarUrl ?? ""}`,
      url: `https://huggingface.co/${user}`,
      followers: overview?.numFollowers ?? 0,
      numModels: overview?.numModels ?? (models?.length ?? 0),
      numSpaces: overview?.numSpaces ?? (spaces?.length ?? 0),
      numDatasets: overview?.numDatasets ?? (datasets?.length ?? 0),
      likes: overview?.numLikes ?? 0,
    },
    items,
    collections: cols,
    totals: {
      downloads: items.reduce((s, i) => s + i.downloads, 0),
      likes: items.reduce((s, i) => s + i.likes, 0),
    },
  };
}
