import { Truck, Radio, Navigation, Compass } from 'lucide-react';
import { Bin } from '../types';

interface MapViewProps {
  bins: Bin[];
  selectedBinId: string | null;
  onBinSelect: (bin: Bin) => void;
  isDispatching: boolean;
  dispatchProgress: number; // 0 to 100
}

interface Point {
  x: number;
  y: number;
}

// Custom defined roads for Bengaluru cartography
const ROADS = [
  // Horizontal Arteries
  { name: 'Outer Ring Road', x1: 50, y1: 220, x2: 950, y2: 220 },
  { name: '100 Feet Road (Indiranagar)', x1: 50, y1: 480, x2: 950, y2: 480 },
  { name: 'Commercial Street', x1: 50, y1: 420, x2: 450, y2: 420 },
  { name: 'Brigade Road', x1: 450, y1: 280, x2: 800, y2: 280 },
  { name: 'Sampige Road', x1: 450, y1: 120, x2: 650, y2: 120 },
  { name: '80 Feet Road (Koramangala)', x1: 150, y1: 350, x2: 450, y2: 350 },
  
  // Diagonal MG Road axis
  { name: 'MG Road', x1: 420, y1: 480, x2: 800, y2: 100 },
  
  // Vertical Intersectors
  { name: 'Residency Road', x1: 150, y1: 50, x2: 150, y2: 650 },
  { name: 'Hosur Road', x1: 450, y1: 50, x2: 450, y2: 650 },
  { name: 'Old Airport Road', x1: 800, y1: 50, x2: 800, y2: 650 }
];

// Helper to retrieve exact street waypoints from DEPOT (100, 500) to each bin
export const getBinWaypoints = (binId: string, binX: number, binY: number): Point[] => {
  const depot = { x: 100, y: 500 };
  const base = [depot];

  switch (binId) {
    case 'B-9021':
      return [...base, { x: 100, y: 480 }, { x: 420, y: 480 }, { x: 700, y: 200 }];
    case 'B-8832':
      return [...base, { x: 100, y: 480 }, { x: 450, y: 480 }];
    case 'B-4412':
      return [...base, { x: 150, y: 500 }, { x: 150, y: 350 }, { x: 320, y: 350 }];
    case 'B-7714':
      return [...base, { x: 100, y: 480 }, { x: 450, y: 480 }, { x: 450, y: 280 }, { x: 580, y: 280 }];
    case 'B-5523':
      return [...base, { x: 150, y: 500 }, { x: 150, y: 420 }, { x: 210, y: 420 }];
    case 'B-3011':
      return [...base, { x: 100, y: 480 }, { x: 800, y: 480 }, { x: 800, y: 510 }, { x: 820, y: 510 }];
    case 'B-1204':
      return [...base, { x: 100, y: 480 }, { x: 450, y: 480 }, { x: 450, y: 120 }, { x: 500, y: 120 }];
    case 'B-6690':
      return [...base, { x: 150, y: 500 }, { x: 150, y: 220 }];
    default:
      return [depot, { x: binX, y: binY }];
  }
};

// Interpolates vehicle coordinate and angle along multi-segment waypoint path
export const getPositionOnPath = (waypoints: Point[], t: number) => {
  if (!waypoints || waypoints.length === 0) return { x: 100, y: 500, angle: 0 };
  if (waypoints.length === 1) return { ...waypoints[0], angle: 0 };
  if (t <= 0) {
    // Face the first segment
    const dx = waypoints[1].x - waypoints[0].x;
    const dy = waypoints[1].y - waypoints[0].y;
    return { ...waypoints[0], angle: Math.atan2(dy, dx) * (180 / Math.PI) };
  }
  if (t >= 1) {
    // Face the last segment
    const len = waypoints.length;
    const dx = waypoints[len - 1].x - waypoints[len - 2].x;
    const dy = waypoints[len - 1].y - waypoints[len - 2].y;
    return { ...waypoints[len - 1], angle: Math.atan2(dy, dx) * (180 / Math.PI) };
  }

  const segments: { p1: Point; p2: Point; length: number }[] = [];
  let totalLength = 0;
  for (let i = 0; i < waypoints.length - 1; i++) {
    const p1 = waypoints[i];
    const p2 = waypoints[i + 1];
    const dx = p2.x - p1.x;
    const dy = p2.y - p1.y;
    const length = Math.sqrt(dx * dx + dy * dy);
    segments.push({ p1, p2, length });
    totalLength += length;
  }

  const targetDist = t * totalLength;
  let accumulatedDist = 0;

  for (const segment of segments) {
    if (accumulatedDist + segment.length >= targetDist) {
      const segmentProgress = segment.length > 0 ? (targetDist - accumulatedDist) / segment.length : 0;
      const dx = segment.p2.x - segment.p1.x;
      const dy = segment.p2.y - segment.p1.y;
      const angle = Math.atan2(dy, dx) * (180 / Math.PI);
      return {
        x: Math.round(segment.p1.x + segmentProgress * dx),
        y: Math.round(segment.p1.y + segmentProgress * dy),
        angle
      };
    }
    accumulatedDist += segment.length;
  }

  // Fallback
  const finalPt = waypoints[waypoints.length - 1];
  return { x: finalPt.x, y: finalPt.y, angle: 0 };
};

