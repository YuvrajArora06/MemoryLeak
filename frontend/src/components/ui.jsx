import { ShieldAlert, ShieldCheck, ShieldHalf, ShieldMinus } from 'lucide-react';

export function Card({ className = '', children }) {
  return (
    <div className={`rounded-xl border border-slate-800 bg-slate-900/60 ${className}`}>{children}</div>
  );
}

export function CardHeader({ title, subtitle, right }) {
  return (
    <div className="flex items-start justify-between gap-4 border-b border-slate-800 px-5 py-4">
      <div>
        <h3 className="text-sm font-semibold text-slate-100">{title}</h3>
        {subtitle && <p className="mt-0.5 text-xs text-slate-400">{subtitle}</p>}
      </div>
      {right}
    </div>
  );
}

const TONES = {
  slate: 'bg-slate-800 text-slate-300 ring-slate-700',
  cyan: 'bg-cyan-500/10 text-cyan-300 ring-cyan-500/30',
  green: 'bg-emerald-500/10 text-emerald-300 ring-emerald-500/30',
  amber: 'bg-amber-500/10 text-amber-300 ring-amber-500/30',
  red: 'bg-rose-500/10 text-rose-300 ring-rose-500/30',
};

export function Badge({ tone = 'slate', children, className = '' }) {
  return (
    <span
      className={`inline-flex items-center gap-1 rounded-md px-2 py-0.5 text-xs font-medium ring-1 ring-inset ${TONES[tone]} ${className}`}
    >
      {children}
    </span>
  );
}

export const VERDICT_META = {
  vulnerable: { tone: 'red', label: 'Vulnerable', Icon: ShieldAlert },
  mitigated: { tone: 'amber', label: 'Mitigated', Icon: ShieldHalf },
  secure: { tone: 'green', label: 'Secure', Icon: ShieldCheck },
  blocked: { tone: 'slate', label: 'False positive', Icon: ShieldMinus },
};

export function VerdictBadge({ level }) {
  const m = VERDICT_META[level];
  return (
    <Badge tone={m.tone}>
      <m.Icon size={12} /> {m.label}
    </Badge>
  );
}

export function StatCard({ label, value, hint, tone = 'slate', Icon }) {
  const accent = {
    slate: 'text-slate-100',
    red: 'text-rose-400',
    amber: 'text-amber-400',
    green: 'text-emerald-400',
    cyan: 'text-cyan-400',
  }[tone];
  return (
    <Card className="p-5">
      <div className="flex items-center justify-between text-xs font-medium uppercase tracking-wide text-slate-400">
        {label}
        {Icon && <Icon size={16} className={accent} />}
      </div>
      <div className={`mt-2 text-3xl font-semibold tabular-nums ${accent}`}>{value}</div>
      {hint && <div className="mt-1 text-xs text-slate-500">{hint}</div>}
    </Card>
  );
}

export function Button({ variant = 'primary', className = '', children, ...props }) {
  const styles = {
    primary: 'bg-cyan-500 text-slate-950 hover:bg-cyan-400 disabled:bg-cyan-500/40',
    secondary: 'bg-slate-800 text-slate-200 hover:bg-slate-700 ring-1 ring-inset ring-slate-700',
    ghost: 'text-slate-300 hover:bg-slate-800',
  }[variant];
  return (
    <button
      className={`inline-flex items-center justify-center gap-2 rounded-lg px-4 py-2 text-sm font-medium transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cyan-400 disabled:cursor-not-allowed ${styles} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
}

export function Toggle({ checked, onChange, label, description, disabled }) {
  return (
    <label className={`flex items-start justify-between gap-4 ${disabled ? 'opacity-50' : 'cursor-pointer'}`}>
      <span>
        <span className="block text-sm text-slate-200">{label}</span>
        {description && <span className="block text-xs text-slate-500">{description}</span>}
      </span>
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        disabled={disabled}
        onClick={() => onChange(!checked)}
        className={`relative mt-0.5 h-5 w-9 shrink-0 rounded-full transition-colors ${checked ? 'bg-cyan-500' : 'bg-slate-700'}`}
      >
        <span
          className={`absolute top-0.5 h-4 w-4 rounded-full bg-white transition-all ${checked ? 'left-[18px]' : 'left-0.5'}`}
        />
      </button>
    </label>
  );
}

export function formatTime(iso) {
  return new Date(iso).toLocaleString(undefined, {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}
