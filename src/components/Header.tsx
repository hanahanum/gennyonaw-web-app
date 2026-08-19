import React from 'react';
import {
  Sparkles,
  Watch,
  Utensils,
  Dumbbell,
  HeartPulse,
  Droplet,
  Sliders,
  Wind,
  Activity,
  MessageSquarePlus,
} from 'lucide-react';

interface HeaderProps {
  activeTab: 'overview' | 'diet' | 'watch' | 'workout' | 'nutrition';
  onTabChange: (tab: 'overview' | 'diet' | 'watch' | 'workout' | 'nutrition') => void;
  onOpenBreathing: () => void;
  onOpenSettings: () => void;
  onOpenAICoach: () => void;
  onOpenStatePlanner: () => void;
  isWatchConnected?: boolean;
  watchModel?: string;
  currentStressScore?: number;
}

export const Header: React.FC<HeaderProps> = ({
  activeTab,
  onTabChange,
  onOpenBreathing,
  onOpenSettings,
  onOpenAICoach,
  onOpenStatePlanner,
  isWatchConnected = true,
  watchModel = 'Redmi Watch 4',
  currentStressScore = 32,
}) => {
  const tabs = [
    { id: 'overview' as const, label: 'Dashboard', icon: Sparkles },
    { id: 'diet' as const, label: 'AI Diet Plan', icon: Utensils },
    { id: 'workout' as const, label: 'Workout Routine', icon: Dumbbell },
    { id: 'nutrition' as const, label: 'Calories & Hydration', icon: Droplet },
    { id: 'watch' as const, label: 'Redmi Biometrics', icon: Watch },
  ];

  return (
    <header id="main-header" className="sticky top-0 z-30 bg-[#F0EFEB]/95 backdrop-blur-md border-b border-[#EEDDD3] px-3 sm:px-6 lg:px-8 py-2.5 shadow-xs">
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-3">
        {/* Brand & Sync Status */}
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-[16px] bg-[#3D312A] text-[#FFF1E6] flex items-center justify-center shadow-xs shrink-0 border border-[#EEDDD3]">
            <Activity className="w-5 h-5 text-[#E88E75]" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span
                style={{ fontFamily: "'Cherry Bomb One', cursive, sans-serif" }}
                className="font-cherry-bomb text-lg sm:text-xl text-[#3D312A] tracking-wider"
              >
                げんにょなう
              </span>
              <span className="bento-chip inline-flex items-center gap-1 text-[10px]">
                <span className="w-1.5 h-1.5 rounded-full bg-[#E88E75] animate-pulse" />
                {watchModel}
              </span>
            </div>
            <p className="text-[10px] text-[#7C6E66] hidden md:block">
              AI Diet & Workout Tracker • GennyoNaw
            </p>
          </div>
        </div>

        {/* Bento Nav Pill Bar (Desktop) */}
        <nav className="hidden lg:flex items-center gap-1 bg-white/90 p-1 rounded-2xl border border-[#EEDDD3] shadow-xs">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                id={`nav-tab-${tab.id}`}
                onClick={() => onTabChange(tab.id)}
                className={`flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all ${
                  isActive
                    ? 'bg-[#3D312A] text-[#FFF1E6] shadow-xs'
                    : 'text-[#7C6E66] hover:text-[#3D312A] hover:bg-[#FFF1E6]/60'
                }`}
              >
                <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-[#E88E75]' : 'text-[#7C6E66]'}`} />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </nav>

        {/* Action Controls */}
        <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
          {/* Primary Ask AI / State Button (Desktop & Tablet) */}
          <button
            id="header-ask-ai-state-btn"
            onClick={onOpenStatePlanner}
            className="hidden sm:flex items-center gap-1.5 px-3 sm:px-3.5 py-1.5 sm:py-2 rounded-xl text-xs font-bold bg-[#3D312A] hover:bg-[#2E2420] text-[#FFF1E6] shadow-xs transition active:scale-95 border border-[#EEDDD3]"
          >
            <Sparkles className="w-3.5 h-3.5 text-[#E88E75]" />
            <span>Ask AI / State</span>
          </button>

          <button
            id="header-breathing-btn"
            onClick={onOpenBreathing}
            title="Stress Reset (4-7-8 Breathing)"
            className="hidden sm:flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl text-xs font-semibold bg-white text-[#3D312A] border border-[#EEDDD3] hover:bg-[#FFF1E6]/50 shadow-xs transition"
          >
            <Wind className="w-3.5 h-3.5 text-[#D48B77]" />
            <span>Pacer</span>
          </button>

          <button
            id="header-settings-btn"
            onClick={onOpenSettings}
            title="Personal Instructions & Diet Preferences"
            className="p-1.5 sm:p-2 rounded-xl bg-white text-[#3D312A] border border-[#EEDDD3] hover:bg-[#FFF1E6]/50 transition shadow-xs"
          >
            <Sliders className="w-4 h-4 text-[#7C6E66]" />
          </button>
        </div>
      </div>
    </header>
  );
};
