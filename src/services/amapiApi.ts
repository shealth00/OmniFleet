import { EnrollmentSession, ConnectionMode } from '../types/device';
import { resolveHost, resolveProtocol } from './enrollmentApi';

// Same LAN-relative host resolution as enrollmentApi.ts/devicesApi.ts.
const API_BASE = `${resolveProtocol()}//${resolveHost()}:5000`;

export interface AmapiStatus {
  configured: boolean;
  enterpriseName?: string;
  error?: string;
}

export async function fetchAmapiStatus(): Promise<AmapiStatus> {
  const res = await fetch(`${API_BASE}/api/amapi/status`);
  if (!res.ok) throw new Error(`Failed to fetch AMAPI status (${res.status})`);
  return res.json();
}

export async function createAmapiEnrollmentToken(data: {
  deviceGroup?: string;
  connectionMode?: ConnectionMode;
  expiresInHours?: number;
  organization?: string;
}): Promise<{ session: EnrollmentSession; provisioningQrJson: Record<string, unknown> }> {
  const res = await fetch(`${API_BASE}/api/amapi/enrollment-tokens`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  const body = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(body.error || `Request failed (${res.status})`);

  const row = body.session;
  const session: EnrollmentSession = {
    id: row.id,
    token: row.android_enrollment_token_name || row.id,
    organization: row.organization,
    site: row.site || '',
    deviceGroup: row.device_group || '',
    connectionMode: row.connection_mode,
    targetPlatform: row.target_platform,
    assignedPolicy: row.assigned_policy || '',
    createdDate: row.created_at,
    expiresAt: row.expires_at,
    singleUse: row.single_use,
    used: row.used,
    usedByDeviceId: row.used_by_device_id || undefined,
    qrPayloadJson: JSON.stringify(body.provisioningQrJson, null, 2),
    qrSchema: 'android_zero_touch',
  };

  return { session, provisioningQrJson: body.provisioningQrJson };
}

export async function issueDeviceCommand(
  deviceId: string,
  command: string,
  payload?: Record<string, unknown>
): Promise<{ success: boolean; message: string; supported?: boolean; operationName?: string }> {
  const res = await fetch(`${API_BASE}/api/devices/${encodeURIComponent(deviceId)}/commands`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ command, payload }),
  });
  const body = await res.json().catch(() => ({}));
  if (!res.ok) return { success: false, message: body.error || `Request failed (${res.status})` };
  if (body.supported === false) return { success: false, message: body.reason || 'Not supported', supported: false };
  return { success: true, message: body.message || 'Command dispatched.', operationName: body.operation?.name };
}

export async function wipeAmapiDevice(
  deviceId: string,
  wipeDataFlags?: string[]
): Promise<{ success: boolean; message: string }> {
  const res = await fetch(`${API_BASE}/api/devices/${encodeURIComponent(deviceId)}/wipe`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ wipeDataFlags }),
  });
  const body = await res.json().catch(() => ({}));
  if (!res.ok) return { success: false, message: body.error || `Request failed (${res.status})` };
  return { success: body.success !== false, message: body.message || body.reason || 'Wipe requested.' };
}
