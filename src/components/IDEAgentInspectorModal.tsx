import React, { useState } from 'react';
import { 
  X, 
  Terminal, 
  Cpu, 
  HardDrive, 
  RotateCcw, 
  Trash2, 
  Play, 
  Square, 
  GitBranch, 
  Shield, 
  ShieldCheck,
  Activity, 
  Clock, 
  CheckCircle2, 
  AlertTriangle, 
  XCircle, 
  Send, 
  Layers, 
  RefreshCw,
  FolderGit2,
  Sliders,
  Radio,
  FileCode,
  Zap,
  ExternalLink,
  Wifi,
  Database,
  FolderOpen,
  Monitor,
  Power,
  Volume2,
  VolumeX,
  Keyboard,
  Key,
  Smartphone,
  Copy,
  Lock,
  FileText
} from 'lucide-react';
import { TabletIDEAgentRecord } from '../types/ideAgent';
import { useDevices } from '../context/DeviceContext';

interface IDEAgentInspectorModalProps {
  agent: TabletIDEAgentRecord;
  onClose: () => void;
}

export const IDEAgentInspectorModal: React.FC<IDEAgentInspectorModalProps> = ({ agent, onClose }) => {
  const { 
    restartIDEAgent, 
    garbageCollectAgent, 
    terminateAgentScript, 
    dispatchScriptToTablet, 
    updateAgentSandboxPolicy, 
    syncAgentGitRepo, 
    clearAgentLogs,
    addAgentLog,
    triggerNasProjectSync,
    triggerGitPullFromNas,
    triggerGitPushToNas,
    applyAndroid12DaemonTuning,
    toggleTermuxWakeLock,
    deployFileManagerToTablet,
    sendScrcpyKeyAction,
    runAdbShellCommand,
    triggerRemoteWorkspaceWipe,
    updateKioskMode
  } = useDevices();

  const [activeTab, setActiveTab] = useState<
    'ide_terminal' | 'nas_git' | 'adb_daemon' | 'scrcpy' | 'file_manager' | 'security_kiosk' | 'logs'
  >('ide_terminal');

  const [logFilter, setLogFilter] = useState<'all' | 'error' | 'warn' | 'info'>('all');
  const [customCommand, setCustomCommand] = useState<string>('');
  const [isExecutingCommand, setIsExecutingCommand] = useState<boolean>(false);
  const [actionInProgress, setActionInProgress] = useState<string | null>(null);

  // ADB Shell Terminal State
  const [adbCmd, setAdbCmd] = useState<string>('device_config get activity_manager max_phantom_processes');
  const [adbLogs, setAdbLogs] = useState<{ id: string; time: string; cmd: string; output: string }[]>([
    {
      id: 'adb-1',
      time: '12:00:00',
      cmd: 'device_config put activity_manager max_phantom_processes 2147483647',
      output: 'Success: activity_manager/max_phantom_processes set to 2147483647 (Persistent)'
    },
    {
      id: 'adb-2',
      time: '12:01:00',
      cmd: 'termux-wake-lock',
      output: 'Acquired PARTIAL_WAKE_LOCK. CPU deep sleep inhibited.'
    }
  ]);
  const [isExecutingAdb, setIsExecutingAdb] = useState<boolean>(false);

  // SCRCPY Interactive State
  const [scrcpyClipboard, setScrcpyClipboard] = useState<string>('import telemetry_sdk\nclient = telemetry_sdk.create_client()');
  const [activeKioskProfile, setActiveKioskProfile] = useState<'open_dev' | 'multi_app_locked' | 'single_code_server'>('open_dev');

  const filteredLogs = agent.logs.filter(log => {
    if (logFilter === 'all') return true;
    return log.level === logFilter;
  });

  const handleRestart = async () => {
    setActionInProgress('restarting');
    await restartIDEAgent(agent.id);
    setActionInProgress(null);
  };

  const handleGC = async () => {
    setActionInProgress('gc');
    await garbageCollectAgent(agent.id);
    setActionInProgress(null);
  };

  const handleTerminateScript = async () => {
    setActionInProgress('terminate');
    await terminateAgentScript(agent.id);
    setActionInProgress(null);
  };

  const handleExecuteAdb = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!adbCmd.trim()) return;
    setIsExecutingAdb(true);
    const cmd = adbCmd.trim();
    const output = await runAdbShellCommand(agent.id, cmd);
    setAdbLogs(prev => [
      {
        id: `adb-${Date.now()}`,
        time: new Date().toLocaleTimeString(),
        cmd,
        output
      },
      ...prev
    ]);
    setIsExecutingAdb(false);
  };

  const handleExecuteConsole = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!customCommand.trim()) return;

    setIsExecutingCommand(true);
    const cmd = customCommand.trim();
    setCustomCommand('');

    addAgentLog(agent.id, {
      level: 'info',
      source: 'termux-cli',
      message: `$ ${cmd}`,
    });

    await new Promise(r => setTimeout(r, 400));

    if (cmd.includes('python') || cmd.includes('node') || cmd.includes('run')) {
      await dispatchScriptToTablet(agent.id, cmd.replace('python ', '').replace('node ', ''));
    } else if (cmd.includes('sync') || cmd.includes('nas')) {
      await triggerNasProjectSync(agent.id, 'bidirectional');
    } else if (cmd.includes('git pull')) {
      await triggerGitPullFromNas(agent.id);
    } else if (cmd.includes('git push')) {
      await triggerGitPushToNas(agent.id);
    } else if (cmd.includes('mem') || cmd.includes('gc')) {
      await garbageCollectAgent(agent.id);
    } else {
      addAgentLog(agent.id, {
        level: 'info',
        source: 'eval-output',
        message: `[ARM64 Termux OK] ${cmd}: exit_code=0 duration=11ms`,
      });
    }

    setIsExecutingCommand(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 md:p-4 bg-slate-950/85 backdrop-blur-md animate-in fade-in duration-200">
      <div 
        id="ide-agent-inspector-modal"
        className="bg-slate-900 border border-slate-700/90 rounded-2xl w-full max-w-6xl h-[92vh] flex flex-col shadow-2xl shadow-cyan-950/60 overflow-hidden text-slate-100"
      >
        
        {/* Header */}
        <div className="p-4 md:px-6 border-b border-slate-800 flex flex-wrap items-center justify-between bg-slate-950/80 shrink-0 gap-3">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-cyan-500/10 border border-cyan-500/30 text-cyan-400">
              <Terminal className="w-5 h-5" />
            </div>
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <h2 className="text-lg font-bold tracking-tight text-white">{agent.deviceName}</h2>
                <span className="px-2 py-0.5 text-xs font-mono rounded bg-slate-800 text-cyan-300 border border-slate-700">
                  {agent.codeServerBindAddress}
                </span>
                <span className={`px-2 py-0.5 text-xs font-mono font-bold rounded border uppercase ${
                  agent.status === 'executing' 
                    ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40 animate-pulse'
                    : agent.status === 'degraded'
                    ? 'bg-amber-500/20 text-amber-300 border-amber-500/40'
                    : agent.status === 'crashed'
                    ? 'bg-rose-500/20 text-rose-300 border-rose-500/40'
                    : 'bg-cyan-500/20 text-cyan-300 border-cyan-500/40'
                }`}>
                  ● {agent.status}
                </span>
              </div>
              <p className="text-xs text-slate-400 font-mono mt-0.5">
                Model: <span className="text-slate-300">{agent.model}</span> ({agent.androidVersion}) • IP: <span className="text-cyan-300">{agent.ipAddress}</span> • PID: <span className="text-slate-300">{agent.metrics.pid}</span> • Uptime: <span className="text-slate-300">{agent.uptime}</span>
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <a
              href={`http://${agent.ipAddress}:${agent.codeServerPort}`}
              target="_blank"
              rel="noreferrer"
              className="px-3 py-1.5 bg-gradient-to-r from-cyan-600 to-cyan-500 hover:from-cyan-500 hover:to-cyan-400 text-slate-950 text-xs font-bold rounded-lg flex items-center gap-1.5 shadow-md shadow-cyan-500/20"
            >
              <ExternalLink className="w-3.5 h-3.5" />
              <span>Open Local VS Code</span>
            </a>

            <button
              id="close-ide-inspector-btn"
              onClick={onClose}
              className="p-2 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Real-time Status Metric Strip */}
        <div className="px-6 py-2.5 bg-slate-950/40 border-b border-slate-800/80 grid grid-cols-2 md:grid-cols-6 gap-3 shrink-0 text-xs">
          <div className="flex items-center gap-2">
            <Cpu className="w-4 h-4 text-cyan-400 shrink-0" />
            <div>
              <div className="text-[10px] text-slate-500 uppercase font-mono">CPU (ARM64)</div>
              <div className="font-bold text-slate-200 font-mono">{agent.metrics.cpuPercent}%</div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <HardDrive className="w-4 h-4 text-purple-400 shrink-0" />
            <div>
              <div className="text-[10px] text-slate-500 uppercase font-mono">RAM / Limit</div>
              <div className="font-bold text-slate-200 font-mono">{agent.metrics.memoryMb}MB ({agent.metrics.heapUsagePercent}%)</div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Wifi className="w-4 h-4 text-cyan-400 shrink-0" />
            <div>
              <div className="text-[10px] text-slate-500 uppercase font-mono">Wi-Fi 6 Link</div>
              <div className="font-bold text-slate-200 font-mono">{agent.network?.linkSpeedMbps || 1201} Mbps</div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Database className="w-4 h-4 text-emerald-400 shrink-0" />
            <div>
              <div className="text-[10px] text-slate-500 uppercase font-mono">NAS SMB Mount</div>
              <div className="font-bold text-emerald-400 font-mono">Mounted (IP1)</div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Zap className="w-4 h-4 text-amber-400 shrink-0" />
            <div>
              <div className="text-[10px] text-slate-500 uppercase font-mono">Phantom Fix</div>
              <div className="font-bold text-amber-300 font-mono">2147483647</div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-cyan-400 shrink-0" />
            <div>
              <div className="text-[10px] text-slate-500 uppercase font-mono">Health Score</div>
              <div className="font-bold text-cyan-300 font-mono">{agent.healthScore}%</div>
            </div>
          </div>
        </div>

        {/* Modal Navigation Tabs */}
        <div className="px-6 py-2 bg-slate-900 border-b border-slate-800 flex flex-wrap items-center justify-between gap-2 shrink-0">
          <div className="flex flex-wrap items-center gap-1 bg-slate-950/80 p-1 rounded-xl border border-slate-800 text-xs">
            <button
              onClick={() => setActiveTab('ide_terminal')}
              className={`px-3 py-1.5 rounded-lg font-medium transition-all flex items-center gap-1.5 ${
                activeTab === 'ide_terminal' ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Terminal className="w-3.5 h-3.5" />
              <span>VS Code & Terminal</span>
            </button>

            <button
              onClick={() => setActiveTab('nas_git')}
              className={`px-3 py-1.5 rounded-lg font-medium transition-all flex items-center gap-1.5 ${
                activeTab === 'nas_git' ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <FolderGit2 className="w-3.5 h-3.5" />
              <span>NAS & GitLab Sync</span>
            </button>

            <button
              onClick={() => setActiveTab('adb_daemon')}
              className={`px-3 py-1.5 rounded-lg font-medium transition-all flex items-center gap-1.5 ${
                activeTab === 'adb_daemon' ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Zap className="w-3.5 h-3.5" />
              <span>Android 12+ ADB Shell</span>
            </button>

            <button
              onClick={() => setActiveTab('scrcpy')}
              className={`px-3 py-1.5 rounded-lg font-medium transition-all flex items-center gap-1.5 ${
                activeTab === 'scrcpy' ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Monitor className="w-3.5 h-3.5" />
              <span>SCRCPY Screen</span>
            </button>

            <button
              onClick={() => setActiveTab('file_manager')}
              className={`px-3 py-1.5 rounded-lg font-medium transition-all flex items-center gap-1.5 ${
                activeTab === 'file_manager' ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <FolderOpen className="w-3.5 h-3.5" />
              <span>SMB File Manager</span>
            </button>

            <button
              onClick={() => setActiveTab('security_kiosk')}
              className={`px-3 py-1.5 rounded-lg font-medium transition-all flex items-center gap-1.5 ${
                activeTab === 'security_kiosk' ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Shield className="w-3.5 h-3.5" />
              <span>Kiosk & Remote Wipe</span>
            </button>

            <button
              onClick={() => setActiveTab('logs')}
              className={`px-3 py-1.5 rounded-lg font-medium transition-all flex items-center gap-1.5 ${
                activeTab === 'logs' ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Activity className="w-3.5 h-3.5" />
              <span>Structured Logs</span>
            </button>
          </div>

          {/* Quick Controls */}
          <div className="flex items-center gap-2">
            {agent.metrics.activeScript && (
              <button
                onClick={handleTerminateScript}
                disabled={actionInProgress !== null}
                className="px-2.5 py-1 rounded-lg bg-rose-500/20 text-rose-300 border border-rose-500/30 text-xs font-semibold hover:bg-rose-500/30 transition-all flex items-center gap-1.5"
              >
                <Square className="w-3.5 h-3.5 fill-rose-300" />
                Stop Script
              </button>
            )}

            <button
              onClick={handleGC}
              disabled={actionInProgress !== null}
              className="px-2.5 py-1 rounded-lg bg-slate-800 text-amber-300 border border-slate-700 hover:bg-slate-700 text-xs font-semibold transition-all flex items-center gap-1"
              title="Purge V8/Python heap caches"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>GC</span>
            </button>

            <button
              onClick={handleRestart}
              disabled={actionInProgress !== null}
              className="px-3 py-1 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-slate-950 text-xs font-bold transition-all flex items-center gap-1"
            >
              <RotateCcw className={`w-3.5 h-3.5 ${actionInProgress === 'restarting' ? 'animate-spin' : ''}`} />
              <span>Restart Daemon</span>
            </button>
          </div>
        </div>

        {/* Modal Content Body */}
        <div className="flex-1 overflow-hidden p-4 md:p-6 bg-slate-950 flex flex-col min-h-0">
          
          {/* TAB 1: VS CODE & TERMINAL RUNTIME */}
          {activeTab === 'ide_terminal' && (
            <div className="flex-1 flex flex-col min-h-0 space-y-4 overflow-y-auto">
              
              {/* Local Code Server Banner */}
              <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 flex flex-wrap items-center justify-between gap-3">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-white text-sm">Local Code-Server Daemon (ARM64)</span>
                    <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">
                      RUNNING on 0.0.0.0:8080
                    </span>
                  </div>
                  <div className="text-xs text-slate-400 font-mono">
                    Workspace Root: <span className="text-cyan-300">{agent.workspace.rootPath}</span> • Active File: <span className="text-slate-200">{agent.workspace.activeFile || 'scripts/vitals_stream.py'}</span>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => dispatchScriptToTablet(agent.id, 'scripts/vitals_stream.py')}
                    className="px-3 py-1.5 bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-300 border border-emerald-500/40 rounded-lg text-xs font-semibold flex items-center gap-1.5"
                  >
                    <Play className="w-3.5 h-3.5 fill-emerald-300" />
                    <span>Run Active File</span>
                  </button>
                </div>
              </div>

              {/* Simulated Embedded Code Server View */}
              <div className="flex-1 min-h-[300px] bg-slate-950 border border-slate-800 rounded-xl overflow-hidden flex flex-col font-mono text-xs">
                {/* Editor Header Bar */}
                <div className="px-4 py-2 bg-slate-900 border-b border-slate-800 flex items-center justify-between text-slate-400">
                  <div className="flex items-center gap-2">
                    <FileCode className="w-4 h-4 text-cyan-400" />
                    <span className="text-white font-bold">{agent.workspace.activeFile || 'clinical_anomaly_detector.py'}</span>
                    <span className="text-[10px] text-slate-500">(ARM64 Python 3.11 Local Interpreter)</span>
                  </div>
                  <span className="text-[11px] text-emerald-400">● Auto-Saved to /sdcard/NAS_Projects</span>
                </div>

                {/* Code Body Area */}
                <div className="p-4 bg-slate-950 text-slate-300 space-y-1 overflow-y-auto max-h-56 leading-relaxed select-text">
                  <div className="text-slate-500"># Sally Clinical Edge Telemetry Collector - ARM64 Tablet Execution</div>
                  <div><span className="text-purple-400">import</span> <span className="text-cyan-300">telemetry_sdk</span></div>
                  <div><span className="text-purple-400">import</span> <span className="text-cyan-300">numpy</span> <span className="text-purple-400">as</span> <span className="text-cyan-300">np</span></div>
                  <br />
                  <div><span className="text-blue-400">def</span> <span className="text-amber-300">process_gatt_ecg_stream</span>(raw_buffer):</div>
                  <div className="pl-4">client = telemetry_sdk.<span className="text-amber-300">create_client</span>(sample_rate_hz=<span className="text-emerald-300">200</span>)</div>
                  <div className="pl-4">filtered = np.<span className="text-amber-300">convolve</span>(raw_buffer, np.ones(<span className="text-emerald-300">5</span>)/<span className="text-emerald-300">5</span>, mode=<span className="text-emerald-300">'same'</span>)</div>
                  <div className="pl-4"><span className="text-purple-400">print</span>(<span className="text-emerald-300">f"[OK] Streamed &#123;len(filtered)&#125; points to local code-server runtime."</span>)</div>
                  <div className="pl-4"><span className="text-purple-400">return</span> filtered</div>
                </div>

                {/* Interactive CLI Evaluator Form */}
                <form onSubmit={handleExecuteConsole} className="p-3 bg-slate-900 border-t border-slate-800 flex items-center gap-2">
                  <span className="text-cyan-400 font-bold pl-2 font-mono">termux $</span>
                  <input
                    type="text"
                    value={customCommand}
                    onChange={(e) => setCustomCommand(e.target.value)}
                    placeholder="Enter command on tablet (e.g. python script.py, git status, git pull, npm test)..."
                    className="flex-1 bg-slate-950 border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-white font-mono placeholder:text-slate-600 focus:outline-none focus:border-cyan-500"
                  />
                  <button
                    type="submit"
                    disabled={isExecutingCommand || !customCommand.trim()}
                    className="px-4 py-1.5 rounded-lg bg-cyan-600 hover:bg-cyan-500 disabled:opacity-50 text-slate-950 font-bold text-xs flex items-center gap-1.5"
                  >
                    <Send className="w-3.5 h-3.5" />
                    Execute
                  </button>
                </form>
              </div>

            </div>
          )}

          {/* TAB 2: NAS & GITLAB REPO SYNC */}
          {activeTab === 'nas_git' && (
            <div className="space-y-4 overflow-y-auto">
              <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-4">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <h3 className="font-bold text-white text-sm flex items-center gap-2">
                      <FolderGit2 className="w-4 h-4 text-purple-400" />
                      NAS Project Master Storage & GitLab Sync
                    </h3>
                    <p className="text-xs text-slate-400 mt-0.5">
                      All files live on the IP1 External Drive. This tablet syncs bidirectionally on save.
                    </p>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => triggerGitPullFromNas(agent.id)}
                      className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-cyan-300 border border-slate-700 rounded-lg text-xs font-mono font-bold"
                    >
                      Git Pull
                    </button>
                    <button
                      onClick={() => triggerGitPushToNas(agent.id)}
                      className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-purple-300 border border-slate-700 rounded-lg text-xs font-mono font-bold"
                    >
                      Git Push
                    </button>
                    <button
                      onClick={() => triggerNasProjectSync(agent.id, 'bidirectional')}
                      className="px-3 py-1.5 bg-purple-600 hover:bg-purple-500 text-white rounded-lg text-xs font-bold shadow-sm"
                    >
                      Full SMB Sync
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs font-mono">
                  <div className="bg-slate-950 p-3 rounded-lg border border-slate-800">
                    <div className="text-slate-500 text-[10px]">Master NAS Path</div>
                    <div className="text-purple-300 font-bold mt-0.5">smb://192.168.1.100/volume/projects/sally-edge</div>
                  </div>
                  <div className="bg-slate-950 p-3 rounded-lg border border-slate-800">
                    <div className="text-slate-500 text-[10px]">Local Tablet Clone Path</div>
                    <div className="text-cyan-300 font-bold mt-0.5">{agent.workspace.rootPath}</div>
                  </div>
                  <div className="bg-slate-950 p-3 rounded-lg border border-slate-800">
                    <div className="text-slate-500 text-[10px]">GitLab Branch & State</div>
                    <div className="text-emerald-400 font-bold mt-0.5">{agent.gitStatus?.currentBranch || 'main'} (Synced)</div>
                  </div>
                </div>
              </div>

              {/* Commit Details Card */}
              <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 font-mono text-xs space-y-2">
                <div className="text-slate-400 font-bold">Latest Commit Record:</div>
                <div className="bg-slate-950 p-3 rounded border border-slate-800 text-slate-300 space-y-1">
                  <div><strong>Message:</strong> {agent.gitStatus?.lastCommitMessage || agent.workspace.lastCommit}</div>
                  <div className="text-slate-400"><strong>Hash:</strong> {agent.gitStatus?.lastCommitHash || '9c4f102'} | <strong>Author:</strong> {agent.gitStatus?.lastCommitAuthor || 'Tablet Dev Station'}</div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: ANDROID 12+ ADB SHELL TERMINAL */}
          {activeTab === 'adb_daemon' && (
            <div className="space-y-4 flex-1 flex flex-col min-h-0 overflow-y-auto">
              <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 space-y-3">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <h3 className="font-bold text-white text-sm flex items-center gap-2">
                      <Zap className="w-4 h-4 text-purple-400" />
                      ADB Daemon Persistence Commands
                    </h3>
                    <p className="text-xs text-slate-400">
                      Eliminate Android 12+ background process kills for Termux & code-server.
                    </p>
                  </div>

                  <button
                    onClick={() => applyAndroid12DaemonTuning(agent.id)}
                    className="px-3 py-1.5 bg-gradient-to-r from-purple-600 to-cyan-600 hover:from-purple-500 hover:to-cyan-500 text-white rounded-lg text-xs font-bold"
                  >
                    Re-Apply Android 12 Fix
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-2 text-xs font-mono">
                  <div className="bg-slate-950 p-2.5 rounded border border-slate-800">
                    <span className="text-slate-500 text-[10px] block">max_phantom_processes:</span>
                    <span className="text-emerald-400 font-bold">2147483647 (Disabled)</span>
                  </div>
                  <div className="bg-slate-950 p-2.5 rounded border border-slate-800">
                    <span className="text-slate-500 text-[10px] block">CPU Wake Lock:</span>
                    <span className="text-cyan-300 font-bold">{agent.daemonTuning?.termuxWakeLockHeld ? 'Active (Held)' : 'Released'}</span>
                  </div>
                  <div className="bg-slate-950 p-2.5 rounded border border-slate-800">
                    <span className="text-slate-500 text-[10px] block">Boot Script:</span>
                    <span className="text-slate-200 font-bold">{agent.daemonTuning?.bootStartupScript || '~/.termux/boot/start-code-server.sh'}</span>
                  </div>
                </div>
              </div>

              {/* Interactive ADB Console */}
              <div className="flex-1 min-h-[260px] bg-slate-950 border border-slate-800 rounded-xl overflow-hidden flex flex-col font-mono text-xs">
                <div className="p-3 bg-slate-900 border-b border-slate-800 flex items-center justify-between text-slate-400">
                  <span>Remote ADB Console ({agent.ipAddress}:5555)</span>
                  <span className="text-emerald-400">● Connected over Wi-Fi 6</span>
                </div>

                <div className="flex-1 p-4 space-y-2 overflow-y-auto max-h-52">
                  {adbLogs.map(l => (
                    <div key={l.id} className="space-y-0.5">
                      <div className="text-cyan-400">[{l.time}] $ adb shell "{l.cmd}"</div>
                      <div className="text-slate-300 bg-slate-900/50 p-2 rounded border border-slate-800/80 whitespace-pre-wrap">{l.output}</div>
                    </div>
                  ))}
                </div>

                <form onSubmit={handleExecuteAdb} className="p-3 bg-slate-900 border-t border-slate-800 flex items-center gap-2">
                  <span className="text-purple-400 font-bold font-mono pl-2">adb &gt;</span>
                  <input
                    type="text"
                    value={adbCmd}
                    onChange={(e) => setAdbCmd(e.target.value)}
                    placeholder="Enter ADB command (e.g. dumpsys battery, getprop, top)..."
                    className="flex-1 bg-slate-950 border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-white font-mono placeholder:text-slate-600 focus:outline-none focus:border-cyan-500"
                  />
                  <button
                    type="submit"
                    disabled={isExecutingAdb || !adbCmd.trim()}
                    className="px-4 py-1.5 bg-purple-600 hover:bg-purple-500 text-white rounded-lg text-xs font-bold"
                  >
                    Run
                  </button>
                </form>
              </div>
            </div>
          )}

          {/* TAB 4: SCRCPY REMOTE DESKTOP */}
          {activeTab === 'scrcpy' && (
            <div className="space-y-4 overflow-y-auto">
              <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 flex items-center justify-between">
                <div>
                  <h3 className="font-bold text-white text-sm flex items-center gap-2">
                    <Monitor className="w-4 h-4 text-cyan-400" />
                    SCRCPY Stream & Hardware Controls
                  </h3>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Live interactive display stream rendered over high-speed Wi-Fi 6.
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => sendScrcpyKeyAction(agent.id, 'POWER')}
                    className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg text-xs font-semibold flex items-center gap-1.5"
                  >
                    <Power className="w-3.5 h-3.5 text-rose-400" />
                    <span>Power</span>
                  </button>
                  <button
                    onClick={() => sendScrcpyKeyAction(agent.id, 'WAKEUP')}
                    className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg text-xs font-semibold flex items-center gap-1.5"
                  >
                    <Zap className="w-3.5 h-3.5 text-amber-400" />
                    <span>Wake Up</span>
                  </button>
                </div>
              </div>

              {/* Tablet Canvas Simulator */}
              <div className="bg-slate-950 p-6 rounded-xl border border-slate-800 flex justify-center">
                <div className="w-[320px] md:w-[460px] aspect-[16/10] bg-slate-900 border-4 border-slate-700 rounded-2xl shadow-xl p-3 flex flex-col justify-between select-none">
                  <div className="flex justify-between items-center text-[10px] text-slate-400 font-mono">
                    <span>12:04</span>
                    <span className="text-cyan-400 font-bold">{agent.hostname}</span>
                    <span>Wi-Fi 6 (100%)</span>
                  </div>

                  <div className="bg-slate-950 p-3 rounded-lg border border-slate-800 font-mono text-xs text-slate-300 space-y-1.5 my-auto">
                    <div className="text-emerald-400 font-bold">code-server :8080 (Listening)</div>
                    <div className="text-slate-400 text-[11px]">$ python scripts/vitals_stream.py</div>
                    <div className="text-cyan-300 text-[11px]">[OK] BLE 5.3 GATT Stream active (200 Hz). Zero leaks.</div>
                  </div>

                  <div className="flex justify-around items-center pt-2 border-t border-slate-800 text-slate-400 text-sm">
                    <button onClick={() => sendScrcpyKeyAction(agent.id, 'BACK')} className="hover:text-white">◀</button>
                    <button onClick={() => sendScrcpyKeyAction(agent.id, 'HOME')} className="hover:text-white">●</button>
                    <button onClick={() => sendScrcpyKeyAction(agent.id, 'APP_SWITCH')} className="hover:text-white">■</button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 5: FILE MANAGER & SMB STORAGE */}
          {activeTab === 'file_manager' && (
            <div className="space-y-4 overflow-y-auto">
              <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="font-bold text-white text-sm flex items-center gap-2">
                    <FolderOpen className="w-4 h-4 text-cyan-400" />
                    File Manager & SMB 3.1 Network Mount
                  </h3>
                  <button
                    onClick={() => deployFileManagerToTablet(agent.id, 'solid_explorer')}
                    className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-cyan-300 border border-slate-700 rounded-lg text-xs font-bold"
                  >
                    Re-deploy Solid Explorer
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs font-mono">
                  <div className="bg-slate-950 p-3 rounded-lg border border-slate-800">
                    <div className="text-slate-500 text-[10px]">Configured App</div>
                    <div className="text-white font-bold mt-0.5">{agent.fileManager?.appName || 'Solid Explorer'}</div>
                  </div>
                  <div className="bg-slate-950 p-3 rounded-lg border border-slate-800">
                    <div className="text-slate-500 text-[10px]">Local Mount Point</div>
                    <div className="text-cyan-300 font-bold mt-0.5">{agent.fileManager?.mountPoint || '/sdcard/NAS_Projects'}</div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 6: SECURITY, KIOSK & REMOTE WIPE */}
          {activeTab === 'security_kiosk' && (
            <div className="space-y-4 overflow-y-auto">
              <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-4">
                <h3 className="font-bold text-white text-sm flex items-center gap-2">
                  <Lock className="w-4 h-4 text-amber-400" />
                  Kiosk Mode & Workspace Lockdown
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  {[
                    { id: 'open_dev' as const, name: 'Open Developer Mode', desc: 'Allows free access to Termux, code-server, file managers, and terminal.' },
                    { id: 'multi_app_locked' as const, name: 'Multi-App Kiosk Lock', desc: 'Restricts tablet exclusively to code-server browser and Solid Explorer.' },
                    { id: 'single_code_server' as const, name: 'Single-App Kiosk (VS Code)', desc: 'Locks device to full-screen code-server with hardware key suppression.' },
                  ].map(k => (
                    <div
                      key={k.id}
                      onClick={() => {
                        setActiveKioskProfile(k.id);
                        updateKioskMode(
                          agent.id, 
                          k.id === 'open_dev' ? 'unrestricted' : k.id === 'single_code_server' ? 'developer_terminal_only' : 'multi_app_dev'
                        );
                      }}
                      className={`p-3.5 rounded-xl border cursor-pointer transition-all ${
                        activeKioskProfile === k.id
                          ? 'bg-cyan-950/50 border-cyan-500 text-white'
                          : 'bg-slate-950 border-slate-800 text-slate-300 hover:border-slate-700'
                      }`}
                    >
                      <div className="font-bold text-xs mb-1">{k.name}</div>
                      <div className="text-[11px] text-slate-400 leading-relaxed">{k.desc}</div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Enterprise Remote Wipe Box */}
              <div className="bg-rose-950/20 border border-rose-500/30 rounded-xl p-5 space-y-3">
                <div className="flex items-center gap-2 text-rose-300 font-bold text-sm">
                  <Trash2 className="w-4 h-4 text-rose-400" />
                  Enterprise Workspace Remote Wipe
                </div>
                <p className="text-xs text-slate-300 leading-relaxed">
                  Sanitizes local Termux repositories, credentials, SSH keys, and the `/data/data/com.termux/files/home/workspace` directory immediately over MDM, while preserving the Android OS and device enrollment.
                </p>
                <div className="flex items-center gap-3 pt-1">
                  <button
                    onClick={() => triggerRemoteWorkspaceWipe(agent.id, 'workspace_only')}
                    className="px-4 py-2 bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold rounded-lg shadow-sm"
                  >
                    Wipe Workspace & Keys (Safe)
                  </button>
                  <button
                    onClick={() => triggerRemoteWorkspaceWipe(agent.id, 'factory_reset')}
                    className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-rose-400 border border-rose-500/40 text-xs font-bold rounded-lg"
                  >
                    Full Factory Device Reset
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* TAB 7: STRUCTURED LOGS */}
          {activeTab === 'logs' && (
            <div className="flex-1 flex flex-col min-h-0 bg-slate-950 border border-slate-800 rounded-xl overflow-hidden font-mono text-xs">
              <div className="px-4 py-2 bg-slate-900 border-b border-slate-800 flex items-center justify-between text-slate-400">
                <span>Real-Time Daemon Stream</span>
                <button onClick={() => clearAgentLogs(agent.id)} className="text-xs text-slate-400 hover:text-white">Clear</button>
              </div>

              <div className="flex-1 p-4 space-y-1.5 overflow-y-auto select-text text-[11px]">
                {filteredLogs.map(l => (
                  <div key={l.id} className="flex items-start gap-2">
                    <span className="text-slate-600">[{l.timestamp}]</span>
                    <span className={`px-1 rounded text-[9px] font-bold uppercase ${
                      l.level === 'error' ? 'bg-rose-500/20 text-rose-300' :
                      l.level === 'warn' ? 'bg-amber-500/20 text-amber-300' :
                      'bg-cyan-500/10 text-cyan-400'
                    }`}>
                      {l.level}
                    </span>
                    <span className="text-slate-500">[{l.source}]</span>
                    <span className="text-slate-300">{l.message}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

        </div>

      </div>
    </div>
  );
};
