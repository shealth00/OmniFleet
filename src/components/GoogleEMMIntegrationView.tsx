import React, { useState, useEffect } from 'react';
import {
  Cloud,
  Link as LinkIcon,
  Smartphone,
  Settings,
  CheckCircle2,
  AlertCircle,
  LogOut,
  RefreshCw,
  Eye,
  EyeOff
} from 'lucide-react';
import { apiClient } from '../services/api';

export const GoogleEMMIntegrationView: React.FC = () => {
  const [emmStatus, setEmmStatus] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showAuthUrl, setShowAuthUrl] = useState(false);
  const [authUrl, setAuthUrl] = useState<string | null>(null);
  const [enterprises, setEnterprises] = useState<any[]>([]);

  useEffect(() => {
    checkEMMStatus();
  }, []);

  const checkEMMStatus = async () => {
    try {
      setLoading(true);
      const status = await apiClient.getEMMStatus();
      setEmmStatus(status);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to check EMM status');
    } finally {
      setLoading(false);
    }
  };

  const initiateOAuth = async () => {
    try {
      setLoading(true);
      setError(null);
      const result = await apiClient.initiateEMMOAuth();
      setAuthUrl(result.authUrl);
      setShowAuthUrl(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to initiate OAuth flow');
    } finally {
      setLoading(false);
    }
  };

  const copyAuthUrl = () => {
    if (authUrl) {
      navigator.clipboard.writeText(authUrl);
    }
  };

  const loadEnterprises = async () => {
    try {
      setLoading(true);
      const result = await apiClient.listEnterprises();
      setEnterprises(result.enterprises);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load enterprises');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-blue-900 to-cyan-900 border border-blue-800 rounded-xl p-6 relative overflow-hidden">
        <div className="absolute right-0 top-0 translate-x-8 -translate-y-8 w-64 h-64 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="flex items-center gap-4 relative z-10">
          <Cloud className="w-10 h-10 text-blue-400" />
          <div>
            <h1 className="text-2xl font-bold text-white">Google EMM Integration</h1>
            <p className="text-sm text-blue-100 mt-1">
              Connect OmniFleet to Google Enterprise Mobility Management for advanced device control
            </p>
          </div>
        </div>
      </div>

      {/* Status Card */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-6">
          <div className="flex items-center gap-3 mb-2">
            {emmStatus?.connected ? (
              <CheckCircle2 className="w-6 h-6 text-emerald-400" />
            ) : (
              <AlertCircle className="w-6 h-6 text-yellow-400" />
            )}
            <h3 className="text-sm font-semibold text-slate-300">Connection Status</h3>
          </div>
          <p className="text-2xl font-bold text-white">
            {emmStatus?.connected ? 'Connected' : 'Disconnected'}
          </p>
          <p className="text-xs text-slate-400 mt-2">
            {emmStatus?.connected ? 'EMM integration is active' : 'Click below to connect'}
          </p>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-xl p-6">
          <h3 className="text-sm font-semibold text-slate-300 mb-2">Enterprises</h3>
          <p className="text-2xl font-bold text-white">
            {emmStatus?.enterprises?.length || 0}
          </p>
          <p className="text-xs text-slate-400 mt-2">
            Connected EMM enterprises
          </p>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-xl p-6">
          <h3 className="text-sm font-semibold text-slate-300 mb-2">Device Sync</h3>
          <p className="text-2xl font-bold text-white">Active</p>
          <p className="text-xs text-slate-400 mt-2">
            Real-time device synchronization enabled
          </p>
        </div>
      </div>

      {/* Main Content */}
      {!emmStatus?.connected ? (
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-8 text-center space-y-6">
          <div className="flex justify-center">
            <div className="w-16 h-16 bg-blue-500/20 rounded-full flex items-center justify-center">
              <Cloud className="w-8 h-8 text-blue-400" />
            </div>
          </div>
          <div>
            <h2 className="text-xl font-bold text-white mb-2">Connect to Google EMM</h2>
            <p className="text-sm text-slate-400 max-w-md mx-auto">
              Authorize OmniFleet to access your Google Enterprise Mobility Management console.
              This enables advanced device management capabilities including enrollment,
              policy enforcement, and audit logging.
            </p>
          </div>

          <button
            onClick={initiateOAuth}
            disabled={loading}
            className="px-6 py-3 bg-blue-600 hover:bg-blue-500 text-white font-semibold rounded-lg shadow-md shadow-blue-600/20 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
          >
            <LinkIcon className="w-5 h-5" />
            {loading ? 'Initiating...' : 'Connect Google Account'}
          </button>

          {error && (
            <div className="p-4 bg-rose-950/40 border border-rose-800/80 rounded-lg text-sm text-rose-300 flex items-start gap-2">
              <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
              <div>{error}</div>
            </div>
          )}
        </div>
      ) : (
        <div className="space-y-4">
          {/* Connected Status */}
          <div className="bg-emerald-950/30 border border-emerald-800/60 rounded-xl p-6 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <CheckCircle2 className="w-6 h-6 text-emerald-400" />
              <div>
                <p className="font-semibold text-white">Google EMM Connected</p>
                <p className="text-xs text-emerald-200">Project: {emmStatus?.projectId}</p>
              </div>
            </div>
            <button
              onClick={() => setEmmStatus(null)}
              className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 text-sm font-semibold rounded-lg transition-all flex items-center gap-2 cursor-pointer"
            >
              <LogOut className="w-4 h-4" />
              Disconnect
            </button>
          </div>

          {/* Enterprises Management */}
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-6">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-lg font-semibold text-white">EMM Enterprises</h3>
                <p className="text-xs text-slate-400 mt-1">Manage your enrolled enterprises</p>
              </div>
              <button
                onClick={loadEnterprises}
                disabled={loading}
                className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 text-sm font-semibold rounded-lg transition-all flex items-center gap-2 cursor-pointer disabled:opacity-50"
              >
                <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
                Refresh
              </button>
            </div>

            {enterprises.length === 0 ? (
              <div className="text-center py-8 text-slate-400">
                <Smartphone className="w-12 h-12 mx-auto mb-3 opacity-50" />
                <p className="text-sm">No enterprises configured yet</p>
              </div>
            ) : (
              <div className="space-y-3">
                {enterprises.map((enterprise: any) => (
                  <div
                    key={enterprise.id}
                    className="bg-slate-950 border border-slate-800 rounded-lg p-4 flex items-center justify-between hover:border-slate-700 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <Cloud className="w-5 h-5 text-blue-400" />
                      <div>
                        <p className="font-semibold text-white">{enterprise.name}</p>
                        <p className="text-xs text-slate-400">{enterprise.deviceCount || 0} devices</p>
                      </div>
                    </div>
                    <button className="px-3 py-1.5 bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold rounded transition-all cursor-pointer">
                      Manage
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Features */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {[
              {
                icon: Smartphone,
                title: 'Device Enrollment',
                description: 'Enroll devices through Google EMM Zero-Touch provisioning',
              },
              {
                icon: Settings,
                title: 'Policy Management',
                description: 'Apply and enforce policies across your device fleet',
              },
              {
                icon: Eye,
                title: 'Audit Logs',
                description: 'Track all device management activities in real-time',
              },
              {
                icon: RefreshCw,
                title: 'Device Sync',
                description: 'Automatic synchronization of device inventory',
              },
            ].map((feature, idx) => {
              const Icon = feature.icon;
              return (
                <div key={idx} className="bg-slate-900 border border-slate-800 rounded-lg p-4">
                  <Icon className="w-5 h-5 text-blue-400 mb-2" />
                  <h4 className="font-semibold text-white text-sm">{feature.title}</h4>
                  <p className="text-xs text-slate-400 mt-1">{feature.description}</p>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* OAuth URL Display */}
      {showAuthUrl && authUrl && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 max-w-lg w-full mx-4">
            <h3 className="text-lg font-semibold text-white mb-4">Complete Authorization</h3>
            <p className="text-sm text-slate-300 mb-4">
              Copy the link below and open it in your browser to authorize OmniFleet:
            </p>
            <div className="bg-slate-950 border border-slate-800 rounded-lg p-3 mb-4">
              <div className="flex items-center gap-2">
                <code className="text-xs text-cyan-400 font-mono break-all">{authUrl}</code>
                <button
                  onClick={copyAuthUrl}
                  className="px-3 py-1 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold rounded transition-all cursor-pointer shrink-0"
                >
                  Copy
                </button>
              </div>
            </div>
            <button
              onClick={() => setShowAuthUrl(false)}
              className="w-full px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white font-semibold rounded-lg transition-all cursor-pointer"
            >
              Done
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
