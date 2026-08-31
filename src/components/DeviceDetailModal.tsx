import React, { useState } from 'react';
import { 
  X, 
  Tv, 
  HeartPulse, 
  Cpu, 
  ArrowUpCircle, 
  Layers, 
  Settings, 
  FileText, 
  Battery, 
  Wifi, 
  Activity, 
  ShieldCheck, 
  User, 
  CheckCircle2, 
  AlertTriangle, 
  Radio, 
  Smartphone, 
  Watch, 
  Monitor, 
  Glasses, 
  Terminal, 
  Play, 
  RotateCcw,
  Sparkles,
  Lock,
  Edit2,
  Save,
  Clock
} from 'lucide-react';
import { DeviceRecord, ConnectionMode, PatientAssignment } from '../types/device';
import { useDevices } from '../context/DeviceContext';
import { getDeviceAdapter } from '../adapters/deviceAdapters';
import { RemoteScreenStream } from './RemoteScreenStream';

interface DeviceDetailModalProps {
  device: DeviceRecord;
  onClose: () => void;
}

export const DeviceDetailModal: React.FC<DeviceDetailModalProps> = ({ device, onClose }) => {
  const { 
    updateDeviceConnectionMode, 
    updateDevicePatient, 
    executeCommand, 
    startFirmwareRollout,
    firmwarePackages,
    auditEvents 
  } = useDevices();

  const adapter = getDeviceAdapter(device.platform);
  const capabilities = adapter.getCapabilities();

  const [activeTab, setActiveTab] = useState<'remote' | 'health_rpm' | 'hardware' | 'firmware' | 'apps' | 'config' | 'logs'>(
    device.rpmVitals ? 'health_rpm' : 'remote'
  );

  const [isEditingPatient, setIsEditingPatient] = useState(false);
  const [patientForm, setPatientForm] = useState<PatientAssignment>({
    patientId: device.patient?.patientId || `PT-${Math.floor(10000 + Math.random() * 90000)}`,
    patientName: device.patient?.patientName || '',
    medicalRecordNumber: device.patient?.medicalRecordNumber || `MRN-${Math.floor(1000000 + Math.random() * 9000000)}`,
    careTeam: device.patient?.careTeam || 'Geriatric Telemetry Team',
    assignedDate: device.patient?.assignedDate || new Date().toISOString().split('T')[0],
    monitoringProtocol: device.patient?.monitoringProtocol || 'Continuous Telemetry & Post-Op Cardiac',
  });

  const [configJson, setConfigJson] = useState(
    JSON.stringify(
      {
        kioskLockTask: device.connectionMode === 'kiosk',
        knoxCustomization: true,
        bleGattSamplingRateHz: 200,
        healthConnectExportIntervalSec: 15,
        allowedApps: device.installedApps,
        networkProfile: { ssid: device.telemetry.wifiSsid, vlan: 402 },
      },
      null,
      2
    )
  );
  const [isConfigSaved, setIsConfigSaved] = useState(false);

  const handleSavePatient = () => {
    if (patientForm.patientName.trim()) {
      updateDevicePatient(device.id, patientForm);
    } else {
      updateDevicePatient(device.id, undefined);
    }
    setIsEditingPatient(false);
  };

  const handleSaveConfig = async () => {
    setIsConfigSaved(true);
    await executeCommand('push_config', 'Push Managed Configuration', [device.id], { config: configJson });
    setTimeout(() => setIsConfigSaved(false), 3000);
  };

  const handleTriggerFirmwareUpdate = (pkgId: string) => {
    startFirmwareRollout(pkgId, [device.id]);
  };

  const deviceAuditLogs = auditEvents.filter(
    (e) => e.deviceId === device.id || (e.deviceName && e.deviceName.includes(device.name.split(' ')[0]))
  );

  const compatibleFirmware = firmwarePackages.filter(
    (f) => f.platform === device.platform && (f.targetModels.includes(device.model) || f.targetModels.length === 0)
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm overflow-y-auto animate-fadeIn">
      <div className="bg-slate-900 border border-slate-700/80 rounded-2xl w-full max-w-5xl max-h-[92vh] flex flex-col shadow-2xl overflow-hidden my-auto text-slate-100">
        
        {/* Modal Header */}
        <div className="px-6 py-4 bg-slate-950 border-b border-slate-800 flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3.5">
            <div className="p-2.5 rounded-xl bg-cyan-500/10 text-cyan-400 border border-cyan-500/30">
              {device.platform === 'wearos' && <Watch className="w-6 h-6" />}
              {device.platform === 'quest' && <Glasses className="w-6 h-6" />}
              {device.platform === 'windows' && <Monitor className="w-6 h-6" />}
              {(device.platform === 'android' || device.platform === 'ios' || device.platform === 'custom') && (
                <Smartphone className="w-6 h-6" />
              )}
            </div>

            <div>
              <div className="flex items-center gap-2.5">
                <h2 className="text-lg font-bold text-white tracking-tight">{device.name}</h2>
                
                {/* Status Dot */}
                <span
                  className={`px-2 py-0.5 text-xs font-mono font-bold rounded-full border flex items-center gap-1.5 ${
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
                  <span className="uppercase">{device.status}</span>
                </span>

                {/* Connection Mode Pill */}
                <select
                  value={device.connectionMode}
                  onChange={(e) => updateDeviceConnectionMode(device.id, e.target.value as ConnectionMode)}
                  className="bg-slate-800 text-[11px] font-mono text-cyan-300 px-2 py-0.5 rounded border border-slate-700 focus:outline-none focus:border-cyan-500 cursor-pointer"
                >
                  <option value="kiosk">KIOSK MODE</option>
                  <option value="mdm">MDM MANAGED</option>
                  <option value="standard">STANDARD</option>
                  <option value="restricted">RESTRICTED</option>
                </select>
              </div>

              <div className="text-xs text-slate-400 font-mono mt-0.5 flex items-center gap-2">
                <span>{device.model} ({device.manufacturer})</span>
                <span>•</span>
                <span>SN: {device.serialNumber}</span>
                <span>•</span>
                <span>FW: {device.firmwareVersion}</span>
              </div>
            </div>
          </div>

          {/* Quick Metrics & Close */}
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-3 text-xs font-mono bg-slate-900 px-3 py-1.5 rounded-lg border border-slate-800">
              <div className="flex items-center gap-1.5 text-slate-300">
                <Battery className={`w-3.5 h-3.5 ${device.telemetry.batteryLevel < 30 ? 'text-amber-400' : 'text-emerald-400'}`} />
                <span>{device.telemetry.batteryLevel}%</span>
                {device.telemetry.isCharging && <span className="text-[10px] text-cyan-400">(AC)</span>}
              </div>
              <div className="flex items-center gap-1.5 text-slate-300">
                <Wifi className="w-3.5 h-3.5 text-cyan-400" />
                <span>{device.telemetry.wifiSignalDbm} dBm</span>
              </div>
            </div>

            <button
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Patient Linkage & Signal Confirmation — surfaced prominently
            because a stale/missing signal is the trigger for staff to call
            the patient (see PROJECT_STATE plan). Real data only, never
            fabricated when absent. */}
        {(device.pcn || device.lastSignalConfirmedAt) && (
          <div className="px-6 py-3 bg-slate-950/60 border-b border-slate-800 flex flex-wrap items-center gap-4 text-xs font-mono">
            {device.pcn && (
              <div className="flex items-center gap-1.5 text-slate-300">
                <User className="w-3.5 h-3.5 text-cyan-400" />
                <span>PCN {device.pcn}</span>
                {device.patientEmail && <span className="text-slate-500">({device.patientEmail})</span>}
              </div>
            )}
            {device.lastSignalConfirmedAt ? (
              <div className="flex items-center gap-1.5 text-emerald-300">
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>
                  Signal confirmed {device.signalQuality ? `(${device.signalQuality}) ` : ''}
                  {new Date(device.lastSignalConfirmedAt).toLocaleString()}
                </span>
              </div>
            ) : device.pcn ? (
              <div className="flex items-center gap-1.5 text-amber-300">
                <Clock className="w-3.5 h-3.5" />
                <span>No signal confirmed yet</span>
              </div>
            ) : null}
          </div>
        )}

        {/* Tab Navigation */}
        <div className="px-6 bg-slate-950/60 border-b border-slate-800 flex items-center gap-1 overflow-x-auto text-xs font-medium">
          {device.capabilities.liveScreen && (
            <button
              onClick={() => setActiveTab('remote')}
              className={`px-4 py-3 border-b-2 font-semibold transition-all flex items-center gap-2 ${
                activeTab === 'remote'
                  ? 'border-cyan-400 text-cyan-300 bg-slate-900/60'
                  : 'border-transparent text-slate-400 hover:text-slate-200'
              }`}
            >
              <Tv className="w-4 h-4" />
              <span>Remote Operations</span>
            </button>
          )}

          {device.capabilities.healthTelemetry && (
            <button
              onClick={() => setActiveTab('health_rpm')}
              className={`px-4 py-3 border-b-2 font-semibold transition-all flex items-center gap-2 ${
                activeTab === 'health_rpm'
                  ? 'border-teal-400 text-teal-300 bg-slate-900/60'
                  : 'border-transparent text-slate-400 hover:text-slate-200'
              }`}
            >
              <HeartPulse className="w-4 h-4 text-teal-400" />
              <span>RPM Health Stream</span>
              {device.rpmVitals?.alertFlag === 'critical' && (
                <span className="w-2 h-2 rounded-full bg-rose-500 animate-ping"></span>
              )}
            </button>
          )}

          <button
            onClick={() => setActiveTab('hardware')}
            className={`px-4 py-3 border-b-2 font-semibold transition-all flex items-center gap-2 ${
              activeTab === 'hardware'
                ? 'border-cyan-400 text-cyan-300 bg-slate-900/60'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Cpu className="w-4 h-4" />
            <span>Hardware Telemetry</span>
          </button>

          <button
            onClick={() => setActiveTab('firmware')}
            className={`px-4 py-3 border-b-2 font-semibold transition-all flex items-center gap-2 ${
              activeTab === 'firmware'
                ? 'border-cyan-400 text-cyan-300 bg-slate-900/60'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <ArrowUpCircle className="w-4 h-4" />
            <span>Firmware & OTA</span>
          </button>

          <button
            onClick={() => setActiveTab('apps')}
            className={`px-4 py-3 border-b-2 font-semibold transition-all flex items-center gap-2 ${
              activeTab === 'apps'
                ? 'border-cyan-400 text-cyan-300 bg-slate-900/60'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Layers className="w-4 h-4" />
            <span>Applications ({device.installedApps.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('config')}
            className={`px-4 py-3 border-b-2 font-semibold transition-all flex items-center gap-2 ${
              activeTab === 'config'
                ? 'border-cyan-400 text-cyan-300 bg-slate-900/60'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Settings className="w-4 h-4" />
            <span>Configuration</span>
          </button>

          <button
            onClick={() => setActiveTab('logs')}
            className={`px-4 py-3 border-b-2 font-semibold transition-all flex items-center gap-2 ${
              activeTab === 'logs'
                ? 'border-cyan-400 text-cyan-300 bg-slate-900/60'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <FileText className="w-4 h-4" />
            <span>Audit Trail ({deviceAuditLogs.length})</span>
          </button>
        </div>

        {/* Tab Body */}
        <div className="flex-1 p-6 overflow-y-auto space-y-6">
          
          {/* TAB: REMOTE OPERATIONS */}
          {activeTab === 'remote' && (
            <div className="space-y-6">
              <RemoteScreenStream device={device} />
            </div>
          )}

          {/* TAB: HEALTH RPM STREAM */}
          {activeTab === 'health_rpm' && (
            <div className="space-y-6">
              {/* Patient Assignment Card */}
              <div className="p-4 bg-slate-950 rounded-xl border border-slate-800">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2 text-sm font-bold text-white">
                    <User className="w-4 h-4 text-cyan-400" />
                    <span>Clinical Patient Association</span>
                  </div>

                  {!isEditingPatient ? (
                    <button
                      onClick={() => setIsEditingPatient(true)}
                      className="px-2.5 py-1 text-xs font-semibold text-cyan-300 bg-cyan-950/60 border border-cyan-500/40 rounded-lg hover:bg-cyan-900/60 flex items-center gap-1.5"
                    >
                      <Edit2 className="w-3 h-3" />
                      <span>{device.patient ? 'Edit Assignment' : 'Assign Patient'}</span>
                    </button>
                  ) : (
                    <button
                      onClick={handleSavePatient}
                      className="px-2.5 py-1 text-xs font-semibold text-emerald-950 bg-emerald-400 rounded-lg hover:bg-emerald-300 flex items-center gap-1.5"
                    >
                      <Save className="w-3 h-3" />
                      <span>Save Changes</span>
                    </button>
                  )}
                </div>

                {!isEditingPatient ? (
                  device.patient ? (
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs font-mono">
                      <div className="p-3 bg-slate-900/80 rounded-lg border border-slate-800">
                        <div className="text-slate-500 uppercase text-[10px]">Patient Name</div>
                        <div className="text-white font-bold text-sm mt-0.5">{device.patient.patientName}</div>
                        <div className="text-cyan-400 text-[11px] mt-0.5">ID: {device.patient.patientId}</div>
                      </div>
                      <div className="p-3 bg-slate-900/80 rounded-lg border border-slate-800">
                        <div className="text-slate-500 uppercase text-[10px]">MRN & Care Team</div>
                        <div className="text-white font-semibold mt-0.5">{device.patient.medicalRecordNumber}</div>
                        <div className="text-slate-400 text-[11px] mt-0.5">{device.patient.careTeam}</div>
                      </div>
                      <div className="p-3 bg-slate-900/80 rounded-lg border border-slate-800">
                        <div className="text-slate-500 uppercase text-[10px]">Monitoring Protocol</div>
                        <div className="text-emerald-300 font-semibold mt-0.5">{device.patient.monitoringProtocol}</div>
                        <div className="text-slate-500 text-[10px] mt-0.5">Since {device.patient.assignedDate}</div>
                      </div>
                    </div>
                  ) : (
                    <div className="p-4 text-center text-xs text-slate-400 bg-slate-900/40 rounded-lg border border-dashed border-slate-800">
                      No patient assigned. This wearable telemetry is currently pooled or in standby.
                    </div>
                  )
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs font-mono">
                    <div>
                      <label className="text-[10px] text-slate-400 uppercase">Patient Full Name</label>
                      <input
                        type="text"
                        value={patientForm.patientName}
                        onChange={(e) => setPatientForm({ ...patientForm, patientName: e.target.value })}
                        placeholder="e.g. John Doe"
                        className="w-full mt-1 bg-slate-900 border border-slate-700 px-3 py-1.5 rounded text-white"
                      />
                    </div>
                    <div>
                      <label className="text-[10px] text-slate-400 uppercase">MRN (Medical Record Number)</label>
                      <input
                        type="text"
                        value={patientForm.medicalRecordNumber}
                        onChange={(e) => setPatientForm({ ...patientForm, medicalRecordNumber: e.target.value })}
                        className="w-full mt-1 bg-slate-900 border border-slate-700 px-3 py-1.5 rounded text-white"
                      />
                    </div>
                    <div>
                      <label className="text-[10px] text-slate-400 uppercase">Care Team / Ward</label>
                      <input
                        type="text"
                        value={patientForm.careTeam}
                        onChange={(e) => setPatientForm({ ...patientForm, careTeam: e.target.value })}
                        className="w-full mt-1 bg-slate-900 border border-slate-700 px-3 py-1.5 rounded text-white"
                      />
                    </div>
                    <div>
                      <label className="text-[10px] text-slate-400 uppercase">Monitoring Protocol</label>
                      <input
                        type="text"
                        value={patientForm.monitoringProtocol}
                        onChange={(e) => setPatientForm({ ...patientForm, monitoringProtocol: e.target.value })}
                        className="w-full mt-1 bg-slate-900 border border-slate-700 px-3 py-1.5 rounded text-white"
                      />
                    </div>
                  </div>
                )}
              </div>

              {/* Live GATT Stream & Vitals Grid */}
              {device.rpmVitals ? (
                <div className="space-y-4">
                  {/* Critical Alert Banner if flagged */}
                  {device.rpmVitals.alertFlag === 'critical' && (
                    <div className="p-3.5 bg-rose-950/80 border border-rose-500/50 rounded-xl flex items-center justify-between gap-3 text-xs font-mono text-rose-200">
                      <div className="flex items-center gap-2.5">
                        <AlertTriangle className="w-5 h-5 text-rose-400 animate-bounce" />
                        <div>
                          <div className="font-bold text-white text-sm">VITAL SIGN THRESHOLD ALARM</div>
                          <div className="text-[11px] text-rose-300">{device.rpmVitals.alertReason}</div>
                        </div>
                      </div>
                      <button
                        onClick={() => executeCommand('sync_mdm', 'Acknowledge Vital Alarm', [device.id])}
                        className="px-3 py-1.5 bg-rose-500 text-slate-950 font-bold rounded-lg text-xs hover:bg-rose-400"
                      >
                        Acknowledge
                      </button>
                    </div>
                  )}

                  {/* Vitals Metrics Grid */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 font-mono">
                    
                    {/* Heart Rate */}
                    <div className="p-3.5 bg-slate-950 rounded-xl border border-slate-800 space-y-1">
                      <div className="flex items-center justify-between text-[11px] text-slate-400">
                        <span>HEART RATE</span>
                        <Activity className="w-3.5 h-3.5 text-rose-400 animate-pulse" />
                      </div>
                      <div className="text-2xl font-black text-white flex items-baseline gap-1">
                        <span>{device.rpmVitals.heartRateBpm}</span>
                        <span className="text-xs text-rose-400 font-normal">BPM</span>
                      </div>
                      <div className="text-[10px] text-slate-500">Normal Range: 60-100</div>
                    </div>

                    {/* SpO2 */}
                    <div className="p-3.5 bg-slate-950 rounded-xl border border-slate-800 space-y-1">
                      <div className="flex items-center justify-between text-[11px] text-slate-400">
                        <span>BLOOD OXYGEN</span>
                        <span className="text-xs text-cyan-400 font-bold">SpO₂</span>
                      </div>
                      <div className="text-2xl font-black text-white flex items-baseline gap-1">
                        <span>{device.rpmVitals.spo2Percent}</span>
                        <span className="text-xs text-cyan-400 font-normal">%</span>
                      </div>
                      <div className="text-[10px] text-slate-500">Normal: ≥ 95%</div>
                    </div>

                    {/* HRV */}
                    <div className="p-3.5 bg-slate-950 rounded-xl border border-slate-800 space-y-1">
                      <div className="flex items-center justify-between text-[11px] text-slate-400">
                        <span>HEART VARIABILITY</span>
                        <span className="text-xs text-teal-400 font-bold">HRV</span>
                      </div>
                      <div className="text-2xl font-black text-white flex items-baseline gap-1">
                        <span>{device.rpmVitals.hrvMs}</span>
                        <span className="text-xs text-teal-400 font-normal">ms</span>
                      </div>
                      <div className="text-[10px] text-slate-500">Autonomous Balance</div>
                    </div>

                    {/* Respiratory */}
                    <div className="p-3.5 bg-slate-950 rounded-xl border border-slate-800 space-y-1">
                      <div className="flex items-center justify-between text-[11px] text-slate-400">
                        <span>RESPIRATION</span>
                        <span className="text-xs text-emerald-400 font-bold">RESP</span>
                      </div>
                      <div className="text-2xl font-black text-white flex items-baseline gap-1">
                        <span>{device.rpmVitals.respiratoryRate}</span>
                        <span className="text-xs text-emerald-400 font-normal">/min</span>
                      </div>
                      <div className="text-[10px] text-slate-500">State: {device.rpmVitals.activityState}</div>
                    </div>
                  </div>

                  {/* Simulated ECG / PPG Live Oscilloscope Stream */}
                  <div className="p-4 bg-slate-950 rounded-xl border border-slate-800 space-y-2">
                    <div className="flex items-center justify-between text-xs font-mono">
                      <span className="text-slate-300 font-bold flex items-center gap-2">
                        <Activity className="w-4 h-4 text-emerald-400 animate-pulse" />
                        <span>Continuous PPG / ECG Stream (200Hz Sample Rate)</span>
                      </span>
                      <span className="text-emerald-400 text-[11px]">GATT Stream Live</span>
                    </div>

                    <div className="h-20 bg-slate-900/90 rounded-lg p-2 flex items-center overflow-hidden relative">
                      {/* Animated SVG ECG wave */}
                      <svg className="w-full h-full text-emerald-400/80 stroke-current fill-none stroke-[2]" viewBox="0 0 500 60" preserveAspectRatio="none">
                        <path d="M 0 30 L 50 30 L 60 28 L 70 32 L 80 30 L 100 30 L 110 5 L 115 55 L 125 15 L 135 30 L 150 30 L 160 25 L 170 30 L 220 30 L 230 28 L 240 32 L 250 30 L 270 30 L 280 5 L 285 55 L 295 15 L 305 30 L 320 30 L 330 25 L 340 30 L 390 30 L 400 28 L 410 32 L 420 30 L 440 30 L 450 5 L 455 55 L 465 15 L 475 30 L 490 30 L 500 30" />
                      </svg>
                      {/* Scanning vertical line */}
                      <div className="absolute top-0 bottom-0 w-2 bg-gradient-to-r from-emerald-400 to-transparent animate-[marquee_3s_linear_infinite]"></div>
                    </div>
                  </div>

                  {/* Pipeline Ingestion Architecture Card */}
                  <div className="p-3.5 bg-slate-900/60 rounded-xl border border-slate-800 font-mono text-xs text-slate-400">
                    <div className="text-[10px] text-slate-500 uppercase font-bold mb-2">Authenticated Telemetry Pipeline State</div>
                    <div className="flex flex-wrap items-center gap-2 text-[11px]">
                      <span className="px-2 py-0.5 bg-slate-800 text-slate-200 rounded border border-slate-700">Galaxy Watch 7</span>
                      <span>➔</span>
                      <span className="px-2 py-0.5 bg-teal-950 text-teal-300 rounded border border-teal-800">BLE 5.3 GATT (UUID 0x180D)</span>
                      <span>➔</span>
                      <span className="px-2 py-0.5 bg-slate-800 text-cyan-300 rounded border border-slate-700">Device Gateway</span>
                      <span>➔</span>
                      <span className="px-2 py-0.5 bg-emerald-950 text-emerald-300 rounded border border-emerald-800">RPM Ingestion Engine</span>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="p-6 text-center text-xs text-slate-400 font-mono bg-slate-950 rounded-xl border border-slate-800">
                  This device does not have an active RPM wearable sensor connected.
                </div>
              )}
            </div>
          )}

          {/* TAB: HARDWARE TELEMETRY */}
          {activeTab === 'hardware' && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 font-mono text-xs">
                
                {/* CPU & RAM Usage */}
                <div className="p-4 bg-slate-950 rounded-xl border border-slate-800 space-y-3">
                  <div className="text-white font-bold flex items-center justify-between">
                    <span>COMPUTE LOAD</span>
                    <Cpu className="w-4 h-4 text-cyan-400" />
                  </div>

                  <div>
                    <div className="flex justify-between text-[11px] text-slate-400 mb-1">
                      <span>CPU Utilization</span>
                      <span className="text-white font-bold">{device.telemetry.cpuUsagePercent}%</span>
                    </div>
                    <div className="h-2 bg-slate-800 rounded-full overflow-hidden">
                      <div 
                        className={`h-full transition-all duration-500 ${
                          device.telemetry.cpuUsagePercent > 80 ? 'bg-rose-500' : device.telemetry.cpuUsagePercent > 50 ? 'bg-amber-400' : 'bg-cyan-400'
                        }`}
                        style={{ width: `${device.telemetry.cpuUsagePercent}%` }}
                      ></div>
                    </div>
                  </div>

                  <div>
                    <div className="flex justify-between text-[11px] text-slate-400 mb-1">
                      <span>RAM Memory</span>
                      <span className="text-white font-bold">{device.telemetry.ramUsagePercent}%</span>
                    </div>
                    <div className="h-2 bg-slate-800 rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-teal-400 transition-all duration-500"
                        style={{ width: `${device.telemetry.ramUsagePercent}%` }}
                      ></div>
                    </div>
                  </div>

                  <div className="text-[11px] text-slate-400 pt-1">
                    Thermal: <span className="text-white">{device.telemetry.temperatureCelsius}°C</span>
                  </div>
                </div>

                {/* Storage Utilization */}
                <div className="p-4 bg-slate-950 rounded-xl border border-slate-800 space-y-3">
                  <div className="text-white font-bold flex items-center justify-between">
                    <span>STORAGE DISK</span>
                    <span className="text-[10px] text-slate-500">UFS 3.1</span>
                  </div>

                  <div>
                    <div className="flex justify-between text-[11px] text-slate-400 mb-1">
                      <span>Internal Partition</span>
                      <span className="text-white font-bold">{device.telemetry.storageUsedGb} / {device.telemetry.storageTotalGb} GB</span>
                    </div>
                    <div className="h-2 bg-slate-800 rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-indigo-400"
                        style={{ width: `${(device.telemetry.storageUsedGb / device.telemetry.storageTotalGb) * 100}%` }}
                      ></div>
                    </div>
                  </div>

                  <div className="text-[11px] text-slate-400 space-y-1">
                    <div>Free Space: <span className="text-emerald-400">{(device.telemetry.storageTotalGb - device.telemetry.storageUsedGb).toFixed(1)} GB</span></div>
                    <div>Encrypted: <span className="text-cyan-400 font-bold">FBE / AES-256</span></div>
                  </div>
                </div>

                {/* Network & Connectivity */}
                <div className="p-4 bg-slate-950 rounded-xl border border-slate-800 space-y-2">
                  <div className="text-white font-bold flex items-center justify-between">
                    <span>NETWORK INTERFACE</span>
                    <Wifi className="w-4 h-4 text-cyan-400" />
                  </div>

                  <div className="space-y-1 text-[11px] text-slate-300">
                    <div className="flex justify-between">
                      <span className="text-slate-500">SSID:</span>
                      <span className="font-semibold text-white truncate max-w-[140px]">{device.telemetry.wifiSsid}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500">Signal:</span>
                      <span className="text-cyan-400">{device.telemetry.wifiSignalDbm} dBm (Good)</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500">IP Address:</span>
                      <span className="text-white">{device.telemetry.ipAddress}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500">MAC:</span>
                      <span className="text-slate-400">{device.telemetry.macAddress}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500">Uptime:</span>
                      <span className="text-emerald-400">{device.telemetry.uptimeHours} hrs</span>
                    </div>
                  </div>
                </div>

              </div>

              {/* Capability Matrix for this hardware */}
              <div className="p-4 bg-slate-950 rounded-xl border border-slate-800">
                <div className="text-xs font-bold text-white mb-3 font-mono uppercase tracking-wider">
                  Device Capability Matrix (Platform: {device.platform.toUpperCase()})
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs font-mono">
                  {Object.entries(capabilities).map(([capKey, isSupported]) => (
                    <div
                      key={capKey}
                      className={`p-2 rounded-lg border flex items-center justify-between ${
                        isSupported
                          ? 'bg-emerald-950/20 text-emerald-300 border-emerald-800/40'
                          : 'bg-slate-900 text-slate-600 border-slate-800'
                      }`}
                    >
                      <span className="capitalize">{capKey.replace(/([A-Z])/g, ' $1')}</span>
                      <span className="font-bold">{isSupported ? '✓' : '—'}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* TAB: FIRMWARE & OTA */}
          {activeTab === 'firmware' && (
            <div className="space-y-6">
              <div className="p-4 bg-slate-950 rounded-xl border border-slate-800 flex flex-wrap items-center justify-between gap-4 font-mono text-xs">
                <div>
                  <div className="text-slate-400 uppercase text-[10px]">Current Active Firmware</div>
                  <div className="text-lg font-black text-white">{device.firmwareVersion}</div>
                  <div className="text-slate-500 text-[11px]">OS: {device.osVersion} • Verified by Bootloader</div>
                </div>

                {device.pendingUpdate && (
                  <div className="p-3 bg-cyan-950/60 border border-cyan-500/40 rounded-xl space-y-1 min-w-[240px]">
                    <div className="flex justify-between text-cyan-300 font-bold">
                      <span>OTA Update: {device.pendingUpdate.targetVersion}</span>
                      <span>{device.pendingUpdate.progressPercent}%</span>
                    </div>
                    <div className="h-2 bg-slate-800 rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-cyan-400 transition-all duration-300"
                        style={{ width: `${device.pendingUpdate.progressPercent}%` }}
                      ></div>
                    </div>
                    <div className="text-[10px] text-slate-400 uppercase">Stage: {device.pendingUpdate.stage}</div>
                  </div>
                )}
              </div>

              {/* Available Firmware Packages for this device */}
              <div className="space-y-3">
                <div className="text-xs font-bold text-slate-300 uppercase font-mono tracking-wider">
                  Available Firmware Packages in Enterprise Repository
                </div>

                {compatibleFirmware.map((pkg) => (
                  <div
                    key={pkg.id}
                    className="p-4 bg-slate-950 rounded-xl border border-slate-800 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 font-mono text-xs"
                  >
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-white text-sm">{pkg.version}</span>
                        <span className="px-1.5 py-0.5 bg-emerald-500/10 text-emerald-300 border border-emerald-500/30 rounded text-[10px] uppercase font-bold">
                          {pkg.channel}
                        </span>
                        <span className="text-slate-500">{pkg.sizeMb} MB</span>
                      </div>

                      <div className="text-slate-400 text-[11px]">
                        Target Models: {pkg.targetModels.join(', ')}
                      </div>

                      <ul className="list-disc list-inside text-slate-400 text-[10px] pt-1 space-y-0.5">
                        {pkg.releaseNotes.slice(0, 2).map((note, idx) => (
                          <li key={idx}>{note}</li>
                        ))}
                      </ul>
                    </div>

                    <div className="shrink-0">
                      {device.firmwareVersion === pkg.version ? (
                        <span className="px-3 py-1.5 bg-slate-800 text-slate-400 rounded-lg text-xs font-semibold flex items-center gap-1.5">
                          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                          <span>Installed</span>
                        </span>
                      ) : device.status === 'updating' ? (
                        <span className="px-3 py-1.5 bg-cyan-950/60 text-cyan-300 border border-cyan-500/40 rounded-lg text-xs font-semibold">
                          Updating...
                        </span>
                      ) : (
                        <button
                          onClick={() => handleTriggerFirmwareUpdate(pkg.id)}
                          className="px-3 py-1.5 bg-gradient-to-r from-cyan-500 to-teal-500 text-slate-950 font-bold rounded-lg text-xs hover:from-cyan-400 hover:to-teal-400 transition-all flex items-center gap-1.5 shadow-md shadow-cyan-500/20"
                        >
                          <ArrowUpCircle className="w-4 h-4" />
                          <span>Push OTA Flash</span>
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB: APPLICATIONS */}
          {activeTab === 'apps' && (
            <div className="space-y-4">
              <div className="text-xs font-bold text-slate-300 uppercase font-mono tracking-wider">
                Managed Application Catalog on Hardware
              </div>

              <div className="space-y-2 font-mono text-xs">
                {device.installedApps.map((pkgName) => (
                  <div
                    key={pkgName}
                    className="p-3 bg-slate-950 rounded-xl border border-slate-800 flex items-center justify-between gap-3"
                  >
                    <div>
                      <div className="font-bold text-white text-sm">{pkgName}</div>
                      <div className="text-[11px] text-slate-400">
                        {device.telemetry.currentForegroundApp === pkgName ? (
                          <span className="text-emerald-400 font-bold">● Active in Foreground</span>
                        ) : (
                          'Background Service / Standby'
                        )}
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => executeCommand('launch_app', `Launch ${pkgName}`, [device.id], { packageName: pkgName })}
                        className="px-3 py-1 bg-cyan-950 text-cyan-300 border border-cyan-500/40 rounded hover:bg-cyan-900 text-xs font-semibold flex items-center gap-1"
                      >
                        <Play className="w-3 h-3" />
                        <span>Launch</span>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB: CONFIGURATION */}
          {activeTab === 'config' && (
            <div className="space-y-4 font-mono text-xs">
              <div className="flex justify-between items-center">
                <span className="text-xs font-bold text-slate-300 uppercase tracking-wider">
                  Managed Enterprise JSON Configuration
                </span>
                <button
                  onClick={handleSaveConfig}
                  className="px-3 py-1 bg-cyan-500 text-slate-950 font-bold rounded hover:bg-cyan-400 flex items-center gap-1.5"
                >
                  <Save className="w-3.5 h-3.5" />
                  <span>Push Config Payload</span>
                </button>
              </div>

              {isConfigSaved && (
                <div className="p-2.5 bg-emerald-950/60 border border-emerald-500/40 text-emerald-300 rounded text-xs">
                  ✓ Configuration payload successfully transmitted and applied.
                </div>
              )}

              <textarea
                value={configJson}
                onChange={(e) => setConfigJson(e.target.value)}
                rows={10}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 font-mono text-xs text-cyan-300 focus:outline-none focus:border-cyan-500"
              ></textarea>
            </div>
          )}

          {/* TAB: AUDIT LOGS */}
          {activeTab === 'logs' && (
            <div className="space-y-3 font-mono text-xs">
              <div className="text-xs font-bold text-slate-300 uppercase tracking-wider">
                Hardware Compliance & Command Log
              </div>

              {deviceAuditLogs.length > 0 ? (
                <div className="space-y-2">
                  {deviceAuditLogs.map((log) => (
                    <div
                      key={log.id}
                      className="p-3 bg-slate-950 rounded-xl border border-slate-800 space-y-1"
                    >
                      <div className="flex justify-between items-center">
                        <span className="font-bold text-white">{log.action}</span>
                        <span className="text-slate-500 text-[10px]">{log.timestamp}</span>
                      </div>
                      <div className="text-slate-400 text-[11px]">{log.details}</div>
                      <div className="text-[10px] text-cyan-400">Actor: {log.actor}</div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="p-6 text-center text-slate-400 bg-slate-950 rounded-xl border border-slate-800">
                  No previous audit events recorded for this device.
                </div>
              )}
            </div>
          )}

        </div>

        {/* Modal Footer Quick Actions */}
        <div className="px-6 py-3 bg-slate-950 border-t border-slate-800 flex items-center justify-between text-xs font-mono text-slate-400">
          <div>Enrolled: {device.enrolledAt.split('T')[0]} • Group: {device.deviceGroup}</div>
          <button
            onClick={onClose}
            className="px-4 py-1.5 bg-slate-800 hover:bg-slate-700 text-white rounded-lg font-semibold transition-colors"
          >
            Close
          </button>
        </div>

      </div>
    </div>
  );
};
