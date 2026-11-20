import { Reveal, Section } from "@/components/site/Section";
import { PROFILE } from "@/lib/profile";
import { ShieldCheck } from "lucide-react";

export function Certifications() {
  return (
    <Section
      id="certifications"
      eyebrow="Certifications"
      title="Programs & credentials"
      description="Training programs and workshops completed across space technology, AI and industry skilling."
    >
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {PROFILE.certificationIssuers.map((c, i) => (
          <Reveal key={c.issuer} delay={i * 0.05}>
            <div className="group relative h-full overflow-hidden rounded-2xl glass p-6">
              <div className="absolute -right-10 -top-10 size-32 rounded-full bg-primary/10 blur-2xl transition-opacity group-hover:opacity-80" />
              <div className="relative">
                <div className="mb-4 grid size-10 place-items-center rounded-xl bg-accent/15 text-accent">
                  <ShieldCheck className="size-5" />
                </div>
                <h3 className="text-lg font-semibold tracking-tight">{c.issuer}</h3>
                <p className="mt-1.5 text-sm text-muted-foreground">{c.focus}</p>
              </div>
            </div>
          </Reveal>
        ))}
      </div>
    </Section>
  );
}
