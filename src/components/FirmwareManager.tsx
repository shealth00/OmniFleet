import React, { useState } from 'react';
import { 
  ArrowUpCircle, 
  ShieldCheck, 
  CheckCircle2, 
  AlertTriangle, 
  Cpu, 
  HardDrive, 
  Battery, 
  Wifi, 
  RotateCcw, 
  Layers,
  Smartphone,
  Watch,
  Monitor,
  Glasses,
  Play,
  FileCode,
  Radio
} from 'lucide-react';
import { FirmwarePackage } from '../types/device';
import { useDevices } from '../context/DeviceContext';

export const FirmwareManager: React.FC = () => {
  const { firmwarePackages, devices, startFirmwareRollout } = useDevices();

  const [selectedPackageId, setSelectedPackageId] = useState<string>(firmwarePackages[0]?.id || '');
  const [rolloutPercentage, setRolloutPercentage] = useState<number>(100);
  const [selectedChannel, setSelectedChannel] = useState<'all' | 'stable' | 'beta' | 'emergency'>('all');
  const [isStaging, setIsStaging] = useState<boolean>(false);

  const activePackage = firmwarePackages.find(p => p.id === selectedPackageId) || firmwarePackages[0];

  // Eligible devices for this firmware package
  const eligibleDevices = devices.filter(d => 
    d.platform === activePackage?.platform && 
    (activePackage.targetModels.includes(d.model) || activePackage.targetModels.length === 0)
  );

  const updatingDevices = devices.filter(d => d.status === 'updating');

  const handleStartRollout = () => {
    if (!activePackage) return;
    setIsStaging(true);

    // Calculate subset based on percentage
    const targetCount = Math.max(1, Math.round((eligibleDevices.length * rolloutPercentage) / 100));
    const targetIds = eligibleDevices.slice(0, targetCount).map(d => d.id);

    startFirmwareRollout(activePackage.id, targetIds);
    setTimeout(() => setIsStaging(false), 800);
  };

  return (
    <div className="space-y-6 animate-fadeIn">
      
      {/* Header Banner */}
      <div className="flex flex-wrap items-center justify-between gap-4 p-4 bg-slate-900/90 rounded-2xl border border-slate-800">
        <div>
          <div className="flex items-center gap-2">
            <ArrowUpCircle className="w-5 h-5 text-cyan-400" />
            <h1 className="text-lg font-bold text-white tracking-tight">Automated Remote Firmware & OTA</h1>
            <span className="px-2 py-0.5 text-xs font-mono font-bold bg-cyan-500/10 text-cyan-400 border border-cyan-500/30 rounded">
              Zero-Touch Deployment
            </span>
          </div>
          <p className="text-xs text-slate-400 font-mono mt-1">
            Orchestrate verified binary firmware rollouts, automated pre-flight safety assertions, and seamless rollback watchdogs.
          </p>
        </div>

        <div className="flex items-center gap-3 text-xs font-mono">
          <div className="px-3 py-1.5 bg-slate-950 rounded-lg border border-slate-800 text-slate-300">
            <span className="text-slate-500">Live OTA Rollouts:</span>{' '}
            <span className="text-cyan-400 font-bold">{updatingDevices.length} Nodes Flashing</span>
          </div>
        </div>
      </div>

      {/* Live Flashing Progress Tracker (if any updating) */}
      {updatingDevices.length > 0 && (
        <div className="p-4 bg-slate-900 rounded-2xl border border-cyan-500/40 space-y-3 font-mono text-xs">
          <div className="flex items-center justify-between text-cyan-300 font-bold">
            <span className="flex items-center gap-2">
              <Radio className="w-4 h-4 text-cyan-400 animate-spin" />
              <span>Active Hardware OTA Deployment in Progress ({updatingDevices.length} Nodes)</span>
            </span>
            <span>SHA-256 Partition B Verified</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {updatingDevices.map(d => (
              <div key={d.id} className="p-3 bg-slate-950 rounded-xl border border-slate-800 space-y-2">
                <div className="flex justify-between items-center">
                  <span className="font-bold text-white">{d.name}</span>
                  <span className="text-cyan-400 font-bold">{d.pendingUpdate?.progressPercent}%</span>
                </div>
                <div className="h-2 bg-slate-800 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-gradient-to-r from-cyan-500 to-teal-400 transition-all duration-300"
                    style={{ width: `${d.pendingUpdate?.progressPercent || 0}%` }}
                  ></div>
                </div>
                <div className="flex justify-between text-[10px] text-slate-400 uppercase">
                  <span>Target: {d.pendingUpdate?.targetVersion}</span>
                  <span>Stage: {d.pendingUpdate?.stage}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Main Grid: Repository & Orchestrator */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* REPOSITORY LIST (5 COLS) */}
        <div className="lg:col-span-5 space-y-4">
          <div className="flex items-center justify-between">
            <div className="text-xs font-bold text-slate-200 uppercase font-mono tracking-wider">
              Firmware Packages ({firmwarePackages.length})
            </div>

            {/* Channel filter */}
            <select
              value={selectedChannel}
              onChange={(e) => setSelectedChannel(e.target.value as any)}
              className="bg-slate-900 border border-slate-800 text-[11px] font-mono text-cyan-300 px-2 py-1 rounded"
            >
              <option value="all">All Channels</option>
              <option value="stable">Stable Only</option>
              <option value="beta">Beta Channel</option>
              <option value="emergency">Emergency Rollouts</option>
            </select>
          </div>

          <div className="space-y-3 font-mono text-xs">
            {firmwarePackages
              .filter(p => selectedChannel === 'all' || p.channel === selectedChannel)
              .map(pkg => {
                const isSelected = pkg.id === selectedPackageId;
                return (
                  <div
                    key={pkg.id}
                    onClick={() => setSelectedPackageId(pkg.id)}
                    className={`p-4 rounded-xl border cursor-pointer transition-all ${
                      isSelected
                        ? 'bg-slate-900 border-cyan-500/60 shadow-lg shadow-cyan-950/40'
                        : 'bg-slate-950/80 border-slate-800/80 hover:bg-slate-900/60'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1.5">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-white text-sm">{pkg.version}</span>
                        <span className="px-1.5 py-0.5 bg-emerald-500/10 text-emerald-300 border border-emerald-500/30 rounded text-[10px] uppercase font-bold">
                          {pkg.channel}
                        </span>
                      </div>
                      <span className="text-[10px] text-slate-500">{pkg.sizeMb} MB</span>
                    </div>

                    <div className="text-[11px] text-slate-400 mb-2">
                      Platform: <span className="text-cyan-300 uppercase font-bold">{pkg.platform}</span> • Models: {pkg.targetModels.join(', ')}
                    </div>

                    <div className="flex justify-between items-center text-[10px] text-slate-500 pt-2 border-t border-slate-900">
                      <span>Released: {pkg.releaseDate}</span>
                      <span className="text-emerald-400 font-bold">{pkg.installedCount} Deployed Fleet</span>
                    </div>
                  </div>
                );
              })}
          </div>
        </div>

        {/* ORCHESTRATOR & PRE-FLIGHT SAFETY (7 COLS) */}
        {activePackage && (
          <div className="lg:col-span-7 space-y-6">
            
            {/* Package Detail & Checksum Card */}
            <div className="p-5 bg-slate-900 rounded-2xl border border-slate-800 space-y-4 font-mono text-xs">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-base font-black text-white">{activePackage.version}</div>
                  <div className="text-slate-400 text-[11px]">Architecture Target: {activePackage.platform.toUpperCase()}</div>
                </div>
                <span className="px-2.5 py-1 bg-cyan-500/10 text-cyan-300 border border-cyan-500/30 rounded-lg text-xs font-bold uppercase">
                  Ready For Rollout
                </span>
              </div>

              {/* SHA-256 Checksum */}
              <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 space-y-1">
                <div className="text-[10px] text-slate-500 uppercase flex items-center gap-1.5">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Cryptographic SHA-256 Checksum</span>
                </div>
                <div className="text-[11px] text-cyan-400 truncate select-all">{activePackage.sha256Checksum}</div>
              </div>

              {/* Release Notes */}
              <div className="space-y-1.5">
                <div className="text-[10px] text-slate-500 uppercase">Engine Changelog & Security Patches</div>
                <ul className="list-disc list-inside space-y-1 text-slate-300 text-xs bg-slate-950 p-3 rounded-xl border border-slate-800">
                  {activePackage.releaseNotes.map((note, idx) => (
                    <li key={idx} className="leading-relaxed">{note}</li>
                  ))}
                </ul>
              </div>

              {/* Pre-flight Automated Assertions Matrix */}
              <div className="space-y-2 pt-2 border-t border-slate-800">
                <div className="text-[10px] text-slate-400 uppercase font-bold">
                  Pre-Flight Safety Assertion Matrix
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  <div className="p-2.5 bg-slate-950 rounded-lg border border-slate-800 flex items-center gap-2">
                    <Battery className="w-4 h-4 text-emerald-400 shrink-0" />
                    <div>
                      <div className="text-[10px] text-slate-500">Min Battery</div>
                      <div className="text-white font-bold">&ge; {activePackage.minBatteryRequired}%</div>
                    </div>
                  </div>

                  <div className="p-2.5 bg-slate-950 rounded-lg border border-slate-800 flex items-center gap-2">
                    <HardDrive className="w-4 h-4 text-cyan-400 shrink-0" />
                    <div>
                      <div className="text-[10px] text-slate-500">Free Storage</div>
                      <div className="text-white font-bold">&ge; {activePackage.minStorageMb} MB</div>
                    </div>
                  </div>

                  <div className="p-2.5 bg-slate-950 rounded-lg border border-slate-800 flex items-center gap-2">
                    <Wifi className="w-4 h-4 text-teal-400 shrink-0" />
                    <div>
                      <div className="text-[10px] text-slate-500">Wi-Fi / Mesh</div>
                      <div className="text-white font-bold">Encrypted Link</div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Rollout Staging Configuration */}
              <div className="p-4 bg-slate-950 rounded-xl border border-slate-800 space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-slate-300 font-bold">Rollout Staging Scope</span>
                  <span className="text-cyan-400 font-bold">{rolloutPercentage}% ({Math.max(1, Math.round((eligibleDevices.length * rolloutPercentage) / 100))} of {eligibleDevices.length} Nodes)</span>
                </div>

                <div className="flex gap-2">
                  {[20, 50, 100].map(pct => (
                    <button
                      key={pct}
                      onClick={() => setRolloutPercentage(pct)}
                      className={`flex-1 py-1.5 rounded-lg text-xs font-bold border transition-all ${
                        rolloutPercentage === pct
                          ? 'bg-cyan-500/20 text-cyan-300 border-cyan-500 shadow-sm'
                          : 'bg-slate-900 text-slate-400 border-slate-800 hover:bg-slate-850'
                      }`}
                    >
                      Stage {pct}%
                    </button>
                  ))}
                </div>

                <p className="text-[10px] text-slate-500 leading-normal">
                  Staging automates canary deployment to a percentage of fleet nodes first, verifying heartbeat stability and sensor telemetry before cascading to remaining hardware.
                </p>
              </div>

              {/* Rollout Action Button */}
              <button
                onClick={handleStartRollout}
                disabled={isStaging || eligibleDevices.length === 0}
                className="w-full py-3 bg-gradient-to-r from-cyan-500 via-teal-500 to-emerald-500 text-slate-950 font-extrabold text-sm rounded-xl hover:from-cyan-400 hover:to-emerald-400 transition-all flex items-center justify-center gap-2 shadow-lg shadow-cyan-500/20 disabled:opacity-50 active:scale-[0.99]"
              >
                <ArrowUpCircle className={`w-4 h-4 text-slate-950 ${isStaging ? 'animate-spin' : ''}`} />
                <span>
                  {isStaging ? 'Orchestrating OTA Deployment...' : `Initiate Remote OTA Rollout on ${eligibleDevices.length} Compatible Devices`}
                </span>
              </button>

            </div>

          </div>
        )}

      </div>

    </div>
  );
};
