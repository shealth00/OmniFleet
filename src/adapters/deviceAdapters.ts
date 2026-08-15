import { DeviceRecord, DeviceCapabilities, PlatformType, CommandItem, CapabilityType } from '../types/device';

export interface IDeviceAdapter {
  platform: PlatformType;
  getCapabilities(): DeviceCapabilities;
  getCapabilityList(): CapabilityType[];
  hasCapability(cap: CapabilityType): boolean;
  canExecute(command: CommandItem['command']): { supported: boolean; reason?: string };
  formatOsDetails(device: DeviceRecord): string;
  getScreenStreamProfile(): { resolution: string; framerate: number; mode: 'interactive' | 'view_only' | 'restricted' | 'vr_stereo' | 'circular_watch' };
  executeCommand(device: DeviceRecord, command: CommandItem['command'], payload?: Record<string, unknown>): Promise<{ success: boolean; message: string; durationMs: number }>;
}

export class AndroidAdapter implements IDeviceAdapter {
  platform: PlatformType = 'android';

  getCapabilities(): DeviceCapabilities {
    return {
      enrollment: true,
      heartbeat: true,
      screenshot: true,
      liveScreen: true,
      remoteControl: true,
      appLaunch: true,
      kiosk: true,
      mdm: true,
      healthTelemetry: true,
      vrTelemetry: false,
      otaFirmware: true,
      reboot: true,
      shutdown: true,
      bleGatt: true,
      fileTransfer: true,
      scriptExecution: true,
      patchManagement: true,
      geofence: true,
      chat: true,
      capabilitiesList: this.getCapabilityList(),
    };
  }

  getCapabilityList(): CapabilityType[] {
    return [
      'REMOTE_VIEW', 'REMOTE_CONTROL', 'SCREENSHOT', 'SCREEN_RECORDING',
      'WAKE', 'LOCK', 'UNLOCK', 'REBOOT', 'SHUTDOWN', 'WIPE', 'LOCATE', 'RING',
      'APP_INSTALL', 'APP_UNINSTALL', 'APP_UPDATE', 'APP_LAUNCH', 'APP_BLOCK',
      'KIOSK_SINGLE_APP', 'KIOSK_MULTI_APP', 'PROFILE_MANAGEMENT', 'POLICY_MANAGEMENT',
      'CONTENT_PUSH', 'FILE_TRANSFER', 'CHAT', 'LOCATION', 'GEOFENCE',
      'HEALTH_TELEMETRY', 'BLE', 'GATT', 'HEALTH_CONNECT', 'OS_UPDATE', 'FIRMWARE_UPDATE',
      'PATCH_MANAGEMENT', 'SCRIPT_EXECUTION'
    ];
  }

  hasCapability(cap: CapabilityType): boolean {
    return this.getCapabilityList().includes(cap);
  }

  canExecute(command: CommandItem['command']) {
    return { supported: true };
  }

  formatOsDetails(device: DeviceRecord) {
    return `Android ${device.osVersion} • Samsung Knox 3.10 / Device Owner Active`;
  }

  getScreenStreamProfile() {
    return {
      resolution: '1920x1200',
      framerate: 30,
      mode: 'interactive' as const,
    };
  }

  async executeCommand(device: DeviceRecord, command: CommandItem['command'], payload?: Record<string, unknown>) {
    const start = performance.now();
    await new Promise((r) => setTimeout(r, 380 + Math.random() * 200));
    const durationMs = Math.round(performance.now() - start);

    switch (command) {
      case 'launch_app':
        return { success: true, message: `Intent launched: ${(payload?.packageName as string) || 'org.sallyhealth.app'}`, durationMs };
      case 'set_kiosk':
        return { success: true, message: `DeviceOwner LockTaskMode set to ${payload?.enabled ? 'LOCKED' : 'STANDARD'}`, durationMs };
      case 'reboot':
        return { success: true, message: 'DevicePolicyManager.reboot() acknowledged', durationMs };
      case 'capture_screenshot':
        return { success: true, message: 'Display capture frame retrieved (1080p)', durationMs };
      case 'push_config':
        return { success: true, message: 'Managed Configuration payload applied over Enterprise EMM', durationMs };
      case 'ota_update':
        return { success: true, message: `OTA package staging initiated for v${payload?.targetVersion || '2.4.0'}`, durationMs };
      default:
        return { success: true, message: `Command ${command} executed over Knox Device Policy Agent`, durationMs };
    }
  }
}

