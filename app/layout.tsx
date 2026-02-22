import "./globals.css";
import { SystemProvider } from "../components/system/SystemProvider";
import { IntrusionTransmission } from "../components/IntrusionTransmission";
import { CommandPalette } from "../components/system/CommandPalette";

export const metadata = {
  title: "IRREVERSO",
  description: "registro interno",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR">
      <body><SystemProvider>{children}<IntrusionTransmission /><CommandPalette /></SystemProvider></body>
    </html>
  );
}
