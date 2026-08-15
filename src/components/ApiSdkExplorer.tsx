import React, { useState } from 'react';
import { 
  Code, 
  Copy, 
  Check, 
  Terminal, 
  Send, 
  ShieldCheck, 
  Sparkles, 
  FileCode, 
  Server, 
  Key,
  Globe
} from 'lucide-react';

export const ApiSdkExplorer: React.FC = () => {
  const [activeLanguage, setActiveLanguage] = useState<'kotlin' | 'swift' | 'csharp' | 'curl' | 'python'>('kotlin');
  const [selectedEndpoint, setSelectedEndpoint] = useState<string>('heartbeat');
  const [copiedCode, setCopiedCode] = useState(false);

  const endpoints = [
    {
      id: 'register',
      method: 'POST',
      path: '/api/devices/register',
      title: 'Device Registration & Mutual TLS Handshake',
      description: 'Enroll custom hardware, register public key certificate fingerprint, and bind to facility site.',
    },
    {
      id: 'heartbeat',
      method: 'POST',
      path: '/api/devices/heartbeat',
      title: 'Real-time Heartbeat & Hardware Vital Stats',
      description: 'Report continuous battery, CPU, RAM, storage, Wi-Fi RSSI dBm, and active foreground task.',
    },
    {
      id: 'telemetry',
      method: 'POST',
      path: '/api/devices/telemetry',
      title: 'Wearable Health / RPM Sensor Ingestion Stream',
      description: 'Ingest raw 200Hz PPG/ECG waveforms, normalized HR, SpO2, HRV, step counts, and fall triggers.',
    },
    {
      id: 'commands_poll',
      method: 'GET',
      path: '/api/devices/{id}/commands',
      title: 'Fetch Pending Remote Commands',
      description: 'Poll or receive WebSocket dispatch for remote lock, app launch, reboot, or OTA staging requests.',
    },
    {
      id: 'command_ack',
      method: 'POST',
      path: '/api/devices/{id}/commands/{cmdId}/ack',
      title: 'Command Acknowledgement & Execution Duration',
      description: 'Notify central gateway of command execution success/failure with duration in milliseconds.',
    },
  ];

  const getCodeSnippet = () => {
    switch (activeLanguage) {
      case 'kotlin':
        return `// Kotlin Android / Wear OS SDK Client
package org.sallyhealth.sdk

import okhttp3.MediaType.Companion.toMediaType
import okhttp3.OkHttpClient
import okhttp3.Request
import okhttp3.RequestBody.Companion.toRequestBody
import org.json.JSONObject

class OmniFleetDeviceBridge(private val deviceId: String, private val authToken: String) {
    private val client = OkHttpClient.Builder().build()
    private val gatewayUrl = "https://gateway.sallyhealth.org"

    fun sendHeartbeat(battery: Int, cpu: Int, wifiDbm: Int, foregroundApp: String) {
        val payload = JSONObject().apply {
            put("deviceId", deviceId)
            put("batteryLevel", battery)
            put("cpuUsagePercent", cpu)
            put("wifiSignalDbm", wifiDbm)
            put("currentForegroundApp", foregroundApp)
            put("timestamp", System.currentTimeMillis())
        }

        val request = Request.Builder()
            .url("$gatewayUrl/api/devices/heartbeat")
            .header("Authorization", "Bearer $authToken")
            .header("X-Device-Platform", "wearos")
            .post(payload.toString().toRequestBody("application/json".toMediaType()))
            .build()

        client.newCall(request).execute().use { response ->
            if (!response.isSuccessful) throw RuntimeException("Heartbeat failed: \${response.code}")
        }
    }
}`;

      case 'swift':
        return `// Swift iOS / iPadOS MDM Bridge Client
import Foundation

class OmniFleetIOSBridge {
    let deviceId: String
    let token: String
    let endpoint = URL(string: "https://gateway.sallyhealth.org/api/devices/heartbeat")!

    init(deviceId: String, token: String) {
        self.deviceId = deviceId
        self.token = token
    }

    func transmitHeartbeat(battery: Float, foregroundApp: String) async throws {
        var request = URLRequest(url: endpoint)
        request.httpMethod = "POST"
        request.setValue("Bearer \\(token)", forHTTPHeaderField: "Authorization")
        request.setValue("application/json", forHTTPHeaderField: "Content-Type")

        let body: [String: Any] = [
            "deviceId": deviceId,
            "batteryLevel": Int(battery * 100),
            "currentForegroundApp": foregroundApp,
            "timestamp": Date().timeIntervalSince1970
        ]
        request.httpBody = try JSONSerialization.data(withJSONObject: body)

        let (_, response) = try await URLSession.shared.data(for: request)
        guard let httpResponse = response as? HTTPURLResponse, httpResponse.statusCode == 200 else {
            throw NSError(domain: "OmniFleet", code: 500, userInfo: nil)
        }
    }
}`;

      case 'csharp':
        return `// C# .NET Windows Medical Workstation Agent
using System;
using System.Net.Http;
using System.Net.Http.Headers;
using System.Text;
using System.Text.Json;
using System.Threading.Tasks;

public class WindowsMedicalAgent {
    private static readonly HttpClient client = new HttpClient();
    private readonly string _deviceId;
    private readonly string _token;

    public WindowsMedicalAgent(string deviceId, string token) {
        _deviceId = deviceId;
        _token = token;
        client.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue("Bearer", _token);
    }

    public async Task PostHeartbeatAsync(int cpuLoad, int ramLoad, string bitlockerStatus) {
        var telemetry = new {
            deviceId = _deviceId,
            cpuUsagePercent = cpuLoad,
            ramUsagePercent = ramLoad,
            securityState = bitlockerStatus,
            timestamp = DateTimeOffset.UtcNow.ToUnixTimeSeconds()
        };

        var content = new StringContent(JsonSerializer.Serialize(telemetry), Encoding.UTF8, "application/json");
        var res = await client.PostAsync("https://gateway.sallyhealth.org/api/devices/heartbeat", content);
        res.EnsureSuccessStatusCode();
    }
}`;

      case 'python':
        return `# Python IoT / Edge Linux Telehealth Gateway Broker
import requests
import time

GATEWAY = "https://gateway.sallyhealth.org"
AUTH_TOKEN = "SH-GATEWAY-SECRET-TOKEN"
DEVICE_ID = "dev-custom-001"

def stream_gatt_rpm_telemetry(hr: int, spo2: int, hrv: int, patient_id: str):
    payload = {
        "deviceId": DEVICE_ID,
        "patientId": patient_id,
        "vitals": {
            "heartRateBpm": hr,
            "spo2Percent": spo2,
            "hrvMs": hrv,
            "bleStatus": "connected"
        },
        "timestamp": int(time.time())
    }
    headers = {
        "Authorization": f"Bearer {AUTH_TOKEN}",
        "Content-Type": "application/json"
    }
    r = requests.post(f"{GATEWAY}/api/devices/telemetry", json=payload, headers=headers)
    r.raise_for_status()
    print("RPM Vitals ingested ACK:", r.json())`;

      default: // cURL
        return `curl -X POST https://gateway.sallyhealth.org/api/devices/heartbeat \\
  -H "Authorization: Bearer SH-ENR-2026-X9921" \\
  -H "Content-Type: application/json" \\
  -d '{
    "deviceId": "dev-tab-001",
    "batteryLevel": 94,
    "isCharging": true,
    "temperatureCelsius": 31.4,
    "cpuUsagePercent": 18,
    "ramUsagePercent": 42,
    "wifiSignalDbm": -54,
    "currentForegroundApp": "org.sallyhealth.rpm.core",
    "timestamp": 1786867200
  }'`;
    }
  };

  const handleCopyCode = () => {
    navigator.clipboard.writeText(getCodeSnippet());
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2000);
  };

  return (
    <div className="space-y-6 animate-fadeIn font-mono">
      
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 p-4 bg-slate-900/90 rounded-2xl border border-slate-800">
        <div>
          <div className="flex items-center gap-2">
            <Code className="w-5 h-5 text-cyan-400" />
            <h1 className="text-lg font-bold text-white tracking-tight font-sans">Device Integration SDK & REST Contracts</h1>
            <span className="px-2 py-0.5 text-xs font-mono font-bold bg-cyan-500/10 text-cyan-400 border border-cyan-500/30 rounded">
              Specification v2.1
            </span>
          </div>
          <p className="text-xs text-slate-400 font-mono mt-1 font-sans">
            Lightweight bridge model: Any custom Android, iOS, Windows, or embedded Linux device can integrate via this standardized contract.
          </p>
        </div>

        <div className="flex items-center gap-2 text-xs text-slate-400">
          <Globe className="w-3.5 h-3.5 text-cyan-400" />
          <span>mTLS Gateway: https://gateway.sallyhealth.org</span>
        </div>
      </div>

      {/* Grid: Endpoints & Code Snippets */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Endpoints Column (5 cols) */}
        <div className="lg:col-span-5 space-y-2.5 text-xs">
          <div className="text-xs font-bold text-slate-200 uppercase tracking-wider font-sans">
            REST & WebSocket Endpoints
          </div>

          {endpoints.map(ep => {
            const isSelected = selectedEndpoint === ep.id;
            return (
              <div
                key={ep.id}
                onClick={() => setSelectedEndpoint(ep.id)}
                className={`p-3.5 rounded-xl border cursor-pointer transition-all ${
                  isSelected
                    ? 'bg-slate-900 border-cyan-500 shadow-md shadow-cyan-950/40'
                    : 'bg-slate-950/80 border-slate-800 hover:bg-slate-900/60'
                }`}
              >
                <div className="flex items-center gap-2 mb-1">
                  <span className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${
                    ep.method === 'POST' ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40' : 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40'
                  }`}>
                    {ep.method}
                  </span>
                  <span className="font-bold text-white text-xs">{ep.path}</span>
                </div>

                <div className="font-semibold text-slate-200 text-xs font-sans mt-1">{ep.title}</div>
                <div className="text-[11px] text-slate-400 font-sans mt-0.5 leading-normal">{ep.description}</div>
              </div>
            );
          })}
        </div>

        {/* Code Snippet Box (7 cols) */}
        <div className="lg:col-span-7 space-y-3">
          
          {/* Language Selector Header */}
          <div className="flex items-center justify-between bg-slate-900 px-4 py-2 rounded-t-xl border border-slate-800">
            <div className="flex items-center gap-2 text-xs">
              {(['kotlin', 'swift', 'csharp', 'python', 'curl'] as const).map(lang => (
                <button
                  key={lang}
                  onClick={() => setActiveLanguage(lang)}
                  className={`px-3 py-1 rounded-lg font-bold transition-all uppercase text-[11px] ${
                    activeLanguage === lang
                      ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/50'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  {lang === 'csharp' ? 'C# (.NET)' : lang}
                </button>
              ))}
            </div>

            <button
              onClick={handleCopyCode}
              className="px-2.5 py-1 text-xs font-semibold text-cyan-300 bg-slate-800 hover:bg-slate-700 rounded-lg flex items-center gap-1.5 transition-colors"
            >
              {copiedCode ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5 text-cyan-400" />}
              <span>{copiedCode ? 'Copied' : 'Copy'}</span>
            </button>
          </div>

          {/* Code Body */}
          <div className="p-4 bg-slate-950 rounded-b-xl border border-t-0 border-slate-800 overflow-x-auto text-xs text-cyan-300 leading-relaxed max-h-[500px]">
            <pre>
              <code>{getCodeSnippet()}</code>
            </pre>
          </div>

          <div className="p-3 bg-slate-900/60 rounded-xl border border-slate-800 text-[11px] font-sans text-slate-400 flex items-center justify-between">
            <span>Authentication: Mutual TLS (mTLS) with SHA-256 Client Certificate</span>
            <span className="text-emerald-400 font-bold">Compliant with HIPAA / SOC2</span>
          </div>

        </div>

      </div>

    </div>
  );
};
