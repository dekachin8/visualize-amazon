# VISUALIZE Sports Data Requirements

**Version:** 1.0  
**Date:** March 26, 2026  
**Purpose:** Comprehensive data specification for inventory intelligence system

---

## Table of Contents

1. [Amazon SP-API Data](#amazon-sp-api-data)
2. [Historical Data Requirements](#historical-data-requirements)
3. [External Data Sources](#external-data-sources)
4. [Data Storage Schema](#data-storage-schema)
5. [Data Quality & Validation](#data-quality--validation)
6. [API Integration Guide](#api-integration-guide)

---

## Amazon SP-API Data

### Required API Endpoints

**1. Inventory API**
- **Endpoint:** `GET /fba/inventory/v1/summaries`
- **Frequency:** Daily (overnight batch)
- **Data Fields:**
  ```json
  {
    "asin": "B08XYZ123",
    "fnSku": "VIS-GLF-001",
    "sellerSku": "VIS-GLF-001",
    "condition": "NewItem",
    "inventoryDetails": {
      "fulfillableQuantity": 215,        // Available to sell
      "inboundWorkingQuantity": 0,       // In transit to FBA
      "inboundShippedQuantity": 0,       // Shipped to FBA
      "inboundReceivingQuantity": 0,     // FBA receiving
      "reservedQuantity": {
        "totalReservedQuantity": 25,     // In customer orders
        "pendingCustomerOrderQuantity": 20,
        "pendingTransshipmentQuantity": 0,
        "fcProcessingQuantity": 5
      },
      "unfulfillableQuantity": 0,        // Damaged/unsellable
      "totalQuantity": 240               // Total in FBA
    },
    "lastUpdatedTime": "2026-03-26T19:30:00Z"
  }
  ```

**2. Sales API**
- **Endpoint:** `GET /sales/v1/orderMetrics`
- **Frequency:** Daily
- **Data Fields:**
  ```json
  {
    "interval": "2026-03-26T00:00:00Z--2026-03-26T23:59:59Z",
    "asin": "B08XYZ123",
    "unitCount": 12,
    "orderItemCount": 12,
    "orderCount": 9,
    "averageUnitPrice": {
      "currencyCode": "USD",
      "amount": 19.99
    },
    "totalSales": {
      "currencyCode": "USD",
      "amount": 239.88
    }
  }
  ```

**3. Product Fees API**
- **Endpoint:** `GET /products/fees/v0/feesEstimate`
- **Frequency:** Weekly (fees don't change often)
- **Data Fields:**
  ```json
  {
    "asin": "B08XYZ123",
    "feesEstimate": {
      "totalFeesEstimate": {
        "currencyCode": "USD",
        "amount": 5.47
      },
      "feeDetailList": [
        {
          "feeType": "FBAFees",
          "feeAmount": {
            "currencyCode": "USD",
            "amount": 3.22
          },
          "finalFee": {
            "currencyCode": "USD",
            "amount": 3.22
          }
        },
        {
          "feeType": "Commission",
          "feeAmount": {
            "currencyCode": "USD",
            "amount": 2.25
          },
          "finalFee": {
            "currencyCode": "USD",
            "amount": 2.25
          }
        }
      ]
    }
  }
  ```

**4. FBA Inventory Age API**
- **Endpoint:** `GET /fba/inventory/v1/inventoryAge`
- **Frequency:** Weekly
- **Data Fields:**
  ```json
  {
    "asin": "B08XYZ123",
    "fnSku": "VIS-GLF-001",
    "sellerSku": "VIS-GLF-001",
    "inventoryAge": {
      "0-90days": 150,
      "91-180days": 65,
      "181-270days": 20,
      "271-365days": 5,
      "365+days": 0
    },
    "avgAgeDays": 87
  }
  ```

**5. FBA Storage Fees API**
- **Endpoint:** `GET /fba/inventory/v1/storageFeesEstimate`
- **Frequency:** Monthly
- **Data Fields:**
  ```json
  {
    "asin": "B08XYZ123",
    "fnSku": "VIS-GLF-001",
    "productName": "Golf Ball Marker Set",
    "productGroup": "GL_SOI_20",
    "dimensionalWeight": 0.5,
    "itemVolume": 0.15,
    "volumeUnit": "CUBIC_FEET",
    "averageDailyInventory": 240,
    "monthlyStorageFee": {
      "currencyCode": "USD",
      "amount": 31.20
    },
    "storageRate": {
      "currencyCode": "USD",
      "amount": 0.87
    },
    "billingPeriod": "2026-03-01--2026-03-31"
  }
  ```

**6. FBA Shipments API (Inbound)**
- **Endpoint:** `GET /fba/inbound/v0/shipments`
- **Frequency:** Daily
- **Data Fields:**
  ```json
  {
    "shipmentId": "FBA12345678",
    "shipmentName": "VIS-2026-03-15",
    "shipmentStatus": "RECEIVING",
    "destinationFulfillmentCenterId": "PHX6",
    "labelPrepType": "SELLER_LABEL",
    "items": [
      {
        "sellerSku": "VIS-GLF-001",
        "fnSku": "X001234567",
        "quantityShipped": 600,
        "quantityReceived": 450,
        "quantityInCase": 24
      }
    ],
    "shipDate": "2026-03-15",
    "estimatedArrival": "2026-03-21"
  }
  ```

---

### Derived Calculations (From SP-API Data)

**Current Stock:**
```
current_stock = inventoryDetails.fulfillableQuantity + 
                inventoryDetails.reservedQuantity.totalReservedQuantity
```

**Available Stock:**
```
available_stock = inventoryDetails.fulfillableQuantity
```

**Inbound Stock:**
```
inbound_stock = inventoryDetails.inboundWorkingQuantity +
                inventoryDetails.inboundShippedQuantity +
                inventoryDetails.inboundReceivingQuantity
```

**Days in FBA:**
```
days_in_fba = (today - first_received_date).days

where first_received_date = earliest date in FBA inventory age history
```

**Storage Fee Per Unit:**
```
storage_fee_per_unit = monthlyStorageFee / averageDailyInventory
```

---

## Historical Data Requirements

### Minimum Data Retention

**Sales History:**
- **Minimum:** 90 days
- **Recommended:** 24 months (2 full seasonal cycles)
- **Granularity:** Daily
- **Fields:**
  ```
  - date
  - asin
  - sku
  - units_sold
  - revenue
  - order_count
  ```

**Inventory Snapshots:**
- **Minimum:** 90 days
- **Recommended:** 12 months
- **Granularity:** Daily
- **Fields:**
  ```
  - date
  - asin
  - sku
  - current_stock
  - available_stock
  - reserved_stock
  - inbound_stock
  - days_in_fba
  ```

**Storage Fees:**
- **Minimum:** 12 months
- **Recommended:** 24 months
- **Granularity:** Monthly
- **Fields:**
  ```
  - month
  - asin
  - sku
  - storage_fee
  - volume_cubic_feet
  - average_inventory
  ```

**Price History:**
- **Minimum:** 90 days
- **Recommended:** 24 months
- **Granularity:** Daily (price changes)
- **Fields:**
  ```
  - date
  - asin
  - sku
  - list_price
  - sale_price
  - promotion_active
  ```

---

### Seasonal Index Calculation Data

**Required for Seasonal Adjustment:**
```
For each SKU:
  For each month (1-12):
    Total_Sales[month] across all years available
    
Example data structure:
{
  "asin": "B08XYZ123",
  "seasonal_indices": {
    "2024": {
      "01": 0.58,  // January 2024
      "02": 0.72,
      ...
      "12": 0.63
    },
    "2025": {
      "01": 0.62,  // January 2025
      "02": 0.68,
      ...
      "12": 0.67
    }
  },
  "average_seasonal_index": {
    "01": 0.60,  // Average across years
    "02": 0.70,
    ...
    "12": 0.65
  }
}
```

**Minimum Requirement:**
- At least 12 months of data
- Ideally 24+ months (2 full cycles)

**If insufficient data:**
```
Use industry averages for golf accessories:
January:   0.60
February:  0.70
March:     0.95
April:     1.15
May:       1.25
June:      1.30
July:      1.25
August:    1.20
September: 1.10
October:   0.90
November:  0.70
December:  0.65
```

---

## External Data Sources

### 1. Supplier Data (Manual Input)

**Required Fields:**
```
{
  "supplier_id": "SUP-001",
  "supplier_name": "Acme Golf Supplies",
  "contact_email": "orders@acmegolf.com",
  "location": "China" | "USA" | "Other",
  "products": [
    {
      "sku": "VIS-GLF-001",
      "supplier_sku": "AGS-123",
      "lead_time_days": 21,
      "minimum_order_qty": 500,
      "case_pack_size": 24,
      "cogs_per_unit": 4.00,
      "moq_value": 2000.00,
      "payment_terms": "Net 30",
      "on_time_delivery_rate": 0.85,  // Historical performance
      "quality_score": 0.92,
      "last_order_date": "2026-02-15",
      "discontinued": false
    }
  ]
}
```

**Update Frequency:** As needed (when terms change)

---

### 2. Product Catalog Data (Manual/Amazon Combined)

**Required Fields:**
```
{
  "asin": "B08XYZ123",
  "sku": "VIS-GLF-001",
  "product_name": "Golf Ball Marker Set",
  "brand": "VISUALIZE",
  "category": "Golf Accessories",
  "subcategory": "Ball Markers",
  "tier": 1,  // 1=Core, 2=Solid, 3=Marginal, 4=Poor
  
  "dimensions": {
    "length_inches": 6.0,
    "width_inches": 4.0,
    "height_inches": 1.5,
    "weight_lbs": 0.5,
    "volume_cubic_feet": 0.15
  },
  
  "pricing": {
    "list_price": 19.99,
    "cogs": 4.00,
    "target_margin": 0.60
  },
  
  "flags": {
    "seasonal": true,
    "promotional": false,
    "clearance": false,
    "discontinued_supplier": false
  },
  
  "launch_date": "2023-04-15",
  "first_fba_date": "2023-04-20"
}
```

---

### 3. Business Context Data (Configuration)

**Wind-Down Parameters:**
```
{
  "business_name": "VISUALIZE Sports",
  "wind_down_start_date": "2026-03-01",
  "estimated_end_date": "2027-12-31",
  "current_phase": 1,  // 1=Controlled, 2=Decline, 3=Liquidation, 4=Exit
  
  "financial": {
    "monthly_budget": 5000.00,
    "available_cash": 25000.00,
    "line_of_credit": 0.00,
    "tax_rate": 0.30
  },
  
  "amazon_account": {
    "seller_id": "A1B2C3D4E5",
    "fba_storage_limit_cubic_feet": 3500,
    "seller_performance": {
      "order_defect_rate": 0.005,
      "late_shipment_rate": 0.01,
      "valid_tracking_rate": 0.99
    }
  },
  
  "strategy_parameters": {
    "service_level_target": 0.90,  // Phase 1
    "max_restock_months": 6,
    "acceptable_stockout_risk": 0.30,
    "storage_efficiency_threshold": 2.0,
    "slow_mover_threshold": 0.7,
    "liquidation_priority_threshold": 0.7
  }
}
```

---

### 4. Economic Data (Optional Enhancement)

**Could improve forecasting:**
```
- Consumer confidence index
- Golf industry trends
- Seasonal weather patterns (impact golf season)
- Competitor pricing data

However, NOT CRITICAL for MVP.
Wind-down strategy can work with internal data alone.
```

---

## Data Storage Schema

### Database Tables

**Table: inventory_snapshots**
```sql
CREATE TABLE inventory_snapshots (
    id SERIAL PRIMARY KEY,
    snapshot_date DATE NOT NULL,
    asin VARCHAR(20) NOT NULL,
    sku VARCHAR(50) NOT NULL,
    current_stock INT,
    available_stock INT,
    reserved_stock INT,
    inbound_stock INT,
    unfulfillable_stock INT,
    days_in_fba INT,
    created_at TIMESTAMP DEFAULT NOW(),
    UNIQUE(snapshot_date, asin)
);

CREATE INDEX idx_inventory_asin_date ON inventory_snapshots(asin, snapshot_date DESC);
```

**Table: sales_history**
```sql
CREATE TABLE sales_history (
    id SERIAL PRIMARY KEY,
    sale_date DATE NOT NULL,
    asin VARCHAR(20) NOT NULL,
    sku VARCHAR(50) NOT NULL,
    units_sold INT,
    revenue DECIMAL(10,2),
    order_count INT,
    avg_unit_price DECIMAL(10,2),
    created_at TIMESTAMP DEFAULT NOW(),
    UNIQUE(sale_date, asin)
);

CREATE INDEX idx_sales_asin_date ON sales_history(asin, sale_date DESC);
```

**Table: storage_fees**
```sql
CREATE TABLE storage_fees (
    id SERIAL PRIMARY KEY,
    billing_month DATE NOT NULL,  -- First day of month
    asin VARCHAR(20) NOT NULL,
    sku VARCHAR(50) NOT NULL,
    volume_cubic_feet DECIMAL(10,4),
    average_daily_inventory DECIMAL(10,2),
    storage_fee DECIMAL(10,2),
    storage_rate DECIMAL(10,4),
    long_term_storage_fee DECIMAL(10,2) DEFAULT 0,
    created_at TIMESTAMP DEFAULT NOW(),
    UNIQUE(billing_month, asin)
);

CREATE INDEX idx_storage_asin_month ON storage_fees(asin, billing_month DESC);
```

**Table: product_catalog**
```sql
CREATE TABLE product_catalog (
    asin VARCHAR(20) PRIMARY KEY,
    sku VARCHAR(50) UNIQUE NOT NULL,
    product_name VARCHAR(255),
    brand VARCHAR(100),
    category VARCHAR(100),
    subcategory VARCHAR(100),
    tier INT,  -- 1=Core, 2=Solid, 3=Marginal, 4=Poor
    
    -- Dimensions
    length_inches DECIMAL(6,2),
    width_inches DECIMAL(6,2),
    height_inches DECIMAL(6,2),
    weight_lbs DECIMAL(6,2),
    volume_cubic_feet DECIMAL(10,4),
    
    -- Pricing
    list_price DECIMAL(10,2),
    cogs DECIMAL(10,2),
    fba_fee DECIMAL(10,2),
    referral_fee_pct DECIMAL(5,4),
    
    -- Supplier
    supplier_id VARCHAR(50),
    supplier_sku VARCHAR(50),
    lead_time_days INT,
    minimum_order_qty INT,
    case_pack_size INT,
    
    -- Dates
    launch_date DATE,
    first_fba_date DATE,
    discontinued_date DATE,
    
    -- Flags
    is_seasonal BOOLEAN DEFAULT FALSE,
    is_discontinued BOOLEAN DEFAULT FALSE,
    
    updated_at TIMESTAMP DEFAULT NOW()
);
```

**Table: calculated_metrics (Daily Calculations)**
```sql
CREATE TABLE calculated_metrics (
    id SERIAL PRIMARY KEY,
    calculation_date DATE NOT NULL,
    asin VARCHAR(20) NOT NULL,
    
    -- Velocity
    daily_velocity_30d DECIMAL(10,4),
    daily_velocity_60d DECIMAL(10,4),
    daily_velocity_90d DECIMAL(10,4),
    demand_std_dev DECIMAL(10,4),
    velocity_trend DECIMAL(10,4),
    
    -- Inventory
    dir DECIMAL(10,2),  -- Days of inventory remaining
    rop DECIMAL(10,2),  -- Reorder point
    safety_stock DECIMAL(10,2),
    
    -- Risk
    stockout_probability DECIMAL(5,4),
    storage_efficiency DECIMAL(10,2),
    excess_ratio DECIMAL(10,4),
    slow_mover_score DECIMAL(5,4),
    liquidation_priority DECIMAL(5,4),
    
    -- Seasonal
    seasonal_factor DECIMAL(5,4),
    
    created_at TIMESTAMP DEFAULT NOW(),
    UNIQUE(calculation_date, asin)
);

CREATE INDEX idx_metrics_asin_date ON calculated_metrics(asin, calculation_date DESC);
CREATE INDEX idx_metrics_date ON calculated_metrics(calculation_date DESC);
```

**Table: recommendations**
```sql
CREATE TABLE recommendations (
    id SERIAL PRIMARY KEY,
    recommendation_date DATE NOT NULL,
    asin VARCHAR(20) NOT NULL,
    sku VARCHAR(50),
    
    -- Recommendation
    action VARCHAR(50),  -- RESTOCK, DO_NOT_RESTOCK, LIQUIDATE, MONITOR
    urgency VARCHAR(20),  -- CRITICAL, HIGH, MEDIUM, LOW
    priority INT,
    quantity INT,
    method VARCHAR(50),  -- For liquidation
    
    -- Reasoning
    primary_reason TEXT,
    secondary_reasons JSONB,
    
    -- Financial
    order_value DECIMAL(10,2),
    estimated_revenue DECIMAL(10,2),
    estimated_profit DECIMAL(10,2),
    
    -- Approval
    requires_approval BOOLEAN,
    approved BOOLEAN,
    approved_at TIMESTAMP,
    approved_by VARCHAR(100),
    
    -- Execution
    executed BOOLEAN DEFAULT FALSE,
    executed_at TIMESTAMP,
    
    created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_recommendations_date ON recommendations(recommendation_date DESC);
CREATE INDEX idx_recommendations_asin ON recommendations(asin, recommendation_date DESC);
CREATE INDEX idx_recommendations_pending ON recommendations(requires_approval, approved, executed);
```

**Table: alerts**
```sql
CREATE TABLE alerts (
    id SERIAL PRIMARY KEY,
    alert_date TIMESTAMP NOT NULL DEFAULT NOW(),
    alert_type VARCHAR(50),  -- STOCKOUT_CRITICAL, LTSF_APPROACHING, etc.
    severity VARCHAR(20),  -- CRITICAL, HIGH, MEDIUM, LOW
    asin VARCHAR(20),
    sku VARCHAR(50),
    message TEXT,
    action_required TEXT,
    
    -- Status
    acknowledged BOOLEAN DEFAULT FALSE,
    acknowledged_at TIMESTAMP,
    acknowledged_by VARCHAR(100),
    resolved BOOLEAN DEFAULT FALSE,
    resolved_at TIMESTAMP,
    
    created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_alerts_date ON alerts(alert_date DESC);
CREATE INDEX idx_alerts_unresolved ON alerts(resolved, severity);
```

---

### JSON Storage (Alternative for MVP)

**If relational DB is overkill, use file-based storage:**

**Structure:**
```
data/
  inventory/
    2026-03-26.json
    2026-03-27.json
    ...
  sales/
    2026-03-26.json
    2026-03-27.json
    ...
  metrics/
    2026-03-26.json
    ...
  catalog/
    products.json
  config/
    business_config.json
    seasonal_indices.json
```

**Example: data/inventory/2026-03-26.json**
```json
{
  "snapshot_date": "2026-03-26",
  "skus": [
    {
      "asin": "B08XYZ123",
      "sku": "VIS-GLF-001",
      "current_stock": 240,
      "available_stock": 215,
      "reserved_stock": 25,
      "inbound_stock": 0,
      "days_in_fba": 180
    },
    ...
  ]
}
```

**Pros:**
- Simple to implement
- No database setup
- Easy to version control
- Human-readable

**Cons:**
- Slower for large datasets
- No relational queries
- Manual indexing
- Harder to aggregate across dates

**Recommendation:** Start with JSON, migrate to DB if >100 SKUs or >6 months history

---

## Data Quality & Validation

### Validation Rules

**Inventory Data:**
```python
def validate_inventory_snapshot(data):
    assert data['current_stock'] >= 0, "Negative stock impossible"
    assert data['available_stock'] <= data['current_stock'], "Available can't exceed current"
    assert data['reserved_stock'] >= 0, "Reserved can't be negative"
    assert data['inbound_stock'] >= 0, "Inbound can't be negative"
    
    # Alert if stock drops >50% in 1 day (possible data error)
    if previous_stock > 0:
        drop_pct = (previous_stock - data['current_stock']) / previous_stock
        if drop_pct > 0.50:
            create_alert("INVENTORY_DROP_ANOMALY", f"Stock dropped {drop_pct:.0%} in 1 day")
```

**Sales Data:**
```python
def validate_sales(data):
    assert data['units_sold'] >= 0, "Negative sales impossible"
    assert data['revenue'] >= 0, "Negative revenue impossible"
    assert data['order_count'] >= 0, "Negative orders impossible"
    
    # Alert if sales spike >5x average (verify not data error)
    if data['units_sold'] > (historical_avg × 5):
        create_alert("SALES_SPIKE_ANOMALY", f"Sales {data['units_sold']} vs avg {historical_avg}")
    
    # Validate revenue = units × price (within tolerance)
    expected_revenue = data['units_sold'] × data['avg_unit_price']
    if abs(expected_revenue - data['revenue']) > 1.00:  # $1 tolerance
        create_alert("REVENUE_MISMATCH", f"Revenue {data['revenue']} doesn't match units × price")
```

**Calculated Metrics:**
```python
def validate_metrics(metrics):
    # DIR should be positive
    assert metrics['dir'] >= 0, "DIR can't be negative"
    
    # Probabilities between 0-1
    assert 0 <= metrics['stockout_probability'] <= 1, "Probability out of range"
    
    # Scores between 0-1
    assert 0 <= metrics['slow_mover_score'] <= 1, "Score out of range"
    assert 0 <= metrics['liquidation_priority'] <= 1, "Priority out of range"
    
    # Seasonal factor reasonable (0.5 - 1.5)
    assert 0.5 <= metrics['seasonal_factor'] <= 1.5, "Seasonal factor unrealistic"
```

---

### Data Completeness Checks

**Daily Checks:**
```python
def check_data_completeness(date):
    # Inventory snapshot exists for all active SKUs
    active_skus = get_active_skus()
    snapshot_skus = get_snapshot_skus(date)
    missing = set(active_skus) - set(snapshot_skus)
    if missing:
        create_alert("MISSING_INVENTORY_DATA", f"No snapshot for {len(missing)} SKUs")
    
    # Sales data exists
    sales_skus = get_sales_skus(date)
    # Note: Zero sales is valid, but should have record
    
    # Metrics calculated for all SKUs
    metrics_skus = get_metrics_skus(date)
    missing_metrics = set(active_skus) - set(metrics_skus)
    if missing_metrics:
        create_alert("MISSING_METRICS", f"No metrics for {len(missing_metrics)} SKUs")
```

---

### Data Reconciliation

**Weekly Reconciliation:**
```python
def reconcile_data():
    # Compare calculated inventory vs Amazon reported
    for sku in active_skus:
        calculated = sum_inventory_changes(sku, last_week)
        amazon_reported = get_current_stock(sku)
        
        diff = abs(calculated - amazon_reported)
        if diff > 5:  # More than 5 unit discrepancy
            create_alert("INVENTORY_RECONCILIATION_ERROR", 
                        f"SKU {sku}: Calculated {calculated}, Amazon says {amazon_reported}")
    
    # Verify sales sum to revenue
    total_sales_revenue = sum(sku.revenue for all SKUs)
    amazon_total_revenue = get_amazon_total_revenue(period)
    
    if abs(total_sales_revenue - amazon_total_revenue) > 10.00:
        create_alert("REVENUE_RECONCILIATION_ERROR",
                    f"Calculated ${total_sales_revenue}, Amazon ${amazon_total_revenue}")
```

---

## API Integration Guide

### Amazon SP-API Setup

**Prerequisites:**
1. Amazon Seller Central account
2. Developer account registration
3. SP-API access approved
4. LWA (Login with Amazon) credentials

**Authentication:**
```python
import requests
from datetime import datetime, timedelta

class AmazonSPAPI:
    def __init__(self, refresh_token, client_id, client_secret):
        self.refresh_token = refresh_token
        self.client_id = client_id
        self.client_secret = client_secret
        self.access_token = None
        self.token_expiry = None
        
    def get_access_token(self):
        """Get LWA access token"""
        if self.access_token and datetime.now() < self.token_expiry:
            return self.access_token
            
        url = "https://api.amazon.com/auth/o2/token"
        data = {
            "grant_type": "refresh_token",
            "refresh_token": self.refresh_token,
            "client_id": self.client_id,
            "client_secret": self.client_secret
        }
        
        response = requests.post(url, data=data)
        response.raise_for_status()
        
        token_data = response.json()
        self.access_token = token_data['access_token']
        self.token_expiry = datetime.now() + timedelta(seconds=token_data['expires_in'] - 60)
        
        return self.access_token
```

**Fetch Inventory:**
```python
def fetch_inventory(self):
    """Fetch FBA inventory summary"""
    access_token = self.get_access_token()
    
    url = "https://sellingpartnerapi-na.amazon.com/fba/inventory/v1/summaries"
    headers = {
        "x-amz-access-token": access_token,
        "x-amz-date": datetime.utcnow().strftime('%Y%m%dT%H%M%SZ')
    }
    
    params = {
        "details": "true",
        "granularityType": "Marketplace",
        "granularityId": "ATVPDKIKX0DER",  # US marketplace
        "marketplaceIds": "ATVPDKIKX0DER"
    }
    
    response = requests.get(url, headers=headers, params=params)
    response.raise_for_status()
    
    return response.json()
```

**Fetch Sales:**
```python
def fetch_sales(self, start_date, end_date):
    """Fetch sales metrics by ASIN"""
    access_token = self.get_access_token()
    
    url = "https://sellingpartnerapi-na.amazon.com/sales/v1/orderMetrics"
    headers = {
        "x-amz-access-token": access_token
    }
    
    params = {
        "marketplaceIds": "ATVPDKIKX0DER",
        "interval": f"{start_date.isoformat()}--{end_date.isoformat()}",
        "granularity": "Day",
        "asin": "B08XYZ123"  # Repeat for each ASIN
    }
    
    response = requests.get(url, headers=headers, params=params)
    response.raise_for_status()
    
    return response.json()
```

---

### Rate Limiting

**SP-API Rate Limits:**
```
Inventory API: 30 requests/min
Sales API: 10 requests/min
Fees API: 10 requests/min
```

**Implementation:**
```python
import time
from functools import wraps

def rate_limit(max_per_minute):
    min_interval = 60.0 / max_per_minute
    last_called = [0.0]
    
    def decorator(func):
        @wraps(func)
        def wrapper(*args, **kwargs):
            elapsed = time.time() - last_called[0]
            wait_time = min_interval - elapsed
            if wait_time > 0:
                time.sleep(wait_time)
            
            result = func(*args, **kwargs)
            last_called[0] = time.time()
            return result
        return wrapper
    return decorator

@rate_limit(30)  # 30 requests/min
def fetch_inventory_with_rate_limit(self):
    return self.fetch_inventory()
```

---

### Error Handling

```python
def fetch_with_retry(self, fetch_func, max_retries=3):
    """Fetch with exponential backoff retry"""
    for attempt in range(max_retries):
        try:
            return fetch_func()
        except requests.exceptions.HTTPError as e:
            if e.response.status_code == 429:  # Rate limit
                wait_time = 2 ** attempt  # Exponential backoff
                time.sleep(wait_time)
                continue
            elif e.response.status_code >= 500:  # Server error
                wait_time = 2 ** attempt
                time.sleep(wait_time)
                continue
            else:
                raise  # Other errors, don't retry
        except requests.exceptions.ConnectionError:
            wait_time = 2 ** attempt
            time.sleep(wait_time)
            continue
    
    raise Exception(f"Failed after {max_retries} retries")
```

---

### Data Pipeline Architecture

**Recommended Flow:**
```
1. Daily Overnight Batch (2:00 AM)
   ├─ Fetch inventory snapshots (all SKUs)
   ├─ Fetch previous day sales (all SKUs)
   ├─ Store raw data (JSON or DB)
   └─ Trigger calculation pipeline

2. Calculation Pipeline (3:00 AM)
   ├─ Calculate metrics for all SKUs
   ├─ Run decision trees (restock/liquidate)
   ├─ Generate recommendations
   └─ Create alerts

3. Alert Delivery (4:00 AM)
   ├─ Email critical alerts
   ├─ SMS for urgent stockouts
   └─ Update dashboard

4. Weekly Report (Monday 8:00 AM)
   ├─ Generate restock report
   ├─ Liquidation priority list
   ├─ Performance summary
   └─ Email to Tim
```

**Orchestration (Using Cron or Airflow):**
```bash
# crontab -e

# Daily data fetch (2 AM)
0 2 * * * /usr/bin/python3 /path/to/fetch_amazon_data.py

# Daily calculations (3 AM)
0 3 * * * /usr/bin/python3 /path/to/calculate_metrics.py

# Weekly report (Monday 8 AM)
0 8 * * 1 /usr/bin/python3 /path/to/generate_weekly_report.py

# Monthly storage fee update (1st of month)
0 6 1 * * /usr/bin/python3 /path/to/fetch_storage_fees.py
```

---

## Data Security & Privacy

**Sensitive Data:**
- Amazon API credentials (refresh token, client ID/secret)
- Financial data (COGS, margins)
- Supplier contacts and terms

**Protection:**
```
1. API Credentials
   - Store in environment variables (never in code)
   - Use secrets manager (AWS Secrets Manager, HashiCorp Vault)
   - Rotate refresh tokens periodically

2. Database
   - Encrypt at rest (if cloud-hosted)
   - Restrict access (firewall, VPN)
   - Regular backups

3. Exports/Reports
   - Password-protect Excel files if emailed
   - Use secure file transfer (not plain email attachment)
```

**Example .env file:**
```bash
# .env (never commit to git)
AMAZON_REFRESH_TOKEN=Atzr|IwEBIC...
AMAZON_CLIENT_ID=amzn1.application-oa2-client...
AMAZON_CLIENT_SECRET=1a2b3c4d5e...
DATABASE_URL=postgresql://user:pass@localhost:5432/visualize
```

---

## Testing Data

**For development/testing, use synthetic data:**

```python
def generate_test_data():
    """Generate realistic test data for development"""
    
    test_skus = []
    for i in range(50):  # 50 test SKUs
        sku = {
            "asin": f"B08TEST{i:03d}",
            "sku": f"VIS-TEST-{i:03d}",
            "product_name": f"Test Golf Product {i}",
            
            # Random but realistic values
            "current_stock": random.randint(100, 2000),
            "daily_velocity": random.uniform(1, 50),
            "cogs": random.uniform(2, 20),
            "list_price": random.uniform(10, 100),
            "volume_cubic_feet": random.uniform(0.1, 1.0),
            
            # Sales history (90 days)
            "sales_history": [
                random.randint(0, int(daily_velocity * 1.5))
                for _ in range(90)
            ]
        }
        test_skus.append(sku)
    
    return test_skus
```

---

**Document End**

This comprehensive data specification provides everything needed to build the inventory intelligence system. Actual Amazon SP-API credentials and setup would be required for production deployment.
