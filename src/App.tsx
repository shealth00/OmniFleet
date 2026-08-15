import React, { useState } from 'react';
import { DeviceProvider, useDevices } from './context/DeviceContext';
import { Navbar } from './components/Navbar';
import { Sidebar } from './components/Sidebar';
import { FleetDashboard } from './components/FleetDashboard';
import { EnrollmentCenterView } from './components/EnrollmentCenterView';
import { PolicyEngineView } from './components/PolicyEngineView';
import { ComplianceCenterView } from './components/ComplianceCenterView';
import { GroupsManagementView } from './components/GroupsManagementView';
import { ApplicationLifecycleView } from './components/ApplicationLifecycleView';
import { PatchManagementView } from './components/PatchManagementView';
import { ContentManagementView } from './components/ContentManagementView';
import { RemoteSupportCenterView } from './components/RemoteSupportCenterView';
import { ScriptAutomationView } from './components/ScriptAutomationView';
import { CommandCenter } from './components/CommandCenter';
import { CentralIDEAgentMonitor } from './components/CentralIDEAgentMonitor';
import { WearablesGatewayView } from './components/WearablesGatewayView';
import { RPMHealthDashboard } from './components/RPMHealthDashboard';
import { LocationGeofenceView } from './components/LocationGeofenceView';
import { AssetInventoryView } from './components/AssetInventoryView';
import { FirmwareManager } from './components/FirmwareManager';
import { AuditTrailView } from './components/AuditTrailView';
import { ApiSdkExplorer } from './components/ApiSdkExplorer';
import { QREnrollmentModal } from './components/QREnrollmentModal';
import { DeviceDetailModal } from './components/DeviceDetailModal';
import { MobileDeviceEnrollmentPortal } from './components/MobileDeviceEnrollmentPortal';

const AppContent: React.FC = () => {
  const [activeTab, setActiveTab] = useState<string>('fleet');
  const [showQREnrollment, setShowQREnrollment] = useState<boolean>(false);
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Check if browser opened with an enrollment token query param (e.g. from camera/Chrome QR scan)
  const [mobileEnrollToken, setMobileEnrollToken] = useState<string | null>(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      return params.get('enroll') || params.get('token') || null;
    }
    return null;
  });

  const { selectedDevice, setSelectedDevice, devices } = useDevices();

  // If opened via mobile enrollment scan, show the dedicated mobile onboarding portal
  if (mobileEnrollToken) {
    return (
      <MobileDeviceEnrollmentPortal 
        token={mobileEnrollToken} 
        onClose={() => {
          setMobileEnrollToken(null);
          window.history.replaceState({}, '', window.location.pathname);
        }} 
      />
    );
  }

  const rpmAlertsCount = devices.filter(d => d.rpmVitals?.alertFlag === 'critical').length;
  const nonCompliantCount = devices.filter(d => d.complianceState === 'NON_COMPLIANT').length;

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col antialiased selection:bg-cyan-500 selection:text-slate-950 font-sans">
      
      {/* Top Navigation Bar */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        onOpenQREnrollment={() => setShowQREnrollment(true)}
      />

      {/* Main Layout Body */}
      <div className="flex-1 flex overflow-hidden">
        
        {/* Navigation Sidebar */}
        <Sidebar
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          badgeCounts={{
            fleet: devices.length,
            rpmAlerts: rpmAlertsCount,
            compliance: nonCompliantCount,
          }}
          onOpenQREnrollment={() => setShowQREnrollment(true)}
        />

        {/* Dynamic Main Workspace Plane */}
        <main className="flex-1 overflow-y-auto p-4 md:p-6 lg:p-8 space-y-6">
          
          {activeTab === 'fleet' && (
            <FleetDashboard
              searchQuery={searchQuery}
              onOpenCommandCenter={() => setActiveTab('command_center')}
              onOpenFirmwareManager={() => setActiveTab('firmware')}
              onOpenEnrollment={() => setActiveTab('enrollment_center')}
            />
          )}

          {activeTab === 'enrollment_center' && <EnrollmentCenterView />}

          {activeTab === 'policy_engine' && <PolicyEngineView />}

          {activeTab === 'compliance_center' && <ComplianceCenterView />}

          {activeTab === 'groups_management' && <GroupsManagementView />}

          {activeTab === 'apps_lifecycle' && <ApplicationLifecycleView />}

          {activeTab === 'patch_mgmt' && <PatchManagementView />}

          {activeTab === 'content_locker' && <ContentManagementView />}

          {activeTab === 'remote_support' && <RemoteSupportCenterView />}

          {activeTab === 'script_automation' && <ScriptAutomationView />}

          {activeTab === 'command_center' && <CommandCenter />}

          {activeTab === 'central_ide' && <CentralIDEAgentMonitor />}

          {activeTab === 'wearables_gateway' && <WearablesGatewayView />}

          {(activeTab === 'rpm' || activeTab === 'rpm_health') && <RPMHealthDashboard />}

          {activeTab === 'geofencing' && <LocationGeofenceView />}

          {activeTab === 'asset_inventory' && <AssetInventoryView />}

          {activeTab === 'firmware' && <FirmwareManager />}

          {activeTab === 'audit' && <AuditTrailView />}

          {activeTab === 'api_sdk' && <ApiSdkExplorer />}

        </main>
      </div>

      {/* QR Code Enrollment Modal */}
      {showQREnrollment && (
        <QREnrollmentModal onClose={() => setShowQREnrollment(false)} />
      )}

      {/* Device Detail & Live Operations Modal */}
      {selectedDevice && (
        <DeviceDetailModal
          device={selectedDevice}
          onClose={() => setSelectedDevice(null)}
        />
      )}

    </div>
  );
};

export default function App() {
  return (
    <DeviceProvider>
      <AppContent />
    </DeviceProvider>
  );
}
