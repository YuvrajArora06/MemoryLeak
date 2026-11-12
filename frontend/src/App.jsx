import { useEffect, useState } from 'react';
import TopBar from './components/TopBar';
import Dashboard from './pages/Dashboard';
import PaymentLab from './pages/PaymentLab';
import Scenarios from './pages/Scenarios';
import Reports from './pages/Reports';
import { loadRuns, saveRuns, runScenario } from './services/api';
import { DEFAULT_CONFIG } from './data/scenarios';

export default function App() {
  const [page, setPage] = useState('dashboard');
  const [runs, setRuns] = useState(loadRuns);
  const [labPreset, setLabPreset] = useState(null);
  const [selectedRunId, setSelectedRunId] = useState(null);

  useEffect(() => saveRuns(runs), [runs]);

  const navigate = (id) => {
    setPage(id);
    window.scrollTo({ top: 0 });
  };

  const addRun = (run) => setRuns((rs) => [run, ...rs]);

  const openLab = (config) => {
    setLabPreset({ ...config }); // new object so the lab picks it up
    navigate('lab');
  };

  const openRun = (id) => {
    setSelectedRunId(id);
    navigate('reports');
  };

  // Overview "quick try": run instantly and jump to the result
const quickRun = async (gatewayEnabled) => {
  try {
    console.log("Starting MemoryLeak evaluation...");

    const run = await runScenario({
      ...DEFAULT_CONFIG,
      gatewayEnabled,
    });

    console.log("Evaluation result:", run);

    addRun(run);
    openRun(run.id);
  } catch (error) {
    console.error("MemoryLeak evaluation failed:", error);

    alert(`MemoryLeak API error:\n${error.message}`);
  }
};

  return (
    <div className="min-h-full">
      <TopBar page={page} onNavigate={navigate} runCount={runs.length} />
      <main className="mx-auto max-w-6xl px-4 py-8 sm:px-8 sm:py-10">
        {page === 'dashboard' && (
          <Dashboard runs={runs} onNavigate={navigate} onOpenRun={openRun} onQuickRun={quickRun} />
        )}
        {page === 'lab' && <PaymentLab preset={labPreset} onRunComplete={addRun} />}
        {page === 'scenarios' && <Scenarios onLaunch={openLab} />}
        {page === 'reports' && (
          <Reports
            runs={runs}
            selectedId={selectedRunId}
            onSelect={setSelectedRunId}
            onRerun={openLab}
            onClear={() => {
              setRuns([]);
              setSelectedRunId(null);
            }}
          />
        )}
      </main>
    </div>
  );
}
