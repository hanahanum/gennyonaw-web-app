import {
  UserPreferences,
  WeeklyDietPlan,
  WeeklyWorkoutPlan,
  DailyBiometricSummary,
  DailyTrackingState,
  AICoachInsight,
  FoodLogEntry,
  WaterLogEntry,
} from '../types';
import { DEFAULT_PREFERENCES, generateDailyBiometrics } from './mockWatchData';
import { DEFAULT_DIET_PLAN, DEFAULT_WORKOUT_PLAN, DEFAULT_AI_COACH_INSIGHT } from './defaultPlans';

const STORAGE_KEYS = {
  PREFERENCES: 'df_preferences_v1',
  DIET_PLAN: 'df_diet_plan_v1',
  WORKOUT_PLAN: 'df_workout_plan_v1',
  BIOMETRICS: 'df_biometrics_v1',
  DAILY_TRACKING: 'df_daily_tracking_v1',
  COACH_INSIGHT: 'df_coach_insight_v1',
};

export function loadPreferences(): UserPreferences {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.PREFERENCES);
    if (raw) return JSON.parse(raw);
  } catch (e) {
    console.error('Error loading preferences', e);
  }
  return DEFAULT_PREFERENCES;
}

export function savePreferences(prefs: UserPreferences): void {
  try {
    localStorage.setItem(STORAGE_KEYS.PREFERENCES, JSON.stringify(prefs));
  } catch (e) {
    console.error('Error saving preferences', e);
  }
}

export function loadDietPlan(): WeeklyDietPlan {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.DIET_PLAN);
    if (raw) return JSON.parse(raw);
  } catch (e) {
    console.error('Error loading diet plan', e);
  }
  return DEFAULT_DIET_PLAN;
}

export function saveDietPlan(plan: WeeklyDietPlan): void {
  try {
    localStorage.setItem(STORAGE_KEYS.DIET_PLAN, JSON.stringify(plan));
  } catch (e) {
    console.error('Error saving diet plan', e);
  }
}

export function loadWorkoutPlan(): WeeklyWorkoutPlan {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.WORKOUT_PLAN);
    if (raw) return JSON.parse(raw);
  } catch (e) {
    console.error('Error loading workout plan', e);
  }
  return DEFAULT_WORKOUT_PLAN;
}

export function saveWorkoutPlan(plan: WeeklyWorkoutPlan): void {
  try {
    localStorage.setItem(STORAGE_KEYS.WORKOUT_PLAN, JSON.stringify(plan));
  } catch (e) {
    console.error('Error saving workout plan', e);
  }
}

export function loadBiometrics(dateStr?: string): DailyBiometricSummary {
  const dateKey = dateStr || new Date().toISOString().split('T')[0];
  try {
    const raw = localStorage.getItem(`${STORAGE_KEYS.BIOMETRICS}_${dateKey}`);
    if (raw) return JSON.parse(raw);
  } catch (e) {
    console.error('Error loading biometrics', e);
  }
  const generated = generateDailyBiometrics(dateKey);
  saveBiometrics(generated);
  return generated;
}

export function saveBiometrics(bio: DailyBiometricSummary): void {
  try {
    localStorage.setItem(`${STORAGE_KEYS.BIOMETRICS}_${bio.date}`, JSON.stringify(bio));
  } catch (e) {
    console.error('Error saving biometrics', e);
  }
}

