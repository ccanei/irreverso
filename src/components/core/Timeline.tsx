"use client";

import { I18N, type Lang } from "@/lib/i18n";

const YEARS = [1983, 1991, 2001, 2010, 2016, 2020, 2024, 2026, 2030, 2035, 2040, 2044, 2107];

export default function Timeline({
  lang,
  activeYear,
  onPickYear,
}: {
  lang: Lang;
  activeYear: number;
  onPickYear: (y: number) => void;
}) {
  const T = I18N[lang];

  return (
    <div className="timelineBar">
      <div className="timelineTitle">
        {T.timeline} • 1983 → 2107
      </div>
      <div className="timelineYears">
        {YEARS.map((y) => (
          <button
            key={y}
            className={`yearBtn ${activeYear === y ? "active" : ""}`}
            onClick={() => onPickYear(y)}
            aria-pressed={activeYear === y}
          >
            {y}
          </button>
        ))}
      </div>
    </div>
  );
}
