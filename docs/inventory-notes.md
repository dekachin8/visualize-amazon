# Inventory Intelligence System - Working Notes

**Date:** March 26, 2026  
**Project:** VISUALIZE Sports Inventory Optimization  
**Status:** Design Complete - Ready for Implementation

---

## Executive Summary

Designed a comprehensive inventory intelligence system for VISUALIZE Sports' 1-2 year wind-down phase. The system provides:

1. **Inventory Analysis Algorithm** - Mathematical models for calculating days of inventory remaining, stockout risk, storage efficiency, and slow-mover detection
2. **Restock Recommendation Engine** - Decision rules for when/what/how much to restock, with automated approval thresholds
3. **Storage Fee Optimization** - Algorithms to minimize Amazon FBA storage costs and avoid long-term storage fees
4. **Wind-Down Strategy** - 4-phase plan for graceful business closure over 18-24 months
5. **Data Requirements** - Complete specification of Amazon SP-API integration needs

---

## Key Design Decisions

### 1. Wind-Down Phases

**Phase 1 (Months 1-6): Controlled Operation**
- Continue restocking core performers
- Begin culling bottom 20% slow movers
- Target: 85-90% of historical inventory levels

**Phase 2 (Months 7-12): Managed Decline**
- Restock only top 30% by revenue
- Aggressive liquidation of middle 50%
- Target: 50-60% of historical inventory levels

**Phase 3 (Months 13-18): Final Liquidation**
- STOP all restocking
- Deep discounts (20-40% off)
- Bulk liquidation of remainder
- Target: 10-20% of historical inventory

**Phase 4 (Months 19-24): Exit**
- Zero inventory
- Close or dormant Amazon account
- Final accounting

**Rationale:** Gradual deceleration prevents panic liquidations and maximizes profit extraction.

---

### 2. SKU Tiering System

**Tier 1: Core Performers (Top 20% by Revenue)**
- Continue restocking through Month 12
- Maintain high service level (90%+)
- Price optimization for margin

**Tier 2: Solid Contributors (Next 30%)**
- Restock through Month 9
- Accept minor stockouts
- Reduced quantities (50% of historical)

**Tier 3: Marginal SKUs (Next 30%)**
- Stop restocking Month 6
- Begin liquidation Month 3-6
- Accept stockouts after Month 9

**Tier 4: Poor Performers (Bottom 20%)**
- STOP restocking immediately
- Liquidate starting Month 1
- Target: 90% cleared by Month 6

**Rationale:** Protect winners, cut losers early. Focus limited capital on SKUs that generate profit.

---

### 3. Restock Quantity Formula

**Modified Economic Order Quantity (EOQ) for Wind-Down:**

```
EOQ_WindDown = √[(2 × Remaining_Lifetime_Demand × Order_Cost) / 
                 (Holding_Cost_Per_Unit × Wind_Down_Adjustment)]

where:
Remaining_Lifetime_Demand = Daily_Velocity × Days_Until_Wind_Down_End
Wind_Down_Adjustment = 1.5 (increases holding cost to discourage large orders)
```

**Constraints:**
- Never order >6 months supply
- Must sell before wind-down end (80% confidence)
- Budget and storage capacity limits

**Rationale:** Standard EOQ optimizes for ongoing business. Wind-down requires finite-horizon optimization.

---

### 4. Safety Stock Reduction

**Service Level Targets:**
- Phase 1: 90% (vs normal 95%)
- Phase 2: 85%
- Phase 3: 70%
- Phase 4: 50%

**Z-scores:**
- Normal business: 1.65 (95% service level)
- Phase 1 wind-down: 1.28 (90%)
- Phase 2 wind-down: 1.04 (85%)

**Rationale:** Stockouts are acceptable during wind-down. Overstock is the bigger risk (storage fees, liquidation losses).

---

### 5. Liquidation Method Hierarchy

**Priority Order:**

1. **Amazon Promotions** (15-25% off)
   - Best for: Moderate overstock, still-profitable SKUs
   - Recovery: 70-85% of normal price
   - Preserves brand value

2. **Lightning Deals** (20-35% off)
   - Best for: High volume clearance (>500 units)
   - Recovery: 65-80%
   - Fast clearing

3. **Amazon Outlet** (automatic)
   - Best for: Low-effort liquidation
   - Recovery: 50-70%
   - Set and forget

4. **Bulk Liquidation** (Liquidation.com)
   - Best for: Large volumes (>1,000 units)
   - Recovery: 10-30% of wholesale
   - Clears everything at once

5. **Donation** (tax write-off)
   - Best for: Slow movers, low value items
   - Recovery: 0% cash, but 30% tax deduction
   - Use when tax benefit > liquidation proceeds

6. **Disposal** (last resort)
   - Only if storage fees exceed all other value

**Rationale:** Maximize recovery while balancing speed and effort.

