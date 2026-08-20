import React, { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';
import { 
  DeviceRecord, 
  CommandItem, 
  FirmwarePackage, 
  EnrollmentSession, 
  DeviceAuditEvent, 
  ApplicationPackage, 
  PlatformType, 
  ConnectionMode, 
  PatientAssignment,
  CapabilityType,
  ComplianceState
} from '../types/device';
import { 
  TabletIDEAgentRecord, 
  CentralAgentPolicy, 
  CentralAgentEvent, 
  IDEAgentLog,
  NasProjectSyncConfig,
  TabletFileManagerConfig
} from '../types/ideAgent';
import { 
  Organization, 
  Site, 
  EnterpriseUser, 
  UserRole,
  DeviceGroupRecord, 
  EnterprisePolicyRecord, 
  PolicyVersionRecord,
  ComplianceRuleRecord, 
  DeploymentJobRecord, 
  ContentDocumentRecord, 
  RemoteSupportSessionRecord, 
  GeofenceZoneRecord, 
  AssetInventoryRecord, 
  PatchRecord, 
  ScriptTemplateRecord, 
  EnterpriseAlertRecord, 
  ReportDefinition 
} from '../types/enterprise';

import { initialMockDevices } from '../data/mockDevices';
import { mockApplications } from '../data/mockApplications';
import { mockFirmwarePackages } from '../data/mockFirmware';
import { initialEnrollmentSessions, initialAuditEvents } from '../data/mockEnrollments';
import { 
  initialTabletIDEAgents, 
  initialCentralPolicy, 
  initialCentralEvents 
} from '../data/mockIDEAgents';
import { 
  mockOrganizations, 
  mockSites, 
  mockUsers, 
  mockDeviceGroups, 
  mockPolicies, 
  mockComplianceRules, 
  mockDeploymentJobs, 
  mockContentDocuments, 
  mockRemoteSessions, 
  mockGeofences, 
  mockAssets, 
  mockPatches, 
  mockScriptTemplates, 
  mockEnterpriseAlerts, 
  mockReportDefinitions 
} from '../data/mockEnterprise';
import { getDeviceAdapter } from '../adapters/deviceAdapters';
import { apiClient } from '../services/api';

interface DeviceContextType {
  // Core Devices & Platform
  devices: DeviceRecord[];
  commands: CommandItem[];
  firmwarePackages: FirmwarePackage[];
  enrollmentSessions: EnrollmentSession[];
  auditEvents: DeviceAuditEvent[];
  applications: ApplicationPackage[];
  selectedDevice: DeviceRecord | null;
  setSelectedDevice: (device: DeviceRecord | null) => void;
  isRealtimeActive: boolean;
  setIsRealtimeActive: (active: boolean) => void;
  
  // Organization, Site & Role Navigation
  organizations: Organization[];
  currentOrganization: Organization;
  setCurrentOrganizationId: (id: string) => void;
  sites: Site[];
  currentSite: Site | null;
  setCurrentSiteId: (id: string | null) => void;
  currentUser: EnterpriseUser;
  setCurrentUserRole: (role: UserRole) => void;

  // Groups & Dynamic Rules
  deviceGroups: DeviceGroupRecord[];
  createDeviceGroup: (group: Partial<DeviceGroupRecord>) => void;
  deleteDeviceGroup: (id: string) => void;

  // Profiles & Policy Engine
  policies: EnterprisePolicyRecord[];
  createPolicy: (policyData: Partial<EnterprisePolicyRecord>) => void;
  publishPolicyVersion: (policyId: string, newConfig: PolicyVersionRecord) => void;
  rollbackPolicyVersion: (policyId: string, targetVersion: string) => void;
  assignPolicyToGroup: (policyId: string, groupId: string) => void;
  assignPolicyToDevice: (policyId: string, deviceId: string) => void;

  // Compliance Engine
  complianceRules: ComplianceRuleRecord[];
  toggleComplianceRule: (ruleId: string) => void;
  runFleetComplianceEvaluation: () => void;
  executeRemediationAction: (deviceId: string, action: ComplianceRuleRecord['autoRemediationAction']) => Promise<void>;

  // Software Deployments & Jobs
  deploymentJobs: DeploymentJobRecord[];
  createDeploymentJob: (jobData: Partial<DeploymentJobRecord>) => void;
  cancelDeploymentJob: (jobId: string) => void;
  rollbackDeploymentJob: (jobId: string) => void;

  // Content Distribution
  contentDocuments: ContentDocumentRecord[];
  uploadContentDocument: (doc: Partial<ContentDocumentRecord>) => void;
  revokeContentDocument: (docId: string) => void;

  // Remote Support Center & Attended/Unattended Sessions
  remoteSessions: RemoteSupportSessionRecord[];
  activeSupportSession: RemoteSupportSessionRecord | null;
  startRemoteSupportSession: (deviceId: string, sessionType: 'attended' | 'unattended') => RemoteSupportSessionRecord;
  endRemoteSupportSession: (sessionId: string) => void;
  sendSessionChatMessage: (sessionId: string, message: string) => void;
  transferFileToDevice: (sessionId: string, fileName: string, sizeKb: number) => void;
  updateSessionNotes: (sessionId: string, notes: string) => void;

  // Location Management & Geofencing
  geofences: GeofenceZoneRecord[];
  createGeofence: (geo: Partial<GeofenceZoneRecord>) => void;
  deleteGeofence: (id: string) => void;

  // Asset Inventory & Lifecycles
  assets: AssetInventoryRecord[];
  updateAssetLifecycle: (assetId: string, newState: AssetInventoryRecord['lifecycleState']) => void;

  // Patch & Update Management
  patches: PatchRecord[];
  deployPatchToRing: (patchId: string, ring: PatchRecord['rolloutRing']) => void;

  // Script / Automation Engine
  scriptTemplates: ScriptTemplateRecord[];
  executeScriptOnDevices: (scriptId: string, targetDeviceIds: string[]) => Promise<{ scriptName: string; results: { deviceId: string; deviceName: string; output: string; exitCode: number }[] }>;

  // Alert Center & ITSM Integration
  enterpriseAlerts: EnterpriseAlertRecord[];
  acknowledgeAlert: (alertId: string) => void;
  resolveAlert: (alertId: string) => void;
  createITSMTicket: (alertId: string, system: 'ServiceNow' | 'Jira Service Desk' | 'Zendesk') => void;

  // Reports
  reports: ReportDefinition[];
  generateReportNow: (reportId: string) => void;

  // Core Actions & Existing Contracts
  executeCommand: (
    command: CommandItem['command'],
    label: string,
    targetDeviceIds: string[],
    payload?: Record<string, unknown>
  ) => Promise<CommandItem>;
  createEnrollmentSession: (sessionData: Partial<EnrollmentSession>) => EnrollmentSession;
  completeEnrollmentFromQR: (token: string, newDeviceData: Partial<DeviceRecord>) => { success: boolean; device?: DeviceRecord; message: string };
  startFirmwareRollout: (packageId: string, targetDeviceIds: string[]) => void;
  updateDevicePatient: (deviceId: string, patient: PatientAssignment | undefined) => void;
  updateDeviceConnectionMode: (deviceId: string, mode: ConnectionMode) => void;
  deployApplication: (appId: string, targetGroupNames: string[]) => void;
  triggerQuickReboot: (deviceId: string) => void;
  triggerQuickScreenshot: (deviceId: string) => Promise<string>;
  addAuditEvent: (event: Omit<DeviceAuditEvent, 'id' | 'timestamp'>) => void;

  // Central IDE Agent Monitoring State & Controls
  tabletIDEAgents: TabletIDEAgentRecord[];
  selectedIDEAgent: TabletIDEAgentRecord | null;
  setSelectedIDEAgentId: (id: string | null) => void;
  centralPolicy: CentralAgentPolicy;
  centralEvents: CentralAgentEvent[];
  restartIDEAgent: (agentId: string) => Promise<void>;
  garbageCollectAgent: (agentId: string) => Promise<void>;
  terminateAgentScript: (agentId: string) => Promise<void>;
  dispatchScriptToTablet: (agentId: string, scriptName: string, scriptContent?: string) => Promise<void>;
  updateAgentSandboxPolicy: (agentId: string, policy: TabletIDEAgentRecord['sandboxPolicy']) => void;
  syncAgentGitRepo: (agentId: string) => Promise<void>;
  updateCentralPolicy: (policy: Partial<CentralAgentPolicy>) => void;
  triggerFleetIDESweep: () => Promise<void>;
  clearAgentLogs: (agentId: string) => void;
  addAgentLog: (agentId: string, log: Omit<IDEAgentLog, 'id' | 'timestamp'>) => void;
  
  // Enterprise Tablet Developer Station & Remote MDM Extensions
  triggerNasProjectSync: (agentId: string, direction?: 'bidirectional' | 'push_to_nas' | 'pull_from_nas') => Promise<void>;
  updateNasSyncConfig: (agentId: string, config: Partial<NasProjectSyncConfig>) => void;
  triggerGitPullFromNas: (agentId: string) => Promise<void>;
  triggerGitPushToNas: (agentId: string, commitMsg?: string) => Promise<void>;
  applyAndroid12DaemonTuning: (agentId: string | 'ALL') => Promise<{ success: boolean; output: string }>;
  toggleTermuxWakeLock: (agentId: string) => void;
  deployFileManagerToTablet: (agentId: string, appType: TabletFileManagerConfig['appType']) => Promise<void>;
  mountNasShareOnTablet: (agentId: string, nasShareUrl: string) => Promise<void>;
  toggleScrcpySession: (agentId: string, active: boolean) => void;
  sendScrcpyKeyAction: (agentId: string, action: string) => void;
  runAdbShellCommand: (agentId: string, command: string) => Promise<string>;
  triggerRemoteWorkspaceWipe: (agentId: string, wipeType: 'workspace_only' | 'factory_reset') => Promise<void>;
  updateKioskMode: (agentId: string, kioskMode: TabletIDEAgentRecord['kioskMode']) => void;
}

const DeviceContext = createContext<DeviceContextType | undefined>(undefined);

export const DeviceProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  // 1. Core Devices & Platform
  const [devices, setDevices] = useState<DeviceRecord[]>(initialMockDevices);
  const [commands, setCommands] = useState<CommandItem[]>([]);
  const [firmwarePackages, setFirmwarePackages] = useState<FirmwarePackage[]>(mockFirmwarePackages);
  const [enrollmentSessions, setEnrollmentSessions] = useState<EnrollmentSession[]>(initialEnrollmentSessions);
  const [auditEvents, setAuditEvents] = useState<DeviceAuditEvent[]>(initialAuditEvents);
  const [applications, setApplications] = useState<ApplicationPackage[]>(mockApplications);
  const [selectedDeviceId, setSelectedDeviceId] = useState<string | null>(null);
  const [isRealtimeActive, setIsRealtimeActive] = useState<boolean>(true);

  // 2. Organization, Site & Users
  const [organizations] = useState<Organization[]>(mockOrganizations);
  const [currentOrganizationId, setCurrentOrganizationId] = useState<string>('org-sally-health');
  const [sites] = useState<Site[]>(mockSites);
  const [currentSiteId, setCurrentSiteId] = useState<string | null>(null);
  const [currentUser, setCurrentUser] = useState<EnterpriseUser>(mockUsers[0]);

  // 3. Enterprise Modules State
  const [deviceGroups, setDeviceGroups] = useState<DeviceGroupRecord[]>(mockDeviceGroups);
  const [policies, setPolicies] = useState<EnterprisePolicyRecord[]>(mockPolicies);
  const [complianceRules, setComplianceRules] = useState<ComplianceRuleRecord[]>(mockComplianceRules);
  const [deploymentJobs, setDeploymentJobs] = useState<DeploymentJobRecord[]>(mockDeploymentJobs);
  const [contentDocuments, setContentDocuments] = useState<ContentDocumentRecord[]>(mockContentDocuments);
  const [remoteSessions, setRemoteSessions] = useState<RemoteSupportSessionRecord[]>(mockRemoteSessions);
  const [activeSupportSessionId, setActiveSupportSessionId] = useState<string | null>('sess-rem-901');
  const [geofences, setGeofences] = useState<GeofenceZoneRecord[]>(mockGeofences);
  const [assets, setAssets] = useState<AssetInventoryRecord[]>(mockAssets);
  const [patches, setPatches] = useState<PatchRecord[]>(mockPatches);
  const [scriptTemplates, setScriptTemplates] = useState<ScriptTemplateRecord[]>(mockScriptTemplates);
  const [enterpriseAlerts, setEnterpriseAlerts] = useState<EnterpriseAlertRecord[]>(mockEnterpriseAlerts);
  const [reports, setReports] = useState<ReportDefinition[]>(mockReportDefinitions);

  // 4. Central IDE Agent State
  const [tabletIDEAgents, setTabletIDEAgents] = useState<TabletIDEAgentRecord[]>(initialTabletIDEAgents);
  const [selectedIDEAgentId, setSelectedIDEAgentId] = useState<string | null>(null);
  const [centralPolicy, setCentralPolicy] = useState<CentralAgentPolicy>(initialCentralPolicy);
  const [centralEvents, setCentralEvents] = useState<CentralAgentEvent[]>(initialCentralEvents);

  const selectedDevice = devices.find(d => d.id === selectedDeviceId) || null;
  const setSelectedDevice = (device: DeviceRecord | null) => {
    setSelectedDeviceId(device ? device.id : null);
  };

  const selectedIDEAgent = tabletIDEAgents.find(a => a.id === selectedIDEAgentId) || null;
  const activeSupportSession = remoteSessions.find(s => s.id === activeSupportSessionId) || null;

  const currentOrganization = organizations.find(o => o.id === currentOrganizationId) || organizations[0];
  const currentSite = sites.find(s => s.id === currentSiteId) || null;

  const setCurrentUserRole = (role: UserRole) => {
    const foundUser = mockUsers.find(u => u.role === role) || {
      ...currentUser,
      role,
      name: role === 'clinical_rpm_admin' ? 'Dr. Sarah Chen, MD' : role === 'security_admin' ? 'Elena Rostova, CISSP' : role === 'helpdesk_tech' ? 'Alex Rivera' : 'Marcus Sterling'
    };
    setCurrentUser(foundUser);
  };

  const addCentralEvent = useCallback((event: Omit<CentralAgentEvent, 'id' | 'timestamp'>) => {
    const newEvt: CentralAgentEvent = {
      ...event,
      id: `cent-evt-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      timestamp: new Date().toLocaleTimeString(),
    };
    setCentralEvents(prev => [newEvt, ...prev.slice(0, 49)]);
  }, []);

  const addAgentLog = useCallback((agentId: string, log: Omit<IDEAgentLog, 'id' | 'timestamp'>) => {
    const newLog: IDEAgentLog = {
      ...log,
      id: `log-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      timestamp: new Date().toLocaleTimeString(),
    };
    setTabletIDEAgents(prev => prev.map(ag => {
      if (ag.id !== agentId) return ag;
      return {
        ...ag,
        logs: [newLog, ...ag.logs.slice(0, 49)],
      };
    }));
  }, []);

  const clearAgentLogs = useCallback((agentId: string) => {
    setTabletIDEAgents(prev => prev.map(ag => {
      if (ag.id !== agentId) return ag;
      return { ...ag, logs: [] };
    }));
  }, []);

  const addAuditEvent = useCallback((event: Omit<DeviceAuditEvent, 'id' | 'timestamp'>) => {
    const newEvent: DeviceAuditEvent = {
      ...event,
      id: `audit-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      timestamp: 'Just now',
    };
    setAuditEvents(prev => [newEvent, ...prev.slice(0, 49)]);
  }, []);

  // Fleet Realtime Simulation Loop
  useEffect(() => {
    if (!isRealtimeActive) return;

    const interval = setInterval(() => {
      // 1. Hardware & RPM Vitals Jitter
      setDevices(prevDevices => {
        return prevDevices.map(device => {
          if (device.status === 'offline') return device;

          const cpuDelta = (Math.random() - 0.5) * 4;
          const newCpu = Math.max(4, Math.min(96, Math.round(device.telemetry.cpuUsagePercent + cpuDelta)));
          
          let newVitals = device.rpmVitals;
          if (device.rpmVitals) {
            const hrJitter = Math.round((Math.random() - 0.5) * 3);
            const newHr = Math.max(50, Math.min(160, device.rpmVitals.heartRateBpm + hrJitter));
            const spo2Delta = Math.random() > 0.85 ? (Math.random() > 0.5 ? 1 : -1) : 0;
            const newSpo2 = Math.max(88, Math.min(100, device.rpmVitals.spo2Percent + spo2Delta));
            
            newVitals = {
              ...device.rpmVitals,
              heartRateBpm: newHr,
              spo2Percent: newSpo2,
              stepCount: device.rpmVitals.stepCount + (device.rpmVitals.activityState === 'walking' ? 2 : 0),
              lastRpmSync: 'Just now',
            };
          }

          return {
            ...device,
            telemetry: {
              ...device.telemetry,
              cpuUsagePercent: newCpu,
              lastHeartbeat: 'Just now',
            },
            rpmVitals: newVitals,
          };
        });
      });

      // 2. Deployment Jobs Progress Simulation
      setDeploymentJobs(prevJobs => {
        return prevJobs.map(job => {
          if (job.status !== 'in_progress') return job;
          if (job.inProgressCount <= 0) {
            return { ...job, status: 'completed' as const };
          }
          const moved = Math.min(job.inProgressCount, Math.floor(Math.random() * 3) + 1);
          const failedRandom = Math.random() > 0.95 ? 1 : 0;
          const successfulIncrement = moved - failedRandom;
          const newSuccess = job.successfulCount + successfulIncrement;
          const newFailed = job.failedCount + failedRandom;
          const newInProgress = job.inProgressCount - moved;

          return {
            ...job,
            successfulCount: newSuccess,
            failedCount: newFailed,
            inProgressCount: newInProgress,
            status: newInProgress === 0 ? 'completed' as const : 'in_progress' as const,
          };
        });
      });

      // 3. Support Session Latency & Jitter
      setRemoteSessions(prevSessions => {
        return prevSessions.map(sess => {
          if (sess.status !== 'ACTIVE') return sess;
          return {
            ...sess,
            durationSeconds: sess.durationSeconds + 2,
            latencyMs: Math.max(18, Math.min(75, Math.round(sess.latencyMs + (Math.random() - 0.5) * 4))),
            fps: Math.max(24, Math.min(30, Math.round(sess.fps + (Math.random() - 0.5) * 2))),
          };
        });
      });

    }, 2500);

    return () => clearInterval(interval);
  }, [isRealtimeActive]);

  // Central Agent Watchdog Loop
  useEffect(() => {
    if (!isRealtimeActive || !centralPolicy.continuousMonitoring) return;

    const interval = setInterval(() => {
      setTabletIDEAgents(prevAgents => {
        return prevAgents.map(agent => {
          if (agent.status === 'offline' || agent.status === 'restarting') return agent;

          const cpuDelta = (Math.random() - 0.5) * 4;
          const newCpu = Math.max(1, Math.min(98, parseFloat((agent.metrics.cpuPercent + cpuDelta).toFixed(1))));

          let newMem = agent.metrics.memoryMb;
          let newStatus = agent.status;
          let newDuration = agent.metrics.executionDurationSeconds;
          let newHealth = agent.healthScore;

          if (agent.status === 'executing' || agent.status === 'compiling') {
            newDuration = (agent.metrics.executionDurationSeconds || 0) + 2;
            newMem = parseFloat(Math.min(agent.metrics.memoryLimitMb, newMem + (Math.random() * 1.5 - 0.4)).toFixed(1));
          } else {
            newMem = parseFloat(Math.max(60, newMem + (Math.random() - 0.5) * 2).toFixed(1));
          }

          const newHeap = Math.round((newMem / agent.metrics.memoryLimitMb) * 100);

          // Central Watchdog Autonomous Self-Healing Check
          if (centralPolicy.autonomousSelfHealing && newMem > centralPolicy.maxMemoryCeilingMb) {
            newMem = parseFloat((centralPolicy.maxMemoryCeilingMb * 0.45).toFixed(1));
            newStatus = agent.status === 'degraded' ? 'idle' : agent.status;
            newHealth = 92;

            setTimeout(() => {
              addCentralEvent({
                targetAgentId: agent.id,
                targetDeviceName: agent.deviceName,
                type: 'memory_throttle',
                severity: 'warning',
                description: `Central Agent Watchdog auto-throttled PID ${agent.metrics.pid}: Freed ${(agent.metrics.memoryMb - newMem).toFixed(0)}MB.`,
                details: `Autonomous heap GC executed within 12ms. Safe limits restored.`,
              });
              addAgentLog(agent.id, {
                level: 'warn',
                source: 'central-watchdog',
                message: `Autonomous GC executed by Central Agent: Memory dropped to ${newMem}MB`,
              });
            }, 0);
          }

          return {
            ...agent,
            status: newStatus,
            healthScore: newHealth,
            metrics: {
              ...agent.metrics,
              cpuPercent: newCpu,
              memoryMb: newMem,
              heapUsagePercent: newHeap,
              executionDurationSeconds: newDuration,
              lastHeartbeat: 'Just now',
            },
          };
        });
      });
    }, 2000);

    return () => clearInterval(interval);
  }, [isRealtimeActive, centralPolicy, addCentralEvent, addAgentLog]);

  // Command Execution Pipeline
  const executeCommand = async (
    command: CommandItem['command'],
    label: string,
    targetDeviceIds: string[],
    payload?: Record<string, unknown>
  ): Promise<CommandItem> => {
    const commandId = `cmd-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
    const targets = devices.filter(d => targetDeviceIds.includes(d.id));
    const targetFilterDesc = targets.length === 1 ? targets[0].name : `${targets.length} Managed Endpoints`;

    const newCommand: CommandItem = {
      id: commandId,
      command,
      label,
      payload,
      targetDeviceIds,
      targetFilterDescription: targetFilterDesc,
      initiatedBy: currentUser.name,
      timestamp: 'Just now',
      status: 'in_progress',
      deviceResults: targets.map(t => ({
        deviceId: t.id,
        deviceName: t.name,
        platform: t.platform,
        status: 'pending',
        message: 'Dispatched to Device Policy Agent',
        durationMs: 0,
      })),
    };

    setCommands(prev => [newCommand, ...prev]);

    // Execute concurrently across target platform adapters
    const results = await Promise.all(
      targets.map(async device => {
        const adapter = getDeviceAdapter(device.platform);
        try {
          const res = await adapter.executeCommand(device, command, payload);
          return {
            deviceId: device.id,
            deviceName: device.name,
            platform: device.platform,
            status: res.success ? ('success' as const) : ('failed' as const),
            message: res.message,
            durationMs: res.durationMs,
            acknowledgedAt: new Date().toLocaleTimeString(),
          };
        } catch (err: unknown) {
          const message = err instanceof Error ? err.message : 'Execution error';
          return {
            deviceId: device.id,
            deviceName: device.name,
            platform: device.platform,
            status: 'failed' as const,
            message: `Adapter error: ${message}`,
            durationMs: 400,
          };
        }
      })
    );

    const hasFailures = results.some(r => r.status === 'failed');
    const allFailed = results.every(r => r.status === 'failed');
    const finalStatus = allFailed ? 'failed' : hasFailures ? 'partially_failed' : 'completed';

    const completedCommand: CommandItem = {
      ...newCommand,
      status: finalStatus,
      deviceResults: results,
    };

    setCommands(prev => prev.map(c => (c.id === commandId ? completedCommand : c)));

    addAuditEvent({
      actor: currentUser.name,
      action: `Executed command: ${label}`,
      category: 'command',
      severity: finalStatus === 'completed' ? 'success' : 'warning',
      details: `Targeted ${targets.length} devices (${results.filter(r => r.status === 'success').length} succeeded). Payload: ${JSON.stringify(payload || {})}`,
    });

    return completedCommand;
  };

  // Group Management
  const createDeviceGroup = (groupData: Partial<DeviceGroupRecord>) => {
    const newGroup: DeviceGroupRecord = {
      id: `grp-${Date.now()}`,
      organizationId: currentOrganization.id,
      siteId: currentSiteId || undefined,
      name: groupData.name || 'New Device Group',
      description: groupData.description || 'Custom device group',
      type: groupData.type || 'static',
      deviceCount: 0,
      rules: groupData.rules || [],
      assignedPolicyId: groupData.assignedPolicyId,
      assignedPolicyName: groupData.assignedPolicyName,
      tags: groupData.tags || ['Custom Group'],
      createdAt: new Date().toISOString(),
    };
    setDeviceGroups(prev => [newGroup, ...prev]);
    addAuditEvent({
      actor: currentUser.name,
      action: `Created Device Group: ${newGroup.name}`,
      category: 'security',
      severity: 'info',
      details: `Group type: ${newGroup.type}, Site: ${currentSite?.name || 'All Sites'}`,
    });
  };

  const deleteDeviceGroup = (id: string) => {
    setDeviceGroups(prev => prev.filter(g => g.id !== id));
  };

  // Policy Engine
  const createPolicy = (policyData: Partial<EnterprisePolicyRecord>) => {
    const newPolicy: EnterprisePolicyRecord = {
      id: `pol-${Date.now()}`,
      organizationId: currentOrganization.id,
      name: policyData.name || 'New Security Policy',
      description: policyData.description || 'Custom policy configuration',
      targetPlatforms: policyData.targetPlatforms || ['android', 'windows'],
      currentVersion: 'v1.0',
      status: 'published',
      assignedGroupsCount: 0,
      assignedDevicesCount: 0,
      activeConfig: policyData.activeConfig || {
        version: 'v1.0',
        publishedAt: new Date().toISOString(),
        publishedBy: currentUser.name,
        changeSummary: 'Initial policy baseline creation.',
        security: { passcodeRequired: true, minPasscodeLength: 6, passcodeComplexity: 'numeric', maxFailedAttempts: 5, screenTimeoutSeconds: 300, storageEncryptionRequired: true, biometricsAllowed: false, lostModeEnabled: true, remoteWipeOnBruteForce: false },
        network: { wifiSsid: 'SH-Medical-Secure-5G', wifiSecurity: 'WPA2-Enterprise', vpnRequired: false, enforceCertificatePinning: true, allowCellularData: true },
        hardware: { cameraEnabled: true, bluetoothEnabled: true, usbDataEnabled: false, microphoneEnabled: true, externalStorageAllowed: false, allowScreenshots: true, hardwareVolumeControlEnabled: true, powerButtonLockout: false },
        application: { allowlistedPackageIds: [], blocklistedPackageIds: [], requiredMandatoryApps: [], prohibitedApps: [], allowUnknownSources: false, autoGrantRuntimePermissions: true, allowAppUninstall: false },
        browser: { allowedUrls: [], blockedUrls: [], allowPopups: false, clearCookiesOnExit: true, forceSafeSearch: true },
        kiosk: { mode: 'single_app', primaryPackageId: 'org.sallyhealth.rpm.core', kioskExitPin: '0000', enableStatusBar: true, enableNavigationBar: true, enableSettingsAccess: false, patientEmergencyCallEnabled: true },
      },
      versionHistory: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    setPolicies(prev => [newPolicy, ...prev]);
    addAuditEvent({
      actor: currentUser.name,
      action: `Created Policy Profile: ${newPolicy.name}`,
      category: 'security',
      severity: 'info',
      details: `Target platforms: ${newPolicy.targetPlatforms.join(', ')}`,
    });
  };

  const publishPolicyVersion = (policyId: string, newConfig: PolicyVersionRecord) => {
    setPolicies(prev => prev.map(p => {
      if (p.id !== policyId) return p;
      return {
        ...p,
        currentVersion: newConfig.version,
        updatedAt: new Date().toISOString(),
        activeConfig: newConfig,
        versionHistory: [p.activeConfig, ...p.versionHistory],
      };
    }));
    addAuditEvent({
      actor: currentUser.name,
      action: `Published Policy Version: ${newConfig.version}`,
      category: 'security',
      severity: 'info',
      details: newConfig.changeSummary,
    });
  };

  const rollbackPolicyVersion = (policyId: string, targetVersion: string) => {
    setPolicies(prev => prev.map(p => {
      if (p.id !== policyId) return p;
      const targetConfig = p.versionHistory.find(v => v.version === targetVersion);
      if (!targetConfig) return p;
      return {
        ...p,
        currentVersion: targetVersion,
        activeConfig: targetConfig,
        updatedAt: new Date().toISOString(),
      };
    }));
    addAuditEvent({
      actor: currentUser.name,
      action: `Rolled back Policy to: ${targetVersion}`,
      category: 'security',
      severity: 'warning',
      details: `Policy ID: ${policyId}`,
    });
  };

  const assignPolicyToGroup = (policyId: string, groupId: string) => {
    const policy = policies.find(p => p.id === policyId);
    setDeviceGroups(prev => prev.map(g => {
      if (g.id !== groupId) return g;
      return {
        ...g,
        assignedPolicyId: policyId,
        assignedPolicyName: policy ? `${policy.name} (${policy.currentVersion})` : undefined,
      };
    }));
    // Also tag devices in that group
    setDevices(prev => prev.map(d => {
      if (d.groupId !== groupId && d.deviceGroup !== groupId) return d;
      return {
        ...d,
        assignedPolicyId: policyId,
        assignedPolicyVersion: policy?.currentVersion,
      };
    }));
    addAuditEvent({
      actor: currentUser.name,
      action: `Assigned Policy ${policy?.name} to Group ${groupId}`,
      category: 'security',
      severity: 'info',
      details: `Policy version applied: ${policy?.currentVersion}`,
    });
  };

  const assignPolicyToDevice = (policyId: string, deviceId: string) => {
    const policy = policies.find(p => p.id === policyId);
    setDevices(prev => prev.map(d => {
      if (d.id !== deviceId) return d;
      return {
        ...d,
        assignedPolicyId: policyId,
        assignedPolicyVersion: policy?.currentVersion,
      };
    }));
    addAuditEvent({
      actor: currentUser.name,
      action: `Assigned Policy to Device ${deviceId}`,
      category: 'security',
      severity: 'info',
      details: `Policy: ${policy?.name} (${policy?.currentVersion})`,
    });
  };

  // Compliance Engine
  const toggleComplianceRule = (ruleId: string) => {
    setComplianceRules(prev => prev.map(r => r.id === ruleId ? { ...r, isEnabled: !r.isEnabled } : r));
  };

  const runFleetComplianceEvaluation = () => {
    setDevices(prev => prev.map(d => {
      let nonCompliantReasons: string[] = [];
      
      if (d.telemetry.batteryLevel < 10) {
        nonCompliantReasons.push('Critical low battery (<10%)');
      }
      if (d.status === 'offline') {
        nonCompliantReasons.push('Heartbeat expired (>30m)');
      }
      if (d.location && !d.location.insideGeofence) {
        nonCompliantReasons.push('Outside hospital geofence perimeter');
      }
      if (d.rpmVitals && d.rpmVitals.alertFlag === 'critical') {
        nonCompliantReasons.push('RPM telemetry critical alarm condition');
      }

      let newState: ComplianceState = 'COMPLIANT';
      if (nonCompliantReasons.length > 0) {
        newState = nonCompliantReasons.some(r => r.includes('Critical') || r.includes('RPM')) ? 'NON_COMPLIANT' : 'WARNING';
      }

      return {
        ...d,
        complianceState: newState,
        complianceReason: nonCompliantReasons.join(' • ') || undefined,
      };
    }));

    addAuditEvent({
      actor: currentUser.name,
      action: 'Executed Fleet-Wide Compliance Sweep',
      category: 'security',
      severity: 'info',
      details: 'All active enterprise compliance rules evaluated against endpoint telemetry.',
    });
  };

  const executeRemediationAction = async (deviceId: string, action: ComplianceRuleRecord['autoRemediationAction']) => {
    const target = devices.find(d => d.id === deviceId);
    if (!target) return;

    if (action === 'remote_lock') {
      await executeCommand('lock', 'Remediation: Remote Device Lock', [deviceId]);
    } else if (action === 'quarantine_device') {
      setDevices(prev => prev.map(d => d.id === deviceId ? { ...d, status: 'quarantined' as const, complianceState: 'NON_COMPLIANT' as const } : d));
      addAuditEvent({
        actor: currentUser.name,
        action: `Quarantined Device: ${target.name}`,
        category: 'security',
        severity: 'error',
        details: 'Device network access restricted to isolation VLAN.',
      });
    } else if (action === 'wipe_corporate_data') {
      setDevices(prev => prev.map(d => d.id === deviceId ? { ...d, status: 'wiped' as const, installedApps: [] } : d));
      addAuditEvent({
        actor: currentUser.name,
        action: `Enterprise Corporate Wipe Executed: ${target.name}`,
        category: 'security',
        severity: 'error',
        details: 'All enterprise profiles, tokens, and clinical data revoked.',
      });
    } else if (action === 'create_support_ticket') {
      const newAlertId = `alt-auto-${Date.now()}`;
      setEnterpriseAlerts(prev => [
        {
          id: newAlertId,
          organizationId: currentOrganization.id,
          siteId: target.siteId || 'site-chi-snf',
          deviceId: target.id,
          deviceName: target.name,
          type: 'NON_COMPLIANT',
          severity: 'HIGH',
          title: `Compliance Remediation Ticket: ${target.name}`,
          description: `Auto-generated support ticket due to compliance failure: ${target.complianceReason || 'Policy check failed'}`,
          timestamp: 'Just now',
          status: 'active',
          ticketId: `INC00${Math.floor(Math.random() * 9000 + 1000)}`,
          ticketSystem: 'ServiceNow',
        },
        ...prev,
      ]);
    }
  };

  // Software Deployments
  const createDeploymentJob = (jobData: Partial<DeploymentJobRecord>) => {
    const newJob: DeploymentJobRecord = {
      id: `dep-job-${Date.now()}`,
      applicationId: jobData.applicationId || 'app-custom',
      applicationName: jobData.applicationName || 'Clinical Package Rollout',
      targetVersion: jobData.targetVersion || '1.0.0',
      targetGroupNames: jobData.targetGroupNames || ['All Managed Devices'],
      targetDeviceIds: jobData.targetDeviceIds || devices.map(d => d.id),
      deploymentRing: jobData.deploymentRing || 'CANARY',
      scheduleType: jobData.scheduleType || 'immediate',
      retryLimit: jobData.retryLimit || 3,
      autoRollbackOnFailureRatePercent: jobData.autoRollbackOnFailureRatePercent || 10,
      status: 'in_progress',
      totalTargets: jobData.totalTargets || devices.length,
      successfulCount: 0,
      failedCount: 0,
      inProgressCount: jobData.totalTargets || devices.length,
      initiatedBy: currentUser.name,
      createdAt: new Date().toISOString(),
    };
    setDeploymentJobs(prev => [newJob, ...prev]);
    addAuditEvent({
      actor: currentUser.name,
      action: `Dispatched Software Deployment Job: ${newJob.applicationName} v${newJob.targetVersion}`,
      category: 'firmware',
      severity: 'info',
      details: `Deployment Ring: ${newJob.deploymentRing}, Targets: ${newJob.totalTargets} endpoints`,
    });
  };

  const cancelDeploymentJob = (jobId: string) => {
    setDeploymentJobs(prev => prev.map(j => j.id === jobId ? { ...j, status: 'failed' as const } : j));
  };

  const rollbackDeploymentJob = (jobId: string) => {
    setDeploymentJobs(prev => prev.map(j => j.id === jobId ? { ...j, status: 'rolling_back' as const } : j));
    addAuditEvent({
      actor: currentUser.name,
      action: `Initiated Software Rollback for Job ID: ${jobId}`,
      category: 'firmware',
      severity: 'warning',
      details: 'Endpoints reverting to previous certified application binary version.',
    });
  };

  // Content Distribution
  const uploadContentDocument = (docData: Partial<ContentDocumentRecord>) => {
    const newDoc: ContentDocumentRecord = {
      id: `doc-${Date.now()}`,
      organizationId: currentOrganization.id,
      title: docData.title || 'Clinical Document',
      category: docData.category || 'clinical_protocol',
      fileType: docData.fileType || 'pdf',
      fileSizeMb: docData.fileSizeMb || 2.5,
      version: docData.version || '1.0.0',
      isEncryptedAtRest: true,
      assignedGroups: docData.assignedGroups || ['Chicago SNF Group'],
      downloadedDevicesCount: 0,
      targetDevicesCount: 142,
      uploadedBy: currentUser.name,
      uploadedAt: new Date().toISOString(),
    };
    setContentDocuments(prev => [newDoc, ...prev]);
    addAuditEvent({
      actor: currentUser.name,
      action: `Uploaded Encrypted Content: ${newDoc.title}`,
      category: 'security',
      severity: 'info',
      details: `Category: ${newDoc.category}, Target groups: ${newDoc.assignedGroups.join(', ')}`,
    });
  };

  const revokeContentDocument = (docId: string) => {
    setContentDocuments(prev => prev.filter(d => d.id !== docId));
  };

  // Remote Support Center
  const startRemoteSupportSession = (deviceId: string, sessionType: 'attended' | 'unattended') => {
    const device = devices.find(d => d.id === deviceId) || devices[0];
    const newSessionId = `sess-rem-${Date.now()}`;
    const newSession: RemoteSupportSessionRecord = {
      id: newSessionId,
      deviceId: device.id,
      deviceName: device.name,
      platform: device.platform,
      deviceType: device.deviceType,
      technicianId: currentUser.id,
      technicianName: currentUser.name,
      sessionType,
      status: 'ACTIVE',
      userConsentGranted: true,
      isRecording: true,
      startTime: new Date().toLocaleTimeString(),
      durationSeconds: 0,
      fps: 30,
      latencyMs: 32,
      quality: '1080p',
      sessionNotes: `Active ${sessionType} session with ${device.name}`,
      chatMessages: [
        { id: `c-${Date.now()}`, sender: 'system', message: `Encrypted TLS 1.3 remote session established with ${device.name}.`, timestamp: new Date().toLocaleTimeString() },
      ],
      transferredFiles: [],
    };
    setRemoteSessions(prev => [newSession, ...prev]);
    setActiveSupportSessionId(newSessionId);
    addAuditEvent({
      actor: currentUser.name,
      action: `Started Remote Support Session (${sessionType}) on ${device.name}`,
      category: 'security',
      severity: 'info',
      details: `Session ID: ${newSessionId}`,
    });
    return newSession;
  };

  const endRemoteSupportSession = (sessionId: string) => {
    setRemoteSessions(prev => prev.map(s => {
      if (s.id !== sessionId) return s;
      return {
        ...s,
        status: 'TERMINATED' as const,
        endTime: new Date().toLocaleTimeString(),
      };
    }));
    if (activeSupportSessionId === sessionId) {
      setActiveSupportSessionId(null);
    }
    addAuditEvent({
      actor: currentUser.name,
      action: `Terminated Remote Support Session: ${sessionId}`,
      category: 'security',
      severity: 'info',
      details: 'Audit log appended and recording stored.',
    });
  };

  const sendSessionChatMessage = (sessionId: string, message: string) => {
    setRemoteSessions(prev => prev.map(s => {
      if (s.id !== sessionId) return s;
      return {
        ...s,
        chatMessages: [
          ...s.chatMessages,
          {
            id: `msg-${Date.now()}`,
            sender: 'technician' as const,
            message,
            timestamp: new Date().toLocaleTimeString(),
          },
        ],
      };
    }));
  };

  const transferFileToDevice = (sessionId: string, fileName: string, sizeKb: number) => {
    setRemoteSessions(prev => prev.map(s => {
      if (s.id !== sessionId) return s;
      return {
        ...s,
        transferredFiles: [
          ...s.transferredFiles,
          {
            id: `f-${Date.now()}`,
            fileName,
            sizeKb,
            status: 'completed' as const,
            timestamp: new Date().toLocaleTimeString(),
          },
        ],
      };
    }));
  };

  const updateSessionNotes = (sessionId: string, notes: string) => {
    setRemoteSessions(prev => prev.map(s => s.id === sessionId ? { ...s, sessionNotes: notes } : s));
  };

  // Location & Geofences
  const createGeofence = (geoData: Partial<GeofenceZoneRecord>) => {
    const newGeo: GeofenceZoneRecord = {
      id: `geo-${Date.now()}`,
      organizationId: currentOrganization.id,
      siteId: currentSiteId || 'site-chi-snf',
      name: geoData.name || 'New Facility Perimeter',
      facilityType: geoData.facilityType || 'Healthcare Campus',
      centerLatitude: geoData.centerLatitude || 41.8986,
      centerLongitude: geoData.centerLongitude || -87.6240,
      radiusMeters: geoData.radiusMeters || 500,
      activeDeviceCount: 142,
      alertOnExit: geoData.alertOnExit ?? true,
      alertOnEnter: geoData.alertOnEnter ?? false,
      enforceComplianceLockoutOnExit: geoData.enforceComplianceLockoutOnExit ?? false,
      violationCount24h: 0,
      description: geoData.description || 'Geofenced boundary zone',
    };
    setGeofences(prev => [newGeo, ...prev]);
  };

  const deleteGeofence = (id: string) => {
    setGeofences(prev => prev.filter(g => g.id !== id));
  };

  // Asset Management
  const updateAssetLifecycle = (assetId: string, newState: AssetInventoryRecord['lifecycleState']) => {
    setAssets(prev => prev.map(a => a.id === assetId ? { ...a, lifecycleState: newState } : a));
    addAuditEvent({
      actor: currentUser.name,
      action: `Updated Asset Lifecycle: ${assetId} -> ${newState}`,
      category: 'security',
      severity: 'info',
      details: `Asset state changed to ${newState}`,
    });
  };

  // Patch Management
  const deployPatchToRing = (patchId: string, ring: PatchRecord['rolloutRing']) => {
    setPatches(prev => prev.map(p => p.id === patchId ? { ...p, rolloutRing: ring, status: 'deploying' as const } : p));
    addAuditEvent({
      actor: currentUser.name,
      action: `Dispatched Security Patch ${patchId} to ${ring} Ring`,
      category: 'firmware',
      severity: 'info',
      details: `Target Ring: ${ring}`,
    });
  };

  // Script & Automation Engine
  const executeScriptOnDevices = async (scriptId: string, targetDeviceIds: string[]) => {
    const template = scriptTemplates.find(s => s.id === scriptId) || scriptTemplates[0];
    const targets = devices.filter(d => targetDeviceIds.includes(d.id));

    // Update execution counter
    setScriptTemplates(prev => prev.map(s => s.id === scriptId ? { ...s, executionCount: s.executionCount + targets.length, lastExecutedAt: 'Just now' } : s));

    const results = targets.map(d => ({
      deviceId: d.id,
      deviceName: d.name,
      output: `[${d.platform.toUpperCase()}] Script '${template.name}' executed in sandbox.\nExit code: 0 (SUCCESS)\nDuration: 420ms\nBuffer stdout: Process finished without errors.`,
      exitCode: 0,
    }));

    addAuditEvent({
      actor: currentUser.name,
      action: `Executed Automation Script: ${template.name}`,
      category: 'command',
      severity: 'success',
      details: `Dispatched to ${targets.length} endpoints. Language: ${template.language}`,
    });

    return { scriptName: template.name, results };
  };

  // Alert Center & ITSM
  const acknowledgeAlert = (alertId: string) => {
    setEnterpriseAlerts(prev => prev.map(a => a.id === alertId ? { ...a, status: 'acknowledged' as const, assignedTo: currentUser.name } : a));
  };

  const resolveAlert = (alertId: string) => {
    setEnterpriseAlerts(prev => prev.map(a => a.id === alertId ? { ...a, status: 'resolved' as const } : a));
  };

  const createITSMTicket = (alertId: string, system: 'ServiceNow' | 'Jira Service Desk' | 'Zendesk') => {
    const ticketPrefix = system === 'ServiceNow' ? 'INC00' : system === 'Jira Service Desk' ? 'HEALTH-' : 'ZD-';
    const ticketNum = `${ticketPrefix}${Math.floor(Math.random() * 9000 + 1000)}`;
    setEnterpriseAlerts(prev => prev.map(a => {
      if (a.id !== alertId) return a;
      return {
        ...a,
        ticketId: ticketNum,
        ticketSystem: system,
        ticketUrl: `https://${system.toLowerCase().replace(/\s+/g, '')}.sallyhealth.org/ticket/${ticketNum}`,
      };
    }));
    addAuditEvent({
      actor: currentUser.name,
      action: `Synced Alert ${alertId} with ${system} (${ticketNum})`,
      category: 'security',
      severity: 'info',
      details: `ITSM Ticket created: ${ticketNum}`,
    });
  };

  // Reports
  const generateReportNow = (reportId: string) => {
    setReports(prev => prev.map(r => r.id === reportId ? { ...r, lastGeneratedAt: 'Just now' } : r));
    addAuditEvent({
      actor: currentUser.name,
      action: `Generated Enterprise Report: ${reportId}`,
      category: 'security',
      severity: 'info',
      details: 'Audit report exported to secure encrypted storage.',
    });
  };

  // Existing Enrollment, Firmware & App Deployments
  const createEnrollmentSession = async (sessionData: Partial<EnrollmentSession>): Promise<EnrollmentSession> => {
    try {
      const tokenResponse = await apiClient.generateEnrollmentToken(86400);
      const newToken = tokenResponse.token;

      const newSession: EnrollmentSession = {
        id: `enr-sess-${Date.now()}`,
        token: newToken,
        organization: sessionData.organization || currentOrganization.name,
        site: sessionData.site || 'Chicago SNF Facility',
        deviceGroup: sessionData.deviceGroup || 'Chicago SNF Group',
        connectionMode: sessionData.connectionMode || 'kiosk',
        targetPlatform: sessionData.targetPlatform || 'android',
        assignedPolicy: sessionData.assignedPolicy || 'Strict Clinical Kiosk Policy (v2.4)',
        createdDate: new Date().toISOString(),
        expiresAt: tokenResponse.expiresAt,
        singleUse: sessionData.singleUse !== undefined ? sessionData.singleUse : true,
        used: false,
        qrPayloadJson: JSON.stringify({
          enrollmentPortalUrl: typeof window !== 'undefined' ? `${window.location.origin}/?enroll=${newToken}` : `https://omnifleet.example.com/?enroll=${newToken}`,
          token: newToken,
          org: sessionData.organization || currentOrganization.name,
          site: sessionData.site || 'Chicago SNF Facility',
          group: sessionData.deviceGroup || 'Chicago SNF Group',
          platform: sessionData.targetPlatform || 'android',
          mode: sessionData.connectionMode || 'kiosk',
          nasShareUrl: 'smb://192.168.1.100/volume/projects',
          exp: tokenResponse.expiresAt,
        }, null, 2),
      };

      setEnrollmentSessions(prev => [newSession, ...prev]);
      addAuditEvent({
        actor: currentUser.name,
        action: 'Generated New QR Enrollment Token',
        category: 'enrollment',
        severity: 'info',
        details: `Target: ${newSession.targetPlatform} • Org: ${newSession.organization} • Token: ${newToken.slice(0, 5)}...`,
      });

      return newSession;
    } catch (error) {
      console.error('Failed to create enrollment session:', error);
      throw error;
    }
  };

  const completeEnrollmentFromQR = async (token: string, newDeviceData: Partial<DeviceRecord>) => {
    try {
      const session = enrollmentSessions.find(s => s.token === token && !s.used);
      if (!session) {
        return { success: false, message: 'Invalid or expired enrollment token.' };
      }

      const deviceName = newDeviceData.name || `Enrolled Device`;
      const deviceType = newDeviceData.deviceType === 'tablet' ? 'tablet' : 'smartphone';

      const enrollmentResult = await apiClient.enrollDevice(token, {
        name: deviceName,
        type: deviceType,
      });

      const enrolledApiDevice = enrollmentResult.device;
      const platform = (newDeviceData.platform || session.targetPlatform || 'android') as PlatformType;
      const adapter = getDeviceAdapter(platform);

      const newDevice: DeviceRecord = {
        id: enrolledApiDevice.id,
        deviceId: enrolledApiDevice.id,
        name: enrolledApiDevice.name,
        serialNumber: newDeviceData.serialNumber || `SN-${Math.random().toString(36).substring(2, 8).toUpperCase()}`,
        assetTag: newDeviceData.assetTag || `AST-${Math.floor(1000 + Math.random() * 9000)}`,
        platform,
        deviceType: newDeviceData.deviceType || 'tablet',
        model: newDeviceData.model || 'Universal Enterprise Endpoint',
        manufacturer: newDeviceData.manufacturer || 'Certified Hardware OEM',
        osVersion: newDeviceData.osVersion || '14.0',
        firmwareVersion: '1.0.0-PROD',
        status: 'online',
        lifecycleState: 'ACTIVE',
        complianceState: 'COMPLIANT',
        ownershipType: 'corporate_dedicated',
        managementMode: session.connectionMode,
        connectionMode: session.connectionMode,
        organization: session.organization,
        site: session.site,
        deviceGroup: session.deviceGroup,
        capabilities: adapter.getCapabilities(),
        capabilitiesList: adapter.getCapabilityList(),
        telemetry: {
          batteryLevel: enrolledApiDevice.batteryLevel,
          isCharging: true,
          temperatureCelsius: 29.5,
          cpuUsagePercent: enrolledApiDevice.cpuUsage,
          ramUsagePercent: enrolledApiDevice.ramUsage,
          storageUsedGb: 14.5,
          storageTotalGb: 128,
          wifiSsid: 'SH-Medical-Secure-5G',
          wifiSignalDbm: enrolledApiDevice.wifiSignal,
          ipAddress: '10.140.12.88',
          macAddress: '9C:28:BF:33:9A:12',
          screenOn: true,
          screenLocked: false,
          currentForegroundApp: 'org.sallyhealth.rpm.core',
          lastHeartbeat: 'Just now',
          lastSync: 'Just now',
          uptimeHours: 1,
        },
        installedApps: ['org.sallyhealth.rpm.core', 'org.sallyhealth.kiosk.shell'],
        enrolledAt: enrolledApiDevice.createdAt,
        tags: ['Newly Enrolled', 'QR Token', platform],
      };

      setDevices(prev => [newDevice, ...prev]);
      setEnrollmentSessions(prev =>
        prev.map(s => (s.id === session.id ? { ...s, used: true, usedByDeviceId: newDevice.id } : s))
      );

      addAuditEvent({
        actor: 'Device Self-Enrollment Service',
        action: `Device Enrolled: ${newDevice.name}`,
        category: 'enrollment',
        severity: 'success',
        details: `Enrolled via token ${token.slice(0, 5)}... assigned to ${newDevice.deviceGroup}`,
      });

      return { success: true, device: newDevice, message: 'Device successfully enrolled.' };
    } catch (error) {
      console.error('Enrollment failed:', error);
      const errorMessage = error instanceof Error ? error.message : 'Device enrollment failed.';
      return { success: false, message: errorMessage };
    }
  };

  const startFirmwareRollout = (packageId: string, targetDeviceIds: string[]) => {
    const pkg = firmwarePackages.find(p => p.id === packageId);
    if (!pkg) return;

    setDevices(prev =>
      prev.map(d => {
        if (!targetDeviceIds.includes(d.id)) return d;
        return {
          ...d,
          pendingUpdate: {
            targetVersion: pkg.version,
            stage: 'queued',
            progressPercent: 0,
            initiatedAt: new Date().toISOString(),
          },
        };
      })
    );

    setFirmwarePackages(prev =>
      prev.map(p => (p.id === packageId ? { ...p, activeRolloutCount: p.activeRolloutCount + targetDeviceIds.length } : p))
    );

    addAuditEvent({
      actor: currentUser.name,
      action: `Initiated OTA Firmware Rollout (${pkg.version})`,
      category: 'firmware',
      severity: 'info',
      details: `Queued OTA binary payload to ${targetDeviceIds.length} target devices.`,
    });
  };

  const updateDevicePatient = (deviceId: string, patient: PatientAssignment | undefined) => {
    setDevices(prev => prev.map(d => (d.id === deviceId ? { ...d, patient } : d)));
    addAuditEvent({
      actor: currentUser.name,
      action: patient ? `Assigned Patient ${patient.patientName}` : 'Unassigned Patient',
      category: 'rpm_alert',
      severity: 'info',
      details: `Device ID: ${deviceId} • MRN: ${patient?.medicalRecordNumber || 'N/A'}`,
    });
  };

  const updateDeviceConnectionMode = (deviceId: string, mode: ConnectionMode) => {
    setDevices(prev => prev.map(d => (d.id === deviceId ? { ...d, connectionMode: mode, managementMode: mode } : d)));
    addAuditEvent({
      actor: currentUser.name,
      action: `Changed Connection Mode to ${mode.toUpperCase()}`,
      category: 'security',
      severity: 'warning',
      details: `Device ID: ${deviceId}`,
    });
  };

  const deployApplication = (appId: string, targetGroupNames: string[]) => {
    const app = applications.find(a => a.id === appId);
    if (!app) return;

    setApplications(prev =>
      prev.map(a => (a.id === appId ? { ...a, assignedGroups: Array.from(new Set([...a.assignedGroups, ...targetGroupNames])) } : a))
    );

    setDevices(prev =>
      prev.map(d => {
        if (targetGroupNames.includes(d.deviceGroup) && !d.installedApps.includes(app.packageIdentifier)) {
          return {
            ...d,
            installedApps: [...d.installedApps, app.packageIdentifier],
          };
        }
        return d;
      })
    );

    createDeploymentJob({
      applicationId: app.id,
      applicationName: app.name,
      targetVersion: app.version,
      targetGroupNames,
      deploymentRing: 'PRODUCTION',
    });
  };

  const triggerQuickReboot = (deviceId: string) => {
    const dev = devices.find(d => d.id === deviceId);
    if (!dev) return;
    executeCommand('reboot', `Reboot ${dev.name}`, [deviceId]);
  };

  const triggerQuickScreenshot = async (deviceId: string): Promise<string> => {
    const dev = devices.find(d => d.id === deviceId);
    if (!dev) return 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="400" height="300"><rect width="100%" height="100%" fill="%230f172a"/><text x="50%" y="50%" fill="%2394a3b8" dominant-baseline="middle" text-anchor="middle">Frame captured</text></svg>';
    await executeCommand('capture_screenshot', `Screenshot ${dev.name}`, [deviceId]);
    return `https://images.unsplash.com/photo-1576091160550-2173dba999ef?auto=format&fit=crop&w=1200&q=80`;
  };

  // Central IDE Agent Controls
  const restartIDEAgent = async (agentId: string) => {
    const target = tabletIDEAgents.find(a => a.id === agentId);
    if (!target) return;
    setTabletIDEAgents(prev => prev.map(ag => ag.id === agentId ? { ...ag, status: 'restarting', healthScore: 70 } : ag));
    addAgentLog(agentId, { level: 'warn', source: 'daemon', message: 'SIGTERM received. Cleaning up child processes...' });
    await new Promise(r => setTimeout(r, 1200));
    setTabletIDEAgents(prev => prev.map(ag => ag.id === agentId ? { ...ag, status: 'idle', healthScore: 98, metrics: { ...ag.metrics, cpuPercent: 3.2, memoryMb: 78.4, executionDurationSeconds: 0 } } : ag));
    addAgentLog(agentId, { level: 'info', source: 'daemon', message: 'IDE Agent Daemon restarted successfully on port 8088' });
  };

  const garbageCollectAgent = async (agentId: string) => {
    const target = tabletIDEAgents.find(a => a.id === agentId);
    if (!target) return;
    addAgentLog(agentId, { level: 'info', source: 'v8-engine', message: 'Explicit GC requested. Triggering scavenge and mark-sweep...' });
    await new Promise(r => setTimeout(r, 500));
    setTabletIDEAgents(prev => prev.map(ag => {
      if (ag.id !== agentId) return ag;
      const reducedMem = Math.max(54, parseFloat((ag.metrics.memoryMb * 0.48).toFixed(1)));
      return {
        ...ag,
        healthScore: Math.min(100, ag.healthScore + 15),
        metrics: {
          ...ag.metrics,
          memoryMb: reducedMem,
          heapUsagePercent: Math.round((reducedMem / ag.metrics.memoryLimitMb) * 100),
        },
      };
    }));
    addAgentLog(agentId, { level: 'info', source: 'v8-engine', message: 'GC complete. Heap compacted.' });
  };

  const terminateAgentScript = async (agentId: string) => {
    const target = tabletIDEAgents.find(a => a.id === agentId);
    if (!target) return;
    addAgentLog(agentId, { level: 'error', source: 'sandbox', message: 'Script execution interrupted by Central Supervisor.' });
    setTabletIDEAgents(prev => prev.map(ag => {
      if (ag.id !== agentId) return ag;
      return {
        ...ag,
        status: 'idle',
        metrics: {
          ...ag.metrics,
          cpuPercent: 4.1,
          executionDurationSeconds: 0,
        },
      };
    }));
  };

  const dispatchScriptToTablet = async (agentId: string, scriptName: string, scriptContent?: string) => {
    const target = tabletIDEAgents.find(a => a.id === agentId);
    if (!target) return;
    setTabletIDEAgents(prev => prev.map(ag => ag.id === agentId ? { ...ag, status: 'compiling' } : ag));
    addAgentLog(agentId, { level: 'info', source: 'sandbox', message: `Compiling diagnostic payload: ${scriptName}` });
    await new Promise(r => setTimeout(r, 800));
    setTabletIDEAgents(prev => prev.map(ag => ag.id === agentId ? { ...ag, status: 'executing', activeScript: scriptName, metrics: { ...ag.metrics, executionDurationSeconds: 1 } } : ag));
    addAgentLog(agentId, { level: 'info', source: 'stdout', message: `Executing ${scriptName}... PID ${target.metrics.pid}` });
  };

  const updateAgentSandboxPolicy = (agentId: string, policy: TabletIDEAgentRecord['sandboxPolicy']) => {
    setTabletIDEAgents(prev => prev.map(ag => ag.id === agentId ? { ...ag, sandboxPolicy: policy } : ag));
    addAgentLog(agentId, { level: 'warn', source: 'security', message: `Sandbox profile updated to ${String(policy).toUpperCase()}` });
  };

  const syncAgentGitRepo = async (agentId: string) => {
    addAgentLog(agentId, { level: 'info', source: 'git', message: 'git fetch origin main --prune && git checkout HEAD' });
    await new Promise(r => setTimeout(r, 700));
    addAgentLog(agentId, { level: 'info', source: 'git', message: 'Already up to date. HEAD is at 7f3a8b2' });
  };

  const updateCentralPolicy = (policy: Partial<CentralAgentPolicy>) => {
    setCentralPolicy(prev => ({ ...prev, ...policy }));
  };

  // Enterprise Tablet Developer Station Handlers
  const triggerNasProjectSync = async (agentId: string, direction: 'bidirectional' | 'push_to_nas' | 'pull_from_nas' = 'bidirectional') => {
    const target = tabletIDEAgents.find(a => a.id === agentId);
    if (!target) return;

    setTabletIDEAgents(prev => prev.map(ag => ag.id === agentId ? {
      ...ag,
      nasSync: { ...ag.nasSync, isSyncing: true }
    } : ag));

    addAgentLog(agentId, {
      level: 'info',
      source: 'nas-sync',
      message: `rsync -avz --progress --delete ${direction === 'push_to_nas' ? 'local/ -> smb://192.168.1.100/volume/projects (IP1)' : 'smb://192.168.1.100/volume/projects -> local/'}`
    });

    await new Promise(r => setTimeout(r, 900));

    setTabletIDEAgents(prev => prev.map(ag => ag.id === agentId ? {
      ...ag,
      nasSync: {
        ...ag.nasSync,
        isSyncing: false,
        lastSyncTime: 'Just now',
        pendingChangesCount: 0,
        unsyncedFiles: [],
      }
    } : ag));

    addAgentLog(agentId, {
      level: 'info',
      source: 'nas-sync',
      message: `Project sync complete: 0 diffs. Master copy on IP1 External Drive intact.`
    });

    addCentralEvent({
      targetAgentId: agentId,
      targetDeviceName: target.deviceName,
      type: 'nas_synced',
      severity: 'success',
      description: `Synchronized ${target.deviceName} workspace with Central NAS.`,
      details: `Target: smb://192.168.1.100/volume/projects (${target.nasSync.masterNasUrl})`,
    });
  };

  const updateNasSyncConfig = (agentId: string, config: Partial<NasProjectSyncConfig>) => {
    setTabletIDEAgents(prev => prev.map(ag => ag.id === agentId ? {
      ...ag,
      nasSync: { ...ag.nasSync, ...config }
    } : ag));
    addAgentLog(agentId, {
      level: 'info',
      source: 'nas-sync',
      message: `Updated sync policy: Mode=${config.syncMode || 'unchanged'}, Conflict=${config.conflictPolicy || 'unchanged'}`
    });
  };

  const triggerGitPullFromNas = async (agentId: string) => {
    const target = tabletIDEAgents.find(a => a.id === agentId);
    if (!target) return;

    addAgentLog(agentId, {
      level: 'info',
      source: 'git',
      message: `git pull origin ${target.gitStatus.currentBranch} --ff-only (Host: 192.168.1.100:GitLab)`
    });

    await new Promise(r => setTimeout(r, 700));

    setTabletIDEAgents(prev => prev.map(ag => ag.id === agentId ? {
      ...ag,
      gitStatus: {
        ...ag.gitStatus,
        behindBy: 0,
        lastFetchTime: 'Just now',
      }
    } : ag));

    addAgentLog(agentId, {
      level: 'info',
      source: 'git',
      message: `Fast-forward pull complete. HEAD is up to date with GitLab master.`
    });
  };

  const triggerGitPushToNas = async (agentId: string, commitMsg?: string) => {
    const target = tabletIDEAgents.find(a => a.id === agentId);
    if (!target) return;

    const hash = Math.random().toString(16).substring(2, 9);
    const msg = commitMsg || 'Clinical edge module updates from tablet local IDE';

    addAgentLog(agentId, {
      level: 'info',
      source: 'git',
      message: `git add -A && git commit -m "${msg}" && git push origin ${target.gitStatus.currentBranch}`
    });

    await new Promise(r => setTimeout(r, 800));

    setTabletIDEAgents(prev => prev.map(ag => ag.id === agentId ? {
      ...ag,
      gitStatus: {
        ...ag.gitStatus,
        aheadBy: 0,
        lastCommitHash: hash,
        lastCommitMessage: msg,
        uncommittedFiles: [],
        lastFetchTime: 'Just now',
      }
    } : ag));

    addAgentLog(agentId, {
      level: 'info',
      source: 'git',
      message: `Push successful to git@192.168.1.100:sallyhealth/${target.gitStatus.repoName}.git [${target.gitStatus.currentBranch} ${hash}]`
    });

    addCentralEvent({
      targetAgentId: agentId,
      targetDeviceName: target.deviceName,
      type: 'git_pushed',
      severity: 'success',
      description: `Git commit ${hash} pushed to NAS GitLab from ${target.deviceName}.`,
      details: msg,
    });
  };

  const applyAndroid12DaemonTuning = async (agentId: string | 'ALL') => {
    const targets = agentId === 'ALL' ? tabletIDEAgents : tabletIDEAgents.filter(a => a.id === agentId);
    const cmdOutput = 
`[ADB SHELL EXECUTING ON PORT 5555]
1. adb shell "/system/bin/device_config set_sync_disabled_for_tests persistent" -> SUCCESS
2. adb shell "device_config put activity_manager max_phantom_processes 2147483647" -> APPLIED (INT_MAX)
3. adb shell "settings put global settings_enable_monitor_phantom_procs false" -> DISABLED
4. adb shell "dumpsys deviceidle whitelist +com.termux" -> ADDED_TO_BATTERY_WHITELIST
5. adb shell "dumpsys deviceidle whitelist +com.termux.boot" -> ADDED_TO_BATTERY_WHITELIST
6. ~/.termux/boot/start-code-server.sh verified: [AUTO_START_DAEMON_OK]
7. termux-wake-lock: HELD [CPU_WAKELOCK_PERSISTENT]`;

    for (const t of targets) {
      setTabletIDEAgents(prev => prev.map(ag => ag.id === t.id ? {
        ...ag,
        daemonTuning: {
          ...ag.daemonTuning,
          phantomProcessFixApplied: true,
          maxPhantomProcesses: 2147483647,
          syncDisabledForTests: true,
          wakeLockAcquired: true,
          termuxBootInstalled: true,
          batteryOptimizationsIgnored: true,
          lastAdbOptimizationTimestamp: new Date().toISOString().replace('T', ' ').substring(0, 19),
        }
      } : ag));

      addAgentLog(t.id, {
        level: 'info',
        source: 'adb-daemon',
        message: 'Android 12+ Phantom Process Killer disabled via ADB. Background code-server daemon permanently protected.'
      });

      addCentralEvent({
        targetAgentId: t.id,
        targetDeviceName: t.deviceName,
        type: 'phantom_fix_applied',
        severity: 'success',
        description: `Applied Android 12+ Phantom Process Killer Fix to ${t.deviceName}.`,
        details: `max_phantom_processes=2147483647, wake lock active, boot daemon armed.`,
      });
    }

    return { success: true, output: cmdOutput };
  };

  const toggleTermuxWakeLock = (agentId: string) => {
    const target = tabletIDEAgents.find(a => a.id === agentId);
    if (!target) return;
    const nextState = !target.daemonTuning.wakeLockAcquired;

    setTabletIDEAgents(prev => prev.map(ag => ag.id === agentId ? {
      ...ag,
      daemonTuning: { ...ag.daemonTuning, wakeLockAcquired: nextState }
    } : ag));

    addAgentLog(agentId, {
      level: nextState ? 'info' : 'warn',
      source: 'wake-lock',
      message: nextState ? 'termux-wake-lock acquired: CPU deep sleep prevented during compilation.' : 'termux-wake-unlock released.'
    });
  };

  const deployFileManagerToTablet = async (agentId: string, appType: TabletFileManagerConfig['appType']) => {
    const appNames: Record<string, string> = {
      solid_explorer: 'Solid Explorer File Manager (SMB 3.1 Plugin)',
      cx_file_explorer: 'CX File Explorer (SMB / WebDAV / Cloud)',
      total_commander: 'Total Commander (LAN / SMB Plugin)',
      documents_ui: 'Android DocumentsUI (SAF SMB Provider)',
      none: 'None'
    };

    setTabletIDEAgents(prev => prev.map(ag => ag.id === agentId ? {
      ...ag,
      fileManager: {
        ...ag.fileManager,
        appType,
        appName: appNames[appType] || 'File Manager',
        status: 'syncing',
      }
    } : ag));

    addAgentLog(agentId, {
      level: 'info',
      source: 'mdm-push',
      message: `Pushed APK package: ${appNames[appType]}. Configuring SMB 3.1 client for smb://192.168.1.100/volume/projects...`
    });

    await new Promise(r => setTimeout(r, 1000));

    setTabletIDEAgents(prev => prev.map(ag => ag.id === agentId ? {
      ...ag,
      fileManager: {
        ...ag.fileManager,
        status: 'mounted',
        smbMounted: true,
        lastMountAudit: 'Just now',
      }
    } : ag));

    addAgentLog(agentId, {
      level: 'info',
      source: 'file-manager',
      message: `SMB share mounted to /sdcard/NAS_Projects from IP1 External Drive.`
    });
  };

  const mountNasShareOnTablet = async (agentId: string, nasShareUrl: string) => {
    setTabletIDEAgents(prev => prev.map(ag => ag.id === agentId ? {
      ...ag,
      fileManager: {
        ...ag.fileManager,
        nasShareUrl,
        smbMounted: true,
        status: 'mounted',
        lastMountAudit: 'Just now',
      }
    } : ag));

    addAgentLog(agentId, {
      level: 'info',
      source: 'smb-cifs',
      message: `mount -t cifs ${nasShareUrl} /sdcard/NAS_Projects -o username=dev-agent,vers=3.1.1`
    });
  };

  const toggleScrcpySession = (agentId: string, active: boolean) => {
    setTabletIDEAgents(prev => prev.map(ag => ag.id === agentId ? {
      ...ag,
      scrcpy: { ...ag.scrcpy, activeSession: active }
    } : ag));

    addAgentLog(agentId, {
      level: 'info',
      source: 'scrcpy',
      message: active 
        ? `scrcpy --tcpip=${tabletIDEAgents.find(a => a.id === agentId)?.ipAddress}:5555 --max-size=1080 --video-bit-rate=8M --stay-awake`
        : 'SCRCPY screen session disconnected.'
    });
  };

  const sendScrcpyKeyAction = (agentId: string, action: string) => {
    addAgentLog(agentId, {
      level: 'info',
      source: 'scrcpy-input',
      message: `Injected Android key event: ${action.toUpperCase()}`
    });
  };

  const runAdbShellCommand = async (agentId: string, command: string): Promise<string> => {
    const target = tabletIDEAgents.find(a => a.id === agentId);
    if (!target) return 'Error: Device not found.';

    addAgentLog(agentId, {
      level: 'info',
      source: 'adb-shell',
      message: `adb -s ${target.ipAddress}:5555 shell "${command}"`
    });

    await new Promise(r => setTimeout(r, 400));

    if (command.includes('device_config') || command.includes('phantom')) {
      return `persistent=true\nmax_phantom_processes=2147483647\nactivity_manager/settings_enable_monitor_phantom_procs=false`;
    }
    if (command.includes('pm list packages')) {
      return `package:com.termux\npackage:com.termux.boot\npackage:com.termux.api\npackage:pl.solidexplorer2\npackage:com.cxinventor.file.explorer\npackage:org.sallyhealth.rpm`;
    }
    if (command.includes('top')) {
      return `Tasks: 218 total, 2 running, 216 sleeping\nPID USER     PR  NI  VIRT  RES  SHR S  %CPU  %MEM     TIME+ COMMAND\n${target.metrics.pid} u0_a182   20   0  512M 184M  48M S  14.8   2.4   0:24.18 code-server\n4194 u0_a182   20   0   98M  42M  18M S   2.1   0.6   0:08.12 python3\n1201 root      20   0     0    0    0 S   0.8   0.0   2:14.05 kworker/u16:2`;
    }
    if (command.includes('dumpsys battery')) {
      return `Current Battery Service state:\n  AC powered: true\n  USB powered: false\n  Wireless powered: false\n  Max charging current: 3000000\n  status: 2 (Charging)\n  health: 2 (Good)\n  present: true\n  level: 98\n  scale: 100\n  voltage: 4320\n  temperature: 284 (28.4 C)\n  technology: Li-ion`;
    }
    if (command.includes('ip addr')) {
      return `wlan0: <BROADCAST,MULTICAST,UP,LOWER_UP> mtu 1500 qdisc mq state UP\n    inet ${target.ipAddress}/24 brd 192.168.1.255 scope global wlan0\n    Standard: Wi-Fi 6 (802.11ax) 5.180 GHz Ch 149 (Link: ${target.network.linkSpeedMbps} Mbps)\n    MAC: ${target.network.macAddress}`;
    }

    return `Command executed successfully on ${target.deviceName}.\nExit code: 0\n[PID ${target.metrics.pid}] STDOUT: OK`;
  };

  const triggerRemoteWorkspaceWipe = async (agentId: string, wipeType: 'workspace_only' | 'factory_reset') => {
    const target = tabletIDEAgents.find(a => a.id === agentId);
    if (!target) return;

    if (wipeType === 'workspace_only') {
      addAgentLog(agentId, {
        level: 'warn',
        source: 'mdm-wipe',
        message: 'REMOTE ENTERPRISE WORKSPACE WIPE: Deleted /data/data/com.termux/files/home/workspace, flushed SSH keys, unmounted SMB shares.'
      });
      setTabletIDEAgents(prev => prev.map(ag => ag.id === agentId ? {
        ...ag,
        workspace: {
          ...ag.workspace,
          dirtyFiles: [],
          activeFile: '',
        },
        gitStatus: {
          ...ag.gitStatus,
          uncommittedFiles: [],
          aheadBy: 0,
          behindBy: 0,
        }
      } : ag));
    } else {
      addAgentLog(agentId, {
        level: 'error',
        source: 'mdm-wipe',
        message: 'CRITICAL: Full Factory Reset command dispatched over Knox EMM / MDM.'
      });
    }

    addCentralEvent({
      targetAgentId: agentId,
      targetDeviceName: target.deviceName,
      type: 'script_terminated',
      severity: 'warning',
      description: `${wipeType === 'workspace_only' ? 'Enterprise Workspace Wipe' : 'Full Device Factory Reset'} triggered on ${target.deviceName}.`,
      details: 'All local cached code, repositories, and credentials securely sanitized.',
    });
  };

  const updateKioskMode = (agentId: string, kioskMode: TabletIDEAgentRecord['kioskMode']) => {
    setTabletIDEAgents(prev => prev.map(ag => ag.id === agentId ? { ...ag, kioskMode } : ag));
    addAgentLog(agentId, {
      level: 'info',
      source: 'mdm-policy',
      message: `Enforced Kiosk Profile: ${kioskMode.toUpperCase()}`
    });
  };

  const triggerFleetIDESweep = async () => {
    addCentralEvent({
      targetAgentId: 'ALL',
      targetDeviceName: 'All Monitored Tablet Agents',
      type: 'health_sweep',
      severity: 'info',
      description: 'Fleet IDE Supervisor Sweep initiated across all tablet daemons.',
      details: 'Evaluated memory pressure, watchdog timeouts, and security policies.',
    });
    for (const ag of tabletIDEAgents) {
      if (ag.metrics.heapUsagePercent > 65) {
        await garbageCollectAgent(ag.id);
      }
    }
  };

  return (
    <DeviceContext.Provider
      value={{
        devices,
        commands,
        firmwarePackages,
        enrollmentSessions,
        auditEvents,
        applications,
        selectedDevice,
        setSelectedDevice,
        isRealtimeActive,
        setIsRealtimeActive,

        organizations,
        currentOrganization,
        setCurrentOrganizationId,
        sites,
        currentSite,
        setCurrentSiteId,
        currentUser,
        setCurrentUserRole,

        deviceGroups,
        createDeviceGroup,
        deleteDeviceGroup,

        policies,
        createPolicy,
        publishPolicyVersion,
        rollbackPolicyVersion,
        assignPolicyToGroup,
        assignPolicyToDevice,

        complianceRules,
        toggleComplianceRule,
        runFleetComplianceEvaluation,
        executeRemediationAction,

        deploymentJobs,
        createDeploymentJob,
        cancelDeploymentJob,
        rollbackDeploymentJob,

        contentDocuments,
        uploadContentDocument,
        revokeContentDocument,

        remoteSessions,
        activeSupportSession,
        startRemoteSupportSession,
        endRemoteSupportSession,
        sendSessionChatMessage,
        transferFileToDevice,
        updateSessionNotes,

        geofences,
        createGeofence,
        deleteGeofence,

        assets,
        updateAssetLifecycle,

        patches,
        deployPatchToRing,

        scriptTemplates,
        executeScriptOnDevices,

        enterpriseAlerts,
        acknowledgeAlert,
        resolveAlert,
        createITSMTicket,

        reports,
        generateReportNow,

        executeCommand,
        createEnrollmentSession,
        completeEnrollmentFromQR,
        startFirmwareRollout,
        updateDevicePatient,
        updateDeviceConnectionMode,
        deployApplication,
        triggerQuickReboot,
        triggerQuickScreenshot,
        addAuditEvent,

        tabletIDEAgents,
        selectedIDEAgent,
        setSelectedIDEAgentId,
        centralPolicy,
        centralEvents,
        restartIDEAgent,
        garbageCollectAgent,
        terminateAgentScript,
        dispatchScriptToTablet,
        updateAgentSandboxPolicy,
        syncAgentGitRepo,
        updateCentralPolicy,
        triggerFleetIDESweep,
        clearAgentLogs,
        addAgentLog,

        triggerNasProjectSync,
        updateNasSyncConfig,
        triggerGitPullFromNas,
        triggerGitPushToNas,
        applyAndroid12DaemonTuning,
        toggleTermuxWakeLock,
        deployFileManagerToTablet,
        mountNasShareOnTablet,
        toggleScrcpySession,
        sendScrcpyKeyAction,
        runAdbShellCommand,
        triggerRemoteWorkspaceWipe,
        updateKioskMode,
      }}
    >
      {children}
    </DeviceContext.Provider>
  );
};

export const useDevices = (): DeviceContextType => {
  const context = useContext(DeviceContext);
  if (!context) {
    throw new Error('useDevices must be used within a DeviceProvider');
  }
  return context;
};
