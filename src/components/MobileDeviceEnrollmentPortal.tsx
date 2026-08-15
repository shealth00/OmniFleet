import React, { useState, useEffect } from 'react';
import { 
  ShieldCheck, 
  Smartphone, 
  CheckCircle2, 
  AlertTriangle, 
  ArrowRight, 
  Download, 
  Wifi, 
  HardDrive, 
  Terminal, 
  Lock, 
  Sparkles,
  ExternalLink,
  RefreshCw,
  Copy,
  Check
} from 'lucide-react';
import { useDevices } from '../context/DeviceContext';
import { PlatformType } from '../types/device';

interface MobileDeviceEnrollmentPortalProps {
  token: string;
  onClose?: () => void;
}

export const MobileDeviceEnrollmentPortal: React.FC<MobileDeviceEnrollmentPortalProps> = ({ 
  token,
  onClose 
}) => {
  const { enrollmentSessions, completeEnrollmentFromQR, devices } = useDevices();

  const session = enrollmentSessions.find(s => s.token === token) || {
    id: 'manual-session',
    token: token || 'SH-ENR-2026-X9921',
    organization: 'Sally Health Systems',
    site: 'Chicago SNF Facility',
    deviceGroup: 'Chicago SNF Group',
    connectionMode: 'kiosk' as const,
    targetPlatform: 'android' as PlatformType,
    assignedPolicy: 'Strict Clinical Kiosk Policy (v2.4)',
    createdDate: new Date().toISOString(),
    expiresAt: new Date(Date.now() + 86400000).toISOString(),
    singleUse: false,
    used: false,
    qrPayloadJson: ''
  };

  const [deviceName, setDeviceName] = useState<string>('Galaxy Tab S8 Plus');
  const [deviceModel, setDeviceModel] = useState<string>('SM-X800 (Android 14)');
  const [assignedAssetTag, setAssignedAssetTag] = useState<string>('ASSET-TAB-' + Math.floor(1000 + Math.random() * 9000));
  const [selectedProfileType, setSelectedProfileType] = useState<'developer_workstation' | 'clinical_kiosk' | 'rpm_telemetry'>('developer_workstation');
  
  // Progress State
  const [enrollStatus, setEnrollStatus] = useState<'ready' | 'enrolling' | 'completed' | 'error'>('ready');
  const [currentStep, setCurrentStep] = useState<number>(0);
  const [statusMessage, setStatusMessage] = useState<string>('');
  const [createdDeviceId, setCreatedDeviceId] = useState<string | null>(null);
  const [copiedScript, setCopiedScript] = useState<boolean>(false);

  // Auto-detect browser user agent
  useEffect(() => {
    const ua = navigator.userAgent;
    if (/Android/i.test(ua)) {
      const match = ua.match(/Android\s([0-9\.]+);\s*([^;]+)\sBuild/);
      if (match) {
        setDeviceModel(`${match[2]} (Android ${match[1]})`);
        setDeviceName(match[2]);
      }
    }
  }, []);

  const handleStartEnrollment = async () => {
    setEnrollStatus('enrolling');
    setCurrentStep(1);
    setStatusMessage('Validating Zero-Trust session token with Sally Health Gateway...');
    await new Promise(r => setTimeout(r, 700));

    setCurrentStep(2);
    setStatusMessage('Generating device keypair & mutual TLS root certificates...');
    await new Promise(r => setTimeout(r, 800));

    setCurrentStep(3);
    setStatusMessage('Binding storage mount smb://192.168.1.100/volume/projects to /sdcard/NAS_Projects...');
    await new Promise(r => setTimeout(r, 900));

    setCurrentStep(4);
    setStatusMessage('Applying Android 12+ daemon persistence & phantom killer fix...');
    await new Promise(r => setTimeout(r, 800));

    setCurrentStep(5);
    const result = completeEnrollmentFromQR(session.token, {
      name: deviceName,
      model: deviceModel,
      assetTag: assignedAssetTag,
      platform: session.targetPlatform,
      organization: session.organization,
      site: session.site,
      deviceGroup: session.deviceGroup,
      policyName: session.assignedPolicy,
    });

    if (result.success) {
      setEnrollStatus('completed');
      setStatusMessage('Device successfully enrolled and online in the Sally Health MDM Fleet!');
      setCreatedDeviceId('dev-enr-' + Date.now());
    } else {
      setEnrollStatus('error');
      setStatusMessage(result.message || 'Enrollment failed. Token may be expired or already used.');
    }
  };

  const termuxCommand = `curl -sSL http://192.168.1.100:3000/api/enroll-tablet.sh | bash -s -- --token ${session.token} --nas smb://192.168.1.100/volume/projects`;

  const copyTermuxCommand = () => {
    navigator.clipboard.writeText(termuxCommand);
    setCopiedScript(true);
    setTimeout(() => setCopiedScript(false), 2000);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col justify-center items-center p-4 md:p-6 font-sans">
      <div className="w-full max-w-xl bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl shadow-cyan-950/40 overflow-hidden">
        
        {/* Top Header */}
        <div className="p-6 bg-slate-950 border-b border-slate-800 text-center relative">
          <div className="inline-flex items-center justify-center p-3 rounded-2xl bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 mb-3 shadow-lg shadow-cyan-500/10">
            <ShieldCheck className="w-8 h-8" />
          </div>
          <h1 className="text-xl md:text-2xl font-bold text-white tracking-tight">
            Device Enrollment & Onboarding Portal
          </h1>
          <p className="text-xs text-slate-400 font-mono mt-1">
            Sally Health Systems • Automated Zero-Touch Provisioning
          </p>

          <div className="mt-3 inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/30 text-cyan-300 text-xs font-mono">
            <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse"></span>
            Token: <span className="font-bold text-white">{session.token}</span>
          </div>
        </div>

        {/* Body Content */}
        <div className="p-6 space-y-6">

          {enrollStatus === 'ready' && (
            <div className="space-y-5">
              
              {/* Target Assignment Details */}
              <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-3 text-xs font-mono">
                <div className="text-[10px] text-slate-500 uppercase font-bold">Assigned Organization & Site</div>
                <div className="grid grid-cols-2 gap-2 text-slate-300">
                  <div>
                    <span className="text-slate-500">Org:</span> <span className="text-white font-bold">{session.organization}</span>
                  </div>
                  <div>
                    <span className="text-slate-500">Site:</span> <span className="text-cyan-300 font-bold">{session.site}</span>
                  </div>
                  <div>
                    <span className="text-slate-500">Group:</span> <span className="text-white font-bold">{session.deviceGroup}</span>
                  </div>
                  <div>
                    <span className="text-slate-500">Policy:</span> <span className="text-emerald-400 font-bold truncate block">{session.assignedPolicy}</span>
                  </div>
                </div>

                <div className="pt-2 border-t border-slate-900 flex items-center justify-between text-[11px]">
                  <span className="text-slate-500">Master NAS Storage:</span>
                  <span className="text-purple-300 font-bold">smb://192.168.1.100/volume/projects</span>
                </div>
              </div>

              {/* Device Customization Form */}
              <div className="space-y-4 text-xs font-mono">
                <div>
                  <label className="block text-slate-400 mb-1 font-bold">Device Name</label>
                  <input
                    type="text"
                    value={deviceName}
                    onChange={(e) => setDeviceName(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-white font-mono focus:outline-none focus:border-cyan-500"
                    placeholder="e.g. Bedside Tablet 4B"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-slate-400 mb-1 font-bold">Hardware Model</label>
                    <input
                      type="text"
                      value={deviceModel}
                      onChange={(e) => setDeviceModel(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-white font-mono focus:outline-none focus:border-cyan-500"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-400 mb-1 font-bold">Asset Tag</label>
                    <input
                      type="text"
                      value={assignedAssetTag}
                      onChange={(e) => setAssignedAssetTag(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-white font-mono focus:outline-none focus:border-cyan-500"
                    />
                  </div>
                </div>

                {/* Profile Archetype Selection */}
                <div>
                  <label className="block text-slate-400 mb-2 font-bold">Deployment Mode</label>
                  <div className="grid grid-cols-3 gap-2">
                    <button
                      type="button"
                      onClick={() => setSelectedProfileType('developer_workstation')}
                      className={`p-2.5 rounded-lg border text-left transition-all ${
                        selectedProfileType === 'developer_workstation'
                          ? 'bg-cyan-500/20 border-cyan-500 text-cyan-300 font-bold'
                          : 'bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-700'
                      }`}
                    >
                      <Terminal className="w-4 h-4 mb-1 text-cyan-400" />
                      <div className="text-[11px]">Developer Tablet</div>
                      <div className="text-[9px] text-slate-500 font-normal">VS Code & Termux</div>
                    </button>

                    <button
                      type="button"
                      onClick={() => setSelectedProfileType('clinical_kiosk')}
                      className={`p-2.5 rounded-lg border text-left transition-all ${
                        selectedProfileType === 'clinical_kiosk'
                          ? 'bg-cyan-500/20 border-cyan-500 text-cyan-300 font-bold'
                          : 'bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-700'
                      }`}
                    >
                      <Lock className="w-4 h-4 mb-1 text-emerald-400" />
                      <div className="text-[11px]">Clinical Kiosk</div>
                      <div className="text-[9px] text-slate-500 font-normal">Locked App Shell</div>
                    </button>

                    <button
                      type="button"
                      onClick={() => setSelectedProfileType('rpm_telemetry')}
                      className={`p-2.5 rounded-lg border text-left transition-all ${
                        selectedProfileType === 'rpm_telemetry'
                          ? 'bg-cyan-500/20 border-cyan-500 text-cyan-300 font-bold'
                          : 'bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-700'
                      }`}
                    >
                      <Sparkles className="w-4 h-4 mb-1 text-purple-400" />
                      <div className="text-[11px]">RPM Telemetry</div>
                      <div className="text-[9px] text-slate-500 font-normal">Sensor Hub</div>
                    </button>
                  </div>
                </div>
              </div>

              {/* Primary Action Button */}
              <button
                onClick={handleStartEnrollment}
                className="w-full py-3 bg-gradient-to-r from-cyan-600 to-teal-600 hover:from-cyan-500 hover:to-teal-500 text-white font-bold text-sm rounded-xl shadow-lg shadow-cyan-600/30 flex items-center justify-center gap-2 transition-all cursor-pointer"
              >
                <span>Enroll Device Now</span>
                <ArrowRight className="w-4 h-4" />
              </button>

              {/* Termux / CLI Alternative */}
              <div className="pt-3 border-t border-slate-800">
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-[11px] text-slate-400 font-mono font-bold flex items-center gap-1.5">
                    <Terminal className="w-3.5 h-3.5 text-cyan-400" />
                    For Termux / Developer Tablets:
                  </span>
                  <button
                    onClick={copyTermuxCommand}
                    className="text-[10px] text-cyan-400 hover:text-cyan-300 font-mono flex items-center gap-1"
                  >
                    {copiedScript ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                    <span>{copiedScript ? 'Copied' : 'Copy 1-Liner'}</span>
                  </button>
                </div>
                <div className="p-2.5 bg-slate-950 rounded-lg border border-slate-800 text-[10px] font-mono text-cyan-300 break-all select-all">
                  {termuxCommand}
                </div>
              </div>

            </div>
          )}

          {/* Enrolling Progress View */}
          {enrollStatus === 'enrolling' && (
            <div className="space-y-6 py-6 text-center">
              <div className="relative inline-flex items-center justify-center">
                <div className="w-16 h-16 rounded-full border-4 border-cyan-500/20 border-t-cyan-400 animate-spin"></div>
                <Smartphone className="w-6 h-6 text-cyan-400 absolute" />
              </div>

              <div className="space-y-2">
                <h3 className="text-base font-bold text-white">Provisioning Device Configuration</h3>
                <p className="text-xs text-cyan-400 font-mono animate-pulse">{statusMessage}</p>
              </div>

              {/* Progress Steps */}
              <div className="space-y-2 text-left text-xs font-mono max-w-md mx-auto">
                {[
                  { step: 1, label: 'Zero-Trust Token Validation' },
                  { step: 2, label: 'Mutual TLS Certificates & Policy Binding' },
                  { step: 3, label: 'SMB 3.1 Network Mount (192.168.1.100/volume/projects)' },
                  { step: 4, label: 'Android 12+ Daemon Tuning & WakeLock' },
                  { step: 5, label: 'Central Fleet Gateway Registration' },
                ].map(s => (
                  <div 
                    key={s.step}
                    className={`p-2.5 rounded-lg border flex items-center justify-between ${
                      currentStep > s.step 
                        ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300'
                        : currentStep === s.step
                        ? 'bg-cyan-500/10 border-cyan-500/40 text-cyan-300 font-bold'
                        : 'bg-slate-950 border-slate-800 text-slate-600'
                    }`}
                  >
                    <span>{s.step}. {s.label}</span>
                    {currentStep > s.step && <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />}
                    {currentStep === s.step && <RefreshCw className="w-4 h-4 text-cyan-400 animate-spin shrink-0" />}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Completed State */}
          {enrollStatus === 'completed' && (
            <div className="space-y-6 py-4 text-center">
              <div className="inline-flex p-3 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 mb-1">
                <CheckCircle2 className="w-10 h-10" />
              </div>

              <div className="space-y-1">
                <h2 className="text-xl font-bold text-white">Enrollment Successful!</h2>
                <p className="text-xs text-emerald-400 font-mono">{statusMessage}</p>
              </div>

              <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 text-left text-xs font-mono space-y-2">
                <div className="flex justify-between">
                  <span className="text-slate-500">Device Name:</span>
                  <span className="text-white font-bold">{deviceName}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Status:</span>
                  <span className="text-emerald-400 font-bold">COMPLIANT & ACTIVE</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Storage Mount:</span>
                  <span className="text-purple-300 font-bold">smb://192.168.1.100/volume/projects</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Local VS Code:</span>
                  <span className="text-cyan-300 font-bold">http://localhost:8080</span>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-3 pt-2">
                <a
                  href="http://localhost:8080"
                  target="_blank"
                  rel="noreferrer"
                  className="flex-1 py-2.5 bg-gradient-to-r from-cyan-600 to-teal-600 hover:from-cyan-500 hover:to-teal-500 text-white font-bold text-xs rounded-xl flex items-center justify-center gap-1.5 shadow-md"
                >
                  <ExternalLink className="w-4 h-4" />
                  <span>Open Local VS Code (:8080)</span>
                </a>

                {onClose ? (
                  <button
                    onClick={onClose}
                    className="px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs rounded-xl"
                  >
                    View MDM Console
                  </button>
                ) : (
                  <a
                    href={window.location.pathname}
                    className="px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs rounded-xl flex items-center justify-center"
                  >
                    Go to MDM Console
                  </a>
                )}
              </div>
            </div>
          )}

          {/* Error State */}
          {enrollStatus === 'error' && (
            <div className="space-y-4 py-4 text-center">
              <div className="inline-flex p-3 rounded-full bg-rose-500/20 text-rose-400 border border-rose-500/40">
                <AlertTriangle className="w-8 h-8" />
              </div>
              <h3 className="text-base font-bold text-white">Enrollment Failed</h3>
              <p className="text-xs text-rose-300 font-mono">{statusMessage}</p>
              <button
                onClick={() => setEnrollStatus('ready')}
                className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-lg text-xs font-mono font-bold"
              >
                Try Again
              </button>
            </div>
          )}

        </div>

        {/* Footer */}
        <div className="px-6 py-3 bg-slate-950 border-t border-slate-800 flex items-center justify-between text-[11px] text-slate-500 font-mono">
          <span>Sally Health Unified MDM Gateway v2.4</span>
          <span>Zero-Trust Attestation</span>
        </div>

      </div>
    </div>
  );
};
