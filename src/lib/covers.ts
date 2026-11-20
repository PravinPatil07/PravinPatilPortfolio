import coverCv from "@/assets/cover-cv.jpg";
import coverData from "@/assets/cover-data.jpg";
import coverDl from "@/assets/cover-dl.jpg";
import coverIot from "@/assets/cover-iot.jpg";
import coverLlm from "@/assets/cover-llm.jpg";
import coverWeb from "@/assets/cover-web.jpg";

const KEYWORD_COVERS: { cover: string; keywords: string[] }[] = [
  {
    cover: coverLlm,
    keywords: [
      "llm",
      "gpt",
      "chat",
      "bot",
      "nlp",
      "text",
      "language",
      "rag",
      "sentiment",
      "summar",
      "translat",
      "speech",
      "voice",
      "agent",
      "gemini",
      "prompt",
    ],
  },
  {
    cover: coverCv,
    keywords: [
      "vision",
      "image",
      "img",
      "face",
      "detect",
      "yolo",
      "ocr",
      "opencv",
      "cnn",
      "segment",
      "camera",
      "digit",
      "mnist",
      "plant",
      "leaf",
      "mask",
      "emotion",
    ],
  },
  {
    cover: coverIot,
    keywords: ["iot", "arduino", "esp", "raspberry", "sensor", "robot", "embedded", "drone", "smart"],
  },
  {
    cover: coverData,
    keywords: [
      "data",
      "analys",
      "analyt",
      "eda",
      "dashboard",
      "power",
      "sql",
      "excel",
      "pandas",
      "visual",
      "report",
      "sales",
      "stock",
      "price",
      "predict",
      "forecast",
      "regression",
    ],
  },
  {
    cover: coverWeb,
    keywords: [
      "web",
      "site",
      "portfolio",
      "app",
      "react",
      "next",
      "html",
      "css",
      "js",
      "node",
      "api",
      "django",
      "flask",
      "ecom",
      "shop",
      "blog",
      "clone",
      "login",
      "crud",
    ],
  },
  {
    cover: coverDl,
    keywords: ["deep", "neural", "net", "ml", "ai", "model", "train", "tensor", "torch", "learn"],
  },
];

const TAG_COVERS: Record<string, string> = {
  llm: coverLlm,
  cv: coverCv,
  iot: coverIot,
  data: coverData,
  web: coverWeb,
  dl: coverDl,
  ml: coverDl,
  ai: coverDl,
  python: coverData,
};

/** Deterministic cover image chosen from the project name, topics and tags. */
export function coverFor({
  name,
  topics = [],
  tags = [],
  description,
}: {
  name: string;
  topics?: string[];
  tags?: string[];
  description?: string | null;
}) {
  const haystack = [name, description ?? "", ...topics, ...tags].join(" ").toLowerCase();

  for (const entry of KEYWORD_COVERS) {
    if (entry.keywords.some((k) => haystack.includes(k))) return entry.cover;
  }

  for (const tag of tags) {
    if (TAG_COVERS[tag]) return TAG_COVERS[tag];
  }

  const fallbacks = [coverDl, coverData, coverWeb, coverLlm, coverCv, coverIot];
  let hash = 0;
  for (let i = 0; i < name.length; i += 1) hash = (hash * 31 + name.charCodeAt(i)) % 9973;
  return fallbacks[hash % fallbacks.length];
}
