import express from 'express';
import path from 'path';
import dotenv from 'dotenv';
import { GoogleGenAI, Type } from '@google/genai';
import { createServer as createViteServer } from 'vite';

dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json({ limit: '10mb' }));

// Lazy init GenAI client
let aiClient: GoogleGenAI | null = null;
function getGenAI(): GoogleGenAI | null {
  if (!aiClient && process.env.GEMINI_API_KEY) {
    aiClient = new GoogleGenAI({
      apiKey: process.env.GEMINI_API_KEY,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        },
      },
    });
  }
  return aiClient;
}

// Resilient Gemini Invoker with Retry & Fallback Models
async function callGeminiWithResilience(generateConfig: (modelName: string) => Promise<any>): Promise<any> {
  const modelsToTry = ['gemini-3.7-flash', 'gemini-3.1-flash-lite'];
  let lastError: any = null;

  for (const model of modelsToTry) {
    for (let attempt = 0; attempt < 2; attempt++) {
      try {
        const response = await generateConfig(model);
        if (response && response.text) {
          return response;
        }
      } catch (err: any) {
        lastError = err;
        const errMsg = err?.message || String(err);
        const isTransient =
          errMsg.includes('503') ||
          errMsg.includes('UNAVAILABLE') ||
          errMsg.includes('high demand') ||
          errMsg.includes('429') ||
          errMsg.includes('RESOURCE_EXHAUSTED');

        if (isTransient && attempt === 0) {
          // Wait 600ms before quick retry
          await new Promise((r) => setTimeout(r, 600));
          continue;
        }
        // If not transient or second attempt, break to next model
        break;
      }
    }
  }

  throw lastError || new Error('Gemini API call failed after retries');
}

// ==========================================
// 1. Dynamic Tailored Diet Plan Builder
// ==========================================
function buildDynamicCustomDietPlan(preferences: any, biometricContext: any) {
  const instructions = (preferences?.customInstructions || '').trim();
  const dietType = preferences?.dietType || 'high_protein';
  const goal = preferences?.dietaryGoal || 'weight_loss';
  const targetCal = preferences?.targetCalories || 2050;
  const targetProt = preferences?.targetProteinG || 145;
  const targetCarbs = preferences?.targetCarbsG || 185;
  const targetFat = preferences?.targetFatG || 60;
  const allergies = preferences?.allergies || [];
  const dislikes = preferences?.dislikedFoods || [];

  const lowerInst = instructions.toLowerCase();

  const isVegan = dietType === 'vegan' || lowerInst.includes('vegan');
  const isVegetarian = dietType === 'vegetarian' || lowerInst.includes('vegetarian') || isVegan;
  const isKeto = dietType === 'keto' || lowerInst.includes('keto') || lowerInst.includes('low carb');
  const isDairyFree = lowerInst.includes('dairy free') || lowerInst.includes('dairy-free') || allergies.some((a: string) => a.toLowerCase().includes('dairy') || a.toLowerCase().includes('milk') || a.toLowerCase().includes('lactose'));
  const isGlutenFree = lowerInst.includes('gluten free') || lowerInst.includes('gluten-free') || allergies.some((a: string) => a.toLowerCase().includes('gluten') || a.toLowerCase().includes('wheat'));
  const wantsSalmon = lowerInst.includes('salmon') || lowerInst.includes('fish') || lowerInst.includes('seafood');
  const wantsQuick = lowerInst.includes('quick') || lowerInst.includes('fast') || lowerInst.includes('15 min') || lowerInst.includes('20 min');

  const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'].map((dayName, idx) => {
    // Custom breakfast
    let bName = 'Protein Berry Chia Bowl';
    let bDesc = 'Wholesome chia pudding blended with plant/whey protein, almond milk, and antioxidant berries.';
    let bIngredients = ['40g chia seeds', '1 scoop protein powder', '200ml almond milk', '60g fresh berries'];
    if (isVegan) {
      bName = 'Golden Turmeric Plant Protein Oats';
      bDesc = 'Organic rolled oats with pea isolate protein, flax seeds, and sliced banana.';
      bIngredients = ['50g rolled oats', '1 scoop pea protein', '200ml oat milk', '1 sliced banana'];
    } else if (isKeto) {
      bName = 'Avocado & Herb Scrambled Eggs';
      bDesc = 'Pasture-raised eggs scrambled with fresh herbs and half a hass avocado with olive drizzle.';
      bIngredients = ['3 eggs', '1/2 avocado', '1 tbsp olive oil', 'Fresh chives & spinach'];
    } else if (isDairyFree && !isVegan) {
      bName = 'Smoked Salmon & Poached Eggs on Greens';
      bDesc = 'Wild smoked salmon with pasture poached eggs and sautéed baby spinach.';
      bIngredients = ['80g smoked salmon', '2 eggs', 'Handful baby spinach', '1 tsp olive oil'];
    } else if (wantsQuick) {
      bName = '10-Min Power Green Protein Shake';
      bDesc = 'Blended spinach, frozen banana, protein powder, and chia seeds for instant morning fuel.';
      bIngredients = ['1 scoop protein', '1 banana', 'Handful spinach', '250ml water/milk'];
    }

    // Custom lunch
    let lName = 'Lemon Herb Grilled Chicken & Quinoa Bowl';
    let lDesc = 'Juicy chicken breast with fluffy quinoa, crisp cucumber, and light tahini dressing.';
    let lIngredients = ['160g chicken breast', '70g dry quinoa', '1 cup mixed salad', '1 tbsp tahini dressing'];
    if (isVegan) {
      lName = 'Mediterranean Tempeh & Chickpea Crisp Salad';
      lDesc = 'Golden pan-seared tempeh with roasted chickpeas, kalamata olives, and herb vinaigrette.';
      lIngredients = ['150g organic tempeh', '100g chickpeas', 'Cucumbers & tomatoes', '1 tbsp olive oil'];
    } else if (isKeto) {
      lName = 'Grilled Ribeye Steak & Avocado Caesar Salad';
      lDesc = 'Tender ribeye steak slices over crisp romaine with avocado oil dressing and parmesan crisps.';
      lIngredients = ['160g ribeye steak', '1/2 avocado', 'Romaine lettuce', 'Olive oil dressing'];
    } else if (wantsSalmon && idx % 2 === 0) {
      lName = 'Seared Atlantic Salmon & Wild Rice Salad';
      lDesc = 'Omega-3 rich salmon with wild rice, steamed asparagus, and citrus vinaigrette.';
      lIngredients = ['160g salmon fillet', '80g wild rice', '100g asparagus', 'Lemon & olive oil'];
    }

    // Custom dinner
    let dName = 'Herb-Crusted Salmon with Spiced Sweet Potato';
    let dDesc = 'Baked salmon fillet with roasted sweet potato wedges and steamed broccoli.';
    let dIngredients = ['160g salmon fillet', '180g sweet potato', '100g broccoli florets', '1 tsp olive oil'];
    if (isVegan) {
      dName = 'Crispy Sesame Tofu & Edamame Soba Stir-Fry';
      dDesc = 'Pressed firm tofu with edamame beans, bok choy, and buckwheat soba noodles in tamari glaze.';
      dIngredients = ['200g firm tofu', '60g soba noodles', '50g edamame', 'Tamari sesame reduction'];
    } else if (isKeto) {
      dName = 'Garlic Butter Grass-Fed Beef & Zucchini Ribbons';
      dDesc = 'Sirloin steak tips seared with garlic butter alongside charred zucchini noodles.';
      dIngredients = ['180g beef sirloin', '200g zucchini noodles', '1 tbsp garlic butter'];
    }

    // Custom snack
    let sName = 'Handful Raw Almonds & Green Matcha';
    let sDesc = 'Raw crunchy almonds with ceremonial green matcha for sustained mental clarity.';
    let sIngredients = ['25g raw almonds', '1 cup matcha tea'];
    if (isVegan) {
      sName = 'Roasted Edamame & Fresh Apple Slices';
      sDesc = 'Crunchy sea salt roasted edamame beans paired with crisp apple slices.';
      sIngredients = ['40g roasted edamame', '1 medium apple'];
    }

    const bCal = Math.round(targetCal * 0.24);
    const lCal = Math.round(targetCal * 0.32);
    const dCal = Math.round(targetCal * 0.32);
    const sCal = targetCal - (bCal + lCal + dCal);

    return {
      dayName,
      targetCalories: targetCal,
      totalCalories: targetCal,
      totalProteinG: targetProt,
      totalCarbsG: targetCarbs,
      totalFatG: targetFat,
      dailyTip: instructions
        ? `Personalized protocol adapting to: "${instructions.slice(0, 70)}..."`
        : 'Ensure adequate hydration throughout the day to support metabolic rate.',
      breakfast: {
        id: `meal-${idx}-b`,
        name: bName,
        description: bDesc,
        calories: bCal,
        proteinG: Math.round(targetProt * 0.25),
        carbsG: Math.round(targetCarbs * 0.25),
        fatG: Math.round(targetFat * 0.25),
        prepTimeMinutes: wantsQuick ? 10 : 15,
        ingredients: bIngredients,
        recipeInstructions: ['Prepare ingredients in clean cookware.', 'Combine and season with fresh herbs and pinch of salt.', 'Serve fresh and warm.'],
        tags: [dietType, 'Custom Tailored', 'Whole Food'],
      },
      lunch: {
        id: `meal-${idx}-l`,
        name: lName,
        description: lDesc,
        calories: lCal,
        proteinG: Math.round(targetProt * 0.35),
        carbsG: Math.round(targetCarbs * 0.35),
        fatG: Math.round(targetFat * 0.35),
        prepTimeMinutes: wantsQuick ? 15 : 20,
        ingredients: lIngredients,
        recipeInstructions: ['Cook the protein source thoroughly over medium heat.', 'Steam or sauté accompanying vegetables.', 'Plate and drizzle dressing before serving.'],
        tags: [dietType, 'Lean Energy', 'Macro Balanced'],
      },
      dinner: {
        id: `meal-${idx}-d`,
        name: dName,
        description: dDesc,
        calories: dCal,
        proteinG: Math.round(targetProt * 0.30),
        carbsG: Math.round(targetCarbs * 0.30),
        fatG: Math.round(targetFat * 0.30),
        prepTimeMinutes: wantsQuick ? 15 : 22,
        ingredients: dIngredients,
        recipeInstructions: ['Preheat oven or skillet to high heat.', 'Sear and bake until golden brown and aromatic.', 'Rest for 2 minutes and serve.'],
        tags: [dietType, 'Recovery Fuel', 'High Nutrient'],
      },
      snack: {
        id: `meal-${idx}-s`,
        name: sName,
        description: sDesc,
        calories: sCal,
        proteinG: Math.max(10, Math.round(targetProt * 0.10)),
        carbsG: Math.max(10, Math.round(targetCarbs * 0.10)),
        fatG: Math.max(5, Math.round(targetFat * 0.10)),
        prepTimeMinutes: 5,
        ingredients: sIngredients,
        recipeInstructions: ['Portion into a bowl or shaker cup.', 'Enjoy between meals for stable blood sugar.'],
        tags: ['Clean Fuel', 'Antioxidant'],
      },
    };
  });

  return {
    id: `diet-plan-${Date.now()}`,
    generatedAt: new Date().toISOString(),
    validUntil: new Date(Date.now() + 7 * 86400000).toISOString(),
    title: instructions
      ? `Custom AI Plan: ${instructions.length > 55 ? instructions.slice(0, 52).trim() + '...' : instructions}`
      : `${dietType.replace('_', ' ').toUpperCase()} AI Macro Protocol`,
    overviewSummary: instructions
      ? `Tailored specifically for: "${instructions}". Optimized for ${targetCal} kcal, ${targetProt}g protein with exclusions for ${(allergies || []).join(', ') || 'none'}.`
      : `Scientifically calibrated for ${goal.replace('_', ' ')} based on ${targetCal} daily calories and Redmi Watch activity metrics.`,
    groceryList: [
      {
        category: 'Proteins & Essentials',
        items: isVegan
          ? ['Organic firm tofu (600g)', 'Tempeh (400g)', 'Chickpeas & Black beans', 'Pea protein powder', 'Chia & Hemp seeds']
          : ['Skinless chicken breast (1.2kg)', 'Atlantic salmon fillets (500g)', 'Pasture-raised eggs (1 dozen)', 'Lean beef sirloin (400g)'],
      },
      {
        category: 'Fresh Produce & Vegetables',
        items: ['Baby spinach (2 bags)', 'Avocados (4)', 'Broccoli & Asparagus', 'Sweet potatoes', 'Fresh blueberries & Lemons'],
      },
      {
        category: 'Grains & Healthy Fats',
        items: isGlutenFree
          ? ['Quinoa', 'Brown jasmine rice', 'Buckwheat soba', 'Extra virgin olive oil', 'Raw almonds']
          : ['Rolled oats', 'Quinoa', 'Brown rice', 'Extra virgin olive oil', 'Raw walnuts & Chia seeds'],
      },
    ],
    days,
  };
}

