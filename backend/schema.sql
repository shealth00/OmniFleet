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

CREATE TABLE IF NOT EXISTS enrollment_sessions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    token VARCHAR(64) NOT NULL UNIQUE,
    organization VARCHAR(255) NOT NULL,
    site VARCHAR(255),
    device_group VARCHAR(255),
    connection_mode VARCHAR(50) NOT NULL DEFAULT 'kiosk',
    target_platform VARCHAR(50) NOT NULL DEFAULT 'android',
    assigned_policy VARCHAR(255),
    single_use BOOLEAN NOT NULL DEFAULT true,
    used BOOLEAN NOT NULL DEFAULT false,
    used_by_device_id UUID REFERENCES devices(id) ON DELETE SET NULL,
    last_used_at TIMESTAMP WITHOUT TIME ZONE,
    expires_at TIMESTAMP WITHOUT TIME ZONE NOT NULL,
    created_at TIMESTAMP WITHOUT TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_enrollment_sessions_token ON enrollment_sessions(token);
CREATE INDEX IF NOT EXISTS idx_enrollment_sessions_expires_at ON enrollment_sessions(expires_at);
