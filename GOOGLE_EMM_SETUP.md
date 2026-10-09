# Google EMM Integration Setup Guide

This guide walks you through setting up Google Enterprise Mobility Management (EMM) integration with OmniFleet, enabling centralized device management and control across your organization.

## Prerequisites

- A Google Workspace account with admin access
- Google Cloud Project with billing enabled
- Administrative access to configure OAuth 2.0 credentials

## Step 1: Create a Google Cloud Project

1. Go to [Google Cloud Console](https://console.cloud.google.com)
2. Click on the project dropdown at the top and select **New Project**
3. Enter a project name (e.g., "OmniFleet EMM")
4. Click **Create**

## Step 2: Enable Required APIs

1. In Google Cloud Console, go to **APIs & Services** > **Library**
2. Search for and enable the following APIs:
   - **Android Management API** - For device management
   - **Google Workspace Admin API** - For enterprise management
   - **Cloud Logging API** - For audit logs

To enable an API:
- Click on the API name
- Click **Enable**

## Step 3: Create OAuth 2.0 Credentials

1. Go to **APIs & Services** > **Credentials**
2. Click **Create Credentials** > **OAuth 2.0 Client IDs**
3. If prompted, click **Configure OAuth Consent Screen**
   - Choose **Internal** (for organizations) or **External** (for public access)
   - Fill in the application details:
     - App name: "OmniFleet EMM Integration"
     - User support email: Your email
     - Developer contact: Your email
   - Click **Save and Continue**
4. For scopes, add the following:
   - `https://www.googleapis.com/auth/androidmanagement`
   - `https://www.googleapis.com/auth/admin.directory.organization`
   - `https://www.googleapis.com/auth/admin.directory.device.mobile`
5. Click **Save and Continue**, then **Back to Dashboard**

6. Return to **Credentials** and click **Create Credentials** > **OAuth 2.0 Client IDs**
7. Select **Web application**
8. Under **Authorized redirect URIs**, add:
   - `http://localhost:3000/api/emm/oauth/callback` (development)
   - `https://your-production-domain.com/api/emm/oauth/callback` (production)
9. Click **Create**
10. A dialog will show your **Client ID** and **Client Secret**
    - Copy and save these securely

## Step 4: Get Your Project ID

1. In Google Cloud Console, click the project dropdown
2. Your **Project ID** appears in the list below the project name
3. Copy and save this ID

## Step 5: Configure OmniFleet Environment Variables

1. Copy `.env.example` to `.env`:
   ```bash
   cp .env.example .env
   ```

2. Edit `.env` and add your Google credentials:
   ```env
   GOOGLE_CLIENT_ID="your-client-id-here"
   GOOGLE_CLIENT_SECRET="your-client-secret-here"
   GOOGLE_PROJECT_ID="your-project-id-here"
   GOOGLE_REDIRECT_URI="http://localhost:3000/api/emm/oauth/callback"
   ```

3. Save the file (never commit `.env` to version control)

## Step 6: Set Up EMM in Google Workspace Admin

1. Go to [Google Workspace Admin Console](https://admin.google.com)
2. Navigate to **Devices and settings** > **Mobile & endpoint management**
3. Review the available device management options:
   - **Mobile devices** - Android and iOS
   - **Endpoints** - Windows, Mac, Linux computers
   - **ChromeOS devices** - Chromebook management
   - **Managed browsers** - Chrome Browser Cloud Management

## Step 7: Test the Integration

1. Start the OmniFleet backend:
   ```bash
   npm install
   node server.js
   ```

2. Start the frontend (in another terminal):
   ```bash
   npm run dev
   ```

3. Open your browser to `http://localhost:3000`

4. Navigate to **Google EMM Integration** in the sidebar

5. Click **Connect Google Account** to initiate OAuth flow

6. You'll be redirected to Google's login and consent screen

7. Grant permission for OmniFleet to access EMM

8. After successful authentication, you should see:
   - Connection status showing "Connected"
   - Your enrolled enterprises
   - Available EMM features

## Step 8: Enroll Test Devices

### For Android Devices:

1. In **Google Workspace Admin Console**, go to **Devices and settings** > **Mobile & endpoint management** > **Mobile devices**
2. You should see any enrolled Android devices
3. Generate an enrollment token in OmniFleet:
   - Go to **Enrollment & Provisioning** tab
   - Click **Generate Token**
   - Copy the QR code or token value
4. On your Android device, go to your device setup or Google Account settings
5. Add your Workspace account and follow zero-touch enrollment prompts

### For Chrome OS Devices:

1. In **Google Workspace Admin Console**, go to **Devices and settings** > **Mobile & endpoint management** > **ChromeOS devices**
2. Register your organization using the provided registration token
3. During device setup, sign in with your Workspace account
4. The device will automatically be enrolled

### For Windows/Mac/Linux:

1. Go to **Chrome Browser Cloud Management** in Admin Console
2. Follow enrollment steps for your device's operating system
3. Sign into Chrome with your Workspace account

## Step 9: Use Centralized Device Control

Once devices are enrolled:

1. Navigate to **Centralized Device Control** in the sidebar
2. Go to the **Device Overview** tab to see all enrolled devices
3. Use the **Remote Control** tab to:
   - Reboot devices
   - Lock devices
   - Wipe device data
   - Update policies
4. Use the **App Deployment** tab to push apps and policies

## Troubleshooting

### OAuth Connection Fails
- Verify your Client ID and Client Secret are correct
- Check that your redirect URI matches exactly in both OmniFleet config and Google Cloud Console
- Ensure the OAuth consent screen is configured properly

### No Devices Showing
- Verify devices are actually enrolled in Google EMM
- Check that your Workspace account has proper admin permissions
- Ensure Android Management API is enabled in Google Cloud

### Permission Errors
- In Google Workspace Admin Console, verify your account has EMM admin role
- Re-authenticate by disconnecting and reconnecting EMM integration

### Enrollment Issues
- Check device network connectivity
- Verify device OS supports EMM enrollment:
  - Android 5.0+ for Android EMM
  - Windows 10+ for Chrome Browser Cloud Management
  - macOS 10.12+ for Chrome Browser Cloud Management

## Security Considerations

1. **Never commit credentials to version control**
   - Keep `.env` file in `.gitignore`
   - Use environment variables in production

2. **Use HTTPS in production**
   - Update `GOOGLE_REDIRECT_URI` to use HTTPS
   - Configure proper SSL certificates

3. **Implement proper access controls**
   - Restrict EMM integration access to authorized administrators
   - Use role-based access control (RBAC)

4. **Monitor audit logs**
   - Review Google EMM audit logs regularly
   - Check OmniFleet's Audit Trail for device management activities

## Next Steps

- Configure device policies in **Profiles & Policies** tab
- Set up compliance rules in **Compliance & Remediation** tab
- Create device groups in **Groups & Dynamic Rules** for targeted deployments
- Monitor device health in **Fleet Dashboard**

## Additional Resources

- [Google Android Management API Documentation](https://developers.google.com/android/management/guides)
- [Google Workspace Admin Help](https://support.google.com/a)
- [OmniFleet Documentation](https://github.com/shealth00/OmniFleet)
