import "./globals.css";
import { SystemProvider } from "../components/system/SystemProvider";

export const metadata = {
  title: "IRREVERSO",
  description: "registro interno",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR">
      <body><SystemProvider>{children}</SystemProvider></body>
    </html>
  );
}
