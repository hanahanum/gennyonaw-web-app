import React, { useState } from 'react';
import {
  X,
  Sparkles,
  Zap,
  Activity,
  Heart,
  Flame,
  Clock,
  Coffee,
  CheckCircle2,
  Send,
  Sliders,
  MessageSquare,
  Dumbbell,
  Home,
  Building2,
  Layers,
} from 'lucide-react';
import { UserPreferences, DailyBiometricSummary } from '../types';

interface AIStatePlannerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAdaptPlan: (conditionPrompt: string) => Promise<void>;
  isLoading: boolean;
  preferences: UserPreferences;
  biometrics: DailyBiometricSummary;
}

const EQUIPMENT_OPTIONS = [
  { id: 'bodyweight', label: 'No Equipment (Bodyweight / Mat)', icon: '🏠', desc: 'Zero gear needed, 100% floor / living room friendly' },
  { id: 'resistance_bands', label: 'Resistance Bands & Mat', icon: '🪢', desc: 'Loop bands, tube bands, or pull-up assist bands' },
  { id: 'dumbbells', label: 'Dumbbells (Home Gym)', icon: '🏋️', desc: 'Light/moderate dumbbells or adjustable set' },
  { id: 'kettlebell', label: 'Kettlebell & Mat', icon: '🔔', desc: 'Single or double kettlebell functional movements' },
  { id: 'home_props', label: 'Home Props (Chair / Towel / Wall)', icon: '🪑', desc: 'Simple household sturdy items for support' },
  { id: 'full_gym', label: 'Full Gym Subscription', icon: '🏢', desc: 'Barbells, cables, leg press & machine stacks' },
];

