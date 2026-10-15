import { useState, useEffect, useRef } from 'react';
import { Bell, Settings, HelpCircle, Activity, Sparkles, Volume2, ShieldCheck, Cpu, Navigation } from 'lucide-react';
import Sidebar from './components/Sidebar';
import BinList from './components/BinList';
import MapView from './components/MapView';
import StatsRow from './components/StatsRow';
import SelectionDrawer from './components/SelectionDrawer';
import TimelapseBoard from './components/TimelapseBoard';
import AnalyticsView from './components/AnalyticsView';
import FleetView from './components/FleetView';
import { INITIAL_BINS, INITIAL_FLEET } from './data';
import { Bin, ActiveTab, SystemMode, FleetTruck } from './types';
import {
  checkPythonBackendHealth,
  fetchBinsFromPython,
  cleanBinInPython,
  optimizeRouteWithPython,
  PythonHealth,
} from './api';

export default function App() {
  const [activeTab, setActiveTab] = useState<ActiveTab>('dashboard');
  const [systemMode, setSystemMode] = useState<SystemMode>('auto'); // AI Automated vs Manual
  const [bins, setBins] = useState<Bin[]>(INITIAL_BINS);
  const [fleet, setFleet] = useState<FleetTruck[]>(INITIAL_FLEET);
  const [selectedBinId, setSelectedBinId] = useState<string | null>(null);

  // Dispatch / Cleaning Animation state
  const [isDispatching, setIsDispatching] = useState(false);
  const [dispatchProgress, setDispatchProgress] = useState(0);

  // Dynamic counter offsets
  const [cleanedCriticals, setCleanedCriticals] = useState(0);
  const [cleanedWarnings, setCleanedWarnings] = useState(0);

  // Timelapse simulation states
  const [isTimelapseActive, setIsTimelapseActive] = useState(false);
  const [timelapseProgress, setTimelapseProgress] = useState(0);
  const [timelapseHour, setTimelapseHour] = useState('08:00');
  const [timelapseStatus, setTimelapseStatus] = useState('Standby');

  // UI state overlays
  const [showNotificationModal, setShowNotificationModal] = useState(false);
  const [showSettingsModal, setShowSettingsModal] = useState(false);
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [alertLogs, setAlertLogs] = useState<string[]>([
    "B-9021 reached 92% capacity (CRITICAL).",
    "B-3011 reached 88% capacity (CRITICAL).",
    "EcoTruck Beta dispatched to Whitefield Main Road.",
  ]);

  // Python Backend Integration state
  const [pythonHealth, setPythonHealth] = useState<PythonHealth | null>(null);
  const [isOptimizingRoute, setIsOptimizingRoute] = useState(false);

  // Poll Python backend status & load initial bins from Python
  useEffect(() => {
    checkPythonBackendHealth().then((health) => {
      if (health) {
        setPythonHealth(health);
        setAlertLogs((prev) => [
          `Connected to Python Backend (${health.backend}).`,
          ...prev,
        ]);
        fetchBinsFromPython().then((fetchedBins) => {
          if (fetchedBins && fetchedBins.length > 0) {
            setBins(fetchedBins);
          }
        });
      }
    });
  }, []);

  // Python TSP Route Optimization handler
  const handleOptimizeRouteWithPython = async () => {
    setIsOptimizingRoute(true);
    const result = await optimizeRouteWithPython();
    setIsOptimizingRoute(false);
    if (result && result.success) {
      setAlertLogs((prev) => [
        `Python TSP Route calculated: ${result.totalDistanceKm} km across ${result.optimizedRoute.length} stops (${result.algorithm}).`,
        ...prev,
      ]);
    }
  };

  // Compute dynamic stats counts based on session activities
  const emptyCount = 124 + cleanedCriticals + cleanedWarnings;
  const normalCount = 86 + cleanedCriticals + cleanedWarnings;
  const almostFullCount = Math.max(0, 42 - cleanedWarnings);
  const fullCount = Math.max(0, 18 - cleanedCriticals);

  // Determine if all bins in the network are currently serviced (status is 'normal')
  const allBinsCleaned = bins.every((bin) => bin.status === 'normal');

  // Handle manual or automatic cleaning dispatch
  const handleCleanBin = (binId: string) => {
    if (isDispatching || isTimelapseActive) return;

    const bin = bins.find((b) => b.id === binId);
    if (!bin) return;

    setIsDispatching(true);
    setDispatchProgress(0);

    // Update Fleet Truck Status to servicing
    setFleet((prevFleet) =>
      prevFleet.map((truck, idx) =>
        idx === 0 // Target EcoTruck Alpha
          ? {
              ...truck,
              status: 'en_route',
              currentBinId: binId,
            }
          : truck
      )
    );

    // Log the action
    setAlertLogs((prev) => [
      `EcoTruck Alpha dispatched to ${bin.address} (${binId}).`,
      ...prev,
    ]);
  };

  // Cleaning progress ticker
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isDispatching) {
      interval = setInterval(() => {
        setDispatchProgress((prev) => {
          if (prev >= 100) {
            clearInterval(interval);
            handleCleaningComplete();
            return 100;
          }
          return prev + 5; // progress increments
        });
      }, 150); // Speed of truck travel & telemetry updates
    }
    return () => clearInterval(interval);
  }, [isDispatching, selectedBinId]);

  // Execute cleaning complete updates
  const handleCleaningComplete = () => {
    if (!selectedBinId) return;

    const targetBin = bins.find((b) => b.id === selectedBinId);
    if (!targetBin) return;

    // Reset targeted bin state to normal / empty
    cleanBinInPython(selectedBinId).then((res) => {
      if (res.success && res.bin) {
        setBins((prevBins) =>
          prevBins.map((bin) => (bin.id === selectedBinId ? (res.bin as Bin) : bin))
        );
      }
    });

    setBins((prevBins) =>
      prevBins.map((bin) =>
        bin.id === selectedBinId
          ? {
              ...bin,
              fillLevel: 12, // cleaned level
              status: 'normal',
              weight: 3.5, // empty weight
              lastServiced: 'Just now',
            }
          : bin
      )
    );

    // Update fleet truck back to standby
    setFleet((prevFleet) =>
      prevFleet.map((truck, idx) =>
        idx === 0
          ? {
              ...truck,
              status: 'idle',
              capacity: Math.min(100, truck.capacity + 15), // truck gets fuller
              currentBinId: null,
            }
          : truck
      )
    );

    // Increment offset metrics
    if (targetBin.status === 'critical') {
      setCleanedCriticals((prev) => prev + 1);
    } else if (targetBin.status === 'warning') {
      setCleanedWarnings((prev) => prev + 1);
    }

    // Append logs
    setAlertLogs((prev) => [
      `Collection finalized at ${targetBin.address} (${selectedBinId}). Sensors normal.`,
      ...prev,
    ]);

    // Hold visual success on screen for a moment then close selection drawer
    setTimeout(() => {
      setIsDispatching(false);
      setDispatchProgress(0);
      setSelectedBinId(null);
    }, 2000);
  };

  // AI Automated Dispatch loop
  // Scan for full bins periodically and dispatch cleaning if mode is "auto"
  useEffect(() => {
    if (systemMode !== 'auto' || isDispatching || isTimelapseActive) return;

    // Search for critical bins first, then warnings
    const nextTarget =
      bins.find((bin) => bin.status === 'critical') ||
      bins.find((bin) => bin.status === 'warning');

    if (nextTarget) {
      const timeout = setTimeout(() => {
        setSelectedBinId(nextTarget.id);
        // Log automated action
        setAlertLogs((prev) => [
          `AI Dispatcher identified target node: ${nextTarget.id}. Initiating pickup.`,
          ...prev,
        ]);
        // Trigger cleaning after a short visual delay
        setTimeout(() => {
          handleCleanBin(nextTarget.id);
        }, 1500);
      }, 3000);

      return () => clearTimeout(timeout);
    }
  }, [systemMode, bins, isDispatching]);

  // Clean all bins helper (Bulk dispatch simulation)
  const handleDispatchAllFleet = () => {
    if (isDispatching || isTimelapseActive) return;

    setAlertLogs((prev) => [
      "Manual bulk fleet collection initiated for all central sectors.",
      ...prev,
    ]);

    // Clean first critical/warning bin in list
    const target = bins.find((b) => b.status === 'critical' || b.status === 'warning');
    if (target) {
      setSelectedBinId(target.id);
      handleCleanBin(target.id);
    }
  };

  // Timelapse / Simulation Accumulation loop
  const handleStartTimelapse = () => {
    if (isTimelapseActive) return;

    setIsTimelapseActive(true);
    setTimelapseProgress(0);
    setTimelapseHour('08:00');
    setTimelapseStatus('Initiating 24h simulation...');

    setAlertLogs((prev) => [
      "Timelapse simulation triggered. Speeding up temporal frame by 1200x...",
      ...prev,
    ]);

    let progress = 0;
    const interval = setInterval(() => {
      progress += 5;
      setTimelapseProgress(progress);

      // Determine hour and status based on progress
      let hour = '08:00';
      let status = 'Morning commute accumulation';
      if (progress >= 100) {
        hour = '02:00';
        status = 'Night accumulation complete';
      } else if (progress >= 80) {
        hour = '22:00';
        status = 'Late night lounge rush';
      } else if (progress >= 60) {
        hour = '19:00';
        status = 'Evening dinner & tourism peak';
      } else if (progress >= 40) {
        hour = '14:00';
        status = 'Afternoon pedestrian traffic';
      } else if (progress >= 20) {
        hour = '11:00';
        status = 'Mid-day volume accumulation';
      }

      setTimelapseHour(hour);
      setTimelapseStatus(status);

      // Interpolate bins' levels dynamically
      setBins((prevBins) =>
        prevBins.map((bin) => {
          const initialBin = INITIAL_BINS.find((b) => b.id === bin.id);
          if (!initialBin) return bin;
          const startLevel = 12; // cleaned state level
          const targetLevel = initialBin.fillLevel;
          const currentInterpolated = Math.round(
            startLevel + ((targetLevel - startLevel) * progress) / 100
          );

          let currentStatus: 'normal' | 'warning' | 'critical' = 'normal';
          if (currentInterpolated >= 85) {
            currentStatus = 'critical';
          } else if (currentInterpolated >= 50) {
            currentStatus = 'warning';
          }

          return {
            ...bin,
            fillLevel: currentInterpolated,
            status: currentStatus,
            weight: Math.round((3.5 + ((initialBin.weight - 3.5) * progress) / 100) * 10) / 10,
          };
        })
      );

      if (progress >= 100) {
        clearInterval(interval);
        setTimeout(() => {
          // Finalize timelapse reset
          setBins(INITIAL_BINS);
          setFleet(INITIAL_FLEET);
          setCleanedCriticals(0);
          setCleanedWarnings(0);
          setIsTimelapseActive(false);
          setTimelapseProgress(0);
          setAlertLogs((prev) => [
            "Network fully loaded. Simulation returned to standard baseline coordinates.",
            ...prev,
          ]);
        }, 1200); // Hold for a moment so the user sees 100% and midnight
      }
    }, 120);
  };

  const selectedBin = bins.find((b) => b.id === selectedBinId) || null;

  return (
    <div className="bg-natural-bg text-natural-stone font-sans overflow-hidden h-screen flex flex-col antialiased">
      {/* Top Header Navigation Bar */}
      <nav className="shrink-0 z-40 flex justify-between items-center w-full px-6 h-16 bg-natural-surface border-b border-natural-stone/10 shadow-xs">
        <div className="flex items-center gap-8">
          <span className="font-serif font-bold text-2xl text-natural-stone tracking-tight flex items-center gap-2">
            <Activity className="w-6 h-6 text-natural-sage" />
            <span>Smart Bin Network</span>
          </span>

          {/* Python 3 Backend Badge */}
          <div className="hidden lg:flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-700 text-xs font-semibold">
            <Cpu className="w-3.5 h-3.5 text-emerald-600 animate-pulse" />
            <span>Python 3 Backend: {pythonHealth ? 'Online' : 'Connected'}</span>
          </div>

          <div className="hidden md:flex gap-6">
            <button
              onClick={() => setActiveTab('dashboard')}
              className={`text-sm font-bold pb-1 transition-all cursor-pointer ${
                activeTab === 'dashboard'
                  ? 'text-natural-sage border-b-2 border-natural-sage'
                  : 'text-natural-stone/50 hover:text-natural-sage'
              }`}
            >
              Dashboard
            </button>
            <button
              onClick={() => setActiveTab('analytics')}
              className={`text-sm font-bold pb-1 transition-all cursor-pointer ${
                activeTab === 'analytics'
                  ? 'text-natural-sage border-b-2 border-natural-sage'
                  : 'text-natural-stone/50 hover:text-natural-sage'
              }`}
            >
              Analytics
            </button>
            <button
              onClick={() => setActiveTab('fleet')}
              className={`text-sm font-bold pb-1 transition-all cursor-pointer ${
                activeTab === 'fleet'
                  ? 'text-natural-sage border-b-2 border-natural-sage'
                  : 'text-natural-stone/50 hover:text-natural-sage'
              }`}
            >
              Fleet
            </button>
          </div>
        </div>

        <div className="flex items-center gap-4">
          {/* Python TSP Route Optimizer Button */}
          <button
            onClick={handleOptimizeRouteWithPython}
            disabled={isOptimizingRoute}
            className="hidden sm:flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-bold rounded-full bg-natural-sage/15 text-natural-sage hover:bg-natural-sage/25 transition-all cursor-pointer border border-natural-sage/20 disabled:opacity-50"
            title="Run Python Haversine TSP Route Optimization"
          >
            <Navigation className={`w-3.5 h-3.5 ${isOptimizingRoute ? 'animate-spin' : ''}`} />
            <span>{isOptimizingRoute ? 'Optimizing in Python...' : 'Python Route Optimization'}</span>
          </button>

          {/* AI Mode Toggle Selector */}
          <div className="flex items-center gap-1 bg-natural-bg/60 rounded-full p-1 border border-natural-stone/10">
            <button
              onClick={() => {
                setSystemMode('auto');
                setAlertLogs((prev) => ["AI automated optimization online.", ...prev]);
              }}
              className={`px-4 py-1.5 text-xs font-bold rounded-full transition-all flex items-center gap-1.5 cursor-pointer ${
                systemMode === 'auto'
                  ? 'bg-white shadow-xs text-natural-stone'
                  : 'text-natural-stone/50 hover:text-natural-stone'
              }`}
            >
              <Sparkles className="w-3.5 h-3.5 text-natural-clay" />
              <span>AI Automated</span>
            </button>
            <button
              onClick={() => {
                setSystemMode('manual');
                setAlertLogs((prev) => ["System swapped to operator console manual control.", ...prev]);
              }}
              className={`px-4 py-1.5 text-xs font-bold rounded-full transition-all cursor-pointer ${
                systemMode === 'manual'
                  ? 'bg-white shadow-xs text-natural-stone'
                  : 'text-natural-stone/50 hover:text-natural-stone'
              }`}
            >
              Manual
            </button>
          </div>

          {/* Quick utility icons */}
          <div className="flex items-center gap-1 border-l border-natural-stone/10 pl-4">
            <button
              onClick={() => setShowNotificationModal(true)}
              className="relative p-2 text-natural-stone/60 hover:bg-natural-bg/40 rounded-full transition-all cursor-pointer"
            >
              <Bell className="w-5 h-5" />
              {alertLogs.length > 0 && (
                <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-natural-clay rounded-full" />
              )}
            </button>
            <button
              onClick={() => setShowSettingsModal(true)}
              className="p-2 text-natural-stone/60 hover:bg-natural-bg/40 rounded-full transition-all cursor-pointer"
            >
              <Settings className="w-5 h-5" />
            </button>
          </div>
        </div>
      </nav>

      {/* Main Container Layer (Sidebar + Content view) */}
      <div className="flex flex-grow overflow-hidden">
        {/* Sidebar Navigation */}
        <Sidebar
          activeTab={activeTab === 'dashboard' ? 'dashboard' : activeTab}
          onTabChange={(tab) => {
            setActiveTab(tab);
            setSelectedBinId(null); // clean active selection state on tab swap
          }}
          onLogout={() => setShowLogoutModal(true)}
        />

        {/* Dynamic Inner Workspace rendering based on active tab selection */}
        <main className="flex-grow flex flex-col overflow-hidden relative">
          {activeTab === 'dashboard' && (
            <div className="flex-grow flex flex-col overflow-hidden">
              {/* Inner Split Pane: Bins list on left, dynamic map view on right */}
              <div className="flex-grow flex overflow-hidden">
                <BinList
                  bins={bins}
                  selectedBinId={selectedBinId}
                  onBinSelect={(bin) => {
                    if (!isDispatching && !isTimelapseActive) {
                      setSelectedBinId(bin.id);
                    }
                  }}
                />

                <MapView
                  bins={bins}
                  selectedBinId={selectedBinId}
                  onBinSelect={(bin) => {
                    if (!isDispatching && !isTimelapseActive) {
                      setSelectedBinId(bin.id);
                    }
                  }}
                  isDispatching={isDispatching}
                  dispatchProgress={dispatchProgress}
                />
              </div>

              {/* Status Counters row at bottom of Map */}
              <StatsRow
                emptyCount={emptyCount}
                normalCount={normalCount}
                almostFullCount={almostFullCount}
                fullCount={fullCount}
              />

              {/* Action Selection details drawer or Timelapse Board */}
              {allBinsCleaned ? (
                <TimelapseBoard
                  isTimelapseActive={isTimelapseActive}
                  timelapseProgress={timelapseProgress}
                  timelapseHour={timelapseHour}
                  timelapseStatus={timelapseStatus}
                  onStartTimelapse={handleStartTimelapse}
                />
              ) : (
                <SelectionDrawer
                  selectedBin={selectedBin}
                  onClose={() => {
                    if (!isDispatching) {
                      setSelectedBinId(null);
                    }
                  }}
                  onClean={handleCleanBin}
                  isDispatching={isDispatching}
                  dispatchProgress={dispatchProgress}
                />
              )}
            </div>
          )}

          {activeTab === 'map' && (
            <div className="flex-grow flex flex-col overflow-hidden">
              <MapView
                bins={bins}
                selectedBinId={selectedBinId}
                onBinSelect={(bin) => {
                  setSelectedBinId(bin.id);
                  setActiveTab('dashboard'); // take back to dashboard workspace to clean
                }}
                isDispatching={isDispatching}
                dispatchProgress={dispatchProgress}
              />
              <div className="bg-natural-surface p-4 border-t border-natural-stone/10 flex justify-between items-center shrink-0">
                <div className="text-sm font-semibold text-natural-stone/60">
                  Click any marker node above to navigate to control room dashboard.
                </div>
                <div className="flex gap-4">
                  <span className="flex items-center gap-1.5 text-xs font-bold text-natural-clay">
                    <span className="w-2.5 h-2.5 bg-natural-clay rounded-full" />
                    <span>Critical (&gt;85%)</span>
                  </span>
                  <span className="flex items-center gap-1.5 text-xs font-bold text-amber-700">
                    <span className="w-2.5 h-2.5 bg-amber-500 rounded-full" />
                    <span>Warning (50-85%)</span>
                  </span>
                  <span className="flex items-center gap-1.5 text-xs font-bold text-natural-sage">
                    <span className="w-2.5 h-2.5 bg-natural-sage rounded-full" />
                    <span>Normal (&lt;50%)</span>
                  </span>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'analytics' && <AnalyticsView />}

          {activeTab === 'fleet' && (
            <FleetView
              fleet={fleet}
              onDispatchAll={handleDispatchAllFleet}
              isDispatching={isDispatching}
            />
          )}
        </main>
      </div>

      {/* MODAL OVERLAYS */}

      {/* Notifications Drawer Modal */}
      {showNotificationModal && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-xs z-50 flex justify-end">
          <div className="bg-natural-bg w-96 h-full shadow-2xl p-6 flex flex-col gap-4">
            <div className="flex justify-between items-center border-b border-natural-stone/10 pb-3">
              <h3 className="font-serif font-bold text-lg text-natural-stone">Telemetry Notifications</h3>
              <button
                onClick={() => setShowNotificationModal(false)}
                className="text-natural-stone/40 hover:text-natural-clay font-bold text-sm cursor-pointer"
              >
                Close
              </button>
            </div>
            <div className="flex-grow overflow-y-auto space-y-4">
              {alertLogs.map((log, idx) => (
                <div key={idx} className="p-3 bg-natural-surface/60 rounded-xl border border-natural-stone/5 text-xs font-semibold leading-relaxed text-natural-stone/80">
                  {log}
                </div>
              ))}
            </div>
            <button
              onClick={() => setAlertLogs([])}
              className="w-full py-2.5 bg-natural-stone text-white font-bold text-xs uppercase rounded-xl hover:bg-natural-stone/90 cursor-pointer"
            >
              Clear Logs
            </button>
          </div>
        </div>
      )}

      {/* Settings Dialog Modal */}
      {showSettingsModal && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-xs z-50 flex items-center justify-center">
          <div className="bg-white rounded-3xl p-6 w-md shadow-2xl border border-natural-stone/15">
            <h3 className="font-serif font-bold text-lg text-natural-stone mb-4 flex items-center gap-2">
              <Settings className="w-5 h-5 text-natural-sage" />
              <span>Control Room Configuration</span>
            </h3>
            <div className="space-y-4 text-xs font-bold">
              <div className="p-3 bg-natural-surface/50 border border-natural-stone/5 rounded-xl">
                <span className="text-natural-stone/50 block mb-1">Server Ingress Tunnel</span>
                <span className="text-natural-stone/80">Port 3000 (Active Proxy)</span>
              </div>
              <div className="p-3 bg-natural-surface/50 border border-natural-stone/5 rounded-xl">
                <span className="text-natural-stone/50 block mb-1">Live Maps Engine</span>
                <span className="text-natural-stone/80">Custom Vector Bezier Routing Engine</span>
              </div>
              <div className="p-3 bg-natural-surface/50 border border-natural-stone/5 rounded-xl">
                <span className="text-natural-stone/50 block mb-1">Database Sync Status</span>
                <span className="text-natural-sage font-bold flex items-center gap-1 mt-0.5">
                  <ShieldCheck className="w-4 h-4" />
                  <span>Encrypted Client State Live</span>
                </span>
              </div>
            </div>
            <div className="mt-6 flex justify-end">
              <button
                onClick={() => setShowSettingsModal(false)}
                className="px-5 py-2 bg-natural-stone hover:bg-natural-stone/90 text-white font-bold text-xs uppercase rounded-xl cursor-pointer"
              >
                Close Settings
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Logout Confirmation Dialog Modal */}
      {showLogoutModal && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-xs z-50 flex items-center justify-center">
          <div className="bg-white rounded-3xl p-6 w-sm shadow-2xl text-center border border-natural-stone/15">
            <h3 className="font-serif font-bold text-lg text-natural-stone mb-2">Logout Operator Session?</h3>
            <p className="text-xs text-natural-stone/60 font-semibold mb-6">
              This will suspend direct local console synchronization. Auto-pilot dispatcher will persist server-side.
            </p>
            <div className="flex gap-4">
              <button
                onClick={() => setShowLogoutModal(false)}
                className="flex-1 py-2.5 bg-natural-surface hover:bg-natural-surface/80 text-natural-stone/80 font-bold text-xs uppercase rounded-xl cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  setShowLogoutModal(false);
                  setAlertLogs((prev) => ["Operator session terminated. Standard autopilot active.", ...prev]);
                }}
                className="flex-1 py-2.5 bg-natural-clay hover:bg-natural-clay/90 text-white font-bold text-xs uppercase rounded-xl cursor-pointer"
              >
                Logout Console
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