---

### 6. Seasonal Adjustment for Golf

**Monthly Seasonal Indices:**
```
January:   0.60  (slow - winter)
February:  0.70
March:     0.95  (spring pickup)
April:     1.15
May:       1.25  (peak begins)
June:      1.30  (peak)
July:      1.25  (peak)
August:    1.20
September: 1.10
October:   0.90  (fall decline)
November:  0.70
December:  0.65  (holiday distraction)
```

**Usage:**
```
Adjusted_Daily_Velocity = Raw_Daily_Velocity × Seasonal_Factor × Trend_Factor
```

**Pre-peak season build (March-April):**
- Increase restock quantities by 30-40%
- Build inventory before May-July peak
- Ensure adequate stock for high-demand period

**Rationale:** Golf is highly seasonal. Forecasts must account for this or risk stockouts in peak season.

---

### 7. Storage Fee Optimization

**Critical Thresholds:**

**Storage Efficiency Ratio:**
```
Storage_Efficiency = (Revenue_Per_Day × DIR) / Total_Storage_Cost

Thresholds:
- >10: Excellent
- 5-10: Good
- 2-5: Marginal (consider reducing stock)
- <2: Poor (liquidate or remove)
```

**Long-Term Storage Fee (LTSF) Avoidance:**
```
Amazon charges $6.90/cu.ft OR $0.15/unit for inventory >365 days

Strategy:
- Before Aug 15 or Feb 15 (LTSF assessment dates)
- Liquidate any inventory >330 days old
- Remove slow movers before LTSF triggers
```

**Rationale:** LTSF can be 10-20x normal storage fees. Avoiding it is critical to profitability.

---

### 8. Automation vs Human Approval

**Fully Automated (No Approval):**
```
Auto-approve IF ALL:
- Order value < $1,000
- Urgency = HIGH or MEDIUM
- Stockout probability > 0.30
- Quantity ≤ 6 months supply
- Storage capacity available
- No edge case flags
```

**Human Approval Required:**
```
Require approval IF ANY:
- Order value ≥ $1,000
- Urgency = CRITICAL
- Quantity > 6 months supply
- Edge cases (new product, volatile demand, etc.)
- Storage capacity >90%
```

**Rationale:** Automate routine decisions to save time. Require human judgment for large/risky decisions.

---

## Algorithm Highlights

### Stockout Risk Score

**Formula:**
```
Stockout_Risk = 1 / (1 + e^(-z))  [Logistic function, 0-1]

where:
z = (Lead_Time_Demand - Current_Stock + Safety_Stock) / Demand_Std_Dev

Thresholds:
- 0.8-1.0: Critical (urgent restock or accept stockout)
- 0.6-0.8: High (restock soon)
- 0.3-0.6: Medium (monitor)
- 0.0-0.3: Low
```

**Rationale:** Probabilistic approach captures uncertainty in demand better than simple DIR calculation.

---

### Slow Mover Detection

**Multi-Criteria Score:**
```
Slow_Mover_Score = 0.4×Velocity_Score + 0.3×Turnover_Score + 0.3×Storage_Cost_Score

where:
Velocity_Score = 1 - (Daily_Velocity / Max_Velocity_In_Catalog)
Turnover_Score = 1 - (365 / Days_To_Sell_Current_Stock)
Storage_Cost_Score = Storage_Fee_Per_Unit / Unit_Price

Classification:
- >0.7: Critical slow-mover (liquidate immediately)
- 0.5-0.7: Slow-mover (stop restocking)
- 0.3-0.5: Marginal (reduce quantities)
- <0.3: Healthy
```

**Rationale:** Single metric (e.g., just velocity) can miss important factors. Multi-criteria is more robust.

---

### Liquidation Priority Score

**Formula:**
```
Liquidation_Priority = 
    0.30 × Storage_Cost_Factor +
    0.25 × Velocity_Decline_Factor +
    0.20 × Excess_Stock_Factor +
    0.15 × Days_Until_LTSF_Factor +
    0.10 × Profitability_Factor

(All factors normalized 0-1, higher = more urgent to liquidate)
```

**Usage:**
- Sort all SKUs by priority (descending)
- Execute liquidation in order
- Focus on top 20% most urgent

**Rationale:** Prioritization ensures limited time/effort goes to highest-impact liquidations first.

---

## Data Requirements Summary

### Amazon SP-API Endpoints Required

1. **Inventory API** (`/fba/inventory/v1/summaries`) - Daily
   - Current stock, reserved, inbound
   - Days in FBA

2. **Sales API** (`/sales/v1/orderMetrics`) - Daily
   - Units sold, revenue
   - Order count, avg price

3. **Storage Fees API** (`/fba/inventory/v1/storageFeesEstimate`) - Monthly
   - Monthly storage fees per SKU
   - Volume, average inventory

