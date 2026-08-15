import React, { useState } from 'react';
import { 
  ShieldCheck, 
  Search, 
  Download, 
  Filter, 
  AlertTriangle, 
  CheckCircle2, 
  Info, 
  Terminal, 
  ArrowUpCircle, 
  QrCode, 
  HeartPulse,
  Clock
} from 'lucide-react';
import { useDevices } from '../context/DeviceContext';
import { DeviceAuditEvent } from '../types/device';

export const AuditTrailView: React.FC = () => {
  const { auditEvents } = useDevices();

  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [severityFilter, setSeverityFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');

  const filteredEvents = auditEvents.filter(e => {
    if (categoryFilter !== 'all' && e.category !== categoryFilter) return false;
    if (severityFilter !== 'all' && e.severity !== severityFilter) return false;
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      return (
        e.action.toLowerCase().includes(q) ||
        e.details.toLowerCase().includes(q) ||
        e.actor.toLowerCase().includes(q) ||
        (e.deviceName && e.deviceName.toLowerCase().includes(q))
      );
    }
    return true;
  });

  const handleExportCsv = () => {
    const headers = ['Timestamp', 'Severity', 'Category', 'Action', 'Actor', 'Device', 'Details'];
    const rows = filteredEvents.map(e => [
      e.timestamp,
      e.severity,
      e.category,
      `"${e.action.replace(/"/g, '""')}"`,
      e.actor,
      e.deviceName || 'N/A',
      `"${e.details.replace(/"/g, '""')}"`,
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `omnifleet-audit-log-${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const getSeverityIcon = (sev: DeviceAuditEvent['severity']) => {
    switch (sev) {
      case 'error':
        return <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0" />;
      case 'warning':
        return <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0" />;
      case 'success':
        return <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />;
      default:
        return <Info className="w-4 h-4 text-cyan-400 shrink-0" />;
    }
  };

  return (
    <div className="space-y-6 animate-fadeIn font-mono">
      
      {/* Banner */}
      <div className="flex flex-wrap items-center justify-between gap-4 p-4 bg-slate-900/90 rounded-2xl border border-slate-800">
        <div>
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-cyan-400" />
            <h1 className="text-lg font-bold text-white tracking-tight font-sans">Audit & Compliance Trail</h1>
            <span className="px-2 py-0.5 text-xs font-mono font-bold bg-cyan-500/10 text-cyan-400 border border-cyan-500/30 rounded">
              SOC2 & HIPAA Compliant Log
            </span>
          </div>
          <p className="text-xs text-slate-400 font-mono mt-1 font-sans">
            Immutable log of all dispatched remote commands, firmware staging, QR token onboardings, and clinical vital sign alarms.
          </p>
        </div>

        <button
          onClick={handleExportCsv}
          className="px-3.5 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 rounded-lg text-xs font-semibold flex items-center gap-2 transition-colors"
        >
          <Download className="w-3.5 h-3.5 text-cyan-400" />
          <span>Export CSV</span>
        </button>
      </div>

      {/* Filter Bar */}
      <div className="flex flex-wrap items-center justify-between gap-4 p-3 bg-slate-900 rounded-xl border border-slate-800 text-xs">
        <div className="flex flex-wrap items-center gap-3">
          
          <div className="flex items-center gap-1.5">
            <span className="text-slate-500 uppercase text-[10px]">Category:</span>
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="bg-slate-950 border border-slate-800 text-slate-200 px-2.5 py-1 rounded-lg focus:outline-none focus:border-cyan-500"
            >
              <option value="all">All Categories</option>
              <option value="command">Remote Commands</option>
              <option value="enrollment">QR Enrollment</option>
              <option value="firmware">Firmware OTA</option>
              <option value="rpm_alert">RPM Vital Alarms</option>
              <option value="security">Security & Policies</option>
              <option value="telemetry">Hardware Telemetry</option>
            </select>
          </div>

          <div className="flex items-center gap-1.5">
            <span className="text-slate-500 uppercase text-[10px]">Severity:</span>
            <select
              value={severityFilter}
              onChange={(e) => setSeverityFilter(e.target.value)}
              className="bg-slate-950 border border-slate-800 text-slate-200 px-2.5 py-1 rounded-lg focus:outline-none focus:border-cyan-500"
            >
              <option value="all">All Severities</option>
              <option value="error">Errors & Alarms</option>
              <option value="warning">Warnings</option>
              <option value="success">Success</option>
              <option value="info">Informational</option>
            </select>
          </div>

        </div>

        <div className="relative">
          <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search action, actor, or details..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="bg-slate-950 border border-slate-800 text-xs text-white pl-8 pr-3 py-1.5 rounded-lg focus:outline-none focus:border-cyan-500 w-64"
          />
        </div>
      </div>

      {/* Audit Log Table */}
      <div className="bg-slate-900 rounded-2xl border border-slate-800 overflow-hidden">
        <div className="divide-y divide-slate-800/80 text-xs">
          {filteredEvents.length > 0 ? (
            filteredEvents.map(event => (
              <div
                key={event.id}
                className="p-4 hover:bg-slate-850/60 transition-colors flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3"
              >
                <div className="flex items-start gap-3">
                  <div className="mt-0.5">{getSeverityIcon(event.severity)}</div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-white text-sm font-sans">{event.action}</span>
                      <span className="px-1.5 py-0.5 rounded text-[10px] uppercase font-bold bg-slate-950 text-slate-400 border border-slate-800">
                        {event.category}
                      </span>
                      {event.deviceName && (
                        <span className="text-[11px] text-cyan-300 font-bold">
                          • {event.deviceName}
                        </span>
                      )}
                    </div>
                    <div className="text-slate-400 text-xs font-sans mt-1 leading-normal">
                      {event.details}
                    </div>
                  </div>
                </div>

                <div className="text-left sm:text-right shrink-0 space-y-0.5 text-[11px]">
                  <div className="text-slate-300 font-semibold">{event.timestamp}</div>
                  <div className="text-slate-500 text-[10px]">Actor: {event.actor}</div>
                </div>
              </div>
            ))
          ) : (
            <div className="p-8 text-center text-slate-400">
              No audit events matched the selected filters.
            </div>
          )}
        </div>
      </div>

    </div>
  );
};
