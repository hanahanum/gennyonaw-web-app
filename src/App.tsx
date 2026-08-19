import React, { useState, useEffect } from 'react';
import { Header } from './components/Header';
import { DashboardOverview } from './components/DashboardOverview';
import { DietPlanView } from './components/DietPlanView';
import { RedmiWatchView } from './components/RedmiWatchView';
import { WorkoutPlanView } from './components/WorkoutPlanView';
import { NutritionLogView } from './components/NutritionLogView';
import { BreathingPacerModal } from './components/BreathingPacerModal';
import { AICoachModal } from './components/AICoachModal';
import { PersonalInstructionsModal } from './components/PersonalInstructionsModal';
import { AIStatePlannerModal } from './components/AIStatePlannerModal';
import { HealthConnectFetchModal } from './components/HealthConnectFetchModal';
import { MobileBottomNav } from './components/MobileBottomNav';
import { CheckCircle2, Sparkles, X } from 'lucide-react';
import {
  WeeklyDietPlan,
  WeeklyWorkoutPlan,
  DailyBiometricSummary,
  DailyTrackingState,
  UserPreferences,
  AICoachInsight,
  FoodLogEntry,
  MealItem,
} from './types';
import {
  DEFAULT_PREFERENCES,
  DEFAULT_DIET_PLAN,
  DEFAULT_WORKOUT_PLAN,
  DEFAULT_DAILY_TRACKING,
  generateSimulatedRedmiData,
  shouldRefreshWeekly,
  updateWeeklyRefreshTimestamp,
} from './utils/defaultPlans';

