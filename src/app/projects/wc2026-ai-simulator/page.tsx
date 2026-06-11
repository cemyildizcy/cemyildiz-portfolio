import Link from 'next/link';

const stack = ['Python', 'Pandas', 'NumPy', 'StatsBomb', 'Poisson xG', 'Monte Carlo', 'Plotly', 'Streamlit'];

const process = [
  {
    title: 'Veri kaynaklarını birleştirme',
    text: 'EA FC 25 oyuncu gücü, StatsBomb açık verisi, FIFA/ELO benzeri takım metrikleri, son form ve Dünya Kupası geçmişi aynı takım seviyesinde toplandı.',
  },
  {
    title: 'Takım feature seti',
    text: 'Kadro kalitesi, hücum/savunma dengesi, yıldız oyuncu etkisi, piyasa değeri ve xG/xGA göstergeleriyle model-ready final dataset üretildi.',
  },
  {
    title: 'Maç modeli',
    text: 'Her maç için beklenen gol değeri tahmin edilip Poisson dağılımı üzerinden skor olasılıkları üretildi.',
  },
  {
    title: 'Turnuva simülasyonu',
    text: '2026 formatındaki 12 grup, en iyi üçüncüler, son 32 ve eleme ağacı 10.000 Monte Carlo koşusunda simüle edildi.',
  },
];

const outcomes = [
  ['Argentina', '10.27%'],
  ['Germany', '9.70%'],
  ['Brazil', '9.28%'],
  ['Spain', '8.76%'],
  ['France', '8.47%'],
  ['England', '7.98%'],
];

export default function WC2026CaseStudyPage() {
  return (
    <main className="min-h-screen bg-[var(--bg)] pt-24 text-[var(--text-primary)]">
      <section className="mx-auto max-w-7xl px-6 py-16 lg:px-8">
        <Link href="/" className="text-sm font-semibold text-[var(--accent)]">← Ana sayfa</Link>
        <div className="mt-10 grid gap-12 lg:grid-cols-[1.05fr_0.95fr]">
          <div>
            <p className="text-sm font-medium uppercase tracking-[0.24em] text-[var(--accent)]">Case study</p>
            <h1 className="mt-4 text-balance text-5xl font-semibold tracking-[-0.055em] sm:text-7xl">
              2026 Dünya Kupası AI Simülatörü
            </h1>
            <p className="mt-7 max-w-3xl text-lg leading-8 text-[var(--text-secondary)]">
              48 takımlı yeni Dünya Kupası formatını veri bilimiyle modelleyen uçtan uca proje. Amaç tek bir şampiyon tahmini vermek değil; olasılık dağılımları üzerinden turnuvanın nasıl şekillenebileceğini göstermek.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link href="https://wc2026-ai-simulator.streamlit.app" target="_blank" className="rounded-full bg-[var(--text-primary)] px-5 py-3 text-sm font-semibold text-[var(--bg)]">Canlı dashboard</Link>
              <Link href="https://github.com/cemyildizcy/wc2026-ai-simulator" target="_blank" className="rounded-full border border-[var(--border-color)] px-5 py-3 text-sm font-semibold">GitHub repo</Link>
              <Link href="https://www.linkedin.com/posts/cemyildizcy_datascience-machinelearning-python-ugcPost-7470769047601664000-OO0G/" target="_blank" className="rounded-full border border-[var(--border-color)] px-5 py-3 text-sm font-semibold">LinkedIn postu</Link>
            </div>
          </div>

          <div className="rounded-[2rem] border border-[var(--border-color)] bg-[var(--surface)] p-6">
            <p className="text-sm text-[var(--text-secondary)]">Şampiyonluk olasılıkları</p>
            <div className="mt-5 space-y-4">
              {outcomes.map(([team, probability]) => (
                <div key={team}>
                  <div className="mb-2 flex justify-between text-sm">
                    <span>{team}</span>
                    <span className="font-mono text-[var(--text-secondary)]">{probability}</span>
                  </div>
                  <div className="h-2 rounded-full bg-[var(--panel)]">
                    <div className="h-2 rounded-full bg-[var(--accent)]" style={{ width: probability }} />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="border-y border-[var(--border-color)] bg-[var(--panel)] py-16">
        <div className="mx-auto grid max-w-7xl gap-4 px-6 sm:grid-cols-4 lg:px-8">
          <Metric label="Takım" value="48" />
          <Metric label="Maç" value="104" />
          <Metric label="Simülasyon" value="10.000" />
          <Metric label="Dashboard" value="Streamlit" />
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-6 py-24 lg:px-8">
        <div className="grid gap-12 lg:grid-cols-[0.8fr_1.2fr]">
          <div>
            <p className="text-sm font-medium uppercase tracking-[0.24em] text-[var(--accent)]">Approach</p>
            <h2 className="mt-3 text-4xl font-semibold tracking-tight">Nasıl kuruldu?</h2>
          </div>
          <div className="grid gap-4">
            {process.map((item, index) => (
              <article key={item.title} className="rounded-[1.5rem] border border-[var(--border-color)] bg-[var(--surface)] p-6">
                <p className="text-sm font-mono text-[var(--accent)]">0{index + 1}</p>
                <h3 className="mt-3 text-2xl font-semibold tracking-tight">{item.title}</h3>
                <p className="mt-3 leading-7 text-[var(--text-secondary)]">{item.text}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-6 pb-24 lg:px-8">
        <div className="rounded-[2rem] border border-[var(--border-color)] bg-[var(--surface)] p-8">
          <p className="text-sm font-medium uppercase tracking-[0.24em] text-[var(--accent)]">Stack</p>
          <div className="mt-6 flex flex-wrap gap-3">
            {stack.map((item) => (
              <span key={item} className="rounded-full border border-[var(--border-color)] bg-[var(--bg)] px-4 py-2 text-sm text-[var(--text-secondary)]">{item}</span>
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-[1.5rem] border border-[var(--border-color)] bg-[var(--surface)] p-6">
      <p className="text-3xl font-semibold tracking-tight">{value}</p>
      <p className="mt-2 text-sm text-[var(--text-secondary)]">{label}</p>
    </div>
  );
}
