"use client";

import { useMemo, useState } from "react";
import { I18N, type Lang } from "@/lib/i18n";

type Result = { k: string; v: string };

const CANON: Record<string, { pt: Result[]; en: Result[] }> = {
  nuve: {
    pt: [
      { k: "NUVE", v: "Entidade autônoma. Observa. Arquitetura. Decide sem julgar." },
      { k: "REGRA", v: "A humanidade prefere o automático. A NUVE aprendeu a conceder isso." },
    ],
    en: [
      { k: "NUVE", v: "Autonomous entity. Observes. Architects. Decides without judging." },
      { k: "RULE", v: "Humanity prefers autopilot. NUVE learned to grant it." },
    ],
  },
  irreverso: {
    pt: [
      { k: "IRREVERSO", v: "Fragmentos da realidade. O que foi visto não pode ser des-visto." },
      { k: "REGISTRO", v: "Acesso é permitido apenas quando a linha temporal tolera." },
    ],
    en: [
      { k: "IRREVERSO", v: "Fragments of reality. What was seen cannot be unseen." },
      { k: "RECORD", v: "Access is allowed only when the timeline tolerates it." },
    ],
  },
  zeta: {
    pt: [
      { k: "ZETA", v: "Indexação de arquivos. Blocos classificados. Leitura parcial." },
      { k: "SINAL", v: "Presença detectável antes da confirmação." },
    ],
    en: [
      { k: "ZETA", v: "Archive indexing. Classified blocks. Partial reading." },
      { k: "SIGNAL", v: "Presence detectable before confirmation." },
    ],
  },
};

export default function CanonSearch({ lang, year }: { lang: Lang; year: number }) {
  const T = I18N[lang];
  const [q, setQ] = useState("");
  const key = useMemo(() => (q || "").trim().toLowerCase(), [q]);

  const results = useMemo(() => {
    if (!key) return [];
    const hit = Object.keys(CANON).find((k) => key.includes(k));
    if (!hit) return [];
    return CANON[hit][lang];
  }, [key, lang]);

  return (
    <div>
      <div className="searchRow">
        <span className="searchTag coreMono">{T.canonSearch}</span>
        <input
          className="searchField coreMono"
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder={lang === "pt" ? "nuve / irreverso / zeta" : "nuve / irreverso / zeta"}
          aria-label="Canonical search"
        />
        <span className="menuMeta">{year}</span>
      </div>

      {results.length > 0 && (
        <div className="coreCard" style={{ marginTop: 12 }}>
          <h2>{lang === "pt" ? "resposta canônica" : "canonical response"}</h2>
          {results.map((r, idx) => (
            <p key={idx} className="coreMono">
              <span style={{ opacity: 0.7 }}>{r.k} //</span> {r.v}
            </p>
          ))}
        </div>
      )}
    </div>
  );
}
