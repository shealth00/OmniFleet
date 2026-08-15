import React, { useState } from 'react';
import { 
  Layers, 
  Plus, 
  RotateCcw, 
  CheckCircle2, 
  AlertTriangle, 
  Play, 
  Pause, 
  ExternalLink, 
  Smartphone, 
  Clock, 
  UploadCloud, 
  ShieldCheck, 
  PackageCheck,
  Zap,
  ArrowRight
} from 'lucide-react';
import { useDevices } from '../context/DeviceContext';
import { ApplicationPackage, PlatformType } from '../types/device';
import { DeploymentJobRecord } from '../types/enterprise';

export const ApplicationLifecycleView: React.FC = () => {
  const { 
    applications, 
    deploymentJobs, 
    createDeploymentJob, 
    rollbackDeploymentJob, 
    cancelDeploymentJob,
    deviceGroups,
    devices
  } = useDevices();

  const [activeTab, setActiveTab] = useState<'catalog' | 'jobs' | 'managed_configs'>('catalog');
  const [showNewJobModal, setShowNewJobModal] = useState<boolean>(false);

  // New Job Form State
  const [selectedAppId, setSelectedAppId] = useState<string>(applications[0]?.id || '');
  const [selectedRing, setSelectedRing] = useState<DeploymentJobRecord['deploymentRing']>('CANARY');
  const [targetGroup, setTargetGroup] = useState<string>('Chicago SNF Group');
  const [autoRollbackPct, setAutoRollbackPct] = useState<number>(10);

  const handleCreateJob = (e: React.FormEvent) => {
    e.preventDefault();
    const app = applications.find(a => a.id === selectedAppId) || applications[0];
    createDeploymentJob({
      applicationId: app.id,
      applicationName: app.name,
      targetVersion: app.version,
      targetGroupNames: [targetGroup],
      deploymentRing: selectedRing,
      autoRollbackOnFailureRatePercent: autoRollbackPct,
      totalTargets: 142,
    });
    setShowNewJobModal(false);
    setActiveTab('jobs');
  };

  return (
    <div className="space-y-6">
      
      {/* Header Banner */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 relative overflow-hidden">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="px-2 py-0.5 rounded-full text-xs font-semibold bg-cyan-500/20 text-cyan-400 border border-cyan-500/30">
                Application Lifecycle Management
              </span>
              <span className="text-xs text-slate-400 font-mono">Enterprise Software Distribution</span>
            </div>
            <h1 className="text-2xl font-bold text-white tracking-tight">
              App Catalog & Software Deployment Pipeline
            </h1>
            <p className="text-sm text-slate-400 mt-1 max-w-2xl">
              Distribute certified APKs, MSI/EXEs, Apple Store apps, and Wear OS binaries with canary rings, maintenance windows, and automatic rollback guardrails.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => setShowNewJobModal(true)}
              className="px-4 py-2 bg-cyan-600 hover:bg-cyan-500 text-white text-sm font-semibold rounded-lg shadow-lg shadow-cyan-600/20 flex items-center gap-2 transition-all cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              New Deployment Rollout Job
            </button>
          </div>
        </div>

        {/* Sub Tabs */}
        <div className="flex items-center gap-2 mt-6 pt-4 border-t border-slate-800/80 overflow-x-auto">
          {[
            { id: 'catalog', label: 'Certified App Catalog', icon: Layers, count: applications.length },
            { id: 'jobs', label: 'Active Deployment Jobs', icon: Zap, count: deploymentJobs.length },
            { id: 'managed_configs', label: 'Managed App Config (EMM)', icon: ShieldCheck },
          ].map(tab => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
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

      {/* Tab 1: App Catalog */}
      {activeTab === 'catalog' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {applications.map(app => (
            <div key={app.id} className="bg-slate-900 border border-slate-800 rounded-xl p-5 flex flex-col justify-between space-y-4 hover:border-slate-700 transition-all">
              <div className="space-y-3">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-center p-2">
                      <Layers className="w-5 h-5 text-cyan-400" />
                    </div>
                    <div>
                      <h3 className="text-sm font-bold text-white">{app.name}</h3>
                      <p className="text-[10px] text-slate-400 font-mono">v{app.version} • {app.sizeMb} MB</p>
                    </div>
                  </div>

                  <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                    app.distributionType === 'enterprise_apk' ? 'bg-cyan-500/10 text-cyan-400 border border-cyan-500/30' :
                    app.distributionType === 'google_play' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30' :
                    'bg-purple-500/10 text-purple-400 border border-purple-500/30'
                  }`}>
                    {app.distributionType.replace('_', ' ')}
                  </span>
                </div>

                <p className="text-xs text-slate-300">{app.description}</p>

                <div className="bg-slate-950 p-2.5 rounded-lg border border-slate-850 text-[11px] font-mono space-y-1 text-slate-400">
                  <div className="flex justify-between">
                    <span className="text-slate-500 font-sans">Identifier:</span>
                    <span className="text-cyan-400 truncate max-w-[170px]">{app.packageIdentifier}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500 font-sans">Platform:</span>
                    <span className="text-slate-300 uppercase">{app.platform}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500 font-sans">Assigned Groups:</span>
                    <span className="text-white">{app.assignedGroups.length} Groups</span>
                  </div>
                </div>
              </div>

              <div className="pt-2 border-t border-slate-800 flex items-center justify-between">
                <span className="text-[10px] text-slate-500">Auto-Update: Enabled</span>
                <button
                  onClick={() => {
                    setSelectedAppId(app.id);
                    setShowNewJobModal(true);
                  }}
                  className="px-3 py-1.5 bg-cyan-600/20 hover:bg-cyan-600/30 text-cyan-300 border border-cyan-500/30 text-xs font-semibold rounded-lg flex items-center gap-1 transition-all cursor-pointer"
                >
                  <Zap className="w-3.5 h-3.5" />
                  <span>Deploy</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Tab 2: Deployment Jobs */}
      {activeTab === 'jobs' && (
        <div className="space-y-4">
          <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden">
            <div className="p-4 border-b border-slate-800 flex items-center justify-between">
              <h2 className="text-sm font-semibold text-white">Active Software Rollout Pipeline</h2>
              <span className="text-xs text-slate-400">{deploymentJobs.length} Active Jobs</span>
            </div>

            <div className="divide-y divide-slate-800/60">
              {deploymentJobs.map(job => {
                const total = job.totalTargets || 1;
                const successPct = Math.round((job.successfulCount / total) * 100);
                const failedPct = Math.round((job.failedCount / total) * 100);
                const inProgressPct = Math.round((job.inProgressCount / total) * 100);

                return (
                  <div key={job.id} className="p-5 space-y-3 hover:bg-slate-850/40 transition-colors">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                      <div className="flex items-center gap-3">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${
                          job.deploymentRing === 'CANARY' ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30' :
                          job.deploymentRing === 'PILOT' ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/30' :
                          'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                        }`}>
                          {job.deploymentRing} Ring
                        </span>
                        <h3 className="text-sm font-bold text-white">
                          {job.applicationName} <span className="text-slate-400 font-mono text-xs">v{job.targetVersion}</span>
                        </h3>
                        <span className="text-xs text-slate-400">• {job.targetGroupNames.join(', ')}</span>
                      </div>

                      <div className="flex items-center gap-2">
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                          job.status === 'completed' ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30' :
                          job.status === 'in_progress' ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 animate-pulse' :
                          job.status === 'rolling_back' ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30' :
                          'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                        }`}>
                          {job.status.replace('_', ' ')}
                        </span>

                        {job.status === 'in_progress' && (
                          <button
                            onClick={() => cancelDeploymentJob(job.id)}
                            className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-slate-300 text-[11px] rounded transition-all cursor-pointer"
                          >
                            Cancel
                          </button>
                        )}

                        <button
                          onClick={() => rollbackDeploymentJob(job.id)}
                          className="px-2.5 py-1 bg-rose-950/60 hover:bg-rose-900 text-rose-300 border border-rose-800 text-[11px] rounded transition-all flex items-center gap-1 cursor-pointer"
                        >
                          <RotateCcw className="w-3 h-3" />
                          <span>Rollback</span>
                        </button>
                      </div>
                    </div>

                    {/* Progress Visualizer */}
                    <div className="space-y-1.5">
                      <div className="flex items-center justify-between text-xs text-slate-400 font-mono">
                        <span>{job.successfulCount} Installed ({successPct}%)</span>
                        <span>{job.inProgressCount} In Progress</span>
                        <span>{job.failedCount} Failed ({failedPct}%)</span>
                      </div>

                      <div className="h-2 w-full bg-slate-950 rounded-full overflow-hidden flex">
                        <div style={{ width: `${successPct}%` }} className="bg-emerald-500 h-full transition-all duration-500" />
                        <div style={{ width: `${inProgressPct}%` }} className="bg-cyan-500 h-full transition-all duration-500 animate-pulse" />
                        <div style={{ width: `${failedPct}%` }} className="bg-rose-500 h-full transition-all duration-500" />
                      </div>
                    </div>

                    <div className="flex items-center justify-between text-[11px] text-slate-500 pt-1">
                      <span>Initiated by {job.initiatedBy} • {job.scheduleType.toUpperCase()} window</span>
                      <span>Auto-Rollback Trigger: Failure rate &gt; {job.autoRollbackOnFailureRatePercent}%</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* Tab 3: Managed Configurations */}
      {activeTab === 'managed_configs' && (
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 space-y-4">
          <div>
            <h2 className="text-base font-semibold text-white">Managed App Configuration (EMM AppConfig API)</h2>
            <p className="text-xs text-slate-400">Push runtime JSON key-value configuration dictionaries directly into managed apps without recompiling.</p>
          </div>

          <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 font-mono text-xs text-cyan-300">
            <pre className="overflow-x-auto">
{`{
  "org.sallyhealth.rpm.core": {
    "serverEndpoint": "https://telemetry-gateway.sallyhealth.org/v2/ingest",
    "facilityCode": "CHI-SNF-04",
    "bleGattAutoPairing": true,
    "highSamplingIntervalSeconds": 15,
    "patientEmergencyHotline": "+1-800-555-0199",
    "telehealthSessionTimeoutSeconds": 1800,
    "allowPatientVolumeAdjust": true
  }
}`}
            </pre>
          </div>
        </div>
      )}

      {/* New Deployment Job Modal */}
      {showNewJobModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-lg overflow-hidden shadow-2xl p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-base font-bold text-white">Create Software Rollout Job</h3>
              <button onClick={() => setShowNewJobModal(false)} className="text-slate-400 hover:text-white cursor-pointer">✕</button>
            </div>

            <form onSubmit={handleCreateJob} className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">Target Application</label>
                <select
                  value={selectedAppId}
                  onChange={(e) => setSelectedAppId(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-slate-200"
                >
                  {applications.map(a => (
                    <option key={a.id} value={a.id}>{a.name} (v{a.version})</option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">Deployment Ring</label>
                  <select
                    value={selectedRing}
                    onChange={(e) => setSelectedRing(e.target.value as any)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-slate-200"
                  >
                    <option value="CANARY">Canary Ring (5% Fleet)</option>
                    <option value="PILOT">Pilot Ring (20% Fleet)</option>
                    <option value="PRODUCTION">Production Ring (100% Fleet)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">Target Group</label>
                  <select
                    value={targetGroup}
                    onChange={(e) => setTargetGroup(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-slate-200"
                  >
                    {deviceGroups.map(g => (
                      <option key={g.id} value={g.name}>{g.name}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">Auto-Rollback Failure Rate Threshold (%)</label>
                <input
                  type="number"
                  min="1"
                  max="50"
                  value={autoRollbackPct}
                  onChange={(e) => setAutoRollbackPct(parseInt(e.target.value) || 10)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-slate-200"
                />
              </div>

              <div className="pt-3 border-t border-slate-800 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowNewJobModal(false)}
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-medium rounded-lg cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-semibold rounded-lg shadow-md shadow-cyan-600/20 cursor-pointer"
                >
                  Dispatch Rollout Job
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
