export type PlatformType = 
  | 'android' 
  | 'wearos' 
  | 'ios' 
  | 'ipados'
  | 'macos'
  | 'windows' 
  | 'chromeos'
  | 'quest' 
  | 'custom'
  | 'iot';

export type DeviceType = 
  | 'tablet' 
  | 'phone' 
  | 'smartwatch' 
  | 'workstation' 
  | 'vr_headset' 
  | 'iot_gateway'
  | 'laptop'
  | 'rugged_handheld'
  | 'medical_display';

export type DeviceStatus = 
  | 'online' 
  | 'offline' 
  | 'updating' 
  | 'attention' 
  | 'enrolling'
  | 'quarantined'
  | 'retired'
  | 'lost'
  | 'wiped';

export type DeviceLifecycleState = 
  | 'DISCOVERED'
  | 'ENROLLMENT_PENDING'
  | 'ENROLLING'
  | 'ENROLLED'
  | 'ACTIVE'
  | 'INACTIVE'
  | 'NON_COMPLIANT'
  | 'LOST'
  | 'RETIRED'
  | 'WIPED'
  | 'DECOMMISSIONED';

export type OwnershipType = 'corporate_dedicated' | 'corporate_shared' | 'byod' | 'clinical_patient_issued';

export type ManagementMode = 
  | 'kiosk' 
  | 'mdm' 
  | 'standard' 
  | 'restricted'
  | 'work_profile'
  | 'supervised_apple'
  | 'knox_dedicated'
  | 'unattended_endpoint'
  | 'standalone_gateway';

export type ConnectionMode = ManagementMode;

export type ComplianceState = 'COMPLIANT' | 'WARNING' | 'NON_COMPLIANT' | 'UNKNOWN';

export type CapabilityType = 
  | 'REMOTE_VIEW'
  | 'REMOTE_CONTROL'
  | 'SCREENSHOT'
  | 'SCREEN_RECORDING'
  | 'WAKE'
  | 'LOCK'
  | 'UNLOCK'
  | 'REBOOT'
  | 'SHUTDOWN'
  | 'WIPE'
  | 'LOCATE'
  | 'RING'
  | 'APP_INSTALL'
  | 'APP_UNINSTALL'
  | 'APP_UPDATE'
  | 'APP_LAUNCH'
  | 'APP_BLOCK'
  | 'KIOSK_SINGLE_APP'
  | 'KIOSK_MULTI_APP'
  | 'PROFILE_MANAGEMENT'
  | 'POLICY_MANAGEMENT'
  | 'CONTENT_PUSH'
  | 'FILE_TRANSFER'
  | 'CHAT'
  | 'LOCATION'
  | 'GEOFENCE'
  | 'HEALTH_TELEMETRY'
  | 'BLE'
  | 'GATT'
  | 'HEALTH_CONNECT'
  | 'OS_UPDATE'
  | 'FIRMWARE_UPDATE'
  | 'PATCH_MANAGEMENT'
  | 'SCRIPT_EXECUTION';

export interface DeviceCapabilities {
  enrollment: boolean;
  heartbeat: boolean;
  screenshot: boolean;
  liveScreen: boolean;
  remoteControl: boolean;
  appLaunch: boolean;
  kiosk: boolean;
  mdm: boolean;
  healthTelemetry: boolean;
  vrTelemetry?: boolean;
  otaFirmware: boolean;
  reboot: boolean;
  shutdown: boolean;
  bleGatt: boolean;
  fileTransfer?: boolean;
  scriptExecution?: boolean;
  patchManagement?: boolean;
  geofence?: boolean;
  chat?: boolean;
  capabilitiesList?: CapabilityType[];
}

export interface DeviceLocation {
  latitude: number;
  longitude: number;
  accuracyMeters: number;
  altitudeMeters?: number;
  address?: string;
  facilityArea?: string;
  insideGeofence: boolean;
  geofenceName?: string;
  lastUpdated: string;
}

