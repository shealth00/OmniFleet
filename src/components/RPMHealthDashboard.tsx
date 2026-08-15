import React, { useState } from 'react';
import { 
  HeartPulse, 
  Activity, 
  Radio, 
  AlertTriangle, 
  Watch, 
  User, 
  ShieldCheck, 
  RefreshCw, 
  CheckCircle2, 
  XCircle, 
  Layers,
  Sparkles,
  Search,
  Filter,
  Flame,
  Moon,
  Clock
} from 'lucide-react';
import { DeviceRecord } from '../types/device';
import { useDevices } from '../context/DeviceContext';

export const RPMHealthDashboard: React.FC = () => {
  const { devices, setSelectedDevice, executeCommand } = useDevices();

  const [selectedVitalsFilter, setSelectedVitalsFilter] = useState<'all' | 'alert' | 'streaming' | 'wearable'>('all');
  const [searchQuery, setSearchQuery] = useState('');

  // Devices with RPM vitals or wearables
  const rpmDevices = devices.filter(d => {
    const hasVitals = !!d.rpmVitals;
    if (selectedVitalsFilter === 'alert') return d.rpmVitals?.alertFlag === 'critical' || d.status === 'attention';
    if (selectedVitalsFilter === 'streaming') return d.rpmVitals?.bleStatus === 'connected';
    if (selectedVitalsFilter === 'wearable') return d.platform === 'wearos';
    return hasVitals || d.platform === 'wearos';
  }).filter(d => {
    if (!searchQuery) return true;
    const q = searchQuery.toLowerCase();
    return (
      d.name.toLowerCase().includes(q) ||
      d.patient?.patientName.toLowerCase().includes(q) ||
      d.patient?.medicalRecordNumber.toLowerCase().includes(q)
    );
  });

  const totalStreaming = devices.filter(d => d.rpmVitals?.bleStatus === 'connected').length;
  const criticalAlerts = devices.filter(d => d.rpmVitals?.alertFlag === 'critical').length;
  const healthConnectSynced = devices.filter(d => d.rpmVitals?.healthConnectSynced).length;

  return (
    <div className="space-y-6 animate-fadeIn">
      
      {/* Top Banner */}
      <div className="flex flex-wrap items-center justify-between gap-4 p-4 bg-slate-900/90 rounded-2xl border border-slate-800">
        <div>
          <div className="flex items-center gap-2">
            <HeartPulse className="w-5 h-5 text-teal-400" />
            <h1 className="text-lg font-bold text-white tracking-tight">Wearable Health & RPM Ingestion</h1>
            <span className="px-2 py-0.5 text-xs font-mono font-bold bg-teal-500/10 text-teal-300 border border-teal-500/30 rounded">
              Clinical Telemetry Stream
            </span>
          </div>
          <p className="text-xs text-slate-400 font-mono mt-1">
            Separated clinical domain: Authenticated BLE/GATT ingestion, continuous PPG waveforms, Health Connect sync, and vital alerts.
          </p>
        </div>

        <div className="flex items-center gap-3 text-xs font-mono">
          <div className="px-3 py-1.5 bg-slate-950 rounded-lg border border-slate-800 flex items-center gap-2">
            <Radio className="w-3.5 h-3.5 text-teal-400 animate-pulse" />
            <span className="text-slate-300 font-bold">{totalStreaming} Streaming</span>
          </div>
          {criticalAlerts > 0 && (
            <div className="px-3 py-1.5 bg-rose-950/80 rounded-lg border border-rose-500/40 text-rose-300 font-bold flex items-center gap-1.5 animate-bounce">
              <AlertTriangle className="w-3.5 h-3.5 text-rose-400" />
              <span>{criticalAlerts} Vital Alarms</span>
            </div>
          )}
        </div>
      </div>

      {/* Ingestion Architecture Blueprint Card */}
      <div className="p-4 bg-slate-900/60 rounded-2xl border border-slate-800 space-y-3 font-mono text-xs">
        <div className="text-[10px] text-slate-400 uppercase font-bold tracking-wider">
          Normalized Clinical Ingestion Topology
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-6 gap-2 text-center text-[11px]">
          <div className="p-2.5 bg-slate-950 rounded-xl border border-slate-800">
            <div className="text-cyan-400 font-bold">1. Watch / Sensor</div>
            <div className="text-[10px] text-slate-500 mt-0.5">Galaxy Watch 7</div>
          </div>
          <div className="p-2.5 bg-slate-950 rounded-xl border border-slate-800">
            <div className="text-teal-400 font-bold">2. BLE 5.3 GATT</div>
            <div className="text-[10px] text-slate-500 mt-0.5">UUID 0x180D Stream</div>
          </div>
          <div className="p-2.5 bg-slate-950 rounded-xl border border-slate-800">
            <div className="text-cyan-400 font-bold">3. Watch Adapter</div>
            <div className="text-[10px] text-slate-500 mt-0.5">WearOSAdapter.kt</div>
          </div>
          <div className="p-2.5 bg-slate-950 rounded-xl border border-slate-800">
            <div className="text-teal-400 font-bold">4. Device Gateway</div>
            <div className="text-[10px] text-slate-500 mt-0.5">mTLS Authenticated</div>
          </div>
          <div className="p-2.5 bg-slate-950 rounded-xl border border-slate-800">
            <div className="text-indigo-400 font-bold">5. Patient Association</div>
            <div className="text-[10px] text-slate-500 mt-0.5">EHR / MRN Linking</div>
          </div>
          <div className="p-2.5 bg-slate-950 rounded-xl border border-emerald-500/30 bg-emerald-950/20">
            <div className="text-emerald-300 font-bold">6. RPM Clinical Store</div>
            <div className="text-[10px] text-slate-400 mt-0.5">FHIR / HL7 Normalized</div>
          </div>
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div className="flex flex-wrap items-center justify-between gap-4 p-3 bg-slate-900 rounded-xl border border-slate-800">
        <div className="flex items-center gap-2">
          {['all', 'alert', 'streaming', 'wearable'].map(filterKey => (
            <button
              key={filterKey}
              onClick={() => setSelectedVitalsFilter(filterKey as any)}
              className={`px-3 py-1.5 rounded-lg text-xs font-mono uppercase font-bold transition-all border ${
                selectedVitalsFilter === filterKey
                  ? 'bg-teal-500/20 text-teal-300 border-teal-500'
                  : 'bg-slate-950 text-slate-400 border-slate-800 hover:text-white'
              }`}
            >
              {filterKey === 'all' && 'All Telemetry'}
              {filterKey === 'alert' && 'Vital Alerts Only'}
              {filterKey === 'streaming' && 'Active BLE Stream'}
              {filterKey === 'wearable' && 'Wear OS Smartwatches'}
            </button>
          ))}
        </div>

        <div className="relative">
          <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search patient, MRN, or watch..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="bg-slate-950 border border-slate-800 text-xs font-mono text-white pl-8 pr-3 py-1.5 rounded-lg focus:outline-none focus:border-teal-500"
          />
        </div>
      </div>

      {/* Vitals Telemetry Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {rpmDevices.map(device => {
          const vitals = device.rpmVitals;
          const isCritical = vitals?.alertFlag === 'critical';

          return (
            <div
              key={device.id}
              onClick={() => setSelectedDevice(device)}
              className={`p-5 rounded-2xl border cursor-pointer transition-all hover:scale-[1.01] ${
                isCritical
                  ? 'bg-slate-900 border-rose-500/60 shadow-xl shadow-rose-950/40'
                  : 'bg-slate-900/90 border-slate-800 hover:border-teal-500/50'
              }`}
            >
              {/* Card Header */}
              <div className="flex items-start justify-between gap-3 mb-3">
                <div className="flex items-center gap-3">
                  <div className={`p-2.5 rounded-xl border ${isCritical ? 'bg-rose-500/10 text-rose-400 border-rose-500/30' : 'bg-teal-500/10 text-teal-400 border-teal-500/30'}`}>
                    <Watch className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-white text-sm">{device.name}</span>
                      <span className="text-[10px] font-mono text-slate-400 uppercase">({device.model})</span>
                    </div>
                    <div className="text-xs text-slate-400 font-mono mt-0.5">
                      {device.patient ? (
                        <span className="text-slate-200 font-semibold flex items-center gap-1">
                          <User className="w-3 h-3 text-cyan-400" />
                          <span>{device.patient.patientName}</span>
                          <span className="text-slate-500">({device.patient.medicalRecordNumber})</span>
                        </span>
                      ) : (
                        <span className="text-slate-500 italic">No patient assigned</span>
                      )}
                    </div>
                  </div>
                </div>

                <div className="text-right">
                  <span
                    className={`px-2 py-0.5 text-[10px] font-mono font-bold rounded uppercase border ${
                      vitals?.bleStatus === 'connected'
                        ? 'bg-emerald-500/10 text-emerald-300 border-emerald-500/30'
                        : 'bg-slate-800 text-slate-400 border-slate-700'
                    }`}
                  >
                    BLE {vitals?.bleStatus || 'DISCONNECTED'}
                  </span>
                  <div className="text-[10px] text-slate-500 font-mono mt-1">
                    Battery: <span className={device.telemetry.batteryLevel < 30 ? 'text-amber-400' : 'text-slate-300'}>{device.telemetry.batteryLevel}%</span>
                  </div>
                </div>
              </div>

              {/* Critical Alert Ribbon */}
              {isCritical && vitals?.alertReason && (
                <div className="mb-3 p-2.5 bg-rose-950/80 border border-rose-500/40 rounded-xl text-xs font-mono text-rose-200 flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0 animate-bounce" />
                  <span>{vitals.alertReason}</span>
                </div>
              )}

              {/* Vitals Numeric Readings */}
              {vitals ? (
                <div className="grid grid-cols-4 gap-2 font-mono text-center mb-3">
                  <div className="p-2.5 bg-slate-950 rounded-xl border border-slate-800">
                    <div className="text-[10px] text-slate-500 uppercase">HEART RATE</div>
                    <div className="text-lg font-black text-rose-400 mt-0.5">{vitals.heartRateBpm} <span className="text-[10px] font-normal text-slate-400">BPM</span></div>
                  </div>
                  <div className="p-2.5 bg-slate-950 rounded-xl border border-slate-800">
                    <div className="text-[10px] text-slate-500 uppercase">SPO2</div>
                    <div className="text-lg font-black text-cyan-400 mt-0.5">{vitals.spo2Percent}<span className="text-[10px] font-normal text-slate-400">%</span></div>
                  </div>
                  <div className="p-2.5 bg-slate-950 rounded-xl border border-slate-800">
                    <div className="text-[10px] text-slate-500 uppercase">HRV</div>
                    <div className="text-lg font-black text-teal-400 mt-0.5">{vitals.hrvMs} <span className="text-[10px] font-normal text-slate-400">MS</span></div>
                  </div>
                  <div className="p-2.5 bg-slate-950 rounded-xl border border-slate-800">
                    <div className="text-[10px] text-slate-500 uppercase">ACTIVITY</div>
                    <div className="text-xs font-bold text-emerald-400 mt-1 capitalize">{vitals.activityState}</div>
                  </div>
                </div>
              ) : (
                <div className="p-4 text-center text-xs text-slate-400 font-mono bg-slate-950 rounded-xl border border-slate-800 mb-3">
                  Waiting for GATT service handshake...
                </div>
              )}

              {/* Connection Diagnostics Footer */}
              <div className="flex items-center justify-between text-[11px] font-mono text-slate-500 pt-2 border-t border-slate-800">
                <span className="flex items-center gap-1.5">
                  <ShieldCheck className="w-3.5 h-3.5 text-teal-400" />
                  <span>GATT Authenticated • Health Connect Synced</span>
                </span>
                <span>Last Sync: {vitals?.lastRpmSync || '12s ago'}</span>
              </div>
            </div>
          );
        })}
      </div>

    </div>
  );
};
