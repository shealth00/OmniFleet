import express from 'express';
import cors from 'cors';
import { v4 as uuidv4 } from 'uuid';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
app.use(cors());
app.use(express.json());

// Serve static frontend files
app.use(express.static(path.join(__dirname, 'dist')));

// Valid device types
const DEVICE_TYPES = {
  'android-11': 'Android 11',
  'android-12': 'Android 12',
  'android-13': 'Android 13',
  'android-14': 'Android 14',
  'iphone': 'iPhone',
  'iphone-15': 'iPhone 15',
  'iphone-14': 'iPhone 14',
  'macos': 'macOS',
  'macos-sonoma': 'macOS Sonoma',
  'macos-ventura': 'macOS Ventura',
  'ipad': 'iPad',
  'ipad-pro': 'iPad Pro',
  'smartwatch': 'Smartwatch',
  'wearable': 'Wearable',
  'smartphone': 'Smartphone',
  'tablet': 'Tablet',
};

// In-memory device storage
let devices = [
  {
    id: uuidv4(),
    name: 'Apple Watch Series 9',
    type: 'wearable',
    status: 'connected',
    batteryLevel: 85,
    cpuUsage: 12,
    ramUsage: 45,
    wifiSignal: -45,
    lastSeen: new Date(),
    createdAt: new Date(),
    enrollmentToken: null,
  },
  {
    id: uuidv4(),
    name: 'Pixel 8 Pro',
    type: 'smartphone',
    status: 'connected',
    batteryLevel: 72,
    cpuUsage: 28,
    ramUsage: 62,
    wifiSignal: -30,
    lastSeen: new Date(),
    createdAt: new Date(),
    enrollmentToken: null,
  },
];

// In-memory enrollment tokens (token -> {deviceId, createdAt, expiresAt})
let enrollmentTokens = new Map();

// Token validation middleware
const validateEnrollmentToken = (req, res, next) => {
  const token = req.headers['x-enrollment-token'];
  if (!token) {
    return res.status(401).json({ error: 'Enrollment token required' });
  }

  const tokenData = enrollmentTokens.get(token);
  if (!tokenData) {
    return res.status(401).json({ error: 'Invalid enrollment token' });
  }

  if (new Date() > tokenData.expiresAt) {
    enrollmentTokens.delete(token);
    return res.status(401).json({ error: 'Enrollment token expired' });
  }

  req.enrollmentToken = tokenData;
  next();
};

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date(), version: '1.0.0' });
});

// ENROLLMENT TOKEN ENDPOINTS

// Generate enrollment token
app.post('/api/enrollment/tokens', (req, res) => {
  const { expiresIn = 86400 } = req.body; // default 24 hours
  const token = uuidv4();
  const expiresAt = new Date(Date.now() + expiresIn * 1000);

  enrollmentTokens.set(token, {
    token,
    createdAt: new Date(),
    expiresAt,
  });

  res.status(201).json({
    token,
    expiresAt,
    expiresIn,
    message: 'Device can use this token to enroll',
  });
});

// List active enrollment tokens
app.get('/api/enrollment/tokens', (req, res) => {
  const tokens = Array.from(enrollmentTokens.values()).map(t => ({
    token: t.token,
    createdAt: t.createdAt,
    expiresAt: t.expiresAt,
    isExpired: new Date() > t.expiresAt,
  }));
  res.json(tokens);
});

// Revoke enrollment token
app.delete('/api/enrollment/tokens/:token', (req, res) => {
  if (enrollmentTokens.has(req.params.token)) {
    enrollmentTokens.delete(req.params.token);
    return res.json({ message: 'Token revoked' });
  }
  res.status(404).json({ error: 'Token not found' });
});

