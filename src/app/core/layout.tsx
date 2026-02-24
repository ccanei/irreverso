import type { ReactNode } from "react";
import CoreShell from "@/components/core/CoreShell";

export default function CoreLayout({ children }: { children: ReactNode }) {
  return <CoreShell>{children}</CoreShell>;
}
