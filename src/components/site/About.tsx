import { Reveal, Section } from "@/components/site/Section";
import { PROFILE, SKILL_GROUPS } from "@/lib/profile";
import type { GithubData } from "@/lib/types";
import { Award, BadgeCheck, Compass, GraduationCap, Target } from "lucide-react";

export function About({ github }: { github: GithubData }) {
  const since = new Date(github.profile.created_at).getFullYear();
  const cards = [
    {
      icon: Target,
      title: "Career objective",
      body: PROFILE.objective,
    },
    {
      icon: Compass,
      title: "How I work",
      body: "Research first, then ship. I prototype models in notebooks, validate against real data, wrap the best checkpoint in an API, and deploy an interface — most of my Hugging Face Spaces started as a training notebook in a GitHub repo.",
    },
    {
      icon: GraduationCap,
      title: "Engineering background",
      body: `Computer Engineering student and full stack developer, building publicly on GitHub since ${since}. My repositories track that arc: from web fundamentals through data analysis to deep learning and deployed inference APIs.`,
    },
    {
      icon: Award,
      title: "Beyond the code",
      body: "Hackathon participant, workshop attendee and team contributor — I like problems where a model has to survive contact with real users, and teams where the AI work sits next to product work.",
    },
  ];

  return (
    <Section
      id="about"
      eyebrow="About"
      title="Building AI systems that actually ship"
      description={PROFILE.summary}
    >
      <div className="grid gap-4 md:grid-cols-2">
        {cards.map((c, i) => (
          <Reveal key={c.title} delay={i * 0.06}>
            <div className="h-full rounded-2xl glass p-6 transition-colors hover:border-primary/30">
              <div className="mb-4 grid size-10 place-items-center rounded-xl bg-primary/10 text-primary">
                <c.icon className="size-5" />
              </div>
              <h3 className="text-base font-semibold">{c.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{c.body}</p>
            </div>
          </Reveal>
        ))}
      </div>

      <Reveal delay={0.1} className="mt-4">
        <div className="rounded-2xl glass p-6">
          <div className="flex items-center gap-2 text-sm font-semibold">
            <BadgeCheck className="size-4 text-primary" /> Focus areas
          </div>
          <div className="mt-4 flex flex-wrap gap-2">
            {SKILL_GROUPS.flatMap((g) => g.items)
              .slice(0, 22)
              .map((s) => (
                <span
                  key={s}
                  className="rounded-lg border border-glass-border bg-secondary/40 px-2.5 py-1 font-mono text-xs text-muted-foreground"
                >
                  {s}
                </span>
              ))}
          </div>
        </div>
      </Reveal>
    </Section>
  );
}
