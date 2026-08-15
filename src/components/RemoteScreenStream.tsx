import React, { useState, useEffect } from 'react';
import { 
  Camera, 
  RefreshCw, 
  Power, 
  Lock, 
  Unlock, 
  Maximize2, 
  Play, 
  Shield, 
  Activity, 
  Wifi, 
  Battery, 
  Sparkles,
  Smartphone,
  Watch,
  Monitor,
  Glasses,
  Check
} from 'lucide-react';
import { DeviceRecord } from '../types/device';
import { getDeviceAdapter } from '../adapters/deviceAdapters';
import { useDevices } from '../context/DeviceContext';

interface RemoteScreenStreamProps {
  device: DeviceRecord;
}

export const RemoteScreenStream: React.FC<RemoteScreenStreamProps> = ({ device }) => {
  const { executeCommand, addAuditEvent } = useDevices();
  const adapter = getDeviceAdapter(device.platform);
  const streamProfile = adapter.getScreenStreamProfile();

  const [isLocked, setIsLocked] = useState(device.telemetry.screenLocked);
  const [activeApp, setActiveApp] = useState(device.telemetry.currentForegroundApp);
  const [capturedScreenshot, setCapturedScreenshot] = useState<string | null>(null);
  const [isCapturing, setIsCapturing] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [clockTime, setClockTime] = useState(new Date().toLocaleTimeString());

  useEffect(() => {
    const timer = setInterval(() => setClockTime(new Date().toLocaleTimeString()), 1000);
    return () => clearInterval(timer);
  }, []);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const handleCaptureScreenshot = async () => {
    setIsCapturing(true);
    await executeCommand('capture_screenshot', 'Screen Frame Capture', [device.id]);
    setIsCapturing(false);
    setCapturedScreenshot(`screenshot-${device.id}-${Date.now()}.png`);
    showToast('Screenshot frame stored in device session cache');
  };

  const handleToggleLock = async () => {
    const next = !isLocked;
    setIsLocked(next);
    await executeCommand(next ? 'lock' : 'unlock', next ? 'Remote Screen Lock' : 'Remote Screen Unlock', [device.id]);
    showToast(next ? 'Device screen locked' : 'Device screen unlocked');
  };

  const handleWake = async () => {
    await executeCommand('wake', 'Display Wakeup Signal', [device.id]);
    showToast('Wake signal sent over low-latency channel');
  };

  const handleReboot = async () => {
    await executeCommand('reboot', 'Remote Hard Reboot', [device.id]);
    showToast('Reboot initiated on target hardware');
  };

  const handleLaunchForegroundApp = async (pkg: string, name: string) => {
    setActiveApp(pkg);
    await executeCommand('launch_app', `Launch App: ${name}`, [device.id], { packageName: pkg });
    showToast(`Foreground task switched to ${name}`);
  };

  // Render specific simulated UI based on platform
  const renderScreenContent = () => {
    if (isLocked) {
      return (
        <div className="w-full h-full bg-slate-950 flex flex-col items-center justify-center text-center p-6 select-none">
          <Lock className="w-12 h-12 text-cyan-400 mb-3 animate-pulse" />
          <div className="text-3xl font-extrabold text-white font-mono">{clockTime}</div>
          <div className="text-xs text-slate-400 mt-1 font-mono">{device.organization}</div>
          <div className="mt-6 px-3 py-1 bg-slate-900 border border-slate-800 rounded-full text-[11px] text-cyan-300 font-mono">
            {device.connectionMode === 'kiosk' ? 'LockTaskMode Enforced' : 'Device Locked by MDM'}
          </div>
        </div>
      );
    }

    switch (device.platform) {
      case 'wearos':
        return (
          <div className="w-64 h-64 mx-auto rounded-full bg-slate-950 border-4 border-slate-700 shadow-2xl relative overflow-hidden flex flex-col items-center justify-center p-4 select-none">
            {/* Watch ambient background */}
            <div className="absolute inset-0 bg-radial from-teal-950/40 via-slate-950 to-black pointer-events-none"></div>
            
            <div className="text-2xl font-black text-white font-mono tracking-tight z-10">{clockTime}</div>
            
            {device.rpmVitals ? (
              <div className="mt-2 text-center z-10 space-y-1">
                <div className="flex items-center justify-center gap-1 text-rose-400 font-extrabold text-lg">
                  <Activity className="w-4 h-4 animate-bounce" />
                  <span>{device.rpmVitals.heartRateBpm}</span>
                  <span className="text-[10px] text-slate-400 uppercase font-mono">BPM</span>
                </div>

                <div className="flex items-center justify-center gap-3 text-[11px] font-mono text-slate-300">
                  <span className="text-cyan-400">SpO₂ {device.rpmVitals.spo2Percent}%</span>
                  <span className="text-emerald-400">{device.rpmVitals.stepCount} steps</span>
                </div>

                <div className="text-[10px] text-teal-400 font-mono uppercase bg-teal-950/70 px-2 py-0.5 rounded-full border border-teal-800/60 mt-1">
                  Sally Wearable Active
                </div>
              </div>
            ) : (
              <div className="text-xs text-slate-400 font-mono mt-3 z-10">Standby Watch Face</div>
            )}

            {/* Circular Ring Gauge */}
            <div className="absolute inset-2 rounded-full border-2 border-dashed border-teal-500/30 pointer-events-none"></div>
          </div>
        );

      case 'quest':
        return (
          <div className="w-full h-72 bg-gradient-to-br from-indigo-950 via-slate-950 to-purple-950 rounded-xl border border-indigo-500/30 relative overflow-hidden flex flex-col justify-between p-4 font-mono text-xs">
            {/* Stereo Dual Eye simulated overlay */}
            <div className="flex items-center justify-between border-b border-indigo-800/40 pb-2 text-[10px] text-indigo-300">
              <span className="flex items-center gap-1.5">
                <Glasses className="w-3.5 h-3.5 text-cyan-400" />
                <span>Spatial 6DoF Eye Tracking: LOCKED</span>
              </span>
              <span className="text-emerald-400 font-bold">72 FPS • 1832x1920</span>
            </div>

            <div className="my-auto text-center space-y-2">
              <div className="inline-block px-3 py-1 rounded bg-indigo-500/20 text-indigo-200 border border-indigo-500/40 font-bold">
                SPATIAL NEURO-REHABILITATION SUITE
              </div>
              <p className="text-slate-300 text-xs max-w-sm mx-auto">
                Patient: <span className="text-white font-bold">{device.patient?.patientName || 'Unassigned'}</span>
              </p>
              <div className="flex justify-center gap-2 pt-2">
                <span className="px-2 py-1 bg-slate-900/80 rounded border border-slate-700 text-[10px] text-cyan-300">
                  Target ROM: 145° (Right Shoulder)
                </span>
                <span className="px-2 py-1 bg-slate-900/80 rounded border border-slate-700 text-[10px] text-emerald-300">
                  Exercise Epoch: 04/10
                </span>
              </div>
            </div>

            <div className="text-[10px] text-slate-500 flex justify-between border-t border-indigo-900/40 pt-2">
              <span>Boundary: Guardian Active (Room Scale)</span>
              <span>Therapist Live Multicast Channel: ON</span>
            </div>
          </div>
        );

      case 'windows':
        return (
          <div className="w-full h-80 bg-slate-900 rounded-lg border border-slate-700 relative overflow-hidden flex flex-col font-sans">
            {/* Windows Title Bar */}
            <div className="bg-slate-950 px-3 py-1.5 flex items-center justify-between border-b border-slate-800 text-xs text-slate-300 font-mono">
              <div className="flex items-center gap-2">
                <Monitor className="w-3.5 h-3.5 text-blue-400" />
                <span>Sally Health Clinical EMR Workstation - Room Terminal</span>
              </div>
              <div className="flex gap-1.5">
                <div className="w-2.5 h-2.5 rounded-full bg-amber-500"></div>
                <div className="w-2.5 h-2.5 rounded-full bg-emerald-500"></div>
              </div>
            </div>

            {/* Workstation Application Canvas */}
            <div className="flex-1 bg-slate-900 p-4 space-y-3 font-mono text-xs overflow-y-auto">
              <div className="p-3 bg-slate-950 rounded-lg border border-slate-800 flex justify-between items-center">
                <div>
                  <div className="text-white font-bold text-sm">Sally EMR Terminal v5.2</div>
                  <div className="text-[11px] text-slate-400">Authenticated Station: {device.name}</div>
                </div>
                <span className="px-2 py-1 bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 rounded text-[10px] font-bold">
                  EHR LINK ACTIVE
                </span>
              </div>

              <div className="grid grid-cols-2 gap-3 text-[11px]">
                <div className="p-2.5 bg-slate-950/60 rounded border border-slate-800/80">
                  <div className="text-slate-500 uppercase text-[10px]">Assigned Physician</div>
                  <div className="text-slate-200 font-medium">Dr. S. Chen, MD (Cardiology)</div>
                </div>
                <div className="p-2.5 bg-slate-950/60 rounded border border-slate-800/80">
                  <div className="text-slate-500 uppercase text-[10px]">Active Ward Queue</div>
                  <div className="text-slate-200 font-medium">6 Bedside Telemetry Feeds</div>
                </div>
              </div>
            </div>

            {/* Windows Taskbar */}
            <div className="bg-slate-950 border-t border-slate-800 px-3 py-1.5 flex items-center justify-between text-[11px] font-mono text-slate-400">
              <div className="flex items-center gap-3">
                <span className="text-cyan-400 font-bold">⊞ Start</span>
                <span className="text-white px-2 py-0.5 bg-slate-800 rounded">SallyWorkstation.exe</span>
              </div>
              <div className="flex items-center gap-2">
                <span>{clockTime}</span>
              </div>
            </div>
          </div>
        );

      default: // Android Tablet / Phone
        return (
          <div className="w-full h-80 bg-slate-950 rounded-xl border border-slate-800 relative overflow-hidden flex flex-col font-sans">
            {/* Android Status Bar */}
            <div className="bg-slate-950 px-3 py-1 flex items-center justify-between text-[10px] font-mono text-slate-400 border-b border-slate-900">
              <span>{clockTime}</span>
              <div className="flex items-center gap-2">
                <Wifi className="w-3 h-3 text-cyan-400" />
                <span className="text-slate-300">{device.telemetry.wifiSsid}</span>
                <div className="flex items-center gap-1 text-emerald-400">
                  <Battery className="w-3 h-3" />
                  <span>{device.telemetry.batteryLevel}%</span>
                </div>
              </div>
            </div>

            {/* Simulated Sally Health RPM Screen */}
            <div className="flex-1 bg-gradient-to-b from-slate-900 via-slate-950 to-slate-950 p-4 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 rounded bg-gradient-to-br from-cyan-500 to-teal-500 flex items-center justify-center font-bold text-slate-950 text-xs">
                      SH
                    </div>
                    <span className="font-extrabold text-white text-sm tracking-tight">Sally Health RPM</span>
                  </div>
                  <span className="px-2 py-0.5 bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 rounded text-[10px] font-mono font-bold">
                    CONNECTED
                  </span>
                </div>

                {device.patient ? (
                  <div className="p-3 bg-slate-900/80 rounded-xl border border-slate-800 space-y-2">
                    <div className="flex justify-between items-center text-xs">
                      <span className="text-slate-400">Patient:</span>
                      <span className="text-white font-bold">{device.patient.patientName}</span>
                    </div>
                    <div className="flex justify-between items-center text-xs">
                      <span className="text-slate-400">MRN:</span>
                      <span className="text-cyan-300 font-mono">{device.patient.medicalRecordNumber}</span>
                    </div>
                    <div className="flex justify-between items-center text-xs">
                      <span className="text-slate-400">Protocol:</span>
                      <span className="text-emerald-300 text-[11px] truncate max-w-[180px]">{device.patient.monitoringProtocol}</span>
                    </div>
                  </div>
                ) : (
                  <div className="p-3 bg-slate-900/40 rounded-xl border border-dashed border-slate-800 text-center text-xs text-slate-400">
                    Device available for patient assignment
                  </div>
                )}
              </div>

              {/* Bottom Quick Bar */}
              <div className="p-2 bg-slate-900/90 rounded-lg border border-slate-800 text-[11px] font-mono text-cyan-400 flex items-center justify-between">
                <span>LockTaskMode: {device.connectionMode.toUpperCase()}</span>
                <span>Knox EMM Active</span>
              </div>
            </div>

            {/* Android Navigation Bar */}
            <div className="bg-slate-950 py-1.5 flex justify-center gap-8 text-slate-500 text-xs border-t border-slate-900 select-none">
              <span>◁</span>
              <span>○</span>
              <span>□</span>
            </div>
          </div>
        );
    }
  };

  return (
    <div className="space-y-4">
      {/* Stream Header & Quality Metrics */}
      <div className="flex flex-wrap items-center justify-between gap-3 p-3 bg-slate-900/90 rounded-xl border border-slate-800">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-cyan-500/10 text-cyan-400 border border-cyan-500/30">
            {device.platform === 'wearos' && <Watch className="w-5 h-5" />}
            {device.platform === 'quest' && <Glasses className="w-5 h-5" />}
            {device.platform === 'windows' && <Monitor className="w-5 h-5" />}
            {(device.platform === 'android' || device.platform === 'ios' || device.platform === 'custom') && <Smartphone className="w-5 h-5" />}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-bold text-white text-sm">{device.name}</span>
              <span className="text-[10px] font-mono uppercase px-1.5 py-0.5 rounded bg-slate-800 text-slate-300 border border-slate-700">
                {streamProfile.resolution} • {streamProfile.framerate} FPS
              </span>
            </div>
            <div className="text-xs text-slate-400 font-mono">
              Adapter: {adapter.formatOsDetails(device)}
            </div>
          </div>
        </div>

        {/* Stream Actions */}
        <div className="flex items-center gap-2">
          <button
            id="remote-screenshot-btn"
            onClick={handleCaptureScreenshot}
            disabled={isCapturing}
            className="px-2.5 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors disabled:opacity-50"
            title="Capture real-time display frame buffer"
          >
            <Camera className={`w-3.5 h-3.5 text-cyan-400 ${isCapturing ? 'animate-spin' : ''}`} />
            <span>Screenshot</span>
          </button>

          <button
            id="remote-lock-btn"
            onClick={handleToggleLock}
            className="px-2.5 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors"
          >
            {isLocked ? (
              <>
                <Unlock className="w-3.5 h-3.5 text-emerald-400" />
                <span>Unlock</span>
              </>
            ) : (
              <>
                <Lock className="w-3.5 h-3.5 text-amber-400" />
                <span>Lock</span>
              </>
            )}
          </button>

          <button
            id="remote-wake-btn"
            onClick={handleWake}
            className="px-2.5 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors"
          >
            <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
            <span>Wake</span>
          </button>

          <button
            id="remote-reboot-btn"
            onClick={handleReboot}
            className="px-2.5 py-1.5 bg-rose-500/10 hover:bg-rose-500/20 text-rose-300 border border-rose-500/30 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors"
          >
            <Power className="w-3.5 h-3.5 text-rose-400" />
            <span>Reboot</span>
          </button>
        </div>
      </div>

      {/* Toast Feedback */}
      {toastMessage && (
        <div className="p-2.5 bg-cyan-950/80 border border-cyan-500/40 rounded-lg text-xs text-cyan-200 font-mono flex items-center gap-2 animate-fadeIn">
          <Check className="w-4 h-4 text-cyan-400 shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Screen Frame Viewport */}
      <div className="p-4 bg-slate-950/90 rounded-2xl border border-slate-800 flex justify-center items-center shadow-inner">
        <div className="w-full max-w-lg">
          {renderScreenContent()}
        </div>
      </div>

      {/* Foreground App Switcher Shortcut */}
      <div className="p-3 bg-slate-900/60 rounded-xl border border-slate-800 text-xs">
        <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2 font-mono">
          Remote App Deployment & Launch Intent
        </div>
        <div className="flex flex-wrap gap-2">
          {device.installedApps.map(appPkg => (
            <button
              key={appPkg}
              onClick={() => handleLaunchForegroundApp(appPkg, appPkg.split('.').pop() || appPkg)}
              className={`px-3 py-1.5 rounded-lg font-mono text-xs transition-all flex items-center gap-1.5 border ${
                activeApp === appPkg
                  ? 'bg-cyan-500/20 text-cyan-300 border-cyan-500/50 shadow-sm'
                  : 'bg-slate-800 text-slate-300 border-slate-700 hover:bg-slate-700 hover:text-white'
              }`}
            >
              <Play className="w-3 h-3 text-cyan-400" />
              <span>{appPkg}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};
