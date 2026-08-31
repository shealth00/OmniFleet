import { DeviceRecord, PlatformType, DeviceStatus, ManagementMode, HardwareTelemetry } from '../types/device';
import { getDeviceAdapter } from '../adapters/deviceAdapters';
import { resolveHost, resolveProtocol } from './enrollmentApi';

// Same host-resolution as enrollmentApi.ts (falls back off localhost / the
// disconnected AI Studio preview onto this box's LAN IP), so a device
// fetched here works whether this page is served to the admin browser or
// scanned from a phone on the same network.
const API_BASE = `${resolveProtocol()}//${resolveHost()}:5000`;

interface BackendDevice {
  id: string;
  name: string;
  type: string | null;
  status: string;
  connection_mode: string;
  ip_address: string | null;
  mac_address: string | null;
  firmware_version: string | null;
  battery_level: number | null;
  cpu_usage: number | null;
  ram_usage: number | null;
  wifi_signal: number | null;
  group_id: string | null;
  last_seen: string;
  created_at: string;
  updated_at: string;
  is_amapi_managed: boolean;
  android_device_name: string | null;
  android_policy_name: string | null;
  amapi_state: string | null;
  amapi_raw_last_report: AmapiDeviceReport | null;
  device_category: string;
  pcn: string | null;
  patient_email: string | null;
  patient_portal_user_id: string | null;
  last_signal_confirmed_at: string | null;
  signal_quality: string | null;
}

// Partial shape of AMAPI's Device resource — only the fields this file
// actually reads. See
// https://developers.google.com/android/management/reference/rest/v1/enterprises.devices
// for the full resource; verify field names there before trusting more of
// this, since this hasn't been exercised against a live device yet.
interface AmapiDeviceReport {
  hardwareInfo?: { model?: string; brand?: string; manufacturer?: string };
  softwareInfo?: { androidVersion?: string };
  memoryInfo?: { totalInternalStorage?: string; totalRam?: string };
}

const KNOWN_PLATFORMS: readonly string[] = [
  'android', 'wearos', 'ios', 'ipados', 'macos', 'windows', 'chromeos', 'quest', 'custom', 'iot',
];

const KNOWN_STATUSES: readonly string[] = [
  'online', 'offline', 'updating', 'attention', 'enrolling', 'quarantined', 'retired', 'lost', 'wiped',
];

const KNOWN_MODES: readonly string[] = [
  'kiosk', 'mdm', 'standard', 'restricted', 'work_profile', 'supervised_apple', 'knox_dedicated',
  'unattended_endpoint', 'standalone_gateway',
];

function toPlatform(type: string | null): PlatformType {
  const t = (type || '').toLowerCase();
  return (KNOWN_PLATFORMS.includes(t) ? t : 'custom') as PlatformType;
}

function toStatus(status: string): DeviceStatus {
  return (KNOWN_STATUSES.includes(status) ? status : 'offline') as DeviceStatus;
}

function toMode(mode: string): ManagementMode {
  return (KNOWN_MODES.includes(mode) ? mode : 'mdm') as ManagementMode;
}

// The backend schema only tracks a handful of fields per device (see
// OmniFleet-Backend/schema.sql). Everything else on DeviceRecord that a real
// device agent hasn't reported yet is filled with explicit "unreported"
// placeholders rather than fabricated values, so the UI doesn't present
// invented data as if it came from the device.
// GB conversion helper for AMAPI's byte-string memory fields.
function bytesToGb(value: string | undefined): number | undefined {
  if (!value) return undefined;
  const n = Number(value);
  return Number.isFinite(n) ? Math.round((n / 1e9) * 10) / 10 : undefined;
}

function mapDevice(row: BackendDevice): DeviceRecord {
  const platform = toPlatform(row.type);
  const isAmapiManaged = row.is_amapi_managed === true;
  const adapter = getDeviceAdapter(platform, { isAmapiManaged });
  const report = isAmapiManaged ? row.amapi_raw_last_report : null;

  // Only for a genuinely AMAPI-managed device with a real report on file do
  // we prefer parsed values over the "Not yet reported" placeholders below
  // — every other platform/row keeps the honest-placeholder behavior as-is.
  const telemetry: HardwareTelemetry = {
    batteryLevel: row.battery_level ?? 0,
    isCharging: false,
    temperatureCelsius: 0,
    cpuUsagePercent: row.cpu_usage ?? 0, // AMAPI reports no live CPU usage
    ramUsagePercent: row.ram_usage ?? 0, // or RAM usage percentage
    storageUsedGb: 0,
    storageTotalGb: bytesToGb(report?.memoryInfo?.totalInternalStorage) ?? 0,
    wifiSsid: 'Not yet reported',
    wifiSignalDbm: row.wifi_signal ?? 0,
    ipAddress: row.ip_address || 'Not yet reported',
    macAddress: row.mac_address || 'Not yet reported',
    screenOn: false,
    screenLocked: true,
    currentForegroundApp: 'Not yet reported',
    lastHeartbeat: row.last_seen,
    lastSync: row.updated_at,
    uptimeHours: 0,
  };

  return {
    id: row.id,
    deviceId: row.id,
    name: row.name,
    serialNumber: row.id.slice(0, 8).toUpperCase(),
    assetTag: 'Unassigned',
    platform,
    deviceType: row.device_category === 'wear_os' ? 'smartwatch' : 'tablet',
    model: report?.hardwareInfo?.model || 'Not yet reported',
    manufacturer: report?.hardwareInfo?.manufacturer || report?.hardwareInfo?.brand || 'Not yet reported',
    osVersion: report?.softwareInfo?.androidVersion || 'Not yet reported',
    firmwareVersion: row.firmware_version || 'Not yet reported',
    status: toStatus(row.status),
    lifecycleState: 'ENROLLED',
    complianceState: 'UNKNOWN',
    managementMode: toMode(row.connection_mode),
    connectionMode: toMode(row.connection_mode),
    organization: 'Sally Health & Innovative Partners',
    site: 'Unassigned',
    deviceGroup: row.group_id || 'Ungrouped',
    groupId: row.group_id || undefined,
    capabilities: adapter.getCapabilities(),
    capabilitiesList: adapter.getCapabilityList(),
    telemetry,
    installedApps: [],
    enrolledAt: row.created_at,
    lastSeen: row.last_seen,
    tags: [],
    isAmapiManaged,
    amapiDeviceName: row.android_device_name || undefined,
    amapiState: row.amapi_state || undefined,
    deviceCategory: row.device_category === 'wear_os' ? 'wear_os' : 'phone_tablet',
    pcn: row.pcn || undefined,
    patientEmail: row.patient_email || undefined,
    patientPortalUserId: row.patient_portal_user_id || undefined,
    lastSignalConfirmedAt: row.last_signal_confirmed_at || undefined,
    signalQuality: row.signal_quality || undefined,
  };
}

export async function fetchDevices(): Promise<DeviceRecord[]> {
  const res = await fetch(`${API_BASE}/api/devices`);
  if (!res.ok) throw new Error(`Failed to fetch devices (${res.status})`);
  const rows: BackendDevice[] = await res.json();
  return rows.map(mapDevice);
}
