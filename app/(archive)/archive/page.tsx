"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { CANON_EVENTS } from "../../../lib/bookCanon";
import { ERA_MATRIX as eraMatrix, ERA_TIMELINE, type EraKey, type EraModule } from "../../../lib/eraMatrix";
import { eraToPartMapper, partBoundaries, type TrilogyPart } from "../../../lib/bookStructure";
import { readClearance, updateClearance } from "../../../lib/clearance";
import { useSystemState } from "../../../components/system/SystemProvider";

type ArchiveType = "Entity" | "Company" | "Character" | "Protocol" | "Incident";
type ArchiveStatus = "Ativo" | "Extinto" | "Reclassificado" | "Oculto";
type Confidentiality = "Baixo" | "Médio" | "Alto" | "Crítico";

type ArchiveRecord = {
  id: string;
  year: number;
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
  if (type === "Protocol" || type === "Incident") return "Crítico";
  if (year >= 2045) return "Alto";
  return "Médio";
}

function partLabel(part: TrilogyPart) {
  return partBoundaries[part].label;
}

function moduleToRecord(module: EraModule, year: EraKey, type: Exclude<ArchiveType, "Incident">, influence: string, documentLayer: boolean): ArchiveRecord {
  const part = eraToPartMapper(year);
  return {
    id: `${year}-${module.slug}`,
    year,
    part,
    type,
    label: module.label,
    summary: module.summary,
    status: inferStatus(year, type),
    confidentiality: inferConfidentiality(year, type),
    timeline: [`${year}: ${module.summary}`, `Parte: ${partLabel(part)}`, `Estado operacional: ${inferStatus(year, type)}`],
    relations: module.fragments,
    influence,
    documentLayer,
  };
}

export default function ArchiveMatrixPage() {
  const { activeEra, setActiveEra, clearance, refreshClearance } = useSystemState();
  const [matrixOn, setMatrixOn] = useState(true);
  const [selected, setSelected] = useState<ArchiveRecord | null>(null);
  const [partFilter, setPartFilter] = useState<TrilogyPart | "ALL">("ALL");
  const [typeFilter, setTypeFilter] = useState<ArchiveType | "ALL">("ALL");
  const [statusFilter, setStatusFilter] = useState<ArchiveStatus | "ALL">("ALL");
  const [confidentialityFilter, setConfidentialityFilter] = useState<Confidentiality | "ALL">("ALL");
  const touchStart = useRef<number | null>(null);
  const sessionStart = useRef<number>(Date.now());

  const eraData = eraMatrix[activeEra];

  const records = useMemo<ArchiveRecord[]>(() => {
    const items: ArchiveRecord[] = [
      ...eraData.entities.map((item) => moduleToRecord(item, activeEra, "Entity", eraData.whisper, Boolean(eraData.printReference))),
      ...eraData.companies.map((item) => moduleToRecord(item, activeEra, "Company", eraData.whisper, Boolean(eraData.printReference))),
      ...eraData.characters.map((item) => moduleToRecord(item, activeEra, "Character", eraData.whisper, Boolean(eraData.printReference))),
      ...eraData.protocols.map((item) => moduleToRecord(item, activeEra, "Protocol", eraData.whisper, Boolean(eraData.printReference))),
    ];

    CANON_EVENTS.filter((event) => event.year === activeEra).forEach((event) => {
      const part = eraToPartMapper(activeEra);
      items.push({
        id: `${activeEra}-${event.title}`,
        year: activeEra,
        part,
        type: "Incident",
        label: event.title,
        summary: event.details.join(" · "),
        status: "Reclassificado",
        confidentiality: "Crítico",
        timeline: [`${activeEra}: ${event.title}`, ...event.details],
        relations: event.related,
        influence: "Incidente dominante no eixo temporal.",
        documentLayer: activeEra >= 2044,
      });
    });

    return items;
  }, [activeEra, eraData]);

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (event.key.toLowerCase() === "a") setMatrixOn((state) => !state);
      if (event.key === "Escape") setSelected(null);
    };

    window.addEventListener("keydown", onKey);
    const sync = window.setInterval(() => {
      updateClearance({
        sessionMs: Date.now() - sessionStart.current,
      });
      refreshClearance();
    }, 1200);

    refreshClearance();
    return () => {
      window.removeEventListener("keydown", onKey);
      window.clearInterval(sync);
    };
  }, [refreshClearance]);

  useEffect(() => {
    const current = readClearance();
    if (current.erasVisited.includes(activeEra)) return;
    updateClearance({ erasVisited: [...current.erasVisited, activeEra], interactions: current.interactions + 1 });
    refreshClearance();
  }, [activeEra, refreshClearance]);

  const filtered = useMemo(() => {
    return records.filter((record) => {
      if (partFilter !== "ALL" && record.part !== partFilter) return false;
      if (typeFilter !== "ALL" && record.type !== typeFilter) return false;
      if (statusFilter !== "ALL" && record.status !== statusFilter) return false;
      if (confidentialityFilter !== "ALL" && record.confidentiality !== confidentialityFilter) return false;
      return true;
    });
  }, [records, partFilter, typeFilter, statusFilter, confidentialityFilter]);

  const part = eraToPartMapper(activeEra);

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

      <aside className="archive-filters">
        <h2>Filtros Operacionais</h2>
        <label>
          Era
          <select value={activeEra} onChange={(event) => setActiveEra(Number(event.target.value) as EraKey)}>
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
        <p className="clearance">Clearance: {clearance.level}</p>
      </aside>

      <section className="archive-grid" aria-live="polite">
        {filtered.length === 0 ? <p>Arquivo ainda não classificado para esta era.</p> : null}
        {filtered.map((record, index) => (
          <button
            key={record.id}
            className={`archive-card ${record.year === activeEra ? "dominant" : ""}`}
            style={{ animationDelay: `${index * 40}ms` }}
            onClick={() => {
              setSelected(record);
              const current = readClearance();
              const openedEntities = current.openedEntities.includes(record.id) ? current.openedEntities : [...current.openedEntities, record.id];
              updateClearance({ interactions: current.interactions + 1, openedEntities });
              refreshClearance();
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

      {selected ? (
        <button className="profile-shell" onClick={() => setSelected(null)} type="button">
          <article className={`entity-profile profile-${selected.type.toLowerCase()}`} onClick={(event) => event.stopPropagation()}>
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
