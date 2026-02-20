import "./globals.css";
import { AppFrame } from "../components/system/AppFrame";

export const metadata = {
  title: "IRREVERSO",
  description: "registro interno",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR">
      <body>
        <AppFrame>{children}</AppFrame>
      </body>
    </html>
  );
}
