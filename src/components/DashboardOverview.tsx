import React from 'react';
import {
  Sparkles,
  Watch,
  Utensils,
  Dumbbell,
  Heart,
  Activity,
  Flame,
  Droplet,
  Footprints,
  ArrowRight,
  Plus,
  CheckCircle2,
  Wind,
  Check,
  Zap,
  Target,
} from 'lucide-react';
import {
  WeeklyDietPlan,
  WeeklyWorkoutPlan,
  DailyBiometricSummary,
  DailyTrackingState,
  UserPreferences,
  AICoachInsight,
} from '../types';
import { GoalProgressCard } from './GoalProgressCard';

interface DashboardOverviewProps {
  preferences: UserPreferences;
  dietPlan: WeeklyDietPlan;
  workoutPlan: WeeklyWorkoutPlan;
  biometrics: DailyBiometricSummary;
  dailyTracking: DailyTrackingState;
  coachInsight: AICoachInsight;
  onNavigateTab: (tab: 'diet' | 'watch' | 'workout' | 'nutrition') => void;
  onOpenAICoach: () => void;
  onOpenBreathing: () => void;
  onOpenStatePlanner: () => void;
  onQuickAddWater: (amountMl: number) => void;
  completedExercises: Record<string, boolean>;
  onToggleExerciseCompleted: (exerciseId: string) => void;
  onUpdateTargetWeight?: (targetKg: number, currentKg?: number, heightCm?: number) => void;
}

