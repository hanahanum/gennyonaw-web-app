import React, { useState, useEffect } from 'react';
import {
  X,
  Sliders,
  Check,
  Sparkles,
  Watch,
  Flame,
  Droplet,
  Footprints,
  Calendar,
  AlertCircle,
  Plus,
  Trash2,
  Target,
  Scale,
  Ruler,
  Info,
  Dumbbell,
  CheckCircle2,
} from 'lucide-react';
import { UserPreferences } from '../types';
import { calculateBMI } from '../utils/goalCalculator';

interface PersonalInstructionsModalProps {
  isOpen: boolean;
  onClose: () => void;
  preferences: UserPreferences;
  onSave: (updated: UserPreferences) => void;
  onTriggerGenerate: (updatedPrefs: UserPreferences) => void;
  isGenerating: boolean;
}

const EQUIPMENT_CHOICES = [
  { label: 'No Equipment (Bodyweight / Mat)', icon: '🏠', desc: 'Living room / zero gear' },
  { label: 'Resistance Bands & Mat', icon: '🪢', desc: 'Loop & tube bands' },
  { label: 'Dumbbells (Home Gym)', icon: '🏋️', desc: 'Pair of dumbbells' },
  { label: 'Kettlebell & Mat', icon: '🔔', desc: 'Kettlebell training' },
  { label: 'Home Props (Chair / Towel)', icon: '🪑', desc: 'Household props' },
  { label: 'Full Gym Subscription', icon: '🏢', desc: 'Barbells & machines' },
];