export class WearOSAdapter implements IDeviceAdapter {
  platform: PlatformType = 'wearos';

  getCapabilities(): DeviceCapabilities {
    return {
      enrollment: true,
      heartbeat: true,
      screenshot: true,
      liveScreen: false, // Wear OS has limited live streaming to save battery & thermal
      remoteControl: false,
      appLaunch: true,
      kiosk: true,
      mdm: true,
      healthTelemetry: true,
      vrTelemetry: false,
      otaFirmware: true,
      reboot: true,
      shutdown: false,
      bleGatt: true,
      fileTransfer: false,
      scriptExecution: true,
      patchManagement: true,
      geofence: true,
      chat: false,
      capabilitiesList: this.getCapabilityList(),
    };
  }

  getCapabilityList(): CapabilityType[] {
    return [
      'SCREENSHOT', 'WAKE', 'LOCK', 'UNLOCK', 'REBOOT', 'LOCATE', 'RING',
      'APP_INSTALL', 'APP_UPDATE', 'APP_LAUNCH', 'KIOSK_SINGLE_APP',
      'PROFILE_MANAGEMENT', 'POLICY_MANAGEMENT', 'LOCATION', 'GEOFENCE',
      'HEALTH_TELEMETRY', 'BLE', 'GATT', 'HEALTH_CONNECT', 'OS_UPDATE', 'FIRMWARE_UPDATE',
      'PATCH_MANAGEMENT', 'SCRIPT_EXECUTION'
    ];
  }

  hasCapability(cap: CapabilityType): boolean {
    return this.getCapabilityList().includes(cap);
  }

  canExecute(command: CommandItem['command']) {
    if ((command as string) === 'liveScreen' || (command as string) === 'remote_control') {
      return { supported: false, reason: 'Interactive live remote control disabled on Wear OS to preserve battery life and thermal stability' };
    }
    if (command === 'shutdown') {
      return { supported: false, reason: 'Remote hard shutdown restricted by Wear OS Companion policy' };
    }
    return { supported: true };
  }

  formatOsDetails(device: DeviceRecord) {
    return `Wear OS 5.0 (Android 14) • One UI 6 Watch • BLE 5.3 Active`;
  }

  getScreenStreamProfile() {
    return {
      resolution: '480x480 (Circular)',
      framerate: 5,
      mode: 'circular_watch' as const,
    };
  }

  async executeCommand(device: DeviceRecord, command: CommandItem['command'], payload?: Record<string, unknown>) {
    const start = performance.now();
    await new Promise((r) => setTimeout(r, 450 + Math.random() * 250));
    const durationMs = Math.round(performance.now() - start);

    switch (command) {
      case 'launch_app':
        return { success: true, message: `Wearable Companion launched: ${(payload?.packageName as string) || 'org.sallyhealth.rpm.watch'}`, durationMs };
      case 'sync_mdm':
        return { success: true, message: 'Wearable Companion synced with GATT Clinical Gateway', durationMs };
      case 'wake':
        return { success: true, message: 'Display ambient mode toggled to Active Screen', durationMs };
      case 'reboot':
        return { success: true, message: 'Wear OS Watch restarted via Companion BLE Channel', durationMs };
      case 'capture_screenshot':
        return { success: true, message: 'Circular frame buffer captured via ADB-over-Bluetooth', durationMs };
      default:
        return { success: true, message: `Wearable command ${command} executed via BLE Bridge`, durationMs };
    }
  }
}

export class IOSAdapter implements IDeviceAdapter {
  platform: PlatformType = 'ios';

  getCapabilities(): DeviceCapabilities {
    return {
      enrollment: true,
      heartbeat: true,
      screenshot: true,
      liveScreen: false, // Apple MDM limitations
      remoteControl: false, // Restricted by Apple sandbox
      appLaunch: true, // Managed app launch / Autonomous Single App Mode
      kiosk: true, // Guided Access / Single App Mode
      mdm: true,
      healthTelemetry: true, // Via HealthKit sync app
      vrTelemetry: false,
      otaFirmware: true, // Supervised iOS update
      reboot: true,
      shutdown: true,
      bleGatt: true,
      fileTransfer: false,
      scriptExecution: false,
      patchManagement: true,
      geofence: true,
      chat: true,
      capabilitiesList: this.getCapabilityList(),
    };
  }

