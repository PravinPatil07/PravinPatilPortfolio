import { Reveal, Section } from "@/components/site/Section";
import { TiltCard } from "@/components/site/TiltCard";
import { WEB_DEV } from "@/lib/profile";
import { Boxes, Code2, Cpu, Rocket } from "lucide-react";

const ICONS = [Code2, Boxes, Cpu, Rocket];

const CUBE_FACES = [
  { label: "React", transform: "rotateY(0deg) translateZ(64px)" },
  { label: "TypeScript", transform: "rotateY(90deg) translateZ(64px)" },
  { label: "Tailwind", transform: "rotateY(180deg) translateZ(64px)" },
  { label: "Node.js", transform: "rotateY(-90deg) translateZ(64px)" },
  { label: "Supabase", transform: "rotateX(90deg) translateZ(64px)" },
  { label: "Docker", transform: "rotateX(-90deg) translateZ(64px)" },
];

function TechCube() {
  return (
    <div className="grid place-items-center py-6" aria-hidden>
      <div className="size-32" style={{ perspective: "700px" }}>
        <div className="cube-spin relative size-32" style={{ transformStyle: "preserve-3d" }}>
          {CUBE_FACES.map((f) => (
            <div
              key={f.label}
              className="absolute inset-0 grid place-items-center rounded-xl border border-glass-border bg-secondary/30 font-mono text-[11px] tracking-widest text-primary uppercase backdrop-blur-sm"
              style={{ transform: f.transform }}
            >
              {f.label}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export function WebDev() {
  return (
    <Section
      id="web"
      eyebrow="Web Development"
      title="Full stack engineering, not just notebooks"
      description="Alongside the AI work I build and ship complete web products — typed React front ends, real backends, and the deployment story that puts them in front of users."
    >
      <TechCube />

      <div className="grid gap-4 md:grid-cols-2">
        {WEB_DEV.map((s, i) => {
          const Icon = ICONS[i % ICONS.length]!;
          return (
            <Reveal key={s.title} delay={i * 0.06}>
              <TiltCard>
                <div className="mb-4 grid size-10 place-items-center rounded-xl bg-primary/10 text-primary">
                  <Icon className="size-5" />
                </div>
                <h3 className="text-base font-semibold">{s.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{s.body}</p>
                <div className="mt-4 flex flex-wrap gap-2">
                  {s.points.map((p) => (
                    <span
                      key={p}
                      className="rounded-lg border border-glass-border bg-secondary/40 px-2.5 py-1 font-mono text-xs text-foreground/85"
                    >
                      {p}
                    </span>
                  ))}
                </div>
              </TiltCard>
            </Reveal>
          );
        })}
      </div>
    </Section>
  );
}
