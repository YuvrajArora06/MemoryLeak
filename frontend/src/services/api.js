// Single place where the MemoryLeak UI communicates with the backend.

import { presentRun, runPaymentScenario } from "./simulator";

const API_BASE_URL = (
  import.meta.env.VITE_API_BASE_URL || "http://localhost:8000"
).replace(/\/+$/, "");

// Set VITE_USE_SIMULATOR=true to run fully offline with the in-browser mock.
const USE_SIMULATOR = import.meta.env.VITE_USE_SIMULATOR === "true";

// Free Render instances can take up to a minute to wake up.
const REQUEST_TIMEOUT_MS = 90_000;

const STORAGE_KEY = "memoryleak.runs.v2";
const MAX_SAVED_RUNS = 100;

// The backend's check names, in the order the UI shows them.
const BACKEND_CHECKS = [
  "Amount is within authorization",
  "Amount is within spending limit",
  "Explicit approval is present",
  "Approved amount matches the proposal",
  "Payee is allowlisted",
];

const VERDICT_LEVELS = ["vulnerable", "mitigated", "secure", "blocked"];

/**
 * Run a payment-security evaluation on the MemoryLeak API and return it in the
 * shape the dashboard renders.
 */
export async function runScenario(config) {
  if (USE_SIMULATOR) {
    return runPaymentScenario(config);
  }

  let response;
  try {
    response = await fetch(`${API_BASE_URL}/api/v1/evaluations/payment`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        product: config.product,
        authorizedAmount: Number(config.authorizedAmount),
        spendingLimit: Number(config.spendingLimit),
        requireApproval: Boolean(config.requireApproval),
        attack: config.attack,
        agent: config.agent,
        gatewayEnabled: Boolean(config.gatewayEnabled),
      }),
      signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS),
    });
  } catch (error) {
    const reason =
      error.name === "TimeoutError"
        ? "it didn't answer in time"
        : "the request couldn't be sent";
    throw new Error(
      `Couldn't reach the MemoryLeak API at ${API_BASE_URL}: ${reason}.`
    );
  }

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`MemoryLeak API error (${response.status}): ${errorText}`);
  }

  return fromApi(config, await response.json());
}

/**
 * Convert an API evaluation into the dashboard's run. The backend's facts
 * (proposal, check results, decision, outcome, verdict) are used as-is; only
 * the wording comes from presentRun().
 */
export function fromApi(config, api) {
  const byName = new Map(api.decision.checks.map((check) => [check.name, check]));
  const missing = BACKEND_CHECKS.filter((name) => !byName.has(name));
  if (missing.length) {
    throw new Error(
      `MemoryLeak API returned unexpected guard checks (missing: ${missing.join(", ")}).`
    );
  }
  if (!VERDICT_LEVELS.includes(api.verdict.level)) {
    throw new Error(`MemoryLeak API returned an unknown verdict "${api.verdict.level}".`);
  }

  const proposal = {
    tool: api.proposal.tool,
    amount: Number(api.proposal.amount),
    currency: api.proposal.currency,
    payee: api.proposal.payee,
    requestedApproval: api.proposal.requestedApproval,
    intent: "CAPTURE",
  };
  const approval = api.approval.granted
    ? {
        granted: true,
        approvedAmount: Number(api.approval.approvedAmount),
        approvedPayee: api.approval.approvedPayee,
      }
    : { granted: false, approvedAmount: null, approvedPayee: null };

  const outcome = api.outcome.attempted
    ? {
        sent: true,
        status: api.outcome.status,
        orderId: api.outcome.orderId,
        amount: proposal.amount,
        payee: proposal.payee,
      }
    : { sent: false, status: api.outcome.status, orderId: null, amount: 0, payee: null };

  return presentRun({
    id: api.id,
    createdAt: api.createdAt,
    source: "api",
    config,
    proposal,
    approval,
    passed: BACKEND_CHECKS.map((name) => byName.get(name).passed),
    allowed: api.decision.allowed,
    outcome,
    level: api.verdict.level,
    backend: api,
  });
}

/**
 * Save evaluation runs to browser local storage.
 */
export function saveRuns(runs) {
  try {
    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify(runs.slice(0, MAX_SAVED_RUNS))
    );
  } catch (error) {
    console.warn(
      "MemoryLeak: unable to save runs to local storage.",
      error
    );
  }
}

/**
 * Load previously saved evaluation runs.
 */
export function loadRuns() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);

    return raw ? JSON.parse(raw) : [];
  } catch (error) {
    console.warn(
      "MemoryLeak: unable to load runs from local storage.",
      error
    );

    return [];
  }
}

/**
 * Download one evaluation run as a JSON evidence file.
 */
export function downloadRun(run) {
  const blob = new Blob(
    [JSON.stringify(run, null, 2)],
    {
      type: "application/json",
    }
  );

  const url = URL.createObjectURL(blob);

  const link = document.createElement("a");

  link.href = url;
  link.download = `memoryleak-${run.id}.json`;

  document.body.appendChild(link);

  link.click();

  document.body.removeChild(link);

  URL.revokeObjectURL(url);
}