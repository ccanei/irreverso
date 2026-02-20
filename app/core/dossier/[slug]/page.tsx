import Link from "next/link";
import { BOOK_QUOTES, CANON_ENTITIES, CANON_EVENTS, ENTITY_DOSSIERS, relatedQuotes } from "../../../../lib/bookCanon";

export default async function DossierPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const entity = CANON_ENTITIES.find((item) => item.slug === slug);

  if (!entity) {
    return (
      <main className="core-shell">
        <section className="core-panel">
          <p>dossier não encontrado</p>
          <Link href="/core">voltar</Link>
        </section>
      </main>
    );
  }

  const events = CANON_EVENTS.filter((event) => event.related.includes(slug));
  const quotes = relatedQuotes(slug);

  return (
    <main className="core-shell">
      <section className="core-panel">
        <p className="panel-title">DOSSIER // {entity.name}</p>
        {(ENTITY_DOSSIERS[slug] || []).map((line) => (
          <p key={line}>• {line}</p>
        ))}
      </section>
      <section className="core-panel">
        <p className="panel-title">EVENTOS RELACIONADOS</p>
        {events.map((event) => (
          <article key={event.year}>
            <p>{event.year} — {event.title}</p>
            {event.details.map((detail) => <p key={detail}>{detail}</p>)}
          </article>
        ))}
      </section>
      <section className="core-panel">
        <p className="panel-title">QUOTES RELACIONADAS</p>
        {quotes.map((quote) => <p key={quote}>{quote}</p>)}
        <p>{BOOK_QUOTES[0]}</p>
      </section>
      <Link href="/core">retornar ao portal</Link>
    </main>
  );
}
