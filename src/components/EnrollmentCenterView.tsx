import React, { useState } from 'react';
import { 
  QrCode, 
  Plus, 
  Copy, 
  Check, 
  Clock, 
  Smartphone, 
  Watch, 
  Laptop, 
  Layers, 
  RefreshCw, 
  CheckCircle2, 
  AlertTriangle, 
  FileSpreadsheet, 
  ShieldCheck, 
  ArrowRight,
  ExternalLink,
  Cpu
} from 'lucide-react';
import { useDevices } from '../context/DeviceContext';
import { PlatformType, ConnectionMode } from '../types/device';

export const EnrollmentCenterView: React.FC = () => {
  const { 
    enrollmentSessions, 
    createEnrollmentSession, 
    completeEnrollmentFromQR,
    currentOrganization,
    deviceGroups,
    policies
  } = useDevices();

  // Tab State
  const [activeSubTab, setActiveSubTab] = useState<'qr_generator' | 'qr_scanner_sim' | 'zero_touch' | 'bulk_import' | 'history'>('qr_generator');

  // Generator Form State
  const [targetPlatform, setTargetPlatform] = useState<PlatformType>('android');
  const [connectionMode, setConnectionMode] = useState<ConnectionMode>('kiosk');
  const [targetGroup, setTargetGroup] = useState<string>('Chicago SNF Group');
  const [assignedPolicy, setAssignedPolicy] = useState<string>('Strict Clinical Kiosk Policy (v2.4)');
  const [singleUse, setSingleUse] = useState<boolean>(true);
  const [createdSession, setCreatedSession] = useState<any | null>(null);
  const [copied, setCopied] = useState<boolean>(false);

  // QR Scanner Simulator State
  const [scanToken, setScanToken] = useState<string>('');
  const [simulatedDeviceName, setSimulatedDeviceName] = useState<string>('Bedside Tablet Galaxy Tab 4');
  const [simulatedSerial, setSimulatedSerial] = useState<string>('SM-X706B-SIM-' + Math.floor(1000 + Math.random() * 9000));
  const [simulatedPlatform, setSimulatedPlatform] = useState<PlatformType>('android');
  const [enrollResult, setEnrollResult] = useState<{ success: boolean; message: string } | null>(null);

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const session = await createEnrollmentSession({
        organization: currentOrganization.name,
        targetPlatform,
        connectionMode,
        deviceGroup: targetGroup,
        assignedPolicy,
        singleUse,
      });
      setCreatedSession(session);
      setScanToken(session.token);
    } catch (error) {
      setEnrollResult({
        success: false,
        message: error instanceof Error ? error.message : 'Failed to generate enrollment token'
      });
    }
  };

  const handleSimulatedEnroll = async () => {
    if (!scanToken) {
      setEnrollResult({ success: false, message: 'Please enter or select a valid enrollment token.' });
      return;
    }
    const res = await completeEnrollmentFromQR(scanToken, {
      name: simulatedDeviceName,
      serialNumber: simulatedSerial,
      platform: simulatedPlatform,
    });
    setEnrollResult(res);
    if (res.success) {
      setSimulatedSerial('SM-X706B-SIM-' + Math.floor(1000 + Math.random() * 9000));
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-6">
      
      {/* Header Banner */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 relative overflow-hidden">
        <div className="absolute right-0 top-0 translate-x-8 -translate-y-8 w-64 h-64 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 relative z-10">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="px-2 py-0.5 rounded-full text-xs font-semibold bg-cyan-500/20 text-cyan-400 border border-cyan-500/30">
                Universal Provisioning Engine
              </span>
              <span className="text-xs text-slate-400 font-mono">Enterprise MDM / EMM</span>
            </div>
            <h1 className="text-2xl font-bold text-white tracking-tight">
              Enrollment & Zero-Touch Onboarding Center
            </h1>
            <p className="text-sm text-slate-400 mt-1 max-w-2xl">
              Generate dynamic encrypted QR enrollment payloads, configure Zero-Touch / Knox / Apple ABM / Windows Autopilot profiles, or perform bulk fleet migrations.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                setActiveSubTab('qr_generator');
                setCreatedSession(null);
              }}
              className="px-4 py-2 bg-gradient-to-r from-cyan-600 to-teal-600 hover:from-cyan-500 hover:to-teal-500 text-white text-sm font-semibold rounded-lg shadow-lg shadow-cyan-600/20 flex items-center gap-2 transition-all cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              New QR Enrollment Token
            </button>
          </div>
        </div>

        {/* Sub Navigation Tabs */}
        <div className="flex items-center gap-2 mt-6 pt-4 border-t border-slate-800/80 overflow-x-auto">
          {[
            { id: 'qr_generator', label: 'QR Payload Generator', icon: QrCode },
            { id: 'qr_scanner_sim', label: 'Live Device Scanner Sim', icon: Smartphone },
            { id: 'zero_touch', label: 'Zero-Touch & ABM / KME', icon: ShieldCheck },
            { id: 'bulk_import', label: 'Bulk CSV / Invitation', icon: FileSpreadsheet },
            { id: 'history', label: 'Active Tokens & History', icon: Clock, count: enrollmentSessions.length },
          ].map(tab => {
            const Icon = tab.icon;
            const isActive = activeSubTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveSubTab(tab.id as any)}
                className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-medium transition-all whitespace-nowrap cursor-pointer ${
                  isActive
                    ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 shadow-sm'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{tab.label}</span>
                {tab.count !== undefined && (
                  <span className="px-1.5 py-0.2 bg-slate-800 text-slate-300 rounded-full text-[10px]">
                    {tab.count}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Tab 1: QR Generator */}
      {activeSubTab === 'qr_generator' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="lg:col-span-7 bg-slate-900 border border-slate-800 rounded-xl p-6 space-y-5">
            <div>
              <h2 className="text-base font-semibold text-white">Generate Dynamic QR Enrollment Token</h2>
              <p className="text-xs text-slate-400">Configure target management profile and device binding before provisioning.</p>
            </div>

            <form onSubmit={handleGenerate} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1.5">Target Platform</label>
                  <select
                    value={targetPlatform}
                    onChange={(e) => setTargetPlatform(e.target.value as PlatformType)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-cyan-500"
                  >
                    <option value="android">Android (Knox / Android Enterprise)</option>
                    <option value="wearos">Wear OS (Galaxy Watch 7 / Wearables)</option>
                    <option value="ipados">iPadOS / iOS (Apple Supervised)</option>
                    <option value="windows">Windows 11 / 10 Enterprise</option>
                    <option value="quest">Meta Quest 2 / VR Enterprise</option>
                    <option value="macos">macOS (Apple Silicon / Intel)</option>
                    <option value="iot">Headless IoT Gateway Hub</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1.5">Management Connection Mode</label>
                  <select
                    value={connectionMode}
                    onChange={(e) => setConnectionMode(e.target.value as ConnectionMode)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-cyan-500"
                  >
                    <option value="kiosk">Dedicated Single/Multi-App Kiosk Mode</option>
                    <option value="mdm">Full Device MDM Supervised</option>
                    <option value="supervised_apple">Apple Supervised Profile</option>
                    <option value="standard">Standard Enterprise Workstation</option>
                    <option value="byod">BYOD Work Profile (Containerized)</option>
                    <option value="standalone_gateway">Standalone Edge Gateway</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1.5">Assign Device Group</label>
                  <select
                    value={targetGroup}
                    onChange={(e) => setTargetGroup(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-cyan-500"
                  >
                    {deviceGroups.map(g => (
                      <option key={g.id} value={g.name}>{g.name}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1.5">Pre-bind Enterprise Policy</label>
                  <select
                    value={assignedPolicy}
                    onChange={(e) => setAssignedPolicy(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-cyan-500"
                  >
                    {policies.map(p => (
                      <option key={p.id} value={`${p.name} (${p.currentVersion})`}>
                        {p.name} ({p.currentVersion})
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="pt-2 flex items-center gap-3">
                <label className="flex items-center gap-2 text-xs text-slate-300 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={singleUse}
                    onChange={(e) => setSingleUse(e.target.checked)}
                    className="rounded bg-slate-950 border-slate-800 text-cyan-500 focus:ring-cyan-500"
                  />
                  <span>Single-Use Token (Invalidates immediately upon first device enrollment)</span>
                </label>
              </div>

              <button
                type="submit"
                className="w-full py-2.5 bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-semibold rounded-lg shadow-md shadow-cyan-600/20 transition-all flex items-center justify-center gap-2 cursor-pointer mt-2"
              >
                <QrCode className="w-4 h-4" />
                Generate Provisioning Payload & QR
              </button>
            </form>
          </div>

          {/* QR Preview & Output Box */}
          <div className="lg:col-span-5 bg-slate-900 border border-slate-800 rounded-xl p-6 flex flex-col justify-between">
            {createdSession ? (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-white uppercase tracking-wider">Ready for Scanning</span>
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
                    Live Token
                  </span>
                </div>

                <div className="bg-slate-950 border border-slate-800 rounded-xl p-6 flex flex-col items-center justify-center text-center">
                  {/* Generated Stylized QR Payload SVG */}
                  <div className="w-48 h-48 bg-white p-3 rounded-lg shadow-xl flex items-center justify-center relative group">
                    <svg viewBox="0 0 100 100" className="w-full h-full text-slate-950 fill-current">
                      <path d="M0,0 h30 v30 h-30 z M10,10 h10 v10 h-10 z" />
                      <path d="M70,0 h30 v30 h-30 z M80,10 h10 v10 h-10 z" />
                      <path d="M0,70 h30 v30 h-30 z M10,80 h10 v10 h-10 z" />
                      <path d="M40,10 h10 v10 h-10 z M50,20 h10 v10 h-10 z M10,40 h10 v10 h-10 z M25,45 h15 v15 h-15 z M50,45 h20 v10 h-20 z M80,40 h10 v20 h-10 z M40,75 h15 v15 h-15 z M70,70 h20 v20 h-20 z" />
                    </svg>
                    <div className="absolute inset-0 bg-cyan-600/90 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center text-white p-2">
                      <span className="text-xs font-bold">Encrypted JSON</span>
                      <span className="text-[10px] text-cyan-100 mt-1">Tap 6 times on Android Setup screen to trigger scanner</span>
                    </div>
                  </div>

                  <p className="text-xs font-mono text-cyan-400 mt-4 font-bold tracking-wider">
                    {createdSession.token}
                  </p>
                  <p className="text-[11px] text-slate-400 mt-1">
                    Valid for 24 hours • Bound to {createdSession.organization}
                  </p>
                </div>

                <div className="bg-slate-950/80 border border-slate-800 rounded-lg p-3 text-[11px] font-mono text-slate-400 space-y-1">
                  <div className="flex justify-between">
                    <span className="text-slate-300 font-sans">Token String:</span>
                    <button
                      onClick={() => copyToClipboard(createdSession.token)}
                      className="text-cyan-400 hover:text-cyan-300 flex items-center gap-1 cursor-pointer"
                    >
                      {copied ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                      <span>{copied ? 'Copied' : 'Copy'}</span>
                    </button>
                  </div>
                  <div className="text-slate-500 truncate">{createdSession.token}</div>
                </div>

                <button
                  onClick={() => {
                    setActiveSubTab('qr_scanner_sim');
                    setScanToken(createdSession.token);
                  }}
                  className="w-full py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold rounded-lg transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <span>Test with Live Scanner Simulator</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            ) : (
              <div className="h-full flex flex-col items-center justify-center text-center p-8 text-slate-500">
                <QrCode className="w-16 h-16 text-slate-700 mb-3 stroke-[1.5]" />
                <p className="text-sm font-semibold text-slate-300">No Active Payload Generated</p>
                <p className="text-xs text-slate-400 mt-1 max-w-xs">
                  Fill out the provisioning parameters on the left to create an authenticated enrollment barcode.
                </p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Tab 2: Live QR Scanner Simulator */}
      {activeSubTab === 'qr_scanner_sim' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="lg:col-span-6 bg-slate-900 border border-slate-800 rounded-xl p-6 space-y-4">
            <div>
              <h2 className="text-base font-semibold text-white">Device-Side Scanner Simulation</h2>
              <p className="text-xs text-slate-400">
                Simulate an unmanaged out-of-box device scanning the QR token to trigger zero-touch DPC enrollment.
              </p>
            </div>

            <div className="space-y-3">
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">Enrollment Token / Payload</label>
                <input
                  type="text"
                  value={scanToken}
                  onChange={(e) => setScanToken(e.target.value)}
                  placeholder="e.g. tok-ABCD1234..."
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs font-mono text-cyan-400 focus:outline-none focus:border-cyan-500"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">Simulated Device Name</label>
                <input
                  type="text"
                  value={simulatedDeviceName}
                  onChange={(e) => setSimulatedDeviceName(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-cyan-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">Hardware Serial</label>
                  <input
                    type="text"
                    value={simulatedSerial}
                    onChange={(e) => setSimulatedSerial(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs font-mono text-slate-300 focus:outline-none focus:border-cyan-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">Device Platform</label>
                  <select
                    value={simulatedPlatform}
                    onChange={(e) => setSimulatedPlatform(e.target.value as PlatformType)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-cyan-500"
                  >
                    <option value="android">Android Enterprise</option>
                    <option value="wearos">Wear OS Watch</option>
                    <option value="ipados">iPadOS / iOS</option>
                    <option value="windows">Windows PC</option>
                    <option value="quest">Meta Quest 2</option>
                  </select>
                </div>
              </div>

              <button
                onClick={handleSimulatedEnroll}
                className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold rounded-lg shadow-md shadow-emerald-600/20 transition-all flex items-center justify-center gap-2 cursor-pointer mt-3"
              >
                <CheckCircle2 className="w-4 h-4" />
                Simulate Device QR Scan & Self-Enroll
              </button>

              {enrollResult && (
                <div className={`p-3.5 rounded-lg border text-xs flex items-start gap-2.5 ${
                  enrollResult.success 
                    ? 'bg-emerald-950/40 border-emerald-800/80 text-emerald-300' 
                    : 'bg-rose-950/40 border-rose-800/80 text-rose-300'
                }`}>
                  {enrollResult.success ? (
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                  ) : (
                    <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
                  )}
                  <div>
                    <p className="font-semibold">{enrollResult.success ? 'Enrollment Succeeded' : 'Enrollment Failed'}</p>
                    <p className="text-[11px] opacity-90 mt-0.5">{enrollResult.message}</p>
                  </div>
                </div>
              )}
            </div>
          </div>

          <div className="lg:col-span-6 bg-slate-900 border border-slate-800 rounded-xl p-6 flex flex-col justify-between">
            <h3 className="text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
              Onboarding Architecture Flow
            </h3>
            <div className="space-y-3 text-xs text-slate-300">
              <div className="flex items-start gap-3 p-3 bg-slate-950 rounded-lg border border-slate-800">
                <span className="w-5 h-5 rounded-full bg-cyan-500/20 text-cyan-400 flex items-center justify-center text-[10px] font-bold shrink-0">1</span>
                <div>
                  <p className="font-semibold text-white">Out-of-Box Welcome Screen</p>
                  <p className="text-[11px] text-slate-400">User powers on device and taps the welcome screen 6 times to trigger optical QR reader.</p>
                </div>
              </div>

              <div className="flex items-start gap-3 p-3 bg-slate-950 rounded-lg border border-slate-800">
                <span className="w-5 h-5 rounded-full bg-cyan-500/20 text-cyan-400 flex items-center justify-center text-[10px] font-bold shrink-0">2</span>
                <div>
                  <p className="font-semibold text-white">TLS 1.3 Handshake & DPC Download</p>
                  <p className="text-[11px] text-slate-400">Device authenticates token against MDM server, downloads signed management client agent.</p>
                </div>
              </div>

              <div className="flex items-start gap-3 p-3 bg-slate-950 rounded-lg border border-slate-800">
                <span className="w-5 h-5 rounded-full bg-cyan-500/20 text-cyan-400 flex items-center justify-center text-[10px] font-bold shrink-0">3</span>
                <div>
                  <p className="font-semibold text-white">Policy Enforcement & App Rollout</p>
                  <p className="text-[11px] text-slate-400">Kiosk lockdown profile applied, hospital WiFi credentials installed, and RPM telemetry starts.</p>
                </div>
              </div>
            </div>

            <div className="mt-4 p-3 bg-cyan-950/30 border border-cyan-800/40 rounded-lg text-[11px] text-cyan-300 flex items-center justify-between">
              <span>Looking for Android Zero-Touch or Samsung Knox KME?</span>
              <button
                onClick={() => setActiveSubTab('zero_touch')}
                className="font-semibold hover:underline flex items-center gap-1 cursor-pointer"
              >
                <span>View Profiles</span>
                <ArrowRight className="w-3 h-3" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Tab 3: Zero-Touch, Samsung KME, Apple ABM, Windows Autopilot */}
      {activeSubTab === 'zero_touch' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {[
            {
              title: 'Samsung Knox Mobile Enrollment (KME)',
              vendor: 'Samsung Knox Cloud',
              status: 'Configured & Active',
              badgeColor: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30',
              description: 'Seamless out-of-box enrollment for Galaxy Tab Active4 Pro & Galaxy Watch 7 devices directly upon first power-on.',
              profileId: 'KME-PROF-SALLY-04',
              dpcUri: 'https://mdm.sallyhealth.org/dpc/samsung-knox.apk',
              assignedDevices: 84,
            },
            {
              title: 'Android Zero-Touch Provisioning',
              vendor: 'Google Android Enterprise',
              status: 'Configured & Active',
              badgeColor: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30',
              description: 'Carrier and OEM pre-registered device assignment for bulk corporate Android fleets without manual scanning.',
              profileId: 'ZT-GOOGLE-ENT-881',
              dpcUri: 'https://mdm.sallyhealth.org/dpc/android-enterprise.apk',
              assignedDevices: 42,
            },
            {
              title: 'Apple Automated Device Enrollment (ABM / ADE)',
              vendor: 'Apple Business Manager',
              status: 'Active (APNs Valid)',
              badgeColor: 'bg-cyan-500/20 text-cyan-300 border-cyan-500/30',
              description: 'Over-the-air supervision, MDM payload enrollment, and Setup Assistant customization for iPads, iPhones, and MacBooks.',
              profileId: 'ABM-DEP-SALLY-901',
              dpcUri: 'mdm.sallyhealth.org/apple/enroll',
              assignedDevices: 18,
            },
            {
              title: 'Windows Autopilot / Hardware Hash Binding',
              vendor: 'Microsoft Intune / CSP',
              status: 'Configured & Active',
              badgeColor: 'bg-indigo-500/20 text-indigo-300 border-indigo-500/30',
              description: 'Zero-touch provisioning and BitLocker enforcement for nursing workstations and HP EliteDesk carts.',
              profileId: 'AP-WIN11-MED-01',
              dpcUri: 'mdm.sallyhealth.org/windows/oma-dm',
              assignedDevices: 32,
            },
          ].map((prof, idx) => (
            <div key={idx} className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-3">
              <div className="flex items-start justify-between">
                <div>
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">{prof.vendor}</span>
                  <h3 className="text-sm font-bold text-white mt-0.5">{prof.title}</h3>
                </div>
                <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${prof.badgeColor}`}>
                  {prof.status}
                </span>
              </div>
              <p className="text-xs text-slate-400">{prof.description}</p>
              <div className="bg-slate-950 p-3 rounded-lg border border-slate-850 text-[11px] font-mono space-y-1 text-slate-400">
                <div className="flex justify-between">
                  <span className="text-slate-300 font-sans">Profile ID:</span>
                  <span className="text-cyan-400">{prof.profileId}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-300 font-sans">DPC Payload:</span>
                  <span className="text-slate-500 truncate max-w-[200px]">{prof.dpcUri}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-300 font-sans">Active Endpoints:</span>
                  <span className="text-white font-bold">{prof.assignedDevices} Devices</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Tab 4: Bulk Import */}
      {activeSubTab === 'bulk_import' && (
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 space-y-4">
          <div>
            <h2 className="text-base font-semibold text-white">Bulk Fleet CSV Migration & Invitation</h2>
            <p className="text-xs text-slate-400">Import hardware serial numbers, IMEI tags, and pre-assigned patient IDs via CSV format.</p>
          </div>

          <div className="border-2 border-dashed border-slate-800 hover:border-cyan-500/50 rounded-xl p-8 text-center transition-all bg-slate-950/40">
            <FileSpreadsheet className="w-12 h-12 text-slate-600 mx-auto mb-2" />
            <p className="text-xs font-semibold text-slate-300">Drag and drop fleet manifest CSV</p>
            <p className="text-[11px] text-slate-500 mt-1">Columns: SerialNumber, Model, Platform, Site, DeviceGroup, PatientMRN</p>
            <button className="mt-4 px-4 py-2 bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-slate-200 rounded-lg transition-all cursor-pointer">
              Select CSV File
            </button>
          </div>
        </div>
      )}

      {/* Tab 5: Active Tokens & History */}
      {activeSubTab === 'history' && (
        <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden">
          <div className="p-4 border-b border-slate-800 flex items-center justify-between">
            <h2 className="text-sm font-semibold text-white">Enrollment Session Registry</h2>
            <span className="text-xs text-slate-400">{enrollmentSessions.length} Total Sessions</span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-950 text-slate-400 border-b border-slate-800 uppercase tracking-wider font-semibold text-[10px]">
                <tr>
                  <th className="px-4 py-3">Token String</th>
                  <th className="px-4 py-3">Target Platform</th>
                  <th className="px-4 py-3">Mode</th>
                  <th className="px-4 py-3">Group / Site</th>
                  <th className="px-4 py-3">Policy Bound</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 font-medium">
                {enrollmentSessions.map(session => (
                  <tr key={session.id} className="hover:bg-slate-850/40 transition-colors">
                    <td className="px-4 py-3 font-mono text-cyan-400">{session.token}</td>
                    <td className="px-4 py-3 capitalize text-slate-300">{session.targetPlatform}</td>
                    <td className="px-4 py-3 text-slate-400 uppercase text-[11px]">{session.connectionMode}</td>
                    <td className="px-4 py-3 text-slate-300">{session.deviceGroup}</td>
                    <td className="px-4 py-3 text-slate-400 truncate max-w-[160px]">{session.assignedPolicy}</td>
                    <td className="px-4 py-3">
                      {session.used ? (
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-800 text-slate-400">
                          Consumed ({session.usedByDeviceId})
                        </span>
                      ) : (
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                          Active / Ready
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <button
                        onClick={() => {
                          setCreatedSession(session);
                          setActiveSubTab('qr_generator');
                        }}
                        className="text-cyan-400 hover:text-cyan-300 text-xs font-semibold cursor-pointer"
                      >
                        View QR
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

    </div>
  );
};
