import { X, MapPin, Clock, RefreshCw, CheckCircle, Sparkles } from 'lucide-react';
import { Bin } from '../types';
import { getPredictedTimeToFull } from '../utils';

interface SelectionDrawerProps {
  selectedBin: Bin | null;
  onClose: () => void;
  onClean: (binId: string) => void;
  isDispatching: boolean;
  dispatchProgress: number;
}

export default function SelectionDrawer({
  selectedBin,
  onClose,
  onClean,
  isDispatching,
  dispatchProgress,
}: SelectionDrawerProps) {
  if (!selectedBin) return null;

  // Compute status details
  const isCompleted = dispatchProgress >= 100;

  return (
    <div
      id="selection-area"
      className="h-64 shrink-0 bg-white border-t border-natural-stone/10 flex transition-all duration-500 ease-out z-30"
    >
      {/* Left: Telemetry / Scanner Container */}
      <div className="w-1/2 border-r border-natural-stone/10 relative overflow-hidden bg-natural-surface/40 flex items-center justify-center">
        {/* Live / Standby / Finalized Telemetry Chamber */}
        <div className="absolute inset-0 bg-natural-bg p-4 flex flex-col justify-between text-natural-stone animate-fade-in z-20 overflow-hidden font-sans text-xs">
          {/* Header: system indicators */}
          <div className="flex justify-between items-center border-b border-natural-stone/10 pb-2 z-10">
            <div className="flex items-center gap-1.5">
              <span className={`w-2 h-2 rounded-full ${
                isCompleted 
                  ? 'bg-natural-sage' 
                  : isDispatching 
                  ? 'bg-natural-clay animate-ping' 
                  : selectedBin.status === 'critical'
                  ? 'bg-natural-clay animate-pulse'
                  : selectedBin.status === 'warning'
                  ? 'bg-amber-500 animate-pulse'
                  : 'bg-natural-sage'
              }`} />
              <span className={`text-[10px] font-bold tracking-widest uppercase ${
                isCompleted 
                  ? 'text-natural-sage' 
                  : isDispatching 
                  ? 'text-natural-clay' 
                  : selectedBin.status === 'critical'
                  ? 'text-natural-clay font-bold'
                  : selectedBin.status === 'warning'
                  ? 'text-amber-600'
                  : 'text-natural-sage'
              }`}>
                {isCompleted 
                  ? 'SYS // CLEANUP COMPLETE' 
                  : isDispatching 
                  ? 'SYS // PNEUMATIC CLEANING ACTIVE' 
                  : `SYS // STANDBY MONITORING - ${selectedBin.id}`}
              </span>
            </div>
            <div className="text-[8px] text-natural-stone/60 bg-natural-surface px-2 py-0.5 rounded border border-natural-stone/10 font-sans">
              ECO_TRUCK_01
            </div>
          </div>

          {/* Core Visualizer: Canister emptying diagram */}
          <div className="flex-grow flex items-center justify-center py-2 relative z-10">
            {/* Siphon Hose Line - glowing suction track */}
            {isDispatching && !isCompleted && (
              <div className="absolute left-1/2 -translate-x-1/2 top-2 bottom-10 w-0.5 border-r border-dashed border-natural-clay/20 pointer-events-none animate-pulse" />
            )}

            <div className="flex items-center gap-6 w-full px-2">
              {/* Left side: Animated Canister */}
              <div className="flex-1 flex flex-col items-center">
                <span className="text-[8px] text-natural-stone/40 mb-1 tracking-widest uppercase font-sans font-bold">Canister Node</span>
                
                {/* Outer Canister Shell */}
                <div className="w-20 h-28 border-2 border-natural-stone/15 rounded-xl relative overflow-hidden bg-natural-surface flex flex-col justify-end p-0.5">
                  {/* Inner mesh visual lines */}
                  <div className="absolute inset-0 bg-[linear-gradient(rgba(0,0,0,0.03)_1px,_transparent_1px)] bg-[size:100%_4px] pointer-events-none" />
                  
                  {/* Waste Fill Block */}
                  {isCompleted ? (
                    /* Clean state */
                    <div className="w-full h-[12%] rounded-b-lg bg-natural-sage/20 relative">
                      <div className="absolute -top-1 left-0 right-0 h-1 bg-natural-sage/30 blur-xs" />
                    </div>
                  ) : (
                    <div 
                      className={`w-full rounded-b-lg transition-all duration-300 ease-out relative ${
                        isDispatching 
                          ? 'bg-gradient-to-t from-natural-clay to-natural-clay/60 animate-pulse' 
                          : selectedBin.status === 'critical' 
                          ? 'bg-gradient-to-t from-natural-clay/80 to-natural-clay/50' 
                          : selectedBin.status === 'warning'
                          ? 'bg-gradient-to-t from-amber-500/70 to-amber-400/40'
                          : 'bg-gradient-to-t from-natural-sage/60 to-natural-sage/30'
                      }`}
                      style={{ 
                        height: `${Math.max(12, Math.round(isDispatching ? selectedBin.fillLevel * (1 - dispatchProgress / 100) : selectedBin.fillLevel))}%` 
                      }}
                    >
                      {/* Fluid wave animation effect */}
                      {isDispatching && (
                        <div className="absolute -top-1 left-0 right-0 h-1 bg-white/40 blur-xs animate-pulse" />
                      )}
                      
                      {/* Draining bubbles/particles */}
                      {isDispatching && selectedBin.fillLevel * (1 - dispatchProgress / 100) > 10 && (
                        <div className="absolute inset-0 overflow-hidden opacity-30">
                          <div className="absolute bottom-2 left-2 w-1 h-1 bg-white rounded-full animate-ping" />
                          <div className="absolute top-4 right-3 w-1 h-1 bg-white rounded-full animate-ping" style={{ animationDelay: '0.4s' }} />
                          <div className="absolute bottom-6 right-5 w-1.5 h-1.5 bg-white rounded-full animate-ping" style={{ animationDelay: '0.8s' }} />
                        </div>
                      )}
                    </div>
                  )}

                  {/* Centered level readout */}
                  <div className="absolute inset-0 flex flex-col items-center justify-center text-center pointer-events-none">
                    <span className="text-xl font-serif font-bold text-natural-stone">
                      {isCompleted ? '12%' : `${Math.max(0, Math.round(isDispatching ? selectedBin.fillLevel * (1 - dispatchProgress / 100) : selectedBin.fillLevel))}%`}
                    </span>
                    <span className="text-[8px] text-natural-stone/50 tracking-wider uppercase font-bold">
                      {isCompleted ? 'CLEANED' : 'CAPACITY'}
                    </span>
                  </div>
                </div>
              </div>

              {/* Right side: Interactive Siphon Flow Activity Meter */}
              <div className="flex-grow flex-1 space-y-3">
                <div className="bg-natural-surface/80 p-2 rounded-lg border border-natural-stone/10">
                  <span className="text-[8px] text-natural-stone/40 block tracking-widest uppercase mb-1 font-bold font-sans">Extraction Log</span>
                  <p className={`text-[10px] leading-tight font-sans font-semibold ${isCompleted ? 'text-natural-sage' : isDispatching ? 'text-natural-clay animate-pulse' : 'text-natural-stone/60'}`}>
                    {isCompleted ? (
                      'Collection finalized. Node status restored to normal.'
                    ) : isDispatching ? (
                      dispatchProgress > 80 ? (
                        'ECO-SPRAY ACTIVE: Deodorizing and sanitizing chamber...'
                      ) : dispatchProgress > 50 ? (
                        'Pneumatic extraction of compacted solids...'
                      ) : dispatchProgress > 20 ? (
                        'Siphoning loose waste and residual material...'
                      ) : (
                        'EcoTruck positioning automatic vacuum lift...'
                      )
                    ) : selectedBin.status === 'critical' ? (
                      'READY // Node critically full. Awaiting dispatch instruction.'
                    ) : selectedBin.status === 'warning' ? (
                      'READY // Node warning. Telemetry active. Standby.'
                    ) : (
                      'READY // Capacity normal. Continuous telemetry scanning active.'
                    )}
                  </p>
                </div>

                {/* Siphon Pulse/Equalizer Flow bars representing vacuum suction strength */}
                <div className="space-y-1">
                  <div className="flex justify-between text-[8px] text-natural-stone/50 tracking-wider uppercase font-bold font-sans">
                    <span>Suction force</span>
                    <span className={`${isDispatching && !isCompleted ? 'text-natural-clay' : 'text-natural-stone/40'} font-bold`}>
                      {isDispatching && !isCompleted ? `${Math.round(110 + Math.sin(dispatchProgress * 0.4) * 12)} kPa` : '0 kPa // Standby'}
                    </span>
                  </div>
                  {/* Tiny animated soundwave/piston bars */}
                  <div className="flex items-end gap-1 h-7 bg-natural-surface p-1.5 rounded border border-natural-stone/10">
                    {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => {
                      const randomHeightMultiplier = Math.sin(dispatchProgress * 0.2 + i) * 0.5 + 0.5;
                      const finalHeight = isDispatching && !isCompleted
                        ? Math.round(4 + randomHeightMultiplier * 14)
                        : 2;
                      return (
                        <div 
                          key={i} 
                          className={`flex-grow rounded-sm transition-all duration-150 ${isCompleted ? 'bg-natural-sage/20' : isDispatching ? 'bg-gradient-to-t from-natural-clay to-natural-clay/50' : 'bg-natural-stone/10'}`}
                          style={{ height: `${finalHeight}px` }}
                        />
                      );
                    })}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Footer metrics / telemetry data table */}
          <div className="bg-natural-surface/80 p-2 rounded-xl border border-natural-stone/10 grid grid-cols-3 gap-2 text-[9px] text-natural-stone/70 z-10">
            <div className="border-r border-natural-stone/15 pr-1">
              <span className="text-natural-stone/45 block text-[7px] uppercase tracking-wider font-sans font-bold">Extracted wt</span>
              <strong className="text-natural-stone font-serif text-[11px] font-bold">
                {isCompleted 
                  ? `${selectedBin.weight} kg` 
                  : isDispatching 
                  ? `${(selectedBin.weight * (dispatchProgress / 100)).toFixed(1)} / ${selectedBin.weight} kg` 
                  : `0.0 / ${selectedBin.weight} kg`}
              </strong>
            </div>
            <div className="border-r border-natural-stone/15 px-1">
              <span className="text-natural-stone/45 block text-[7px] uppercase tracking-wider font-sans font-bold">EcoSpray Temp</span>
              <strong className="text-natural-stone font-serif text-[11px] font-bold">
                {isDispatching && dispatchProgress > 80 && !isCompleted ? '115 °C' : 'Standby'}
              </strong>
            </div>
            <div className="pl-1 text-right">
              <span className="text-natural-stone/45 block text-[7px] uppercase tracking-wider font-sans font-bold">Sanitization</span>
              <span className={`font-serif font-bold uppercase text-[10px] ${
                isCompleted 
                  ? 'text-natural-sage' 
                  : isDispatching && dispatchProgress > 80 
                  ? 'text-natural-clay animate-pulse' 
                  : 'text-natural-stone/40'
              }`}>
                {isCompleted ? 'VERIFIED' : isDispatching && dispatchProgress > 80 ? 'ACTIVE' : 'STANDBY'}
              </span>
            </div>
          </div>
        </div>

        {/* Local scanner progress bar */}
        <div className="absolute bottom-0 left-0 right-0 h-1.5 bg-natural-surface">
          <div
            className={`h-full transition-all duration-100 ${
              isCompleted ? 'bg-natural-sage' : 'bg-natural-clay'
            }`}
            style={{ width: `${dispatchProgress}%` }}
          />
        </div>
      </div>

      {/* Right: Actions and Controls Container */}
      <div className="w-1/2 p-6 flex flex-col justify-between bg-white">
        <div className="flex justify-between items-start">
          <div>
            <h2 className="text-2xl font-serif font-bold text-natural-stone mb-1">{selectedBin.id}</h2>
            <p className="text-xs font-bold text-natural-stone/50 flex items-center gap-1.5 uppercase tracking-wider mb-2.5">
              <MapPin className="w-4 h-4 text-natural-clay" />
              <span>{selectedBin.address}, Bengaluru</span>
            </p>
            <div className="inline-flex items-center gap-1.5 bg-natural-surface/80 px-2.5 py-1 rounded-md border border-natural-stone/10 text-[11px] font-semibold text-natural-stone/70">
              <Clock className="w-3.5 h-3.5 text-natural-sage" />
              <span>Est. time to full: <strong className="text-natural-stone font-bold">{getPredictedTimeToFull(selectedBin)}</strong></span>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-natural-surface text-natural-stone/40 hover:text-natural-stone rounded-full transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="bg-natural-surface/60 p-4 rounded-xl border border-natural-stone/5 flex items-center gap-6">
          <div className="flex-grow">
            <p className="text-[10px] font-bold tracking-wider text-natural-stone/40 uppercase mb-0.5">
              Current Action
            </p>
            <p className="text-base font-serif font-bold text-natural-stone">
              {isDispatching ? (
                <span className="text-natural-clay animate-pulse">Servicing in progress...</span>
              ) : isCompleted ? (
                <span className="text-natural-sage">Area Clean</span>
              ) : selectedBin.status === 'critical' ? (
                <span className="text-natural-clay">Urgent Clean Required</span>
              ) : selectedBin.status === 'warning' ? (
                <span className="text-amber-700">Attention Suggested</span>
              ) : (
                <span className="text-natural-sage">No Action Needed</span>
              )}
            </p>
          </div>

          <button
            disabled={isDispatching}
            onClick={() => onClean(selectedBin.id)}
            className={`px-6 py-3 font-bold rounded-xl flex items-center gap-2.5 transition-all shadow-md active:scale-95 cursor-pointer ${
              isDispatching
                ? 'bg-natural-surface text-natural-stone/30 cursor-not-allowed shadow-none border border-natural-stone/5'
                : isCompleted
                ? 'bg-natural-sage text-white hover:bg-natural-sage/90'
                : 'bg-natural-clay text-white hover:bg-natural-clay/90'
            }`}
          >
            {isDispatching ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin" />
                <span>Dispatching...</span>
              </>
            ) : isCompleted ? (
              <>
                <CheckCircle className="w-4 h-4" />
                <span>Completed</span>
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4" />
                <span>Clean Bin</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
