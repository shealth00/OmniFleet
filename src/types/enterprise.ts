import { PlatformType, DeviceType, ComplianceState } from './device';

// 1. Organization & Multi-Tenant
export interface Organization {
  id: string;
  name: string;
  code: string;
  contactEmail: string;
  licenseTier: 'Enterprise Plus' | 'Healthcare Dedicated' | 'Standard MDM';
  deviceCount: number;
  activeSitesCount: number;
  createdAt: string;
}

export interface Site {
  id: string;
  organizationId: string;
  name: string;
  code: string;
  facilityType: 'SNF' | 'Hospital' | 'Ambulatory Care' | 'Home Health Hub' | 'Regional Data Center';
  address: string;
  city: string;
  state: string;
  timezone: string;
  deviceCount: number;
  activePatientCount: number;
}

export type UserRole = 
  | 'super_admin'
  | 'org_admin'
  | 'site_admin'
  | 'device_admin'
  | 'helpdesk_tech'
  | 'security_admin'
  | 'clinical_rpm_admin'
  | 'auditor';

export interface EnterpriseUser {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  organizationId: string;
  assignedSiteIds: string[];
  department: string;
  lastLogin: string;
  avatarUrl?: string;
}

// 2. Device Groups & Dynamic Engine
export type GroupType = 'static' | 'dynamic';

export interface DynamicGroupRule {
  id: string;
  field: 'platform' | 'deviceType' | 'osVersion' | 'batteryLevel' | 'complianceState' | 'locationGeofence' | 'lastHeartbeatMinutes' | 'rpmAlertFlag' | 'model';
  operator: 'equals' | 'not_equals' | 'less_than' | 'greater_than' | 'contains' | 'in';
  value: string | number | boolean;
}

export interface DeviceGroupRecord {
  id: string;
  organizationId: string;
  siteId?: string;
  name: string;
  description: string;
  type: GroupType;
  deviceCount: number;
  rules?: DynamicGroupRule[];
  assignedPolicyId?: string;
  assignedPolicyName?: string;
  tags: string[];
  createdAt: string;
}

// 3. Profiles & Policy Engine
export type PolicyCategory = 'security' | 'network' | 'hardware' | 'application' | 'browser' | 'kiosk';

export interface SecurityPolicyConfig {
  passcodeRequired: boolean;
  minPasscodeLength: number;
  passcodeComplexity: 'alphanumeric' | 'numeric' | 'complex';
  maxFailedAttempts: number;
  screenTimeoutSeconds: number;
  storageEncryptionRequired: boolean;
  biometricsAllowed: boolean;
  lostModeEnabled: boolean;
  remoteWipeOnBruteForce: boolean;
}

export interface NetworkPolicyConfig {
  wifiSsid: string;
  wifiSecurity: 'WPA2-Enterprise' | 'WPA3' | 'WPA2-PSK' | '802.1X EAP-TLS';
  vpnRequired: boolean;
  vpnProfileName?: string;
  proxyHost?: string;
  proxyPort?: number;
  enforceCertificatePinning: boolean;
  allowCellularData: boolean;
}

export interface HardwarePolicyConfig {
  cameraEnabled: boolean;
  bluetoothEnabled: boolean;
  usbDataEnabled: boolean;
  microphoneEnabled: boolean;
  externalStorageAllowed: boolean;
  allowScreenshots: boolean;
  hardwareVolumeControlEnabled: boolean;
  powerButtonLockout: boolean;
}

export interface ApplicationPolicyConfig {
  allowlistedPackageIds: string[];
  blocklistedPackageIds: string[];
  requiredMandatoryApps: string[];
  prohibitedApps: string[];
  allowUnknownSources: boolean;
  autoGrantRuntimePermissions: boolean;
  allowAppUninstall: boolean;
}

export interface BrowserPolicyConfig {
  allowedUrls: string[];
  blockedUrls: string[];
  allowPopups: boolean;
  clearCookiesOnExit: boolean;
  forceSafeSearch: boolean;
  webKioskStartUrl?: string;
}

export interface KioskPolicyConfig {
  mode: 'single_app' | 'multi_app' | 'custom_launcher';
  primaryPackageId: string;
  allowedAppIcons?: string[];
  customWallpaperUrl?: string;
  kioskExitPin: string;
  enableStatusBar: boolean;
  enableNavigationBar: boolean;
  enableSettingsAccess: boolean;
  patientEmergencyCallEnabled: boolean;
}

export interface PolicyVersionRecord {
  version: string;
  publishedAt: string;
  publishedBy: string;
  changeSummary: string;
  security: SecurityPolicyConfig;
  network: NetworkPolicyConfig;
  hardware: HardwarePolicyConfig;
  application: ApplicationPolicyConfig;
  browser: BrowserPolicyConfig;
  kiosk: KioskPolicyConfig;
}

