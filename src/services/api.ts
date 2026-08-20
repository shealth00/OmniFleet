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
};
