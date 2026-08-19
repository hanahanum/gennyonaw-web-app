import React, { useState, useEffect } from 'react';
import { X, Wind, Heart, Play, Pause, RotateCcw } from 'lucide-react';

interface BreathingPacerModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentStressScore: number;
}

type Phase = 'Inhale' | 'Hold' | 'Exhale' | 'Rest';

export const BreathingPacerModal: React.FC<BreathingPacerModalProps> = ({
  isOpen,
  onClose,
  currentStressScore,
}) => {
  const [phase, setPhase] = useState<Phase>('Inhale');
  const [secondsLeft, setSecondsLeft] = useState(4);
  const [isActive, setIsActive] = useState(true);
  const [cyclesCompleted, setCyclesCompleted] = useState(0);

  useEffect(() => {
    if (!isOpen || !isActive) return;

    const timer = setInterval(() => {
      setSecondsLeft((prev) => {
        if (prev > 1) return prev - 1;

        if (phase === 'Inhale') {
          setPhase('Hold');
          return 7;
        } else if (phase === 'Hold') {
          setPhase('Exhale');
          return 8;
        } else {
          setPhase('Inhale');
          setCyclesCompleted((c) => c + 1);
          return 4;
        }
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [isOpen, isActive, phase]);

  if (!isOpen) return null;

  const getScale = () => {
    if (phase === 'Inhale') return 'scale-125';
    if (phase === 'Hold') return 'scale-125';
    if (phase === 'Exhale') return 'scale-90';
    return 'scale-100';
  };

  const getPhaseInstruction = () => {
    switch (phase) {
      case 'Inhale':
        return 'Deep diaphragmatic inhale through nose... (4s)';
      case 'Hold':
        return 'Hold breath calmly and relax shoulders... (7s)';
      case 'Exhale':
        return 'Slow, complete exhale through mouth... (8s)';
      default:
        return 'Prepare...';
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#3D312A]/70 backdrop-blur-xs">
      <div
        id="breathing-pacer-modal"
        className="bg-[#FFFDFB] rounded-3xl max-w-md w-full p-6 sm:p-8 shadow-2xl border border-[#EEDDD3] text-center space-y-6 animate-in zoom-in-95 duration-200"
      >
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-[#FFF1E6] text-[#D48B77] border border-[#EEDDD3] flex items-center justify-center">
              <Wind className="w-4 h-4" />
            </div>
            <div className="text-left">
              <h2 className="text-base font-bold text-[#3D312A]">4-7-8 Stress Reset</h2>
              <p className="text-[11px] text-[#7C6E66]">Vagal nerve stimulation for HRV recovery</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-xl text-[#7C6E66] hover:text-[#3D312A] hover:bg-[#FFF1E6] transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Biometric Context Pill */}
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#FFF1E6] border border-[#EEDDD3] text-xs text-[#5C3A2E]">
          <Heart className="w-3.5 h-3.5 text-[#E88E75]" />
          <span>Current Watch Stress: <strong className="text-[#3D312A]">{currentStressScore}/100</strong></span>
        </div>

        {/* Visual Breathing Pacer Circle */}
        <div className="relative py-8 flex items-center justify-center">
          <div
            className={`w-48 h-48 rounded-full bg-gradient-to-br from-[#E88E75] via-[#D48B77] to-[#C47C68] text-white flex flex-col items-center justify-center transition-all duration-1000 ease-in-out shadow-xl ${getScale()}`}
          >
            <span className="text-xs uppercase tracking-widest font-semibold opacity-90">
              {phase}
            </span>
            <span className="text-4xl font-extrabold font-mono mt-1">
              {secondsLeft}
            </span>
          </div>
        </div>

        {/* Instructions */}
        <div className="space-y-1">
          <p className="text-xs text-[#3D312A] font-bold">
            {getPhaseInstruction()}
          </p>
          <p className="text-[11px] text-[#7C6E66]">
            Cycles Completed: {cyclesCompleted}
          </p>
        </div>

        {/* Controls */}
        <div className="flex items-center justify-center gap-3 pt-2">
          <button
            onClick={() => setIsActive(!isActive)}
            className="px-5 py-2.5 rounded-2xl bg-[#3D312A] hover:bg-[#2E2420] text-[#FFF1E6] text-xs font-bold transition flex items-center gap-2 shadow-xs"
          >
            {isActive ? <Pause className="w-4 h-4 text-[#E88E75]" /> : <Play className="w-4 h-4 text-[#E88E75]" />}
            <span>{isActive ? 'Pause Pacer' : 'Resume'}</span>
          </button>

          <button
            onClick={() => {
              setPhase('Inhale');
              setSecondsLeft(4);
              setCyclesCompleted(0);
            }}
            className="p-2.5 rounded-2xl border border-[#EEDDD3] bg-white text-[#7C6E66] hover:text-[#3D312A] hover:bg-[#FFF1E6] transition"
            title="Reset Pacer"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
