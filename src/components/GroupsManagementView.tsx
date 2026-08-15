import React, { useState } from 'react';
import { 
  Users, 
  Plus, 
  Trash2, 
  Filter, 
  ShieldCheck, 
  Sparkles, 
  Smartphone, 
  CheckCircle2, 
  Layers, 
  ArrowRight,
  RefreshCw
} from 'lucide-react';
import { useDevices } from '../context/DeviceContext';
import { DeviceGroupRecord } from '../types/enterprise';

export const GroupsManagementView: React.FC = () => {
  const { 
    deviceGroups, 
    createDeviceGroup, 
    deleteDeviceGroup, 
    policies, 
    devices,
    assignPolicyToGroup 
  } = useDevices();

  const [selectedGroupId, setSelectedGroupId] = useState<string>(deviceGroups[0]?.id || '');
  const [showCreateModal, setShowCreateModal] = useState<boolean>(false);

  // New Group Form State
  const [newGroupName, setNewGroupName] = useState<string>('');
  const [newGroupDesc, setNewGroupDesc] = useState<string>('');
  const [newGroupType, setNewGroupType] = useState<'static' | 'dynamic'>('static');
  const [dynamicField, setDynamicField] = useState<'batteryLevel' | 'complianceState' | 'platform'>('batteryLevel');
  const [dynamicOp, setDynamicOp] = useState<'equals' | 'not_equals' | 'less_than' | 'greater_than'>('less_than');
  const [dynamicVal, setDynamicVal] = useState<string>('20');
  const [assignedPolicyId, setAssignedPolicyId] = useState<string>('');

  const currentGroup = deviceGroups.find(g => g.id === selectedGroupId) || deviceGroups[0];
  
  // Calculate member devices for this group
  const memberDevices = devices.filter(d => {
    if (!currentGroup) return false;
    if (currentGroup.type === 'static') {
      return d.groupId === currentGroup.id || d.deviceGroup === currentGroup.name;
    } else {
      // Dynamic evaluation preview
      if (currentGroup.rules && currentGroup.rules.length > 0) {
        const rule = currentGroup.rules[0];
        if (rule.field === 'batteryLevel' && rule.operator === 'less_than') {
          return d.telemetry.batteryLevel < parseFloat(String(rule.value));
        }
        if (rule.field === 'complianceState') {
          return d.complianceState === rule.value;
        }
      }
      return d.groupId === currentGroup.id || d.deviceGroup === currentGroup.name;
    }
  });

  const handleCreateGroup = (e: React.FormEvent) => {
    e.preventDefault();
    const policy = policies.find(p => p.id === assignedPolicyId);
    createDeviceGroup({
      name: newGroupName,
      description: newGroupDesc,
      type: newGroupType,
      assignedPolicyId,
      assignedPolicyName: policy ? `${policy.name} (${policy.currentVersion})` : undefined,
      rules: newGroupType === 'dynamic' ? [{
        id: `rule-${Date.now()}`,
        field: dynamicField,
        operator: dynamicOp,
        value: dynamicVal,
      }] : [],
    });
    setShowCreateModal(false);
    setNewGroupName('');
    setNewGroupDesc('');
  };

  return (
    <div className="space-y-6">
      
      {/* Header Banner */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 relative overflow-hidden">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="px-2 py-0.5 rounded-full text-xs font-semibold bg-cyan-500/20 text-cyan-400 border border-cyan-500/30">
                Hierarchical Fleet Taxonomy
              </span>
              <span className="text-xs text-slate-400 font-mono">Dynamic Rule Automation</span>
            </div>
            <h1 className="text-2xl font-bold text-white tracking-tight">
              Device Groups & Dynamic Rules Engine
            </h1>
            <p className="text-sm text-slate-400 mt-1 max-w-2xl">
              Organize endpoints into static administrative units or self-updating dynamic groups based on battery levels, compliance states, OS versions, and geofences.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => setShowCreateModal(true)}
              className="px-4 py-2 bg-cyan-600 hover:bg-cyan-500 text-white text-sm font-semibold rounded-lg shadow-lg shadow-cyan-600/20 flex items-center gap-2 transition-all cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              Create Device Group
            </button>
          </div>
        </div>

        {/* Group Selector Pills */}
        <div className="flex items-center gap-2 mt-6 pt-4 border-t border-slate-800/80 overflow-x-auto">
          {deviceGroups.map(g => {
            const isSelected = g.id === selectedGroupId;
            return (
              <button
                key={g.id}
                onClick={() => setSelectedGroupId(g.id)}
                className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-medium transition-all whitespace-nowrap cursor-pointer ${
                  isSelected
                    ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 shadow-sm'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
                }`}
              >
                <Users className="w-3.5 h-3.5" />
                <span>{g.name}</span>
                <span className="px-1.5 py-0.2 bg-slate-800 text-slate-300 rounded text-[10px] uppercase font-bold">
                  {g.type}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {currentGroup && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          
          {/* Group Details & Dynamic Rules Card */}
          <div className="lg:col-span-4 space-y-4">
            <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-4">
              <div className="flex items-start justify-between">
                <div>
                  <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                    currentGroup.type === 'dynamic' ? 'bg-purple-500/20 text-purple-300 border border-purple-500/30' : 'bg-slate-800 text-slate-300'
                  }`}>
                    {currentGroup.type} Group
                  </span>
                  <h2 className="text-base font-bold text-white mt-1">{currentGroup.name}</h2>
                  <p className="text-xs text-slate-400 mt-1">{currentGroup.description}</p>
                </div>

                <button
                  onClick={() => deleteDeviceGroup(currentGroup.id)}
                  title="Delete Group"
                  className="p-1.5 text-slate-500 hover:text-rose-400 hover:bg-rose-950/40 rounded transition-all cursor-pointer"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>

              <div className="bg-slate-950 p-3 rounded-lg border border-slate-850 text-[11px] font-mono space-y-1.5 text-slate-400">
                <div className="flex justify-between">
                  <span className="text-slate-500 font-sans">Enrolled Members:</span>
                  <span className="text-white font-bold">{memberDevices.length} Devices</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500 font-sans">Assigned Policy:</span>
                  <span className="text-emerald-400 font-semibold truncate max-w-[150px]">
                    {currentGroup.assignedPolicyName || 'None'}
                  </span>
                </div>
              </div>

              {/* Dynamic Rules Visualizer */}
              {currentGroup.type === 'dynamic' && (
                <div className="space-y-2 pt-2 border-t border-slate-800">
                  <span className="text-xs font-semibold text-white flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-purple-400" />
                    Dynamic Membership Criteria
                  </span>
                  <div className="p-3 bg-purple-950/30 border border-purple-800/40 rounded-lg text-xs font-mono text-purple-200 space-y-1">
                    {currentGroup.rules && currentGroup.rules.length > 0 ? (
                      currentGroup.rules.map((r, i) => (
                        <p key={i}>
                          WHERE <strong className="text-white">{r.field}</strong> {r.operator.replace('_', ' ')} <strong className="text-cyan-300">"{r.value}"</strong>
                        </p>
                      ))
                    ) : (
                      <p>WHERE telemetry.batteryLevel &lt; 20%</p>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Group Member Devices List */}
          <div className="lg:col-span-8 bg-slate-900 border border-slate-800 rounded-xl overflow-hidden">
            <div className="p-4 border-b border-slate-800 flex items-center justify-between">
              <h3 className="text-sm font-semibold text-white">Active Group Members</h3>
              <span className="text-xs text-slate-400">{memberDevices.length} Endpoints</span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-950 text-slate-400 border-b border-slate-800 uppercase tracking-wider font-semibold text-[10px]">
                  <tr>
                    <th className="px-4 py-3">Device Name</th>
                    <th className="px-4 py-3">Platform / Model</th>
                    <th className="px-4 py-3">Status</th>
                    <th className="px-4 py-3">Battery</th>
                    <th className="px-4 py-3">Compliance</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60 font-medium">
                  {memberDevices.map(device => (
                    <tr key={device.id} className="hover:bg-slate-850/40 transition-colors">
                      <td className="px-4 py-3 font-semibold text-white">{device.name}</td>
                      <td className="px-4 py-3 text-slate-400 capitalize">{device.platform} • {device.model}</td>
                      <td className="px-4 py-3">
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold capitalize ${
                          device.status === 'online' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30' :
                          device.status === 'attention' ? 'bg-amber-500/10 text-amber-400 border border-amber-500/30' :
                          'bg-slate-800 text-slate-400'
                        }`}>
                          {device.status}
                        </span>
                      </td>
                      <td className="px-4 py-3 font-mono text-cyan-400">{device.telemetry.batteryLevel}%</td>
                      <td className="px-4 py-3">
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                          device.complianceState === 'COMPLIANT' ? 'bg-emerald-500/20 text-emerald-300' :
                          device.complianceState === 'WARNING' ? 'bg-amber-500/20 text-amber-300' :
                          'bg-rose-500/20 text-rose-300'
                        }`}>
                          {device.complianceState}
                        </span>
                      </td>
                    </tr>
                  ))}
                  {memberDevices.length === 0 && (
                    <tr>
                      <td colSpan={5} className="px-4 py-8 text-center text-slate-500">
                        No devices match this group criteria currently.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

        </div>
      )}

      {/* Create Group Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-lg overflow-hidden shadow-2xl p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-base font-bold text-white">Create Device Group</h3>
              <button onClick={() => setShowCreateModal(false)} className="text-slate-400 hover:text-white cursor-pointer">✕</button>
            </div>

            <form onSubmit={handleCreateGroup} className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">Group Name</label>
                <input
                  type="text"
                  required
                  value={newGroupName}
                  onChange={(e) => setNewGroupName(e.target.value)}
                  placeholder="e.g. Cardiology Wearables Fleet"
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-slate-200"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">Description</label>
                <input
                  type="text"
                  value={newGroupDesc}
                  onChange={(e) => setNewGroupDesc(e.target.value)}
                  placeholder="e.g. Bedside patient monitoring tablets"
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-slate-200"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">Group Type</label>
                  <select
                    value={newGroupType}
                    onChange={(e) => setNewGroupType(e.target.value as any)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-slate-200"
                  >
                    <option value="static">Static Group</option>
                    <option value="dynamic">Dynamic Rule Group</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">Assign Policy Profile</label>
                  <select
                    value={assignedPolicyId}
                    onChange={(e) => setAssignedPolicyId(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-slate-200"
                  >
                    <option value="">None (Unassigned)</option>
                    {policies.map(p => (
                      <option key={p.id} value={p.id}>{p.name}</option>
                    ))}
                  </select>
                </div>
              </div>

              {newGroupType === 'dynamic' && (
                <div className="p-3 bg-purple-950/20 border border-purple-800/30 rounded-lg space-y-2">
                  <span className="text-[11px] font-bold text-purple-300 uppercase">Rule Criterion</span>
                  <div className="grid grid-cols-3 gap-2">
                    <select
                      value={dynamicField}
                      onChange={(e) => setDynamicField(e.target.value)}
                      className="bg-slate-950 border border-slate-800 rounded px-2 py-1.5 text-[11px] text-slate-200"
                    >
                      <option value="telemetry.batteryLevel">Battery Level (%)</option>
                      <option value="complianceState">Compliance State</option>
                      <option value="platform">Platform</option>
                    </select>

                    <select
                      value={dynamicOp}
                      onChange={(e) => setDynamicOp(e.target.value)}
                      className="bg-slate-950 border border-slate-800 rounded px-2 py-1.5 text-[11px] text-slate-200"
                    >
                      <option value="less_than">&lt; Less Than</option>
                      <option value="equals">== Equals</option>
                      <option value="greater_than">&gt; Greater Than</option>
                    </select>

                    <input
                      type="text"
                      value={dynamicVal}
                      onChange={(e) => setDynamicVal(e.target.value)}
                      placeholder="Value"
                      className="bg-slate-950 border border-slate-800 rounded px-2 py-1.5 text-[11px] text-slate-200"
                    />
                  </div>
                </div>
              )}

              <div className="pt-3 border-t border-slate-800 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-medium rounded-lg cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-semibold rounded-lg shadow-md shadow-cyan-600/20 cursor-pointer"
                >
                  Create Group
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
