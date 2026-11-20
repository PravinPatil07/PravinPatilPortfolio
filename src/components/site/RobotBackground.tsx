import { lazy, Suspense } from "react";
import { ClientOnly } from "@tanstack/react-router";

const Robot3D = lazy(() => import("./Robot3D"));

export function RobotBackground() {
  return (
    <div className="pointer-events-none fixed inset-0 -z-10 overflow-hidden opacity-[0.22] mix-blend-screen blur-[1px]">
      <ClientOnly fallback={null}>
        <Suspense fallback={null}>
          <Robot3D />
        </Suspense>
      </ClientOnly>
    </div>
  );
}
