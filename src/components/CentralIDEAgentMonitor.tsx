import React, { useState } from 'react';
import { 
  Terminal, 
  Cpu, 
  HardDrive, 
  Activity, 
  ShieldCheck, 
  RotateCcw, 
  Trash2, 
  Square, 
  Search, 
  Sliders, 
  RefreshCw, 
  Radio, 
  CheckCircle2, 
  AlertTriangle, 
  Clock, 
  Zap, 
  FolderGit2, 
  Send, 
  Layers, 
  Laptop, 
  Smartphone,
  ExternalLink,
  Wifi,
  Database,
  GitBranch,
  ArrowDownCircle,
  ArrowUpCircle,
  Share2,
  FolderOpen,
  Monitor,
  Maximize2,
  Power,
  Volume2,
  VolumeX,
  Keyboard,
  Shield,
  Key
} from 'lucide-react';
import { useDevices } from '../context/DeviceContext';
import { TabletIDEAgentRecord, TabletFileManagerConfig } from '../types/ideAgent';
import { IDEAgentInspectorModal } from './IDEAgentInspectorModal';

export const CentralIDEAgentMonitor: React.FC = () => {
  const { 
    tabletIDEAgents, 
    centralPolicy, 
    centralEvents, 
    updateCentralPolicy, 
    triggerFleetIDESweep, 
    restartIDEAgent, 
    garbageCollectAgent, 
    terminateAgentScript,
    dispatchScriptToTablet,
    triggerNasProjectSync,
    triggerGitPullFromNas,
    triggerGitPushToNas,
    applyAndroid12DaemonTuning,
    toggleTermuxWakeLock,
    deployFileManagerToTablet,
    toggleScrcpySession,
    sendScrcpyKeyAction,
    runAdbShellCommand,
    triggerRemoteWorkspaceWipe
  } = useDevices();

  const [activeTab, setActiveTab] = useState<
    'grid' | 'nas_git' | 'android12_daemon' | 'file_manager' | 'scrcpy' | 'events' | 'policies' | 'dispatcher'
  >('grid');

  const [selectedAgentForModal, setSelectedAgentForModal] = useState<TabletIDEAgentRecord | null>(null);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [engineFilter, setEngineFilter] = useState<string>('all');
  const [isSweeping, setIsSweeping] = useState<boolean>(false);
  const [isApplyingTuningAll, setIsApplyingTuningAll] = useState<boolean>(false);

  // Script Dispatcher State
  const [selectedScriptPreset, setSelectedScriptPreset] = useState<string>('vitals_integrity.py');
  const [scriptPayload, setScriptPayload] = useState<string>(
`# Clinical Diagnostic Script: Vitals Stream Integrity
import telemetry_sdk
import time

def run_diagnostic():
    print("[INIT] Attaching to local BLE GATT stream on tablet...")
    client = telemetry_sdk.create_client(sample_rate_hz=200)
    samples = client.capture_window(seconds=5)
    print(f"[METRIC] Captured {len(samples)} data points.")
    anomalies = [s for s in samples if s.signal_quality < 0.85]
    print(f"[RESULT] Signal Integrity: {100 - len(anomalies)/len(samples)*100:.1f}%. Anomalies: {len(anomalies)}")
    return True

run_diagnostic()`
  );
  const [targetDeviceSelection, setTargetDeviceSelection] = useState<string>('ALL');
  const [isDispatching, setIsDispatching] = useState<boolean>(false);
  const [dispatchResults, setDispatchResults] = useState<{ id: string; name: string; status: 'dispatched' | 'success' | 'failed'; time: string }[]>([]);

  // ADB Interactive Console State
  const [adbSelectedAgentId, setAdbSelectedAgentId] = useState<string>(tabletIDEAgents[0]?.id || 'ide-agent-tab-001');
  const [adbCommandInput, setAdbCommandInput] = useState<string>('device_config get activity_manager max_phantom_processes');
  const [adbConsoleLogs, setAdbConsoleLogs] = useState<{ id: string; timestamp: string; cmd: string; output: string }[]>([
    {
      id: 'adb-init-1',
      timestamp: '12:00:00',
      cmd: 'device_config put activity_manager max_phantom_processes 2147483647',
      output: 'Applied: max_phantom_processes=2147483647 (Persistent across reboots)'
    },
    {
      id: 'adb-init-2',
      timestamp: '12:01:15',
      cmd: 'dumpsys deviceidle whitelist +com.termux',
      output: 'Added: com.termux to battery idle whitelist'
    }
  ]);
  const [isExecutingAdb, setIsExecutingAdb] = useState<boolean>(false);

  // SCRCPY Active Session State
  const [scrcpySelectedAgentId, setScrcpySelectedAgentId] = useState<string>(tabletIDEAgents[0]?.id || 'ide-agent-tab-001');
  const [scrcpyFps, setScrcpyFps] = useState<number>(60);
  const [scrcpyBitrate, setScrcpyBitrate] = useState<number>(8);
  const [scrcpyClipboardText, setScrcpyClipboardText] = useState<string>('git clone git@192.168.1.100:sallyhealth/clinical-edge.git');

  // Filtered Agents
  const filteredAgents = tabletIDEAgents.filter(agent => {
    const matchesSearch = 
      agent.deviceName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      agent.ipAddress.includes(searchQuery) ||
      agent.model.toLowerCase().includes(searchQuery.toLowerCase()) ||
      agent.workspace.activeFile?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (agent.assignedPatientName && agent.assignedPatientName.toLowerCase().includes(searchQuery.toLowerCase()));

    const matchesStatus = 
      statusFilter === 'all' ? true :
      statusFilter === 'executing' ? (agent.status === 'executing' || agent.status === 'compiling') :
      statusFilter === 'idle' ? agent.status === 'idle' :
      statusFilter === 'attention' ? (agent.status === 'degraded' || agent.status === 'crashed') : true;

    const matchesEngine = 
      engineFilter === 'all' ? true : agent.engineType === engineFilter;

    return matchesSearch && matchesStatus && matchesEngine;
  });

  const handleRunSweep = async () => {
    setIsSweeping(true);
    await triggerFleetIDESweep();
    setIsSweeping(false);
  };

  const handleApplyTuningToAll = async () => {
    setIsApplyingTuningAll(true);
    await applyAndroid12DaemonTuning('ALL');
    setIsApplyingTuningAll(false);
  };

  const handleExecuteAdb = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!adbCommandInput.trim()) return;
    setIsExecutingAdb(true);
    const cmd = adbCommandInput.trim();
    const output = await runAdbShellCommand(adbSelectedAgentId, cmd);
    setAdbConsoleLogs(prev => [
      {
        id: `adb-${Date.now()}`,
        timestamp: new Date().toLocaleTimeString(),
        cmd,
        output
      },
      ...prev.slice(0, 19)
    ]);
    setIsExecutingAdb(false);
  };

  const handleDispatchBatch = async () => {
    setIsDispatching(true);
    const targets = targetDeviceSelection === 'ALL' 
      ? tabletIDEAgents 
      : tabletIDEAgents.filter(a => a.id === targetDeviceSelection);

    setDispatchResults(targets.map(t => ({
      id: t.id,
      name: t.deviceName,
      status: 'dispatched',
      time: new Date().toLocaleTimeString(),
    })));

    for (const target of targets) {
      await dispatchScriptToTablet(target.id, selectedScriptPreset, scriptPayload);
    }

    await new Promise(r => setTimeout(r, 800));

    setDispatchResults(targets.map(t => ({
      id: t.id,
      name: t.deviceName,
      status: 'success',
      time: new Date().toLocaleTimeString(),
    })));
    setIsDispatching(false);
  };

  const handlePresetSelect = (presetKey: string) => {
    setSelectedScriptPreset(presetKey);
    if (presetKey === 'vitals_integrity.py') {
      setScriptPayload(
`# Clinical Diagnostic Script: Vitals Stream Integrity
import telemetry_sdk

def run_diagnostic():
    print("[INIT] Attaching to local BLE GATT stream on tablet...")
    client = telemetry_sdk.create_client(sample_rate_hz=200)
    samples = client.capture_window(seconds=5)
    print(f"[METRIC] Captured {len(samples)} data points.")
    return True

run_diagnostic()`
      );
    } else if (presetKey === 'ble_latency_probe.ts') {
      setScriptPayload(
`// Node.js Edge Script: BLE Latency & Packet Loss Probe
import { BleAdapter } from '@sally/edge-telemetry';

async function probeLatency() {
  console.log('[PROBE] Measuring BLE 5.3 GATT packet roundtrip on tablet...');
  const results = await BleAdapter.pingGattServer({ packets: 50 });
  console.log(\`[REPORT] Avg RTT: \${results.avgLatencyMs}ms | Loss: \${results.packetLoss}%\`);
}

probeLatency();`
      );
    } else if (presetKey === 'memory_gc_benchmark.py') {
      setScriptPayload(
`# Memory Pressure Benchmark & Compaction Test
import gc, sys, os

print(f"[MEM] Initial allocated on ARM64: {sys.getallocatedblocks()} blocks")
gc.collect()
print("[MEM] Garbage collection successful. Zero circular leaks on tablet.")`
      );
    }
  };

  const selectedScrcpyAgent = tabletIDEAgents.find(a => a.id === scrcpySelectedAgentId) || tabletIDEAgents[0];

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      
      {/* Top Banner: Enterprise Tablet Dev Stations & MDM Central */}
      <div className="relative bg-gradient-to-r from-slate-900 via-slate-900 to-cyan-950/70 border border-slate-800 rounded-2xl p-5 md:p-6 overflow-hidden shadow-xl shadow-cyan-950/20">
        <div className="absolute top-0 right-0 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none -mr-20 -mt-20"></div>
        
        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="flex flex-wrap items-center gap-2.5">
              <div className="p-2 rounded-xl bg-cyan-500/10 border border-cyan-500/30 text-cyan-400">
                <Terminal className="w-5 h-5" />
              </div>
              <h1 className="text-xl md:text-2xl font-bold tracking-tight text-white font-sans">
                Android Tablet Developer Stations & Central IDE Supervisor
              </h1>
              <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/30 text-cyan-300 text-xs font-mono font-bold">
                <Wifi className="w-3.5 h-3.5" />
                <span>WI-FI 6 FLEET</span>
              </div>
              <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-mono font-bold">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping"></span>
                <span>0.0.0.0:8080 CODE-SERVER</span>
              </div>
            </div>
            <p className="text-sm text-slate-300 max-w-4xl leading-relaxed">
              Autonomous central MDM management for Android developer tablets. Runs local code-server terminals on port 8080, keeps master code copies synchronized with external NAS on IP1 Drive, manages SMB 3.1 Solid Explorer mounts, applies Android 12+ ADB phantom process killer fixes, and streams low-latency SCRCPY remote desktop controls directly from your Mac computer.
            </p>
          </div>

          {/* Quick Header Actions */}
          <div className="flex flex-wrap items-center gap-3 shrink-0">
            <button
              id="btn-apply-phantom-fix-all"
              onClick={handleApplyTuningToAll}
              disabled={isApplyingTuningAll}
              className="px-3.5 py-2 rounded-xl bg-purple-950/80 hover:bg-purple-900 text-purple-200 border border-purple-700/60 text-xs font-semibold flex items-center gap-2 transition-all shadow-md shadow-purple-950/40"
              title="Execute ADB fix for max_phantom_processes=2147483647 across all Android 12+ tablets"
            >
              <Zap className={`w-4 h-4 text-purple-400 ${isApplyingTuningAll ? 'animate-spin' : ''}`} />
              <span>{isApplyingTuningAll ? 'Tuning ADB Fleet...' : 'Apply Android 12+ Fix (All)'}</span>
            </button>

            <button
              id="btn-fleet-ide-sweep"
              onClick={handleRunSweep}
              disabled={isSweeping}
              className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-semibold flex items-center gap-2 transition-all"
            >
              <RefreshCw className={`w-4 h-4 text-cyan-400 ${isSweeping ? 'animate-spin' : ''}`} />
              <span>{isSweeping ? 'Auditing Fleet...' : 'Fleet Health Sweep'}</span>
            </button>
          </div>
        </div>

        {/* Live Supervisor Stats Matrix */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-3 mt-6 pt-6 border-t border-slate-800/80">
          <div className="bg-slate-950/60 p-3.5 rounded-xl border border-slate-800">
            <div className="text-[11px] text-slate-400 font-mono uppercase flex items-center justify-between">
              <span>Android Tablets</span>
              <Smartphone className="w-3.5 h-3.5 text-cyan-400" />
            </div>
            <div className="flex items-baseline gap-2 mt-1">
              <span className="text-2xl font-bold font-mono text-white">{tabletIDEAgents.length}</span>
              <span className="text-xs text-emerald-400 font-mono">100% Online</span>
            </div>
            <div className="text-[10px] text-slate-400 mt-1 font-mono">Wi-Fi 6 (802.11ax) • 1201 Mbps</div>
          </div>

          <div className="bg-slate-950/60 p-3.5 rounded-xl border border-slate-800">
            <div className="text-[11px] text-slate-400 font-mono uppercase flex items-center justify-between">
              <span>Local Code Servers</span>
              <Terminal className="w-3.5 h-3.5 text-emerald-400" />
            </div>
            <div className="flex items-baseline gap-2 mt-1">
              <span className="text-2xl font-bold font-mono text-emerald-300">4 / 4</span>
              <span className="text-xs text-emerald-400 font-mono">Port :8080</span>
            </div>
            <div className="text-[10px] text-slate-400 mt-1 font-mono">0.0.0.0 bind • Termux daemon</div>
          </div>

          <div className="bg-slate-950/60 p-3.5 rounded-xl border border-slate-800">
            <div className="text-[11px] text-slate-400 font-mono uppercase flex items-center justify-between">
              <span>NAS & GitLab Sync</span>
              <Database className="w-3.5 h-3.5 text-purple-400" />
            </div>
            <div className="flex items-baseline gap-2 mt-1">
              <span className="text-2xl font-bold font-mono text-purple-300">100%</span>
              <span className="text-xs text-purple-400 font-mono">IP1 Drive</span>
            </div>
            <div className="text-[10px] text-slate-400 mt-1 font-mono">SMB 3.1 + GitLab Master</div>
          </div>

          <div className="bg-slate-950/60 p-3.5 rounded-xl border border-slate-800">
            <div className="text-[11px] text-slate-400 font-mono uppercase flex items-center justify-between">
              <span>Mac Storage Impact</span>
              <Laptop className="w-3.5 h-3.5 text-cyan-400" />
            </div>
            <div className="flex items-baseline gap-2 mt-1">
              <span className="text-2xl font-bold font-mono text-cyan-400">0 MB</span>
              <span className="text-xs text-emerald-400 font-mono">Free</span>
            </div>
            <div className="text-[10px] text-slate-400 mt-1 font-mono">Heavy IDE workload on ARM64</div>
          </div>

          <div className="bg-slate-950/60 p-3.5 rounded-xl border border-slate-800">
            <div className="text-[11px] text-slate-400 font-mono uppercase flex items-center justify-between">
              <span>Android 12+ Daemon Fix</span>
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
            </div>
            <div className="flex items-baseline gap-2 mt-1">
              <span className="text-2xl font-bold font-mono text-emerald-400">Protected</span>
            </div>
            <div className="text-[10px] text-slate-400 mt-1 font-mono">Phantom kill disabled • Wake lock</div>
          </div>
        </div>
      </div>

      {/* Navigation Tabs Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-800 pb-3">
        <div className="flex flex-wrap items-center gap-1.5 bg-slate-900/90 p-1.5 rounded-xl border border-slate-800 text-xs">
          <button
            id="tab-ide-grid"
            onClick={() => setActiveTab('grid')}
            className={`px-3.5 py-2 rounded-lg font-medium transition-all flex items-center gap-2 ${
              activeTab === 'grid'
                ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Smartphone className="w-4 h-4" />
            <span>Tablet Workstations ({tabletIDEAgents.length})</span>
          </button>

          <button
            id="tab-nas-git"
            onClick={() => setActiveTab('nas_git')}
            className={`px-3.5 py-2 rounded-lg font-medium transition-all flex items-center gap-2 ${
              activeTab === 'nas_git'
                ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <FolderGit2 className="w-4 h-4" />
            <span>NAS & GitLab Sync Hub</span>
          </button>

          <button
            id="tab-android12-daemon"
            onClick={() => setActiveTab('android12_daemon')}
            className={`px-3.5 py-2 rounded-lg font-medium transition-all flex items-center gap-2 ${
              activeTab === 'android12_daemon'
                ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Zap className="w-4 h-4" />
            <span>Android 12+ Daemon & ADB</span>
          </button>

          <button
            id="tab-file-manager"
            onClick={() => setActiveTab('file_manager')}
            className={`px-3.5 py-2 rounded-lg font-medium transition-all flex items-center gap-2 ${
              activeTab === 'file_manager'
                ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <FolderOpen className="w-4 h-4" />
            <span>File Manager & SMB Storage</span>
          </button>

          <button
            id="tab-scrcpy"
            onClick={() => setActiveTab('scrcpy')}
            className={`px-3.5 py-2 rounded-lg font-medium transition-all flex items-center gap-2 ${
              activeTab === 'scrcpy'
                ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Monitor className="w-4 h-4" />
            <span>SCRCPY Remote Desktop</span>
          </button>

          <button
            id="tab-ide-events"
            onClick={() => setActiveTab('events')}
            className={`px-3.5 py-2 rounded-lg font-medium transition-all flex items-center gap-2 ${
              activeTab === 'events'
                ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Activity className="w-4 h-4" />
            <span>Watchdog Logs</span>
          </button>

          <button
            id="tab-ide-policies"
            onClick={() => setActiveTab('policies')}
            className={`px-3.5 py-2 rounded-lg font-medium transition-all flex items-center gap-2 ${
              activeTab === 'policies'
                ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Sliders className="w-4 h-4" />
            <span>Supervisor Policies</span>
          </button>

          <button
            id="tab-ide-dispatcher"
            onClick={() => setActiveTab('dispatcher')}
            className={`px-3.5 py-2 rounded-lg font-medium transition-all flex items-center gap-2 ${
              activeTab === 'dispatcher'
                ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Send className="w-4 h-4" />
            <span>Diagnostics</span>
          </button>
        </div>
      </div>

      {/* TAB 1: TABLET WORKSTATIONS GRID */}
      {activeTab === 'grid' && (
        <div className="space-y-4">
          
          {/* Filter Bar */}
          <div className="flex flex-wrap items-center justify-between gap-3 bg-slate-900/70 p-3 rounded-xl border border-slate-800">
            <div className="relative flex-1 min-w-[240px]">
              <Search className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search tablet name, IP, active script, hostname, or patient..."
                className="w-full bg-slate-950 border border-slate-800 rounded-lg pl-9 pr-3 py-1.5 text-xs text-slate-200 placeholder:text-slate-600 focus:outline-none focus:border-cyan-500 font-mono"
              />
            </div>

            <div className="flex items-center gap-2 text-xs">
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="bg-slate-950 border border-slate-800 text-slate-300 rounded-lg px-2.5 py-1.5 text-xs focus:outline-none focus:border-cyan-500 font-mono"
              >
                <option value="all">All States ({tabletIDEAgents.length})</option>
                <option value="executing">Executing / Compiling</option>
                <option value="idle">Idle / Standby</option>
                <option value="attention">Degraded / Memory Alert</option>
              </select>

              <select
                value={engineFilter}
                onChange={(e) => setEngineFilter(e.target.value)}
                className="bg-slate-950 border border-slate-800 text-slate-300 rounded-lg px-2.5 py-1.5 text-xs focus:outline-none focus:border-cyan-500 font-mono"
              >
                <option value="all">All Engines</option>
                <option value="VS Code Embedded Server">VS Code Embedded Server</option>
                <option value="Node.js Edge Script Engine">Node.js Edge Engine</option>
              </select>
            </div>
          </div>

          {/* Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filteredAgents.map(agent => (
              <div
                key={agent.id}
                id={`ide-card-${agent.id}`}
                className="bg-slate-900/90 border border-slate-800 rounded-xl p-5 flex flex-col justify-between hover:border-cyan-500/50 hover:shadow-xl hover:shadow-cyan-950/20 transition-all space-y-4"
              >
                <div>
                  {/* Header */}
                  <div className="flex items-start justify-between gap-3 mb-2">
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="font-bold text-base text-white hover:text-cyan-300 transition-colors">
                          {agent.deviceName}
                        </h3>
                        <span className="px-2 py-0.5 text-[10px] font-mono rounded bg-slate-800 text-slate-300 border border-slate-700">
                          {agent.hostname || `${agent.id}.lan`}
                        </span>
                      </div>
                      <div className="text-xs text-slate-400 font-mono mt-0.5">
                        {agent.model} • {agent.androidVersion} • {agent.site}
                      </div>
                    </div>

                    <span className={`px-2.5 py-1 rounded-full text-xs font-mono font-bold border uppercase shrink-0 ${
                      agent.status === 'executing' 
                        ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40 animate-pulse'
                        : agent.status === 'compiling'
                        ? 'bg-purple-500/20 text-purple-300 border-purple-500/40 animate-pulse'
                        : agent.status === 'degraded'
                        ? 'bg-amber-500/20 text-amber-300 border-amber-500/40'
                        : 'bg-cyan-500/10 text-cyan-400 border-cyan-500/30'
                    }`}>
                      ● {agent.status}
                    </span>
                  </div>

                  {/* Local Code-Server Endpoint Strip */}
                  <div className="bg-slate-950 p-3 rounded-lg border border-cyan-500/20 flex flex-wrap items-center justify-between gap-2 text-xs font-mono mb-3">
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></div>
                      <span className="text-slate-400">Local IDE:</span>
                      <span className="text-cyan-300 font-bold">{agent.codeServerBindAddress}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <a 
                        href={`http://${agent.ipAddress}:${agent.codeServerPort}`} 
                        target="_blank" 
                        rel="noreferrer"
                        className="px-2.5 py-1 bg-cyan-600/20 hover:bg-cyan-600/30 text-cyan-300 border border-cyan-500/40 rounded flex items-center gap-1.5 text-[11px] font-bold"
                        onClick={(e) => {
                          e.preventDefault();
                          setSelectedAgentForModal(agent);
                        }}
                      >
                        <ExternalLink className="w-3 h-3" />
                        <span>Launch Code-Server</span>
                      </a>
                    </div>
                  </div>

                  {/* Status Pills */}
                  <div className="grid grid-cols-2 gap-2 text-xs font-mono mb-3">
                    <div className="bg-slate-950/80 p-2 rounded border border-slate-800">
                      <div className="text-[10px] text-slate-500 uppercase">SMB NAS Storage</div>
                      <div className="text-purple-300 font-semibold truncate flex items-center gap-1 mt-0.5">
                        <FolderOpen className="w-3.5 h-3.5 text-purple-400 shrink-0" />
                        <span>{agent.fileManager?.appName.split(' ')[0] || 'Solid Explorer'}: /sdcard/NAS_Projects</span>
                      </div>
                    </div>

                    <div className="bg-slate-950/80 p-2 rounded border border-slate-800">
                      <div className="text-[10px] text-slate-500 uppercase">GitLab Master Repo</div>
                      <div className="text-cyan-300 font-semibold truncate flex items-center gap-1 mt-0.5">
                        <GitBranch className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
                        <span>{agent.gitStatus?.repoName || 'clinical-edge'} [{agent.gitStatus?.currentBranch || 'main'}]</span>
                      </div>
                    </div>
                  </div>

                  {/* Live Metrics: CPU & Memory on Tablet */}
                  <div className="space-y-2 bg-slate-950/60 p-3 rounded-lg border border-slate-800 text-xs font-mono mb-3">
                    <div>
                      <div className="flex justify-between text-[11px] text-slate-400 mb-1">
                        <span>ARM64 CPU Load (Direct On-Device)</span>
                        <span className="text-white font-bold">{agent.metrics.cpuPercent}%</span>
                      </div>
                      <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden">
                        <div 
                          className={`h-full ${agent.metrics.cpuPercent > 70 ? 'bg-amber-500' : 'bg-cyan-500'}`}
                          style={{ width: `${Math.min(100, agent.metrics.cpuPercent)}%` }}
                        ></div>
                      </div>
                    </div>

                    <div>
                      <div className="flex justify-between text-[11px] text-slate-400 mb-1">
                        <span>RAM Utilization / Ceiling</span>
                        <span className="text-slate-200">
                          {agent.metrics.memoryMb}MB / {agent.metrics.memoryLimitMb}MB ({agent.metrics.heapUsagePercent}%)
                        </span>
                      </div>
                      <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden">
                        <div 
                          className={`h-full ${agent.metrics.heapUsagePercent > 75 ? 'bg-rose-500' : 'bg-purple-500'}`}
                          style={{ width: `${Math.min(100, agent.metrics.heapUsagePercent)}%` }}
                        ></div>
                      </div>
                    </div>
                  </div>

                  {/* Network / Android 12 Indicators */}
                  <div className="flex flex-wrap items-center justify-between text-xs text-slate-400 font-mono bg-slate-950/40 p-2.5 rounded-lg border border-slate-800/80">
                    <div className="flex items-center gap-1.5">
                      <Wifi className="w-3.5 h-3.5 text-cyan-400" />
                      <span>{agent.network?.standard || 'Wi-Fi 6'} ({agent.network?.linkSpeedMbps || 1201} Mbps)</span>
                    </div>

                    <div className="flex items-center gap-2">
                      <span className="px-1.5 py-0.5 rounded text-[10px] bg-emerald-500/10 text-emerald-300 border border-emerald-500/30">
                        ADB Fix Active
                      </span>
                      <span className="px-1.5 py-0.5 rounded text-[10px] bg-cyan-500/10 text-cyan-300 border border-cyan-500/30">
                        Wake-Lock Held
                      </span>
                    </div>
                  </div>
                </div>

                {/* Card Action Buttons */}
                <div className="pt-2 border-t border-slate-800/80 flex flex-wrap items-center gap-2">
                  <button
                    onClick={() => setSelectedAgentForModal(agent)}
                    className="flex-1 px-3 py-2 bg-gradient-to-r from-cyan-600/20 to-cyan-500/20 hover:from-cyan-600/30 hover:to-cyan-500/30 text-cyan-300 border border-cyan-500/40 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1.5"
                  >
                    <Terminal className="w-4 h-4" />
                    <span>Inspect IDE & Terminal</span>
                  </button>

                  <button
                    onClick={() => {
                      setScrcpySelectedAgentId(agent.id);
                      setActiveTab('scrcpy');
                    }}
                    className="px-3 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 rounded-lg text-xs font-semibold transition-all flex items-center gap-1.5"
                    title="Launch SCRCPY screen control session"
                  >
                    <Monitor className="w-4 h-4 text-cyan-400" />
                    <span>SCRCPY</span>
                  </button>

                  <button
                    onClick={() => triggerNasProjectSync(agent.id, 'bidirectional')}
                    className="px-3 py-2 bg-slate-800 hover:bg-slate-700 text-purple-300 border border-slate-700 rounded-lg text-xs font-semibold transition-all flex items-center gap-1.5"
                    title="Sync project folder with master copy on IP1 External Drive"
                  >
                    <RefreshCw className="w-4 h-4 text-purple-400" />
                    <span>Sync NAS</span>
                  </button>

                  <button
                    onClick={() => garbageCollectAgent(agent.id)}
                    className="p-2 bg-slate-800 hover:bg-slate-700 text-amber-400 rounded-lg border border-slate-700 transition-colors"
                    title="Force GC & Clear Cache"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>

                  <button
                    onClick={() => restartIDEAgent(agent.id)}
                    className="p-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg border border-slate-700 transition-colors"
                    title="Restart Local code-server daemon"
                  >
                    <RotateCcw className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>

        </div>
      )}

      {/* TAB 2: NAS & GITLAB PROJECT SYNC HUB */}
      {activeTab === 'nas_git' && (
        <div className="space-y-6">
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 md:p-6 space-y-4">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <h2 className="text-base font-bold text-white flex items-center gap-2">
                  <FolderGit2 className="w-5 h-5 text-purple-400" />
                  Central NAS Master Storage & GitLab Backup Control Plane
                </h2>
                <p className="text-xs text-slate-400 mt-1">
                  Master copies of all edge clinical projects reside on the IP1 External Drive Pool. Tablets maintain local clones, perform heavy compilation independently, and synchronize changes back to the NAS automatically.
                </p>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => tabletIDEAgents.forEach(a => triggerNasProjectSync(a.id, 'bidirectional'))}
                  className="px-4 py-2 bg-purple-600 hover:bg-purple-500 text-white rounded-lg text-xs font-bold flex items-center gap-2 shadow-lg shadow-purple-950/50"
                >
                  <RefreshCw className="w-4 h-4" />
                  <span>Sync All Tablets with NAS</span>
                </button>
              </div>
            </div>

            {/* NAS Config Spec Strip */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-3 pt-2 text-xs font-mono">
              <div className="bg-slate-950 p-3 rounded-lg border border-slate-800">
                <div className="text-slate-500 text-[10px]">Master NAS Share URL</div>
                <div className="text-purple-300 font-bold mt-0.5">smb://192.168.1.100/volume/projects</div>
                <div className="text-slate-500 text-[10px] mt-0.5">Pool: IP1 External Drive</div>
              </div>

              <div className="bg-slate-950 p-3 rounded-lg border border-slate-800">
                <div className="text-slate-500 text-[10px]">GitLab Origin Host</div>
                <div className="text-cyan-300 font-bold mt-0.5">git@192.168.1.100:sallyhealth</div>
                <div className="text-slate-500 text-[10px] mt-0.5">Hosted on NAS Container</div>
              </div>

              <div className="bg-slate-950 p-3 rounded-lg border border-slate-800">
                <div className="text-slate-500 text-[10px]">Mac Controller State</div>
                <div className="text-emerald-400 font-bold mt-0.5">0 MB Disk Used</div>
                <div className="text-slate-500 text-[10px] mt-0.5">Internal storage 100% free</div>
              </div>

              <div className="bg-slate-950 p-3 rounded-lg border border-slate-800">
                <div className="text-slate-500 text-[10px]">Sync Policy</div>
                <div className="text-slate-200 font-bold mt-0.5">Bidirectional / Auto-On-Save</div>
                <div className="text-slate-500 text-[10px] mt-0.5">Conflict: Prefer Tablet</div>
              </div>
            </div>
          </div>

          {/* Per-Tablet NAS & Git Synchronization Table */}
          <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden font-mono text-xs">
            <div className="p-4 bg-slate-950 border-b border-slate-800 flex items-center justify-between">
              <span className="font-bold text-white font-sans text-sm">Tablet Workspace Sync Matrix</span>
              <span className="text-xs text-slate-500">Live Repo & SMB Status</span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead className="bg-slate-950/80 text-slate-400 text-[11px] border-b border-slate-800">
                  <tr>
                    <th className="p-3.5">Tablet Workstation</th>
                    <th className="p-3.5">Active Project & Branch</th>
                    <th className="p-3.5">Last Commit (GitLab)</th>
                    <th className="p-3.5">NAS SMB Mount</th>
                    <th className="p-3.5">Sync Status</th>
                    <th className="p-3.5 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/80">
                  {tabletIDEAgents.map(ag => (
                    <tr key={ag.id} className="hover:bg-slate-950/40 transition-colors">
                      <td className="p-3.5">
                        <div className="font-bold text-white font-sans">{ag.deviceName}</div>
                        <div className="text-[11px] text-slate-500">{ag.ipAddress} • {ag.model}</div>
                      </td>
                      <td className="p-3.5">
                        <div className="text-cyan-300 font-bold">{ag.gitStatus?.repoName || 'clinical-edge'}</div>
                        <div className="text-slate-400 text-[11px]">Branch: {ag.gitStatus?.currentBranch || 'main'}</div>
                      </td>
                      <td className="p-3.5">
                        <div className="text-slate-300 truncate max-w-xs">{ag.gitStatus?.lastCommitMessage || ag.workspace.lastCommit}</div>
                        <div className="text-slate-500 text-[10px]">Hash: {ag.gitStatus?.lastCommitHash || '9c4f102'} ({ag.gitStatus?.lastCommitAuthor || 'Termux'})</div>
                      </td>
                      <td className="p-3.5">
                        <span className="px-2 py-0.5 rounded text-[11px] bg-emerald-500/10 text-emerald-300 border border-emerald-500/30">
                          {ag.fileManager?.mountPoint || '/sdcard/NAS_Projects'}
                        </span>
                      </td>
                      <td className="p-3.5">
                        {ag.nasSync?.isSyncing ? (
                          <span className="px-2 py-0.5 rounded text-[11px] bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 animate-pulse">
                            Syncing...
                          </span>
                        ) : ag.gitStatus?.aheadBy && ag.gitStatus.aheadBy > 0 ? (
                          <span className="px-2 py-0.5 rounded text-[11px] bg-amber-500/20 text-amber-300 border border-amber-500/40">
                            {ag.gitStatus.aheadBy} commit ahead of NAS
                          </span>
                        ) : (
                          <span className="px-2 py-0.5 rounded text-[11px] bg-emerald-500/10 text-emerald-300 border border-emerald-500/30">
                            Synced ({ag.nasSync?.lastSyncTime || 'Just now'})
                          </span>
                        )}
                      </td>
                      <td className="p-3.5 text-right space-x-2">
                        <button
                          onClick={() => triggerGitPullFromNas(ag.id)}
                          className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-cyan-300 border border-slate-700 rounded text-[11px]"
                          title="Git Pull from NAS GitLab"
                        >
                          Pull
                        </button>
                        <button
                          onClick={() => triggerGitPushToNas(ag.id)}
                          className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-purple-300 border border-slate-700 rounded text-[11px]"
                          title="Git Push to NAS GitLab"
                        >
                          Push
                        </button>
                        <button
                          onClick={() => triggerNasProjectSync(ag.id, 'bidirectional')}
                          className="px-2.5 py-1 bg-purple-600/20 hover:bg-purple-600/30 text-purple-300 border border-purple-500/40 rounded text-[11px] font-bold"
                          title="Trigger full SMB rsync"
                        >
                          Rsync NAS
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: ANDROID 12+ DAEMON PERSISTENCE & ADB HUB */}
      {activeTab === 'android12_daemon' && (
        <div className="space-y-6">
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 md:p-6 space-y-4">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <h2 className="text-base font-bold text-white flex items-center gap-2">
                  <Zap className="w-5 h-5 text-purple-400" />
                  Android 12+ Daemon Persistence & ADB Remote Tuning
                </h2>
                <p className="text-xs text-slate-400 mt-1">
                  Android 12 and higher kill background processes when phantom process limits are exceeded. The Central MDM automates ADB tuning commands to permanently disable phantom process killers, prevent CPU sleep via wake locks, and configure boot scripts.
                </p>
              </div>

              <button
                onClick={handleApplyTuningToAll}
                disabled={isApplyingTuningAll}
                className="px-4 py-2 bg-gradient-to-r from-purple-600 to-cyan-600 hover:from-purple-500 hover:to-cyan-500 text-white rounded-lg text-xs font-bold flex items-center gap-2 shadow-lg shadow-purple-950/50"
              >
                <Zap className="w-4 h-4" />
                <span>{isApplyingTuningAll ? 'Applying to Fleet...' : 'Batch Execute ADB Fix (All Tablets)'}</span>
              </button>
            </div>

            {/* ADB Command Reference Box */}
            <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 font-mono text-xs text-slate-300 space-y-2">
              <div className="text-slate-400 font-bold font-sans text-xs">Automated ADB Shell Execution Pipeline:</div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-[11px]">
                <div className="bg-slate-900/80 p-2.5 rounded border border-slate-800">
                  <span className="text-cyan-400">1.</span> adb shell "/system/bin/device_config set_sync_disabled_for_tests persistent"
                </div>
                <div className="bg-slate-900/80 p-2.5 rounded border border-slate-800">
                  <span className="text-cyan-400">2.</span> adb shell "device_config put activity_manager max_phantom_processes 2147483647"
                </div>
                <div className="bg-slate-900/80 p-2.5 rounded border border-slate-800">
                  <span className="text-cyan-400">3.</span> adb shell "settings put global settings_enable_monitor_phantom_procs false"
                </div>
                <div className="bg-slate-900/80 p-2.5 rounded border border-slate-800">
                  <span className="text-cyan-400">4.</span> adb shell "dumpsys deviceidle whitelist +com.termux"
                </div>
              </div>
            </div>
          </div>

          {/* Interactive ADB Remote Console */}
          <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden font-mono text-xs">
            <div className="p-4 bg-slate-950 border-b border-slate-800 flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <Terminal className="w-4 h-4 text-purple-400" />
                <span className="font-bold text-white font-sans text-sm">Interactive Remote ADB Shell</span>
              </div>

              <div className="flex items-center gap-2 text-xs">
                <span className="text-slate-400 font-mono">Target Device:</span>
                <select
                  value={adbSelectedAgentId}
                  onChange={(e) => setAdbSelectedAgentId(e.target.value)}
                  className="bg-slate-900 border border-slate-700 text-cyan-300 rounded px-2.5 py-1 text-xs"
                >
                  {tabletIDEAgents.map(ag => (
                    <option key={ag.id} value={ag.id}>
                      {ag.deviceName} ({ag.ipAddress}:5555)
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Quick Command Buttons */}
            <div className="p-3 bg-slate-950/60 border-b border-slate-800 flex flex-wrap gap-2 text-xs">
              <span className="text-slate-500 text-[11px] self-center mr-1">Quick Presets:</span>
              <button
                onClick={() => setAdbCommandInput('device_config get activity_manager max_phantom_processes')}
                className="px-2.5 py-1 bg-slate-900 hover:bg-slate-800 text-cyan-300 rounded border border-slate-700 text-[11px]"
              >
                Check Phantom Limit
              </button>
              <button
                onClick={() => setAdbCommandInput('dumpsys battery')}
                className="px-2.5 py-1 bg-slate-900 hover:bg-slate-800 text-cyan-300 rounded border border-slate-700 text-[11px]"
              >
                dumpsys battery
              </button>
              <button
                onClick={() => setAdbCommandInput('top -n 1 -b')}
                className="px-2.5 py-1 bg-slate-900 hover:bg-slate-800 text-cyan-300 rounded border border-slate-700 text-[11px]"
              >
                top (processes)
              </button>
              <button
                onClick={() => setAdbCommandInput('pm list packages | grep termux')}
                className="px-2.5 py-1 bg-slate-900 hover:bg-slate-800 text-cyan-300 rounded border border-slate-700 text-[11px]"
              >
                list packages
              </button>
              <button
                onClick={() => setAdbCommandInput('ip addr show wlan0')}
                className="px-2.5 py-1 bg-slate-900 hover:bg-slate-800 text-cyan-300 rounded border border-slate-700 text-[11px]"
              >
                Wi-Fi 6 ip addr
              </button>
            </div>

            {/* ADB Stream Log Output */}
            <div className="p-4 bg-slate-950 min-h-[220px] max-h-[350px] overflow-y-auto space-y-3 font-mono text-[11px]">
              {adbConsoleLogs.map(log => (
                <div key={log.id} className="space-y-1">
                  <div className="text-cyan-400 flex items-center gap-2">
                    <span className="text-slate-600">[{log.timestamp}]</span>
                    <span>adb shell "{log.cmd}"</span>
                  </div>
                  <pre className="text-slate-300 whitespace-pre-wrap bg-slate-900/50 p-2.5 rounded border border-slate-800/80 font-mono">
                    {log.output}
                  </pre>
                </div>
              ))}
            </div>

            {/* Command Form */}
            <form onSubmit={handleExecuteAdb} className="p-3 bg-slate-900 border-t border-slate-800 flex items-center gap-2">
              <span className="text-purple-400 font-bold pl-2 font-mono">adb shell &gt;</span>
              <input
                type="text"
                value={adbCommandInput}
                onChange={(e) => setAdbCommandInput(e.target.value)}
                placeholder="Enter ADB command (e.g. dumpsys deviceidle, top, getprop)..."
                className="flex-1 bg-slate-950 border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-white font-mono placeholder:text-slate-600 focus:outline-none focus:border-cyan-500"
              />
              <button
                type="submit"
                disabled={isExecutingAdb || !adbCommandInput.trim()}
                className="px-4 py-1.5 bg-purple-600 hover:bg-purple-500 text-white rounded-lg text-xs font-bold flex items-center gap-1.5 disabled:opacity-50"
              >
                <Zap className="w-3.5 h-3.5" />
                <span>Send</span>
              </button>
            </form>
          </div>
        </div>
      )}

      {/* TAB 4: FILE MANAGER & SMB STORAGE MANAGER */}
      {activeTab === 'file_manager' && (
        <div className="space-y-6">
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 md:p-6 space-y-4">
            <div>
              <h2 className="text-base font-bold text-white flex items-center gap-2">
                <FolderOpen className="w-5 h-5 text-cyan-400" />
                Tablet File Manager & SMB 3.1 Network Storage Manager
              </h2>
              <p className="text-xs text-slate-400 mt-1">
                Install and configure SMB-enabled document providers on every tablet. Enables engineers to directly browse the external IP1 drive NAS storage pool from Android apps.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
              {[
                {
                  id: 'solid_explorer' as const,
                  name: 'Solid Explorer File Manager',
                  desc: 'Includes full SMB 3.1.1, FTP, and WebDAV plugins. Recommended for high-speed Wi-Fi 6 streaming.',
                  badge: 'Recommended',
                },
                {
                  id: 'cx_file_explorer' as const,
                  name: 'CX File Explorer',
                  desc: 'Lightweight client with built-in CIFS / SMB document provider and cloud sync.',
                  badge: 'Alternative',
                },
                {
                  id: 'documents_ui' as const,
                  name: 'Android DocumentsUI (SAF Provider)',
                  desc: 'Native Storage Access Framework SMB driver for direct Android app binding.',
                  badge: 'Native SAF',
                },
              ].map(fm => (
                <div key={fm.id} className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-3 flex flex-col justify-between">
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-bold text-white text-sm">{fm.name}</span>
                      <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-cyan-500/20 text-cyan-300">
                        {fm.badge}
                      </span>
                    </div>
                    <p className="text-xs text-slate-400 leading-relaxed">{fm.desc}</p>
                  </div>

                  <button
                    onClick={() => {
                      tabletIDEAgents.forEach(a => deployFileManagerToTablet(a.id, fm.id));
                    }}
                    className="w-full py-2 bg-slate-800 hover:bg-slate-700 text-cyan-300 border border-slate-700 rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors"
                  >
                    <Layers className="w-3.5 h-3.5" />
                    <span>Push to All Tablets</span>
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Mount Status by Tablet */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {tabletIDEAgents.map(ag => (
              <div key={ag.id} className="bg-slate-900 border border-slate-800 rounded-xl p-4 space-y-3 font-mono text-xs">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-white font-sans text-sm">{ag.deviceName}</span>
                  <span className="px-2 py-0.5 rounded text-[10px] bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">
                    ● {ag.fileManager?.status?.toUpperCase() || 'MOUNTED'}
                  </span>
                </div>

                <div className="bg-slate-950 p-3 rounded-lg border border-slate-800 space-y-1.5">
                  <div className="flex justify-between">
                    <span className="text-slate-500">File Manager App:</span>
                    <span className="text-cyan-300 font-bold">{ag.fileManager?.appName || 'Solid Explorer'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Mount Point:</span>
                    <span className="text-slate-200">{ag.fileManager?.mountPoint || '/sdcard/NAS_Projects'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">NAS SMB Share:</span>
                    <span className="text-purple-300">{ag.fileManager?.nasShareUrl || 'smb://192.168.1.100/volume/projects'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Storage Pool:</span>
                    <span className="text-slate-300">{ag.fileManager?.nasStorageLabel || 'IP1 External Drive'}</span>
                  </div>
                </div>

                <div className="flex items-center gap-2 pt-1">
                  <button
                    onClick={() => deployFileManagerToTablet(ag.id, 'solid_explorer')}
                    className="flex-1 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded border border-slate-700 text-[11px] font-semibold"
                  >
                    Re-mount SMB Share
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 5: SCRCPY REMOTE DESKTOP & CONTROL */}
      {activeTab === 'scrcpy' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            
            {/* Tablet Stream Canvas & Controls */}
            <div className="lg:col-span-2 bg-slate-900 border border-slate-800 rounded-xl overflow-hidden flex flex-col justify-between">
              <div className="p-4 bg-slate-950 border-b border-slate-800 flex flex-wrap items-center justify-between gap-3">
                <div className="flex items-center gap-2">
                  <Monitor className="w-4 h-4 text-cyan-400" />
                  <span className="font-bold text-white font-sans text-sm">
                    SCRCPY Live Control: {selectedScrcpyAgent.deviceName}
                  </span>
                </div>

                <div className="flex items-center gap-2 text-xs font-mono">
                  <span className="text-emerald-400 font-bold">{scrcpyFps} FPS</span>
                  <span className="text-slate-500">•</span>
                  <span className="text-cyan-300">{scrcpyBitrate} Mbps</span>
                  <span className="text-slate-500">•</span>
                  <span className="text-slate-400">Wi-Fi 6 (12ms RTT)</span>
                </div>
              </div>

              {/* Simulated Live Tablet Screen */}
              <div className="p-6 bg-slate-950 flex items-center justify-center min-h-[420px]">
                <div className="w-[340px] md:w-[480px] aspect-[16/10] bg-slate-900 border-4 border-slate-700 rounded-2xl shadow-2xl relative overflow-hidden flex flex-col justify-between p-3 select-none">
                  {/* Status bar */}
                  <div className="flex justify-between items-center text-[10px] text-slate-400 font-mono px-1">
                    <span>12:04</span>
                    <span className="font-bold text-cyan-400">{selectedScrcpyAgent.hostname}</span>
                    <div className="flex items-center gap-1">
                      <Wifi className="w-3 h-3 text-cyan-400" />
                      <span>100%</span>
                    </div>
                  </div>

                  {/* Tablet Screen Content UI */}
                  <div className="my-auto bg-slate-950 rounded-lg p-3 border border-slate-800 font-mono text-xs text-slate-300 space-y-2">
                    <div className="flex items-center justify-between text-cyan-400 border-b border-slate-800 pb-1 font-bold">
                      <div className="flex items-center gap-1.5">
                        <Terminal className="w-3.5 h-3.5" />
                        <span>code-server [ARM64 local]</span>
                      </div>
                      <span className="text-[10px] text-emerald-400">0.0.0.0:8080</span>
                    </div>
                    <div className="text-[11px] text-slate-400">
                      $ python {selectedScrcpyAgent.workspace.activeFile || 'scripts/vitals_filter.py'}
                    </div>
                    <div className="text-[11px] text-emerald-400 bg-slate-900 p-2 rounded border border-slate-800">
                      [OK] BLE 5.3 GATT Stream active (200 Hz). Zero leaks.
                    </div>
                    <div className="text-[10px] text-slate-500">
                      NAS Mount: /sdcard/NAS_Projects (IP1 Drive)
                    </div>
                  </div>

                  {/* Android Soft Navigation Bar */}
                  <div className="flex justify-around items-center pt-2 border-t border-slate-800 text-slate-400">
                    <button 
                      onClick={() => sendScrcpyKeyAction(selectedScrcpyAgent.id, 'BACK')}
                      className="p-1.5 hover:text-white rounded hover:bg-slate-800"
                      title="Back Key (KEYCODE_BACK)"
                    >
                      ◀
                    </button>
                    <button 
                      onClick={() => sendScrcpyKeyAction(selectedScrcpyAgent.id, 'HOME')}
                      className="p-1.5 hover:text-white rounded hover:bg-slate-800"
                      title="Home Key (KEYCODE_HOME)"
                    >
                      ●
                    </button>
                    <button 
                      onClick={() => sendScrcpyKeyAction(selectedScrcpyAgent.id, 'APP_SWITCH')}
                      className="p-1.5 hover:text-white rounded hover:bg-slate-800"
                      title="Recent Apps (KEYCODE_APP_SWITCH)"
                    >
                      ■
                    </button>
                  </div>
                </div>
              </div>

              {/* Hardware Actions Footer */}
              <div className="p-4 bg-slate-950 border-t border-slate-800 flex flex-wrap items-center justify-between gap-3 text-xs">
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => sendScrcpyKeyAction(selectedScrcpyAgent.id, 'POWER')}
                    className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg flex items-center gap-1.5 font-semibold"
                  >
                    <Power className="w-3.5 h-3.5 text-rose-400" />
                    <span>Power</span>
                  </button>
                  <button
                    onClick={() => sendScrcpyKeyAction(selectedScrcpyAgent.id, 'VOLUME_UP')}
                    className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg flex items-center gap-1.5 font-semibold"
                  >
                    <Volume2 className="w-3.5 h-3.5 text-cyan-400" />
                    <span>Vol +</span>
                  </button>
                  <button
                    onClick={() => sendScrcpyKeyAction(selectedScrcpyAgent.id, 'WAKEUP')}
                    className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg flex items-center gap-1.5 font-semibold"
                  >
                    <Zap className="w-3.5 h-3.5 text-amber-400" />
                    <span>Wake Up</span>
                  </button>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => toggleTermuxWakeLock(selectedScrcpyAgent.id)}
                    className="px-3 py-1.5 bg-cyan-600/20 hover:bg-cyan-600/30 text-cyan-300 border border-cyan-500/40 rounded-lg font-bold flex items-center gap-1.5"
                  >
                    <Key className="w-3.5 h-3.5" />
                    <span>Toggle CPU Wake Lock</span>
                  </button>
                </div>
              </div>
            </div>

            {/* SCRCPY Settings & Target Selector */}
            <div className="space-y-4">
              <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 space-y-4">
                <div className="font-bold text-white text-sm">SCRCPY Stream Config</div>

                <div className="space-y-3 text-xs font-mono">
                  <div>
                    <label className="text-slate-400 text-[11px] block mb-1">Target Tablet</label>
                    <select
                      value={scrcpySelectedAgentId}
                      onChange={(e) => setScrcpySelectedAgentId(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-700 text-white rounded-lg p-2 font-mono"
                    >
                      {tabletIDEAgents.map(ag => (
                        <option key={ag.id} value={ag.id}>
                          {ag.deviceName} ({ag.ipAddress})
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <div className="flex justify-between text-[11px] text-slate-400 mb-1">
                      <span>Max Frame Rate</span>
                      <span className="text-cyan-300">{scrcpyFps} FPS</span>
                    </div>
                    <input
                      type="range"
                      min="30"
                      max="120"
                      step="15"
                      value={scrcpyFps}
                      onChange={(e) => setScrcpyFps(parseInt(e.target.value))}
                      className="w-full accent-cyan-500"
                    />
                  </div>

                  <div>
                    <div className="flex justify-between text-[11px] text-slate-400 mb-1">
                      <span>Video Bitrate</span>
                      <span className="text-cyan-300">{scrcpyBitrate} Mbps</span>
                    </div>
                    <input
                      type="range"
                      min="2"
                      max="16"
                      step="2"
                      value={scrcpyBitrate}
                      onChange={(e) => setScrcpyBitrate(parseInt(e.target.value))}
                      className="w-full accent-cyan-500"
                    />
                  </div>
                </div>

                {/* Clipboard Bridge */}
                <div className="space-y-2 pt-2 border-t border-slate-800">
                  <div className="text-white font-bold text-xs flex items-center gap-1.5">
                    <Keyboard className="w-3.5 h-3.5 text-cyan-400" />
                    <span>Mac-to-Tablet Clipboard Sync</span>
                  </div>
                  <textarea
                    value={scrcpyClipboardText}
                    onChange={(e) => setScrcpyClipboardText(e.target.value)}
                    rows={3}
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2.5 text-xs font-mono text-cyan-300 focus:outline-none focus:border-cyan-500 resize-none"
                    placeholder="Text to paste into tablet..."
                  />
                  <button
                    onClick={() => sendScrcpyKeyAction(selectedScrcpyAgent.id, `PASTE_CLIPBOARD: ${scrcpyClipboardText}`)}
                    className="w-full py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg text-xs font-semibold transition-colors"
                  >
                    Paste to Tablet
                  </button>
                </div>
              </div>
            </div>

          </div>
        </div>
      )}

      {/* TAB 6: WATCHDOG EVENT STREAM */}
      {activeTab === 'events' && (
        <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden font-mono text-xs">
          <div className="p-4 bg-slate-950 border-b border-slate-800 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Activity className="w-4 h-4 text-cyan-400" />
              <span className="font-bold text-white font-sans text-sm">Live Central Watchdog Observation Stream</span>
            </div>
            <div className="text-[11px] text-slate-500">
              Auto-refreshing continuous audit trail
            </div>
          </div>

          <div className="divide-y divide-slate-800/80 max-h-[600px] overflow-y-auto">
            {centralEvents.map(evt => (
              <div key={evt.id} className="p-4 hover:bg-slate-950/50 transition-colors flex items-start gap-3.5">
                <div className={`p-2 rounded-lg shrink-0 mt-0.5 ${
                  evt.severity === 'error' ? 'bg-rose-500/10 text-rose-400 border border-rose-500/30' :
                  evt.severity === 'warning' ? 'bg-amber-500/10 text-amber-400 border border-amber-500/30' :
                  evt.severity === 'success' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30' :
                  'bg-cyan-500/10 text-cyan-400 border border-cyan-500/30'
                }`}>
                  {evt.type === 'memory_throttle' && <HardDrive className="w-4 h-4" />}
                  {evt.type === 'auto_restarted' && <RotateCcw className="w-4 h-4" />}
                  {evt.type === 'script_terminated' && <Square className="w-4 h-4" />}
                  {evt.type === 'health_sweep' && <ShieldCheck className="w-4 h-4" />}
                  {evt.type === 'policy_enforced' && <Shield className="w-4 h-4" />}
                  {evt.type === 'script_dispatched' && <Zap className="w-4 h-4" />}
                  {evt.type === 'phantom_fix_applied' && <Zap className="w-4 h-4" />}
                  {evt.type === 'nas_synced' && <FolderGit2 className="w-4 h-4" />}
                  {evt.type === 'file_manager_mounted' && <FolderOpen className="w-4 h-4" />}
                </div>

                <div className="flex-1 min-w-0 space-y-1">
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-slate-200">{evt.targetDeviceName}</span>
                      <span className="px-1.5 py-0.2 rounded text-[10px] bg-slate-950 border border-slate-800 text-slate-400 uppercase">
                        {evt.type.replace(/_/g, ' ')}
                      </span>
                    </div>
                    <span className="text-[11px] text-slate-500">{evt.timestamp}</span>
                  </div>

                  <p className="text-slate-300 leading-relaxed">{evt.description}</p>
                  {evt.details && (
                    <p className="text-slate-500 text-[11px] leading-normal">{evt.details}</p>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 7: SUPERVISOR POLICIES & THRESHOLDS */}
      {activeTab === 'policies' && (
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 md:p-6 space-y-6">
          <div>
            <h2 className="text-base font-bold text-white flex items-center gap-2">
              <Sliders className="w-5 h-5 text-cyan-400" />
              Central Agent Autonomous Policies & Fleet Constraints
            </h2>
            <p className="text-xs text-slate-400 mt-1">
              Enforce global policies across all tablet development stations and bedside devices.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            
            {/* Rule 1: Continuous Monitoring */}
            <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <div className="font-semibold text-sm text-white">Continuous Watchdog Telemetry Stream</div>
                  <div className="text-xs text-slate-400">Stream telemetry and probe heartbeats in real-time over mTLS.</div>
                </div>
                <input
                  type="checkbox"
                  checked={centralPolicy.continuousMonitoring}
                  onChange={(e) => updateCentralPolicy({ continuousMonitoring: e.target.checked })}
                  className="w-5 h-5 accent-cyan-500 cursor-pointer"
                />
              </div>
            </div>

            {/* Rule 2: Android 12+ Phantom Process Killer Fix */}
            <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <div className="font-semibold text-sm text-white">Enforce Android 12+ Phantom Killer Fix</div>
                  <div className="text-xs text-slate-400">Automatically push max_phantom_processes=2147483647 upon new tablet enrollment.</div>
                </div>
                <input
                  type="checkbox"
                  checked={centralPolicy.enforceAndroid12PhantomProcessFix ?? true}
                  onChange={(e) => updateCentralPolicy({ enforceAndroid12PhantomProcessFix: e.target.checked })}
                  className="w-5 h-5 accent-cyan-500 cursor-pointer"
                />
              </div>
            </div>

            {/* Rule 3: Termux Wake Lock Enforcement */}
            <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <div className="font-semibold text-sm text-white">Enforce Background Termux Wake Lock</div>
                  <div className="text-xs text-slate-400">Prevent tablet CPU deep sleep during compilation and long-running scripts.</div>
                </div>
                <input
                  type="checkbox"
                  checked={centralPolicy.enforceTermuxWakeLock ?? true}
                  onChange={(e) => updateCentralPolicy({ enforceTermuxWakeLock: e.target.checked })}
                  className="w-5 h-5 accent-cyan-500 cursor-pointer"
                />
              </div>
            </div>

            {/* Rule 4: Memory Ceiling */}
            <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-3">
              <div className="flex justify-between items-center">
                <div>
                  <div className="font-semibold text-sm text-white">Memory Throttle Ceiling</div>
                  <div className="text-xs text-slate-400">Trigger forced GC when daemon RAM exceeds threshold.</div>
                </div>
                <span className="font-mono text-cyan-400 font-bold text-sm">{centralPolicy.maxMemoryCeilingMb} MB</span>
              </div>
              <input
                type="range"
                min="200"
                max="800"
                step="25"
                value={centralPolicy.maxMemoryCeilingMb}
                onChange={(e) => updateCentralPolicy({ maxMemoryCeilingMb: parseInt(e.target.value) })}
                className="w-full accent-cyan-500"
              />
            </div>

            {/* Rule 5: Script Timeout */}
            <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-3">
              <div className="flex justify-between items-center">
                <div>
                  <div className="font-semibold text-sm text-white">Rogue Script Execution Timeout</div>
                  <div className="text-xs text-slate-400">Interrupt hung scripts or infinite loops automatically.</div>
                </div>
                <span className="font-mono text-cyan-400 font-bold text-sm">{centralPolicy.autoKillScriptTimeoutSeconds} sec</span>
              </div>
              <input
                type="range"
                min="30"
                max="300"
                step="15"
                value={centralPolicy.autoKillScriptTimeoutSeconds}
                onChange={(e) => updateCentralPolicy({ autoKillScriptTimeoutSeconds: parseInt(e.target.value) })}
                className="w-full accent-cyan-500"
              />
            </div>

            {/* Rule 6: Git Auto-Sync */}
            <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <div className="font-semibold text-sm text-white">Workspace NAS / GitLab Auto-Sync</div>
                  <div className="text-xs text-slate-400">Keep tablet edge scripts synchronized with central master on IP1 drive.</div>
                </div>
                <input
                  type="checkbox"
                  checked={centralPolicy.autoSyncGitOnPush ?? true}
                  onChange={(e) => updateCentralPolicy({ autoSyncGitOnPush: e.target.checked })}
                  className="w-5 h-5 accent-cyan-500 cursor-pointer"
                />
              </div>
            </div>

          </div>
        </div>
      )}

      {/* TAB 8: DIAGNOSTIC SCRIPT DISPATCHER */}
      {activeTab === 'dispatcher' && (
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 md:p-6 space-y-5">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h2 className="text-base font-bold text-white flex items-center gap-2">
                <Send className="w-5 h-5 text-cyan-400" />
                Fleet Diagnostic Script Dispatcher
              </h2>
              <p className="text-xs text-slate-400 mt-1">
                Dispatch edge validation scripts and diagnostic workloads across tablet IDE daemons simultaneously.
              </p>
            </div>

            {/* Preset Selector */}
            <div className="flex items-center gap-2">
              <span className="text-xs text-slate-500 font-mono">Preset:</span>
              <button
                onClick={() => handlePresetSelect('vitals_integrity.py')}
                className={`px-3 py-1.5 rounded-lg text-xs font-mono ${
                  selectedScriptPreset === 'vitals_integrity.py'
                    ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40'
                    : 'bg-slate-950 text-slate-400 border border-slate-800'
                }`}
              >
                vitals_integrity.py
              </button>
              <button
                onClick={() => handlePresetSelect('ble_latency_probe.ts')}
                className={`px-3 py-1.5 rounded-lg text-xs font-mono ${
                  selectedScriptPreset === 'ble_latency_probe.ts'
                    ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40'
                    : 'bg-slate-950 text-slate-400 border border-slate-800'
                }`}
              >
                ble_latency_probe.ts
              </button>
              <button
                onClick={() => handlePresetSelect('memory_gc_benchmark.py')}
                className={`px-3 py-1.5 rounded-lg text-xs font-mono ${
                  selectedScriptPreset === 'memory_gc_benchmark.py'
                    ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40'
                    : 'bg-slate-950 text-slate-400 border border-slate-800'
                }`}
              >
                memory_gc_benchmark.py
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
            
            {/* Script Editor Pane */}
            <div className="lg:col-span-2 space-y-3">
              <div className="flex items-center justify-between text-xs text-slate-400 font-mono">
                <span>Script Payload ({selectedScriptPreset})</span>
                <span>Sandbox Mode: Isolated</span>
              </div>
              <textarea
                value={scriptPayload}
                onChange={(e) => setScriptPayload(e.target.value)}
                rows={12}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl p-4 font-mono text-xs text-cyan-300 focus:outline-none focus:border-cyan-500 leading-relaxed resize-none"
              />
            </div>

            {/* Target Selection & Launch */}
            <div className="space-y-4 bg-slate-950 p-4 rounded-xl border border-slate-800 flex flex-col justify-between">
              <div className="space-y-3">
                <div className="font-semibold text-sm text-white">Target Tablets</div>
                <select
                  value={targetDeviceSelection}
                  onChange={(e) => setTargetDeviceSelection(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 text-slate-200 rounded-lg p-2.5 text-xs font-mono focus:outline-none focus:border-cyan-500"
                >
                  <option value="ALL">All Monitored Tablets ({tabletIDEAgents.length} Tablets)</option>
                  {tabletIDEAgents.map(ag => (
                    <option key={ag.id} value={ag.id}>
                      {ag.deviceName} ({ag.ipAddress})
                    </option>
                  ))}
                </select>

                <div className="text-[11px] text-slate-400 space-y-1 pt-2">
                  <div>• Authenticated over mTLS supervisor socket</div>
                  <div>• Results routed back to central telemetry feed</div>
                  <div>• Mac storage unaffected (100% remote ARM64 run)</div>
                </div>
              </div>

              <button
                onClick={handleDispatchBatch}
                disabled={isDispatching}
                className="w-full py-2.5 rounded-xl bg-gradient-to-r from-cyan-600 to-cyan-500 hover:from-cyan-500 hover:to-cyan-400 text-slate-950 text-xs font-bold transition-all flex items-center justify-center gap-2 shadow-lg shadow-cyan-500/20"
              >
                <Zap className="w-4 h-4" />
                <span>{isDispatching ? 'Dispatching to Tablets...' : 'Dispatch Script Now'}</span>
              </button>
            </div>
          </div>

          {/* Execution Results Matrix */}
          {dispatchResults.length > 0 && (
            <div className="border border-slate-800 rounded-xl overflow-hidden font-mono text-xs mt-4">
              <div className="p-3 bg-slate-950 border-b border-slate-800 font-semibold text-white font-sans text-xs flex items-center justify-between">
                <span>Dispatch Execution Matrix</span>
                <span className="text-emerald-400 text-xs">All Targets Acknowledged</span>
              </div>
              <div className="divide-y divide-slate-800/80 bg-slate-900/50">
                {dispatchResults.map(res => (
                  <div key={res.id} className="p-3 flex items-center justify-between">
                    <span className="text-slate-300 font-semibold">{res.name}</span>
                    <div className="flex items-center gap-2">
                      <span className="text-slate-500">{res.time}</span>
                      <span className="px-2 py-0.5 rounded text-[10px] bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">
                        ✓ {res.status.toUpperCase()}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

        </div>
      )}

      {/* Inspector Deep Dive Modal */}
      {selectedAgentForModal && (
        <IDEAgentInspectorModal
          agent={selectedAgentForModal}
          onClose={() => setSelectedAgentForModal(null)}
        />
      )}

    </div>
  );
};
