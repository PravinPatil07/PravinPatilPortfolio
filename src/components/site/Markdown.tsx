import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import type { ComponentPropsWithoutRef } from "react";

export function Markdown({ children, baseUrl }: { children: string; baseUrl?: string }) {
  const absolute = (src?: string) => {
    if (!src) return src;
    if (/^https?:\/\//.test(src) || src.startsWith("data:")) return src;
    if (!baseUrl) return src;
    return `${baseUrl}/${src.replace(/^\.?\//, "")}`;
  };

  return (
    <div className="text-sm leading-relaxed text-foreground/85">
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        components={{
          h1: (p) => <h1 className="mt-6 mb-3 text-2xl font-semibold text-foreground" {...p} />,
          h2: (p) => (
            <h2
              className="mt-6 mb-3 border-b border-glass-border pb-2 text-xl font-semibold text-foreground"
              {...p}
            />
          ),
          h3: (p) => <h3 className="mt-5 mb-2 text-base font-semibold text-foreground" {...p} />,
          p: (p) => <p className="my-3 text-muted-foreground" {...p} />,
          a: (p) => (
            <a
              className="text-primary underline decoration-primary/40 underline-offset-2 hover:decoration-primary"
              target="_blank"
              rel="noreferrer"
              {...p}
            />
          ),
          ul: (p) => <ul className="my-3 list-disc space-y-1.5 pl-5 text-muted-foreground" {...p} />,
          ol: (p) => (
            <ol className="my-3 list-decimal space-y-1.5 pl-5 text-muted-foreground" {...p} />
          ),
          strong: (p) => <strong className="font-semibold text-foreground" {...p} />,
          blockquote: (p) => (
            <blockquote
              className="my-4 border-l-2 border-primary/50 bg-secondary/30 py-2 pl-4 text-muted-foreground italic"
              {...p}
            />
          ),
          code: ({ className, ...rest }: ComponentPropsWithoutRef<"code">) =>
            className?.includes("language-") ? (
              <code className="font-mono text-[12.5px] text-primary" {...rest} />
            ) : (
              <code
                className="rounded-md border border-glass-border bg-secondary/60 px-1.5 py-0.5 font-mono text-[12.5px] text-primary"
                {...rest}
              />
            ),
          pre: (p) => (
            <pre
              className="my-4 overflow-x-auto rounded-xl border border-glass-border bg-[oklch(0.16_0.02_265)] p-4"
              {...p}
            />
          ),
          img: ({ src, alt, ...rest }) => (
            <img
              src={absolute(typeof src === "string" ? src : undefined)}
              alt={alt ?? ""}
              loading="lazy"
              className="my-4 max-w-full rounded-xl border border-glass-border"
              {...rest}
            />
          ),
          table: (p) => (
            <div className="my-4 overflow-x-auto">
              <table className="w-full border-collapse text-left text-xs" {...p} />
            </div>
          ),
          th: (p) => (
            <th className="border border-glass-border bg-secondary/50 px-3 py-2 font-semibold" {...p} />
          ),
          td: (p) => <td className="border border-glass-border px-3 py-2 text-muted-foreground" {...p} />,
          hr: () => <hr className="my-6 border-glass-border" />,
        }}
      >
        {children}
      </ReactMarkdown>
    </div>
  );
}
