import React, { useState } from 'react';
import { 
  Terminal, 
  Play, 
  Lock, 
  Unlock, 
  Power, 
  RotateCcw, 
  Sparkles, 
  Shield, 
  Radio, 
  Send, 
  CheckCircle2, 
  XCircle, 
  Clock, 
  Filter, 
  Layers,
  Smartphone,
  Watch,
  Monitor,
  Glasses,
  AlertCircle
} from 'lucide-react';
import { CommandItem, PlatformType } from '../types/device';
import { useDevices } from '../context/DeviceContext';
import { getDeviceAdapter } from '../adapters/deviceAdapters';

export const CommandCenter: React.FC = () => {
  const { devices, commands, executeCommand, applications } = useDevices();

  // Target selection state
  const [selectedGroup, setSelectedGroup] = useState<string>('all');
  const [selectedPlatform, setSelectedPlatform] = useState<string>('all');
  const [selectedDeviceIds, setSelectedDeviceIds] = useState<string[]>(devices.map(d => d.id));

  // Command configuration state
  const [commandType, setCommandType] = useState<CommandItem['command']>('launch_app');
  const [selectedAppPackage, setSelectedAppPackage] = useState<string>('org.sallyhealth.rpm.core');
  const [customDeepLink, setCustomDeepLink] = useState<string>('sallyhealth://rpm/vitals/stream');
  const [kioskEnabled, setKioskEnabled] = useState<boolean>(true);
  const [customConfigPayload, setCustomConfigPayload] = useState<string>('{"diagnosticMode": true, "logLevel": "DEBUG"}');
  const [isExecuting, setIsExecuting] = useState<boolean>(false);
  const [latestCommandId, setLatestCommandId] = useState<string | null>(null);

  // Filtered devices based on selection
  const eligibleDevices = devices.filter(d => {
    if (selectedGroup !== 'all' && d.deviceGroup !== selectedGroup) return false;
    if (selectedPlatform !== 'all' && d.platform !== selectedPlatform) return false;
    return true;
  });

  const allGroups = Array.from(new Set(devices.map(d => d.deviceGroup)));
  const allPlatforms: PlatformType[] = ['android', 'wearos', 'ios', 'windows', 'quest', 'custom'];

  const toggleSelectAll = () => {
    if (selectedDeviceIds.length === eligibleDevices.length) {
      setSelectedDeviceIds([]);
    } else {
      setSelectedDeviceIds(eligibleDevices.map(d => d.id));
    }
  };

  const toggleDeviceSelect = (id: string) => {
    setSelectedDeviceIds(prev =>
      prev.includes(id) ? prev.filter(item => item !== id) : [...prev, id]
    );
  };

  const handleExecute = async () => {
    if (selectedDeviceIds.length === 0) return;
    setIsExecuting(true);

    let label = 'Remote Operation';
    const payload: Record<string, unknown> = {};

    switch (commandType) {
      case 'launch_app':
        label = `Launch App: ${selectedAppPackage.split('.').pop() || selectedAppPackage}`;
        payload.packageName = selectedAppPackage;
        break;
      case 'open_url':
        label = `Open Deep Link: ${customDeepLink}`;
        payload.url = customDeepLink;
        break;
      case 'set_kiosk':
        label = kioskEnabled ? 'Lock into Kiosk Mode' : 'Disable Kiosk Mode';
        payload.enabled = kioskEnabled;
        break;
      case 'reboot':
        label = 'Remote Hardware Reboot';
        break;
      case 'wake':
        label = 'Display Wake Signal';
        break;
      case 'lock':
        label = 'Lock Display & Session';
        break;
      case 'sync_mdm':
        label = 'Sync EMM / MDM Profiles';
        break;
      case 'push_config':
        label = 'Push Managed JSON Configuration';
        payload.config = customConfigPayload;
        break;
      case 'trigger_self_diagnostic':
        label = 'Hardware Self-Diagnostic Run';
        break;
      default:
        label = `Execute ${commandType}`;
    }

    try {
      const res = await executeCommand(commandType, label, selectedDeviceIds, payload);
      setLatestCommandId(res.id);
    } finally {
      setIsExecuting(false);
    }
  };

  // View latest executed or selected command
  const activeCommandView = commands.find(c => c.id === latestCommandId) || commands[0];

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Top Banner */}
      <div className="flex flex-wrap items-center justify-between gap-4 p-4 bg-slate-900/90 rounded-2xl border border-slate-800">
        <div>
          <div className="flex items-center gap-2">
            <Terminal className="w-5 h-5 text-cyan-400" />
            <h1 className="text-lg font-bold text-white tracking-tight">Command Center</h1>
            <span className="px-2 py-0.5 text-xs font-mono font-bold bg-cyan-500/10 text-cyan-400 border border-cyan-500/30 rounded">
              Parallel Batch Engine
            </span>
          </div>
          <p className="text-xs text-slate-400 font-mono mt-1">
            Dispatch synchronized operations, configuration payloads, and deep links across multi-platform hardware nodes.
          </p>
        </div>

        <div className="flex items-center gap-2 text-xs font-mono text-slate-400">
          <span>Target Pool:</span>
          <span className="text-cyan-400 font-bold">{selectedDeviceIds.length} / {devices.length} Nodes</span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* LEFT COLUMN: COMMAND BUILDER & TARGET PICKER (7 COLS) */}
        <div className="lg:col-span-7 space-y-6">
          
          {/* STEP 1: TARGET SELECTION */}
          <div className="p-5 bg-slate-900 rounded-2xl border border-slate-800 space-y-4">
            <div className="flex items-center justify-between">
              <div className="text-xs font-bold text-slate-200 uppercase font-mono tracking-wider flex items-center gap-2">
                <Filter className="w-4 h-4 text-cyan-400" />
                <span>1. Select Target Devices</span>
              </div>
              <button
                onClick={toggleSelectAll}
                className="text-xs text-cyan-400 hover:text-cyan-300 font-mono underline"
              >
                {selectedDeviceIds.length === eligibleDevices.length ? 'Deselect All' : 'Select All Filtered'}
              </button>
            </div>

            {/* Target Group & Platform Quick Filters */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs font-mono">
              <div>
                <label className="text-[10px] text-slate-400 uppercase">Device Group</label>
                <select
                  value={selectedGroup}
                  onChange={(e) => setSelectedGroup(e.target.value)}
                  className="w-full mt-1 bg-slate-950 border border-slate-800 rounded-lg p-2 text-white focus:outline-none focus:border-cyan-500"
                >
                  <option value="all">All Groups ({devices.length})</option>
                  {allGroups.map(g => (
                    <option key={g} value={g}>{g}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-[10px] text-slate-400 uppercase">Platform Architecture</label>
                <select
                  value={selectedPlatform}
                  onChange={(e) => setSelectedPlatform(e.target.value)}
                  className="w-full mt-1 bg-slate-950 border border-slate-800 rounded-lg p-2 text-white focus:outline-none focus:border-cyan-500"
                >
                  <option value="all">All Platforms</option>
                  {allPlatforms.map(p => (
                    <option key={p} value={p}>{p.toUpperCase()}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Target Device Checkbox List */}
            <div className="max-h-48 overflow-y-auto space-y-1.5 p-2 bg-slate-950 rounded-xl border border-slate-800 font-mono text-xs">
              {eligibleDevices.map(dev => {
                const isChecked = selectedDeviceIds.includes(dev.id);
                return (
                  <label
                    key={dev.id}
                    className={`flex items-center justify-between p-2 rounded-lg cursor-pointer transition-colors ${
                      isChecked ? 'bg-cyan-950/40 border border-cyan-500/30' : 'hover:bg-slate-900 border border-transparent'
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <input
                        type="checkbox"
                        checked={isChecked}
                        onChange={() => toggleDeviceSelect(dev.id)}
                        className="rounded border-slate-700 text-cyan-500 focus:ring-cyan-500/50 bg-slate-900"
                      />
                      <span className="font-semibold text-white">{dev.name}</span>
                      <span className="text-[10px] text-slate-400 uppercase">({dev.platform})</span>
                    </div>

                    <div className="flex items-center gap-2 text-[11px]">
                      <span className="text-slate-500">{dev.deviceGroup}</span>
                      <span className={`w-1.5 h-1.5 rounded-full ${dev.status === 'online' ? 'bg-emerald-400' : 'bg-slate-500'}`}></span>
                    </div>
                  </label>
                );
              })}
            </div>
          </div>

          {/* STEP 2: COMMAND SELECTION & PAYLOAD */}
          <div className="p-5 bg-slate-900 rounded-2xl border border-slate-800 space-y-4">
            <div className="text-xs font-bold text-slate-200 uppercase font-mono tracking-wider flex items-center gap-2">
              <Terminal className="w-4 h-4 text-cyan-400" />
              <span>2. Choose Command & Parameters</span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 font-mono text-xs">
              {[
                { type: 'launch_app', label: 'Launch App', icon: Play },
                { type: 'set_kiosk', label: 'Kiosk Mode', icon: Shield },
                { type: 'reboot', label: 'Hard Reboot', icon: Power },
                { type: 'wake', label: 'Wake Display', icon: Sparkles },
                { type: 'lock', label: 'Lock Session', icon: Lock },
                { type: 'sync_mdm', label: 'MDM Sync', icon: Radio },
                { type: 'open_url', label: 'Deep Link', icon: Send },
                { type: 'push_config', label: 'Push Config', icon: Layers },
                { type: 'trigger_self_diagnostic', label: 'Diagnostic', icon: CheckCircle2 },
              ].map(cmd => {
                const Icon = cmd.icon;
                const isSelected = commandType === cmd.type;
                return (
                  <button
                    key={cmd.type}
                    onClick={() => setCommandType(cmd.type as any)}
                    className={`p-3 rounded-xl border flex flex-col items-center justify-center gap-1.5 text-center transition-all ${
                      isSelected
                        ? 'bg-gradient-to-br from-cyan-950 to-slate-900 text-cyan-300 border-cyan-400 shadow-md shadow-cyan-950'
                        : 'bg-slate-950 text-slate-400 border-slate-800 hover:bg-slate-900 hover:text-white'
                    }`}
                  >
                    <Icon className={`w-4 h-4 ${isSelected ? 'text-cyan-400' : 'text-slate-500'}`} />
                    <span className="font-semibold">{cmd.label}</span>
                  </button>
                );
              })}
            </div>

            {/* Dynamic Parameter Fields */}
            {commandType === 'launch_app' && (
              <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 space-y-2 font-mono text-xs">
                <label className="text-[10px] text-slate-400 uppercase">Application Package Identifier</label>
                <select
                  value={selectedAppPackage}
                  onChange={(e) => setSelectedAppPackage(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-800 rounded-lg p-2 text-white focus:outline-none focus:border-cyan-500"
                >
                  {applications.map(app => (
                    <option key={app.id} value={app.packageIdentifier}>
                      {app.name} ({app.packageIdentifier})
                    </option>
                  ))}
                </select>
              </div>
            )}

            {commandType === 'open_url' && (
              <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 space-y-2 font-mono text-xs">
                <label className="text-[10px] text-slate-400 uppercase">Deep Link / Target URL</label>
                <input
                  type="text"
                  value={customDeepLink}
                  onChange={(e) => setCustomDeepLink(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-800 rounded-lg p-2 text-white focus:outline-none focus:border-cyan-500"
                />
              </div>
            )}

            {commandType === 'set_kiosk' && (
              <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 space-y-2 font-mono text-xs">
                <label className="text-[10px] text-slate-400 uppercase">Kiosk Enforcement Mode</label>
                <div className="flex gap-4">
                  <label className="flex items-center gap-2 text-slate-300 cursor-pointer">
                    <input
                      type="radio"
                      name="kiosk_mode"
                      checked={kioskEnabled}
                      onChange={() => setKioskEnabled(true)}
                    />
                    <span>ENABLE (LockTaskMode Enforced)</span>
                  </label>
                  <label className="flex items-center gap-2 text-slate-300 cursor-pointer">
                    <input
                      type="radio"
                      name="kiosk_mode"
                      checked={!kioskEnabled}
                      onChange={() => setKioskEnabled(false)}
                    />
                    <span>DISABLE (Standard MDM Access)</span>
                  </label>
                </div>
              </div>
            )}

            {commandType === 'push_config' && (
              <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 space-y-2 font-mono text-xs">
                <label className="text-[10px] text-slate-400 uppercase">Managed Configuration JSON Payload</label>
                <textarea
                  value={customConfigPayload}
                  onChange={(e) => setCustomConfigPayload(e.target.value)}
                  rows={3}
                  className="w-full bg-slate-900 border border-slate-800 rounded-lg p-2 text-cyan-300 focus:outline-none focus:border-cyan-500"
                />
              </div>
            )}

            {/* Execute Button */}
            <button
              onClick={handleExecute}
              disabled={isExecuting || selectedDeviceIds.length === 0}
              className="w-full py-3 bg-gradient-to-r from-cyan-500 via-teal-500 to-emerald-500 text-slate-950 font-extrabold text-sm rounded-xl hover:from-cyan-400 hover:to-emerald-400 transition-all flex items-center justify-center gap-2 shadow-lg shadow-cyan-500/20 disabled:opacity-50 active:scale-[0.99]"
            >
              <Send className={`w-4 h-4 text-slate-950 ${isExecuting ? 'animate-spin' : ''}`} />
              <span>{isExecuting ? 'Dispatching Over Gateway...' : `Execute Command on ${selectedDeviceIds.length} Nodes`}</span>
            </button>
          </div>

        </div>

        {/* RIGHT COLUMN: EXECUTION WATERFALL & AUDIT RESULTS (5 COLS) */}
        <div className="lg:col-span-5 space-y-6">
          <div className="p-5 bg-slate-900 rounded-2xl border border-slate-800 space-y-4">
            <div className="flex items-center justify-between">
              <div className="text-xs font-bold text-slate-200 uppercase font-mono tracking-wider">
                Execution Stream & Acknowledgements
              </div>
              <span className="text-[10px] text-slate-500 font-mono">
                {commands.length} Dispatches Recorded
              </span>
            </div>

            {activeCommandView ? (
              <div className="space-y-4 font-mono text-xs">
                
                {/* Command Summary Card */}
                <div className="p-3.5 bg-slate-950 rounded-xl border border-slate-800 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-white text-sm">{activeCommandView.label}</span>
                    <span
                      className={`px-2 py-0.5 rounded text-[10px] uppercase font-bold border ${
                        activeCommandView.status === 'completed'
                          ? 'bg-emerald-500/10 text-emerald-300 border-emerald-500/30'
                          : activeCommandView.status === 'partially_failed'
                          ? 'bg-amber-500/10 text-amber-300 border-amber-500/30'
                          : activeCommandView.status === 'failed'
                          ? 'bg-rose-500/10 text-rose-300 border-rose-500/30'
                          : 'bg-cyan-500/10 text-cyan-300 border-cyan-500/30'
                      }`}
                    >
                      {activeCommandView.status}
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-2 text-[11px] text-slate-400">
                    <div>ID: <span className="text-slate-200">{activeCommandView.id}</span></div>
                    <div>User: <span className="text-slate-200">{activeCommandView.initiatedBy}</span></div>
                    <div>Target: <span className="text-cyan-300">{activeCommandView.targetDeviceIds.length} Nodes</span></div>
                    <div>Timestamp: <span className="text-slate-200">{activeCommandView.timestamp}</span></div>
                  </div>

                  {/* Execution Progress Gauge */}
                  <div className="pt-2 border-t border-slate-900 flex justify-between items-center text-[11px]">
                    <span className="text-emerald-400">
                      ✓ {activeCommandView.deviceResults.filter(r => r.status === 'success').length} Success
                    </span>
                    <span className="text-rose-400">
                      ✕ {activeCommandView.deviceResults.filter(r => r.status === 'failed').length} Failed
                    </span>
                    <span className="text-cyan-400">
                      ⟳ {activeCommandView.deviceResults.filter(r => r.status === 'pending').length} Pending
                    </span>
                  </div>
                </div>

                {/* Per-Device Result Waterfall Rows */}
                <div className="space-y-1.5 max-h-[380px] overflow-y-auto pr-1">
                  {activeCommandView.deviceResults.map(result => (
                    <div
                      key={result.deviceId}
                      className="p-2.5 bg-slate-950/80 rounded-lg border border-slate-800 flex items-center justify-between gap-2 text-xs"
                    >
                      <div className="flex items-center gap-2 truncate">
                        {result.status === 'success' && <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />}
                        {result.status === 'failed' && <XCircle className="w-4 h-4 text-rose-400 shrink-0" />}
                        {result.status === 'pending' && <Clock className="w-4 h-4 text-cyan-400 animate-spin shrink-0" />}
                        
                        <div className="truncate">
                          <div className="font-semibold text-white truncate">{result.deviceName}</div>
                          <div className="text-[10px] text-slate-400 truncate">{result.message}</div>
                        </div>
                      </div>

                      <div className="text-right shrink-0">
                        <span className="text-[10px] text-slate-500 font-mono">{result.durationMs}ms</span>
                      </div>
                    </div>
                  ))}
                </div>

              </div>
            ) : (
              <div className="p-8 text-center text-xs text-slate-400 font-mono bg-slate-950 rounded-xl border border-slate-800">
                No recent commands dispatched. Choose a command and click Execute above.
              </div>
            )}
          </div>
        </div>

      </div>
    </div>
  );
};
