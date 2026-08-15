import React, { useState } from 'react';
import { 
  Package, 
  Search, 
  Filter, 
  CheckCircle2, 
  Wrench, 
  Trash2, 
  Clock, 
  DollarSign, 
  Cpu, 
  HardDrive, 
  Battery, 
  ShieldCheck,
  Tag
} from 'lucide-react';
import { useDevices } from '../context/DeviceContext';
import { AssetInventoryRecord } from '../types/enterprise';

export const AssetInventoryView: React.FC = () => {
  const { assets, updateAssetLifecycle } = useDevices();

  const [search, setSearch] = useState<string>('');
  const [lifecycleFilter, setLifecycleFilter] = useState<string>('ALL');

  const filteredAssets = assets.filter(asset => {
    const matchesSearch = asset.assetTag.toLowerCase().includes(search.toLowerCase()) ||
                          asset.serialNumber.toLowerCase().includes(search.toLowerCase()) ||
                          asset.model.toLowerCase().includes(search.toLowerCase()) ||
                          (asset.assignedPatientName && asset.assignedPatientName.toLowerCase().includes(search.toLowerCase()));
    const matchesFilter = lifecycleFilter === 'ALL' || asset.lifecycleState === lifecycleFilter;
    return matchesSearch && matchesFilter;
  });

  const totalValue = assets.reduce((acc, a) => acc + a.purchaseCostUsd, 0);

  return (
    <div className="space-y-6">
      
      {/* Header Banner */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 relative overflow-hidden">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="px-2 py-0.5 rounded-full text-xs font-semibold bg-cyan-500/20 text-cyan-400 border border-cyan-500/30">
                Hardware Lifecycle & Procurement
              </span>
              <span className="text-xs text-slate-400 font-mono">Enterprise Asset Registry</span>
            </div>
            <h1 className="text-2xl font-bold text-white tracking-tight">
              Hardware Asset & Inventory Management
            </h1>
            <p className="text-sm text-slate-400 mt-1 max-w-2xl">
              Track physical endpoint lifecycles, warranty contracts, purchase valuations, hardware specifications, and clinical patient assignments.
            </p>
          </div>

          <div className="bg-slate-950 p-3 rounded-xl border border-slate-800 flex items-center gap-4">
            <div>
              <span className="text-[10px] text-slate-400 font-mono">Total Fleet Valuation</span>
              <p className="text-lg font-extrabold text-emerald-400">${totalValue.toLocaleString()} USD</p>
            </div>
            <div className="border-l border-slate-800 pl-4">
              <span className="text-[10px] text-slate-400 font-mono">Active Assets</span>
              <p className="text-lg font-extrabold text-white">{assets.length} Units</p>
            </div>
          </div>
        </div>

        {/* Filter Bar */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 mt-6 pt-4 border-t border-slate-800/80">
          <div className="relative w-full sm:w-80">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search asset tag, serial, model, or patient..."
              className="w-full bg-slate-950 border border-slate-800 rounded-lg pl-9 pr-3 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-cyan-500"
            />
          </div>

          <div className="flex bg-slate-950 p-0.5 rounded-lg border border-slate-800 text-[11px] overflow-x-auto">
            {['ALL', 'DEPLOYED', 'ASSIGNED', 'IN_STOCK', 'REPAIR', 'RETIRED'].map(tab => (
              <button
                key={tab}
                onClick={() => setLifecycleFilter(tab)}
                className={`px-3 py-1 rounded font-medium transition-all whitespace-nowrap cursor-pointer ${
                  lifecycleFilter === tab ? 'bg-slate-800 text-white' : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                {tab.replace('_', ' ')}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Asset Table */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-950 text-slate-400 border-b border-slate-800 uppercase tracking-wider font-semibold text-[10px]">
              <tr>
                <th className="px-4 py-3">Asset Tag / Serial</th>
                <th className="px-4 py-3">Hardware Model & OEM</th>
                <th className="px-4 py-3">Lifecycle State</th>
                <th className="px-4 py-3">Assigned Clinical User / Patient</th>
                <th className="px-4 py-3">Hardware Specs</th>
                <th className="px-4 py-3">Procurement & Warranty</th>
                <th className="px-4 py-3">Transition State</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 font-medium">
              {filteredAssets.map(asset => (
                <tr key={asset.id} className="hover:bg-slate-850/40 transition-colors">
                  <td className="px-4 py-3">
                    <p className="font-mono text-cyan-400 font-bold">{asset.assetTag}</p>
                    <p className="text-[10px] text-slate-400 font-mono">SN: {asset.serialNumber}</p>
                  </td>

                  <td className="px-4 py-3">
                    <p className="font-semibold text-white">{asset.model}</p>
                    <p className="text-[10px] text-slate-400 capitalize">{asset.manufacturer} • {asset.platform}</p>
                  </td>

                  <td className="px-4 py-3">
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                      asset.lifecycleState === 'DEPLOYED' ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30' :
                      asset.lifecycleState === 'ASSIGNED' ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/30' :
                      asset.lifecycleState === 'IN_STOCK' ? 'bg-slate-800 text-slate-300' :
                      asset.lifecycleState === 'REPAIR' ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30' :
                      'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                    }`}>
                      {asset.lifecycleState.replace('_', ' ')}
                    </span>
                  </td>

                  <td className="px-4 py-3">
                    {asset.assignedPatientName ? (
                      <div>
                        <p className="text-white font-semibold">{asset.assignedPatientName}</p>
                        <p className="text-[10px] text-slate-400 font-mono">ID: {asset.assignedPatientId}</p>
                      </div>
                    ) : (
                      <span className="text-slate-500 text-[11px]">Unassigned (Pool)</span>
                    )}
                  </td>

                  <td className="px-4 py-3 text-[11px] font-mono text-slate-400 space-y-0.5">
                    <div>RAM: <span className="text-slate-300">{asset.hardwareSpecs.ramGb}GB</span> • Storage: <span className="text-slate-300">{asset.hardwareSpecs.storageGb}GB</span></div>
                    <div>Battery Health: <span className="text-emerald-400">{asset.hardwareSpecs.batteryHealthPercent}%</span></div>
                  </td>

                  <td className="px-4 py-3 text-[11px] text-slate-400">
                    <p className="font-mono text-slate-300">${asset.purchaseCostUsd} USD</p>
                    <p className="text-[10px] text-slate-500">Exp: {asset.warrantyExpiresAt}</p>
                  </td>

                  <td className="px-4 py-3">
                    <select
                      value={asset.lifecycleState}
                      onChange={(e) => updateAssetLifecycle(asset.id, e.target.value as any)}
                      className="bg-slate-950 border border-slate-800 rounded px-2 py-1 text-[11px] text-slate-200 focus:outline-none focus:border-cyan-500"
                    >
                      <option value="DEPLOYED">DEPLOYED</option>
                      <option value="ASSIGNED">ASSIGNED</option>
                      <option value="IN_STOCK">IN_STOCK</option>
                      <option value="REPAIR">REPAIR</option>
                      <option value="RETIRED">RETIRED</option>
                      <option value="LOST">LOST</option>
                    </select>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
};