  getCapabilityList(): CapabilityType[] {
    return [
      'SCREENSHOT', 'WAKE', 'LOCK', 'UNLOCK', 'REBOOT', 'SHUTDOWN', 'WIPE', 'LOCATE',
      'APP_INSTALL', 'APP_UNINSTALL', 'APP_UPDATE', 'APP_LAUNCH', 'APP_BLOCK',
      'KIOSK_SINGLE_APP', 'PROFILE_MANAGEMENT', 'POLICY_MANAGEMENT', 'CONTENT_PUSH',
      'CHAT', 'LOCATION', 'GEOFENCE', 'HEALTH_TELEMETRY', 'BLE', 'GATT',
      'OS_UPDATE', 'PATCH_MANAGEMENT'
    ];
  }

  hasCapability(cap: CapabilityType): boolean {
    return this.getCapabilityList().includes(cap);
  }

  canExecute(command: CommandItem['command']) {
    if ((command as string) === 'liveScreen' || (command as string) === 'remoteControl') {
      return { supported: false, reason: 'Restricted by Apple iOS sandbox & MDM privacy framework' };
    }
    return { supported: true };
  }

  formatOsDetails(device: DeviceRecord) {
    return `iOS ${device.osVersion} • Supervised (Apple Business Manager / ADE)`;
  }

  getScreenStreamProfile() {
    return {
      resolution: '2556x1179',
      framerate: 1,
      mode: 'restricted' as const,
    };
  }

  async executeCommand(device: DeviceRecord, command: CommandItem['command'], payload?: Record<string, unknown>) {
    const start = performance.now();
    await new Promise((r) => setTimeout(r, 500 + Math.random() * 200));
    const durationMs = Math.round(performance.now() - start);

    switch (command) {
      case 'set_kiosk':
        return { success: true, message: 'Single App Mode profile pushed via Apple MDM Push Service (APNs)', durationMs };
      case 'reboot':
        return { success: true, message: 'DeviceConfigurator MDM Restart command delivered via APNs', durationMs };
      case 'ota_update':
        return { success: true, message: `Managed iOS OTA update command scheduled for build ${payload?.targetVersion || '18.1'}`, durationMs };
      case 'lock':
        return { success: true, message: 'LostMode / Remote Lock activated', durationMs };
      default:
        return { success: true, message: `Apple MDM command ${command} executed via APNs`, durationMs };
    }
  }
}

export class IPadOSAdapter implements IDeviceAdapter {
  platform: PlatformType = 'ipados';

  getCapabilities(): DeviceCapabilities {
    return {
      enrollment: true,
      heartbeat: true,
      screenshot: true,
      liveScreen: false,
      remoteControl: false,
      appLaunch: true,
      kiosk: true,
      mdm: true,
      healthTelemetry: true,
      vrTelemetry: false,
      otaFirmware: true,
      reboot: true,
      shutdown: true,
      bleGatt: true,
      fileTransfer: false,
      scriptExecution: false,
      patchManagement: true,
      geofence: true,
      chat: true,
      capabilitiesList: this.getCapabilityList(),
    };
  }

  getCapabilityList(): CapabilityType[] {
    return [
      'SCREENSHOT', 'WAKE', 'LOCK', 'UNLOCK', 'REBOOT', 'SHUTDOWN', 'WIPE', 'LOCATE',
      'APP_INSTALL', 'APP_UNINSTALL', 'APP_UPDATE', 'APP_LAUNCH', 'APP_BLOCK',
      'KIOSK_SINGLE_APP', 'PROFILE_MANAGEMENT', 'POLICY_MANAGEMENT', 'CONTENT_PUSH',
      'CHAT', 'LOCATION', 'GEOFENCE', 'HEALTH_TELEMETRY', 'BLE', 'GATT',
      'OS_UPDATE', 'PATCH_MANAGEMENT'
    ];
  }

  hasCapability(cap: CapabilityType): boolean {
    return this.getCapabilityList().includes(cap);
  }

