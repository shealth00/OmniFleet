import React, { useState } from 'react';
import { 
  Server, 
  Smartphone, 
  Watch, 
  Monitor, 
  Glasses, 
  Activity, 
  Battery, 
  Wifi, 
  Lock, 
  User, 
  Terminal, 
  ArrowUpCircle, 
  Grid, 
  List, 
  AlertTriangle, 
  CheckCircle2, 
  RotateCcw, 
  Camera, 
  Play, 
  Sparkles, 
  Filter,
  CheckSquare,
  Square,
  Search,
  Cpu,
  Layers,
  HeartPulse
} from 'lucide-react';
import { DeviceRecord, PlatformType, DeviceStatus, ConnectionMode } from '../types/device';
import { useDevices } from '../context/DeviceContext';
import { getDeviceAdapter } from '../adapters/deviceAdapters';

interface FleetDashboardProps {
  onOpenCommandCenter: () => void;
  onOpenFirmwareManager: () => void;
  onOpenEnrollment: () => void;
  searchQuery: string;
}

export const FleetDashboard: React.FC<FleetDashboardProps> = ({
  onOpenCommandCenter,
  onOpenFirmwareManager,
  onOpenEnrollment,
  searchQuery,
}) => {
  const { 
    devices, 
    setSelectedDevice, 
    executeCommand, 
    triggerQuickReboot, 
    triggerQuickScreenshot 
  } = useDevices();

  // Filters
  const [platformFilter, setPlatformFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [groupFilter, setGroupFilter] = useState<string>('all');
  const [viewMode, setViewMode] = useState<'grid' | 'table'>('grid');
  const [selectedDeviceIds, setSelectedDeviceIds] = useState<string[]>([]);

  // Category counts
  const totalCount = devices.length;
  const onlineCount = devices.filter(d => d.status === 'online').length;
  const offlineCount = devices.filter(d => d.status === 'offline').length;
  const attentionCount = devices.filter(d => d.status === 'attention').length;
  const updatingCount = devices.filter(d => d.status === 'updating').length;
  const rpmStreamingCount = devices.filter(d => d.rpmVitals?.bleStatus === 'connected').length;

  const tabletCount = devices.filter(d => d.deviceType === 'tablet' || d.deviceType === 'phone').length;
  const watchCount = devices.filter(d => d.deviceType === 'smartwatch').length;
  const windowsCount = devices.filter(d => d.platform === 'windows').length;
  const iosCount = devices.filter(d => d.platform === 'ios').length;
  const questCount = devices.filter(d => d.platform === 'quest').length;

  const allGroups = Array.from(new Set(devices.map(d => d.deviceGroup)));

  // Filtered devices list
  const filteredDevices = devices.filter(d => {
    if (platformFilter !== 'all' && d.platform !== platformFilter) return false;
    if (statusFilter !== 'all' && d.status !== statusFilter) return false;
    if (groupFilter !== 'all' && d.deviceGroup !== groupFilter) return false;
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      return (
        d.name.toLowerCase().includes(q) ||
        d.serialNumber.toLowerCase().includes(q) ||
        d.model.toLowerCase().includes(q) ||
        d.telemetry.ipAddress.toLowerCase().includes(q) ||
        (d.patient && d.patient.patientName.toLowerCase().includes(q)) ||
        d.tags.some(t => t.toLowerCase().includes(q))
      );
    }
    return true;
  });

  const toggleSelectAll = () => {
    if (selectedDeviceIds.length === filteredDevices.length) {
      setSelectedDeviceIds([]);
    } else {
      setSelectedDeviceIds(filteredDevices.map(d => d.id));
    }
  };

  const toggleSelectDevice = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setSelectedDeviceIds(prev =>
      prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
    );
  };

  const handleBatchCommand = (cmd: 'reboot' | 'wake' | 'kiosk') => {
    if (selectedDeviceIds.length === 0) return;
    if (cmd === 'reboot') executeCommand('reboot', 'Batch Hardware Reboot', selectedDeviceIds);
    if (cmd === 'wake') executeCommand('wake', 'Batch Display Wakeup', selectedDeviceIds);
    if (cmd === 'kiosk') executeCommand('set_kiosk', 'Batch Kiosk Lock', selectedDeviceIds, { enabled: true });
  };

  const getPlatformIcon = (platform: PlatformType) => {
    switch (platform) {
      case 'wearos':
        return <Watch className="w-4 h-4 text-teal-400" />;
      case 'quest':
        return <Glasses className="w-4 h-4 text-indigo-400" />;
      case 'windows':
        return <Monitor className="w-4 h-4 text-blue-400" />;
      default:
        return <Smartphone className="w-4 h-4 text-cyan-400" />;
    }
  };

  return (
    <div className="space-y-6 animate-fadeIn">
      
      {/* Top Metrics Cards Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 font-mono">
        
        {/* Total Devices */}
        <div 
          onClick={() => { setStatusFilter('all'); setPlatformFilter('all'); }}
          className="p-3.5 bg-slate-900 rounded-2xl border border-slate-800 hover:border-slate-700 cursor-pointer transition-all space-y-1"
        >
          <div className="text-[10px] text-slate-500 uppercase font-bold">TOTAL FLEET</div>
          <div className="text-2xl font-black text-white">{totalCount}</div>
          <div className="text-[10px] text-slate-400">All Platforms</div>
        </div>

        {/* Online Devices */}
        <div 
          onClick={() => setStatusFilter('online')}
          className="p-3.5 bg-slate-900 rounded-2xl border border-slate-800 hover:border-emerald-500/50 cursor-pointer transition-all space-y-1"
        >
          <div className="text-[10px] text-emerald-400 uppercase font-bold flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
            <span>ONLINE</span>
          </div>
          <div className="text-2xl font-black text-emerald-300">{onlineCount}</div>
          <div className="text-[10px] text-slate-400">Streaming Heartbeats</div>
        </div>

        {/* Attention Devices */}
        <div 
          onClick={() => setStatusFilter('attention')}
          className={`p-3.5 bg-slate-900 rounded-2xl border cursor-pointer transition-all space-y-1 ${
            attentionCount > 0 ? 'border-amber-500/50 bg-amber-950/10' : 'border-slate-800'
          }`}
        >
          <div className="text-[10px] text-amber-400 uppercase font-bold flex items-center gap-1.5">
            <AlertTriangle className="w-3 h-3 text-amber-400" />
            <span>ATTENTION</span>
          </div>
          <div className="text-2xl font-black text-amber-300">{attentionCount}</div>
          <div className="text-[10px] text-slate-400">Vitals / Battery</div>
        </div>

        {/* Updating Devices */}
        <div 
          onClick={() => setStatusFilter('updating')}
          className="p-3.5 bg-slate-900 rounded-2xl border border-slate-800 hover:border-cyan-500/50 cursor-pointer transition-all space-y-1"
        >
          <div className="text-[10px] text-cyan-400 uppercase font-bold flex items-center gap-1.5">
            <ArrowUpCircle className="w-3 h-3 text-cyan-400 animate-spin" />
            <span>OTA UPDATING</span>
          </div>
          <div className="text-2xl font-black text-cyan-300">{updatingCount}</div>
          <div className="text-[10px] text-slate-400">Firmware Staging</div>
        </div>

        {/* RPM Streaming */}
        <div 
          onClick={() => setPlatformFilter('wearos')}
          className="p-3.5 bg-slate-900 rounded-2xl border border-slate-800 hover:border-teal-500/50 cursor-pointer transition-all space-y-1"
        >
          <div className="text-[10px] text-teal-400 uppercase font-bold flex items-center gap-1.5">
            <HeartPulse className="w-3 h-3 text-teal-400" />
            <span>RPM STREAMING</span>
          </div>
          <div className="text-2xl font-black text-teal-300">{rpmStreamingCount}</div>
          <div className="text-[10px] text-slate-400">BLE 5.3 GATT</div>
        </div>

        {/* Offline Devices */}
        <div 
          onClick={() => setStatusFilter('offline')}
          className="p-3.5 bg-slate-900 rounded-2xl border border-slate-800 hover:border-rose-500/50 cursor-pointer transition-all space-y-1"
        >
          <div className="text-[10px] text-slate-500 uppercase font-bold">OFFLINE</div>
          <div className="text-2xl font-black text-slate-400">{offlineCount}</div>
          <div className="text-[10px] text-slate-500">Unreachable</div>
        </div>

      </div>

      {/* Platform Category Distribution Pills */}
      <div className="flex flex-wrap items-center gap-2 font-mono text-xs">
        <span className="text-slate-500 uppercase text-[10px] pr-1">Platforms:</span>

        <button
          onClick={() => setPlatformFilter('all')}
          className={`px-3 py-1 rounded-lg border transition-all ${
            platformFilter === 'all'
              ? 'bg-cyan-500/20 text-cyan-300 border-cyan-500 font-bold'
              : 'bg-slate-900 text-slate-400 border-slate-800 hover:text-white'
          }`}
        >
          ALL ({totalCount})
        </button>

        <button
          onClick={() => setPlatformFilter('android')}
          className={`px-3 py-1 rounded-lg border transition-all flex items-center gap-1.5 ${
            platformFilter === 'android'
              ? 'bg-cyan-500/20 text-cyan-300 border-cyan-500 font-bold'
              : 'bg-slate-900 text-slate-400 border-slate-800 hover:text-white'
          }`}
        >
          <Smartphone className="w-3.5 h-3.5" />
          <span>ANDROID ({tabletCount})</span>
        </button>

        <button
          onClick={() => setPlatformFilter('wearos')}
          className={`px-3 py-1 rounded-lg border transition-all flex items-center gap-1.5 ${
            platformFilter === 'wearos'
              ? 'bg-teal-500/20 text-teal-300 border-teal-500 font-bold'
              : 'bg-slate-900 text-slate-400 border-slate-800 hover:text-white'
          }`}
        >
          <Watch className="w-3.5 h-3.5 text-teal-400" />
          <span>WEAR OS / WATCHES ({watchCount})</span>
        </button>

        <button
          onClick={() => setPlatformFilter('windows')}
          className={`px-3 py-1 rounded-lg border transition-all flex items-center gap-1.5 ${
            platformFilter === 'windows'
              ? 'bg-blue-500/20 text-blue-300 border-blue-500 font-bold'
              : 'bg-slate-900 text-slate-400 border-slate-800 hover:text-white'
          }`}
        >
          <Monitor className="w-3.5 h-3.5 text-blue-400" />
          <span>WINDOWS ({windowsCount})</span>
        </button>

        <button
          onClick={() => setPlatformFilter('ios')}
          className={`px-3 py-1 rounded-lg border transition-all flex items-center gap-1.5 ${
            platformFilter === 'ios'
              ? 'bg-indigo-500/20 text-indigo-300 border-indigo-500 font-bold'
              : 'bg-slate-900 text-slate-400 border-slate-800 hover:text-white'
          }`}
        >
          <span>APPLE IPAD/IOS ({iosCount})</span>
        </button>

        <button
          onClick={() => setPlatformFilter('quest')}
          className={`px-3 py-1 rounded-lg border transition-all flex items-center gap-1.5 ${
            platformFilter === 'quest'
              ? 'bg-purple-500/20 text-purple-300 border-purple-500 font-bold'
              : 'bg-slate-900 text-slate-400 border-slate-800 hover:text-white'
          }`}
        >
          <Glasses className="w-3.5 h-3.5 text-purple-400" />
          <span>META QUEST 2 ({questCount})</span>
        </button>
      </div>

      {/* Action & Filter Bar */}
      <div className="flex flex-wrap items-center justify-between gap-4 p-3.5 bg-slate-900 rounded-2xl border border-slate-800">
        
        {/* Left: Batch Selection & Group Filter */}
        <div className="flex flex-wrap items-center gap-3">
          <button
            onClick={toggleSelectAll}
            className="flex items-center gap-1.5 px-2.5 py-1.5 bg-slate-950 border border-slate-800 hover:bg-slate-850 rounded-lg text-xs font-mono text-slate-300 transition-colors"
          >
            {selectedDeviceIds.length === filteredDevices.length && filteredDevices.length > 0 ? (
              <CheckSquare className="w-4 h-4 text-cyan-400" />
            ) : (
              <Square className="w-4 h-4 text-slate-500" />
            )}
            <span>Select All ({selectedDeviceIds.length})</span>
          </button>

          {/* Group Filter */}
          <div className="flex items-center gap-1.5 font-mono text-xs">
            <span className="text-slate-500 uppercase text-[10px]">Group:</span>
            <select
              value={groupFilter}
              onChange={(e) => setGroupFilter(e.target.value)}
              className="bg-slate-950 border border-slate-800 text-slate-200 px-2.5 py-1 rounded-lg focus:outline-none focus:border-cyan-500"
            >
              <option value="all">All Fleet Groups</option>
              {allGroups.map(g => (
                <option key={g} value={g}>{g}</option>
              ))}
            </select>
          </div>

          {/* Status Filter */}
          <div className="flex items-center gap-1.5 font-mono text-xs">
            <span className="text-slate-500 uppercase text-[10px]">Status:</span>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="bg-slate-950 border border-slate-800 text-slate-200 px-2.5 py-1 rounded-lg focus:outline-none focus:border-cyan-500"
            >
              <option value="all">All Statuses</option>
              <option value="online">Online</option>
              <option value="attention">Attention</option>
              <option value="updating">Updating</option>
              <option value="offline">Offline</option>
            </select>
          </div>
        </div>

        {/* Right: Batch Actions & View Switcher */}
        <div className="flex items-center gap-2">
          {selectedDeviceIds.length > 0 && (
            <div className="flex items-center gap-1.5 bg-slate-950 p-1 rounded-xl border border-cyan-500/30 text-xs font-mono">
              <span className="px-2 text-cyan-400 font-bold">{selectedDeviceIds.length} Selected</span>
              
              <button
                onClick={() => handleBatchCommand('wake')}
                className="px-2 py-1 bg-slate-900 hover:bg-slate-800 text-white rounded font-semibold transition-colors"
                title="Wake all selected screens"
              >
                Wake
              </button>
              <button
                onClick={() => handleBatchCommand('reboot')}
                className="px-2 py-1 bg-rose-500/20 hover:bg-rose-500/30 text-rose-300 border border-rose-500/40 rounded font-semibold transition-colors"
                title="Reboot all selected hardware"
              >
                Reboot
              </button>
              <button
                onClick={() => handleBatchCommand('kiosk')}
                className="px-2 py-1 bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-300 border border-cyan-500/40 rounded font-semibold transition-colors"
                title="Lock to kiosk mode"
              >
                Kiosk
              </button>
            </div>
          )}

          {/* View Mode Toggle */}
          <div className="flex items-center bg-slate-950 p-1 rounded-xl border border-slate-800">
            <button
              onClick={() => setViewMode('grid')}
              className={`p-1.5 rounded-lg transition-colors ${
                viewMode === 'grid' ? 'bg-cyan-500/20 text-cyan-400' : 'text-slate-500 hover:text-slate-300'
              }`}
              title="Grid View"
            >
              <Grid className="w-4 h-4" />
            </button>
            <button
              onClick={() => setViewMode('table')}
              className={`p-1.5 rounded-lg transition-colors ${
                viewMode === 'table' ? 'bg-cyan-500/20 text-cyan-400' : 'text-slate-500 hover:text-slate-300'
              }`}
              title="Dense Table View"
            >
              <List className="w-4 h-4" />
            </button>
          </div>
        </div>

      </div>

      {/* MAIN FLEET CONTENT */}
      {viewMode === 'grid' ? (
        
        /* GRID VIEW */
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 font-mono">
          {filteredDevices.map(device => {
            const isSelected = selectedDeviceIds.includes(device.id);
            const adapter = getDeviceAdapter(device.platform);

            return (
              <div
                key={device.id}
                onClick={() => setSelectedDevice(device)}
                className={`p-5 rounded-2xl border cursor-pointer transition-all hover:scale-[1.01] flex flex-col justify-between space-y-4 ${
                  isSelected
                    ? 'bg-slate-900 border-cyan-500 shadow-lg shadow-cyan-950/40'
                    : device.status === 'attention'
                    ? 'bg-slate-900/95 border-amber-500/60 shadow-lg shadow-amber-950/20'
                    : 'bg-slate-900/80 border-slate-800 hover:border-slate-700'
                }`}
              >
                {/* Card Header */}
                <div>
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <div className="flex items-center gap-2.5">
                      <div
                        onClick={(e) => toggleSelectDevice(device.id, e)}
                        className="cursor-pointer"
                      >
                        {isSelected ? (
                          <CheckSquare className="w-4 h-4 text-cyan-400 shrink-0" />
                        ) : (
                          <Square className="w-4 h-4 text-slate-600 shrink-0 hover:text-slate-400" />
                        )}
                      </div>

                      <div className="p-2 rounded-xl bg-slate-950 border border-slate-800">
                        {getPlatformIcon(device.platform)}
                      </div>

                      <div>
                        <div className="font-bold text-white text-sm font-sans tracking-tight leading-tight">
                          {device.name}
                        </div>
                        <div className="text-[11px] text-slate-400">
                          {device.model}
                        </div>
                      </div>
                    </div>

                    {/* Status Pill */}
                    <span
                      className={`px-2 py-0.5 text-[10px] font-bold uppercase rounded-full border flex items-center gap-1 shrink-0 ${
                        device.status === 'online'
                          ? 'bg-emerald-500/10 text-emerald-300 border-emerald-500/30'
                          : device.status === 'attention'
                          ? 'bg-amber-500/10 text-amber-300 border-amber-500/30 animate-pulse'
                          : device.status === 'updating'
                          ? 'bg-cyan-500/10 text-cyan-300 border-cyan-500/30'
                          : 'bg-slate-800 text-slate-400 border-slate-700'
                      }`}
                    >
                      <span className={`w-1.5 h-1.5 rounded-full ${device.status === 'online' ? 'bg-emerald-400 animate-ping' : device.status === 'attention' ? 'bg-amber-400' : 'bg-slate-500'}`}></span>
                      <span>{device.status}</span>
                    </span>
                  </div>

                  {/* Patient or Group Info */}
                  <div className="p-2.5 bg-slate-950/70 rounded-xl border border-slate-800/80 text-xs space-y-1">
                    {device.patient ? (
                      <div className="flex items-center justify-between text-slate-200">
                        <span className="flex items-center gap-1.5">
                          <User className="w-3.5 h-3.5 text-cyan-400" />
                          <span className="font-semibold text-white">{device.patient.patientName}</span>
                        </span>
                        <span className="text-[10px] text-slate-400">{device.patient.medicalRecordNumber}</span>
                      </div>
                    ) : (
                      <div className="flex justify-between text-slate-400 text-[11px]">
                        <span>Facility Site:</span>
                        <span className="text-slate-300">{device.site}</span>
                      </div>
                    )}

                    <div className="flex justify-between items-center text-[10px] text-slate-500 pt-1 border-t border-slate-900">
                      <span>Group: {device.deviceGroup}</span>
                      <span className="text-cyan-400 uppercase">{device.connectionMode} MODE</span>
                    </div>
                  </div>
                </div>

                {/* Telemetry Gauge Strip */}
                <div className="grid grid-cols-3 gap-2 text-center text-xs">
                  
                  {/* Battery */}
                  <div className="p-2 bg-slate-950 rounded-lg border border-slate-800 space-y-0.5">
                    <div className="text-[10px] text-slate-500 uppercase flex items-center justify-center gap-1">
                      <Battery className={`w-3 h-3 ${device.telemetry.batteryLevel < 30 ? 'text-amber-400' : 'text-emerald-400'}`} />
                      <span>Battery</span>
                    </div>
                    <div className="font-bold text-white">
                      {device.telemetry.batteryLevel}% {device.telemetry.isCharging && <span className="text-[9px] text-cyan-400">⚡</span>}
                    </div>
                  </div>

                  {/* CPU Load */}
                  <div className="p-2 bg-slate-950 rounded-lg border border-slate-800 space-y-0.5">
                    <div className="text-[10px] text-slate-500 uppercase flex items-center justify-center gap-1">
                      <Cpu className="w-3 h-3 text-cyan-400" />
                      <span>CPU</span>
                    </div>
                    <div className="font-bold text-white">{device.telemetry.cpuUsagePercent}%</div>
                  </div>

                  {/* Network dBm */}
                  <div className="p-2 bg-slate-950 rounded-lg border border-slate-800 space-y-0.5">
                    <div className="text-[10px] text-slate-500 uppercase flex items-center justify-center gap-1">
                      <Wifi className="w-3 h-3 text-teal-400" />
                      <span>Wi-Fi</span>
                    </div>
                    <div className="font-bold text-white">{device.telemetry.wifiSignalDbm} dBm</div>
                  </div>

                </div>

                {/* Wearable RPM Vitals Summary if available */}
                {device.rpmVitals && (
                  <div className="p-2.5 bg-teal-950/30 rounded-xl border border-teal-800/40 flex items-center justify-between text-xs text-teal-200">
                    <div className="flex items-center gap-2">
                      <HeartPulse className="w-4 h-4 text-rose-400 animate-pulse" />
                      <span className="font-bold text-white">{device.rpmVitals.heartRateBpm} BPM</span>
                      <span className="text-cyan-300">SpO₂ {device.rpmVitals.spo2Percent}%</span>
                    </div>
                    <span className="text-[10px] text-teal-400 font-bold uppercase">GATT Streaming</span>
                  </div>
                )}

                {/* OTA Progress if updating */}
                {device.pendingUpdate && (
                  <div className="p-2.5 bg-cyan-950/40 rounded-xl border border-cyan-500/40 space-y-1 text-xs">
                    <div className="flex justify-between text-cyan-300 font-bold text-[11px]">
                      <span>OTA: {device.pendingUpdate.targetVersion}</span>
                      <span>{device.pendingUpdate.progressPercent}%</span>
                    </div>
                    <div className="h-1.5 bg-slate-800 rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-cyan-400 transition-all duration-300"
                        style={{ width: `${device.pendingUpdate.progressPercent}%` }}
                      ></div>
                    </div>
                  </div>
                )}

                {/* Card Footer & Quick Remote Opener */}
                <div className="flex items-center justify-between text-[11px] text-slate-500 pt-2 border-t border-slate-800/80">
                  <span>Heartbeat: {device.telemetry.lastHeartbeat}</span>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setSelectedDevice(device);
                    }}
                    className="text-cyan-400 hover:text-cyan-300 font-bold flex items-center gap-1"
                  >
                    <span>Inspect</span>
                    <span>➔</span>
                  </button>
                </div>

              </div>
            );
          })}
        </div>

      ) : (

        /* DENSE TABLE VIEW */
        <div className="bg-slate-900 rounded-2xl border border-slate-800 overflow-x-auto font-mono text-xs">
          <table className="w-full text-left">
            <thead className="bg-slate-950 text-slate-400 border-b border-slate-800 uppercase text-[10px]">
              <tr>
                <th className="p-3.5 w-10">
                  <input
                    type="checkbox"
                    checked={selectedDeviceIds.length === filteredDevices.length && filteredDevices.length > 0}
                    onChange={toggleSelectAll}
                    className="rounded border-slate-700 text-cyan-500 bg-slate-900"
                  />
                </th>
                <th className="p-3.5">Device & Model</th>
                <th className="p-3.5">Platform</th>
                <th className="p-3.5">Status</th>
                <th className="p-3.5">Group / Patient</th>
                <th className="p-3.5">Battery</th>
                <th className="p-3.5">IP & Wi-Fi</th>
                <th className="p-3.5">Firmware</th>
                <th className="p-3.5">Heartbeat</th>
                <th className="p-3.5 text-right">Actions</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-slate-800">
              {filteredDevices.map(device => {
                const isSelected = selectedDeviceIds.includes(device.id);

                return (
                  <tr
                    key={device.id}
                    onClick={() => setSelectedDevice(device)}
                    className={`hover:bg-slate-850 cursor-pointer transition-colors ${
                      isSelected ? 'bg-cyan-950/20' : ''
                    }`}
                  >
                    <td className="p-3.5" onClick={(e) => toggleSelectDevice(device.id, e)}>
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={() => {}}
                        className="rounded border-slate-700 text-cyan-500 bg-slate-900"
                      />
                    </td>

                    <td className="p-3.5">
                      <div className="font-bold text-white">{device.name}</div>
                      <div className="text-[10px] text-slate-500">{device.serialNumber}</div>
                    </td>

                    <td className="p-3.5">
                      <span className="px-2 py-0.5 rounded bg-slate-950 border border-slate-800 uppercase font-bold text-[10px] text-slate-300">
                        {device.platform}
                      </span>
                    </td>

                    <td className="p-3.5">
                      <span
                        className={`px-2 py-0.5 text-[10px] font-bold uppercase rounded-full border flex items-center gap-1 w-max ${
                          device.status === 'online'
                            ? 'bg-emerald-500/10 text-emerald-300 border-emerald-500/30'
                            : device.status === 'attention'
                            ? 'bg-amber-500/10 text-amber-300 border-amber-500/30'
                            : device.status === 'updating'
                            ? 'bg-cyan-500/10 text-cyan-300 border-cyan-500/30'
                            : 'bg-slate-800 text-slate-400 border-slate-700'
                        }`}
                      >
                        <span className={`w-1.5 h-1.5 rounded-full ${device.status === 'online' ? 'bg-emerald-400' : device.status === 'attention' ? 'bg-amber-400' : 'bg-slate-500'}`}></span>
                        <span>{device.status}</span>
                      </span>
                    </td>

                    <td className="p-3.5">
                      <div className="text-slate-200">{device.deviceGroup}</div>
                      <div className="text-[10px] text-cyan-400 font-sans">{device.patient?.patientName || 'Pooled Standby'}</div>
                    </td>

                    <td className="p-3.5">
                      <span className={`font-bold ${device.telemetry.batteryLevel < 30 ? 'text-amber-400' : 'text-emerald-400'}`}>
                        {device.telemetry.batteryLevel}% {device.telemetry.isCharging && '⚡'}
                      </span>
                    </td>

                    <td className="p-3.5">
                      <div className="text-white">{device.telemetry.ipAddress}</div>
                      <div className="text-[10px] text-slate-500">{device.telemetry.wifiSignalDbm} dBm</div>
                    </td>

                    <td className="p-3.5">
                      <span className="text-cyan-300">{device.firmwareVersion}</span>
                    </td>

                    <td className="p-3.5 text-slate-400">
                      {device.telemetry.lastHeartbeat}
                    </td>

                    <td className="p-3.5 text-right">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedDevice(device);
                        }}
                        className="px-2.5 py-1 bg-cyan-950 text-cyan-300 border border-cyan-500/40 rounded hover:bg-cyan-900 font-bold"
                      >
                        Inspect
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

    </div>
  );
};
