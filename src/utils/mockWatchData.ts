import { DailyBiometricSummary, BiometricReading, UserPreferences } from '../types';

export const DEFAULT_PREFERENCES: UserPreferences = {
  name: 'Alex Tan',
  age: 28,
  gender: 'male',
  heightCm: 175,
  weightKg: 74,
  targetWeightKg: 70,
  activityLevel: 'moderately_active',
  dietaryGoal: 'weight_loss',
  dietType: 'high_protein',
  allergies: ['Peanuts'],
  dislikedFoods: ['Eggplant', 'Bitter gourd'],
  customInstructions: 'Prefer quick 20-min meals for weekdays. Include 1 matcha or green tea snack. High protein (min 130g) to preserve muscle mass while burning fat.',
  targetCalories: 2100,
  targetProteinG: 145,
  targetCarbsG: 190,
  targetFatG: 65,
  targetWaterMl: 2800,
  targetSteps: 10000,
  autoWeeklyRefreshDay: 1, // Monday
  availableEquipment: ['No Equipment (Bodyweight / Mat)', 'Resistance Bands & Mat', 'Dumbbells (Home Gym)'],
  equipmentType: 'dumbbells',
  watchModel: 'Redmi Watch 4 (Active)',
  watchConnected: true,
  watchSyncMethod: 'mi_fitness',
  lastPlanGeneratedAt: new Date(Date.now() - 2 * 86400000).toISOString(),
};

export function getStressLevel(score: number): 'relaxed' | 'mild' | 'moderate' | 'high' {
  if (score < 30) return 'relaxed';
  if (score < 60) return 'mild';
  if (score < 80) return 'moderate';
  return 'high';
}

