import React from 'react';
import { LayoutGrid, BookOpen, CircleDot, Sparkles, Settings2 } from 'lucide-react';
import { TabType } from '../types';

interface NavbarProps {
  activeTab: TabType;
  onSelectTab: (tab: TabType) => void;
}

export const Navbar: React.FC<NavbarProps> = ({ activeTab, onSelectTab }) => {
  const navItems: { id: TabType; label: string; icon: React.ElementType; matchTabs: TabType[] }[] = [
    { id: 'dashboard', label: 'Times', icon: LayoutGrid, matchTabs: ['dashboard'] },
    { id: 'khatam', label: 'Khatam', icon: BookOpen, matchTabs: ['khatam'] },
    { id: 'tasbih', label: 'Tasbih', icon: CircleDot, matchTabs: ['tasbih'] },
    { id: 'vault', label: "Du'a", icon: Sparkles, matchTabs: ['vault', 'reflections', 'istikharah', 'audio'] },
    { id: 'settings', label: 'Setup', icon: Settings2, matchTabs: ['settings'] },
  ];

  return (
    <nav 
      id="floating-bottom-nav"
      className="fixed bottom-3 left-1/2 -translate-x-1/2 w-[92%] max-w-[398px] z-50 pointer-events-auto select-none"
    >
      <div className="liquid-glass rounded-3xl p-1.5 flex items-center justify-around border border-white/15 shadow-glass backdrop-blur-2xl">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = item.matchTabs.includes(activeTab);
          return (
            <button
              key={item.id}
              id={`nav-btn-${item.id}`}
              onClick={() => onSelectTab(item.id)}
              className={`flex flex-col items-center py-1.5 px-3 rounded-2xl transition-all duration-200 active:scale-90 ${
                isActive
                  ? 'tab-active-pill text-[#86EFAC] shadow-glow-mint border border-[#4ADE80]/40 scale-[1.03]'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Icon className="w-4 h-4" />
              <span className="text-[10px] font-bold mt-1 tracking-tight">{item.label}</span>
            </button>
          );
        })}
      </div>
    </nav>
  );
};