export const DashboardOverview: React.FC<DashboardOverviewProps> = ({
  preferences,
  dietPlan,
  workoutPlan,
  biometrics,
  dailyTracking,
  coachInsight,
  onNavigateTab,
  onOpenAICoach,
  onOpenBreathing,
  onOpenStatePlanner,
  onQuickAddWater,
  completedExercises,
  onToggleExerciseCompleted,
  onUpdateTargetWeight,
}) => {
  const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  const todayName = dayNames[new Date().getDay()];

  const todayDiet =
    dietPlan.days.find((d) => d.dayName.toLowerCase() === todayName.toLowerCase()) ||
    dietPlan.days[0];
  const todayWorkout =
    workoutPlan.days.find((w) => w.dayName.toLowerCase() === todayName.toLowerCase()) ||
    workoutPlan.days[0];

  // Calorie calculations
  const targetCals = preferences.targetCalories || 2050;
  const consumedCals = dailyTracking.totalCalories;
  const caloriePercent = Math.min(100, Math.round((consumedCals / targetCals) * 100));
  const calsLeft = Math.max(0, targetCals - consumedCals);
  const isCalorieGoalMet = consumedCals > 0 && Math.abs(consumedCals - targetCals) <= 150;

  // Hydration calculations
  const targetWater = preferences.targetWaterMl || 2800;
  const currentWater = dailyTracking.totalWaterMl;
  const waterLiters = (currentWater / 1000).toFixed(1);
  const targetWaterLiters = (targetWater / 1000).toFixed(1);
  const waterPercent = Math.min(100, Math.round((currentWater / targetWater) * 100));
  const isWaterGoalReached = currentWater >= targetWater;
  const totalWaterDots = 6;
  const filledWaterDots = Math.min(
    totalWaterDots,
    Math.round((currentWater / targetWater) * totalWaterDots)
  );

  // Workout Completed Calories & Fat Mass Burned
  const completedWorkoutBurn = todayWorkout.exercises
    .filter((ex) => completedExercises[ex.id])
    .reduce((sum, ex) => sum + (ex.caloriesBurnEstimate || 45), 0);

  const completedWorkoutCount = todayWorkout.exercises.filter((ex) => completedExercises[ex.id]).length;
  const isAllWorkoutDone =
    todayWorkout.exercises.length > 0 && completedWorkoutCount === todayWorkout.exercises.length;

  // Total daily burn calculation: BMR + Redmi Active Burn + Completed Workout Burn
  const estimatedBMR = 1750;
  const totalCalorieBurn = estimatedBMR + biometrics.activeCaloriesBurned + completedWorkoutBurn;
  const targetDailyBurnGoal = 2450; // Checkpoint burn goal
  const burnPercent = Math.min(100, Math.round((totalCalorieBurn / targetDailyBurnGoal) * 100));
  const isBurnGoalReached = totalCalorieBurn >= targetDailyBurnGoal;

  // Fat oxidation estimate (1g of body fat ~ 7.7 kcal deficit/burn)
  const estimatedFatGramsBurned = Math.round(totalCalorieBurn / 7.7);

  // Mobility
  const stepK = (biometrics.totalSteps / 1000).toFixed(1);

  // Macro split percentages for today's diet
  const totalMacros = todayDiet.totalProteinG + todayDiet.totalCarbsG + todayDiet.totalFatG || 1;
  const proteinPct = Math.round((todayDiet.totalProteinG / totalMacros) * 100);
  const carbsPct = Math.round((todayDiet.totalCarbsG / totalMacros) * 100);
  const fatPct = Math.max(0, 100 - proteinPct - carbsPct);

  return (
    <div id="dashboard-bento-container" className="space-y-4 animate-in fade-in duration-300 pb-16 lg:pb-0">
      {/* 1. Target Kilogram Goal & Estimated Time Journey Projection Card */}
      <GoalProgressCard
        preferences={preferences}
        onUpdateTargetWeight={onUpdateTargetWeight}
        dailyIntakeCalories={todayDiet.totalCalories || targetCals}
        dailyBurnCalories={totalCalorieBurn}
      />

      {/* Dynamic AI State & Condition Interactive Trigger Banner */}
      <div
        onClick={onOpenStatePlanner}
        className="bento-card bento-ai-gradient border-[#EEDDD3] cursor-pointer flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 p-4 hover:border-[#E8D1C5]"
      >
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-[#3D312A] text-[#FFF1E6] flex items-center justify-center shrink-0 shadow-xs border border-[#EEDDD3]">
            <Sparkles className="w-5 h-5 text-[#E88E75]" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-bold text-[#3D312A] text-sm sm:text-base">
                How is your body feeling right now?
              </span>
              <span className="bento-chip text-[10px]">AI State Planner</span>
            </div>
            <p className="text-xs text-[#7C6E66]">
              Tell AI your soreness, energy, cravings, or time limits to instantly adapt your diet & workouts.
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onOpenStatePlanner();
          }}
          className="w-full sm:w-auto flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-2xl bg-[#3D312A] text-[#FFF1E6] text-xs font-bold shadow-xs hover:bg-[#2E2420] transition shrink-0"
        >
          <Zap className="w-3.5 h-3.5 text-[#E88E75]" />
          <span>Ask AI / Adapt Plan</span>
        </button>
      </div>

      {/* 4-Column Bento Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Bento Card 1 (Span 2 col, Span 2 row): AI Generated Diet Protocol */}
        <div
          id="bento-card-diet-plan"
          onClick={() => onNavigateTab('diet')}
          className="bento-card bento-ai-gradient sm:col-span-2 lg:col-span-2 lg:row-span-2 flex flex-col justify-between cursor-pointer border-[#EEDDD3] hover:border-[#E8D1C5]"
        >
          <div>
            <div className="flex justify-between items-start">
              <div>
                <span className="bento-chip bg-[#FFF1E6] text-[#5C3A2E] border border-[#EEDDD3]">
                  AI Generated Protocol
                </span>
                <h2 className="text-xl sm:text-2xl font-bold text-[#3D312A] mt-3">
                  {dietPlan.title}
                </h2>
                <p className="text-xs sm:text-sm text-[#7C6E66] mt-1 line-clamp-2">
                  Based on your instruction: "{preferences.customInstructions || 'High protein, clean ingredients, nutrient-dense.'}"
                </p>
              </div>
            </div>

            {/* Meal Items List */}
            <div className="mt-4 space-y-2">
              {/* Breakfast */}
              <div className="flex items-center gap-3 p-2.5 rounded-2xl bg-white/85 backdrop-blur-xs border border-[#EEDDD3]/70 hover:bg-white transition">
                <div className="w-8 h-8 rounded-xl bg-[#E88E75] text-white font-bold flex items-center justify-center text-xs shrink-0 shadow-xs">
                  B
                </div>
                <div className="min-w-0 flex-1">
                  <div className="text-xs font-bold text-[#3D312A] flex items-center justify-between">
                    <span>Breakfast</span>
                    <span className="font-mono text-[#7C6E66] font-normal">{todayDiet.breakfast.calories} kcal</span>
                  </div>
                  <div className="text-xs text-[#7C6E66] truncate">{todayDiet.breakfast.name}</div>
                </div>
              </div>

              {/* Lunch */}
              <div className="flex items-center gap-3 p-2.5 rounded-2xl bg-white/85 backdrop-blur-xs border border-[#EEDDD3]/70 hover:bg-white transition">
                <div className="w-8 h-8 rounded-xl bg-[#D48B77] text-white font-bold flex items-center justify-center text-xs shrink-0 shadow-xs">
                  L
                </div>
                <div className="min-w-0 flex-1">
                  <div className="text-xs font-bold text-[#3D312A] flex items-center justify-between">
                    <span>Lunch</span>
                    <span className="font-mono text-[#7C6E66] font-normal">{todayDiet.lunch.calories} kcal</span>
                  </div>
                  <div className="text-xs text-[#7C6E66] truncate">{todayDiet.lunch.name}</div>
                </div>
              </div>

              {/* Dinner */}
              <div className="flex items-center gap-3 p-2.5 rounded-2xl bg-white/85 backdrop-blur-xs border border-[#EEDDD3]/70 hover:bg-white transition">
                <div className="w-8 h-8 rounded-xl bg-[#6B9080] text-white font-bold flex items-center justify-center text-xs shrink-0 shadow-xs">
                  D
                </div>
                <div className="min-w-0 flex-1">
                  <div className="text-xs font-bold text-[#3D312A] flex items-center justify-between">
                    <span>Dinner</span>
                    <span className="font-mono text-[#7C6E66] font-normal">{todayDiet.dinner.calories} kcal</span>
                  </div>
                  <div className="text-xs text-[#7C6E66] truncate">{todayDiet.dinner.name}</div>
                </div>
              </div>

              {/* Snack */}
              {todayDiet.snack && (
                <div className="flex items-center gap-3 p-2.5 rounded-2xl bg-white/85 backdrop-blur-xs border border-[#EEDDD3]/70 hover:bg-white transition">
                  <div className="w-8 h-8 rounded-xl bg-[#C47C68] text-white font-bold flex items-center justify-center text-xs shrink-0 shadow-xs">
                    S
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="text-xs font-bold text-[#3D312A] flex items-center justify-between">
                      <span>Snack</span>
                      <span className="font-mono text-[#7C6E66] font-normal">{todayDiet.snack.calories} kcal</span>
                    </div>
                    <div className="text-xs text-[#7C6E66] truncate">{todayDiet.snack.name}</div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Macro Split Footer Box */}
          <div className="bg-white rounded-2xl p-4 mt-4 border border-[#EEDDD3] shadow-xs">
            <div className="flex justify-between items-center mb-2">
              <span className="bento-label text-[10px]">Macro Split Breakdown</span>
              <span className="text-xs font-bold text-[#3D312A] font-mono">
                {todayDiet.totalCalories} kcal
              </span>
            </div>
            <div className="flex gap-1 h-2 rounded-full overflow-hidden bg-[#EDDCD2]/50">
              <div className="bg-[#D48B77] transition-all" style={{ width: `${proteinPct}%` }} title={`Protein ${proteinPct}%`} />
              <div className="bg-[#E88E75] transition-all" style={{ width: `${carbsPct}%` }} title={`Carbs ${carbsPct}%`} />
              <div className="bg-[#6B9080] transition-all" style={{ width: `${fatPct}%` }} title={`Fats ${fatPct}%`} />
            </div>
            <div className="flex justify-between text-[11px] font-semibold text-[#7C6E66] mt-2.5">
              <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-[#D48B77]" /> {proteinPct}% ({todayDiet.totalProteinG}g) Protein</span>
              <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-[#E88E75]" /> {carbsPct}% ({todayDiet.totalCarbsG}g) Carbs</span>
              <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-[#6B9080]" /> {fatPct}% ({todayDiet.totalFatG}g) Fats</span>
            </div>
          </div>
        </div>

        {/* Bento Card 2 (Span 1 col): Heart Rate */}
        <div
          id="bento-card-heart-rate"
          onClick={() => onNavigateTab('watch')}
          className="bento-card flex flex-col justify-between cursor-pointer hover:border-[#E8D1C5]"
        >
          <div className="bento-label">Heart Rate</div>
          <div className="my-2">
            <div className="flex items-baseline gap-1">
              <span className="text-3xl font-extrabold text-[#3D312A] font-mono">
                {biometrics.restingHeartRate}
              </span>
              <span className="text-xs font-semibold text-[#7C6E66]">BPM</span>
            </div>
            <div className="text-xs font-semibold text-[#6B9080] mt-1 flex items-center gap-1">
              <Heart className="w-3 h-3 text-[#D48B77] fill-[#D48B77]" />
              Resting: {biometrics.minHeartRate || 62} • Normal
            </div>
          </div>
          <div className="text-[11px] text-[#7C6E66] pt-2 border-t border-[#EEDDD3]/60 flex justify-between">
            <span>Peak: {biometrics.maxHeartRate} bpm</span>
            <span className="text-[#D48B77] font-semibold">Live PPG</span>
          </div>
        </div>

        {/* Bento Card 3 (Span 1 col): Stress Level */}
        <div
          id="bento-card-stress-level"
          onClick={() => onNavigateTab('watch')}
          className="bento-card flex flex-col justify-between cursor-pointer hover:border-[#E8D1C5]"
        >
          <div className="bento-label">Stress Level</div>
          <div className="my-2">
            <div className="flex items-baseline gap-1">
              <span className="text-3xl font-extrabold text-[#3D312A] font-mono">
                {biometrics.avgStressScore}
              </span>
              <span className="text-xs font-semibold text-[#7C6E66]">/ 100</span>
            </div>
            <div className="text-xs font-semibold text-[#D48B77] mt-1 flex items-center justify-between">
              <span>{biometrics.avgStressScore < 30 ? 'Relaxed' : biometrics.avgStressScore < 60 ? 'Moderate' : 'High'}</span>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onOpenBreathing();
                }}
                className="text-[10px] text-[#5C3A2E] bg-[#FFF1E6] px-2 py-0.5 rounded-full border border-[#EEDDD3] font-bold flex items-center gap-0.5 hover:bg-[#EDDCD2]"
              >
                <Wind className="w-3 h-3 text-[#D48B77]" /> Breathe
              </button>
            </div>
          </div>
          <div className="text-[11px] text-[#7C6E66] pt-2 border-t border-[#EEDDD3]/60 flex justify-between">
            <span>Peak: {biometrics.stressPeakTime}</span>
            <span className="text-[#6B9080] font-semibold">HRV Score</span>
          </div>
        </div>

        {/* Bento Card 4 (Span 2 col): Today's Workout Routine with Interactive Checklist & Fat Burn */}
        <div
          id="bento-card-workout-plan"
          className="bento-card sm:col-span-2 lg:col-span-2 flex flex-col justify-between hover:border-[#E8D1C5]"
        >
          <div>
            <div className="flex items-center justify-between">
              <div className="bento-label">Today's Workout Routine</div>
              <span className="bento-chip bg-[#FFF1E6] text-[#5C3A2E]">
                {completedWorkoutCount}/{todayWorkout.exercises.length} Done
              </span>
            </div>
            <h3 className="text-base font-bold text-[#3D312A] mt-1 mb-2">
              {todayWorkout.focusArea}
            </h3>

            {/* Checklist items */}
            <div className="space-y-1.5">
              {todayWorkout.exercises.slice(0, 3).map((ex, idx) => {
                const isDone = !!completedExercises[ex.id];
                return (
                  <div
                    key={ex.id || idx}
                    onClick={() => onToggleExerciseCompleted(ex.id)}
                    className={`flex items-center gap-2.5 p-2 rounded-xl border text-xs cursor-pointer transition ${
                      isDone
                        ? 'bg-[#FFF1E6]/90 border-[#D48B77]/60 text-[#3D312A]'
                        : 'bg-white border-[#EEDDD3]/70 hover:border-[#E8D1C5]'
                    }`}
                  >
                    <button
                      type="button"
                      className={`w-5 h-5 rounded-md flex items-center justify-center border transition ${
                        isDone ? 'bg-[#3D312A] border-[#3D312A] text-[#FFF1E6]' : 'border-[#EEDDD3] bg-white'
                      }`}
                    >
                      {isDone && <Check className="w-3.5 h-3.5 stroke-[3] text-[#E88E75]" />}
                    </button>
                    <span className={`flex-1 font-semibold truncate ${isDone ? 'line-through text-[#7C6E66]' : 'text-[#3D312A]'}`}>
                      {ex.name}
                    </span>
                    <span className="font-mono text-[11px] text-[#7C6E66]">
                      {ex.sets}×{ex.reps}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="pt-2 text-xs flex justify-between items-center border-t border-[#EEDDD3]/60 mt-3">
            <span className="text-[#7C6E66]">
              Workout Burn: <strong className="text-[#3D312A] font-mono">{completedWorkoutBurn} kcal</strong> (~{Math.round(completedWorkoutBurn / 7.7)}g fat)
            </span>
            <button
              onClick={() => onNavigateTab('workout')}
              className="text-[#D48B77] font-bold hover:underline flex items-center gap-1 text-xs"
            >
              Full Workout <ArrowRight className="w-3 h-3" />
            </button>
          </div>
        </div>

        {/* Bento Card 5 (Span 2 col): Daily Calorie Burn Deck with Goal Checkpoint */}
        <div
          id="bento-card-burn-deck"
          onClick={() => onNavigateTab('watch')}
          className="bento-card sm:col-span-2 lg:col-span-2 flex flex-col justify-between cursor-pointer hover:border-[#E8D1C5]"
        >
          <div className="flex justify-between items-start">
            <div>
              <span className="bento-label">Daily Calorie Burn Deck</span>
              <div className="flex items-baseline gap-2 mt-1">
                <span className="text-2xl font-black font-mono text-[#3D312A]">
                  {totalCalorieBurn.toLocaleString()}
                </span>
                <span className="text-xs text-[#7C6E66]">/ {targetDailyBurnGoal} kcal target burn</span>
              </div>
            </div>

            {isBurnGoalReached ? (
              <span className="bento-chip bg-[#FFF1E6] text-[#5C3A2E] font-bold flex items-center gap-1 border border-[#6B9080]">
                <CheckCircle2 className="w-3.5 h-3.5 text-[#6B9080]" />
                Burn Goal Met!
              </span>
            ) : (
              <span className="bento-chip bg-[#FFF1E6] text-[#5C3A2E]">
                {targetDailyBurnGoal - totalCalorieBurn} kcal to goal
              </span>
            )}
          </div>

          <div className="my-2.5">
            <div className="h-2.5 bg-[#EDDCD2]/60 rounded-full overflow-hidden p-0.5 border border-[#EEDDD3]/80">
              <div
                className="h-full bg-gradient-to-r from-[#E88E75] to-[#D48B77] rounded-full transition-all duration-500"
                style={{ width: `${burnPercent}%` }}
              />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-2 pt-1 text-[11px] text-[#7C6E66] border-t border-[#EEDDD3]/60">
            <div>
              <span>BMR:</span> <strong className="text-[#3D312A] font-mono">{estimatedBMR}</strong>
            </div>
            <div>
              <span>Watch Move:</span> <strong className="text-[#3D312A] font-mono">{biometrics.activeCaloriesBurned}</strong>
            </div>
            <div>
              <span>Workouts:</span> <strong className="text-[#3D312A] font-mono">+{completedWorkoutBurn}</strong>
            </div>
          </div>
        </div>

        {/* Bento Card 6 (Span 1 col): Calorie Intake Tracker with Goal Checkpoint */}
        <div
          id="bento-card-calorie-tracker"
          onClick={() => onNavigateTab('nutrition')}
          className="bento-card flex flex-col justify-between cursor-pointer hover:border-[#E8D1C5]"
        >
          <div>
            <div className="flex justify-between items-center">
              <span className="bento-label">Calories Eaten</span>
              {isCalorieGoalMet && (
                <span className="text-[10px] text-[#5C3A2E] bg-[#FFF1E6] px-1.5 py-0.5 rounded-full font-bold border border-[#EEDDD3]">
                  ✓ On Target
                </span>
              )}
            </div>
            <div className="text-2xl font-extrabold text-[#3D312A] font-mono mt-1">
              {consumedCals}
            </div>
            <div className="text-xs text-[#7C6E66]">Target: {targetCals} kcal</div>
          </div>

          <div className="my-2">
            <div className="h-2 bg-[#EDDCD2]/60 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-[#E88E75] to-[#D48B77] rounded-full transition-all"
                style={{ width: `${caloriePercent}%` }}
              />
            </div>
          </div>

          <div className="text-[11px] text-[#7C6E66] pt-1 flex justify-between">
            <span>Remaining: <strong className="text-[#3D312A] font-mono">{calsLeft} kcal</strong></span>
          </div>
        </div>

        {/* Bento Card 7 (Span 1 col): Water Intake Tracker with Goal Checklist */}
        <div
          id="bento-card-water-intake"
          onClick={() => onNavigateTab('nutrition')}
          className="bento-card flex flex-col justify-between cursor-pointer hover:border-[#E8D1C5]"
        >
          <div>
            <div className="flex justify-between items-center">
              <span className="bento-label">Hydration</span>
              {isWaterGoalReached ? (
                <span className="text-[10px] text-[#5C3A2E] bg-[#FFF1E6] px-2 py-0.5 rounded-full font-bold flex items-center gap-0.5 border border-[#EEDDD3]">
                  <Check className="w-3 h-3 text-[#6B9080]" /> Goal Met!
                </span>
              ) : (
                <span className="text-[10px] text-[#7C6E66]">{waterPercent}%</span>
              )}
            </div>
            <div className="text-2xl font-extrabold text-[#3D312A] font-mono mt-1">
              {waterLiters}L
            </div>
            <div className="text-xs text-[#7C6E66]">Goal: {targetWaterLiters}L</div>
          </div>

          {/* Dots Indicator */}
          <div className="flex items-center gap-1.5 my-2">
            {Array.from({ length: totalWaterDots }).map((_, i) => (
              <div
                key={i}
                className={`w-3 h-3 rounded-full transition-all ${
                  i < filledWaterDots ? 'bg-[#D48B77]' : 'bg-[#EDDCD2]'
                }`}
              />
            ))}
          </div>

          <div className="pt-1 flex justify-between items-center text-[11px]">
            <button
              onClick={(e) => {
                e.stopPropagation();
                onQuickAddWater(250);
              }}
              className="text-[#D48B77] font-bold hover:underline"
            >
              +250ml Glass
            </button>
            <span className="text-[#7C6E66] font-mono">{currentWater} ml</span>
          </div>
        </div>
      </div>
    </div>
  );
};
