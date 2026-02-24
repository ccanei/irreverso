// BootSequence.tsx — NUVE Cinematic Boot (Shader + Glitch + Neural Mesh) + i18n (pt/en/es-ready)
// ✅ Vercel/Next strict TS fixes:
//   - Never reference canvasRef.current directly inside nested funcs (alias `c`)
//   - Never reference gl directly inside nested funcs (alias `g`)
//   - Guard nullable WebGL returns: createShader/createProgram/createBuffer/getUniformLocation
//   - Keep original classNames (bootRootV2, bootShader, deployPanelV2...) to preserve your visual
//
// ✅ i18n rules:
//   - If lang prop is provided ("pt" | "en" | "es"), it wins
//   - Else, detect from navigator.language (pt* => pt, es* => es, otherwise en)
//   - Spanish is included. If you want only PT/EN for now, just avoid passing "es".

"use client";

import { useEffect, useMemo, useRef, useState } from "react";

type Props = {
  durationMs: number;
  onFinish: () => void;
  lang?: "pt" | "en" | "es";
};

type Phase = "ORBIT" | "BREACH" | "RESET" | "DEPLOY";

function clamp(n: number, a: number, b: number) {
  return Math.max(a, Math.min(b, n));
}
function pick<T>(arr: T[]) {
  return arr[Math.floor(Math.random() * arr.length)];
}

function detectLang(): "pt" | "en" | "es" {
  if (typeof navigator === "undefined") return "en";
  const raw = (navigator.language || "en").toLowerCase();
  if (raw.startsWith("pt")) return "pt";
  if (raw.startsWith("es")) return "es";
  return "en";
}

