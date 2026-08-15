import React, { useState } from 'react';
import { 
  ShieldCheck, 
  ShieldAlert, 
  ArrowUpCircle, 
  Zap, 
  Clock, 
  RotateCcw, 
  CheckCircle2, 
  AlertTriangle, 
  RefreshCw, 
  Layers,
  ArrowRight
} from 'lucide-react';
import { useDevices } from '../context/DeviceContext';
import { PatchRecord } from '../types/enterprise';

export const PatchManagementView: React.FC = () => {
  const { patches, deployPatchToRing } = useDevices();

  const [filterSeverity, setFilterSeverity] = useState<string>('ALL');

  const filteredPatches = patches.filter(p => {
    return filterSeverity === 'ALL' || p.severity === filterSeverity;
  });

  return (
    <div className="space-y-6">
      
      {/* Header Banner */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 relative overflow-hidden">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="px-2 py-0.5 rounded-full text-xs font-semibold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                OS & Firmware Vulnerability Patching
              </span>
              <span className="text-xs text-slate-400 font-mono">CVE Remediation Engine</span>
            </div>
            <h1 className="text-2xl font-bold text-white tracking-tight">
              Patch & Operating System Update Management
            </h1>
            <p className="text-sm text-slate-400 mt-1 max-w-2xl">
              Distribute certified security bulletins across Windows 11, Android Enterprise, Wear OS, and Apple supervised endpoints with canary rings and maintenance windows.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <div className="flex bg-slate-950 p-0.5 rounded-lg border border-slate-800 text-[11px]">
              {['ALL', 'CRITICAL', 'HIGH', 'MEDIUM'].map(tab => (
                <button
                  key={tab}
                  onClick={() => setFilterSeverity(tab)}
                  className={`px-3 py-1 rounded font-medium transition-all cursor-pointer ${
                    filterSeverity === tab ? 'bg-slate-800 text-white' : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  {tab}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Patch Cards List */}
      <div className="space-y-4">
        {filteredPatches.map(patch => (
          <div key={patch.id} className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-4 hover:border-slate-700 transition-all">
            <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
              <div>
                <div className="flex items-center gap-2">
                  <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${
                    patch.severity === 'critical' ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30' :
                    patch.severity === 'high' || patch.severity === 'security' ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30' :
                    'bg-cyan-500/20 text-cyan-300 border border-cyan-500/30'
                  }`}>
                    {patch.severity}
                  </span>
                  <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-slate-800 text-cyan-400">
                    {patch.cveId || patch.patchCode}
                  </span>
                  <span className="text-xs text-slate-400 font-mono capitalize">• {patch.platform} ({patch.vendor || 'OEM'})</span>
                </div>

                <h3 className="text-sm font-bold text-white mt-1.5">{patch.title}</h3>
                <p className="text-xs text-slate-400 mt-1">{patch.description || 'Verified security patch package.'}</p>
              </div>

              <div className="flex items-center gap-2">
                <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                  patch.status === 'deployed' || patch.status === 'verified' ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30' :
                  patch.status === 'deploying' ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 animate-pulse' :
                  'bg-slate-800 text-slate-400'
                }`}>
                  {patch.status}
                </span>

                <div className="flex items-center gap-1">
                  {(['CANARY', 'PILOT', 'PRODUCTION'] as const).map(ring => (
                    <button
                      key={ring}
                      onClick={() => deployPatchToRing(patch.id, ring)}
                      className={`px-2.5 py-1 text-[11px] font-semibold rounded transition-all cursor-pointer ${
                        patch.rolloutRing === ring
                          ? 'bg-emerald-600 text-white shadow-sm'
                          : 'bg-slate-800 hover:bg-slate-700 text-slate-300'
                      }`}
                    >
                      {ring}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Bottom Specs Bar */}
            <div className="bg-slate-950 p-3 rounded-lg border border-slate-850 flex flex-wrap items-center justify-between gap-2 text-[11px] font-mono text-slate-400">
              <div>Affected Endpoints: <span className="text-white font-bold">{patch.affectedEndpointsCount ?? patch.applicableDevicesCount} Devices</span></div>
              <div>Installed: <span className="text-emerald-400 font-bold">{patch.installedCount ?? patch.installedDevicesCount}</span> • Pending: <span className="text-amber-400">{patch.pendingCount ?? (patch.applicableDevicesCount - patch.installedDevicesCount)}</span></div>
              <div>Reboot: <span className={(patch.requiresReboot ?? patch.rebootRequired) ? 'text-amber-400' : 'text-slate-500'}>{(patch.requiresReboot ?? patch.rebootRequired) ? 'Mandatory' : 'Zero-Downtime'}</span></div>
              <div>Release: <span className="text-slate-300">{patch.releaseDate}</span></div>
            </div>
          </div>
        ))}
      </div>

    </div>
  );
};
