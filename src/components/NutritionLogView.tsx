import React, { useState } from 'react';
import {
  Flame,
  Droplet,
  Plus,
  Trash2,
  Sparkles,
  Coffee,
  Sun,
  Moon,
  Cookie,
  Layers,
  CheckCircle2,
  Check,
  TrendingUp,
  AlertCircle,
} from 'lucide-react';
import { DailyTrackingState, UserPreferences, FoodLogEntry, DailyBiometricSummary } from '../types';

interface NutritionLogViewProps {
  dailyTracking: DailyTrackingState;
  preferences: UserPreferences;
  biometrics: DailyBiometricSummary;
  onAddFood: (entry: Omit<FoodLogEntry, 'id' | 'timestamp'>) => void;
  onRemoveFood: (id: string) => void;
  onAddWater: (amountMl: number) => void;
  onRemoveWater: (id: string) => void;
  onAnalyzeFoodWithAI: (query: string) => Promise<any>;
  completedExercises?: Record<string, boolean>;
}

export const NutritionLogView: React.FC<NutritionLogViewProps> = ({
  dailyTracking,
  preferences,
  biometrics,
  onAddFood,
  onRemoveFood,
  onAddWater,
  onRemoveWater,
  onAnalyzeFoodWithAI,
}) => {
  const [aiFoodQuery, setAiFoodQuery] = useState('');
  const [isAnalyzingFood, setIsAnalyzingFood] = useState(false);
  const [selectedMealType, setSelectedMealType] = useState<FoodLogEntry['mealType']>('breakfast');
  const [manualName, setManualName] = useState('');
  const [manualCalories, setManualCalories] = useState('');
  const [manualProtein, setManualProtein] = useState('');
  const [manualCarbs, setManualCarbs] = useState('');
  const [manualFat, setManualFat] = useState('');
  const [showManualForm, setShowManualForm] = useState(false);
  const [customWaterInput, setCustomWaterInput] = useState('');

  const targetCal = preferences.targetCalories || 2100;
  const calPercent = Math.min(100, Math.round((dailyTracking.totalCalories / targetCal) * 100));
  const isCalorieGoalMet = dailyTracking.totalCalories > 0 && Math.abs(dailyTracking.totalCalories - targetCal) <= 150;

  const targetProt = preferences.targetProteinG || 145;
  const protPercent = Math.min(100, Math.round((dailyTracking.totalProteinG / targetProt) * 100));

  const targetCarbs = preferences.targetCarbsG || 190;
  const carbsPercent = Math.min(100, Math.round((dailyTracking.totalCarbsG / targetCarbs) * 100));

  const targetFat = preferences.targetFatG || 65;
  const fatPercent = Math.min(100, Math.round((dailyTracking.totalFatG / targetFat) * 100));

  const targetWater = preferences.targetWaterMl || 2800;
  const waterPercent = Math.min(100, Math.round((dailyTracking.totalWaterMl / targetWater) * 100));
  const isWaterGoalReached = dailyTracking.totalWaterMl >= targetWater;

  const estimatedBMR = 1750;
  const totalBurn = estimatedBMR + biometrics.activeCaloriesBurned;
  const targetDailyBurnGoal = 2400;
  const netDeficit = totalBurn - dailyTracking.totalCalories;
  const isBurnGoalReached = totalBurn >= targetDailyBurnGoal;

  const handleAiFoodSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!aiFoodQuery.trim()) return;

    setIsAnalyzingFood(true);
    try {
      const parsed = await onAnalyzeFoodWithAI(aiFoodQuery);
      if (parsed) {
        onAddFood({
          mealType: selectedMealType,
          name: parsed.name || aiFoodQuery,
          calories: parsed.calories || 350,
          proteinG: parsed.proteinG || 20,
          carbsG: parsed.carbsG || 30,
          fatG: parsed.fatG || 10,
          portion: parsed.portion || '1 serving',
          source: 'ai_parsed',
        });
        setAiFoodQuery('');
      }
    } catch (err) {
      console.error('Error analyzing food:', err);
    } finally {
      setIsAnalyzingFood(false);
    }
  };

  const handleManualFoodSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!manualName.trim()) return;

    onAddFood({
      mealType: selectedMealType,
      name: manualName.trim(),
      calories: Number(manualCalories) || 0,
      proteinG: Number(manualProtein) || 0,
      carbsG: Number(manualCarbs) || 0,
      fatG: Number(manualFat) || 0,
      portion: 'Manual entry',
      source: 'manual',
    });

    setManualName('');
    setManualCalories('');
    setManualProtein('');
    setManualCarbs('');
    setManualFat('');
    setShowManualForm(false);
  };

  const handleCustomWaterSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const amt = parseInt(customWaterInput, 10);
    if (!isNaN(amt) && amt > 0) {
      onAddWater(amt);
      setCustomWaterInput('');
    }
  };

  const mealTypeIcons: Record<FoodLogEntry['mealType'], React.ReactNode> = {
    breakfast: <Coffee className="w-3.5 h-3.5 text-[#E88E75]" />,
    lunch: <Sun className="w-3.5 h-3.5 text-[#D48B77]" />,
    dinner: <Moon className="w-3.5 h-3.5 text-[#6B9080]" />,
    snack: <Cookie className="w-3.5 h-3.5 text-[#C47C68]" />,
  };

  return (
    <div id="nutrition-log-view" className="space-y-4 animate-in fade-in duration-300 pb-16 lg:pb-0">
      {/* Top Banner with Creamy Delight Styling */}
      <div className="bento-card bg-[#FFFDFB] border border-[#EEDDD3] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-xs">
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-2xl bg-[#3D312A] text-[#FFF1E6] flex items-center justify-center font-bold shrink-0 shadow-xs border border-[#EEDDD3]">
            <Flame className="w-6 h-6 text-[#E88E75]" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl sm:text-2xl font-bold text-[#3D312A]">
                Nutrition & Hydration Tracker
              </h1>
              <span className="bento-chip bg-[#FFF1E6] text-[#5C3A2E] border border-[#EEDDD3]">
                Daily Real-time
              </span>
            </div>
            <p className="text-xs text-[#7C6E66]">
              Log foods using AI natural language, track macros, and monitor water intake.
            </p>
          </div>
        </div>
      </div>

      {/* Progress Cards Bento Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Calories Card */}
        <div className="bento-card bg-[#FFFDFB] border border-[#EEDDD3] flex flex-col justify-between">
          <div>
            <div className="flex justify-between items-center">
              <span className="bento-label text-[10px] text-[#7C6E66]">Daily Calories</span>
              <span className="text-xs font-mono font-bold text-[#3D312A]">{calPercent}%</span>
            </div>
            <div className="flex items-baseline gap-1 mt-1">
              <span className="text-2xl font-black font-mono text-[#3D312A]">
                {dailyTracking.totalCalories}
              </span>
              <span className="text-xs text-[#7C6E66]">/ {targetCal} kcal</span>
            </div>
          </div>
          <div className="mt-3">
            <div className="h-2.5 bg-[#EDDCD2]/60 rounded-full overflow-hidden p-0.5 border border-[#EEDDD3]">
              <div
                className="h-full bg-gradient-to-r from-[#E88E75] to-[#D48B77] rounded-full transition-all"
                style={{ width: `${calPercent}%` }}
              />
            </div>
            <div className="flex justify-between items-center text-[10px] text-[#7C6E66] mt-1.5">
              <span>{Math.max(0, targetCal - dailyTracking.totalCalories)} kcal left</span>
              {isCalorieGoalMet && <span className="text-[#6B9080] font-bold">Goal met!</span>}
            </div>
          </div>
        </div>

        {/* Protein Card */}
        <div className="bento-card bg-[#FFFDFB] border border-[#EEDDD3] flex flex-col justify-between">
          <div>
            <div className="flex justify-between items-center">
              <span className="bento-label text-[10px] text-[#7C6E66]">Protein Target</span>
              <span className="text-xs font-mono font-bold text-[#D48B77]">{protPercent}%</span>
            </div>
            <div className="flex items-baseline gap-1 mt-1">
              <span className="text-2xl font-black font-mono text-[#D48B77]">
                {dailyTracking.totalProteinG}g
              </span>
              <span className="text-xs text-[#7C6E66]">/ {targetProt}g</span>
            </div>
          </div>
          <div className="mt-3">
            <div className="h-2.5 bg-[#EDDCD2]/60 rounded-full overflow-hidden p-0.5 border border-[#EEDDD3]">
              <div
                className="h-full bg-[#D48B77] rounded-full transition-all"
                style={{ width: `${protPercent}%` }}
              />
            </div>
            <span className="text-[10px] text-[#7C6E66] block mt-1.5">
              {Math.max(0, targetProt - dailyTracking.totalProteinG)}g to goal
            </span>
          </div>
        </div>

        {/* Net Energy Deficit / Surplus */}
        <div className="bento-card bg-[#FFFDFB] border border-[#EEDDD3] flex flex-col justify-between">
          <div>
            <div className="flex justify-between items-center">
              <span className="bento-label text-[10px] text-[#7C6E66]">Net Energy Burn</span>
              <span className="bento-chip bg-[#FFF1E6] text-[#5C3A2E] text-[9px] border border-[#EEDDD3]">
                Redmi Sync
              </span>
            </div>
            <div className="flex items-baseline gap-1 mt-1">
              <span className={`text-2xl font-black font-mono ${netDeficit >= 0 ? 'text-[#6B9080]' : 'text-[#D48B77]'}`}>
                {netDeficit >= 0 ? `-${netDeficit}` : `+${Math.abs(netDeficit)}`}
              </span>
              <span className="text-xs text-[#7C6E66]">kcal net</span>
            </div>
          </div>
          <div className="text-xs text-[#7C6E66] pt-2 border-t border-[#EEDDD3]/60 mt-2">
            Burned {totalBurn} kcal vs {dailyTracking.totalCalories} eaten
          </div>
        </div>

        {/* Hydration Card */}
        <div className="bento-card bg-[#FFFDFB] border border-[#EEDDD3] flex flex-col justify-between">
          <div>
            <div className="flex justify-between items-center">
              <span className="bento-label text-[10px] text-[#7C6E66]">Hydration</span>
              <span className="text-xs font-mono font-bold text-[#6B9080]">{waterPercent}%</span>
            </div>
            <div className="flex items-baseline gap-1 mt-1">
              <span className="text-2xl font-black font-mono text-[#6B9080]">
                {dailyTracking.totalWaterMl}
              </span>
              <span className="text-xs text-[#7C6E66]">/ {targetWater} ml</span>
            </div>
          </div>
          <div className="mt-3">
            <div className="h-2.5 bg-[#EDDCD2]/60 rounded-full overflow-hidden p-0.5 border border-[#EEDDD3]">
              <div
                className="h-full bg-[#6B9080] rounded-full transition-all"
                style={{ width: `${waterPercent}%` }}
              />
            </div>
            <div className="flex justify-between items-center text-[10px] text-[#7C6E66] mt-1.5">
              <span>{Math.max(0, targetWater - dailyTracking.totalWaterMl)} ml left</span>
              {isWaterGoalReached && <span className="text-[#6B9080] font-bold">Hydrated!</span>}
            </div>
          </div>
        </div>
      </div>

      {/* Logging Forms & Food List Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Left Column: AI Food Logger & Water Logging */}
        <div className="space-y-4">
          {/* AI Smart Food Logger */}
          <div className="bento-card bg-[#FFFDFB] border border-[#EEDDD3] space-y-3">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-[#E88E75]" />
              <h2 className="text-sm font-bold text-[#3D312A]">AI Natural Food Logger</h2>
            </div>
            <p className="text-xs text-[#7C6E66]">
              Type naturally (e.g. "2 slices sourdough with avocado and 2 poached eggs")
            </p>

            <form onSubmit={handleAiFoodSubmit} className="space-y-2.5">
              {/* Meal Type Selection */}
              <div className="grid grid-cols-4 gap-1.5">
                {(['breakfast', 'lunch', 'dinner', 'snack'] as const).map((t) => (
                  <button
                    key={t}
                    type="button"
                    onClick={() => setSelectedMealType(t)}
                    className={`py-1.5 text-xs font-semibold rounded-xl capitalize transition ${
                      selectedMealType === t
                        ? 'bg-[#3D312A] text-[#FFF1E6]'
                        : 'bg-[#FFF1E6] text-[#5C3A2E] border border-[#EEDDD3] hover:bg-[#EDDCD2]'
                    }`}
                  >
                    {t}
                  </button>
                ))}
              </div>

              <textarea
                value={aiFoodQuery}
                onChange={(e) => setAiFoodQuery(e.target.value)}
                placeholder="What did you eat? Include portions if possible..."
                rows={2}
                className="w-full text-xs p-3 rounded-2xl border border-[#EEDDD3] focus:border-[#D48B77] focus:ring-1 focus:ring-[#D48B77] bg-white text-[#3D312A] resize-none outline-hidden"
              />

              <button
                type="submit"
                disabled={isAnalyzingFood || !aiFoodQuery.trim()}
                className="w-full py-2.5 rounded-2xl bg-[#3D312A] hover:bg-[#2E2420] text-[#FFF1E6] text-xs font-bold transition flex items-center justify-center gap-1.5 disabled:opacity-50 shadow-xs"
              >
                <Sparkles className="w-3.5 h-3.5 text-[#E88E75]" />
                <span>{isAnalyzingFood ? 'AI Analyzing Food...' : 'Log Food with AI'}</span>
              </button>
            </form>

            <button
              type="button"
              onClick={() => setShowManualForm(!showManualForm)}
              className="text-xs text-[#D48B77] hover:underline font-semibold text-center w-full block pt-1"
            >
              {showManualForm ? 'Hide manual form' : 'Or enter macros manually →'}
            </button>

            {/* Manual Form */}
            {showManualForm && (
              <form onSubmit={handleManualFoodSubmit} className="space-y-2 pt-2 border-t border-[#EEDDD3] text-xs animate-in fade-in">
                <input
                  type="text"
                  placeholder="Food Name"
                  value={manualName}
                  onChange={(e) => setManualName(e.target.value)}
                  className="w-full p-2 rounded-xl border border-[#EEDDD3] bg-white text-[#3D312A]"
                  required
                />
                <div className="grid grid-cols-2 gap-2">
                  <input
                    type="number"
                    placeholder="Calories (kcal)"
                    value={manualCalories}
                    onChange={(e) => setManualCalories(e.target.value)}
                    className="p-2 rounded-xl border border-[#EEDDD3] bg-white text-[#3D312A]"
                    required
                  />
                  <input
                    type="number"
                    placeholder="Protein (g)"
                    value={manualProtein}
                    onChange={(e) => setManualProtein(e.target.value)}
                    className="p-2 rounded-xl border border-[#EEDDD3] bg-white text-[#3D312A]"
                  />
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <input
                    type="number"
                    placeholder="Carbs (g)"
                    value={manualCarbs}
                    onChange={(e) => setManualCarbs(e.target.value)}
                    className="p-2 rounded-xl border border-[#EEDDD3] bg-white text-[#3D312A]"
                  />
                  <input
                    type="number"
                    placeholder="Fat (g)"
                    value={manualFat}
                    onChange={(e) => setManualFat(e.target.value)}
                    className="p-2 rounded-xl border border-[#EEDDD3] bg-white text-[#3D312A]"
                  />
                </div>
                <button
                  type="submit"
                  className="w-full py-2 rounded-xl bg-[#D48B77] text-white font-bold hover:bg-[#C47C68] transition"
                >
                  Add Food Entry
                </button>
              </form>
            )}
          </div>

          {/* Quick Water Logging */}
          <div className="bento-card bg-[#FFFDFB] border border-[#EEDDD3] space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Droplet className="w-4 h-4 text-[#6B9080]" />
                <h2 className="text-sm font-bold text-[#3D312A]">Quick Water Logging</h2>
              </div>
              <span className="font-mono text-xs font-bold text-[#6B9080]">
                {dailyTracking.totalWaterMl} ml
              </span>
            </div>

            <div className="grid grid-cols-3 gap-2">
              <button
                onClick={() => onAddWater(250)}
                className="p-2 rounded-xl bg-[#FFF1E6] hover:bg-[#EDDCD2] border border-[#EEDDD3] text-xs font-bold text-[#5C3A2E] transition flex flex-col items-center gap-1"
              >
                <span>+250 ml</span>
                <span className="text-[10px] text-[#7C6E66] font-normal">1 Glass</span>
              </button>
              <button
                onClick={() => onAddWater(500)}
                className="p-2 rounded-xl bg-[#FFF1E6] hover:bg-[#EDDCD2] border border-[#EEDDD3] text-xs font-bold text-[#5C3A2E] transition flex flex-col items-center gap-1"
              >
                <span>+500 ml</span>
                <span className="text-[10px] text-[#7C6E66] font-normal">Bottle</span>
              </button>
              <button
                onClick={() => onAddWater(750)}
                className="p-2 rounded-xl bg-[#FFF1E6] hover:bg-[#EDDCD2] border border-[#EEDDD3] text-xs font-bold text-[#5C3A2E] transition flex flex-col items-center gap-1"
              >
                <span>+750 ml</span>
                <span className="text-[10px] text-[#7C6E66] font-normal">Large</span>
              </button>
            </div>

            <form onSubmit={handleCustomWaterSubmit} className="flex gap-2 pt-1">
              <input
                type="number"
                placeholder="Custom ml..."
                value={customWaterInput}
                onChange={(e) => setCustomWaterInput(e.target.value)}
                className="flex-1 p-2 text-xs rounded-xl border border-[#EEDDD3] bg-white text-[#3D312A]"
              />
              <button
                type="submit"
                className="px-3 py-2 rounded-xl bg-[#3D312A] text-[#FFF1E6] text-xs font-bold hover:bg-[#2E2420]"
              >
                Add
              </button>
            </form>
          </div>
        </div>

        {/* Right Column: Daily Food Log List */}
        <div className="lg:col-span-2 bento-card bg-[#FFFDFB] border border-[#EEDDD3] space-y-3">
          <div className="flex items-center justify-between pb-2 border-b border-[#EEDDD3]/70">
            <div className="flex items-center gap-2">
              <Layers className="w-4 h-4 text-[#D48B77]" />
              <h2 className="text-sm font-bold text-[#3D312A]">Today's Food Journal</h2>
            </div>
            <span className="text-xs text-[#7C6E66]">
              {dailyTracking.foodLogs.length} items logged
            </span>
          </div>

          {dailyTracking.foodLogs.length === 0 ? (
            <div className="p-8 text-center text-xs text-[#7C6E66]">
              No meals logged yet today. Use the AI Logger or Log buttons on the Diet Plan tab!
            </div>
          ) : (
            <div className="space-y-2">
              {dailyTracking.foodLogs.map((item) => (
                <div
                  key={item.id}
                  className="p-3 rounded-2xl bg-[#F0EFEB]/70 border border-[#EEDDD3] flex items-center justify-between gap-3 hover:bg-white transition"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-8 h-8 rounded-xl bg-[#FFF1E6] border border-[#EEDDD3] flex items-center justify-center shrink-0">
                      {mealTypeIcons[item.mealType] || <Coffee className="w-4 h-4 text-[#D48B77]" />}
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-[#3D312A] truncate">
                          {item.name}
                        </span>
                        <span className="bento-chip text-[9px] bg-[#FFF1E6] text-[#5C3A2E] border border-[#EEDDD3] capitalize">
                          {item.mealType}
                        </span>
                      </div>
                      <div className="text-[11px] text-[#7C6E66] flex items-center gap-2 mt-0.5">
                        <span>P: <strong className="text-[#3D312A]">{item.proteinG}g</strong></span>
                        <span>C: <strong className="text-[#3D312A]">{item.carbsG}g</strong></span>
                        <span>F: <strong className="text-[#3D312A]">{item.fatG}g</strong></span>
                        {item.portion && <span>• {item.portion}</span>}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 shrink-0">
                    <span className="font-mono font-bold text-xs text-[#3D312A]">
                      {item.calories} kcal
                    </span>
                    <button
                      onClick={() => onRemoveFood(item.id)}
                      className="p-1.5 rounded-lg text-[#7C6E66] hover:text-red-500 hover:bg-red-50 transition"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
