import { Reveal, Section } from "@/components/site/Section";
import { SKILL_GROUPS } from "@/lib/profile";
import type { GithubData } from "@/lib/types";

export function Skills(_props: { github: GithubData }) {
  return (
    <Section
      id="skills"
      eyebrow="Skills"
      title="Stack I build with"
      description="The tools, frameworks and platforms I use across research, model training and production deployment."
    >
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {SKILL_GROUPS.map((g, i) => (
          <Reveal key={g.title} delay={i * 0.05}>
            <div className="h-full rounded-2xl glass p-5">
              <h3 className="font-mono text-xs tracking-widest text-primary uppercase">
                {g.title}
              </h3>
              <div className="mt-4 flex flex-wrap gap-2">
                {g.items.map((s) => (
                  <span
                    key={s}
                    className="rounded-lg border border-glass-border bg-secondary/40 px-2.5 py-1 text-xs text-foreground/85"
                  >
                    {s}
                  </span>
                ))}
              </div>
            </div>
          </Reveal>
        ))}
      </div>
    </Section>
  );
}

