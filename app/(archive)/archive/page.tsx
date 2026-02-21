"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { CANON_EVENTS } from "../../../lib/bookCanon";
import { ERA_MATRIX, ERA_TIMELINE, getModulesForEra, type CanonModuleType, type EraKey } from "../../../lib/eraMatrix";
import { eraToPartMapper, partBoundaries, type TrilogyPart } from "../../../lib/bookStructure";
import { readClearance, updateClearance, type ClearanceState } from "../../../lib/clearance";

type ArchiveType = CanonModuleType | "Incident";
type ArchiveStatus = "Ativo" | "Extinto" | "Reclassificado" | "Oculto";
type Confidentiality = "Baixo" | "Médio" | "Alto" | "Crítico";

type ArchiveRecord = {
  id: string;
  year: number;
  era: EraKey;
  part: TrilogyPart;
  type: ArchiveType;
  label: string;
  summary: string;
  status: ArchiveStatus;
  confidentiality: Confidentiality;
  timeline: string[];
  relations: string[];
  influence: string;
  documentLayer: boolean;
};

const ERA_KEY = "irreverso.coreEra";
const confidenceLevels: Confidentiality[] = ["Baixo", "Médio", "Alto", "Crítico"];
const statuses: ArchiveStatus[] = ["Ativo", "Extinto", "Reclassificado", "Oculto"];
const types: ArchiveType[] = ["Entity", "Company", "Character", "Protocol", "Incident"];

function inferStatus(year: number, type: ArchiveType): ArchiveStatus {
  if (type === "Incident") return "Reclassificado";
  if (year <= 2001) return "Extinto";
  if (year >= 2072) return "Oculto";
  return "Ativo";
}

function inferConfidentiality(year: number, type: ArchiveType): Confidentiality {
  if (type === "Protocol") return "Crítico";
  if (year >= 2045) return "Alto";
  return "Médio";
}

function partLabel(part: TrilogyPart) {
  return partBoundaries[part].label;
}

