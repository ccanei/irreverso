import './globals.css';
import { FutureLeak } from '../components/FutureLeak';

export const metadata = {
  title: 'IRREVERSO',
  description: 'interface ativa',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="pt-BR">
      <body>
	{/* camada:0 :: observador necessário */}
	<meta name="irv:handshake" content="pending" />
	<meta name="irv:continuity" content="echo/authorized/absence" />
	<FutureLeak />
	{children}
      </body>
    </html>
  );
}