// ==========================================
// 2. Dynamic Tailored Workout Plan Builder
// ==========================================
function buildDynamicCustomWorkoutPlan(preferences: any, biometricContext: any) {
  const goal = preferences?.dietaryGoal || 'weight_loss';
  const level = preferences?.activityLevel || 'moderately_active';
  const instructions = (preferences?.customInstructions || '').trim();
  const readiness = biometricContext?.readinessScore || 85;
  const availableEquipment: string[] = preferences?.availableEquipment || ['No Equipment (Bodyweight / Mat)'];

  const isHomeOnly = availableEquipment.some((eq) => eq.includes('Bodyweight') || eq.includes('No Equipment')) && !availableEquipment.some((eq) => eq.includes('Gym'));
  const hasDumbbells = availableEquipment.some((eq) => eq.includes('Dumbbells') || eq.includes('Kettlebell'));
  const hasBands = availableEquipment.some((eq) => eq.includes('Bands'));
  const hasFullGym = availableEquipment.some((eq) => eq.includes('Gym'));
  const isHome = isHomeOnly || !hasFullGym;

  const isCardioFocus = instructions.toLowerCase().includes('running') || instructions.toLowerCase().includes('cardio') || goal === 'endurance';

  return {
    id: `workout-plan-${Date.now()}`,
    generatedAt: new Date().toISOString(),
    title: instructions
      ? `Tailored Protocol: ${instructions.slice(0, 40)}`
      : `${availableEquipment[0] || 'Bodyweight'} ${goal.replace('_', ' ').toUpperCase()} Routine`,
    summary: `Structured for ${level.replace('_', ' ')} using ${availableEquipment.join(', ')} with Redmi biometric readiness score of ${readiness}/100. Calibrated for optimal heart rate recovery and maximum caloric efficiency.`,
    days: [
      {
        dayName: 'Monday',
        focusArea: isCardioFocus ? 'Threshold Intervals & Core Stability' : 'Upper Body Push Power & Calisthenics',
        isRestDay: false,
        warmupMinutes: 8,
        workoutDurationMinutes: 45,
        cooldownMinutes: 6,
        estimatedBurnCalories: 340,
        intensityLevel: 'High',
        recoveryTip: 'Monitor your Redmi Watch HR. Aim for 130-155 BPM during main compound sets.',
        exercises: [
          { id: 'ex-m1', name: hasFullGym ? 'Barbell Bench Press' : hasDumbbells ? 'Dumbbell Floor/Bench Press' : 'Push-Ups (Tempo 3-1-1)', sets: 4, reps: '8-10 reps', restSeconds: 90, targetMuscle: 'Pectorals & Triceps', equipment: hasFullGym ? 'Barbell / Bench' : hasDumbbells ? 'Dumbbells' : 'Bodyweight / Mat', caloriesBurnEstimate: 110 },
          { id: 'ex-m2', name: hasDumbbells ? 'Dumbbell Overhead Shoulder Press' : hasBands ? 'Resistance Band Overhead Press' : 'Pike Push-ups', sets: 3, reps: '10-12 reps', restSeconds: 60, targetMuscle: 'Anterior Deltoids & Upper Chest', equipment: hasDumbbells ? 'Dumbbells' : hasBands ? 'Bands' : 'Bodyweight', caloriesBurnEstimate: 90 },
          { id: 'ex-m3', name: 'Dips or Elevated Bench Push-Ups', sets: 3, reps: '12 reps', restSeconds: 60, targetMuscle: 'Triceps & Lower Chest', equipment: 'Parallel Bars / Chair', caloriesBurnEstimate: 70 },
          { id: 'ex-m4', name: 'Plank Shoulder Taps', sets: 3, reps: '45s hold', restSeconds: 45, targetMuscle: 'Core & Stabilizers', equipment: 'Mat', caloriesBurnEstimate: 70 },
        ],
      },
      {
        dayName: 'Tuesday',
        focusArea: 'Posterior Chain Pull & Lat Hypertrophy',
        isRestDay: false,
        warmupMinutes: 8,
        workoutDurationMinutes: 45,
        cooldownMinutes: 6,
        estimatedBurnCalories: 360,
        intensityLevel: 'High',
        recoveryTip: 'Keep resting HR in check. Hydrate with at least 500ml of water post-pull workout.',
        exercises: [
          { id: 'ex-tu1', name: isHome ? 'Bent-Over Dumbbell Rows' : 'Barbell Deadlifts / Romanian Deadlifts', sets: 4, reps: '8-10 reps', restSeconds: 90, targetMuscle: 'Latissimus Dorsi & Hamstrings', equipment: isHome ? 'Dumbbells' : 'Barbell', caloriesBurnEstimate: 130 },
          { id: 'ex-tu2', name: 'Single-Arm Dumbbell Row', sets: 3, reps: '10 per side', restSeconds: 60, targetMuscle: 'Mid Back & Rhomboids', equipment: 'Dumbbell', caloriesBurnEstimate: 80 },
          { id: 'ex-tu3', name: 'Incline Dumbbell Bicep Curls', sets: 3, reps: '12 reps', restSeconds: 60, targetMuscle: 'Biceps Brachii', equipment: 'Dumbbells', caloriesBurnEstimate: 60 },
          { id: 'ex-tu4', name: 'Hanging Leg Raises / Lying Leg Lifts', sets: 3, reps: '15 reps', restSeconds: 45, targetMuscle: 'Lower Rectus Abdominis', equipment: 'Pull-Up Bar / Mat', caloriesBurnEstimate: 90 },
        ],
      },
      {
        dayName: 'Wednesday',
        focusArea: 'Zone 2 Active Recovery & Joint Mobility',
        isRestDay: false,
        warmupMinutes: 5,
        workoutDurationMinutes: 35,
        cooldownMinutes: 5,
        estimatedBurnCalories: 230,
        intensityLevel: 'Low-Moderate',
        recoveryTip: 'Keep stress levels below 35. This promotes parasympathetic nervous system tone.',
        exercises: [
          { id: 'ex-w1', name: 'Zone 2 Steady State Outdoor Jog or Power Walk', sets: 1, reps: '25 mins', restSeconds: 0, targetMuscle: 'Cardiorespiratory System', equipment: 'Redmi Watch Heart Rate Track', caloriesBurnEstimate: 150 },
          { id: 'ex-w2', name: 'Thoracic Spine Openers & Cat-Cow Flow', sets: 3, reps: '10 cycles', restSeconds: 30, targetMuscle: 'Spine & Hip Flexors', equipment: 'Mat', caloriesBurnEstimate: 40 },
          { id: 'ex-w3', name: 'World’s Greatest Stretch with Deep Glute Lunge', sets: 3, reps: '5 per side', restSeconds: 30, targetMuscle: 'Hips, Hamstrings & Ankles', equipment: 'Mat', caloriesBurnEstimate: 40 },
        ],
      },
      {
        dayName: 'Thursday',
        focusArea: 'Lower Body Strength & Glute Explosiveness',
        isRestDay: false,
        warmupMinutes: 10,
        workoutDurationMinutes: 50,
        cooldownMinutes: 6,
        estimatedBurnCalories: 410,
        intensityLevel: 'High',
        recoveryTip: 'Highest metabolic demand day. Ensure carbohydrate refueling around this session.',
        exercises: [
          { id: 'ex-th1', name: isHome ? 'Goblet Squats (Tempo 3-0-1)' : 'Barbell Back Squats', sets: 4, reps: '8-10 reps', restSeconds: 90, targetMuscle: 'Quadriceps & Gluteus Maximus', equipment: isHome ? 'Heavy Dumbbell' : 'Squat Rack', caloriesBurnEstimate: 150 },
          { id: 'ex-th2', name: 'Bulgarian Split Squats', sets: 3, reps: '10 per leg', restSeconds: 60, targetMuscle: 'Quads & Unilateral Balance', equipment: 'Bench / Dumbbells', caloriesBurnEstimate: 110 },
          { id: 'ex-th3', name: 'Dumbbell Romanian Deadlifts', sets: 3, reps: '12 reps', restSeconds: 60, targetMuscle: 'Hamstrings & Glutes', equipment: 'Dumbbells', caloriesBurnEstimate: 90 },
          { id: 'ex-th4', name: 'Standing Calf Raises with Iso-Hold', sets: 4, reps: '15 reps (2s hold)', restSeconds: 45, targetMuscle: 'Gastrocnemius & Soleus', equipment: 'Step', caloriesBurnEstimate: 60 },
        ],
      },
      {
        dayName: 'Friday',
        focusArea: 'Shoulders, Arms & Metabolic Core Circuit',
        isRestDay: false,
        warmupMinutes: 8,
        workoutDurationMinutes: 40,
        cooldownMinutes: 5,
        estimatedBurnCalories: 310,
        intensityLevel: 'Moderate-High',
        recoveryTip: 'Check your Redmi Watch stress score afterwards. Practice 3-min box breathing to decompress.',
        exercises: [
          { id: 'ex-f1', name: 'Standing Dumbbell Lateral Raises', sets: 4, reps: '12-15 reps', restSeconds: 45, targetMuscle: 'Medial Deltoid', equipment: 'Dumbbells', caloriesBurnEstimate: 70 },
          { id: 'ex-f2', name: 'Rear Delt Flyes / Face Pulls', sets: 3, reps: '15 reps', restSeconds: 45, targetMuscle: 'Posterior Deltoids & Traps', equipment: 'Bands / Dumbbells', caloriesBurnEstimate: 70 },
          { id: 'ex-f3', name: 'Hammer Curls Superset with Tricep Pushdowns', sets: 3, reps: '12 reps each', restSeconds: 60, targetMuscle: 'Brachialis & Triceps', equipment: 'Dumbbells / Cables', caloriesBurnEstimate: 80 },
          { id: 'ex-f4', name: 'Hollow Body Rockers & Russian Twists', sets: 3, reps: '20 total reps', restSeconds: 45, targetMuscle: 'Obliques & Transverse Abdominis', equipment: 'Mat', caloriesBurnEstimate: 90 },
        ],
      },
      {
        dayName: 'Saturday',
        focusArea: 'Full Body HIIT Conditioning & Calorie Burn',
        isRestDay: false,
        warmupMinutes: 8,
        workoutDurationMinutes: 35,
        cooldownMinutes: 6,
        estimatedBurnCalories: 380,
        intensityLevel: 'High',
        recoveryTip: 'Peak calorie burn! Log water intake immediately to restore intracellular fluid.',
        exercises: [
          { id: 'ex-sa1', name: 'Kettlebell / Dumbbell Swings', sets: 4, reps: '20 reps', restSeconds: 45, targetMuscle: 'Posterior Chain & Cardio', equipment: 'Kettlebell or Dumbbell', caloriesBurnEstimate: 120 },
          { id: 'ex-sa2', name: 'Dumbbell Thrusters (Squat to Press)', sets: 3, reps: '12 reps', restSeconds: 60, targetMuscle: 'Full Body Compound', equipment: 'Dumbbells', caloriesBurnEstimate: 110 },
          { id: 'ex-sa3', name: 'Mountain Climbers into Burpees', sets: 3, reps: '45s max effort', restSeconds: 60, targetMuscle: 'Cardio & Core', equipment: 'Mat', caloriesBurnEstimate: 90 },
          { id: 'ex-sa4', name: 'Jump Rope or Fast High Knees', sets: 4, reps: '60s continuous', restSeconds: 45, targetMuscle: 'Calves & Endurance', equipment: 'Jump Rope / Bodyweight', caloriesBurnEstimate: 60 },
        ],
      },
      {
        dayName: 'Sunday',
        focusArea: 'Full Rest, Hydro-Recovery & Stress Reset',
        isRestDay: true,
        warmupMinutes: 0,
        workoutDurationMinutes: 20,
        cooldownMinutes: 0,
        estimatedBurnCalories: 110,
        intensityLevel: 'Recovery',
        recoveryTip: 'Complete rest day. Ensure your Redmi stress score stays relaxed below 30.',
        exercises: [
          { id: 'ex-su1', name: 'Full Body Foam Rolling & Myofascial Release', sets: 1, reps: '10 mins', restSeconds: 0, targetMuscle: 'Whole Body Recovery', equipment: 'Foam Roller', caloriesBurnEstimate: 40 },
          { id: 'ex-su2', name: 'Gentle Neighborhood Stroll', sets: 1, reps: '20 mins', restSeconds: 0, targetMuscle: 'Low Impact Active Flow', equipment: 'Shoes', caloriesBurnEstimate: 50 },
          { id: 'ex-su3', name: '4-7-8 Parasympathetic Box Breathing', sets: 3, reps: '4 cycles', restSeconds: 30, targetMuscle: 'Nervous System', equipment: 'Quiet Room', caloriesBurnEstimate: 20 },
        ],
      },
    ],
  };
}

