# VISUALIZE Sports Restock Logic Specification

**Version:** 1.0  
**Date:** March 26, 2026  
**Purpose:** Decision rules and operational procedures for inventory replenishment

---

## Table of Contents

1. [Input Parameters](#input-parameters)
2. [Decision Rules](#decision-rules)
3. [Output Specifications](#output-specifications)
4. [Edge Case Handling](#edge-case-handling)
5. [Automation vs Human Approval](#automation-vs-human-approval)
6. [Alert Thresholds](#alert-thresholds)
7. [Operational Procedures](#operational-procedures)

---

## Input Parameters

### Required Data (Per SKU)

**Inventory Data:**
```
- current_stock: int (units currently in FBA)
- reserved_stock: int (units in customer orders)
- inbound_stock: int (units in transit to FBA)
- available_stock: int = current_stock - reserved_stock
- days_in_fba: int (days since first received)
```

**Sales Data:**
```
- daily_sales_30d: array[30] (last 30 days unit sales)
- daily_sales_60d: array[60] (last 60 days)
- daily_sales_90d: array[90] (last 90 days)
- sales_last_year_same_period: array (for seasonal comparison)
```

**Product Attributes:**
```
- asin: string
- sku: string
- product_name: string
- unit_price: float
- cogs: float (cost of goods sold per unit)
- gross_margin: float (unit_price - cogs) / unit_price
- weight_lbs: float
- dimensions_inches: {length, width, height}
- volume_cubic_feet: float
- case_pack_size: int (units per case from supplier)
```

**Supplier Data:**
```
- lead_time_days: int (order to FBA receipt)
- minimum_order_qty: int
- order_cost_fixed: float (fixed cost per order)
- supplier_name: string
- supplier_location: string (domestic/international)
```

**Cost Data:**
```
- monthly_storage_fee_per_unit: float
- current_month_storage_rate: float (per cubic foot)
- referral_fee_pct: float (Amazon commission)
- fba_fulfillment_fee: float (per unit)
- long_term_storage_fee_triggered: bool
```

**Business Context:**
```
- wind_down_end_date: date (estimated business closure)
- fba_storage_limit_cubic_feet: float (account-level limit)
- current_fba_usage_cubic_feet: float
- budget_available: float (for new orders)
```

---

### Calculated Metrics (From Algorithm Document)

**Derived from inputs:**
```
- daily_velocity: float (units/day, seasonally adjusted)
- velocity_trend: float (-1 to +1, negative = declining)
- dir: float (days of inventory remaining)
- rop: float (reorder point, units)
- safety_stock: float (buffer inventory, units)
- stockout_probability: float (0 to 1)
- storage_efficiency: float (revenue ROI on storage fees)
- excess_ratio: float (current stock / wind-down appropriate level)
- slow_mover_score: float (0 to 1, higher = slower)
- liquidation_priority: float (0 to 1, higher = more urgent)
- seasonal_factor: float (multiplier for current season)
```

---

## Decision Rules

### Rule Set 1: Pre-Restock Qualification

**Rule 1.1: Stock Depletion Check**
```
IF available_stock > rop:
    RETURN "NO_RESTOCK_NEEDED"
    REASON: "Stock above reorder point"
    NEXT_CHECK: 7 days
```

**Rule 1.2: Declining SKU Filter**
```
IF velocity_trend < -0.30:
    RETURN "DO_NOT_RESTOCK"
    REASON: "SKU declining >30%, wind-down phase"
    RECOMMENDATION: "Consider liquidation"
```

**Rule 1.3: Slow Mover Filter**
```
IF slow_mover_score > 0.7 AND dir > 180:
    RETURN "DO_NOT_RESTOCK"
    REASON: "Critical slow mover with 6+ months stock"
    RECOMMENDATION: "Liquidate inventory"
```

**Rule 1.4: Storage Efficiency Filter**
```
IF storage_efficiency < 2.0:
    RETURN "DO_NOT_RESTOCK"
    REASON: "Storage fees >50% of gross profit"
    RECOMMENDATION: "Liquidate or remove from FBA"
```

**Rule 1.5: Wind-Down Timeline Check**
```
months_remaining = (wind_down_end_date - today) / 30.4
projected_sales = daily_velocity × months_remaining × 30.4 × 0.8  // 80% confidence

IF available_stock > projected_sales:
    RETURN "DO_NOT_RESTOCK"
    REASON: "Current stock exceeds wind-down sales projection"

IF rop > (projected_sales × 0.5):
    RETURN "DO_NOT_RESTOCK"
    REASON: "Restock would create excess inventory for wind-down timeline"
```

**Rule 1.6: Storage Capacity Check**
```
available_capacity = fba_storage_limit - current_fba_usage

IF available_capacity < 100 cubic_feet:
    RETURN "NO_CAPACITY"
    REASON: "Insufficient FBA storage capacity"
    RECOMMENDATION: "Liquidate slow movers to free space"
```

**Rule 1.7: Long-Term Storage Fee Risk**
```
days_until_ltsf = 365 - days_in_fba

IF days_until_ltsf < 90 AND dir > days_until_ltsf:
    RETURN "DO_NOT_RESTOCK"
    REASON: "LTSF approaching, current stock won't sell in time"
    RECOMMENDATION: "Liquidate current inventory"
```

---

### Rule Set 2: Urgency Classification

**If all pre-qualification rules pass:**

**Rule 2.1: Critical Urgency (Immediate Action)**
```
IF (
    stockout_probability > 0.60 
    OR dir < 14
    OR (available_stock < safety_stock AND seasonal_factor > 1.1)
):
    URGENCY: "CRITICAL"
    TIMELINE: "Order within 24 hours"
    PRIORITY: 1
    APPROVAL: Required (human review)
```

**Rule 2.2: High Urgency (Action This Week)**
```
IF (
    stockout_probability > 0.30 
    OR dir < 30
    OR (available_stock < rop AND inbound_stock == 0)
):
    URGENCY: "HIGH"
    TIMELINE: "Order within 3-5 days"
    PRIORITY: 2
    APPROVAL: Auto-approve if qty < $2000 value
```

**Rule 2.3: Medium Urgency (Plan This Month)**
```
IF (
    stockout_probability > 0.15
    OR dir < 45
    OR available_stock < (rop × 1.2)
):
    URGENCY: "MEDIUM"
    TIMELINE: "Order within 2 weeks"
    PRIORITY: 3
    APPROVAL: Auto-approve if qty < $1000 value
```

**Rule 2.4: Low Urgency (Monitor)**
```
ELSE:
    URGENCY: "LOW"
    TIMELINE: "Review next week"
    PRIORITY: 4
    APPROVAL: Not applicable (no immediate action)
```

---

### Rule Set 3: Quantity Calculation

**Rule 3.1: Base Quantity (EOQ Modified)**
```
months_remaining = (wind_down_end_date - today) / 30.4
remaining_demand = daily_velocity × months_remaining × 30.4

order_cost = 500  // Baseline estimate
holding_cost_annual = (monthly_storage_fee_per_unit × 12) + (cogs × 0.12)  // 12% capital cost
holding_cost_adjusted = holding_cost_annual × 1.5  // Wind-down premium

eoq = sqrt((2 × remaining_demand × order_cost) / holding_cost_adjusted)

base_quantity = eoq
```

**Rule 3.2: Seasonal Adjustment**
```
next_month_seasonal = get_seasonal_index(current_month + 1)

IF next_month_seasonal > 1.2:  // Entering peak season
    base_quantity = base_quantity × 1.3
    
ELIF next_month_seasonal < 0.8:  // Entering slow season
    base_quantity = base_quantity × 0.7

// Special: Pre-peak season build
IF current_month IN [March, April] AND next_month_seasonal > 1.15:
    base_quantity = base_quantity × 1.4  // Build inventory before May-July peak
```

**Rule 3.3: Velocity Trend Adjustment**
```
IF velocity_trend < -0.20:  // Declining
    base_quantity = base_quantity × 0.6
    
ELIF velocity_trend > 0.10:  // Growing (unusual in wind-down)
    base_quantity = base_quantity × 1.2
    
ELIF velocity_trend < -0.05 AND velocity_trend > -0.20:  // Mild decline (expected)
    base_quantity = base_quantity × 0.9
```

**Rule 3.4: Maximum Constraints**
```
// Never order more than 6 months supply
max_six_months = daily_velocity × 180
base_quantity = min(base_quantity, max_six_months)

// Never order more than wind-down timeline allows
max_winddown = daily_velocity × months_remaining × 30.4 × 0.8
base_quantity = min(base_quantity, max_winddown)

// Budget constraint
max_by_budget = budget_available / cogs
base_quantity = min(base_quantity, max_by_budget)

// Storage capacity constraint
available_capacity_units = available_capacity / volume_cubic_feet
base_quantity = min(base_quantity, available_capacity_units)
```

**Rule 3.5: Minimum Constraints**
```
// Supplier MOQ
base_quantity = max(base_quantity, minimum_order_qty)

// Economic minimum (freight economics)
IF supplier_location == "international":
    freight_minimum = 500  // Minimum to justify container
    base_quantity = max(base_quantity, freight_minimum)
```

**Rule 3.6: Case Pack Rounding**
```
ideal_cases = ceil(base_quantity / case_pack_size)

// Don't over-order by more than 50% of a case
overage = (ideal_cases × case_pack_size) - base_quantity

IF overage > (case_pack_size × 0.5):
    final_cases = ideal_cases - 1
ELSE:
    final_cases = ideal_cases

final_quantity = final_cases × case_pack_size

// Ensure still meets minimums after rounding down
IF final_quantity < minimum_order_qty:
    final_quantity = minimum_order_qty
```

**Rule 3.7: Safety Validation**
```
// Final sanity checks
projected_dir_after_restock = (available_stock + final_quantity) / daily_velocity

IF projected_dir_after_restock > 270:  // 9 months
    FLAG: "WARNING: Restock creates 9+ months inventory"
    REQUIRE: Human approval
    
IF (final_quantity × cogs) > 5000:
    FLAG: "WARNING: Order value >$5000"
    REQUIRE: Human approval

IF final_quantity > (daily_velocity × 365):
    FLAG: "ERROR: Quantity exceeds annual sales"
    REQUIRE: Human review and override
```

---

### Rule Set 4: Lead Time Adjustments

**Rule 4.1: Lead Time Risk Assessment**
```
effective_lead_time = lead_time_days

// Add buffer for international
IF supplier_location == "international":
    effective_lead_time = lead_time_days × 1.2  // 20% buffer
    
// Add buffer for peak season (shipping delays)
IF current_month IN [November, December]:
    effective_lead_time = effective_lead_time × 1.3
    
// Add buffer if supplier has history of delays
IF supplier_on_time_rate < 0.80:
    effective_lead_time = effective_lead_time × 1.25
```

**Rule 4.2: Expedite Logic**
```
IF urgency == "CRITICAL" AND available_stock < (daily_velocity × 7):
    RECOMMEND: "Expedite shipping"
    COST_ANALYSIS: Compare expedite_cost vs stockout_cost
    
    stockout_cost = (daily_velocity × days_stockout × unit_price × gross_margin)
    expedite_cost = final_quantity × cogs × expedite_premium
    
    IF stockout_cost > expedite_cost:
        APPROVE_EXPEDITE: True
```

**Rule 4.3: Split Shipment Strategy**
```
IF (
    urgency == "CRITICAL" 
    AND final_quantity > 1000
    AND lead_time_days > 30
):
    RECOMMEND: "Split shipment"
    
    // Rush partial order via air
    rush_quantity = daily_velocity × 60  // 2 months supply
    rush_method = "Air freight"
    
    // Remainder via normal shipping
    remainder_quantity = final_quantity - rush_quantity
    remainder_method = "Ocean freight"
    
    REASON: "Prevent stockout while waiting for full ocean shipment"
```

---

## Output Specifications

### Restock Recommendation Schema

**JSON Output Format:**
```json
{
    "sku": "VIS-GLF-001",
    "asin": "B08XYZ123",
    "product_name": "Golf Ball Marker Set",
    "timestamp": "2026-03-26T19:30:00Z",
    "recommendation": {
        "action": "RESTOCK | DO_NOT_RESTOCK | NO_RESTOCK_NEEDED | NO_CAPACITY",
        "urgency": "CRITICAL | HIGH | MEDIUM | LOW",
        "priority": 1-4,
        "quantity": 1200,
        "reasoning": {
            "primary": "High stockout risk (68%)",
            "secondary": [
                "DIR 18 days (below 30-day threshold)",
                "Peak season approaching (April seasonal index 1.15)",
                "Inbound stock: 0 units"
            ]
        }
    },
    "metrics": {
        "current_stock": 240,
        "available_stock": 215,
        "inbound_stock": 0,
        "daily_velocity": 12.3,
        "dir": 17.5,
        "rop": 350,
        "stockout_probability": 0.68,
        "velocity_trend": -0.08,
        "seasonal_factor": 1.15,
        "storage_efficiency": 8.4
    },
    "financial": {
        "order_value": 4800.00,
        "cogs_per_unit": 4.00,
        "estimated_revenue": 14400.00,
        "estimated_gross_profit": 9600.00,
        "storage_cost_per_month": 45.00,
        "roi_estimate": 213.3
    },
    "logistics": {
        "supplier": "Acme Golf Supplies",
        "lead_time_days": 21,
        "effective_lead_time": 25,
        "case_pack_size": 24,
        "cases_to_order": 50,
        "shipping_method": "LTL freight",
        "expedite_recommended": false
    },
    "timeline": {
        "order_by_date": "2026-03-27",
        "expected_arrival": "2026-04-21",
        "stockout_risk_date": "2026-04-12",
        "days_until_stockout": 17
    },
    "approval": {
        "required": true,
        "reason": "Order value >$2000",
        "auto_approve_threshold": 2000.00,
        "can_auto_approve": false
    },
    "alerts": [
        {
            "type": "CRITICAL_STOCKOUT_RISK",
            "message": "68% stockout probability within lead time",
            "severity": "HIGH"
        },
        {
            "type": "PEAK_SEASON",
            "message": "Entering peak golf season (April-July)",
            "severity": "MEDIUM"
        }
    ],
    "alternative_actions": [
        {
            "action": "Reduce order to $2000 for auto-approval",
            "quantity": 500,
            "tradeoff": "Lower inventory, but still covers 40 days"
        }
    ]
}
```

---

### Weekly Restock Report Format

**Delivered every Monday morning:**

```
VISUALIZE Sports Weekly Restock Report
Week of: March 24-30, 2026

=== CRITICAL ACTIONS (Order Today) ===

1. Golf Ball Marker Set (VIS-GLF-001)
   Current: 215 units | DIR: 18 days | Stockout Risk: 68%
   Recommendation: Order 1,200 units ($4,800)
   Reason: High stockout risk, peak season approaching
   [Approve] [Modify] [Snooze 3 Days]

2. Divot Tool - Magnetic (VIS-GLF-045)
   Current: 89 units | DIR: 12 days | Stockout Risk: 82%
   Recommendation: Order 600 units ($1,800)
   Reason: Critical stockout risk, no inbound inventory
   [Auto-Approved - Order Placed]


=== HIGH PRIORITY (Order This Week) ===

3. Golf Tee Holder Pouch (VIS-GLF-012)
   Current: 342 units | DIR: 28 days | Stockout Risk: 45%
   Recommendation: Order 800 units ($1,600)
   Reason: Below ROP, moderate stockout risk
   [Approve] [Modify] [Defer 1 Week]

... (5 more items)


=== DO NOT RESTOCK (Liquidation Candidates) ===

15. Golf Glove Clip (VIS-GLF-089)
    Current: 1,240 units | DIR: 186 days | Slow Mover Score: 0.78
    Reason: 6+ months inventory, declining sales (-28%), high storage fees
    Recommendation: Liquidate via Amazon Outlet
    Potential Recovery: $620 (vs $180/month storage fees)
    [Start Liquidation] [Monitor 30 Days] [Remove from FBA]

... (8 more items)


=== SUMMARY ===
Total SKUs Analyzed: 127
Restock Recommended: 12 (9.4%)
  - Critical: 2
  - High: 5
  - Medium: 5
Do Not Restock: 9 (7.1%)
Healthy Inventory: 106 (83.5%)

Total Recommended Order Value: $18,400
Auto-Approved Orders: $3,200
Pending Approval: $15,200

Storage Capacity: 1,847 / 3,500 cubic feet (52.8%)
```

---

## Edge Case Handling

### Edge Case 1: Zero Sales History (New Product)

**Scenario:** SKU launched <30 days ago, insufficient data

**Handling:**
```
IF days_since_launch < 30:
    // Use conservative estimate
    daily_velocity = max(average_first_week_sales, 1.0)
    demand_std_dev = daily_velocity × 0.5  // Assume 50% CV
    
    // High safety stock due to uncertainty
    safety_stock = daily_velocity × lead_time_days × 2
    
    // Conservative initial order
    initial_order = daily_velocity × 90  // 3 months supply
    
    // Require human approval
    approval_required = True
    reason = "New product, limited sales history"
    
    // Re-evaluate after 30 days
    next_review = 30 days
```

---

### Edge Case 2: Extremely Low Velocity (<1 unit/day)

**Scenario:** SKU sells <30 units per month

**Handling:**
```
IF daily_velocity < 1.0:
    // Calculate in weekly terms instead
    weekly_velocity = sum(sales_last_4_weeks) / 4
    
    IF weekly_velocity < 2:  // Less than 2/week = 8/month
        classification = "Ultra-slow mover"
        
        // Check if worth keeping
        IF dir > 365 OR slow_mover_score > 0.8:
            RECOMMEND: "LIQUIDATE"
            REASON: "Unlikely to sell current inventory within wind-down"
        ELSE:
            RECOMMEND: "DO_NOT_RESTOCK"
            REASON: "Let inventory naturally deplete"
            safety_stock = 0  // Accept stockout risk
            
    ELSE:  // 2-7 per week
        // Minimal restock, round up to supplier MOQ
        recommended_qty = max(minimum_order_qty, weekly_velocity × 12)  // 3 months
        approval_required = True
```

---

### Edge Case 3: Highly Volatile Demand

**Scenario:** Standard deviation > mean (coefficient of variation >100%)

**Handling:**
```
coefficient_of_variation = demand_std_dev / daily_velocity

IF coefficient_of_variation > 1.0:
    classification = "Highly volatile"
    
    // Increase safety stock multiplier
    z_score = 2.33  // 99% service level (vs normal 90%)
    safety_stock = z_score × demand_std_dev × sqrt(lead_time_days)
    
    // Use median instead of mean for velocity
    daily_velocity_adjusted = median(daily_sales_60d)
    
    // Flag for review
    alerts.append({
        "type": "HIGH_VOLATILITY",
        "message": f"CV={coefficient_of_variation:.1f}, consider reviewing demand drivers",
        "recommendation": "Analyze for promotions, seasonality, or anomalies"
    })
    
    // Smaller, more frequent orders
    recommended_qty = daily_velocity_adjusted × 60  // 2 months instead of 3-6
```

---

### Edge Case 4: Inbound Inventory Already Ordered

**Scenario:** Previous order in transit to FBA

**Handling:**
```
IF inbound_stock > 0:
    // Calculate effective stock
    effective_stock = available_stock + inbound_stock
    effective_dir = effective_stock / daily_velocity
    
    // Check if inbound covers need
    IF effective_stock > rop:
        RECOMMEND: "NO_RESTOCK_NEEDED"
        REASON: f"Inbound shipment of {inbound_stock} units arriving soon"
        next_review = estimated_arrival_date + 7 days
        
    ELSE:
        // Still need more, but adjust quantity
        shortage = rop - effective_stock
        
        IF shortage > minimum_order_qty:
            recommended_qty = calculate_restock_qty()  // Normal calculation
            
            alert = {
                "type": "INBOUND_INSUFFICIENT",
                "message": f"Inbound {inbound_stock} units, but still {shortage} short of ROP",
                "action": "Additional order recommended"
            }
        ELSE:
            RECOMMEND: "MONITOR"
            REASON: "Inbound inventory nearly sufficient"
            next_review = 7 days
```

---

### Edge Case 5: Seasonal Transition Period

**Scenario:** Moving from peak to off-season (or vice versa)

**Handling:**
```
current_seasonal = get_seasonal_index(current_month)
next_seasonal = get_seasonal_index(current_month + 1)

seasonal_change = (next_seasonal - current_seasonal) / current_seasonal

IF abs(seasonal_change) > 0.25:  // >25% change
    
    IF seasonal_change > 0:  // Entering peak
        alert_type = "PEAK_SEASON_PREP"
        message = "Entering peak season, consider building inventory"
        
        // Increase order quantity
        seasonal_multiplier = 1.4
        
        // Adjust ROP upward
        rop_adjusted = rop × 1.3
        
    ELSE:  // Entering off-season
        alert_type = "OFF_SEASON_TRANSITION"
        message = "Entering slow season, reduce inventory buildup"
        
        // Decrease order quantity
        seasonal_multiplier = 0.7
        
        // Adjust ROP downward
        rop_adjusted = rop × 0.8
        
        // Check for excess inventory
        IF dir > 90:
            RECOMMEND: "Consider pre-season liquidation"
    
    recommended_qty = base_quantity × seasonal_multiplier
```

---

### Edge Case 6: Storage Capacity Crisis

**Scenario:** FBA storage >90% utilized, multiple restock needs

**Handling:**
```
IF (current_fba_usage / fba_storage_limit) > 0.90:
    
    // Triage: Prioritize high-velocity, high-margin
    priority_score = (daily_velocity × gross_margin) / volume_cubic_feet
    
    // Sort all restock recommendations by priority_score
    ranked_restocks = sort_by(all_recommendations, priority_score, descending=True)
    
    // Allocate remaining capacity
    remaining_capacity = fba_storage_limit - current_fba_usage
    
    approved_restocks = []
    for restock in ranked_restocks:
        required_space = restock.quantity × restock.volume_cubic_feet
        
        IF required_space < remaining_capacity:
            approved_restocks.append(restock)
            remaining_capacity -= required_space
        ELSE:
            deferred_restocks.append(restock)
    
    // Alert about deferred items
    alert = {
        "type": "STORAGE_CAPACITY_LIMIT",
        "message": f"{len(deferred_restocks)} restocks deferred due to capacity",
        "recommendation": "Liquidate slow movers to free space",
        "deferred_value": sum(r.order_value for r in deferred_restocks)
    }
    
    // Auto-trigger liquidation analysis
    TRIGGER: liquidation_priority_report()
```

---

### Edge Case 7: Supplier Discontinued Product

**Scenario:** Supplier no longer manufacturing SKU

**Handling:**
```
IF supplier_status == "DISCONTINUED":
    
    // Calculate final order opportunity
    supplier_remaining_stock = get_supplier_inventory(sku)
    
    IF supplier_remaining_stock > 0:
        // Calculate max reasonable final order
        remaining_winddown_demand = daily_velocity × months_until_winddown × 30.4
        
        final_order_qty = min(
            supplier_remaining_stock,
            remaining_winddown_demand × 0.9,  // Slight underestimation
            budget_available / cogs
        )
        
        alert = {
            "type": "SUPPLIER_DISCONTINUATION",
            "message": "Product discontinued, last chance to order",
            "supplier_stock": supplier_remaining_stock,
            "recommended_final_order": final_order_qty,
            "reasoning": "Balance wind-down demand vs overstock risk"
        }
        
        approval_required = True  // Always require human decision
        
    ELSE:
        // No more available from supplier
        RECOMMEND: "FIND_ALTERNATIVE_SUPPLIER | DISCONTINUE_SKU"
        
        // Analyze if worth finding new supplier
        annual_revenue = daily_velocity × 365 × unit_price
        
        IF annual_revenue > 10000:  // $10K+ annual revenue
            RECOMMEND: "FIND_ALTERNATIVE_SUPPLIER"
            REASON: "High revenue SKU, worth sourcing alternative"
        ELSE:
            RECOMMEND: "DISCONTINUE_SKU"
            REASON: "Low revenue, not worth new supplier sourcing effort"
            
        // Natural depletion plan
        projected_stockout_date = today + dir
        IF projected_stockout_date < wind_down_end_date:
            action = "Accept stockout, no alternative sourced"
```

---

### Edge Case 8: Price Change Impact

**Scenario:** Unit price changed >20% (promotion or price increase)

**Handling:**
```
IF abs(current_price - historical_avg_price) / historical_avg_price > 0.20:
    
    // Adjust velocity based on price elasticity
    price_change_pct = (current_price - historical_avg_price) / historical_avg_price
    
    // Golf accessories: estimated elasticity -1.5
    elasticity = -1.5
    expected_velocity_change = elasticity × price_change_pct
    
    adjusted_velocity = daily_velocity × (1 + expected_velocity_change)
    
    alert = {
        "type": "PRICE_CHANGE_DETECTED",
        "message": f"Price changed {price_change_pct:+.1%}",
        "velocity_adjustment": f"{expected_velocity_change:+.1%}",
        "recommendation": "Monitor actual vs predicted demand for 2 weeks"
    }
    
    // Use adjusted velocity for calculations
    daily_velocity = adjusted_velocity
    
    // Reduce confidence, increase safety stock
    safety_stock = safety_stock × 1.2
    
    // Require re-evaluation sooner
    next_review = 14 days  // Instead of normal 30
```

---

## Automation vs Human Approval

### Fully Automated (No Approval Required)

**Criteria:**
```
Auto-approve IF ALL of:
- Order value < $1,000
- Urgency = "HIGH" or "MEDIUM"
- Stockout probability > 0.30
- Quantity ≤ 6 months supply
- Storage capacity available
- No edge case flags triggered
- Supplier on-time rate > 80%
```

**Automated Actions:**
1. Generate purchase order
2. Email to supplier (if integration exists)
3. Update inventory forecast
4. Log to dashboard
5. Send confirmation to Tim (summary only, not asking for approval)

---

### Human Approval Required

**Criteria - ANY of:**
```
Require approval IF ANY of:
- Order value ≥ $1,000
- Urgency = "CRITICAL" (sanity check)
- Quantity > 6 months supply
- Edge case flags present
- New product (<30 days history)
- Highly volatile demand (CV > 100%)
- Supplier discontinuation
- Storage capacity >90%
- Recommended quantity differs from last order by >50%
- Gross margin < 20% (low profitability)
```

**Approval Workflow:**
1. Generate detailed recommendation with reasoning
2. Email to Tim with [Approve] [Modify] [Reject] buttons
3. Include alternative scenarios (e.g., order less for auto-approval)
4. If no response in 48 hours and urgency=CRITICAL, send reminder
5. Log approval decision for future reference

**Approval Email Template:**
```
Subject: APPROVAL NEEDED: Restock VIS-GLF-001 - Golf Ball Marker Set

Current Situation:
- Stock: 215 units (18 days remaining)
- Stockout Risk: 68%
- Peak season approaching

Recommendation:
- Order: 1,200 units (50 cases)
- Cost: $4,800
- Supplier: Acme Golf Supplies
- Lead Time: 21 days
- Expected Arrival: April 21

Why Approval Needed:
- Order value >$1,000 threshold

Analysis:
✓ High stockout risk (68%)
✓ Seasonal demand increasing (April seasonal index 1.15)
✓ No inbound inventory
✓ Storage capacity available (412 cubic feet needed, 1,653 available)
✓ Healthy ROI (213% on storage fees)

Financial Impact:
- Order Cost: $4,800
- Estimated Revenue: $14,400
- Estimated Gross Profit: $9,600
- Storage Cost (60 days): $90

Alternative Options:
1. Order 500 units ($2,000) - auto-approve threshold
   ↳ Covers 40 days, lower inventory but still acceptable
2. Defer 3 days and monitor
   ↳ Risk: Stockout probability increases to 75%

[Approve $4,800 Order] [Approve $2,000 Alternative] [Modify Quantity] [Reject]

Full Details: [Link to Dashboard]
```

---

### Escalation Rules

**Escalate to Tim immediately if:**
```
- Storage capacity crisis (>95% full, multiple deferred restocks)
- Supplier critical failure (multiple stockouts, quality issues)
- Cashflow constraint (recommended orders exceed budget by >20%)
- Data anomaly detected (velocity calculation seems wrong)
- System error (API failure, calculation error)
```

---

## Alert Thresholds

### Critical Alerts (Immediate Action)

**Stockout Imminent:**
```
IF stockout_probability > 0.70 OR dir < 14:
    ALERT: "CRITICAL STOCKOUT RISK"
    SEVERITY: CRITICAL
    DELIVERY: Email + SMS
    MESSAGE: "SKU {sku} has {dir} days inventory remaining, {stockout_probability:.0%} stockout risk"
    ACTION: "Review restock recommendation immediately"
```

**Storage Capacity Critical:**
```
IF (current_fba_usage / fba_storage_limit) > 0.95:
    ALERT: "FBA STORAGE CRITICAL"
    SEVERITY: CRITICAL
    DELIVERY: Email + SMS
    MESSAGE: "FBA storage at {utilization:.0%}, only {remaining} cubic feet available"
    ACTION: "Liquidate slow movers or defer restocks"
```

**Long-Term Storage Fee Approaching:**
```
IF days_until_ltsf < 60 AND current_stock > (daily_velocity × days_until_ltsf):
    ALERT: "LTSF APPROACHING"
    SEVERITY: CRITICAL
    DELIVERY: Email
    MESSAGE: "SKU {sku} will incur LTSF in {days_until_ltsf} days"
    ACTION: "Liquidate or remove {excess_units} units to avoid fee"
```

---

### High Alerts (Action This Week)

**Multiple Stockout Risks:**
```
critical_stockout_count = count(SKUs where stockout_probability > 0.50)

IF critical_stockout_count > 5:
    ALERT: "MULTIPLE STOCKOUT RISKS"
    SEVERITY: HIGH
    DELIVERY: Email
    MESSAGE: "{critical_stockout_count} SKUs at high stockout risk"
    ACTION: "Review weekly restock report, prioritize orders"
```

**Budget Constraint:**
```
total_recommended_orders = sum(order_value for all recommendations)

IF total_recommended_orders > budget_available:
    ALERT: "BUDGET CONSTRAINT"
    SEVERITY: HIGH
    DELIVERY: Email
    MESSAGE: "Recommended orders ${total_recommended_orders:.0f} exceed budget ${budget_available:.0f}"
    ACTION: "Prioritize orders by revenue impact, defer lower priority"
```

**Rapid Velocity Decline:**
```
IF velocity_trend < -0.40:  // >40% decline
    ALERT: "RAPID SALES DECLINE"
    SEVERITY: HIGH
    DELIVERY: Email
    MESSAGE: "SKU {sku} sales declining {abs(velocity_trend):.0%}"
    ACTION: "Investigate cause, consider liquidation"
```

---

### Medium Alerts (Monitor)

**Slow Movers Increasing:**
```
slow_mover_count = count(SKUs where slow_mover_score > 0.5)
slow_mover_pct = slow_mover_count / total_skus

IF slow_mover_pct > 0.15:  // >15% of SKUs
    ALERT: "SLOW MOVER PERCENTAGE HIGH"
    SEVERITY: MEDIUM
    DELIVERY: Email (weekly digest)
    MESSAGE: "{slow_mover_pct:.0%} of SKUs are slow movers"
    ACTION: "Review liquidation opportunities"
```

**Storage Efficiency Degrading:**
```
avg_storage_efficiency = average(storage_efficiency for all SKUs)

IF avg_storage_efficiency < 5.0:
    ALERT: "STORAGE EFFICIENCY LOW"
    SEVERITY: MEDIUM
    DELIVERY: Email (weekly digest)
    MESSAGE: "Average storage ROI {avg_storage_efficiency:.1f}x (target >5x)"
    ACTION: "Consider price increases or inventory reduction"
```

---

## Operational Procedures

### Daily Operations

**Morning Routine (Automated):**
```
1. Fetch overnight sales data from Amazon SP-API
2. Update inventory levels
3. Recalculate metrics for all SKUs
4. Identify critical alerts (stockout prob >0.7, DIR <14)
5. Generate critical alert email if any triggers
6. Update dashboard with latest data
```

**Human Review:**
```
- Check critical alerts inbox
- Approve/reject any pending restock recommendations
- Review previous day's sales vs forecast
- Spot-check top 10 SKUs by revenue
```

---

### Weekly Operations

**Monday Morning:**
```
1. Generate weekly restock report
2. Email to Tim by 8 AM
3. Include summary metrics:
   - Total SKUs analyzed
   - Restocks recommended (by urgency)
   - Do-not-restock items
   - Storage utilization
   - Budget status
4. Highlight any critical actions
```

**Wednesday (Mid-week Check):**
```
1. Review approved orders from Monday report
2. Confirm orders placed with suppliers
3. Update inbound inventory tracking
4. Check for any new critical stockouts
```

**Friday (Week Wrap-up):**
```
1. Review week's sales performance
2. Update seasonal indices if month-end
3. Calculate forecast accuracy (actual vs predicted)
4. Identify any anomalies for Monday review
```

---

### Monthly Operations

**First of Month:**
```
1. Recalculate seasonal indices
2. Update wind-down timeline (months remaining)
3. Review liquidation priority list
4. Generate monthly inventory health report
5. Budget review and next month planning
```

**Monthly Report Includes:**
```
- Sales vs forecast accuracy (MAPE)
- Stockout incidents (count and cost)
- Overstock incidents (excess inventory value)
- Storage fees vs revenue ratio
- Top 10 performing SKUs
- Bottom 10 slow movers
- Liquidation progress update
- Wind-down trajectory tracking
```

---

### Quarterly Operations

**Strategic Review:**
```
1. Evaluate algorithm performance
   - Forecast accuracy by SKU category
   - Stockout rate vs target
   - Overstock rate vs target
   
2. Adjust parameters if needed
   - Safety stock levels
   - Seasonal indices
   - Wind-down decay rate
   
3. Supplier performance review
   - On-time delivery rates
   - Quality issues
   - Lead time accuracy
   
4. Wind-down strategy adjustment
   - Accelerate or decelerate liquidation
   - Revise end-date if needed
   - Update financial projections
```

---

## Testing Scenarios

**Before deploying recommendation engine, test these scenarios:**

1. **Normal Restock:** Healthy SKU hits ROP, should recommend standard EOQ
2. **Critical Stockout:** DIR <14, should flag as urgent
3. **Declining SKU:** Velocity trend <-30%, should not restock
4. **Slow Mover:** DIR >180, slow score >0.7, should recommend liquidation
5. **Peak Season:** March-April, should increase quantities for May-July
6. **Off Season:** October-November, should reduce quantities
7. **Overstock:** Excess ratio >1.5, should not restock even if below ROP
8. **Storage Capacity:** >90% full, should defer low-priority restocks
9. **LTSF Risk:** 50 days until LTSF, DIR 90 days, should liquidate
10. **New Product:** <30 days history, should use conservative estimate
11. **Zero Sales:** No sales in 60 days, should flag for removal
12. **Volatile Demand:** CV >100%, should increase safety stock
13. **Inbound Stock:** Inbound covers shortage, should not restock
14. **Price Change:** Price +30%, should adjust velocity forecast
15. **Budget Constraint:** Orders exceed budget, should prioritize

**Expected outputs documented in test plan.**

---

**Document End**
