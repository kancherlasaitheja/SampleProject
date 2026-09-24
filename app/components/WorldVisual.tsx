"use client";

import { useEffect, useRef } from "react";

type WorldVisualProps = {
  world: number;
};

type Point = { x: number; y: number; z: number; size: number; light: number };

function randomSource(seed: number) {
  return () => {
    seed = (seed * 1664525 + 1013904223) >>> 0;
    return seed / 4294967296;
  };
}

/** A self-contained, decorative orbital field. All coordinates are seeded. */
export default function WorldVisual({ world }: WorldVisualProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const worldRef = useRef(world);

  useEffect(() => {
    worldRef.current = world;
    // A paused, reduced-motion illustration still updates with the selected tab.
    containerRef.current?.dispatchEvent(new Event("worldchange"));
  }, [world]);

  useEffect(() => {
    const container = containerRef.current;
    const canvas = canvasRef.current;
    const context = canvas?.getContext("2d", { alpha: true });
    if (!container || !canvas || !context) return;

    const random = randomSource(193742);
    const stars: Point[] = Array.from({ length: 780 }, () => {
      const longitude = random() * Math.PI * 2;
      const latitude = Math.acos(2 * random() - 1);
      const radius = 0.91 + random() * 0.16;
      return {
        x: Math.sin(latitude) * Math.cos(longitude) * radius,
        y: Math.cos(latitude) * radius,
        z: Math.sin(latitude) * Math.sin(longitude) * radius,
        size: 0.35 + random() * 1.1,
        light: 0.3 + random() * 0.7,
      };
    });
    const dust: Point[] = Array.from({ length: 120 }, () => ({
      x: (random() - 0.5) * 3.6,
      y: (random() - 0.5) * 3.1,
      z: random() * 2 - 1,
      size: random() * 1.1 + 0.25,
      light: random(),
    }));

    const motionQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    let reducedMotion = motionQuery.matches;
    let width = 1;
    let height = 1;
    let frame = 0;
    let elapsed = 0;
    let lastTime = 0;
    let pointerX = 0;
    let pointerY = 0;
    let driftX = 0;
    let driftY = 0;
    let selectedWorld = worldRef.current;

    function draw() {
      if (!context) return;
      const active = selectedWorld === 1;
      const radius = Math.min(width * 0.36, height * 0.335);
      const centerX = width * 0.5 + driftX * 10;
      const centerY = height * 0.5 + driftY * 8;
      const rotation = elapsed * (active ? 0.035 : 0.018);
      const spin = Math.cos(rotation);
      const spinSin = Math.sin(rotation);
      const tilt = -0.42 + driftX * 0.05;
      const tiltCos = Math.cos(tilt);
      const tiltSin = Math.sin(tilt);
      const lift = 0.32 + driftY * 0.05;
      const liftCos = Math.cos(lift);
      const liftSin = Math.sin(lift);
      const violet = selectedWorld === 3 ? "135, 166, 235" : "159, 123, 255";
      const cyan = selectedWorld === 2 ? "126, 200, 211" : "117, 221, 255";

      function project(x: number, y: number, z: number) {
        const rx = x * spin - z * spinSin;
        const rz = x * spinSin + z * spin;
        const ry = y * liftCos - rz * liftSin;
        const depth = y * liftSin + rz * liftCos;
        const perspective = 2.8 / (2.8 - depth * 0.17);
        return {
          x: centerX + (rx * tiltCos - ry * tiltSin) * radius * perspective,
          y: centerY + (rx * tiltSin + ry * tiltCos) * radius * perspective,
          z: depth,
        };
      }

      context.clearRect(0, 0, width, height);
      context.globalCompositeOperation = "source-over";
      const atmosphere = context.createRadialGradient(centerX, centerY, radius * 0.5, centerX, centerY, radius * 1.65);
      atmosphere.addColorStop(0, `rgba(${violet}, ${active ? 0.075 : 0.035})`);
      atmosphere.addColorStop(0.48, `rgba(${violet}, ${active ? 0.04 : 0.022})`);
      atmosphere.addColorStop(1, `rgba(${violet}, 0)`);
      context.fillStyle = atmosphere;
      context.fillRect(0, 0, width, height);

      // The transparent core gives the filaments a reflective, three-dimensional body.
      const core = context.createRadialGradient(centerX - radius * 0.4, centerY - radius * 0.4, 0, centerX, centerY, radius);
      core.addColorStop(0, `rgba(${cyan}, ${active ? 0.055 : 0.025})`);
      core.addColorStop(0.45, "rgba(34, 30, 70, .025)");
      core.addColorStop(0.88, `rgba(${violet}, .055)`);
      core.addColorStop(1, "rgba(125, 111, 205, .015)");
      context.fillStyle = core;
      context.beginPath();
      context.arc(centerX, centerY, radius, 0, Math.PI * 2);
      context.fill();

      context.globalCompositeOperation = "screen";
      const bands = active ? 28 : 14;
      for (let band = 0; band < bands; band += 1) {
        const latitude = -1.43 + (band / (bands - 1)) * 2.86;
        const ringRadius = Math.cos(latitude);
        const ringY = Math.sin(latitude);
        const hue = band < bands * 0.4 ? cyan : violet;
        // Split every filament into short depth-shaded sections.
        for (let segment = 0; segment < 8; segment += 1) {
          let depth = 0;
          context.beginPath();
          for (let point = 0; point <= 16; point += 1) {
            const angle = ((segment + point / 16) / 8) * Math.PI * 2;
            const ripple = active ? Math.sin(angle * 3 + latitude * 5 + elapsed * 0.06) * 0.009 : 0;
            const position = project(
              Math.cos(angle) * (ringRadius + ripple),
              ringY + Math.sin(angle * 2 + latitude * 4) * 0.012,
              Math.sin(angle) * (ringRadius + ripple),
            );
            depth += position.z / 17;
            if (point === 0) context.moveTo(position.x, position.y);
            else context.lineTo(position.x, position.y);
          }
          const brightness = Math.max(0.035, (depth + 1) * 0.12) * (active ? 1 : 0.7);
          context.strokeStyle = `rgba(${hue}, ${brightness})`;
          context.lineWidth = depth > 0.45 ? 0.8 : 0.55;
          context.stroke();
        }
      }

      // Sparse particles reveal the curvature without filling the field with noise.
      for (let index = 0; index < stars.length; index += active ? 1 : 3) {
        const star = stars[index];
        const position = project(star.x, star.y, star.z);
        const front = (position.z + 1.1) / 2.2;
        const pulse = reducedMotion ? 1 : 0.82 + Math.sin(elapsed * 0.45 + index * 2.17) * 0.18;
        const alpha = (0.13 + front * 0.68) * star.light * pulse * (active ? 1 : 0.55);
        context.fillStyle = `rgba(${star.y < 0.15 ? cyan : violet}, ${alpha})`;
        context.beginPath();
        context.arc(position.x, position.y, star.size * (0.55 + front * 0.45), 0, Math.PI * 2);
        context.fill();
        if (active && star.light > 0.93 && position.z > 0.4) {
          context.fillStyle = `rgba(211, 229, 255, ${alpha * 0.07})`;
          context.beginPath();
          context.arc(position.x, position.y, star.size * 4, 0, Math.PI * 2);
          context.fill();
        }
      }

      // A long, inclined orbit is the single deliberate accent outside the sphere.
      for (let pass = 0; pass < 2; pass += 1) {
        for (let segment = 0; segment < 24; segment += 1) {
          context.beginPath();
          let depth = 0;
          for (let point = 0; point <= 7; point += 1) {
            const angle = ((segment + point / 7) / 24) * Math.PI * 2;
            const position = project(Math.cos(angle) * 1.37, Math.sin(angle) * 0.35, Math.sin(angle) * 1.2);
            depth += position.z / 8;
            if (point === 0) context.moveTo(position.x, position.y);
            else context.lineTo(position.x, position.y);
          }
          const alpha = (depth > 0 ? 0.2 : 0.055) * (active ? 1 : 0.4);
          context.strokeStyle = `rgba(${depth > 0 ? cyan : violet}, ${pass === 0 ? alpha * 0.2 : alpha})`;
          context.lineWidth = pass === 0 ? 4 : 0.75;
          context.stroke();
        }
      }

      for (const particle of dust) {
        const sparkle = reducedMotion ? 0.7 : 0.55 + Math.sin(elapsed * 0.3 + particle.x * 9) * 0.25;
        context.fillStyle = `rgba(197, 206, 255, ${particle.light * sparkle * (active ? 0.35 : 0.12)})`;
        context.beginPath();
        context.arc(centerX + particle.x * radius, centerY + particle.y * radius, particle.size, 0, Math.PI * 2);
        context.fill();
      }
      context.globalCompositeOperation = "source-over";
    }

    function tick(time: number) {
      frame = 0;
      if (document.hidden || reducedMotion) return;
      const delta = lastTime ? Math.min((time - lastTime) / 1000, 0.05) : 0;
      lastTime = time;
      elapsed += delta;
      driftX += (pointerX - driftX) * Math.min(delta * 2.5, 1);
      driftY += (pointerY - driftY) * Math.min(delta * 2.5, 1);
      draw();
      frame = window.requestAnimationFrame(tick);
    }

    function restart() {
      window.cancelAnimationFrame(frame);
      frame = 0;
      lastTime = 0;
      // Keep a complete first frame even when opened in a background tab.
      draw();
      if (!document.hidden && !reducedMotion) frame = window.requestAnimationFrame(tick);
    }

    function resize() {
      if (!canvas || !context || !container) return;
      const bounds = container.getBoundingClientRect();
      width = Math.max(1, bounds.width);
      height = Math.max(1, bounds.height);
      const dpr = Math.min(window.devicePixelRatio || 1, 1.75);
      canvas.width = Math.round(width * dpr);
      canvas.height = Math.round(height * dpr);
      context.setTransform(dpr, 0, 0, dpr, 0, 0);
      restart();
    }

    function onPointerMove(event: PointerEvent) {
      if (reducedMotion || !container) return;
      const bounds = container.getBoundingClientRect();
      pointerX = Math.max(-1, Math.min(1, ((event.clientX - bounds.left) / bounds.width - 0.5) * 2));
      pointerY = Math.max(-1, Math.min(1, ((event.clientY - bounds.top) / bounds.height - 0.5) * 2));
    }

    function resetPointer() {
      pointerX = 0;
      pointerY = 0;
    }

    function onMotionChange(event: MediaQueryListEvent) {
      reducedMotion = event.matches;
      if (reducedMotion) {
        driftX = 0;
        driftY = 0;
      }
      restart();
    }

    function onWorldChange() {
      selectedWorld = worldRef.current;
      restart();
    }

    const observer = new ResizeObserver(resize);
    observer.observe(container);
    const pointerSurface = container.parentElement || container;
    pointerSurface.addEventListener("pointermove", onPointerMove);
    pointerSurface.addEventListener("pointerleave", resetPointer);
    container.addEventListener("worldchange", onWorldChange);
    document.addEventListener("visibilitychange", restart);
    motionQuery.addEventListener("change", onMotionChange);
    resize();

    return () => {
      window.cancelAnimationFrame(frame);
      observer.disconnect();
      pointerSurface.removeEventListener("pointermove", onPointerMove);
      pointerSurface.removeEventListener("pointerleave", resetPointer);
      container.removeEventListener("worldchange", onWorldChange);
      document.removeEventListener("visibilitychange", restart);
      motionQuery.removeEventListener("change", onMotionChange);
    };
  }, []);

  return (
    <div className="world-visual" ref={containerRef} aria-hidden="true">
      <canvas ref={canvasRef} style={{ display: "block", width: "100%", height: "100%" }} />
    </div>
  );
}
