import { SystemStatus } from "../../components/SystemStatus";
import { PresenceWhisper } from "./_components/presence-whisper";
import { FutureLeak } from "../../components/FutureLeak";

export default function Home() {
  return (
    <main className="center">
      <FutureLeak />

      <div className="terminal terminal--narrow">
        <p>camada aberta</p>
        <p>sinais em baixa frequência</p>
        <p>observação passiva</p>
        <p className="pulse">escuta contínua</p>

        <PresenceWhisper />

        <div className="quiet-links">
          <a href="/archive" className="enter">
            archive
          </a>
          <a href="/signals" className="enter">
            signals
          </a>
          <a href="/transmissions" className="enter">
            transmissions
          </a>
        </div>

        <SystemStatus />
      </div>
    </main>
  );
}
