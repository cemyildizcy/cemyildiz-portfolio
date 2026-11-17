import Link from "next/link";
import { getPublications, statusLabel } from "@/lib/publications";
export const metadata = { title: "Çalışma günlüğü", description: "Projelerden, deneylerden ve üretim sürecinden gerçek çalışma notları." };
export default function UpdatesPage() {
  return <main className="content-page journal-page"><Link className="back" href="/">Ana sayfaya dön</Link>
    <header className="journal-heading"><h1>Yaparken<br/>öğrendiklerim.</h1><p>Yeni projeler, küçük ilerlemeler ve geride kalan gerçek çıktılar. Bitmeyen iş burada bitmiş gibi görünmez.</p></header>
    <div className="journal-list">{getPublications().map(entry => <article key={entry.id}>
      <div className="journal-meta"><time dateTime={entry.date}>{new Intl.DateTimeFormat("tr-TR", { day: "numeric", month: "long", year: "numeric" }).format(new Date(entry.date + "T12:00:00Z"))}</time><span>{statusLabel(entry.status)}</span></div>
      <h2><Link href={`/updates/${entry.id}`}>{entry.title}</Link></h2><p>{entry.summary}</p>
      <Link className="text-link" href={`/updates/${entry.id}`}>Çalışmayı oku <span aria-hidden="true">↗</span></Link>
    </article>)}</div></main>;
}
