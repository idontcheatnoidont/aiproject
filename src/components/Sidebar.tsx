import { LayoutDashboard, Map, BarChart3, LogOut, User } from 'lucide-react';
import { ActiveTab } from '../types';

interface SidebarProps {
  activeTab: ActiveTab;
  onTabChange: (tab: ActiveTab) => void;
  onLogout: () => void;
}

export default function Sidebar({ activeTab, onTabChange, onLogout }: SidebarProps) {
  return (
    <aside id="sidebar" className="w-64 bg-natural-surface border-r border-natural-stone/10 flex flex-col shrink-0">
      {/* Operator Header */}
      <div className="p-6 flex items-center gap-4 border-b border-natural-stone/10">
        <div className="w-10 h-10 rounded-xl bg-natural-sage flex items-center justify-center text-white shrink-0 shadow-sm">
          <User className="w-5 h-5" />
        </div>
        <div>
          <p className="font-serif font-bold text-natural-stone text-base leading-tight">Operator</p>
          <p className="text-[10px] font-bold tracking-wider text-natural-clay uppercase mt-1">Admin Console</p>
        </div>
      </div>

      {/* Navigation Links */}
      <nav className="flex-grow py-6 px-3 space-y-1.5">
        <button
          onClick={() => onTabChange('dashboard')}
          className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-semibold transition-all cursor-pointer ${
            activeTab === 'dashboard'
              ? 'text-natural-sage bg-natural-bg border-l-4 border-natural-sage shadow-xs'
              : 'text-natural-stone/70 hover:bg-natural-bg/50 hover:text-natural-sage'
          }`}
        >
          <LayoutDashboard className={`w-5 h-5 ${activeTab === 'dashboard' ? 'text-natural-sage' : 'text-natural-stone/50'}`} />
          <span>Dashboard</span>
        </button>

        <button
          onClick={() => onTabChange('map')}
          className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-semibold transition-all cursor-pointer ${
            activeTab === 'map'
              ? 'text-natural-sage bg-natural-bg border-l-4 border-natural-sage shadow-xs'
              : 'text-natural-stone/70 hover:bg-natural-bg/50 hover:text-natural-sage'
          }`}
        >
          <Map className={`w-5 h-5 ${activeTab === 'map' ? 'text-natural-sage' : 'text-natural-stone/50'}`} />
          <span>Map View</span>
        </button>

        <button
          onClick={() => onTabChange('analytics')}
          className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-semibold transition-all cursor-pointer ${
            activeTab === 'analytics'
              ? 'text-slate-900 bg-natural-bg border-l-4 border-natural-sage shadow-xs'
              : 'text-natural-stone/70 hover:bg-natural-bg/50 hover:text-natural-sage'
          }`}
        >
          <BarChart3 className={`w-5 h-5 ${activeTab === 'analytics' ? 'text-natural-sage' : 'text-natural-stone/50'}`} />
          <span>Bin Analytics</span>
        </button>
      </nav>

      {/* Quote Block from Design Template */}
      <div className="px-6 py-6 border-t border-natural-stone/5 text-center">
        <p className="font-serif italic text-xs leading-relaxed text-natural-sage/80">
          "The quieter you become, the more you are able to hear."
        </p>
        <p className="text-[10px] font-bold text-natural-clay uppercase tracking-wider mt-2">— Rumi</p>
      </div>

      {/* Logout Area */}
      <div className="p-4 border-t border-natural-stone/10 bg-natural-stone/[0.02]">
        <button
          onClick={onLogout}
          className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-semibold text-natural-clay hover:bg-natural-clay/10 transition-all cursor-pointer"
        >
          <LogOut className="w-5 h-5" />
          <span>Logout</span>
        </button>
      </div>
    </aside>
  );
}
