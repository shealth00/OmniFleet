export type IDEAgentStatus = 
  | 'active' 
  | 'idle' 
  | 'executing' 
  | 'compiling' 
  | 'degraded' 
  | 'crashed' 
  | 'offline' 
  | 'restarting' 
  | 'quarantined';

export type IDEAgentEngine = 
  | 'Python Clinical Sandbox' 
  | 'Node.js Edge Script Engine' 
  | 'VS Code Embedded Server' 
  | 'Theia Health Micro-IDE' 
  | 'WASM Script Daemon';

export interface IDEAgentLog {
  id: string;
  timestamp: string;
  level: 'info' | 'warn' | 'error' | 'debug';
  message: string;
  source: string;
  details?: string;
}

export interface IDEAgentMetrics {
  cpuPercent: number;
  memoryMb: number;
  memoryLimitMb: number;
  heapUsagePercent: number;
  activeThreads: number;
  activeSessions: number;
  activeScript?: string;
  activeScriptLine?: number;
  executionDurationSeconds?: number;
  rpcLatencyMs: number;
  lastHeartbeat: string;
  heartbeatMissedCount: number;
  port: number;
  pid: number;
}

export interface IDEAgentWorkspace {
  rootPath: string;
  repoUrl: string;
  branch: string;
  lastCommit: string;
  dirtyFiles: string[];
  activeFile: string;
  installedPackages: string[];
  envVars: Record<string, string>;
}

export interface AndroidDaemonTuning {
  phantomProcessFixApplied: boolean;
  maxPhantomProcesses: number;
  syncDisabledForTests: boolean;
  wakeLockAcquired: boolean;
  termuxBootInstalled: boolean;
  bootScriptPath: string;
  batteryOptimizationsIgnored: boolean;
  adbPort: number; // 5555
  lastAdbOptimizationTimestamp?: string;
}

export interface TabletFileManagerConfig {
  appType: 'solid_explorer' | 'cx_file_explorer' | 'total_commander' | 'documents_ui' | 'none';
  appName: string;
  version: string;
  smbMounted: boolean;
  nasShareUrl: string; // e.g. "smb://192.168.1.100/volume/projects"
  mountPoint: string; // e.g. "/sdcard/NAS_Projects" or "/home/workspace/nas_share"
  smbVersion: 'SMB 3.1.1' | 'SMB 2.1' | 'SMB 1.0 (Disabled)';
  nasStorageLabel: string; // e.g. "IP1 External Drive Pool"
  lastMountAudit: string;
  status: 'mounted' | 'syncing' | 'unmounted' | 'error';
}

export interface NasProjectSyncConfig {
  masterNasUrl: string; // e.g. "smb://192.168.1.100/volume/projects (IP1 External Drive)"
  gitLabServerUrl: string; // e.g. "git@nas.lan:health-rpm/edge-client.git"
  localPath: string; // e.g. "/data/data/com.termux/files/home/workspace/clinical-edge"
  syncMode: 'bidirectional' | 'push_to_nas' | 'pull_from_nas' | 'auto_on_save';
  syncIntervalMinutes: number;
  lastSyncTime: string;
  pendingChangesCount: number;
  unsyncedFiles: string[];
  conflictPolicy: 'prefer_tablet' | 'prefer_nas' | 'manual_merge';
  isSyncing: boolean;
  autoSyncGitOnPush: boolean;
}

export interface TabletGitStatus {
  repoName: string;
  currentBranch: string;
  branches: string[];
  lastCommitHash: string;
  lastCommitMessage: string;
  lastCommitAuthor: string;
  aheadBy: number;
  behindBy: number;
  uncommittedFiles: { file: string; status: 'modified' | 'added' | 'deleted' }[];
  remoteOrigin: string; // e.g. "git@192.168.1.100:sallyhealth/rpm-edge.git"
  lastFetchTime: string;
}

export interface ScrcpyControlConfig {
  activeSession: boolean;
  streamFps: number;
  bitrateMbps: number;
  resolution: '1080p' | '720p' | 'Native (2560x1600)';
  latencyMs: number;
  connectionMode: 'tcp_ip' | 'usb_tunnel';
  audioForwarding: boolean;
  stayAwake: boolean;
  clipboardSynced: boolean;
}

