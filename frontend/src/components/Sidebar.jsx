import { LayoutDashboard, FlaskConical, Library, FileText, Droplets } from 'lucide-react';

export const NAV = [
  { id: 'dashboard', label: 'Dashboard', Icon: LayoutDashboard },
  { id: 'lab', label: 'Payment Security Lab', Icon: FlaskConical },
  { id: 'scenarios', label: 'Scenarios', Icon: Library },
  { id: 'reports', label: 'Reports', Icon: FileText },
];

export default function Sidebar({ page, onNavigate, runCount }) {
  return (
    <aside className="flex w-full shrink-0 flex-col border-b border-slate-800 bg-slate-950 md:h-full md:w-60 md:border-b-0 md:border-r">
      <div className="flex items-center gap-2.5 px-5 py-4 md:py-5">
        <div className="grid h-8 w-8 place-items-center rounded-lg bg-cyan-500/15 ring-1 ring-cyan-500/40">
          <Droplets size={18} className="text-cyan-400" />
        </div>
        <div>
          <div className="text-sm font-semibold text-slate-100">MemoryLeak</div>
          <div className="text-[11px] text-slate-500">AI Agent Security Lab</div>
        </div>
      </div>

      <nav className="flex gap-1 overflow-x-auto px-3 pb-3 md:flex-col md:pb-0">
        {NAV.map(({ id, label, Icon }) => {
          const active = page === id;
          return (
            <button
              key={id}
              onClick={() => onNavigate(id)}
              className={`flex shrink-0 items-center gap-3 rounded-lg px-3 py-2 text-sm transition-colors ${
                active ? 'bg-slate-800 text-slate-100' : 'text-slate-400 hover:bg-slate-900 hover:text-slate-200'
              }`}
            >
              <Icon size={16} className={active ? 'text-cyan-400' : ''} />
              <span className="whitespace-nowrap">{label}</span>
              {id === 'reports' && runCount > 0 && (
                <span className="ml-auto rounded-full bg-slate-700 px-1.5 text-[10px] tabular-nums text-slate-300">
                  {runCount}
                </span>
              )}
            </button>
          );
        })}
      </nav>

      <div className="mt-auto hidden p-4 md:block">
        <div className="rounded-lg border border-slate-800 bg-slate-900/60 p-3 text-[11px] leading-relaxed text-slate-400">
          <div className="mb-1 flex items-center gap-1.5 font-medium text-amber-300">
            <span className="h-1.5 w-1.5 rounded-full bg-amber-400" /> Sandbox mode
          </div>
          Synthetic users and PayPal sandbox only. No real funds. Engine is simulated in-browser until the FastAPI
          backend is connected.
        </div>
      </div>
    </aside>
  );
}
