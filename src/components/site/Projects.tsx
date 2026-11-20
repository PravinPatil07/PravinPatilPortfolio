import { Markdown } from "@/components/site/Markdown";
import { Reveal, Section } from "@/components/site/Section";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { coverFor } from "@/lib/covers";
import { getRepoDetail } from "@/lib/portfolio.functions";

import { PROJECT_TAGS } from "@/lib/profile";
import type { GithubData, Repo } from "@/lib/types";
import { cn } from "@/lib/utils";
import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import {
  ArrowUpRight,
  Clock,
  Database,
  ExternalLink,
  FileText,
  GitFork,
  HardDrive,
  Search,
  Star,
  Users,
} from "lucide-react";
import { motion } from "motion/react";
import { useMemo, useState } from "react";
import { SiGithub } from "react-icons/si";

const TAG_STYLE: Record<string, string> = {
  ai: "bg-primary/15 text-primary border-primary/30",
  ml: "bg-accent/15 text-accent border-accent/30",
  dl: "bg-chart-3/15 text-chart-3 border-chart-3/30",
  llm: "bg-primary/15 text-primary border-primary/30",
  cv: "bg-chart-4/15 text-chart-4 border-chart-4/30",
  web: "bg-secondary/60 text-muted-foreground border-glass-border",
  iot: "bg-chart-5/15 text-chart-5 border-chart-5/30",
  python: "bg-secondary/60 text-muted-foreground border-glass-border",
  data: "bg-secondary/60 text-muted-foreground border-glass-border",
};

function labelFor(id: string) {
  return PROJECT_TAGS.find((t) => t.id === id)?.label ?? id;
}

function timeAgo(iso: string) {
  const diff = Date.now() - new Date(iso).getTime();
  const days = Math.round(diff / 86_400_000);
  if (days < 1) return "today";
  if (days < 30) return `${days}d ago`;
  const months = Math.round(days / 30);
  if (months < 12) return `${months}mo ago`;
  return `${Math.round(months / 12)}y ago`;
}

function coverImage(repo: Repo) {
  return coverFor({
    name: repo.name,
    topics: repo.topics,
    tags: repo.tags,
    description: repo.description,
  });
}


