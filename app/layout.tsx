import { headers } from "next/headers";
import "./globals.css";
import { AppFrame } from "../components/system/AppFrame";
import type { SiteMode } from "../lib/dominion";

export const metadata = {
  title: "IRREVERSO",
  description: "registro interno",
};

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const requestHeaders = await headers();
  const initialMode = requestHeaders.get("x-irv-mode") === "stable" ? "stable" : "breach";

  return (
    <html lang="pt-BR">
      <body>
        <AppFrame initialMode={initialMode as SiteMode}>{children}</AppFrame>
      </body>
    </html>
  );
}
