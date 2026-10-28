# VISUALIZE Sports Inventory Intelligence System - Executive Summary

**Date:** March 26, 2026  
**Prepared For:** Tim O'Hagan  
**Project:** Automated Inventory Management for 1-2 Year Wind-Down Phase

---

## Overview

This document summarizes a comprehensive inventory intelligence system designed specifically for VISUALIZE Sports' wind-down phase. The system automates inventory analysis, restock recommendations, and liquidation planning to maximize profit extraction while minimizing waste during the 18-24 month business closure timeline.

---

## The Problem

**Current State:**
- Manual inventory decisions taking ~10 hours/week
- Risk of stockouts (lost sales) vs overstock (storage fees, liquidation losses)
- Complex seasonal demand patterns (golf is highly seasonal)
- Amazon FBA storage fees and long-term storage fee penalties
- Need to gradually reduce inventory while maintaining profitability

**Wind-Down Challenges:**
- Can't use standard inventory formulas (assumes ongoing business)
- Must balance service level with inventory reduction
- Storage fees become disproportionately expensive as sales decline
- Risk of getting stuck with unsold inventory at closure

---

## The Solution

A data-driven inventory intelligence system that:

1. **Analyzes inventory daily** using Amazon SP-API data
2. **Calculates key metrics** (days of inventory, stockout risk, storage efficiency)
3. **Recommends actions** (restock, liquidate, or hold)
4. **Automates low-risk decisions** (orders <$1,000)
5. **Alerts on critical issues** (imminent stockouts, storage fee risks)
6. **Guides wind-down execution** (4-phase strategy over 18-24 months)

---

## Key Features

### 1. Inventory Analysis Algorithm

**What it does:**
- Calculates days of inventory remaining (DIR)
- Detects slow-moving SKUs wasting storage fees
- Predicts stockout probability during lead time
- Adjusts for golf seasonality (May-July peak, Nov-Feb slow)

**Why it matters:**
- Know exactly when you'll run out of stock
- Identify which SKUs to liquidate vs restock
- Avoid surprises (automatic early warnings)

---

### 2. Restock Recommendation Engine

**What it does:**
- Determines when to restock each SKU
- Calculates optimal order quantity (modified EOQ for wind-down)
- Classifies urgency (Critical / High / Medium / Low)
- Provides reasoning for each recommendation

**Why it matters:**
- No more guessing on restock timing or quantities
- Prevents both stockouts and overstock
- Saves 8-10 hours/week of manual analysis

**Example Recommendation:**
```
Golf Ball Marker Set (VIS-GLF-001)
Current Stock: 215 units (18 days remaining)
Stockout Risk: 68%
Recommendation: Order 1,200 units ($4,800)
Reasoning: High stockout risk, peak season approaching, no inbound inventory
Urgency: CRITICAL (order within 24 hours)
```

---

### 3. Storage Fee Optimization

**What it does:**
- Tracks storage costs per SKU
- Identifies SKUs where storage fees exceed profitability
- Alerts when long-term storage fees (LTSF) approaching
- Recommends removal or liquidation to avoid fees

**Why it matters:**
- Amazon charges $6.90/cu.ft for inventory >365 days (10-20x normal rate)
- Storage fees can eat 50-100% of profit on slow movers
- System prevents these charges automatically

**Target:** Zero LTSF charges, storage fees <3% of revenue

---

### 4. Wind-Down Strategy (4 Phases)

**Phase 1 (Months 1-6): Controlled Operation**
- Continue restocking top performers
- Cull bottom 20% slow movers
- Target: 85-90% of historical inventory

**Phase 2 (Months 7-12): Managed Decline**
- Restock only top 30% by revenue
- Aggressive liquidation of middle tier
- Target: 50-60% of historical inventory

**Phase 3 (Months 13-18): Final Liquidation**
- STOP all restocking
- Deep discounts to clear inventory
- Target: 10-20% remaining

**Phase 4 (Months 19-24): Exit**
- Final clearance, donations, disposals
- Target: Zero inventory, account closed

**Why it matters:**
- Structured approach prevents panic liquidations
- Maximizes profit extraction (vs dumping inventory)
- Clear milestones to track progress

---

### 5. Liquidation Framework

**Method Hierarchy (by recovery rate):**

1. **Amazon Promotions** (15-25% off) → 70-85% recovery
2. **Lightning Deals** (20-35% off) → 65-80% recovery
3. **Amazon Outlet** (automatic) → 50-70% recovery
4. **Bulk Liquidation** (Liquidation.com) → 10-30% recovery
5. **Donation** (tax write-off) → 30% tax benefit
6. **Disposal** (last resort) → Cost to remove

**Decision Logic:**
- System recommends best method for each SKU
- Escalates if method fails (e.g., promotion → Lightning Deal → Outlet)
- Prioritizes SKUs by urgency (storage fees, LTSF risk, excess stock)

---

## Business Value

### Time Savings

**Before System:**
- 10 hours/week analyzing inventory
- Manual calculations in spreadsheets
- Reactive (problems discovered late)

