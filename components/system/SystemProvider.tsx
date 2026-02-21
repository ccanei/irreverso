"use client";

import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import { ERA_TIMELINE, type EraKey } from "../../lib/eraMatrix";
import { readClearance, type ClearanceState } from "../../lib/clearance";

const ERA_KEY = "irreverso.coreEra";

type SystemContextValue = {
  activeEra: EraKey;
  setActiveEra: (era: EraKey) => void;
  clearance: ClearanceState;
  refreshClearance: () => void;
};

const SystemContext = createContext<SystemContextValue | null>(null);

export function SystemProvider({ children }: { children: ReactNode }) {
  const [activeEra, setActiveEraState] = useState<EraKey>(2044);
  const [clearance, setClearance] = useState<ClearanceState>(readClearance());

  useEffect(() => {
    const savedEra = Number(window.localStorage.getItem(ERA_KEY)) as EraKey;
    if (ERA_TIMELINE.includes(savedEra)) {
      setActiveEraState(savedEra);
    }

    const onStorage = (event: StorageEvent) => {
      if (event.key === ERA_KEY && event.newValue) {
        const next = Number(event.newValue) as EraKey;
        if (ERA_TIMELINE.includes(next)) setActiveEraState(next);
      }
    };

    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, []);

  const setActiveEra = (era: EraKey) => {
    setActiveEraState(era);
    window.localStorage.setItem(ERA_KEY, String(era));
  };

  const refreshClearance = () => setClearance(readClearance());

  const value = useMemo(
    () => ({ activeEra, setActiveEra, clearance, refreshClearance }),
    [activeEra, clearance],
  );

  return <SystemContext.Provider value={value}>{children}</SystemContext.Provider>;
}

export function useSystemState() {
  const context = useContext(SystemContext);
  if (!context) {
    throw new Error("useSystemState must be used within SystemProvider");
  }
  return context;
}
