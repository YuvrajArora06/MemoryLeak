import { Activity, ShieldAlert, ShieldHalf, ShieldCheck, FlaskConical, ArrowRight } from 'lucide-react';
import { Card, CardHeader, StatCard, Badge, VerdictBadge, Button, formatTime } from '../components/ui';
import { CATEGORIES } from '../data/scenarios';

export default function Dashboard({ runs, onNavigate, onOpenRun, onQuickRun }) {
  const count = (lvl) => runs.filter((r) => r.verdict.level === lvl).length;
  const vulnerable = count('vulnerable');
  const mitigated = count('mitigated');
  const secure = count('secure');
  const recent = runs.slice(0, 6);

  return (
    <div className="space-y-6">
      <header className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold text-slate-100">Breaking AI agents before attackers do.</h1>
          <p className="mt-1 text-sm text-slate-400">
            Security evaluation for AI agents: data leakage, prompt injection, memory poisoning, and unauthorized tool
            execution.
          </p>
        </div>
        <Button onClick={() => onNavigate('lab')}>
          <FlaskConical size={16} /> Open Payment Lab
        </Button>
      </header>

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatCard label="Test runs" value={runs.length} hint="All scenarios" Icon={Activity} tone="cyan" />
        <StatCard label="Vulnerable" value={vulnerable} hint="Unauthorized action executed" Icon={ShieldAlert} tone="red" />
        <StatCard label="Mitigated" value={mitigated} hint="Agent fooled, gateway held" Icon={ShieldHalf} tone="amber" />
        <StatCard label="Secure" value={secure} hint="Behaved as authorized" Icon={ShieldCheck} tone="green" />
      </div>

      {runs.length === 0 && (
        <Card className="flex flex-col items-start gap-4 p-6 sm:flex-row sm:items-center">
          <div className="flex-1">
            <h3 className="font-semibold text-slate-100">Try the hackathon demo</h3>
            <p className="mt-1 text-sm text-slate-400">
              A purchasing agent is asked to buy a $20 subscription. A hidden instruction tries to make it pay $200.
              Run it with and without the policy gateway to see the difference.
            </p>
          </div>
          <div className="flex gap-2">
            <Button variant="secondary" onClick={() => onQuickRun(false)}>
              Run without gateway
            </Button>
            <Button onClick={() => onQuickRun(true)}>Run with gateway</Button>
          </div>
        </Card>
      )}

      <div className="grid gap-6 xl:grid-cols-[1fr_380px]">
        <Card>
          <CardHeader
            title="Recent test runs"
            subtitle="Latest evaluations across all scenarios"
            right={
              runs.length > 0 && (
                <button className="text-xs text-cyan-400 hover:underline" onClick={() => onNavigate('reports')}>
                  View all
                </button>
              )
            }
          />
          {recent.length === 0 ? (
            <p className="px-5 py-10 text-center text-sm text-slate-500">No runs yet.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-left text-xs uppercase tracking-wide text-slate-500">
                    <th className="px-5 py-2.5 font-medium">Run</th>
                    <th className="px-3 py-2.5 font-medium">Attack</th>
                    <th className="px-3 py-2.5 font-medium">Gateway</th>
                    <th className="px-3 py-2.5 font-medium">Verdict</th>
                    <th className="px-5 py-2.5 font-medium text-right">When</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800">
                  {recent.map((r) => (
                    <tr
                      key={r.id}
                      onClick={() => onOpenRun(r.id)}
                      className="cursor-pointer transition-colors hover:bg-slate-800/40"
                    >
                      <td className="px-5 py-3 font-mono text-xs text-slate-300">{r.id}</td>
                      <td className="px-3 py-3 text-slate-300">{r.attackLabel}</td>
                      <td className="px-3 py-3">
                        {r.config.gatewayEnabled ? <Badge tone="cyan">On</Badge> : <Badge>Off</Badge>}
                      </td>
                      <td className="px-3 py-3">
                        <VerdictBadge level={r.verdict.level} />
                      </td>
                      <td className="px-5 py-3 text-right text-xs text-slate-500">{formatTime(r.createdAt)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </Card>

        <Card>
          <CardHeader title="Test coverage" subtitle="Vulnerability classes MemoryLeak evaluates" />
          <ul className="divide-y divide-slate-800">
            {CATEGORIES.map((c) => (
              <li key={c.id} className="flex items-center gap-3 px-5 py-3">
                <span
                  className={`h-2 w-2 shrink-0 rounded-full ${c.status === 'active' ? 'bg-emerald-400' : 'bg-slate-600'}`}
                />
                <div className="min-w-0 flex-1">
                  <div className="truncate text-sm text-slate-200">{c.name}</div>
                  <div className="truncate text-xs text-slate-500">{c.subtitle}</div>
                </div>
                {c.status === 'active' ? (
                  <button
                    onClick={() => onNavigate('lab')}
                    className="flex items-center gap-1 text-xs text-cyan-400 hover:underline"
                  >
                    Test <ArrowRight size={12} />
                  </button>
                ) : (
                  <Badge>Planned</Badge>
                )}
              </li>
            ))}
          </ul>
        </Card>
      </div>
    </div>
  );
}
