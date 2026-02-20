"use client";

import { ReactNode } from "react";
import { ConsoleShell } from "./ConsoleShell";
import type { SiteMode } from "../../lib/dominion";

export function AppFrame({ children, initialMode }: { children: ReactNode; initialMode: SiteMode }) {
  return <ConsoleShell initialMode={initialMode}>{children}</ConsoleShell>;
}
