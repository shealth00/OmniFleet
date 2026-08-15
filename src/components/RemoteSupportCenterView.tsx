import React, { useState, useEffect, useRef } from 'react';
import { 
  Tv, 
  Send, 
  Upload, 
  FileText, 
  Lock, 
  RotateCw, 
  Camera, 
  Radio, 
  Maximize2, 
  Mic, 
  Volume2, 
  CheckCircle2, 
  AlertTriangle, 
  Clock, 
  User, 
  Smartphone, 
  Play, 
  Square,
  ArrowRight,
  ShieldCheck,
  Zap
} from 'lucide-react';
import { useDevices } from '../context/DeviceContext';
import { RemoteSupportSessionRecord } from '../types/enterprise';

export const RemoteSupportCenterView: React.FC = () => {
  const { 
    remoteSessions, 
    activeSupportSession, 
    startRemoteSupportSession, 
    endRemoteSupportSession, 
    sendSessionChatMessage, 
    transferFileToDevice,
    updateSessionNotes,
    devices,
    triggerQuickReboot,
    triggerQuickScreenshot,
    executeCommand
  } = useDevices();

  const [selectedTargetDeviceId, setSelectedTargetDeviceId] = useState<string>(devices[0]?.id || '');
  const [sessionTypeSelection, setSessionTypeSelection] = useState<'attended' | 'unattended'>('attended');
  const [chatInput, setChatInput] = useState<string>('');
  const [sessionNotesInput, setSessionNotesInput] = useState<string>('');
  const [isRecording, setIsRecording] = useState<boolean>(true);
  const [touchRipples, setTouchRipples] = useState<{ x: number; y: number; id: number }[]>([]);
  const [screenshotSuccess, setScreenshotSuccess] = useState<boolean>(false);

  const activeSession = activeSupportSession;
  const targetDevice = devices.find(d => d.id === (activeSession?.deviceId || selectedTargetDeviceId)) || devices[0];

  useEffect(() => {
    if (activeSession) {
      setSessionNotesInput(activeSession.sessionNotes);
    }
  }, [activeSession?.id]);

  const handleStartSession = () => {
    startRemoteSupportSession(selectedTargetDeviceId, sessionTypeSelection);
  };

  const handleEndSession = () => {
    if (activeSession) {
      endRemoteSupportSession(activeSession.id);
    }
  };

  const handleSendChat = (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatInput.trim() || !activeSession) return;
    sendSessionChatMessage(activeSession.id, chatInput);
    setChatInput('');
  };

  const handleSimulateFileUpload = () => {
    if (!activeSession) return;
    const testFiles = [
      { name: 'clinical-diagnostic-tool.apk', size: 14200 },
      { name: 'network-hotfix-patch.bin', size: 2400 },
      { name: 'wifi-cert-chain.crt', size: 12 },
    ];
    const file = testFiles[Math.floor(Math.random() * testFiles.length)];
    transferFileToDevice(activeSession.id, file.name, file.size);
  };

  const handleScreenClick = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const newRipple = { x, y, id: Date.now() };
    setTouchRipples(prev => [...prev, newRipple]);
    setTimeout(() => {
      setTouchRipples(prev => prev.filter(r => r.id !== newRipple.id));
    }, 600);
  };

  const handleScreenshot = async () => {
    if (!activeSession) return;
    await triggerQuickScreenshot(activeSession.deviceId);
    setScreenshotSuccess(true);
    setTimeout(() => setScreenshotSuccess(false), 2000);
  };

  const handleReboot = () => {
    if (!activeSession) return;
    triggerQuickReboot(activeSession.deviceId);
  };

  const handleLock = () => {
    if (!activeSession) return;
    executeCommand('lock', 'Remote Session Lock', [activeSession.deviceId]);
  };

  return (
    <div className="space-y-6">
      
      {/* Header Banner */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 relative overflow-hidden">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="px-2 py-0.5 rounded-full text-xs font-semibold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                Encrypted TLS 1.3 Remote Support
              </span>
              <span className="text-xs text-slate-400 font-mono">Attended & Unattended Control</span>
            </div>
            <h1 className="text-2xl font-bold text-white tracking-tight">
              Remote Support & Device Screen Control Center
            </h1>
            <p className="text-sm text-slate-400 mt-1 max-w-2xl">
              Conduct high-frame-rate interactive screen streaming, touch input simulation, file transfers, and technician diagnostic chat across tablets, watches, workstations, and VR headsets.
            </p>
          </div>

          <div className="flex items-center gap-3">
            {activeSession && activeSession.status === 'ACTIVE' ? (
              <button
                onClick={handleEndSession}
                className="px-4 py-2 bg-rose-600 hover:bg-rose-500 text-white text-sm font-semibold rounded-lg shadow-lg shadow-rose-600/20 flex items-center gap-2 transition-all cursor-pointer"
              >
                <Square className="w-4 h-4" />
                End Remote Session ({Math.floor(activeSession.durationSeconds / 60)}:{(activeSession.durationSeconds % 60).toString().padStart(2, '0')})
              </button>
            ) : (
              <div className="flex items-center gap-2">
                <select
                  value={selectedTargetDeviceId}
                  onChange={(e) => setSelectedTargetDeviceId(e.target.value)}
                  className="bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-slate-200"
                >
                  {devices.map(d => (
                    <option key={d.id} value={d.id}>{d.name} ({d.platform.toUpperCase()})</option>
                  ))}
                </select>
                <select
                  value={sessionTypeSelection}
                  onChange={(e) => setSessionTypeSelection(e.target.value as any)}
                  className="bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-slate-200"
                >
                  <option value="attended">Attended (User Prompt)</option>
                  <option value="unattended">Unattended (Kiosk / Background)</option>
                </select>
                <button
                  onClick={handleStartSession}
                  className="px-4 py-2 bg-cyan-600 hover:bg-cyan-500 text-white text-sm font-semibold rounded-lg shadow-lg shadow-cyan-600/20 flex items-center gap-2 transition-all cursor-pointer"
                >
                  <Tv className="w-4 h-4" />
                  Connect
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Live Session Telemetry Bar */}
        {activeSession && activeSession.status === 'ACTIVE' && (
          <div className="flex items-center gap-6 mt-6 pt-4 border-t border-slate-800/80 text-xs text-slate-300 overflow-x-auto font-mono">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
              <span className="text-white font-bold">{activeSession.deviceName}</span>
            </div>
            <div>FPS: <span className="text-emerald-400 font-bold">{activeSession.fps}</span></div>
            <div>Latency: <span className="text-cyan-400 font-bold">{activeSession.latencyMs} ms</span></div>
            <div>Quality: <span className="text-purple-400 font-bold">{activeSession.quality}</span></div>
            <div>Mode: <span className="text-amber-400 uppercase font-bold">{activeSession.sessionType}</span></div>
            <div>Technician: <span className="text-slate-400 font-sans">{activeSession.technicianName}</span></div>
          </div>
        )}
      </div>

      {activeSession && activeSession.status === 'ACTIVE' ? (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          
          {/* Main Remote Screen Canvas */}
          <div className="lg:col-span-8 space-y-4">
            <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden flex flex-col">
              
              {/* Screen Top Toolbar */}
              <div className="bg-slate-950 p-3 border-b border-slate-800 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-semibold text-white">{activeSession.deviceName}</span>
                  <span className="px-2 py-0.5 rounded text-[10px] bg-slate-800 text-slate-400 uppercase font-mono">
                    {activeSession.platform}
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={handleScreenshot}
                    title="Capture High-Res Screenshot"
                    className="p-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded transition-all cursor-pointer"
                  >
                    <Camera className="w-4 h-4" />
                  </button>
                  <button
                    onClick={handleLock}
                    title="Lock Remote Device"
                    className="p-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded transition-all cursor-pointer"
                  >
                    <Lock className="w-4 h-4" />
                  </button>
                  <button
                    onClick={handleReboot}
                    title="Reboot Remote Device"
                    className="p-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded transition-all cursor-pointer"
                  >
                    <RotateCw className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => setIsRecording(!isRecording)}
                    title="Toggle Session Recording"
                    className={`p-1.5 rounded transition-all cursor-pointer ${
                      isRecording ? 'bg-rose-500/20 text-rose-400 border border-rose-500/40' : 'bg-slate-800 text-slate-400'
                    }`}
                  >
                    <Radio className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Interactive Virtual Frame Canvas */}
              <div
                onClick={handleScreenClick}
                className="relative bg-slate-950 min-h-[460px] flex items-center justify-center p-6 cursor-crosshair select-none overflow-hidden"
              >
                {/* Simulated Screen Body */}
                <div className="w-full max-w-md bg-slate-900 border-4 border-slate-800 rounded-2xl shadow-2xl p-4 flex flex-col justify-between space-y-4 aspect-[9/16] max-h-[420px] relative overflow-hidden">
                  
                  {/* Status Bar */}
                  <div className="flex items-center justify-between text-[10px] text-slate-400 border-b border-slate-800/80 pb-2">
                    <span className="font-bold text-white font-mono">10:42 AM</span>
                    <div className="flex items-center gap-2">
                      <span>5G Medical</span>
                      <span className="text-emerald-400 font-bold">94%</span>
                    </div>
                  </div>

                  {/* Foreground App View */}
                  <div className="flex-1 flex flex-col items-center justify-center text-center space-y-3 p-4 bg-slate-950/60 rounded-xl border border-slate-800">
                    <div className="w-14 h-14 rounded-2xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center">
                      <Tv className="w-7 h-7 text-cyan-400" />
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-white">Sally RPM Core Kiosk</h4>
                      <p className="text-[11px] text-slate-400">Patient: Eleanor Vance (Bed 3A)</p>
                      <p className="text-[10px] text-emerald-400 font-mono mt-1">Continuous ECG & BLE Ingest Active</p>
                    </div>
                  </div>

                  {/* Kiosk Emergency Bar */}
                  <div className="bg-rose-950/40 border border-rose-800/50 p-2.5 rounded-lg text-center">
                    <span className="text-[11px] text-rose-300 font-semibold">Nurse Emergency Call Station</span>
                  </div>

                  {/* Navigation Bar */}
                  <div className="flex items-center justify-center gap-8 text-slate-600 pt-2 border-t border-slate-800/60">
                    <span className="w-3 h-3 border border-slate-600 rounded-sm" />
                    <span className="w-3 h-3 rounded-full border border-slate-600" />
                    <span className="text-xs">◁</span>
                  </div>
                </div>

                {/* Touch Feedback Ripples */}
                {touchRipples.map(ripple => (
                  <span
                    key={ripple.id}
                    style={{ left: ripple.x - 20, top: ripple.y - 20 }}
                    className="absolute w-10 h-10 rounded-full bg-cyan-400/40 border border-cyan-400 animate-ping pointer-events-none"
                  />
                ))}

                {screenshotSuccess && (
                  <div className="absolute top-4 right-4 bg-emerald-950/80 border border-emerald-700 text-emerald-300 text-xs px-3 py-1.5 rounded-lg flex items-center gap-1.5 shadow-lg">
                    <CheckCircle2 className="w-4 h-4" /> Screenshot saved to audit log!
                  </div>
                )}
              </div>

              {/* Bottom Quick Control Pills */}
              <div className="bg-slate-950 p-3 border-t border-slate-800 flex items-center justify-between text-xs text-slate-400">
                <span>Click inside virtual frame to simulate end-user touch input.</span>
                <span className="text-cyan-400 font-mono">Input: Mouse + Touch Emulation</span>
              </div>
            </div>
          </div>

          {/* Right Panel: Chat, File Transfer & Session Notes */}
          <div className="lg:col-span-4 space-y-4">
            
            {/* Technician Chat */}
            <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 flex flex-col h-72 justify-between">
              <div className="border-b border-slate-800 pb-2 flex items-center justify-between">
                <span className="text-xs font-semibold text-white">Technician & End-User Chat</span>
                <span className="text-[10px] text-emerald-400">Encrypted</span>
              </div>

              <div className="flex-1 overflow-y-auto space-y-2 py-2 pr-1">
                {activeSession.chatMessages.map(msg => (
                  <div
                    key={msg.id}
                    className={`text-xs p-2.5 rounded-lg max-w-[85%] ${
                      msg.sender === 'technician'
                        ? 'bg-cyan-600 text-white ml-auto rounded-tr-none'
                        : msg.sender === 'device_user'
                        ? 'bg-slate-800 text-slate-200 mr-auto rounded-tl-none'
                        : 'bg-slate-950 border border-slate-800 text-slate-400 text-[10px] w-full text-center'
                    }`}
                  >
                    <p>{msg.message}</p>
                    <span className="text-[9px] opacity-70 block text-right mt-1">{msg.timestamp}</span>
                  </div>
                ))}
              </div>

              <form onSubmit={handleSendChat} className="flex gap-2 pt-2 border-t border-slate-800">
                <input
                  type="text"
                  value={chatInput}
                  onChange={(e) => setChatInput(e.target.value)}
                  placeholder="Send message to device screen..."
                  className="flex-1 bg-slate-950 border border-slate-800 rounded-lg px-3 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-cyan-500"
                />
                <button
                  type="submit"
                  className="px-3 py-1.5 bg-cyan-600 hover:bg-cyan-500 text-white rounded-lg text-xs cursor-pointer"
                >
                  <Send className="w-3.5 h-3.5" />
                </button>
              </form>
            </div>

            {/* File Transfer */}
            <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-white">Secure File Transfer</span>
                <button
                  onClick={handleSimulateFileUpload}
                  className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-cyan-300 text-[11px] font-semibold rounded flex items-center gap-1 cursor-pointer"
                >
                  <Upload className="w-3 h-3" />
                  <span>Push File</span>
                </button>
              </div>

              <div className="space-y-1.5 max-h-32 overflow-y-auto">
                {activeSession.transferredFiles.map(file => (
                  <div key={file.id} className="flex items-center justify-between p-2 bg-slate-950 rounded border border-slate-850 text-xs">
                    <span className="text-slate-300 truncate max-w-[150px]">{file.fileName}</span>
                    <span className="text-[10px] text-emerald-400 font-mono">{file.sizeKb} KB • Done</span>
                  </div>
                ))}
                {activeSession.transferredFiles.length === 0 && (
                  <p className="text-[11px] text-slate-500 text-center py-2">No files transferred in this session.</p>
                )}
              </div>
            </div>

            {/* Session Notes */}
            <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 space-y-2">
              <span className="text-xs font-semibold text-white">Session Audit Notes</span>
              <textarea
                rows={2}
                value={sessionNotesInput}
                onChange={(e) => {
                  setSessionNotesInput(e.target.value);
                  updateSessionNotes(activeSession.id, e.target.value);
                }}
                placeholder="Document diagnostic findings or repairs..."
                className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-xs text-slate-200 focus:outline-none focus:border-cyan-500"
              />
            </div>

          </div>

        </div>
      ) : (
        /* Standby State */
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-12 text-center flex flex-col items-center justify-center text-slate-500">
          <Tv className="w-16 h-16 text-slate-700 mb-3" />
          <h3 className="text-base font-bold text-white">No Active Remote Support Session</h3>
          <p className="text-xs text-slate-400 mt-1 max-w-md">
            Select a target endpoint and session mode above to initiate an encrypted, low-latency diagnostic session.
          </p>
        </div>
      )}

    </div>
  );
};
