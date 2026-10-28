# API Integration Notes & Recommendations

*Working notes for VISUALIZE Sports Amazon integration*
*Last Updated: March 26, 2026*

---

## Executive Summary

This document captures key decisions, recommendations, and lessons learned while designing the SP-API integration for VISUALIZE Sports. It's meant to help the Phase 2 implementation team avoid pitfalls and make informed choices.

---

## Key Recommendations

### 1. Use Python Over Node.js

**Recommendation:** Python with `python-amazon-sp-api` library

**Why:**
- Most mature community library for SP-API
- Excellent documentation and examples
- Built-in retry/throttle handling
- Active maintenance (last update: recent)
- Tim's team has Python familiarity

**Alternative considered:** Node.js with `amazon-sp-api` package
- Less mature than Python equivalent
- Fewer examples in Amazon's official docs
- Would work, but Python is lower risk

### 2. Start Simple, Scale Later

**Phase 1 (MVP):**
- SQLite database (local file, no setup)
- Single-threaded sync jobs
- Basic error logging
- Manual credential management

**Phase 2 (Production):**
- PostgreSQL database
- Background workers (Celery or similar)
- Structured logging with alerts
- Secret management (env vars or vault)

**Don't over-engineer initially.** Get data flowing first.

### 3. Reports API for Bulk Data

For historical or bulk data, prefer the Reports API over individual endpoint calls:

| Need | Slow Way | Fast Way |
|------|----------|----------|
| All orders last 30 days | getOrders (paginated, rate limited) | GET_FLAT_FILE_ALL_ORDERS_DATA_BY_LAST_UPDATE |
| Full inventory snapshot | getInventorySummaries (paginated) | GET_FBA_MYI_ALL_INVENTORY_DATA |
| Product catalog | getCatalogItem per ASIN | GET_MERCHANT_LISTINGS_ALL_DATA |

**Report workflow:**
1. Create report request
2. Poll for completion (typically 5-15 minutes)
3. Download compressed file
4. Parse TSV/CSV data
5. Import to database

### 4. Two Separate API Systems

**Critical understanding:** SP-API and Amazon Ads API are completely separate:

| Aspect | SP-API | Amazon Ads API |
|--------|--------|----------------|
| Purpose | Seller operations | Advertising |
| Credentials | One set | Different set |
| Developer registration | Seller Central | advertising.amazon.com |
| Documentation | developer-docs.amazon.com/sp-api | advertising.amazon.com/API |
| Rate limits | Different per endpoint | Different system |

**Implication:** You need TWO developer registrations and TWO sets of credentials.

### 5. Advertising API Considerations

The Amazon Advertising API has additional complexity:

1. **Profile ID required** - After auth, you must discover your advertising profile ID
2. **Async reports** - Performance data comes via async report generation
3. **Attribution windows** - Sales are attributed 1d, 7d, 14d, or 30d after click
4. **Separate endpoints by ad type** - Sponsored Products, Brands, Display all different

**Recommendation:** Implement SP-API first, add Advertising later as a separate module.

---

## Potential Pitfalls

### 1. Token Refresh Timing

**Problem:** Access tokens expire in 1 hour. If you cache and don't track expiry, calls fail.

**Solution:** 
- Always check expiry before using cached token
- Refresh when within 5 minutes of expiry (buffer)
- Use the TokenManager pattern in INTEGRATION_ARCHITECTURE.md

### 2. Rate Limit Accumulation

**Problem:** Rate limits are per-endpoint, per-seller. Making many calls quickly exhausts your bucket.

**Solution:**
- Implement rate limiter per endpoint
- Use bulk endpoints (Reports API) when possible
- Don't sync more frequently than needed
- Monitor for 429 responses

### 3. Pagination Forgetting

**Problem:** Amazon's APIs return paginated results. Forgetting to follow NextToken leaves data incomplete.

**Solution:**
- Always check for NextToken in response
- Use library decorators like `@load_all_pages()`
- Log page counts for debugging

### 4. Currency Assumptions

**Problem:** Financial fields come as `{"Amount": "29.99", "CurrencyCode": "USD"}`. Not just numbers.

**Solution:**
- Always extract Amount AND CurrencyCode
- Store currency in database
- Convert/validate when displaying

### 5. Timezone Confusion

**Problem:** Amazon timestamps are ISO 8601 UTC. Local time confusion causes data gaps or duplicates.

**Solution:**
- Store everything as UTC in database
- Convert to local time only for display
- Use timezone-aware datetime libraries

### 6. Sandbox vs Production

**Problem:** SP-API sandbox uses mock data and different endpoints. Forgetting to switch causes confusion.

**Solution:**
- Use environment variables for endpoint URLs
- Test in sandbox first, then switch to production
- Never use production credentials in development logs

---

## Architecture Decisions

### Decision 1: Pull vs Push

**Options:**
- **Pull:** Dashboard polls Amazon APIs periodically
- **Push:** Use Amazon notifications (ORDER_CHANGE, etc.)

**Chosen:** Pull (polling) for MVP

**Rationale:**
- Simpler to implement
- No infrastructure needed for webhook endpoints
- Notifications require SQS queue setup
- Polling at 15-minute intervals is sufficient for dashboard

**Future:** Consider notifications for real-time needs.

### Decision 2: Database Choice

**Options:**
- SQLite (simple, no setup)
- PostgreSQL (production-ready)
- MongoDB (flexible schema)

