"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { BOOK_QUOTES, CANON_ENTITIES, CANON_EVENTS, ENTITY_DOSSIERS, relatedQuotes } from "../../../lib/bookCanon";
import { pulseDwell, restrictedUnlocks, seenAlready, trackCoreSession } from "../../../lib/worldState";

type ClusterType = "year" | "entity" | "company" | "character" | "term";
type NodeDatum = { id: string; label: string; type: ClusterType; year: number; x: number; y: number; z: number; s: number };
type LinkDatum = { a: number; b: number; glow: number };
type DossierState = { slug: string; name: string; type: ClusterType } | null;

const ERA_COLORS = [
  { year: 1983, fog: [6, 10, 18], glow: [96, 120, 218] },
  { year: 1997, fog: [10, 17, 28], glow: [88, 174, 208] },
  { year: 2035, fog: [12, 20, 16], glow: [108, 196, 140] },
  { year: 2107, fog: [19, 12, 24], glow: [188, 120, 208] },
];

const detectTier = () => {
  if (typeof window === "undefined") return 500;
  const mobile = window.matchMedia("(max-width: 820px)").matches;
  const cores = navigator.hardwareConcurrency || 4;
  if (mobile) return 250 + Math.floor(Math.random() * 180);
  if (cores <= 4) return 500 + Math.floor(Math.random() * 220);
  return 900 + Math.floor(Math.random() * 260);
};

const mapType = (entityType: string): ClusterType => {
  if (entityType === "company") return "company";
  if (entityType === "term") return "term";
  if (entityType === "person") return "character";
  return "entity";
};

function buildGraph(totalNodes: number, eraYear: number) {
  const nodes: NodeDatum[] = [];
  const links: LinkDatum[] = [];
  for (let i = 0; i < totalNodes; i += 1) {
    const entity = CANON_ENTITIES[i % CANON_ENTITIES.length];
    const event = CANON_EVENTS[i % CANON_EVENTS.length];
    const theta = (i / totalNodes) * Math.PI * 8 + (Math.random() - 0.5) * 2;
    const radius = 0.2 + (i % 24) * 0.045 + Math.random() * 0.18;
    nodes.push({
      id: `${entity.slug}-${i}`,
      label: entity.name,
      type: mapType(entity.type),
      year: event.year,
      x: Math.cos(theta) * radius + (event.year - eraYear) * 0.004,
      y: Math.sin(theta * 1.2) * radius * 0.6,
      z: -4 - Math.random() * 14,
      s: 1 + Math.random() * 1.5,
    });
  }

  CANON_EVENTS.forEach((event, idx) => {
    const index = idx * Math.floor(totalNodes / CANON_EVENTS.length);
    nodes[index] = { ...nodes[index], id: `year-${event.year}`, label: String(event.year), type: "year", year: event.year, s: 2.5 };
  });

  for (let i = 0; i < totalNodes * 1.4; i += 1) {
    const a = Math.floor(Math.random() * totalNodes);
    const b = (a + 1 + Math.floor(Math.random() * 24)) % totalNodes;
    links.push({ a, b, glow: Math.random() });
  }

  return { nodes, links };
}

function compileShader(gl: WebGLRenderingContext, type: number, src: string) {
  const shader = gl.createShader(type)!;
  gl.shaderSource(shader, src);
  gl.compileShader(shader);
  return shader;
}

function createProgram(gl: WebGLRenderingContext) {
  const vs = compileShader(gl, gl.VERTEX_SHADER, "attribute vec3 p;attribute float ps;uniform vec2 drift;uniform float scale;varying float vps;void main(){vec3 pos=p+vec3(drift,0.0);gl_Position=vec4(pos.x*scale,pos.y*scale,0.0,1.0);gl_PointSize=ps;vps=ps;}");
  const fs = compileShader(gl, gl.FRAGMENT_SHADER, "precision mediump float;uniform vec3 c;varying float vps;void main(){float d=distance(gl_PointCoord,vec2(0.5));float a=smoothstep(0.52,0.08,d);gl_FragColor=vec4(c,a*min(1.0,vps*0.35));}");
  const program = gl.createProgram()!;
  gl.attachShader(program, vs);
  gl.attachShader(program, fs);
  gl.linkProgram(program);
  return program;
}

