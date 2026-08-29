const express = require('express');
const { Pool } = require('pg');
const cors = require('cors');
const { v4: uuidv4 } = require('uuid');
require('dotenv').config();

const app = express();
app.use(cors());
app.use(express.json());

const pool = new Pool({
  host: process.env.DB_HOST,
  port: parseInt(process.env.DB_PORT),
  database: process.env.DB_NAME,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  max: 20,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 5000,
});

pool.on('error', (err) => {
  console.error('Unexpected error on idle client', err);
});

// Health check
app.get('/api/health', async (req, res) => {
  try {
    await pool.query('SELECT 1');
    res.json({ status: 'OK', timestamp: new Date(), db: 'connected' });
  } catch (err) {
    res.status(503).json({ status: 'ERROR', timestamp: new Date(), db: 'disconnected', error: err.message });
  }
});

// ── Devices ──

app.get('/api/devices', async (req, res) => {
  try {
    const { status, type, group_id } = req.query;
    let query = 'SELECT * FROM devices WHERE 1=1';
    const params = [];
    let i = 1;
    if (status) { query += ` AND status = $${i++}`; params.push(status); }
    if (type) { query += ` AND type = $${i++}`; params.push(type); }
    if (group_id) { query += ` AND group_id = $${i++}`; params.push(group_id); }
    query += ' ORDER BY created_at DESC';
    const result = await pool.query(query, params);
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get('/api/devices/:id', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM devices WHERE id = $1', [req.params.id]);
    if (result.rows.length === 0) return res.status(404).json({ error: 'Device not found' });
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/devices', async (req, res) => {
  try {
    const { name, type, status, ip_address, mac_address, firmware_version, battery_level, cpu_usage, ram_usage, wifi_signal, group_id } = req.body;
    const id = uuidv4();
    const result = await pool.query(
      `INSERT INTO devices (id, name, type, status, ip_address, mac_address, firmware_version, battery_level, cpu_usage, ram_usage, wifi_signal, group_id)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12) RETURNING *`,
      [id, name, type, status || 'offline', ip_address, mac_address, firmware_version, battery_level, cpu_usage, ram_usage, wifi_signal, group_id]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.put('/api/devices/:id', async (req, res) => {
  try {
    const fields = ['name', 'type', 'status', 'ip_address', 'mac_address', 'firmware_version', 'battery_level', 'cpu_usage', 'ram_usage', 'wifi_signal', 'group_id', 'last_seen'];
    const sets = [];
    const params = [];
    let i = 1;
    for (const f of fields) {
      if (req.body[f] !== undefined) {
        sets.push(`${f} = $${i++}`);
        params.push(req.body[f]);
      }
    }
    if (sets.length === 0) return res.status(400).json({ error: 'No fields to update' });
    sets.push(`updated_at = NOW()`);
    params.push(req.params.id);
    const result = await pool.query(`UPDATE devices SET ${sets.join(', ')} WHERE id = $${i} RETURNING *`, params);
    if (result.rows.length === 0) return res.status(404).json({ error: 'Device not found' });
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.delete('/api/devices/:id', async (req, res) => {
  try {
    const result = await pool.query('DELETE FROM devices WHERE id = $1 RETURNING id', [req.params.id]);
    if (result.rows.length === 0) return res.status(404).json({ error: 'Device not found' });
    res.json({ deleted: result.rows[0].id });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ── Fleet Groups ──

app.get('/api/groups', async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT fg.*, COUNT(d.id)::int AS device_count
      FROM fleet_groups fg
      LEFT JOIN devices d ON d.group_id = fg.id
      GROUP BY fg.id
      ORDER BY fg.name
    `);
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get('/api/groups/:id', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM fleet_groups WHERE id = $1', [req.params.id]);
    if (result.rows.length === 0) return res.status(404).json({ error: 'Group not found' });
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/groups', async (req, res) => {
  try {
    const { name, description } = req.body;
    const id = uuidv4();
    const result = await pool.query(
      'INSERT INTO fleet_groups (id, name, description) VALUES ($1, $2, $3) RETURNING *',
      [id, name, description]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.put('/api/groups/:id', async (req, res) => {
  try {
    const { name, description } = req.body;
    const result = await pool.query(
      'UPDATE fleet_groups SET name = COALESCE($1, name), description = COALESCE($2, description) WHERE id = $3 RETURNING *',
      [name, description, req.params.id]
    );
    if (result.rows.length === 0) return res.status(404).json({ error: 'Group not found' });
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.delete('/api/groups/:id', async (req, res) => {
  try {
    const result = await pool.query('DELETE FROM fleet_groups WHERE id = $1 RETURNING id', [req.params.id]);
    if (result.rows.length === 0) return res.status(404).json({ error: 'Group not found' });
    res.json({ deleted: result.rows[0].id });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ── Device Metrics ──

app.get('/api/devices/:id/metrics', async (req, res) => {
  try {
    const { limit = 100, since } = req.query;
    let query = 'SELECT * FROM device_metrics WHERE device_id = $1';
    const params = [req.params.id];
    if (since) { query += ` AND timestamp >= $2`; params.push(since); }
    query += ` ORDER BY timestamp DESC LIMIT $${params.length + 1}`;
    params.push(parseInt(limit));
    const result = await pool.query(query, params);
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/devices/:id/metrics', async (req, res) => {
  try {
    const { battery_level, cpu_usage, ram_usage, wifi_signal, network_rx, network_tx, temperature, uptime } = req.body;
    const id = uuidv4();
    const result = await pool.query(
      `INSERT INTO device_metrics (id, device_id, battery_level, cpu_usage, ram_usage, wifi_signal, network_rx, network_tx, temperature, uptime)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10) RETURNING *`,
      [id, req.params.id, battery_level, cpu_usage, ram_usage, wifi_signal, network_rx, network_tx, temperature, uptime]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/metrics/batch', async (req, res) => {
  try {
    const { metrics } = req.body;
    if (!Array.isArray(metrics) || metrics.length === 0) {
      return res.status(400).json({ error: 'metrics array required' });
    }
    const values = [];
    const params = [];
    let i = 1;
    for (const m of metrics) {
      values.push(`($${i++},$${i++},$${i++},$${i++},$${i++},$${i++},$${i++},$${i++},$${i++},$${i++})`);
      params.push(uuidv4(), m.device_id, m.battery_level, m.cpu_usage, m.ram_usage, m.wifi_signal, m.network_rx, m.network_tx, m.temperature, m.uptime);
    }
    const result = await pool.query(
      `INSERT INTO device_metrics (id, device_id, battery_level, cpu_usage, ram_usage, wifi_signal, network_rx, network_tx, temperature, uptime)
       VALUES ${values.join(',')} RETURNING *`,
      params
    );
    res.status(201).json({ inserted: result.rows.length });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ── Dashboard / Stats ──

app.get('/api/stats', async (req, res) => {
  try {
    const [total, online, groups, metricsToday] = await Promise.all([
      pool.query('SELECT COUNT(*)::int AS total FROM devices'),
      pool.query("SELECT COUNT(*)::int AS online FROM devices WHERE status = 'online'"),
      pool.query('SELECT COUNT(*)::int AS groups FROM fleet_groups'),
      pool.query("SELECT COUNT(*)::int AS metrics_today FROM device_metrics WHERE timestamp >= CURRENT_DATE"),
    ]);
    res.json({
      total_devices: total.rows[0].total,
      online_devices: online.rows[0].online,
      total_groups: groups.rows[0].groups,
      metrics_today: metricsToday.rows[0].metrics_today,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

const PORT = parseInt(process.env.PORT) || 5000;
app.listen(PORT, '0.0.0.0', () => {
  console.log(`OmniFleet backend running on port ${PORT}`);
});
