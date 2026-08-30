import { EnrollmentSession, ConnectionMode, PlatformType } from '../types/device';

// Reach the backend on whatever host served this page (works for the admin
// browser and for a phone that scanned a QR pointing at the LAN IP).
const API_BASE = `${window.location.protocol}//${window.location.hostname}:5000`;

interface BackendEnrollmentSession {
  id: string;
  token: string;
  organization: string;
  site: string | null;
  device_group: string | null;
  connection_mode: ConnectionMode;
  target_platform: PlatformType;
  assigned_policy: string | null;
  single_use: boolean;
  used: boolean;
  used_by_device_id: string | null;
  last_used_at: string | null;
  expires_at: string;
  created_at: string;
}

function buildQrPayload(session: BackendEnrollmentSession): string {
  return JSON.stringify(
    {
      enrollmentPortalUrl: `${window.location.origin}/?enroll=${session.token}`,
      token: session.token,
      org: session.organization,
      site: session.site,
      group: session.device_group,
      policy: session.assigned_policy,
      platform: session.target_platform,
      mode: session.connection_mode,
      exp: session.expires_at,
    },
    null,
    2
  );
}

function mapSession(row: BackendEnrollmentSession): EnrollmentSession {
  return {
    id: row.id,
    token: row.token,
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
    qrPayloadJson: buildQrPayload(row),
  };
}

export async function fetchEnrollmentSessions(): Promise<EnrollmentSession[]> {
  const res = await fetch(`${API_BASE}/api/enrollment-sessions`);
  if (!res.ok) throw new Error(`Failed to fetch enrollment sessions (${res.status})`);
  const rows: BackendEnrollmentSession[] = await res.json();
  return rows.map(mapSession);
}

export async function createEnrollmentSessionRemote(data: {
  organization: string;
  site?: string;
  deviceGroup?: string;
  connectionMode?: ConnectionMode;
  targetPlatform?: PlatformType;
  assignedPolicy?: string;
  singleUse?: boolean;
  expiresInHours?: number;
}): Promise<EnrollmentSession> {
  const res = await fetch(`${API_BASE}/api/enrollment-sessions`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: `Request failed (${res.status})` }));
    throw new Error(err.error || `Request failed (${res.status})`);
  }
  return mapSession(await res.json());
}

export async function fetchEnrollmentSessionByToken(token: string): Promise<EnrollmentSession | null> {
  const res = await fetch(`${API_BASE}/api/enrollment-sessions/${encodeURIComponent(token)}`);
  if (res.status === 404) return null;
  if (!res.ok) throw new Error(`Failed to fetch enrollment session (${res.status})`);
  return mapSession(await res.json());
}

export async function completeEnrollmentRemote(
  token: string,
  deviceData: { name?: string; type?: string; ipAddress?: string; macAddress?: string; firmwareVersion?: string }
): Promise<{ success: boolean; message: string; backendDeviceId?: string }> {
  const res = await fetch(`${API_BASE}/api/enrollment-sessions/${encodeURIComponent(token)}/complete`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(deviceData),
  });
  const body = await res.json().catch(() => ({}));
  if (!res.ok) {
    return { success: false, message: body.error || `Enrollment failed (${res.status})` };
  }
  return { success: true, message: 'Device successfully enrolled.', backendDeviceId: body.device?.id };
}