export function App() {
  // Navigation
  const [activeTab, setActiveTab] = useState<'overview' | 'diet' | 'workout' | 'watch' | 'nutrition'>('overview');

  // Modals
  const [isBreathingOpen, setIsBreathingOpen] = useState(false);
  const [isAICoachOpen, setIsAICoachOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isStatePlannerOpen, setIsStatePlannerOpen] = useState(false);
  const [isHealthConnectModalOpen, setIsHealthConnectModalOpen] = useState(false);

  // Status Notification Toast
  const [notification, setNotification] = useState<{ message: string; sub?: string } | null>(null);

  // Core Data States with localStorage caching
  const [preferences, setPreferences] = useState<UserPreferences>(() => {
    try {
      const saved = localStorage.getItem('vitalipulse_preferences');
      return saved ? JSON.parse(saved) : DEFAULT_PREFERENCES;
    } catch {
      return DEFAULT_PREFERENCES;
    }
  });

  const [dietPlan, setDietPlan] = useState<WeeklyDietPlan>(() => {
    try {
      const saved = localStorage.getItem('vitalipulse_diet_plan');
      return saved ? JSON.parse(saved) : DEFAULT_DIET_PLAN;
    } catch {
      return DEFAULT_DIET_PLAN;
    }
  });

  const [workoutPlan, setWorkoutPlan] = useState<WeeklyWorkoutPlan>(() => {
    try {
      const saved = localStorage.getItem('vitalipulse_workout_plan');
      return saved ? JSON.parse(saved) : DEFAULT_WORKOUT_PLAN;
    } catch {
      return DEFAULT_WORKOUT_PLAN;
    }
  });

  const [dailyTracking, setDailyTracking] = useState<DailyTrackingState>(() => {
    try {
      const saved = localStorage.getItem('vitalipulse_daily_tracking');
      return saved ? JSON.parse(saved) : DEFAULT_DAILY_TRACKING;
    } catch {
      return DEFAULT_DAILY_TRACKING;
    }
  });

  const [biometrics, setBiometrics] = useState<DailyBiometricSummary>(() => {
    try {
      const saved = localStorage.getItem('vitalipulse_biometrics');
      return saved ? JSON.parse(saved) : generateSimulatedRedmiData();
    } catch {
      return generateSimulatedRedmiData();
    }
  });

  // Track completed exercise IDs with localStorage persistence
  const [completedExercises, setCompletedExercises] = useState<Record<string, boolean>>(() => {
    try {
      const saved = localStorage.getItem('vitalipulse_completed_exercises');
      return saved ? JSON.parse(saved) : {};
    } catch {
      return {};
    }
  });

  const [coachInsight, setCoachInsight] = useState<AICoachInsight>({
    id: 'init-coach',
    generatedAt: new Date().toISOString(),
    overallStatus: 'good',
    headline: 'High Physical Recovery & Steady Caloric Burn',
    summary: 'Your resting heart rate is sitting at an optimal 58 bpm with low autonomic stress.',
    nutritionAdvice: 'Maintain 145g daily protein target. Replenish complex carbs post-workout.',
    workoutAdjustment: 'Readiness score is 88/100. Perfect conditioning to execute planned sets.',
    stressMitigationTip: 'Micro-stress spike detected at 14:30. Take a 3-minute 4-7-8 breathing session.',
    hydrationAlert: 'Hydration on track. Consume at least 500ml before your evening workout.',
    readinessScore: 88,
  });

  // Loading States
  const [isGeneratingDiet, setIsGeneratingDiet] = useState(false);
  const [isGeneratingWorkouts, setIsGeneratingWorkouts] = useState(false);
  const [isGeneratingCoach, setIsGeneratingCoach] = useState(false);
  const [isSyncingWatch, setIsSyncingWatch] = useState(false);
  const [isAdaptingFromCondition, setIsAdaptingFromCondition] = useState(false);

  // Auto Dismiss Toast
  useEffect(() => {
    if (notification) {
      const timer = setTimeout(() => setNotification(null), 4500);
      return () => clearTimeout(timer);
    }
  }, [notification]);

  // Sync state changes to localStorage
  useEffect(() => {
    try {
      localStorage.setItem('vitalipulse_preferences', JSON.stringify(preferences));
    } catch (e) {
      console.warn('Could not save preferences:', e);
    }
  }, [preferences]);

  useEffect(() => {
    try {
      localStorage.setItem('vitalipulse_diet_plan', JSON.stringify(dietPlan));
    } catch (e) {
      console.warn('Could not save diet plan:', e);
    }
  }, [dietPlan]);

  useEffect(() => {
    try {
      localStorage.setItem('vitalipulse_workout_plan', JSON.stringify(workoutPlan));
    } catch (e) {
      console.warn('Could not save workout plan:', e);
    }
  }, [workoutPlan]);

  useEffect(() => {
    try {
      localStorage.setItem('vitalipulse_daily_tracking', JSON.stringify(dailyTracking));
    } catch (e) {
      console.warn('Could not save daily tracking:', e);
    }
  }, [dailyTracking]);

  useEffect(() => {
    try {
      localStorage.setItem('vitalipulse_biometrics', JSON.stringify(biometrics));
    } catch (e) {
      console.warn('Could not save biometrics:', e);
    }
  }, [biometrics]);

  useEffect(() => {
    try {
      localStorage.setItem('vitalipulse_completed_exercises', JSON.stringify(completedExercises));
    } catch (e) {
      console.warn('Could not save completed exercises:', e);
    }
  }, [completedExercises]);

  const handleToggleExerciseCompleted = (exerciseId: string) => {
    setCompletedExercises((prev) => ({
      ...prev,
      [exerciseId]: !prev[exerciseId],
    }));
  };

  // AI Diet Plan Generator
  const handleGenerateDietPlan = async (customPrefs?: UserPreferences) => {
    setIsGeneratingDiet(true);
    const prefsToUse = customPrefs || preferences;

    try {
      const response = await fetch('/api/generate-diet-plan', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          preferences: prefsToUse,
          biometricContext: biometrics,
        }),
      });

      if (!response.ok) throw new Error(`Server returned ${response.status}`);
      const data = await response.json();
      if (data && data.days && data.days.length > 0) {
        setDietPlan(data);
        updateWeeklyRefreshTimestamp();
        setNotification({
          message: 'AI Diet Plan Updated!',
          sub: prefsToUse.customInstructions
            ? `Custom instructions applied: "${prefsToUse.customInstructions.slice(0, 40)}..."`
            : 'Generated fresh 7-day personalized meal plan.',
        });
      }
    } catch (err) {
      console.warn('Diet AI generation fallback or network error:', err);
    } finally {
      setIsGeneratingDiet(false);
    }
  };

  // AI Workout Plan Generator
  const handleGenerateWorkoutPlan = async (customPrefs?: UserPreferences) => {
    setIsGeneratingWorkouts(true);
    const prefsToUse = customPrefs || preferences;

    try {
      const response = await fetch('/api/generate-workout-plan', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          preferences: prefsToUse,
          biometricContext: biometrics,
        }),
      });

      if (!response.ok) throw new Error(`Server returned ${response.status}`);
      const data = await response.json();
      if (data && data.days && data.days.length > 0) {
        setWorkoutPlan(data);
      }
    } catch (err) {
      console.warn('Workout AI generation fallback:', err);
    } finally {
      setIsGeneratingWorkouts(false);
    }
  };

  // Dynamic AI State & Condition Planner Adaptation
  const handleAdaptPlanFromCondition = async (conditionPrompt: string) => {
    setIsAdaptingFromCondition(true);
    try {
      const response = await fetch('/api/adapt-plan-from-condition', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userCondition: conditionPrompt,
          preferences,
          currentDietPlan: dietPlan,
          currentWorkoutPlan: workoutPlan,
          biometrics,
        }),
      });

      if (!response.ok) throw new Error(`Server error ${response.status}`);
      const data = await response.json();

      if (data.dietPlan && data.dietPlan.days?.length > 0) {
        setDietPlan(data.dietPlan);
      }
      if (data.workoutPlan && data.workoutPlan.days?.length > 0) {
        setWorkoutPlan(data.workoutPlan);
      }
      if (data.coachAdvice) {
        setCoachInsight((prev) => ({
          ...prev,
          headline: 'Personalized Condition Adaptation Active',
          summary: data.coachAdvice,
          generatedAt: new Date().toISOString(),
        }));
      }

      setNotification({
        message: 'Plan Adapted to Real-time State!',
        sub: `AI recalibrated meals and workouts for: "${conditionPrompt.slice(0, 35)}..."`,
      });
    } catch (err) {
      console.warn('Condition adaptation error:', err);
    } finally {
      setIsAdaptingFromCondition(false);
    }
  };

  // AI Coach Synthesizer
  const handleRefreshAICoach = async () => {
    setIsGeneratingCoach(true);
    try {
      const response = await fetch('/api/biometric-coach-insight', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          preferences,
          biometrics,
          dailyTracking,
        }),
      });

      if (!response.ok) throw new Error(`Server returned ${response.status}`);
      const data = await response.json();
      if (data && data.headline) {
        setCoachInsight(data);
      }
    } catch (err) {
      console.warn('Coach AI error:', err);
    } finally {
      setIsGeneratingCoach(false);
    }
  };

  // AI Natural Language Food Analyzer
  const handleAnalyzeFoodWithAI = async (query: string) => {
    try {
      const response = await fetch('/api/analyze-food', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query }),
      });

      if (!response.ok) throw new Error('AI parse error');
      return await response.json();
    } catch (err) {
      console.warn('Food AI parsing error:', err);
      return {
        name: query,
        calories: 350,
        proteinG: 18,
        carbsG: 35,
        fatG: 12,
        portion: '1 serving',
      };
    }
  };

  // Watch Sync action
  const handleQuickWatchSync = () => {
    setIsSyncingWatch(true);
    setTimeout(() => {
      const freshData = generateSimulatedRedmiData();
      setBiometrics(freshData);
      setIsSyncingWatch(false);
      setNotification({
        message: 'Redmi Watch Synced',
        sub: `Updated metrics: ${freshData.totalSteps.toLocaleString()} steps • ${freshData.activeCaloriesBurned} kcal burned`,
      });
    }, 900);
  };

  // Automatic Weekly Refresh check on mount
  useEffect(() => {
    if (shouldRefreshWeekly(preferences.autoWeeklyRefreshDay)) {
      console.log('Automated weekly cycle reached: Refreshing AI Diet & Workout plans...');
      handleGenerateDietPlan();
      handleGenerateWorkoutPlan();
    }
  }, []);

  // Food logging handlers
  const handleAddFood = (entry: Omit<FoodLogEntry, 'id' | 'timestamp'>) => {
    const newEntry: FoodLogEntry = {
      ...entry,
      id: `food-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setDailyTracking((prev) => {
      const updatedLogs = [newEntry, ...prev.foodLogs];
      const totalCalories = updatedLogs.reduce((s, f) => s + f.calories, 0);
      const totalProteinG = updatedLogs.reduce((s, f) => s + f.proteinG, 0);
      const totalCarbsG = updatedLogs.reduce((s, f) => s + f.carbsG, 0);
      const totalFatG = updatedLogs.reduce((s, f) => s + f.fatG, 0);

      return {
        ...prev,
        foodLogs: updatedLogs,
        totalCalories,
        totalProteinG,
        totalCarbsG,
        totalFatG,
      };
    });
  };

  const handleRemoveFood = (id: string) => {
    setDailyTracking((prev) => {
      const updatedLogs = prev.foodLogs.filter((f) => f.id !== id);
      const totalCalories = updatedLogs.reduce((s, f) => s + f.calories, 0);
      const totalProteinG = updatedLogs.reduce((s, f) => s + f.proteinG, 0);
      const totalCarbsG = updatedLogs.reduce((s, f) => s + f.carbsG, 0);
      const totalFatG = updatedLogs.reduce((s, f) => s + f.fatG, 0);

      return {
        ...prev,
        foodLogs: updatedLogs,
        totalCalories,
        totalProteinG,
        totalCarbsG,
        totalFatG,
      };
    });
  };

  // 1-Click Diet Plan to Daily Tracker
  const handleLogMealFromDietPlan = (meal: MealItem, mealType: FoodLogEntry['mealType']) => {
    handleAddFood({
      mealType,
      name: meal.name,
      calories: meal.calories,
      proteinG: meal.proteinG,
      carbsG: meal.carbsG,
      fatG: meal.fatG,
      portion: 'AI Plan portion',
      source: 'diet_plan',
    });
    setNotification({
      message: `Logged "${meal.name}" to Nutrition Tracker`,
      sub: `+${meal.calories} kcal • +${meal.proteinG}g protein`,
    });
  };

  // Water logging handlers
  const handleAddWater = (amountMl: number) => {
    const newLog = {
      id: `water-${Date.now()}`,
      amountMl,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setDailyTracking((prev) => ({
      ...prev,
      totalWaterMl: prev.totalWaterMl + amountMl,
      waterLogs: [newLog, ...prev.waterLogs],
    }));
  };

  const handleRemoveWater = (id: string) => {
    setDailyTracking((prev) => {
      const target = prev.waterLogs.find((w) => w.id === id);
      const subtracted = target ? target.amountMl : 0;
      return {
        ...prev,
        totalWaterMl: Math.max(0, prev.totalWaterMl - subtracted),
        waterLogs: prev.waterLogs.filter((w) => w.id !== id),
      };
    });
  };

  // Save Preferences & Trigger AI
  const handleSavePreferences = (updated: UserPreferences) => {
    setPreferences(updated);
    setNotification({
      message: 'Preferences Saved',
      sub: 'Your profile settings and targets have been updated.',
    });
  };

  const handleUpdateTargetWeight = (targetKg: number, currentKg?: number, heightCm?: number) => {
    const updated: UserPreferences = {
      ...preferences,
      targetWeightKg: targetKg,
      weightKg: currentKg !== undefined ? currentKg : preferences.weightKg,
      heightCm: heightCm !== undefined ? heightCm : preferences.heightCm,
    };
    setPreferences(updated);
    try {
      localStorage.setItem('vitalipulse_preferences', JSON.stringify(updated));
    } catch (e) {
      console.warn('Could not save updated weight goals:', e);
    }
    setNotification({
      message: 'Target Goals & Metrics Updated',
      sub: `Target: ${targetKg} kg • Current: ${updated.weightKg} kg (Height: ${updated.heightCm} cm). Estimated timeline updated.`,
    });
  };

  const handleTriggerAIWithNewPrefs = (updated: UserPreferences) => {
    setPreferences(updated);
    handleGenerateDietPlan(updated);
    handleGenerateWorkoutPlan(updated);
  };

  return (
    <div className="min-h-screen bg-[#F0EFEB] text-[#3D312A] flex flex-col font-sans selection:bg-[#E88E75] selection:text-[#FFF1E6]">
      {/* Toast Notification Banner - Centered on Mobile, Top Right on Desktop */}
      {notification && (
        <div className="fixed top-4 left-1/2 -translate-x-1/2 sm:left-auto sm:translate-x-0 sm:right-6 z-50 animate-in fade-in slide-in-from-top-3 w-[92%] max-w-sm">
          <div className="p-3.5 rounded-2xl bg-[#3D312A] text-[#FFF1E6] shadow-xl border border-[#EEDDD3] flex items-start justify-between gap-3">
            <div className="flex items-start gap-2.5">
              <div className="w-6 h-6 rounded-lg bg-[#E88E75] text-[#3D312A] flex items-center justify-center shrink-0 mt-0.5 font-bold">
                <CheckCircle2 className="w-4 h-4" />
              </div>
              <div>
                <p className="text-xs font-bold text-[#FFF1E6]">{notification.message}</p>
                {notification.sub && (
                  <p className="text-[11px] text-[#EEDDD3] mt-0.5 leading-relaxed">{notification.sub}</p>
                )}
              </div>
            </div>
            <button
              onClick={() => setNotification(null)}
              className="text-[#EEDDD3] hover:text-[#FFF1E6] p-1"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      )}

      {/* Top Universal App Navigation & Biometric Pulse Header */}
      <Header
        activeTab={activeTab}
        onTabChange={(tab) => setActiveTab(tab as any)}
        onOpenBreathing={() => setIsBreathingOpen(true)}
        onOpenSettings={() => setIsSettingsOpen(true)}
        onOpenAICoach={() => setIsAICoachOpen(true)}
        onOpenStatePlanner={() => setIsStatePlannerOpen(true)}
        onOpenHealthConnect={() => setIsHealthConnectModalOpen(true)}
        isWatchConnected={true}
        watchModel={preferences.watchModel || 'Redmi Watch 5 Active'}
        currentStressScore={biometrics.stressScore || 32}
      />

      {/* Main Responsive View Container */}
      <main className="flex-1 w-full max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-4 sm:py-5 pb-28 sm:pb-10">
        {activeTab === 'overview' && (
          <DashboardOverview
            dietPlan={dietPlan}
            workoutPlan={workoutPlan}
            biometrics={biometrics}
            dailyTracking={dailyTracking}
            preferences={preferences}
            coachInsight={coachInsight}
            onNavigateTab={(tab) => setActiveTab(tab)}
            onOpenAICoach={() => setIsAICoachOpen(true)}
            onOpenBreathing={() => setIsBreathingOpen(true)}
            onOpenStatePlanner={() => setIsStatePlannerOpen(true)}
            onQuickAddWater={handleAddWater}
            completedExercises={completedExercises}
            onToggleExerciseCompleted={handleToggleExerciseCompleted}
            onUpdateTargetWeight={handleUpdateTargetWeight}
          />
        )}

        {activeTab === 'diet' && (
          <DietPlanView
            dietPlan={dietPlan}
            preferences={preferences}
            dailyTracking={dailyTracking}
            onRegeneratePlan={() => handleGenerateDietPlan()}
            isRegenerating={isGeneratingDiet}
            onOpenSettings={() => setIsSettingsOpen(true)}
            onOpenStatePlanner={() => setIsStatePlannerOpen(true)}
            onLogMealToTracker={handleLogMealFromDietPlan}
          />
        )}

        {activeTab === 'watch' && (
          <RedmiWatchView
            biometrics={biometrics}
            preferences={preferences}
            onUpdateBiometrics={setBiometrics}
            onQuickSync={handleQuickWatchSync}
            isSyncing={isSyncingWatch}
            onOpenBreathing={() => setIsBreathingOpen(true)}
            onOpenHealthConnectModal={() => setIsHealthConnectModalOpen(true)}
          />
        )}

        {activeTab === 'workout' && (
          <WorkoutPlanView
            workoutPlan={workoutPlan}
            preferences={preferences}
            biometrics={biometrics}
            onRefreshWorkoutPlan={() => handleGenerateWorkoutPlan()}
            isLoading={isGeneratingWorkouts}
            onOpenStatePlanner={() => setIsStatePlannerOpen(true)}
            completedExercises={completedExercises}
            onToggleExerciseCompleted={handleToggleExerciseCompleted}
          />
        )}

        {activeTab === 'nutrition' && (
          <NutritionLogView
            dailyTracking={dailyTracking}
            preferences={preferences}
            biometrics={biometrics}
            onAddFood={handleAddFood}
            onRemoveFood={handleRemoveFood}
            onAddWater={handleAddWater}
            onRemoveWater={handleRemoveWater}
            onAnalyzeFoodWithAI={handleAnalyzeFoodWithAI}
          />
        )}
      </main>

      {/* Mobile-First Floating Touch Bottom App Bar */}
      <MobileBottomNav
        activeTab={activeTab}
        onTabChange={(tab) => setActiveTab(tab as any)}
        onOpenStatePlanner={() => setIsStatePlannerOpen(true)}
      />

      {/* Dynamic AI State & Condition Planner Modal */}
      <AIStatePlannerModal
        isOpen={isStatePlannerOpen}
        onClose={() => setIsStatePlannerOpen(false)}
        onAdaptPlan={handleAdaptPlanFromCondition}
        isLoading={isAdaptingFromCondition}
        preferences={preferences}
        biometrics={biometrics}
      />

      {/* Modal Dialogs */}
      <BreathingPacerModal
        isOpen={isBreathingOpen}
        onClose={() => setIsBreathingOpen(false)}
        currentStressScore={biometrics.stressScore || 32}
      />

      <AICoachModal
        isOpen={isAICoachOpen}
        onClose={() => setIsAICoachOpen(false)}
        insight={coachInsight}
        onRefreshCoach={handleRefreshAICoach}
        isLoading={isGeneratingCoach}
        biometrics={biometrics}
        dailyTracking={dailyTracking}
        preferences={preferences}
        onOpenBreathing={() => {
          setIsAICoachOpen(false);
          setIsBreathingOpen(true);
        }}
      />

      <PersonalInstructionsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        preferences={preferences}
        onSave={handleSavePreferences}
        onTriggerGenerate={handleTriggerAIWithNewPrefs}
        isGenerating={isGeneratingDiet || isGeneratingWorkouts}
      />

      <HealthConnectFetchModal
        isOpen={isHealthConnectModalOpen}
        onClose={() => setIsHealthConnectModalOpen(false)}
        preferences={preferences}
        onApplyBiometrics={setBiometrics}
        showNotification={(msg) => setNotification({ message: msg })}
      />
    </div>
  );
}

export default App;