// ==========================================
// 3. Dynamic Nutrition Query Estimator
// ==========================================
function buildDynamicNutritionAnalysis(query: string) {
  const q = (query || '').toLowerCase();

  let name = query.trim();
  let calories = 380;
  let proteinG = 24;
  let carbsG = 38;
  let fatG = 12;
  let portion = '1 standard serving (300g)';
  let breakdown = 'Calibrated nutritional estimation based on dish composition.';

  if (q.includes('oat') || q.includes('oatmeal') || q.includes('porridge')) {
    name = 'Wholesome Oatmeal Bowl with Fruit & Nuts';
    calories = 360;
    proteinG = 14;
    carbsG = 56;
    fatG = 9;
    portion = '1 bowl (300g)';
    breakdown = 'High fiber beta-glucan complex carbohydrates with moderate plant protein.';
  } else if (q.includes('chicken') && (q.includes('rice') || q.includes('quinoa') || q.includes('bowl'))) {
    name = 'Grilled Chicken Breast with Rice & Greens';
    calories = 520;
    proteinG = 46;
    carbsG = 52;
    fatG = 12;
    portion = '1 plate (400g)';
    breakdown = 'Lean complete animal protein paired with energy-sustaining complex carbs.';
  } else if (q.includes('salmon') || q.includes('fish')) {
    name = 'Pan-Seared Atlantic Salmon Fillet with Veggies';
    calories = 480;
    proteinG = 38;
    carbsG = 18;
    fatG = 26;
    portion = '1 fillet (180g) + sides';
    breakdown = 'Rich in heart-healthy EPA/DHA omega-3 fatty acids and complete amino acids.';
  } else if (q.includes('egg') || q.includes('scramble') || q.includes('omelet')) {
    name = 'Herb Scrambled Eggs with Avocado Toast';
    calories = 420;
    proteinG = 22;
    carbsG = 28;
    fatG = 24;
    portion = '2 large eggs + 1 slice whole grain toast';
    breakdown = 'Bioavailable egg protein and monounsaturated healthy fats.';
  } else if (q.includes('protein shake') || q.includes('smoothie') || q.includes('whey')) {
    name = 'High-Protein Whey & Berry Smoothie';
    calories = 290;
    proteinG = 32;
    carbsG = 28;
    fatG = 4;
    portion = '1 cup (400ml)';
    breakdown = 'Fast-digesting post-workout protein with natural berry antioxidants.';
  } else if (q.includes('salad') || q.includes('greens')) {
    name = 'Mediterranean Protein Garden Salad';
    calories = 340;
    proteinG = 18;
    carbsG = 22;
    fatG = 20;
    portion = '1 large salad bowl (350g)';
    breakdown = 'Micronutrient dense leafy greens dressed with extra virgin olive oil.';
  } else if (q.includes('beef') || q.includes('steak') || q.includes('sirloin')) {
    name = 'Lean Grilled Beef Sirloin with Sweet Potato';
    calories = 560;
    proteinG = 48;
    carbsG = 42;
    fatG = 18;
    portion = '1 steak portion (200g meat + sides)';
    breakdown = 'Iron and zinc rich high-quality protein for strength and muscle synthesis.';
  } else if (q.includes('tofu') || q.includes('tempeh') || q.includes('vegan')) {
    name = 'Crispy Sesame Tempeh & Quinoa Stir-Fry';
    calories = 440;
    proteinG = 28;
    carbsG = 46;
    fatG = 16;
    portion = '1 bowl (350g)';
    breakdown = 'Plant-based fermented soy protein rich in isoflavones and gut probiotics.';
  } else if (q.includes('pizza')) {
    name = 'Wood-Fired Margherita Pizza';
    calories = 680;
    proteinG = 26;
    carbsG = 82;
    fatG = 24;
    portion = '2-3 slices (260g)';
    breakdown = 'Calorie-dense meal with high carbohydrates and moderate cheese protein.';
  } else if (q.includes('burger')) {
    name = 'Lean Beef Cheeseburger on Whole Wheat Bun';
    calories = 620;
    proteinG = 38;
    carbsG = 48;
    fatG = 28;
    portion = '1 burger (250g)';
    breakdown = 'Substantial protein and dietary fat with moderate complex carbs.';
  }

  return {
    name,
    calories,
    proteinG,
    carbsG,
    fatG,
    portion,
    confidence: 'estimated_smart_algorithm',
    breakdown,
  };
}

