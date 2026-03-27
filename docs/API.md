# API.md - Amazon Selling Partner API Integration

Complete guide to setting up and using Amazon's Selling Partner API.

## What is the Selling Partner API?

The Amazon Selling Partner API allows you to programmatically access seller data including:
- Orders and sales
- Inventory levels
- Product pricing
- Fulfillment information
- Returns and refunds

## Getting Started

### Step 1: Register as a Developer

1. Visit [Amazon Developer Console](https://developer.amazon.com)
2. Sign in with your Amazon seller account
3. Create a developer account if you haven't already

### Step 2: Create an Application

1. Go to **App & Services** → **Developer Central**
2. Click **Create Application**
3. Fill in:
   - **Application Name**: "VISUALIZE Amazon System"
   - **Application Type**: "Self-Authored application"
4. Accept terms and create

### Step 3: Generate API Credentials

1. In Developer Console, find your app
2. Get these credentials:
   - **Client ID**: Copy this
   - **Client Secret**: Copy and save securely
   - **Refresh Token**: Will generate after OAuth

### Step 4: Set Up OAuth

1. Go to seller.amazon.com
2. Navigate to **Settings** → **User Permissions**
3. Create a new authorization:
   - Application: Select your app from Step 2
   - Assign permissions for: Orders, Inventory, Products
4. Authorize and receive your **Refresh Token**

### Step 5: Add to .env.local

```
AMAZON_SELLING_PARTNER_API_KEY=<Client ID>
AMAZON_SELLING_PARTNER_API_SECRET=<Client Secret>
AMAZON_REFRESH_TOKEN=<Refresh Token from OAuth>
AMAZON_SELLER_ID=<Your Seller Central ID>
```

## API Endpoints

### Orders API

**Get Orders:**
```javascript
// Fetch orders from last 30 days
GET /orders/v0/orders
?CreatedAfter=2024-02-26&MarketplaceId=ATVPDKIKX0DER

Response:
{
  "orders": [
    {
      "AmazonOrderId": "123-1234567-1234567",
      "PurchaseDate": "2024-03-26",
      "OrderStatus": "Shipped",
      "SalesChannel": "Amazon.com",
      "OrderTotal": {
        "Amount": "29.99",
        "CurrencyCode": "USD"
      },
      "NumberOfItemsShipped": 1,
      "NumberOfItemsUnshipped": 0
    }
  ]
}
```

### Inventory API

**Get Inventory Summary:**
```javascript
GET /fba/inventory/v1/summaries
?granularityType=Marketplace&granularityId=ATVPDKIKX0DER

Response:
{
  "payload": [
    {
      "asin": "B001234567",
      "fnSku": "SKU-001",
      "sellerSku": "GOLF-001",
      "condition": "NewItem",
      "inventorySummaries": [
        {
          "fulfillmentChannel": "AFN",
          "quantity": 45
        },
        {
          "fulfillmentChannel": "MFN",
          "quantity": 12
        }
      ]
    }
  ]
}
```

### Catalog API

**Get Product Details:**
```javascript
GET /catalog/2022-04-01/items/<ASIN>
?marketplaceIds=ATVPDKIKX0DER

Response:
{
  "asin": "B001234567",
  "attributes": {
    "title": [{"value": "Product Title"}],
    "price": [{"currency": "USD", "value": 29.99}]
  }
}
```

## Implementation Details

### Authentication Flow

1. Use `AMAZON_REFRESH_TOKEN` to get temporary access token
2. Access token valid for 1 hour
3. Automatically refresh when expired

### Rate Limits

- **Orders API**: 10 requests/second
- **Inventory API**: 2 requests/second
- **Catalog API**: 1 request/second

Implement exponential backoff for rate limit errors (429).

### Error Handling

Common errors:

| Code | Meaning | Solution |
|------|---------|----------|
| 400 | Bad Request | Check API parameters |
| 401 | Unauthorized | Verify credentials, refresh token |
| 403 | Forbidden | App doesn't have permission for this endpoint |
| 404 | Not Found | ASIN or ID doesn't exist |
| 429 | Rate Limited | Back off and retry with exponential delay |
| 500 | Server Error | Retry after 60 seconds |

## Sync Implementation

### Automatic Sync (Production)

Vercel cron job at 2 AM UTC daily:

```bash
# triggered by
POST /api/sync/amazon
```

### Manual Sync (Development)

```bash
npm run sync
```

Runs: `scripts/sync-amazon-data.js`

### What Gets Synced

1. **Orders** - Last 30 days of sales data
2. **Inventory** - Current stock levels for all ASINs
3. **Pricing** - Current listing prices
4. **Performance** - Sales metrics per ASIN

Data stored in:
- Supabase (if configured)
- Local JSON files (development fallback)

## Testing API Connectivity

```bash
# Test in Node.js
node scripts/test-amazon-api.js
```

Expected output:
```
✓ Credentials loaded
✓ OAuth token obtained
✓ Orders API: 12 orders found
✓ Inventory API: 8 ASINs found
✓ All connections working
```

## Security Notes

⚠️ **Never commit .env files to Git**

- `.env.local` is in `.gitignore`
- Use environment variables in production
- Rotate refresh tokens periodically
- Keep Client Secret secure

## Troubleshooting

### "Invalid refresh token"
- Refresh token may have expired
- Regenerate from Seller Central → User Permissions
- Add new token to `.env.local`

### "Unauthorized - invalid credentials"
- Verify Client ID and Secret are correct
- Check marketplace ID (ATVPDKIKX0DER for Amazon.com)
- Confirm app has required permissions

### "Rate limit exceeded"
- Stagger requests with delays
- Sync script has built-in backoff
- Check current quota in Developer Console

### "No inventory data returned"
- Verify ASINs exist in seller account
- Check marketplace ID matches where products are listed
- Confirm products are active (not archived)

## Next Steps

1. Complete setup in `docs/SETUP.md`
2. Run test sync: `npm run sync`
3. Review data in database or local files
4. Build features using synced data

## Resources

- [Selling Partner API Docs](https://developer-docs.amazon.com/sp-api)
- [API Error Codes](https://developer-docs.amazon.com/sp-api/docs/error-handling)
- [OAuth Implementation](https://developer-docs.amazon.com/sp-api/docs/implementing-oauth)

---

**Questions?** Check Seller Central help or Amazon API documentation.