// Device enrollment with token
app.post('/api/devices/enroll', validateEnrollmentToken, (req, res) => {
  const { name, type } = req.body;
  if (!name || !type) {
    return res.status(400).json({
      error: 'Name and type are required',
      supportedTypes: Object.keys(DEVICE_TYPES),
    });
  }

  if (!DEVICE_TYPES[type]) {
    return res.status(400).json({
      error: `Invalid device type: ${type}`,
      supportedTypes: Object.keys(DEVICE_TYPES),
      message: 'Use one of the supported device types above',
    });
  }

  const device = {
    id: uuidv4(),
    name,
    type,
    typeLabel: DEVICE_TYPES[type],
    status: 'enrolled',
    batteryLevel: 100,
    cpuUsage: 0,
    ramUsage: 0,
    wifiSignal: -30,
    lastSeen: new Date(),
    createdAt: new Date(),
    enrollmentToken: req.enrollmentToken.token,
  };

  devices.push(device);

  // Revoke token after use
  enrollmentTokens.delete(req.enrollmentToken.token);

  res.status(201).json({
    device,
    message: 'Device enrolled successfully',
  });
});

// Get supported device types
app.get('/api/device-types', (req, res) => {
  res.json(DEVICE_TYPES);
});

// Get all devices
app.get('/api/devices', (req, res) => {
  res.json(devices);
});

// Get device by ID
app.get('/api/devices/:id', (req, res) => {
  const device = devices.find(d => d.id === req.params.id);
  if (!device) {
    return res.status(404).json({ error: 'Device not found' });
  }
  res.json(device);
});

// Create new device
app.post('/api/devices', (req, res) => {
  const { name, type, status } = req.body;
  if (!name || !type) {
    return res.status(400).json({ error: 'Name and type are required' });
  }

  const device = {
    id: uuidv4(),
    name,
    type,
    status: status || 'connected',
    batteryLevel: 100,
    cpuUsage: 0,
    ramUsage: 0,
    wifiSignal: -30,
    lastSeen: new Date(),
    createdAt: new Date(),
  };

  devices.push(device);
  res.status(201).json(device);
});

// Update device
app.put('/api/devices/:id', (req, res) => {
  const device = devices.find(d => d.id === req.params.id);
  if (!device) {
    return res.status(404).json({ error: 'Device not found' });
  }

  Object.assign(device, req.body, { id: device.id });
  device.updatedAt = new Date();
  res.json(device);
});

// Delete device
app.delete('/api/devices/:id', (req, res) => {
  const index = devices.findIndex(d => d.id === req.params.id);
  if (index === -1) {
    return res.status(404).json({ error: 'Device not found' });
  }

  const device = devices.splice(index, 1);
  res.json(device[0]);
});

// GOOGLE EMM INTEGRATION ENDPOINTS

// Get EMM integration status
app.get('/api/emm/status', (req, res) => {
  const integration = emmIntegrations.get('default');
  if (!integration) {
    return res.json({
      connected: false,
      message: 'Google EMM not configured',
    });
  }
  res.json({
    connected: true,
    projectId: integration.projectId,
    enterprises: Array.from(emmEnterprises.values()),
  });
});

// Initialize OAuth flow for EMM
app.post('/api/emm/oauth/initiate', (req, res) => {
  const clientId = process.env.GOOGLE_CLIENT_ID;
  const clientSecret = process.env.GOOGLE_CLIENT_SECRET;
  const redirectUri = process.env.GOOGLE_REDIRECT_URI || 'http://localhost:3000/api/emm/oauth/callback';

  if (!clientId || !clientSecret) {
    return res.status(400).json({
      error: 'Google credentials not configured',
      message: 'Please set GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET environment variables',
    });
  }

  const scope = encodeURIComponent('https://www.googleapis.com/auth/androidmanagement');
  const state = uuidv4();

  // Store state for verification
  emmIntegrations.set(`state_${state}`, { createdAt: Date.now() });

  const authUrl = `https://accounts.google.com/o/oauth2/v2/auth?` +
    `client_id=${clientId}&` +
    `redirect_uri=${encodeURIComponent(redirectUri)}&` +
    `response_type=code&` +
    `scope=${scope}&` +
    `access_type=offline&` +
    `state=${state}`;

  res.json({
    authUrl,
    state,
    message: 'Redirect user to this URL to authorize EMM integration',
  });
});

