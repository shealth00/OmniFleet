import React, { useState } from 'react';
import { 
  Watch, 
  HeartPulse, 
  Bluetooth, 
  Activity, 
  Zap, 
  RefreshCw, 
  ShieldCheck, 
  AlertTriangle, 
  CheckCircle2, 
  Radio, 
  Battery, 
  Flame,
  Vibrate,
  Layers
} from 'lucide-react';
import { useDevices } from '../context/DeviceContext';
import { DeviceRecord } from '../types/device';

export const WearablesGatewayView: React.FC = () => {
  const { devices, executeCommand } = useDevices();

  const wearableDevices = devices.filter(d => d.platform === 'wearos' || d.deviceType === 'smartwatch');
  const [selectedWatchId, setSelectedWatchId] = useState<string>(wearableDevices[0]?.id || '');
  const [isHapticTesting, setIsHapticTesting] = useState<boolean>(false);
  const [isHighSampling, setIsHighSampling] = useState<boolean>(false);

  const currentWatch = wearableDevices.find(w => w.id === selectedWatchId) || wearableDevices[0];

  const handleHapticTest = async () => {
    if (!currentWatch) return;
    setIsHapticTesting(true);
    await executeCommand('trigger_self_diagnostic', `Haptic Buzz ${currentWatch.name}`, [currentWatch.id], { testType: 'haptic', intensity: 'strong' });
    setTimeout(() => setIsHapticTesting(false), 1500);
  };

  const handleSamplingToggle = async () => {
    if (!currentWatch) return;
    setIsHighSampling(!isHighSampling);
    await executeCommand('push_config', `Set Sampling to ${!isHighSampling ? '15s High-Res' : '5m Standard'}`, [currentWatch.id], { intervalSeconds: !isHighSampling ? 15 : 300 });
  };

  return (
    <div className="space-y-6">
      
      {/* Header Banner */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 relative overflow-hidden">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="px-2 py-0.5 rounded-full text-xs font-semibold bg-rose-500/20 text-rose-300 border border-rose-500/30">
                Wear OS 5 & GATT Telemetry Hub
              </span>
              <span className="text-xs text-slate-400 font-mono">Samsung Galaxy Watch 7 Fleet</span>
            </div>
            <h1 className="text-2xl font-bold text-white tracking-tight">
              Health Wearables & BLE GATT Gateway Console
            </h1>
            <p className="text-sm text-slate-400 mt-1 max-w-2xl">
              Monitor Bluetooth Low Energy state machines, GATT characteristic notifications, Android Health Connect sync pipelines, and continuous vital waveforms.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <div className="bg-slate-950 px-3 py-2 rounded-xl border border-slate-800 flex items-center gap-3">
              <Radio className="w-4 h-4 text-emerald-400 animate-ping" />
              <div>
                <span className="text-[10px] text-slate-400 font-mono">BLE Mesh Backhaul</span>
                <p className="text-xs font-bold text-emerald-400">100% Ingest Health</p>
              </div>
            </div>
          </div>
        </div>

        {/* Watch Selector Pills */}
        <div className="flex items-center gap-2 mt-6 pt-4 border-t border-slate-800/80 overflow-x-auto">
          {wearableDevices.map(watch => {
            const isSelected = watch.id === selectedWatchId;
            return (
              <button
                key={watch.id}
                onClick={() => setSelectedWatchId(watch.id)}
                className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-medium transition-all whitespace-nowrap cursor-pointer ${
                  isSelected
                    ? 'bg-rose-500/20 text-rose-300 border border-rose-500/40 shadow-sm'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
                }`}
              >
                <Watch className="w-3.5 h-3.5" />
                <span>{watch.name}</span>
                {watch.rpmVitals?.alertFlag === 'critical' && (
                  <span className="w-2 h-2 rounded-full bg-rose-500 animate-ping" />
                )}
              </button>
            );
          })}
        </div>
      </div>

      {currentWatch && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          
          {/* Left: Vitals Telemetry Box */}
          <div className="lg:col-span-6 space-y-4">
            <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-4">
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="text-sm font-bold text-white">{currentWatch.name}</h3>
                  <p className="text-xs text-slate-400 font-mono">SN: {currentWatch.serialNumber} • {currentWatch.model}</p>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={handleHapticTest}
                    disabled={isHapticTesting}
                    title="Send Haptic Vibration"
                    className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs rounded font-semibold flex items-center gap-1 cursor-pointer disabled:opacity-50"
                  >
                    <Vibrate className="w-3.5 h-3.5 text-cyan-400" />
                    <span>Buzz Haptic</span>
                  </button>
                  <button
                    onClick={handleSamplingToggle}
                    className={`px-2.5 py-1 text-xs rounded font-semibold flex items-center gap-1 transition-all cursor-pointer ${
                      isHighSampling ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40' : 'bg-slate-800 text-slate-300'
                    }`}
                  >
                    <Zap className="w-3.5 h-3.5" />
                    <span>{isHighSampling ? '15s High-Res' : '5m Standard'}</span>
                  </button>
                </div>
              </div>

              {/* Vitals Grid */}
              {currentWatch.rpmVitals && (
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  <div className="bg-slate-950 p-3.5 rounded-xl border border-slate-850">
                    <span className="text-[10px] text-slate-400 font-mono flex items-center gap-1">
                      <HeartPulse className="w-3 h-3 text-rose-400" /> Heart Rate
                    </span>
                    <div className="flex items-baseline gap-1 mt-1">
                      <span className="text-2xl font-extrabold text-white">{currentWatch.rpmVitals.heartRateBpm}</span>
                      <span className="text-[10px] text-slate-400 font-mono">BPM</span>
                    </div>
                  </div>

                  <div className="bg-slate-950 p-3.5 rounded-xl border border-slate-850">
                    <span className="text-[10px] text-slate-400 font-mono flex items-center gap-1">
                      <Activity className="w-3 h-3 text-cyan-400" /> Blood Oxygen
                    </span>
                    <div className="flex items-baseline gap-1 mt-1">
                      <span className="text-2xl font-extrabold text-white">{currentWatch.rpmVitals.spo2Percent}</span>
                      <span className="text-[10px] text-slate-400 font-mono">% SpO2</span>
                    </div>
                  </div>

                  <div className="bg-slate-950 p-3.5 rounded-xl border border-slate-850">
                    <span className="text-[10px] text-slate-400 font-mono flex items-center gap-1">
                      <Flame className="w-3 h-3 text-amber-400" /> Daily Steps
                    </span>
                    <div className="flex items-baseline gap-1 mt-1">
                      <span className="text-2xl font-extrabold text-white">{currentWatch.rpmVitals.stepCount}</span>
                      <span className="text-[10px] text-slate-400 font-mono">steps</span>
                    </div>
                  </div>

                  <div className="bg-slate-950 p-3.5 rounded-xl border border-slate-850">
                    <span className="text-[10px] text-slate-400 font-mono">Blood Pressure</span>
                    <div className="flex items-baseline gap-1 mt-1">
                      <span className="text-lg font-bold text-white">
                        {currentWatch.rpmVitals.bloodPressureSystolic}/{currentWatch.rpmVitals.bloodPressureDiastolic}
                      </span>
                      <span className="text-[10px] text-slate-400 font-mono">mmHg</span>
                    </div>
                  </div>

                  <div className="bg-slate-950 p-3.5 rounded-xl border border-slate-850">
                    <span className="text-[10px] text-slate-400 font-mono">HRV (SDNN)</span>
                    <div className="flex items-baseline gap-1 mt-1">
                      <span className="text-lg font-bold text-white">{currentWatch.rpmVitals.hrvMs}</span>
                      <span className="text-[10px] text-slate-400 font-mono">ms</span>
                    </div>
                  </div>

                  <div className="bg-slate-950 p-3.5 rounded-xl border border-slate-850">
                    <span className="text-[10px] text-slate-400 font-mono">Skin Temperature</span>
                    <div className="flex items-baseline gap-1 mt-1">
                      <span className="text-lg font-bold text-white">{currentWatch.rpmVitals.skinTempCelsius}</span>
                      <span className="text-[10px] text-slate-400 font-mono">°C</span>
                    </div>
                  </div>
                </div>
              )}

              {/* Patient Assignment Pill */}
              {currentWatch.patient && (
                <div className="p-3 bg-cyan-950/20 border border-cyan-800/40 rounded-lg flex items-center justify-between text-xs">
                  <div>
                    <span className="text-slate-400">Assigned Patient: </span>
                    <strong className="text-white">{currentWatch.patient.patientName}</strong>
                    <span className="text-slate-500 font-mono"> ({currentWatch.patient.medicalRecordNumber})</span>
                  </div>
                  <span className="text-cyan-400 text-[10px] font-semibold">{currentWatch.patient.careTeam}</span>
                </div>
              )}
            </div>
          </div>

          {/* Right: BLE & GATT State Machine Inspector */}
          <div className="lg:col-span-6 space-y-4">
            <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-4">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <Bluetooth className="w-4 h-4 text-cyan-400" />
                BLE / GATT State Machine Pipeline
              </h3>

              <div className="space-y-2 text-xs">
                {[
                  { step: 1, label: 'Bluetooth Scanning & Radio Init', status: 'COMPLETED', desc: 'BLE 5.3 Low Energy controller active on 2.4GHz ISM' },
                  { step: 2, label: 'Advertising Packet Detected', status: 'COMPLETED', desc: `Service UUID: 0000180D (Heart Rate Service) RSSI: ${currentWatch.rpmVitals?.rawGattRssi || -58} dBm` },
                  { step: 3, label: 'GATT Characteristic Discovery', status: 'COMPLETED', desc: 'Found 0x2A37 (HR Measurement), 0x2A5F (PLX SpO2), 0x2A35 (Blood Pressure)' },
                  { step: 4, label: 'Characteristic Notify Subscribed', status: 'COMPLETED', desc: 'CCCD descriptor 0x2902 written with 0x0001 (Notifications Enabled)' },
                  { step: 5, label: 'Continuous Telemetry Streaming', status: 'STREAMING', desc: 'Realtime JSON payload streaming to Sally Health Bedside Hub' },
                  { step: 6, label: 'Android Health Connect Sync', status: 'SYNCED', desc: 'Encrypted local datastore synced with Health Platform API' },
                ].map(item => (
                  <div key={item.step} className="p-3 bg-slate-950 rounded-lg border border-slate-850 flex items-start gap-3">
                    <span className="w-5 h-5 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center text-[10px] font-bold shrink-0 mt-0.5">
                      ✓
                    </span>
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-white">{item.label}</span>
                        <span className="text-[10px] font-mono text-emerald-400 font-bold">{item.status}</span>
                      </div>
                      <p className="text-[11px] text-slate-400 mt-0.5 font-mono">{item.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

        </div>
      )}

    </div>
  );
};