  canExecute(command: CommandItem['command']) {
    if ((command as string) === 'liveScreen' || (command as string) === 'remoteControl') {
      return { supported: false, reason: 'Restricted by Apple iPadOS supervision policy' };
    }
    return { supported: true };
  }

  formatOsDetails(device: DeviceRecord) {
    return `iPadOS ${device.osVersion} • Supervised (Apple Business Manager)`;
  }

  getScreenStreamProfile() {
    return {
      resolution: '2732x2048',
      framerate: 1,
      mode: 'restricted' as const,
    };
  }

  async executeCommand(device: DeviceRecord, command: CommandItem['command'], payload?: Record<string, unknown>) {
    const start = performance.now();
    await new Promise((r) => setTimeout(r, 450));
    return { success: true, message: `iPadOS APNs profile dispatch for ${command}`, durationMs: Math.round(performance.now() - start) };
  }
}

export class MacOSAdapter implements IDeviceAdapter {
  platform: PlatformType = 'macos';

  getCapabilities(): DeviceCapabilities {
    return {
      enrollment: true,
      heartbeat: true,
      screenshot: true,
      liveScreen: true,
      remoteControl: true,
      appLaunch: true,
      kiosk: false,
      mdm: true,
      healthTelemetry: false,
      vrTelemetry: false,
      otaFirmware: true,
      reboot: true,
      shutdown: true,
      bleGatt: false,
      fileTransfer: true,
      scriptExecution: true,
      patchManagement: true,
      geofence: true,
      chat: true,
      capabilitiesList: this.getCapabilityList(),
    };
  }

  getCapabilityList(): CapabilityType[] {
    return [
      'REMOTE_VIEW', 'REMOTE_CONTROL', 'SCREENSHOT', 'SCREEN_RECORDING',
      'WAKE', 'LOCK', 'UNLOCK', 'REBOOT', 'SHUTDOWN', 'WIPE', 'LOCATE',
      'APP_INSTALL', 'APP_UNINSTALL', 'APP_UPDATE', 'APP_LAUNCH', 'APP_BLOCK',
      'PROFILE_MANAGEMENT', 'POLICY_MANAGEMENT', 'CONTENT_PUSH', 'FILE_TRANSFER', 'CHAT',
      'LOCATION', 'GEOFENCE', 'OS_UPDATE', 'PATCH_MANAGEMENT', 'SCRIPT_EXECUTION'
    ];
  }

  hasCapability(cap: CapabilityType): boolean {
    return this.getCapabilityList().includes(cap);
  }

  canExecute(command: CommandItem['command']) {
    return { supported: true };
  }

  formatOsDetails(device: DeviceRecord) {
    return `macOS Sonoma ${device.osVersion} (Apple Silicon M3) • MDM Daemon Active`;
  }

  getScreenStreamProfile() {
    return {
      resolution: '2880x1800',
      framerate: 30,
      mode: 'interactive' as const,
    };
  }

  async executeCommand(device: DeviceRecord, command: CommandItem['command'], payload?: Record<string, unknown>) {
    const start = performance.now();
    await new Promise((r) => setTimeout(r, 400));
    return { success: true, message: `macOS Management Agent executed ${command}`, durationMs: Math.round(performance.now() - start) };
  }
}

export class WindowsAdapter implements IDeviceAdapter {
  platform: PlatformType = 'windows';

  getCapabilities(): DeviceCapabilities {
    return {
      enrollment: true,
      heartbeat: true,
      screenshot: true,
      liveScreen: true,
      remoteControl: true,
      appLaunch: true,
      kiosk: true, // Windows Assigned Access
      mdm: true, // Intune / WMI / Device Bridge
      healthTelemetry: false,
      vrTelemetry: false,
      otaFirmware: true, // Windows Update / MSI package push
      reboot: true,
      shutdown: true,
      bleGatt: false,
      fileTransfer: true,
      scriptExecution: true,
      patchManagement: true,
      geofence: false,
      chat: true,
      capabilitiesList: this.getCapabilityList(),
    };
  }

