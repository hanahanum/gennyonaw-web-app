import React, { useState, useEffect } from 'react';
import {
  Target,
  TrendingDown,
  TrendingUp,
  Calendar,
  Zap,
  Flame,
  Utensils,
  Sparkles,
  ChevronRight,
  Clock,
  Award,
  SlidersHorizontal,
  Info,
  CheckCircle2,
  AlertCircle,
  Scale,
  Ruler,
} from 'lucide-react';
import { UserPreferences, GoalTimelineProjection } from '../types';
import { calculateGoalTimeline, calculateBMI } from '../utils/goalCalculator';

interface GoalProgressCardProps {
  preferences: UserPreferences;
  onUpdateTargetWeight?: (targetKg: number, currentKg?: number, heightCm?: number) => void;
  onOpenSettings?: () => void;
  dailyIntakeCalories?: number;
  dailyBurnCalories?: number;
}

export const GoalProgressCard: React.FC<GoalProgressCardProps> = ({
  preferences,
  onUpdateTargetWeight,
  onOpenSettings,
  dailyIntakeCalories = 2050,
  dailyBurnCalories = 2450,
}) => {
  const [selectedIntensity, setSelectedIntensity] = useState<'Light' | 'Moderate' | 'High' | 'Intense'>('Moderate');
  const [isEditingGoal, setIsEditingGoal] = useState(false);

  const [tempCurrentWeight, setTempCurrentWeight] = useState<number>(preferences.weightKg || 63.5);
  const [tempTargetWeight, setTempTargetWeight] = useState<number>(preferences.targetWeightKg || 56.0);
  const [tempHeight, setTempHeight] = useState<number>(preferences.heightCm || 162);

  // Sync state whenever preferences change from parent
  useEffect(() => {
    setTempCurrentWeight(preferences.weightKg || 63.5);
    setTempTargetWeight(preferences.targetWeightKg || 56.0);
    setTempHeight(preferences.heightCm || 162);
  }, [preferences.weightKg, preferences.targetWeightKg, preferences.heightCm]);

  const currentWeight = preferences.weightKg || 63.5;
  const targetWeight = preferences.targetWeightKg || 56.0;
  const heightCm = preferences.heightCm || 162;

  const projection: GoalTimelineProjection = calculateGoalTimeline(
    currentWeight,
    targetWeight,
    dailyIntakeCalories,
    dailyBurnCalories,
    selectedIntensity,
    heightCm
  );

  const isLoss = projection.weightDeltaKg > 0;
  const absDelta = Math.abs(projection.weightDeltaKg);

  // Initial baseline estimate for progress (e.g. from starting weight ~4kg away from current)
  const initialWeight = currentWeight + (isLoss ? 4.0 : -4.0);
  const totalGoalSpan = Math.abs(initialWeight - targetWeight) || 1;
  const achievedSpan = Math.abs(initialWeight - currentWeight);
  const progressPercent = Math.min(100, Math.max(10, Math.round((achievedSpan / totalGoalSpan) * 100)));

  // Live calculation for the inline editing form preview
  const previewCurrentBmi = calculateBMI(tempCurrentWeight, tempHeight);
  const previewTargetBmi = calculateBMI(tempTargetWeight, tempHeight);
  const isPreviewTargetHealthy = previewTargetBmi.bmi >= 18.5 && previewTargetBmi.bmi <= 24.9;

  const handleSaveWeights = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (onUpdateTargetWeight) {
      onUpdateTargetWeight(tempTargetWeight, tempCurrentWeight, tempHeight);
    }
    setIsEditingGoal(false);
  };

  const handleSetIdealBMI = () => {
    setTempTargetWeight(previewCurrentBmi.idealWeightKg);
  };

  return (
    <div
      id="goal-progress-bento-card"
      className="bento-card bg-[#FFFDFB] border border-[#EEDDD3] shadow-xs relative overflow-hidden transition-all"
    >
      {/* Decorative top soft pastel accent bar */}
      <div className="absolute top-0 inset-x-0 h-1.5 bg-gradient-to-r from-[#E88E75] via-[#EEDDD3] to-[#D48B77]" />

      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pb-3 border-b border-[#EEDDD3]/70">
        <div className="flex items-center gap-2.5">
          <div className="w-10 h-10 rounded-2xl bg-[#3D312A] text-[#FFF1E6] flex items-center justify-center shadow-xs shrink-0">
            <Target className="w-5 h-5 text-[#E88E75]" />
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h3 className="font-bold text-[#3D312A] text-base tracking-tight">
                Target Weight & Goal Timeline
              </h3>
              <span className="bento-chip text-[10px] bg-[#FFF1E6] text-[#5C3A2E] border border-[#EEDDD3]">
                {projection.paceDescription}
              </span>
              <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold border ${
                projection.bmi.isTargetHealthy
                  ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                  : 'bg-amber-50 text-amber-800 border-amber-200'
              }`}>
                Target BMI: {projection.bmi.targetBmi} ({projection.bmi.targetCategory})
              </span>
            </div>
            <p className="text-[11px] text-[#7C6E66]">
              Real-time projection based on BMI rules, your Diet Plan & Redmi Watch burn
            </p>
          </div>
        </div>

        <button
          type="button"
          id="btn-edit-target-kg"
          onClick={() => setIsEditingGoal(!isEditingGoal)}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold bg-[#FFF1E6] text-[#3D312A] border border-[#EEDDD3] hover:bg-[#EDDCD2]/70 transition shadow-xs"
        >
          <SlidersHorizontal className="w-3.5 h-3.5 text-[#D48B77]" />
          <span>{isEditingGoal ? 'Close Form' : 'Edit Target & Height'}</span>
        </button>
      </div>

      {/* Inline Goal & BMI Editor */}
      {isEditingGoal && (
        <form onSubmit={handleSaveWeights} className="my-3 p-4 rounded-3xl bg-[#FFF1E6]/90 border border-[#EEDDD3] space-y-3.5 animate-in fade-in duration-200">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-[#3D312A] flex items-center gap-1.5">
              <Scale className="w-4 h-4 text-[#D48B77]" />
              <span>Update Body Metrics & Target Goal (with BMI Rules)</span>
            </span>
            <span className="text-[11px] text-[#7C6E66]">Height is used for WHO BMI calculation</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {/* Height input */}
            <div>
              <label className="block text-[11px] font-bold uppercase tracking-wider text-[#7C6E66] mb-1">
                Height (cm)
              </label>
              <div className="relative">
                <input
                  type="number"
                  step="0.5"
                  min="120"
                  max="230"
                  value={tempHeight}
                  onChange={(e) => setTempHeight(parseFloat(e.target.value) || heightCm)}
                  className="w-full pl-3 pr-8 py-2 rounded-xl bg-white border border-[#EEDDD3] text-[#3D312A] font-mono font-bold text-sm focus:outline-none focus:ring-2 focus:ring-[#D48B77]"
                />
                <span className="absolute right-3 top-2.5 text-xs text-[#7C6E66] font-semibold">cm</span>
              </div>
            </div>

            {/* Current weight */}
            <div>
              <label className="block text-[11px] font-bold uppercase tracking-wider text-[#7C6E66] mb-1">
                Current Weight (kg)
              </label>
              <div className="relative">
                <input
                  type="number"
                  step="0.1"
                  min="30"
                  max="250"
                  value={tempCurrentWeight}
                  onChange={(e) => setTempCurrentWeight(parseFloat(e.target.value) || currentWeight)}
                  className="w-full pl-3 pr-8 py-2 rounded-xl bg-white border border-[#EEDDD3] text-[#3D312A] font-mono font-bold text-sm focus:outline-none focus:ring-2 focus:ring-[#D48B77]"
                />
                <span className="absolute right-3 top-2.5 text-xs text-[#7C6E66] font-semibold">kg</span>
              </div>
            </div>

            {/* Target weight */}
            <div>
              <label className="block text-[11px] font-bold uppercase tracking-wider text-[#7C6E66] mb-1">
                Target Weight Goal (kg)
              </label>
              <div className="relative">
                <input
                  type="number"
                  step="0.1"
                  min="30"
                  max="250"
                  value={tempTargetWeight}
                  onChange={(e) => setTempTargetWeight(parseFloat(e.target.value) || targetWeight)}
                  className="w-full pl-3 pr-8 py-2 rounded-xl bg-white border border-[#EEDDD3] text-[#3D312A] font-mono font-bold text-sm focus:outline-none focus:ring-2 focus:ring-[#D48B77]"
                />
                <span className="absolute right-3 top-2.5 text-xs text-[#7C6E66] font-semibold">kg</span>
              </div>
            </div>
          </div>

          {/* Real-time BMI rules breakdown pill & Auto-suggestion */}
          <div className="p-3 rounded-2xl bg-white border border-[#EEDDD3] text-xs space-y-2">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <span className="font-bold text-[#3D312A]">BMI Analysis:</span>
                <span className="text-[#5C3A2E]">
                  Current: <strong>{previewCurrentBmi.bmi}</strong> ({previewCurrentBmi.category})
                </span>
                <span>➔</span>
                <span className={`font-bold ${isPreviewTargetHealthy ? 'text-emerald-700' : 'text-amber-700'}`}>
                  Target: {previewTargetBmi.bmi} ({previewTargetBmi.category})
                </span>
              </div>

              <button
                type="button"
                onClick={handleSetIdealBMI}
                className="px-2.5 py-1 rounded-lg bg-[#FFF1E6] hover:bg-[#EDDCD2] text-[#5C3A2E] font-bold text-[11px] border border-[#EEDDD3] transition"
              >
                ✨ Set Ideal 21.5 BMI ({previewCurrentBmi.idealWeightKg} kg)
              </button>
            </div>

            <div className="flex items-center justify-between text-[11px] text-[#7C6E66] pt-1 border-t border-[#EEDDD3]/60 flex-wrap gap-1">
              <span>
                Healthy weight range for {tempHeight} cm: <strong className="text-[#3D312A]">{previewCurrentBmi.minHealthyWeightKg} kg – {previewCurrentBmi.maxHealthyWeightKg} kg</strong> (BMI 18.5–24.9)
              </span>
              {!isPreviewTargetHealthy && (
                <span className="text-amber-700 font-semibold flex items-center gap-1">
                  <AlertCircle className="w-3.5 h-3.5" />
                  Target outside standard healthy BMI range
                </span>
              )}
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-1">
            <button
              type="button"
              onClick={() => setIsEditingGoal(false)}
              className="px-3.5 py-1.5 rounded-xl text-xs font-semibold text-[#7C6E66] hover:bg-[#EDDCD2]"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 rounded-xl text-xs font-bold bg-[#3D312A] text-[#FFF1E6] hover:bg-[#2E2420] shadow-xs transition"
            >
              Update Goals & Recalculate Timeline
            </button>
          </div>
        </form>
      )}

      {/* Main Goal Stats Bar */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 my-4">
        {/* Current Weight & BMI */}
        <div className="p-3 rounded-2xl bg-[#F0EFEB]/80 border border-[#EEDDD3]/60 flex flex-col justify-between">
          <span className="text-[10px] font-bold uppercase tracking-wider text-[#7C6E66]">
            Current Weight
          </span>
          <div className="flex items-baseline gap-1 my-1">
            <span className="text-2xl sm:text-3xl font-extrabold font-mono text-[#3D312A]">
              {currentWeight}
            </span>
            <span className="text-xs font-semibold text-[#7C6E66]">kg</span>
          </div>
          <div className="text-[10px] text-[#7C6E66] font-semibold">
            BMI: <strong className="text-[#3D312A]">{projection.bmi.currentBmi}</strong> ({projection.bmi.currentCategory})
          </div>
        </div>

        {/* Target Weight Goal & BMI */}
        <div className="p-3 rounded-2xl bg-[#FFF1E6] border border-[#EEDDD3] flex flex-col justify-between">
          <span className="text-[10px] font-bold uppercase tracking-wider text-[#5C3A2E]">
            Target Kilogram Goal
          </span>
          <div className="flex items-baseline gap-1 my-1">
            <span className="text-2xl sm:text-3xl font-extrabold font-mono text-[#D48B77]">
              {targetWeight}
            </span>
            <span className="text-xs font-bold text-[#D48B77]">kg</span>
          </div>
          <div className="flex items-center gap-1 text-[10px] font-bold text-[#5C3A2E]">
            {isLoss ? <TrendingDown className="w-3 h-3 text-[#E88E75]" /> : <TrendingUp className="w-3 h-3 text-[#6B9080]" />}
            <span>{isLoss ? `-${absDelta} kg to shed` : `+${absDelta} kg muscle tone`}</span>
          </div>
        </div>

        {/* Estimated Time to Goal */}
        <div className="p-3 rounded-2xl bg-[#F0EFEB]/80 border border-[#EEDDD3]/60 flex flex-col justify-between">
          <span className="text-[10px] font-bold uppercase tracking-wider text-[#7C6E66]">
            Estimated Time
          </span>
          <div className="flex items-baseline gap-1 my-1">
            <span className="text-2xl sm:text-3xl font-extrabold font-mono text-[#3D312A]">
              ~{projection.estimatedWeeks}
            </span>
            <span className="text-xs font-semibold text-[#7C6E66]">weeks</span>
          </div>
          <div className="flex items-center gap-1 text-[10px] font-bold text-[#6B9080]">
            <Calendar className="w-3 h-3" />
            <span>Target: {projection.estimatedCompletionDate}</span>
          </div>
        </div>

        {/* Weekly Projected Rate */}
        <div className="p-3 rounded-2xl bg-[#F0EFEB]/80 border border-[#EEDDD3]/60 flex flex-col justify-between">
          <span className="text-[10px] font-bold uppercase tracking-wider text-[#7C6E66]">
            Weekly Fat/Burn Rate
          </span>
          <div className="flex items-baseline gap-1 my-1">
            <span className="text-2xl sm:text-3xl font-extrabold font-mono text-[#3D312A]">
              {isLoss ? `-${projection.weeklyRateKg}` : `+${projection.weeklyRateKg}`}
            </span>
            <span className="text-xs font-semibold text-[#7C6E66]">kg/wk</span>
          </div>
          <span className="text-[10px] text-[#7C6E66]">
            Δ {projection.dailyDeficitKcal > 0 ? `-${projection.dailyDeficitKcal}` : `+${Math.abs(projection.dailyDeficitKcal)}`} kcal/day
          </span>
        </div>
      </div>

      {/* BMI Rules & Guidance Information Callout */}
      <div className="p-3 rounded-2xl bg-white border border-[#EEDDD3] my-3 flex items-start gap-2.5 text-xs text-[#5C3A2E]">
        <Info className="w-4 h-4 text-[#D48B77] shrink-0 mt-0.5" />
        <div className="space-y-0.5">
          <p className="text-[11px] leading-relaxed font-medium">
            {projection.bmi.advice}
          </p>
          <p className="text-[10px] text-[#7C6E66]">
            Height: <strong>{heightCm} cm</strong> • Healthy Range: <strong>{projection.bmi.minHealthyWeightKg}–{projection.bmi.maxHealthyWeightKg} kg</strong> (WHO BMI 18.5 – 24.9 Standard)
          </p>
        </div>
      </div>

      {/* Visual Journey Progress Bar */}
      <div className="p-3 rounded-2xl bg-white border border-[#EEDDD3] my-3">
        <div className="flex justify-between items-center text-xs font-bold text-[#3D312A] mb-1.5">
          <span className="flex items-center gap-1.5">
            <Award className="w-4 h-4 text-[#D48B77]" />
            <span>Target Goal Milestone Progress</span>
          </span>
          <span className="font-mono text-[#D48B77]">{progressPercent}% Journey Track</span>
        </div>

        <div className="h-3 bg-[#EDDCD2]/70 rounded-full overflow-hidden p-0.5 border border-[#EEDDD3]">
          <div
            className="h-full bg-gradient-to-r from-[#E88E75] via-[#D48B77] to-[#C47C68] rounded-full transition-all duration-700 shadow-xs"
            style={{ width: `${progressPercent}%` }}
          />
        </div>

        <div className="flex justify-between items-center text-[10px] text-[#7C6E66] font-semibold mt-1.5">
          <span>Start Point ({initialWeight.toFixed(1)} kg)</span>
          <span className="font-bold text-[#3D312A]">Current ({currentWeight} kg)</span>
          <span className="font-bold text-[#D48B77]">Goal ({targetWeight} kg)</span>
        </div>
      </div>

      {/* Workout Intensity & Diet Strategy Simulator Controls */}
      <div className="pt-2 border-t border-[#EEDDD3]/70 flex flex-col md:flex-row items-start md:items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-1.5">
          <Zap className="w-3.5 h-3.5 text-[#D48B77]" />
          <span className="font-bold text-[#3D312A]">Simulate Workout Intensity:</span>
        </div>

        <div className="flex items-center gap-1 bg-[#F0EFEB] p-1 rounded-xl border border-[#EEDDD3]">
          {(['Light', 'Moderate', 'High', 'Intense'] as const).map((lvl) => {
            const isSelected = selectedIntensity === lvl;
            return (
              <button
                key={lvl}
                onClick={() => setSelectedIntensity(lvl)}
                className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition-all ${
                  isSelected
                    ? 'bg-[#3D312A] text-[#FFF1E6] shadow-xs'
                    : 'text-[#7C6E66] hover:text-[#3D312A] hover:bg-white/60'
                }`}
              >
                {lvl}
              </button>
            );
          })}
        </div>

        <div className="text-[11px] text-[#7C6E66]">
          At <strong className="text-[#3D312A]">{selectedIntensity}</strong> intensity: goal in{' '}
          <strong className="text-[#D48B77] font-mono">~{projection.estimatedWeeks} wks</strong>
        </div>
      </div>
    </div>
  );
};
