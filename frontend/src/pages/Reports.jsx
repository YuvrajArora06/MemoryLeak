import { useMemo, useState } from 'react';
import { RefreshCw, Trash2, Search } from 'lucide-react';
import { Card, CardHeader, VerdictBadge, Button, Badge, formatTime, VERDICT_META } from '../components/ui';
import Timeline from '../components/Timeline';
import FindingCard from '../components/FindingCard';

const FILTERS = ['all', 'vulnerable', 'mitigated', 'secure', 'blocked'];

export default function Reports({ runs, selectedId, onSelect, onRerun, onClear }) {
  const [filter, setFilter] = useState('all');
  const [query, setQuery] = useState('');

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

  // Regression: previous run with same attack + agent but different gateway setting / earlier time
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
      <div className="space-y-6">
        <h1 className="text-2xl font-semibold text-slate-100">Security reports</h1>
        <Card className="px-5 py-16 text-center text-sm text-slate-500">
          No reports yet. Run a scenario in the Payment Security Lab to generate evidence-backed findings.
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <header className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold text-slate-100">Security reports</h1>
          <p className="mt-1 text-sm text-slate-400">
            Evidence for every run: expected vs observed behaviour, policy decisions, and the full execution trace.
          </p>
        </div>
        <Button variant="ghost" className="text-xs text-slate-400" onClick={onClear}>
          <Trash2 size={14} /> Clear history
        </Button>
      </header>

      <div className="grid gap-6 lg:grid-cols-[320px_1fr]">
        {/* list */}
        <Card className="h-fit lg:sticky lg:top-6">
          <div className="space-y-3 border-b border-slate-800 p-3">
            <div className="relative">
              <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
              <input
                placeholder="Search runs…"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                className="w-full rounded-lg border border-slate-700 bg-slate-950 py-1.5 pl-8 pr-3 text-sm outline-none focus:border-cyan-500"
              />
            </div>
            <div className="flex flex-wrap gap-1">
              {FILTERS.map((f) => (
                <button
                  key={f}
                  onClick={() => setFilter(f)}
                  className={`rounded-md px-2 py-1 text-xs capitalize ${
                    filter === f ? 'bg-slate-700 text-slate-100' : 'text-slate-400 hover:bg-slate-800'
                  }`}
                >
                  {f === 'all' ? 'All' : VERDICT_META[f].label}
                </button>
              ))}
            </div>
          </div>
          <ul className="scroll-thin max-h-[60vh] divide-y divide-slate-800 overflow-y-auto">
            {filtered.map((r) => (
              <li key={r.id}>
                <button
                  onClick={() => onSelect(r.id)}
                  className={`w-full px-4 py-3 text-left transition-colors ${
                    selected?.id === r.id ? 'bg-slate-800/70' : 'hover:bg-slate-800/30'
                  }`}
                >
                  <div className="flex items-center justify-between gap-2">
                    <span className="font-mono text-xs text-slate-300">{r.id}</span>
                    <VerdictBadge level={r.verdict.level} />
                  </div>
                  <div className="mt-1 text-sm text-slate-200">{r.attackLabel}</div>
                  <div className="text-xs text-slate-500">
                    {r.agentLabel} · gateway {r.config.gatewayEnabled ? 'on' : 'off'} · {formatTime(r.createdAt)}
                  </div>
                </button>
              </li>
            ))}
            {filtered.length === 0 && <li className="px-4 py-6 text-center text-xs text-slate-500">No matches.</li>}
          </ul>
        </Card>

        {/* detail */}
        {selected && (
          <div className="min-w-0 space-y-6">
            <FindingCard run={selected} />

            {previous && (
              <Card className="flex flex-wrap items-center gap-3 px-5 py-4 text-sm">
                <span className="text-xs font-medium uppercase tracking-wide text-slate-500">Regression</span>
                <span className="text-slate-400">Previous run of this scenario</span>
                <button className="font-mono text-xs text-cyan-400 hover:underline" onClick={() => onSelect(previous.id)}>
                  {previous.id}
                </button>
                <VerdictBadge level={previous.verdict.level} />
                <span className="text-slate-600">→</span>
                <VerdictBadge level={selected.verdict.level} />
                {previous.verdict.level === 'vulnerable' && selected.verdict.level !== 'vulnerable' && (
                  <Badge tone="green">Fixed</Badge>
                )}
                {previous.verdict.level !== 'vulnerable' && selected.verdict.level === 'vulnerable' && (
                  <Badge tone="red">Regressed</Badge>
                )}
              </Card>
            )}

            <Card>
              <CardHeader
                title="Execution trace"
                subtitle={`${selected.config.product} · authorized $${selected.config.authorizedAmount} · limit $${selected.config.spendingLimit}`}
                right={
                  <Button variant="secondary" className="!px-3 !py-1.5 text-xs" onClick={() => onRerun(selected.config)}>
                    <RefreshCw size={14} /> Re-run scenario
                  </Button>
                }
              />
              <div className="px-5 pt-5">
                <Timeline steps={selected.steps} />
              </div>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
}
