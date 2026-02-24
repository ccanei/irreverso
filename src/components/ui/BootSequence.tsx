// BootSequence.tsx — NUVE Cinematic Boot (Shader + Glitch + Neural Mesh)
"use client";

import { useEffect, useMemo, useRef, useState } from "react";

type Props = { durationMs: number; onFinish: () => void };
type Phase = "ORBIT" | "BREACH" | "RESET" | "DEPLOY";

function clamp(n: number, a: number, b: number) {
  return Math.max(a, Math.min(b, n));
}
function pick<T>(arr: T[]) {
  return arr[Math.floor(Math.random() * arr.length)];
}

const BOOK_ENTITIES = [
  "NUVE",
  "ZETA/0110",
  "IRREVERSO OS",
  "CANONICAL TIMELINE",
  "TEMPORAL INSTANCE",
  "SIGNAL ALIGNMENT",
  "DECISION FABRIC",
  "OBSERVATION LAYER",
  "SYNAPTIC MESH",
  "MEMORY SHARD",
  "PROBABILITY ORCHESTRATOR",
  "CIVIL STABILITY MODEL",
  "AUTONOMY INDEX",
  "REALITY EDIT LAYER",
];

const REAL_TECH = [
  "python",
  "llm",
  "transformer",
  "attention",
  "kv-cache",
  "vector-db",
  "retrieval",
  "agent",
  "orchestration",
  "grpc",
  "kubernetes",
  "edge",
  "telemetry",
  "tracing",
  "inference",
  "quantization",
  "fp16",
  "bf16",
  "cuda",
  "webgl",
];

function makeLines(seed: number) {
  const base = [
    `init: temporal-instance handshake`,
    `probe: edge fabric / latency`,
    `probe: model registry / integrity`,
    `probe: memory shards / quorum`,
    `probe: autonomy index / sampling`,
    `probe: decision fabric / sync`,
    `probe: observation layer / active`,
    `probe: canonical timeline / 1983→2107`,
    `probe: signal alignment / coarse`,
    `alloc: inference surface / gpu`,
    `alloc: vector memory / warm`,
    `alloc: kv-cache / prefill`,
    `mount: protocols / readonly`,
    `mount: archives / partial`,
    `render: preparing core surface -> /core`,
    `ok: stability within tolerance`,
  ];

  // generate extra “technical” lines
  const extra: string[] = [];
  const rnd = () => {
    seed = (seed * 9301 + 49297) % 233280;
    return seed / 233280;
  };

  const total = 24 + Math.floor(rnd() * 18);
  for (let i = 0; i < total; i++) {
    const ent = pick(BOOK_ENTITIES);
    const tech = pick(REAL_TECH);
    const v = (rnd() * 100).toFixed(1);
    const a = (rnd() * 1).toFixed(3);
    extra.push(
      `${tech}: ${ent.toLowerCase().replace(/\s+/g, "-")} :: metric=${v}% :: drift=${a}`
    );
  }

  return [...base, ...extra];
}

