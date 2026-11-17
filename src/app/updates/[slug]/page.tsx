import Link from "next/link";
import { notFound } from "next/navigation";
import { getPublication, getPublications, statusLabel } from "@/lib/publications";
export function generateStaticParams() { return getPublications().map(entry => ({ slug: entry.id })); }
export async function generateMetadata({ params }: { params: Promise<{slug: string}> }) {
  const entry = getPublication((await params).slug);
  return entry ? {title: entry.title, description: entry.summary} : {};
}
export default async function UpdatePage({ params }: {params: Promise<{slug: string}>}) {
  const entry = getPublication((await params).slug); if (!entry) notFound();
  return <main className="content-page article-page"><article>
    <Link className="back" href="/updates">Çalışma günlüğüne dön</Link>
    <header><p className="journal-meta"><time dateTime={entry.date}>{entry.date}</time> · {statusLabel(entry.status)}</p><h1>{entry.title}</h1><p className="lede">{entry.summary}</p></header>
    <div className="article-body">{entry.paragraphs.map((p, i) => <p key={i}>{p}</p>)}
    <h2>Ortaya çıkanlar</h2><ul>{entry.outcomes.map(p => <li key={p}>{p}</li>)}</ul>
    <h2>Açık kalanlar</h2><p>{entry.limitations}</p></div>
    <nav className="case-links" aria-label="Çalışma bağlantıları">{entry.links.map(link => <a key={link.href} href={link.href} rel="noopener noreferrer">{link.label}</a>)}{entry.type === "project" && <Link href={`/work/${entry.id}`}>Proje dosyası</Link>}</nav>
  </article></main>;
}