export const AIStatePlannerModal: React.FC<AIStatePlannerModalProps> = ({
  isOpen,
  onClose,
  onAdaptPlan,
  isLoading,
  preferences,
  biometrics,
}) => {
  const [conditionText, setConditionText] = useState('');
  const [selectedEnergy, setSelectedEnergy] = useState<'low' | 'moderate' | 'high' | 'exhausted'>('moderate');
  const [selectedGoalFocus, setSelectedGoalFocus] = useState<string>('Quick Recovery');
  const [selectedTimeAvailable, setSelectedTimeAvailable] = useState<string>('25 mins');
  const [selectedEquipment, setSelectedEquipment] = useState<string[]>(
    preferences.availableEquipment && preferences.availableEquipment.length > 0
      ? preferences.availableEquipment
      : ['No Equipment (Bodyweight / Mat)']
  );

  if (!isOpen) return null;

  const quickStateChips = [
    { label: '😴 Low Energy / Sore Muscles', prompt: 'I am feeling sore and tired from yesterday. Need easy anti-inflammatory meals and light mobility/stretching routine.' },
    { label: '⚡ High Energy / Push PRs', prompt: 'Feeling super energized and ready to push hard today! Need high-protein fuel and an intense workout routine.' },
    { label: '⏱️ Super Busy / 15m Express', prompt: 'I have very limited time today (under 20 minutes). Give me lightning fast meals and a quick 15-minute home bodyweight workout.' },
    { label: '🏠 At Home (No Gym Access)', prompt: 'I am at home without gym equipment. Please structure a full-body routine using bodyweight, mat, and living room space.' },
    { label: '🥗 Bloated / Digestion Reset', prompt: 'Feeling slightly bloated and sluggish. Need light, soothing gut-friendly meals and gentle core/mobility work.' },
    { label: '🌸 Period Care / Gentle Flow', prompt: 'Currently in luteal/period phase with pelvic tension. Need soothing warm meals, iron-rich foods, and gentle floor stretches with zero crunching.' },
  ];

  const handleChipClick = (chipPrompt: string) => {
    setConditionText(chipPrompt);
  };

  const toggleEquipment = (eqLabel: string) => {
    if (selectedEquipment.includes(eqLabel)) {
      if (selectedEquipment.length > 1) {
        setSelectedEquipment(selectedEquipment.filter((item) => item !== eqLabel));
      }
    } else {
      setSelectedEquipment([...selectedEquipment, eqLabel]);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const equipmentStr = selectedEquipment.join(', ');
    const finalPrompt = conditionText.trim()
      ? `${conditionText}. Available Equipment: [${equipmentStr}]. Current Energy: ${selectedEnergy}, Time Available: ${selectedTimeAvailable}, Goal Focus: ${selectedGoalFocus}. Note: Strict equipment constraint — only use the listed equipment.`
      : `Current State: Energy is ${selectedEnergy}, Time available is ${selectedTimeAvailable}, Focus is ${selectedGoalFocus}. Available Equipment: [${equipmentStr}]. Only prescribe exercises that use this equipment (do not assume gym subscription if only bodyweight/home gear is selected).`;

    await onAdaptPlan(finalPrompt);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#3D312A]/60 backdrop-blur-xs overflow-y-auto">
      <div
        id="ai-state-planner-modal"
        className="bg-[#FFFDFB] rounded-3xl max-w-2xl w-full p-6 sm:p-8 shadow-2xl border border-[#EEDDD3] my-8 max-h-[92vh] flex flex-col animate-in zoom-in-95 duration-200"
      >
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-[#EEDDD3] shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-[#3D312A] text-[#FFF1E6] flex items-center justify-center font-bold shadow-xs">
              <Sparkles className="w-5 h-5 text-[#E88E75]" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg sm:text-xl font-bold text-[#3D312A]">
                  Recalibrate Workout & Daily Plan
                </h2>
                <span className="bento-chip bg-[#FFF1E6] text-[#5C3A2E] border border-[#EEDDD3]">
                  AI Synthesis
                </span>
              </div>
              <p className="text-xs text-[#7C6E66]">
                Adapt routine to your energy, time, cravings, and available workout equipment
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-[#7C6E66] hover:text-[#3D312A] hover:bg-[#FFF1E6] transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="overflow-y-auto py-4 space-y-4 pr-1 text-xs sm:text-sm">
          {/* Real-time Biometric Context Banner */}
          <div className="p-3.5 rounded-2xl bg-[#FFF1E6]/80 border border-[#EEDDD3] flex items-center justify-between flex-wrap gap-2 text-xs">
            <div className="flex items-center gap-2 text-[#5C3A2E] font-medium">
              <Activity className="w-4 h-4 text-[#D48B77]" />
              <span>Synced Watch Telemetry:</span>
            </div>
            <div className="flex items-center gap-3 font-mono text-[11px] text-[#3D312A]">
              <span>HR: <strong>{biometrics.averageHeartRateBpm} bpm</strong></span>
              <span>Stress: <strong>{biometrics.stressScore}/100</strong></span>
              <span>Burn: <strong>{biometrics.activeCaloriesBurned} kcal</strong></span>
            </div>
          </div>

          {/* Available Workout Equipment Selector (CRITICAL USER REQUEST) */}
          <div className="p-3.5 rounded-2xl bg-white border border-[#EEDDD3] space-y-2.5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Dumbbell className="w-4 h-4 text-[#D48B77]" />
                <span className="font-bold text-[#3D312A] text-xs uppercase tracking-wider">
                  Equipment You Have / Will Use Today:
                </span>
              </div>
              <span className="text-[11px] text-[#7C6E66]">Select all that apply</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {EQUIPMENT_OPTIONS.map((eq) => {
                const isSelected = selectedEquipment.includes(eq.label);
                return (
                  <button
                    key={eq.id}
                    type="button"
                    onClick={() => toggleEquipment(eq.label)}
                    className={`flex items-start gap-2.5 p-2.5 rounded-2xl border text-left transition-all ${
                      isSelected
                        ? 'bg-[#FFF1E6] border-[#D48B77] text-[#3D312A] shadow-xs'
                        : 'bg-white border-[#EEDDD3]/80 text-[#7C6E66] hover:bg-[#F0EFEB]/60 hover:text-[#3D312A]'
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

          {/* Quick Condition Presets */}
          <div className="space-y-2">
            <span className="font-bold text-[#3D312A] text-xs uppercase tracking-wider block">
              Quick State Presets:
            </span>
            <div className="flex flex-wrap gap-1.5">
              {quickStateChips.map((chip, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => handleChipClick(chip.prompt)}
                  className="px-3 py-1.5 rounded-xl text-xs bg-[#FFF1E6] hover:bg-[#EDDCD2] border border-[#EEDDD3] text-[#5C3A2E] font-medium transition"
                >
                  {chip.label}
                </button>
              ))}
            </div>
          </div>

          {/* Natural Language Prompt Area */}
          <div className="space-y-1.5">
            <label className="font-bold text-[#3D312A] text-xs flex items-center gap-1.5">
              <MessageSquare className="w-3.5 h-3.5 text-[#D48B77]" />
              <span>Describe your current situation, cravings, or constraints:</span>
            </label>
            <textarea
              rows={3}
              value={conditionText}
              onChange={(e) => setConditionText(e.target.value)}
              placeholder="e.g., 'Working from home today with zero dumbbells. Want a quick 20-min bodyweight core & glute routine, plus high-protein lunch ideas.'"
              className="w-full p-3 rounded-2xl border border-[#EEDDD3] bg-white text-[#3D312A] text-xs sm:text-sm focus:border-[#D48B77] focus:ring-1 focus:ring-[#D48B77] resize-none outline-hidden"
            />
          </div>

          {/* Micro Constraints Selectors */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {/* Energy */}
            <div className="space-y-1">
              <label className="text-[11px] font-bold text-[#7C6E66]">Energy Level</label>
              <select
                value={selectedEnergy}
                onChange={(e) => setSelectedEnergy(e.target.value as any)}
                className="w-full p-2.5 rounded-xl border border-[#EEDDD3] bg-white text-[#3D312A] text-xs font-semibold"
              >
                <option value="high">⚡ High Energy</option>
                <option value="moderate">🙂 Moderate / Normal</option>
                <option value="low">😴 Low / Fatigued</option>
                <option value="exhausted">🛑 Exhausted / Need Rest</option>
              </select>
            </div>

            {/* Time Available */}
            <div className="space-y-1">
              <label className="text-[11px] font-bold text-[#7C6E66]">Workout Time</label>
              <select
                value={selectedTimeAvailable}
                onChange={(e) => setSelectedTimeAvailable(e.target.value)}
                className="w-full p-2.5 rounded-xl border border-[#EEDDD3] bg-white text-[#3D312A] text-xs font-semibold"
              >
                <option value="15 mins">⚡ 15 Minutes (Express)</option>
                <option value="25 mins">⏱️ 25 Minutes (Standard)</option>
                <option value="45 mins">💪 45 Minutes (Full Session)</option>
                <option value="60 mins">🔥 60 Minutes (High Volume)</option>
              </select>
            </div>

            {/* Goal Focus */}
            <div className="space-y-1">
              <label className="text-[11px] font-bold text-[#7C6E66]">Primary Focus Today</label>
              <select
                value={selectedGoalFocus}
                onChange={(e) => setSelectedGoalFocus(e.target.value)}
                className="w-full p-2.5 rounded-xl border border-[#EEDDD3] bg-white text-[#3D312A] text-xs font-semibold"
              >
                <option value="Quick Recovery">🌱 Recovery & Mobility</option>
                <option value="Maximum Fat Burn">🔥 Maximize Fat Oxidation</option>
                <option value="Hypertrophy / Muscle Build">💪 Muscle Tone & Strength</option>
                <option value="Stress Relief">🧘 Stress Reduction</option>
              </select>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center justify-end gap-2 pt-3 border-t border-[#EEDDD3]">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-2xl border border-[#EEDDD3] bg-white hover:bg-[#FFF1E6] text-[#3D312A] text-xs font-semibold transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className="px-5 py-2.5 rounded-2xl bg-[#3D312A] hover:bg-[#2E2420] text-[#FFF1E6] text-xs font-bold transition flex items-center gap-1.5 disabled:opacity-50 shadow-xs"
            >
              <Sparkles className="w-4 h-4 text-[#E88E75]" />
              <span>{isLoading ? 'AI Recalibrating...' : 'Recalibrate Diet & Workout'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