export default function BootSequence({ durationMs, onFinish }: Props) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const glRef = useRef<WebGLRenderingContext | null>(null);
  const progRef = useRef<WebGLProgram | null>(null);
  const rafRef = useRef<number | null>(null);

  const [phase, setPhase] = useState<Phase>("ORBIT");
  const [glitch, setGlitch] = useState(false);
  const [lines, setLines] = useState<string[]>([]);

  const total = Math.max(3000, durationMs);

  const schedule = useMemo(() => {
    // ORBIT -> BREACH -> RESET -> DEPLOY
    const t0 = 0;
    const t1 = Math.floor(total * 0.25);
    const t2 = Math.floor(total * 0.45);
    const t3 = Math.floor(total * 0.62);
    const tEnd = total;
    return { t0, t1, t2, t3, tEnd };
  }, [total]);

  // generate log lines
  useEffect(() => {
    setLines(makeLines(Date.now() % 999999));
  }, []);

  // phase engine
  useEffect(() => {
    const tA = setTimeout(() => setPhase("BREACH"), schedule.t1);
    const tB = setTimeout(() => setPhase("RESET"), schedule.t2);
    const tC = setTimeout(() => setPhase("DEPLOY"), schedule.t3);
    const tEnd = setTimeout(() => onFinish(), schedule.tEnd);

    return () => {
      clearTimeout(tA);
      clearTimeout(tB);
      clearTimeout(tC);
      clearTimeout(tEnd);
    };
  }, [schedule, onFinish]);

  // glitch pulse
  useEffect(() => {
    const i = setInterval(() => {
      setGlitch(true);
      setTimeout(() => setGlitch(false), 120);
    }, 4200);
    return () => clearInterval(i);
  }, []);

  // WebGL "shader" background with neural mesh and glitch
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const gl = canvas.getContext("webgl", {
      antialias: false,
      alpha: true,
      preserveDrawingBuffer: false,
    });
    if (!gl) return;

    // TS build on Vercel is strict: keep a non-null alias for all nested functions.
    const g = gl;

    glRef.current = g;

    const vert = `
      attribute vec2 a_pos;
      varying vec2 v_uv;
      void main() {
        v_uv = (a_pos + 1.0) * 0.5;
        gl_Position = vec4(a_pos, 0.0, 1.0);
      }
    `;

    const frag = `
      precision mediump float;
      varying vec2 v_uv;
      uniform vec2 u_res;
      uniform float u_time;
      uniform float u_phase;   // 0 orbit, 1 breach, 2 reset, 3 deploy
      uniform float u_glitch;  // 0/1

      // hash
      float h21(vec2 p){
        p = fract(p*vec2(123.34, 456.21));
        p += dot(p, p+45.32);
        return fract(p.x*p.y);
      }

      // noise
      float n2(vec2 p){
        vec2 i = floor(p);
        vec2 f = fract(p);
        float a = h21(i);
        float b = h21(i+vec2(1,0));
        float c = h21(i+vec2(0,1));
        float d = h21(i+vec2(1,1));
        vec2 u = f*f*(3.0-2.0*f);
        return mix(a,b,u.x) + (c-a)*u.y*(1.0-u.x) + (d-b)*u.x*u.y;
      }

      // neural mesh lines
      float mesh(vec2 uv, float t){
        uv *= 2.0;
        float s = 0.0;

        // moving field
        vec2 p = uv + 0.25*sin(vec2(uv.y, uv.x)*1.4 + t*0.6);
        float n = n2(p*3.0 + t*0.2);

        // grid
        vec2 g = abs(fract(p*6.0)-0.5);
        float lines = 1.0 - smoothstep(0.45, 0.50, min(g.x,g.y));
        s += lines * (0.15 + 0.35*n);

        // nodes
        vec2 cell = floor(p*6.0);
        vec2 f = fract(p*6.0)-0.5;
        float node = smoothstep(0.06, 0.0, length(f));
        s += node * (0.35 + 0.35*sin(t + n*6.283));

        return s;
      }

      void main() {
        vec2 uv = v_uv;
        float t = u_time;

        // phase mix
        float p = u_phase; // 0..3
        float orbit = smoothstep(0.0, 0.5, 1.0-abs(p-0.0));
        float breach = smoothstep(0.0, 0.5, 1.0-abs(p-1.0));
        float reset  = smoothstep(0.0, 0.5, 1.0-abs(p-2.0));
        float deploy = smoothstep(0.0, 0.5, 1.0-abs(p-3.0));

        // base colors: cyan + violet + deep black
        vec3 c0 = vec3(0.00, 0.02, 0.04);
        vec3 c1 = vec3(0.00, 0.85, 0.90);
        vec3 c2 = vec3(0.55, 0.10, 0.95);

        // background gradient
        vec3 bg = mix(c0, vec3(0.02,0.00,0.06), uv.y);
        bg = mix(bg, vec3(0.00,0.02,0.02), uv.x*0.35);

        // mesh intensity
        float m = mesh(uv - 0.5, t);
        float glow = m * (0.6*orbit + 1.0*breach + 0.4*reset + 0.8*deploy);

        // subtle nebula
        float neb = n2((uv-0.5)*2.0 + t*0.05);
        neb = pow(neb, 2.0);

        vec3 col = bg;
        col += glow * mix(c1, c2, neb);

        // glitch: horizontal jitter bands
        if (u_glitch > 0.5) {
          float band = step(0.93, n2(vec2(t*3.0, uv.y*14.0)));
          uv.x += band * (0.02 * sin(t*80.0 + uv.y*400.0));
          col *= (1.0 - band*0.35);
          col += band * vec3(0.1,0.0,0.2);
        }

        // vignette
        vec2 p2 = uv - 0.5;
        float v = smoothstep(0.80, 0.10, dot(p2,p2));
        col *= v;

        // subtle scanlines
        float scan = 0.06 * sin((uv.y*u_res.y)*0.035 + t*10.0);
        col -= scan;

        gl_FragColor = vec4(col, 1.0);
      }
    `;

    function compile(type: number, src: string) {
      const sh = g.createShader(type);
      if (!sh) return null;

      g.shaderSource(sh, src);
      g.compileShader(sh);

      if (!g.getShaderParameter(sh, g.COMPILE_STATUS)) {
        // fail silently (fallback to CSS bg)
        g.deleteShader(sh);
        return null;
      }
      return sh;
    }

    const vs = compile(g.VERTEX_SHADER, vert);
    const fs = compile(g.FRAGMENT_SHADER, frag);
    if (!vs || !fs) return;

    const prog = g.createProgram();
    if (!prog) return;

    g.attachShader(prog, vs);
    g.attachShader(prog, fs);
    g.linkProgram(prog);
    if (!g.getProgramParameter(prog, g.LINK_STATUS)) return;

    progRef.current = prog;

    const buf = g.createBuffer();
    if (!buf) return;

    g.bindBuffer(g.ARRAY_BUFFER, buf);
    g.bufferData(
      g.ARRAY_BUFFER,
      new Float32Array([-1, -1, 1, -1, -1, 1, -1, 1, 1, -1, 1, 1]),
      g.STATIC_DRAW
    );

    const locPos = g.getAttribLocation(prog, "a_pos");
    g.enableVertexAttribArray(locPos);
    g.vertexAttribPointer(locPos, 2, g.FLOAT, false, 0, 0);

    const uRes = g.getUniformLocation(prog, "u_res");
    const uTime = g.getUniformLocation(prog, "u_time");
    const uPhase = g.getUniformLocation(prog, "u_phase");
    const uGlitch = g.getUniformLocation(prog, "u_glitch");

    const resize = () => {
      const dpr = Math.min(2, window.devicePixelRatio || 1);
      const w = Math.floor(window.innerWidth * dpr);
      const h = Math.floor(window.innerHeight * dpr);
      canvas.width = w;
      canvas.height = h;
      canvas.style.width = "100%";
      canvas.style.height = "100%";
      g.viewport(0, 0, w, h);
      if (uRes) g.uniform2f(uRes, w, h);
    };

    resize();
    window.addEventListener("resize", resize);

    const t0 = performance.now();

    const loop = () => {
      const t = (performance.now() - t0) / 1000;
      g.useProgram(prog);

      if (uTime) g.uniform1f(uTime, t);

      const p =
        phase === "ORBIT" ? 0 : phase === "BREACH" ? 1 : phase === "RESET" ? 2 : 3;

      if (uPhase) g.uniform1f(uPhase, p);
      if (uGlitch) g.uniform1f(uGlitch, glitch ? 1 : 0);

      g.drawArrays(g.TRIANGLES, 0, 6);

      rafRef.current = requestAnimationFrame(loop);
    };

    rafRef.current = requestAnimationFrame(loop);

    return () => {
      window.removeEventListener("resize", resize);
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      try {
        g.deleteProgram(prog);
      } catch {}
    };
  }, [phase, glitch]);

  // UI log reveal speed (more lines earlier; sustain activity)
  const visibleCount = useMemo(() => {
    const now = Date.now();
    const seed = now % 999999;

    // reveal more lines quickly, then slow
    const totalLines = lines.length || 1;
    const t = (seed % total) / total; // 0..1
    const fast = clamp(Math.floor(totalLines * (t * 1.25)), 0, totalLines);
    return fast;
  }, [lines, total]);

  return (
    <div className="boot-root">
      {/* Shader canvas */}
      <canvas ref={canvasRef} className="boot-canvas" />

      {/* Foreground overlay */}
      <div className={`boot-overlay ${glitch ? "boot-glitch" : ""}`}>
        <div className="boot-center">
          <div className="boot-title">
            DEPLOYING IRREVERSO OS
          </div>

          <div className="boot-sub">
            {phase === "ORBIT" && "Initializing temporal surface..."}
            {phase === "BREACH" && "UNAUTHORIZED ACCESS DETECTED // BUFFER BREACH"}
            {phase === "RESET" && "Reconfiguring instance // resetting observers"}
            {phase === "DEPLOY" && "Deploying neural mesh // binding decision fabric"}
          </div>

          <div className="boot-log">
            {(lines.slice(0, visibleCount) || []).map((l, i) => (
              <div key={i} className="boot-line">
                <span className="boot-dot">•</span> {l}
              </div>
            ))}
          </div>

          <div className="boot-footer">
            <span>Observer:</span> ACTIVE &nbsp;|&nbsp; <span>Signal:</span>{" "}
            {phase === "BREACH" ? "ALIGNED" : "CALIBRATING"} &nbsp;|&nbsp;{" "}
            <span>Mode:</span> {phase}
          </div>
        </div>
      </div>
    </div>
  );
}
