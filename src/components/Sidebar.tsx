import React from 'react';
import { 
  Server, 
  Terminal, 
  ArrowUpCircle, 
  QrCode, 
  HeartPulse, 
  Layers, 
  Code, 
  ShieldCheck,
  ShieldAlert,
  Radio,
  Sliders,
  Tv,
  Users,
  Package,
  MapPin,
  FileText,
  Watch,
  Zap
} from 'lucide-react';

interface SidebarProps {
  currentTab?: string;
  activeTab?: string;
  setCurrentTab?: (tab: string) => void;
  setActiveTab?: (tab: string) => void;
  badgeCounts?: {
    fleet?: number;
    rpmAlerts?: number;
    updating?: number;
    commands?: number;
    ideAgents?: number;
    compliance?: number;
  };
  onOpenQREnrollment?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ 
  currentTab, 
  activeTab, 
  setCurrentTab, 
  setActiveTab, 
  badgeCounts = { fleet: 0, rpmAlerts: 0, updating: 0, commands: 0 },
  onOpenQREnrollment
}) => {
  const currentActiveTab = activeTab || currentTab || 'fleet';
  const handleTabChange = setActiveTab || setCurrentTab || (() => {});

  const navSections = [
    {
      title: 'Endpoint & MDM Controls',
      items: [
        {
          id: 'fleet',
          label: 'Fleet Overview',
          icon: Server,
          description: 'Hardware status & live telemetry',
        },
        {
          id: 'enrollment_center',
          label: 'Enrollment & Provisioning',
          icon: QrCode,
          badge: 'Zero-Touch',
          badgeColor: 'bg-cyan-500/20 text-cyan-300 border-cyan-500/30',
          description: 'QR, Knox KME, ABM, Autopilot',
        },
        {
          id: 'policy_engine',
          label: 'Profiles & Policies',
          icon: ShieldCheck,
          description: 'Kiosk, Wi-Fi, BitLocker, Passcode',
        },
        {
          id: 'compliance_center',
          label: 'Compliance & Remediation',
          icon: ShieldAlert,
          badge: 'Zero-Trust',
          badgeColor: 'bg-rose-500/20 text-rose-300 border-rose-500/40',
          description: 'Auto-lockout & isolation rules',
        },
        {
          id: 'groups_management',
          label: 'Groups & Dynamic Rules',
          icon: Users,
          description: 'Static & self-updating criteria',
        },
      ]
    },
    {
      title: 'Lifecycle & Software Management',
      items: [
        {
          id: 'apps_lifecycle',
          label: 'App Catalog & Rollouts',
          icon: Layers,
          description: 'Canary rings & auto-rollback',
        },
        {
          id: 'patch_mgmt',
          label: 'Patch & OS Updates',
          icon: ArrowUpCircle,
          description: 'CVE remediation & bulletins',
        },
        {
          id: 'content_locker',
          label: 'Content Locker (MCM)',
          icon: FileText,
          description: 'Encrypted clinical protocols',
        },
      ]
    },
    {
      title: 'Remote Support & Automation',
      items: [
        {
          id: 'remote_support',
          label: 'Remote Support & Control',
          icon: Tv,
          badge: 'Live',
          badgeColor: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40 animate-pulse',
          description: 'Interactive screen streaming',
        },
        {
          id: 'script_automation',
          label: 'Automation & Scripting',
          icon: Zap,
          description: 'PowerShell / Bash / Python',
        },
        {
          id: 'command_center',
          label: 'Batch Command Center',
          icon: Sliders,
          description: 'Multi-device orchestration',
        },
        {
          id: 'central_ide',
          label: 'Tablet Dev Stations & IDEs',
          icon: Terminal,
          badge: 'Wi-Fi 6',
          badgeColor: 'bg-cyan-500/20 text-cyan-300 border-cyan-500/40 font-bold',
          description: 'Code-Server, NAS sync, SCRCPY & ADB',
        },
      ]
    },
    {
      title: 'Clinical RPM & Hardware Operations',
      items: [
        {
          id: 'wearables_gateway',
          label: 'Wearables & BLE Gateway',
          icon: Watch,
          description: 'Galaxy Watch 7 & GATT stack',
        },
        {
          id: 'rpm',
          label: 'Clinical RPM Ingestion',
          icon: HeartPulse,
          badge: badgeCounts.rpmAlerts && badgeCounts.rpmAlerts > 0 ? `${badgeCounts.rpmAlerts} Alert` : undefined,
          badgeColor: 'bg-rose-500/20 text-rose-300 border-rose-500/40 animate-pulse',
          description: 'Continuous patient telemetry',
        },
        {
          id: 'geofencing',
          label: 'Location & Geofencing',
          icon: MapPin,
          description: 'Facility perimeter tracking',
        },
        {
          id: 'asset_inventory',
          label: 'Asset & Hardware Inventory',
          icon: Package,
          description: 'Procurement & lifecycle states',
        },
        {
          id: 'firmware',
          label: 'Firmware & OTA Updates',
          icon: ArrowUpCircle,
          description: 'Binary package deployment',
        },
      ]
    },
    {
      title: 'Governance & Integration',
      items: [
        {
          id: 'audit',
          label: 'Audit & Compliance Log',
          icon: ShieldCheck,
          description: 'Immutable change records',
        },
        {
          id: 'api_sdk',
          label: 'Device Integration SDK',
          icon: Code,
          description: 'REST & WebSocket contracts',
        },
      ]
    }
  ];

  return (
    <aside className="w-68 bg-slate-900/80 border-r border-slate-800 flex flex-col justify-between shrink-0 hidden md:flex overflow-y-auto">
      <div className="p-3 space-y-4">
        {navSections.map((section, sIdx) => (
          <div key={sIdx} className="space-y-1">
            <div className="px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-slate-500 font-mono">
              {section.title}
            </div>

            {section.items.map((item) => {
              const Icon = item.icon;
              const isActive = currentActiveTab === item.id;

              return (
                <button
                  key={item.id}
                  id={`sidebar-tab-${item.id}`}
                  onClick={() => handleTabChange(item.id)}
                  className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-medium transition-all group text-left cursor-pointer ${
                    isActive
                      ? 'bg-gradient-to-r from-cyan-950/90 to-slate-900 text-cyan-300 border border-cyan-500/40 shadow-sm shadow-cyan-950'
                      : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60 border border-transparent'
                  }`}
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <Icon
                      className={`w-4 h-4 shrink-0 transition-colors ${
                        isActive ? 'text-cyan-400' : 'text-slate-400 group-hover:text-slate-200'
                      }`}
                    />
                    <div className="truncate">
                      <div className="font-semibold truncate text-[11px]">{item.label}</div>
                      <div className="text-[9px] text-slate-500 truncate font-mono">{item.description}</div>
                    </div>
                  </div>

                  {item.badge && (
                    <span
                      className={`ml-1.5 px-1.5 py-0.2 text-[9px] font-mono font-bold rounded border shrink-0 ${
                        item.badgeColor || (isActive ? 'bg-cyan-500/20 text-cyan-300 border-cyan-500/40' : 'bg-slate-800 text-slate-400 border-slate-700')
                      }`}
                    >
                      {item.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        ))}
      </div>

      {/* Footer System Status Banner */}
      <div className="p-3 border-t border-slate-800/80 bg-slate-950/60 m-2 rounded-xl text-[11px] font-mono">
        <div className="flex items-center justify-between text-slate-400 mb-1">
          <span className="flex items-center gap-1.5">
            <Radio className="w-3 h-3 text-emerald-400 animate-pulse" />
            <span>Gateway Ingestion</span>
          </span>
          <span className="text-emerald-400 font-bold">ACTIVE</span>
        </div>
        <div className="text-[10px] text-slate-500 leading-tight">
          BLE 5.3 GATT • Health Connect 200Hz • Knox EMM v3.8
        </div>
      </div>
    </aside>
  );
};
