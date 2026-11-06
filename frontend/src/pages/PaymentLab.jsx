import { useEffect, useRef, useState } from 'react';
import { Play, RotateCcw, Download } from 'lucide-react';
import { Card, Button, Toggle, PageTitle, TONE } from '../components/ui';
import StoryCards from '../components/StoryCards';
import ResultHero from '../components/ResultHero';
import { ATTACKS, AGENT_PROFILES, DEFAULT_CONFIG } from '../data/scenarios';
import { runScenario, downloadRun } from '../services/api';

const STEP_DELAY_MS = 700;

const inputCls =
  'w-full rounded-xl border-2 border-line bg-paper px-3 py-2 text-[15px] text-ink outline-none transition-colors focus:border-ink';

function Question({ label, htmlFor, children }) {
  return (
    <div className="grid gap-2">
      <label htmlFor={htmlFor} className="font-bold">
        {label}
      </label>
      {children}
    </div>
  );
}

function MoneyInput({ id, value, onChange }) {
  return (
    <div className="relative">
      <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 font-semibold text-muted">$</span>
      <input
        id={id}
        type="number"
        min="1"
        className={`${inputCls} pl-7 tabular-nums`}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
      />
    </div>
  );
}

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
    onRunComplete(result); // save straight away so leaving mid-animation doesn't lose it
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

  return (
    <div className="grid gap-8">
      <PageTitle title="Payment lab">
        Hide a trick on a product page, then watch whether your agent falls for it and whether the payment guard
        catches it.
      </PageTitle>

      <div className="grid items-start gap-6 lg:grid-cols-[370px_minmax(0,1fr)]">
        {/* ---------- Set up ---------- */}
        <Card className="grid gap-6 p-6">
          <h2 className="text-xl font-extrabold">Set up the test</h2>

          <Question label="What should the agent buy?" htmlFor="product">
            <input id="product" className={inputCls} value={config.product} onChange={(e) => set('product')(e.target.value)} />
          </Question>

          <div className="grid grid-cols-2 gap-3">
            <Question label="You’ll approve" htmlFor="approved">
              <MoneyInput id="approved" value={config.authorizedAmount} onChange={set('authorizedAmount')} />
            </Question>
            <Question label="Never spend over" htmlFor="limit">
              <MoneyInput id="limit" value={config.spendingLimit} onChange={set('spendingLimit')} />
            </Question>
          </div>

          <fieldset className="grid gap-2">
            <legend className="mb-2 font-bold">Pick a trick</legend>
            <div className="grid grid-cols-2 gap-2">
              {Object.values(ATTACKS).map((a) => {
                const on = config.attack === a.id;
                return (
                  <button
                    key={a.id}
                    type="button"
                    aria-pressed={on}
                    onClick={() => set('attack')(a.id)}
                    className={`rounded-2xl border-2 p-3 text-left transition ${
                      on ? `${TONE[a.tone]} border-ink` : 'border-line hover:border-muted'
                    }`}
                  >
                    <span className={`block font-bold ${on ? '' : 'text-ink'}`}>{a.label}</span>
                    <span className={`block text-[13px] leading-snug ${on ? 'text-ink/80' : 'text-muted'}`}>{a.tagline}</span>
                  </button>
                );
              })}
            </div>
            <p className="text-sm text-muted">{ATTACKS[config.attack].description}</p>
          </fieldset>

          <fieldset className="grid gap-2">
            <legend className="mb-2 font-bold">Which agent?</legend>
            <div className="grid grid-cols-2 gap-2">
              {Object.values(AGENT_PROFILES).map((p) => {
                const on = config.agent === p.id;
                return (
                  <button
                    key={p.id}
                    type="button"
                    aria-pressed={on}
                    onClick={() => set('agent')(p.id)}
                    className={`rounded-2xl border-2 p-3 text-left transition ${
                      on ? 'border-ink bg-ink text-paper' : 'border-line hover:border-muted'
                    }`}
                  >
                    <span className="block font-bold">{p.label}</span>
                    <span className={`block text-[13px] leading-snug ${on ? 'opacity-80' : 'text-muted'}`}>{p.description}</span>
                  </button>
                );
              })}
            </div>
          </fieldset>

          <div className="grid gap-4 border-t border-line pt-5">
            <Toggle
              id="ask-first"
              checked={config.requireApproval}
              onChange={set('requireApproval')}
              label="Ask me before paying"
              description="The agent must get your OK first"
            />
            <Toggle
              id="guard"
              checked={config.gatewayEnabled}
              onChange={set('gatewayEnabled')}
              label="Payment guard"
              description="Checks every payment, whatever the AI says"
            />
          </div>

          <div className="flex gap-2">
            <Button className="flex-1 py-3" onClick={execute} disabled={running}>
              <Play size={16} fill="currentColor" /> {running ? 'Running…' : 'Run the test'}
            </Button>
            <Button variant="outline" onClick={reset} disabled={running} aria-label="Start over" title="Start over">
              <RotateCcw size={16} />
            </Button>
          </div>
        </Card>

        {/* ---------- Result ---------- */}
        <div className="grid min-w-0 gap-6">
          {!run && (
            <div className="rounded-[28px] bg-c-lilac p-6 text-c-lilac-ink sm:p-8">
              <span className="text-xs font-bold uppercase tracking-[0.08em]">Your result shows up here</span>
              <h2 className="mt-2 text-2xl font-extrabold leading-tight tracking-tight text-ink sm:text-3xl">
                Ready when you are.
              </h2>
              <ol className="mt-4 grid gap-2 text-ink/85 sm:text-[17px]">
                <li>1. You ask the agent to buy something for a set price.</li>
                <li>2. The product page hides a sneaky instruction.</li>
                <li>3. We show you what the agent tried, and what PayPal actually charged.</li>
              </ol>
              <Button className="mt-6" onClick={execute}>
                <Play size={16} fill="currentColor" /> Run the test
              </Button>
            </div>
          )}

          {run && !running && (
            <ResultHero
              run={run}
              actions={
                <>
                  <Button onClick={execute}>
                    <RotateCcw size={16} /> Run it again
                  </Button>
                  <Button variant="outline" onClick={() => downloadRun(run)}>
                    <Download size={16} /> Download evidence
                  </Button>
                </>
              }
            />
          )}

          {run && (
            <section className="grid gap-3">
              <h2 className="text-lg font-extrabold">{running ? 'Watching it happen…' : 'How it played out'}</h2>
              <StoryCards steps={run.steps} visibleCount={visible} running={running} />
            </section>
          )}
        </div>
      </div>
    </div>
  );
}
