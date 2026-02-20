"use client";

import { ReactNode } from "react";
import { ConsoleShell } from "./ConsoleShell";

export function AppFrame({ children }: { children: ReactNode }) {
  return <ConsoleShell>{children}</ConsoleShell>;
}