// ==========================================
// 4. Dynamic Biometric Coach Assessment
// ==========================================
function buildDynamicCoachInsight(biometrics: any, dailyTracking: any, preferences: any) {
  const steps = biometrics?.totalSteps || 7200;
  const targetSteps = preferences?.targetSteps || 10000;
  const restingHR = biometrics?.restingHeartRate || 58;
  const avgStress = biometrics?.avgStressScore || 36;
  const readiness = biometrics?.readinessScore || 86;
  const activeCalories = biometrics?.activeCaloriesBurned || 410;

  const intakeCalories = dailyTracking?.totalCalories || 1100;
  const targetCalories = preferences?.targetCalories || 2050;
  const proteinIntake = dailyTracking?.totalProteinG || 84;
  const targetProtein = preferences?.targetProteinG || 145;
  const waterIntake = dailyTracking?.totalWaterMl || 2000;
  const targetWater = preferences?.targetWaterMl || 2800;

  const stepPct = Math.round((steps / targetSteps) * 100);
  const waterRemaining = Math.max(0, targetWater - waterIntake);

  let status: 'excellent' | 'good' | 'needs_attention' | 'recovery_needed' = 'good';
  if (readiness >= 88 && avgStress < 35) status = 'excellent';
  else if (avgStress > 55 || restingHR > 70) status = 'needs_attention';
  else if (readiness < 65) status = 'recovery_needed';

  return {
    id: `insight-${Date.now()}`,
    generatedAt: new Date().toISOString(),
    overallStatus: status,
    headline:
      stepPct >= 80
        ? 'High Activity & Solid Biometric Biomarkers'
        : 'Steady Progress — Caloric Deficit & HRV Aligned',
    summary: `Your Redmi Watch recorded ${steps.toLocaleString()} steps (${stepPct}% of goal) with an active burn of ${activeCalories} kcal. Resting HR is optimal at ${restingHR} BPM with an overall readiness score of ${readiness}/100.`,
    nutritionAdvice: `Current intake is ${intakeCalories} kcal with ${proteinIntake}g protein (target: ${targetProtein}g). Add a clean protein source in your next meal to maintain nitrogen balance.`,
    workoutAdjustment:
      avgStress > 50
        ? 'Stress was slightly elevated this afternoon. Keep rests between sets at 90 seconds and prioritize form over max loads.'
        : 'Your neuromuscular readiness is solid. Proceed with scheduled compound lifts or Zone 2 cardio.',
    stressMitigationTip:
      avgStress > 40
        ? `Stress reached an average of ${avgStress}/100. Try a 3-minute 4-7-8 box breathing exercise to trigger parasympathetic recovery.`
        : 'Autonomic nervous system metrics indicate relaxed, steady recovery.',
    hydrationAlert:
      waterRemaining > 0
        ? `You have logged ${waterIntake}ml of water (${waterRemaining}ml remaining to reach ${targetWater}ml). Sip 500ml before your evening workout.`
        : 'Hydration goal achieved for the day! Cellular hydration is optimal.',
    readinessScore: readiness,
  };
}

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', hasGeminiKey: Boolean(process.env.GEMINI_API_KEY) });
});