export interface HardwareTelemetry {
  batteryLevel: number; // 0-100
  isCharging: boolean;
  temperatureCelsius: number;
  cpuUsagePercent: number;
  ramUsagePercent: number;
  storageUsedGb: number;
  storageTotalGb: number;
  wifiSsid: string;
  wifiSignalDbm: number; // e.g. -55 dBm
  ipAddress: string;
  macAddress: string;
  screenOn: boolean;
  screenLocked: boolean;
  currentForegroundApp: string;
  lastHeartbeat: string;
  lastSync: string;
  uptimeHours: number;
}

export type WearableBLEState = 
  | 'BLUETOOTH_SCANNING'
  | 'BLUETOOTH_CONNECTED'
  | 'GATT_SERVICES_DISCOVERED'
  | 'NOTIFICATIONS_SUBSCRIBED'
  | 'AUTHENTICATION_IN_PROGRESS'
  | 'AUTHENTICATED'
  | 'TELEMETRY_STREAMING'
  | 'TELEMETRY_PAUSED'
  | 'DISCONNECTED'
  | 'ERROR';

export interface RPMVitalsTelemetry {
  heartRateBpm: number;
  spo2Percent: number;
  hrvMs: number;
  respiratoryRate: number;
  skinTempCelsius: number;
  activityState: 'resting' | 'walking' | 'active' | 'sleeping';
  stepCount: number;
  fallDetected: boolean;
  bleStatus: 'connected' | 'disconnected' | 'pairing' | 'auth_failed';
  wearableState?: WearableBLEState;
  gattDiscovered: boolean;
  healthConnectSynced: boolean;
  lastRpmSync: string;
  alertFlag?: 'normal' | 'warning' | 'critical';
  alertReason?: string;
  rawGattRssi?: number;
  bloodPressureSystolic?: number;
  bloodPressureDiastolic?: number;
  bloodGlucoseMgDl?: number;
}

export interface PatientAssignment {
  patientId: string;
  patientName: string;
  medicalRecordNumber: string;
  careTeam: string;
  assignedDate: string;
  monitoringProtocol: string;
  assignmentStatus?: 'UNASSIGNED' | 'ASSIGNED' | 'SUSPENDED' | 'RETURNED';
  assignmentAdmin?: string;
  // ehr_system's device-pairing identifier (cm_patients.pcn) — distinct
  // from medicalRecordNumber above, not a clinical MRN.
  pcn?: string;
}

export interface DeviceRecord {
  id: string;
  deviceId?: string;
  name: string;
  serialNumber: string;
  assetTag: string;
  imei?: string;
  platform: PlatformType;
  deviceType: DeviceType;
  model: string;
  manufacturer: string;
  osVersion: string;
  firmwareVersion: string;
  status: DeviceStatus;
  lifecycleState?: DeviceLifecycleState;
  complianceState?: ComplianceState;
  complianceReason?: string;
  ownershipType?: OwnershipType;
  managementMode: ManagementMode;
  connectionMode?: ManagementMode;
  organization: string;
  organizationId?: string;
  site: string;
  siteId?: string;
  deviceGroup: string;
  groupId?: string;
  userId?: string;
  capabilities: DeviceCapabilities;
  capabilitiesList?: CapabilityType[];
  telemetry: HardwareTelemetry;
  location?: DeviceLocation;
  rpmVitals?: RPMVitalsTelemetry;
  patient?: PatientAssignment;
  installedApps: string[];
  enrolledAt: string;
  lastSeen?: string;
  tags: string[];
  assignedPolicyId?: string;
  assignedPolicyVersion?: string;
  pendingUpdate?: {
    targetVersion: string;
    stage: 'queued' | 'downloading' | 'verifying' | 'installing' | 'rebooting' | 'verified';
    progressPercent: number;
    initiatedAt: string;
  };
  // True only for a device genuinely under Android Management API (AMAPI)
  // Device Owner control — everything else (including simulated/demo
  // Android rows) is registration-only and must not claim real capabilities.
  isAmapiManaged?: boolean;
  amapiDeviceName?: string;
  amapiState?: string;
  // 'wear_os' vs 'phone_tablet' — Wear OS watches get a distinct AMAPI
  // policy namespace and enrollment flow (see OmniFleet-Backend's
  // routes/amapi.js policyNameForConnectionMode).
  deviceCategory?: 'wear_os' | 'phone_tablet';
  // Patient linkage for clinically-issued devices (watches) — mirrors
  // OmniFleet-Backend's devices.pcn/patient_email/patient_portal_user_id.
  // Deliberately separate from PatientAssignment.medicalRecordNumber below:
  // pcn is ehr_system's device-pairing identifier, not a clinical MRN.
  pcn?: string;
  patientEmail?: string;
  patientPortalUserId?: string;
  // Raw-sensor "confirmation" signal state (Samsung Health Sensor SDK via
  // sally health bridge's Wear OS module) — never raw waveform data, only
  // that a signal was seen. Drives the "call the patient" follow-up trigger.
  lastSignalConfirmedAt?: string;
  signalQuality?: string;
}

