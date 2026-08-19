import { UserConditionType, UserConditionInfo, DayWorkoutPlan, GoalTimelineProjection, BmiAnalysis } from '../types';

export const USER_CONDITIONS: UserConditionInfo[] = [
  {
    type: 'normal',
    label: 'Normal / High Energy',
    emoji: '⚡',
    description: 'Ready for full scheduled workout intensity and volume.',
    intensityModifier: 'High',
    adaptationNote: 'Optimal physiological state for progressive overload & fat burn.',
  },
  {
    type: 'fatigued',
    label: 'Fatigued / Low Sleep',
    emoji: '😴',
    description: 'Feeling sluggish or had <6.5 hrs sleep according to Redmi Watch.',
    intensityModifier: 'Moderate',
    adaptationNote: 'AI reduced exercise sets by 25% and increased rest periods to prevent central nervous system burnout.',
  },
  {
    type: 'sore_legs',
    label: 'Leg & Glute Soreness',
    emoji: '🦵',
    description: 'DOMS in quadriceps, hamstrings, or calves.',
    intensityModifier: 'Moderate',
    adaptationNote: 'AI swapped heavy lower-body lifts for upper-body pump & gentle active hamstring decompression.',
  },
  {
    type: 'sore_upper',
    label: 'Upper Body Soreness',
    emoji: '💪',
    description: 'Soreness in shoulders, chest, or upper back.',
    intensityModifier: 'Moderate',
    adaptationNote: 'AI shifted target muscle groups to core stability and low-impact steady state cardio.',
  },
  {
    type: 'high_stress',
    label: 'High Stress / Anxious',
    emoji: '🧘‍♀️',
    description: 'Redmi Watch stress > 60 or high mental fatigue.',
    intensityModifier: 'Recovery',
    adaptationNote: 'AI replaced high-cortisol HIIT with Zone 2 mobility & parasympathetic breath resets.',
  },
  {
    type: 'short_time',
    label: 'Short on Time (15-20 min)',
    emoji: '⏱️',
    description: 'Need a fast, high-efficiency condensed session today.',
    intensityModifier: 'Moderate',
    adaptationNote: 'AI condensed routine into high-efficiency compound supersets without warmup compromise.',
  },
  {
    type: 'period_care',
    label: 'Period Care / Low Impact',
    emoji: '🌸',
    description: 'Cramps, pelvic tension, or low hormonal energy phase.',
    intensityModifier: 'Recovery',
    adaptationNote: 'AI prioritized pelvic floor relaxation, gentle hip openers, and soothing somatic stretches.',
  },
];

