import { create } from "zustand";

type NuveState = "observing" | "persistent";

type Store = {
  year: number;
  yearsVisited: Set<number>;
  nuveState: NuveState;

  setYear: (y: number) => void;
  markVisited: (y: number) => void;
  setNuveState: (s: NuveState) => void;

  menuOpen: boolean;
  setMenuOpen: (v: boolean) => void;
};

export const useIrreverso = create<Store>((set, get) => ({
  year: new Date().getFullYear(),
  yearsVisited: new Set<number>(),
  nuveState: "observing",

  setYear: (y) => set({ year: y }),
  markVisited: (y) => {
    const next = new Set(get().yearsVisited);
    next.add(y);
    set({ yearsVisited: next });
  },
  setNuveState: (s) => set({ nuveState: s }),

  menuOpen: false,
  setMenuOpen: (v) => set({ menuOpen: v }),
}));
