import { useState } from 'react';
import { BarChart3, TrendingUp } from 'lucide-react';
import { ANALYTICS_HISTORY } from '../data';

export default function AnalyticsView() {
  const [selectedBar, setSelectedBar] = useState<number | null>(null);

  // Totals & KPI card data
  const kpis = [
    { title: 'Total Collected', value: '42.8 Tons', change: '+14.2% MoM', positive: true, desc: 'Across entire urban zone' },
    { title: 'Route Efficiency', value: '94.2%', change: '+8.6% vs target', positive: true, desc: 'AI automated fleet routing' },
    { title: 'CO₂ Saved', value: '3.6 Tons', change: '-22% carbon offset', positive: true, desc: 'Reduced fuel consumption' },
    { title: 'Network Health', value: '99.98%', change: 'All sensors online', positive: true, desc: 'Continuous telemetry feed' },
  ];

  // Max value in weekly collection for normalization
  const maxWeeklyCollection = 4.5; // Mon has ~2.8 total, Fri has ~5.0 total

  return (
    <div className="flex-grow overflow-y-auto bg-natural-bg p-8 flex flex-col gap-8 h-full select-none">
      {/* Title & Introduction Header */}
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-3xl font-serif font-bold text-natural-stone tracking-tight flex items-center gap-3">
            <BarChart3 className="w-8 h-8 text-natural-sage" />
            <span>Bin Network Analytics</span>
          </h1>
          <p className="text-natural-stone/60 text-sm font-semibold mt-1">
            Real-time sensor telemetry history, waste categorization distributions, and logistic optimizations.
          </p>
        </div>
        <div className="bg-natural-surface text-natural-stone font-bold text-xs px-4 py-2 rounded-xl border border-natural-stone/10">
          Last updated: Live
        </div>
      </div>

      {/* KPI Stats Grid */}
      <div className="grid grid-cols-4 gap-6">
        {kpis.map((kpi, idx) => (
          <div key={idx} className="bg-white p-6 rounded-2xl border border-natural-stone/10 shadow-xs flex flex-col justify-between hover:shadow-sm transition-shadow">
            <div>
              <p className="text-[10px] font-bold tracking-widest text-natural-stone/50 uppercase">{kpi.title}</p>
              <h3 className="text-3xl font-serif font-bold text-natural-stone tracking-tight mt-1 tabular-nums">{kpi.value}</h3>
            </div>
            <div className="mt-4 pt-3 border-t border-natural-stone/5 flex flex-col gap-0.5">
              <span className="text-xs font-bold text-natural-sage flex items-center gap-1">
                <TrendingUp className="w-3.5 h-3.5" />
                <span>{kpi.change}</span>
              </span>
              <span className="text-[11px] text-natural-stone/50 font-semibold">{kpi.desc}</span>
            </div>
          </div>
        ))}
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-2 gap-8">
        {/* Weekly Collection Volume Chart (Custom high fidelity SVG) */}
        <div className="bg-white p-6 rounded-2xl border border-natural-stone/10 shadow-xs flex flex-col">
          <div className="flex justify-between items-center mb-6">
            <div>
              <h3 className="text-base font-serif font-bold text-natural-stone">Weekly Collection Volume</h3>
              <p className="text-xs text-natural-stone/50 mt-0.5 font-semibold">Tons of waste emptied per day by category</p>
            </div>
            {/* Legend */}
            <div className="flex gap-3 text-[10px] font-bold text-natural-stone/60 uppercase tracking-wider">
              <span className="flex items-center gap-1">
                <span className="w-2.5 h-2.5 rounded-xs bg-[#3C3C3C]" />
                <span>General</span>
              </span>
              <span className="flex items-center gap-1">
                <span className="w-2.5 h-2.5 rounded-xs bg-[#7C8B96]" />
                <span>Recycle</span>
              </span>
              <span className="flex items-center gap-1">
                <span className="w-2.5 h-2.5 rounded-xs bg-[#5C6B5E]" />
                <span>Organic</span>
              </span>
              <span className="flex items-center gap-1">
                <span className="w-2.5 h-2.5 rounded-xs bg-[#C18C71]" />
                <span>Glass</span>
              </span>
            </div>
          </div>

          {/* SVG Chart */}
          <div className="relative h-64 w-full">
            <svg className="w-full h-full" viewBox="0 0 500 240">
              {/* Horizontal grid lines */}
              <line x1="40" y1="40" x2="480" y2="40" stroke="#F5F2ED" strokeWidth="1.5" />
              <line x1="40" y1="90" x2="480" y2="90" stroke="#F5F2ED" strokeWidth="1.5" />
              <line x1="40" y1="140" x2="480" y2="140" stroke="#F5F2ED" strokeWidth="1.5" />
              <line x1="40" y1="190" x2="480" y2="190" stroke="#F5F2ED" strokeWidth="1.5" strokeDasharray="3 3" />

              {/* Y Axis labels */}
              <text x="30" y="44" className="text-[10px] font-bold fill-natural-stone/40 text-right" textAnchor="end">5.0T</text>
              <text x="30" y="94" className="text-[10px] font-bold fill-natural-stone/40 text-right" textAnchor="end">3.0T</text>
              <text x="30" y="144" className="text-[10px] font-bold fill-natural-stone/40 text-right" textAnchor="end">1.5T</text>
              <text x="30" y="194" className="text-[10px] font-bold fill-natural-stone/40 text-right" textAnchor="end">0.0T</text>

              {/* Render Stacked Bars */}
              {ANALYTICS_HISTORY.weeklyCollection.map((data, index) => {
                const barWidth = 24;
                const gap = 36;
                const startX = 60 + index * (barWidth + gap);

                // Math to compute stacking heights
                const hGeneric = (data.generic / maxWeeklyCollection) * 150;
                const hRecycle = (data.recycle / maxWeeklyCollection) * 150;
                const hOrganic = (data.organic / maxWeeklyCollection) * 150;
                const hGlass = (data.glass / maxWeeklyCollection) * 150;

                const base = 190;

                const yGeneric = base - hGeneric;
                const yRecycle = yGeneric - hRecycle;
                const yOrganic = yRecycle - hOrganic;
                const yGlass = yOrganic - hGlass;

                return (
                  <g key={data.day} className="cursor-pointer" onMouseEnter={() => setSelectedBar(index)} onMouseLeave={() => setSelectedBar(null)}>
                    {/* Glass - natural clay */}
                    <rect x={startX} y={yGlass} width={barWidth} height={hGlass} fill="#C18C71" rx="2" className="transition-all duration-300 hover:opacity-90" />
                    {/* Organic - natural sage */}
                    <rect x={startX} y={yOrganic} width={barWidth} height={hOrganic} fill="#5C6B5E" rx="2" className="transition-all duration-300 hover:opacity-90" />
                    {/* Recycle - dusty slate */}
                    <rect x={startX} y={yRecycle} width={barWidth} height={hRecycle} fill="#7C8B96" rx="2" className="transition-all duration-300 hover:opacity-90" />
                    {/* Generic - natural stone */}
                    <rect x={startX} y={yGeneric} width={barWidth} height={hGeneric} fill="#3C3C3C" rx="2" className="transition-all duration-300 hover:opacity-90" />

                    {/* Day label */}
                    <text x={startX + barWidth / 2} y="212" className="text-[10px] font-bold fill-natural-stone/50 text-center" textAnchor="middle">{data.day}</text>

                    {/* Highlight outline */}
                    {selectedBar === index && (
                      <g>
                        <rect x={startX - 4} y={yGlass - 4} width={barWidth + 8} height={base - yGlass + 8} fill="none" stroke="#3C3C3C" strokeWidth="1.5" rx="4" />
                        <rect x={startX - 15} y={yGlass - 32} width={barWidth + 30} height={20} rx="4" fill="#3C3C3C" />
                        <text x={startX + barWidth / 2} y={yGlass - 19} className="text-[9px] font-bold fill-white text-center" textAnchor="middle">
                          {(data.generic + data.recycle + data.organic + data.glass).toFixed(1)}T Total
                        </text>
                      </g>
                    )}
                  </g>
                );
              })}
            </svg>
          </div>
        </div>

        {/* Fill Rate Trends - Live network fill level progression */}
        <div className="bg-white p-6 rounded-2xl border border-natural-stone/10 shadow-xs flex flex-col">
          <div>
            <h3 className="text-base font-serif font-bold text-natural-stone">Hourly Network Load</h3>
            <p className="text-xs text-natural-stone/50 mt-0.5 font-semibold">Average bin capacity used over 24-hour cycle</p>
          </div>

          <div className="relative h-64 w-full mt-6">
            <svg className="w-full h-full" viewBox="0 0 500 240">
              {/* Horizontal grid lines */}
              <line x1="40" y1="40" x2="480" y2="40" stroke="#F5F2ED" strokeWidth="1.5" />
              <line x1="40" y1="115" x2="480" y2="115" stroke="#F5F2ED" strokeWidth="1.5" />
              <line x1="40" y1="190" x2="480" y2="190" stroke="#F5F2ED" strokeWidth="1.5" />

              <text x="30" y="44" className="text-[10px] font-bold fill-natural-stone/40" textAnchor="end">100%</text>
              <text x="30" y="119" className="text-[10px] font-bold fill-natural-stone/40" textAnchor="end">50%</text>
              <text x="30" y="194" className="text-[10px] font-bold fill-natural-stone/40" textAnchor="end">0%</text>

              {/* Area Under Curve Gradient */}
              <defs>
                <linearGradient id="areaGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#5C6B5E" stopOpacity="0.22" />
                  <stop offset="100%" stopColor="#5C6B5E" stopOpacity="0.0" />
                </linearGradient>
              </defs>

              {/* Draw curve path */}
              <path
                d="M 60 142 L 114 128 L 168 118 L 222 109 L 276 97 L 330 83 L 384 76 L 438 80 L 438 190 L 60 190 Z"
                fill="url(#areaGrad)"
              />

              <path
                d="M 60 142 Q 114 128, 168 118 T 276 97 T 384 76 T 438 80"
                fill="none"
                stroke="#5C6B5E"
                strokeWidth="3.5"
                strokeLinecap="round"
              />

              {/* Dynamic point markers */}
              {ANALYTICS_HISTORY.fillRateTrends.map((trend, idx) => {
                const x = 60 + idx * 54;
                // percentage is converted to graph coordinates (40 to 190 range)
                const y = 190 - (trend.avgFill / 100) * 150;

                return (
                  <g key={trend.hour} className="group cursor-pointer">
                    <circle cx={x} cy={y} r="5" fill="#5C6B5E" stroke="#ffffff" strokeWidth="1.5" className="transition-all duration-200 group-hover:scale-150" />
                    <text x={x} y="212" className="text-[10px] font-bold fill-natural-stone/50 text-center" textAnchor="middle">{trend.hour}</text>

                    {/* Tooltip on hover */}
                    <g className="opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                      <rect x={x - 20} y={y - 28} width="40" height="18" rx="4" fill="#3C3C3C" />
                      <text x={x} y={y - 16} className="text-[10px] font-bold fill-white text-center" textAnchor="middle">{trend.avgFill}%</text>
                    </g>
                  </g>
                );
              })}
            </svg>
          </div>
        </div>
      </div>

      {/* Waste Distribution list card */}
      <div className="bg-white p-6 rounded-2xl border border-natural-stone/10 shadow-xs flex flex-col gap-4">
        <div>
          <h3 className="text-base font-serif font-bold text-natural-stone">Total Network Waste Footprint</h3>
          <p className="text-xs text-natural-stone/50 mt-0.5 font-semibold">Average distribution of raw materials deposited in smart nodes</p>
        </div>

        <div className="grid grid-cols-4 gap-6 mt-2">
          {ANALYTICS_HISTORY.typeDistribution.map((item) => {
            // Map items to natural tone theme palette dynamically
            const themeColor =
              item.name === 'General'
                ? '#3C3C3C' // stone
                : item.name === 'Recyclable'
                ? '#7C8B96' // dusty slate
                : item.name === 'Organic'
                ? '#5C6B5E' // sage
                : '#C18C71'; // clay

            return (
              <div key={item.name} className="p-4 bg-natural-surface/50 rounded-xl border border-natural-stone/5 flex flex-col gap-2">
                <div className="flex justify-between items-center">
                  <span className="text-xs font-bold text-natural-stone/80">{item.name}</span>
                  <span className="text-sm font-extrabold text-natural-stone">{item.value}%</span>
                </div>
                <div className="w-full bg-natural-stone/10 h-2.5 rounded-full overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all duration-500"
                    style={{
                      backgroundColor: themeColor,
                      width: `${item.value}%`,
                    }}
                  />
                </div>
                <p className="text-[9px] text-natural-stone/40 font-bold uppercase tracking-wider mt-1">
                  {item.name === 'General' && 'Residual Household'}
                  {item.name === 'Recyclable' && 'Paper, Cardboard, Plastics'}
                  {item.name === 'Organic' && 'Bio-degradable waste'}
                  {item.name === 'Glass' && 'Bottles & Containers'}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
