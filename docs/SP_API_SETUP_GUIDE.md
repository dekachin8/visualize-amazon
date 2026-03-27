# Amazon SP-API Setup Guide for VISUALIZE Sports

*Last Updated: March 26, 2026*

This guide walks you through setting up Amazon Selling Partner API (SP-API) access for the VISUALIZE Sports dashboard. Follow these steps in order when you have access to Seller Central.

---

## Table of Contents

1. [Prerequisites](#prerequisites)
2. [Step 1: Register as a Private Developer](#step-1-register-as-a-private-developer)
3. [Step 2: Create Your SP-API Application](#step-2-create-your-sp-api-application)
4. [Step 3: Self-Authorize Your Application](#step-3-self-authorize-your-application)
5. [Step 4: Obtain Your Credentials](#step-4-obtain-your-credentials)
6. [Step 5: Test Your Connection](#step-5-test-your-connection)
7. [Troubleshooting](#troubleshooting)
8. [Credential Reference](#credential-reference)

---

## Prerequisites

Before starting, ensure you have:

- [ ] Active Amazon Seller Central account (Professional selling plan)
- [ ] Admin access to the seller account
- [ ] Email verification completed in Seller Central
- [ ] **Note:** You do NOT need an AWS account for basic SP-API access (this changed in 2023)

---

## Step 1: Register as a Private Developer

Since VISUALIZE is building an internal dashboard (not a public app), you'll register as a **Private Developer**.

### 1.1 Access Developer Central

1. Log into [Seller Central](https://sellercentral.amazon.com)
2. Go to **Partner Network** → **Develop Apps** (or navigate directly to [Developer Central](https://developer.amazonservices.com))
3. Click **Register as a developer**

### 1.2 Complete Developer Profile

Fill in the required information:

| Field | What to Enter |
|-------|---------------|
| **Developer Name** | `VISUALIZE Sports` or `JKS International LLC` |
| **Primary Contact Email** | Your business email |
| **Data Protection Officer** | Your name/email (required for data protection) |
| **Privacy Policy URL** | Can be your company website + `/privacy` |

### 1.3 Select Developer Type

- Choose: **Private developer**
- This is for applications that access only your own seller data
- Approval is typically instant for private developers

### 1.4 Accept Agreements

Read and accept:
- Developer Central Data Protection Policy
- Amazon Services API Developer Agreement

---

## Step 2: Create Your SP-API Application

### 2.1 Register New Application

1. In Developer Central, click **Add new app client**
2. Fill in application details:

| Field | Value |
|-------|-------|
| **App name** | `VISUALIZE Dashboard` |
| **API Type** | `SP API` |
| **App purpose** | Describe: "Internal dashboard for sales, inventory, and advertising analytics" |

### 2.2 Select API Roles

Request access to the roles you need. For the VISUALIZE dashboard, select:

| Role | Purpose |
|------|---------|
| **Pricing** | View current prices and fees |
| **Inventory and Order Management** | Read orders and inventory levels |
| **Product Listing** | Read product catalog data |
| **Reports** | Generate and download reports |
| **Direct-to-Consumer Shipping** | View shipping info (if needed) |

⚠️ **Important:** Only request roles you actually need. More roles = longer approval time for public apps (not an issue for private apps).

### 2.3 Application Credentials

After creating the app, you'll see your **LWA credentials**:

- **Client Identifier** (also called `lwa_app_id` or `client_id`)
- **Client Secret** (also called `lwa_client_secret`)

🔐 **SAVE THESE IMMEDIATELY** - The client secret is only shown once!

---

## Step 3: Self-Authorize Your Application

For private applications, you "self-authorize" to grant the app access to your seller data.

### 3.1 Navigate to Authorize

1. In Seller Central, go to **Partner Network** → **Manage Your Apps**
2. Find your application (`VISUALIZE Dashboard`)
3. Click **Authorize**

### 3.2 Generate Refresh Token

1. Click **Generate refresh token**
2. You'll be shown a **Refresh Token** - this is the key that grants ongoing access

🔐 **SAVE THIS TOKEN** - It's only shown once!

The refresh token:
- Does NOT expire (unless you revoke it)
- Is used to generate short-lived access tokens
- Must be kept secure like a password

---

## Step 4: Obtain Your Credentials

After completing steps 1-3, you should have these credentials:

### Required Credentials Checklist

| Credential | Where to Find | Format Example |
|------------|---------------|----------------|
| **Client ID** | Developer Central → App Details | `amzn1.application-oa2-client.xxxx...` |
| **Client Secret** | Developer Central (saved at creation) | Long alphanumeric string |
| **Refresh Token** | Seller Central → Manage Apps → Authorize | `Atzr\|xxxx...` (starts with `Atzr|`) |
| **Seller ID** | Seller Central → Account Info → Your Seller Profile | `AXXXXXXXXXX` (alphanumeric) |
| **Marketplace ID** | Use reference table below | `ATVPDKIKX0DER` (for US) |

### US Marketplace IDs

| Marketplace | Marketplace ID |
|-------------|---------------|
| **United States** | `ATVPDKIKX0DER` |
| Canada | `A2EUQ1WTGCTBG2` |
| Mexico | `A1AM78C64UM0Y8` |

---

## Step 5: Test Your Connection

### 5.1 Quick Test with Python

```bash
# Install the SP-API Python library
pip install python-amazon-sp-api
```

Create a test file `test_connection.py`:

```python
from sp_api.api import Sellers
from sp_api.base import Marketplaces

# Your credentials
credentials = dict(
    refresh_token='YOUR_REFRESH_TOKEN',
    lwa_app_id='YOUR_CLIENT_ID',
    lwa_client_secret='YOUR_CLIENT_SECRET',
)

# Test connection
try:
    sellers = Sellers(credentials=credentials, marketplace=Marketplaces.US)
    result = sellers.get_marketplace_participations()
    print("✅ Connection successful!")
    print(f"Marketplace participations: {result.payload}")
except Exception as e:
    print(f"❌ Connection failed: {e}")
```

### 5.2 Expected Output

If successful, you'll see:
```
✅ Connection successful!
Marketplace participations: {'payload': [...]}
```

---

## Troubleshooting

### Common Errors and Solutions

#### Error: `Invalid grant`
- **Cause:** Refresh token is invalid or expired
- **Solution:** Generate a new refresh token in Seller Central → Manage Apps

#### Error: `Access denied`
- **Cause:** App doesn't have required roles
- **Solution:** Edit your app in Developer Central and add missing roles

#### Error: `The request signature we calculated does not match`
- **Cause:** Incorrect credentials or encoding issues
- **Solution:** Double-check copy/paste of credentials (no extra spaces)

#### Error: `Application is not authorized`
- **Cause:** You haven't self-authorized the app yet
- **Solution:** Go to Seller Central → Manage Apps → Authorize your app

#### Error: `QuotaExceeded` or `Throttled`
- **Cause:** You've hit rate limits
- **Solution:** Implement retry logic with exponential backoff (see INTEGRATION_ARCHITECTURE.md)

### Getting Help

1. **Amazon SP-API Documentation**: https://developer-docs.amazon.com/sp-api/
2. **SP-API GitHub Issues**: https://github.com/amzn/selling-partner-api-models/issues
3. **Developer Support**: Through Developer Central support portal

---

## Credential Reference

### Where Each Credential Comes From

```
┌─────────────────────────────────────────────────────────────────┐
│                        SELLER CENTRAL                           │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │  Account Info → Your Seller Profile                      │   │
│  │  • Seller ID: AXXXXXXXXXX                                │   │
│  └─────────────────────────────────────────────────────────┘   │
│                                                                  │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │  Partner Network → Manage Your Apps → [App] → Authorize  │   │
│  │  • Refresh Token: Atzr|xxxxxxxxxxxxxx                    │   │
│  └─────────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────┐
│                      DEVELOPER CENTRAL                           │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │  Your Apps → [App] → View credentials                    │   │
│  │  • Client ID: amzn1.application-oa2-client.xxxxx         │   │
│  │  • Client Secret: xxxxxxxxxxxxxxxxxxxxxxxx               │   │
│  └─────────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────┘
```

### Important Notes

1. **Refresh Token** - Does NOT expire, but can be revoked. Regenerating creates a new token and invalidates the old one.

2. **Client Secret** - Only shown once at creation. If lost, you must rotate credentials (generates new secret).

3. **Access Token** - You never see this directly. The library automatically exchanges your refresh token for a temporary access token (valid ~1 hour).

---

## Next Steps

Once you have your credentials:

1. Store them securely (see Security section in `INTEGRATION_ARCHITECTURE.md`)
2. Set up environment variables or config file
3. Run the test connection script
4. Begin implementing the dashboard using the architecture in this repo

---

## Quick Reference Card

```
╔══════════════════════════════════════════════════════════════╗
║                    SP-API QUICK REFERENCE                     ║
╠══════════════════════════════════════════════════════════════╣
║  Token Endpoint: https://api.amazon.com/auth/o2/token        ║
║  SP-API Endpoint (US): https://sellingpartnerapi-na.amazon.com║
║  Marketplace ID (US): ATVPDKIKX0DER                          ║
╠══════════════════════════════════════════════════════════════╣
║  CREDENTIALS YOU NEED:                                        ║
║  □ Client ID (from Developer Central)                         ║
║  □ Client Secret (from Developer Central)                     ║
║  □ Refresh Token (from Seller Central → Authorize)            ║
╠══════════════════════════════════════════════════════════════╣
║  ACCESS TOKEN EXCHANGE:                                       ║
║  POST https://api.amazon.com/auth/o2/token                   ║
║  grant_type=refresh_token                                     ║
║  refresh_token=YOUR_REFRESH_TOKEN                            ║
║  client_id=YOUR_CLIENT_ID                                    ║
║  client_secret=YOUR_CLIENT_SECRET                            ║
╚══════════════════════════════════════════════════════════════╝
```
