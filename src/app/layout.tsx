import "./globals.css";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "IRREVERSO OS",
  description: "Registro Autorizado — sistema vivo",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR">
      <body>{children}</body>
    </html>
  );
}
