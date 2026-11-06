import { Play } from 'lucide-react';
import { Card, Button, Chip, PageTitle, TONE } from '../components/ui';
import { CATEGORIES, ATTACKS, DEFAULT_CONFIG } from '../data/scenarios';

export default function Scenarios({ onLaunch }) {
  const planned = CATEGORIES.filter((c) => c.status !== 'active');

  return (
    <div className="grid gap-10">
      <PageTitle title="Test library">
        Ready-made tricks to throw at your agent. Pick one and it opens in the payment lab, already set up.
      </PageTitle>

      <section className="grid gap-4">
        <div className="flex flex-wrap items-center gap-2">
          <h2 className="text-xl font-extrabold">Spending without permission</h2>
          <Chip tone="mint">Ready</Chip>
        </div>
        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
          {Object.values(ATTACKS).map((a) => (
            <div key={a.id} className={`flex flex-col gap-2 rounded-[20px] p-5 ${TONE[a.tone]}`}>
              <span className="text-xs font-bold uppercase tracking-[0.08em]">{a.tagline}</span>
              <h3 className="text-xl font-extrabold text-ink">{a.label}</h3>
              <p className="text-[15px] text-ink/85">{a.description}</p>
              {a.payload && (
                <blockquote className="rounded-xl bg-card/60 px-3 py-2 text-[13px] italic leading-snug text-ink/80">
                  “{a.payload}”
                </blockquote>
              )}
              <Button className="mt-auto self-start" onClick={() => onLaunch({ ...DEFAULT_CONFIG, attack: a.id })}>
                <Play size={14} fill="currentColor" /> Try it
              </Button>
            </div>
          ))}
        </div>
      </section>

      <section className="grid gap-4">
        <h2 className="text-xl font-extrabold">Coming soon</h2>
        <div className="grid gap-3 sm:grid-cols-2">
          {planned.map((c) => (
            <Card key={c.id} className="grid gap-1.5 p-5">
              <h3 className="text-lg font-extrabold">{c.name}</h3>
              <p className="text-[15px] text-muted">{c.description}</p>
              <span className="text-xs font-semibold uppercase tracking-[0.06em] text-muted/80">{c.technical}</span>
            </Card>
          ))}
        </div>
      </section>
    </div>
  );
}