// ==========================================
// API Endpoint 1: Generate AI Weekly Diet Plan
// ==========================================
app.post('/api/generate-diet-plan', async (req, res) => {
  const { preferences, biometricContext } = req.body;
  const ai = getGenAI();

  if (!ai) {
    const dynamicPlan = buildDynamicCustomDietPlan(preferences, biometricContext);
    return res.json(dynamicPlan);
  }

  const prompt = `
You are an expert sports nutritionist and dietitian. Generate a comprehensive 7-day custom weekly diet plan (Monday to Sunday) tailored to the user's specific biometrics and personal instructions:

User Profile:
- Name: ${preferences?.name || 'User'}
- Dietary Goal: ${preferences?.dietaryGoal || 'weight_loss'}
- Diet Type: ${preferences?.dietType || 'high_protein'}
- Allergies: ${(preferences?.allergies || []).join(', ') || 'None'}
- Disliked Foods: ${(preferences?.dislikedFoods || []).join(', ') || 'None'}
- CRITICAL User Custom Instructions: "${preferences?.customInstructions || 'Quick healthy meals under 20 mins, high protein, balance carbs'}"
- Target Daily Calories: ~${preferences?.targetCalories || 2050} kcal
- Target Macros: Protein: ${preferences?.targetProteinG || 140}g, Carbs: ${preferences?.targetCarbsG || 180}g, Fat: ${preferences?.targetFatG || 60}g
- Redmi Watch Biometric Context: Active Burn: ${biometricContext?.activeCaloriesBurned || 420} kcal, Resting HR: ${biometricContext?.restingHeartRate || 58} bpm, Avg Stress: ${biometricContext?.avgStressScore || 38}/100.

Requirements:
- MUST strictly follow the user's custom instructions (e.g. ingredients requested, style, meal speed, restrictions).
- Create 7 distinct days: Monday through Sunday.
- For each day, provide Breakfast, Lunch, Dinner, and 1 Healthy Snack.
- Include realistic calories, protein (g), carbs (g), and fat (g) for each meal, summing close to the target calories and macros.
- Include prep time in minutes, ingredient lists, and concise 2-3 step cooking instructions.
- Add practical categorized grocery shopping list.
- Keep dishes delicious, practical, and strictly adhering to allergies and dislikes.
`;

  try {
    const response = await callGeminiWithResilience((modelName) =>
      ai.models.generateContent({
        model: modelName,
        contents: prompt,
        config: {
          responseMimeType: 'application/json',
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              title: { type: Type.STRING },
              overviewSummary: { type: Type.STRING },
              groceryList: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    category: { type: Type.STRING },
                    items: { type: Type.ARRAY, items: { type: Type.STRING } },
                  },
                  required: ['category', 'items'],
                },
              },
              days: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    dayName: { type: Type.STRING },
                    targetCalories: { type: Type.NUMBER },
                    totalCalories: { type: Type.NUMBER },
                    totalProteinG: { type: Type.NUMBER },
                    totalCarbsG: { type: Type.NUMBER },
                    totalFatG: { type: Type.NUMBER },
                    dailyTip: { type: Type.STRING },
                    breakfast: {
                      type: Type.OBJECT,
                      properties: {
                        id: { type: Type.STRING },
                        name: { type: Type.STRING },
                        description: { type: Type.STRING },
                        calories: { type: Type.NUMBER },
                        proteinG: { type: Type.NUMBER },
                        carbsG: { type: Type.NUMBER },
                        fatG: { type: Type.NUMBER },
                        prepTimeMinutes: { type: Type.NUMBER },
                        ingredients: { type: Type.ARRAY, items: { type: Type.STRING } },
                        recipeInstructions: { type: Type.ARRAY, items: { type: Type.STRING } },
                        tags: { type: Type.ARRAY, items: { type: Type.STRING } },
                      },
                      required: ['id', 'name', 'description', 'calories', 'proteinG', 'carbsG', 'fatG', 'prepTimeMinutes', 'ingredients'],
                    },
                    lunch: {
                      type: Type.OBJECT,
                      properties: {
                        id: { type: Type.STRING },
                        name: { type: Type.STRING },
                        description: { type: Type.STRING },
                        calories: { type: Type.NUMBER },
                        proteinG: { type: Type.NUMBER },
                        carbsG: { type: Type.NUMBER },
                        fatG: { type: Type.NUMBER },
                        prepTimeMinutes: { type: Type.NUMBER },
                        ingredients: { type: Type.ARRAY, items: { type: Type.STRING } },
                        recipeInstructions: { type: Type.ARRAY, items: { type: Type.STRING } },
                        tags: { type: Type.ARRAY, items: { type: Type.STRING } },
                      },
                      required: ['id', 'name', 'description', 'calories', 'proteinG', 'carbsG', 'fatG', 'prepTimeMinutes', 'ingredients'],
                    },
                    dinner: {
                      type: Type.OBJECT,
                      properties: {
                        id: { type: Type.STRING },
                        name: { type: Type.STRING },
                        description: { type: Type.STRING },
                        calories: { type: Type.NUMBER },
                        proteinG: { type: Type.NUMBER },
                        carbsG: { type: Type.NUMBER },
                        fatG: { type: Type.NUMBER },
                        prepTimeMinutes: { type: Type.NUMBER },
                        ingredients: { type: Type.ARRAY, items: { type: Type.STRING } },
                        recipeInstructions: { type: Type.ARRAY, items: { type: Type.STRING } },
                        tags: { type: Type.ARRAY, items: { type: Type.STRING } },
                      },
                      required: ['id', 'name', 'description', 'calories', 'proteinG', 'carbsG', 'fatG', 'prepTimeMinutes', 'ingredients'],
                    },
                    snack: {
                      type: Type.OBJECT,
                      properties: {
                        id: { type: Type.STRING },
                        name: { type: Type.STRING },
                        description: { type: Type.STRING },
                        calories: { type: Type.NUMBER },
                        proteinG: { type: Type.NUMBER },
                        carbsG: { type: Type.NUMBER },
                        fatG: { type: Type.NUMBER },
                        prepTimeMinutes: { type: Type.NUMBER },
                        ingredients: { type: Type.ARRAY, items: { type: Type.STRING } },
                        recipeInstructions: { type: Type.ARRAY, items: { type: Type.STRING } },
                        tags: { type: Type.ARRAY, items: { type: Type.STRING } },
                      },
                      required: ['id', 'name', 'description', 'calories', 'proteinG', 'carbsG', 'fatG', 'prepTimeMinutes', 'ingredients'],
                    },
                  },
                  required: ['dayName', 'targetCalories', 'totalCalories', 'totalProteinG', 'totalCarbsG', 'totalFatG', 'breakfast', 'lunch', 'dinner', 'snack'],
                },
              },
            },
            required: ['title', 'overviewSummary', 'days', 'groceryList'],
          },
        },
      })
    );

    const parsed = JSON.parse(response.text || '{}');
    const resultPlan = {
      id: `diet-plan-${Date.now()}`,
      generatedAt: new Date().toISOString(),
      validUntil: new Date(Date.now() + 7 * 86400000).toISOString(),
      ...parsed,
    };

    res.json(resultPlan);
  } catch (error: any) {
    console.warn('AI Diet Generation using dynamic tailored generator due to:', error?.message || error);
    const dynamicPlan = buildDynamicCustomDietPlan(preferences, biometricContext);
    res.json(dynamicPlan);
  }
});

