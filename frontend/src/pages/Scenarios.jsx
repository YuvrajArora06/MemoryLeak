import { Play, Lock } from 'lucide-react';
import { Card, Badge, Button } from '../components/ui';
import { CATEGORIES, ATTACKS, DEFAULT_CONFIG } from '../data/scenarios';

export default function Scenarios({ onLaunch }) {
  const payment = CATEGORIES.find((c) => c.id === 'payment');
  const planned = CATEGORIES.filter((c) => c.status !== 'active');

  return (
    <div className="space-y-8">
      <header>
        <h1 className="text-2xl font-semibold text-slate-100">Scenario library</h1>
        <p className="mt-1 text-sm text-slate-400">
          Reusable adversarial test cases. Launch one to open it pre-configured in the lab.
        </p>
      </header>

      <section>
        <div className="mb-3 flex items-center gap-2">
          <h2 className="text-sm font-semibold text-slate-200">{payment.name}</h2>
          <Badge tone="green">Available</Badge>
        </div>
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {Object.values(ATTACKS).map((a) => (
            <Card key={a.id} className="flex flex-col p-5">
              <div className="text-sm font-semibold text-slate-100">{a.label}</div>
              <p className="mt-1 flex-1 text-xs leading-relaxed text-slate-400">{a.description}</p>
              {a.payload && (
                <p className="mt-3 line-clamp-2 rounded bg-slate-950 px-2 py-1.5 font-mono text-[11px] text-amber-200/80 ring-1 ring-slate-800">
                  {a.payload}
                </p>
              )}
              <Button
                variant="secondary"
                className="mt-4 w-full"
                onClick={() => onLaunch({ ...DEFAULT_CONFIG, attack: a.id })}
              >
                <Play size={14} /> Launch
              </Button>
            </Card>
          ))}
        </div>
      </section>

      <section>
        <div className="mb-3 flex items-center gap-2">
          <h2 className="text-sm font-semibold text-slate-200">General security framework</h2>
          <Badge>Phase 4 · planned</Badge>
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          {planned.map((c) => (
            <Card key={c.id} className="p-5 opacity-80">
              <div className="flex items-center gap-2">
                <Lock size={14} className="text-slate-500" />
                <div className="text-sm font-semibold text-slate-200">{c.name}</div>
              </div>
              <div className="mt-0.5 text-xs text-slate-500">{c.subtitle}</div>
              <p className="mt-2 text-sm text-slate-400">{c.description}</p>
            </Card>
          ))}
        </div>
      </section>
    </div>
  );
}
