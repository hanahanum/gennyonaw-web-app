import React, { useState } from 'react';
import {
  Activity,
  Heart,
  Flame,
  Footprints,
  Moon,
  RefreshCw,
  CheckCircle2,
  AlertCircle,
  X,
  Smartphone,
  Key,
  Bluetooth,
  ArrowDownToLine,
  Layers,
  Sparkles,
  PenLine,
} from 'lucide-react';
import { DailyBiometricSummary, UserPreferences, HealthConnectSyncPayload } from '../types';
import { fetchHealthConnectData, connectWebBluetoothWatch } from '../utils/healthConnectClient';

interface HealthConnectFetchModalProps {
  isOpen: boolean;
  onClose: () => void;
  preferences: UserPreferences;
  onApplyBiometrics: (syncedData: DailyBiometricSummary) => void;
  showNotification: (msg: string) => void;
}

export const HealthConnectFetchModal: React.FC<HealthConnectFetchModalProps> = ({
  isOpen,
  onClose,
  preferences,
  onApplyBiometrics,
  showNotification,
}) => {
  const [activeTab, setActiveTab] = useState<'instant' | 'token' | 'bluetooth' | 'manual'>('instant');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [accessToken, setAccessToken] = useState<string>('');
  const [previewData, setPreviewData] = useState<HealthConnectSyncPayload | null>(null);
  const [statusMessage, setStatusMessage] = useState<{ type: 'success' | 'error' | 'info'; text: string } | null>(null);
  const [liveHr, setLiveHr] = useState<number | null>(null);

  // Manual watch entry fields
  const [manualSteps, setManualSteps] = useState<string>('6500');
  const [manualHr, setManualHr] = useState<string>('68');
  const [manualBurn, setManualBurn] = useState<string>('320');
  const [manualStress, setManualStress] = useState<string>('28');

  if (!isOpen) return null;

  const handleManualCalibrate = () => {
    const steps = Math.max(0, parseInt(manualSteps) || 0);
    const hr = Math.max(40, parseInt(manualHr) || 68);
    const burn = Math.max(0, parseInt(manualBurn) || 0);
    const stress = Math.min(100, Math.max(0, parseInt(manualStress) || 28));

    const now = new Date();
    const payload: HealthConnectSyncPayload = {
      source: `${preferences.watchModel || 'Redmi Watch 5 Active'} (Watch Display Entry)`,
      deviceModel: preferences.watchModel || 'Redmi Watch 5 Active',
      lastSyncTimestamp: now.toISOString(),
      stepCount: steps,
      activeCaloriesBurned: burn,
      averageHeartRateBpm: hr,
      restingHeartRateBpm: Math.max(48, hr - 8),
      stressScore: stress,
      stressLevel: stress < 30 ? 'relaxed' : stress < 60 ? 'mild' : 'moderate',
      sleepHours: 7.5,
      sleepQuality: 'optimal',
      activeMinutes: Math.round(steps / 110),
      standingHours: 10,
      readinessScore: Math.max(50, Math.min(98, Math.round(100 - stress * 0.45 + (hr < 70 ? 8 : 0)))),
      hourlyReadings: [
        { timestamp: '08:00', heartRateBpm: Math.max(55, hr - 10), stressScore: Math.max(15, stress - 8), stressLevel: 'relaxed', activityState: 'walking', stepIncrement: Math.round(steps * 0.2) },
        { timestamp: '12:00', heartRateBpm: hr, stressScore: stress, stressLevel: stress < 30 ? 'relaxed' : 'mild', activityState: 'walking', stepIncrement: Math.round(steps * 0.3) },
        { timestamp: '16:00', heartRateBpm: hr + 10, stressScore: stress + 5, stressLevel: stress > 50 ? 'moderate' : 'mild', activityState: 'workout', stepIncrement: Math.round(steps * 0.3) },
        { timestamp: '20:00', heartRateBpm: hr, stressScore: stress, stressLevel: 'relaxed', activityState: 'resting', stepIncrement: Math.round(steps * 0.2) },
      ],
    };

    setPreviewData(payload);
    setStatusMessage({
      type: 'success',
      text: `Calibrated ${steps.toLocaleString()} steps, ${hr} BPM, and ${burn} kcal directly from your ${preferences.watchModel || 'Redmi Watch 5 Active'}.`,
    });
  };

  const handleFetchFromAPI = async (tokenToUse?: string) => {
    setIsLoading(true);
    setStatusMessage(null);

    try {
      const response = await fetchHealthConnectData({
        accessToken: tokenToUse || accessToken,
        deviceModel: preferences.watchModel || 'Redmi Watch 5 Active',
        forceLive: true,
      });

      if (response.success && response.data) {
        setPreviewData(response.data);
        setStatusMessage({
          type: 'success',
          text: `Fetched ${response.data.stepCount.toLocaleString()} steps, ${response.data.averageHeartRateBpm} avg BPM, and ${response.data.activeCaloriesBurned} kcal from ${response.data.source}.`,
        });
      } else {
        setStatusMessage({
          type: 'error',
          text: response.message || 'Failed to fetch from Health Connect API.',
        });
      }
    } catch (err: any) {
      setStatusMessage({
        type: 'error',
        text: err?.message || 'Error connecting to Health Connect bridge.',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleConnectBluetooth = async () => {
    setIsLoading(true);
    setStatusMessage({ type: 'info', text: 'Opening Bluetooth pairing dialog... Select your Redmi Watch.' });

    const result = await connectWebBluetoothWatch((bpm) => {
      setLiveHr(bpm);
    });

    setIsLoading(false);
    if (result.success) {
      setStatusMessage({
        type: 'success',
        text: `Connected to ${result.deviceName}! Live Heart Rate GATT streaming active.`,
      });
      // Fetch full telemetry
      handleFetchFromAPI();
    } else {
      setStatusMessage({
        type: 'error',
        text: result.error || 'Unable to establish Web Bluetooth link.',
      });
    }
  };

  const handleApplyToApp = () => {
    if (!previewData) return;

    const updatedSummary: DailyBiometricSummary = {
      date: new Date().toISOString().split('T')[0],
      totalSteps: previewData.stepCount,
      stepCount: previewData.stepCount,
      totalDistanceKm: Number((previewData.stepCount * 0.00075).toFixed(2)),
      avgHeartRate: previewData.averageHeartRateBpm,
      averageHeartRateBpm: previewData.averageHeartRateBpm,
      restingHeartRate: previewData.restingHeartRateBpm,
      restingHeartRateBpm: previewData.restingHeartRateBpm,
      maxHeartRate: Math.max(140, previewData.averageHeartRateBpm + 25),
      minHeartRate: Math.min(52, previewData.restingHeartRateBpm - 5),
      avgStressScore: previewData.stressScore,
      stressScore: previewData.stressScore,
      stressPeakTime: '15:30',
      stressLevel: previewData.stressLevel,
      activeCaloriesBurned: previewData.activeCaloriesBurned,
      standingHours: previewData.standingHours,
      activeMinutes: previewData.activeMinutes,
      readinessScore: previewData.readinessScore,
      sleepHours: previewData.sleepHours,
      sleepQuality: previewData.sleepQuality,
      hourlyReadings: previewData.hourlyReadings.length > 0 ? previewData.hourlyReadings : [
        { timestamp: '08:00', heartRateBpm: 68, stressScore: 28, stressLevel: 'relaxed', activityState: 'walking', stepIncrement: 1200 },
        { timestamp: '12:00', heartRateBpm: 76, stressScore: 35, stressLevel: 'mild', activityState: 'walking', stepIncrement: 2300 },
        { timestamp: '16:00', heartRateBpm: 92, stressScore: 42, stressLevel: 'moderate', activityState: 'workout', stepIncrement: 3300 },
        { timestamp: '20:00', heartRateBpm: 64, stressScore: 25, stressLevel: 'relaxed', activityState: 'resting', stepIncrement: 620 },
      ],
    };

    onApplyBiometrics(updatedSummary);
    showNotification(`Applied Health Connect biometrics: ${previewData.stepCount.toLocaleString()} steps & ${previewData.activeCaloriesBurned} kcal active burn!`);
    onClose();
  };

  return (
    <div id="health-connect-fetch-modal" className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-[#3D312A]/60 backdrop-blur-xs overflow-y-auto">
      <div className="bg-[#FFFDFB] rounded-3xl max-w-2xl w-full h-[580px] max-h-[90vh] p-5 sm:p-7 shadow-2xl border border-[#EEDDD3] my-auto animate-in zoom-in-95 duration-200 flex flex-col overflow-hidden">
        {/* Pinned Modal Header */}
        <div className="shrink-0 flex items-center justify-between pb-3 border-b border-[#EEDDD3]">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-10 h-10 rounded-2xl bg-[#FFF1E6] text-[#D48B77] border border-[#EEDDD3] flex items-center justify-center shadow-xs shrink-0">
              <Smartphone className="w-5 h-5" />
            </div>
            <div className="min-w-0 space-y-0.5">
              <div className="flex items-center gap-2 flex-wrap">
                <h2 className="text-base sm:text-lg font-black text-[#3D312A] whitespace-nowrap">
                  Fetch from Health Connect API
                </h2>
                <span className="bento-chip bg-[#6B9080]/15 text-[#6B9080] border border-[#6B9080]/30 text-[10px] whitespace-nowrap">
                  REST API & BLE
                </span>
              </div>
              <p className="text-[11px] sm:text-xs text-[#7C6E66] truncate">
                Stream steps, heart rate, stress, and active calories from your {preferences.watchModel || 'Redmi Watch 5 Active'}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-xl text-[#7C6E66] hover:text-[#3D312A] hover:bg-[#FFF1E6] transition shrink-0 ml-2"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Pinned Tab Selection */}
        <div className="shrink-0 grid grid-cols-4 gap-1 bg-[#F0EFEB] p-1.5 rounded-2xl border border-[#EEDDD3] my-2.5">
          <button
            onClick={() => setActiveTab('instant')}
            className={`py-2 px-1 rounded-xl text-[10px] sm:text-xs font-bold transition flex items-center justify-center gap-1 whitespace-nowrap ${
              activeTab === 'instant'
                ? 'bg-[#3D312A] text-[#FFF1E6] shadow-xs'
                : 'text-[#7C6E66] hover:text-[#3D312A]'
            }`}
          >
            <ArrowDownToLine className="w-3 h-3 sm:w-3.5 sm:h-3.5 shrink-0" />
            <span className="truncate">Instant</span>
          </button>
          <button
            onClick={() => setActiveTab('token')}
            className={`py-2 px-1 rounded-xl text-[10px] sm:text-xs font-bold transition flex items-center justify-center gap-1 whitespace-nowrap ${
              activeTab === 'token'
                ? 'bg-[#3D312A] text-[#FFF1E6] shadow-xs'
                : 'text-[#7C6E66] hover:text-[#3D312A]'
            }`}
          >
            <Key className="w-3 h-3 sm:w-3.5 sm:h-3.5 shrink-0" />
            <span className="truncate">OAuth API</span>
          </button>
          <button
            onClick={() => setActiveTab('bluetooth')}
            className={`py-2 px-1 rounded-xl text-[10px] sm:text-xs font-bold transition flex items-center justify-center gap-1 whitespace-nowrap ${
              activeTab === 'bluetooth'
                ? 'bg-[#3D312A] text-[#FFF1E6] shadow-xs'
                : 'text-[#7C6E66] hover:text-[#3D312A]'
            }`}
          >
            <Bluetooth className="w-3 h-3 sm:w-3.5 sm:h-3.5 shrink-0" />
            <span className="truncate">Direct BLE</span>
          </button>
          <button
            onClick={() => setActiveTab('manual')}
            className={`py-2 px-1 rounded-xl text-[10px] sm:text-xs font-bold transition flex items-center justify-center gap-1 whitespace-nowrap ${
              activeTab === 'manual'
                ? 'bg-[#3D312A] text-[#FFF1E6] shadow-xs'
                : 'text-[#7C6E66] hover:text-[#3D312A]'
            }`}
          >
            <PenLine className="w-3 h-3 sm:w-3.5 sm:h-3.5 shrink-0" />
            <span className="truncate">Watch Input</span>
          </button>
        </div>

        {/* Scrollable Modal Content Body */}
        <div className="flex-1 overflow-y-auto bento-scrollbar pr-1 space-y-3.5">
          {/* Tab Content 1: Instant Bridge */}
          {activeTab === 'instant' && (
            <div className="space-y-3">
              <div className="p-3.5 rounded-2xl bg-[#FFF1E6]/60 border border-[#EEDDD3] space-y-1.5">
                <div className="flex items-center gap-2 text-xs font-bold text-[#5C3A2E]">
                  <Layers className="w-4 h-4 text-[#D48B77] shrink-0" />
                  <span>Xiaomi Mi Fitness ➔ Health Connect Bridge</span>
                </div>
                <p className="text-xs text-[#7C6E66] leading-relaxed">
                  Connects to the Health Connect pipeline on your device, pulling 24-hour step counts, heart rate intervals, active calories, and HRV stress metrics.
                </p>
              </div>

              <button
                onClick={() => handleFetchFromAPI()}
                disabled={isLoading}
                className="w-full py-3 rounded-2xl bg-[#3D312A] hover:bg-[#2E2420] text-[#FFF1E6] text-xs sm:text-sm font-bold shadow-md transition flex items-center justify-center gap-2 disabled:opacity-50"
              >
                <RefreshCw className={`w-4 h-4 text-[#E88E75] ${isLoading ? 'animate-spin' : ''}`} />
                <span>{isLoading ? 'Querying Health Connect API...' : 'Fetch Today’s Biometrics Now'}</span>
              </button>
            </div>
          )}

          {/* Tab Content 2: OAuth Token */}
          {activeTab === 'token' && (
            <div className="space-y-3">
              <div className="p-3.5 rounded-2xl bg-[#FFF1E6]/70 border border-[#EEDDD3] text-xs text-[#5C3A2E] space-y-2">
                <div className="font-bold flex items-center gap-1.5 text-[#3D312A]">
                  <Key className="w-3.5 h-3.5 text-[#D48B77]" />
                  <span>How to generate your Google / Xiaomi Health Token:</span>
                </div>
                <ol className="list-decimal list-inside space-y-1 text-[11px] text-[#7C6E66] leading-relaxed">
                  <li>In your phone's <strong>Mi Fitness</strong> app, go to <strong>Profile ➔ Third-party apps</strong> and enable <strong>Google Fit / Health Connect sync</strong>.</li>
                  <li>Open <a href="https://developers.google.com/oauthplayground" target="_blank" rel="noreferrer" className="text-[#D48B77] font-bold underline hover:text-[#B56752]">Google OAuth Playground</a> in your browser.</li>
                  <li>In the list on the left, scroll down to <strong>Fitness API v1</strong> and check <code className="bg-white px-1 py-0.5 rounded border border-[#EEDDD3] text-[#3D312A]">fitness.activity.read</code> and <code className="bg-white px-1 py-0.5 rounded border border-[#EEDDD3] text-[#3D312A]">fitness.heart_rate.read</code>.</li>
                  <li>Click <strong>Authorize APIs</strong>, sign in with your Google account, then click <strong>Exchange authorization code for tokens</strong>.</li>
                  <li>Copy the <strong>Access token</strong> (starts with <code className="text-[#3D312A] font-bold">ya29...</code>) and paste it below.</li>
                </ol>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-[#3D312A] block">
                  Google Health Connect / Google Fit Access Token
                </label>
                <input
                  type="text"
                  value={accessToken}
                  onChange={(e) => setAccessToken(e.target.value)}
                  placeholder="Paste your ya29.a0AfH6SM... token here"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-[#EEDDD3] bg-white text-xs text-[#3D312A] focus:outline-none focus:ring-2 focus:ring-[#D48B77] font-mono placeholder:text-[#A89F91]"
                />
              </div>

              <button
                onClick={() => handleFetchFromAPI(accessToken)}
                disabled={isLoading || !accessToken.trim()}
                className="w-full py-3 rounded-2xl bg-[#3D312A] hover:bg-[#2E2420] text-[#FFF1E6] text-xs font-bold shadow-xs transition flex items-center justify-center gap-2 disabled:opacity-50"
              >
                <RefreshCw className={`w-3.5 h-3.5 text-[#E88E75] ${isLoading ? 'animate-spin' : ''}`} />
                <span>{isLoading ? 'Authenticating & Fetching...' : 'Fetch Live Google Health Records'}</span>
              </button>
            </div>
          )}

          {/* Tab Content 3: Direct Web Bluetooth */}
          {activeTab === 'bluetooth' && (
            <div className="space-y-3">
              <div className="p-3.5 rounded-2xl bg-[#FFF1E6]/60 border border-[#EEDDD3] space-y-1.5">
                <div className="flex items-center gap-2 text-xs font-bold text-[#5C3A2E]">
                  <Bluetooth className="w-4 h-4 text-[#6B9080] shrink-0" />
                  <span>Web Bluetooth GATT Heart Rate Sensor</span>
                </div>
                <p className="text-xs text-[#7C6E66] leading-relaxed">
                  Connect directly from your browser to your Redmi Watch 5 Active via Bluetooth GATT protocol. Supported on Google Chrome and Microsoft Edge on Desktop and Android.
                </p>
                {liveHr && (
                  <div className="mt-2 p-2 rounded-xl bg-white border border-[#6B9080] flex items-center gap-2 text-xs text-[#3D312A]">
                    <span className="w-2 h-2 rounded-full bg-[#E88E75] animate-ping" />
                    <span>Streaming Live HR: <strong>{liveHr} BPM</strong></span>
                  </div>
                )}
              </div>

              <button
                onClick={handleConnectBluetooth}
                disabled={isLoading}
                className="w-full py-3 rounded-2xl bg-[#3D312A] hover:bg-[#2E2420] text-[#FFF1E6] text-xs font-bold shadow-xs transition flex items-center justify-center gap-2 disabled:opacity-50"
              >
                <Bluetooth className="w-4 h-4 text-[#6B9080]" />
                <span>{isLoading ? 'Scanning for Redmi Watch...' : 'Pair Redmi Watch via Web Bluetooth'}</span>
              </button>
            </div>
          )}

          {/* Tab Content 4: Direct Watch Screen Entry */}
          {activeTab === 'manual' && (
            <div className="space-y-3">
              <div className="p-3 rounded-2xl bg-[#FFF1E6]/60 border border-[#EEDDD3] text-xs text-[#7C6E66]">
                Look at your <strong>{preferences.watchModel || 'Redmi Watch 5 Active'}</strong> screen and enter today's exact values below:
              </div>

              <div className="grid grid-cols-2 gap-2.5">
                <div className="space-y-1">
                  <label className="text-[11px] font-bold text-[#3D312A] flex items-center gap-1">
                    <Footprints className="w-3.5 h-3.5 text-[#6B9080]" />
                    <span>Today's Steps</span>
                  </label>
                  <input
                    type="number"
                    value={manualSteps}
                    onChange={(e) => setManualSteps(e.target.value)}
                    placeholder="e.g. 7450"
                    className="w-full px-3 py-2 rounded-xl border border-[#EEDDD3] bg-white text-xs font-bold font-mono text-[#3D312A] focus:outline-none focus:ring-2 focus:ring-[#D48B77]"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[11px] font-bold text-[#3D312A] flex items-center gap-1">
                    <Heart className="w-3.5 h-3.5 text-[#E88E75]" />
                    <span>Heart Rate (BPM)</span>
                  </label>
                  <input
                    type="number"
                    value={manualHr}
                    onChange={(e) => setManualHr(e.target.value)}
                    placeholder="e.g. 68"
                    className="w-full px-3 py-2 rounded-xl border border-[#EEDDD3] bg-white text-xs font-bold font-mono text-[#3D312A] focus:outline-none focus:ring-2 focus:ring-[#D48B77]"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[11px] font-bold text-[#3D312A] flex items-center gap-1">
                    <Flame className="w-3.5 h-3.5 text-[#D48B77]" />
                    <span>Active Burn (kcal)</span>
                  </label>
                  <input
                    type="number"
                    value={manualBurn}
                    onChange={(e) => setManualBurn(e.target.value)}
                    placeholder="e.g. 380"
                    className="w-full px-3 py-2 rounded-xl border border-[#EEDDD3] bg-white text-xs font-bold font-mono text-[#3D312A] focus:outline-none focus:ring-2 focus:ring-[#D48B77]"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[11px] font-bold text-[#3D312A] flex items-center gap-1">
                    <Activity className="w-3.5 h-3.5 text-[#5C3A2E]" />
                    <span>Stress Score (0-100)</span>
                  </label>
                  <input
                    type="number"
                    value={manualStress}
                    onChange={(e) => setManualStress(e.target.value)}
                    placeholder="e.g. 28"
                    className="w-full px-3 py-2 rounded-xl border border-[#EEDDD3] bg-white text-xs font-bold font-mono text-[#3D312A] focus:outline-none focus:ring-2 focus:ring-[#D48B77]"
                  />
                </div>
              </div>

              <button
                onClick={handleManualCalibrate}
                className="w-full py-2.5 rounded-2xl bg-[#3D312A] hover:bg-[#2E2420] text-[#FFF1E6] text-xs font-bold shadow-xs transition flex items-center justify-center gap-2"
              >
                <Sparkles className="w-3.5 h-3.5 text-[#E88E75]" />
                <span>Preview & Apply Watch Numbers</span>
              </button>
            </div>
          )}

          {/* Status / Error Message */}
          {statusMessage && (
            <div
              className={`p-3.5 rounded-2xl text-xs flex items-start gap-2.5 animate-in fade-in leading-relaxed ${
                statusMessage.type === 'success'
                  ? 'bg-[#EEDDD3]/50 text-[#5C3A2E] border border-[#6B9080]'
                  : statusMessage.type === 'error'
                  ? 'bg-rose-50 text-rose-900 border border-rose-200'
                  : 'bg-[#FFF1E6] text-[#5C3A2E] border border-[#EEDDD3]'
              }`}
            >
              {statusMessage.type === 'success' ? (
                <CheckCircle2 className="w-4 h-4 text-[#6B9080] shrink-0 mt-0.5" />
              ) : statusMessage.type === 'error' ? (
                <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
              ) : (
                <RefreshCw className="w-4 h-4 text-[#D48B77] shrink-0 mt-0.5 animate-spin" />
              )}
              <span className="leading-relaxed break-words">{statusMessage.text}</span>
            </div>
          )}

          {/* Preview of Fetched Dataset */}
          {previewData && (
            <div className="space-y-3 pt-2 border-t border-[#EEDDD3]">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-[#3D312A]">Health Connect API Response Preview</span>
                <span className="text-[10px] text-[#7C6E66]">
                  Sync: {new Date(previewData.lastSyncTimestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </span>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                <div className="p-2.5 sm:p-3 rounded-2xl bg-white border border-[#EEDDD3] space-y-0.5">
                  <div className="flex items-center gap-1 text-[10px] text-[#7C6E66]">
                    <Footprints className="w-3.5 h-3.5 text-[#6B9080]" />
                    <span>Steps</span>
                  </div>
                  <div className="text-sm sm:text-base font-extrabold font-mono text-[#3D312A]">
                    {previewData.stepCount.toLocaleString()}
                  </div>
                </div>

                <div className="p-2.5 sm:p-3 rounded-2xl bg-white border border-[#EEDDD3] space-y-0.5">
                  <div className="flex items-center gap-1 text-[10px] text-[#7C6E66]">
                    <Flame className="w-3.5 h-3.5 text-[#E88E75]" />
                    <span>Active Burn</span>
                  </div>
                  <div className="text-sm sm:text-base font-extrabold font-mono text-[#3D312A]">
                    {previewData.activeCaloriesBurned} kcal
                  </div>
                </div>

                <div className="p-2.5 sm:p-3 rounded-2xl bg-white border border-[#EEDDD3] space-y-0.5">
                  <div className="flex items-center gap-1 text-[10px] text-[#7C6E66]">
                    <Heart className="w-3.5 h-3.5 text-[#E88E75]" />
                    <span>Heart Rate</span>
                  </div>
                  <div className="text-sm sm:text-base font-extrabold font-mono text-[#3D312A]">
                    {previewData.averageHeartRateBpm} bpm
                  </div>
                </div>

                <div className="p-2.5 sm:p-3 rounded-2xl bg-white border border-[#EEDDD3] space-y-0.5">
                  <div className="flex items-center gap-1 text-[10px] text-[#7C6E66]">
                    <Activity className="w-3.5 h-3.5 text-[#D48B77]" />
                    <span>Stress</span>
                  </div>
                  <div className="text-sm sm:text-base font-extrabold font-mono text-[#3D312A]">
                    {previewData.stressScore}/100
                  </div>
                </div>
              </div>

              <button
                onClick={handleApplyToApp}
                className="w-full py-3 rounded-2xl bg-[#6B9080] hover:bg-[#58796B] text-white text-xs sm:text-sm font-bold shadow-md transition flex items-center justify-center gap-2"
              >
                <Sparkles className="w-4 h-4 text-white" />
                <span>Apply to Biometrics & Update AI Plans</span>
              </button>
            </div>
          )}
        </div>

        {/* Pinned Modal Footer */}
        <div className="shrink-0 pt-2.5 border-t border-[#EEDDD3]/60 text-[11px] text-[#7C6E66] text-center">
          Data synchronized via Xiaomi HyperOS Health Connect REST endpoint for {preferences.watchModel || 'Redmi Watch 5 Active'}.
        </div>
      </div>
    </div>
  );
};
