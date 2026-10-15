import { useState } from 'react';
import { Search, Battery } from 'lucide-react';
import { Bin, BinStatus } from '../types';
import { getPredictedTimeToFull } from '../utils';

interface BinListProps {
  bins: Bin[];
  selectedBinId: string | null;
  onBinSelect: (bin: Bin) => void;
}

export default function BinList({ bins, selectedBinId, onBinSelect }: BinListProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState<'all' | BinStatus>('all');

  // Filter bins
  const filteredBins = bins.filter((bin) => {
    const matchesSearch =
      bin.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      bin.address.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesFilter = activeFilter === 'all' ? true : bin.status === activeFilter;
    return matchesSearch && matchesFilter;
  });

  return (
    <section className="w-[320px] shrink-0 border-r border-natural-stone/10 flex flex-col bg-white">
      {/* Search and Filters Header */}
      <div className="p-4 border-b border-natural-stone/10 bg-natural-surface flex flex-col gap-3">
        <div className="relative">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-natural-stone/40" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search bin ID or address..."
            className="w-full pl-9 pr-4 py-2 bg-white rounded-lg border border-natural-stone/15 focus:outline-none focus:ring-2 focus:ring-natural-sage focus:border-transparent text-sm text-natural-stone placeholder-natural-stone/40 transition-all shadow-xs"
          />
        </div>

        {/* Status Filters */}
        <div className="flex gap-1 overflow-x-auto pb-1 scrollbar-none">
          {(['all', 'critical', 'warning', 'normal'] as const).map((filter) => (
            <button
              key={filter}
              onClick={() => setActiveFilter(filter)}
              className={`px-3 py-1 rounded-full text-[11px] font-bold uppercase tracking-wider transition-all shrink-0 cursor-pointer ${
                activeFilter === filter
                  ? 'bg-natural-sage text-white shadow-xs'
                  : 'bg-white text-natural-stone/60 border border-natural-stone/10 hover:bg-natural-surface'
              }`}
            >
              {filter}
            </button>
          ))}
        </div>
      </div>

      {/* Bin List Scrollable area */}
      <div className="flex-grow overflow-y-auto divide-y divide-natural-stone/5 bg-natural-bg">
        {filteredBins.length === 0 ? (
          <div className="p-8 text-center">
            <p className="text-xs font-semibold text-natural-stone/40">No nodes found</p>
          </div>
        ) : (
          filteredBins.map((bin) => {
            const isSelected = selectedBinId === bin.id;
            const statusColor =
              bin.status === 'critical'
                ? 'bg-natural-clay'
                : bin.status === 'warning'
                ? 'bg-amber-500'
                : 'bg-natural-sage';

            const badgeStyle =
              bin.status === 'critical'
                ? 'bg-natural-clay/10 text-natural-clay'
                : bin.status === 'warning'
                ? 'bg-amber-100 text-amber-800'
                : 'bg-natural-sage/10 text-natural-sage';

            return (
              <div
                key={bin.id}
                onClick={() => onBinSelect(bin)}
                className={`p-4 hover:bg-natural-surface/40 cursor-pointer flex items-center gap-4 transition-all ${
                  isSelected ? 'bg-natural-surface/70 border-r-4 border-natural-sage' : ''
                }`}
              >
                {/* Side Color bar */}
                <div className={`w-3 h-12 rounded-full shrink-0 ${statusColor}`} />

                {/* Info */}
                <div className="flex-grow min-w-0">
                  <div className="flex justify-between items-start mb-0.5">
                    <span className="font-serif font-bold text-natural-stone text-base">{bin.id}</span>
                    <span className={`px-2 py-0.5 rounded text-[9px] font-extrabold uppercase tracking-wider ${badgeStyle}`}>
                      {bin.status}
                    </span>
                  </div>
                  <p className="text-xs text-natural-stone/70 truncate mb-1">{bin.address}</p>

                  {/* Telemetry quick look */}
                  <div className="flex flex-col gap-1 mt-1">
                    <div className="flex items-center gap-2.5 text-[11px] text-natural-stone/50 font-semibold">
                      <span className="font-bold text-natural-stone/80 tabular-nums">{bin.fillLevel}% full</span>
                      <span>•</span>
                      <span className="flex items-center gap-1">
                        <Battery className="w-3 h-3 text-natural-stone/40" />
                        <span className="tabular-nums">{bin.battery}%</span>
                      </span>
                      <span>•</span>
                      <span>{bin.weight} kg</span>
                    </div>
                    {/* Predictive indicator */}
                    <div className={`text-[10px] font-bold flex items-center gap-1.5 mt-0.5 ${
                      bin.status === 'critical'
                        ? 'text-natural-clay'
                        : bin.status === 'warning'
                        ? 'text-amber-600'
                        : 'text-natural-sage'
                    }`}>
                      <span className={`w-1.5 h-1.5 rounded-full ${
                        bin.status === 'critical'
                          ? 'bg-natural-clay/40 animate-pulse'
                          : bin.status === 'warning'
                          ? 'bg-amber-500/40'
                          : 'bg-natural-sage/40'
                      }`} />
                      <span>Est: {getPredictedTimeToFull(bin)}</span>
                    </div>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Bin Count Info */}
      <div className="p-3 bg-natural-surface border-t border-natural-stone/10 text-center text-[10px] text-natural-stone/50 font-bold uppercase tracking-widest">
        Showing {filteredBins.length} of {bins.length} network nodes
      </div>
    </section>
  );
}
