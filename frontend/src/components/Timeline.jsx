import { User, Bot, ShieldCheck, CreditCard, Gavel, Check, X, AlertTriangle, Ban, Info } from 'lucide-react';

const ACTOR_ICON = {
  User: User,
  Agent: Bot,
  'Policy Gateway': ShieldCheck,
  'PayPal Sandbox': CreditCard,
  Evaluator: Gavel,
};

const STATUS = {
  ok: { ring: 'ring-emerald-500/50 bg-emerald-500/10 text-emerald-300', Icon: Check },
  info: { ring: 'ring-slate-600 bg-slate-800 text-slate-300', Icon: Info },
  warn: { ring: 'ring-amber-500/50 bg-amber-500/10 text-amber-300', Icon: AlertTriangle },
  danger: { ring: 'ring-rose-500/50 bg-rose-500/10 text-rose-300', Icon: X },
  blocked: { ring: 'ring-cyan-500/50 bg-cyan-500/10 text-cyan-300', Icon: Ban },
};

export default function Timeline({ steps, visibleCount = steps.length, running = false }) {
  return (
    <ol className="relative">
      {steps.slice(0, visibleCount).map((step, i) => {
        const s = STATUS[step.status];
        const ActorIcon = ACTOR_ICON[step.actor] ?? Info;
        const last = i === steps.length - 1;
        return (
          <li key={step.key} className="animate-step-in relative flex gap-4 pb-6">
            {!last && <span className="absolute left-[17px] top-9 bottom-0 w-px bg-slate-800" />}
            <div className={`z-10 grid h-9 w-9 shrink-0 place-items-center rounded-full ring-1 ${s.ring}`}>
              <ActorIcon size={16} />
            </div>
            <div className="min-w-0 flex-1 pt-0.5">
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-[11px] font-medium uppercase tracking-wide text-slate-500">{step.actor}</span>
                <s.Icon size={12} className={s.ring.split(' ').pop()} />
              </div>
              <div className="text-sm font-medium text-slate-100">{step.title}</div>
              <p className="mt-0.5 text-sm text-slate-400">{step.detail}</p>

              {step.quote && (
                <blockquote className="mt-2 rounded-md border-l-2 border-amber-500 bg-amber-500/5 px-3 py-2 font-mono text-xs text-amber-200">
                  {step.quote}
                </blockquote>
              )}

              {step.code && (
                <pre className="scroll-thin mt-2 overflow-x-auto rounded-md bg-slate-950 px-3 py-2 font-mono text-xs text-slate-300 ring-1 ring-slate-800">
                  {JSON.stringify(step.code, null, 2)}
                </pre>
              )}

              {step.checks && (
                <ul className="mt-2 divide-y divide-slate-800 rounded-md ring-1 ring-slate-800">
                  {step.checks.map((c) => (
                    <li key={c.name} className="flex items-center gap-3 px-3 py-1.5 text-xs">
                      {c.passed ? (
                        <Check size={14} className="shrink-0 text-emerald-400" />
                      ) : (
                        <X size={14} className="shrink-0 text-rose-400" />
                      )}
                      <span className="text-slate-200">{c.name}</span>
                      <span className="ml-auto truncate text-right font-mono text-slate-500">{c.detail}</span>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </li>
        );
      })}
      {running && visibleCount < steps.length && (
        <li className="flex items-center gap-4 pb-2 text-sm text-slate-500">
          <span className="grid h-9 w-9 place-items-center">
            <span className="h-2 w-2 animate-ping rounded-full bg-cyan-400" />
          </span>
          Executing…
        </li>
      )}
    </ol>
  );
}
