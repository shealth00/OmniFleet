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
    return res.status(400).json({ error: 'Name and type are required' });
  }

  const device = {
    id: uuidv4(),
    name,
    type,
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

  // Revoke token after use (optional - can allow multiple uses)
  enrollmentTokens.delete(req.enrollmentToken.token);

  res.status(201).json({
    device,
    message: 'Device enrolled successfully',
  });
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
