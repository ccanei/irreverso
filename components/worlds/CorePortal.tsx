"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { CANON_ENTITIES, CANON_EVENTS } from "../../lib/bookCanon";
import { pulseDwell, readResidualState, resetWorldState, restrictedUnlocks, trackCoreSession } from "../../lib/worldState";

type NodePoint = {
  id: string;
  name: string;
  x: number;
  y: number;
  z: number;
  vx: number;
  vy: number;
  pulse: number;
};

const ERA_MARKS = [1983, 1997, 2007, 2025, 2035, 2044, 2107];
const TX_FRAGMENTS = [
  "sinal liminar detectado",
  "protocolo órfão desperto",
  "eco de consenso em latência",
  "tecido sináptico sob interferência",
  "rumor: nuve observa",
  "anomalia suave no eixo temporal",
  "fratura espectral contida",
];

function buildNodes(count: number): NodePoint[] {
  return Array.from({ length: count }, (_, i) => ({
    id: `node-${i}`,
    name: CANON_ENTITIES[i % CANON_ENTITIES.length]?.name || `Entidade ${i}`,
    x: Math.random(),
    y: Math.random(),
    z: Math.random(),
    vx: (Math.random() - 0.5) * 0.00012,
    vy: (Math.random() - 0.5) * 0.00012,
    pulse: Math.random() * Math.PI * 2,
  }));
}

function drawField(
  canvas: HTMLCanvasElement,
  nodes: NodePoint[],
  time: number,
  pointer: { x: number; y: number },
  reducedMotion: boolean,
) {
  const ctx = canvas.getContext("2d");
  if (!ctx) return;

  const { width, height } = canvas;
  ctx.clearRect(0, 0, width, height);

  const gradient = ctx.createRadialGradient(width * 0.5, height * 0.45, 50, width * 0.5, height * 0.45, width * 0.9);
  gradient.addColorStop(0, "rgba(20,44,67,.45)");
  gradient.addColorStop(1, "rgba(2,4,8,.92)");
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, width, height);

  const fog = 0.035 + Math.sin(time * 0.00025) * 0.012;
  ctx.fillStyle = `rgba(190,220,255,${fog})`;
  ctx.fillRect(0, 0, width, height);

  const parallaxX = (pointer.x - 0.5) * 30;
  const parallaxY = (pointer.y - 0.5) * 30;

  for (const node of nodes) {
    if (!reducedMotion) {
      node.x += node.vx * (1 + node.z * 1.6);
      node.y += node.vy * (1 + node.z * 1.6);
      if (node.x < 0 || node.x > 1) node.vx *= -1;
      if (node.y < 0 || node.y > 1) node.vy *= -1;
      node.x = Math.min(1, Math.max(0, node.x));
      node.y = Math.min(1, Math.max(0, node.y));
      node.pulse += 0.02;
    }

    const depth = 0.3 + node.z * 0.7;
    const x = node.x * width + parallaxX * depth;
    const y = node.y * height + parallaxY * depth;
    const r = 1.1 + node.z * 2.1 + Math.sin(node.pulse) * 0.3;

    ctx.beginPath();
    ctx.fillStyle = `rgba(${180 + node.z * 60}, ${220 + node.z * 20}, 255, ${0.28 + node.z * 0.6})`;
    ctx.arc(x, y, r, 0, Math.PI * 2);
    ctx.fill();
  }

  ctx.lineWidth = 0.8;
  for (let i = 0; i < nodes.length; i += 1) {
    for (let j = i + 1; j < Math.min(nodes.length, i + 10); j += 1) {
      const a = nodes[i];
      const b = nodes[j];
      const ax = a.x * width + parallaxX * (0.3 + a.z * 0.7);
      const ay = a.y * height + parallaxY * (0.3 + a.z * 0.7);
      const bx = b.x * width + parallaxX * (0.3 + b.z * 0.7);
      const by = b.y * height + parallaxY * (0.3 + b.z * 0.7);
      const d = Math.hypot(ax - bx, ay - by);
      if (d < 120) {
        const alpha = (1 - d / 120) * 0.24;
        ctx.strokeStyle = `rgba(168,210,255,${alpha})`;
        ctx.beginPath();
        ctx.moveTo(ax, ay);
        ctx.lineTo(bx, by);
        ctx.stroke();
      }
    }
  }

  // travelling particles / energetic pulses
  for (let i = 0; i < 18; i += 1) {
    const t = (time * 0.00006 + i / 18) % 1;
    const waveY = (0.15 + (i % 6) * 0.14) * height + Math.sin(time * 0.0004 + i) * 22;
    const x = t * width + parallaxX * 0.2;
    ctx.fillStyle = `rgba(208,236,255,${0.14 + (i % 3) * 0.06})`;
    ctx.fillRect(x, waveY, 2 + (i % 2), 2 + (i % 2));
  }
}