export interface EnterprisePolicyRecord {
  id: string;
  organizationId: string;
  name: string;
  description: string;
  targetPlatforms: PlatformType[];
  currentVersion: string;
  status: 'published' | 'draft' | 'deprecated';
  assignedGroupsCount: number;
  assignedDevicesCount: number;
  activeConfig: PolicyVersionRecord;
  versionHistory: PolicyVersionRecord[];
  createdAt: string;
  updatedAt: string;
}

// 4. Compliance Engine
export interface ComplianceRuleRecord {
  id: string;
  organizationId: string;
  name: string;
  description: string;
  severity: 'critical' | 'high' | 'medium' | 'low';
  ruleType: 
    | 'min_battery'
    | 'os_version_min'
    | 'required_app_installed'
    | 'blocked_app_detected'
    | 'root_or_jailbreak'
    | 'encryption_enabled'
    | 'passcode_compliant'
    | 'geofence_boundary'
    | 'heartbeat_staleness'
    | 'rpm_telemetry_healthy';
  conditionValue: string | number | boolean;
  autoRemediationAction: 
    | 'none'
    | 'notify_admin'
    | 'remote_lock'
    | 'quarantine_device'
    | 'wipe_corporate_data'
    | 'create_support_ticket'
    | 'force_policy_sync';
  isEnabled: boolean;
  violationCount: number;
  targetPlatforms?: string[];
}

// 5. Software Deployments & Catalog
export type AppCatalogType = 
  | 'google_play'
  | 'apple_appstore'
  | 'windows_msi_exe'
  | 'macos_pkg'
  | 'android_apk'
  | 'enterprise_internal'
  | 'web_app';

export interface DeploymentJobRecord {
  id: string;
  applicationId: string;
  applicationName: string;
  targetVersion: string;
  targetGroupNames: string[];
  targetDeviceIds: string[];
  deploymentRing: 'CANARY' | 'PILOT' | 'PRODUCTION';
  scheduleType: 'immediate' | 'maintenance_window';
  scheduledTime?: string;
  retryLimit: number;
  autoRollbackOnFailureRatePercent?: number;
  status: 'scheduled' | 'in_progress' | 'completed' | 'failed' | 'rolling_back';
  totalTargets: number;
  successfulCount: number;
  failedCount: number;
  inProgressCount: number;
  initiatedBy: string;
  createdAt: string;
}

// 6. Content Distribution Management
export interface ContentDocumentRecord {
  id: string;
  organizationId: string;
  title: string;
  category: 'clinical_protocol' | 'training_video' | 'compliance_manual' | 'configuration_file' | 'patient_guide';
  fileType: 'pdf' | 'mp4' | 'json' | 'docx' | 'xml';
  fileSizeMb: number;
  version: string;
  isEncryptedAtRest: boolean;
  assignedGroups: string[];
  expiresAt?: string;
  downloadedDevicesCount: number;
  targetDevicesCount: number;
  uploadedBy: string;
  uploadedAt: string;
}

// 7. Remote Support Sessions & Attended/Unattended
export type SupportSessionType = 'attended' | 'unattended';
export type SupportSessionState = 
  | 'REQUESTED'
  | 'AUTHORIZING'
  | 'CONNECTED'
  | 'ACTIVE'
  | 'DISCONNECTED'
  | 'TERMINATED'
  | 'FAILED';

export interface RemoteSupportSessionRecord {
  id: string;
  deviceId: string;
  deviceName: string;
  platform: PlatformType;
  deviceType: DeviceType;
  technicianId: string;
  technicianName: string;
  sessionType: SupportSessionType;
  status: SupportSessionState;
  userConsentGranted?: boolean;
  isRecording: boolean;
  startTime: string;
  endTime?: string;
  durationSeconds: number;
  fps: number;
  latencyMs: number;
  quality: '1080p' | '720p' | '480p';
  sessionNotes?: string;
  chatMessages: {
    id: string;
    sender: 'technician' | 'device_user' | 'system';
    message: string;
    timestamp: string;
  }[];
  transferredFiles: {
    id: string;
    fileName: string;
    sizeKb: number;
    status: 'uploaded' | 'transferring' | 'completed';
    timestamp: string;
  }[];
}

// 8. Locations & Geofences
export interface GeofenceZoneRecord {
  id: string;
  organizationId: string;
  siteId: string;
  name: string;
  facilityType: string;
  centerLatitude: number;
  centerLongitude: number;
  radiusMeters: number;
  activeDeviceCount: number;
  alertOnExit: boolean;
  alertOnEnter: boolean;
  enforceComplianceLockoutOnExit: boolean;
  violationCount24h: number;
  description: string;
}

