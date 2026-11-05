import { useEffect, useState } from 'react';
import Sidebar from './components/Sidebar';
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

  const addRun = (run) => setRuns((rs) => [run, ...rs]);

  const openLab = (config) => {
    setLabPreset({ ...config }); // new object so the lab picks it up
    setPage('lab');
  };

  const openRun = (id) => {
    setSelectedRunId(id);
    setPage('reports');
  };

  // Dashboard "quick demo": run instantly and jump to the report
  const quickRun = async (gatewayEnabled) => {
    const run = await runScenario({ ...DEFAULT_CONFIG, gatewayEnabled });
    addRun(run);
    openRun(run.id);
  };

  return (
    <div className="flex h-full flex-col md:flex-row">
      <Sidebar page={page} onNavigate={setPage} runCount={runs.length} />
      <main className="min-w-0 flex-1 overflow-y-auto">
        <div className="mx-auto max-w-7xl px-4 py-6 sm:px-8 sm:py-8">
          {page === 'dashboard' && (
            <Dashboard runs={runs} onNavigate={setPage} onOpenRun={openRun} onQuickRun={quickRun} />
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
        </div>
      </main>
    </div>
  );
}
