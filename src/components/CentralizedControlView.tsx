import React, { useState, useEffect } from 'react';
import {
  Smartphone,
  Radio,
  Power,
  Lock,
  Download,
  Settings,
  Activity,
  Send,
  CheckCircle2,
  AlertCircle,
  Clock,
  Users,
  BarChart3,
  Zap,
} from 'lucide-react';
import { apiClient } from '../services/api';

interface ControlDevice {
  id: string;
  name: string;
  type: string;
  status: string;
  batteryLevel: number;
  cpuUsage: number;
  ramUsage: number;
  lastSeen: string;
}

export const CentralizedControlView: React.FC = () => {
  const [devices, setDevices] = useState<ControlDevice[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedDevices, setSelectedDevices] = useState<Set<string>>(new Set());
  const [activeTab, setActiveTab] = useState<'overview' | 'control' | 'deployment'>('overview');
  const [error, setError] = useState<string | null>(null);
  const [commandResult, setCommandResult] = useState<any>(null);

  useEffect(() => {
    loadDevices();
  }, []);

  const loadDevices = async () => {
    try {
      setLoading(true);
      const result = await apiClient.getControlDevices();
      setDevices(result.devices);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load devices');
    } finally {
      setLoading(false);
    }
  };

  const toggleDeviceSelection = (deviceId: string) => {
    const newSelected = new Set(selectedDevices);
    if (newSelected.has(deviceId)) {
      newSelected.delete(deviceId);
    } else {
      newSelected.add(deviceId);
    }
    setSelectedDevices(newSelected);
  };

  const issueCommand = async (command: string) => {
    if (selectedDevices.size === 0) {
      setError('Please select at least one device');
      return;
    }

    try {
      setLoading(true);
      const commands = Array.from(selectedDevices).map(deviceId =>
        apiClient.issueDeviceCommand(deviceId, command)
      );
      const results = await Promise.all(commands);
      setCommandResult({
        command,
        devicesAffected: selectedDevices.size,
        results,
        timestamp: new Date().toISOString(),
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : `Failed to issue ${command} command`);
    } finally {
      setLoading(false);
    }
  };

  const statusColor = (status: string) => {
    switch (status) {
      case 'connected':
      case 'online':
        return 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30';
      case 'offline':
        return 'bg-slate-500/20 text-slate-300 border-slate-500/30';
      default:
        return 'bg-yellow-500/20 text-yellow-300 border-yellow-500/30';
    }
  };

  const stats = [
    {
      label: 'Total Devices',
      value: devices.length,
      icon: Smartphone,
      color: 'blue',
    },
    {
      label: 'Online',
      value: devices.filter(d => d.status === 'connected').length,
      icon: Radio,
      color: 'emerald',
    },
    {
      label: 'Selected',
      value: selectedDevices.size,
      icon: CheckCircle2,
      color: 'purple',
    },
    {
      label: 'Avg Battery',
      value: Math.round(devices.reduce((sum, d) => sum + d.batteryLevel, 0) / devices.length) + '%',
      icon: Zap,
      color: 'yellow',
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-purple-900 to-blue-900 border border-purple-800 rounded-xl p-6 relative overflow-hidden">
        <div className="absolute right-0 top-0 translate-x-8 -translate-y-8 w-64 h-64 bg-purple-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="flex items-center gap-4 relative z-10">
          <Radio className="w-10 h-10 text-purple-400" />
          <div>
            <h1 className="text-2xl font-bold text-white">Centralized Device Control</h1>
            <p className="text-sm text-purple-100 mt-1">
              Manage, monitor, and control all enrolled devices from one command center
            </p>
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {stats.map((stat, idx) => {
          const Icon = stat.icon;
          const colorClasses = {
            blue: 'bg-blue-500/20 text-blue-400',
            emerald: 'bg-emerald-500/20 text-emerald-400',
            purple: 'bg-purple-500/20 text-purple-400',
            yellow: 'bg-yellow-500/20 text-yellow-400',
          };
          return (
            <div key={idx} className="bg-slate-900 border border-slate-800 rounded-xl p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">{stat.label}</p>
                  <p className="text-2xl font-bold text-white mt-1">{stat.value}</p>
                </div>
                <Icon className={`w-8 h-8 ${colorClasses[stat.color as keyof typeof colorClasses]}`} />
              </div>
            </div>
          );
        })}
      </div>

      {/* Tab Navigation */}
      <div className="flex gap-2 border-b border-slate-800">
        {[
          { id: 'overview', label: 'Device Overview', icon: BarChart3 },
          { id: 'control', label: 'Remote Control', icon: Power },
          { id: 'deployment', label: 'App Deployment', icon: Download },
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={`px-4 py-3 text-sm font-semibold flex items-center gap-2 transition-all border-b-2 ${
              activeTab === tab.id
                ? 'border-purple-500 text-purple-400'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <tab.icon className="w-4 h-4" />
            {tab.label}
          </button>
        ))}
      </div>

      {error && (
        <div className="p-4 bg-rose-950/40 border border-rose-800/80 rounded-lg text-sm text-rose-300 flex items-start gap-2">
          <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
          <div>{error}</div>
        </div>
      )}

      {/* Overview Tab */}
      {activeTab === 'overview' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-white">Enrolled Devices</h2>
            <button
              onClick={() => {
                setSelectedDevices(new Set(devices.map(d => d.id)));
              }}
              className="text-xs font-semibold text-purple-400 hover:text-purple-300 cursor-pointer"
            >
              Select All
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {devices.map(device => (
              <div
                key={device.id}
                onClick={() => toggleDeviceSelection(device.id)}
                className={`p-4 rounded-lg border transition-all cursor-pointer ${
                  selectedDevices.has(device.id)
                    ? 'bg-purple-950/40 border-purple-500'
                    : 'bg-slate-900 border-slate-800 hover:border-slate-700'
                }`}
              >
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <p className="font-semibold text-white">{device.name}</p>
                    <p className="text-xs text-slate-400 capitalize">{device.type}</p>
                  </div>
                  {selectedDevices.has(device.id) && (
                    <CheckCircle2 className="w-5 h-5 text-purple-400" />
                  )}
                </div>

                <div className="space-y-2 mb-3">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-slate-400">Status</span>
                    <span className={`px-2 py-1 rounded-full border text-[10px] font-semibold ${statusColor(device.status)}`}>
                      {device.status}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-slate-400">Battery</span>
                    <span className="text-white font-semibold">{device.batteryLevel}%</span>
                  </div>
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-slate-400">CPU / RAM</span>
                    <span className="text-white font-semibold">{device.cpuUsage}% / {device.ramUsage}%</span>
                  </div>
                </div>

                <div className="pt-3 border-t border-slate-800/50 text-xs text-slate-400">
                  Last: {new Date(device.lastSeen).toLocaleTimeString()}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Remote Control Tab */}
      {activeTab === 'control' && (
        <div className="space-y-4">
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-6">
            <h2 className="text-lg font-semibold text-white mb-4">Issue Remote Commands</h2>

            {selectedDevices.size === 0 ? (
              <div className="p-8 bg-slate-950/50 border border-slate-800 rounded-lg text-center text-slate-400">
                <AlertCircle className="w-12 h-12 mx-auto mb-3 opacity-50" />
                <p className="text-sm">Select devices from the Device Overview tab to issue commands</p>
              </div>
            ) : (
              <div className="space-y-4">
                <p className="text-sm text-slate-300">
                  {selectedDevices.size} device{selectedDevices.size > 1 ? 's' : ''} selected
                </p>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {[
                    { command: 'REBOOT', icon: Power, label: 'Reboot Devices', color: 'bg-yellow-600 hover:bg-yellow-500' },
                    { command: 'LOCK', icon: Lock, label: 'Lock Devices', color: 'bg-rose-600 hover:bg-rose-500' },
                    { command: 'WIPE', icon: AlertCircle, label: 'Wipe Data', color: 'bg-red-600 hover:bg-red-500' },
                    { command: 'UPDATE_POLICY', icon: Settings, label: 'Update Policy', color: 'bg-blue-600 hover:bg-blue-500' },
                  ].map(action => {
                    const Icon = action.icon;
                    return (
                      <button
                        key={action.command}
                        onClick={() => issueCommand(action.command)}
                        disabled={loading}
                        className={`${action.color} text-white font-semibold py-3 rounded-lg transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50`}
                      >
                        <Icon className="w-5 h-5" />
                        {action.label}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {commandResult && (
              <div className="mt-4 p-4 bg-emerald-950/40 border border-emerald-800/60 rounded-lg">
                <div className="flex items-start gap-3">
                  <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
                  <div className="text-sm">
                    <p className="font-semibold text-emerald-300">Command Executed</p>
                    <p className="text-emerald-200/70 mt-1">
                      {commandResult.command} issued to {commandResult.devicesAffected} device{commandResult.devicesAffected > 1 ? 's' : ''}
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Deployment Tab */}
      {activeTab === 'deployment' && (
        <div className="space-y-4">
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-6">
            <h2 className="text-lg font-semibold text-white mb-4">Deploy Apps & Policies</h2>

            <div className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-2">App Package Name</label>
                <input
                  type="text"
                  placeholder="com.example.app"
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-sm text-slate-200 focus:outline-none focus:border-purple-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-2">Target Devices</label>
                <select className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-sm text-slate-200 focus:outline-none focus:border-purple-500">
                  <option value="selected">Selected Devices ({selectedDevices.size})</option>
                  <option value="all-online">All Online Devices ({devices.filter(d => d.status === 'connected').length})</option>
                  <option value="all">All Devices ({devices.length})</option>
                </select>
              </div>

              <button
                disabled={loading || selectedDevices.size === 0}
                className="w-full bg-purple-600 hover:bg-purple-500 text-white font-semibold py-3 rounded-lg transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
              >
                <Send className="w-5 h-5" />
                Deploy App
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