**After System:**
- <1 hour/week (just approvals and review)
- Automated calculations
- Proactive (alerts before problems occur)

**Value:** 9 hours/week × $100/hr = **$900/week = $46,800/year**

---

### Financial Impact

**Storage Fee Savings:**
- Avoid LTSF charges (potential: $5,000-20,000)
- Optimize regular storage fees (target: <3% of revenue)
- Remove unprofitable inventory early

**Improved Margins:**
- Fewer emergency discounts (planned liquidation gets better prices)
- Prevent stockouts on high-margin items
- Better restock timing (buy before peak season)

**Conservative Estimate:** $20,000-40,000 savings over wind-down period

---

### Risk Reduction

**Prevents:**
- Catastrophic overstock (getting stuck with $50K+ unsold inventory)
- LTSF penalties (can be $10K+ if triggered)
- Stockouts during peak season (lost sales opportunity)
- Last-minute panic liquidations (terrible recovery rates)

**Enables:**
- Controlled, profitable wind-down
- Predictable cash flow
- Clean business closure

---

## Implementation Plan

### Phase 1: MVP (Weeks 1-2)

**Goal:** Prove value with basic system

**Deliverables:**
- Daily data fetch from Amazon SP-API
- Core metric calculations
- Weekly restock report (email)

**Effort:** 15 hours development  
**Cost:** DIY or ~$1,500 if outsourced

---

### Phase 2: Automation (Weeks 3-4)

**Goal:** Reduce manual work

**Deliverables:**
- Fully automated daily pipeline (cron job)
- Critical alerts (email/SMS)
- Auto-approval for low-risk restocks (<$1,000)

**Effort:** 12 hours  
**Cost:** ~$1,200 if outsourced

---

### Phase 3: Optimization (Month 2)

**Goal:** Improve accuracy

**Deliverables:**
- Forecast accuracy tracking (MAPE <25%)
- Liquidation effectiveness tracking
- Tuned seasonal adjustments

**Effort:** 10 hours  
**Cost:** ~$1,000 if outsourced

---

### Phase 4: Scale (Month 3+)

**Goal:** Production-grade system

**Deliverables:**
- Database migration (PostgreSQL)
- Advanced dashboard (interactive charts)
- Handle 200+ SKUs efficiently
- Integration with suppliers (automated POs)

**Effort:** 20 hours  
**Cost:** ~$2,000 if outsourced

---

**Total Investment:**
- Development: ~$5,700 (or DIY with ~60 hours)
- Monthly operations: $40-85 (hosting, email, etc.)

**ROI:** Pays for itself in 2-3 weeks (time savings alone)

---

## Technology Stack

**Core:**
- Python 3.9+ (data science libraries)
- Amazon SP-API (inventory, sales, fees)
- JSON files (MVP) → PostgreSQL (Phase 4)

**Simple, Proven Technologies:**
- No exotic frameworks or dependencies
- Works on any Linux server or laptop
- Easy to maintain and modify

---

## Key Algorithms

### 1. Days of Inventory Remaining (DIR)

```
DIR = Current_Stock / (Daily_Velocity × Seasonal_Factor × Trend_Factor)

Interpretation:
- <30 days: High stockout risk
- 30-60 days: Moderate risk
- 60-90 days: Healthy
- >180 days: Overstock concern
```

---

### 2. Stockout Probability

```
Stockout_Risk = 1 / (1 + e^(-z))

where:
z = (Lead_Time_Demand - Current_Stock + Safety_Stock) / Demand_Std_Dev

Thresholds:
- 0.8-1.0: Critical (urgent action)
- 0.6-0.8: High risk
- 0.3-0.6: Medium risk
- 0.0-0.3: Low risk
```

---

### 3. Restock Quantity (Modified EOQ)

```
EOQ_WindDown = √[(2 × Remaining_Lifetime_Demand × Order_Cost) / 
                 (Holding_Cost × Wind_Down_Adjustment)]

Constraints:
- Max 6 months supply
- Must sell before wind-down end
- Budget and storage capacity limits
```

---

### 4. Liquidation Priority Score

```
Liquidation_Priority = 
    30% × Storage_Cost_Factor +
    25% × Velocity_Decline_Factor +
    20% × Excess_Stock_Factor +
    15% × Days_Until_LTSF_Factor +
    10% × Profitability_Factor

Sort SKUs by priority → Liquidate highest priority first
```

---

## Data Requirements

### From Amazon SP-API (Automated)

**Daily:**
- Current inventory levels (FBA)
- Sales by SKU (units, revenue)
- Inbound shipments

**Weekly:**
- FBA fees (fulfillment, referral)
- Inventory age (LTSF risk detection)

**Monthly:**
- Storage fees by SKU

---

### Manual Inputs (One-Time Setup)

**Product Catalog:**
- ASIN, SKU, product name
- COGS (cost of goods sold)
- Dimensions, weight
- Supplier info (lead time, MOQ)
- Case pack sizes

**Business Config:**
- Wind-down timeline (18-24 months)
- Budget constraints
- FBA storage limits
- Risk tolerance (service level targets)

