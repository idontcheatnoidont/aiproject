import { Trash2, CheckCircle2, AlertTriangle, AlertOctagon } from 'lucide-react';

interface StatsRowProps {
  emptyCount: number;
  normalCount: number;
  almostFullCount: number;
  fullCount: number;
}

export default function StatsRow({
  emptyCount,
  normalCount,
  almostFullCount,
  fullCount,
}: StatsRowProps) {
  return (
    <section className="h-24 shrink-0 bg-white border-t border-b border-natural-stone/10 grid grid-cols-4 divide-x divide-natural-stone/10">
      {/* Garbage Empty */}
      <div className="flex items-center justify-center gap-4 px-6">
        <div className="w-10 h-10 rounded-full bg-natural-sage/10 flex items-center justify-center text-natural-sage shrink-0">
          <Trash2 className="w-5 h-5" />
        </div>
        <div>
          <p className="text-[10px] font-bold tracking-wider text-natural-stone/50 uppercase">Garbage Empty</p>
          <p className="text-2xl font-serif font-bold text-natural-stone tabular-nums">{emptyCount}</p>
        </div>
      </div>

      {/* Normal */}
      <div className="flex items-center justify-center gap-4 px-6">
        <div className="w-10 h-10 rounded-full bg-natural-sage/20 flex items-center justify-center text-natural-sage shrink-0">
          <CheckCircle2 className="w-5 h-5" />
        </div>
        <div>
          <p className="text-[10px] font-bold tracking-wider text-natural-stone/50 uppercase">Normal</p>
          <p className="text-2xl font-serif font-bold text-natural-stone tabular-nums">{normalCount}</p>
        </div>
      </div>

      {/* Almost Full */}
      <div className="flex items-center justify-center gap-4 px-6">
        <div className="w-10 h-10 rounded-full bg-natural-clay/10 flex items-center justify-center text-natural-clay shrink-0">
          <AlertTriangle className="w-5 h-5" />
        </div>
        <div>
          <p className="text-[10px] font-bold tracking-wider text-natural-stone/50 uppercase">Almost Full</p>
          <p className="text-2xl font-serif font-bold text-natural-stone tabular-nums">{almostFullCount}</p>
        </div>
      </div>

      {/* Full */}
      <div className="flex items-center justify-center gap-4 px-6">
        <div className="w-10 h-10 rounded-full bg-natural-clay/20 flex items-center justify-center text-natural-clay shrink-0">
          <AlertOctagon className="w-5 h-5" />
        </div>
        <div>
          <p className="text-[10px] font-bold tracking-wider text-natural-stone/50 uppercase">Full</p>
          <p className="text-2xl font-serif font-bold text-natural-clay tabular-nums">{fullCount}</p>
        </div>
      </div>
    </section>
  );
}
