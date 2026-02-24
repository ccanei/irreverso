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

export default function BootSequence({ durationMs, onFinish }: Props) {
  const [phase, setPhase] = useState<Phase>("ORBIT");
  const [progress, setProgress] = useState(0);
  const [lines, setLines] = useState<string[]>([]);
  const [breachNote, setBreachNote] = useState("monitorando integridade temporal…");
  const [resetNote, setResetNote] = useState("limpando buffers • revertendo estado • restaurando superfície");
  const [glitch, setGlitch] = useState(false);
  const doneRef = useRef(false);

  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const rafRef = useRef<number | null>(null);
  const glRef = useRef<WebGLRenderingContext | null>(null);
  const progRef = useRef<WebGLProgram | null>(null);
  const startRef = useRef<number>(0);

  const seed = useMemo(() => {
    const s = crypto?.randomUUID?.() ?? String(Math.random()).slice(2);
    return s.slice(0, 8).toUpperCase();
  }, []);

  // Timings (cinematic)
  const orbitMs = 3000;
  const breachMs = useMemo(() => 2800 + Math.floor(Math.random() * 1600), []);
  const resetMs = useMemo(() => 1900 + Math.floor(Math.random() * 900), []);
  const deployMs = Math.max(6500, durationMs - (orbitMs + breachMs + resetMs));

  const script = useMemo(() => {
    const region = pick(["LATAM-WEST", "US-EAST", "EU-CENTRAL", "APAC-NODE"]);
    const zone = pick(["z1a", "z1b", "z2a", "z3c"]);
    const build = `3.7.${Math.floor(10 + Math.random() * 18)}`;
    const commit = Math.random().toString(16).slice(2, 10).toUpperCase();
    const latency = `${Math.floor(12 + Math.random() * 34)}ms`;
    const jitter = `${Math.floor(1 + Math.random() * 7)}ms`;
    const loss = `${(Math.random() * 0.06).toFixed(2)}%`;
    const uptime = `${Math.floor(88 + Math.random() * 12)}.${Math.floor(Math.random() * 10)}%`;
    const mem = `${Math.floor(28 + Math.random() * 22)}GB`;
    const vram = `${Math.floor(12 + Math.random() * 28)}GB`;
    const tok = `${Math.floor(180 + Math.random() * 420)}k/s`;

    const near = [
      `NUVE_EDGE_${region}_${zone}`.replace("-", "_"),
      `NUVE_CACHE_${region}_${zone}`.replace("-", "_"),
      `NUVE_OBS_${region}_${zone}`.replace("-", "_"),
      `NUVE_RELAY_${region}_${zone}`.replace("-", "_"),
    ];

    return [
      `NUVE/BOOTSTRAP :: instance=NUVE_CORE_0110 :: seed=${seed}`,
      `region: ${region} • zone: ${zone} • build: IRREVERSO_OS v${build} (${commit})`,
      `fabric: establishing secure mesh…`,
      `net: latency=${latency} jitter=${jitter} loss=${loss} • route=stable`,
      `dns: resolving services -> canon | archive | telemetry | relay`,
      `tls: session negotiated (forward-secrecy=on)`,
      `observability: tracing enabled • sampling=adaptive`,
      `telemetry: ingest pipeline online • sink=NUVE_AUDIT`,
      `storage: snapshot mount -> zeta-index (1983..2107)`,
      `cache: priming vectors • mode=warm`,
      `python: compiling pipelines -> tokenizer | attention | cache`,
      `runtime: enabling kernel ops -> async-io | stream | guardrails`,
      `models: loading base graph -> LLM mesh (context routing)`,
      `models: allocating memory -> ram=${mem} vram=${vram}`,
      `throughput: target=${tok} • scheduler=balanced`,
      `safety: policy gates online • audit=passive`,
      `archive: integrity check -> OK`,
      `canon: building canonical search -> OK`,
      `protocol: VECTOR-SYNC armed • state=persistent`,
      `signal: passive scan -> anomalies=0x00 (observing)`,
      `nearby: discovered nodes -> ${near.join(" • ")}`,
      `nearby: handshake -> OK • quorum=4/4`,
      `services: spawning -> summary | future-news | archive`,
      `services: healthcheck -> green`,
      `stability: lock=ACQUIRED • health=${uptime} • drift=0.00`,
      `deploy: activating neural mesh surface…`,
      `mesh: synapses online -> routing gradients`,
      `render: preparing core surface -> /core`,
      `entity: generating presence layer (non-judgement)`,
      `NUVE: decision layer online (autonomous)`,
      `handoff: switching control plane -> READY`,
      `status: build stable -> preparing transition`,
      `…`,
      `DEPLOY SUCCESS :: IRREVERSO_OS READY`,
    ];
  }, [seed]);

  // Phase flow
  useEffect(() => {
    const t1 = setTimeout(() => setPhase("BREACH"), orbitMs);
    const t2 = setTimeout(() => setPhase("RESET"), orbitMs + breachMs);
    const t3 = setTimeout(() => setPhase("DEPLOY"), orbitMs + breachMs + resetMs);

    const end = setTimeout(() => {
      if (doneRef.current) return;
      doneRef.current = true;
      onFinish();
    }, orbitMs + breachMs + resetMs + deployMs + 250);

    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
      clearTimeout(t3);
      clearTimeout(end);
    };
  }, [breachMs, resetMs, deployMs, onFinish]);

  // “NUVE viva”: mensagens dinâmicas + glitch flags
  useEffect(() => {
    if (phase === "BREACH") {
      setBreachNote("acesso negado • janela cronológica inválida");

      const a = setTimeout(() => {
        setGlitch(true);
        setBreachNote("anomalia detectada: credencial retroativa (não deveria existir)");
      }, 850);

      const b = setTimeout(() => {
        setBreachNote("NUVE: reescrevendo autorização em modo silencioso…");
        setGlitch(false);
      }, 1650);

      const c = setTimeout(() => {
        setGlitch(true);
        setBreachNote("integridade preservada • reinicialização exigida");
      }, 2500);

      const d = setTimeout(() => setGlitch(false), 3000);

      return () => {
        clearTimeout(a);
        clearTimeout(b);
        clearTimeout(c);
        clearTimeout(d);
      };
    }

    if (phase === "RESET") {
      setGlitch(false);
      setResetNote("limpando buffers • revertendo estado • restaurando superfície");

      const a = setTimeout(() => {
        setResetNote("reconfigurando instância • autorização aplicada retroativamente");
      }, 620);

      const b = setTimeout(() => {
        setResetNote("handshake interno • estabilidade restaurada • preparando deploy");
      }, 1380);

      return () => {
        clearTimeout(a);
        clearTimeout(b);
      };
    }

    if (phase === "DEPLOY") {
      // micro-glitches aleatórios, rápidos e leves
      const i = setInterval(() => {
        if (Math.random() > 0.78) {
          setGlitch(true);
          setTimeout(() => setGlitch(false), 120 + Math.floor(Math.random() * 140));
        }
      }, 820);
      return () => clearInterval(i);
    }
  }, [phase]);

  // Progress bar across total time (looks like system time)
  useEffect(() => {
    const start = Date.now();
    const tick = window.setInterval(() => {
      const t = Date.now() - start;
      const p = clamp(Math.round((t / durationMs) * 100), 0, 100);
      setProgress(p);
    }, 50);
    return () => window.clearInterval(tick);
  }, [durationMs]);

  // Console feed: spread through entire DEPLOY time (not half)
  useEffect(() => {
    if (phase !== "DEPLOY") return;
    setLines([]);

    let i = 0;
    const interval = Math.max(160, Math.floor(deployMs / Math.max(18, script.length + 10)));

    const feed = window.setInterval(() => {
      setLines((prev) => {
        const next = [...prev];
        const burst = 1 + (Math.random() > 0.82 ? 1 : 0);
        for (let k = 0; k < burst; k++) {
          if (i < script.length) next.push(script[i++]);
        }
        return next.slice(-20);
      });

      if (i >= script.length) {
        window.clearInterval(feed);
      }
    }, interval);

    return () => window.clearInterval(feed);
  }, [phase, deployMs, script]);

  // WebGL "shader" background with neural mesh and glitch
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const gl = canvas.getContext("webgl", { antialias: false, alpha: true, preserveDrawingBuffer: false });
    if (!gl) return;

    glRef.current = gl;

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

      float noise(vec2 p){
        vec2 i = floor(p);
        vec2 f = fract(p);
        float a = h21(i);
        float b = h21(i+vec2(1,0));
        float c = h21(i+vec2(0,1));
        float d = h21(i+vec2(1,1));
        vec2 u = f*f*(3.0-2.0*f);
        return mix(a,b,u.x) + (c-a)*u.y*(1.0-u.x) + (d-b)*u.x*u.y;
      }

      // fbm
      float fbm(vec2 p){
        float v = 0.0;
        float a = 0.55;
        for(int i=0;i<4;i++){
          v += a*noise(p);
          p *= 2.02;
          a *= 0.55;
        }
        return v;
      }

      // line distance for grid / neural links
      float lineDist(vec2 p, float w){
        p = abs(fract(p)-0.5);
        float d = min(p.x, p.y);
        return smoothstep(w, 0.0, d);
      }

      void main(){
        vec2 uv = v_uv;
        vec2 p = (uv*2.0-1.0);
        p.x *= u_res.x/u_res.y;

        // cinematic dark base
        float t = u_time;

        // subtle nebula
        float n = fbm(p*1.25 + vec2(0.0, t*0.03));
        float neb = smoothstep(0.25, 0.95, n);

        // neural mesh intensity increases in DEPLOY
        float deployK = smoothstep(2.4, 3.0, u_phase); // ~0 until deploy
        float orbitK  = 1.0 - smoothstep(0.8, 1.2, u_phase); // orbit is phase 0

        vec2 gp = p*3.4 + vec2(t*0.06, -t*0.04);
        float grid = lineDist(gp, 0.05) * 0.35;

        // "synapses": random points with connection glow
        vec2 sp = p*1.8 + vec2(t*0.05, t*0.02);
        float pts = 0.0;
        for(int i=0;i<10;i++){
          vec2 q = sp + vec2(float(i)*0.37, float(i)*0.21);
          vec2 id = floor(q);
          vec2 f = fract(q)-0.5;
          float r = h21(id);
          vec2 c = vec2(fract(r*13.7)-0.5, fract(r*7.9)-0.5);
          float d = length(f - c);
          pts += smoothstep(0.12, 0.0, d) * 0.12;
        }

        // glitch: horizontal slice shift + chroma split style
        float g = u_glitch;
        float slice = step(0.82, noise(vec2(t*3.0, uv.y*18.0))) * g;
        float xshift = slice * (noise(vec2(uv.y*40.0, t*6.0)) - 0.5) * 0.12;
        uv.x += xshift;

        vec2 p2 = (uv*2.0-1.0);
        p2.x *= u_res.x/u_res.y;

        float n2 = fbm(p2*1.25 + vec2(0.0, t*0.03));
        float neb2 = smoothstep(0.25, 0.95, n2);

        // color palette (tech + book): cyan + violet + subtle magenta
        vec3 base = vec3(0.02, 0.015, 0.04);
        vec3 cyan = vec3(0.28, 0.98, 0.95);
        vec3 vio  = vec3(0.64, 0.28, 0.95);
        vec3 mag  = vec3(0.95, 0.35, 0.72);

        float glow = neb2*0.22 + neb*0.10;
        float mesh = (grid + pts) * (0.18 + deployK*1.2);

        // orbit has more soft nebula, deploy has more mesh
        vec3 col = base;
        col += cyan * (glow*0.35);
        col += vio  * (glow*0.22);
        col += mag  * (glow*0.06);

        col += cyan * (mesh*0.55);
        col += vio  * (mesh*0.30);

        // breach: pink-ish warning wash + stronger flicker
        float breachK = smoothstep(0.9, 1.0, u_phase) * (1.0 - smoothstep(1.8, 2.0, u_phase));
        col += mag * breachK * (0.28 + 0.10*sin(t*30.0));

        // vignette
        float v = smoothstep(1.4, 0.2, length(p2));
        col *= v;

        // subtle scanlines
        float scan = 0.06 * sin((uv.y*u_res.y)*0.035 + t*10.0);
        col -= scan;

        gl_FragColor = vec4(col, 1.0);
      }
    `;

    function compile(type: number, src: string) {
      const sh = gl.createShader(type)!;
      gl.shaderSource(sh, src);
      gl.compileShader(sh);
      if (!gl.getShaderParameter(sh, gl.COMPILE_STATUS)) {
        // fail silently (fallback to CSS bg)
        gl.deleteShader(sh);
        return null;
      }
      return sh;
    }

    const vs = compile(gl.VERTEX_SHADER, vert);
    const fs = compile(gl.FRAGMENT_SHADER, frag);
    if (!vs || !fs) return;

    const prog = gl.createProgram()!;
    gl.attachShader(prog, vs);
    gl.attachShader(prog, fs);
    gl.linkProgram(prog);
    if (!gl.getProgramParameter(prog, gl.LINK_STATUS)) return;

    progRef.current = prog;

    const buf = gl.createBuffer()!;
    gl.bindBuffer(gl.ARRAY_BUFFER, buf);
    gl.bufferData(
      gl.ARRAY_BUFFER,
      new Float32Array([-1, -1, 1, -1, -1, 1, -1, 1, 1, -1, 1, 1]),
      gl.STATIC_DRAW
    );

    const locPos = gl.getAttribLocation(prog, "a_pos");
    gl.enableVertexAttribArray(locPos);
    gl.vertexAttribPointer(locPos, 2, gl.FLOAT, false, 0, 0);

    const uRes = gl.getUniformLocation(prog, "u_res");
    const uTime = gl.getUniformLocation(prog, "u_time");
    const uPhase = gl.getUniformLocation(prog, "u_phase");
    const uGlitch = gl.getUniformLocation(prog, "u_glitch");

    function resize() {
      const dpr = Math.min(2, window.devicePixelRatio || 1);
      const w = Math.floor(canvas.clientWidth * dpr);
      const h = Math.floor(canvas.clientHeight * dpr);
      if (canvas.width !== w || canvas.height !== h) {
        canvas.width = w;
        canvas.height = h;
        gl.viewport(0, 0, w, h);
      }
      gl.useProgram(prog);
      gl.uniform2f(uRes, canvas.width, canvas.height);
    }

    const onResize = () => resize();
    window.addEventListener("resize", onResize);

    startRef.current = performance.now();

    const loop = () => {
      const now = performance.now();
      const t = (now - startRef.current) / 1000;

      resize();
      gl.useProgram(prog);
      gl.uniform1f(uTime, t);

      // phase numeric mapping: orbit=0, breach=1, reset=2, deploy=3
      const ph = phase === "ORBIT" ? 0 : phase === "BREACH" ? 1 : phase === "RESET" ? 2 : 3;
      gl.uniform1f(uPhase, ph);
      gl.uniform1f(uGlitch, glitch ? 1 : 0);

      gl.drawArrays(gl.TRIANGLES, 0, 6);
      rafRef.current = requestAnimationFrame(loop);
    };

    rafRef.current = requestAnimationFrame(loop);

    return () => {
      window.removeEventListener("resize", onResize);
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      try {
        gl.deleteProgram(prog);
      } catch {}
    };
  }, [phase, glitch]);

  // UI overlay (center panel)
  return (
    <main className={`bootRootV2 ${glitch ? "isGlitch" : ""}`}>
      <canvas ref={canvasRef} className="bootShader" aria-hidden="true" />

      {/* glitch overlay */}
      <div className="bootGlitchOverlay" aria-hidden="true" />

      {phase === "ORBIT" && (
        <section className="orbitPanelV2">
          <div className="orbitHeadV2">
            <div className="orbitTitleV2">IRREVERSO OS</div>
            <div className="orbitMetaV2">NUVE • presence forming</div>
          </div>
          <div className="orbitBodyV2">
            <div className="orbitGlyphV2" aria-hidden="true" />
            <div className="orbitTextV2">
              <div className="mono">scanning temporal index</div>
              <div className="mono weak">aligning epochs • 1983 → 2107</div>
              <div className="mono weak">do not interact</div>
              <div className="mono faint" style={{ marginTop: 10 }}>seed:{seed}</div>
            </div>
          </div>
        </section>
      )}

      {phase === "BREACH" && (
        <section className="breachPanelV2" role="alert" aria-label="Unauthorized access warning">
          <div className="breachHeaderV2">
            <span className="tag">ACCESS</span>
            <span className="tag danger">UNAUTHORIZED</span>
          </div>
          <div className="breachTitleV2">Conteúdo bloqueado por integridade temporal.</div>
          <div className="breachMsgV2">
            Estes registros pertencem a eventos que <span className="dangerText">ainda não ocorreram</span> nesta época.
          </div>
          <div className="breachListV2 mono">
            <div>• tentativa: leitura de arquivos futuros</div>
            <div>• status: violação de janela cronológica</div>
            <div>• {breachNote}</div>
          </div>
          <div className="breachPulseV2 mono" aria-hidden="true">NUVE IS OBSERVING</div>
        </section>
      )}

      {phase === "RESET" && (
        <section className="resetPanelV2" aria-label="System reset">
          <div className="resetTitleV2 mono">RECONFIGURANDO INSTÂNCIA</div>
          <div className="resetSubV2 mono">{resetNote}</div>
          <div className="resetStackV2 mono">
            <div>kill-switch: soft</div>
            <div>cache: purge</div>
            <div>index: resync</div>
            <div>handoff: pending</div>
          </div>
          <div className="resetSpinnerV2" aria-hidden="true" />
        </section>
      )}

      {phase === "DEPLOY" && (
        <section className="deployPanelV2">
          <div className="deployTopV2">
            <div className="deployTitleV2">IRREVERSO OS</div>
            <div className="deployMetaV2">Registro Autorizado • NUVE ONLINE</div>
          </div>

          <div className="deployConsoleV2" role="log" aria-label="Deploy Console">
            {lines.map((l, idx) => (
              <div className="deployLineV2" key={idx}>
                <span className="prompt">›</span> {l}
              </div>
            ))}
            <div className="cursor" aria-hidden="true" />
          </div>

          <div className="deployFooterV2">
            <div className="bar">
              <div className="fill" style={{ width: `${progress}%` }} />
            </div>
            <div className="info mono">
              <span>deploying neural mesh…</span>
              <span>{progress}%</span>
            </div>
          </div>

          <div className="hint mono">(não clique. não interrompa. a NUVE já decidiu.)</div>
        </section>
      )}
    </main>
  );
}
