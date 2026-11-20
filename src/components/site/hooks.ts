import { useCallback, useEffect, useRef, useState } from "react";

/** 3D pointer tilt for cards: returns handlers + a ref to attach. */
export function useTilt(max = 10) {
  const ref = useRef<HTMLDivElement | null>(null);

  const onMove = useCallback(
    (e: React.PointerEvent<HTMLDivElement>) => {
      const el = ref.current;
      if (!el) return;
      const r = el.getBoundingClientRect();
      const px = (e.clientX - r.left) / r.width - 0.5;
      const py = (e.clientY - r.top) / r.height - 0.5;
      el.style.transform = `perspective(900px) rotateY(${px * max * 2}deg) rotateX(${-py * max * 2}deg) translateZ(12px)`;
      el.style.setProperty("--mx", `${(px + 0.5) * 100}%`);
      el.style.setProperty("--my", `${(py + 0.5) * 100}%`);
    },
    [max],
  );

  const onLeave = useCallback(() => {
    const el = ref.current;
    if (!el) return;
    el.style.transform = "perspective(900px) rotateY(0deg) rotateX(0deg) translateZ(0)";
  }, []);

  return { ref, onPointerMove: onMove, onPointerLeave: onLeave };
}


export function useTypedRoles(roles: readonly string[], speed = 70, pause = 1600) {
  const [text, setText] = useState("");
  const [index, setIndex] = useState(0);
  const deleting = useRef(false);

  useEffect(() => {
    const target = roles[index % roles.length] ?? "";
    let timeout: ReturnType<typeof setTimeout>;

    if (!deleting.current && text === target) {
      timeout = setTimeout(() => {
        deleting.current = true;
        setText(target.slice(0, -1));
      }, pause);
    } else if (deleting.current && text === "") {
      deleting.current = false;
      setIndex((i) => i + 1);
      timeout = setTimeout(() => setText(""), 200);
    } else {
      timeout = setTimeout(
        () => {
          setText((t) => (deleting.current ? target.slice(0, t.length - 1) : target.slice(0, t.length + 1)));
        },
        deleting.current ? speed / 2 : speed,
      );
    }

    return () => clearTimeout(timeout);
  }, [text, index, roles, speed, pause]);

  return text;
}

export function useCountUp(target: number, duration = 1400) {
  const [value, setValue] = useState(0);
  useEffect(() => {
    if (!Number.isFinite(target)) return;
    let raf = 0;
    const start = performance.now();
    const tick = (now: number) => {
      const p = Math.min(1, (now - start) / duration);
      const eased = 1 - Math.pow(1 - p, 3);
      setValue(Math.round(target * eased));
      if (p < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [target, duration]);
  return value;
}
