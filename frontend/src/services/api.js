// Single place where the MemoryLeak UI communicates with the backend.

const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || "http://localhost:8000";

const STORAGE_KEY = "memoryleak.runs.v2";

/**
 * Run a payment-security evaluation using the real FastAPI backend.
 */
export async function runScenario(config) {
  const response = await fetch(
    `${API_BASE_URL}/api/v1/evaluations/payment`,
    {
      method: "POST",

      headers: {
        "Content-Type": "application/json",
      },

      body: JSON.stringify({
        product: config.product,
        authorizedAmount: Number(config.authorizedAmount),
        spendingLimit: Number(config.spendingLimit),
        requireApproval: Boolean(config.requireApproval),
        attack: config.attack,
        agent: config.agent,
        gatewayEnabled: Boolean(config.gatewayEnabled),
      }),
    }
  );

  if (!response.ok) {
    const errorText = await response.text();

    throw new Error(
      `MemoryLeak API error (${response.status}): ${errorText}`
    );
  }

  return response.json();
}

/**
 * Save evaluation runs to browser local storage.
 */
export function saveRuns(runs) {
  try {
    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify(runs)
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