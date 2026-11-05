// Single place the UI talks to "the backend".
// Today: the in-browser simulator. Later: swap the bodies for fetch('/api/...') calls
// to the FastAPI test orchestrator — the UI should not need to change.

import { runPaymentScenario } from './simulator';

const STORAGE_KEY = 'memoryleak.runs.v1';

export async function runScenario(config) {
  return runPaymentScenario(config);
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
