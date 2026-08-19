import React, { useState } from 'react';
import {
  Sparkles,
  Utensils,
  Clock,
  Flame,
  Check,
  Plus,
  ShoppingCart,
  ChevronDown,
  ChevronUp,
  Sliders,
  CheckCircle2,
  PieChart,
  Target,
  ArrowRight,
} from 'lucide-react';
import { WeeklyDietPlan, MealItem, UserPreferences, FoodLogEntry, DailyTrackingState } from '../types';

interface DietPlanViewProps {
  dietPlan: WeeklyDietPlan;
  preferences: UserPreferences;
  dailyTracking?: DailyTrackingState;
  onRegeneratePlan: () => void;
  isRegenerating: boolean;
  onOpenSettings: () => void;
  onOpenStatePlanner: () => void;
  onLogMealToTracker: (meal: MealItem, mealType: FoodLogEntry['mealType']) => void;
}

export const DietPlanView: React.FC<DietPlanViewProps> = ({
  dietPlan,
  preferences,
  dailyTracking,
  onRegeneratePlan,
  isRegenerating,
  onOpenSettings,
  onOpenStatePlanner,
  onLogMealToTracker,
}) => {
  const dayNames = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
  const todayIdx = (new Date().getDay() + 6) % 7; // 0 for Monday
  const [selectedDayIdx, setSelectedDayIdx] = useState<number>(todayIdx);
  const [expandedRecipeId, setExpandedRecipeId] = useState<string | null>(null);
  const [showGroceryList, setShowGroceryList] = useState(false);
  const [checkedGroceryItems, setCheckedGroceryItems] = useState<Record<string, boolean>>({});
  const [loggedMealIds, setLoggedMealIds] = useState<Record<string, boolean>>({});

  const activeDay = dietPlan.days[selectedDayIdx] || dietPlan.days[0];

  const handleToggleRecipe = (mealId: string) => {
    setExpandedRecipeId(expandedRecipeId === mealId ? null : mealId);
  };

  const handleToggleGroceryItem = (itemKey: string) => {
    setCheckedGroceryItems((prev) => ({
      ...prev,
      [itemKey]: !prev[itemKey],
    }));
  };

  const handleLogMeal = (meal: MealItem, mealType: FoodLogEntry['mealType']) => {
    onLogMealToTracker(meal, mealType);
    setLoggedMealIds((prev) => ({ ...prev, [meal.id]: true }));
  };

  const targetDailyCals = preferences.targetCalories || 2050;
  const targetProtein = preferences.targetProteinG || 145;
  const targetCarbs = preferences.targetCarbsG || 185;
  const targetFat = preferences.targetFatG || 60;

  const planCals = activeDay.totalCalories;
  const consumedCals = dailyTracking?.totalCalories || 0;
  const calsRemaining = Math.max(0, targetDailyCals - consumedCals);
  const caloriePercent = Math.min(100, Math.round((consumedCals / targetDailyCals) * 100));
  const isGoalReached = consumedCals > 0 && Math.abs(consumedCals - targetDailyCals) <= 150;

  // Calorie percentages by meal for the active day
  const bCals = activeDay.breakfast.calories;
  const lCals = activeDay.lunch.calories;
  const dCals = activeDay.dinner.calories;
  const sCals = activeDay.snack?.calories || 0;
  const sumMealCals = bCals + lCals + dCals + sCals || 1;

  const bPct = Math.round((bCals / sumMealCals) * 100);
  const lPct = Math.round((lCals / sumMealCals) * 100);
  const dPct = Math.round((dCals / sumMealCals) * 100);
  const sPct = Math.max(0, 100 - bPct - lPct - dPct);

  // Macro percentages for the active day
  const totalMacros = activeDay.totalProteinG + activeDay.totalCarbsG + activeDay.totalFatG || 1;
  const proteinPct = Math.round((activeDay.totalProteinG / totalMacros) * 100);
  const carbsPct = Math.round((activeDay.totalCarbsG / totalMacros) * 100);
  const fatPct = Math.max(0, 100 - proteinPct - carbsPct);

  const renderMealBentoCard = (
    meal: MealItem,
    mealType: 'breakfast' | 'lunch' | 'dinner' | 'snack',
    avatarBg: string,
    avatarText: string,
    badgeLabel: string
  ) => {
    const isExpanded = expandedRecipeId === meal.id;
    const isLogged = loggedMealIds[meal.id];

    return (
      <div
        key={meal.id || meal.name}
        id={`meal-card-${meal.id}`}
        className="bento-card bg-[#FFFDFB] border border-[#EEDDD3] flex flex-col justify-between space-y-3 shadow-xs"
      >
        <div>
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2.5">
              <div className={`w-8 h-8 rounded-xl ${avatarBg} text-white font-bold flex items-center justify-center text-xs shadow-xs`}>
                {avatarText}
              </div>
              <div>
                <span className="bento-label text-[10px] block text-[#7C6E66]">{badgeLabel}</span>
                <span className="text-xs text-[#7C6E66] flex items-center gap-1">
                  <Clock className="w-3 h-3 text-[#D48B77]" /> {meal.prepTimeMinutes}m prep
                </span>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-sm font-black text-[#3D312A] font-mono">
                {meal.calories} <span className="text-[11px] font-normal text-[#7C6E66]">kcal</span>
              </span>
              <button
                id={`log-meal-btn-${meal.id}`}
                onClick={() => handleLogMeal(meal, mealType)}
                disabled={isLogged}
                className={`flex items-center gap-1 px-2.5 py-1 rounded-xl text-xs font-semibold transition ${
                  isLogged
                    ? 'bg-[#FFF1E6] text-[#5C3A2E] border border-[#6B9080] cursor-default'
                    : 'bg-[#3D312A] hover:bg-[#2E2420] text-[#FFF1E6] shadow-xs'
                }`}
              >
                {isLogged ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-[#6B9080]" />
                    <span>Logged</span>
                  </>
                ) : (
                  <>
                    <Plus className="w-3.5 h-3.5 text-[#E88E75]" />
                    <span>Log to Daily</span>
                  </>
                )}
              </button>
            </div>
          </div>

          <div className="mt-3">
            <h3 className="text-base font-bold text-[#3D312A] leading-snug">{meal.name}</h3>
            <p className="text-xs text-[#7C6E66] mt-1 leading-relaxed">{meal.description}</p>
          </div>

          {/* Tags */}
          {meal.tags && meal.tags.length > 0 && (
            <div className="flex flex-wrap gap-1 mt-2">
              {meal.tags.map((tag) => (
                <span key={tag} className="text-[10px] font-medium bg-[#FFF1E6] text-[#5C3A2E] border border-[#EEDDD3] px-2 py-0.5 rounded-md">
                  #{tag}
                </span>
              ))}
            </div>
          )}
        </div>

        {/* Macro Pill Bar */}
        <div className="grid grid-cols-3 gap-2 py-2 px-3 rounded-2xl bg-[#F0EFEB]/80 border border-[#EEDDD3]/70 text-center text-xs">
          <div>
            <span className="bento-label text-[9px] block text-[#7C6E66]">Protein</span>
            <span className="font-bold text-[#D48B77] font-mono">{meal.proteinG}g</span>
          </div>
          <div>
            <span className="bento-label text-[9px] block text-[#7C6E66]">Carbs</span>
            <span className="font-bold text-[#3D312A] font-mono">{meal.carbsG}g</span>
          </div>
          <div>
            <span className="bento-label text-[9px] block text-[#7C6E66]">Fat</span>
            <span className="font-bold text-[#6B9080] font-mono">{meal.fatG}g</span>
          </div>
        </div>

        {/* Recipe & Ingredients Toggle */}
        <button
          id={`toggle-recipe-btn-${meal.id}`}
          onClick={() => handleToggleRecipe(meal.id)}
          className="w-full pt-2 flex items-center justify-between text-xs text-[#7C6E66] hover:text-[#3D312A] font-semibold border-t border-[#EEDDD3]/60"
        >
          <span>Ingredients & Quick Steps</span>
          {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
        </button>

        {isExpanded && (
          <div className="pt-2 space-y-3 text-xs bg-[#FFF1E6]/70 p-3 rounded-2xl border border-[#EEDDD3] max-h-48 overflow-y-auto bento-scrollbar pr-1">
            <div>
              <span className="font-bold text-[#3D312A] block mb-1">Ingredients:</span>
              <ul className="list-disc list-inside space-y-0.5 text-[#7C6E66]">
                {meal.ingredients.map((ing, i) => (
                  <li key={i}>{ing}</li>
                ))}
              </ul>
            </div>
            {meal.recipeInstructions && meal.recipeInstructions.length > 0 && (
              <div>
                <span className="font-bold text-[#3D312A] block mb-1">Preparation:</span>
                <ol className="list-decimal list-inside space-y-1 text-[#7C6E66]">
                  {meal.recipeInstructions.map((step, idx) => (
                    <li key={idx} className="leading-relaxed">{step}</li>
                  ))}
                </ol>
              </div>
            )}
          </div>
        )}
      </div>
    );
  };

  return (
    <div id="diet-plan-view" className="space-y-4 animate-in fade-in duration-300 pb-16 lg:pb-0">
      {/* Top Bento Header Card with Integrated Responsive Action Toolbar */}
      <div className="bento-card bg-[#FFFDFB] border border-[#EEDDD3] space-y-4 shadow-xs">
        <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4">
          <div className="space-y-2 max-w-2xl">
            <div className="flex flex-wrap items-center gap-2">
              <span className="bento-chip bg-[#FFF1E6] text-[#5C3A2E] border border-[#EEDDD3]">
                Weekly AI Diet Protocol
              </span>
              <span className="text-xs text-[#7C6E66] font-mono">
                Target: ~{preferences.targetCalories} kcal • {preferences.targetProteinG}g Protein
              </span>
              <span className="text-xs bg-[#FFF1E6] text-[#5C3A2E] px-2 py-0.5 rounded-md font-medium border border-[#EEDDD3]">
                {preferences.dietType ? preferences.dietType.replace('_', ' ').toUpperCase() : 'HIGH PROTEIN'}
              </span>
            </div>

            <h1 className="text-xl sm:text-2xl font-extrabold text-[#3D312A] tracking-tight">
              {dietPlan.title}
            </h1>

            <p className="text-xs sm:text-sm text-[#7C6E66] leading-relaxed">
              {dietPlan.overviewSummary}
            </p>

            {/* Active Custom Instructions Callout */}
            {preferences.customInstructions && (
              <div className="p-2.5 rounded-xl bg-[#FFF1E6]/90 border border-[#EEDDD3] flex items-center justify-between gap-2 text-xs">
                <div className="flex items-center gap-2 min-w-0">
                  <CheckCircle2 className="w-4 h-4 text-[#6B9080] shrink-0" />
                  <p className="text-[#3D312A] truncate">
                    <span className="font-bold">Active Custom Rule:</span> "{preferences.customInstructions}"
                  </p>
                </div>
                <button
                  onClick={onOpenSettings}
                  className="text-[11px] text-[#D48B77] hover:underline font-semibold shrink-0"
                >
                  Edit
                </button>
              </div>
            )}
          </div>

          {/* Dedicated Responsive Button Deck */}
          <div className="grid grid-cols-2 sm:flex sm:flex-wrap items-center gap-2 shrink-0">
            <button
              id="diet-ask-ai-state-btn"
              onClick={onOpenStatePlanner}
              className="px-3.5 py-2.5 rounded-xl text-xs font-bold bg-[#3D312A] hover:bg-[#2E2420] text-[#FFF1E6] shadow-xs transition flex items-center justify-center gap-1.5 whitespace-nowrap"
            >
              <Sparkles className="w-3.5 h-3.5 text-[#E88E75]" />
              <span>Ask AI / State</span>
            </button>

            <button
              id="toggle-grocery-list-btn"
              onClick={() => setShowGroceryList(!showGroceryList)}
              className={`px-3.5 py-2.5 rounded-xl text-xs font-semibold border transition flex items-center justify-center gap-1.5 whitespace-nowrap ${
                showGroceryList
                  ? 'bg-[#3D312A] text-[#FFF1E6] border-[#3D312A]'
                  : 'bg-white text-[#3D312A] border-[#EEDDD3] hover:bg-[#FFF1E6]'
              }`}
            >
              <ShoppingCart className="w-3.5 h-3.5 text-[#D48B77]" />
              <span>{showGroceryList ? 'Hide Groceries' : 'Groceries'}</span>
            </button>

            <button
              id="diet-plan-settings-btn"
              onClick={onOpenSettings}
              className="px-3.5 py-2.5 rounded-xl text-xs font-semibold bg-white text-[#3D312A] border border-[#EEDDD3] hover:bg-[#FFF1E6] transition shadow-xs flex items-center justify-center gap-1.5 whitespace-nowrap"
            >
              <Sliders className="w-3.5 h-3.5 text-[#7C6E66]" />
              <span>Custom Settings</span>
            </button>

            <button
              id="regenerate-diet-plan-btn"
              onClick={onRegeneratePlan}
              disabled={isRegenerating}
              className="px-3.5 py-2.5 rounded-xl text-xs font-bold bg-[#D48B77] hover:bg-[#C47C68] text-white shadow-xs transition disabled:opacity-50 flex items-center justify-center gap-1.5 whitespace-nowrap"
            >
              <Sparkles className="w-3.5 h-3.5 text-white" />
              <span>{isRegenerating ? 'Generating...' : 'AI Regenerate Plan'}</span>
            </button>
          </div>
        </div>
      </div>

      {/* ========================================================= */}
      {/* CALORIES & NUTRITION DECK (Directly under AI Diet Plan) */}
      {/* ========================================================= */}
      <div id="diet-tab-calories-deck" className="bento-card bg-[#FFFDFB] border border-[#EEDDD3] space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-[#EEDDD3]/70">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-[#3D312A] text-[#FFF1E6] flex items-center justify-center shadow-xs">
              <Flame className="w-5 h-5 text-[#E88E75]" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-bold text-[#3D312A]">Calories & Macro Distribution</h2>
                <span className="bento-chip bg-[#FFF1E6] text-[#5C3A2E] text-[10px] border border-[#EEDDD3]">
                  {activeDay.dayName} Targets
                </span>
              </div>
              <p className="text-xs text-[#7C6E66]">
                Calibrated against your Redmi Watch expenditure & nutrition profile
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {isGoalReached ? (
              <span className="px-3 py-1.5 rounded-xl bg-[#FFF1E6] text-[#5C3A2E] text-xs font-bold flex items-center gap-1.5 shadow-xs border border-[#6B9080]">
                <CheckCircle2 className="w-4 h-4 text-[#6B9080]" />
                <span>Goal Met ({consumedCals} kcal)</span>
              </span>
            ) : (
              <span className="px-3 py-1.5 rounded-xl bg-white text-[#3D312A] text-xs font-semibold border border-[#EEDDD3] shadow-xs">
                Eaten: <strong className="font-mono text-[#D48B77]">{consumedCals}</strong> / {targetDailyCals} kcal
              </span>
            )}
          </div>
        </div>

        {/* 4 Calorie Metrics Bento Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {/* Target Calories */}
          <div className="p-3.5 rounded-2xl bg-white border border-[#EEDDD3] shadow-xs flex flex-col justify-between">
            <div className="bento-label text-[10px] flex items-center gap-1 text-[#7C6E66]">
              <Target className="w-3 h-3 text-[#D48B77]" /> Target Calories
            </div>
            <div className="my-1.5">
              <span className="text-2xl font-black text-[#3D312A] font-mono">{targetDailyCals}</span>
              <span className="text-xs text-[#7C6E66] ml-1">kcal</span>
            </div>
            <div className="text-[11px] text-[#7C6E66]">Daily baseline</div>
          </div>

          {/* Planned Day Calories */}
          <div className="p-3.5 rounded-2xl bg-white border border-[#EEDDD3] shadow-xs flex flex-col justify-between">
            <div className="bento-label text-[10px] flex items-center gap-1 text-[#7C6E66]">
              <Utensils className="w-3 h-3 text-[#D48B77]" /> Plan Total
            </div>
            <div className="my-1.5">
              <span className="text-2xl font-black text-[#3D312A] font-mono">{planCals}</span>
              <span className="text-xs text-[#7C6E66] ml-1">kcal</span>
            </div>
            <div className="text-[11px] text-[#7C6E66]">Sum of 4 meals today</div>
          </div>

          {/* Consumed / Logged */}
          <div className="p-3.5 rounded-2xl bg-white border border-[#EEDDD3] shadow-xs flex flex-col justify-between">
            <div className="bento-label text-[10px] flex items-center gap-1 text-[#7C6E66]">
              <Flame className="w-3 h-3 text-[#E88E75]" /> Logged Today
            </div>
            <div className="my-1.5">
              <span className="text-2xl font-black text-[#3D312A] font-mono">{consumedCals}</span>
              <span className="text-xs text-[#7C6E66] ml-1">kcal</span>
            </div>
            <div className="text-[11px] text-[#7C6E66]">{caloriePercent}% of daily budget</div>
          </div>

          {/* Calorie Balance / Remaining */}
          <div className="p-3.5 rounded-2xl bg-white border border-[#EEDDD3] shadow-xs flex flex-col justify-between">
            <div className="bento-label text-[10px] flex items-center gap-1 text-[#7C6E66]">
              <Clock className="w-3 h-3 text-[#6B9080]" /> Remaining
            </div>
            <div className="my-1.5">
              <span className="text-2xl font-black text-[#3D312A] font-mono">{calsRemaining}</span>
              <span className="text-xs text-[#7C6E66] ml-1">kcal</span>
            </div>
            <div className="text-[11px] text-[#6B9080] font-semibold">
              {calsRemaining > 0 ? `${calsRemaining} kcal to go` : 'Goal achieved!'}
            </div>
          </div>
        </div>

        {/* Meal-by-Meal Calorie Distribution Bar */}
        <div className="p-3.5 rounded-2xl bg-white border border-[#EEDDD3] shadow-xs space-y-2">
          <div className="flex justify-between items-center text-xs">
            <span className="bento-label text-[10px] text-[#7C6E66]">Meal-by-Meal Calorie Split ({activeDay.dayName})</span>
            <span className="font-mono text-xs font-bold text-[#3D312A]">{planCals} kcal</span>
          </div>

          {/* Distribution multi-segment bar */}
          <div className="flex gap-1 h-3 rounded-full overflow-hidden bg-[#EDDCD2]/50 p-0.5 border border-[#EEDDD3]">
            <div className="bg-[#E88E75] rounded-full transition-all" style={{ width: `${bPct}%` }} title={`Breakfast: ${bCals} kcal (${bPct}%)`} />
            <div className="bg-[#D48B77] rounded-full transition-all" style={{ width: `${lPct}%` }} title={`Lunch: ${lCals} kcal (${lPct}%)`} />
            <div className="bg-[#6B9080] rounded-full transition-all" style={{ width: `${dPct}%` }} title={`Dinner: ${dCals} kcal (${dPct}%)`} />
            {sCals > 0 && (
              <div className="bg-[#C47C68] rounded-full transition-all" style={{ width: `${sPct}%` }} title={`Snack: ${sCals} kcal (${sPct}%)`} />
            )}
          </div>

          {/* Badges */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-1 text-xs">
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-[#E88E75]" />
              <span className="text-[#7C6E66]">Breakfast:</span>
              <strong className="text-[#3D312A] font-mono">{bCals} kcal</strong>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-[#D48B77]" />
              <span className="text-[#7C6E66]">Lunch:</span>
              <strong className="text-[#3D312A] font-mono">{lCals} kcal</strong>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-[#6B9080]" />
              <span className="text-[#7C6E66]">Dinner:</span>
              <strong className="text-[#3D312A] font-mono">{dCals} kcal</strong>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-[#C47C68]" />
              <span className="text-[#7C6E66]">Snack:</span>
              <strong className="text-[#3D312A] font-mono">{sCals} kcal</strong>
            </div>
          </div>
        </div>

        {/* Macronutrient Target Breakdown */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {/* Protein */}
          <div className="p-3 rounded-2xl bg-white border border-[#EEDDD3] shadow-xs">
            <div className="flex justify-between items-center text-xs mb-1">
              <span className="font-bold text-[#3D312A] flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-[#D48B77]" /> Protein
              </span>
              <span className="font-mono text-xs font-bold text-[#D48B77]">{activeDay.totalProteinG}g</span>
            </div>
            <div className="h-1.5 bg-[#EDDCD2]/60 rounded-full overflow-hidden mb-1.5">
              <div
                className="h-full bg-[#D48B77] rounded-full transition-all"
                style={{ width: `${Math.min(100, Math.round((activeDay.totalProteinG / targetProtein) * 100))}%` }}
              />
            </div>
            <div className="flex justify-between text-[10px] text-[#7C6E66]">
              <span>Target: {targetProtein}g</span>
              <span>{proteinPct}% of macros</span>
            </div>
          </div>

          {/* Carbs */}
          <div className="p-3 rounded-2xl bg-white border border-[#EEDDD3] shadow-xs">
            <div className="flex justify-between items-center text-xs mb-1">
              <span className="font-bold text-[#3D312A] flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-[#E88E75]" /> Carbohydrates
              </span>
              <span className="font-mono text-xs font-bold text-[#3D312A]">{activeDay.totalCarbsG}g</span>
            </div>
            <div className="h-1.5 bg-[#EDDCD2]/60 rounded-full overflow-hidden mb-1.5">
              <div
                className="h-full bg-[#E88E75] rounded-full transition-all"
                style={{ width: `${Math.min(100, Math.round((activeDay.totalCarbsG / targetCarbs) * 100))}%` }}
              />
            </div>
            <div className="flex justify-between text-[10px] text-[#7C6E66]">
              <span>Target: {targetCarbs}g</span>
              <span>{carbsPct}% of macros</span>
            </div>
          </div>

          {/* Fats */}
          <div className="p-3 rounded-2xl bg-white border border-[#EEDDD3] shadow-xs">
            <div className="flex justify-between items-center text-xs mb-1">
              <span className="font-bold text-[#3D312A] flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-[#6B9080]" /> Healthy Fats
              </span>
              <span className="font-mono text-xs font-bold text-[#6B9080]">{activeDay.totalFatG}g</span>
            </div>
            <div className="h-1.5 bg-[#EDDCD2]/60 rounded-full overflow-hidden mb-1.5">
              <div
                className="h-full bg-[#6B9080] rounded-full transition-all"
                style={{ width: `${Math.min(100, Math.round((activeDay.totalFatG / targetFat) * 100))}%` }}
              />
            </div>
            <div className="flex justify-between text-[10px] text-[#7C6E66]">
              <span>Target: {targetFat}g</span>
              <span>{fatPct}% of macros</span>
            </div>
          </div>
        </div>
      </div>

      {/* Grocery Shopping List Drawer */}
      {showGroceryList && (
        <div id="grocery-checklist-section" className="bento-card bg-[#FFFDFB] border border-[#EEDDD3] space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <ShoppingCart className="w-4 h-4 text-[#D48B77]" />
              <h2 className="text-sm sm:text-base font-bold text-[#3D312A]">
                Categorized Grocery Checklist
              </h2>
            </div>
            <span className="text-xs text-[#7C6E66]">
              {Object.values(checkedGroceryItems).filter(Boolean).length} items checked
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {dietPlan.groceryList.map((cat, idx) => (
              <div key={idx} className="p-3.5 rounded-2xl bg-[#F0EFEB]/80 border border-[#EEDDD3] space-y-2">
                <h3 className="bento-label text-[10px] pb-1 border-b border-[#EEDDD3] text-[#5C3A2E]">
                  {cat.category}
                </h3>
                <ul className="space-y-1.5">
                  {cat.items.map((item, itemIdx) => {
                    const itemKey = `${cat.category}-${item}`;
                    const isChecked = checkedGroceryItems[itemKey];
                    return (
                      <li key={itemIdx} className="flex items-start gap-2 text-xs">
                        <input
                          id={`grocery-check-${idx}-${itemIdx}`}
                          type="checkbox"
                          checked={!!isChecked}
                          onChange={() => handleToggleGroceryItem(itemKey)}
                          className="mt-0.5 h-3.5 w-3.5 rounded border-[#EEDDD3] text-[#D48B77] focus:ring-[#D48B77]"
                        />
                        <span className={isChecked ? 'line-through text-[#7C6E66]' : 'text-[#3D312A]'}>
                          {item}
                        </span>
                      </li>
                    );
                  })}
                </ul>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 7-Day Bento Tab Bar */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 no-scrollbar">
        {dietPlan.days.map((day, idx) => {
          const isSelected = selectedDayIdx === idx;
          const isToday = idx === todayIdx;

          return (
            <button
              key={day.dayName}
              id={`diet-day-tab-${idx}`}
              onClick={() => setSelectedDayIdx(idx)}
              className={`flex flex-col items-center justify-center min-w-[5.5rem] px-3.5 py-2.5 rounded-2xl text-xs transition ${
                isSelected
                  ? 'bg-[#3D312A] text-[#FFF1E6] shadow-xs'
                  : 'bg-white text-[#7C6E66] hover:text-[#3D312A] border border-[#EEDDD3] hover:bg-[#FFF1E6]'
              }`}
            >
              <div className="flex items-center gap-1 font-bold">
                <span>{day.dayName.slice(0, 3)}</span>
                {isToday && <span className="w-1.5 h-1.5 rounded-full bg-[#E88E75]" />}
              </div>
              <span className={`text-[10px] font-mono mt-0.5 ${isSelected ? 'text-[#E88E75]' : 'text-[#7C6E66]'}`}>
                {day.totalCalories} kcal
              </span>
            </button>
          );
        })}
      </div>

      {/* Day Overview Summary Bento Bar */}
      <div className="bento-card bg-[#FFFDFB] border border-[#EEDDD3] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-base font-bold text-[#3D312A]">{activeDay.dayName} Meal Plan</h2>
            <span className="text-xs text-[#7C6E66] font-mono">
              Total: <strong className="text-[#3D312A]">{activeDay.totalCalories} kcal</strong>
            </span>
          </div>
          <p className="text-xs text-[#7C6E66] mt-0.5">
            <strong>Daily Tip:</strong> {activeDay.dailyTip}
          </p>
        </div>

        {/* Daily Macros Split */}
        <div className="flex items-center gap-4 text-xs font-mono shrink-0">
          <div>
            <span className="bento-label text-[9px] block text-[#7C6E66]">Protein</span>
            <span className="font-bold text-[#D48B77]">{activeDay.totalProteinG}g</span>
          </div>
          <div>
            <span className="bento-label text-[9px] block text-[#7C6E66]">Carbs</span>
            <span className="font-bold text-[#3D312A]">{activeDay.totalCarbsG}g</span>
          </div>
          <div>
            <span className="bento-label text-[9px] block text-[#7C6E66]">Fat</span>
            <span className="font-bold text-[#6B9080]">{activeDay.totalFatG}g</span>
          </div>
        </div>
      </div>

      {/* 4 Meal Bento Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {renderMealBentoCard(activeDay.breakfast, 'breakfast', 'bg-[#E88E75]', 'B', 'Breakfast')}
        {renderMealBentoCard(activeDay.lunch, 'lunch', 'bg-[#D48B77]', 'L', 'Lunch')}
        {renderMealBentoCard(activeDay.dinner, 'dinner', 'bg-[#6B9080]', 'D', 'Dinner')}
        {renderMealBentoCard(activeDay.snack, 'snack', 'bg-[#C47C68]', 'S', 'Snack & Fuel')}
      </div>
    </div>
  );
};
