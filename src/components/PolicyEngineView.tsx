import React, { useState } from 'react';
import { 
  ShieldCheck, 
  Plus, 
  History, 
  RotateCcw, 
  Check, 
  AlertTriangle, 
  Lock, 
  Wifi, 
  Cpu, 
  Layers, 
  Globe, 
  Maximize, 
  CheckCircle2, 
  ArrowRight,
  Sparkles,
  Smartphone,
  Eye
} from 'lucide-react';
import { useDevices } from '../context/DeviceContext';
import { EnterprisePolicyRecord, PolicyVersionRecord } from '../types/enterprise';
import { PlatformType } from '../types/device';

export const PolicyEngineView: React.FC = () => {
  const { 
    policies, 
    createPolicy, 
    publishPolicyVersion, 
    rollbackPolicyVersion, 
    assignPolicyToGroup,
    deviceGroups,
    devices,
    currentUser
  } = useDevices();

  const [selectedPolicyId, setSelectedPolicyId] = useState<string>(policies[0]?.id || '');
  const [activeCategory, setActiveCategory] = useState<'security' | 'network' | 'hardware' | 'application' | 'browser' | 'kiosk'>('security');
  const [showNewPolicyModal, setShowNewPolicyModal] = useState<boolean>(false);
  const [showVersionHistoryModal, setShowVersionHistoryModal] = useState<boolean>(false);
  const [showAssignModal, setShowAssignModal] = useState<boolean>(false);

  // New Policy Form State
  const [newPolicyName, setNewPolicyName] = useState<string>('');
  const [newPolicyDesc, setNewPolicyDesc] = useState<string>('');
  const [newPolicyPlatforms, setNewPolicyPlatforms] = useState<PlatformType[]>(['android']);

  // Edit / Draft State for current policy
  const currentPolicy = policies.find(p => p.id === selectedPolicyId) || policies[0];
  const [draftConfig, setDraftConfig] = useState<PolicyVersionRecord>(currentPolicy?.activeConfig || {} as PolicyVersionRecord);
  const [changeSummary, setChangeSummary] = useState<string>('');
  const [saveSuccess, setSaveSuccess] = useState<boolean>(false);

  // Update draft whenever selected policy changes
  React.useEffect(() => {
    if (currentPolicy) {
      setDraftConfig(currentPolicy.activeConfig);
      setChangeSummary('');
    }
  }, [currentPolicy?.id]);

  const handlePublishNewVersion = (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentPolicy) return;
    const nextVerNum = (parseFloat(currentPolicy.currentVersion.replace('v', '')) + 0.1).toFixed(1);
    const newVerString = `v${nextVerNum}`;

    const newVersionRecord: PolicyVersionRecord = {
      ...draftConfig,
      version: newVerString,
      publishedAt: new Date().toISOString(),
      publishedBy: currentUser.name,
      changeSummary: changeSummary || `Updated ${activeCategory} configuration rules.`,
    };

    publishPolicyVersion(currentPolicy.id, newVersionRecord);
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 2500);
  };

  const handleCreatePolicy = (e: React.FormEvent) => {
    e.preventDefault();
    createPolicy({
      name: newPolicyName,
      description: newPolicyDesc,
      targetPlatforms: newPolicyPlatforms,
    });
    setShowNewPolicyModal(false);
    setNewPolicyName('');
    setNewPolicyDesc('');
  };

  const handleRollback = (targetVer: string) => {
    if (!currentPolicy) return;
    rollbackPolicyVersion(currentPolicy.id, targetVer);
    setShowVersionHistoryModal(false);
  };

  return (
    <div className="space-y-6">
      
      {/* Header Banner */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 relative overflow-hidden">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="px-2 py-0.5 rounded-full text-xs font-semibold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                Granular Governance Engine
              </span>
              <span className="text-xs text-slate-400 font-mono">MDM / Kiosk / Knox Profiles</span>
            </div>
            <h1 className="text-2xl font-bold text-white tracking-tight">
              Profiles & Enterprise Policy Engine
            </h1>
            <p className="text-sm text-slate-400 mt-1 max-w-2xl">
              Configure cross-platform hardware restrictions, network tunnels, passcodes, kiosk lockouts, and browser policies with version control & instant rollback.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => setShowNewPolicyModal(true)}
              className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white text-sm font-semibold rounded-lg shadow-lg shadow-emerald-600/20 flex items-center gap-2 transition-all cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              New Policy Profile
            </button>
          </div>
        </div>

        {/* Policy Selector Pills */}
        <div className="flex items-center gap-2 mt-6 pt-4 border-t border-slate-800/80 overflow-x-auto">
          {policies.map(p => {
            const isSelected = p.id === selectedPolicyId;
            return (
              <button
                key={p.id}
                onClick={() => setSelectedPolicyId(p.id)}
                className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-medium transition-all whitespace-nowrap cursor-pointer ${
                  isSelected
                    ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 shadow-sm'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
                }`}
              >
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>{p.name}</span>
                <span className="px-1.5 py-0.2 bg-slate-800 text-slate-300 rounded text-[10px] font-mono">
                  {p.currentVersion}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {currentPolicy && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          
          {/* Policy Meta & Categories Sidebar */}
          <div className="lg:col-span-3 space-y-4">
            <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 space-y-3">
              <div>
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Active Profile</span>
                <h3 className="text-sm font-bold text-white mt-0.5">{currentPolicy.name}</h3>
                <p className="text-xs text-slate-400 mt-1">{currentPolicy.description}</p>
              </div>

              <div className="pt-2 border-t border-slate-800 text-[11px] font-mono space-y-1.5 text-slate-400">
                <div className="flex justify-between">
                  <span className="text-slate-400 font-sans">Active Version:</span>
                  <span className="text-emerald-400 font-bold">{currentPolicy.currentVersion}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400 font-sans">Platforms:</span>
                  <span className="text-slate-300 uppercase">{currentPolicy.targetPlatforms.join(', ')}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400 font-sans">Published By:</span>
                  <span className="text-slate-300">{currentPolicy.activeConfig.publishedBy}</span>
                </div>
              </div>

              <div className="pt-2 flex flex-col gap-2">
                <button
                  onClick={() => setShowVersionHistoryModal(true)}
                  className="w-full py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-medium rounded-lg flex items-center justify-center gap-1.5 transition-all cursor-pointer"
                >
                  <History className="w-3.5 h-3.5" />
                  <span>Version History ({currentPolicy.versionHistory.length + 1})</span>
                </button>
                <button
                  onClick={() => setShowAssignModal(true)}
                  className="w-full py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-medium rounded-lg flex items-center justify-center gap-1.5 transition-all cursor-pointer"
                >
                  <Smartphone className="w-3.5 h-3.5" />
                  <span>Assign to Groups / Devices</span>
                </button>
              </div>
            </div>

            {/* Policy Category Nav */}
            <div className="bg-slate-900 border border-slate-800 rounded-xl p-2 space-y-1">
              {[
                { id: 'security', label: 'Security & Passcode', icon: Lock },
                { id: 'network', label: 'Network & VPN Tunnels', icon: Wifi },
                { id: 'hardware', label: 'Hardware Restrictions', icon: Cpu },
                { id: 'application', label: 'App Allowlist / Permissions', icon: Layers },
                { id: 'browser', label: 'Browser & Web Content', icon: Globe },
                { id: 'kiosk', label: 'Dedicated Kiosk Lockdown', icon: Maximize },
              ].map(cat => {
                const Icon = cat.icon;
                const isActive = activeCategory === cat.id;
                return (
                  <button
                    key={cat.id}
                    onClick={() => setActiveCategory(cat.id as any)}
                    className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-medium text-left transition-all cursor-pointer ${
                      isActive
                        ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                        : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/40'
                    }`}
                  >
                    <Icon className="w-4 h-4 shrink-0" />
                    <span>{cat.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Configuration Form Center */}
          <div className="lg:col-span-9 bg-slate-900 border border-slate-800 rounded-xl p-6 flex flex-col justify-between">
            <form onSubmit={handlePublishNewVersion} className="space-y-6">
              
              {/* Category: Security */}
              {activeCategory === 'security' && (
                <div className="space-y-4">
                  <div className="border-b border-slate-800 pb-3">
                    <h3 className="text-sm font-bold text-white flex items-center gap-2">
                      <Lock className="w-4 h-4 text-emerald-400" />
                      Security, Passcode & Encryption Policies
                    </h3>
                    <p className="text-xs text-slate-400">Enforce device lockouts, BitLocker / FBE encryption, and brute force wipes.</p>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <label className="flex items-center justify-between p-3 bg-slate-950 rounded-lg border border-slate-800 text-xs text-slate-300">
                      <span>Require Lock Screen Passcode</span>
                      <input
                        type="checkbox"
                        checked={draftConfig.security?.passcodeRequired ?? true}
                        onChange={(e) => setDraftConfig({
                          ...draftConfig,
                          security: { ...draftConfig.security, passcodeRequired: e.target.checked }
                        })}
                        className="rounded bg-slate-900 border-slate-700 text-emerald-500"
                      />
                    </label>

                    <label className="flex items-center justify-between p-3 bg-slate-950 rounded-lg border border-slate-800 text-xs text-slate-300">
                      <span>Enforce Hardware Storage Encryption</span>
                      <input
                        type="checkbox"
                        checked={draftConfig.security?.storageEncryptionRequired ?? true}
                        onChange={(e) => setDraftConfig({
                          ...draftConfig,
                          security: { ...draftConfig.security, storageEncryptionRequired: e.target.checked }
                        })}
                        className="rounded bg-slate-900 border-slate-700 text-emerald-500"
                      />
                    </label>

                    <div>
                      <label className="block text-xs font-medium text-slate-300 mb-1">Minimum Passcode Length</label>
                      <input
                        type="number"
                        min="4"
                        max="16"
                        value={draftConfig.security?.minPasscodeLength ?? 6}
                        onChange={(e) => setDraftConfig({
                          ...draftConfig,
                          security: { ...draftConfig.security, minPasscodeLength: parseInt(e.target.value) || 6 }
                        })}
                        className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-slate-200"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-medium text-slate-300 mb-1">Passcode Complexity</label>
                      <select
                        value={draftConfig.security?.passcodeComplexity ?? 'numeric'}
                        onChange={(e) => setDraftConfig({
                          ...draftConfig,
                          security: { ...draftConfig.security, passcodeComplexity: e.target.value as any }
                        })}
                        className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-slate-200"
                      >
                        <option value="numeric">Numeric PIN (Hospital Bedside)</option>
                        <option value="alphanumeric">Alphanumeric (Standard)</option>
                        <option value="complex">Complex (High Security with Symbols)</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-medium text-slate-300 mb-1">Screen Timeout (Seconds)</label>
                      <input
                        type="number"
                        value={draftConfig.security?.screenTimeoutSeconds ?? 300}
                        onChange={(e) => setDraftConfig({
                          ...draftConfig,
                          security: { ...draftConfig.security, screenTimeoutSeconds: parseInt(e.target.value) || 300 }
                        })}
                        className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-slate-200"
                      />
                    </div>

                    <label className="flex items-center justify-between p-3 bg-slate-950 rounded-lg border border-slate-800 text-xs text-slate-300">
                      <span>Remote Wipe on 10 Failed Attempts</span>
                      <input
                        type="checkbox"
                        checked={draftConfig.security?.remoteWipeOnBruteForce ?? false}
                        onChange={(e) => setDraftConfig({
                          ...draftConfig,
                          security: { ...draftConfig.security, remoteWipeOnBruteForce: e.target.checked }
                        })}
                        className="rounded bg-slate-900 border-slate-700 text-rose-500"
                      />
                    </label>
                  </div>
                </div>
              )}

              {/* Category: Network */}
              {activeCategory === 'network' && (
                <div className="space-y-4">
                  <div className="border-b border-slate-800 pb-3">
                    <h3 className="text-sm font-bold text-white flex items-center gap-2">
                      <Wifi className="w-4 h-4 text-cyan-400" />
                      Enterprise Network & Connectivity Configuration
                    </h3>
                    <p className="text-xs text-slate-400">Configure medical hospital WiFi profiles, VPN tunnels, and certificate pinning.</p>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-medium text-slate-300 mb-1">Pre-configured WiFi SSID</label>
                      <input
                        type="text"
                        value={draftConfig.network?.wifiSsid ?? 'SH-Medical-Secure-5G'}
                        onChange={(e) => setDraftConfig({
                          ...draftConfig,
                          network: { ...draftConfig.network, wifiSsid: e.target.value }
                        })}
                        className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-slate-200"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-medium text-slate-300 mb-1">WiFi Security Type</label>
                      <select
                        value={draftConfig.network?.wifiSecurity ?? 'WPA2-Enterprise'}
                        onChange={(e) => setDraftConfig({
                          ...draftConfig,
                          network: { ...draftConfig.network, wifiSecurity: e.target.value }
                        })}
                        className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-slate-200"
                      >
                        <option value="WPA2-Enterprise">WPA2-Enterprise (802.1X EAP-TLS)</option>
                        <option value="WPA3-Enterprise">WPA3-Enterprise 192-bit</option>
                        <option value="WPA2-PSK">WPA2-PSK (Pre-shared Key)</option>
                      </select>
                    </div>

                    <label className="flex items-center justify-between p-3 bg-slate-950 rounded-lg border border-slate-800 text-xs text-slate-300">
                      <span>Enforce Certificate Pinning</span>
                      <input
                        type="checkbox"
                        checked={draftConfig.network?.enforceCertificatePinning ?? true}
                        onChange={(e) => setDraftConfig({
                          ...draftConfig,
                          network: { ...draftConfig.network, enforceCertificatePinning: e.target.checked }
                        })}
                        className="rounded bg-slate-900 border-slate-700 text-emerald-500"
                      />
                    </label>

                    <label className="flex items-center justify-between p-3 bg-slate-950 rounded-lg border border-slate-800 text-xs text-slate-300">
                      <span>Allow LTE / 5G Cellular Data</span>
                      <input
                        type="checkbox"
                        checked={draftConfig.network?.allowCellularData ?? true}
                        onChange={(e) => setDraftConfig({
                          ...draftConfig,
                          network: { ...draftConfig.network, allowCellularData: e.target.checked }
                        })}
                        className="rounded bg-slate-900 border-slate-700 text-emerald-500"
                      />
                    </label>
                  </div>
                </div>
              )}

              {/* Category: Hardware */}
              {activeCategory === 'hardware' && (
                <div className="space-y-4">
                  <div className="border-b border-slate-800 pb-3">
                    <h3 className="text-sm font-bold text-white flex items-center gap-2">
                      <Cpu className="w-4 h-4 text-amber-400" />
                      Hardware Peripherals & Physical Lockouts
                    </h3>
                    <p className="text-xs text-slate-400">Control camera, Bluetooth GATT, USB data transfer, and power button locks.</p>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <label className="flex items-center justify-between p-3 bg-slate-950 rounded-lg border border-slate-800 text-xs text-slate-300">
                      <span>Camera Access Enabled (Telehealth)</span>
                      <input
                        type="checkbox"
                        checked={draftConfig.hardware?.cameraEnabled ?? true}
                        onChange={(e) => setDraftConfig({
                          ...draftConfig,
                          hardware: { ...draftConfig.hardware, cameraEnabled: e.target.checked }
                        })}
                        className="rounded bg-slate-900 border-slate-700 text-emerald-500"
                      />
                    </label>

                    <label className="flex items-center justify-between p-3 bg-slate-950 rounded-lg border border-slate-800 text-xs text-slate-300">
                      <span>Bluetooth Enabled (RPM GATT Hub)</span>
                      <input
                        type="checkbox"
                        checked={draftConfig.hardware?.bluetoothEnabled ?? true}
                        onChange={(e) => setDraftConfig({
                          ...draftConfig,
                          hardware: { ...draftConfig.hardware, bluetoothEnabled: e.target.checked }
                        })}
                        className="rounded bg-slate-900 border-slate-700 text-emerald-500"
                      />
                    </label>

                    <label className="flex items-center justify-between p-3 bg-slate-950 rounded-lg border border-slate-800 text-xs text-slate-300">
                      <span>USB Data Transfer Allowed</span>
                      <input
                        type="checkbox"
                        checked={draftConfig.hardware?.usbDataEnabled ?? false}
                        onChange={(e) => setDraftConfig({
                          ...draftConfig,
                          hardware: { ...draftConfig.hardware, usbDataEnabled: e.target.checked }
                        })}
                        className="rounded bg-slate-900 border-slate-700 text-rose-500"
                      />
                    </label>

                    <label className="flex items-center justify-between p-3 bg-slate-950 rounded-lg border border-slate-800 text-xs text-slate-300">
                      <span>Hardware Power Button Lockout</span>
                      <input
                        type="checkbox"
                        checked={draftConfig.hardware?.powerButtonLockout ?? false}
                        onChange={(e) => setDraftConfig({
                          ...draftConfig,
                          hardware: { ...draftConfig.hardware, powerButtonLockout: e.target.checked }
                        })}
                        className="rounded bg-slate-900 border-slate-700 text-amber-500"
                      />
                    </label>
                  </div>
                </div>
              )}

              {/* Category: Kiosk */}
              {activeCategory === 'kiosk' && (
                <div className="space-y-4">
                  <div className="border-b border-slate-800 pb-3">
                    <h3 className="text-sm font-bold text-white flex items-center gap-2">
                      <Maximize className="w-4 h-4 text-purple-400" />
                      Dedicated Kiosk & Patient Portal Lockdown
                    </h3>
                    <p className="text-xs text-slate-400">Lock endpoints into single-app or multi-app clinical portals with emergency dialer.</p>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-medium text-slate-300 mb-1">Kiosk Mode</label>
                      <select
                        value={draftConfig.kiosk?.mode ?? 'single_app'}
                        onChange={(e) => setDraftConfig({
                          ...draftConfig,
                          kiosk: { ...draftConfig.kiosk, mode: e.target.value as any }
                        })}
                        className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-slate-200"
                      >
                        <option value="single_app">Single-App Lockout (Kiosk Core)</option>
                        <option value="multi_app">Multi-App Controlled Launcher</option>
                        <option value="disabled">Kiosk Disabled (Full Launcher)</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-medium text-slate-300 mb-1">Primary Kiosk Package ID</label>
                      <input
                        type="text"
                        value={draftConfig.kiosk?.primaryPackageId ?? 'org.sallyhealth.rpm.core'}
                        onChange={(e) => setDraftConfig({
                          ...draftConfig,
                          kiosk: { ...draftConfig.kiosk, primaryPackageId: e.target.value }
                        })}
                        className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs font-mono text-cyan-400"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-medium text-slate-300 mb-1">Admin Exit Passcode PIN</label>
                      <input
                        type="password"
                        value={draftConfig.kiosk?.kioskExitPin ?? '0000'}
                        onChange={(e) => setDraftConfig({
                          ...draftConfig,
                          kiosk: { ...draftConfig.kiosk, kioskExitPin: e.target.value }
                        })}
                        className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-slate-200 font-mono"
                      />
                    </div>

                    <label className="flex items-center justify-between p-3 bg-slate-950 rounded-lg border border-slate-800 text-xs text-slate-300">
                      <span>Enable Patient Nurse Emergency Call</span>
                      <input
                        type="checkbox"
                        checked={draftConfig.kiosk?.patientEmergencyCallEnabled ?? true}
                        onChange={(e) => setDraftConfig({
                          ...draftConfig,
                          kiosk: { ...draftConfig.kiosk, patientEmergencyCallEnabled: e.target.checked }
                        })}
                        className="rounded bg-slate-900 border-slate-700 text-emerald-500"
                      />
                    </label>
                  </div>
                </div>
              )}

              {/* Category: Application */}
              {activeCategory === 'application' && (
                <div className="space-y-4">
                  <div className="border-b border-slate-800 pb-3">
                    <h3 className="text-sm font-bold text-white flex items-center gap-2">
                      <Layers className="w-4 h-4 text-emerald-400" />
                      Enterprise Application Governance & Permissions
                    </h3>
                    <p className="text-xs text-slate-400">Enforce runtime permissions, prevent sideloading, and block unauthorized APKs.</p>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <label className="flex items-center justify-between p-3 bg-slate-950 rounded-lg border border-slate-800 text-xs text-slate-300">
                      <span>Auto-Grant All Runtime Permissions</span>
                      <input
                        type="checkbox"
                        checked={draftConfig.application?.autoGrantRuntimePermissions ?? true}
                        onChange={(e) => setDraftConfig({
                          ...draftConfig,
                          application: { ...draftConfig.application, autoGrantRuntimePermissions: e.target.checked }
                        })}
                        className="rounded bg-slate-900 border-slate-700 text-emerald-500"
                      />
                    </label>

                    <label className="flex items-center justify-between p-3 bg-slate-950 rounded-lg border border-slate-800 text-xs text-slate-300">
                      <span>Allow Unknown Sources / Sideloading</span>
                      <input
                        type="checkbox"
                        checked={draftConfig.application?.allowUnknownSources ?? false}
                        onChange={(e) => setDraftConfig({
                          ...draftConfig,
                          application: { ...draftConfig.application, allowUnknownSources: e.target.checked }
                        })}
                        className="rounded bg-slate-900 border-slate-700 text-rose-500"
                      />
                    </label>
                  </div>
                </div>
              )}

              {/* Category: Browser */}
              {activeCategory === 'browser' && (
                <div className="space-y-4">
                  <div className="border-b border-slate-800 pb-3">
                    <h3 className="text-sm font-bold text-white flex items-center gap-2">
                      <Globe className="w-4 h-4 text-indigo-400" />
                      Managed Browser & Web Content Filtering
                    </h3>
                    <p className="text-xs text-slate-400">Configure corporate URL allowlists, pop-up blocks, and cookie clearance on exit.</p>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <label className="flex items-center justify-between p-3 bg-slate-950 rounded-lg border border-slate-800 text-xs text-slate-300">
                      <span>Clear Cookies & Cache on Session Exit</span>
                      <input
                        type="checkbox"
                        checked={draftConfig.browser?.clearCookiesOnExit ?? true}
                        onChange={(e) => setDraftConfig({
                          ...draftConfig,
                          browser: { ...draftConfig.browser, clearCookiesOnExit: e.target.checked }
                        })}
                        className="rounded bg-slate-900 border-slate-700 text-emerald-500"
                      />
                    </label>

                    <label className="flex items-center justify-between p-3 bg-slate-950 rounded-lg border border-slate-800 text-xs text-slate-300">
                      <span>Force SafeSearch & HIPAA Protection</span>
                      <input
                        type="checkbox"
                        checked={draftConfig.browser?.forceSafeSearch ?? true}
                        onChange={(e) => setDraftConfig({
                          ...draftConfig,
                          browser: { ...draftConfig.browser, forceSafeSearch: e.target.checked }
                        })}
                        className="rounded bg-slate-900 border-slate-700 text-emerald-500"
                      />
                    </label>
                  </div>
                </div>
              )}

              {/* Publish Bar */}
              <div className="pt-4 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className="w-full sm:w-1/2">
                  <input
                    type="text"
                    value={changeSummary}
                    onChange={(e) => setChangeSummary(e.target.value)}
                    placeholder="Change log summary (e.g. Updated kiosk pin & WiFi)..."
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-emerald-500"
                  />
                </div>

                <div className="flex items-center gap-3">
                  {saveSuccess && (
                    <span className="text-xs text-emerald-400 font-semibold flex items-center gap-1">
                      <CheckCircle2 className="w-4 h-4" /> Published Version!
                    </span>
                  )}
                  <button
                    type="submit"
                    className="px-5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold rounded-lg shadow-md shadow-emerald-600/20 transition-all flex items-center gap-2 cursor-pointer"
                  >
                    <ShieldCheck className="w-4 h-4" />
                    Publish New Version (v{(parseFloat(currentPolicy.currentVersion.replace('v', '')) + 0.1).toFixed(1)})
                  </button>
                </div>
              </div>

            </form>
          </div>

        </div>
      )}

      {/* Version History Modal */}
      {showVersionHistoryModal && currentPolicy && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-xl max-h-[85vh] flex flex-col overflow-hidden shadow-2xl">
            <div className="p-5 border-b border-slate-800 flex items-center justify-between">
              <div>
                <h3 className="text-base font-bold text-white">Policy Version History</h3>
                <p className="text-xs text-slate-400">{currentPolicy.name}</p>
              </div>
              <button
                onClick={() => setShowVersionHistoryModal(false)}
                className="text-slate-400 hover:text-white text-sm font-bold cursor-pointer"
              >
                ✕
              </button>
            </div>

            <div className="p-5 overflow-y-auto space-y-3 divide-y divide-slate-800/60">
              {/* Current Active */}
              <div className="pb-3 flex items-start justify-between">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-400 font-mono text-xs font-bold">
                      {currentPolicy.currentVersion} (ACTIVE)
                    </span>
                    <span className="text-xs text-slate-400">{currentPolicy.activeConfig.publishedAt}</span>
                  </div>
                  <p className="text-xs text-slate-300 mt-1">{currentPolicy.activeConfig.changeSummary}</p>
                  <p className="text-[11px] text-slate-500">Author: {currentPolicy.activeConfig.publishedBy}</p>
                </div>
              </div>

              {/* Historic Versions */}
              {currentPolicy.versionHistory.map(hist => (
                <div key={hist.version} className="pt-3 flex items-start justify-between">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="px-2 py-0.5 rounded bg-slate-800 text-slate-300 font-mono text-xs font-bold">
                        {hist.version}
                      </span>
                      <span className="text-xs text-slate-400">{hist.publishedAt}</span>
                    </div>
                    <p className="text-xs text-slate-300 mt-1">{hist.changeSummary}</p>
                    <p className="text-[11px] text-slate-500">Author: {hist.publishedBy}</p>
                  </div>

                  <button
                    onClick={() => handleRollback(hist.version)}
                    className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium rounded-lg flex items-center gap-1 transition-all cursor-pointer"
                  >
                    <RotateCcw className="w-3 h-3 text-amber-400" />
                    <span>Rollback</span>
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Group & Device Assignment Modal */}
      {showAssignModal && currentPolicy && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-lg overflow-hidden shadow-2xl p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-base font-bold text-white">Assign Policy to Fleet Groups</h3>
              <button onClick={() => setShowAssignModal(false)} className="text-slate-400 hover:text-white cursor-pointer">✕</button>
            </div>

            <p className="text-xs text-slate-400">
              Select device groups to automatically push and enforce <strong>{currentPolicy.name} ({currentPolicy.currentVersion})</strong>.
            </p>

            <div className="space-y-2 max-h-60 overflow-y-auto">
              {deviceGroups.map(group => {
                const isAssigned = group.assignedPolicyId === currentPolicy.id;
                return (
                  <div key={group.id} className="flex items-center justify-between p-3 bg-slate-950 rounded-lg border border-slate-800 text-xs">
                    <div>
                      <p className="font-semibold text-white">{group.name}</p>
                      <p className="text-[11px] text-slate-400">{group.type.toUpperCase()} Group • {group.deviceCount} Endpoints</p>
                    </div>
                    <button
                      onClick={() => assignPolicyToGroup(currentPolicy.id, group.id)}
                      className={`px-3 py-1 rounded text-xs font-semibold transition-all cursor-pointer ${
                        isAssigned
                          ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40'
                          : 'bg-slate-800 hover:bg-slate-700 text-slate-300'
                      }`}
                    >
                      {isAssigned ? 'Assigned' : 'Assign Group'}
                    </button>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