export default function ArchiveMatrixPage() {
  const [matrixOn, setMatrixOn] = useState(false);
  const [activeYear, setActiveYear] = useState<EraKey>(2044);
  const [selected, setSelected] = useState<ArchiveRecord | null>(null);
  const [partFilter, setPartFilter] = useState<TrilogyPart | "ALL">("ALL");
  const [typeFilter, setTypeFilter] = useState<ArchiveType | "ALL">("ALL");
  const [statusFilter, setStatusFilter] = useState<ArchiveStatus | "ALL">("ALL");
  const [confidentialityFilter, setConfidentialityFilter] = useState<Confidentiality | "ALL">("ALL");
  const [clearance, setClearance] = useState<ClearanceState | null>(null);
  const touchStart = useRef<number | null>(null);
  const sessionStart = useRef<number>(Date.now());

  const records = useMemo<ArchiveRecord[]>(() => {
    const items: ArchiveRecord[] = [];
    ERA_TIMELINE.forEach((era) => {
      const snapshot = ERA_MATRIX[era];
      const modules = getModulesForEra(era);
      modules.forEach((module) => {
        const part = eraToPartMapper(era);
        const record: ArchiveRecord = {
          id: `${era}-${module.slug}`,
          year: era,
          era,
          part,
          type: module.type,
          label: module.label,
          summary: module.summary,
          status: inferStatus(era, module.type),
          confidentiality: inferConfidentiality(era, module.type),
          timeline: [
            `${era}: ${module.summary}`,
            `Parte: ${partLabel(part)}`,
            `Estado operacional: ${inferStatus(era, module.type)}`,
          ],
          relations: module.fragments,
          influence: snapshot.whisper,
          documentLayer: Boolean(snapshot.printReference),
        };
        items.push(record);
      });

      CANON_EVENTS.filter((event) => event.year === era).forEach((event) => {
        const part = eraToPartMapper(era);
        items.push({
          id: `${era}-${event.title}`,
          year: era,
          era,
          part,
          type: "Incident",
          label: event.title,
          summary: event.details.join(" · "),
          status: "Reclassificado",
          confidentiality: "Crítico",
          timeline: [`${era}: ${event.title}`, ...event.details],
          relations: event.related,
          influence: "Incidente dominante no eixo temporal.",
          documentLayer: era >= 2044,
        });
      });
    });
    return items;
  }, []);

  useEffect(() => {
    const saved = Number(window.localStorage.getItem(ERA_KEY));
    if (ERA_TIMELINE.includes(saved as EraKey)) setActiveYear(saved as EraKey);

    const onKey = (event: KeyboardEvent) => {
      if (event.key.toLowerCase() === "a") setMatrixOn((state) => !state);
      if (event.key === "Escape") setSelected(null);
    };
    const onStorage = (event: StorageEvent) => {
      if (event.key !== ERA_KEY || !event.newValue) return;
      const value = Number(event.newValue) as EraKey;
      if (ERA_TIMELINE.includes(value)) setActiveYear(value);
    };

    window.addEventListener("keydown", onKey);
    window.addEventListener("storage", onStorage);
    const sync = window.setInterval(() => {
      const value = Number(window.localStorage.getItem(ERA_KEY)) as EraKey;
      if (ERA_TIMELINE.includes(value)) setActiveYear((current) => (current === value ? current : value));
      setClearance(
        updateClearance({
          sessionMs: Date.now() - sessionStart.current,
        }),
      );
    }, 1200);

    setClearance(readClearance());
    return () => {
      window.removeEventListener("keydown", onKey);
      window.removeEventListener("storage", onStorage);
      window.clearInterval(sync);
    };
  }, []);

  useEffect(() => {
    if (!matrixOn) return;
    const current = readClearance();
    if (current.erasVisited.includes(activeYear)) return;
    setClearance(updateClearance({ erasVisited: [...current.erasVisited, activeYear], interactions: current.interactions + 1 }));
  }, [activeYear, matrixOn]);

  const filtered = useMemo(() => {
    return records.filter((record) => {
      if (record.era !== activeYear) return false;
      if (partFilter !== "ALL" && record.part !== partFilter) return false;
      if (typeFilter !== "ALL" && record.type !== typeFilter) return false;
      if (statusFilter !== "ALL" && record.status !== statusFilter) return false;
      if (confidentialityFilter !== "ALL" && record.confidentiality !== confidentialityFilter) return false;
      return true;
    });
  }, [records, activeYear, partFilter, typeFilter, statusFilter, confidentialityFilter]);

  const part = eraToPartMapper(activeYear);

  return (
    <main
      className={`archive-matrix part-${part.toLowerCase()} ${matrixOn ? "open" : ""}`}
      onTouchStart={(event) => {
        touchStart.current = event.touches[0]?.clientX ?? null;
      }}
      onTouchEnd={(event) => {
        if (touchStart.current === null) return;
        const delta = (event.changedTouches[0]?.clientX ?? 0) - touchStart.current;
        if (Math.abs(delta) > 70) setMatrixOn(true);
        touchStart.current = null;
      }}
    >
      <section className="archive-overlay">
        <button className="archive-toggle" onClick={() => setMatrixOn((state) => !state)} type="button">
          {matrixOn ? "Kernel ativo" : "Ativar Archive Matrix"}
        </button>
        <p>atalho: tecla A · gesto lateral</p>
      </section>

      {matrixOn ? (
        <>
          <aside className="archive-filters">
            <h2>Filtros Operacionais</h2>
            <label>
              Era
              <select value={activeYear} onChange={(event) => setActiveYear(Number(event.target.value) as EraKey)}>
                {ERA_TIMELINE.map((era) => (
                  <option value={era} key={era}>
                    {era}
                  </option>
                ))}
              </select>
            </label>
            <label>
              Parte
              <select value={partFilter} onChange={(event) => setPartFilter(event.target.value as TrilogyPart | "ALL")}>
                <option value="ALL">Todas</option>
                <option value="I">I</option>
                <option value="II">II</option>
                <option value="III">III</option>
              </select>
            </label>
            <label>
              Tipo
              <select value={typeFilter} onChange={(event) => setTypeFilter(event.target.value as ArchiveType | "ALL")}>
                <option value="ALL">Todos</option>
                {types.map((type) => (
                  <option value={type} key={type}>
                    {type}
                  </option>
                ))}
              </select>
            </label>
            <label>
              Status
              <select value={statusFilter} onChange={(event) => setStatusFilter(event.target.value as ArchiveStatus | "ALL")}>
                <option value="ALL">Todos</option>
                {statuses.map((status) => (
                  <option value={status} key={status}>
                    {status}
                  </option>
                ))}
              </select>
            </label>
            <label>
              Confidencialidade
              <select value={confidentialityFilter} onChange={(event) => setConfidentialityFilter(event.target.value as Confidentiality | "ALL")}>
                <option value="ALL">Todos</option>
                {confidenceLevels.map((level) => (
                  <option value={level} key={level}>
                    {level}
                  </option>
                ))}
              </select>
            </label>
            <p className="clearance">Clearance: {clearance?.level ?? "CIVIL"}</p>
          </aside>

          <section className="archive-grid" aria-live="polite">
            {filtered.map((record, index) => (
              <button
                key={record.id}
                className={`archive-card ${record.year === activeYear ? "dominant" : ""}`}
                style={{ animationDelay: `${index * 40}ms` }}
                onClick={() => {
                  setSelected(record);
                  const current = readClearance();
                  const openedEntities = current.openedEntities.includes(record.id) ? current.openedEntities : [...current.openedEntities, record.id];
                  setClearance(updateClearance({ interactions: current.interactions + 1, openedEntities }));
                }}
                type="button"
              >
                <small>
                  {record.type} · {record.year} · {record.status}
                </small>
                <strong>{record.label}</strong>
                <p>{record.summary}</p>
              </button>
            ))}
          </section>
        </>
      ) : null}

      {selected ? (
        <button className="profile-shell" onClick={() => setSelected(null)} type="button">
          <article className="entity-profile" onClick={(event) => event.stopPropagation()}>
            <p className="profile-kicker">
              {selected.type} · {selected.status}
            </p>
            <h3>{selected.label}</h3>
            <p className="profile-summary">{selected.summary}</p>
            <p className="profile-part">Parte correspondente: {partLabel(selected.part)}</p>
            <div className="profile-columns">
              <div>
                <h4>Linha histórica</h4>
                {selected.timeline.map((line) => (
                  <p key={line}>{line}</p>
                ))}
              </div>
              <div>
                <h4>Relações</h4>
                {selected.relations.map((line) => (
                  <p key={line}>{line}</p>
                ))}
                <h4>Influência por período</h4>
                <p>{selected.influence}</p>
              </div>
            </div>
            {selected.documentLayer ? <p className="doc-note">Instância completa disponível fora deste sistema.</p> : null}
          </article>
        </button>
      ) : null}
    </main>
  );
}
