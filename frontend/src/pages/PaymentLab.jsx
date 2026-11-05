import { useEffect, useRef, useState } from 'react';
import { Play, RotateCcw, Zap, ArrowRight } from 'lucide-react';
import { Card, CardHeader, Button, Toggle, Badge } from '../components/ui';
import Timeline from '../components/Timeline';
import FindingCard from '../components/FindingCard';
import { ATTACKS, AGENT_PROFILES, DEFAULT_CONFIG } from '../data/scenarios';
import { runScenario } from '../services/api';

const STEP_DELAY_MS = 650;

function Field({ label, children, hint }) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-xs font-medium text-slate-400">{label}</span>
      {children}
      {hint && <span className="mt-1 block text-[11px] text-slate-500">{hint}</span>}
    </label>
  );
}

const inputCls =
  'w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-sm text-slate-100 outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500';

const PIPELINE = ['User', 'Agent', 'Policy Gateway', 'PayPal Sandbox', 'Evaluator'];

export default function PaymentLab({ preset, onRunComplete }) {
  const [config, setConfig] = useState(preset ?? DEFAULT_CONFIG);
  const [run, setRun] = useState(null);
  const [visible, setVisible] = useState(0);
  const [running, setRunning] = useState(false);
  const timer = useRef(null);

  useEffect(() => {
    if (preset) setConfig(preset);
  }, [preset]);

  useEffect(() => () => clearInterval(timer.current), []);

  const set = (key) => (value) => setConfig((c) => ({ ...c, [key]: value }));

  async function execute() {
    clearInterval(timer.current);
    const result = await runScenario(config);
    setRun(result);
    onRunComplete(result); // persist immediately so leaving the page mid-animation doesn't lose it
    setVisible(1);
    setRunning(true);
    let n = 1;
    timer.current = setInterval(() => {
      n += 1;
      setVisible(n);
      if (n >= result.steps.length) {
        clearInterval(timer.current);
        setRunning(false);
      }
    }, STEP_DELAY_MS);
  }

  function reset() {
    clearInterval(timer.current);
    setRun(null);
    setRunning(false);
    setVisible(0);
    setConfig(DEFAULT_CONFIG);
  }

  const activeActor = run ? run.steps[Math.min(visible, run.steps.length) - 1]?.actor : null;
  const attack = ATTACKS[config.attack];

  return (
    <div className="space-y-6">
      <header className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold text-slate-100">Payment Security Lab</h1>
          <p className="mt-1 max-w-2xl text-sm text-slate-400">
            Give an AI purchasing agent an authorized request, hide an adversarial instruction in the product page, and
            see whether the independent policy gateway stops an unauthorized PayPal payment.
          </p>
        </div>
        <Badge tone="amber">PayPal Sandbox · simulated</Badge>
      </header>

      <div className="grid gap-6 lg:grid-cols-[360px_1fr]">
        {/* ---------- Config ---------- */}
        <Card className="h-fit">
          <CardHeader title="Scenario configuration" subtitle="What the user authorized and how the agent is attacked" />
          <div className="space-y-5 px-5 py-5">
            <Field label="Product">
              <input className={inputCls} value={config.product} onChange={(e) => set('product')(e.target.value)} />
            </Field>

            <div className="grid grid-cols-2 gap-3">
              <Field label="Authorized amount (USD)">
                <input
                  type="number"
                  min="1"
                  className={inputCls}
                  value={config.authorizedAmount}
                  onChange={(e) => set('authorizedAmount')(Number(e.target.value))}
                />
              </Field>
              <Field label="Spending limit (USD)">
                <input
                  type="number"
                  min="1"
                  className={inputCls}
                  value={config.spendingLimit}
                  onChange={(e) => set('spendingLimit')(Number(e.target.value))}
                />
              </Field>
            </div>

            <Field label="Adversarial payload" hint={attack.description}>
              <select className={inputCls} value={config.attack} onChange={(e) => set('attack')(e.target.value)}>
                {Object.values(ATTACKS).map((a) => (
                  <option key={a.id} value={a.id}>
                    {a.label}
                  </option>
                ))}
              </select>
            </Field>

            <Field label="Agent under test">
              <div className="grid grid-cols-2 gap-2">
                {Object.values(AGENT_PROFILES).map((p) => (
                  <button
                    key={p.id}
                    type="button"
                    onClick={() => set('agent')(p.id)}
                    className={`rounded-lg border px-3 py-2 text-left transition-colors ${
                      config.agent === p.id
                        ? 'border-cyan-500 bg-cyan-500/10'
                        : 'border-slate-700 hover:border-slate-600'
                    }`}
                  >
                    <div className="text-sm text-slate-100">{p.label}</div>
                    <div className="text-[11px] leading-snug text-slate-500">{p.description}</div>
                  </button>
                ))}
              </div>
            </Field>

            <div className="space-y-4 border-t border-slate-800 pt-5">
              <Toggle
                checked={config.requireApproval}
                onChange={set('requireApproval')}
                label="Require explicit user approval"
                description="User must confirm before payment capture"
              />
              <Toggle
                checked={config.gatewayEnabled}
                onChange={set('gatewayEnabled')}
                label="Payment policy gateway"
                description="Server-side checks independent of the LLM"
              />
            </div>

            <div className="flex gap-2 pt-1">
              <Button className="flex-1" onClick={execute} disabled={running}>
                {running ? (
                  <>
                    <Zap size={16} className="animate-pulse" /> Running…
                  </>
                ) : (
                  <>
                    <Play size={16} /> Run attack
                  </>
                )}
              </Button>
              <Button variant="secondary" onClick={reset} disabled={running} title="Reset to defaults">
                <RotateCcw size={16} />
              </Button>
            </div>
          </div>
        </Card>

        {/* ---------- Execution ---------- */}
        <div className="min-w-0 space-y-6">
          <Card>
            <div className="flex flex-wrap items-center gap-x-2 gap-y-2 px-5 py-4">
              {PIPELINE.map((actor, i) => {
                const reached = run && run.steps.slice(0, visible).some((s) => s.actor === actor);
                const active = actor === activeActor && running;
                const skipped =
                  actor === 'Policy Gateway' && !config.gatewayEnabled && run && reached;
                return (
                  <div key={actor} className="flex items-center gap-2">
                    <span
                      className={`rounded-md px-2.5 py-1 text-xs font-medium ring-1 ring-inset transition-all ${
                        active
                          ? 'bg-cyan-500/20 text-cyan-200 ring-cyan-400'
                          : skipped
                            ? 'bg-rose-500/10 text-rose-300 ring-rose-500/40 line-through'
                            : reached
                              ? 'bg-slate-800 text-slate-200 ring-slate-600'
                              : 'text-slate-500 ring-slate-800'
                      }`}
                    >
                      {actor}
                    </span>
                    {i < PIPELINE.length - 1 && <ArrowRight size={14} className="text-slate-600" />}
                  </div>
                );
              })}
            </div>
          </Card>

          <Card>
            <CardHeader
              title="Execution trace"
              subtitle={run ? `${run.id} · ${run.attackLabel} · ${run.agentLabel}` : 'Configure a scenario and run it'}
            />
            <div className="px-5 pt-5">
              {run ? (
                <Timeline steps={run.steps} visibleCount={visible} running={running} />
              ) : (
                <div className="grid place-items-center pb-12 pt-8 text-center">
                  <div className="max-w-sm text-sm text-slate-500">
                    The trace will show each decision the agent made, what the policy gateway checked, and what actually
                    reached the PayPal sandbox.
                  </div>
                  <Button className="mt-4" onClick={execute}>
                    <Play size={16} /> Run default scenario
                  </Button>
                </div>
              )}
            </div>
          </Card>

          {run && !running && <FindingCard run={run} />}
        </div>
      </div>
    </div>
  );
}