  getCapabilityList(): CapabilityType[] {
    return [
      'REMOTE_VIEW', 'REMOTE_CONTROL', 'SCREENSHOT', 'SCREEN_RECORDING',
      'WAKE', 'LOCK', 'UNLOCK', 'REBOOT', 'SHUTDOWN', 'WIPE',
      'APP_INSTALL', 'APP_UNINSTALL', 'APP_UPDATE', 'APP_LAUNCH', 'APP_BLOCK',
      'KIOSK_SINGLE_APP', 'KIOSK_MULTI_APP', 'PROFILE_MANAGEMENT', 'POLICY_MANAGEMENT',
      'CONTENT_PUSH', 'FILE_TRANSFER', 'CHAT', 'OS_UPDATE', 'PATCH_MANAGEMENT', 'SCRIPT_EXECUTION'
    ];
  }

  hasCapability(cap: CapabilityType): boolean {
    return this.getCapabilityList().includes(cap);
  }

  canExecute(command: CommandItem['command']) {
    return { supported: true };
  }

  formatOsDetails(device: DeviceRecord) {
    return `Windows 11 Enterprise (23H2) • WMI Endpoint Central Agent Active`;
  }

  getScreenStreamProfile() {
    return {
      resolution: '2560x1440',
      framerate: 30,
      mode: 'interactive' as const,
    };
  }

  async executeCommand(device: DeviceRecord, command: CommandItem['command'], payload?: Record<string, unknown>) {
    const start = performance.now();
    await new Promise((r) => setTimeout(r, 350 + Math.random() * 150));
    const durationMs = Math.round(performance.now() - start);

    switch (command) {
      case 'launch_app':
        return { success: true, message: `Process spawned: ${(payload?.packageName as string) || 'SallyWorkstation.exe'}`, durationMs };
      case 'set_kiosk':
        return { success: true, message: 'Windows Assigned Access Shell launcher applied', durationMs };
      case 'reboot':
        return { success: true, message: 'Windows shutdown.exe -r -t 0 executed', durationMs };
      case 'ota_update':
        return { success: true, message: `Silent MSI deployment package queued for target ${payload?.targetVersion || '3.1.2'}`, durationMs };
      default:
        return { success: true, message: `Windows WMI Agent executed ${command}`, durationMs };
    }
  }
}

export class ChromeOSAdapter implements IDeviceAdapter {
  platform: PlatformType = 'chromeos';

  getCapabilities(): DeviceCapabilities {
    return {
      enrollment: true,
      heartbeat: true,
      screenshot: true,
      liveScreen: true,
      remoteControl: true,
      appLaunch: true,
      kiosk: true,
      mdm: true,
      healthTelemetry: false,
      vrTelemetry: false,
      otaFirmware: true,
      reboot: true,
      shutdown: true,
      bleGatt: false,
      fileTransfer: false,
      scriptExecution: false,
      patchManagement: true,
      geofence: true,
      chat: true,
      capabilitiesList: this.getCapabilityList(),
    };
  }

  getCapabilityList(): CapabilityType[] {
    return [
      'REMOTE_VIEW', 'REMOTE_CONTROL', 'SCREENSHOT', 'WAKE', 'LOCK', 'UNLOCK', 'REBOOT', 'SHUTDOWN', 'WIPE', 'LOCATE',
      'APP_INSTALL', 'APP_UNINSTALL', 'APP_UPDATE', 'APP_LAUNCH', 'APP_BLOCK',
      'KIOSK_SINGLE_APP', 'PROFILE_MANAGEMENT', 'POLICY_MANAGEMENT', 'LOCATION', 'GEOFENCE',
      'OS_UPDATE', 'PATCH_MANAGEMENT'
    ];
  }

  hasCapability(cap: CapabilityType): boolean {
    return this.getCapabilityList().includes(cap);
  }

  canExecute(command: CommandItem['command']) {
    return { supported: true };
  }

  formatOsDetails(device: DeviceRecord) {
    return `ChromeOS Enterprise v128 • Google Admin Console Managed`;
  }

  getScreenStreamProfile() {
    return {
      resolution: '1920x1080',
      framerate: 24,
      mode: 'interactive' as const,
    };
  }

  async executeCommand(device: DeviceRecord, command: CommandItem['command'], payload?: Record<string, unknown>) {
    const start = performance.now();
    await new Promise((r) => setTimeout(r, 380));
    return { success: true, message: `ChromeOS Admin API dispatched ${command}`, durationMs: Math.round(performance.now() - start) };
  }
}

export class QuestAdapter implements IDeviceAdapter {
  platform: PlatformType = 'quest';

