import React, { useState } from 'react';
import { 
  Terminal, 
  Play, 
  Code, 
  CheckCircle2, 
  Clock, 
  Smartphone, 
  Copy, 
  Check, 
  Zap, 
  ShieldCheck,
  RotateCw
} from 'lucide-react';
import { useDevices } from '../context/DeviceContext';
import { ScriptTemplateRecord } from '../types/enterprise';

export const ScriptAutomationView: React.FC = () => {
  const { scriptTemplates, executeScriptOnDevices, devices } = useDevices();

  const [selectedScriptId, setSelectedScriptId] = useState<string>(scriptTemplates[0]?.id || '');
  const [selectedDeviceIds, setSelectedDeviceIds] = useState<string[]>([devices[0]?.id || '']);
  const [isExecuting, setIsExecuting] = useState<boolean>(false);
  const [executionOutput, setExecutionOutput] = useState<{ scriptName: string; results: { deviceId: string; deviceName: string; output: string; exitCode: number }[] } | null>(null);

  const currentScript = scriptTemplates.find(s => s.id === selectedScriptId) || scriptTemplates[0];

  const handleRun = async () => {
    if (!currentScript) return;
    setIsExecuting(true);
    const res = await executeScriptOnDevices(currentScript.id, selectedDeviceIds);
    setExecutionOutput(res);
    setIsExecuting(false);
  };

  const toggleDevice = (id: string) => {
    if (selectedDeviceIds.includes(id)) {
      setSelectedDeviceIds(selectedDeviceIds.filter(d => d !== id));
    } else {
      setSelectedDeviceIds([...selectedDeviceIds, id]);
    }
  };

  return (
    <div className="space-y-6">
      
      {/* Header Banner */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 relative overflow-hidden">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="px-2 py-0.5 rounded-full text-xs font-semibold bg-cyan-500/20 text-cyan-400 border border-cyan-500/30">
                Cross-Platform Automation Runtime
              </span>
              <span className="text-xs text-slate-400 font-mono">PowerShell / Bash / Python Engine</span>
            </div>
            <h1 className="text-2xl font-bold text-white tracking-tight">
              Automation & Custom Scripting Engine
            </h1>
            <p className="text-sm text-slate-400 mt-1 max-w-2xl">
              Dispatch administrative diagnostics, cache flushes, telemetry reconciliations, and Knox security audits simultaneously across multi-OS fleets with stdout/stderr telemetry.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={handleRun}
              disabled={isExecuting || selectedDeviceIds.length === 0}
              className="px-5 py-2.5 bg-gradient-to-r from-emerald-600 to-cyan-600 hover:from-emerald-500 hover:to-cyan-500 text-white text-xs font-bold rounded-lg shadow-lg shadow-emerald-600/20 flex items-center gap-2 transition-all cursor-pointer disabled:opacity-50"
            >
              {isExecuting ? <RotateCw className="w-4 h-4 animate-spin" /> : <Play className="w-4 h-4 fill-current" />}
              <span>Execute on {selectedDeviceIds.length} Target(s)</span>
            </button>
          </div>
        </div>

        {/* Script Selection Bar */}
        <div className="flex items-center gap-2 mt-6 pt-4 border-t border-slate-800/80 overflow-x-auto">
          {scriptTemplates.map(script => {
            const isSelected = script.id === selectedScriptId;
            return (
              <button
                key={script.id}
                onClick={() => setSelectedScriptId(script.id)}
                className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-medium transition-all whitespace-nowrap cursor-pointer ${
                  isSelected
                    ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 shadow-sm'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
                }`}
              >
                <Code className="w-3.5 h-3.5" />
                <span>{script.name}</span>
                <span className="px-1.5 py-0.2 bg-slate-800 text-slate-300 rounded text-[10px] uppercase font-mono">
                  {script.language}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {currentScript && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          
          {/* Script Code Viewer & Metadata */}
          <div className="lg:col-span-7 bg-slate-900 border border-slate-800 rounded-xl p-5 flex flex-col justify-between space-y-4">
            <div className="space-y-3">
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="text-sm font-bold text-white">{currentScript.name}</h3>
                  <p className="text-xs text-slate-400 mt-0.5">{currentScript.description}</p>
                </div>
                <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-slate-800 text-slate-300 font-mono">
                  {currentScript.language}
                </span>
              </div>

              {/* Code Box */}
              <div className="bg-slate-950 p-4 rounded-xl border border-slate-850 font-mono text-xs text-emerald-400 overflow-x-auto max-h-72">
                <pre>{currentScript.scriptContent || currentScript.scriptBody}</pre>
              </div>
            </div>

            <div className="pt-2 border-t border-slate-800 flex items-center justify-between text-[11px] text-slate-500 font-mono">
              <span>Target Platforms: {currentScript.targetPlatforms.join(', ').toUpperCase()}</span>
              <span>Executed: {currentScript.executionCount} Times (Last: {currentScript.lastExecutedAt})</span>
            </div>
          </div>

          {/* Target Endpoints Selector */}
          <div className="lg:col-span-5 bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-white">Target Endpoints</h3>
              <button
                onClick={() => setSelectedDeviceIds(devices.map(d => d.id))}
                className="text-xs text-cyan-400 hover:underline cursor-pointer"
              >
                Select All ({devices.length})
              </button>
            </div>

            <div className="space-y-2 max-h-80 overflow-y-auto pr-1">
              {devices.map(device => {
                const isSelected = selectedDeviceIds.includes(device.id);
                return (
                  <div
                    key={device.id}
                    onClick={() => toggleDevice(device.id)}
                    className={`flex items-center justify-between p-3 rounded-lg border text-xs transition-all cursor-pointer ${
                      isSelected
                        ? 'bg-cyan-950/30 border-cyan-500/40 text-white'
                        : 'bg-slate-950/60 border-slate-850 text-slate-400 hover:border-slate-700'
                    }`}
                  >
                    <div>
                      <p className="font-semibold">{device.name}</p>
                      <p className="text-[10px] text-slate-500 capitalize">{device.platform} • {device.deviceGroup}</p>
                    </div>
                    <input
                      type="checkbox"
                      checked={isSelected}
                      readOnly
                      className="rounded bg-slate-900 border-slate-700 text-cyan-500"
                    />
                  </div>
                );
              })}
            </div>
          </div>

        </div>
      )}

      {/* Realtime Execution Terminal Stream */}
      {executionOutput && (
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-3">
          <div className="flex items-center justify-between border-b border-slate-800 pb-2">
            <div className="flex items-center gap-2">
              <Terminal className="w-4 h-4 text-emerald-400" />
              <h3 className="text-sm font-bold text-white">Execution Console Output: {executionOutput.scriptName}</h3>
            </div>
            <span className="text-xs text-emerald-400 font-mono flex items-center gap-1">
              <CheckCircle2 className="w-3.5 h-3.5" /> All Endpoints Returned 0
            </span>
          </div>

          <div className="space-y-2 max-h-60 overflow-y-auto font-mono text-xs">
            {executionOutput.results.map((res, i) => (
              <div key={i} className="p-3 bg-slate-950 rounded-lg border border-slate-850 space-y-1">
                <div className="flex items-center justify-between text-slate-400">
                  <span className="text-cyan-400 font-bold">{res.deviceName} ({res.deviceId})</span>
                  <span className="text-emerald-400 font-bold">Exit Code: {res.exitCode}</span>
                </div>
                <p className="text-slate-300 whitespace-pre-wrap">{res.output}</p>
              </div>
            ))}
          </div>
        </div>
      )}

    </div>
  );
};