export function generateDailyBiometrics(dateStr?: string): DailyBiometricSummary {
  const today = dateStr || new Date().toISOString().split('T')[0];
  const hourlyReadings: BiometricReading[] = [];

  let accumulatedSteps = 0;
  let standingHours = 0;
  let activeMinutes = 0;

  // Generate 24 hours of realistic data
  for (let hour = 0; hour < 24; hour++) {
    const timeLabel = `${hour.toString().padStart(2, '0')}:00`;
    let hr = 62;
    let stress = 22;
    let activityState: BiometricReading['activityState'] = 'resting';
    let stepInc = 0;

    if (hour >= 0 && hour < 7) {
      // Sleep time
      hr = Math.floor(54 + Math.random() * 8);
      stress = Math.floor(10 + Math.random() * 15);
      activityState = 'sleeping';
      stepInc = 0;
    } else if (hour >= 7 && hour < 9) {
      // Morning routine & commute
      hr = Math.floor(75 + Math.random() * 18);
      stress = Math.floor(35 + Math.random() * 25);
      activityState = 'walking';
      stepInc = Math.floor(800 + Math.random() * 600);
      standingHours++;
      activeMinutes += 20;
    } else if (hour >= 9 && hour < 12) {
      // Work focus
      hr = Math.floor(68 + Math.random() * 12);
      stress = Math.floor(45 + Math.random() * 30);
      activityState = 'standing';
      stepInc = Math.floor(150 + Math.random() * 200);
      standingHours++;
    } else if (hour >= 12 && hour < 14) {
      // Lunch walk
      hr = Math.floor(78 + Math.random() * 15);
      stress = Math.floor(30 + Math.random() * 20);
      activityState = 'walking';
      stepInc = Math.floor(1100 + Math.random() * 700);
      standingHours++;
      activeMinutes += 25;
    } else if (hour >= 14 && hour < 17) {
      // Afternoon meetings & mild stress
      hr = Math.floor(72 + Math.random() * 15);
      stress = Math.floor(52 + Math.random() * 32);
      activityState = 'standing';
      stepInc = Math.floor(200 + Math.random() * 250);
      standingHours++;
    } else if (hour >= 17 && hour < 19) {
      // Evening workout / brisk run
      hr = Math.floor(132 + Math.random() * 32);
      stress = Math.floor(65 + Math.random() * 20); // Physical exertion stress
      activityState = 'workout';
      stepInc = Math.floor(3200 + Math.random() * 1200);
      standingHours++;
      activeMinutes += 45;
    } else if (hour >= 19 && hour < 22) {
      // Dinner & relaxation
      hr = Math.floor(66 + Math.random() * 10);
      stress = Math.floor(25 + Math.random() * 18);
      activityState = 'resting';
      stepInc = Math.floor(300 + Math.random() * 300);
      standingHours++;
    } else {
      // Pre-bed wind-down
      hr = Math.floor(58 + Math.random() * 8);
      stress = Math.floor(15 + Math.random() * 12);
      activityState = 'resting';
      stepInc = 50;
    }

    accumulatedSteps += stepInc;

    hourlyReadings.push({
      timestamp: timeLabel,
      heartRateBpm: hr,
      stressScore: stress,
      stressLevel: getStressLevel(stress),
      activityState,
      stepIncrement: stepInc,
    });
  }

  const heartRates = hourlyReadings.map(r => r.heartRateBpm);
  const stressScores = hourlyReadings.map(r => r.stressScore);

  const minHr = Math.min(...heartRates);
  const maxHr = Math.max(...heartRates);
  const avgHr = Math.round(heartRates.reduce((a, b) => a + b, 0) / heartRates.length);
  const restingHr = Math.round(heartRates.slice(1, 6).reduce((a, b) => a + b, 0) / 5);
  const avgStress = Math.round(stressScores.reduce((a, b) => a + b, 0) / stressScores.length);

  const peakStressIdx = stressScores.indexOf(Math.max(...stressScores));
  const stressPeakTime = hourlyReadings[peakStressIdx]?.timestamp || '15:00';

  const distanceKm = +(accumulatedSteps * 0.00078).toFixed(2);
  const activeCalories = Math.round(accumulatedSteps * 0.042 + activeMinutes * 4.5);

  // Readiness score derived from resting HR, average stress, sleep hours
  const sleepHrs = 7.4;
  let readiness = 88;
  if (restingHr > 65) readiness -= 8;
  if (avgStress > 50) readiness -= 12;
  if (sleepHrs < 7) readiness -= 10;
  readiness = Math.max(30, Math.min(98, readiness));

  return {
    date: today,
    restingHeartRate: restingHr,
    avgHeartRate: avgHr,
    maxHeartRate: maxHr,
    minHeartRate: minHr,
    avgStressScore: avgStress,
    stressPeakTime,
    totalSteps: accumulatedSteps,
    totalDistanceKm: distanceKm,
    activeCaloriesBurned: activeCalories,
    standingHours: Math.min(14, standingHours),
    activeMinutes,
    readinessScore: readiness,
    sleepHours: sleepHrs,
    sleepQuality: 'good',
    hourlyReadings,
  };
}

export const generateSimulatedRedmiData = generateDailyBiometrics;

export function parseHealthFile(content: string, filename: string): Partial<DailyBiometricSummary> | null {
  try {
    if (filename.endsWith('.json')) {
      const parsed = JSON.parse(content);
      if (parsed.steps || parsed.heartRate || parsed.stress) {
        return {
          totalSteps: Number(parsed.steps) || 8500,
          avgHeartRate: Number(parsed.heartRate) || 72,
          avgStressScore: Number(parsed.stress) || 42,
          activeCaloriesBurned: Number(parsed.calories) || 420,
        };
      }
    }
    // Simple CSV parser for Mi Fitness / Zepp exported tables
    if (filename.endsWith('.csv')) {
      const lines = content.split('\n').filter(l => l.trim().length > 0);
      let totalSteps = 0;
      let hrValues: number[] = [];
      for (const line of lines.slice(1)) {
        const cols = line.split(',');
        if (cols.length >= 2) {
          const val = parseFloat(cols[1]);
          if (!isNaN(val)) {
            if (val > 200) totalSteps += val;
            else if (val > 40 && val < 220) hrValues.push(val);
          }
        }
      }
      return {
        totalSteps: totalSteps || 9200,
        avgHeartRate: hrValues.length ? Math.round(hrValues.reduce((a, b) => a + b, 0) / hrValues.length) : 74,
      };
    }
  } catch (e) {
    console.error('Failed to parse health file', e);
  }
  return null;
}
