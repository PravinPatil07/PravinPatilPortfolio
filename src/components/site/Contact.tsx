import { Reveal, Section } from "@/components/site/Section";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { ContactSchema, sendContactMessage } from "@/lib/contact.functions";
import { PROFILE } from "@/lib/profile";
import { useMutation } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { CheckCircle2, Loader2, Mail, MapPin, Send } from "lucide-react";
import { motion } from "motion/react";
import { useState } from "react";
import { FaLinkedinIn } from "react-icons/fa6";
import { SiGithub, SiHuggingface } from "react-icons/si";
import { toast } from "sonner";

type Fields = { name: string; email: string; phone: string; subject: string; message: string };

const EMPTY: Fields = { name: "", email: "", phone: "", subject: "", message: "" };

export function Contact() {
  const [fields, setFields] = useState<Fields>(EMPTY);
  const [errors, setErrors] = useState<Partial<Record<keyof Fields, string>>>({});
  const [sent, setSent] = useState(false);
  const submit = useServerFn(sendContactMessage);

  const mutation = useMutation({
    mutationFn: (data: Fields) => submit({ data }),
    onSuccess: (result) => {
      setSent(true);
      setFields(EMPTY);
      if (result?.delivered) {
        toast.success("Message sent — a confirmation email is on its way to you.");
      } else {
        toast.success("Message received — email delivery isn't set up yet, so reach out directly if it's urgent.");
      }
    },

    onError: (error: Error) => {
      toast.error(error.message || "Could not send your message. Please try again.");
    },
  });

  const update = (key: keyof Fields, value: string) => {
    setFields((f) => ({ ...f, [key]: value }));
    setErrors((e) => ({ ...e, [key]: undefined }));
  };

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const parsed = ContactSchema.safeParse(fields);
    if (!parsed.success) {
      const next: Partial<Record<keyof Fields, string>> = {};
      for (const issue of parsed.error.issues) {
        const key = issue.path[0] as keyof Fields;
        if (key && !next[key]) next[key] = issue.message;
      }
      setErrors(next);
      return;
    }
    setSent(false);
    mutation.mutate(fields);
  };

  return (
    <Section
      id="contact"
      eyebrow="Contact"
      title="Let's build something"
      description="Roles, collaborations, research ideas or a question about one of my projects — send a message and it lands straight in my inbox."
    >
      <div className="grid gap-5 lg:grid-cols-[0.8fr_1.2fr]">
        <Reveal>
          <div className="flex h-full flex-col gap-3">
            <a
              href={`mailto:${PROFILE.email}`}
              className="flex items-center gap-3 rounded-2xl glass p-5 transition-colors hover:border-primary/35"
            >
              <span className="grid size-10 place-items-center rounded-xl bg-primary/10 text-primary">
                <Mail className="size-5" />
              </span>
              <div className="min-w-0">
                <div className="text-xs text-muted-foreground uppercase">Email</div>
                <div className="truncate text-sm font-medium">{PROFILE.email}</div>
              </div>
            </a>
            <div className="flex items-center gap-3 rounded-2xl glass p-5">
              <span className="grid size-10 place-items-center rounded-xl bg-accent/15 text-accent">
                <MapPin className="size-5" />
              </span>
              <div>
                <div className="text-xs text-muted-foreground uppercase">Availability</div>
                <div className="text-sm font-medium">Open to remote & on-site AI/ML roles</div>
              </div>
            </div>
            <div className="grid gap-2 rounded-2xl glass p-5">
              <div className="text-xs text-muted-foreground uppercase">Profiles</div>
              {[
                { href: PROFILE.links.github, icon: SiGithub, label: "github.com/PravinPatil07" },
                { href: PROFILE.links.linkedin, icon: FaLinkedinIn, label: "linkedin.com/in/pravinpatil07" },
                {
                  href: PROFILE.links.huggingface,
                  icon: SiHuggingface,
                  label: "huggingface.co/PravinPatil007",
                },
              ].map(({ href, icon: Icon, label }) => (
                <a
                  key={label}
                  href={href}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-primary"
                >
                  <Icon className="size-4 shrink-0" />
                  <span className="truncate font-mono text-xs">{label}</span>
                </a>
              ))}
            </div>
          </div>
        </Reveal>

        <Reveal delay={0.08}>
          <form onSubmit={onSubmit} className="relative rounded-2xl glass p-6">
            {sent ? (
              <motion.div
                initial={{ opacity: 0, scale: 0.96 }}
                animate={{ opacity: 1, scale: 1 }}
                className="absolute inset-0 z-10 grid place-items-center rounded-2xl bg-background/85 backdrop-blur"
              >
                <div className="text-center">
                  <motion.div
                    initial={{ scale: 0.5, rotate: -20 }}
                    animate={{ scale: 1, rotate: 0 }}
                    transition={{ type: "spring", stiffness: 220, damping: 14 }}
                    className="mx-auto grid size-16 place-items-center rounded-full bg-primary/15 text-primary"
                  >
                    <CheckCircle2 className="size-8" />
                  </motion.div>
                  <h3 className="mt-4 text-lg font-semibold">Message delivered</h3>
                  <p className="mt-1 text-sm text-muted-foreground">
                    Check your inbox for the confirmation email.
                  </p>
                  <Button
                    type="button"
                    variant="secondary"
                    className="mt-5 rounded-xl"
                    onClick={() => setSent(false)}
                  >
                    Send another message
                  </Button>
                </div>
              </motion.div>
            ) : null}

            <div className="grid gap-4 sm:grid-cols-2">
              {(
                [
                  { key: "name", label: "Name", placeholder: "Your full name", type: "text" },
                  { key: "email", label: "Email", placeholder: "you@company.com", type: "email" },
                  { key: "phone", label: "Phone (optional)", placeholder: "+91…", type: "tel" },
                  { key: "subject", label: "Subject", placeholder: "Role, project or question", type: "text" },
                ] as const
              ).map((f) => (
                <div key={f.key} className={f.key === "subject" ? "sm:col-span-2" : ""}>
                  <Label htmlFor={f.key} className="text-xs text-muted-foreground uppercase">
                    {f.label}
                  </Label>
                  <Input
                    id={f.key}
                    type={f.type}
                    value={fields[f.key]}
                    onChange={(e) => update(f.key, e.target.value)}
                    placeholder={f.placeholder}
                    className="mt-1.5 h-11 rounded-xl border-glass-border bg-secondary/30"
                    aria-invalid={Boolean(errors[f.key])}
                  />
                  {errors[f.key] ? (
                    <p className="mt-1 text-xs text-destructive">{errors[f.key]}</p>
                  ) : null}
                </div>
              ))}

              <div className="sm:col-span-2">
                <Label htmlFor="message" className="text-xs text-muted-foreground uppercase">
                  Message
                </Label>
                <Textarea
                  id="message"
                  rows={6}
                  value={fields.message}
                  onChange={(e) => update("message", e.target.value)}
                  placeholder="Tell me what you're building…"
                  className="mt-1.5 rounded-xl border-glass-border bg-secondary/30"
                  aria-invalid={Boolean(errors.message)}
                />
                {errors.message ? (
                  <p className="mt-1 text-xs text-destructive">{errors.message}</p>
                ) : null}
              </div>
            </div>

            <Button
              type="submit"
              size="lg"
              disabled={mutation.isPending}
              className="mt-5 w-full rounded-xl sm:w-auto"
            >
              {mutation.isPending ? (
                <>
                  <Loader2 className="size-4 animate-spin" /> Sending…
                </>
              ) : (
                <>
                  <Send className="size-4" /> Send message
                </>
              )}
            </Button>
          </form>
        </Reveal>
      </div>
    </Section>
  );
}
