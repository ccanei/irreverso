import "./globals.css";

export const metadata = {
  title: "IRREVERSO",
  description: "registro interno",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR">
      <body>{children}</body>
    </html>
  );
}
