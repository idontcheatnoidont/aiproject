import { useState } from 'react';
import { Truck, User, Compass, Battery, CheckCircle, Activity } from 'lucide-react';
import { FleetTruck } from '../types';

interface FleetViewProps {
  fleet: FleetTruck[];
  onDispatchAll: () => void;
  isDispatching: boolean;
}

export default function FleetView({ fleet, onDispatchAll, isDispatching }: FleetViewProps) {
  const [selectedTruckId, setSelectedTruckId] = useState<string | null>(null);

  return (
    <div className="flex-grow overflow-y-auto bg-natural-bg p-8 flex flex-col gap-8 h-full select-none">
      {/* Header */}
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-3xl font-serif font-bold text-natural-stone tracking-tight flex items-center gap-3">
            <Truck className="w-8 h-8 text-natural-sage" />
            <span>EcoTruck Fleet Management</span>
          </h1>
          <p className="text-natural-stone/60 text-sm font-semibold mt-1">
            Real-time tracking of emission-free electric collection units, active routes, and driver allocations.
          </p>
        </div>
        <button
          onClick={onDispatchAll}
          disabled={isDispatching}
          className={`px-5 py-3 font-bold rounded-xl shadow-md transition-all active:scale-95 text-xs uppercase tracking-widest flex items-center gap-2 cursor-pointer ${
            isDispatching
              ? 'bg-natural-surface text-natural-stone/30 cursor-not-allowed shadow-none border border-natural-stone/5'
              : 'bg-natural-clay text-white hover:bg-natural-clay/90'
          }`}
        >
          <Activity className="w-4 h-4" />
          <span>{isDispatching ? 'Automated Dispatch active' : 'Trigger Fleet Dispatch'}</span>
        </button>
      </div>

      {/* Grid: Left Column (Truck Cards), Right Column (Fleet Telemetry Logs) */}
      <div className="grid grid-cols-3 gap-8">
        {/* Truck list (2 cols) */}
        <div className="col-span-2 flex flex-col gap-4">
          <h3 className="text-xs font-bold text-natural-stone/40 tracking-widest uppercase">Active Fleet Units</h3>
          {fleet.map((truck) => {
            const isSelected = selectedTruckId === truck.id;

            const statusStyle =
              truck.status === 'servicing'
                ? 'bg-natural-clay/10 text-natural-clay'
                : truck.status === 'en_route'
                ? 'bg-natural-sage/15 text-natural-sage'
                : truck.status === 'returning'
                ? 'bg-natural-stone/10 text-natural-stone'
                : 'bg-natural-surface text-natural-stone/60';

            const statusLabel =
              truck.status === 'servicing'
                ? 'Servicing Bin'
                : truck.status === 'en_route'
                ? 'En Route'
                : truck.status === 'returning'
                ? 'Returning to Base'
                : 'Standby / Idle';

            return (
              <div
                key={truck.id}
                onClick={() => setSelectedTruckId(truck.id)}
                className={`bg-white p-6 rounded-2xl border cursor-pointer transition-all ${
                  isSelected
                    ? 'border-natural-sage ring-2 ring-natural-sage/10 shadow-sm'
                    : 'border-natural-stone/10 hover:border-natural-stone/20 shadow-xs'
                }`}
              >
                <div className="flex justify-between items-start mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-natural-sage flex items-center justify-center text-white shrink-0">
                      <Truck className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="font-serif font-bold text-natural-stone text-base">{truck.name}</h4>
                      <p className="text-xs text-natural-stone/50 font-semibold">{truck.id} • Electric Class-A</p>
                    </div>
                  </div>
                  <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${statusStyle}`}>
                    {statusLabel}
                  </span>
                </div>

                {/* Driver & Location Row */}
                <div className="grid grid-cols-2 gap-4 border-t border-natural-stone/5 pt-4 mb-4 text-xs font-bold">
                  <div className="flex items-center gap-2 text-natural-stone/60">
                    <User className="w-4 h-4 text-natural-stone/40" />
                    <span>Driver: <strong className="text-natural-stone/80">{truck.driverName}</strong></span>
                  </div>
                  <div className="flex items-center gap-2 text-natural-stone/60">
                    <Compass className="w-4 h-4 text-natural-stone/40" />
                    <span>Zone: <strong className="text-natural-stone/80">Zone-5 (Bengaluru Central)</strong></span>
                  </div>
                </div>

                {/* Battery & Load Levels */}
                <div className="space-y-3">
                  <div>
                    <div className="flex justify-between text-xs font-bold text-natural-stone/60 mb-1">
                      <span>Vehicle Storage Load</span>
                      <span className="text-natural-stone tabular-nums">{truck.capacity}% full</span>
                    </div>
                    <div className="w-full bg-natural-surface h-2 rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all duration-500 ${
                          truck.capacity > 80 ? 'bg-natural-clay' : 'bg-natural-sage'
                        }`}
                        style={{ width: `${truck.capacity}%` }}
                      />
                    </div>
                  </div>

                  <div>
                    <div className="flex justify-between text-xs font-bold text-natural-stone/60 mb-1">
                      <span>Battery Charge Level</span>
                      <span className="text-natural-stone tabular-nums flex items-center gap-1">
                        <Battery className="w-3.5 h-3.5 text-natural-sage" />
                        <span>84%</span>
                      </span>
                    </div>
                    <div className="w-full bg-natural-surface h-2 rounded-full overflow-hidden">
                      <div className="h-full rounded-full bg-natural-sage" style={{ width: '84%' }} />
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Telemetry and Activity Logs (1 col) */}
        <div className="flex flex-col gap-4">
          <h3 className="text-xs font-bold text-natural-stone/40 tracking-widest uppercase">Fleet Operations Logs</h3>

          <div className="bg-white rounded-2xl border border-natural-stone/10 shadow-xs p-6 flex flex-col gap-4 flex-grow">
            <h4 className="font-serif font-bold text-natural-stone text-sm border-b border-natural-stone/5 pb-2 flex items-center gap-2">
              <Activity className="w-4 h-4 text-natural-sage" />
              <span>Real-time Operational Stream</span>
            </h4>

            {/* Log list */}
            <div className="space-y-4 text-xs font-semibold overflow-y-auto max-h-[420px] pr-2">
              <div className="border-l-2 border-natural-sage pl-3 py-0.5">
                <span className="text-[10px] text-natural-stone/40 tabular-nums">09:42:15 UTC</span>
                <p className="text-natural-stone mt-0.5">TR-102 successfully collected MG Road (B-9021).</p>
                <p className="text-natural-clay font-bold text-[10px]">Tonnage empty delta: +45.4 kg</p>
              </div>

              <div className="border-l-2 border-natural-clay pl-3 py-0.5">
                <span className="text-[10px] text-natural-stone/40 tabular-nums">09:12:00 UTC</span>
                <p className="text-natural-stone mt-0.5">EcoTruck Alpha returned to Depot Bengaluru for high-speed charging.</p>
                <p className="text-natural-sage font-bold text-[10px]">Battery reloaded to: 95%</p>
              </div>

              <div className="border-l-2 border-natural-stone/30 pl-3 py-0.5">
                <span className="text-[10px] text-natural-stone/40 tabular-nums">08:50:33 UTC</span>
                <p className="text-natural-stone mt-0.5">Route recalculation triggered by AI Automated Dispatcher.</p>
                <p className="text-natural-stone/50 font-bold text-[10px]">Estimated path optimized for 3 critical nodes.</p>
              </div>

              <div className="border-l-2 border-amber-600 pl-3 py-0.5">
                <span className="text-[10px] text-natural-stone/40 tabular-nums">08:21:40 UTC</span>
                <p className="text-natural-stone mt-0.5">TR-103 assigned to Commercial Street for warning level node.</p>
                <p className="text-natural-stone/50 font-bold text-[10px]">ETA to location: 12 minutes</p>
              </div>

              <div className="border-l-2 border-natural-sage pl-3 py-0.5">
                <span className="text-[10px] text-natural-stone/40 tabular-nums">08:00:00 UTC</span>
                <p className="text-natural-stone mt-0.5">Shift start for Priya Sharma and Rajesh Kumar.</p>
                <p className="text-natural-stone/50 font-bold text-[10px]">EcoTruck storage pre-flight checklist: Approved.</p>
              </div>
            </div>

            {/* Checklists */}
            <div className="mt-auto border-t border-natural-stone/5 pt-4">
              <h5 className="text-[9px] font-bold text-natural-stone/40 uppercase tracking-widest mb-2">Fleet Readiness Checks</h5>
              <div className="space-y-1.5 text-xs font-bold text-natural-stone/70">
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-natural-sage" />
                  <span>Emissions Compliance: 100% Green</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-natural-sage" />
                  <span>Battery Reserve: Normal</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
