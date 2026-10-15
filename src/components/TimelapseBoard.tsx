import { Clock, Play, CheckCircle2, RefreshCw, Sun, Moon } from 'lucide-react';

interface TimelapseBoardProps {
  isTimelapseActive: boolean;
  timelapseProgress: number;
  timelapseHour: string;
  timelapseStatus: string;
  onStartTimelapse: () => void;
}

export default function TimelapseBoard({
  isTimelapseActive,
  timelapseProgress,
  timelapseHour,
  timelapseStatus,
  onStartTimelapse,
}: TimelapseBoardProps) {
  // Determine simple day/night cycle icons based on hours
  const currentHourNum = parseInt(timelapseHour.split(':')[0], 10);
  const isNight = currentHourNum >= 20 || currentHourNum <= 6;

  return (
    <div
      id="timelapse-control-board"
      className="h-64 shrink-0 bg-white border-t border-natural-stone/10 flex transition-all duration-500 ease-out z-30"
    >
      {/* Left Column: Visual Clock / Simulator Output */}
      <div className="w-1/2 border-r border-natural-stone/10 relative overflow-hidden bg-natural-surface/30 flex items-center justify-center">
        {/* Subtle radial decorative gradient representing time/ambient change */}
        <div
          className={`absolute inset-0 transition-opacity duration-1000 ${
            isNight ? 'opacity-10 bg-radial from-indigo-900 to-transparent' : 'opacity-5 bg-radial from-amber-500 to-transparent'
          }`}
        />

        <div className="text-center z-10 flex flex-col items-center px-6">
          {isTimelapseActive ? (
            <div className="space-y-4">
              {/* Dynamic Hour Display */}
              <div className="flex items-center justify-center gap-3">
                {isNight ? (
                  <Moon className="w-8 h-8 text-indigo-400 animate-pulse" />
                ) : (
                  <Sun className="w-8 h-8 text-natural-clay animate-spin" style={{ animationDuration: '10s' }} />
                )}
                <span className="font-serif font-bold text-5xl text-natural-stone tracking-tight tabular-nums">
                  {timelapseHour}
                </span>
              </div>

              {/* Status Message */}
              <div className="flex flex-col items-center">
                <span className="text-[10px] font-bold tracking-widest text-natural-clay uppercase animate-pulse">
                  {timelapseStatus}
                </span>
                <span className="text-xs text-natural-stone/60 font-medium mt-1">
                  Speeding up temporal flow (1200x)
                </span>
              </div>
            </div>
          ) : (
            <div className="flex flex-col items-center">
              <div className="relative inline-block mb-3">
                <div className="w-16 h-16 rounded-full bg-natural-sage/10 flex items-center justify-center text-natural-sage">
                  <CheckCircle2 className="w-9 h-9 text-natural-sage animate-bounce" />
                </div>
                <div className="absolute inset-0 bg-natural-sage/5 rounded-full animate-ping" />
              </div>
              <p className="font-serif font-bold text-lg text-natural-stone leading-tight">
                All Smart Nodes Operational
              </p>
              <p className="text-[10px] font-extrabold tracking-widest text-natural-sage uppercase mt-1.5 px-3 py-1 bg-natural-sage/10 rounded-full">
                0% Critical Sector Alert
              </p>
            </div>
          )}
        </div>

        {/* Local progression bar at bottom */}
        <div className="absolute bottom-0 left-0 right-0 h-1.5 bg-natural-surface">
          <div
            className={`h-full transition-all duration-100 ${
              isTimelapseActive ? 'bg-natural-clay animate-pulse' : 'bg-natural-sage'
            }`}
            style={{ width: `${isTimelapseActive ? timelapseProgress : 100}%` }}
          />
        </div>
      </div>

      {/* Right Column: Information & Interactive trigger button */}
      <div className="w-1/2 p-6 flex flex-col justify-between bg-white">
        <div>
          <div className="flex justify-between items-start">
            <div>
              <h2 className="text-xl font-serif font-bold text-natural-stone flex items-center gap-2">
                <Clock className="w-5 h-5 text-natural-clay" />
                <span>Accumulation Timelapse</span>
              </h2>
              <p className="text-xs text-natural-stone/60 font-semibold mt-1.5 leading-relaxed pr-4">
                Fast-forward local municipal waste accumulation, pedestrian holiday traffic volume, and sensor payload alerts over a compressed 24-hour cycle.
              </p>
            </div>
          </div>
        </div>

        {/* Action control bar */}
        <div className="bg-natural-surface/60 p-4 rounded-xl border border-natural-stone/5 flex items-center justify-between">
          <div>
            <p className="text-[10px] font-bold tracking-wider text-natural-stone/40 uppercase mb-0.5">
              Simulation Control
            </p>
            <p className="text-sm font-serif font-bold text-natural-stone">
              {isTimelapseActive ? (
                <span className="text-natural-clay animate-pulse">Timelapse simulation running</span>
              ) : (
                <span className="text-natural-sage">Baseline calibrated & ready</span>
              )}
            </p>
          </div>

          <button
            disabled={isTimelapseActive}
            onClick={onStartTimelapse}
            className={`px-6 py-3 font-bold rounded-xl flex items-center gap-2.5 transition-all shadow-md active:scale-95 cursor-pointer text-xs uppercase tracking-wider ${
              isTimelapseActive
                ? 'bg-natural-surface text-natural-stone/30 cursor-not-allowed shadow-none border border-natural-stone/5'
                : 'bg-natural-clay text-white hover:bg-natural-clay/90 hover:shadow-lg'
            }`}
          >
            {isTimelapseActive ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin" />
                <span>Simulating...</span>
              </>
            ) : (
              <>
                <Play className="w-4 h-4" />
                <span>Initiate Timelapse</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