  getCapabilities(): DeviceCapabilities {
    return {
      enrollment: true,
      heartbeat: true,
      screenshot: true,
      liveScreen: true,
      remoteControl: false,
      appLaunch: true,
      kiosk: true, // Meta Quest for Business Kiosk
      mdm: true,
      healthTelemetry: true, // VR physical therapy / Range-of-motion metrics
      vrTelemetry: true,
      otaFirmware: true,
      reboot: true,
      shutdown: true,
      bleGatt: true,
      fileTransfer: true,
      scriptExecution: true,
      patchManagement: true,
      geofence: false,
      chat: false,
      capabilitiesList: this.getCapabilityList(),
    };
  }

  getCapabilityList(): CapabilityType[] {
    return [
      'REMOTE_VIEW', 'SCREENSHOT', 'SCREEN_RECORDING', 'WAKE', 'LOCK', 'UNLOCK', 'REBOOT', 'SHUTDOWN',
      'APP_INSTALL', 'APP_UNINSTALL', 'APP_UPDATE', 'APP_LAUNCH', 'APP_BLOCK',
      'KIOSK_SINGLE_APP', 'PROFILE_MANAGEMENT', 'POLICY_MANAGEMENT', 'CONTENT_PUSH', 'FILE_TRANSFER',
      'HEALTH_TELEMETRY', 'BLE', 'GATT', 'OS_UPDATE', 'FIRMWARE_UPDATE', 'PATCH_MANAGEMENT', 'SCRIPT_EXECUTION'
    ];
  }

  hasCapability(cap: CapabilityType): boolean {
    return this.getCapabilityList().includes(cap);
  }

  canExecute(command: CommandItem['command']) {
    if ((command as string) === 'remoteControl') {
      return { supported: false, reason: '6DOF spatial tracking prevents direct mouse emulation; stream view only' };
    }
    return { supported: true };
  }

  formatOsDetails(device: DeviceRecord) {
    return `Meta Quest OS v68 (Android 12 VR) • Meta Quest for Business MDM`;
  }

  getScreenStreamProfile() {
    return {
      resolution: '1832x1920 per eye',
      framerate: 60,
      mode: 'vr_stereo' as const,
    };
  }

  async executeCommand(device: DeviceRecord, command: CommandItem['command'], payload?: Record<string, unknown>) {
    const start = performance.now();
    await new Promise((r) => setTimeout(r, 450 + Math.random() * 200));
    const durationMs = Math.round(performance.now() - start);

    switch (command) {
      case 'launch_app':
        return { success: true, message: `VR Spatial Therapy Experience launched: ${(payload?.packageName as string) || 'com.sallyhealth.vr.therapy'}`, durationMs };
      case 'set_kiosk':
        return { success: true, message: 'Meta Quest Enterprise Kiosk Mode locked to rehabilitation environment', durationMs };
      case 'reboot':
        return { success: true, message: 'Headset reboot sequence initiated over MDM', durationMs };
      default:
        return { success: true, message: `Meta Quest Admin command ${command} executed`, durationMs };
    }
  }
}

export class IOTAdapter implements IDeviceAdapter {
  platform: PlatformType = 'iot';

  getCapabilities(): DeviceCapabilities {
    return {
      enrollment: true,
      heartbeat: true,
      screenshot: false,
      liveScreen: false,
      remoteControl: false,
      appLaunch: false,
      kiosk: false,
      mdm: true,
      healthTelemetry: true,
      vrTelemetry: false,
      otaFirmware: true,
      reboot: true,
      shutdown: true,
      bleGatt: true,
      fileTransfer: true,
      scriptExecution: true,
      patchManagement: true,
      geofence: false,
      chat: false,
      capabilitiesList: this.getCapabilityList(),
    };
  }

  getCapabilityList(): CapabilityType[] {
    return [
      'REBOOT', 'SHUTDOWN', 'PROFILE_MANAGEMENT', 'POLICY_MANAGEMENT', 'FILE_TRANSFER',
      'HEALTH_TELEMETRY', 'BLE', 'GATT', 'FIRMWARE_UPDATE', 'PATCH_MANAGEMENT', 'SCRIPT_EXECUTION'
    ];
  }

