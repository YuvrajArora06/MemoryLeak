// Single place the UI talks to "the backend".
// Today: the in-browser simulator. Later: swap the bodies for fetch('/api/...') calls
// to the FastAPI test orchestrator — the UI should not need to change.

import { runPaymentScenario } from './simulator';

// v2: run shape changed with the "soft blocks" redesign (plain-language steps)
const STORAGE_KEY = 'memoryleak.runs.v2';

export async function runScenario(config) {
  return runPaymentScenario(config);
}

// Save one test's full evidence (trace, checks, verdict) as a JSON file.
export function downloadRun(run) {
  const blob = new Blob([JSON.stringify(run, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `memoryleak-${run.id}.json`;
  a.click();
  URL.revokeObjectURL(url);
}

export function loadRuns() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function saveRuns(runs) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(runs.slice(0, 100)));
  } catch {
    /* storage unavailable — runs stay in memory */
  }
}
