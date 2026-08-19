export type UserConditionType =
  | 'normal'
  | 'fatigued'
  | 'sore_legs'
  | 'sore_upper'
  | 'high_stress'
  | 'short_time'
  | 'period_care';

export interface UserConditionInfo {
  type: UserConditionType;
  label: string;
  emoji: string;
  description: string;
  intensityModifier: 'Low' | 'Moderate' | 'High' | 'Recovery';
  adaptationNote: string;
}

export interface BmiAnalysis {
  heightCm: number;
  currentBmi: number;
  currentCategory: 'Underweight' | 'Healthy Weight' | 'Overweight' | 'Obese';
  targetBmi: number;
  targetCategory: 'Underweight' | 'Healthy Weight' | 'Overweight' | 'Obese';
  minHealthyWeightKg: number;
  maxHealthyWeightKg: number;
  idealWeightKg: number;
  isTargetHealthy: boolean;
  advice: string;
}

export interface GoalTimelineProjection {
  currentWeightKg: number;
  targetWeightKg: number;
  heightCm: number;
  weightDeltaKg: number;
  dailyCalorieIntake: number;
  dailyTotalBurn: number;
  dailyDeficitKcal: number;
  weeklyRateKg: number;
  estimatedWeeks: number;
  estimatedCompletionDate: string;
  paceDescription: 'Gentle & Sustainable' | 'Optimal Fat Loss' | 'Accelerated' | 'Surplus / Muscle Growth' | 'Maintenance';
  bmi: BmiAnalysis;
}

export type EquipmentType =
  | 'bodyweight'
  | 'dumbbells'
  | 'resistance_bands'
  | 'kettlebell'
  | 'full_gym'
  | 'home_props';

export interface UserPreferences {
  name: string;
  age: number;
  gender: 'male' | 'female' | 'other';
  heightCm: number;
  weightKg: number;
  targetWeightKg: number;
  activityLevel: 'sedentary' | 'lightly_active' | 'moderately_active' | 'very_active';
  dietaryGoal: 'weight_loss' | 'muscle_gain' | 'maintenance' | 'endurance' | 'health_longevity';
  dietType: 'balanced' | 'high_protein' | 'keto' | 'mediterranean' | 'vegetarian' | 'vegan' | 'pescatarian' | 'low_carb';
  availableEquipment: string[];
  equipmentType?: EquipmentType;
  allergies: string[];
  dislikedFoods: string[];
  customInstructions: string;
  targetCalories: number;
  targetProteinG: number;
  targetCarbsG: number;
  targetFatG: number;
  targetWaterMl: number;
  targetSteps: number;
  autoWeeklyRefreshDay: number; // 0 = Sunday, 1 = Monday
  lastPlanGeneratedAt?: string;
  watchModel: string;
  watchConnected: boolean;
  watchSyncMethod: 'mi_fitness' | 'google_fit' | 'zepp_life' | 'manual_file' | 'bluetooth_sim';
}

export interface MealItem {
  id: string;
  name: string;
  description: string;
  calories: number;
  proteinG: number;
  carbsG: number;
  fatG: number;
  fiberG?: number;
  prepTimeMinutes: number;
  ingredients: string[];
  recipeInstructions?: string[];
  tags: string[];
  isLogged?: boolean;
}

export interface DayDietPlan {
  dayName: string; // 'Monday', 'Tuesday', etc.
  dayDate?: string;
  targetCalories: number;
  breakfast: MealItem;
  lunch: MealItem;
  dinner: MealItem;
  snack: MealItem;
  totalCalories: number;
  totalProteinG: number;
  totalCarbsG: number;
  totalFatG: number;
  dailyTip: string;
}

export interface WeeklyDietPlan {
  id: string;
  generatedAt: string;
  validUntil: string;
  title: string;
  overviewSummary: string;
  days: DayDietPlan[];
  groceryList: {
    category: string;
    items: string[];
  }[];
}

export interface ExerciseItem {
  id: string;
  name: string;
  sets: number;
  reps: string; // e.g. "10-12" or "45s"
  restSeconds: number;
  targetMuscle: string;
  equipment: string;
  caloriesBurnEstimate: number;
  notes?: string;
  completed?: boolean;
}

export interface DayWorkoutPlan {
  dayName: string;
  focusArea: string; // e.g., 'Upper Body Strength', 'Zone 2 Cardio & Mobility', 'Active Recovery'
  isRestDay: boolean;
  warmupMinutes: number;
  workoutDurationMinutes: number;
  exercises: ExerciseItem[];
  cooldownMinutes: number;
  estimatedBurnCalories: number;
  intensityLevel: 'Low' | 'Moderate' | 'High' | 'Recovery';
  recoveryTip?: string;
}

export interface WeeklyWorkoutPlan {
  id: string;
  generatedAt: string;
  title: string;
  summary: string;
  days: DayWorkoutPlan[];
}

export interface BiometricReading {
  timestamp: string; // ISO or HH:mm
  heartRateBpm: number;
  stressScore: number; // 0 - 100
  stressLevel: 'relaxed' | 'mild' | 'moderate' | 'high';
  activityState: 'resting' | 'standing' | 'walking' | 'running' | 'workout' | 'sleeping';
  stepIncrement: number;
}

export interface DailyBiometricSummary {
  date: string;
  restingHeartRate: number;
  avgHeartRate: number;
  maxHeartRate: number;
  minHeartRate: number;
  avgStressScore: number;
  stressPeakTime: string;
  totalSteps: number;
  totalDistanceKm: number;
  activeCaloriesBurned: number;
  standingHours: number;
  activeMinutes: number;
  readinessScore: number; // 0 - 100
  sleepHours: number;
  sleepQuality: 'poor' | 'fair' | 'good' | 'optimal';
  hourlyReadings: BiometricReading[];
}

export interface FoodLogEntry {
  id: string;
  timestamp: string;
  mealType: 'breakfast' | 'lunch' | 'dinner' | 'snack';
  name: string;
  calories: number;
  proteinG: number;
  carbsG: number;
  fatG: number;
  portion: string;
  source: 'ai_parsed' | 'diet_plan' | 'manual';
}

export interface WaterLogEntry {
  id: string;
  timestamp: string;
  amountMl: number;
}

export interface DailyTrackingState {
  date: string;
  foodLogs: FoodLogEntry[];
  waterLogs: WaterLogEntry[];
  totalCalories: number;
  totalProteinG: number;
  totalCarbsG: number;
  totalFatG: number;
  totalWaterMl: number;
}

export interface AICoachInsight {
  id: string;
  generatedAt: string;
  overallStatus: 'excellent' | 'good' | 'needs_attention' | 'recovery_needed';
  headline: string;
  summary: string;
  nutritionAdvice: string;
  workoutAdjustment: string;
  stressMitigationTip: string;
  hydrationAlert: string;
  readinessScore: number;
}
