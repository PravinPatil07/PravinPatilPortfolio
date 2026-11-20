import { Reveal, Section } from "@/components/site/Section";
import { TiltCard } from "@/components/site/TiltCard";
import { Button } from "@/components/ui/button";
import { FREELANCE, PROFILE } from "@/lib/profile";
import { CalendarClock, CheckCircle2, Mail } from "lucide-react";

export function Freelance() {
  return (
    <Section
      id="freelance"
      eyebrow="Freelancing"
      title="Hire me for your next AI or web build"
      description={FREELANCE.intro}
    >
      <Reveal>
        <div className="mb-8 flex flex-wrap items-center gap-4 rounded-2xl glass-2 p-5">
          <span className="inline-flex items-center gap-2 rounded-full bg-primary/10 px-3 py-1.5 text-xs font-medium text-primary">
            <span className="size-1.5 animate-pulse rounded-full bg-primary" />
            {FREELANCE.status}
          </span>
          <span className="inline-flex items-center gap-2 text-xs text-muted-foreground">
            <CalendarClock className="size-4" /> {FREELANCE.availability}
          </span>
          <div className="ml-auto flex gap-2">
            <Button asChild size="sm" className="rounded-xl">
              <a href="#contact">
                <Mail className="size-4" /> Start a project
              </a>
            </Button>
            <Button asChild size="sm" variant="secondary" className="rounded-xl">
              <a href={`mailto:${PROFILE.email}`}>Email directly</a>
            </Button>
          </div>
        </div>
      </Reveal>

      <div className="grid gap-4 sm:grid-cols-2">
        {FREELANCE.services.map((s, i) => (
          <Reveal key={s.title} delay={i * 0.06}>
            <TiltCard max={10}>
              <h3 className="text-base font-semibold">{s.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{s.scope}</p>
              <div className="mt-4 inline-flex items-center gap-2 rounded-lg border border-glass-border bg-secondary/40 px-2.5 py-1 font-mono text-xs text-primary">
                {s.timeline}
              </div>
            </TiltCard>
          </Reveal>
        ))}
      </div>

      <Reveal delay={0.12} className="mt-4">
        <div className="rounded-2xl glass p-6">
          <div className="flex items-center gap-2 text-sm font-semibold">
            <CheckCircle2 className="size-4 text-primary" /> How we work together
          </div>
          <ol className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {FREELANCE.process.map((p) => (
              <li
                key={p.step}
                className="rounded-xl border border-glass-border bg-secondary/25 p-4 transition-transform duration-300 hover:-translate-y-1"
              >
                <div className="font-mono text-xs text-primary">{p.step}</div>
                <div className="mt-1 text-sm font-semibold">{p.title}</div>
                <p className="mt-1 text-xs leading-relaxed text-muted-foreground">{p.body}</p>
              </li>
            ))}
          </ol>
        </div>
      </Reveal>
    </Section>
  );
}
