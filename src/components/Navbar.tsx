import React from 'react';
import { 
  Activity, 
  Play, 
  Pause, 
  QrCode, 
  Terminal, 
  ArrowUpCircle, 
  AlertTriangle, 
  Search,
  CheckCircle2,
  Cpu,
  Layers,
  HeartPulse,
  Laptop
} from 'lucide-react';
import { useDevices } from '../context/DeviceContext';

interface NavbarProps {
  currentTab?: string;
  activeTab?: string;
  setCurrentTab?: (tab: string) => void;
  setActiveTab?: (tab: string) => void;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  openEnrollmentModal?: () => void;
  onOpenQREnrollment?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentTab,
  activeTab,
  setCurrentTab,
  setActiveTab,
  searchQuery,
  setSearchQuery,
  openEnrollmentModal,
  onOpenQREnrollment,
}) => {
  const { devices, tabletIDEAgents, isRealtimeActive, setIsRealtimeActive } = useDevices();

  const currentActiveTab = activeTab || currentTab || 'fleet';
  const handleTabChange = setActiveTab || setCurrentTab || (() => {});
  const handleEnrollClick = onOpenQREnrollment || openEnrollmentModal || (() => {});

  const totalDevices = devices.length;
  const onlineDevices = devices.filter(d => d.status === 'online').length;
  const attentionDevices = devices.filter(d => d.status === 'attention').length;
  const updatingDevices = devices.filter(d => d.status === 'updating').length;
  const rpmStreamingDevices = devices.filter(d => d.rpmVitals?.bleStatus === 'connected').length;
  const executingIDEAgents = tabletIDEAgents.filter(a => a.status === 'executing' || a.status === 'compiling').length;

  return (
    <header className="sticky top-0 z-30 bg-slate-900/90 backdrop-blur-md border-b border-slate-800 text-slate-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 gap-4">
          
          {/* Logo & Brand */}
          <div className="flex items-center gap-3 min-w-max cursor-pointer" onClick={() => handleTabChange('fleet')}>
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-cyan-600 via-teal-500 to-emerald-400 p-[1px] flex items-center justify-center shadow-lg shadow-cyan-500/20">
              <div className="w-full h-full bg-slate-950 rounded-[11px] flex items-center justify-center">
                <Layers className="w-5 h-5 text-cyan-400" />
              </div>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-extrabold text-base tracking-tight bg-gradient-to-r from-cyan-400 via-teal-300 to-white bg-clip-text text-transparent">
                  OmniFleet
                </span>
                <span className="px-1.5 py-0.5 text-[10px] font-bold tracking-wider uppercase rounded bg-cyan-500/10 text-cyan-400 border border-cyan-500/30">
                  v2.8 Enterprise
                </span>
              </div>
              <p className="text-[11px] text-slate-400 font-mono flex items-center gap-1.5">
                <span>Operations & Remote Health Console</span>
              </p>
            </div>
          </div>

          {/* Quick Metrics Ticker */}
          <div className="hidden lg:flex items-center gap-2 bg-slate-950/80 px-3 py-1.5 rounded-lg border border-slate-800 text-xs">
            <div className="flex items-center gap-1.5 text-slate-300 pr-3 border-r border-slate-800">
              <Cpu className="w-3.5 h-3.5 text-cyan-400" />
              <span className="font-semibold text-white">{totalDevices}</span>
              <span className="text-slate-400">Total</span>
            </div>
            
            <div className="flex items-center gap-1.5 text-emerald-400 pr-3 border-r border-slate-800">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
              </span>
              <span className="font-semibold text-emerald-300">{onlineDevices}</span>
              <span className="text-slate-400">Online</span>
            </div>

            {/* Central IDE Agent Ticker */}
            <div 
              className="flex items-center gap-1.5 text-cyan-400 pr-3 border-r border-slate-800 cursor-pointer hover:underline"
              onClick={() => handleTabChange('central_ide')}
              title="Central IDE Agent Continuous Monitor for Tablets"
            >
              <Terminal className="w-3.5 h-3.5 text-cyan-400" />
              <span className="font-semibold text-cyan-300">{tabletIDEAgents.length} Tablets</span>
              <span className="text-emerald-400 font-mono text-[10px]">({executingIDEAgents} Active)</span>
            </div>

            {attentionDevices > 0 && (
              <div 
                className="flex items-center gap-1.5 text-amber-400 pr-3 border-r border-slate-800 cursor-pointer hover:underline"
                onClick={() => handleTabChange('rpm')}
                title="Critical vital alarms or hardware attention required"
              >
                <AlertTriangle className="w-3.5 h-3.5 text-amber-400" />
                <span className="font-semibold text-amber-300">{attentionDevices}</span>
                <span className="text-slate-400">Attention</span>
              </div>
            )}

            {updatingDevices > 0 && (
              <div 
                className="flex items-center gap-1.5 text-cyan-400 pr-3 border-r border-slate-800 cursor-pointer hover:underline"
                onClick={() => handleTabChange('firmware')}
              >
                <ArrowUpCircle className="w-3.5 h-3.5 text-cyan-400 animate-spin" />
                <span className="font-semibold text-cyan-300">{updatingDevices}</span>
                <span className="text-slate-400">OTA Updating</span>
              </div>
            )}

            <div 
              className="flex items-center gap-1.5 text-teal-400 cursor-pointer hover:underline"
              onClick={() => handleTabChange('rpm')}
            >
              <HeartPulse className="w-3.5 h-3.5 text-teal-400" />
              <span className="font-semibold text-teal-300">{rpmStreamingDevices}</span>
              <span className="text-slate-400">RPM Streaming</span>
            </div>
          </div>

          {/* Search Field */}
          <div className="flex-1 max-w-xs relative hidden sm:block">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              id="navbar-search-input"
              type="text"
              placeholder="Search serial, patient, IP, or model..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-slate-950/90 text-xs text-slate-100 placeholder-slate-500 pl-9 pr-3 py-2 rounded-lg border border-slate-800 focus:outline-none focus:border-cyan-500/80 focus:ring-1 focus:ring-cyan-500/50 transition-colors font-mono"
            />
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-2">
            {/* Realtime simulation ticker toggle */}
            <button
              id="toggle-realtime-btn"
              onClick={() => setIsRealtimeActive(!isRealtimeActive)}
              className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-mono font-medium transition-all border ${
                isRealtimeActive 
                  ? 'bg-emerald-500/10 text-emerald-300 border-emerald-500/30 hover:bg-emerald-500/20' 
                  : 'bg-amber-500/10 text-amber-300 border-amber-500/30 hover:bg-amber-500/20'
              }`}
              title={isRealtimeActive ? 'Live telemetry stream active (3s ticker)' : 'Simulation paused'}
            >
              {isRealtimeActive ? (
                <>
                  <Activity className="w-3.5 h-3.5 text-emerald-400 animate-pulse" />
                  <span className="hidden md:inline">LIVE STREAM</span>
                </>
              ) : (
                <>
                  <Pause className="w-3.5 h-3.5 text-amber-400" />
                  <span className="hidden md:inline">PAUSED</span>
                </>
              )}
            </button>

            {/* Quick Central IDE Supervisor shortcut */}
            <button
              id="nav-ide-agent-btn"
              onClick={() => handleTabChange('central_ide')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all border ${
                currentActiveTab === 'central_ide'
                  ? 'bg-cyan-600 text-white border-cyan-500 shadow-md shadow-cyan-500/20'
                  : 'bg-slate-800/80 text-slate-200 border-slate-700 hover:bg-slate-800 hover:text-white'
              }`}
              title="Central IDE Agent Supervisor"
            >
              <Terminal className="w-3.5 h-3.5 text-cyan-400" />
              <span className="hidden sm:inline">IDE Supervisor</span>
            </button>

            {/* QR Enroll Device Button */}
            <button
              id="nav-qr-enroll-btn"
              onClick={handleEnrollClick}
              className="px-3.5 py-1.5 rounded-lg text-xs font-semibold bg-gradient-to-r from-cyan-500 to-teal-500 text-slate-950 hover:from-cyan-400 hover:to-teal-400 transition-all flex items-center gap-1.5 shadow-md shadow-cyan-500/20 active:scale-95"
            >
              <QrCode className="w-3.5 h-3.5 text-slate-950 stroke-[2.5]" />
              <span>Enroll Device</span>
            </button>
          </div>

        </div>
      </div>
    </header>
  );
};