// Handle OAuth callback
app.get('/api/emm/oauth/callback', (req, res) => {
  const { code, state } = req.query;

  if (!code || !state) {
    return res.status(400).json({ error: 'Missing authorization code or state' });
  }

  // Verify state
  if (!emmIntegrations.has(`state_${state}`)) {
    return res.status(400).json({ error: 'Invalid state parameter' });
  }

  // Store integration configuration
  emmIntegrations.set('default', {
    projectId: process.env.GOOGLE_PROJECT_ID,
    code,
    state,
    connectedAt: new Date().toISOString(),
  });

  res.json({
    success: true,
    message: 'Google EMM integration authorized successfully',
    redirectUrl: '/?emm=connected',
  });
});

// List enterprises
app.get('/api/emm/enterprises', (req, res) => {
  const enterprises = Array.from(emmEnterprises.values());
  res.json({
    enterprises,
    total: enterprises.length,
  });
});

// Create enterprise enrollment token
app.post('/api/emm/enterprises/:enterpriseId/enrollment-tokens', (req, res) => {
  const { enterpriseId } = req.params;
  const { duration } = req.body;

  const enterprise = emmEnterprises.get(enterpriseId);
  if (!enterprise) {
    return res.status(404).json({ error: 'Enterprise not found' });
  }

  const token = `emm-token-${uuidv4()}`;
  const expiresAt = new Date(Date.now() + (duration || 86400) * 1000);

  res.status(201).json({
    token,
    enterpriseId,
    expiresAt,
    message: 'Enrollment token created. Device can scan this with Google EMM scanner.',
  });
});

// Get enrolled devices from EMM
app.get('/api/emm/enterprises/:enterpriseId/devices', (req, res) => {
  const { enterpriseId } = req.params;

  const enterprise = emmEnterprises.get(enterpriseId);
  if (!enterprise) {
    return res.status(404).json({ error: 'Enterprise not found' });
  }

  // Return devices that have EMM enrollment
  const emmDevices = devices.filter(d => d.emmEnterpriseId === enterpriseId);
  res.json({
    devices: emmDevices,
    total: emmDevices.length,
  });
});

// Sync device with EMM
app.post('/api/emm/enterprises/:enterpriseId/devices/:deviceId/sync', (req, res) => {
  const { enterpriseId, deviceId } = req.params;

  const device = devices.find(d => d.id === deviceId);
  if (!device) {
    return res.status(404).json({ error: 'Device not found' });
  }

  // Mark device as EMM-enrolled
  device.emmEnterpriseId = enterpriseId;
  device.emmSyncedAt = new Date().toISOString();
  device.status = 'emm-managed';

  res.json({
    device,
    message: 'Device synchronized with Google EMM',
  });
});

// Get EMM audit logs
app.get('/api/emm/enterprises/:enterpriseId/audit-logs', (req, res) => {
  const { enterpriseId } = req.params;
  const { pageSize = 50, pageToken } = req.query;

  const enterprise = emmEnterprises.get(enterpriseId);
  if (!enterprise) {
    return res.status(404).json({ error: 'Enterprise not found' });
  }

  // Return simulated audit logs
  const auditLogs = [
    {
      timestamp: new Date(Date.now() - 3600000).toISOString(),
      actor: 'admin@sallyhealth.org',
      action: 'Device enrolled',
      deviceId: 'device-001',
      deviceName: 'Pixel 8 Pro',
      status: 'success',
    },
    {
      timestamp: new Date(Date.now() - 7200000).toISOString(),
      actor: 'admin@sallyhealth.org',
      action: 'Policy applied',
      deviceId: 'device-002',
      deviceName: 'iPad Pro',
      status: 'success',
    },
    {
      timestamp: new Date(Date.now() - 10800000).toISOString(),
      actor: 'admin@sallyhealth.org',
      action: 'Device locked',
      deviceId: 'device-003',
      deviceName: 'Samsung Galaxy Tab',
      status: 'success',
    },
  ];

  res.json({
    logs: auditLogs.slice(0, pageSize),
    total: auditLogs.length,
    pageSize,
  });
});

// SPA fallback: serve index.html for all non-API routes
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'dist', 'index.html'));
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 OmniFleet running on http://localhost:${PORT}`);
  console.log(`📊 Web UI: http://localhost:${PORT}`);
  console.log(`📱 API: http://localhost:${PORT}/api`);
  console.log(`💊 Health: http://localhost:${PORT}/api/health`);
});