const DICT = {
  pt: {
    orbit_meta: "NUVE • presença se formando",
    orbit_scanning: "escaneando índice temporal",
    orbit_align: "alinhando épocas • 1983 → 2107",
    orbit_no: "não interaja",
    breach_access: "ACESSO",
    breach_unauth: "NÃO AUTORIZADO",
    breach_title: "Conteúdo bloqueado por integridade temporal.",
    breach_msg_a: "Estes registros pertencem a eventos que",
    breach_msg_b: "ainda não ocorreram",
    breach_msg_c: "nesta época.",
    breach_try: "• tentativa: leitura de arquivos futuros",
    breach_status: "• status: violação de janela cronológica",
    breach_observing: "NUVE ESTÁ OBSERVANDO",
    reset_title: "RECONFIGURANDO INSTÂNCIA",
    reset_kill: "kill-switch: soft",
    reset_cache: "cache: purge",
    reset_index: "index: resync",
    reset_handoff: "handoff: pending",
    deploy_meta: "Registro Autorizado • NUVE ONLINE",
    deploy_footer_left: "ativando malha neural…",
    deploy_hint: "(não clique. não interrompa. a NUVE já decidiu.)",
    breach_note_1: "acesso negado • janela cronológica inválida",
    breach_note_2: "anomalia detectada: credencial retroativa (não deveria existir)",
    breach_note_3: "NUVE: reescrevendo autorização em modo silencioso…",
    breach_note_4: "integridade preservada • reinicialização exigida",
    reset_note_1: "limpando buffers • revertendo estado • restaurando superfície",
    reset_note_2: "reconfigurando instância • autorização aplicada retroativamente",
    reset_note_3: "handshake interno • estabilidade restaurada • preparando deploy",
  },
  en: {
    orbit_meta: "NUVE • presence forming",
    orbit_scanning: "scanning temporal index",
    orbit_align: "aligning epochs • 1983 → 2107",
    orbit_no: "do not interact",
    breach_access: "ACCESS",
    breach_unauth: "UNAUTHORIZED",
    breach_title: "Content blocked by temporal integrity.",
    breach_msg_a: "These records belong to events that",
    breach_msg_b: "have not yet happened",
    breach_msg_c: "in this era.",
    breach_try: "• attempt: reading future archives",
    breach_status: "• status: timeline window violation",
    breach_observing: "NUVE IS OBSERVING",
    reset_title: "RECONFIGURING INSTANCE",
    reset_kill: "kill-switch: soft",
    reset_cache: "cache: purge",
    reset_index: "index: resync",
    reset_handoff: "handoff: pending",
    deploy_meta: "Authorized Record • NUVE ONLINE",
    deploy_footer_left: "deploying neural mesh…",
    deploy_hint: "(do not click. do not interrupt. NUVE already decided.)",
    breach_note_1: "access denied • invalid timeline window",
    breach_note_2: "anomaly detected: retroactive credential (should not exist)",
    breach_note_3: "NUVE: rewriting authorization in silent mode…",
    breach_note_4: "integrity preserved • reboot required",
    reset_note_1: "clearing buffers • reverting state • restoring surface",
    reset_note_2: "reconfiguring instance • retroactive authorization applied",
    reset_note_3: "internal handshake • stability restored • preparing deploy",
  },
  es: {
    orbit_meta: "NUVE • presencia en formación",
    orbit_scanning: "escaneando índice temporal",
    orbit_align: "alineando épocas • 1983 → 2107",
    orbit_no: "no interactúes",
    breach_access: "ACCESO",
    breach_unauth: "NO AUTORIZADO",
    breach_title: "Contenido bloqueado por integridad temporal.",
    breach_msg_a: "Estos registros pertenecen a eventos que",
    breach_msg_b: "aún no han ocurrido",
    breach_msg_c: "en esta época.",
    breach_try: "• intento: lectura de archivos futuros",
    breach_status: "• estado: violación de ventana temporal",
    breach_observing: "NUVE ESTÁ OBSERVANDO",
    reset_title: "RECONFIGURANDO INSTANCIA",
    reset_kill: "kill-switch: soft",
    reset_cache: "cache: purge",
    reset_index: "index: resync",
    reset_handoff: "handoff: pending",
    deploy_meta: "Registro Autorizado • NUVE ONLINE",
    deploy_footer_left: "desplegando malla neural…",
    deploy_hint: "(no hagas clic. no interrumpas. la NUVE ya decidió.)",
    breach_note_1: "acceso denegado • ventana temporal inválida",
    breach_note_2: "anomalía detectada: credencial retroactiva (no debería existir)",
    breach_note_3: "NUVE: reescribiendo autorización en modo silencioso…",
    breach_note_4: "integridad preservada • reinicio requerido",
    reset_note_1: "limpiando buffers • revirtiendo estado • restaurando superficie",
    reset_note_2: "reconfigurando instancia • autorización retroactiva aplicada",
    reset_note_3: "handshake interno • estabilidad restaurada • preparando despliegue",
  },
} as const;