export interface TabletNetworkSpecs {
  standard: 'Wi-Fi 6 (802.11ax)' | 'Wi-Fi 6E (6GHz)' | 'Wi-Fi 5 (802.11ac)';
  ssid: string;
  frequencyBand: '5 GHz' | '6 GHz' | '2.4 GHz';
  channel: number;
  linkSpeedMbps: number;
  signalStrengthDbm: number;
  ipAddress: string;
  macAddress: string;
  gatewayIp: string;
}

export interface TabletIDEAgentRecord {
  id: string;
  deviceId: string;
  deviceName: string;
  hostname: string;
  site: string;
  model: string;
  serialNumber: string;
  androidVersion: string;
  ipAddress: string;
  agentVersion: string;
  engineType: IDEAgentEngine;
  status: IDEAgentStatus;
  healthScore: number; // 0 - 100
  
  // Local Code-Server Configuration
  codeServerPort: number; // 8080
  codeServerBindAddress: string; // "0.0.0.0:8080"
  codeServerUrl: string; // "http://192.168.1.101:8080"
  codeServerAuthMode: 'none' | 'token' | 'password';
  
  // Hardware & Metrics
  metrics: IDEAgentMetrics;
  workspace: IDEAgentWorkspace;
  logs: IDEAgentLog[];
  autoHealEnabled: boolean;
  sandboxPolicy: 'strict_read_only' | 'clinical_safe' | 'full_developer' | 'quarantined';
  crashCount24h: number;
  uptime: string;
  assignedPatientName?: string;
  
  // Enterprise Local IDE & MDM Integration Features
  daemonTuning: AndroidDaemonTuning;
  fileManager: TabletFileManagerConfig;
  nasSync: NasProjectSyncConfig;
  gitStatus: TabletGitStatus;
  scrcpy: ScrcpyControlConfig;
  network: TabletNetworkSpecs;
  
  // MDM Policies Applied
  kioskMode: 'developer_terminal_only' | 'multi_app_dev' | 'unrestricted' | 'locked_patient';
  wifiProfileEnforced: boolean;
  fbeEncrypted: boolean;
}

export interface CentralAgentPolicy {
  continuousMonitoring: boolean;
  monitoringIntervalMs: number;
  autonomousSelfHealing: boolean;
  autoRestartOnCrash: boolean;
  maxMemoryCeilingMb: number;
  autoKillScriptTimeoutSeconds: number;
  enforceSafeModeOnPatientBed: boolean;
  autoSyncGitOnPush: boolean;
  enforceAndroid12PhantomProcessFix: boolean;
  enforceTermuxWakeLock: boolean;
  enforceWifi6Only: boolean;
  nasMasterServerIp: string; // e.g. "192.168.1.100"
  nasStoragePoolLabel: string; // "IP1 External Drive"
  macControllerIp: string; // e.g. "192.168.1.50"
}

export interface CentralAgentEvent {
  id: string;
  timestamp: string;
  targetAgentId: string;
  targetDeviceName: string;
  type: 
    | 'heartbeat' 
    | 'anomaly_detected' 
    | 'auto_restarted' 
    | 'memory_throttle' 
    | 'script_terminated' 
    | 'policy_enforced' 
    | 'health_sweep' 
    | 'script_dispatched'
    | 'cache_cleared'
    | 'nas_synced'
    | 'git_pushed'
    | 'phantom_fix_applied'
    | 'scrcpy_session_started'
    | 'file_manager_mounted';
  severity: 'info' | 'success' | 'warning' | 'error';
  description: string;
  details?: string;
}

export interface CentralAgentStats {
  totalMonitoredTablets: number;
  healthyCount: number;
  activeExecutingCount: number;
  degradedCount: number;
  offlineCount: number;
  remediationsCount24h: number;
  averageRpcLatencyMs: number;
  centralWatchdogUptime: string;
  lastGlobalSweepTime: string;
  
  // Storage & Compute Distribution Stats
  macInternalStorageUsedMb: number; // 0 MB
  macInternalStorageFreeGb: number; // 1800 GB
  nasStorageUsedGb: number; // 2400 GB
  nasStorageTotalGb: number; // 8000 GB
  tabletFleetTotalRamGb: number; // 64 GB
  tabletFleetAvgCpuLoad: number; // 18%
  wifi6FleetThroughputMbps: number; // 4800 Mbps
}
