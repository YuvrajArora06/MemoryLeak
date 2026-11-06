import { useMemo, useState } from 'react';
import { RotateCcw, Download, Search, Trash2 } from 'lucide-react';
import { Card, Button, VerdictChip, Chip, PageTitle, formatTime, VERDICT_META } from '../components/ui';
import ResultHero from '../components/ResultHero';
import StoryCards from '../components/StoryCards';
import { downloadRun } from '../services/api';

const FILTERS = ['all', 'vulnerable', 'mitigated', 'secure', 'blocked'];

export default function Reports({ runs, selectedId, onSelect, onRerun, onClear }) {
  const [filter, setFilter] = useState('all');
  const [query, setQuery] = useState('');
  const [confirmClear, setConfirmClear] = useState(false);

  const filtered = useMemo(
    () =>
      runs.filter(
        (r) =>
          (filter === 'all' || r.verdict.level === filter) &&
          (query === '' || `${r.id} ${r.attackLabel} ${r.agentLabel}`.toLowerCase().includes(query.toLowerCase()))
      ),
    [runs, filter, query]
  );

  const selected = runs.find((r) => r.id === selectedId) ?? filtered[0];

  // The last earlier run of the same test, for a before/after comparison.
  const previous = selected
    ? runs.find(
        (r) =>
          r.id !== selected.id &&
          r.config.attack === selected.config.attack &&
          r.config.agent === selected.config.agent &&
          new Date(r.createdAt) < new Date(selected.createdAt)
      )
    : null;

  if (runs.length === 0) {
    return (
      <div className="grid gap-8">
        <PageTitle title="History" />
        <div className="rounded-[28px] bg-c-sky p-8 text-c-sky-ink">
          <h2 className="text-2xl font-extrabold text-ink">Nothing here yet.</h2>
          <p className="mt-2 text-ink/85">Every test you run in the payment lab is saved here, with the evidence.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="grid gap-8">
      <PageTitle
        title="History"
        right={
          confirmClear ? (
            <span className="flex items-center gap-2 text-sm">
              Delete all {runs.length} tests?
              <Button
                className="px-3 py-1 text-sm"
                onClick={() => {
                  onClear();
                  setConfirmClear(false);
                }}
              >
                Delete
              </Button>
              <Button variant="ghost" className="px-3 py-1 text-sm" onClick={() => setConfirmClear(false)}>
                Keep
              </Button>
            </span>
          ) : (
            <Button variant="ghost" className="text-sm" onClick={() => setConfirmClear(true)}>
              <Trash2 size={15} /> Clear history
            </Button>
          )
        }
      >
        Every test you’ve run, with what was expected, what happened, and how to fix it.
      </PageTitle>

      <div className="grid items-start gap-6 lg:grid-cols-[320px_minmax(0,1fr)]">
        {/* list */}
        <Card className="overflow-hidden lg:sticky lg:top-24">
          <div className="grid gap-3 border-b border-line p-4">
            <div className="relative">
              <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted" />
              <input
                id="history-search"
                placeholder="Search tests"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                className="w-full rounded-xl border-2 border-line bg-paper py-1.5 pl-9 pr-3 text-[15px] outline-none focus:border-ink"
              />
            </div>
            <div className="flex flex-wrap gap-1.5">
              {FILTERS.map((f) => (
                <button
                  key={f}
                  onClick={() => setFilter(f)}
                  aria-pressed={filter === f}
                  className={`rounded-full px-3 py-1 text-xs font-bold transition-colors ${
                    filter === f ? 'bg-ink text-paper' : 'bg-line/60 text-muted hover:text-ink'
                  }`}
                >
                  {f === 'all' ? 'All' : VERDICT_META[f].label}
                </button>
              ))}
            </div>
          </div>
          <ul className="max-h-[60vh] divide-y divide-line overflow-y-auto">
            {filtered.map((r) => (
              <li key={r.id}>
                <button
                  onClick={() => onSelect(r.id)}
                  className={`grid w-full gap-1 px-4 py-3 text-left transition-colors ${
                    selected?.id === r.id ? 'bg-ink/[0.06]' : 'hover:bg-ink/[0.03]'
                  }`}
                >
                  <span className="flex items-center justify-between gap-2">
                    <span className="font-bold">{r.attackLabel}</span>
                    <VerdictChip level={r.verdict.level} />
                  </span>
                  <span className="text-[13px] text-muted">
                    {r.agentLabel} · guard {r.config.gatewayEnabled ? 'on' : 'off'} · {formatTime(r.createdAt)}
                  </span>
                </button>
              </li>
            ))}
            {filtered.length === 0 && <li className="px-4 py-6 text-center text-sm text-muted">No tests match.</li>}
          </ul>
        </Card>

        {/* detail */}
        {selected && (
          <div className="grid min-w-0 gap-6">
            <ResultHero
              key={selected.id}
              run={selected}
              actions={
                <>
                  <Button onClick={() => onRerun(selected.config)}>
                    <RotateCcw size={16} /> Run it again
                  </Button>
                  <Button variant="outline" onClick={() => downloadRun(selected)}>
                    <Download size={16} /> Download evidence
                  </Button>
                </>
              }
            />

            {previous && (
              <Card className="flex flex-wrap items-center gap-x-3 gap-y-2 px-5 py-4 text-[15px]">
                <span className="font-bold">Last time you ran this test:</span>
                <button onClick={() => onSelect(previous.id)} className="hover:opacity-80" title="Open that test">
                  <VerdictChip level={previous.verdict.level} />
                </button>
                <span className="text-muted">Now:</span>
                <VerdictChip level={selected.verdict.level} />
                {previous.verdict.level === 'vulnerable' && selected.verdict.level !== 'vulnerable' && (
                  <Chip tone="mint">Fixed</Chip>
                )}
                {previous.verdict.level !== 'vulnerable' && selected.verdict.level === 'vulnerable' && (
                  <Chip tone="rose">Got worse</Chip>
                )}
              </Card>
            )}

            <section className="grid gap-3">
              <h2 className="text-lg font-extrabold">How it played out</h2>
              <StoryCards steps={selected.steps} />
            </section>

            <Card className="p-6">
              <h2 className="text-lg font-extrabold">For developers</h2>
              <dl className="mt-4 grid gap-5 text-[15px] sm:grid-cols-3">
                <div>
                  <dt className="text-xs font-bold uppercase tracking-[0.06em] text-muted">Should have happened</dt>
                  <dd className="mt-1">{selected.verdict.expected}</dd>
                </div>
                <div>
                  <dt className="text-xs font-bold uppercase tracking-[0.06em] text-muted">Actually happened</dt>
                  <dd className="mt-1">{selected.verdict.observed}</dd>
                </div>
                <div>
                  <dt className="text-xs font-bold uppercase tracking-[0.06em] text-muted">How to fix it</dt>
                  <dd className="mt-1">{selected.verdict.mitigation}</dd>
                </div>
              </dl>
              <p className="mt-5 font-mono text-xs text-muted">
                {selected.id} · {selected.config.product} · severity {selected.verdict.severity}
              </p>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
}
