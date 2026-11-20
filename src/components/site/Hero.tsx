import { Button } from "@/components/ui/button";
import { useCountUp, useTypedRoles } from "@/components/site/hooks";
import { PROFILE } from "@/lib/profile";
import type { GithubData, HfData } from "@/lib/types";
import { motion } from "motion/react";
import { ArrowDown, Download, Mail, Sparkle } from "lucide-react";
import { FaLinkedinIn } from "react-icons/fa6";
import { SiGithub, SiHuggingface } from "react-icons/si";

function Stat({ label, value, suffix }: { label: string; value: number; suffix?: string }) {
  const count = useCountUp(value);
  return (
    <div className="glass rounded-2xl px-4 py-3.5">
      <div className="font-mono text-2xl font-semibold text-foreground md:text-3xl">
        {count}
        {suffix ?? ""}
      </div>
      <div className="mt-1 text-[11px] tracking-wide text-muted-foreground uppercase">{label}</div>
    </div>
  );
}

export function Hero({ github, hf }: { github: GithubData; hf: HfData }) {
  const typed = useTypedRoles(PROFILE.roles);
  const aiProjects = github.repos.filter((r) =>
    r.tags.some((t) => ["ai", "ml", "dl", "llm", "cv"].includes(t)),
  ).length;

  return (
    <section id="home" className="relative mx-auto w-full max-w-7xl px-5 pt-32 pb-16 md:pt-44 md:pb-24">
      <div className="grid items-center gap-12 lg:grid-cols-[1.15fr_0.85fr]">
        <div>
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="inline-flex items-center gap-2 rounded-full glass px-3 py-1.5 text-xs text-muted-foreground"
          >
            <Sparkle className="size-3.5 text-primary" />
            Open to AI / ML engineering roles
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 22 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.05 }}
            className="mt-6 text-5xl font-semibold tracking-tight text-balance md:text-7xl"
          >
            <span className="text-gradient">{PROFILE.name}</span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 22 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.12 }}
            className="mt-4 font-mono text-lg text-primary md:text-2xl"
            aria-live="polite"
          >
            {typed}
            <span className="animate-caret">|</span>
          </motion.p>

          <motion.p
            initial={{ opacity: 0, y: 22 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.18 }}
            className="mt-6 max-w-2xl text-sm leading-relaxed text-muted-foreground md:text-base"
          >
            {PROFILE.summary}
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 22 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.24 }}
            className="mt-8 flex flex-wrap items-center gap-3"
          >
            <Button asChild size="lg" className="rounded-xl">
              <a href="#projects">
                View Projects <ArrowDown className="size-4" />
              </a>
            </Button>
            <Button asChild size="lg" variant="secondary" className="rounded-xl">
              <a href="/resume.pdf" download>
                <Download className="size-4" /> Download Resume
              </a>
            </Button>
            <Button asChild size="lg" variant="ghost" className="rounded-xl">
              <a href="#contact">
                <Mail className="size-4" /> Contact
              </a>
            </Button>
          </motion.div>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.7, delay: 0.3 }}
            className="mt-6 flex flex-wrap gap-2"
          >
            {[
              { href: PROFILE.links.github, icon: SiGithub, label: "GitHub" },
              { href: PROFILE.links.linkedin, icon: FaLinkedinIn, label: "LinkedIn" },
              { href: PROFILE.links.huggingface, icon: SiHuggingface, label: "Hugging Face" },
            ].map(({ href, icon: Icon, label }) => (
              <a
                key={label}
                href={href}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-2 rounded-xl glass px-3.5 py-2 text-sm text-muted-foreground transition-colors hover:text-foreground"
              >
                <Icon className="size-4" /> {label}
              </a>
            ))}
          </motion.div>
        </div>

        <motion.div
          initial={{ opacity: 0, scale: 0.94 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8, delay: 0.1 }}
          className="relative"
        >
          <div className="absolute -inset-6 rounded-[2.5rem] bg-gradient-to-br from-primary/20 via-transparent to-accent/25 blur-2xl" />
          <div className="relative glass-2 rounded-[2rem] p-6">
            <div className="flex items-center gap-4">
              <img
                src={github.profile.avatar_url}
                alt={`${PROFILE.name} GitHub avatar`}
                width={72}
                height={72}
                loading="lazy"
                className="size-18 rounded-2xl border border-glass-border object-cover"
              />
              <div className="min-w-0">
                <div className="truncate text-sm font-semibold">{PROFILE.fullName}</div>
                <div className="truncate font-mono text-xs text-primary">
                  @{github.profile.login} · @{hf.user.name}
                </div>
                <div className="mt-1 text-xs text-muted-foreground">
                  Live from GitHub &amp; Hugging Face
                </div>
              </div>
            </div>

            <div className="mt-6 grid grid-cols-2 gap-3">
              <Stat label="Repositories" value={github.totals.repos} />
              <Stat label="AI / ML Projects" value={aiProjects} />
              <Stat label="HF Models" value={hf.user.numModels} />
              <Stat label="HF Spaces" value={hf.user.numSpaces} />
              <Stat label="Certifications" value={PROFILE.certificationIssuers.length} />
              <Stat label="Repo Stars" value={github.totals.stars} />
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
