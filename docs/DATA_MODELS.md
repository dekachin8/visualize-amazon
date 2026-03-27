# Data Models for VISUALIZE Sports Dashboard

*Last Updated: March 26, 2026*

This document defines the data structures for storing and managing Amazon seller data. These schemas are designed to work with SQLite (local development), PostgreSQL (production), or even flat JSON files for MVP.

---

## Table of Contents

1. [Overview](#overview)
2. [Core Entities](#core-entities)
3. [Sales Data Models](#sales-data-models)
4. [Inventory Data Models](#inventory-data-models)
5. [Product Data Models](#product-data-models)
6. [Advertising Data Models](#advertising-data-models)
7. [Data Relationships](#data-relationships)
8. [Sample Data](#sample-data)

---

## Overview

### Design Principles

1. **Normalize where practical** - Avoid data duplication
2. **Keep history** - Store snapshots for trend analysis
3. **Match API structure** - Mirror Amazon's response format where sensible
4. **Timestamp everything** - All records have `created_at` and `updated_at`

### Data Sources

| Data Type | Source API | Refresh Frequency |
|-----------|------------|-------------------|
| Orders | Orders API v0 | Every 15 minutes |
| Inventory | FBA Inventory API | Every hour |
| Products | Catalog Items API v2022-04-01 | Daily |
| Advertising | Amazon Ads API | Every 6 hours |
| Reports | Reports API v2021-06-30 | On-demand + Daily |

---

## Core Entities

### sellers

Primary account information.

```sql
CREATE TABLE sellers (
    id              TEXT PRIMARY KEY,  -- Amazon Seller ID (e.g., "AXXXXXXXXXX")
    name            TEXT NOT NULL,
    email           TEXT,
    marketplace_id  TEXT NOT NULL,     -- e.g., "ATVPDKIKX0DER"
    created_at      TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at      TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

**TypeScript/Python Type:**

```typescript
interface Seller {
  id: string;          // Amazon Seller ID
  name: string;
  email?: string;
  marketplaceId: string;
  createdAt: Date;
  updatedAt: Date;
}
```

---

## Sales Data Models

### orders

Core order information from Amazon.

```sql
CREATE TABLE orders (
    amazon_order_id     TEXT PRIMARY KEY,  -- e.g., "111-1234567-1234567"
    seller_id           TEXT NOT NULL REFERENCES sellers(id),
    purchase_date       TIMESTAMP NOT NULL,
    last_update_date    TIMESTAMP,
    order_status        TEXT NOT NULL,     -- Pending, Unshipped, Shipped, Canceled, etc.
    fulfillment_channel TEXT NOT NULL,     -- AFN (FBA) or MFN (Merchant)
    sales_channel       TEXT,              -- "Amazon.com"
    ship_service_level  TEXT,
    
    -- Financial
    order_total_amount      DECIMAL(10,2),
    order_total_currency    TEXT DEFAULT 'USD',
    
    -- Shipping (nullable for pending)
    shipping_address_state  TEXT,
    shipping_address_city   TEXT,
    shipping_address_country TEXT,
    
    -- Metadata
    number_of_items_shipped     INTEGER DEFAULT 0,
    number_of_items_unshipped   INTEGER DEFAULT 0,
    is_business_order           BOOLEAN DEFAULT FALSE,
    is_prime                    BOOLEAN DEFAULT FALSE,
    
    created_at          TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at          TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_orders_purchase_date ON orders(purchase_date);
CREATE INDEX idx_orders_status ON orders(order_status);
```

**TypeScript Type:**

```typescript
interface Order {
  amazonOrderId: string;
  sellerId: string;
  purchaseDate: Date;
  lastUpdateDate?: Date;
  orderStatus: 'Pending' | 'Unshipped' | 'PartiallyShipped' | 'Shipped' | 'Canceled' | 'Unfulfillable';
  fulfillmentChannel: 'AFN' | 'MFN';
  salesChannel?: string;
  shipServiceLevel?: string;
  orderTotalAmount?: number;
  orderTotalCurrency: string;
  shippingAddress?: {
    state?: string;
    city?: string;
    country?: string;
  };
  numberOfItemsShipped: number;
  numberOfItemsUnshipped: number;
  isBusinessOrder: boolean;
  isPrime: boolean;
  createdAt: Date;
  updatedAt: Date;
}
```

### order_items

Individual line items within orders.

```sql
CREATE TABLE order_items (
    id                  SERIAL PRIMARY KEY,
    amazon_order_id     TEXT NOT NULL REFERENCES orders(amazon_order_id),
    order_item_id       TEXT NOT NULL,     -- Amazon's order item ID
    asin                TEXT NOT NULL,
    seller_sku          TEXT NOT NULL,
    title               TEXT,
    quantity_ordered    INTEGER NOT NULL,
    quantity_shipped    INTEGER DEFAULT 0,
    
    -- Pricing
    item_price_amount       DECIMAL(10,2),
    item_price_currency     TEXT DEFAULT 'USD',
    shipping_price_amount   DECIMAL(10,2) DEFAULT 0,
    item_tax_amount         DECIMAL(10,2) DEFAULT 0,
    shipping_tax_amount     DECIMAL(10,2) DEFAULT 0,
    
    -- Promotions
    promotion_discount_amount   DECIMAL(10,2) DEFAULT 0,
    promotion_ids               TEXT[],  -- Array of promotion IDs
    
    created_at          TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    UNIQUE(amazon_order_id, order_item_id)
);

CREATE INDEX idx_order_items_asin ON order_items(asin);
CREATE INDEX idx_order_items_sku ON order_items(seller_sku);
```

**TypeScript Type:**

```typescript
interface OrderItem {
  id: number;
  amazonOrderId: string;
  orderItemId: string;
  asin: string;
  sellerSku: string;
  title?: string;
  quantityOrdered: number;
  quantityShipped: number;
  itemPriceAmount?: number;
  itemPriceCurrency: string;
  shippingPriceAmount: number;
  itemTaxAmount: number;
  shippingTaxAmount: number;
  promotionDiscountAmount: number;
  promotionIds?: string[];
  createdAt: Date;
}
```

### daily_sales_summary

Pre-aggregated daily sales for fast dashboard queries.

```sql
CREATE TABLE daily_sales_summary (
    id              SERIAL PRIMARY KEY,
    seller_id       TEXT NOT NULL REFERENCES sellers(id),
    date            DATE NOT NULL,
    
    -- Order metrics
    total_orders        INTEGER DEFAULT 0,
    shipped_orders      INTEGER DEFAULT 0,
    canceled_orders     INTEGER DEFAULT 0,
    
    -- Units
    units_ordered       INTEGER DEFAULT 0,
    units_shipped       INTEGER DEFAULT 0,
    
    -- Revenue
    gross_revenue       DECIMAL(12,2) DEFAULT 0,
    net_revenue         DECIMAL(12,2) DEFAULT 0,  -- After refunds/discounts
    shipping_revenue    DECIMAL(12,2) DEFAULT 0,
    
    -- Calculated at write time
    average_order_value DECIMAL(10,2) DEFAULT 0,
    
    created_at      TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at      TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    UNIQUE(seller_id, date)
);

CREATE INDEX idx_daily_sales_date ON daily_sales_summary(date);
```

---

## Inventory Data Models

### inventory_snapshots

Point-in-time FBA inventory levels.

```sql
CREATE TABLE inventory_snapshots (
    id              SERIAL PRIMARY KEY,
    seller_id       TEXT NOT NULL REFERENCES sellers(id),
    snapshot_time   TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    asin            TEXT NOT NULL,
    seller_sku      TEXT NOT NULL,
    fnsku           TEXT,              -- FBA-specific SKU
    
    -- Quantities
    total_quantity          INTEGER DEFAULT 0,
    fulfillable_quantity    INTEGER DEFAULT 0,  -- Available for sale
    inbound_quantity        INTEGER DEFAULT 0,  -- In transit to FBA
    reserved_quantity       INTEGER DEFAULT 0,  -- Customer orders pending
    unfulfillable_quantity  INTEGER DEFAULT 0,  -- Damaged/defective
    
    -- Reserved breakdown
    reserved_fc_transfers       INTEGER DEFAULT 0,
    reserved_fc_processing      INTEGER DEFAULT 0,
    reserved_customer_orders    INTEGER DEFAULT 0,
    
    -- Inbound breakdown
    inbound_working         INTEGER DEFAULT 0,
    inbound_shipped         INTEGER DEFAULT 0,
    inbound_receiving       INTEGER DEFAULT 0,
    
    created_at      TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_inventory_sku ON inventory_snapshots(seller_sku);
CREATE INDEX idx_inventory_time ON inventory_snapshots(snapshot_time);
CREATE INDEX idx_inventory_asin ON inventory_snapshots(asin);
```

**TypeScript Type:**

```typescript
interface InventorySnapshot {
  id: number;
  sellerId: string;
  snapshotTime: Date;
  asin: string;
  sellerSku: string;
  fnsku?: string;
  
  // Quantities
  totalQuantity: number;
  fulfillableQuantity: number;
  inboundQuantity: number;
  reservedQuantity: number;
  unfulfillableQuantity: number;
  
  // Reserved breakdown
  reservedFcTransfers: number;
  reservedFcProcessing: number;
  reservedCustomerOrders: number;
  
  // Inbound breakdown
  inboundWorking: number;
  inboundShipped: number;
  inboundReceiving: number;
  
  createdAt: Date;
}
```

### inventory_alerts

Triggered when inventory drops below thresholds.

```sql
CREATE TABLE inventory_alerts (
    id              SERIAL PRIMARY KEY,
    seller_id       TEXT NOT NULL REFERENCES sellers(id),
    seller_sku      TEXT NOT NULL,
    asin            TEXT NOT NULL,
    alert_type      TEXT NOT NULL,     -- LOW_STOCK, OUT_OF_STOCK, OVERSTOCK
    threshold       INTEGER,
    current_quantity INTEGER NOT NULL,
    
    is_resolved     BOOLEAN DEFAULT FALSE,
    resolved_at     TIMESTAMP,
    
    created_at      TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_alerts_unresolved ON inventory_alerts(seller_id, is_resolved);
```

---

## Product Data Models

### products

Product catalog information.

```sql
CREATE TABLE products (
    asin            TEXT PRIMARY KEY,
    seller_sku      TEXT NOT NULL,
    seller_id       TEXT NOT NULL REFERENCES sellers(id),
    
    -- Basic info
    title           TEXT,
    brand           TEXT,
    manufacturer    TEXT,
    model_number    TEXT,
    part_number     TEXT,
    
    -- Categories
    product_type    TEXT,              -- Amazon product type
    browse_nodes    TEXT[],            -- Array of browse node IDs
    
    -- Images
    main_image_url  TEXT,
    image_urls      TEXT[],
    
    -- Dimensions (inches)
    item_height     DECIMAL(10,2),
    item_length     DECIMAL(10,2),
    item_width      DECIMAL(10,2),
    item_weight_lbs DECIMAL(10,2),
    
    -- Package dimensions
    package_height  DECIMAL(10,2),
    package_length  DECIMAL(10,2),
    package_width   DECIMAL(10,2),
    package_weight_lbs DECIMAL(10,2),
    
    -- Status
    is_active       BOOLEAN DEFAULT TRUE,
    listing_status  TEXT,              -- Active, Inactive, Incomplete
    
    created_at      TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at      TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    UNIQUE(seller_id, seller_sku)
);

CREATE INDEX idx_products_sku ON products(seller_sku);
CREATE INDEX idx_products_seller ON products(seller_id);
```

### product_pricing

Current and historical pricing data.

```sql
CREATE TABLE product_pricing (
    id              SERIAL PRIMARY KEY,
    asin            TEXT NOT NULL REFERENCES products(asin),
    seller_sku      TEXT NOT NULL,
    
    -- Current listing price
    listing_price       DECIMAL(10,2),
    listing_currency    TEXT DEFAULT 'USD',
    
    -- Amazon's prices
    landed_price        DECIMAL(10,2),  -- Price + shipping
    shipping_price      DECIMAL(10,2),
    
    -- Your cost (for margin calc)
    cost_price          DECIMAL(10,2),
    
    -- Buy Box
    is_buy_box_winner   BOOLEAN DEFAULT FALSE,
    buy_box_price       DECIMAL(10,2),
    
    -- FBA fees
    fba_fulfillment_fee DECIMAL(10,2),
    referral_fee        DECIMAL(10,2),
    
    -- Timestamps
    price_timestamp     TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    created_at          TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_pricing_asin ON product_pricing(asin);
CREATE INDEX idx_pricing_timestamp ON product_pricing(price_timestamp);
```

### product_rankings

Sales rank and category position tracking.

```sql
CREATE TABLE product_rankings (
    id              SERIAL PRIMARY KEY,
    asin            TEXT NOT NULL REFERENCES products(asin),
    
    -- Sales rank
    sales_rank              INTEGER,
    sales_rank_category     TEXT,
    
    -- Category rankings (can have multiple)
    category_rankings       JSONB,  -- [{"category": "Golf", "rank": 123}, ...]
    
    snapshot_time   TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    created_at      TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_rankings_asin ON product_rankings(asin);
CREATE INDEX idx_rankings_time ON product_rankings(snapshot_time);
```

**Sample category_rankings JSON:**

```json
[
  { "category": "Sports & Outdoors", "rank": 45678 },
  { "category": "Golf", "rank": 1234 },
  { "category": "Golf Towels", "rank": 15 }
]
```

---

## Advertising Data Models

> **Note:** Amazon Advertising API is separate from SP-API. You'll need separate credentials from advertising.amazon.com.

### ad_campaigns

Sponsored Products, Brands, and Display campaigns.

```sql
CREATE TABLE ad_campaigns (
    campaign_id         TEXT PRIMARY KEY,
    seller_id           TEXT NOT NULL REFERENCES sellers(id),
    
    -- Campaign info
    campaign_name       TEXT NOT NULL,
    campaign_type       TEXT NOT NULL,     -- sponsoredProducts, sponsoredBrands, sponsoredDisplay
    state               TEXT NOT NULL,     -- enabled, paused, archived
    
    -- Budget
    daily_budget        DECIMAL(10,2),
    budget_type         TEXT,              -- daily
    
    -- Targeting
    targeting_type      TEXT,              -- manual, auto
    
    -- Bidding
    bidding_strategy    TEXT,
    
    -- Dates
    start_date          DATE,
    end_date            DATE,
    
    created_at          TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at          TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_campaigns_seller ON ad_campaigns(seller_id);
CREATE INDEX idx_campaigns_type ON ad_campaigns(campaign_type);
```

### ad_performance_daily

Daily aggregated advertising metrics.

```sql
CREATE TABLE ad_performance_daily (
    id              SERIAL PRIMARY KEY,
    campaign_id     TEXT NOT NULL REFERENCES ad_campaigns(campaign_id),
    date            DATE NOT NULL,
    
    -- Core metrics
    impressions     INTEGER DEFAULT 0,
    clicks          INTEGER DEFAULT 0,
    spend           DECIMAL(12,2) DEFAULT 0,
    
    -- Sales attribution
    sales_1d        DECIMAL(12,2) DEFAULT 0,  -- 1-day attributed sales
    sales_7d        DECIMAL(12,2) DEFAULT 0,  -- 7-day attributed sales
    sales_14d       DECIMAL(12,2) DEFAULT 0,  -- 14-day attributed sales
    sales_30d       DECIMAL(12,2) DEFAULT 0,  -- 30-day attributed sales
    
    orders_1d       INTEGER DEFAULT 0,
    orders_7d       INTEGER DEFAULT 0,
    orders_14d      INTEGER DEFAULT 0,
    orders_30d      INTEGER DEFAULT 0,
    
    units_1d        INTEGER DEFAULT 0,
    units_7d        INTEGER DEFAULT 0,
    units_14d       INTEGER DEFAULT 0,
    units_30d       INTEGER DEFAULT 0,
    
    -- Calculated metrics (store for quick queries)
    ctr             DECIMAL(8,4),   -- Click-through rate (clicks/impressions)
    cpc             DECIMAL(8,2),   -- Cost per click (spend/clicks)
    acos            DECIMAL(8,4),   -- Ad cost of sale (spend/sales)
    roas            DECIMAL(8,2),   -- Return on ad spend (sales/spend)
    
    created_at      TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    UNIQUE(campaign_id, date)
);

CREATE INDEX idx_ad_perf_date ON ad_performance_daily(date);
CREATE INDEX idx_ad_perf_campaign ON ad_performance_daily(campaign_id);
```

**TypeScript Type:**

```typescript
interface AdPerformanceDaily {
  id: number;
  campaignId: string;
  date: Date;
  
  // Core metrics
  impressions: number;
  clicks: number;
  spend: number;
  
  // Sales (multiple attribution windows)
  sales7d: number;
  orders7d: number;
  units7d: number;
  
  // Calculated
  ctr: number;      // clicks / impressions
  cpc: number;      // spend / clicks  
  acos: number;     // spend / sales (%)
  roas: number;     // sales / spend
  
  createdAt: Date;
}
```

### ad_keywords

Keyword performance for Sponsored Products.

```sql
CREATE TABLE ad_keywords (
    id              SERIAL PRIMARY KEY,
    campaign_id     TEXT NOT NULL REFERENCES ad_campaigns(campaign_id),
    ad_group_id     TEXT NOT NULL,
    keyword_id      TEXT NOT NULL,
    
    keyword_text    TEXT NOT NULL,
    match_type      TEXT NOT NULL,     -- exact, phrase, broad
    state           TEXT NOT NULL,     -- enabled, paused, archived
    
    bid             DECIMAL(8,2),
    
    -- Last 30 days aggregate (updated daily)
    impressions_30d INTEGER DEFAULT 0,
    clicks_30d      INTEGER DEFAULT 0,
    spend_30d       DECIMAL(10,2) DEFAULT 0,
    sales_30d       DECIMAL(10,2) DEFAULT 0,
    acos_30d        DECIMAL(8,4),
    
    created_at      TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at      TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    UNIQUE(campaign_id, ad_group_id, keyword_id)
);

CREATE INDEX idx_keywords_campaign ON ad_keywords(campaign_id);
CREATE INDEX idx_keywords_text ON ad_keywords(keyword_text);
```

---

## Data Relationships

```
┌─────────────────────────────────────────────────────────────────────────┐
│                           Entity Relationships                           │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                          │
│   ┌──────────┐                                                          │
│   │ sellers  │──────────────────────────────┐                           │
│   └────┬─────┘                              │                           │
│        │                                     │                           │
│        ▼                                     ▼                           │
│   ┌──────────┐      ┌──────────────┐   ┌───────────────┐               │
│   │  orders  │──────│ order_items  │   │ ad_campaigns  │               │
│   └────┬─────┘      └──────────────┘   └───────┬───────┘               │
│        │                   │                    │                        │
│        │                   │                    ▼                        │
│        │                   │           ┌──────────────────┐             │
│        │                   │           │ad_performance_daily│            │
│        │                   │           └──────────────────┘             │
│        │                   │                    │                        │
│        │                   ▼                    ▼                        │
│        │            ┌──────────┐        ┌─────────────┐                 │
│        │            │ products │        │ ad_keywords │                 │
│        │            └────┬─────┘        └─────────────┘                 │
│        │                 │                                               │
│        │    ┌────────────┼────────────┐                                 │
│        │    │            │            │                                  │
│        ▼    ▼            ▼            ▼                                  │
│   ┌─────────────┐  ┌──────────┐  ┌──────────────────┐                   │
│   │daily_sales_ │  │product_  │  │inventory_        │                   │
│   │summary      │  │pricing   │  │snapshots         │                   │
│   └─────────────┘  └──────────┘  └──────────────────┘                   │
│                                                                          │
└─────────────────────────────────────────────────────────────────────────┘
```

---

## Sample Data

### Sample Order

```json
{
  "amazonOrderId": "111-1234567-1234567",
  "sellerId": "AXXXXXXXXXXXXXXX",
  "purchaseDate": "2026-03-25T14:30:00Z",
  "orderStatus": "Shipped",
  "fulfillmentChannel": "AFN",
  "salesChannel": "Amazon.com",
  "orderTotalAmount": 29.99,
  "orderTotalCurrency": "USD",
  "numberOfItemsShipped": 1,
  "isPrime": true
}
```

### Sample Inventory Snapshot

```json
{
  "asin": "B0XXXXXXXXX",
  "sellerSku": "VIZ-GOLF-001",
  "fnsku": "X000XXXXXX",
  "totalQuantity": 150,
  "fulfillableQuantity": 120,
  "inboundQuantity": 25,
  "reservedQuantity": 5,
  "unfulfillableQuantity": 0,
  "snapshotTime": "2026-03-26T12:00:00Z"
}
```

### Sample Ad Performance

```json
{
  "campaignId": "12345678901234",
  "date": "2026-03-25",
  "impressions": 5420,
  "clicks": 87,
  "spend": 43.50,
  "sales7d": 198.95,
  "orders7d": 7,
  "ctr": 0.0161,
  "cpc": 0.50,
  "acos": 0.2187,
  "roas": 4.57
}
```

---

## Migration Scripts

See `/src/db/migrations/` for SQL migration files to create these tables.

## Data Validation

All data ingestion should validate:
- Required fields are present
- Numeric fields are valid numbers
- Dates are in ISO 8601 format
- SKUs match expected patterns
- Currency codes are valid ISO 4217

See `INTEGRATION_ARCHITECTURE.md` for validation implementation details.
