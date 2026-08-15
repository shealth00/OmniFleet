import React, { useState } from 'react';
import { 
  ShieldAlert, 
  ShieldCheck, 
  AlertTriangle, 
  RefreshCw, 
  Lock, 
  Zap, 
  Radio, 
  FileText, 
  Trash2, 
  CheckCircle2, 
  Clock, 
  ArrowRight,
  Filter
} from 'lucide-react';
import { useDevices } from '../context/DeviceContext';
import { ComplianceRuleRecord } from '../types/enterprise';

export const ComplianceCenterView: React.FC = () => {
  const { 
    devices, 
    complianceRules, 
    toggleComplianceRule, 
    runFleetComplianceEvaluation, 
    executeRemediationAction 
  } = useDevices();

  const [isEvaluating, setIsEvaluating] = useState<boolean>(false);
  const [filterState, setFilterState] = useState<'ALL' | 'NON_COMPLIANT' | 'WARNING' | 'COMPLIANT'>('ALL');
  const [remediatingDeviceId, setRemediatingDeviceId] = useState<string | null>(null);

  const compliantCount = devices.filter(d => d.complianceState === 'COMPLIANT').length;
  const warningCount = devices.filter(d => d.complianceState === 'WARNING').length;
  const nonCompliantCount = devices.filter(d => d.complianceState === 'NON_COMPLIANT').length;
  const totalCount = devices.length;

  const complianceRate = totalCount > 0 ? Math.round((compliantCount / totalCount) * 100) : 100;

  const filteredDevices = devices.filter(d => {
    if (filterState === 'ALL') return true;
    return d.complianceState === filterState;
  });

  const handleRunSweep = () => {
    setIsEvaluating(true);
    runFleetComplianceEvaluation();
    setTimeout(() => setIsEvaluating(false), 800);
  };

  const handleRemediate = async (deviceId: string, action: ComplianceRuleRecord['autoRemediationAction']) => {
    setRemediatingDeviceId(deviceId);
    await executeRemediationAction(deviceId, action);
    setTimeout(() => setRemediatingDeviceId(null), 600);
  };

  return (
    <div className="space-y-6">
      
      {/* Header Banner */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 relative overflow-hidden">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="px-2 py-0.5 rounded-full text-xs font-semibold bg-rose-500/20 text-rose-300 border border-rose-500/30">
                Continuous Zero-Trust Posture
              </span>
              <span className="text-xs text-slate-400 font-mono">HIPAA & Enterprise Compliance</span>
            </div>
            <h1 className="text-2xl font-bold text-white tracking-tight">
              Compliance & Security Remediation Center
            </h1>
            <p className="text-sm text-slate-400 mt-1 max-w-2xl">
              Monitor real-time device postures against clinical, security, and hardware policies. Execute automated isolation, remote locking, and ITSM incident creation.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={handleRunSweep}
              disabled={isEvaluating}
              className="px-4 py-2 bg-gradient-to-r from-rose-600 to-amber-600 hover:from-rose-500 hover:to-amber-500 text-white text-sm font-semibold rounded-lg shadow-lg shadow-rose-600/20 flex items-center gap-2 transition-all cursor-pointer disabled:opacity-50"
            >
              <RefreshCw className={`w-4 h-4 ${isEvaluating ? 'animate-spin' : ''}`} />
              Run Fleet Compliance Sweep
            </button>
          </div>
        </div>

        {/* Quick Metric Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-6 pt-4 border-t border-slate-800/80">
          <div className="bg-slate-950/80 p-3.5 rounded-xl border border-slate-800">
            <span className="text-[11px] text-slate-400 font-medium">Compliance Rate</span>
            <div className="flex items-baseline gap-2 mt-1">
              <span className={`text-2xl font-extrabold ${complianceRate >= 90 ? 'text-emerald-400' : 'text-amber-400'}`}>
                {complianceRate}%
              </span>
              <span className="text-[11px] text-slate-500 font-mono">{compliantCount}/{totalCount} endpoints</span>
            </div>
          </div>

          <div className="bg-slate-950/80 p-3.5 rounded-xl border border-slate-800">
            <span className="text-[11px] text-emerald-400 font-medium">Compliant</span>
            <div className="flex items-baseline gap-2 mt-1">
              <span className="text-2xl font-extrabold text-white">{compliantCount}</span>
              <span className="text-[11px] text-emerald-500 font-mono">Passing all rules</span>
            </div>
          </div>

          <div className="bg-slate-950/80 p-3.5 rounded-xl border border-slate-800">
            <span className="text-[11px] text-amber-400 font-medium">Warning Threshold</span>
            <div className="flex items-baseline gap-2 mt-1">
              <span className="text-2xl font-extrabold text-amber-400">{warningCount}</span>
              <span className="text-[11px] text-amber-500 font-mono">Attention required</span>
            </div>
          </div>

          <div className="bg-slate-950/80 p-3.5 rounded-xl border border-slate-800">
            <span className="text-[11px] text-rose-400 font-medium">Non-Compliant</span>
            <div className="flex items-baseline gap-2 mt-1">
              <span className="text-2xl font-extrabold text-rose-400">{nonCompliantCount}</span>
              <span className="text-[11px] text-rose-500 font-mono">Action required</span>
            </div>
          </div>
        </div>
      </div>

      {/* Rules Engine Grid */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-base font-semibold text-white">Active Compliance Rule Registry</h2>
            <p className="text-xs text-slate-400">Rules evaluated automatically during periodic background telemetry sweeps.</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {complianceRules.map(rule => (
            <div
              key={rule.id}
              className={`p-4 rounded-xl border transition-all ${
                rule.isEnabled
                  ? 'bg-slate-950/90 border-slate-850'
                  : 'bg-slate-950/40 border-slate-900 opacity-60'
              }`}
            >
              <div className="flex items-start justify-between gap-2">
                <div>
                  <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${
                    rule.severity === 'critical'
                      ? 'bg-rose-500/20 text-rose-300 border border-rose-500/40'
                      : 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                  }`}>
                    {rule.severity}
                  </span>
                  <h3 className="text-xs font-bold text-white mt-1.5">{rule.name}</h3>
                </div>

                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={rule.isEnabled}
                    onChange={() => toggleComplianceRule(rule.id)}
                    className="sr-only peer"
                  />
                  <div className="w-8 h-4 bg-slate-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-3 after:w-3 after:transition-all peer-checked:bg-emerald-500"></div>
                </label>
              </div>

              <p className="text-[11px] text-slate-400 mt-2">{rule.description}</p>

              <div className="mt-3 pt-3 border-t border-slate-850 flex items-center justify-between text-[10px] text-slate-500">
                <span>Action: <strong className="text-slate-300 uppercase">{rule.autoRemediationAction.replace(/_/g, ' ')}</strong></span>
                <span>Platforms: <strong className="text-slate-300">{(rule.targetPlatforms || ['android', 'wearos', 'windows', 'ios']).join(', ')}</strong></span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Fleet Compliance Status Table */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden">
        <div className="p-4 border-b border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <h2 className="text-sm font-semibold text-white">Endpoint Compliance Evaluation Table</h2>
            <span className="text-xs text-slate-400">({filteredDevices.length} endpoints)</span>
          </div>

          <div className="flex items-center gap-2">
            <Filter className="w-3.5 h-3.5 text-slate-400" />
            <div className="flex bg-slate-950 p-0.5 rounded-lg border border-slate-800 text-[11px]">
              {(['ALL', 'NON_COMPLIANT', 'WARNING', 'COMPLIANT'] as const).map(tab => (
                <button
                  key={tab}
                  onClick={() => setFilterState(tab)}
                  className={`px-2.5 py-1 rounded-md font-medium transition-all cursor-pointer ${
                    filterState === tab
                      ? 'bg-slate-800 text-white shadow-sm'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  {tab.replace('_', ' ')}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-950 text-slate-400 border-b border-slate-800 uppercase tracking-wider font-semibold text-[10px]">
              <tr>
                <th className="px-4 py-3">Device / Platform</th>
                <th className="px-4 py-3">Group / Site</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3">Compliance State</th>
                <th className="px-4 py-3">Violation Reason</th>
                <th className="px-4 py-3">Automated Remediation Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 font-medium">
              {filteredDevices.map(device => {
                const isCompliant = device.complianceState === 'COMPLIANT';
                const isWarning = device.complianceState === 'WARNING';
                const isNonCompliant = device.complianceState === 'NON_COMPLIANT';

                return (
                  <tr key={device.id} className="hover:bg-slate-850/40 transition-colors">
                    <td className="px-4 py-3">
                      <p className="font-semibold text-white">{device.name}</p>
                      <p className="text-[10px] text-slate-400 font-mono capitalize">{device.platform} • {device.serialNumber}</p>
                    </td>

                    <td className="px-4 py-3 text-slate-300">
                      <p>{device.deviceGroup}</p>
                      <p className="text-[10px] text-slate-500">{device.site}</p>
                    </td>

                    <td className="px-4 py-3">
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold capitalize ${
                        device.status === 'online' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30' :
                        device.status === 'attention' ? 'bg-amber-500/10 text-amber-400 border border-amber-500/30' :
                        device.status === 'quarantined' ? 'bg-purple-500/20 text-purple-300 border border-purple-500/40' :
                        'bg-slate-800 text-slate-400'
                      }`}>
                        {device.status}
                      </span>
                    </td>

                    <td className="px-4 py-3">
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                        isCompliant ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30' :
                        isWarning ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30' :
                        'bg-rose-500/20 text-rose-300 border border-rose-500/30 animate-pulse'
                      }`}>
                        {device.complianceState}
                      </span>
                    </td>

                    <td className="px-4 py-3 text-slate-400 max-w-xs truncate">
                      {device.complianceReason ? (
                        <span className="text-rose-300 text-[11px] font-semibold">{device.complianceReason}</span>
                      ) : (
                        <span className="text-slate-500 text-[11px]">All security profiles verified</span>
                      )}
                    </td>

                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleRemediate(device.id, 'remote_lock')}
                          disabled={remediatingDeviceId === device.id}
                          title="Remotely Lock Device"
                          className="p-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-md transition-all cursor-pointer"
                        >
                          <Lock className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleRemediate(device.id, 'quarantine_device')}
                          disabled={remediatingDeviceId === device.id}
                          title="Quarantine to Isolation VLAN"
                          className="p-1.5 bg-purple-950/60 hover:bg-purple-900 text-purple-300 border border-purple-800 rounded-md transition-all cursor-pointer"
                        >
                          <Radio className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleRemediate(device.id, 'create_support_ticket')}
                          disabled={remediatingDeviceId === device.id}
                          title="Create ServiceNow / ITSM Ticket"
                          className="p-1.5 bg-cyan-950/60 hover:bg-cyan-900 text-cyan-300 border border-cyan-800 rounded-md transition-all cursor-pointer"
                        >
                          <FileText className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleRemediate(device.id, 'wipe_corporate_data')}
                          disabled={remediatingDeviceId === device.id}
                          title="Enterprise Corporate Wipe"
                          className="p-1.5 bg-rose-950/60 hover:bg-rose-900 text-rose-300 border border-rose-800 rounded-md transition-all cursor-pointer"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
};
