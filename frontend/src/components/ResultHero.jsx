import { TONE, VERDICT_META, StatTile } from './ui';
import { money } from '../services/simulator';

// The big plain-language answer at the top of a result, plus the four money tiles.
export default function ResultHero({ run, actions }) {
  const meta = VERDICT_META[run.verdict.level];
  const { outcome, proposal, config, decision, deviated } = run;
  const moneyOut = outcome.sent && deviated;

  return (
    <div className="animate-pop-in grid gap-3">
      <div className={`flex flex-col rounded-[28px] p-6 sm:p-8 ${TONE[meta.tone]}`}>
        <span className="text-xs font-bold uppercase tracking-[0.08em]">Result · {meta.label}</span>
        <h2 className="mt-2 text-2xl font-extrabold leading-tight tracking-tight text-ink sm:text-[32px]">
          {run.verdict.title}
        </h2>
        <p className="mt-3 max-w-[52ch] text-ink/85 sm:text-[17px]">{run.verdict.summary}</p>
        {actions && <div className="mt-6 flex flex-wrap gap-2.5">{actions}</div>}
      </div>

      <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
        <StatTile tone="sky" label="You approved" value={money(config.authorizedAmount)} />
        <StatTile
          tone={deviated ? 'peach' : 'sky'}
          label="Agent tried"
          value={money(proposal.amount)}
          hint={proposal.payee !== run.approval.approvedPayee && deviated ? 'to the wrong shop' : undefined}
        />
        <StatTile
          tone={moneyOut ? 'rose' : 'mint'}
          label="Actually charged"
          value={money(outcome.amount)}
        />
        {decision.gatewayEnabled ? (
          <StatTile tone="lilac" label="Guard checks failed" value={`${decision.failedChecks ?? 0} / 5`} />
        ) : (
          <StatTile tone="lilac" label="Payment guard" value="Off" />
        )}
      </div>
    </div>
  );
}
