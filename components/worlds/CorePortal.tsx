"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { ERA_MATRIX, ERA_TIMELINE, getModulesForEra, type CanonModule, type EraKey } from "../../lib/eraMatrix";
import { pulseDwell, trackCoreSession } from "../../lib/worldState";
import { readPresence } from "../../lib/presence";
import { useSystemState } from "../system/SystemProvider";
import { OSModeToggle } from "../system/OSModeToggle";

const BOOT_KEY = "irreverso.coreBootSeen";
const SOUND_KEY = "irreverso.coreSoundEnabled";
const NUVE_COOLDOWN_KEY = "irreverso.nuveDistortionSeen";

type AudioRefs = {
  ctx: AudioContext | null;
  ambience: OscillatorNode | null;
  ambienceGain: GainNode | null;
};

function CoreBootSequence({ done, shortBoot }: { done: boolean; shortBoot: boolean }) {
  return (
    <div className={`core-boot ${done ? "done" : ""} ${shortBoot ? "short" : ""}`}>
      <p className="boot-mark">IRREVERSO OS</p>
      <p className="boot-rule" />
      <p>core kernel handshake...</p>
      <p>temporal auth lattice aligned</p>
      <p>presence route: /core // document layer sync</p>
    </div>
  );
}

function DossierOverlay({ module, onClose }: { module: CanonModule | null; onClose: () => void }) {
  const dialogRef = useRef<HTMLElement | null>(null);

  useEffect(() => {
    if (!module) return;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        onClose();
        return;
      }

      if (event.key !== "Tab" || !dialogRef.current) return;
      const focusable = dialogRef.current.querySelectorAll<HTMLElement>(
        "button, [href], input, select, textarea, [tabindex]:not([tabindex='-1'])",
      );

      if (focusable.length === 0) {
        event.preventDefault();
        dialogRef.current.focus();
        return;
      }

      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      const current = document.activeElement;

      if (event.shiftKey && current === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && current === last) {
        event.preventDefault();
        first.focus();
      }
    };

    window.requestAnimationFrame(() => {
      dialogRef.current?.focus();
    });

    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", onKey);
    };
  }, [module, onClose]);

  if (!module) return null;

  return (
    <div className="dossier-shell" onClick={onClose}>
      <section
        ref={dialogRef}
        aria-labelledby={`dossier-title-${module.slug}`}
        aria-modal="true"
        className="dossier-pane"
        onClick={(event) => event.stopPropagation()}
        role="dialog"
        tabIndex={-1}
      >
        <p className="dossier-type">{module.type}</p>
        <h2 id={`dossier-title-${module.slug}`}>{module.label}</h2>
        <p className="dossier-summary">{module.summary}</p>
        <div className="dossier-fragments">
          {module.fragments.map((fragment) => (
            <p key={fragment}>{fragment}</p>
          ))}
        </div>
        <div className="dossier-restricted">
          <p>restricted segments</p>
          {module.restricted.map((line) => (
            <p key={line} className="redacted">{line}</p>
          ))}
        </div>
      </section>
    </div>
  );
}

