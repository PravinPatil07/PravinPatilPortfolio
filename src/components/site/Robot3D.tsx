import { useEffect, useRef } from "react";
import * as THREE from "three";

/** Browser-only: builds a low-poly robot that reacts to scroll + pointer. */
export default function Robot3D() {
  const mountRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const mount = mountRef.current;
    if (!mount) return;

    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(
      38,
      mount.clientWidth / mount.clientHeight,
      0.1,
      100,
    );
    camera.position.set(0, 0.2, 14);

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
    renderer.setSize(mount.clientWidth, mount.clientHeight);
    mount.appendChild(renderer.domElement);

    const NEON = new THREE.Color("#7de2f5");
    const VIOLET = new THREE.Color("#b294ff");

    scene.add(new THREE.AmbientLight(0xffffff, 0.35));
    const key = new THREE.DirectionalLight(NEON, 2.4);
    key.position.set(3, 4, 5);
    scene.add(key);
    const rim = new THREE.DirectionalLight(VIOLET, 2.2);
    rim.position.set(-4, 1.5, -3);
    scene.add(rim);

    const shell = new THREE.MeshStandardMaterial({
      color: new THREE.Color("#1b2230"),
      metalness: 0.85,
      roughness: 0.32,
    });
    const glow = new THREE.MeshStandardMaterial({
      color: NEON,
      emissive: NEON,
      emissiveIntensity: 1.6,
      metalness: 0.2,
      roughness: 0.4,
    });
    const glowViolet = new THREE.MeshStandardMaterial({
      color: VIOLET,
      emissive: VIOLET,
      emissiveIntensity: 1.4,
      metalness: 0.2,
      roughness: 0.4,
    });

    const robot = new THREE.Group();
    robot.scale.setScalar(0.5);
    scene.add(robot);

    // torso
    const torso = new THREE.Mesh(new THREE.BoxGeometry(1.5, 1.7, 0.9), shell);
    torso.position.y = 0.1;
    robot.add(torso);
    const chest = new THREE.Mesh(new THREE.TorusGeometry(0.32, 0.07, 12, 32), glow);
    chest.position.set(0, 0.3, 0.48);
    robot.add(chest);
    const core = new THREE.Mesh(new THREE.IcosahedronGeometry(0.17, 0), glowViolet);
    core.position.copy(chest.position);
    robot.add(core);

    // head
    const head = new THREE.Group();
    head.position.y = 1.35;
    robot.add(head);
    head.add(new THREE.Mesh(new THREE.BoxGeometry(1.05, 0.85, 0.85), shell));
    const visor = new THREE.Mesh(new THREE.BoxGeometry(0.86, 0.26, 0.08), glow);
    visor.position.set(0, 0.06, 0.44);
    head.add(visor);
    const antenna = new THREE.Mesh(new THREE.CylinderGeometry(0.03, 0.03, 0.5, 8), shell);
    antenna.position.y = 0.65;
    head.add(antenna);
    const bulb = new THREE.Mesh(new THREE.SphereGeometry(0.1, 16, 16), glowViolet);
    bulb.position.y = 0.94;
    head.add(bulb);

    // arms
    const makeArm = (side: number) => {
      const pivot = new THREE.Group();
      pivot.position.set(side * 0.98, 0.72, 0);
      const upper = new THREE.Mesh(new THREE.BoxGeometry(0.3, 1.0, 0.3), shell);
      upper.position.y = -0.5;
      pivot.add(upper);
      const joint = new THREE.Mesh(new THREE.SphereGeometry(0.19, 16, 16), glow);
      pivot.add(joint);
      const hand = new THREE.Mesh(new THREE.BoxGeometry(0.34, 0.34, 0.34), shell);
      hand.position.y = -1.12;
      pivot.add(hand);
      robot.add(pivot);
      return pivot;
    };
    const leftArm = makeArm(-1);
    const rightArm = makeArm(1);

    // legs
    const makeLeg = (side: number) => {
      const pivot = new THREE.Group();
      pivot.position.set(side * 0.42, -0.78, 0);
      const leg = new THREE.Mesh(new THREE.BoxGeometry(0.36, 1.1, 0.36), shell);
      leg.position.y = -0.55;
      pivot.add(leg);
      const foot = new THREE.Mesh(new THREE.BoxGeometry(0.5, 0.2, 0.62), glowViolet);
      foot.position.set(0, -1.16, 0.1);
      pivot.add(foot);
      robot.add(pivot);
      return pivot;
    };
    const leftLeg = makeLeg(-1);
    const rightLeg = makeLeg(1);

    // orbiting data ring
    const ring = new THREE.Mesh(new THREE.TorusGeometry(2.5, 0.012, 8, 96), glow);
    ring.rotation.x = Math.PI / 2.1;
    robot.add(ring);
    const sparkGeo = new THREE.SphereGeometry(0.05, 8, 8);
    const sparks: THREE.Mesh[] = [];
    for (let i = 0; i < 10; i++) {
      const s = new THREE.Mesh(sparkGeo, i % 2 ? glow : glowViolet);
      robot.add(s);
      sparks.push(s);
    }

    let scrollProgress = 0;
    let targetScroll = 0;
    const pointer = { x: 0, y: 0 };
    const smoothPointer = { x: 0, y: 0 };

    const onScroll = () => {
      const max = document.documentElement.scrollHeight - window.innerHeight;
      targetScroll = max > 0 ? Math.min(1, Math.max(0, window.scrollY / max)) : 0;
    };
    const onPointer = (e: PointerEvent) => {
      pointer.x = (e.clientX / window.innerWidth) * 2 - 1;
      pointer.y = (e.clientY / window.innerHeight) * 2 - 1;
    };
    const onResize = () => {
      camera.aspect = mount.clientWidth / mount.clientHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(mount.clientWidth, mount.clientHeight);
    };

    onScroll();
    scrollProgress = targetScroll;
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("pointermove", onPointer);
    window.addEventListener("resize", onResize);

    const clock = new THREE.Clock();
    let raf = 0;

    const tick = () => {
      raf = requestAnimationFrame(tick);
      const t = clock.getElapsedTime();
      scrollProgress += (targetScroll - scrollProgress) * 0.07;
      smoothPointer.x += (pointer.x - smoothPointer.x) * 0.05;
      smoothPointer.y += (pointer.y - smoothPointer.y) * 0.05;

      const p = scrollProgress;
      const walk = reduce ? 0 : t * 2.4;

      // scroll drives: spin, drift across the screen, depth and a "descending" pose
      robot.rotation.y = p * Math.PI * 2.4 + smoothPointer.x * 0.5;
      robot.position.x = Math.sin(p * Math.PI * 2) * 1.5;
      robot.position.y = -0.2 + Math.sin(t * 0.9) * 0.14 - p * 0.4;
      robot.position.z = -1 - p * 2.5;
      robot.rotation.z = Math.sin(p * Math.PI * 3) * 0.12;

      head.rotation.y = smoothPointer.x * 0.7 - robot.rotation.y * 0.25;
      head.rotation.x = smoothPointer.y * 0.35 + p * 0.3;

      const swing = Math.sin(walk) * (0.5 + p * 0.9);
      leftArm.rotation.x = swing;
      rightArm.rotation.x = -swing;
      leftArm.rotation.z = 0.12 + p * 0.5;
      rightArm.rotation.z = -0.12 - p * 0.5;
      leftLeg.rotation.x = -swing * 0.6;
      rightLeg.rotation.x = swing * 0.6;

      core.rotation.x = t * 1.2;
      core.rotation.y = t * 0.8;
      const pulse = 1 + Math.sin(t * 3) * 0.12 + p * 0.4;
      core.scale.setScalar(pulse);
      (bulb.material as THREE.MeshStandardMaterial).emissiveIntensity =
        1.2 + Math.sin(t * 5) * 0.6;

      ring.rotation.z = t * 0.4;
      ring.scale.setScalar(1 + p * 0.5);
      sparks.forEach((s, i) => {
        const a = t * 0.9 + (i / sparks.length) * Math.PI * 2;
        const r = 2.5 * (1 + p * 0.5);
        s.position.set(Math.cos(a) * r, Math.sin(a * 1.6) * 0.5, Math.sin(a) * r);
      });

      renderer.render(scene, camera);
    };
    tick();

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("pointermove", onPointer);
      window.removeEventListener("resize", onResize);
      renderer.dispose();
      scene.traverse((o) => {
        const m = o as THREE.Mesh;
        if (m.geometry) m.geometry.dispose();
      });
      if (renderer.domElement.parentNode === mount) mount.removeChild(renderer.domElement);
    };
  }, []);

  return <div ref={mountRef} className="absolute inset-0 h-full w-full" aria-hidden="true" />;
}
