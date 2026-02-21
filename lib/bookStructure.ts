export const trilogyRange = {
  start: 1983,
  end: 2107,
} as const;

export const partBoundaries = {
  I: { label: "Parte I — O Ano que Não Existiu", start: 1983, end: 2044 },
  II: { label: "Parte II — A Realidade Assistida", start: 2045, end: 2078 },
  III: { label: "Parte III — A Vida Autorizada", start: 2078, end: 2107 },
  IV: { label: "Parte IV — O Imprevisível", start: 2108, end: 9999 },
} as const;

export type TrilogyPart = keyof typeof partBoundaries;

export function eraToPartMapper(year: number): TrilogyPart {
  if (year <= partBoundaries.I.end) return "I";
  if (year >= partBoundaries.III.start && year <= partBoundaries.III.end) return "III";
  if (year >= partBoundaries.II.start && year <= partBoundaries.II.end) return "II";
  return "IV";
}
