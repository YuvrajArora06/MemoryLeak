// Shared building blocks for the "soft blocks" design.
// Tailwind needs full class names, so every tone is spelled out here.

export const TONE = {
  sky: 'bg-c-sky text-c-sky-ink',
  butter: 'bg-c-butter text-c-butter-ink',
  peach: 'bg-c-peach text-c-peach-ink',
  mint: 'bg-c-mint text-c-mint-ink',
  lilac: 'bg-c-lilac text-c-lilac-ink',
  rose: 'bg-c-rose text-c-rose-ink',
};

export const VERDICT_META = {
  vulnerable: { label: 'Money got out', tone: 'rose' },
  mitigated: { label: 'Caught in time', tone: 'butter' },
  secure: { label: 'All good', tone: 'mint' },
  blocked: { label: 'Blocked by mistake', tone: 'lilac' },
};

export function Chip({ tone = 'sky', children, className = '' }) {
  return (
    <span
      className={`inline-flex items-center gap-1 whitespace-nowrap rounded-full px-2.5 py-0.5 text-xs font-bold ${TONE[tone]} ${className}`}
    >
      {children}
    </span>
  );
}

export function VerdictChip({ level }) {
  const m = VERDICT_META[level];
  return <Chip tone={m.tone}>{m.label}</Chip>;
}

export function Card({ className = '', children }) {
  return <div className={`rounded-3xl border border-line bg-card ${className}`}>{children}</div>;
}

export function Button({ variant = 'primary', className = '', children, ...props }) {
  const styles = {
    primary: 'bg-ink text-paper hover:opacity-90 border-2 border-ink',
    outline: 'border-2 border-ink text-ink hover:bg-ink/5',
    ghost: 'border-2 border-transparent text-muted hover:text-ink hover:bg-ink/5',
  }[variant];
  return (
    <button
      className={`inline-flex items-center justify-center gap-2 rounded-xl px-4 py-2 text-[15px] font-bold transition disabled:cursor-not-allowed disabled:opacity-50 ${styles} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
}

export function Toggle({ id, checked, onChange, label, description }) {
  return (
    <div className="flex items-start justify-between gap-4">
      <label htmlFor={id} className="cursor-pointer">
        <span className="block font-semibold">{label}</span>
        {description && <span className="block text-sm text-muted">{description}</span>}
      </label>
      <button
        id={id}
        type="button"
        role="switch"
        aria-checked={checked}
        onClick={() => onChange(!checked)}
        className={`relative mt-1 h-6 w-11 shrink-0 rounded-full transition-colors ${checked ? 'bg-ink' : 'bg-line'}`}
      >
        <span
          className={`absolute top-1 h-4 w-4 rounded-full bg-paper transition-all ${checked ? 'left-6' : 'left-1'}`}
        />
      </button>
    </div>
  );
}

export function StatTile({ tone, label, value, hint }) {
  return (
    <div className={`flex flex-col rounded-[20px] p-4 sm:p-5 ${TONE[tone]}`}>
      <span className="text-sm font-semibold">{label}</span>
      <span className="mt-0.5 text-3xl font-extrabold tracking-tight tabular-nums">{value}</span>
      {hint && <span className="mt-1 text-xs font-medium opacity-80">{hint}</span>}
    </div>
  );
}

export function PageTitle({ title, children, right }) {
  return (
    <header className="flex flex-wrap items-end justify-between gap-4">
      <div className="max-w-2xl">
        <h1 className="text-3xl font-extrabold tracking-tight sm:text-4xl">{title}</h1>
        {children && <p className="mt-2 text-muted sm:text-lg">{children}</p>}
      </div>
      {right}
    </header>
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
