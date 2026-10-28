# Integration Architecture for VISUALIZE Sports Dashboard

*Last Updated: March 26, 2026*

This document provides the technical architecture for integrating with Amazon's Selling Partner API (SP-API) and Amazon Advertising API. It covers endpoint selection, rate limiting, error handling, and sample code structures.

---

## Table of Contents

1. [Architecture Overview](#architecture-overview)
2. [API Selection](#api-selection)
3. [Authentication Flow](#authentication-flow)
4. [Rate Limiting Strategy](#rate-limiting-strategy)
5. [Data Refresh Schedules](#data-refresh-schedules)
6. [Error Handling](#error-handling)
7. [Code Structure](#code-structure)
8. [Security & Credentials](#security--credentials)
9. [Sample Implementations](#sample-implementations)

---

## Architecture Overview

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                        VISUALIZE Sports Dashboard                            │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│   ┌──────────────┐     ┌──────────────┐     ┌──────────────┐               │
│   │   Frontend   │────▶│   Backend    │────▶│   Database   │               │
│   │   (React)    │     │   (Python)   │     │  (SQLite/PG) │               │
│   └──────────────┘     └──────┬───────┘     └──────────────┘               │
│                               │                                              │
│                               ▼                                              │
│   ┌───────────────────────────────────────────────────────────────────┐    │
│   │                     API Integration Layer                          │    │
│   │  ┌─────────────────┐  ┌─────────────────┐  ┌─────────────────┐   │    │
│   │  │  Token Manager  │  │  Rate Limiter   │  │  Error Handler  │   │    │
│   │  └────────┬────────┘  └────────┬────────┘  └────────┬────────┘   │    │
│   │           │                     │                     │            │    │
│   │           └─────────────────────┼─────────────────────┘            │    │
│   │                                 ▼                                   │    │
│   │                      ┌──────────────────┐                          │    │
│   │                      │   HTTP Client    │                          │    │
│   │                      └────────┬─────────┘                          │    │
│   └───────────────────────────────┼────────────────────────────────────┘    │
│                                   │                                          │
└───────────────────────────────────┼──────────────────────────────────────────┘
                                    │
                                    ▼
┌───────────────────────────────────────────────────────────────────────────────┐
│                              Amazon APIs                                       │
│  ┌─────────────────────┐  ┌─────────────────────┐  ┌─────────────────────┐   │
│  │  Selling Partner    │  │  Amazon Ads API     │  │  Login with Amazon  │   │
│  │  API (SP-API)       │  │  (Advertising)      │  │  (LWA OAuth)        │   │
│  └─────────────────────┘  └─────────────────────┘  └─────────────────────┘   │
└───────────────────────────────────────────────────────────────────────────────┘
```

---

## API Selection

### Two Separate APIs

Amazon provides two distinct APIs for seller data:

| API | Purpose | Auth | Docs |
|-----|---------|------|------|
| **SP-API** | Orders, Inventory, Products, Reports | LWA OAuth | developer-docs.amazon.com/sp-api |
| **Amazon Ads API** | Advertising campaigns, keywords, performance | Separate LWA | advertising.amazon.com/API |

⚠️ **Important:** These are separate systems with separate credentials!

### SP-API Endpoints (Primary)

| Data Need | API Endpoint | Version | Notes |
|-----------|--------------|---------|-------|
| **Orders** | Orders API | v0 | Real-time order data |
| **Order Items** | Orders API | v0 | Line items within orders |
| **Inventory (FBA)** | FBA Inventory API | v1 | Current stock levels |
| **Products** | Catalog Items API | v2022-04-01 | Product details, ASINs |
| **Pricing** | Product Pricing API | v0 | Current prices, Buy Box |
| **Reports** | Reports API | v2021-06-30 | Bulk data extraction |

### Amazon Ads API Endpoints

| Data Need | Endpoint | Notes |
|-----------|----------|-------|
| **Campaigns** | Campaigns (SP/SB/SD) | Campaign management |
| **Performance** | Reports | Daily/hourly metrics |
| **Keywords** | Keywords/Targets | Keyword performance |

### Recommended Report Types

For bulk data, use Reports API instead of individual calls:

```python
# High-value reports for VISUALIZE
USEFUL_REPORTS = {
    'GET_FLAT_FILE_OPEN_LISTINGS_DATA': 'Active listings',
    'GET_MERCHANT_LISTINGS_ALL_DATA': 'All product data',
    'GET_FBA_MYI_ALL_INVENTORY_DATA': 'FBA inventory details',
    'GET_FLAT_FILE_ALL_ORDERS_DATA_BY_LAST_UPDATE_GENERAL': 'Order history',
    'GET_FBA_FULFILLMENT_INVENTORY_HEALTH_DATA': 'Inventory health',
    'GET_SALES_AND_TRAFFIC_REPORT': 'Traffic and conversions',
}
```

---

## Authentication Flow

### LWA (Login with Amazon) OAuth Flow

```
┌─────────────────────────────────────────────────────────────────────┐
│                     Token Exchange Process                           │
├─────────────────────────────────────────────────────────────────────┤
│                                                                      │
│  1. Application starts with:                                         │
│     • Client ID                                                      │
│     • Client Secret                                                  │
│     • Refresh Token                                                  │
│                                                                      │
│  2. Exchange refresh token for access token:                         │
│                                                                      │
│     POST https://api.amazon.com/auth/o2/token                       │
│     Content-Type: application/x-www-form-urlencoded                 │
│                                                                      │
│     grant_type=refresh_token                                         │
│     refresh_token={your_refresh_token}                              │
│     client_id={your_client_id}                                      │
│     client_secret={your_client_secret}                              │
│                                                                      │
│  3. Response:                                                        │
│     {                                                                │
│       "access_token": "Atza|...",                                   │
│       "token_type": "bearer",                                       │
│       "expires_in": 3600                                            │
│     }                                                                │
│                                                                      │
│  4. Use access token in API requests:                               │
│     Authorization: Bearer {access_token}                             │
│                                                                      │
│  5. Repeat step 2 when access token expires (~1 hour)               │
│                                                                      │
└─────────────────────────────────────────────────────────────────────┘
```

### Token Manager Implementation

```python
import time
import requests
from threading import Lock

class TokenManager:
    """
    Manages LWA access tokens with automatic refresh.
    Thread-safe for concurrent API calls.
    """
    
    def __init__(self, client_id: str, client_secret: str, refresh_token: str):
        self.client_id = client_id
        self.client_secret = client_secret
        self.refresh_token = refresh_token
        self.access_token = None
        self.token_expiry = 0
        self._lock = Lock()
        self.TOKEN_URL = "https://api.amazon.com/auth/o2/token"
    
    def get_access_token(self) -> str:
        """Get a valid access token, refreshing if needed."""
        with self._lock:
            # Refresh if token expires within 5 minutes
            if time.time() > (self.token_expiry - 300):
                self._refresh_token()
            return self.access_token
    
    def _refresh_token(self):
        """Exchange refresh token for new access token."""
        response = requests.post(
            self.TOKEN_URL,
            data={
                'grant_type': 'refresh_token',
                'refresh_token': self.refresh_token,
                'client_id': self.client_id,
                'client_secret': self.client_secret,
            },
            headers={'Content-Type': 'application/x-www-form-urlencoded'}
        )
        
        if response.status_code != 200:
            raise Exception(f"Token refresh failed: {response.text}")
        
        data = response.json()
        self.access_token = data['access_token']
        self.token_expiry = time.time() + data['expires_in']
```

---

## Rate Limiting Strategy

### Understanding Amazon's Limits

Amazon uses a "token bucket" rate limiting system:

- Each API operation has a **rate** (requests per second)
- And a **burst** (maximum requests in a burst)

Example:
```
getOrders: rate=0.0167/second (1 per minute), burst=20
```

This means:
- You can make up to 20 requests immediately
- Then 1 request per minute to refill the bucket

### Rate Limits by Endpoint

| Endpoint | Rate (req/sec) | Burst | Recovery |
|----------|---------------|-------|----------|
| getOrders | 0.0167 | 20 | ~1/min |
| getOrderItems | 0.5 | 30 | 2/sec |
| getInventorySummaries | 2.0 | 2 | 2/sec |
| getCatalogItem | 2.0 | 2 | 2/sec |
| createReport | 0.0167 | 15 | ~1/min |
| getReportDocument | 0.0167 | 15 | ~1/min |

### Rate Limiter Implementation

```python
import time
from collections import defaultdict
from threading import Lock

class RateLimiter:
    """
    Token bucket rate limiter for SP-API compliance.
    """
    
    # Rate limits per operation (rate per second, burst)
    LIMITS = {
        'getOrders': (0.0167, 20),
        'getOrderItems': (0.5, 30),
        'getInventorySummaries': (2.0, 2),
        'getCatalogItem': (2.0, 2),
        'createReport': (0.0167, 15),
        'getReportDocument': (0.0167, 15),
    }
    
    def __init__(self):
        self.buckets = defaultdict(lambda: {'tokens': 0, 'last_update': time.time()})
        self._lock = Lock()
    
    def wait_for_capacity(self, operation: str):
        """Block until rate limit allows the request."""
        rate, burst = self.LIMITS.get(operation, (1.0, 10))
        
        with self._lock:
            bucket = self.buckets[operation]
            now = time.time()
            
            # Refill tokens based on time elapsed
            elapsed = now - bucket['last_update']
            bucket['tokens'] = min(burst, bucket['tokens'] + (elapsed * rate))
            bucket['last_update'] = now
            
            # If no tokens, calculate wait time
            if bucket['tokens'] < 1:
                wait_time = (1 - bucket['tokens']) / rate
                time.sleep(wait_time)
                bucket['tokens'] = 0
            else:
                bucket['tokens'] -= 1
```

### Exponential Backoff for Throttling

```python
import time
import random
from functools import wraps

def retry_with_backoff(max_retries=5, base_delay=1, max_delay=60):
    """
    Decorator for retrying throttled requests with exponential backoff.
    """
    def decorator(func):
        @wraps(func)
        def wrapper(*args, **kwargs):
            retries = 0
            while retries < max_retries:
                try:
                    return func(*args, **kwargs)
                except ThrottlingException as e:
                    retries += 1
                    if retries == max_retries:
                        raise
                    
                    # Exponential backoff with jitter
                    delay = min(base_delay * (2 ** retries) + random.uniform(0, 1), max_delay)
                    print(f"Throttled. Retrying in {delay:.2f}s (attempt {retries}/{max_retries})")
                    time.sleep(delay)
            
            return func(*args, **kwargs)
        return wrapper
    return decorator
```

---

## Data Refresh Schedules

### Recommended Refresh Frequencies

| Data Type | Frequency | Method | Rationale |
|-----------|-----------|--------|-----------|
| **Orders** | 15 min | Orders API | Near real-time for processing |
| **Inventory** | 1 hour | FBA Inventory API | Balance freshness vs rate limits |
| **Products** | Daily | Catalog Items API | Rarely changes |
| **Pricing** | 4 hours | Product Pricing API | Monitor Buy Box |
| **Advertising** | 6 hours | Ads Reports API | Daily metrics sufficient |
| **Sales Reports** | Daily | Reports API | Historical data |

### Scheduler Implementation

```python
from apscheduler.schedulers.background import BackgroundScheduler

def create_scheduler(data_service):
    """
    Create scheduler for periodic data refreshes.
    """
    scheduler = BackgroundScheduler()
    
    # Orders - every 15 minutes
    scheduler.add_job(
        data_service.sync_orders,
        'interval',
        minutes=15,
        id='sync_orders'
    )
    
    # Inventory - every hour
    scheduler.add_job(
        data_service.sync_inventory,
        'interval',
        hours=1,
        id='sync_inventory'
    )
    
    # Products - daily at 2 AM
    scheduler.add_job(
        data_service.sync_products,
        'cron',
        hour=2,
        id='sync_products'
    )
    
    # Pricing - every 4 hours
    scheduler.add_job(
        data_service.sync_pricing,
        'interval',
        hours=4,
        id='sync_pricing'
    )
    
    # Advertising - every 6 hours
    scheduler.add_job(
        data_service.sync_advertising,
        'interval',
        hours=6,
        id='sync_advertising'
    )
    
    return scheduler
```

---

## Error Handling

### Error Categories

| HTTP Code | Type | Retry? | Action |
|-----------|------|--------|--------|
| 400 | Bad Request | No | Fix request parameters |
| 401 | Unauthorized | Yes* | Refresh access token |
| 403 | Forbidden | No | Check permissions/roles |
| 404 | Not Found | No | Resource doesn't exist |
| 429 | Throttled | Yes | Exponential backoff |
| 500 | Server Error | Yes | Retry with backoff |
| 503 | Service Unavailable | Yes | Retry after delay |

### Error Response Structure

```python
class SPAPIError(Exception):
    """Base exception for SP-API errors."""
    
    def __init__(self, code: str, message: str, details: dict = None):
        self.code = code
        self.message = message
        self.details = details or {}
        super().__init__(f"{code}: {message}")

class ThrottlingException(SPAPIError):
    """Raised when rate limited."""
    pass

class AuthorizationException(SPAPIError):
    """Raised for auth errors."""
    pass
```

### Error Handler Implementation

```python
import logging

logger = logging.getLogger(__name__)

def handle_api_response(response):
    """
    Process API response and raise appropriate exceptions.
    """
    if response.status_code == 200:
        return response.json()
    
    error_body = response.json() if response.text else {}
    errors = error_body.get('errors', [{}])
    error = errors[0] if errors else {}
    
    code = error.get('code', 'UnknownError')
    message = error.get('message', 'Unknown error occurred')
    
    if response.status_code == 429:
        logger.warning(f"Rate limited: {message}")
        raise ThrottlingException(code, message)
    
    if response.status_code == 401:
        logger.error(f"Authorization failed: {message}")
        raise AuthorizationException(code, message)
    
    if response.status_code >= 500:
        logger.error(f"Server error: {message}")
        raise SPAPIError(code, message)
    
    logger.error(f"API error {response.status_code}: {message}")
    raise SPAPIError(code, message)
```

---

## Code Structure

### Recommended Project Layout

```
visualize-amazon/
├── src/
│   ├── api/
│   │   ├── __init__.py
│   │   ├── auth.py           # TokenManager
│   │   ├── client.py         # Base HTTP client
│   │   ├── rate_limiter.py   # Rate limiting
│   │   └── errors.py         # Exception classes
│   │
│   ├── services/
│   │   ├── __init__.py
│   │   ├── orders.py         # Orders sync
│   │   ├── inventory.py      # Inventory sync
│   │   ├── products.py       # Product catalog
│   │   ├── advertising.py    # Ads performance
│   │   └── reports.py        # Reports API
│   │
│   ├── db/
│   │   ├── __init__.py
│   │   ├── models.py         # SQLAlchemy models
│   │   ├── migrations/       # Database migrations
│   │   └── queries.py        # Common queries
│   │
│   └── scheduler/
│       ├── __init__.py
│       └── jobs.py           # Scheduled tasks
│
├── config/
│   ├── __init__.py
│   ├── settings.py           # App configuration
│   └── logging.py            # Logging config
│
├── tests/
│   └── ...
│
├── docs/                     # This documentation
│   ├── SP_API_SETUP_GUIDE.md
│   ├── DATA_MODELS.md
│   ├── INTEGRATION_ARCHITECTURE.md
│   └── api-integration-notes.md
│
├── requirements.txt
├── .env.example
└── README.md
```

---

## Security & Credentials

### Environment Variables

```bash
# .env file (NEVER commit this!)

# SP-API Credentials
SP_API_CLIENT_ID=amzn1.application-oa2-client.xxxxx
SP_API_CLIENT_SECRET=xxxxxxxxxxxxxxxxxxxxxxxxxxxxx
SP_API_REFRESH_TOKEN=Atzr|xxxxxxxxxxxxxxxxxxxxxxxxxx

# Amazon Ads API (separate credentials)
ADS_CLIENT_ID=amzn1.application-oa2-client.yyyyy
ADS_CLIENT_SECRET=yyyyyyyyyyyyyyyyyyyyyyyyyyyyy
ADS_REFRESH_TOKEN=Atzr|yyyyyyyyyyyyyyyyyyyyyyyyyy

# Account Info
SELLER_ID=AXXXXXXXXXX
MARKETPLACE_ID=ATVPDKIKX0DER

# Database
DATABASE_URL=postgresql://user:pass@localhost/visualize
```

### Credentials Configuration Class

```python
import os
from dataclasses import dataclass
from typing import Optional

@dataclass
class SPAPIConfig:
    """Configuration for SP-API authentication."""
    client_id: str
    client_secret: str
    refresh_token: str
    seller_id: str
    marketplace_id: str = "ATVPDKIKX0DER"  # US default
    
    @classmethod
    def from_env(cls) -> 'SPAPIConfig':
        """Load configuration from environment variables."""
        return cls(
            client_id=os.environ['SP_API_CLIENT_ID'],
            client_secret=os.environ['SP_API_CLIENT_SECRET'],
            refresh_token=os.environ['SP_API_REFRESH_TOKEN'],
            seller_id=os.environ['SELLER_ID'],
            marketplace_id=os.environ.get('MARKETPLACE_ID', 'ATVPDKIKX0DER'),
        )

@dataclass  
class AdsAPIConfig:
    """Configuration for Amazon Ads API authentication."""
    client_id: str
    client_secret: str
    refresh_token: str
    profile_id: Optional[str] = None
    
    @classmethod
    def from_env(cls) -> 'AdsAPIConfig':
        return cls(
            client_id=os.environ['ADS_CLIENT_ID'],
            client_secret=os.environ['ADS_CLIENT_SECRET'],
            refresh_token=os.environ['ADS_REFRESH_TOKEN'],
            profile_id=os.environ.get('ADS_PROFILE_ID'),
        )
```

### Secret Storage Best Practices

1. **Never commit credentials** - Use `.gitignore` for `.env` files
2. **Use environment variables** - Load secrets from environment
3. **Consider secret managers** - AWS Secrets Manager, HashiCorp Vault
4. **Rotate regularly** - Especially if compromised
5. **Limit access** - Use minimal required permissions

---

## Sample Implementations

### Complete Orders Sync Example

```python
"""
orders.py - Orders synchronization service
"""

from datetime import datetime, timedelta, timezone
from typing import List, Optional
from sp_api.api import Orders
from sp_api.base import Marketplaces

from ..api.auth import TokenManager
from ..api.rate_limiter import RateLimiter
from ..api.errors import handle_api_response
from ..db.models import Order, OrderItem

class OrdersService:
    """
    Service for syncing orders from Amazon SP-API.
    """
    
    def __init__(self, config, db_session):
        self.config = config
        self.db = db_session
        self.client = Orders(
            credentials={
                'refresh_token': config.refresh_token,
                'lwa_app_id': config.client_id,
                'lwa_client_secret': config.client_secret,
            },
            marketplace=Marketplaces.US
        )
        self.rate_limiter = RateLimiter()
    
    def sync_recent_orders(self, hours: int = 24) -> int:
        """
        Sync orders from the last N hours.
        Returns count of orders synced.
        """
        created_after = (
            datetime.now(timezone.utc) - timedelta(hours=hours)
        ).isoformat()
        
        orders_synced = 0
        next_token = None
        
        while True:
            # Respect rate limits
            self.rate_limiter.wait_for_capacity('getOrders')
            
            # Fetch orders
            response = self.client.get_orders(
                CreatedAfter=created_after,
                MarketplaceIds=[self.config.marketplace_id],
                NextToken=next_token
            )
            
            orders = response.payload.get('Orders', [])
            
            for order_data in orders:
                self._upsert_order(order_data)
                orders_synced += 1
            
            # Check for more pages
            next_token = response.payload.get('NextToken')
            if not next_token:
                break
        
        self.db.commit()
        return orders_synced
    
    def _upsert_order(self, order_data: dict):
        """Insert or update an order in the database."""
        amazon_order_id = order_data['AmazonOrderId']
        
        # Check if order exists
        existing = self.db.query(Order).filter_by(
            amazon_order_id=amazon_order_id
        ).first()
        
        if existing:
            # Update existing order
            existing.order_status = order_data.get('OrderStatus')
            existing.last_update_date = order_data.get('LastUpdateDate')
            existing.updated_at = datetime.utcnow()
        else:
            # Create new order
            order = Order(
                amazon_order_id=amazon_order_id,
                seller_id=self.config.seller_id,
                purchase_date=order_data['PurchaseDate'],
                order_status=order_data.get('OrderStatus'),
                fulfillment_channel=order_data.get('FulfillmentChannel'),
                order_total_amount=self._get_amount(order_data.get('OrderTotal')),
                is_prime=order_data.get('IsPrime', False),
            )
            self.db.add(order)
            
            # Sync order items
            self._sync_order_items(amazon_order_id)
    
    def _sync_order_items(self, amazon_order_id: str):
        """Fetch and store order line items."""
        self.rate_limiter.wait_for_capacity('getOrderItems')
        
        response = self.client.get_order_items(amazon_order_id)
        items = response.payload.get('OrderItems', [])
        
        for item_data in items:
            item = OrderItem(
                amazon_order_id=amazon_order_id,
                order_item_id=item_data['OrderItemId'],
                asin=item_data['ASIN'],
                seller_sku=item_data.get('SellerSKU'),
                title=item_data.get('Title'),
                quantity_ordered=item_data.get('QuantityOrdered', 0),
                item_price_amount=self._get_amount(item_data.get('ItemPrice')),
            )
            self.db.add(item)
    
    def _get_amount(self, money_dict: Optional[dict]) -> Optional[float]:
        """Extract amount from Amazon money object."""
        if money_dict and 'Amount' in money_dict:
            return float(money_dict['Amount'])
        return None
```

### Using the python-amazon-sp-api Library

For quick implementation, use the community library:

```bash
pip install python-amazon-sp-api
```

```python
"""
Quick start with python-amazon-sp-api library
"""

from sp_api.api import Orders, Sellers, FbaInventory, CatalogItems
from sp_api.base import Marketplaces
from sp_api.util import throttle_retry, load_all_pages

# Configure credentials
credentials = {
    'refresh_token': 'YOUR_REFRESH_TOKEN',
    'lwa_app_id': 'YOUR_CLIENT_ID',
    'lwa_client_secret': 'YOUR_CLIENT_SECRET',
}

# Test connection
sellers = Sellers(credentials=credentials, marketplace=Marketplaces.US)
participations = sellers.get_marketplace_participations()
print(f"Connected to: {participations.payload}")

# Get orders with automatic retry on throttling
@throttle_retry(tries=5, delay=5)
def get_recent_orders():
    orders = Orders(credentials=credentials, marketplace=Marketplaces.US)
    return orders.get_orders(CreatedAfter='2026-03-01T00:00:00Z')

orders_response = get_recent_orders()
print(f"Found {len(orders_response.payload.get('Orders', []))} orders")

# Get all orders with automatic pagination
@throttle_retry(tries=5, delay=5)
@load_all_pages()
def get_all_orders(**kwargs):
    orders = Orders(credentials=credentials, marketplace=Marketplaces.US)
    return orders.get_orders(**kwargs)

for page in get_all_orders(CreatedAfter='2026-03-01T00:00:00Z'):
    for order in page.payload.get('Orders', []):
        print(f"Order: {order['AmazonOrderId']}")

# Get FBA inventory
inventory = FbaInventory(credentials=credentials, marketplace=Marketplaces.US)
inventory_response = inventory.get_inventory_summaries(
    granularityType='Marketplace',
    granularityId='ATVPDKIKX0DER',
    marketplaceIds=['ATVPDKIKX0DER']
)

for item in inventory_response.payload.get('inventorySummaries', []):
    print(f"{item['sellerSku']}: {item.get('totalQuantity', 0)} units")
```

---

## Next Steps

1. **Tim provides credentials** → Copy to `.env` file
2. **Run test connection** → Verify access works
3. **Implement sync services** → Start with orders
4. **Set up scheduler** → Automate data refresh
5. **Build dashboard UI** → Display synced data

See also:
- `SP_API_SETUP_GUIDE.md` - Getting credentials
- `DATA_MODELS.md` - Database schemas
- `api-integration-notes.md` - Working notes and recommendations