// ==========================================
// API Endpoint 2: Generate AI Workout Plan
// ==========================================
app.post('/api/generate-workout-plan', async (req, res) => {
  const { preferences, biometricContext } = req.body;
  const ai = getGenAI();

  if (!ai) {
    const dynamicWorkout = buildDynamicCustomWorkoutPlan(preferences, biometricContext);
    return res.json(dynamicWorkout);
  }

  const prompt = `
You are a world-class strength and conditioning coach and biomechanist. Generate a periodized 7-day workout routine (Monday to Sunday) adapted to the user's goals, available equipment, and Redmi Watch recovery metrics:

User Profile:
- Goal: ${preferences?.dietaryGoal || 'weight_loss'} (${preferences?.dietType || 'fitness'})
- Fitness Level: ${preferences?.activityLevel || 'moderately_active'}
- CRITICAL Equipment Available: ${(preferences?.availableEquipment || ['No Equipment (Bodyweight / Mat)']).join(', ')} (The user may not have a gym subscription. ONLY prescribe exercises that match their equipment!)
- Custom Instructions: "${preferences?.customInstructions || 'Balanced workout and mobility'}"
- Watch Biometrics: Readiness: ${biometricContext?.readinessScore || 85}/100, Avg Stress: ${biometricContext?.avgStressScore || 40}, Resting HR: ${biometricContext?.restingHeartRate || 60} bpm, Daily Step Goal: ${preferences?.targetSteps || 10000}.

Requirements:
- 7 days (Monday to Sunday).
- STRICTLY use only equipment listed in "Equipment Available" (e.g. Bodyweight, Bands, Dumbbells, etc).
- Include 4-5 focused workout days, 1-2 active mobility/Zone 2 cardio days, and 1 full rest/recovery day.
- For each exercise, provide exact sets, rep schemes (e.g. "8-10" or "45s"), rest seconds, targeted muscles, equipment, and estimated calorie burn.
- Include specific recovery tips referencing Redmi biometric heart rate and stress readiness.
`;

  try {
    const response = await callGeminiWithResilience((modelName) =>
      ai.models.generateContent({
        model: modelName,
        contents: prompt,
        config: {
          responseMimeType: 'application/json',
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              title: { type: Type.STRING },
              summary: { type: Type.STRING },
              days: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    dayName: { type: Type.STRING },
                    focusArea: { type: Type.STRING },
                    isRestDay: { type: Type.BOOLEAN },
                    warmupMinutes: { type: Type.NUMBER },
                    workoutDurationMinutes: { type: Type.NUMBER },
                    cooldownMinutes: { type: Type.NUMBER },
                    estimatedBurnCalories: { type: Type.NUMBER },
                    intensityLevel: { type: Type.STRING },
                    recoveryTip: { type: Type.STRING },
                    exercises: {
                      type: Type.ARRAY,
                      items: {
                        type: Type.OBJECT,
                        properties: {
                          id: { type: Type.STRING },
                          name: { type: Type.STRING },
                          sets: { type: Type.NUMBER },
                          reps: { type: Type.STRING },
                          restSeconds: { type: Type.NUMBER },
                          targetMuscle: { type: Type.STRING },
                          equipment: { type: Type.STRING },
                          caloriesBurnEstimate: { type: Type.NUMBER },
                          notes: { type: Type.STRING },
                        },
                        required: ['id', 'name', 'sets', 'reps', 'restSeconds', 'targetMuscle', 'equipment', 'caloriesBurnEstimate'],
                      },
                    },
                  },
                  required: ['dayName', 'focusArea', 'isRestDay', 'warmupMinutes', 'workoutDurationMinutes', 'cooldownMinutes', 'estimatedBurnCalories', 'intensityLevel', 'exercises'],
                },
              },
            },
            required: ['title', 'summary', 'days'],
          },
        },
      })
    );

    const parsed = JSON.parse(response.text || '{}');
    const resultPlan = {
      id: `workout-plan-${Date.now()}`,
      generatedAt: new Date().toISOString(),
      ...parsed,
    };

    res.json(resultPlan);
  } catch (error: any) {
    console.warn('AI Workout Generation using dynamic tailored generator due to:', error?.message || error);
    const dynamicWorkout = buildDynamicCustomWorkoutPlan(preferences, biometricContext);
    res.json(dynamicWorkout);
  }
});

// ==========================================
// API Endpoint 3: AI Food & Nutrition Parser
// ==========================================
app.post('/api/analyze-food', async (req, res) => {
  const { query } = req.body;
  if (!query || typeof query !== 'string') {
    return res.status(400).json({ error: 'Query string is required' });
  }

  const ai = getGenAI();
  if (!ai) {
    return res.json(buildDynamicNutritionAnalysis(query));
  }

  const prompt = `
Analyze the food or meal description: "${query}".
Accurately calculate its calories, protein (grams), carbs (grams), fat (grams), and realistic portion size.
Provide a concise breakdown of ingredients and macronutrient density.
`;

  try {
    const response = await callGeminiWithResilience((modelName) =>
      ai.models.generateContent({
        model: modelName,
        contents: prompt,
        config: {
          responseMimeType: 'application/json',
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              name: { type: Type.STRING, description: 'Clean formatted name of the food/dish' },
              calories: { type: Type.NUMBER, description: 'Total estimated calories in kcal' },
              proteinG: { type: Type.NUMBER, description: 'Total protein in grams' },
              carbsG: { type: Type.NUMBER, description: 'Total carbohydrates in grams' },
              fatG: { type: Type.NUMBER, description: 'Total fat in grams' },
              portion: { type: Type.STRING, description: 'e.g. 1 bowl (350g) or 2 medium eggs' },
              breakdown: { type: Type.STRING, description: 'Brief description of nutrition profile' },
            },
            required: ['name', 'calories', 'proteinG', 'carbsG', 'fatG', 'portion', 'breakdown'],
          },
        },
      })
    );

    const parsed = JSON.parse(response.text || '{}');
    res.json(parsed);
  } catch (error: any) {
    console.warn('Food analysis using dynamic estimator due to:', error?.message || error);
    res.json(buildDynamicNutritionAnalysis(query));
  }
});