4. **FBA Inventory Age API** (`/fba/inventory/v1/inventoryAge`) - Weekly
   - Age buckets (0-90, 91-180, etc.)
   - LTSF risk identification

5. **Fees API** (`/products/fees/v0/feesEstimate`) - Weekly
   - FBA fulfillment fees
   - Referral fees

### Historical Data Needed

**Minimum:**
- 90 days sales history (daily granularity)
- 90 days inventory snapshots

**Recommended:**
- 24 months sales history (for seasonal patterns)
- 12 months inventory history

**If insufficient history:**
- Use industry seasonal indices for golf
- Conservative safety stock (higher buffer)

---

## Implementation Recommendations

### Phase 1: MVP (Week 1-2)

**Goal:** Get basic system running, prove value

**Scope:**
1. Daily data fetch from Amazon SP-API
   - Inventory snapshots
   - Sales data
2. Core metric calculations
   - DIR, velocity, stockout probability
3. Simple dashboard (Excel or web-based)
4. Manual restock recommendations (weekly report)

**Tech Stack:**
- Python 3.9+
- JSON file storage (simple, no DB yet)
- pandas for calculations
- Amazon SP-API client library

**Deliverable:** Weekly email report with restock recommendations

---

### Phase 2: Automation (Week 3-4)

**Goal:** Automate decision-making, reduce manual work

**Scope:**
1. Decision tree implementation
   - Restock vs no-restock logic
   - Liquidation triggers
2. Automated alerts
   - Critical stockouts (email/SMS)
   - LTSF approaching
   - Storage capacity warnings
3. Auto-approval for <$1,000 orders

**Deliverable:** System runs nightly, emails only when action needed

---

### Phase 3: Optimization (Month 2)

**Goal:** Refine algorithms, improve accuracy

**Scope:**
1. Seasonal adjustment tuning
   - Validate golf seasonal indices with actual data
   - Adjust if needed
2. Forecast accuracy tracking
   - MAPE calculation
   - Identify SKUs with poor forecasts
3. Liquidation effectiveness tracking
   - Recovery rates by method
   - Optimize sequencing

**Deliverable:** Improved forecast accuracy, optimized liquidation strategy

---

### Phase 4: Scale (Month 3+)

**Goal:** Handle full SKU catalog, robust production system

**Scope:**
1. Database migration (if >100 SKUs)
   - PostgreSQL recommended
   - Historical data import
2. Dashboard enhancements
   - Interactive charts
   - Drill-down by SKU
   - Trend analysis
3. Advanced features
   - Supplier order automation
   - Price optimization suggestions

**Deliverable:** Production-grade system requiring <1 hr/week maintenance

---

## Testing Strategy

### Unit Tests

**Core Functions:**
```python
def test_dir_calculation():
    assert calculate_dir(stock=100, velocity=10) == 10.0
    assert calculate_dir(stock=0, velocity=10) == 0.0
    assert calculate_dir(stock=100, velocity=0) == float('inf')

def test_stockout_probability():
    prob = calculate_stockout_probability(
        current_stock=100,
        lead_time_demand=120,
        demand_std_dev=20,
        lead_time_days=14
    )
    assert 0 <= prob <= 1
    assert prob > 0.5  # Should be >50% (stock below lead time demand)

def test_seasonal_adjustment():
    # May (peak season) should increase velocity
    adjusted = apply_seasonal_adjustment(
        base_velocity=10,
        month=5  # May
    )
    assert adjusted > 10
    assert adjusted == 10 * 1.25  # May index = 1.25
```

---

### Integration Tests

**End-to-End Workflow:**
```python
def test_daily_pipeline():
    # 1. Fetch data
    inventory = fetch_inventory_snapshot(date="2026-03-26")
    sales = fetch_sales_data(date="2026-03-26")
    
    # 2. Calculate metrics
    metrics = calculate_all_metrics(inventory, sales)
    
    # 3. Generate recommendations
    recommendations = generate_recommendations(metrics)
    
    # 4. Verify outputs
    assert len(recommendations) > 0
    assert all(r['action'] in ['RESTOCK', 'DO_NOT_RESTOCK', 'LIQUIDATE'] 
               for r in recommendations)
```

---

### Validation Against Historical Data

**Backtest Forecast Accuracy:**
```python
def backtest_forecasts():
    # Use first 60 days to forecast next 30 days
    # Compare forecasted vs actual sales
    
    for sku in all_skus:
        historical = get_sales(sku, days=90)
        training = historical[:60]
        actual = historical[60:90]
        
        forecast = calculate_forecast(training)
        
        mape = mean_absolute_percentage_error(actual, forecast)
        
        # MAPE <30% is acceptable for wind-down volatility
        assert mape < 0.30, f"SKU {sku} MAPE {mape:.1%} too high"
```

---

## Risks & Mitigation