export interface CommandItem {
  id: string;
  command:
    | 'launch_app'
    | 'close_app'
    | 'open_url'
    | 'wake'
    | 'lock'
    | 'unlock'
    | 'reboot'
    | 'shutdown'
    | 'set_kiosk'
    | 'sync_mdm'
    | 'capture_screenshot'
    | 'push_config'
    | 'ota_update'
    | 'trigger_self_diagnostic'
    | 'reset_password'
    | 'clear_app_data'
    | 'start_lost_mode'
    | 'stop_lost_mode'
    | 'wipe_device';
  label: string;
  payload?: Record<string, unknown>;
  targetDeviceIds: string[];
  targetFilterDescription: string;
  initiatedBy: string;
  timestamp: string;
  status: 'queued' | 'transmitting' | 'in_progress' | 'completed' | 'failed' | 'partially_failed';
  deviceResults: {
    deviceId: string;
    deviceName: string;
    platform: PlatformType;
    status: 'pending' | 'success' | 'failed' | 'timeout';
    message: string;
    durationMs: number;
    acknowledgedAt?: string;
  }[];
}

export interface FirmwarePackage {
  id: string;
  version: string;
  platform: PlatformType;
  targetModels: string[];
  releaseDate: string;
  channel: 'stable' | 'beta' | 'emergency';
  sizeMb: number;
  sha256Checksum: string;
  releaseNotes: string[];
  minBatteryRequired: number; // e.g. 50%
  requiresAcPower: boolean;
  minStorageMb: number;
  activeRolloutCount: number;
  installedCount: number;
}

export interface EnrollmentSession {
  id: string;
  token: string;
  organization: string;
  site: string;
  deviceGroup: string;
  connectionMode: ConnectionMode;
  targetPlatform: PlatformType;
  assignedPolicy: string;
  createdDate: string;
  expiresAt: string;
  singleUse: boolean;
  used: boolean;
  usedByDeviceId?: string;
  qrPayloadJson: string;
  // 'android_zero_touch' sessions are completed by Android's own setup
  // wizard scanning a real Google provisioning QR — never by a browser POST
  // to /complete, unlike the default 'omnifleet_custom' shape.
  qrSchema?: 'omnifleet_custom' | 'android_zero_touch';
}

export interface ApplicationPackage {
  id: string;
  name: string;
  packageIdentifier: string; // e.g. org.sallyhealth.rpm
  version: string;
  platforms: PlatformType[];
  platform?: PlatformType;
  distributionType?: 'google_play' | 'apple_store' | 'enterprise_apk' | 'windows_msi' | 'macos_pkg' | 'web_app';
  sizeMb?: number;
  category: 'clinical' | 'telemetry' | 'system' | 'security' | 'kiosk';
  icon: string;
  description: string;
  requiredPermissions: string[];
  isForegroundDefault: boolean;
  autoUpdate: boolean;
  assignedGroups: string[];
}

export interface DeviceAuditEvent {
  id: string;
  deviceId?: string;
  deviceName?: string;
  actor: string;
  action: string;
  category: 'command' | 'enrollment' | 'firmware' | 'security' | 'rpm_alert' | 'telemetry';
  severity: 'info' | 'warning' | 'error' | 'success';
  timestamp: string;
  details: string;
}
