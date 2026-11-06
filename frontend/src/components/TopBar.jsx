import { useEffect, useState } from 'react';
import { Droplet, Moon, Sun } from 'lucide-react';

const THEME_KEY = 'memoryleak.theme';

function useTheme() {
  const [theme, setTheme] = useState(() => {
    try {
      return localStorage.getItem(THEME_KEY) || 'light';
    } catch {
      return 'light';
    }
  });
  useEffect(() => {
    document.documentElement.dataset.theme = theme;
    try {
      localStorage.setItem(THEME_KEY, theme);
    } catch {
      /* ignore */
    }
  }, [theme]);
  return [theme, () => setTheme((t) => (t === 'dark' ? 'light' : 'dark'))];
}

export const NAV = [
  { id: 'dashboard', label: 'Overview' },
  { id: 'lab', label: 'Payment lab' },
  { id: 'scenarios', label: 'Test library' },
  { id: 'reports', label: 'History' },
];

export default function TopBar({ page, onNavigate, runCount }) {
  const [theme, toggleTheme] = useTheme();
  return (
    <header className="sticky top-0 z-20 border-b border-line bg-paper">
      <div className="mx-auto flex max-w-6xl flex-wrap items-center gap-x-6 gap-y-3 px-4 py-4 sm:px-8">
        <button onClick={() => onNavigate('dashboard')} className="flex items-center gap-2">
          <span className="grid h-8 w-8 place-items-center rounded-[10px] bg-c-sky text-c-sky-ink">
            <Droplet size={17} strokeWidth={2.5} />
          </span>
          <span className="text-xl font-extrabold tracking-tight">MemoryLeak</span>
        </button>

        <nav className="-mx-1 flex max-w-full gap-1 overflow-x-auto px-1 order-3 w-full sm:order-none sm:w-auto">
          {NAV.map(({ id, label }) => {
            const active = page === id;
            return (
              <button
                key={id}
                onClick={() => onNavigate(id)}
                aria-current={active ? 'page' : undefined}
                className={`flex shrink-0 items-center gap-1.5 rounded-full px-4 py-1.5 text-[15px] font-semibold transition-colors ${
                  active ? 'bg-ink text-paper' : 'text-muted hover:bg-ink/5 hover:text-ink'
                }`}
              >
                {label}
                {id === 'reports' && runCount > 0 && (
                  <span
                    className={`rounded-full px-1.5 text-xs tabular-nums ${active ? 'bg-paper/20' : 'bg-line text-ink'}`}
                  >
                    {runCount}
                  </span>
                )}
              </button>
            );
          })}
        </nav>

        <span className="ml-auto flex items-center gap-2 text-sm text-muted">
          <span className="h-2 w-2 rounded-full bg-c-butter-ink" />
          Sandbox mode · no real money
        </span>
        <button
          onClick={toggleTheme}
          aria-label={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
          title={theme === 'dark' ? 'Light mode' : 'Dark mode'}
          className="grid h-9 w-9 place-items-center rounded-full text-muted transition-colors hover:bg-ink/5 hover:text-ink"
        >
          {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
        </button>
      </div>
    </header>
  );
}
