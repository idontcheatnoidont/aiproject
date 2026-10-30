import { useState } from 'react';
import { Truck, User, Compass, Battery, CheckCircle, Activity, MapPin, Layers, Radio } from 'lucide-react';
import { FleetTruck } from '../types';

interface FleetViewProps {
  fleet: FleetTruck[];
  onDispatchAll: () => void;
  isDispatching: boolean;
}

export default function FleetView({ fleet, onDispatchAll, isDispatching }: FleetViewProps) {
  const [selectedTruckId, setSelectedTruckId] = useState<string | null>(null);
  const [selectedZoneFilter, setSelectedZoneFilter] = useState<string>('all');

  // Extract unique zones for quick filter tabs
  const allZones = Array.from(new Set(fleet.map((t) => t.zone).filter(Boolean)));

  const filteredFleet =
    selectedZoneFilter === 'all'
      ? fleet
      : fleet.filter((truck) => truck.zone === selectedZoneFilter);

  return (
    <div className="flex-grow overflow-y-auto bg-natural-bg p-8 flex flex-col gap-8 h-full select-none">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-serif font-bold text-natural-stone tracking-tight flex items-center gap-3">
            <Truck className="w-8 h-8 text-natural-sage" />
            <span>EcoTruck Fleet Management</span>
          </h1>
          <p className="text-natural-stone/60 text-sm font-semibold mt-1">
            Real-time tracking of emission-free electric collection units, designated driver zones, and active coverage corridors.
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

      {/* Zone Filter Bar */}
      <div className="flex flex-wrap items-center gap-2 border-b border-natural-stone/10 pb-4">
        <span className="text-xs font-bold text-natural-stone/50 uppercase tracking-wider flex items-center gap-1.5 mr-2">
          <Layers className="w-3.5 h-3.5" />
          <span>Filter by Driver Zone:</span>
        </span>
        <button
          onClick={() => setSelectedZoneFilter('all')}
          className={`px-3.5 py-1.5 rounded-full text-xs font-bold transition-all cursor-pointer ${
            selectedZoneFilter === 'all'
              ? 'bg-natural-stone text-white shadow-xs'
              : 'bg-white text-natural-stone/70 border border-natural-stone/10 hover:border-natural-stone/30'
          }`}
        >
          All Driver Zones ({fleet.length})
        </button>
        {allZones.map((zone) => (
          <button
            key={zone}
            onClick={() => setSelectedZoneFilter(zone)}
            className={`px-3.5 py-1.5 rounded-full text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
              selectedZoneFilter === zone
                ? 'bg-natural-sage text-white shadow-xs'
                : 'bg-white text-natural-stone/70 border border-natural-stone/10 hover:border-natural-stone/30'
            }`}
          >
            <Compass className="w-3 h-3 opacity-70" />
            <span>{zone}</span>
          </button>
        ))}
      </div>

      {/* Grid: Left Column (Truck Cards), Right Column (Fleet Telemetry Logs) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Truck list (2 cols on lg) */}
        <div className="lg:col-span-2 flex flex-col gap-4">
          <div className="flex justify-between items-center">
            <h3 className="text-xs font-bold text-natural-stone/40 tracking-widest uppercase">
              Assigned Fleet Units ({filteredFleet.length})
            </h3>
            <span className="text-[11px] font-semibold text-natural-stone/50">
              Click a unit to inspect driver telemetry
            </span>
          </div>

          <div className="space-y-4">
            {filteredFleet.map((truck) => {
              const isSelected = selectedTruckId === truck.id;

              const statusStyle =
                truck.status === 'servicing'
                  ? 'bg-natural-clay/10 text-natural-clay border-natural-clay/20'
                  : truck.status === 'en_route'
                  ? 'bg-natural-sage/15 text-natural-sage border-natural-sage/20'
                  : truck.status === 'returning'
                  ? 'bg-natural-stone/10 text-natural-stone border-natural-stone/20'
                  : 'bg-natural-surface text-natural-stone/60 border-natural-stone/10';

              const statusLabel =
                truck.status === 'servicing'
                  ? 'Servicing Bin'
                  : truck.status === 'en_route'
                  ? 'En Route'
                  : truck.status === 'returning'
                  ? 'Returning to Base'
                  : 'Standby / Idle';

              const truckBattery = truck.battery ?? 85;

              return (
                <div
                  key={truck.id}
                  onClick={() => setSelectedTruckId(truck.id)}
                  className={`bg-white p-6 rounded-2xl border cursor-pointer transition-all ${
                    isSelected
                      ? 'border-natural-sage ring-2 ring-natural-sage/10 shadow-md'
                      : 'border-natural-stone/10 hover:border-natural-stone/20 shadow-xs'
                  }`}
                >
                  {/* Top Bar: Icon, Name & Status */}
                  <div className="flex justify-between items-start mb-4">
                    <div className="flex items-center gap-3">
                      <div className="w-11 h-11 rounded-xl bg-natural-sage flex items-center justify-center text-white shrink-0 shadow-xs">
                        <Truck className="w-5 h-5" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <h4 className="font-serif font-bold text-natural-stone text-base">{truck.name}</h4>
                          <span className="text-xs font-mono font-bold text-natural-stone/40 bg-natural-surface px-2 py-0.5 rounded">
                            {truck.id}
                          </span>
                        </div>
                        <p className="text-xs text-natural-stone/50 font-semibold mt-0.5">
                          Electric Class-A EcoUnit • Zero Emissions
                        </p>
                      </div>
                    </div>
                    <span
                      className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider border ${statusStyle}`}
                    >
                      {statusLabel}
                    </span>
                  </div>

                  {/* Driver & Operating Zone Highlight */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 border-t border-natural-stone/5 pt-4 mb-4 text-xs font-bold">
                    <div className="flex items-center gap-2 text-natural-stone/70 bg-natural-bg/40 p-2.5 rounded-xl border border-natural-stone/5">
                      <div className="w-7 h-7 rounded-lg bg-natural-stone/10 flex items-center justify-center text-natural-stone/80 shrink-0">
                        <User className="w-4 h-4" />
                      </div>
                      <div>
                        <span className="text-[10px] font-bold text-natural-stone/40 uppercase tracking-wider block">
                          Assigned Driver
                        </span>
                        <span className="text-natural-stone text-xs font-bold">{truck.driverName}</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 text-natural-stone/70 bg-natural-sage/10 p-2.5 rounded-xl border border-natural-sage/15">
                      <div className="w-7 h-7 rounded-lg bg-natural-sage/20 flex items-center justify-center text-natural-sage shrink-0">
                        <Compass className="w-4 h-4" />
                      </div>
                      <div>
                        <span className="text-[10px] font-bold text-natural-sage uppercase tracking-wider block">
                          Operational Zone
                        </span>
                        <span className="text-natural-stone text-xs font-bold">{truck.zone || 'Zone 1 — Central'}</span>
                      </div>
                    </div>
                  </div>

                  {/* Active Operating Corridors & Coverage Sectors */}
                  <div className="mb-4">
                    <span className="text-[10px] uppercase font-bold text-natural-stone/45 tracking-wider block mb-2 flex items-center gap-1.5">
                      <MapPin className="w-3 h-3 text-natural-clay" />
                      <span>Active Coverage Corridors for {truck.driverName.split(' ')[0]}</span>
                    </span>
                    <div className="flex flex-wrap gap-2">
                      {truck.activeZones && truck.activeZones.length > 0 ? (
                        truck.activeZones.map((area) => (
                          <span
                            key={area}
                            className="px-2.5 py-1 rounded-lg text-[11px] font-semibold bg-natural-surface border border-natural-stone/10 text-natural-stone/80 flex items-center gap-1"
                          >
                            <span className="w-1.5 h-1.5 rounded-full bg-natural-sage" />
                            <span>{area}</span>
                          </span>
                        ))
                      ) : (
                        <span className="text-xs text-natural-stone/50 font-normal">
                          All Municipal Central Nodes
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Battery & Load Levels */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-3 border-t border-natural-stone/5">
                    {/* Storage Load */}
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
                          style={{ width: `${Math.min(100, truck.capacity)}%` }}
                        />
                      </div>
                    </div>

                    {/* Battery Level */}
                    <div>
                      <div className="flex justify-between text-xs font-bold text-natural-stone/60 mb-1">
                        <span>Battery Reserve</span>
                        <span className="text-natural-stone tabular-nums flex items-center gap-1">
                          <Battery className="w-3.5 h-3.5 text-natural-sage" />
                          <span>{truckBattery}%</span>
                        </span>
                      </div>
                      <div className="w-full bg-natural-surface h-2 rounded-full overflow-hidden">
                        <div
                          className={`h-full rounded-full transition-all duration-500 ${
                            truckBattery < 30 ? 'bg-natural-clay' : 'bg-natural-sage'
                          }`}
                          style={{ width: `${Math.min(100, truckBattery)}%` }}
                        />
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Telemetry and Activity Logs (1 col) */}
        <div className="flex flex-col gap-4">
          <h3 className="text-xs font-bold text-natural-stone/40 tracking-widest uppercase">
            Zone Operations & Telemetry
          </h3>

          <div className="bg-white rounded-2xl border border-natural-stone/10 shadow-xs p-6 flex flex-col gap-4 flex-grow">
            <h4 className="font-serif font-bold text-natural-stone text-sm border-b border-natural-stone/5 pb-2 flex items-center justify-between">
              <span className="flex items-center gap-2">
                <Activity className="w-4 h-4 text-natural-sage" />
                <span>Zone Activity Stream</span>
              </span>
              <span className="text-[10px] font-mono text-emerald-600 flex items-center gap-1 font-bold">
                <Radio className="w-3 h-3 animate-pulse" />
                <span>LIVE</span>
              </span>
            </h4>

            {/* Log list reflecting distinct driver zones */}
            <div className="space-y-4 text-xs font-semibold overflow-y-auto max-h-[460px] pr-2">
              <div className="border-l-2 border-natural-sage pl-3 py-0.5">
                <span className="text-[10px] text-natural-stone/40 tabular-nums">09:42:15 UTC</span>
                <p className="text-natural-stone mt-0.5">
                  <strong>Priya Sharma (TR-102)</strong> operating in <strong>Zone 2 (East Corridor)</strong> collected Whitefield Main (B-3011).
                </p>
                <p className="text-natural-clay font-bold text-[10px]">Collected Payload: +41.2 kg</p>
              </div>

              <div className="border-l-2 border-natural-clay pl-3 py-0.5">
                <span className="text-[10px] text-natural-stone/40 tabular-nums">09:12:00 UTC</span>
                <p className="text-natural-stone mt-0.5">
                  <strong>Rajesh Kumar (TR-101)</strong> patrolling <strong>Zone 1 (Central CBD)</strong> routed to MG Road Station (B-9021).
                </p>
                <p className="text-natural-sage font-bold text-[10px]">Battery Level: 94% • High Charge</p>
              </div>

              <div className="border-l-2 border-natural-stone/30 pl-3 py-0.5">
                <span className="text-[10px] text-natural-stone/40 tabular-nums">08:50:33 UTC</span>
                <p className="text-natural-stone mt-0.5">
                  <strong>Suresh Gowda (TR-103)</strong> active in <strong>Zone 3 (South Sector)</strong> scheduled for Koramangala 80ft.
                </p>
                <p className="text-natural-stone/50 font-bold text-[10px]">Route efficiency index: 96.4%</p>
              </div>

              <div className="border-l-2 border-amber-600 pl-3 py-0.5">
                <span className="text-[10px] text-natural-stone/40 tabular-nums">08:21:40 UTC</span>
                <p className="text-natural-stone mt-0.5">
                  <strong>Ananya Sen (TR-104)</strong> active in <strong>Zone 4 (North Belt)</strong> completed checkpoint at Malleshwaram Sampige.
                </p>
                <p className="text-natural-stone/50 font-bold text-[10px]">Sensors report all nodes normal in Zone 4</p>
              </div>

              <div className="border-l-2 border-natural-sage pl-3 py-0.5">
                <span className="text-[10px] text-natural-stone/40 tabular-nums">08:00:00 UTC</span>
                <p className="text-natural-stone mt-0.5">
                  Shift dispatch logged for 4 active driver zones across Bengaluru Municipal Grid.
                </p>
                <p className="text-natural-stone/50 font-bold text-[10px]">All electric units passed pre-flight safety diagnostics</p>
              </div>
            </div>

            {/* Zone Readiness Checks */}
            <div className="mt-auto border-t border-natural-stone/5 pt-4">
              <h5 className="text-[9px] font-bold text-natural-stone/40 uppercase tracking-widest mb-2">
                Zone Coverage Readiness
              </h5>
              <div className="space-y-1.5 text-xs font-bold text-natural-stone/70">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-natural-sage" />
                    <span>Zone 1 — Central CBD:</span>
                  </div>
                  <span className="text-natural-stone/60 font-semibold">Rajesh Kumar</span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-natural-sage" />
                    <span>Zone 2 — East Corridor:</span>
                  </div>
                  <span className="text-natural-stone/60 font-semibold">Priya Sharma</span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-natural-sage" />
                    <span>Zone 3 — South Sector:</span>
                  </div>
                  <span className="text-natural-stone/60 font-semibold">Suresh Gowda</span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-natural-sage" />
                    <span>Zone 4 — North Belt:</span>
                  </div>
                  <span className="text-natural-stone/60 font-semibold">Ananya Sen</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