export function loadDailyTracking(dateStr?: string): DailyTrackingState {
  const dateKey = dateStr || new Date().toISOString().split('T')[0];
  try {
    const raw = localStorage.getItem(`${STORAGE_KEYS.DAILY_TRACKING}_${dateKey}`);
    if (raw) return JSON.parse(raw);
  } catch (e) {
    console.error('Error loading daily tracking', e);
  }

  // Pre-seed with sample breakfast & water for a full active demo feel
  const initialFood: FoodLogEntry[] = [
    {
      id: 'init-1',
      timestamp: '08:30',
      mealType: 'breakfast',
      name: 'Protein Blueberry Overnight Oats',
      calories: 480,
      proteinG: 36,
      carbsG: 58,
      fatG: 11,
      portion: '1 jar (300g)',
      source: 'diet_plan',
    },
    {
      id: 'init-2',
      timestamp: '10:45',
      mealType: 'snack',
      name: 'Matcha Green Tea & Almonds',
      calories: 180,
      proteinG: 8,
      carbsG: 12,
      fatG: 10,
      portion: '1 cup + 15g nuts',
      source: 'manual',
    },
  ];

  const initialWater: WaterLogEntry[] = [
    { id: 'w-1', timestamp: '07:30', amountMl: 500 },
    { id: 'w-2', timestamp: '09:45', amountMl: 350 },
    { id: 'w-3', timestamp: '12:15', amountMl: 500 },
    { id: 'w-4', timestamp: '15:30', amountMl: 400 },
  ];

  const totalCalories = initialFood.reduce((sum, f) => sum + f.calories, 0);
  const totalProteinG = initialFood.reduce((sum, f) => sum + f.proteinG, 0);
  const totalCarbsG = initialFood.reduce((sum, f) => sum + f.carbsG, 0);
  const totalFatG = initialFood.reduce((sum, f) => sum + f.fatG, 0);
  const totalWaterMl = initialWater.reduce((sum, w) => sum + w.amountMl, 0);

  const initial: DailyTrackingState = {
    date: dateKey,
    foodLogs: initialFood,
    waterLogs: initialWater,
    totalCalories,
    totalProteinG,
    totalCarbsG,
    totalFatG,
    totalWaterMl,
  };

  saveDailyTracking(initial);
  return initial;
}

export function saveDailyTracking(state: DailyTrackingState): void {
  try {
    localStorage.setItem(`${STORAGE_KEYS.DAILY_TRACKING}_${state.date}`, JSON.stringify(state));
  } catch (e) {
    console.error('Error saving daily tracking', e);
  }
}

export function loadCoachInsight(): AICoachInsight {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.COACH_INSIGHT);
    if (raw) return JSON.parse(raw);
  } catch (e) {
    console.error('Error loading coach insight', e);
  }
  return DEFAULT_AI_COACH_INSIGHT;
}

export function saveCoachInsight(insight: AICoachInsight): void {
  try {
    localStorage.setItem(STORAGE_KEYS.COACH_INSIGHT, JSON.stringify(insight));
  } catch (e) {
    console.error('Error saving coach insight', e);
  }
}

// Consolidated App State Loader & Saver
export interface FullAppState {
  preferences: UserPreferences;
  dietPlan: WeeklyDietPlan;
  workoutPlan: WeeklyWorkoutPlan;
  biometrics: DailyBiometricSummary;
  dailyTracking: DailyTrackingState;
  coachInsight: AICoachInsight;
}

export function loadState(): FullAppState {
  const prefs = loadPreferences();
  return {
    preferences: prefs,
    dietPlan: loadDietPlan(),
    workoutPlan: loadWorkoutPlan(),
    biometrics: loadBiometrics(),
    dailyTracking: loadDailyTracking(),
    coachInsight: loadCoachInsight(),
  };
}

export function saveState(state: FullAppState): void {
  savePreferences(state.preferences);
  saveDietPlan(state.dietPlan);
  saveWorkoutPlan(state.workoutPlan);
  saveBiometrics(state.biometrics);
  saveDailyTracking(state.dailyTracking);
  saveCoachInsight(state.coachInsight);
}

export function shouldAutoRefreshWeeklyPlan(lastGeneratedAt?: string, refreshDay: number = 1): boolean {
  if (!lastGeneratedAt) return true;
  const lastDate = new Date(lastGeneratedAt);
  const now = new Date();
  const diffDays = (now.getTime() - lastDate.getTime()) / (1000 * 3600 * 24);
  if (diffDays >= 7) return true;

  const todayDay = now.getDay();
  if (todayDay === refreshDay && diffDays >= 1) return true;

  return false;
}

export function shouldRefreshWeekly(refreshDay: number = 1): boolean {
  const prefs = loadPreferences();
  return shouldAutoRefreshWeeklyPlan(prefs.lastPlanGeneratedAt, refreshDay);
}

export function updateWeeklyRefreshTimestamp(): void {
  const prefs = loadPreferences();
  prefs.lastPlanGeneratedAt = new Date().toISOString();
  savePreferences(prefs);
}