export const PersonalInstructionsModal: React.FC<PersonalInstructionsModalProps> = ({
  isOpen,
  onClose,
  preferences,
  onSave,
  onTriggerGenerate,
  isGenerating,
}) => {
  const [formData, setFormData] = useState<UserPreferences>({
    ...preferences,
    availableEquipment: preferences.availableEquipment || ['No Equipment (Bodyweight / Mat)'],
  });
  const [newAllergy, setNewAllergy] = useState('');
  const [newDislike, setNewDislike] = useState('');

  useEffect(() => {
    if (isOpen) {
      setFormData({
        ...preferences,
        availableEquipment: preferences.availableEquipment || ['No Equipment (Bodyweight / Mat)'],
      });
    }
  }, [isOpen, preferences]);

  if (!isOpen) return null;

  const currentHeight = formData.heightCm || 162;
  const currentWeight = formData.weightKg || 63.5;
  const targetWeight = formData.targetWeightKg || 56.0;

  const currentBmiData = calculateBMI(currentWeight, currentHeight);
  const targetBmiData = calculateBMI(targetWeight, currentHeight);
  const isTargetHealthy = targetBmiData.bmi >= 18.5 && targetBmiData.bmi <= 24.9;

  const handleToggleEquipment = (eqLabel: string) => {
    const currentList = formData.availableEquipment || [];
    if (currentList.includes(eqLabel)) {
      if (currentList.length > 1) {
        setFormData({
          ...formData,
          availableEquipment: currentList.filter((item) => item !== eqLabel),
        });
      }
    } else {
      setFormData({
        ...formData,
        availableEquipment: [...currentList, eqLabel],
      });
    }
  };

  const handleAddAllergy = (e: React.FormEvent) => {
    e.preventDefault();
    if (newAllergy.trim() && !formData.allergies.includes(newAllergy.trim())) {
      setFormData({
        ...formData,
        allergies: [...formData.allergies, newAllergy.trim()],
      });
      setNewAllergy('');
    }
  };

  const handleRemoveAllergy = (item: string) => {
    setFormData({
      ...formData,
      allergies: formData.allergies.filter((a) => a !== item),
    });
  };

  const handleAddDislike = (e: React.FormEvent) => {
    e.preventDefault();
    if (newDislike.trim() && !formData.dislikedFoods.includes(newDislike.trim())) {
      setFormData({
        ...formData,
        dislikedFoods: [...formData.dislikedFoods, newDislike.trim()],
      });
      setNewDislike('');
    }
  };

  const handleRemoveDislike = (item: string) => {
    setFormData({
      ...formData,
      dislikedFoods: formData.dislikedFoods.filter((d) => d !== item),
    });
  };

  const handleSaveAndClose = () => {
    onSave(formData);
    onClose();
  };

  const handleSaveAndRegenerate = () => {
    onSave(formData);
    onTriggerGenerate(formData);
    onClose();
  };

  const handleSetIdealBMI = () => {
    setFormData({
      ...formData,
      targetWeightKg: currentBmiData.idealWeightKg,
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#3D312A]/60 backdrop-blur-xs overflow-y-auto">
      <div
        id="personal-instructions-modal"
        className="bg-[#FFFDFB] rounded-3xl max-w-2xl w-full p-6 sm:p-8 shadow-2xl border border-[#EEDDD3] my-8 max-h-[90vh] flex flex-col animate-in zoom-in-95 duration-200"
      >
        {/* Modal Header */}
        <div className="flex items-center justify-between pb-4 border-b border-[#EEDDD3] shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-[#FFF1E6] text-[#D48B77] border border-[#EEDDD3] flex items-center justify-center">
              <Sliders className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-[#3D312A]">Personal Settings & Targets</h2>
              <p className="text-xs text-[#7C6E66]">Customize your body goals, height, weight target, equipment & dietary rules</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-[#7C6E66] hover:text-[#3D312A] hover:bg-[#FFF1E6] transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="space-y-5 py-4 overflow-y-auto pr-1 text-xs">
          {/* Body Metrics & BMI Rules Section */}
          <div className="p-4 rounded-2xl bg-[#FFF1E6]/80 border border-[#EEDDD3] space-y-3">
            <div className="flex items-center justify-between flex-wrap gap-2">
              <div className="flex items-center gap-2">
                <Target className="w-4 h-4 text-[#D48B77]" />
                <span className="font-bold text-[#3D312A] text-sm">Body Metrics & BMI Target Rules</span>
              </div>
              <button
                type="button"
                onClick={handleSetIdealBMI}
                className="px-2.5 py-1 rounded-lg bg-white hover:bg-[#EDDCD2] text-[#5C3A2E] font-bold text-[11px] border border-[#EEDDD3] transition shadow-2xs"
              >
                ✨ Set Ideal 21.5 BMI ({currentBmiData.idealWeightKg} kg)
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {/* Height */}
              <div>
                <label className="text-[11px] font-semibold text-[#7C6E66] block mb-1">Height (cm)</label>
                <div className="relative">
                  <input
                    type="number"
                    step="0.5"
                    min="120"
                    max="230"
                    value={formData.heightCm || 162}
                    onChange={(e) => setFormData({ ...formData, heightCm: parseFloat(e.target.value) || 162 })}
                    className="w-full pl-3 pr-8 py-2 rounded-xl border border-[#EEDDD3] bg-white text-[#3D312A] font-mono font-bold"
                  />
                  <span className="absolute right-3 top-2 text-xs text-[#7C6E66] font-semibold">cm</span>
                </div>
              </div>

              {/* Current Weight */}
              <div>
                <label className="text-[11px] font-semibold text-[#7C6E66] block mb-1">Current Weight (kg)</label>
                <div className="relative">
                  <input
                    type="number"
                    step="0.1"
                    min="30"
                    max="250"
                    value={formData.weightKg || 63.5}
                    onChange={(e) => setFormData({ ...formData, weightKg: parseFloat(e.target.value) || 63.5 })}
                    className="w-full pl-3 pr-8 py-2 rounded-xl border border-[#EEDDD3] bg-white text-[#3D312A] font-mono font-bold"
                  />
                  <span className="absolute right-3 top-2 text-xs text-[#7C6E66] font-semibold">kg</span>
                </div>
              </div>

              {/* Target Weight */}
              <div>
                <label className="text-[11px] font-semibold text-[#7C6E66] block mb-1">Target Weight (kg)</label>
                <div className="relative">
                  <input
                    type="number"
                    step="0.1"
                    min="30"
                    max="250"
                    value={formData.targetWeightKg || 56.0}
                    onChange={(e) => setFormData({ ...formData, targetWeightKg: parseFloat(e.target.value) || 56.0 })}
                    className="w-full pl-3 pr-8 py-2 rounded-xl border border-[#EEDDD3] bg-white text-[#3D312A] font-mono font-bold"
                  />
                  <span className="absolute right-3 top-2 text-xs text-[#7C6E66] font-semibold">kg</span>
                </div>
              </div>
            </div>

            {/* Live BMI Status Bar */}
            <div className="p-2.5 rounded-xl bg-white border border-[#EEDDD3] flex flex-wrap items-center justify-between gap-2 text-[11px]">
              <div className="flex items-center gap-2">
                <span className="text-[#7C6E66]">Current BMI:</span>
                <strong className="text-[#3D312A] font-mono">{currentBmiData.bmi}</strong>
                <span className="px-1.5 py-0.5 rounded-md bg-[#F0EFEB] text-[#5C3A2E] font-medium text-[10px]">
                  {currentBmiData.category}
                </span>
                <span className="text-[#7C6E66]">➔ Target BMI:</span>
                <strong className={`font-mono font-bold ${isTargetHealthy ? 'text-emerald-700' : 'text-amber-700'}`}>
                  {targetBmiData.bmi}
                </strong>
                <span className={`px-1.5 py-0.5 rounded-md text-[10px] font-medium ${
                  isTargetHealthy ? 'bg-emerald-50 text-emerald-800' : 'bg-amber-50 text-amber-800'
                }`}>
                  {targetBmiData.category}
                </span>
              </div>
              <span className="text-[#7C6E66]">
                Healthy range: <strong className="text-[#3D312A]">{currentBmiData.minHealthyWeightKg}–{currentBmiData.maxHealthyWeightKg} kg</strong>
              </span>
            </div>
          </div>

          {/* Workout Equipment Preferences (USER REQUEST) */}
          <div className="p-4 rounded-2xl bg-white border border-[#EEDDD3] space-y-2.5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Dumbbell className="w-4 h-4 text-[#D48B77]" />
                <span className="font-bold text-[#3D312A] text-sm">Workout Equipment You Have / Will Use</span>
              </div>
              <span className="text-[11px] text-[#7C6E66]">AI will tailor routines strictly to your gear</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {EQUIPMENT_CHOICES.map((eq) => {
                const isSelected = (formData.availableEquipment || []).includes(eq.label);
                return (
                  <button
                    key={eq.label}
                    type="button"
                    onClick={() => handleToggleEquipment(eq.label)}
                    className={`flex items-start gap-2.5 p-2.5 rounded-2xl border text-left transition-all ${
                      isSelected
                        ? 'bg-[#FFF1E6] border-[#D48B77] text-[#3D312A] shadow-xs'
                        : 'bg-white border-[#EEDDD3] text-[#7C6E66] hover:bg-[#F0EFEB]/70'
                    }`}
                  >
                    <span className="text-xl shrink-0 mt-0.5">{eq.icon}</span>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-xs leading-tight">{eq.label}</span>
                        {isSelected && <CheckCircle2 className="w-3.5 h-3.5 text-[#D48B77] shrink-0 ml-1" />}
                      </div>
                      <p className="text-[10px] text-[#7C6E66] line-clamp-1 mt-0.5">{eq.desc}</p>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Calorie & Macro Baseline */}
          <div className="space-y-2">
            <span className="font-bold text-[#3D312A] block text-sm">Daily Calorie & Macro Baseline</span>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              <div>
                <label className="text-[10px] text-[#7C6E66] block mb-1">Calories (kcal)</label>
                <input
                  type="number"
                  value={formData.targetCalories || 2050}
                  onChange={(e) => setFormData({ ...formData, targetCalories: parseInt(e.target.value, 10) || 0 })}
                  className="w-full p-2 rounded-xl border border-[#EEDDD3] bg-white text-[#3D312A] font-mono"
                />
              </div>
              <div>
                <label className="text-[10px] text-[#7C6E66] block mb-1">Protein (g)</label>
                <input
                  type="number"
                  value={formData.targetProteinG || 145}
                  onChange={(e) => setFormData({ ...formData, targetProteinG: parseInt(e.target.value, 10) || 0 })}
                  className="w-full p-2 rounded-xl border border-[#EEDDD3] bg-white text-[#3D312A] font-mono"
                />
              </div>
              <div>
                <label className="text-[10px] text-[#7C6E66] block mb-1">Carbs (g)</label>
                <input
                  type="number"
                  value={formData.targetCarbsG || 185}
                  onChange={(e) => setFormData({ ...formData, targetCarbsG: parseInt(e.target.value, 10) || 0 })}
                  className="w-full p-2 rounded-xl border border-[#EEDDD3] bg-white text-[#3D312A] font-mono"
                />
              </div>
              <div>
                <label className="text-[10px] text-[#7C6E66] block mb-1">Fat (g)</label>
                <input
                  type="number"
                  value={formData.targetFatG || 60}
                  onChange={(e) => setFormData({ ...formData, targetFatG: parseInt(e.target.value, 10) || 0 })}
                  className="w-full p-2 rounded-xl border border-[#EEDDD3] bg-white text-[#3D312A] font-mono"
                />
              </div>
            </div>
          </div>

          {/* Diet Style */}
          <div className="space-y-2">
            <span className="font-bold text-[#3D312A] block text-sm">Diet Type Preference</span>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {[
                { id: 'high_protein', label: 'High Protein' },
                { id: 'balanced', label: 'Balanced' },
                { id: 'low_carb', label: 'Low Carb' },
                { id: 'vegetarian', label: 'Vegetarian' },
              ].map((style) => (
                <button
                  key={style.id}
                  type="button"
                  onClick={() => setFormData({ ...formData, dietType: style.id as any })}
                  className={`p-2 rounded-xl border text-xs font-bold transition ${
                    formData.dietType === style.id
                      ? 'bg-[#3D312A] text-[#FFF1E6] border-[#3D312A]'
                      : 'bg-white text-[#5C3A2E] border-[#EEDDD3] hover:bg-[#FFF1E6]'
                  }`}
                >
                  {style.label}
                </button>
              ))}
            </div>
          </div>

          {/* Custom AI Prompt Instructions */}
          <div className="space-y-2">
            <label className="font-bold text-[#3D312A] block text-sm">
              Custom AI Instructions & Dietary Preferences
            </label>
            <textarea
              rows={3}
              value={formData.customInstructions || ''}
              onChange={(e) => setFormData({ ...formData, customInstructions: e.target.value })}
              placeholder="e.g. Include quick 15-min air-fryer recipes, high protein snacks, and lower carbs on rest days..."
              className="w-full p-3 rounded-2xl border border-[#EEDDD3] bg-white text-[#3D312A] resize-none outline-hidden focus:border-[#D48B77]"
            />
          </div>

          {/* Allergies & Dislikes */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Allergies */}
            <div className="space-y-2">
              <span className="font-bold text-[#3D312A] block">Allergies</span>
              <form onSubmit={handleAddAllergy} className="flex gap-2">
                <input
                  type="text"
                  placeholder="e.g. Peanuts..."
                  value={newAllergy}
                  onChange={(e) => setNewAllergy(e.target.value)}
                  className="flex-1 p-2 rounded-xl border border-[#EEDDD3] bg-white text-[#3D312A]"
                />
                <button
                  type="submit"
                  className="p-2 rounded-xl bg-[#3D312A] text-[#FFF1E6] hover:bg-[#2E2420]"
                >
                  <Plus className="w-4 h-4" />
                </button>
              </form>
              <div className="flex flex-wrap gap-1.5">
                {formData.allergies.map((allergy) => (
                  <span
                    key={allergy}
                    className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-[#FFF1E6] text-[#5C3A2E] border border-[#EEDDD3] text-xs font-semibold"
                  >
                    {allergy}
                    <button
                      type="button"
                      onClick={() => handleRemoveAllergy(allergy)}
                      className="hover:text-red-500"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                ))}
              </div>
            </div>

            {/* Disliked Foods */}
            <div className="space-y-2">
              <span className="font-bold text-[#3D312A] block">Disliked Foods</span>
              <form onSubmit={handleAddDislike} className="flex gap-2">
                <input
                  type="text"
                  placeholder="e.g. Mushrooms..."
                  value={newDislike}
                  onChange={(e) => setNewDislike(e.target.value)}
                  className="flex-1 p-2 rounded-xl border border-[#EEDDD3] bg-white text-[#3D312A]"
                />
                <button
                  type="submit"
                  className="p-2 rounded-xl bg-[#3D312A] text-[#FFF1E6] hover:bg-[#2E2420]"
                >
                  <Plus className="w-4 h-4" />
                </button>
              </form>
              <div className="flex flex-wrap gap-1.5">
                {formData.dislikedFoods.map((item) => (
                  <span
                    key={item}
                    className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-[#FFF1E6] text-[#5C3A2E] border border-[#EEDDD3] text-xs font-semibold"
                  >
                    {item}
                    <button
                      type="button"
                      onClick={() => handleRemoveDislike(item)}
                      className="hover:text-red-500"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Modal Footer Actions */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-4 border-t border-[#EEDDD3] shrink-0">
          <button
            type="button"
            onClick={onClose}
            className="w-full sm:w-auto px-4 py-2.5 rounded-xl border border-[#EEDDD3] bg-white text-[#7C6E66] font-semibold hover:bg-[#FFF1E6] transition"
          >
            Cancel
          </button>
          <div className="flex items-center gap-2 w-full sm:w-auto">
            <button
              type="button"
              onClick={handleSaveAndClose}
              className="flex-1 sm:flex-none px-5 py-2.5 rounded-xl border border-[#EEDDD3] bg-[#FFF1E6] text-[#3D312A] font-bold hover:bg-[#EDDCD2] transition shadow-xs"
            >
              Save Targets
            </button>
            <button
              type="button"
              onClick={handleSaveAndRegenerate}
              disabled={isGenerating}
              className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-[#3D312A] text-[#FFF1E6] font-bold hover:bg-[#2E2420] transition shadow-xs disabled:opacity-50"
            >
              <Sparkles className="w-4 h-4 text-[#E88E75]" />
              <span>{isGenerating ? 'Regenerating...' : 'Save & AI Regenerate'}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
