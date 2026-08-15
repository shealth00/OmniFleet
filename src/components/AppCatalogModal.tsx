import React, { useState } from 'react';
import { 
  Layers, 
  Play, 
  ShieldCheck, 
  Send, 
  Check, 
  ArrowUpCircle, 
  Sparkles, 
  Smartphone, 
  Watch, 
  Monitor, 
  Glasses,
  Radio,
  FileCode
} from 'lucide-react';
import { ApplicationPackage } from '../types/device';
import { useDevices } from '../context/DeviceContext';

export const AppCatalogModal: React.FC = () => {
  const { applications, devices, deployApplication } = useDevices();

  const [selectedAppId, setSelectedAppId] = useState<string>(applications[0]?.id || '');
  const [selectedGroups, setSelectedGroups] = useState<string[]>([]);
  const [isDeploying, setIsDeploying] = useState(false);
  const [deploySuccessMessage, setDeploySuccessMessage] = useState<string | null>(null);

  const activeApp = applications.find(a => a.id === selectedAppId) || applications[0];

  const allGroups: string[] = Array.from(new Set(devices.map(d => d.deviceGroup)));

  const toggleGroup = (groupName: string) => {
    setSelectedGroups(prev =>
      prev.includes(groupName) ? prev.filter(g => g !== groupName) : [...prev, groupName]
    );
  };

  const handleDeploy = () => {
    if (!activeApp || selectedGroups.length === 0) return;
    setIsDeploying(true);
    deployApplication(activeApp.id, selectedGroups);
    
    setTimeout(() => {
      setIsDeploying(false);
      setDeploySuccessMessage(`Application ${activeApp.name} successfully deployed to: ${selectedGroups.join(', ')}`);
      setTimeout(() => setDeploySuccessMessage(null), 4000);
    }, 600);
  };

  return (
    <div className="space-y-6 animate-fadeIn">
      
      {/* Banner */}
      <div className="flex flex-wrap items-center justify-between gap-4 p-4 bg-slate-900/90 rounded-2xl border border-slate-800">
        <div>
          <div className="flex items-center gap-2">
            <Layers className="w-5 h-5 text-cyan-400" />
            <h1 className="text-lg font-bold text-white tracking-tight">Application Catalog & Package Manager</h1>
            <span className="px-2 py-0.5 text-xs font-mono font-bold bg-cyan-500/10 text-cyan-400 border border-cyan-500/30 rounded">
              Managed Enterprise Repository
            </span>
          </div>
          <p className="text-xs text-slate-400 font-mono mt-1">
            Distribute verified clinical binaries, background GATT bridges, and kiosk launcher shells across target fleet groups.
          </p>
        </div>
      </div>

      {deploySuccessMessage && (
        <div className="p-3 bg-emerald-950/80 border border-emerald-500/40 rounded-xl text-emerald-300 text-xs font-mono flex items-center gap-2">
          <Check className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{deploySuccessMessage}</span>
        </div>
      )}

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* APP LIST (5 COLS) */}
        <div className="lg:col-span-5 space-y-3 font-mono text-xs">
          <div className="text-xs font-bold text-slate-200 uppercase tracking-wider">
            Enterprise Application Catalog ({applications.length})
          </div>

          {applications.map(app => {
            const isSelected = app.id === selectedAppId;
            return (
              <div
                key={app.id}
                onClick={() => {
                  setSelectedAppId(app.id);
                  setSelectedGroups(app.assignedGroups);
                }}
                className={`p-4 rounded-xl border cursor-pointer transition-all ${
                  isSelected
                    ? 'bg-slate-900 border-cyan-500 shadow-md shadow-cyan-950/40'
                    : 'bg-slate-950/80 border-slate-800 hover:bg-slate-900/60'
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="font-bold text-white text-sm">{app.name}</span>
                  <span className="px-1.5 py-0.5 bg-cyan-500/10 text-cyan-300 border border-cyan-500/30 rounded text-[10px] uppercase font-bold">
                    v{app.version}
                  </span>
                </div>

                <div className="text-[11px] text-cyan-400 mb-2 truncate select-all">{app.packageIdentifier}</div>

                <div className="flex items-center justify-between text-[10px] text-slate-500 pt-2 border-t border-slate-900">
                  <span className="uppercase">Platforms: {app.platforms.join(', ')}</span>
                  <span className="text-slate-400">{app.assignedGroups.length} Groups Assigned</span>
                </div>
              </div>
            );
          })}
        </div>

        {/* DEPLOYMENT DETAILS & TARGET ASSIGNMENT (7 COLS) */}
        {activeApp && (
          <div className="lg:col-span-7 space-y-5 font-mono text-xs">
            <div className="p-5 bg-slate-900 rounded-2xl border border-slate-800 space-y-4">
              <div className="flex justify-between items-start">
                <div>
                  <div className="text-base font-black text-white">{activeApp.name}</div>
                  <div className="text-cyan-400 text-xs mt-0.5">{activeApp.packageIdentifier} • v{activeApp.version}</div>
                </div>
                <span className="px-2 py-1 bg-slate-950 border border-slate-800 text-slate-300 rounded text-[10px] uppercase">
                  Category: {activeApp.category}
                </span>
              </div>

              <p className="text-slate-300 text-xs leading-relaxed bg-slate-950 p-3 rounded-xl border border-slate-800">
                {activeApp.description}
              </p>

              {/* Required Permissions */}
              <div className="space-y-1.5">
                <div className="text-[10px] text-slate-400 uppercase font-bold">Required Hardware & Sensor Permissions</div>
                <div className="flex flex-wrap gap-1.5">
                  {activeApp.requiredPermissions.map(perm => (
                    <span
                      key={perm}
                      className="px-2 py-0.5 bg-slate-950 text-slate-300 rounded border border-slate-800 text-[10px]"
                    >
                      {perm}
                    </span>
                  ))}
                </div>
              </div>

              {/* Target Fleet Group Assignments */}
              <div className="space-y-2 pt-2 border-t border-slate-800">
                <div className="text-[10px] text-slate-400 uppercase font-bold">
                  Deploy to Target Device Groups
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {allGroups.map(grp => {
                    const isChecked = selectedGroups.includes(grp);
                    const groupDeviceCount = devices.filter(d => d.deviceGroup === grp).length;
                    return (
                      <label
                        key={grp}
                        className={`p-2.5 rounded-xl border flex items-center justify-between cursor-pointer transition-colors ${
                          isChecked ? 'bg-cyan-950/40 border-cyan-500/40' : 'bg-slate-950 border-slate-800 hover:bg-slate-900'
                        }`}
                      >
                        <div className="flex items-center gap-2">
                          <input
                            type="checkbox"
                            checked={isChecked}
                            onChange={() => toggleGroup(grp)}
                            className="rounded border-slate-700 text-cyan-500 bg-slate-900"
                          />
                          <span className="text-white font-semibold">{grp}</span>
                        </div>
                        <span className="text-[10px] text-slate-500">{groupDeviceCount} Nodes</span>
                      </label>
                    );
                  })}
                </div>
              </div>

              {/* Deploy Button */}
              <button
                onClick={handleDeploy}
                disabled={isDeploying || selectedGroups.length === 0}
                className="w-full py-3 bg-gradient-to-r from-cyan-500 via-teal-500 to-emerald-500 text-slate-950 font-extrabold text-sm rounded-xl hover:from-cyan-400 hover:to-emerald-400 transition-all flex items-center justify-center gap-2 shadow-lg shadow-cyan-500/20 disabled:opacity-50 active:scale-[0.99]"
              >
                <Send className={`w-4 h-4 text-slate-950 ${isDeploying ? 'animate-spin' : ''}`} />
                <span>{isDeploying ? 'Deploying to Target Groups...' : `Push Deploy Application to ${selectedGroups.length} Groups`}</span>
              </button>

            </div>
          </div>
        )}

      </div>

    </div>
  );
};
