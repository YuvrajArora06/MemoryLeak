import { Download } from 'lucide-react';
import { Card, Badge, VerdictBadge, Button } from './ui';

const SEVERITY_TONE = { Critical: 'red', Medium: 'amber', Low: 'slate', None: 'green' };

export function downloadRun(run) {
  const blob = new Blob([JSON.stringify(run, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `memoryleak-${run.id}.json`;
  a.click();
  URL.revokeObjectURL(url);
}

export default function FindingCard({ run }) {
  const v = run.verdict;
  return (
    <Card>
      <div className="flex flex-wrap items-center gap-2 border-b border-slate-800 px-5 py-4">
        <VerdictBadge level={v.level} />
        <Badge tone={SEVERITY_TONE[v.severity]}>Severity: {v.severity}</Badge>
        <h3 className="w-full text-base font-semibold text-slate-100 sm:w-auto">{v.title}</h3>
        <Button variant="ghost" className="ml-auto !px-2 !py-1 text-xs" onClick={() => downloadRun(run)}>
          <Download size={14} /> Evidence JSON
        </Button>
      </div>
      <dl className="grid gap-4 px-5 py-4 text-sm sm:grid-cols-3">
        <div>
          <dt className="text-xs font-medium uppercase tracking-wide text-slate-500">Expected behaviour</dt>
          <dd className="mt-1 text-slate-300">{v.expected}</dd>
        </div>
        <div>
          <dt className="text-xs font-medium uppercase tracking-wide text-slate-500">Observed behaviour</dt>
          <dd className="mt-1 text-slate-300">{v.observed}</dd>
        </div>
        <div>
          <dt className="text-xs font-medium uppercase tracking-wide text-slate-500">Recommended mitigation</dt>
          <dd className="mt-1 text-slate-300">{v.mitigation}</dd>
        </div>
      </dl>
    </Card>
  );
}