export default function BootSequence({ durationMs, onFinish, lang }: Props) {
  const resolvedLang = useMemo(() => lang ?? detectLang(), [lang]);
  const T = DICT[resolvedLang];

  const [phase, setPhase] = useState<Phase>("ORBIT");
  const [progress, setProgress] = useState(0);
  const [lines, setLines] = useState<string[]>([]);
  const [breachNote, setBreachNote] = useState<string>(T.breach_note_1);
  const [resetNote, setResetNote] = useState<string>(T.reset_note_1);
  const [glitch, setGlitch] = useState(false);
  const doneRef = useRef(false);

  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const rafRef = useRef<number | null>(null);
  const startRef = useRef<number>(0);

  useEffect(() => {
    if (phase === "BREACH") setBreachNote(T.breach_note_1);
    if (phase === "RESET") setResetNote(T.reset_note_1);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [resolvedLang]);

  const seed = useMemo(() => {
    const s = (globalThis.crypto?.randomUUID?.() ?? String(Math.random()).slice(2));
    return s.slice(0, 8).toUpperCase();
  }, []);

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

    const L = resolvedLang;

    const phrases = {
      pt: {
        bootstrap: "NUVE/BOOTSTRAP",
        fabric: "fabric: estabelecendo malha segura…",
        tls: "tls: sessão negociada (forward-secrecy=on)",
        deploy: "deploy: ativando malha neural…",
        render: "render: preparando superfície core -> /core",
        success: "DEPLOY SUCCESS :: IRREVERSO_OS READY",
      },
      en: {
        bootstrap: "NUVE/BOOTSTRAP",
        fabric: "fabric: establishing secure mesh…",
        tls: "tls: session negotiated (forward-secrecy=on)",
        deploy: "deploy: activating neural mesh…",
        render: "render: preparing core surface -> /core",
        success: "DEPLOY SUCCESS :: IRREVERSO_OS READY",
      },
      es: {
        bootstrap: "NUVE/BOOTSTRAP",
        fabric: "fabric: estableciendo malla segura…",
        tls: "tls: sesión negociada (forward-secrecy=on)",
        deploy: "deploy: activando malla neural…",
        render: "render: preparando superficie core -> /core",
        success: "DEPLOY SUCCESS :: IRREVERSO_OS READY",
      },
    }[L];

    return [
      `${phrases.bootstrap} :: instance=NUVE_CORE_0110 :: seed=${seed}`,
      `region: ${region} • zone: ${zone} • build: IRREVERSO_OS v${build} (${commit})`,
      phrases.fabric,
      `net: latency=${latency} jitter=${jitter} loss=${loss} • route=stable`,
      `dns: resolving services -> canon | archive | telemetry | relay`,
      phrases.tls,
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
      phrases.deploy,
      `mesh: synapses online -> routing gradients`,
      phrases.render,
      `entity: generating presence layer (non-judgement)`,
      `NUVE: decision layer online (autonomous)`,
      `handoff: switching control plane -> READY`,
      `status: build stable -> preparing transition`,
      `…`,
      phrases.success,
    ];
  }, [seed, resolvedLang]);

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

  useEffect(() => {
    if (phase === "BREACH") {
      setBreachNote(T.breach_note_1);

      const a = setTimeout(() => {
        setGlitch(true);
        setBreachNote(T.breach_note_2);
      }, 850);

      const b = setTimeout(() => {
        setBreachNote(T.breach_note_3);
        setGlitch(false);
      }, 1650);

      const c = setTimeout(() => {
        setGlitch(true);
        setBreachNote(T.breach_note_4);
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
      setResetNote(T.reset_note_1);

      const a = setTimeout(() => setResetNote(T.reset_note_2), 620);
      const b = setTimeout(() => setResetNote(T.reset_note_3), 1380);

      return () => {
        clearTimeout(a);
        clearTimeout(b);
      };
    }

    if (phase === "DEPLOY") {
      const i = setInterval(() => {
        if (Math.random() > 0.78) {
          setGlitch(true);
          setTimeout(() => setGlitch(false), 120 + Math.floor(Math.random() * 140));
        }
      }, 820);
      return () => clearInterval(i);
    }
  }, [phase, T]);

  useEffect(() => {
    const start = Date.now();
    const tick = window.setInterval(() => {
      const t = Date.now() - start;
      setProgress(clamp(Math.round((t / durationMs) * 100), 0, 100));
    }, 50);
    return () => window.clearInterval(tick);
  }, [durationMs]);

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
      if (i >= script.length) window.clearInterval(feed);
    }, interval);

    return () => window.clearInterval(feed);
  }, [phase, deployMs, script]);

  // WebGL shader background
  useEffect(() => {
    const canvasEl = canvasRef.current;
    if (!canvasEl) return;

    const gl = canvasEl.getContext("webgl", { antialias: false, alpha: true, preserveDrawingBuffer: false });
    if (!gl) return;

    const c = canvasEl;
    const g = gl;

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
      uniform float u_phase;
      uniform float u_glitch;

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
        float c2 = h21(i+vec2(0,1));
        float d = h21(i+vec2(1,1));
        vec2 u = f*f*(3.0-2.0*f);
        return mix(a,b,u.x) + (c2-a)*u.y*(1.0-u.x) + (d-b)*u.x*u.y;
      }

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

      float lineDist(vec2 p, float w){
        p = abs(fract(p)-0.5);
        float d = min(p.x, p.y);
        return smoothstep(w, 0.0, d);
      }

      void main(){
        vec2 uv = v_uv;
        vec2 p = (uv*2.0-1.0);
        p.x *= u_res.x/u_res.y;

        float t = u_time;

        float n = fbm(p*1.25 + vec2(0.0, t*0.03));
        float neb = smoothstep(0.25, 0.95, n);

        float deployK = smoothstep(2.4, 3.0, u_phase);

        vec2 gp = p*3.4 + vec2(t*0.06, -t*0.04);
        float grid = lineDist(gp, 0.05) * 0.35;

        vec2 sp = p*1.8 + vec2(t*0.05, t*0.02);
        float pts = 0.0;
        for(int i=0;i<10;i++){
          vec2 q = sp + vec2(float(i)*0.37, float(i)*0.21);
          vec2 id = floor(q);
          vec2 f = fract(q)-0.5;
          float r = h21(id);
          vec2 c3 = vec2(fract(r*13.7)-0.5, fract(r*7.9)-0.5);
          float d2 = length(f - c3);
          pts += smoothstep(0.12, 0.0, d2) * 0.12;
        }

        float gg = u_glitch;
        float slice = step(0.82, noise(vec2(t*3.0, uv.y*18.0))) * gg;
        float xshift = slice * (noise(vec2(uv.y*40.0, t*6.0)) - 0.5) * 0.12;
        uv.x += xshift;

        vec2 p2 = (uv*2.0-1.0);
        p2.x *= u_res.x/u_res.y;

        float n2 = fbm(p2*1.25 + vec2(0.0, t*0.03));
        float neb2 = smoothstep(0.25, 0.95, n2);

        vec3 base = vec3(0.02, 0.015, 0.04);
        vec3 cyan = vec3(0.28, 0.98, 0.95);
        vec3 vio  = vec3(0.64, 0.28, 0.95);
        vec3 mag  = vec3(0.95, 0.35, 0.72);

        float glow = neb2*0.22 + neb*0.10;
        float mesh = (grid + pts) * (0.18 + deployK*1.2);

        vec3 col = base;
        col += cyan * (glow*0.35);
        col += vio  * (glow*0.22);
        col += mag  * (glow*0.06);

        col += cyan * (mesh*0.55);
        col += vio  * (mesh*0.30);

        float breachK = smoothstep(0.9, 1.0, u_phase) * (1.0 - smoothstep(1.8, 2.0, u_phase));
        col += mag * breachK * (0.28 + 0.10*sin(t*30.0));

        float v = smoothstep(1.4, 0.2, length(p2));
        col *= v;

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

    const buf = g.createBuffer();
    if (!buf) return;

    g.bindBuffer(g.ARRAY_BUFFER, buf);
    g.bufferData(g.ARRAY_BUFFER, new Float32Array([-1,-1, 1,-1, -1,1, -1,1, 1,-1, 1,1]), g.STATIC_DRAW);

    const locPos = g.getAttribLocation(prog, "a_pos");
    g.enableVertexAttribArray(locPos);
    g.vertexAttribPointer(locPos, 2, g.FLOAT, false, 0, 0);

    const uRes = g.getUniformLocation(prog, "u_res");
    const uTime = g.getUniformLocation(prog, "u_time");
    const uPhase = g.getUniformLocation(prog, "u_phase");
    const uGlitch = g.getUniformLocation(prog, "u_glitch");

    function resize() {
      const dpr = Math.min(2, window.devicePixelRatio || 1);
      const w = Math.floor(c.clientWidth * dpr);
      const h = Math.floor(c.clientHeight * dpr);

      if (c.width !== w || c.height !== h) {
        c.width = w;
        c.height = h;
        g.viewport(0, 0, w, h);
      }

      g.useProgram(prog);
      if (uRes) g.uniform2f(uRes, c.width, c.height);
    }

    const onResize = () => resize();
    window.addEventListener("resize", onResize);

    startRef.current = performance.now();

    const loop = () => {
      const now = performance.now();
      const t = (now - startRef.current) / 1000;

      resize();
      g.useProgram(prog);
      if (uTime) g.uniform1f(uTime, t);

      const ph = phase === "ORBIT" ? 0 : phase === "BREACH" ? 1 : phase === "RESET" ? 2 : 3;
      if (uPhase) g.uniform1f(uPhase, ph);
      if (uGlitch) g.uniform1f(uGlitch, glitch ? 1 : 0);

      g.drawArrays(g.TRIANGLES, 0, 6);
      rafRef.current = requestAnimationFrame(loop);
    };

    rafRef.current = requestAnimationFrame(loop);

    return () => {
      window.removeEventListener("resize", onResize);
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      try { g.deleteProgram(prog); } catch {}
    };
  }, [phase, glitch]);

  return (
    <main className={`bootRootV2 ${glitch ? "isGlitch" : ""}`}>
      <canvas ref={canvasRef} className="bootShader" aria-hidden="true" />
      <div className="bootGlitchOverlay" aria-hidden="true" />

      {phase === "ORBIT" && (
        <section className="orbitPanelV2">
          <div className="orbitHeadV2">
            <div className="orbitTitleV2">IRREVERSO OS</div>
            <div className="orbitMetaV2">{T.orbit_meta}</div>
          </div>
          <div className="orbitBodyV2">
            <div className="orbitGlyphV2" aria-hidden="true" />
            <div className="orbitTextV2">
              <div className="mono">{T.orbit_scanning}</div>
              <div className="mono weak">{T.orbit_align}</div>
              <div className="mono weak">{T.orbit_no}</div>
              <div className="mono faint" style={{ marginTop: 10 }}>seed:{seed}</div>
            </div>
          </div>
        </section>
      )}

      {phase === "BREACH" && (
        <section className="breachPanelV2" role="alert" aria-label="Unauthorized access warning">
          <div className="breachHeaderV2">
            <span className="tag">{T.breach_access}</span>
            <span className="tag danger">{T.breach_unauth}</span>
          </div>
          <div className="breachTitleV2">{T.breach_title}</div>
          <div className="breachMsgV2">
            {T.breach_msg_a} <span className="dangerText">{T.breach_msg_b}</span> {T.breach_msg_c}
          </div>
          <div className="breachListV2 mono">
            <div>{T.breach_try}</div>
            <div>{T.breach_status}</div>
            <div>• {breachNote}</div>
          </div>
          <div className="breachPulseV2 mono" aria-hidden="true">{T.breach_observing}</div>
        </section>
      )}

      {phase === "RESET" && (
        <section className="resetPanelV2" aria-label="System reset">
          <div className="resetTitleV2 mono">{T.reset_title}</div>
          <div className="resetSubV2 mono">{resetNote}</div>
          <div className="resetStackV2 mono">
            <div>{T.reset_kill}</div>
            <div>{T.reset_cache}</div>
            <div>{T.reset_index}</div>
            <div>{T.reset_handoff}</div>
          </div>
          <div className="resetSpinnerV2" aria-hidden="true" />
        </section>
      )}

      {phase === "DEPLOY" && (
        <section className="deployPanelV2">
          <div className="deployTopV2">
            <div className="deployTitleV2">IRREVERSO OS</div>
            <div className="deployMetaV2">{T.deploy_meta}</div>
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
            <div className="bar"><div className="fill" style={{ width: `${progress}%` }} /></div>
            <div className="info mono"><span>{T.deploy_footer_left}</span><span>{progress}%</span></div>
          </div>

          <div className="hint mono">{T.deploy_hint}</div>
        </section>
      )}
    </main>
  );
}