function ProjectCard({ repo, onOpen }: { repo: Repo; onOpen: () => void }) {
  return (
    <motion.article
      layout
      initial={{ opacity: 0, y: 18 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="group relative flex h-full flex-col overflow-hidden rounded-2xl glass transition-all duration-300 hover:-translate-y-1 hover:border-primary/35 hover:shadow-glow"
    >
      <div className="relative aspect-16/9 overflow-hidden border-b border-glass-border bg-secondary/30">
        <img
          src={coverImage(repo)}
          alt={`${repo.name.replace(/-/g, " ")} project cover`}
          loading="lazy"
          width={1024}
          height={576}
          className="size-full object-cover opacity-85 transition-transform duration-500 group-hover:scale-105"
        />

        <div className="absolute inset-0 bg-gradient-to-t from-background via-background/20 to-transparent" />
        <div className="absolute top-3 left-3 flex flex-wrap gap-1.5">
          {repo.featured ? (
            <span className="rounded-md border border-primary/40 bg-primary/20 px-2 py-0.5 text-[10px] font-semibold tracking-wide text-primary uppercase backdrop-blur">
              Pinned
            </span>
          ) : null}
          {repo.tags.slice(0, 2).map((t) => (
            <span
              key={t}
              className={cn(
                "rounded-md border px-2 py-0.5 text-[10px] font-semibold tracking-wide uppercase backdrop-blur",
                TAG_STYLE[t] ?? TAG_STYLE["web"],
              )}
            >
              {labelFor(t)}
            </span>
          ))}
        </div>
        {repo.archived ? (
          <span className="absolute top-3 right-3 rounded-md border border-glass-border bg-background/70 px-2 py-0.5 text-[10px] uppercase backdrop-blur">
            Archived
          </span>
        ) : null}
      </div>

      <div className="flex flex-1 flex-col p-5">
        <h3 className="text-base font-semibold tracking-tight">{repo.name.replace(/-/g, " ")}</h3>
        <p className="mt-2 line-clamp-2 text-sm text-muted-foreground">
          {repo.description ?? "No repository description provided — open details for the full README."}
        </p>

        <div className="mt-4 flex flex-wrap gap-1.5">
          {repo.languages.slice(0, 4).map((l) => (
            <span
              key={l}
              className="rounded-md border border-glass-border bg-secondary/40 px-2 py-0.5 font-mono text-[11px] text-muted-foreground"
            >
              {l}
            </span>
          ))}
          {repo.topics.slice(0, 3).map((t) => (
            <span
              key={t}
              className="rounded-md border border-primary/25 bg-primary/10 px-2 py-0.5 font-mono text-[11px] text-primary"
            >
              #{t}
            </span>
          ))}
        </div>

        <div className="mt-4 flex flex-wrap items-center gap-3 font-mono text-[11px] text-muted-foreground">
          <span className="inline-flex items-center gap-1">
            <Star className="size-3" /> {repo.stars}
          </span>
          <span className="inline-flex items-center gap-1">
            <GitFork className="size-3" /> {repo.forks}
          </span>
          <span className="inline-flex items-center gap-1">
            <HardDrive className="size-3" /> {(repo.size / 1024).toFixed(1)} MB
          </span>
          <span className="inline-flex items-center gap-1">
            <Clock className="size-3" /> {timeAgo(repo.pushed_at)}
          </span>
        </div>

        <div className="mt-5 flex flex-wrap gap-2 pt-1">
          <Button size="sm" className="rounded-lg" onClick={onOpen}>
            <FileText className="size-3.5" /> View Details
          </Button>
          <Button asChild size="sm" variant="secondary" className="rounded-lg">
            <a href={repo.html_url} target="_blank" rel="noreferrer">
              <SiGithub className="size-3.5" /> Repository
            </a>
          </Button>
          {repo.homepage ? (
            <Button asChild size="sm" variant="ghost" className="rounded-lg">
              <a href={repo.homepage} target="_blank" rel="noreferrer">
                <ExternalLink className="size-3.5" /> Live Demo
              </a>
            </Button>
          ) : null}
        </div>
      </div>
    </motion.article>
  );
}

function DetailDialog({ repo, onClose }: { repo: Repo | null; onClose: () => void }) {
  const fetchDetail = useServerFn(getRepoDetail);
  const { data, isPending, isError } = useQuery({
    queryKey: ["repo-detail", repo?.name],
    queryFn: () => fetchDetail({ data: { repo: repo!.name } }),
    enabled: Boolean(repo),
    staleTime: 1000 * 60 * 10,
  });

  return (
    <Dialog open={Boolean(repo)} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-h-[88vh] gap-0 overflow-hidden border-glass-border bg-popover p-0 sm:max-w-4xl">
        {repo ? (
          <>
            <DialogHeader className="border-b border-glass-border p-6 pb-5 text-left">
              <DialogTitle className="text-2xl tracking-tight">
                {repo.name.replace(/-/g, " ")}
              </DialogTitle>
              <DialogDescription className="text-sm">
                {repo.description ?? "Public repository on GitHub."}
              </DialogDescription>
              <div className="mt-3 flex flex-wrap gap-2">
                {repo.tags.map((t) => (
                  <Badge key={t} variant="outline" className={cn("rounded-md", TAG_STYLE[t])}>
                    {labelFor(t)}
                  </Badge>
                ))}
              </div>
              <div className="mt-4 flex flex-wrap gap-2">
                <Button asChild size="sm" className="rounded-lg">
                  <a href={repo.html_url} target="_blank" rel="noreferrer">
                    <SiGithub className="size-3.5" /> Open on GitHub
                  </a>
                </Button>
                {repo.homepage ? (
                  <Button asChild size="sm" variant="secondary" className="rounded-lg">
                    <a href={repo.homepage} target="_blank" rel="noreferrer">
                      <ExternalLink className="size-3.5" /> Live Demo
                    </a>
                  </Button>
                ) : null}
                <Button asChild size="sm" variant="ghost" className="rounded-lg">
                  <a href={`${repo.html_url}#readme`} target="_blank" rel="noreferrer">
                    <FileText className="size-3.5" /> Documentation
                  </a>
                </Button>
              </div>
            </DialogHeader>

            <div className="max-h-[58vh] overflow-y-auto px-6 py-5">
              <div className="grid gap-3 sm:grid-cols-4">
                {[
                  { label: "Stars", value: repo.stars },
                  { label: "Forks", value: repo.forks },
                  { label: "Open issues", value: repo.open_issues },
                  { label: "Size", value: `${(repo.size / 1024).toFixed(1)} MB` },
                ].map((s) => (
                  <div key={s.label} className="rounded-xl glass px-3 py-2.5">
                    <div className="font-mono text-lg">{s.value}</div>
                    <div className="text-[11px] text-muted-foreground uppercase">{s.label}</div>
                  </div>
                ))}
              </div>

              <div className="mt-5 grid gap-4 sm:grid-cols-2">
                <div className="rounded-xl glass p-4">
                  <div className="mb-3 flex items-center gap-2 text-xs tracking-widest text-primary uppercase">
                    <Database className="size-3.5" /> Technologies used
                  </div>
                  <div className="space-y-2">
                    {(data?.languages.length ? data.languages : []).map((l) => (
                      <div key={l.name}>
                        <div className="flex justify-between text-xs">
                          <span>{l.name}</span>
                          <span className="font-mono text-muted-foreground">{l.percent}%</span>
                        </div>
                        <div className="mt-1 h-1 overflow-hidden rounded-full bg-secondary/60">
                          <div
                            className="h-full bg-gradient-to-r from-primary to-accent"
                            style={{ width: `${Math.max(2, l.percent)}%` }}
                          />
                        </div>
                      </div>
                    ))}
                    {isPending ? <Skeleton className="h-16 w-full" /> : null}
                  </div>
                </div>

                <div className="rounded-xl glass p-4">
                  <div className="mb-3 flex items-center gap-2 text-xs tracking-widest text-primary uppercase">
                    <Users className="size-3.5" /> Contributors &amp; releases
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {data?.contributors.map((c) => (
                      <a
                        key={c.login}
                        href={c.html_url}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-2 rounded-lg border border-glass-border bg-secondary/40 px-2 py-1 text-xs hover:border-primary/40"
                      >
                        <img
                          src={c.avatar_url}
                          alt={c.login}
                          loading="lazy"
                          className="size-4 rounded-full"
                        />
                        {c.login}
                        <span className="font-mono text-[10px] text-muted-foreground">
                          {c.contributions}
                        </span>
                      </a>
                    ))}
                  </div>
                  <div className="mt-3 space-y-1.5">
                    {data?.releases.length ? (
                      data.releases.map((r) => (
                        <a
                          key={r.tag}
                          href={r.url}
                          target="_blank"
                          rel="noreferrer"
                          className="flex items-center justify-between rounded-lg px-2 py-1 text-xs hover:bg-secondary/50"
                        >
                          <span>{r.name}</span>
                          <span className="font-mono text-muted-foreground">
                            {new Date(r.published_at).toISOString().slice(0, 10)}
                          </span>
                        </a>
                      ))
                    ) : (
                      <p className="text-xs text-muted-foreground">No tagged releases yet.</p>
                    )}
                  </div>
                  <div className="mt-3 grid grid-cols-2 gap-2 text-[11px] text-muted-foreground">
                    <span>Created {new Date(repo.created_at).toISOString().slice(0, 10)}</span>
                    <span>Updated {new Date(repo.pushed_at).toISOString().slice(0, 10)}</span>
                    <span>Branch {repo.default_branch}</span>
                    <span>{repo.license ? `License ${repo.license}` : "No license"}</span>
                  </div>
                </div>
              </div>

              <div className="mt-6">
                <div className="mb-2 flex items-center gap-2 text-xs tracking-widest text-primary uppercase">
                  <FileText className="size-3.5" /> README
                </div>
                {isPending ? (
                  <div className="space-y-2">
                    <Skeleton className="h-5 w-1/2" />
                    <Skeleton className="h-24 w-full" />
                    <Skeleton className="h-24 w-full" />
                  </div>
                ) : isError ? (
                  <p className="text-sm text-muted-foreground">
                    README could not be loaded right now. Open the repository on GitHub for the full
                    documentation.
                  </p>
                ) : data?.readme ? (
                  <Markdown
                    baseUrl={`https://raw.githubusercontent.com/${repo.html_url.replace(
                      "https://github.com/",
                      "",
                    )}/${repo.default_branch}`}
                  >
                    {data.readme}
                  </Markdown>
                ) : (
                  <p className="text-sm text-muted-foreground">
                    This repository does not have a README yet.
                  </p>
                )}
              </div>
            </div>
          </>
        ) : null}
      </DialogContent>
    </Dialog>
  );
}

export function Projects({ github }: { github: GithubData }) {
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState<string>("all");
  const [showAll, setShowAll] = useState(false);
  const [active, setActive] = useState<Repo | null>(null);

  const availableTags = useMemo(() => {
    const used = new Set(github.repos.flatMap((r) => r.tags));
    return PROJECT_TAGS.filter((t) => used.has(t.id));
  }, [github.repos]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return github.repos.filter((r) => {
      const matchesTag = filter === "all" || r.tags.includes(filter);
      if (!matchesTag) return false;
      if (!q) return true;
      return [r.name, r.description ?? "", ...r.topics, ...r.languages]
        .join(" ")
        .toLowerCase()
        .includes(q);
    });
  }, [github.repos, query, filter]);

  const visible = showAll ? filtered : filtered.slice(0, 9);

  return (
    <Section
      id="projects"
      eyebrow="Projects"
      title="Everything I have shipped, live from GitHub"
      description={`All ${github.totals.repos} public repositories are fetched directly from the GitHub API — new repositories appear here automatically, with READMEs, languages, topics and stats rendered on demand.`}
    >
      <Reveal>
        <div className="rounded-2xl glass p-4">
          <div className="relative">
            <Search className="absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search repositories, topics, languages…"
              aria-label="Search projects"
              className="h-11 rounded-xl border-glass-border bg-secondary/30 pl-10"
            />
          </div>
          <div className="mt-3 flex flex-wrap gap-2">
            {[{ id: "all", label: `All (${github.repos.length})` }, ...availableTags].map((t) => (
              <button
                key={t.id}
                type="button"
                onClick={() => setFilter(t.id)}
                className={cn(
                  "rounded-lg border px-3 py-1.5 text-xs transition-colors",
                  filter === t.id
                    ? "border-primary/50 bg-primary/15 text-primary"
                    : "border-glass-border bg-secondary/30 text-muted-foreground hover:text-foreground",
                )}
              >
                {t.label}
              </button>
            ))}
          </div>
        </div>
      </Reveal>

      <div className="mt-6 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {visible.map((r) => (
          <ProjectCard key={r.id} repo={r} onOpen={() => setActive(r)} />
        ))}
      </div>

      {filtered.length === 0 ? (
        <p className="mt-8 text-center text-sm text-muted-foreground">
          No repositories match that search.
        </p>
      ) : null}

      {filtered.length > 9 ? (
        <div className="mt-8 flex justify-center">
          <Button variant="secondary" className="rounded-xl" onClick={() => setShowAll((v) => !v)}>
            {showAll ? "Show fewer" : `Show all ${filtered.length} repositories`}
            <ArrowUpRight className="size-4" />
          </Button>
        </div>
      ) : null}

      <DetailDialog repo={active} onClose={() => setActive(null)} />
    </Section>
  );
}
