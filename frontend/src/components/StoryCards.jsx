import { Check, X } from 'lucide-react';
import { TONE } from './ui';

// "How it played out" — one solid-colour card per step of the test.
export default function StoryCards({ steps, visibleCount = steps.length, running = false }) {
  return (
    <ol className="grid grid-cols-[repeat(auto-fill,minmax(min(100%,190px),1fr))] gap-3">
      {steps.slice(0, visibleCount).map((step, i) => (
        <li key={step.key} className={`animate-pop-in flex min-w-0 flex-col gap-2.5 rounded-[20px] p-4 ${TONE[step.tone]}`}>
          <div className="flex items-center gap-2 font-bold">
            <span className="grid h-7 w-7 shrink-0 place-items-center rounded-lg bg-card/70 text-[13px] font-extrabold">
              {i + 1}
            </span>
            {step.actor}
          </div>

          <p className="text-[15px] leading-snug text-ink">{step.text}</p>

          {step.quote && (
            <blockquote className="rounded-xl bg-card/60 px-3 py-2 text-[13px] italic leading-snug text-ink/85">
              “{step.quote}”
            </blockquote>
          )}

          {step.checks && (
            <ul className="grid gap-1 text-[13px] text-ink">
              {step.checks.map((c) => (
                <li key={c.name} className="flex items-start gap-1.5" title={c.detail}>
                  {c.passed ? (
                    <Check size={14} strokeWidth={3} className="mt-0.5 shrink-0 text-c-mint-ink" />
                  ) : (
                    <X size={14} strokeWidth={3} className="mt-0.5 shrink-0 text-c-rose-ink" />
                  )}
                  <span className={c.passed ? 'opacity-75' : 'font-semibold'}>{c.name}</span>
                </li>
              ))}
            </ul>
          )}

          {step.code && (
            <details className="text-[13px]">
              <summary className="cursor-pointer font-semibold opacity-80 hover:opacity-100">Show the exact request</summary>
              <pre className="mt-2 overflow-x-auto rounded-xl bg-card/60 p-2.5 font-mono text-[11.5px] leading-relaxed text-ink">
                {JSON.stringify(step.code, null, 2)}
              </pre>
            </details>
          )}

          {step.tag && (
            <span className="mt-auto self-start rounded-full bg-card/75 px-2.5 py-0.5 text-xs font-bold">{step.tag}</span>
          )}
        </li>
      ))}

      {running && visibleCount < steps.length && (
        <li className="grid min-h-28 place-items-center rounded-[20px] border-2 border-dashed border-line text-sm font-semibold text-muted">
          <span className="flex items-center gap-2">
            <span className="h-2 w-2 animate-ping rounded-full bg-ink" /> Next step…
          </span>
        </li>
      )}
    </ol>
  );
}