export default function MapView({
  bins,
  selectedBinId,
  onBinSelect,
  isDispatching,
  dispatchProgress,
}: MapViewProps) {
  // Find selected bin
  const selectedBin = bins.find((b) => b.id === selectedBinId);

  // Active waypoints
  const waypoints = selectedBin 
    ? getBinWaypoints(selectedBin.id, selectedBin.x, selectedBin.y) 
    : [{ x: 100, y: 500 }];

  const truckPos = isDispatching 
    ? getPositionOnPath(waypoints, dispatchProgress / 100) 
    : { x: 100, y: 500, angle: -90 };

  return (
    <section className="flex-grow relative bg-natural-bg overflow-hidden select-none border-b border-natural-stone/10">
      {/* HUD Overlay Top Right */}
      <div className="absolute top-4 right-4 z-20 bg-[#1e2022]/95 backdrop-blur-md p-4 rounded-2xl border border-white/10 shadow-xl max-w-xs pointer-events-none text-white">
        <div className="flex items-center gap-1.5 mb-2">
          <Compass className="w-4 h-4 text-orange-500 animate-spin" style={{ animationDuration: '8s' }} />
          <h3 className="text-[10px] font-mono font-bold text-orange-400 tracking-widest uppercase">GPS NAVIGATION HUD</h3>
        </div>
        <div className="space-y-2 font-mono text-[11px]">
          <div className="flex justify-between items-center">
            <span className="text-white/50">Nodes Status</span>
            <span className="font-bold text-emerald-400">ONLINE</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-white/50">Active Route</span>
            <span className={`font-bold ${isDispatching ? 'text-orange-400' : 'text-white/40'}`}>
              {isDispatching ? `${selectedBinId} (GPS Active)` : 'No active target'}
            </span>
          </div>
          {isDispatching && (
            <div className="space-y-1 pt-1 border-t border-white/5">
              <div className="flex justify-between text-[10px] text-white/60">
                <span>Distance Progress</span>
                <span className="text-orange-400 font-bold">{Math.round(dispatchProgress)}%</span>
              </div>
              <div className="w-full bg-black/40 h-1.5 rounded-full overflow-hidden">
                <div
                  className="bg-orange-500 h-full transition-all duration-100"
                  style={{ width: `${dispatchProgress}%` }}
                />
              </div>
            </div>
          )}
        </div>
      </div>

      <svg className="absolute inset-0 w-full h-full" viewBox="0 0 1000 700" preserveAspectRatio="xMidYMid slice">
        {/* Definition for Grids, Patterns and Filters */}
        <defs>
          <pattern id="street-grid" width="80" height="80" patternUnits="userSpaceOnUse">
            <rect width="80" height="80" fill="none" stroke="#F5F2ED" strokeWidth="1" />
          </pattern>
        </defs>

        {/* Gray Grid Base Map */}
        <rect width="100%" height="100%" fill="#E8E5DF" />
        <rect width="100%" height="100%" fill="url(#street-grid)" opacity="0.3" />

        {/* Decorative Seine River (Paris vibe) - Flowing Underneath Roads */}
        <path
          d="M -50 510 C 200 480, 250 290, 480 270 C 680 250, 850 440, 1050 410"
          fill="none"
          stroke="#9CBEC0"
          strokeWidth="60"
          strokeLinecap="round"
        />
        <path
          d="M -50 510 C 200 480, 250 290, 480 270 C 680 250, 850 440, 1050 410"
          fill="none"
          stroke="#B2D3D4"
          strokeWidth="48"
          strokeLinecap="round"
        />

        {/* City Park Layouts */}
        <g opacity="0.85">
          {/* Cubbon Park */}
          <rect x="200" y="260" width="180" height="75" rx="8" fill="#CAD3C7" stroke="#BAC4B7" strokeWidth="1.5" />
          <text x="290" y="302" className="text-[9px] font-mono font-bold fill-[#5C6B5E]/50 uppercase tracking-widest text-center" textAnchor="middle">Cubbon Park</text>

          {/* Lalbagh Botanical Garden */}
          <rect x="520" y="520" width="120" height="80" rx="8" fill="#CAD3C7" stroke="#BAC4B7" strokeWidth="1.5" />
          <text x="580" y="565" className="text-[9px] font-mono font-bold fill-[#5C6B5E]/50 uppercase tracking-widest text-center" textAnchor="middle">Lalbagh Garden</text>
        </g>

        {/* City Blocks (Beige building representations) */}
        <g fill="#E0DAD1" opacity="0.45">
          <rect x="60" y="60" width="70" height="130" rx="4" />
          <rect x="60" y="240" width="70" height="90" rx="4" />
          <rect x="60" y="370" width="70" height="80" rx="4" />
          <rect x="170" y="60" width="110" height="130" rx="4" />
          <rect x="170" y="370" width="110" height="30" rx="4" />
          <rect x="170" y="440" width="110" height="20" rx="4" />
          <rect x="300" y="60" width="130" height="130" rx="4" />
          <rect x="470" y="140" width="160" height="60" rx="4" />
          <rect x="470" y="240" width="90" height="20" rx="4" />
          <rect x="640" y="240" width="140" height="20" rx="4" />
          <rect x="470" y="370" width="310" height="80" rx="4" />
          <rect x="820" y="60" width="120" height="130" rx="4" />
          <rect x="820" y="240" width="120" height="220" rx="4" />
        </g>

        {/* Bengaluru Districts / Areas Labels */}
        <g opacity="0.35" className="pointer-events-none">
          <text x="260" y="180" className="text-[10px] font-sans font-bold fill-natural-stone/50 uppercase tracking-widest text-center" textAnchor="middle">CBD / MG Road</text>
          <text x="300" y="550" className="text-[10px] font-sans font-bold fill-natural-stone/50 uppercase tracking-widest text-center" textAnchor="middle">Koramangala Sector</text>
          <text x="680" y="430" className="text-[10px] font-sans font-bold fill-natural-stone/50 uppercase tracking-widest text-center" textAnchor="middle">Indiranagar district</text>
          <text x="650" y="70" className="text-[10px] font-sans font-bold fill-natural-stone/50 uppercase tracking-widest text-center" textAnchor="middle">Malleshwaram zone</text>
        </g>

        {/* Draw Paris Street Network Roads */}
        {ROADS.map((road, index) => (
          <g key={`road-bg-${index}`}>
            {/* 1. Sidewalk Border */}
            <line x1={road.x1} y1={road.y1} x2={road.x2} y2={road.y2} stroke="#D2C9BD" strokeWidth="22" strokeLinecap="round" />
            {/* 2. Asphalt Road Bed */}
            <line x1={road.x1} y1={road.y1} x2={road.x2} y2={road.y2} stroke="#3E4042" strokeWidth="16" strokeLinecap="round" />
            {/* 3. White dashed center lane dividers */}
            <line x1={road.x1} y1={road.y1} x2={road.x2} y2={road.y2} stroke="#FFFFFF" strokeWidth="1.2" strokeDasharray="6 8" opacity="0.45" strokeLinecap="round" />
          </g>
        ))}

        {/* Street Name Labels */}
        {ROADS.map((road, index) => {
          const isHorizontal = road.y1 === road.y2;
          const isVertical = road.x1 === road.x2;
          const textX = (road.x1 + road.x2) / 2;
          const textY = (road.y1 + road.y2) / 2;

          let rotation = 0;
          if (!isHorizontal && !isVertical) {
            rotation = Math.atan2(road.y2 - road.y1, road.x2 - road.x1) * (180 / Math.PI);
          }

          return (
            <text
              key={`label-${index}`}
              x={textX}
              y={textY - 14}
              transform={rotation ? `rotate(${rotation}, ${textX}, ${textY})` : undefined}
              className="text-[8px] font-mono font-black fill-natural-stone/40 uppercase tracking-widest pointer-events-none"
              textAnchor="middle"
            >
              {road.name}
            </text>
          );
        })}

        {/* GTA 5 Style glowing active GPS navigation route lines */}
        {selectedBin && (
          <g>
            {/* Outer Route Glowing Track */}
            <path
              d={`M ${waypoints.map((w) => `${w.x} ${w.y}`).join(' L ')}`}
              fill="none"
              stroke="#EA580C"
              strokeWidth="8"
              strokeLinecap="round"
              strokeLinejoin="round"
              opacity={isDispatching ? 0.95 : 0.4}
              className={isDispatching ? 'animate-gps-glow' : ''}
            />
            {/* Inner Route Moving Dashed GPS Line */}
            <path
              d={`M ${waypoints.map((w) => `${w.x} ${w.y}`).join(' L ')}`}
              fill="none"
              stroke="#FDBA74"
              strokeWidth="4"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeDasharray="14 10"
              opacity={isDispatching ? 0.95 : 0.6}
              className={isDispatching ? 'animate-gps-dash' : ''}
            />
          </g>
        )}

        {/* Depot Node */}
        <g transform="translate(100, 500)">
          <circle cx="0" cy="0" r="16" fill="#1e2022" fillOpacity="0.1" />
          <circle cx="0" cy="0" r="10" fill="#1e2022" stroke="#FFFFFF" strokeWidth="2" />
          <text
            x="0"
            y="28"
            className="text-[10px] font-mono font-bold tracking-widest fill-[#1e2022] text-center uppercase"
            textAnchor="middle"
          >
            DEPOT BENGALURU
          </text>
        </g>

        {/* Bin Node Markers */}
        {bins.map((bin) => {
          const isBinSelected = selectedBinId === bin.id;
          const statusColor =
            bin.status === 'critical'
              ? '#C18C71' // natural-clay
              : bin.status === 'warning'
              ? '#f59e0b' // amber-500
              : '#5C6B5E'; // natural-sage

          return (
            <g
              key={bin.id}
              transform={`translate(${bin.x}, ${bin.y})`}
              className="cursor-pointer group"
              onClick={() => onBinSelect(bin)}
            >
              {/* Pulse effect */}
              {bin.status === 'critical' && (
                <circle
                  cx="0"
                  cy="0"
                  r="18"
                  fill={statusColor}
                  fillOpacity="0.4"
                  className="animate-pulse"
                />
              )}

              {/* Hover highlight circle */}
              <circle
                cx="0"
                cy="0"
                r={isBinSelected ? 22 : 14}
                fill={statusColor}
                fillOpacity={isBinSelected ? 0.35 : 0.15}
                className="transition-all duration-300 group-hover:scale-125"
              />

              {/* Core marker circle */}
              <circle
                cx="0"
                cy="0"
                r={isBinSelected ? 9 : 7}
                fill={statusColor}
                stroke="#ffffff"
                strokeWidth={isBinSelected ? 3 : 2}
                className="transition-all duration-300 shadow-md"
              />

              {/* Label for selected bin */}
              {isBinSelected && (
                <g transform="translate(0, -20)" className="pointer-events-none">
                  <rect
                    x="-42"
                    y="-13"
                    width="84"
                    height="20"
                    rx="5"
                    fill="#1e2022"
                    className="shadow-xl"
                  />
                  <text
                    x="0"
                    y="1"
                    className="text-[9px] font-mono font-bold fill-white text-center"
                    textAnchor="middle"
                  >
                    {bin.id} ({bin.fillLevel}%)
                  </text>
                </g>
              )}
            </g>
          );
        })}

        {/* Collector Unit Truck Icon with Dynamic Turning Rotation */}
        <g
          transform={`translate(${truckPos.x}, ${truckPos.y}) rotate(${truckPos.angle || 0})`}
          className={`transition-opacity duration-300 ${
            isDispatching ? 'opacity-100' : 'opacity-0'
          }`}
        >
          {/* Glow circle */}
          <circle cx="0" cy="0" r="18" fill="#F97316" fillOpacity="0.35" className="animate-pulse" />
          
          {/* Truck Cardboard */}
          <rect x="-15" y="-15" width="30" height="30" rx="8" fill="#1e2022" stroke="#FFFFFF" strokeWidth="2.5" className="shadow-2xl" />
          
          {/* Arrow / Direction Indicator */}
          <polygon points="10,-4 10,4 16,0" fill="#FFFFFF" />
          
          {/* Truck icon overlay centered at (0,0) */}
          <foreignObject x="-12" y="-12" width="24" height="24" className="pointer-events-none">
            <div className="w-full h-full flex items-center justify-center text-white">
              <Truck className="w-4 h-4 text-white" />
            </div>
          </foreignObject>
        </g>
      </svg>

      {/* Network Live Banner at Bottom Left */}
      <div className="absolute bottom-4 left-4 z-20 bg-natural-surface/90 backdrop-blur-md px-3.5 py-2 rounded-xl border border-natural-stone/10 shadow-md flex items-center gap-2">
        <Radio className="w-4 h-4 text-emerald-500 animate-pulse" />
        <span className="text-[10px] font-mono font-black uppercase tracking-widest text-natural-stone">
          GPS Live (Bengaluru City Grid)
        </span>
      </div>
    </section>
  );
}
