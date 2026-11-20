import { PROFILE } from "@/lib/profile";
import { ArrowUp } from "lucide-react";
import { FaLinkedinIn } from "react-icons/fa6";
import { SiGithub, SiHuggingface } from "react-icons/si";

export function Footer() {
  return (
    <footer className="border-t border-glass-border">
      <div className="mx-auto flex w-full max-w-7xl flex-col gap-6 px-5 py-10 md:flex-row md:items-center md:justify-between">
        <div>
          <div className="text-sm font-semibold">{PROFILE.fullName}</div>
          <p className="mt-1 text-xs text-muted-foreground">
            {PROFILE.headline} · Built with live GitHub &amp; Hugging Face data
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
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
              className="inline-flex items-center gap-2 rounded-xl glass px-3 py-2 text-xs text-muted-foreground hover:text-foreground"
            >
              <Icon className="size-3.5" /> {label}
            </a>
          ))}
          <a
            href="/resume.pdf"
            download
            className="inline-flex items-center gap-2 rounded-xl glass px-3 py-2 text-xs text-muted-foreground hover:text-foreground"
          >
            Resume
          </a>
          <a
            href="#home"
            className="inline-flex items-center gap-2 rounded-xl border border-primary/30 bg-primary/10 px-3 py-2 text-xs text-primary"
          >
            <ArrowUp className="size-3.5" /> Back to top
          </a>
        </div>
      </div>
      <div className="border-t border-glass-border py-4 text-center text-[11px] text-muted-foreground">
        © {new Date().getFullYear()} {PROFILE.fullName}. All rights reserved.
      </div>
    </footer>
  );
}
