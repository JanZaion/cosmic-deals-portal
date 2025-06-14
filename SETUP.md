# Cosmic Deals Portal Setup Guide

This customer portal integrates with Microsoft Dynamics 365 to display customer cases and their status.

## Prerequisites

1. **Microsoft Dynamics 365 Trial Account**

   - Access to Dynamics 365 Customer Engagement
   - Administrative access to configure API permissions

2. **Azure Active Directory App Registration**
   - You'll need to register an application in Azure AD for authentication

## Setup Steps

### 1. Azure AD App Registration

1. Go to [Azure Portal](https://portal.azure.com)
2. Navigate to **Azure Active Directory** > **App registrations**
3. Click **New registration**
4. Fill in the details:
   - **Name**: `Cosmic Deals Portal`
   - **Supported account types**: Accounts in this organizational directory only
   - **Redirect URI**: Web > `http://localhost:3000`
5. Click **Register**

### 2. Configure API Permissions

After registration:

1. Go to **API permissions** in your app
2. Click **Add a permission**
3. Select **Dynamics CRM**
4. Choose **Delegated permissions**
5. Select `user_impersonation`
6. Click **Add permissions**
7. Click **Grant admin consent** (if you have admin privileges)

### 3. Get Configuration Values

From your app registration, note down:

- **Application (client) ID**
- **Directory (tenant) ID**

From your Dynamics instance:

- **Dynamics URL** (e.g., `https://yourorg.crm.dynamics.com`)

### 4. Environment Configuration

Create a `.env.local` file in the project root with the following:

```bash
# Microsoft Dynamics Configuration
NEXT_PUBLIC_DYNAMICS_URL=https://yourorg.crm.dynamics.com
NEXT_PUBLIC_DYNAMICS_API_VERSION=9.2

# Azure AD Configuration for Authentication
NEXT_PUBLIC_AZURE_AD_CLIENT_ID=your-client-id-here
NEXT_PUBLIC_AZURE_AD_TENANT_ID=your-tenant-id-here
NEXT_PUBLIC_AZURE_AD_REDIRECT_URI=http://localhost:3000
```

Replace the placeholder values with your actual configuration.

### 5. Run the Application

```bash
pnpm dev
```

The application will be available at `http://localhost:3000`.

## Features

- **Microsoft Authentication**: Users sign in with their Microsoft account
- **Cases Dashboard**: Display all customer cases from Dynamics
- **Case Status & State**: Visual indicators for different case states and statuses
- **Priority Indicators**: Color-coded priority levels (High, Normal, Low)
- **Responsive Design**: Works on desktop and mobile devices
- **Real-time Data**: Cases are fetched directly from Dynamics Web API

## Case Status Mapping

The portal maps Dynamics case status codes to user-friendly labels:

- `1`: In Progress
- `2`: On Hold
- `3`: Waiting for Details
- `4`: Researching
- `5`: Problem Solved
- `1000`: Information Provided
- `2000`: Canceled
- `5000`: Merged

## Case State Mapping

The portal also displays case states:

- `0`: Active
- `1`: Resolved
- `2`: Canceled

## Priority Levels

Cases display priority with color coding:

- `1`: High (Red)
- `2`: Normal (Blue)
- `3`: Low (Gray)

## Troubleshooting

### Authentication Issues

- Ensure your app registration has the correct redirect URI
- Verify API permissions are granted
- Check that your tenant ID and client ID are correct

### API Connection Issues

- Verify your Dynamics URL is correct
- Ensure the user has appropriate permissions in Dynamics
- Check browser console for detailed error messages

### No Cases Displayed

- Verify there are cases (incidents) in your Dynamics instance
- Check that the user has permissions to view cases
- The current implementation fetches all cases (you may want to filter by customer)

## Security Notes

- Never commit `.env.local` to version control
- In production, use environment variables or secure configuration management
- Consider implementing additional authorization checks based on your requirements
- The current implementation fetches all cases - you may want to add customer-specific filtering

## Next Steps

To enhance the portal, consider:

1. Adding customer-specific case filtering
2. Implementing case details view with full case description
3. Adding case search and filtering capabilities
4. Integrating with other Dynamics entities (contacts, accounts, knowledge base)
5. Adding case status update functionality (if needed)
6. Implementing case creation functionality for customers
7. Adding file attachments support for cases
