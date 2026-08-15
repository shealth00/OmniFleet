import React, { useState, useEffect, useRef } from 'react';
import QRCode from 'qrcode';
import { 
  QrCode, 
  X, 
  Check, 
  Copy, 
  Printer, 
  ShieldCheck, 
  Sparkles, 
  RefreshCw, 
  Smartphone, 
  Watch, 
  Monitor, 
  Glasses, 
  ArrowRight, 
  FileJson,
  Layers,
  CheckCircle2
} from 'lucide-react';
import { EnrollmentSession, PlatformType, ConnectionMode } from '../types/device';
import { useDevices } from '../context/DeviceContext';

interface QREnrollmentModalProps {
  onClose: () => void;
}

export const QREnrollmentModal: React.FC<QREnrollmentModalProps> = ({ onClose }) => {
  const { enrollmentSessions, createEnrollmentSession, completeEnrollmentFromQR } = useDevices();

  const [activeTab, setActiveTab] = useState<'generate' | 'simulate_scan' | 'sessions'>('generate');
  const [selectedSessionId, setSelectedSessionId] = useState<string>(enrollmentSessions[0]?.id || '');
  
  // New session form
  const [org, setOrg] = useState('Sally Health Systems');
  const [site, setSite] = useState('Chicago SNF Facility');
  const [group, setGroup] = useState('Chicago SNF Group');
  const [platform, setPlatform] = useState<PlatformType>('android');
  const [connectionMode, setConnectionMode] = useState<ConnectionMode>('kiosk');
  const [policy, setPolicy] = useState('POL-CLINICAL-KIOSK-STRICT-V3');
  const [isSingleUse, setIsSingleUse] = useState(false);

  // QR Canvas ref
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [copiedToken, setCopiedToken] = useState(false);
  const [copiedJson, setCopiedJson] = useState(false);

  // Simulation state
  const [simStep, setSimStep] = useState<number>(0);
  const [simDeviceName, setSimDeviceName] = useState('Bedside Tablet 4B');
  const [simPlatform, setSimPlatform] = useState<PlatformType>('android');
  const [simResult, setSimResult] = useState<string | null>(null);
  const [isSimulating, setIsSimulating] = useState(false);

  const activeSession = enrollmentSessions.find(s => s.id === selectedSessionId) || enrollmentSessions[0];

  // Render QR Code onto canvas
  useEffect(() => {
    if (canvasRef.current && activeSession) {
      QRCode.toCanvas(
        canvasRef.current,
        activeSession.qrPayloadJson,
        {
          width: 240,
          margin: 2,
          color: {
            dark: '#030712',
            light: '#38bdf8',
          },
        },
        (error) => {
          if (error) console.error('QR Generation error:', error);
        }
      );
    }
  }, [activeSession, activeTab]);

  const handleCreateNewSession = () => {
    const newSess = createEnrollmentSession({
      organization: org,
      site,
      deviceGroup: group,
      targetPlatform: platform,
      connectionMode,
      assignedPolicy: policy,
      singleUse: isSingleUse,
    });
    setSelectedSessionId(newSess.id);
  };

  const handleCopyToken = () => {
    if (!activeSession) return;
    navigator.clipboard.writeText(activeSession.token);
    setCopiedToken(true);
    setTimeout(() => setCopiedToken(false), 2000);
  };

  const handleCopyJson = () => {
    if (!activeSession) return;
    navigator.clipboard.writeText(activeSession.qrPayloadJson);
    setCopiedJson(true);
    setTimeout(() => setCopiedJson(false), 2000);
  };

  const handleRunSimulation = async () => {
    if (!activeSession) return;
    setIsSimulating(true);
    setSimStep(1); // 1: Camera scanning QR
    await new Promise(r => setTimeout(r, 700));

    setSimStep(2); // 2: Authenticating token with gateway
    await new Promise(r => setTimeout(r, 800));

    setSimStep(3); // 3: Downloading enterprise policy & certs
    await new Promise(r => setTimeout(r, 900));

    setSimStep(4); // 4: Registering hardware certificate
    const res = completeEnrollmentFromQR(activeSession.token, {
      name: simDeviceName,
      platform: simPlatform,
    });

    await new Promise(r => setTimeout(r, 600));
    setSimStep(5); // 5: Completed & online
    setIsSimulating(false);
    setSimResult(res.message);
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm overflow-y-auto animate-fadeIn">
      <div className="bg-slate-900 border border-slate-700/80 rounded-2xl w-full max-w-4xl max-h-[92vh] flex flex-col shadow-2xl overflow-hidden my-auto text-slate-100">
        
        {/* Modal Header */}
        <div className="px-6 py-4 bg-slate-950 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-cyan-500/10 text-cyan-400 border border-cyan-500/30">
              <QrCode className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white tracking-tight">QR Code Device Enrollment & Provisioning</h2>
              <p className="text-xs text-slate-400 font-mono">
                Short-lived zero-trust tokens with automated profile, certificate, and MDM distribution.
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Controls */}
        <div className="px-6 bg-slate-950/60 border-b border-slate-800 flex items-center gap-2 text-xs font-medium">
          <button
            onClick={() => setActiveTab('generate')}
            className={`px-4 py-3 border-b-2 font-semibold transition-all flex items-center gap-2 ${
              activeTab === 'generate'
                ? 'border-cyan-400 text-cyan-300 bg-slate-900/60'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <QrCode className="w-4 h-4" />
            <span>Active QR & Payload</span>
          </button>

          <button
            onClick={() => setActiveTab('simulate_scan')}
            className={`px-4 py-3 border-b-2 font-semibold transition-all flex items-center gap-2 ${
              activeTab === 'simulate_scan'
                ? 'border-cyan-400 text-cyan-300 bg-slate-900/60'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Sparkles className="w-4 h-4 text-cyan-400" />
            <span>Simulate Device Scan</span>
          </button>

          <button
            onClick={() => setActiveTab('sessions')}
            className={`px-4 py-3 border-b-2 font-semibold transition-all flex items-center gap-2 ${
              activeTab === 'sessions'
                ? 'border-cyan-400 text-cyan-300 bg-slate-900/60'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Layers className="w-4 h-4" />
            <span>Create New Session ({enrollmentSessions.length})</span>
          </button>
        </div>

        {/* Modal Body */}
        <div className="flex-1 p-6 overflow-y-auto">
          
          {/* TAB 1: ACTIVE QR & PAYLOAD */}
          {activeTab === 'generate' && activeSession && (
            <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
              
              {/* QR Code Canvas Card (5 COLS) */}
              <div className="md:col-span-5 p-5 bg-slate-950 rounded-2xl border border-slate-800 flex flex-col items-center justify-between text-center space-y-4">
                <div className="w-full text-left">
                  <div className="text-[10px] text-slate-500 uppercase font-mono font-bold">Enrollment Session</div>
                  <div className="text-sm font-bold text-white font-mono truncate">{activeSession.token}</div>
                </div>

                {/* QR Canvas */}
                <div className="p-3 bg-cyan-400 rounded-2xl shadow-xl shadow-cyan-500/10">
                  <canvas ref={canvasRef} className="rounded-lg"></canvas>
                </div>

                <div className="text-xs text-slate-400 font-mono space-y-1">
                  <div>Scan via Knox Enrollment / Apple Setup / Wear Companion</div>
                  <div className="text-[10px] text-slate-500">Expires: {new Date(activeSession.expiresAt).toLocaleString()}</div>
                </div>

                {/* Action Buttons */}
                <div className="flex gap-2 w-full pt-2">
                  <button
                    onClick={handleCopyToken}
                    className="flex-1 py-2 bg-slate-900 hover:bg-slate-850 text-slate-200 border border-slate-700 rounded-xl text-xs font-mono font-semibold flex items-center justify-center gap-1.5 transition-colors"
                  >
                    {copiedToken ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5 text-cyan-400" />}
                    <span>{copiedToken ? 'Copied' : 'Copy Token'}</span>
                  </button>

                  <button
                    onClick={handlePrint}
                    className="px-3 py-2 bg-slate-900 hover:bg-slate-850 text-slate-200 border border-slate-700 rounded-xl text-xs font-mono font-semibold flex items-center justify-center gap-1.5 transition-colors"
                    title="Print Provisioning Badge"
                  >
                    <Printer className="w-3.5 h-3.5 text-slate-300" />
                    <span>Print</span>
                  </button>
                </div>
              </div>

              {/* Session Details & JSON Payload (7 COLS) */}
              <div className="md:col-span-7 space-y-4 font-mono text-xs">
                
                {/* Meta details */}
                <div className="p-4 bg-slate-950 rounded-xl border border-slate-800 grid grid-cols-2 gap-3">
                  <div>
                    <div className="text-[10px] text-slate-500 uppercase">Organization & Site</div>
                    <div className="text-white font-bold">{activeSession.organization}</div>
                    <div className="text-cyan-400 text-[11px]">{activeSession.site}</div>
                  </div>
                  <div>
                    <div className="text-[10px] text-slate-500 uppercase">Target Device Group</div>
                    <div className="text-white font-bold">{activeSession.deviceGroup}</div>
                    <div className="text-emerald-400 text-[11px]">{activeSession.connectionMode.toUpperCase()} Policy</div>
                  </div>
                  <div>
                    <div className="text-[10px] text-slate-500 uppercase">Target Architecture</div>
                    <div className="text-white font-bold uppercase">{activeSession.targetPlatform}</div>
                  </div>
                  <div>
                    <div className="text-[10px] text-slate-500 uppercase">Session Type</div>
                    <div className="text-slate-300">{activeSession.singleUse ? 'Single-Use Token' : 'Multi-Device Batch'}</div>
                  </div>
                </div>

                {/* JSON Payload Inspector */}
                <div className="p-4 bg-slate-950 rounded-xl border border-slate-800 space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-[10px] text-slate-400 uppercase font-bold flex items-center gap-1.5">
                      <FileJson className="w-3.5 h-3.5 text-cyan-400" />
                      <span>Provisioning Payload JSON Schema (v2.0)</span>
                    </span>
                    <button
                      onClick={handleCopyJson}
                      className="text-[10px] text-cyan-400 hover:text-cyan-300 underline"
                    >
                      {copiedJson ? 'Copied' : 'Copy JSON'}
                    </button>
                  </div>

                  <pre className="p-3 bg-slate-900/90 rounded-lg border border-slate-800 text-[11px] text-cyan-300 overflow-x-auto max-h-44">
                    {activeSession.qrPayloadJson}
                  </pre>
                </div>

              </div>

            </div>
          )}

          {/* TAB 2: SIMULATE DEVICE ONBOARDING SCANNER */}
          {activeTab === 'simulate_scan' && (
            <div className="space-y-6 font-mono text-xs">
              <div className="p-4 bg-slate-950 rounded-xl border border-slate-800 space-y-3">
                <div className="text-sm font-bold text-white">Simulate Device Hardware Scanning QR Code</div>
                <p className="text-slate-400 text-xs">
                  Test the complete zero-touch onboarding flow: from optical QR token capture, mutual TLS authentication, to automated fleet registration.
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                  <div>
                    <label className="text-[10px] text-slate-400 uppercase">Simulated Device Name</label>
                    <input
                      type="text"
                      value={simDeviceName}
                      onChange={(e) => setSimDeviceName(e.target.value)}
                      className="w-full mt-1 bg-slate-900 border border-slate-800 rounded-lg p-2 text-white"
                    />
                  </div>

                  <div>
                    <label className="text-[10px] text-slate-400 uppercase">Device Platform</label>
                    <select
                      value={simPlatform}
                      onChange={(e) => setSimPlatform(e.target.value as PlatformType)}
                      className="w-full mt-1 bg-slate-900 border border-slate-800 rounded-lg p-2 text-white"
                    >
                      <option value="android">Android Tablet / Phone</option>
                      <option value="wearos">Wear OS Smartwatch (Galaxy Watch 7)</option>
                      <option value="quest">Meta Quest 2 (VR Station)</option>
                      <option value="windows">Windows Medical PC</option>
                      <option value="ios">Apple iPad / iOS</option>
                      <option value="custom">Custom Platform SDK</option>
                    </select>
                  </div>
                </div>

                <button
                  onClick={handleRunSimulation}
                  disabled={isSimulating}
                  className="w-full mt-3 py-2.5 bg-gradient-to-r from-cyan-500 to-teal-500 text-slate-950 font-bold rounded-xl hover:from-cyan-400 hover:to-teal-400 flex items-center justify-center gap-2 shadow-md shadow-cyan-500/20 disabled:opacity-50"
                >
                  <Sparkles className="w-4 h-4 text-slate-950" />
                  <span>{isSimulating ? 'Simulating Onboarding...' : 'Start Onboarding Simulation'}</span>
                </button>
              </div>

              {/* Step by Step Visualizer */}
              {simStep > 0 && (
                <div className="p-4 bg-slate-950 rounded-xl border border-slate-800 space-y-3">
                  <div className="text-xs font-bold text-slate-300 uppercase">Onboarding Pipeline State</div>
                  
                  <div className="space-y-2">
                    {[
                      { step: 1, label: 'Camera optical sensor scans QR token', detail: `Payload decoded: ${activeSession?.token}` },
                      { step: 2, label: 'Mutual TLS Authentication with Gateway', detail: 'Validating single-use certificate token...' },
                      { step: 3, label: 'Policy & Kiosk Application Download', detail: 'Provisioning org.sallyhealth.rpm and OmniLock shell' },
                      { step: 4, label: 'Device Certificate Registration', detail: 'Binding SHA-256 fingerprint into Knox EMM' },
                      { step: 5, label: 'Device State: ACTIVE IN FLEET', detail: simResult || 'Hardware online and streaming heartbeats.' },
                    ].map((s) => {
                      const isDone = simStep > s.step;
                      const isCurrent = simStep === s.step;
                      return (
                        <div
                          key={s.step}
                          className={`p-3 rounded-lg border flex items-center justify-between ${
                            isDone
                              ? 'bg-emerald-950/30 border-emerald-800/50 text-emerald-300'
                              : isCurrent
                              ? 'bg-cyan-950/40 border-cyan-500/40 text-cyan-300 animate-pulse'
                              : 'bg-slate-900 text-slate-600 border-slate-800'
                          }`}
                        >
                          <div className="flex items-center gap-2.5">
                            {isDone ? (
                              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                            ) : (
                              <span className="w-4 h-4 rounded-full border border-current flex items-center justify-center text-[10px] shrink-0 font-bold">
                                {s.step}
                              </span>
                            )}
                            <div>
                              <div className="font-semibold text-white">{s.label}</div>
                              <div className="text-[10px] text-slate-400">{s.detail}</div>
                            </div>
                          </div>

                          {isDone && <span className="text-[10px] text-emerald-400 font-bold uppercase">ACK</span>}
                          {isCurrent && <span className="text-[10px] text-cyan-400 font-bold uppercase">Working...</span>}
                        </div>
                      );
                    })}
                  </div>

                  {simStep === 5 && (
                    <div className="p-3 bg-emerald-950/80 border border-emerald-500/40 rounded-lg text-emerald-300 text-center font-bold">
                      ✓ Hardware Successfully Enrolled! You can find "{simDeviceName}" in the Fleet Dashboard.
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          {/* TAB 3: CREATE NEW ENROLLMENT SESSION */}
          {activeTab === 'sessions' && (
            <div className="space-y-6 font-mono text-xs">
              <div className="p-5 bg-slate-950 rounded-xl border border-slate-800 space-y-4">
                <div className="text-sm font-bold text-white">Create New Enrollment Session</div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="text-[10px] text-slate-400 uppercase">Organization</label>
                    <input
                      type="text"
                      value={org}
                      onChange={(e) => setOrg(e.target.value)}
                      className="w-full mt-1 bg-slate-900 border border-slate-800 rounded-lg p-2 text-white"
                    />
                  </div>

                  <div>
                    <label className="text-[10px] text-slate-400 uppercase">Site / Facility</label>
                    <input
                      type="text"
                      value={site}
                      onChange={(e) => setSite(e.target.value)}
                      className="w-full mt-1 bg-slate-900 border border-slate-800 rounded-lg p-2 text-white"
                    />
                  </div>

                  <div>
                    <label className="text-[10px] text-slate-400 uppercase">Device Group</label>
                    <input
                      type="text"
                      value={group}
                      onChange={(e) => setGroup(e.target.value)}
                      className="w-full mt-1 bg-slate-900 border border-slate-800 rounded-lg p-2 text-white"
                    />
                  </div>

                  <div>
                    <label className="text-[10px] text-slate-400 uppercase">Platform</label>
                    <select
                      value={platform}
                      onChange={(e) => setPlatform(e.target.value as PlatformType)}
                      className="w-full mt-1 bg-slate-900 border border-slate-800 rounded-lg p-2 text-white"
                    >
                      <option value="android">Android</option>
                      <option value="wearos">Wear OS (Watch)</option>
                      <option value="ios">Apple iOS / iPadOS</option>
                      <option value="windows">Windows PC</option>
                      <option value="quest">Meta Quest 2</option>
                      <option value="custom">Custom Platform</option>
                    </select>
                  </div>

                  <div>
                    <label className="text-[10px] text-slate-400 uppercase">Connection / Lockdown Mode</label>
                    <select
                      value={connectionMode}
                      onChange={(e) => setConnectionMode(e.target.value as ConnectionMode)}
                      className="w-full mt-1 bg-slate-900 border border-slate-800 rounded-lg p-2 text-white"
                    >
                      <option value="kiosk">Kiosk Mode (Single-App Locked)</option>
                      <option value="mdm">MDM Mode (Managed Container)</option>
                      <option value="standard">Standard Mode</option>
                    </select>
                  </div>

                  <div>
                    <label className="text-[10px] text-slate-400 uppercase">Policy Profile</label>
                    <input
                      type="text"
                      value={policy}
                      onChange={(e) => setPolicy(e.target.value)}
                      className="w-full mt-1 bg-slate-900 border border-slate-800 rounded-lg p-2 text-white"
                    />
                  </div>
                </div>

                <div className="flex items-center gap-2 pt-2">
                  <input
                    type="checkbox"
                    id="single_use"
                    checked={isSingleUse}
                    onChange={(e) => setIsSingleUse(e.target.checked)}
                    className="rounded border-slate-700 text-cyan-500 bg-slate-900"
                  />
                  <label htmlFor="single_use" className="text-slate-300 text-xs">
                    Single-use token (Revoke immediately after first hardware enrollment)
                  </label>
                </div>

                <button
                  onClick={() => {
                    handleCreateNewSession();
                    setActiveTab('generate');
                  }}
                  className="w-full py-2.5 bg-gradient-to-r from-cyan-500 to-teal-500 text-slate-950 font-bold rounded-xl hover:from-cyan-400 hover:to-teal-400"
                >
                  Generate QR Enrollment Session
                </button>
              </div>

              {/* Active Sessions List */}
              <div className="space-y-2">
                <div className="text-xs font-bold text-slate-400 uppercase">Existing Active Sessions</div>
                {enrollmentSessions.map(sess => (
                  <div
                    key={sess.id}
                    onClick={() => {
                      setSelectedSessionId(sess.id);
                      setActiveTab('generate');
                    }}
                    className={`p-3 rounded-xl border flex items-center justify-between cursor-pointer transition-all ${
                      sess.id === selectedSessionId
                        ? 'bg-slate-900 border-cyan-500/50'
                        : 'bg-slate-950/80 border-slate-800 hover:bg-slate-900'
                    }`}
                  >
                    <div>
                      <div className="font-bold text-white">{sess.token}</div>
                      <div className="text-[10px] text-slate-400">{sess.site} • {sess.deviceGroup} ({sess.targetPlatform})</div>
                    </div>
                    <span className="text-[10px] text-cyan-400 font-bold">View QR ➔</span>
                  </div>
                ))}
              </div>
            </div>
          )}

        </div>

        {/* Modal Footer */}
        <div className="px-6 py-3 bg-slate-950 border-t border-slate-800 flex justify-between items-center text-xs font-mono text-slate-400">
          <span>Schema: https://schema.sallyhealth.org/device-enrollment/v2</span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 bg-slate-800 hover:bg-slate-700 text-white rounded-lg font-semibold transition-colors"
          >
            Done
          </button>
        </div>

      </div>
    </div>
  );
};
