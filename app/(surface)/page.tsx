import { PresenceWhisper } from "./_components/presence-whisper";

export default function Home() {
  return (
    <main className="center">
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
        </div>
      </div>
    </main>
  );
}
