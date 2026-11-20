import { Reveal, Section } from "@/components/site/Section";
import { Skeleton } from "@/components/ui/skeleton";
import { getContributions } from "@/lib/portfolio.functions";
import type { GithubData } from "@/lib/types";
import { cn } from "@/lib/utils";
import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { Activity, Flame, GitCommitHorizontal, Star, TrendingUp, Users } from "lucide-react";
import { SiGithub } from "react-icons/si";

const LEVELS = [
  "bg-secondary/50",
  "bg-primary/25",
  "bg-primary/45",
  "bg-primary/70",
  "bg-primary",
];

function Heatmap() {
  const fetchContrib = useServerFn(getContributions);
  const { data, isPending, isError } = useQuery({
    queryKey: ["contributions"],
    queryFn: () => fetchContrib(),
    staleTime: 1000 * 60 * 30,
  });

  if (isPending) return <Skeleton className="h-40 w-full rounded-2xl" />;
  if (isError || !data)
    return (
      <div className="rounded-2xl glass p-6 text-sm text-muted-foreground">
        Contribution graph is temporarily unavailable.
      </div>
    );

  return (
    <div className="rounded-2xl glass p-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2 text-sm font-semibold">
          <GitCommitHorizontal className="size-4 text-primary" />
          {data.total} contributions in the last year
        </div>
        <div className="flex items-center gap-4 font-mono text-[11px] text-muted-foreground">
          <span className="inline-flex items-center gap-1">
            <Flame className="size-3 text-primary" /> {data.currentStreak}d current
          </span>
          <span className="inline-flex items-center gap-1">
            <TrendingUp className="size-3 text-primary" /> {data.longestStreak}d longest
          </span>
          {data.bestDay ? <span>best {data.bestDay.count}/day</span> : null}
        </div>
      </div>

      <div className="mt-4 overflow-x-auto pb-2 marquee-mask">
        <div className="flex gap-[3px]">
          {data.weeks.map((week, wi) => (
            <div key={wi} className="flex flex-col gap-[3px]">
              {week.map((day, di) =>
                day.count < 0 ? (
                  <div key={di} className="size-[11px] rounded-[3px] bg-transparent" />
                ) : (
                  <div
                    key={di}
                    title={`${day.date}: ${day.count} contribution${day.count === 1 ? "" : "s"}`}
                    className={cn(
                      "size-[11px] rounded-[3px] transition-transform hover:scale-125",
                      LEVELS[Math.min(day.level, 4)],
                    )}
                  />
                ),
              )}
            </div>
          ))}
        </div>
      </div>

      <div className="mt-2 flex items-center justify-end gap-1.5 text-[11px] text-muted-foreground">
        Less
        {LEVELS.map((l, i) => (
          <span key={i} className={cn("size-[11px] rounded-[3px]", l)} />
        ))}
        More
      </div>
    </div>
  );
}

export function GithubDashboard({ github }: { github: GithubData }) {
  const timeline = [...github.repos]
    .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
    .slice(0, 8);
  const stats = [
    { label: "Public repos", value: github.profile.public_repos, icon: SiGithub },
    { label: "Total stars", value: github.totals.stars, icon: Star },
    { label: "Total forks", value: github.totals.forks, icon: Activity },
    { label: "Followers", value: github.profile.followers, icon: Users },
  ];

  return (
    <Section
      id="github"
      eyebrow="GitHub Dashboard"
      title="Contribution activity in real time"
      description="Contribution heatmap, language distribution, repository timeline and recent public activity — all read from the GitHub API on each visit."
    >
      <Reveal>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {stats.map((s) => (
            <div key={s.label} className="flex items-center gap-3 rounded-2xl glass px-4 py-3.5">
              <span className="grid size-9 place-items-center rounded-xl bg-primary/10 text-primary">
                <s.icon className="size-4" />
              </span>
              <div>
                <div className="font-mono text-xl font-semibold">{s.value}</div>
                <div className="text-[11px] tracking-wide text-muted-foreground uppercase">
                  {s.label}
                </div>
              </div>
            </div>
          ))}
        </div>
      </Reveal>

      <Reveal delay={0.05} className="mt-5">
        <Heatmap />
      </Reveal>

      <div className="mt-5 grid gap-5 lg:grid-cols-3">
        <Reveal delay={0.08} className="lg:col-span-1">
          <div className="h-full rounded-2xl glass p-5">
            <h3 className="font-mono text-xs tracking-widest text-primary uppercase">
              Top languages
            </h3>
            <div className="mt-4 space-y-3">
              {github.languages.slice(0, 6).map((l) => (
                <div key={l.name}>
                  <div className="flex justify-between text-xs">
                    <span>{l.name}</span>
                    <span className="font-mono text-muted-foreground">{l.percent}%</span>
                  </div>
                  <div className="mt-1.5 h-1.5 overflow-hidden rounded-full bg-secondary/60">
                    <div
                      className="h-full rounded-full bg-gradient-to-r from-primary to-accent"
                      style={{ width: `${Math.max(2, l.percent)}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </Reveal>

        <Reveal delay={0.12} className="lg:col-span-1">
          <div className="h-full rounded-2xl glass p-5">
            <h3 className="font-mono text-xs tracking-widest text-primary uppercase">
              Repository timeline
            </h3>
            <ol className="mt-4 space-y-3 border-l border-glass-border pl-4">
              {timeline.map((r) => (
                <li key={r.id} className="relative">
                  <span className="absolute top-1.5 -left-[21px] size-2 rounded-full bg-primary" />
                  <a
                    href={r.html_url}
                    target="_blank"
                    rel="noreferrer"
                    className="text-sm font-medium hover:text-primary"
                  >
                    {r.name}
                  </a>
                  <div className="font-mono text-[11px] text-muted-foreground">
                    {new Date(r.created_at).toISOString().slice(0, 10)} · {r.language ?? "mixed"}
                  </div>
                </li>
              ))}
            </ol>
          </div>
        </Reveal>

        <Reveal delay={0.16} className="lg:col-span-1">
          <div className="h-full rounded-2xl glass p-5">
            <h3 className="font-mono text-xs tracking-widest text-primary uppercase">
              Recent activity
            </h3>
            <ul className="mt-4 space-y-3">
              {github.activity.length ? (
                github.activity.slice(0, 8).map((a) => (
                  <li key={a.id} className="text-sm">
                    <a
                      href={a.repoUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="font-medium hover:text-primary"
                    >
                      {a.repo}
                    </a>
                    <div className="text-xs text-muted-foreground">{a.detail}</div>
                    <div className="font-mono text-[11px] text-muted-foreground/70">
                      {new Date(a.createdAt).toISOString().slice(0, 16).replace("T", " ")}
                    </div>
                  </li>
                ))
              ) : (
                <li className="text-sm text-muted-foreground">No public events in the API window.</li>
              )}
            </ul>
          </div>
        </Reveal>
      </div>
    </Section>
  );
}
