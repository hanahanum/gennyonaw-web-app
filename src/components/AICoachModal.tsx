import React from 'react';
import {
  X,
  Sparkles,
  RefreshCw,
  Watch,
  Heart,
  Activity,
  Flame,
  Droplet,
  Footprints,
  Wind,
  CheckCircle2,
} from 'lucide-react';
import {
  AICoachInsight,
  DailyBiometricSummary,
  DailyTrackingState,
  UserPreferences,
} from '../types';

interface AICoachModalProps {
  isOpen: boolean;
  onClose: () => void;
  insight: AICoachInsight;
  biometrics: DailyBiometricSummary;
  dailyTracking: DailyTrackingState;
  preferences: UserPreferences;
  onRefreshCoach: () => void;
  isLoading: boolean;
  onOpenBreathing: () => void;
}

export const AICoachModal: React.FC<AICoachModalProps> = ({
  isOpen,
  onClose,
  insight,
  biometrics,
  dailyTracking,
  preferences,
  onRefreshCoach,
  isLoading,
  onOpenBreathing,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#3D312A]/60 backdrop-blur-xs overflow-y-auto">
      <div
        id="ai-coach-modal"
        className="bg-[#FFFDFB] rounded-3xl max-w-2xl w-full p-6 sm:p-8 shadow-2xl border border-[#EEDDD3] my-8 max-h-[90vh] flex flex-col"
      >
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-[#EEDDD3] shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-[#3D312A] text-[#FFF1E6] flex items-center justify-center font-bold">
              <Sparkles className="w-5 h-5 text-[#E88E75]" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg sm:text-xl font-bold text-[#3D312A]">
                  Biometric AI Coach
                </h2>
                <span className="bento-chip bg-[#FFF1E6] text-[#5C3A2E] border border-[#EEDDD3]">
                  Gemini Synthesis
                </span>
              </div>
              <p className="text-xs text-[#7C6E66]">
                Real-time synthesis of your Redmi Watch data & nutrition balance
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-[#7C6E66] hover:text-[#3D312A] hover:bg-[#FFF1E6] transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="overflow-y-auto py-4 space-y-4 pr-1 text-xs sm:text-sm">
          {/* Main Status Callout Bento Box */}
          <div className="p-4 rounded-3xl bg-[#FFF1E6]/90 border border-[#EEDDD3] space-y-2">
            <div className="flex items-center justify-between">
              <span className="bento-chip bg-white text-[#5C3A2E] border border-[#EEDDD3]">
                Recovery & Readiness Score
              </span>
              <span className="font-mono text-xs font-bold text-[#3D312A]">
                {insight.readinessScore}/100
              </span>
            </div>
            <h3 className="text-base font-bold text-[#3D312A]">
              {insight.readinessAssessment}
            </h3>
            <p className="text-xs text-[#7C6E66] leading-relaxed">
              {insight.biometricAnalysis}
            </p>
          </div>

          {/* 3 Metric Summary Pillars */}
          <div className="grid grid-cols-3 gap-2 text-center text-xs">
            <div className="p-3 rounded-2xl bg-[#F0EFEB]/80 border border-[#EEDDD3]">
              <span className="bento-label text-[9px] block text-[#7C6E66]">Avg Heart Rate</span>
              <span className="font-mono font-bold text-sm text-[#3D312A]">
                {biometrics.averageHeartRateBpm} bpm
              </span>
            </div>
            <div className="p-3 rounded-2xl bg-[#F0EFEB]/80 border border-[#EEDDD3]">
              <span className="bento-label text-[9px] block text-[#7C6E66]">Stress Level</span>
              <span className="font-mono font-bold text-sm text-[#D48B77]">
                {biometrics.stressScore} ({biometrics.stressLevel})
              </span>
            </div>
            <div className="p-3 rounded-2xl bg-[#F0EFEB]/80 border border-[#EEDDD3]">
              <span className="bento-label text-[9px] block text-[#7C6E66]">Active Burn</span>
              <span className="font-mono font-bold text-sm text-[#6B9080]">
                {biometrics.activeCaloriesBurned} kcal
              </span>
            </div>
          </div>

          {/* Actionable Diet & Workout Guidance */}
          <div className="space-y-3">
            <div className="p-3.5 rounded-2xl bg-[#FFFDFB] border border-[#EEDDD3] space-y-1">
              <span className="bento-label text-[10px] text-[#5C3A2E]">Dietary Guidance:</span>
              <p className="text-xs text-[#3D312A] leading-relaxed">
                {insight.dietaryAction}
              </p>
            </div>

            <div className="p-3.5 rounded-2xl bg-[#FFFDFB] border border-[#EEDDD3] space-y-1">
              <span className="bento-label text-[10px] text-[#5C3A2E]">Workout Guidance:</span>
              <p className="text-xs text-[#3D312A] leading-relaxed">
                {insight.workoutAction}
              </p>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between pt-4 border-t border-[#EEDDD3] shrink-0">
          <button
            onClick={onOpenBreathing}
            className="flex items-center gap-1.5 text-xs text-[#D48B77] hover:underline font-bold"
          >
            <Wind className="w-4 h-4" />
            <span>Open Calming Breath Pacer</span>
          </button>

          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-xs font-semibold text-[#7C6E66] hover:text-[#3D312A]"
            >
              Dismiss
            </button>
            <button
              onClick={onRefreshCoach}
              disabled={isLoading}
              className="px-4 py-2 rounded-xl bg-[#3D312A] hover:bg-[#2E2420] text-[#FFF1E6] text-xs font-bold transition flex items-center gap-1.5 disabled:opacity-50"
            >
              <RefreshCw className={`w-3.5 h-3.5 text-[#E88E75] ${isLoading ? 'animate-spin' : ''}`} />
              <span>Refresh Coach</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
