CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

CREATE TABLE IF NOT EXISTS fleet_groups (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL UNIQUE,
    description TEXT,
    created_at TIMESTAMP WITHOUT TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS devices (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    type VARCHAR(100),
    status VARCHAR(50) DEFAULT 'offline',
    ip_address INET,
    mac_address VARCHAR(17),
    firmware_version VARCHAR(50),
    battery_level INTEGER,
    cpu_usage INTEGER,
    ram_usage INTEGER,
    wifi_signal INTEGER,
    group_id UUID REFERENCES fleet_groups(id) ON DELETE SET NULL,
    last_seen TIMESTAMP WITHOUT TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    created_at TIMESTAMP WITHOUT TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITHOUT TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS device_metrics (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    device_id UUID NOT NULL REFERENCES devices(id) ON DELETE CASCADE,
    battery_level INTEGER,
    cpu_usage INTEGER,
    ram_usage INTEGER,
    wifi_signal INTEGER,
    network_rx BIGINT,
    network_tx BIGINT,
    temperature REAL,
    uptime INTEGER,
    timestamp TIMESTAMP WITHOUT TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_devices_group_id ON devices(group_id);
CREATE INDEX IF NOT EXISTS idx_devices_status ON devices(status);
CREATE INDEX IF NOT EXISTS idx_device_metrics_device_id ON device_metrics(device_id);
CREATE INDEX IF NOT EXISTS idx_device_metrics_timestamp ON device_metrics(timestamp);
CREATE INDEX IF NOT EXISTS idx_device_metrics_device_timestamp ON device_metrics(device_id, timestamp DESC);