**Chosen:** SQLite for MVP, PostgreSQL for production

**Rationale:**
- SQLite requires zero setup for development
- Easy to transition to PostgreSQL (same SQL)
- MongoDB's flexibility not needed (schema is well-defined)

### Decision 3: Historical Data Depth

**Options:**
- Sync all historical data (years)
- Sync recent data (30-90 days)
- Sync on-demand

**Chosen:** 90 days initial sync, then incremental

**Rationale:**
- VISUALIZE is in wind-down (1-2 years remaining)
- 90 days gives enough trend data
- Reduces initial load time
- Can backfill more if needed

### Decision 4: Denormalization Strategy

**Options:**
- Fully normalized (no duplication)
- Pre-aggregated summaries (some duplication)
- Event sourcing (full history)

**Chosen:** Pre-aggregated summaries (daily_sales_summary table)

**Rationale:**
- Dashboard queries need fast aggregates
- Calculating sums on every page load is slow
- Storage is cheap, query speed matters
- Raw data still available for deep analysis

---

## Implementation Priorities

### Priority 1: Core Data (Week 1)
1. ✅ Set up credentials (Tim action)
2. Orders sync (most valuable for revenue tracking)
3. Inventory sync (critical for stock management)
4. Daily aggregation job

### Priority 2: Product Data (Week 2)
1. Product catalog sync
2. Pricing data capture
3. Category/ranking tracking

### Priority 3: Advertising (Week 3-4)
1. Separate Ads API registration
2. Campaign data sync
3. Performance metrics
4. Keyword tracking

### Priority 4: Dashboard UI (Week 4+)
1. Revenue charts
2. Inventory alerts
3. Advertising performance
4. AI marketing recommendations (Phase 3)

---

## Testing Strategy

### Unit Tests
```python
def test_order_parsing():
    """Test that API response correctly maps to Order model."""
    raw_response = {...}  # Mock Amazon response
    order = parse_order(raw_response)
    assert order.amazon_order_id == "111-1234567-1234567"
    assert order.order_total_amount == 29.99
```

### Integration Tests
```python
def test_live_connection():
    """Test actual API connection (use sandbox)."""
    client = create_client(sandbox=True)
    response = client.get_marketplace_participations()
    assert response.status_code == 200
```

### Manual Validation
1. Sync small date range
2. Compare counts to Seller Central
3. Verify financial totals match
4. Check for missing data

---

## Monitoring & Alerting

### Key Metrics to Track

| Metric | Threshold | Alert |
|--------|-----------|-------|
| Sync job success rate | < 95% | Email |
| API error rate | > 5% | Email |
| Token refresh failures | Any | Immediate |
| Data freshness | > 1 hour stale | Warning |

### Logging Strategy

```python
import logging
import structlog

# Structured logging for easy filtering
logger = structlog.get_logger()

logger.info(
    "orders_synced",
    count=45,
    duration_seconds=12.5,
    date_range="2026-03-25 to 2026-03-26"
)

logger.error(
    "api_error",
    endpoint="getOrders",
    status_code=429,
    retry_count=3
)
```

---

## Cost Considerations

### API Calls
- SP-API: Free (no per-call charges)
- Rate limits are the constraint, not cost

### Infrastructure (Estimated)
| Component | MVP | Production |
|-----------|-----|------------|
| Server | $0 (local) | $5-20/mo (small VPS) |
| Database | $0 (SQLite) | $15-50/mo (managed PG) |
| Monitoring | $0 (logs) | $0-20/mo (basic) |

### Development Time (Estimated)
| Phase | Hours |
|-------|-------|
| Setup & Auth | 2-4 |
| Orders sync | 4-8 |
| Inventory sync | 4-6 |
| Products sync | 4-6 |
| Advertising | 8-12 |
| Dashboard UI | 16-24 |
| **Total** | **38-60 hours** |

---

## Open Questions

### For Tim to Clarify

1. **Historical data depth:** How far back do we need order history? (Default: 90 days)

2. **Advertising priority:** Is advertising data critical for wind-down, or should we skip it?

3. **Alert preferences:** Email alerts? Slack? Dashboard-only?

4. **Multi-marketplace:** US only, or also Canada/Mexico? (Affects API calls)

5. **Access for AI council:** Will AI agents need direct API access, or just database access?

### Technical Decisions Pending

1. **Hosting location:** Peekay's Surface Book? Tandia? Cloud VPS?

2. **Dashboard framework:** React? Plain HTML? Existing tool (Metabase, etc.)?

3. **Background job runner:** cron? APScheduler? Celery?

---

## Reference Links

### Official Documentation
- SP-API Docs: https://developer-docs.amazon.com/sp-api/
- SP-API GitHub: https://github.com/amzn/selling-partner-api-models
- Amazon Ads API: https://advertising.amazon.com/API
- Marketplace IDs: https://developer-docs.amazon.com/sp-api/docs/marketplace-ids

### Community Resources
- python-amazon-sp-api: https://python-amazon-sp-api.readthedocs.io/
- SP-API Sandbox: https://developer-docs.amazon.com/sp-api/docs/sp-api-sandbox

### Support
- Developer Forums: https://sellercentral.amazon.com/forums/
- SP-API Status: https://sellercentral.amazon.com/sp-api-status

---

## Version History

| Date | Author | Changes |
|------|--------|---------|
| 2026-03-26 | Peekay | Initial documentation created |

---

*End of working notes. Update this document as implementation progresses.*