// 9. Asset Inventory & Hardware Lifecycle
export type AssetLifecycleState = 
  | 'IN_STOCK'
  | 'ASSIGNED'
  | 'DEPLOYED'
  | 'REPAIR'
  | 'LOST'
  | 'RETIRED'
  | 'DISPOSED';

export interface AssetInventoryRecord {
  id: string;
  assetTag: string;
  serialNumber: string;
  imei?: string;
  macAddress: string;
  deviceId?: string;
  deviceName: string;
  model: string;
  manufacturer: string;
  platform: PlatformType;
  purchaseDate: string;
  warrantyExpiryDate: string;
  warrantyExpiresAt?: string;
  vendor: string;
  purchaseCostUsd: number;
  lifecycleState: AssetLifecycleState;
  assignedSite: string;
  assignedPatientOrUser?: string;
  assignedPatientName?: string;
  assignedPatientId?: string;
  repairNotes?: string;
  lastInventoryAuditDate: string;
  hardwareSpecs?: {
    ramGb: number;
    storageGb: number;
    batteryHealthPercent: number;
    cpuCores: number;
  };
}

// 10. Patch & OS Update Management
export interface PatchRecord {
  id: string;
  patchCode: string; // e.g. KB5034441 or Android-SEC-2026-08
  cveId?: string;
  title: string;
  description?: string;
  platform: PlatformType;
  vendor?: string;
  severity: 'critical' | 'security' | 'feature' | 'driver' | 'high' | 'medium' | 'low';
  releaseDate: string;
  rebootRequired: boolean;
  requiresReboot?: boolean;
  applicableDevicesCount: number;
  affectedEndpointsCount?: number;
  installedDevicesCount: number;
  installedCount?: number;
  failedDevicesCount: number;
  pendingCount?: number;
  rolloutRing: 'CANARY' | 'PILOT' | 'PRODUCTION';
  maintenanceWindow: string; // e.g. "02:00 - 04:00 CST"
  status: 'available' | 'deploying' | 'verified' | 'delayed' | 'deployed';
}

// 11. Script & Automation Engine
export interface ScriptTemplateRecord {
  id: string;
  name: string;
  language: 'powershell' | 'bash' | 'python' | 'node' | 'shell';
  targetPlatforms: PlatformType[];
  category: 'diagnostics' | 'cache_clean' | 'ble_reset' | 'kiosk_restart' | 'log_collector' | 'network_fix';
  description: string;
  scriptContent: string;
  scriptBody?: string;
  timeoutSeconds: number;
  requiresElevatedPrivileges: boolean;
  executionCount: number;
  lastExecutedAt?: string;
}

// 12. Alert Center & Ticketing / ITSM
export type AlertSeverity = 'INFO' | 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
export type AlertType = 
  | 'DEVICE_OFFLINE'
  | 'LOW_BATTERY'
  | 'NON_COMPLIANT'
  | 'APP_MISSING'
  | 'APP_OUTDATED'
  | 'OS_OUTDATED'
  | 'GEOFENCE_VIOLATION'
  | 'SECURITY_EVENT'
  | 'ENROLLMENT_FAILURE'
  | 'DEPLOYMENT_FAILURE'
  | 'BLE_DISCONNECTED'
  | 'RPM_TELEMETRY_DELAY'
  | 'HEALTH_CONNECT_ERROR'
  | 'REMOTE_SESSION_FAILURE';

export interface EnterpriseAlertRecord {
  id: string;
  organizationId: string;
  siteId: string;
  deviceId?: string;
  deviceName?: string;
  patientId?: string;
  patientName?: string;
  type: AlertType;
  severity: AlertSeverity;
  title: string;
  description: string;
  timestamp: string;
  status: 'active' | 'acknowledged' | 'resolved' | 'suppressed';
  assignedTo?: string;
  ticketId?: string;
  ticketSystem?: 'ServiceNow' | 'Jira Service Desk' | 'Zendesk' | 'Internal ITSM';
  ticketUrl?: string;
  comments?: {
    author: string;
    text: string;
    timestamp: string;
  }[];
}

// 13. Reporting Center
export interface ReportDefinition {
  id: string;
  title: string;
  category: 'fleet' | 'security' | 'applications' | 'operations' | 'rpm';
  description: string;
  lastGeneratedAt: string;
  scheduleFrequency: 'Daily (06:00)' | 'Weekly (Mon 00:00)' | 'Monthly' | 'On-Demand';
  format: 'PDF' | 'CSV' | 'XLSX' | 'JSON';
  recordCount: number;
}