export function CorePortal() {
  const [debug, setDebug] = useState(false);
  const [residual, setResidual] = useState(readResidualState());
  const [unlockState, setUnlockState] = useState(restrictedUnlocks());
  const [activeNode, setActiveNode] = useState<NodePoint | null>(null);
  const [overlayOpen, setOverlayOpen] = useState(false);
  const [tx, setTx] = useState<{ id: number; text: string; x: number; y: number }[]>([]);
  const [nuvePulse, setNuvePulse] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [reducedMotion, setReducedMotion] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const audioRef = useRef<AudioContext | null>(null);
  const nodesRef = useRef<NodePoint[]>([]);
  const pointer = useRef({ x: 0.5, y: 0.5 });
  const [nodeButtons, setNodeButtons] = useState<NodePoint[]>([]);

  const eraEvents = useMemo(() => {
    return ERA_MARKS.map((year) => {
      const event = CANON_EVENTS.find((item) => item.year === year) || CANON_EVENTS[Math.floor(Math.random() * CANON_EVENTS.length)];
      return { year, event };
    });
  }, []);

  const playSynapse = () => {
    if (reducedMotion) return;
    if (!audioRef.current) audioRef.current = new window.AudioContext();
    const ctx = audioRef.current;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = "triangle";
    osc.frequency.setValueAtTime(360, ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(830, ctx.currentTime + 0.08);
    gain.gain.setValueAtTime(0.0001, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.025, ctx.currentTime + 0.03);
    gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 0.22);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start();
    osc.stop(ctx.currentTime + 0.24);
  };

  useEffect(() => {
    trackCoreSession("/core");
    const params = new URLSearchParams(window.location.search);
    setDebug(params.get("debug") === "1");
    setIsMobile(window.matchMedia("(max-width: 900px)").matches);
    setReducedMotion(window.matchMedia("(prefers-reduced-motion: reduce)").matches);

    const t = window.setInterval(() => {
      pulseDwell();
      setResidual(readResidualState());
      setUnlockState(restrictedUnlocks());
    }, 1000);

    return () => clearInterval(t);
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const resize = () => {
      const ratio = window.devicePixelRatio || 1;
      canvas.width = Math.floor(window.innerWidth * ratio);
      canvas.height = Math.floor(window.innerHeight * ratio);
      canvas.style.width = `${window.innerWidth}px`;
      canvas.style.height = `${window.innerHeight}px`;
      const ctx = canvas.getContext("2d");
      if (ctx) ctx.scale(ratio, ratio);
    };

    resize();
    const nodeCount = reducedMotion ? 110 : isMobile ? 150 : 220;
    nodesRef.current = buildNodes(nodeCount);
    setNodeButtons(nodesRef.current.slice(0, 14));

    let raf = 0;
    const render = (time: number) => {
      drawField(canvas, nodesRef.current, time, pointer.current, reducedMotion);
      raf = window.requestAnimationFrame(render);
    };

    raf = window.requestAnimationFrame(render);
    window.addEventListener("resize", resize);
    return () => {
      window.cancelAnimationFrame(raf);
      window.removeEventListener("resize", resize);
    };
  }, [isMobile, reducedMotion]);

  useEffect(() => {
    const txTimer = window.setInterval(() => {
      if (Math.random() > 0.72) {
        const id = Date.now() + Math.floor(Math.random() * 1000);
        const text = TX_FRAGMENTS[Math.floor(Math.random() * TX_FRAGMENTS.length)];
        setTx((current) => [...current.slice(-4), { id, text, x: 12 + Math.random() * 72, y: 10 + Math.random() * 78 }]);
        window.setTimeout(() => setTx((current) => current.filter((item) => item.id !== id)), 3200);
      }
    }, 2200);

    const nuveTimer = window.setInterval(() => {
      if (Math.random() > 0.988) {
        setNuvePulse(true);
        nodesRef.current = buildNodes(nodesRef.current.length);
        window.setTimeout(() => setNuvePulse(false), 700);
      }
    }, 2800);

    return () => {
      window.clearInterval(txTimer);
      window.clearInterval(nuveTimer);
    };
  }, []);

  return (
    <main className={`core-immersive ${nuvePulse ? "nuve-pulse" : ""}`} onPointerMove={(event) => {
      pointer.current = { x: event.clientX / window.innerWidth, y: event.clientY / window.innerHeight };
    }}>
      <canvas ref={canvasRef} className="neural-canvas" aria-hidden />
      {!reducedMotion ? <audio autoPlay loop className="ambience-layer" src="data:audio/wav;base64,UklGRiQAAABXQVZFZm10IBAAAAABAAEAIlYAACJWAAACABAAZGF0YQAAAAA=" /> : null}

      <header className="core-headline">
        <p>PORTAL // IRREVERSO</p>
        <p>integrity {(99.2 - residual.integrityDrop).toFixed(2)}% · {residual.learning ? "learning" : "stable"}</p>
      </header>

      <section className="temporal-flow" aria-label="timeline">
        {eraEvents.map(({ year, event }, index) => (
          <article key={year} className="era-block" style={{ zIndex: 5 + index }}>
            <p className="era-watermark">{year}</p>
            <div className="era-fragment">
              <h2>{event.title}</h2>
              {event.details.slice(0, 2).map((detail) => <p key={`${year}-${detail}`}>{detail}</p>)}
            </div>
          </article>
        ))}
      </section>

      <section className="node-layer" aria-label="dossier nodes">
        {nodeButtons.map((node) => (
          <button
            key={node.id}
            className="floating-node"
            style={{ left: `${node.x * 84 + 8}%`, top: `${node.y * 84 + 8}%` }}
            onClick={() => {
              setActiveNode(node);
              setOverlayOpen(true);
              playSynapse();
            }}
          >
            {node.name}
          </button>
        ))}
      </section>

      <section className="tx-layer" aria-label="transmissions">
        {tx.map((item) => (
          <p key={item.id} className="tx-fragment" style={{ left: `${item.x}%`, top: `${item.y}%` }}>{item.text}</p>
        ))}
      </section>

      <footer className="core-foot">
        <p>restricted {unlockState.unlockedCount}/3</p>
        <p>{unlockState.visitsUnlock ? "A" : "-"}{unlockState.breachUnlock ? " B" : " -"}{unlockState.dwellUnlock ? " C" : " -"}</p>
      </footer>

      {overlayOpen && activeNode ? (
        <div className="dossier-overlay" role="dialog" aria-modal="true" onClick={() => setOverlayOpen(false)}>
          <article className="dossier-card" onClick={(event) => event.stopPropagation()}>
            <p className="panel-title">DOSSIER // {activeNode.name}</p>
            <p>fragmento sináptico estabilizado.</p>
            <p>camada de profundidade: {(activeNode.z * 100).toFixed(0)}%</p>
            <p>acesso residual: {(99.2 - residual.integrityDrop).toFixed(2)}%</p>
            <button onClick={() => setOverlayOpen(false)}>fechar</button>
          </article>
        </div>
      ) : null}

      {nuvePulse ? <div className="nuve-mark">NUVE</div> : null}

      {debug ? (
        <aside className="debug-panel">
          <button onClick={() => { localStorage.setItem("irreverso.debug.forceBreach", "1"); window.location.href = "/?anomaly=1"; }}>triggerBreach</button>
          <button onClick={() => { resetWorldState(); window.location.href = "/"; }}>resetSeen</button>
          <button onClick={() => localStorage.setItem("irreverso.debug.unlockAll", "1")}>unlockAllRestricted</button>
        </aside>
      ) : null}
    </main>
  );
}