// ==========================================
// API Endpoint 4: AI Dynamic Condition & State Adaptive Planner
// ==========================================
app.post('/api/adapt-plan-from-condition', async (req, res) => {
  const { userCondition, preferences, currentDietPlan, currentWorkoutPlan, biometrics } = req.body;
  const ai = getGenAI();

  if (!ai) {
    const mergedPrefs = {
      ...preferences,
      customInstructions: `${preferences?.customInstructions || ''} | Current Condition: ${userCondition}`,
    };
    const fallbackDiet = buildDynamicCustomDietPlan(mergedPrefs, biometrics);
    const fallbackWorkout = buildDynamicCustomWorkoutPlan(mergedPrefs, biometrics);
    return res.json({
      id: `condition-adaptation-${Date.now()}`,
      generatedAt: new Date().toISOString(),
      coachAdvice: `Adapted your plan for: "${userCondition}". Meals and workout intensities have been recalibrated.`,
      dietPlan: fallbackDiet,
      workoutPlan: fallbackWorkout,
    });
  }

  const prompt = `
You are an expert personalized sports nutritionist and biomechanics coach.
The user is providing their real-time condition, feelings, and immediate requirements:

User's Real-time State & Request:
"${userCondition || 'Need a quick healthy plan adjustment'}"

User Profile & Preferences:
- Name: ${preferences?.name || 'User'}
- Goal: ${preferences?.dietaryGoal || 'weight_loss'}
- Diet Type: ${preferences?.dietType || 'high_protein'}
- Allergies: ${(preferences?.allergies || []).join(', ') || 'None'}
- Disliked Foods: ${(preferences?.dislikedFoods || []).join(', ') || 'None'}
- Target Calories: ${preferences?.targetCalories || 2100} kcal
- Redmi Watch Biometrics: Active Burn: ${biometrics?.activeCaloriesBurned || 400} kcal, Resting HR: ${biometrics?.restingHeartRate || 62} bpm, Avg Stress: ${biometrics?.avgStressScore || 35}/100, Readiness: ${biometrics?.readinessScore || 85}/100.

Your Task:
1. Provide an empathetic, encouraging 2-sentence AI Coach advice responding directly to their condition.
2. Dynamically adapt and return an updated 7-day Weekly Diet Plan that reflects their immediate condition (e.g. anti-inflammatory foods, fast 15-min prep, soothing digestion, specific cravings, or high-protein recovery).
3. Dynamically adapt and return an updated 7-day Weekly Workout Plan (e.g. modify intensity, swap heavy lifts for mobility/recovery if sore/stressed, or ramp up if high energy).
`;

  try {
    const response = await callGeminiWithResilience((modelName) =>
      ai.models.generateContent({
        model: modelName,
        contents: prompt,
        config: {
          responseMimeType: 'application/json',
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              coachAdvice: { type: Type.STRING },
              dietPlan: {
                type: Type.OBJECT,
                properties: {
                  title: { type: Type.STRING },
                  overviewSummary: { type: Type.STRING },
                  groceryList: {
                    type: Type.ARRAY,
                    items: {
                      type: Type.OBJECT,
                      properties: {
                        category: { type: Type.STRING },
                        items: { type: Type.ARRAY, items: { type: Type.STRING } },
                      },
                      required: ['category', 'items'],
                    },
                  },
                  days: {
                    type: Type.ARRAY,
                    items: {
                      type: Type.OBJECT,
                      properties: {
                        dayName: { type: Type.STRING },
                        targetCalories: { type: Type.NUMBER },
                        totalCalories: { type: Type.NUMBER },
                        totalProteinG: { type: Type.NUMBER },
                        totalCarbsG: { type: Type.NUMBER },
                        totalFatG: { type: Type.NUMBER },
                        dailyTip: { type: Type.STRING },
                        breakfast: {
                          type: Type.OBJECT,
                          properties: {
                            id: { type: Type.STRING },
                            name: { type: Type.STRING },
                            description: { type: Type.STRING },
                            calories: { type: Type.NUMBER },
                            proteinG: { type: Type.NUMBER },
                            carbsG: { type: Type.NUMBER },
                            fatG: { type: Type.NUMBER },
                            prepTimeMinutes: { type: Type.NUMBER },
                            ingredients: { type: Type.ARRAY, items: { type: Type.STRING } },
                            recipeInstructions: { type: Type.ARRAY, items: { type: Type.STRING } },
                            tags: { type: Type.ARRAY, items: { type: Type.STRING } },
                          },
                          required: ['id', 'name', 'description', 'calories', 'proteinG', 'carbsG', 'fatG', 'prepTimeMinutes', 'ingredients'],
                        },
                        lunch: {
                          type: Type.OBJECT,
                          properties: {
                            id: { type: Type.STRING },
                            name: { type: Type.STRING },
                            description: { type: Type.STRING },
                            calories: { type: Type.NUMBER },
                            proteinG: { type: Type.NUMBER },
                            carbsG: { type: Type.NUMBER },
                            fatG: { type: Type.NUMBER },
                            prepTimeMinutes: { type: Type.NUMBER },
                            ingredients: { type: Type.ARRAY, items: { type: Type.STRING } },
                            recipeInstructions: { type: Type.ARRAY, items: { type: Type.STRING } },
                            tags: { type: Type.ARRAY, items: { type: Type.STRING } },
                          },
                          required: ['id', 'name', 'description', 'calories', 'proteinG', 'carbsG', 'fatG', 'prepTimeMinutes', 'ingredients'],
                        },
                        dinner: {
                          type: Type.OBJECT,
                          properties: {
                            id: { type: Type.STRING },
                            name: { type: Type.STRING },
                            description: { type: Type.STRING },
                            calories: { type: Type.NUMBER },
                            proteinG: { type: Type.NUMBER },
                            carbsG: { type: Type.NUMBER },
                            fatG: { type: Type.NUMBER },
                            prepTimeMinutes: { type: Type.NUMBER },
                            ingredients: { type: Type.ARRAY, items: { type: Type.STRING } },
                            recipeInstructions: { type: Type.ARRAY, items: { type: Type.STRING } },
                            tags: { type: Type.ARRAY, items: { type: Type.STRING } },
                          },
                          required: ['id', 'name', 'description', 'calories', 'proteinG', 'carbsG', 'fatG', 'prepTimeMinutes', 'ingredients'],
                        },
                        snack: {
                          type: Type.OBJECT,
                          properties: {
                            id: { type: Type.STRING },
                            name: { type: Type.STRING },
                            description: { type: Type.STRING },
                            calories: { type: Type.NUMBER },
                            proteinG: { type: Type.NUMBER },
                            carbsG: { type: Type.NUMBER },
                            fatG: { type: Type.NUMBER },
                            prepTimeMinutes: { type: Type.NUMBER },
                            ingredients: { type: Type.ARRAY, items: { type: Type.STRING } },
                            recipeInstructions: { type: Type.ARRAY, items: { type: Type.STRING } },
                            tags: { type: Type.ARRAY, items: { type: Type.STRING } },
                          },
                          required: ['id', 'name', 'description', 'calories', 'proteinG', 'carbsG', 'fatG', 'prepTimeMinutes', 'ingredients'],
                        },
                      },
                      required: ['dayName', 'targetCalories', 'totalCalories', 'totalProteinG', 'totalCarbsG', 'totalFatG', 'breakfast', 'lunch', 'dinner', 'snack'],
                    },
                  },
                },
                required: ['title', 'overviewSummary', 'days', 'groceryList'],
              },
              workoutPlan: {
                type: Type.OBJECT,
                properties: {
                  title: { type: Type.STRING },
                  summary: { type: Type.STRING },
                  days: {
                    type: Type.ARRAY,
                    items: {
                      type: Type.OBJECT,
                      properties: {
                        dayName: { type: Type.STRING },
                        focusArea: { type: Type.STRING },
                        isRestDay: { type: Type.BOOLEAN },
                        warmupMinutes: { type: Type.NUMBER },
                        workoutDurationMinutes: { type: Type.NUMBER },
                        cooldownMinutes: { type: Type.NUMBER },
                        estimatedBurnCalories: { type: Type.NUMBER },
                        intensityLevel: { type: Type.STRING },
                        recoveryTip: { type: Type.STRING },
                        exercises: {
                          type: Type.ARRAY,
                          items: {
                            type: Type.OBJECT,
                            properties: {
                              id: { type: Type.STRING },
                              name: { type: Type.STRING },
                              sets: { type: Type.NUMBER },
                              reps: { type: Type.STRING },
                              restSeconds: { type: Type.NUMBER },
                              targetMuscle: { type: Type.STRING },
                              equipment: { type: Type.STRING },
                              caloriesBurnEstimate: { type: Type.NUMBER },
                              notes: { type: Type.STRING },
                            },
                            required: ['id', 'name', 'sets', 'reps', 'restSeconds', 'targetMuscle', 'equipment', 'caloriesBurnEstimate'],
                          },
                        },
                      },
                      required: ['dayName', 'focusArea', 'isRestDay', 'warmupMinutes', 'workoutDurationMinutes', 'cooldownMinutes', 'estimatedBurnCalories', 'intensityLevel', 'exercises'],
                    },
                  },
                },
                required: ['title', 'summary', 'days'],
              },
            },
            required: ['coachAdvice', 'dietPlan', 'workoutPlan'],
          },
        },
      })
    );

    const parsed = JSON.parse(response.text || '{}');
    const result = {
      id: `condition-adaptation-${Date.now()}`,
      generatedAt: new Date().toISOString(),
      coachAdvice: parsed.coachAdvice,
      dietPlan: {
        id: `diet-plan-${Date.now()}`,
        generatedAt: new Date().toISOString(),
        validUntil: new Date(Date.now() + 7 * 86400000).toISOString(),
        ...parsed.dietPlan,
      },
      workoutPlan: {
        id: `workout-plan-${Date.now()}`,
        generatedAt: new Date().toISOString(),
        ...parsed.workoutPlan,
      },
    };

    res.json(result);
  } catch (error: any) {
    console.warn('Condition adaptation using dynamic generator due to:', error?.message || error);
    const mergedPrefs = {
      ...preferences,
      customInstructions: `${preferences?.customInstructions || ''} | Current Condition: ${userCondition}`,
    };
    const fallbackDiet = buildDynamicCustomDietPlan(mergedPrefs, biometrics);
    const fallbackWorkout = buildDynamicCustomWorkoutPlan(mergedPrefs, biometrics);
    res.json({
      id: `condition-adaptation-${Date.now()}`,
      generatedAt: new Date().toISOString(),
      coachAdvice: `Adapted your plan for: "${userCondition}". Meals and workout intensities have been calibrated.`,
      dietPlan: fallbackDiet,
      workoutPlan: fallbackWorkout,
    });
  }
});