### Risk 1: Poor Forecast Accuracy

**Risk:** Seasonal adjustments or velocity trends incorrect, leading to stockouts or overstock

**Mitigation:**
- Track forecast accuracy weekly (MAPE)
- Alert if accuracy <70%
- Manual override capability
- Start with conservative safety stock, reduce as confidence grows

---

### Risk 2: Amazon API Failures

**Risk:** SP-API downtime or rate limiting disrupts data pipeline

**Mitigation:**
- Retry logic with exponential backoff
- Graceful degradation (use yesterday's data if fetch fails)
- Alert if >24 hours without fresh data
- Local data caching

---

### Risk 3: Overstock on Declining SKUs

**Risk:** Restock a SKU just before demand collapses

**Mitigation:**
- Never restock if velocity trend <-30%
- Require human approval for declining SKUs
- Monitor velocity trend weekly, stop restocking quickly if accelerating decline
- Accept stockout risk on marginal SKUs

---

### Risk 4: LTSF Charges Incurred

**Risk:** Miss LTSF assessment date, get hit with massive fees

**Mitigation:**
- LTSF alerts 90 days before assessment (Feb 15, Aug 15)
- Auto-liquidate anything >330 days old
- Monthly LTSF risk report
- Calendar reminders for assessment dates

---

### Risk 5: Liquidation Methods Fail

**Risk:** Promotions don't move inventory, stuck with excess

**Mitigation:**
- Liquidation method hierarchy (escalate if one fails)
- Time-boxed attempts (if promotion doesn't work in 2 weeks, move to next method)
- Bulk liquidation as backstop (always works, even if low recovery)
- Accept donation/disposal as final option (better than perpetual storage fees)

---

## Success Metrics

### System Performance

**Forecast Accuracy:**
- Target: MAPE <30%
- Measure: Weekly
- Good: <25%
- Excellent: <20%

**Stockout Rate:**
- Target: <10% (Phase 1), <15% (Phase 2), <30% (Phase 3)
- Measure: % of SKU-days with zero stock
- Acceptable degradation over wind-down

**Overstock Rate:**
- Target: <10% of SKUs with excess_ratio >1.5
- Measure: Monthly
- Critical: Keep declining (not increasing)

---

### Financial Performance

**Storage Fees % Revenue:**
- Target: <3%
- Measure: Monthly
- Excellent: <2%

**LTSF Charges:**
- Target: $0 (zero tolerance)
- Measure: Per assessment date (Feb/Aug)

**Liquidation Recovery Rate:**
- Target: >70% of retail for promotions, >20% for bulk
- Measure: Per liquidation method
- Track actual vs targets, optimize mix

---

### Operational Efficiency

**Time to Generate Recommendations:**
- Target: <5 minutes for full catalog
- Measure: Daily pipeline runtime

**Manual Intervention Required:**
- Target: <5 hours/week by Phase 2
- Measure: Time Tim spends on inventory decisions
- Success: System does 90%+ of work

---

## Next Steps

1. **Review with Tim** - Get approval on strategy and priorities
2. **Set up Amazon SP-API access** - Credentials, permissions
3. **Build MVP** - Week 1-2 scope
4. **Pilot with 10-20 SKUs** - Test before full rollout
5. **Iterate based on results** - Tune parameters, fix issues
6. **Scale to full catalog** - Once confident in system
7. **Monitor and optimize** - Weekly reviews, monthly adjustments

---

## Questions for Tim

1. **Wind-down timeline confirmation** - Is 18-24 months still the target? Flexibility?
2. **Budget constraints** - What's the monthly budget for restocking?
3. **Risk tolerance** - Acceptable stockout rate? (I've assumed 10-15% is OK)
4. **Automation comfort level** - OK with auto-approving <$1,000 orders?
5. **Liquidation preferences** - Any methods to avoid? (e.g., don't want brand on discount sites?)
6. **Data availability** - How much historical data do we have? Can access Amazon SP-API?
7. **Current pain points** - What's most frustrating about current inventory management?
8. **Success definition** - How will we know the system is working well?

---

## Resources & References

**Amazon SP-API Documentation:**
- https://developer-docs.amazon.com/sp-api/

**Inventory Optimization Papers:**
- Economic Order Quantity (EOQ) - Wilson 1913
- Newsvendor Model - Arrow et al. 1951
- Safety Stock Optimization - Silver et al. 1998

**Golf Seasonality:**
- National Golf Foundation reports
- Weather pattern analysis (correlates with play)

**Liquidation Channels:**
- Amazon Outlet: https://www.amazon.com/outlet
- Liquidation.com: https://www.liquidation.com
- B-Stock: https://www.bstock.com

---

**End of Working Notes**

Total design time: ~2 hours (as budgeted)  
Documents created: 4 comprehensive specifications  
Status: Ready for implementation feedback and approval