export function adaptWorkoutForCondition(
  basePlan: DayWorkoutPlan,
  condition: UserConditionType
): DayWorkoutPlan {
  if (condition === 'normal') {
    return basePlan;
  }

  const conditionInfo = USER_CONDITIONS.find((c) => c.type === condition);

  switch (condition) {
    case 'fatigued':
      return {
        ...basePlan,
        focusArea: `${basePlan.focusArea} (Fatigue Adjusted)`,
        intensityLevel: 'Moderate',
        workoutDurationMinutes: Math.max(20, Math.round(basePlan.workoutDurationMinutes * 0.75)),
        estimatedBurnCalories: Math.round(basePlan.estimatedBurnCalories * 0.78),
        recoveryTip: 'Hydrate with electrolytes and aim for an early bedtime tonight.',
        exercises: basePlan.exercises.map((ex) => ({
          ...ex,
          sets: Math.max(2, ex.sets - 1),
          restSeconds: ex.restSeconds + 20,
          notes: ex.notes ? `${ex.notes} • Focus on form over load` : 'Focus on smooth control',
        })),
      };

    case 'sore_legs':
      return {
        ...basePlan,
        focusArea: 'Upper Body & Core Decompression (Leg Relief)',
        intensityLevel: 'Moderate',
        estimatedBurnCalories: Math.round(basePlan.estimatedBurnCalories * 0.85),
        recoveryTip: 'Elevate legs and do light 5-min foam rolling before sleep.',
        exercises: [
          {
            id: 'mod-upper-1',
            name: 'Dumbbell Seated Shoulder Press',
            sets: 3,
            reps: '10-12',
            restSeconds: 60,
            targetMuscle: 'Deltoids / Triceps',
            equipment: 'Dumbbells / Resistance Band',
            caloriesBurnEstimate: 45,
            notes: 'Zero lower body pressure',
          },
          {
            id: 'mod-upper-2',
            name: 'Incline Push-ups or Floor Chest Press',
            sets: 3,
            reps: '12',
            restSeconds: 60,
            targetMuscle: 'Pectorals',
            equipment: 'Mat / Bench',
            caloriesBurnEstimate: 40,
            notes: 'Smooth, controlled cadence',
          },
          {
            id: 'mod-upper-3',
            name: 'Seated Resistance Band Cable Rows',
            sets: 3,
            reps: '12-15',
            restSeconds: 60,
            targetMuscle: 'Rhomboids / Lats',
            equipment: 'Resistance Band',
            caloriesBurnEstimate: 40,
            notes: 'Squeeze shoulder blades',
          },
          {
            id: 'mod-upper-4',
            name: 'Dead Bug Core Stability & Leg Hang',
            sets: 3,
            reps: '10 per side',
            restSeconds: 45,
            targetMuscle: 'Transverse Abdominis',
            equipment: 'Mat',
            caloriesBurnEstimate: 30,
            notes: 'Spine neutral against mat',
          },
        ],
      };

    case 'sore_upper':
      return {
        ...basePlan,
        focusArea: 'Lower Body Tone & Posture Restoration',
        intensityLevel: 'Moderate',
        estimatedBurnCalories: Math.round(basePlan.estimatedBurnCalories * 0.9),
        recoveryTip: 'Perform gentle shoulder rolls and doorway chest stretches.',
        exercises: [
          {
            id: 'mod-lower-1',
            name: 'Bodyweight Glute Bridges & Pulse',
            sets: 3,
            reps: '15-18',
            restSeconds: 45,
            targetMuscle: 'Gluteus Maximus',
            equipment: 'Mat',
            caloriesBurnEstimate: 40,
            notes: 'Hold at top for 2 seconds',
          },
          {
            id: 'mod-lower-2',
            name: 'Dumbbell Romanian Deadlift (Light/Moderate)',
            sets: 3,
            reps: '10-12',
            restSeconds: 60,
            targetMuscle: 'Hamstrings & Posterior Chain',
            equipment: 'Light Dumbbells',
            caloriesBurnEstimate: 48,
            notes: 'Keep back flat, hinge at hips',
          },
          {
            id: 'mod-lower-3',
            name: 'Step-ups or Static Lunges',
            sets: 3,
            reps: '10 per leg',
            restSeconds: 60,
            targetMuscle: 'Quadriceps / Glutes',
            equipment: 'Stair / Platform',
            caloriesBurnEstimate: 50,
            notes: 'Zero upper body strain',
          },
          {
            id: 'mod-lower-4',
            name: 'Zone 2 Brisk Treadmill / Incline Walk',
            sets: 1,
            reps: '15 mins',
            restSeconds: 0,
            targetMuscle: 'Cardiorespiratory / Mobility',
            equipment: 'Walking Track / Outdoors',
            caloriesBurnEstimate: 80,
            notes: 'Nasal breathing only',
          },
        ],
      };

    case 'high_stress':
      return {
        ...basePlan,
        focusArea: 'Parasympathetic Reset & Restorative Flow',
        intensityLevel: 'Recovery',
        workoutDurationMinutes: 25,
        estimatedBurnCalories: 120,
        recoveryTip: 'Cortisol-lowering session. Pair with 4-7-8 breathing pacer.',
        exercises: [
          {
            id: 'stress-1',
            name: 'Cat-Cow Spinal Wave & Thoracic Opener',
            sets: 3,
            reps: '10 cycles',
            restSeconds: 30,
            targetMuscle: 'Spine Mobility',
            equipment: 'Mat',
            caloriesBurnEstimate: 25,
            notes: 'Inhale arch, exhale round',
          },
          {
            id: 'stress-2',
            name: "Child's Pose Side Stretch & Deep Diaphragmatic Breath",
            sets: 3,
            reps: '45s hold',
            restSeconds: 30,
            targetMuscle: 'Lats / Intercostals',
            equipment: 'Mat',
            caloriesBurnEstimate: 20,
            notes: 'Breathe into lower ribcage',
          },
          {
            id: 'stress-3',
            name: 'World’s Greatest Stretch & Hip Opener',
            sets: 3,
            reps: '6 per side',
            restSeconds: 40,
            targetMuscle: 'Hip Flexors / Thoracic Spine',
            equipment: 'Mat',
            caloriesBurnEstimate: 35,
            notes: 'Slow, fluid rotation',
          },
          {
            id: 'stress-4',
            name: 'Legs-Up-The-Wall Lymphatic Flush',
            sets: 1,
            reps: '5 mins',
            restSeconds: 0,
            targetMuscle: 'Vascular Rest / Central Nervous System',
            equipment: 'Wall / Mat',
            caloriesBurnEstimate: 20,
            notes: 'Deep relaxation, relax jaw and shoulders',
          },
        ],
      };

    case 'short_time':
      return {
        ...basePlan,
        focusArea: '18-Min Express Full Body Sculpt',
        intensityLevel: 'High',
        workoutDurationMinutes: 18,
        estimatedBurnCalories: 190,
        recoveryTip: 'High efficiency workout complete in under 20 minutes.',
        exercises: [
          {
            id: 'short-1',
            name: 'Dumbbell Thruster (Squat to Overhead Press)',
            sets: 3,
            reps: '10',
            restSeconds: 45,
            targetMuscle: 'Full Body Compound',
            equipment: 'Pair of Dumbbells',
            caloriesBurnEstimate: 60,
            notes: 'Explosive drive from legs',
          },
          {
            id: 'short-2',
            name: 'Renegade Rows + Push-Up Combo',
            sets: 3,
            reps: '8 per side',
            restSeconds: 45,
            targetMuscle: 'Core & Upper Body',
            equipment: 'Dumbbells / Mat',
            caloriesBurnEstimate: 55,
            notes: 'Keep hips square and stable',
          },
          {
            id: 'short-3',
            name: 'Alternating Reverse Lunges with Bicep Curl',
            sets: 3,
            reps: '10 per leg',
            restSeconds: 45,
            targetMuscle: 'Glutes / Biceps',
            equipment: 'Dumbbells',
            caloriesBurnEstimate: 50,
            notes: 'Control the descent',
          },
          {
            id: 'short-4',
            name: 'Mountain Climbers to Plank Hold Finisher',
            sets: 2,
            reps: '30s + 20s hold',
            restSeconds: 30,
            targetMuscle: 'Core & Cardio Spike',
            equipment: 'Mat',
            caloriesBurnEstimate: 35,
            notes: 'Keep shoulders over wrists',
          },
        ],
      };

    case 'period_care':
      return {
        ...basePlan,
        focusArea: 'Gentle Period Care & Pelvic Release',
        intensityLevel: 'Recovery',
        workoutDurationMinutes: 22,
        estimatedBurnCalories: 105,
        recoveryTip: 'Zero abdominal crunching. Gentle circulation and warmth.',
        exercises: [
          {
            id: 'period-1',
            name: 'Supported Reclined Butterfly Pose (Supta Baddha Konasana)',
            sets: 2,
            reps: '2 mins hold',
            restSeconds: 30,
            targetMuscle: 'Adductors & Pelvic Floor',
            equipment: 'Mat / Cushion',
            caloriesBurnEstimate: 20,
            notes: 'Place cushions under knees if needed',
          },
          {
            id: 'period-2',
            name: 'Supine Spinal Twist & Hip Release',
            sets: 2,
            reps: '60s per side',
            restSeconds: 30,
            targetMuscle: 'Lower Back & Glutes',
            equipment: 'Mat',
            caloriesBurnEstimate: 22,
            notes: 'Gentle, soothing stretch',
          },
          {
            id: 'period-3',
            name: 'Cat-Cow with Slow Hip Circles',
            sets: 3,
            reps: '8 circles each way',
            restSeconds: 30,
            targetMuscle: 'Pelvic & Lumbar Mobility',
            equipment: 'Mat',
            caloriesBurnEstimate: 25,
            notes: 'Loosens lower back tightness',
          },
          {
            id: 'period-4',
            name: 'Pigeon Pose or Figure 4 Stretch',
            sets: 2,
            reps: '60s per side',
            restSeconds: 30,
            targetMuscle: 'Piriformis / Hip Flexors',
            equipment: 'Mat',
            caloriesBurnEstimate: 20,
            notes: 'Breathe smoothly through tension',
          },
        ],
      };

    default:
      return basePlan;
  }
}

