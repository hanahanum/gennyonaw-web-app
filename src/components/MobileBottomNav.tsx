import React from 'react';
import {
  LayoutDashboard,
  Utensils,
  Dumbbell,
  Droplet,
  Sparkles,
} from 'lucide-react';

interface MobileBottomNavProps {
  activeTab: 'overview' | 'diet' | 'watch' | 'workout' | 'nutrition';
  onTabChange: (tab: 'overview' | 'diet' | 'watch' | 'workout' | 'nutrition') => void;
  onOpenStatePlanner: () => void;
}

export const MobileBottomNav: React.FC<MobileBottomNavProps> = ({
  activeTab,
  onTabChange,
  onOpenStatePlanner,
}) => {
  return (
    <nav
      id="mobile-bottom-navbar"
      className="lg:hidden fixed bottom-0 inset-x-0 z-40 bg-[#FFFDFB]/95 backdrop-blur-md border-t border-[#EEDDD3] px-2 py-1.5 shadow-xl"
    >
      <div className="grid grid-cols-5 items-center max-w-lg mx-auto">
        {/* Tab 1: Overview */}
        <button
          id="mobile-tab-overview"
          onClick={() => onTabChange('overview')}
          className={`flex flex-col items-center justify-center py-1 transition ${
            activeTab === 'overview' ? 'text-[#3D312A] font-bold' : 'text-[#7C6E66]'
          }`}
        >
          <LayoutDashboard className={`w-5 h-5 ${activeTab === 'overview' ? 'text-[#E88E75]' : 'text-[#7C6E66]'}`} />
          <span className="text-[10px] mt-0.5">Overview</span>
        </button>

        {/* Tab 2: Diet Plan */}
        <button
          id="mobile-tab-diet"
          onClick={() => onTabChange('diet')}
          className={`flex flex-col items-center justify-center py-1 transition ${
            activeTab === 'diet' ? 'text-[#3D312A] font-bold' : 'text-[#7C6E66]'
          }`}
        >
          <Utensils className={`w-5 h-5 ${activeTab === 'diet' ? 'text-[#E88E75]' : 'text-[#7C6E66]'}`} />
          <span className="text-[10px] mt-0.5">Diet Plan</span>
        </button>

        {/* Tab 3: CENTER Ask AI Action Button */}
        <div className="flex flex-col items-center justify-center">
          <button
            id="mobile-ask-ai-center-btn"
            onClick={onOpenStatePlanner}
            title="Ask AI / State & Condition Planner"
            className="flex flex-col items-center justify-center -mt-6 group active:scale-95 transition"
          >
            <div className="w-13 h-13 rounded-full bg-[#3D312A] text-[#FFF1E6] flex items-center justify-center shadow-lg border-2 border-white ring-2 ring-[#E88E75]/50 group-hover:bg-[#2E2420] transition">
              <Sparkles className="w-6 h-6 text-[#E88E75] animate-pulse" />
            </div>
            <span className="text-[10px] font-bold text-[#3D312A] mt-0.5">Ask AI</span>
          </button>
        </div>

        {/* Tab 4: Workout */}
        <button
          id="mobile-tab-workout"
          onClick={() => onTabChange('workout')}
          className={`flex flex-col items-center justify-center py-1 transition ${
            activeTab === 'workout' ? 'text-[#3D312A] font-bold' : 'text-[#7C6E66]'
          }`}
        >
          <Dumbbell className={`w-5 h-5 ${activeTab === 'workout' ? 'text-[#E88E75]' : 'text-[#7C6E66]'}`} />
          <span className="text-[10px] mt-0.5">Workout</span>
        </button>

        {/* Tab 5: Calories & Track */}
        <button
          id="mobile-tab-nutrition"
          onClick={() => onTabChange('nutrition')}
          className={`flex flex-col items-center justify-center py-1 transition ${
            activeTab === 'nutrition' ? 'text-[#3D312A] font-bold' : 'text-[#7C6E66]'
          }`}
        >
          <Droplet className={`w-5 h-5 ${activeTab === 'nutrition' ? 'text-[#E88E75]' : 'text-[#7C6E66]'}`} />
          <span className="text-[10px] mt-0.5">Calories</span>
        </button>
      </div>
    </nav>
  );
};

