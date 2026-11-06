import { ArrowRight, Play } from 'lucide-react';
import { Card, Button, StatTile, VerdictChip, Chip, formatTime } from '../components/ui';
import { CATEGORIES } from '../data/scenarios';

export default function Dashboard({ runs, onNavigate, onOpenRun, onQuickRun }) {
  const count = (lvl) => runs.filter((r) => r.verdict.level === lvl).length;
  const recent = runs.slice(0, 6);

  return (
    <div className="grid gap-10">
      <section className="grid gap-4 lg:grid-cols-[1.35fr_1fr]">
        <div className="flex flex-col rounded-[28px] bg-c-butter p-6 text-c-butter-ink sm:p-8">
          <span className="text-xs font-bold uppercase tracking-[0.08em]">AI agent security lab</span>
          <h1 className="mt-2 text-3xl font-extrabold leading-[1.1] tracking-tight text-ink sm:text-[40px]">
            Can your AI agent be talked into spending money it shouldn’t?
          </h1>
          <p className="mt-3 max-w-[50ch] text-ink/85 sm:text-[17px]">
            MemoryLeak hides tricks where your agent will find them, then shows you exactly what it did and what got
            charged. Everything runs on test money.
          </p>
          <div className="mt-6 flex flex-wrap gap-2.5">
            <Button onClick={() => onQuickRun(true)}>
              <Play size={16} fill="currentColor" /> Try the $200 trick
            </Button>
            <Button variant="outline" onClick={() => onQuickRun(false)}>
              Try it with the guard off
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <StatTile tone="sky" label="Tests run" value={runs.length} />
          <StatTile tone="rose" label="Money got out" value={count('vulnerable')} hint="Tricked, and paid" />
          <StatTile tone="butter" label="Caught in time" value={count('mitigated')} hint="Tricked, but blocked" />
          <StatTile tone="mint" label="All good" value={count('secure')} hint="Did what you asked" />
        </div>
      </section>

      <section className="grid gap-4">
        <div className="flex items-baseline justify-between gap-4">
          <h2 className="text-xl font-extrabold">Recent tests</h2>
          {runs.length > 0 && (
            <button onClick={() => onNavigate('reports')} className="text-sm font-bold text-muted hover:text-ink">
              See all →
            </button>
          )}
        </div>
        <Card className="overflow-hidden">
          {recent.length === 0 ? (
            <p className="px-6 py-10 text-center text-muted">
              No tests yet. Try the $200 trick above to see your first result.
            </p>
          ) : (
            <ul className="divide-y divide-line">
              {recent.map((r) => (
                <li key={r.id}>
                  <button
                    onClick={() => onOpenRun(r.id)}
                    className="flex w-full flex-wrap items-center gap-x-4 gap-y-1 px-5 py-4 text-left transition-colors hover:bg-ink/[0.03]"
                  >
                    <VerdictChip level={r.verdict.level} />
                    <span className="font-bold">{r.attackLabel}</span>
                    <span className="text-sm text-muted">
                      {r.agentLabel} · guard {r.config.gatewayEnabled ? 'on' : 'off'}
                    </span>
                    <span className="ml-auto text-sm text-muted tabular-nums">{formatTime(r.createdAt)}</span>
                    <ArrowRight size={16} className="text-muted" />
                  </button>
                </li>
              ))}
            </ul>
          )}
        </Card>
      </section>

      <section className="grid gap-4">
        <h2 className="text-xl font-extrabold">What MemoryLeak checks</h2>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {CATEGORIES.map((c) =>
            c.status === 'active' ? (
              <div key={c.id} className="flex flex-col gap-2 rounded-[20px] bg-c-mint p-5 text-c-mint-ink">
                <Chip tone="mint" className="self-start bg-card/75">Ready</Chip>
                <h3 className="text-lg font-extrabold text-ink">{c.name}</h3>
                <p className="text-[15px] text-ink/85">{c.description}</p>
                <Button className="mt-auto self-start" onClick={() => onNavigate('lab')}>
                  Open the lab
                </Button>
              </div>
            ) : (
              <Card key={c.id} className="flex flex-col gap-2 p-5">
                <Chip tone="lilac" className="self-start">Coming soon</Chip>
                <h3 className="text-lg font-extrabold">{c.name}</h3>
                <p className="text-[15px] text-muted">{c.description}</p>
              </Card>
            )
          )}
        </div>
      </section>
    </div>
  );
}
