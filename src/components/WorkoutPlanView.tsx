import React, { useState, useEffect } from 'react';
import {
  Dumbbell,
  Clock,
  Flame,
  CheckCircle2,
  Check,
  Sparkles,
  RefreshCw,
  Zap,
  Info,
  Calendar,
  Activity,
  ChevronRight,
  TrendingUp,
  Heart,
  Sliders,
  ShieldAlert,
} from 'lucide-react';
import {
  WeeklyWorkoutPlan,
  UserPreferences,
  DailyBiometricSummary,
  DayWorkoutPlan,
  UserConditionType,
} from '../types';
import { USER_CONDITIONS, adaptWorkoutForCondition } from '../utils/goalCalculator';

interface WorkoutPlanViewProps {
  workoutPlan: WeeklyWorkoutPlan;
  preferences: UserPreferences;
  biometrics: DailyBiometricSummary;
  onRefreshWorkoutPlan: () => void;
  isLoading: boolean;
  onOpenStatePlanner: () => void;
  completedExercises: Record<string, boolean>;
  onToggleExerciseCompleted: (exerciseId: string) => void;
}

export const WorkoutPlanView: React.FC<WorkoutPlanViewProps> = ({
  workoutPlan,
  preferences,
  biometrics,
  onRefreshWorkoutPlan,
  isLoading,
  onOpenStatePlanner,
  completedExercises,
  onToggleExerciseCompleted,
}) => {
  const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  const todayDayName = dayNames[new Date().getDay()];

  const [selectedDayName, setSelectedDayName] = useState<string>(
    workoutPlan.days.find((d) => d.dayName.toLowerCase() === todayDayName.toLowerCase())?.dayName ||
      workoutPlan.days[0]?.dayName ||
      'Monday'
  );

  // User Condition State for condition-adaptive workouts
  const [activeCondition, setActiveCondition] = useState<UserConditionType>('normal');

  // Rest Stopwatch State
  const [timerSeconds, setTimerSeconds] = useState<number | null>(null);
  const [timerActive, setTimerActive] = useState<boolean>(false);

  const baseDayPlan: DayWorkoutPlan =
    workoutPlan.days.find((d) => d.dayName === selectedDayName) || workoutPlan.days[0];

  // Dynamically adapt current day plan to the user's selected condition
  const currentDayPlan: DayWorkoutPlan = adaptWorkoutForCondition(baseDayPlan, activeCondition);
  const activeConditionInfo = USER_CONDITIONS.find((c) => c.type === activeCondition);

  // Burn and progress calculations
  const totalExercises = currentDayPlan.exercises.length;
  const completedCount = currentDayPlan.exercises.filter((ex) => completedExercises[ex.id]).length;
  const isWorkoutCompleted = totalExercises > 0 && completedCount === totalExercises;

  const currentSessionBurn = currentDayPlan.exercises
    .filter((ex) => completedExercises[ex.id])
    .reduce((sum, ex) => sum + (ex.caloriesBurnEstimate || 45), 0);

  const currentSessionFatGrams = (currentSessionBurn / 7.7).toFixed(1);

  const estimatedBMR = 1750;
  const totalDailyBurn = estimatedBMR + biometrics.activeCaloriesBurned + currentSessionBurn;
  const targetBurnGoal = 2450;
  const burnProgressPercent = Math.min(100, Math.round((totalDailyBurn / targetBurnGoal) * 100));
  const isDailyBurnGoalReached = totalDailyBurn >= targetBurnGoal;

  // Stopwatch timer logic
  const startRestTimer = (seconds: number) => {
    setTimerSeconds(seconds);
    setTimerActive(true);
  };

  useEffect(() => {
    let interval: any = null;
    if (timerActive && timerSeconds !== null && timerSeconds > 0) {
      interval = setInterval(() => {
        setTimerSeconds((prev) => (prev !== null && prev > 0 ? prev - 1 : 0));
      }, 1000);
    } else if (timerSeconds === 0) {
      setTimerActive(false);
    }
    return () => clearInterval(interval);
  }, [timerActive, timerSeconds]);

  return (
    <div id="workout-view-container" className="space-y-4 animate-in fade-in duration-300 pb-16 lg:pb-0">
      {/* Header Bento Card with AI Condition Adaptation */}
      <div className="bento-card bento-ai-gradient border-[#EEDDD3] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-2xl bg-[#3D312A] text-[#FFF1E6] flex items-center justify-center font-bold shrink-0 shadow-xs border border-[#EEDDD3]">
            <Dumbbell className="w-6 h-6 text-[#E88E75]" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl sm:text-2xl font-bold text-[#3D312A]">
                {workoutPlan.title}
              </h1>
              <span className="bento-chip bg-[#FFF1E6] text-[#5C3A2E] border border-[#EEDDD3]">
                Condition-Adaptive
              </span>
            </div>
            <p className="text-xs text-[#7C6E66]">
              {workoutPlan.summary}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <button
            onClick={onOpenStatePlanner}
            className="flex-1 sm:flex-none flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-2xl bg-[#3D312A] hover:bg-[#2E2420] text-[#FFF1E6] text-xs font-bold shadow-xs transition"
          >
            <Sparkles className="w-3.5 h-3.5 text-[#E88E75]" />
            <span>Ask AI To Recalibrate</span>
          </button>

          <button
            onClick={onRefreshWorkoutPlan}
            disabled={isLoading}
            className="flex items-center gap-1.5 px-3 py-2.5 rounded-2xl border border-[#EEDDD3] bg-white hover:bg-[#FFF1E6] text-[#3D312A] text-xs font-semibold shadow-xs transition disabled:opacity-50"
          >
            <RefreshCw className={`w-3.5 h-3.5 text-[#D48B77] ${isLoading ? 'animate-spin' : ''}`} />
            <span className="hidden sm:inline">Regenerate</span>
          </button>
        </div>
      </div>

      {/* User Condition Selector (Soreness, Energy, Time, Recovery) */}
      <div className="bento-card bg-[#FFFDFB] border border-[#EEDDD3] p-3.5">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 mb-2.5">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-[#D48B77] animate-pulse" />
            <span className="text-xs font-bold text-[#3D312A] tracking-tight">
              Select Your Physical Condition Today:
            </span>
          </div>
          <span className="text-[11px] text-[#7C6E66]">
            Plan automatically swaps exercises & modifies volume in real-time
          </span>
        </div>

        {/* Condition Pills */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 no-scrollbar">
          {USER_CONDITIONS.map((cond) => {
            const isSelected = activeCondition === cond.type;
            return (
              <button
                key={cond.type}
                onClick={() => setActiveCondition(cond.type)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all flex items-center gap-1.5 shrink-0 ${
                  isSelected
                    ? 'bg-[#3D312A] text-[#FFF1E6] shadow-xs'
                    : 'bg-[#FFF1E6] text-[#5C3A2E] border border-[#EEDDD3] hover:bg-[#EDDCD2]'
                }`}
              >
                <span>{cond.emoji}</span>
                <span>{cond.label}</span>
              </button>
            );
          })}
        </div>

        {/* Active Condition Explanation Note */}
        {activeCondition !== 'normal' && activeConditionInfo && (
          <div className="mt-2.5 p-2.5 rounded-xl bg-[#FFF1E6] border border-[#EEDDD3] text-xs text-[#5C3A2E] flex items-center gap-2 animate-in fade-in">
            <Info className="w-4 h-4 text-[#D48B77] shrink-0" />
            <span>
              <strong>Condition Adaptation:</strong> {activeConditionInfo.adaptationNote}
            </span>
          </div>
        )}
      </div>

      {/* Daily Total Calorie Burn Deck with Target Checkpoint */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Total Calorie Burn Deck */}
        <div className="bento-card lg:col-span-2 flex flex-col justify-between border-[#EEDDD3]">
          <div className="flex items-start justify-between">
            <div>
              <span className="bento-label">Daily Calorie Burn Deck</span>
              <div className="flex items-baseline gap-2 mt-1">
                <span className="text-3xl font-black font-mono text-[#3D312A]">
                  {totalDailyBurn.toLocaleString()}
                </span>
                <span className="text-xs text-[#7C6E66]">/ {targetBurnGoal} kcal target burn</span>
              </div>
            </div>

            {isDailyBurnGoalReached ? (
              <span className="bento-chip bg-[#FFF1E6] text-[#5C3A2E] font-bold flex items-center gap-1 border border-[#6B9080]">
                <CheckCircle2 className="w-4 h-4 text-[#6B9080]" />
                Target Burn Goal Achieved!
              </span>
            ) : (
              <span className="bento-chip bg-[#FFF1E6] text-[#5C3A2E] border border-[#EEDDD3]">
                {targetBurnGoal - totalDailyBurn} kcal remaining to checkpoint
              </span>
            )}
          </div>

          <div className="my-3">
            <div className="h-3 bg-[#EDDCD2]/60 rounded-full overflow-hidden p-0.5 border border-[#EEDDD3]">
              <div
                className="h-full bg-gradient-to-r from-[#E88E75] via-[#D48B77] to-[#C47C68] rounded-full transition-all duration-500"
                style={{ width: `${burnProgressPercent}%` }}
              />
            </div>
          </div>

          <div className="grid grid-cols-4 gap-2 pt-2 border-t border-[#EEDDD3]/60 text-xs">
            <div>
              <span className="text-[#7C6E66] block text-[10px]">Basal BMR</span>
              <span className="font-mono font-bold text-[#3D312A]">{estimatedBMR} kcal</span>
            </div>
            <div>
              <span className="text-[#7C6E66] block text-[10px]">Redmi Move</span>
              <span className="font-mono font-bold text-[#3D312A]">{biometrics.activeCaloriesBurned} kcal</span>
            </div>
            <div>
              <span className="text-[#7C6E66] block text-[10px]">Session Burn</span>
              <span className="font-mono font-bold text-[#D48B77]">+{currentSessionBurn} kcal</span>
            </div>
            <div>
              <span className="text-[#7C6E66] block text-[10px]">Fat Mass Burned</span>
              <span className="font-mono font-bold text-[#5C3A2E]">~{(totalDailyBurn / 7.7).toFixed(0)}g</span>
            </div>
          </div>
        </div>

        {/* Workout Session Real-time Tracker Summary */}
        <div className="bento-card flex flex-col justify-between border-[#EEDDD3]">
          <div>
            <div className="flex items-center justify-between">
              <span className="bento-label">Session Progress</span>
              <span className="font-mono text-xs font-bold text-[#3D312A]">
                {completedCount}/{totalExercises} Done
              </span>
            </div>

            <div className="mt-2 space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="text-[#7C6E66]">Calories Burned:</span>
                <span className="font-bold font-mono text-[#D48B77] text-sm">
                  {currentSessionBurn} kcal
                </span>
              </div>
              <div className="flex items-center justify-between text-xs">
                <span className="text-[#7C6E66]">Estimated Fat Oxidized:</span>
                <span className="font-bold font-mono text-[#5C3A2E] text-sm">
                  ~{currentSessionFatGrams}g fat
                </span>
              </div>
            </div>
          </div>

          {isWorkoutCompleted ? (
            <div className="p-2.5 rounded-xl bg-[#FFF1E6] border border-[#6B9080] text-[#5C3A2E] text-xs font-bold flex items-center justify-center gap-1.5 mt-3">
              <CheckCircle2 className="w-4 h-4 text-[#6B9080]" />
              <span>Full Routine Completed! 🎉</span>
            </div>
          ) : (
            <div className="text-[11px] text-[#7C6E66] pt-2 border-t border-[#EEDDD3]/60 text-center">
              Check off each exercise below as you perform it!
            </div>
          )}
        </div>
      </div>

      {/* Day Selector Pills */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar">
        {workoutPlan.days.map((day) => {
          const isSelected = day.dayName === selectedDayName;
          const dayCompletedCount = day.exercises.filter((ex) => completedExercises[ex.id]).length;
          const isDayDone = day.exercises.length > 0 && dayCompletedCount === day.exercises.length;

          return (
            <button
              key={day.dayName}
              onClick={() => setSelectedDayName(day.dayName)}
              className={`px-4 py-2 rounded-2xl text-xs font-bold whitespace-nowrap transition flex items-center gap-1.5 ${
                isSelected
                  ? 'bg-[#3D312A] text-[#FFF1E6] shadow-xs'
                  : 'bg-white text-[#7C6E66] border border-[#EEDDD3] hover:border-[#E8D1C5] hover:bg-[#FFF1E6]'
              }`}
            >
              <span>{day.dayName}</span>
              {isDayDone && (
                <Check className={`w-3 h-3 ${isSelected ? 'text-[#E88E75]' : 'text-[#6B9080]'}`} />
              )}
            </button>
          );
        })}
      </div>

      {/* Selected Day Workout Bento Container */}
      <div className="bento-card space-y-4 border-[#EEDDD3]">
        {/* Day Header Info */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-[#EEDDD3]/70">
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-lg sm:text-xl font-bold text-[#3D312A]">
                {currentDayPlan.dayName}: {currentDayPlan.focusArea}
              </h2>
              <span className="bento-chip bg-[#FFF1E6] text-[#5C3A2E] border border-[#EEDDD3]">
                {currentDayPlan.intensityLevel} Intensity
              </span>
            </div>
            <p className="text-xs text-[#7C6E66] mt-0.5">
              Duration: ~{currentDayPlan.workoutDurationMinutes} mins • Warmup: {currentDayPlan.warmupMinutes}m • Cooldown: {currentDayPlan.cooldownMinutes}m
            </p>
          </div>

          {currentDayPlan.recoveryTip && (
            <div className="p-2.5 rounded-xl bg-[#FFF1E6] border border-[#EEDDD3] text-xs text-[#5C3A2E] max-w-md">
              💡 <strong>Coach Tip:</strong> {currentDayPlan.recoveryTip}
            </div>
          )}
        </div>

        {/* Exercises Checklist Cards */}
        <div className="space-y-2.5">
          <div className="flex items-center justify-between text-xs font-bold text-[#7C6E66] uppercase tracking-wider px-1">
            <span>Exercise Routine Checklist</span>
            <span>Est. Burn & Rest</span>
          </div>

          {currentDayPlan.exercises.map((exercise, index) => {
            const isCompleted = !!completedExercises[exercise.id];
            return (
              <div
                key={exercise.id || index}
                onClick={() => onToggleExerciseCompleted(exercise.id)}
                className={`p-3.5 rounded-2xl border transition cursor-pointer flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
                  isCompleted
                    ? 'bg-[#FFF1E6]/90 border-[#D48B77]/60 text-[#3D312A]'
                    : 'bg-[#F0EFEB]/70 border-[#EEDDD3]/70 hover:border-[#E8D1C5] hover:bg-white'
                }`}
              >
                <div className="flex items-start gap-3">
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      onToggleExerciseCompleted(exercise.id);
                    }}
                    className={`w-6 h-6 rounded-lg flex items-center justify-center border transition shrink-0 mt-0.5 ${
                      isCompleted
                        ? 'bg-[#3D312A] border-[#3D312A] text-[#FFF1E6]'
                        : 'bg-white border-[#EEDDD3] hover:border-[#D48B77]'
                    }`}
                  >
                    {isCompleted && <Check className="w-4 h-4 stroke-[3] text-[#E88E75]" />}
                  </button>

                  <div>
                    <div className="flex items-center gap-2">
                      <span className={`text-sm font-bold ${isCompleted ? 'line-through text-[#7C6E66]' : 'text-[#3D312A]'}`}>
                        {exercise.name}
                      </span>
                      <span className="bento-chip text-[10px] bg-[#FFF1E6] text-[#5C3A2E] border border-[#EEDDD3]">
                        {exercise.targetMuscle}
                      </span>
                    </div>

                    <div className="flex items-center gap-3 text-xs text-[#7C6E66] mt-1">
                      <span>Sets: <strong className="text-[#3D312A]">{exercise.sets}</strong></span>
                      <span>Reps: <strong className="text-[#3D312A]">{exercise.reps}</strong></span>
                      <span>Equip: <strong className="text-[#3D312A]">{exercise.equipment}</strong></span>
                    </div>

                    {exercise.notes && (
                      <p className="text-[11px] text-[#7C6E66] mt-1 italic">
                        {exercise.notes}
                      </p>
                    )}
                  </div>
                </div>

                <div className="flex items-center justify-between sm:justify-end gap-3 shrink-0 pt-2 sm:pt-0 border-t sm:border-t-0 border-[#EEDDD3]/50">
                  <div className="text-right">
                    <span className="font-mono font-bold text-xs text-[#D48B77] block">
                      +{exercise.caloriesBurnEstimate} kcal
                    </span>
                    <span className="text-[10px] text-[#7C6E66]">
                      ~{(exercise.caloriesBurnEstimate / 7.7).toFixed(1)}g fat
                    </span>
                  </div>

                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      startRestTimer(exercise.restSeconds || 60);
                    }}
                    className="flex items-center gap-1 px-2.5 py-1.5 rounded-xl bg-white border border-[#EEDDD3] hover:bg-[#FFF1E6] text-[11px] font-semibold text-[#3D312A] shadow-2xs"
                  >
                    <Clock className="w-3.5 h-3.5 text-[#D48B77]" />
                    <span>{exercise.restSeconds}s Rest</span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Floating Rest Stopwatch Modal/Widget */}
      {timerSeconds !== null && (
        <div className="fixed bottom-20 sm:bottom-6 right-4 sm:right-6 z-40 bg-[#3D312A] text-[#FFF1E6] p-4 rounded-3xl shadow-2xl border border-[#EEDDD3] flex items-center gap-4 animate-in slide-in-from-bottom-4">
          <div className="w-10 h-10 rounded-2xl bg-[#E88E75] text-[#3D312A] flex items-center justify-center font-bold">
            <Clock className="w-5 h-5" />
          </div>
          <div>
            <span className="bento-label text-[10px] text-[#EEDDD3] block">Rest Interval</span>
            <span className="text-2xl font-mono font-extrabold text-[#E88E75]">
              {timerSeconds}s
            </span>
          </div>
          <div className="flex items-center gap-1.5 ml-2">
            <button
              onClick={() => setTimerActive(!timerActive)}
              className="p-2 rounded-xl bg-[#2E2420] hover:bg-[#1E1714] text-[#FFF1E6] text-xs font-semibold"
            >
              {timerActive ? 'Pause' : 'Resume'}
            </button>
            <button
              onClick={() => {
                setTimerSeconds(null);
                setTimerActive(false);
              }}
              className="p-2 rounded-xl bg-[#2E2420] hover:bg-[#1E1714] text-[#EEDDD3] text-xs font-semibold"
            >
              Dismiss
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
