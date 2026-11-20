import { useTilt } from "@/components/site/hooks";
import { cn } from "@/lib/utils";
import type { ReactNode } from "react";

/** Glass card with a 3D pointer tilt and a cursor-following highlight. */
export function TiltCard({
  children,
  className,
  max = 8,
}: {
  children: ReactNode;
  className?: string;
  max?: number;
}) {
  const tilt = useTilt(max);
  return (
    <div style={{ perspective: "900px" }} className="h-full">
      <div
        ref={tilt.ref}
        onPointerMove={tilt.onPointerMove}
        onPointerLeave={tilt.onPointerLeave}
        className={cn(
          "group relative h-full overflow-hidden rounded-2xl glass p-6 transition-[transform,border-color,box-shadow] duration-300 ease-out will-change-transform hover:border-primary/35 hover:shadow-elevate",
          className,
        )}
      >
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-300 group-hover:opacity-100"
          style={{
            background:
              "radial-gradient(360px circle at var(--mx, 50%) var(--my, 50%), color-mix(in oklab, var(--primary) 16%, transparent), transparent 65%)",
          }}
        />
        <div className="relative" style={{ transform: "translateZ(28px)" }}>
          {children}
        </div>
      </div>
    </div>
  );
}
