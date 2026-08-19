import React, { useState, useRef } from 'react';
import {
  Watch,
  Heart,
  Activity,
  Flame,
  Footprints,
  Wind,
  RefreshCw,
  Upload,
  CheckCircle2,
  HelpCircle,
  Smartphone,
  Share2,
  ArrowRight,
  X,
  Radio,
} from 'lucide-react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  BarChart,
  Bar,
} from 'recharts';
import { DailyBiometricSummary, UserPreferences } from '../types';
import { parseHealthFile } from '../utils/mockWatchData';

interface RedmiWatchViewProps {
  biometrics: DailyBiometricSummary;
  preferences: UserPreferences;
  onUpdateBiometrics: (updated: DailyBiometricSummary) => void;
  onQuickSync: () => void;
  isSyncing: boolean;
  onOpenBreathing: () => void;
  onOpenHealthConnectModal?: () => void;
}

export const RedmiWatchView: React.FC<RedmiWatchViewProps> = ({
  biometrics,
  preferences,
  onUpdateBiometrics,
  onQuickSync,
  isSyncing,
  onOpenBreathing,
  onOpenHealthConnectModal,
}) => {
  const [selectedMetric, setSelectedMetric] = useState<'heart_rate' | 'stress' | 'steps'>('heart_rate');
  const [uploadStatus, setUploadStatus] = useState<string | null>(null);
  const [showGuideModal, setShowGuideModal] = useState<boolean>(false);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const readings = biometrics.hourlyReadings || [];
  const restingCount = readings.filter((r) => r.heartRateBpm < 100).length;
  const fatBurnCount = readings.filter((r) => r.heartRateBpm >= 100 && r.heartRateBpm < 130).length;
  const cardioCount = readings.filter((r) => r.heartRateBpm >= 130 && r.heartRateBpm < 155).length;
  const peakCount = readings.filter((r) => r.heartRateBpm >= 155).length;

  const relaxedCount = readings.filter((r) => r.stressScore < 30).length;
  const mildCount = readings.filter((r) => r.stressScore >= 30 && r.stressScore < 60).length;
  const moderateCount = readings.filter((r) => r.stressScore >= 60 && r.stressScore < 80).length;
  const highStressCount = readings.filter((r) => r.stressScore >= 80).length;

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      const parsed = parseHealthFile(content, file.name);
      if (parsed) {
        onUpdateBiometrics({
          ...biometrics,
          ...parsed,
        });
        setUploadStatus(`Successfully synced ${file.name}!`);
        setTimeout(() => setUploadStatus(null), 4000);
      } else {
        setUploadStatus('Unable to parse format. Please upload standard Mi Fitness export.');
        setTimeout(() => setUploadStatus(null), 4000);
      }
    };
    reader.readAsText(file);
  };

  return (
    <div id="redmi-watch-view" className="space-y-4 animate-in fade-in duration-300 pb-16 lg:pb-0">
      {/* Device Connection & Sync Banner */}
      <div className="bento-card bg-[#FFFDFB] border border-[#EEDDD3] flex flex-col md:flex-row items-start md:items-center justify-between gap-4 shadow-xs">
        <div className="flex items-start gap-3.5">
          <div className="w-12 h-12 rounded-2xl bg-[#FFF1E6] text-[#D48B77] flex items-center justify-center shrink-0 border border-[#EEDDD3]">
            <Watch className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl sm:text-2xl font-extrabold text-[#3D312A]">
                {preferences.watchModel || 'Redmi Watch 5 Active'}
              </h1>
              <span className="bento-chip bg-[#FFF1E6] text-[#5C3A2E] border border-[#EEDDD3]">
                <span className="w-1.5 h-1.5 rounded-full bg-[#6B9080] animate-pulse inline-block mr-1" />
                Active Link
              </span>
            </div>
            <p className="text-xs text-[#7C6E66] mt-0.5">
              Xiaomi HyperOS Telemetry • Health Connect & Mi Fitness Integration
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
          {onOpenHealthConnectModal && (
            <button
              onClick={onOpenHealthConnectModal}
              className="px-3.5 py-2.5 rounded-2xl bg-[#D48B77] hover:bg-[#C27965] text-white text-xs font-bold shadow-xs transition flex items-center justify-center gap-1.5"
            >
              <Smartphone className="w-3.5 h-3.5 text-white" />
              <span>Fetch API</span>
            </button>
          )}

          <button
            onClick={() => setShowGuideModal(true)}
            className="px-3.5 py-2.5 rounded-2xl bg-[#FFF1E6] hover:bg-[#EDDCD2] text-[#5C3A2E] text-xs font-bold border border-[#EEDDD3] shadow-xs transition flex items-center justify-center gap-1.5"
          >
            <HelpCircle className="w-3.5 h-3.5 text-[#D48B77]" />
            <span>Health Connect Guide</span>
          </button>

          <button
            onClick={onQuickSync}
            disabled={isSyncing}
            className="flex-1 md:flex-none px-4 py-2.5 rounded-2xl bg-[#3D312A] hover:bg-[#2E2420] text-[#FFF1E6] text-xs font-bold shadow-xs transition flex items-center justify-center gap-1.5 disabled:opacity-50"
          >
            <RefreshCw className={`w-3.5 h-3.5 text-[#E88E75] ${isSyncing ? 'animate-spin' : ''}`} />
            <span>{isSyncing ? 'Syncing...' : 'Quick Sync BLE'}</span>
          </button>

          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileUpload}
            accept=".csv,.json"
            className="hidden"
          />

          <button
            onClick={() => fileInputRef.current?.click()}
            className="flex-1 md:flex-none px-3.5 py-2.5 rounded-2xl bg-white hover:bg-[#FFF1E6] text-[#3D312A] text-xs font-semibold border border-[#EEDDD3] shadow-xs transition flex items-center justify-center gap-1.5"
          >
            <Upload className="w-3.5 h-3.5 text-[#D48B77]" />
            <span>Import File</span>
          </button>
        </div>
      </div>

      {uploadStatus && (
        <div className="p-3 rounded-2xl bg-[#FFF1E6] border border-[#6B9080] text-xs text-[#5C3A2E] flex items-center gap-2 animate-in fade-in">
          <CheckCircle2 className="w-4 h-4 text-[#6B9080]" />
          <span>{uploadStatus}</span>
        </div>
      )}

      {/* Health Connect Setup Modal */}
      {showGuideModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#3D312A]/60 backdrop-blur-xs overflow-y-auto">
          <div className="bg-[#FFFDFB] rounded-3xl max-w-xl w-full p-6 sm:p-8 shadow-2xl border border-[#EEDDD3] my-8 animate-in zoom-in-95 duration-200 space-y-5">
            <div className="flex items-center justify-between pb-3 border-b border-[#EEDDD3]">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-[#FFF1E6] text-[#D48B77] border border-[#EEDDD3] flex items-center justify-center">
                  <Smartphone className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-lg font-bold text-[#3D312A]">Connect Redmi Watch 5 Active</h2>
                  <p className="text-xs text-[#7C6E66]">Step-by-step Health Connect & Mi Fitness pairing guide</p>
                </div>
              </div>
              <button
                onClick={() => setShowGuideModal(false)}
                className="p-2 rounded-xl text-[#7C6E66] hover:text-[#3D312A] hover:bg-[#FFF1E6] transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3.5 text-xs text-[#3D312A]">
              {/* Step 1 */}
              <div className="p-3.5 rounded-2xl bg-[#FFF1E6]/70 border border-[#EEDDD3] flex items-start gap-3">
                <div className="w-6 h-6 rounded-xl bg-[#3D312A] text-[#FFF1E6] flex items-center justify-center font-bold text-xs shrink-0 mt-0.5">
                  1
                </div>
                <div className="space-y-1">
                  <span className="font-bold text-sm text-[#3D312A] block">Pair Watch to Mi Fitness App</span>
                  <p className="text-[#7C6E66] leading-relaxed">
                    Make sure your <strong>Redmi Watch 5 Active</strong> is paired to the official <strong>Mi Fitness (Xiaomi Wear)</strong> app on your Android or iOS phone via Bluetooth.
                  </p>
                </div>
              </div>

              {/* Step 2 */}
              <div className="p-3.5 rounded-2xl bg-[#FFF1E6]/70 border border-[#EEDDD3] flex items-start gap-3">
                <div className="w-6 h-6 rounded-xl bg-[#3D312A] text-[#FFF1E6] flex items-center justify-center font-bold text-xs shrink-0 mt-0.5">
                  2
                </div>
                <div className="space-y-1">
                  <span className="font-bold text-sm text-[#3D312A] block">Enable Health Connect in Mi Fitness</span>
                  <p className="text-[#7C6E66] leading-relaxed">
                    In the <strong>Mi Fitness</strong> app, navigate to:
                  </p>
                  <div className="p-2 rounded-xl bg-white border border-[#EEDDD3] font-mono text-[11px] text-[#5C3A2E]">
                    Profile ➔ Third-party data ➔ Health Connect (or Google Fit)
                  </div>
                  <p className="text-[#7C6E66]">
                    Toggle ON permissions for <strong>Heart Rate</strong>, <strong>Steps</strong>, <strong>Active Calories Burned</strong>, and <strong>Sleep/Stress</strong>.
                  </p>
                </div>
              </div>

              {/* Step 3 */}
              <div className="p-3.5 rounded-2xl bg-[#FFF1E6]/70 border border-[#EEDDD3] flex items-start gap-3">
                <div className="w-6 h-6 rounded-xl bg-[#3D312A] text-[#FFF1E6] flex items-center justify-center font-bold text-xs shrink-0 mt-0.5">
                  3
                </div>
                <div className="space-y-1">
                  <span className="font-bold text-sm text-[#3D312A] block">Sync Data to GennyoNaw Web App</span>
                  <p className="text-[#7C6E66] leading-relaxed">
                    You can sync your data into this web app in two easy ways:
                  </p>
                  <ul className="list-disc pl-4 space-y-1 text-[#7C6E66] mt-1">
                    <li>
                      <strong>Direct BLE Quick Sync:</strong> Click the <span className="font-bold text-[#3D312A]">"Quick Sync BLE"</span> button above to trigger an immediate live telemetry update.
                    </li>
                    <li>
                      <strong>Export File:</strong> In Mi Fitness, tap <span className="font-bold text-[#3D312A]">Settings ➔ Data Management ➔ Export Data</span> (CSV or JSON) and click <span className="font-bold text-[#3D312A]">"Import File"</span> above to load your full 24h biometric history.
                    </li>
                  </ul>
                </div>
              </div>
            </div>

            <div className="pt-2 flex justify-end">
              <button
                onClick={() => setShowGuideModal(false)}
                className="px-5 py-2.5 rounded-xl bg-[#3D312A] text-[#FFF1E6] font-bold text-xs hover:bg-[#2E2420] transition"
              >
                Got It, Ready to Sync!
              </button>
            </div>
          </div>
        </div>
      )}

      {uploadStatus && (
        <div className="p-3 rounded-2xl bg-[#FFF1E6] border border-[#6B9080] text-xs text-[#5C3A2E] flex items-center gap-2 animate-in fade-in">
          <CheckCircle2 className="w-4 h-4 text-[#6B9080]" />
          <span>{uploadStatus}</span>
        </div>
      )}

      {/* 4 Biometric KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {/* Heart Rate */}
        <div className="bento-card bg-[#FFFDFB] border border-[#EEDDD3] flex flex-col justify-between">
          <div className="flex justify-between items-center">
            <span className="bento-label text-[10px] text-[#7C6E66]">Heart Rate</span>
            <Heart className="w-4 h-4 text-[#E88E75]" />
          </div>
          <div className="my-2">
            <span className="text-3xl font-black font-mono text-[#3D312A]">
              {biometrics.averageHeartRateBpm}
            </span>
            <span className="text-xs text-[#7C6E66] ml-1">avg bpm</span>
          </div>
          <div className="text-[11px] text-[#7C6E66]">
            Resting: <strong className="text-[#3D312A]">{biometrics.restingHeartRateBpm} bpm</strong>
          </div>
        </div>

        {/* Stress Score */}
        <div className="bento-card bg-[#FFFDFB] border border-[#EEDDD3] flex flex-col justify-between">
          <div className="flex justify-between items-center">
            <span className="bento-label text-[10px] text-[#7C6E66]">Stress Level</span>
            <Activity className="w-4 h-4 text-[#D48B77]" />
          </div>
          <div className="my-2">
            <span className="text-3xl font-black font-mono text-[#3D312A]">
              {biometrics.stressScore}
            </span>
            <span className="text-xs text-[#7C6E66] ml-1">/ 100</span>
          </div>
          <div className="flex items-center justify-between text-[11px]">
            <span className="text-[#7C6E66]">{biometrics.stressLevel}</span>
            <button
              onClick={onOpenBreathing}
              className="text-[#D48B77] font-semibold hover:underline"
            >
              Calm Pacer →
            </button>
          </div>
        </div>

        {/* Step Count */}
        <div className="bento-card bg-[#FFFDFB] border border-[#EEDDD3] flex flex-col justify-between">
          <div className="flex justify-between items-center">
            <span className="bento-label text-[10px] text-[#7C6E66]">Steps</span>
            <Footprints className="w-4 h-4 text-[#6B9080]" />
          </div>
          <div className="my-2">
            <span className="text-3xl font-black font-mono text-[#3D312A]">
              {biometrics.stepCount.toLocaleString()}
            </span>
            <span className="text-xs text-[#7C6E66] ml-1">/ 10k</span>
          </div>
          <div className="text-[11px] text-[#7C6E66]">
            {(biometrics.stepCount * 0.00075).toFixed(1)} km distance
          </div>
        </div>

        {/* Active Calories */}
        <div className="bento-card bg-[#FFFDFB] border border-[#EEDDD3] flex flex-col justify-between">
          <div className="flex justify-between items-center">
            <span className="bento-label text-[10px] text-[#7C6E66]">Active Calories</span>
            <Flame className="w-4 h-4 text-[#E88E75]" />
          </div>
          <div className="my-2">
            <span className="text-3xl font-black font-mono text-[#3D312A]">
              {biometrics.activeCaloriesBurned}
            </span>
            <span className="text-xs text-[#7C6E66] ml-1">kcal</span>
          </div>
          <div className="text-[11px] text-[#7C6E66]">
            Redmi calculated burn
          </div>
        </div>
      </div>

      {/* Chart Section */}
      <div className="bento-card bg-[#FFFDFB] border border-[#EEDDD3] space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-[#EEDDD3]/70">
          <div className="flex items-center gap-2">
            <h2 className="text-base font-bold text-[#3D312A]">Biometric Telemetry (24 Hours)</h2>
          </div>

          <div className="flex items-center gap-1.5 bg-[#F0EFEB] p-1 rounded-xl border border-[#EEDDD3]">
            <button
              onClick={() => setSelectedMetric('heart_rate')}
              className={`px-3 py-1 text-xs font-bold rounded-lg transition ${
                selectedMetric === 'heart_rate'
                  ? 'bg-[#3D312A] text-[#FFF1E6]'
                  : 'text-[#7C6E66] hover:text-[#3D312A]'
              }`}
            >
              Heart Rate
            </button>
            <button
              onClick={() => setSelectedMetric('stress')}
              className={`px-3 py-1 text-xs font-bold rounded-lg transition ${
                selectedMetric === 'stress'
                  ? 'bg-[#3D312A] text-[#FFF1E6]'
                  : 'text-[#7C6E66] hover:text-[#3D312A]'
              }`}
            >
              Stress
            </button>
            <button
              onClick={() => setSelectedMetric('steps')}
              className={`px-3 py-1 text-xs font-bold rounded-lg transition ${
                selectedMetric === 'steps'
                  ? 'bg-[#3D312A] text-[#FFF1E6]'
                  : 'text-[#7C6E66] hover:text-[#3D312A]'
              }`}
            >
              Steps
            </button>
          </div>
        </div>

        <div className="h-64 w-full">
          <ResponsiveContainer width="100%" height="100%">
            {selectedMetric === 'steps' ? (
              <BarChart data={readings}>
                <CartesianGrid strokeDasharray="3 3" stroke="#EEDDD3" vertical={false} />
                <XAxis dataKey="hour" stroke="#7C6E66" fontSize={11} tickLine={false} />
                <YAxis stroke="#7C6E66" fontSize={11} tickLine={false} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#3D312A',
                    color: '#FFF1E6',
                    borderRadius: '12px',
                    border: 'none',
                    fontSize: '12px',
                  }}
                />
                <Bar dataKey="steps" fill="#6B9080" radius={[4, 4, 0, 0]} />
              </BarChart>
            ) : (
              <AreaChart data={readings}>
                <defs>
                  <linearGradient id="metricGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop
                      offset="5%"
                      stopColor={selectedMetric === 'heart_rate' ? '#E88E75' : '#D48B77'}
                      stopOpacity={0.4}
                    />
                    <stop
                      offset="95%"
                      stopColor={selectedMetric === 'heart_rate' ? '#E88E75' : '#D48B77'}
                      stopOpacity={0.0}
                    />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#EEDDD3" vertical={false} />
                <XAxis dataKey="hour" stroke="#7C6E66" fontSize={11} tickLine={false} />
                <YAxis stroke="#7C6E66" fontSize={11} tickLine={false} domain={selectedMetric === 'heart_rate' ? [50, 160] : [0, 100]} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#3D312A',
                    color: '#FFF1E6',
                    borderRadius: '12px',
                    border: 'none',
                    fontSize: '12px',
                  }}
                />
                <Area
                  type="monotone"
                  dataKey={selectedMetric === 'heart_rate' ? 'heartRateBpm' : 'stressScore'}
                  stroke={selectedMetric === 'heart_rate' ? '#E88E75' : '#D48B77'}
                  strokeWidth={2.5}
                  fillOpacity={1}
                  fill="url(#metricGrad)"
                />
              </AreaChart>
            )}
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};