export function CorePortal() {
  const router = useRouter();
  const { activeEra: era, setActiveEra: setEra } = useSystemState();
  const [bootDone, setBootDone] = useState(false);
  const [shortBoot, setShortBoot] = useState(false);
  const [pointer, setPointer] = useState({ x: 0, y: 0 });
  const [activeModule, setActiveModule] = useState<CanonModule | null>(null);
  const [focusSlug, setFocusSlug] = useState<string | null>(null);
  const [soundEnabled, setSoundEnabled] = useState(false);
  const [nuvePulse, setNuvePulse] = useState(false);
  const [eraTransition, setEraTransition] = useState(false);
  const [eraSummaryVisible, setEraSummaryVisible] = useState(false);
  const summaryTimeoutRef = useRef<number | null>(null);
  const transitionTimeoutRef = useRef<number | null>(null);
  const audioRef = useRef<AudioRefs>({ ctx: null, ambience: null, ambienceGain: null });

  useEffect(() => {
    const audio = audioRef.current;
    trackCoreSession("/core");
    const dwell = window.setInterval(() => pulseDwell(), 1000);

    const seenBoot = window.localStorage.getItem(BOOT_KEY) === "1";
    setShortBoot(seenBoot);
    const timer = window.setTimeout(() => {
      setBootDone(true);
      window.localStorage.setItem(BOOT_KEY, "1");
    }, seenBoot ? 980 : 4400);

    setSoundEnabled(window.localStorage.getItem(SOUND_KEY) === "1");

    const onArchiveHotkey = (event: KeyboardEvent) => {
      if (event.key.toLowerCase() === "a") router.push("/archive");
    };
    window.addEventListener("keydown", onArchiveHotkey);

    const presence = readPresence();
    const lastSeen = Number(window.localStorage.getItem(NUVE_COOLDOWN_KEY) || "0");
    const inCooldown = Date.now() - lastSeen < 72 * 60 * 60 * 1000;
    const eligible = presence.visits >= 2 && presence.dwellTime >= 20_000;
    if (!inCooldown && eligible && Math.random() < 0.02) {
      window.setTimeout(() => {
        setNuvePulse(true);
        window.setTimeout(() => {
          setNuvePulse(false);
          window.localStorage.setItem(NUVE_COOLDOWN_KEY, String(Date.now()));
        }, 700);
      }, 1800 + Math.random() * 2500);
    }

    return () => {
      clearInterval(dwell);
      clearTimeout(timer);
      if (summaryTimeoutRef.current) window.clearTimeout(summaryTimeoutRef.current);
      if (transitionTimeoutRef.current) window.clearTimeout(transitionTimeoutRef.current);
      window.removeEventListener("keydown", onArchiveHotkey);
      if (audio.ambience) audio.ambience.stop();
      if (audio.ctx) audio.ctx.close();
    };
  }, [router]);

  const eraData = useMemo(() => ERA_MATRIX[era], [era]);
  const modules = useMemo(() => getModulesForEra(era), [era]);

  const moduleOrbits = useMemo(() => {
    return modules.map((module, index) => {
      const phase = (index / Math.max(modules.length, 1)) * Math.PI * 2;
      const radius = 21 + (index % 4) * 8 + (era % 6) + eraData.kernel.moduleDensity * 8;
      const drift = ((era + index * 5) % 14) * 0.08;
      return { module, phase, radius, drift };
    });
  }, [modules, era, eraData.kernel.moduleDensity]);

  const ensureAudio = useCallback(() => {
    const state = audioRef.current;
    if (!state.ctx) {
      const ctx = new window.AudioContext();
      const ambience = ctx.createOscillator();
      ambience.type = "triangle";
      const ambienceGain = ctx.createGain();
      ambienceGain.gain.value = 0.0001;
      ambience.connect(ambienceGain).connect(ctx.destination);
      ambience.start();
      state.ctx = ctx;
      state.ambience = ambience;
      state.ambienceGain = ambienceGain;
    }
    if (state.ctx?.state === "suspended") state.ctx.resume();
    return state;
  }, []);

  useEffect(() => {
    const state = audioRef.current;
    if (!state.ambience || !state.ambienceGain || !state.ctx) return;
    const t = state.ctx.currentTime;
    state.ambience.frequency.setValueAtTime(46 + eraData.kernel.ambience * 32, t);
    if (soundEnabled) {
      state.ambienceGain.gain.cancelScheduledValues(t);
      state.ambienceGain.gain.linearRampToValueAtTime(0.006 + eraData.kernel.ambience * 0.012, t + 0.35);
    }
  }, [eraData.kernel.ambience, soundEnabled]);

  const playTick = useCallback(() => {
    if (!soundEnabled) return;
    const state = ensureAudio();
    if (!state.ctx) return;
    const ctx = state.ctx;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = "sine";
    osc.frequency.value = 760;
    gain.gain.value = 0.0001;
    osc.connect(gain).connect(ctx.destination);
    const t = ctx.currentTime;
    gain.gain.exponentialRampToValueAtTime(0.03, t + 0.01);
    gain.gain.exponentialRampToValueAtTime(0.0001, t + 0.08);
    osc.start(t);
    osc.stop(t + 0.09);
  }, [ensureAudio, soundEnabled]);

  const playUnlock = useCallback(() => {
    if (!soundEnabled) return;
    const state = ensureAudio();
    if (!state.ctx) return;
    const ctx = state.ctx;
    const pulse = ctx.createOscillator();
    const drop = ctx.createOscillator();
    const gain = ctx.createGain();
    gain.gain.value = 0.0001;
    pulse.frequency.value = 220;
    drop.frequency.value = 84;
    pulse.type = "triangle";
    drop.type = "sine";
    pulse.connect(gain);
    drop.connect(gain);
    gain.connect(ctx.destination);
    const t = ctx.currentTime;
    gain.gain.exponentialRampToValueAtTime(0.045, t + 0.01);
    gain.gain.exponentialRampToValueAtTime(0.0001, t + 0.24);
    drop.frequency.exponentialRampToValueAtTime(43, t + 0.2);
    pulse.start(t);
    drop.start(t);
    pulse.stop(t + 0.22);
    drop.stop(t + 0.22);
  }, [ensureAudio, soundEnabled]);

  const changeEra = useCallback(
    (next: EraKey) => {
      setEra(next);
      setFocusSlug(null);
      setActiveModule(null);
      setEraTransition(true);
      setEraSummaryVisible(true);
      if (summaryTimeoutRef.current) window.clearTimeout(summaryTimeoutRef.current);
      if (transitionTimeoutRef.current) window.clearTimeout(transitionTimeoutRef.current);
      summaryTimeoutRef.current = window.setTimeout(() => setEraSummaryVisible(false), 4600);
      transitionTimeoutRef.current = window.setTimeout(() => setEraTransition(false), 560);
      playTick();
    },
    [playTick, setEra],
  );

  return (
    <main
      className={`core-os ${bootDone ? "boot-finished" : ""} ${nuvePulse ? "nuve-pulse" : ""} ${eraTransition ? "changing-era" : ""} ${activeModule ? "dossier-open" : ""}`}
      style={{
        ["--era-bg-a" as string]: eraData.palette.bgA,
        ["--era-bg-b" as string]: eraData.palette.bgB,
        ["--era-accent" as string]: eraData.palette.accent,
        ["--era-fog" as string]: eraData.palette.fog,
        ["--bloom" as string]: String(eraData.palette.bloom),
        ["--kernel-breathe-ms" as string]: `${eraData.kernel.breatheMs}ms`,
        ["--kernel-distortion" as string]: String(eraData.kernel.distortion),
        ["--module-density" as string]: String(eraData.kernel.moduleDensity),
        ["--px" as string]: String(pointer.x),
        ["--py" as string]: String(pointer.y),
      }}
      onPointerMove={(event) => {
        const x = event.clientX / window.innerWidth - 0.5;
        const y = event.clientY / window.innerHeight - 0.5;
        setPointer({ x, y });
      }}
    >
      <CoreBootSequence done={bootDone} shortBoot={shortBoot} />

      <div className="world-fog" />
      <div className="world-vignette" />
      <div className="kernel-shell">
        <div className="kernel-core" />
        <div className="kernel-ring ring-a" />
        <div className="kernel-ring ring-b" />
        <div className="kernel-ring ring-c" />
        <div className="kernel-shard shard-a" />
        <div className="kernel-shard shard-b" />
        <div className="kernel-shard shard-c" />
      </div>

      <div className="module-field">
        {moduleOrbits.map(({ module, phase, radius, drift }, index) => {
          const x = Math.cos(phase + drift) * radius;
          const y = Math.sin(phase + drift) * (radius * 0.45);
          const focused = focusSlug === module.slug;
          return (
            <button
              key={`${era}-${module.slug}`}
              className={`orbital-module ${focused ? "focused" : ""}`}
              style={{
                transform: `translate3d(calc(-50% + ${x}vmin), calc(-50% + ${y}vmin), 0px) rotateX(${(index % 5) * 4 - 8}deg)`,
                animationDelay: `${index * -0.5}s`,
              }}
              onMouseEnter={() => setFocusSlug(module.slug)}
              onClick={() => {
                setFocusSlug(module.slug);
                setActiveModule(module);
                playUnlock();
              }}
              type="button"
            >
              <span>{module.label}</span>
              <small>{module.type}</small>
            </button>
          );
        })}
      </div>

      <section className="core-hud">
        <p className="hud-title">IRREVERSO — Fragmentos da Realidade</p>
        <p className="hud-sub">Core Kernel // {eraData.documentLayer}</p>
        <p className="hud-whisper">{eraData.whisper}</p>
        {eraData.printReference ? <p className="hud-reference">Registro completo disponível em instância física.</p> : null}
        <OSModeToggle />
        <button className="kernel-link" onClick={() => router.push("/archive")} type="button">
          abrir archive matrix
        </button>
        <button
          className="sound-toggle"
          onClick={() => {
            setSoundEnabled((state) => {
              const next = !state;
              window.localStorage.setItem(SOUND_KEY, next ? "1" : "0");
              if (next) {
                const audio = ensureAudio();
                if (audio.ambienceGain && audio.ctx) {
                  const t = audio.ctx.currentTime;
                  audio.ambienceGain.gain.cancelScheduledValues(t);
                  audio.ambienceGain.gain.linearRampToValueAtTime(0.012, t + 0.35);
                }
              } else if (audioRef.current.ambienceGain && audioRef.current.ctx) {
                const t = audioRef.current.ctx.currentTime;
                audioRef.current.ambienceGain.gain.cancelScheduledValues(t);
                audioRef.current.ambienceGain.gain.linearRampToValueAtTime(0.0001, t + 0.2);
              }
              playTick();
              return next;
            });
          }}
          type="button"
        >
          sound: {soundEnabled ? "on" : "off"}
        </button>
      </section>

      <section className="era-dial visible">
        {ERA_TIMELINE.map((item) => (
          <button key={item} onClick={() => changeEra(item)} className={item === era ? "active" : ""} type="button">
            {item}
          </button>
        ))}
      </section>

      <section className={`era-summary ${eraSummaryVisible ? "visible" : ""}`}>
        <p>{era}</p>
        {eraData.summary.map((line) => (
          <p key={line}>{line}</p>
        ))}
      </section>

      {nuvePulse ? <div className="nuve-glyph" /> : null}
      <DossierOverlay module={activeModule} onClose={() => setActiveModule(null)} />
    </main>
  );
}