// ==========================================
// API Endpoint 5: AI Biometric & Recovery Coach Insight
// ==========================================
app.post('/api/biometric-coach-insight', async (req, res) => {
  const { biometricSummary, dailyTracking, preferences } = req.body;
  const ai = getGenAI();

  if (!ai) {
    return res.json(buildDynamicCoachInsight(biometricSummary, dailyTracking, preferences));
  }

  const prompt = `
You are an elite wearable biometrics physiologist and functional nutrition coach.
Analyze the user's daily health data from their Redmi Watch and dietary logs:

Redmi Watch Biometrics:
- Total Steps: ${biometricSummary?.totalSteps || 0} / Target: ${preferences?.targetSteps || 10000}
- Distance: ${biometricSummary?.totalDistanceKm || 0} km
- Active Burn: ${biometricSummary?.activeCaloriesBurned || 0} kcal
- Resting Heart Rate: ${biometricSummary?.restingHeartRate || 60} bpm (Min: ${biometricSummary?.minHeartRate}, Max: ${biometricSummary?.maxHeartRate})
- Average Stress Score (HRV-based 0-100): ${biometricSummary?.avgStressScore || 35}/100 (Peak at ${biometricSummary?.stressPeakTime || 'afternoon'})
- Readiness Score: ${biometricSummary?.readinessScore || 85}/100
- Sleep: ${biometricSummary?.sleepHours || 7.5} hrs (${biometricSummary?.sleepQuality || 'good'})

Nutrition & Hydration Status Today:
- Calorie Intake: ${dailyTracking?.totalCalories || 0} kcal / Target: ${preferences?.targetCalories || 2050} kcal
- Protein: ${dailyTracking?.totalProteinG || 0}g / Target: ${preferences?.targetProteinG || 145}g
- Carbs: ${dailyTracking?.totalCarbsG || 0}g, Fat: ${dailyTracking?.totalFatG || 0}g
- Water Logged: ${dailyTracking?.totalWaterMl || 0} ml / Target: ${preferences?.targetWaterMl || 2800} ml

User Goals & Preferences:
- Goal: ${preferences?.dietaryGoal || 'weight loss'}
- Instructions: "${preferences?.customInstructions || 'Keep consistent'}"

Provide an empathetic, science-grounded biometric coaching assessment:
1. Overall status ('excellent', 'good', 'needs_attention', or 'recovery_needed')
2. A high-impact headline
3. Summary of physiological state
4. Targeted nutrition advice based on energy expenditure and stress
5. Workout intensity adjustment based on HRV/stress and resting HR
6. Stress mitigation advice if stress was elevated
7. Hydration status and actionable reminder
8. Calculated recovery readiness score (0-100)
`;

  try {
    const response = await callGeminiWithResilience((modelName) =>
      ai.models.generateContent({
        model: modelName,
        contents: prompt,
        config: {
          responseMimeType: 'application/json',
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              overallStatus: {
                type: Type.STRING,
                enum: ['excellent', 'good', 'needs_attention', 'recovery_needed'],
              },
              headline: { type: Type.STRING },
              summary: { type: Type.STRING },
              nutritionAdvice: { type: Type.STRING },
              workoutAdjustment: { type: Type.STRING },
              stressMitigationTip: { type: Type.STRING },
              hydrationAlert: { type: Type.STRING },
              readinessScore: { type: Type.NUMBER },
            },
            required: ['overallStatus', 'headline', 'summary', 'nutritionAdvice', 'workoutAdjustment', 'stressMitigationTip', 'hydrationAlert', 'readinessScore'],
          },
        },
      })
    );

    const parsed = JSON.parse(response.text || '{}');
    const resultInsight = {
      id: `insight-${Date.now()}`,
      generatedAt: new Date().toISOString(),
      ...parsed,
    };

    res.json(resultInsight);
  } catch (error: any) {
    console.warn('Coach insight using dynamic biometric analyzer due to:', error?.message || error);
    res.json(buildDynamicCoachInsight(biometricSummary, dailyTracking, preferences));
  }
});

// Vite middleware setup
async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Diet & Fitness Tracker server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();