export function calculateBMI(
  weightKg: number,
  heightCm: number
): {
  bmi: number;
  category: 'Underweight' | 'Healthy Weight' | 'Overweight' | 'Obese';
  minHealthyWeightKg: number;
  maxHealthyWeightKg: number;
  idealWeightKg: number;
} {
  const safeHeightCm = Math.max(100, Math.min(250, heightCm || 162));
  const safeWeightKg = Math.max(30, Math.min(300, weightKg || 60));
  const heightM = safeHeightCm / 100;
  const bmi = +(safeWeightKg / (heightM * heightM)).toFixed(1);

  let category: 'Underweight' | 'Healthy Weight' | 'Overweight' | 'Obese';
  if (bmi < 18.5) {
    category = 'Underweight';
  } else if (bmi <= 24.9) {
    category = 'Healthy Weight';
  } else if (bmi <= 29.9) {
    category = 'Overweight';
  } else {
    category = 'Obese';
  }

  const minHealthyWeightKg = +(18.5 * heightM * heightM).toFixed(1);
  const maxHealthyWeightKg = +(24.9 * heightM * heightM).toFixed(1);
  const idealWeightKg = +(21.5 * heightM * heightM).toFixed(1);

  return {
    bmi,
    category,
    minHealthyWeightKg,
    maxHealthyWeightKg,
    idealWeightKg,
  };
}