  hasCapability(cap: CapabilityType): boolean {
    return this.getCapabilityList().includes(cap);
  }

  canExecute(command: CommandItem['command']) {
    if (command === 'capture_screenshot' || (command as string) === 'liveScreen' || command === 'set_kiosk') {
      return { supported: false, reason: 'Headless IoT Gateway has no graphical display subsystem' };
    }
    return { supported: true };
  }

  formatOsDetails(device: DeviceRecord) {
    return `Yocto Embedded Linux 6.1 • Edge BLE Gateway Daemon v4.2`;
  }

  getScreenStreamProfile() {
    return {
      resolution: 'Headless / No Display',
      framerate: 0,
      mode: 'restricted' as const,
    };
  }

  async executeCommand(device: DeviceRecord, command: CommandItem['command'], payload?: Record<string, unknown>) {
    const start = performance.now();
    await new Promise((r) => setTimeout(r, 320));
    return { success: true, message: `MQTT command published to IoT gateway topic: ${command}`, durationMs: Math.round(performance.now() - start) };
  }
}

export class CustomAdapter implements IDeviceAdapter {
  platform: PlatformType = 'custom';

  getCapabilities(): DeviceCapabilities {
    return {
      enrollment: true,
      heartbeat: true,
      screenshot: true,
      liveScreen: true,
      remoteControl: true,
      appLaunch: true,
      kiosk: true,
      mdm: true,
      healthTelemetry: true,
      vrTelemetry: false,
      otaFirmware: true,
      reboot: true,
      shutdown: true,
      bleGatt: true,
      fileTransfer: true,
      scriptExecution: true,
      patchManagement: true,
      geofence: true,
      chat: true,
      capabilitiesList: this.getCapabilityList(),
    };
  }

  getCapabilityList(): CapabilityType[] {
    return [
      'REMOTE_VIEW', 'REMOTE_CONTROL', 'SCREENSHOT', 'SCREEN_RECORDING',
      'WAKE', 'LOCK', 'UNLOCK', 'REBOOT', 'SHUTDOWN', 'WIPE', 'LOCATE', 'RING',
      'APP_INSTALL', 'APP_UNINSTALL', 'APP_UPDATE', 'APP_LAUNCH', 'APP_BLOCK',
      'KIOSK_SINGLE_APP', 'KIOSK_MULTI_APP', 'PROFILE_MANAGEMENT', 'POLICY_MANAGEMENT',
      'CONTENT_PUSH', 'FILE_TRANSFER', 'CHAT', 'LOCATION', 'GEOFENCE',
      'HEALTH_TELEMETRY', 'BLE', 'GATT', 'HEALTH_CONNECT', 'OS_UPDATE', 'FIRMWARE_UPDATE',
      'PATCH_MANAGEMENT', 'SCRIPT_EXECUTION'
    ];
  }

  hasCapability(cap: CapabilityType): boolean {
    return this.getCapabilityList().includes(cap);
  }

  canExecute(command: CommandItem['command']) {
    return { supported: true };
  }

  formatOsDetails(device: DeviceRecord) {
    return `Custom Platform SDK (${device.osVersion}) • Generic Agent Protocol v2.1`;
  }

  getScreenStreamProfile() {
    return {
      resolution: '1920x1080',
      framerate: 24,
      mode: 'interactive' as const,
    };
  }

  async executeCommand(device: DeviceRecord, command: CommandItem['command'], payload?: Record<string, unknown>) {
    const start = performance.now();
    await new Promise((r) => setTimeout(r, 380));
    return { success: true, message: `Generic Agent REST webhook ACK for command ${command}`, durationMs: Math.round(performance.now() - start) };
  }
}

export const adapterRegistry: Record<PlatformType, IDeviceAdapter> = {
  android: new AndroidAdapter(),
  wearos: new WearOSAdapter(),
  ios: new IOSAdapter(),
  ipados: new IPadOSAdapter(),
  macos: new MacOSAdapter(),
  windows: new WindowsAdapter(),
  chromeos: new ChromeOSAdapter(),
  quest: new QuestAdapter(),
  custom: new CustomAdapter(),
  iot: new IOTAdapter(),
};

export function getDeviceAdapter(platform: PlatformType): IDeviceAdapter {
  return adapterRegistry[platform] || adapterRegistry.android;
}