export function CoreWorld() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const audioRef = useRef<AudioContext | null>(null);
  const [searchOpen, setSearchOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [era, setEra] = useState(2044);
  const [hovered, setHovered] = useState<NodeDatum | null>(null);
  const [dossier, setDossier] = useState<DossierState>(null);
  const [soundOn, setSoundOn] = useState(false);
  const [unlockCount, setUnlockCount] = useState(0);
  const [unlockPulse, setUnlockPulse] = useState(0);
  const [nuveEvent, setNuveEvent] = useState(false);
  const [glyph, setGlyph] = useState(false);
  const [cameraFocus, setCameraFocus] = useState<{ x: number; y: number } | null>(null);

  const reducedMotion = useMemo(() => (typeof window !== "undefined" ? window.matchMedia("(prefers-reduced-motion: reduce)").matches : false), []);
  const totalNodes = useMemo(() => (reducedMotion ? Math.floor(detectTier() * 0.72) : detectTier()), [reducedMotion]);
  const { nodes, links } = useMemo(() => buildGraph(totalNodes, era), [totalNodes, era]);
  const filteredNodes = useMemo(() => query ? nodes.filter((n) => n.label.toLowerCase().includes(query.toLowerCase())).slice(0, 20) : [], [nodes, query]);

  useEffect(() => {
    trackCoreSession("/core");
    const interval = window.setInterval(() => {
      pulseDwell();
      setUnlockCount(restrictedUnlocks().unlockedCount);
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "/") { event.preventDefault(); setSearchOpen(true); }
      if (event.key === "Escape") { setDossier(null); setSearchOpen(false); }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  useEffect(() => {
    let prev = unlockCount;
    const t = window.setInterval(() => {
      const current = restrictedUnlocks().unlockedCount;
      if (current > prev) {
        setUnlockPulse(Date.now());
        playTone("unlock", audioRef.current, soundOn);
      }
      prev = current;
      setUnlockCount(current);
    }, 1200);
    return () => clearInterval(t);
  }, [unlockCount, soundOn]);

  useEffect(() => {
    if (typeof window === "undefined" || localStorage.getItem("irreverso.nuve.once") === "1") return;
    if (restrictedUnlocks().unlockedCount < 1) return;
    if (Math.random() < 0.02) {
      setNuveEvent(true);
      setGlyph(true);
      playTone("subdrop", audioRef.current, soundOn);
      window.setTimeout(() => setNuveEvent(false), 200);
      window.setTimeout(() => setGlyph(false), 840);
      localStorage.setItem("irreverso.nuve.once", "1");
    }
  }, [soundOn]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const gl = canvas.getContext("webgl", { alpha: false, antialias: true });
    if (!gl) return;
    const program = createProgram(gl);
    const pLoc = gl.getAttribLocation(program, "p");
    const psLoc = gl.getAttribLocation(program, "ps");
    const cLoc = gl.getUniformLocation(program, "c");
    const driftLoc = gl.getUniformLocation(program, "drift");
    const scaleLoc = gl.getUniformLocation(program, "scale");
    const pb = gl.createBuffer();
    const sb = gl.createBuffer();
    let frame = 0;
    let raf = 0;

    const render = () => {
      frame += 1;
      canvas.width = canvas.clientWidth;
      canvas.height = canvas.clientHeight;
      gl.viewport(0, 0, canvas.width, canvas.height);
      const color = ERA_COLORS.find((e) => era <= e.year) || ERA_COLORS[ERA_COLORS.length - 1];
      gl.clearColor(color.fog[0] / 255, color.fog[1] / 255, color.fog[2] / 255, 1);
      gl.clear(gl.COLOR_BUFFER_BIT);
      const driftX = reducedMotion ? 0 : Math.sin(frame * 0.003) * 0.02;
      const driftY = reducedMotion ? 0 : Math.cos(frame * 0.0022) * 0.015;
      const fx = cameraFocus?.x || 0;
      const fy = cameraFocus?.y || 0;
      const positions = new Float32Array(nodes.length * 3);
      const sizes = new Float32Array(nodes.length);
      nodes.forEach((node, i) => {
        positions[i * 3] = node.x - fx * 0.25;
        positions[i * 3 + 1] = node.y - fy * 0.25;
        sizes[i] = node.s * (node.type === "year" ? 5.5 : 3.2);
      });
      gl.useProgram(program);
      gl.uniform2f(driftLoc, driftX, driftY);
      gl.uniform1f(scaleLoc, 0.6);
      gl.uniform3f(cLoc, color.glow[0] / 255, color.glow[1] / 255, color.glow[2] / 255);
      gl.bindBuffer(gl.ARRAY_BUFFER, pb);
      gl.bufferData(gl.ARRAY_BUFFER, positions, gl.DYNAMIC_DRAW);
      gl.enableVertexAttribArray(pLoc);
      gl.vertexAttribPointer(pLoc, 3, gl.FLOAT, false, 0, 0);
      gl.bindBuffer(gl.ARRAY_BUFFER, sb);
      gl.bufferData(gl.ARRAY_BUFFER, sizes, gl.DYNAMIC_DRAW);
      gl.enableVertexAttribArray(psLoc);
      gl.vertexAttribPointer(psLoc, 1, gl.FLOAT, false, 0, 0);
      gl.drawArrays(gl.POINTS, 0, nodes.length);
      raf = requestAnimationFrame(render);
    };

    raf = requestAnimationFrame(render);
    return () => cancelAnimationFrame(raf);
  }, [nodes, era, reducedMotion, cameraFocus]);

  const onPointer = (event: React.PointerEvent<HTMLCanvasElement>) => {
    const rect = event.currentTarget.getBoundingClientRect();
    const x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
    const y = -(((event.clientY - rect.top) / rect.height) * 2 - 1);
    let nearest: NodeDatum | null = null;
    let best = 0.06;
    nodes.forEach((node) => {
      const dist = Math.hypot(x - node.x * 0.6, y - node.y * 0.6);
      if (dist < best) { nearest = node; best = dist; }
    });
    setHovered(nearest);
  };

  const onClickNode = () => {
    if (!hovered) return;
    playTone("tick", audioRef.current, soundOn);
    setCameraFocus({ x: hovered.x, y: hovered.y });
    const entity = CANON_ENTITIES.find((item) => hovered.label.includes(item.name));
    if (entity) setDossier({ slug: entity.slug, name: entity.name, type: mapType(entity.type) });
  };

  return (
    <main className={`coreworld-root ${nuveEvent ? "nuve-active" : ""}`} onWheel={(event) => {
      const years = CANON_EVENTS.map((item) => item.year);
      const idx = years.indexOf(era);
      const next = years[Math.min(years.length - 1, Math.max(0, idx + (event.deltaY > 0 ? 1 : -1)))];
      setEra(next);
    }}>
      <canvas ref={canvasRef} className="coreworld-canvas" onPointerMove={onPointer} onClick={onClickNode} onPointerDown={() => {
        if (!audioRef.current) audioRef.current = new AudioContext();
      }} />
      <svg className="core-links" viewBox="0 0 100 100" preserveAspectRatio="none">
        {links.slice(0, reducedMotion ? 180 : 380).map((link, idx) => {
          const a = nodes[link.a];
          const b = nodes[link.b];
          return <line key={`${idx}-${a.id}`} x1={(a.x * 20) + 50} y1={(a.y * 20) + 50} x2={(b.x * 20) + 50} y2={(b.y * 20) + 50} opacity={0.08 + link.glow * 0.18} />;
        })}
      </svg>
      <div className="coreworld-vignette" />
      <div className="coreworld-hud">
        <button className="hud-button" onClick={() => setSearchOpen((v) => !v)}>search /</button>
        <button className="hud-button" onClick={() => setSoundOn((v) => !v)}>{soundOn ? "sound on" : "sound off"}</button>
        <p>era {era} · unlocks {unlockCount}/3</p>
      </div>
      {hovered ? <div className="core-tooltip">{hovered.label} · {hovered.type}</div> : null}
      {searchOpen ? <div className="search-panel"><input autoFocus value={query} onChange={(e) => setQuery(e.target.value)} placeholder="buscar entidade/termo" />{filteredNodes.map((n) => <button key={n.id} onClick={() => { setCameraFocus({ x: n.x, y: n.y }); setSearchOpen(false); }}>{n.label}</button>)}</div> : null}
      {dossier ? <DossierOverlay state={dossier} unlockCount={unlockCount} onClose={() => setDossier(null)} /> : null}
      {unlockPulse ? <div className="unlock-pulse" /> : null}
      {glyph ? <div className="nuve-glyph" /> : null}
      {seenAlready() ? null : <div className="hint">scroll timeline · click node · ESC fecha</div>}
    </main>
  );
}

function DossierOverlay({ state, unlockCount, onClose }: { state: Exclude<DossierState, null>; unlockCount: number; onClose: () => void }) {
  const events = CANON_EVENTS.filter((event) => event.related.includes(state.slug));
  return (
    <div className="dossier-backdrop" onClick={onClose}>
      <aside className="dossier-panel" onClick={(event) => event.stopPropagation()}>
        <h2>{state.name}</h2>
        <p className="meta">{state.type}</p>
        {(ENTITY_DOSSIERS[state.slug] || []).slice(0, 3).map((line) => <p key={line}>• {line}</p>)}
        <h3>eventos</h3>
        {events.map((event) => <p key={event.year}>{event.year} — {event.title}</p>)}
        <h3>quotes</h3>
        {relatedQuotes(state.slug).slice(0, 4).map((quote) => <p key={quote}>“{quote}”</p>)}
        <h3>restricted segments</h3>
        <p>{unlockCount >= 1 ? BOOK_QUOTES[33] : "████████ visits >= 2"}</p>
        <p>{unlockCount >= 2 ? BOOK_QUOTES[41] : "████████ breach seen"}</p>
        <p>{unlockCount >= 3 ? BOOK_QUOTES[43] : "████████ dwell >= 60s"}</p>
      </aside>
    </div>
  );
}

function playTone(type: "tick" | "unlock" | "subdrop", context: AudioContext | null, enabled: boolean) {
  if (!context || !enabled) return;
  const now = context.currentTime;
  const osc = context.createOscillator();
  const gain = context.createGain();
  osc.connect(gain);
  gain.connect(context.destination);
  if (type === "tick") {
    osc.frequency.value = 560;
    gain.gain.setValueAtTime(0.02, now);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.05);
  } else if (type === "unlock") {
    osc.frequency.setValueAtTime(240, now);
    osc.frequency.exponentialRampToValueAtTime(710, now + 0.18);
    gain.gain.setValueAtTime(0.04, now);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.2);
  } else {
    osc.frequency.setValueAtTime(130, now);
    osc.frequency.exponentialRampToValueAtTime(34, now + 0.24);
    gain.gain.setValueAtTime(0.06, now);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.24);
  }
  osc.start();
  osc.stop(now + 0.26);
}