---

## Expected Outcomes

### 3 Months After Launch

**Metrics:**
- Forecast accuracy: <25% MAPE
- Stockout rate: <10%
- Storage fees: <3% of revenue
- Zero LTSF charges
- Time spent on inventory: <1 hr/week

**Inventory Trajectory:**
- On track with wind-down curve (±10%)
- Bottom 20% SKUs liquidated
- No emergency discounts or panic sales

---

### 12 Months After Launch

**Metrics:**
- 50-60% inventory reduction (vs baseline)
- Smooth sales throughout (no cliff drops)
- Positive gross margin maintained
- Tim confident in wind-down execution

---

### 18-24 Months (Wind-Down Complete)

**Outcomes:**
- 95%+ of inventory value extracted as profit
- <5% liquidation losses (vs typical 20-40%)
- Zero inventory remaining
- Business closed in good standing
- Lessons learned documented for future

---

## Risk Mitigation

### Technical Risks

**Risk:** Amazon API failures  
**Mitigation:** Retry logic, fallback to previous day's data, manual backup

**Risk:** Forecast inaccuracy  
**Mitigation:** Conservative safety stock initially, tune over time, manual override capability

---

### Business Risks

**Risk:** Demand collapses unexpectedly  
**Mitigation:** Weekly trend monitoring, automatic restock throttling if velocity drops >30%

**Risk:** Overstock at closure  
**Mitigation:** Multiple liquidation methods, donation as backstop, regular progress tracking

**Risk:** LTSF triggered  
**Mitigation:** 90-day advance alerts, automatic liquidation recommendations, calendar reminders

---

## Success Criteria

**System is successful if:**

✓ Tim spends <1 hour/week on inventory decisions  
✓ Zero LTSF charges incurred  
✓ Storage fees <3% of revenue consistently  
✓ Stockout rate <10% during Phase 1-2  
✓ Inventory reduction on track (±15% of target curve)  
✓ Liquidation recovery >70% for promotions, >20% for bulk  
✓ Tim feels confident in wind-down execution  

---

## Next Steps

### Immediate (This Week)

1. **Review documents** with Tim
   - INVENTORY_ALGORITHM.md (full design)
   - RESTOCK_LOGIC.md (decision rules)
   - WIND_DOWN_STRATEGY.md (business strategy)
   - This summary

2. **Answer key questions:**
   - Wind-down timeline still 18-24 months?
   - Budget constraints?
   - Risk tolerance (OK with 10-15% stockout rate)?
   - Automation comfort (auto-approve <$1,000 orders)?

3. **Get Amazon SP-API access**
   - Register developer account
   - Request API credentials
   - Test connection

---

### Short-Term (Weeks 1-2)

4. **Build MVP**
   - Set up development environment
   - Implement data fetch from Amazon
   - Build core calculations
   - Generate first weekly report

5. **Validate with real data**
   - Run against live inventory
   - Compare recommendations to Tim's judgment
   - Tune parameters if needed

---

### Medium-Term (Months 1-3)

6. **Automate and scale**
   - Daily automated pipeline
   - Critical alerts
   - Auto-approval for low-risk items
   - Dashboard (optional but recommended)

7. **Track and optimize**
   - Forecast accuracy monitoring
   - Liquidation effectiveness
   - Continuous improvement

---

## Deliverables Provided

1. **INVENTORY_ALGORITHM.md** (33 KB)
   - Complete mathematical formulas
   - Decision trees
   - Pseudocode implementation

2. **RESTOCK_LOGIC.md** (33 KB)
   - Detailed decision rules
   - Input/output specifications
   - Edge case handling
   - Automation thresholds

3. **WIND_DOWN_STRATEGY.md** (34 KB)
   - 4-phase wind-down plan
   - SKU tiering system
   - Liquidation framework
   - Financial optimization strategies

4. **DATA_REQUIREMENTS.md** (28 KB)
   - Amazon SP-API integration guide
   - Data schema specifications
   - Historical data needs
   - Validation rules

5. **IMPLEMENTATION_ROADMAP.md** (24 KB)
   - Step-by-step build plan
   - Code structure
   - Timeline and milestones
   - Testing strategy

6. **inventory-notes.md** (18 KB)
   - Working notes and design decisions
   - Key highlights
   - Questions for Tim
   - Quick reference

7. **This Executive Summary**
   - High-level overview
   - Business value proposition
   - Next steps

---

## Bottom Line

**The system provides:**
- 9 hours/week time savings ($46,800/year value)
- $20,000-40,000 in avoided storage fees and improved margins
- Confidence in wind-down execution
- Peace of mind (no surprises, everything tracked)

**Investment required:**
- 60 hours development (DIY) or $5,700 outsourced
- $40-85/month operational costs
- 1-2 weeks to MVP, 3 months to fully optimized

**ROI:** Pays for itself in 2-3 weeks on time savings alone

**Recommendation:** Start with Phase 1 MVP (2 weeks), prove value, then scale.

---

**Questions or ready to proceed?** Contact Tim O'Hagan for next steps.

---

**Document End**
