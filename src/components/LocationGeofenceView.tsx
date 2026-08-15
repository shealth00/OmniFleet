import React, { useState } from 'react';
import { 
  MapPin, 
  Plus, 
  ShieldAlert, 
  ShieldCheck, 
  Radio, 
  Trash2, 
  Layers, 
  Crosshair, 
  Maximize2,
  Lock,
  AlertTriangle
} from 'lucide-react';
import { useDevices } from '../context/DeviceContext';
import { GeofenceZoneRecord } from '../types/enterprise';

export const LocationGeofenceView: React.FC = () => {
  const { geofences, createGeofence, deleteGeofence, devices } = useDevices();

  const [selectedGeofenceId, setSelectedGeofenceId] = useState<string>(geofences[0]?.id || '');
  const [showCreateModal, setShowCreateModal] = useState<boolean>(false);

  // New Geofence Form State
  const [newGeoName, setNewGeoName] = useState<string>('');
  const [newFacilityType, setNewFacilityType] = useState<string>('Hospital Campus');
  const [newRadius, setNewRadius] = useState<number>(500);
  const [alertExit, setAlertExit] = useState<boolean>(true);
  const [lockoutExit, setLockoutExit] = useState<boolean>(false);

  const currentGeofence = geofences.find(g => g.id === selectedGeofenceId) || geofences[0];

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    createGeofence({
      name: newGeoName,
      facilityType: newFacilityType,
      radiusMeters: newRadius,
      alertOnExit: alertExit,
      enforceComplianceLockoutOnExit: lockoutExit,
    });
    setShowCreateModal(false);
    setNewGeoName('');
  };

  return (
    <div className="space-y-6">
      
      {/* Header Banner */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 relative overflow-hidden">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="px-2 py-0.5 rounded-full text-xs font-semibold bg-cyan-500/20 text-cyan-400 border border-cyan-500/30">
                Spatial Tracking & Perimeter Defense
              </span>
              <span className="text-xs text-slate-400 font-mono">GPS & BLE Micro-Location</span>
            </div>
            <h1 className="text-2xl font-bold text-white tracking-tight">
              Location Management & Geofencing Engine
            </h1>
            <p className="text-sm text-slate-400 mt-1 max-w-2xl">
              Establish virtual perimeter boundaries around hospital facilities, track GPS/WiFi beacon accuracy rings, and trigger compliance lockdowns upon perimeter breach.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => setShowCreateModal(true)}
              className="px-4 py-2 bg-cyan-600 hover:bg-cyan-500 text-white text-sm font-semibold rounded-lg shadow-lg shadow-cyan-600/20 flex items-center gap-2 transition-all cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              Create Geofence Zone
            </button>
          </div>
        </div>
      </div>

      {/* Main Grid: Interactive Map & Zone List */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left: Interactive Map Canvas */}
        <div className="lg:col-span-8 bg-slate-900 border border-slate-800 rounded-xl p-5 flex flex-col space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <MapPin className="w-4 h-4 text-cyan-400" />
              <span className="text-sm font-bold text-white">Live Facility GIS Map</span>
              <span className="text-xs text-slate-400">• GPS + WiFi Beacon Triangulation</span>
            </div>

            <div className="flex items-center gap-2 text-xs font-mono">
              <span className="flex items-center gap-1 text-emerald-400">
                <span className="w-2 h-2 rounded-full bg-emerald-400" /> Inside (98%)
              </span>
              <span className="flex items-center gap-1 text-rose-400">
                <span className="w-2 h-2 rounded-full bg-rose-400" /> Perimeter Breach (2%)
              </span>
            </div>
          </div>

          {/* Stylized SVG Map Viewport */}
          <div className="relative w-full h-96 bg-slate-950 rounded-xl border border-slate-850 overflow-hidden flex items-center justify-center select-none">
            {/* Grid Pattern */}
            <svg className="absolute inset-0 w-full h-full opacity-20" xmlns="http://www.w3.org/2000/svg">
              <defs>
                <pattern id="grid" width="30" height="30" patternUnits="userSpaceOnUse">
                  <path d="M 30 0 L 0 0 0 30" fill="none" stroke="#38bdf8" strokeWidth="0.5" />
                </pattern>
              </defs>
              <rect width="100%" height="100%" fill="url(#grid)" />
            </svg>

            {/* Simulated Geofence Circle */}
            <div className="absolute w-72 h-72 rounded-full border-2 border-dashed border-cyan-500/50 bg-cyan-500/5 flex items-center justify-center animate-pulse">
              <span className="text-[10px] font-mono text-cyan-300 font-bold bg-slate-950/80 px-2 py-0.5 rounded border border-cyan-500/30">
                {currentGeofence?.name || 'Main Campus Perimeter'} (500m)
              </span>
            </div>

            {/* Device Pins */}
            {devices.map((d, index) => {
              const isInside = d.location ? d.location.insideGeofence : true;
              const angle = (index * (360 / devices.length)) * (Math.PI / 180);
              const dist = isInside ? (index % 2 === 0 ? 50 : 80) : 170;
              const x = Math.cos(angle) * dist;
              const y = Math.sin(angle) * dist;

              return (
                <div
                  key={d.id}
                  style={{ transform: `translate(${x}px, ${y}px)` }}
                  className="absolute group flex flex-col items-center cursor-pointer transition-transform hover:scale-125 z-10"
                >
                  <div className={`w-4 h-4 rounded-full flex items-center justify-center border-2 ${
                    isInside ? 'bg-emerald-500 border-white shadow-emerald-500/50 shadow-lg' : 'bg-rose-500 border-white shadow-rose-500/50 shadow-lg animate-bounce'
                  }`}>
                    <span className="w-1.5 h-1.5 rounded-full bg-white" />
                  </div>

                  {/* Tooltip */}
                  <div className="absolute bottom-6 hidden group-hover:flex flex-col items-center w-48 p-2 bg-slate-900/95 border border-slate-700 text-[10px] text-slate-200 rounded-lg shadow-xl pointer-events-none">
                    <span className="font-bold text-white">{d.name}</span>
                    <span className="text-cyan-400 capitalize">{d.platform} • {d.model}</span>
                    <span className="text-slate-400 font-mono mt-0.5">{d.location?.facilityArea || 'Area 3A'}</span>
                    <span className={isInside ? 'text-emerald-400 font-bold' : 'text-rose-400 font-bold'}>
                      {isInside ? 'Inside Perimeter' : 'PERIMETER VIOLATION'}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="text-[11px] text-slate-400 flex items-center justify-between">
            <span>Coordinates: 41.8986° N, 87.6240° W (Chicago Facility Pavilion B)</span>
            <span className="text-cyan-400 font-mono">Accuracy: ± 3.5m RMS</span>
          </div>
        </div>

        {/* Right: Geofence List & Violation Log */}
        <div className="lg:col-span-4 space-y-4">
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-4">
            <h3 className="text-sm font-bold text-white">Configured Perimeter Zones</h3>

            <div className="space-y-3">
              {geofences.map(geo => {
                const isSelected = geo.id === selectedGeofenceId;
                return (
                  <div
                    key={geo.id}
                    onClick={() => setSelectedGeofenceId(geo.id)}
                    className={`p-3.5 rounded-xl border transition-all cursor-pointer ${
                      isSelected
                        ? 'bg-slate-950 border-cyan-500/50 shadow-md'
                        : 'bg-slate-950/60 border-slate-850 hover:border-slate-700'
                    }`}
                  >
                    <div className="flex items-start justify-between">
                      <div>
                        <h4 className="text-xs font-bold text-white">{geo.name}</h4>
                        <p className="text-[10px] text-slate-400">{geo.facilityType} • {geo.radiusMeters}m radius</p>
                      </div>
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-cyan-500/10 text-cyan-400 border border-cyan-500/30">
                        {geo.activeDeviceCount} Devices
                      </span>
                    </div>

                    <div className="mt-2 pt-2 border-t border-slate-800/80 flex items-center justify-between text-[10px] text-slate-400">
                      <span>Violations: <strong className="text-amber-400">{geo.violationCount24h} (24h)</strong></span>
                      {geo.enforceComplianceLockoutOnExit && (
                        <span className="text-rose-400 flex items-center gap-1 font-semibold">
                          <Lock className="w-3 h-3" /> Auto-Lockout
                        </span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

      </div>

      {/* Create Geofence Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-lg overflow-hidden shadow-2xl p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-base font-bold text-white">Create Virtual Geofence</h3>
              <button onClick={() => setShowCreateModal(false)} className="text-slate-400 hover:text-white cursor-pointer">✕</button>
            </div>

            <form onSubmit={handleCreate} className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">Zone Name</label>
                <input
                  type="text"
                  required
                  value={newGeoName}
                  onChange={(e) => setNewGeoName(e.target.value)}
                  placeholder="e.g. Pavilion B Cardiac Wing Perimeter"
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-slate-200"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">Facility Type</label>
                  <select
                    value={newFacilityType}
                    onChange={(e) => setNewFacilityType(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-slate-200"
                  >
                    <option value="Healthcare Campus">Healthcare Campus</option>
                    <option value="Specialty Ward">Specialty Ward</option>
                    <option value="Outpatient Clinic">Outpatient Clinic</option>
                    <option value="Storage Facility">Storage Facility</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">Radius (Meters)</label>
                  <input
                    type="number"
                    min="50"
                    max="5000"
                    value={newRadius}
                    onChange={(e) => setNewRadius(parseInt(e.target.value) || 500)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-slate-200"
                  />
                </div>
              </div>

              <div className="space-y-2 pt-2 border-t border-slate-800">
                <label className="flex items-center gap-2 text-xs text-slate-300 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={alertExit}
                    onChange={(e) => setAlertExit(e.target.checked)}
                    className="rounded bg-slate-950 border-slate-800 text-cyan-500"
                  />
                  <span>Trigger Critical Security Alert on Perimeter Exit</span>
                </label>

                <label className="flex items-center gap-2 text-xs text-slate-300 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={lockoutExit}
                    onChange={(e) => setLockoutExit(e.target.checked)}
                    className="rounded bg-slate-950 border-slate-800 text-rose-500"
                  />
                  <span>Enforce Instant Screen Lockout on Perimeter Exit</span>
                </label>
              </div>

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
                  Create Geofence
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
