import { Reveal, Section } from "@/components/site/Section";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { HfData, HfItem } from "@/lib/types";
import { Boxes, Download, ExternalLink, Heart, Layers, Rocket, Terminal } from "lucide-react";
import { useMemo, useState } from "react";
import { SiHuggingface } from "react-icons/si";

const KIND_META: Record<HfItem["kind"], { label: string; icon: typeof Rocket; style: string }> = {
  model: { label: "Model", icon: Boxes, style: "bg-primary/15 text-primary border-primary/30" },
  space: { label: "Space", icon: Rocket, style: "bg-accent/15 text-accent border-accent/30" },
  dataset: {
    label: "Dataset",
    icon: Layers,
    style: "bg-chart-3/15 text-chart-3 border-chart-3/30",
  },
};

function HfCard({ item }: { item: HfItem }) {
  const meta = KIND_META[item.kind];
  return (
    <article className="group flex h-full flex-col rounded-2xl glass p-5 transition-all duration-300 hover:-translate-y-1 hover:border-accent/35 hover:shadow-glow">
      <div className="flex items-start justify-between gap-3">
        <span
          className={cn(
            "inline-flex items-center gap-1.5 rounded-md border px-2 py-0.5 text-[10px] font-semibold tracking-wide uppercase",
            meta.style,
          )}
        >
          <meta.icon className="size-3" /> {meta.label}
        </span>
        <span className="font-mono text-[11px] text-muted-foreground">
          {item.updatedAt ? new Date(item.updatedAt).toISOString().slice(0, 10) : ""}
        </span>

      </div>

      <h3 className="mt-3 text-base font-semibold tracking-tight">{item.name}</h3>
      <p className="mt-2 line-clamp-3 flex-1 text-sm text-muted-foreground">
        {item.description ??
          `${meta.label} published on Hugging Face${item.sdk ? ` running on ${item.sdk}` : ""}.`}
      </p>

      <div className="mt-4 flex flex-wrap gap-1.5">
        {item.task ? (
          <span className="rounded-md border border-primary/25 bg-primary/10 px-2 py-0.5 font-mono text-[11px] text-primary">
            {item.task}
          </span>
        ) : null}
        {item.framework ? (
          <span className="rounded-md border border-glass-border bg-secondary/40 px-2 py-0.5 font-mono text-[11px] text-muted-foreground">
            {item.framework}
          </span>
        ) : null}
        {item.tags.slice(0, 3).map((t) => (
          <span
            key={t}
            className="rounded-md border border-glass-border bg-secondary/30 px-2 py-0.5 font-mono text-[11px] text-muted-foreground"
          >
            {t}
          </span>
        ))}
      </div>

      <div className="mt-4 flex items-center gap-4 font-mono text-[11px] text-muted-foreground">
        <span className="inline-flex items-center gap-1">
          <Download className="size-3" /> {item.downloads}
        </span>
        <span className="inline-flex items-center gap-1">
          <Heart className="size-3" /> {item.likes}
        </span>
      </div>

      <div className="mt-5 flex flex-wrap gap-2">
        <Button asChild size="sm" className="rounded-lg">
          <a href={item.url} target="_blank" rel="noreferrer">
            <SiHuggingface className="size-3.5" /> Open on Hugging Face
          </a>
        </Button>
        <Button asChild size="sm" variant="secondary" className="rounded-lg">
          <a href={`${item.url}${item.kind === "model" ? "" : "/blob/main/README.md"}`} target="_blank" rel="noreferrer">
            Model card
          </a>
        </Button>
        {item.kind === "space" && item.runtimeUrl ? (
          <Button asChild size="sm" variant="ghost" className="rounded-lg">
            <a href={item.runtimeUrl} target="_blank" rel="noreferrer">
              <ExternalLink className="size-3.5" /> Live app
            </a>
          </Button>
        ) : null}
        {item.kind === "model" ? (
          <Button asChild size="sm" variant="ghost" className="rounded-lg">
            <a href={`${item.url}?inference_api=true`} target="_blank" rel="noreferrer">
              <Terminal className="size-3.5" /> Inference API
            </a>
          </Button>
        ) : null}
      </div>
    </article>
  );
}

export function HuggingFace({ hf }: { hf: HfData }) {
  const [kind, setKind] = useState<"all" | HfItem["kind"]>("all");
  const items = useMemo(
    () => (kind === "all" ? hf.items : hf.items.filter((i) => i.kind === kind)),
    [hf.items, kind],
  );

  const stats = [
    { label: "Models", value: hf.user.numModels },
    { label: "Spaces", value: hf.user.numSpaces },
    { label: "Datasets", value: hf.user.numDatasets },
    { label: "Collections", value: hf.collections.length },
    { label: "Followers", value: hf.user.followers },
    { label: "Likes", value: hf.totals.likes },
  ];

  return (
    <Section
      id="huggingface"
      eyebrow="Hugging Face"
      title="Models, Spaces & Datasets"
      description="Pulled live from the Hugging Face Hub API — every new model, Space, dataset or collection I publish shows up here on its own."
    >
      <Reveal>
        <div className="grid gap-3 sm:grid-cols-3 lg:grid-cols-6">
          {stats.map((s) => (
            <div key={s.label} className="rounded-2xl glass px-4 py-3.5">
              <div className="font-mono text-2xl font-semibold">{s.value}</div>
              <div className="mt-1 text-[11px] tracking-wide text-muted-foreground uppercase">
                {s.label}
              </div>
            </div>
          ))}
        </div>
      </Reveal>

      <div className="mt-6 flex flex-wrap gap-2">
        {(
          [
            { id: "all", label: `All (${hf.items.length})` },
            { id: "model", label: "Models" },
            { id: "space", label: "Spaces" },
            { id: "dataset", label: "Datasets" },
          ] as const
        ).map((t) => (
          <button
            key={t.id}
            type="button"
            onClick={() => setKind(t.id as typeof kind)}
            className={cn(
              "rounded-lg border px-3 py-1.5 text-xs transition-colors",
              kind === t.id
                ? "border-accent/50 bg-accent/15 text-accent"
                : "border-glass-border bg-secondary/30 text-muted-foreground hover:text-foreground",
            )}
          >
            {t.label}
          </button>
        ))}
      </div>

      <div className="mt-6 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {items.map((i) => (
          <HfCard key={`${i.kind}-${i.id}`} item={i} />
        ))}
      </div>

      {items.length === 0 ? (
        <p className="mt-8 text-sm text-muted-foreground">
          Nothing published in this category yet — it will appear automatically once it is.
        </p>
      ) : null}

      {hf.collections.length ? (
        <div className="mt-8 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {hf.collections.map((c) => (
            <a
              key={c.slug}
              href={c.url}
              target="_blank"
              rel="noreferrer"
              className="flex items-center justify-between rounded-2xl glass px-4 py-3 text-sm transition-colors hover:border-accent/35"
            >
              <span className="font-medium">{c.title}</span>
              <span className="font-mono text-xs text-muted-foreground">{c.itemCount} items</span>
            </a>
          ))}
        </div>
      ) : null}
    </Section>
  );
}