export function calculateGoalTimeline(
  currentWeightKg: number,
  targetWeightKg: number,
  dailyDietCalories: number,
  dailyBurnCalories: number,
  intensityModifier: 'Light' | 'Moderate' | 'High' | 'Intense' = 'Moderate',
  heightCm: number = 162
): GoalTimelineProjection {
  const weightDeltaKg = +(currentWeightKg - targetWeightKg).toFixed(1);
  const isWeightLoss = weightDeltaKg > 0;
  const isMaintenance = Math.abs(weightDeltaKg) < 0.2;

  // Extra burn factor depending on workout intensity modifier
  const intensityBurnBonus =
    intensityModifier === 'Light'
      ? -100
      : intensityModifier === 'Moderate'
      ? 0
      : intensityModifier === 'High'
      ? 150
      : 300;

  const adjustedDailyBurn = Math.max(1400, dailyBurnCalories + intensityBurnBonus);
  const dailyDeficitKcal = adjustedDailyBurn - dailyDietCalories;

  // 1 kg body fat ≈ 7,700 kcal
  let weeklyRateKg: number;
  let estimatedWeeks: number;
  let paceDescription: GoalTimelineProjection['paceDescription'];

  if (isMaintenance) {
    weeklyRateKg = 0;
    estimatedWeeks = 0;
    paceDescription = 'Maintenance';
  } else if (isWeightLoss) {
    const calculatedWeeklyDeficit = dailyDeficitKcal * 7;
    // Safe bounds: 0.25 kg to 1.1 kg per week
    weeklyRateKg = +(Math.max(0.15, calculatedWeeklyDeficit / 7700)).toFixed(2);
    estimatedWeeks = +(Math.max(0.5, weightDeltaKg / weeklyRateKg)).toFixed(1);

    if (weeklyRateKg < 0.4) {
      paceDescription = 'Gentle & Sustainable';
    } else if (weeklyRateKg <= 0.8) {
      paceDescription = 'Optimal Fat Loss';
    } else {
      paceDescription = 'Accelerated';
    }
  } else {
    // Muscle gain / weight gain
    const calculatedWeeklySurplus = (dailyDietCalories - adjustedDailyBurn) * 7;
    weeklyRateKg = +(Math.max(0.15, calculatedWeeklySurplus / 7700)).toFixed(2);
    const absDelta = Math.abs(weightDeltaKg);
    estimatedWeeks = +(Math.max(0.5, absDelta / (weeklyRateKg || 0.3))).toFixed(1);
    paceDescription = 'Surplus / Muscle Growth';
  }

  // Calculate target date
  const targetDateMs = Date.now() + estimatedWeeks * 7 * 86400000;
  const estimatedCompletionDate = new Date(targetDateMs).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });

  // Calculate BMI Analysis for user's height
  const currentBmiData = calculateBMI(currentWeightKg, heightCm);
  const targetBmiData = calculateBMI(targetWeightKg, heightCm);
  const isTargetHealthy = targetBmiData.bmi >= 18.5 && targetBmiData.bmi <= 24.9;

  let advice = '';
  if (targetBmiData.bmi < 18.5) {
    advice = `Caution: ${targetWeightKg} kg corresponds to a BMI of ${targetBmiData.bmi} (Underweight). Recommended healthy minimum for your height (${heightCm} cm) is ${currentBmiData.minHealthyWeightKg} kg.`;
  } else if (targetBmiData.bmi > 24.9) {
    advice = `Your target of ${targetWeightKg} kg is above the standard healthy BMI cutoff (${currentBmiData.maxHealthyWeightKg} kg max). A target between ${currentBmiData.minHealthyWeightKg} kg and ${currentBmiData.maxHealthyWeightKg} kg is recommended for longevity.`;
  } else {
    advice = `Your target of ${targetWeightKg} kg gives a BMI of ${targetBmiData.bmi}, which is right in the ideal healthy range (${currentBmiData.minHealthyWeightKg}–${currentBmiData.maxHealthyWeightKg} kg) for your height (${heightCm} cm).`;
  }

  const bmi: BmiAnalysis = {
    heightCm,
    currentBmi: currentBmiData.bmi,
    currentCategory: currentBmiData.category,
    targetBmi: targetBmiData.bmi,
    targetCategory: targetBmiData.category,
    minHealthyWeightKg: currentBmiData.minHealthyWeightKg,
    maxHealthyWeightKg: currentBmiData.maxHealthyWeightKg,
    idealWeightKg: currentBmiData.idealWeightKg,
    isTargetHealthy,
    advice,
  };

  return {
    currentWeightKg,
    targetWeightKg,
    heightCm,
    weightDeltaKg,
    dailyCalorieIntake: dailyDietCalories,
    dailyTotalBurn: adjustedDailyBurn,
    dailyDeficitKcal,
    weeklyRateKg,
    estimatedWeeks,
    estimatedCompletionDate,
    paceDescription,
    bmi,
  };
}
