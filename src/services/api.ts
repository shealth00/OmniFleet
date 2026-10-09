// API client for OmniFleet backend
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

interface EnrollmentTokenResponse {
  token: string;
  expiresAt: string;
  expiresIn: number;
  message: string;
}

interface EnrollmentTokenData {
  expiresIn?: number;
}

interface DeviceEnrollmentData {
  name: string;
  type: string;
}

interface EnrolledDevice {
  id: string;
  name: string;
  type: string;
  typeLabel: string;
  status: string;
  batteryLevel: number;
  cpuUsage: number;
  ramUsage: number;
  wifiSignal: number;
  lastSeen: string;
  createdAt: string;
  enrollmentToken: string;
}

export const apiClient = {
  // Enrollment Token endpoints
  async generateEnrollmentToken(expiresIn?: number): Promise<EnrollmentTokenResponse> {
    const response = await fetch(`${API_BASE_URL}/api/enrollment/tokens`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ expiresIn: expiresIn || 86400 }),
    });
    if (!response.ok) {
      throw new Error(`Failed to generate enrollment token: ${response.statusText}`);
    }
    return response.json();
  },

  async listEnrollmentTokens() {
    const response = await fetch(`${API_BASE_URL}/api/enrollment/tokens`);
    if (!response.ok) {
      throw new Error(`Failed to list enrollment tokens: ${response.statusText}`);
    }
    return response.json();
  },

  async revokeEnrollmentToken(token: string) {
    const response = await fetch(`${API_BASE_URL}/api/enrollment/tokens/${token}`, {
      method: 'DELETE',
    });
    if (!response.ok) {
      throw new Error(`Failed to revoke enrollment token: ${response.statusText}`);
    }
    return response.json();
  },

  // Device enrollment
  async enrollDevice(token: string, deviceData: DeviceEnrollmentData): Promise<{ device: EnrolledDevice; message: string }> {
    const response = await fetch(`${API_BASE_URL}/api/devices/enroll`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-enrollment-token': token,
      },
      body: JSON.stringify(deviceData),
    });
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || `Device enrollment failed: ${response.statusText}`);
    }
    return response.json();
  },

  // Device endpoints
  async listDevices() {
    const response = await fetch(`${API_BASE_URL}/api/devices`);
    if (!response.ok) {
      throw new Error(`Failed to list devices: ${response.statusText}`);
    }
    return response.json();
  },

  async getDevice(id: string) {
    const response = await fetch(`${API_BASE_URL}/api/devices/${id}`);
    if (!response.ok) {
      throw new Error(`Failed to get device: ${response.statusText}`);
    }
    return response.json();
  },

  async createDevice(deviceData: Partial<EnrolledDevice>) {
    const response = await fetch(`${API_BASE_URL}/api/devices`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(deviceData),
    });
    if (!response.ok) {
      throw new Error(`Failed to create device: ${response.statusText}`);
    }
    return response.json();
  },

  async updateDevice(id: string, deviceData: Partial<EnrolledDevice>) {
    const response = await fetch(`${API_BASE_URL}/api/devices/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(deviceData),
    });
    if (!response.ok) {
      throw new Error(`Failed to update device: ${response.statusText}`);
    }
    return response.json();
  },

  async deleteDevice(id: string) {
    const response = await fetch(`${API_BASE_URL}/api/devices/${id}`, {
      method: 'DELETE',
    });
    if (!response.ok) {
      throw new Error(`Failed to delete device: ${response.statusText}`);
    }
    return response.json();
  },

  // Device types
  async getDeviceTypes() {
    const response = await fetch(`${API_BASE_URL}/api/device-types`);
    if (!response.ok) {
      throw new Error(`Failed to get device types: ${response.statusText}`);
    }
    return response.json();
  },

// Health check
  async healthCheck() {
    const response = await fetch(`${API_BASE_URL}/api/health`);
    if (!response.ok) {
      throw new Error(`Health check failed: ${response.statusText}`);
    }
    return response.json();
  },

  // Google EMM Integration endpoints
  async getEMMStatus() {
    const response = await fetch(`${API_BASE_URL}/api/emm/status`);
    if (!response.ok) {
      throw new Error(`Failed to get EMM status: ${response.statusText}`);
    }
    return response.json();
  },

  async initiateEMMOAuth() {
    const response = await fetch(`${API_BASE_URL}/api/emm/oauth/initiate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
    });
    if (!response.ok) {
      throw new Error(`Failed to initiate EMM OAuth: ${response.statusText}`);
    }
    return response.json();
  },

  async handleEMMOAuthCallback(code: string, state: string) {
    const response = await fetch(`${API_BASE_URL}/api/emm/oauth/callback?code=${code}&state=${state}`);
    if (!response.ok) {
      throw new Error(`Failed to handle EMM OAuth callback: ${response.statusText}`);
    }
    return response.json();
  },

  async listEnterprises() {
    const response = await fetch(`${API_BASE_URL}/api/emm/enterprises`);
    if (!response.ok) {
      throw new Error(`Failed to list enterprises: ${response.statusText}`);
    }
    return response.json();
  },

  async createEnterpriseEnrollmentToken(enterpriseId: string, duration?: number) {
    const response = await fetch(`${API_BASE_URL}/api/emm/enterprises/${enterpriseId}/enrollment-tokens`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ duration: duration || 86400 }),
    });
    if (!response.ok) {
      throw new Error(`Failed to create enrollment token: ${response.statusText}`);
    }
    return response.json();
  },

  async getEnterpriseDevices(enterpriseId: string) {
    const response = await fetch(`${API_BASE_URL}/api/emm/enterprises/${enterpriseId}/devices`);
    if (!response.ok) {
      throw new Error(`Failed to get enterprise devices: ${response.statusText}`);
    }
    return response.json();
  },

  async syncDeviceWithEMM(enterpriseId: string, deviceId: string) {
    const response = await fetch(`${API_BASE_URL}/api/emm/enterprises/${enterpriseId}/devices/${deviceId}/sync`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
    });
    if (!response.ok) {
      throw new Error(`Failed to sync device with EMM: ${response.statusText}`);
    }
    return response.json();
  },

  async getEnterpriseAuditLogs(enterpriseId: string, options?: { pageSize?: number; pageToken?: string }) {
    const params = new URLSearchParams();
    if (options?.pageSize) params.append('pageSize', options.pageSize.toString());
    if (options?.pageToken) params.append('pageToken', options.pageToken);

    const response = await fetch(
      `${API_BASE_URL}/api/emm/enterprises/${enterpriseId}/audit-logs?${params.toString()}`
    );
    if (!response.ok) {
      throw new Error(`Failed to get audit logs: ${response.statusText}`);
    }
    return response.json();
  },

  // Device Control endpoints
  async getControlDevices(filters?: { status?: string; type?: string; group?: string }) {
    const params = new URLSearchParams();
    if (filters?.status) params.append('status', filters.status);
    if (filters?.type) params.append('type', filters.type);
    if (filters?.group) params.append('group', filters.group);

    const response = await fetch(`${API_BASE_URL}/api/control/devices?${params.toString()}`);
    if (!response.ok) {
      throw new Error(`Failed to get control devices: ${response.statusText}`);
    }
    return response.json();
  },

  async issueDeviceCommand(deviceId: string, command: string, params?: Record<string, any>) {
    const response = await fetch(`${API_BASE_URL}/api/control/devices/${deviceId}/command`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ command, params }),
    });
    if (!response.ok) {
      throw new Error(`Failed to issue device command: ${response.statusText}`);
    }
    return response.json();
  },

  async pushAppToDevices(deviceIds: string[], appPackage: string, appName?: string) {
    const response = await fetch(`${API_BASE_URL}/api/control/devices/push-app`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ deviceIds, appPackage, appName }),
    });
    if (!response.ok) {
      throw new Error(`Failed to push app: ${response.statusText}`);
    }
    return response.json();
  },

  async pushPolicyToDevices(deviceIds: string[], policy: any, policyName?: string) {
    const response = await fetch(`${API_BASE_URL}/api/control/devices/push-policy`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ deviceIds, policy, policyName }),
    });
    if (!response.ok) {
      throw new Error(`Failed to push policy: ${response.statusText}`);
    }
    return response.json();
  },

  async getDeviceCommandStatus(deviceId: string, commandId: string) {
    const response = await fetch(`${API_BASE_URL}/api/control/devices/${deviceId}/command-status/${commandId}`);
    if (!response.ok) {
      throw new Error(`Failed to get command status: ${response.statusText}`);
    }
    return response.json();
  },

  async captureDeviceScreenshot(deviceId: string) {
    const response = await fetch(`${API_BASE_URL}/api/control/devices/${deviceId}/screenshot`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
    });
    if (!response.ok) {
      throw new Error(`Failed to capture screenshot: ${response.statusText}`);
    }
    return response.json();
  },

  async getDeviceTelemetry(deviceId: string) {
    const response = await fetch(`${API_BASE_URL}/api/control/devices/${deviceId}/telemetry`);
    if (!response.ok) {
      throw new Error(`Failed to get device telemetry: ${response.statusText}`);
    }
    return response.json();
  },

  async bulkDeviceAction(action: string, deviceIds: string[], parameters?: any) {
    const response = await fetch(`${API_BASE_URL}/api/control/devices/bulk-action`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action, deviceIds, parameters }),
    });
    if (!response.ok) {
      throw new Error(`Failed to execute bulk action: ${response.statusText}`);
    }
    return response.json();
  },
};
