# VISUALIZE Sports Inventory Intelligence Algorithm

**Version:** 1.0  
**Date:** March 26, 2026  
**Purpose:** Mathematical foundation for inventory optimization during 1-2 year wind-down phase

---

## Table of Contents

1. [Core Metrics](#core-metrics)
2. [Inventory Analysis Algorithms](#inventory-analysis-algorithms)
3. [Seasonal Adjustment Models](#seasonal-adjustment-models)
4. [Risk Detection Algorithms](#risk-detection-algorithms)
5. [Storage Fee Optimization](#storage-fee-optimization)
6. [Restock Quantity Optimization](#restock-quantity-optimization)
7. [Decision Trees](#decision-trees)
8. [Pseudocode Implementation](#pseudocode-implementation)

---

## Core Metrics

### 1. Days of Inventory Remaining (DIR)

**Formula:**
```
DIR = Current_Stock / Adjusted_Daily_Velocity

where:
Adjusted_Daily_Velocity = Raw_Daily_Velocity × Seasonal_Factor × Trend_Factor
```

**Components:**

- **Raw_Daily_Velocity**: 
  ```
  Raw_Daily_Velocity = Total_Units_Sold / Days_In_Period
  
  Recommended: Use 30-day, 60-day, and 90-day windows
  ```

- **Seasonal_Factor**: Adjustment for golf seasonality (see Seasonal Models section)

- **Trend_Factor**: Captures declining sales during wind-down
  ```
  Trend_Factor = 1 + (ΔVelocity / Velocity_Previous_Period)
  
  Bounded: max(0.5, min(1.5, Trend_Factor))
  ```

**Interpretation:**
- DIR < 30 days: High stockout risk
- DIR 30-60 days: Moderate risk, monitor closely
- DIR 60-90 days: Healthy buffer
- DIR > 180 days: Overstock, storage fee concern

---

### 2. Sales Velocity Metrics

**Simple Moving Average (SMA):**
```
SMA_n = Σ(Daily_Sales[i]) / n

where i = 0 to n-1 (most recent n days)
```

**Exponential Moving Average (EMA):** (More responsive to recent changes)
```
EMA_today = α × Sales_today + (1 - α) × EMA_yesterday

where:
α = 2 / (n + 1)  [smoothing factor]
n = time period (e.g., 30 days means α ≈ 0.065)
```

**Recommended:** Use both SMA-30 and EMA-30, alert if they diverge >25%

---

### 3. Stockout Risk Score

**Formula:**
```
Stockout_Risk = 1 / (1 + e^(-z))  [Logistic function, range 0-1]

where:
z = (Lead_Time_Demand - Current_Stock + Safety_Stock) / Demand_Std_Dev

Lead_Time_Demand = Daily_Velocity × Lead_Time_Days
```

**Components:**

- **Lead_Time_Days**: Time from reorder to Amazon receiving inventory (FBA)
  - Typical: 14-21 days domestic, 30-45 days international

- **Safety_Stock**: Buffer inventory
  ```
  Safety_Stock = z_score × Demand_Std_Dev × √Lead_Time_Days
  
  where:
  z_score = 1.65 for 95% service level (recommended)
  z_score = 1.28 for 90% service level (acceptable for wind-down)
  ```

- **Demand_Std_Dev**: Standard deviation of daily sales (60-day window recommended)

**Risk Thresholds:**
- 0.0 - 0.3: Low risk
- 0.3 - 0.6: Medium risk (monitor)
- 0.6 - 0.8: High risk (restock soon)
- 0.8 - 1.0: Critical risk (urgent restock or accept stockout)

---

### 4. Storage Cost Efficiency Ratio

**Formula:**
```
Storage_Efficiency = (Revenue_Per_Day × DIR) / Total_Storage_Cost

where:
Total_Storage_Cost = Monthly_Storage_Fee + (Long_Term_Storage_Fee if applicable)

Revenue_Per_Day = Daily_Velocity × Unit_Price
```

**Interpretation:**
- Ratio > 10: Efficient (storage cost negligible vs revenue)
- Ratio 5-10: Acceptable
- Ratio 2-5: Marginal (consider reducing stock)
- Ratio < 2: Inefficient (liquidate or remove)

**Long-Term Storage Fee Trigger:**
Amazon charges extra for inventory stored >365 days
```
Days_Until_LTSF = 365 - Days_In_FBA

if Days_Until_LTSF < 90 and DIR > Days_Until_LTSF:
    LTSF_Risk = True
    Recommend: Reduce inventory or liquidate
```

---

## Inventory Analysis Algorithms

### Algorithm 1: Velocity Trend Analysis

**Purpose:** Detect if SKU is accelerating, stable, or declining

```
Velocity_Trend = (Velocity_Recent - Velocity_Historical) / Velocity_Historical

where:
Velocity_Recent = Average daily sales (last 30 days)
Velocity_Historical = Average daily sales (60-90 days ago)

Classification:
- Trend > +0.20: Accelerating (+20% growth)
- Trend -0.10 to +0.20: Stable
- Trend -0.30 to -0.10: Declining (typical for wind-down)
- Trend < -0.30: Rapidly declining (liquidation candidate)
```

**Wind-Down Adjustment:**
Expected trend for wind-down phase: -5% to -15% per quarter
```
Expected_Decline_Rate = -0.10 per quarter (baseline assumption)

Actual_vs_Expected = Velocity_Trend - Expected_Decline_Rate

if Actual_vs_Expected < -0.15:
    Alert: "SKU declining faster than expected wind-down rate"
    Action: Accelerate liquidation
```

---

### Algorithm 2: Slow-Mover Detection

**Purpose:** Identify SKUs wasting storage fees

**Multi-Criteria Score:**
```
Slow_Mover_Score = w1×V + w2×T + w3×S

where:
V = Velocity_Score = 1 - (Daily_Velocity / Max_Daily_Velocity_In_Catalog)
T = Turnover_Score = 1 - (365 / Days_To_Sell_Current_Stock)
S = Storage_Cost_Score = Storage_Fee_Per_Unit / Unit_Price

Weights (recommended):
w1 = 0.4  (velocity most important)
w2 = 0.3  (turnover rate)
w3 = 0.3  (storage cost impact)

Normalization: Each component 0-1 range
```

**Classification:**
- Score > 0.7: Critical slow-mover (liquidate immediately)
- Score 0.5-0.7: Slow-mover (stop restocking, let deplete)
- Score 0.3-0.5: Marginal (reduce restock quantities)
- Score < 0.3: Healthy mover

**Days to Sell Calculation:**
```
Days_To_Sell = Current_Stock / Daily_Velocity

if Days_To_Sell > 180 and Velocity_Trend < -0.20:
    Recommend: Liquidation (Amazon Outlet, Liquidation.com, or donation)
```

---

### Algorithm 3: Seasonal Pattern Detection

**Purpose:** Adjust forecasts for golf seasonality

**Monthly Seasonal Index Calculation:**
```
Seasonal_Index[month] = Avg_Sales[month] / Avg_Sales[all_months]

Example golf seasonality (Northern hemisphere):
January:   0.60  (slow)
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

**Forecast Adjustment:**
```
Forecasted_Demand[next_month] = Base_Demand × Seasonal_Index[next_month]

Base_Demand = Average daily sales over past 12 months
```

**Peak Season Buffer:**
During April-August, increase safety stock:
```
Safety_Stock_Seasonal = Safety_Stock_Base × Seasonal_Index[current_month]

if Seasonal_Index > 1.1:
    Safety_Stock_Seasonal = Safety_Stock_Base × 1.3
```

---

## Seasonal Adjustment Models

### Model 1: Moving Seasonal Average

**For SKUs with 2+ years of history:**

```
Seasonal_Factor[month, year] = 
    0.5 × Seasonal_Index[month, current_year] +
    0.3 × Seasonal_Index[month, previous_year] +
    0.2 × Seasonal_Index[month, 2_years_ago]

Weighted toward recent years to capture wind-down decline
```

### Model 2: Deseasonalized Trend

**To isolate underlying trend from seasonal noise:**

```
Deseasonalized_Sales[month] = Actual_Sales[month] / Seasonal_Index[month]

Trend_Line = Linear_Regression(Deseasonalized_Sales over time)

Expected_Sales[future_month] = Trend_Line[future_month] × Seasonal_Index[future_month]
```

**Wind-Down Decay Function:**
```
Decay_Factor[months_from_now] = e^(-λ × months_from_now)

where:
λ = decay rate (0.03 - 0.05 for gradual 1-2 year wind-down)
λ = 0.04 means ~37% reduction over 24 months

Adjusted_Forecast = Expected_Sales × Decay_Factor
```

---

## Risk Detection Algorithms

### Algorithm 4: Stockout Probability

**Monte Carlo Simulation (simplified):**

```
For each simulation run (n = 1000):
    1. Sample demand from Normal(μ = Daily_Velocity, σ = Demand_Std_Dev)
    2. Calculate: Stock_Depletion_Day = Current_Stock / Sampled_Daily_Demand
    3. If Stock_Depletion_Day < Lead_Time_Days: Record as stockout

Stockout_Probability = Stockout_Count / n

if Stockout_Probability > 0.25:
    Alert: High stockout risk
```

**Simpler Alternative (Analytical):**
```
Z_Score = (Current_Stock - Lead_Time_Demand) / (Demand_Std_Dev × √Lead_Time_Days)

Stockout_Probability = 1 - Standard_Normal_CDF(Z_Score)

where Standard_Normal_CDF is cumulative distribution function
```

---

### Algorithm 5: Excess Inventory Detection

**Purpose:** Identify overstocked SKUs during wind-down

```
Excess_Months = DIR / 30.4  (convert days to months)

Wind_Down_Horizon = 24 months  (or actual remaining time)

Excess_Ratio = Excess_Months / Wind_Down_Horizon

if Excess_Ratio > 1.5:
    Classification: "Severely overstocked"
    Recommendation: Aggressive liquidation (discounts, promotions)
    
elif Excess_Ratio > 1.0:
    Classification: "Overstocked"
    Recommendation: Stop all restocking, natural depletion + moderate discounts
    
elif Excess_Ratio > 0.7:
    Classification: "Slightly overstocked"
    Recommendation: Reduce restock quantities by 50%
    
else:
    Classification: "Healthy for wind-down"
```

**Carrying Cost Calculation:**
```
Total_Carrying_Cost = Current_Stock × (
    Monthly_Storage_Fee_Per_Unit +
    Opportunity_Cost_Per_Unit +
    Obsolescence_Risk_Per_Unit
)

Opportunity_Cost = (Unit_COGS × Annual_Interest_Rate) / 12

Obsolescence_Risk = Unit_COGS × Monthly_Obsolescence_Rate
    (Recommended: 1-2% per month for wind-down phase)

if Total_Carrying_Cost > (Expected_Gross_Profit × 0.3):
    Recommendation: Liquidate (carrying cost eating too much profit)
```

---

## Storage Fee Optimization

### Algorithm 6: Storage Fee ROI Analysis

**Amazon FBA Fee Structure (2026 estimates):**
```
Monthly_Storage_Fee = Volume_Cubic_Feet × Rate_Per_Cu_Ft

Standard_Size_Rates:
- Jan-Sep: $0.87 per cubic foot
- Oct-Dec: $2.40 per cubic foot (peak season surcharge)

Oversized_Rates:
- Jan-Sep: $0.56 per cubic foot
- Oct-Dec: $1.40 per cubic foot

Long_Term_Storage_Fee (if stored >365 days):
- $6.90 per cubic foot OR $0.15 per unit (whichever is greater)
```

**ROI Calculation:**
```
Storage_ROI = (Gross_Profit_Per_Unit × Expected_Units_Sold) / 
              (Total_Storage_Fees_Until_Sold)

where:
Expected_Units_Sold = min(Current_Stock, Forecasted_Demand_Until_WindDown)
Total_Storage_Fees = Monthly_Storage_Fee × Months_Until_Sold

if Storage_ROI < 3.0:
    Recommendation: Remove from FBA or liquidate
    Reasoning: Storage fees eating >33% of gross profit
```

---

### Algorithm 7: Liquidation Priority Score

**Purpose:** Rank SKUs for liquidation sequence

```
Liquidation_Priority = 
    0.30 × Storage_Cost_Factor +
    0.25 × Velocity_Decline_Factor +
    0.20 × Excess_Stock_Factor +
    0.15 × Days_Until_LTSF_Factor +
    0.10 × Profitability_Factor

where each factor normalized 0-1 (higher = more urgent to liquidate)
```

**Factor Calculations:**

```
Storage_Cost_Factor = min(1.0, Monthly_Storage_Fee / (Unit_Price × 0.1))

Velocity_Decline_Factor = 
    if Velocity_Trend < -0.3: 1.0
    elif Velocity_Trend < -0.2: 0.7
    elif Velocity_Trend < -0.1: 0.4
    else: 0.0

Excess_Stock_Factor = min(1.0, (DIR - 180) / 180)
    (Anything >180 days scores higher)

Days_Until_LTSF_Factor = 
    if Days_In_FBA > 275: 1.0
    elif Days_In_FBA > 240: 0.7
    elif Days_In_FBA > 180: 0.4
    else: 0.0

Profitability_Factor = 1 - (Gross_Margin / Max_Gross_Margin_In_Catalog)
    (Lower margin = higher liquidation priority)
```

**Liquidation Sequence:**
1. Sort SKUs by Liquidation_Priority (descending)
2. Execute liquidation in order until storage capacity optimized
3. Methods (in order of preference):
   - Amazon promotions/coupons (preserve brand value)
   - Lightning Deals (clear volume quickly)
   - Amazon Outlet (low effort, automatic)
   - Liquidation.com (bulk offload)
   - Donation (tax write-off for slow movers)
   - Destruction (last resort, only if storage fees exceed all value)

---

## Restock Quantity Optimization

### Algorithm 8: Economic Order Quantity (EOQ) - Wind-Down Modified

**Classic EOQ:**
```
EOQ = √[(2 × Annual_Demand × Order_Cost) / Holding_Cost_Per_Unit]
```

**Wind-Down Modified EOQ:**
```
EOQ_WindDown = √[(2 × Remaining_Lifetime_Demand × Order_Cost) / 
                 (Holding_Cost_Per_Unit × Wind_Down_Adjustment)]

where:
Remaining_Lifetime_Demand = Daily_Velocity × Days_Until_Wind_Down_End
Wind_Down_Adjustment = 1.5 (increase holding cost to discourage large orders)
```

**Practical Constraints:**
```
Minimum_Order_Quantity = Supplier_MOQ or Freight_Break_Even_Quantity
Maximum_Order_Quantity = min(
    FBA_Storage_Limit_Remaining,
    6_Months_Of_Demand,  (never order more than 6 months during wind-down)
    Budget_Constraint
)

Optimal_Order_Qty = max(Minimum_Order_Quantity, 
                        min(EOQ_WindDown, Maximum_Order_Quantity))
```

---

### Algorithm 9: Reorder Point (ROP) Calculation

**Formula:**
```
ROP = Lead_Time_Demand + Safety_Stock

where:
Lead_Time_Demand = Daily_Velocity × Lead_Time_Days
Safety_Stock = z_score × Demand_Std_Dev × √Lead_Time_Days
```

**Wind-Down Adjustment:**
```
ROP_WindDown = ROP × (1 - Wind_Down_Risk_Tolerance)

where:
Wind_Down_Risk_Tolerance = 0.2 to 0.4
    (Willing to accept 20-40% higher stockout risk to avoid excess inventory)

z_score = 1.28 (90% service level) instead of 1.65 (95%)
```

**When Current_Stock ≤ ROP_WindDown:**
```
if Stockout_Probability > 0.3:
    Trigger restock
else:
    Wait 7 days, recalculate
```

---

### Algorithm 10: Dynamic Restock Quantity

**Purpose:** Adjust restock quantity based on current conditions

```
Base_Quantity = EOQ_WindDown

Adjustments:
1. Seasonal Adjustment:
   if Seasonal_Index[next_month] > 1.2:
       Base_Quantity *= 1.3  (increase for peak season)
   elif Seasonal_Index[next_month] < 0.8:
       Base_Quantity *= 0.7  (decrease for slow season)

2. Velocity Trend Adjustment:
   if Velocity_Trend < -0.2:
       Base_Quantity *= 0.6  (reduce for declining SKU)
   elif Velocity_Trend > 0.1:
       Base_Quantity *= 1.2  (increase if growing unexpectedly)

3. Storage Capacity Adjustment:
   Available_Capacity = FBA_Storage_Limit - Current_Total_Volume
   if Available_Capacity < (Base_Quantity × Unit_Volume):
       Base_Quantity = Available_Capacity / Unit_Volume

4. Time Remaining Adjustment:
   Months_Remaining = Wind_Down_End_Date - Current_Date
   Max_Reasonable_Quantity = Daily_Velocity × (Months_Remaining × 30.4) × 0.8
   Base_Quantity = min(Base_Quantity, Max_Reasonable_Quantity)

Final_Restock_Quantity = round_to_case_pack(Base_Quantity)
```

**Case Pack Optimization:**
```
Units_Per_Case = Supplier_Case_Pack_Size

Ideal_Cases = ceil(Base_Quantity / Units_Per_Case)

if (Ideal_Cases × Units_Per_Case) - Base_Quantity > (Units_Per_Case × 0.5):
    Final_Cases = Ideal_Cases - 1  (don't over-order by >50% of case)
else:
    Final_Cases = Ideal_Cases

Final_Restock_Quantity = Final_Cases × Units_Per_Case
```

---

## Decision Trees

### Decision Tree 1: Restock vs No Restock

```
Start: Evaluate SKU for restock

├─ Is Current_Stock > ROP_WindDown?
│  YES → No restock needed
│  NO → Continue
│
├─ Is Velocity_Trend < -0.30? (Rapidly declining)
│  YES → Do not restock (let deplete, liquidate remaining)
│  NO → Continue
│
├─ Is DIR < 30 days AND Stockout_Probability > 0.30?
│  YES → Continue (likely need to restock)
│  NO → Continue
│
├─ Is Months_Until_Wind_Down < 6?
│  YES → Calculate: Will this inventory sell before end?
│  │      If NO → Do not restock
│  │      If YES → Continue
│  NO → Continue
│
├─ Is Storage_Efficiency < 2.0? (High storage cost vs revenue)
│  YES → Do not restock (liquidate instead)
│  NO → Continue
│
├─ Is FBA storage capacity available?
│  NO → Do not restock (or remove other inventory first)
│  YES → Continue
│
└─ RESTOCK APPROVED
   Calculate quantity using Algorithm 10
```

---

### Decision Tree 2: Liquidation vs Hold

```
Start: Evaluate SKU for liquidation

├─ Is Liquidation_Priority > 0.7?
│  YES → LIQUIDATE IMMEDIATELY
│  NO → Continue
│
├─ Is Days_In_FBA > 275 AND DIR > 90?
│  YES → LIQUIDATE (LTSF approaching)
│  NO → Continue
│
├─ Is Storage_ROI < 3.0?
│  YES → LIQUIDATE (storage fees too high)
│  NO → Continue
│
├─ Is Velocity_Trend < -0.30 AND Excess_Ratio > 1.0?
│  YES → LIQUIDATE (declining fast + overstocked)
│  NO → Continue
│
├─ Is DIR > 180 AND Slow_Mover_Score > 0.5?
│  YES → LIQUIDATE (won't sell in reasonable time)
│  NO → Continue
│
└─ HOLD (continue normal sales)
   Monitor monthly, re-evaluate if conditions change
```

---

### Decision Tree 3: Liquidation Method Selection

```
Start: SKU approved for liquidation

├─ Is Gross_Margin > 40% AND Brand_Reputation = High?
│  YES → Try Amazon Promotions first (preserve value)
│  │      Duration: 2-4 weeks
│  │      Discount: 15-25%
│  │      If successful → Done
│  │      If unsuccessful → Continue
│  NO → Continue
│
├─ Is Current_Stock > 500 units?
│  YES → Lightning Deal (clear volume)
│  │      Discount: 20-35%
│  │      If accepted → Done
│  │      If rejected → Continue
│  NO → Continue
│
├─ Is Unit_Price > $15 AND Gross_Margin > 30%?
│  YES → Amazon Outlet (automatic, low effort)
│  │      Monitor for 4-8 weeks
│  │      If moving → Done
│  │      If not → Continue
│  NO → Continue
│
├─ Is Current_Stock > 1000 units OR Total_Value > $5000?
│  YES → Liquidation.com (bulk offload)
│  │      Expected recovery: 10-30% of wholesale
│  NO → Continue
│
├─ Is Donation_Tax_Benefit > Expected_Liquidation_Proceeds?
│  YES → Donate (get tax write-off)
│  NO → Continue
│
└─ Removal/Destruction (last resort)
   Only if storage fees exceed all other value
```

---

## Pseudocode Implementation

### Main Inventory Analysis Loop

```python
function analyze_inventory():
    """
    Main loop - run daily
    """
    
    # Load current inventory data
    inventory = fetch_inventory_from_amazon_sp_api()
    sales_history = fetch_sales_history(days=90)
    
    results = []
    
    for sku in inventory:
        # Calculate core metrics
        metrics = calculate_metrics(sku, sales_history)
        
        # Detect risks
        risks = detect_risks(sku, metrics)
        
        # Generate recommendations
        recommendation = generate_recommendation(sku, metrics, risks)
        
        results.append({
            'sku': sku.asin,
            'metrics': metrics,
            'risks': risks,
            'recommendation': recommendation
        })
    
    # Prioritize actions
    urgent_actions = [r for r in results if r['recommendation']['urgency'] == 'HIGH']
    
    # Generate alerts
    send_alerts(urgent_actions)
    
    # Store for dashboard
    save_to_database(results)
    
    return results


function calculate_metrics(sku, sales_history):
    """
    Calculate all core metrics for a SKU
    """
    
    # Filter sales for this SKU
    sku_sales = sales_history.filter(asin=sku.asin)
    
    # Velocity calculations
    daily_velocity_30 = sku_sales.last(30).sum() / 30
    daily_velocity_60 = sku_sales.last(60).sum() / 60
    daily_velocity_90 = sku_sales.last(90).sum() / 90
    
    # Standard deviation (for safety stock)
    demand_std_dev = sku_sales.last(60).std()
    
    # Seasonal adjustment
    current_month = get_current_month()
    seasonal_factor = get_seasonal_index(current_month)
    
    # Trend detection
    velocity_recent = daily_velocity_30
    velocity_historical = sku_sales[60:90].sum() / 30
    velocity_trend = (velocity_recent - velocity_historical) / velocity_historical
    
    # Adjusted velocity
    trend_factor = max(0.5, min(1.5, 1 + velocity_trend))
    adjusted_velocity = daily_velocity_30 * seasonal_factor * trend_factor
    
    # Days of inventory remaining
    if adjusted_velocity > 0:
        dir = sku.current_stock / adjusted_velocity
    else:
        dir = float('inf')
    
    # Safety stock
    z_score = 1.28  # 90% service level for wind-down
    lead_time_days = sku.lead_time or 21
    safety_stock = z_score * demand_std_dev * sqrt(lead_time_days)
    
    # Reorder point
    lead_time_demand = adjusted_velocity * lead_time_days
    rop = lead_time_demand + safety_stock
    rop_winddown = rop * 0.7  # 30% risk tolerance
    
    # Storage fees
    monthly_storage_fee = sku.volume_cubic_feet * get_storage_rate(current_month)
    storage_efficiency = (daily_velocity_30 * sku.unit_price * dir) / monthly_storage_fee if monthly_storage_fee > 0 else float('inf')
    
    # Stockout risk
    z_stockout = (sku.current_stock - lead_time_demand) / (demand_std_dev * sqrt(lead_time_days)) if demand_std_dev > 0 else 10
    stockout_probability = 1 - standard_normal_cdf(z_stockout)
    
    # Excess inventory
    months_remaining_in_winddown = get_months_until_winddown_end()
    excess_ratio = (dir / 30.4) / months_remaining_in_winddown
    
    # Slow mover score
    max_velocity = get_max_velocity_in_catalog()
    velocity_score = 1 - (daily_velocity_30 / max_velocity) if max_velocity > 0 else 1
    turnover_score = 1 - (365 / dir) if dir > 0 else 1
    storage_cost_score = monthly_storage_fee / (sku.unit_price * sku.current_stock) if sku.unit_price > 0 else 0
    slow_mover_score = 0.4*velocity_score + 0.3*turnover_score + 0.3*storage_cost_score
    
    # Liquidation priority
    liquidation_priority = calculate_liquidation_priority(sku, velocity_trend, dir, monthly_storage_fee, sku.unit_price)
    
    return {
        'daily_velocity': adjusted_velocity,
        'dir': dir,
        'velocity_trend': velocity_trend,
        'safety_stock': safety_stock,
        'rop': rop_winddown,
        'stockout_probability': stockout_probability,
        'storage_efficiency': storage_efficiency,
        'excess_ratio': excess_ratio,
        'slow_mover_score': slow_mover_score,
        'liquidation_priority': liquidation_priority,
        'seasonal_factor': seasonal_factor
    }


function detect_risks(sku, metrics):
    """
    Identify risk conditions
    """
    risks = []
    
    # Stockout risk
    if metrics['stockout_probability'] > 0.6:
        risks.append({
            'type': 'STOCKOUT_CRITICAL',
            'severity': 'HIGH',
            'message': f"Stockout probability {metrics['stockout_probability']:.1%}"
        })
    elif metrics['stockout_probability'] > 0.3:
        risks.append({
            'type': 'STOCKOUT_MODERATE',
            'severity': 'MEDIUM',
            'message': f"Stockout risk {metrics['stockout_probability']:.1%}"
        })
    
    # Overstock risk
    if metrics['excess_ratio'] > 1.5:
        risks.append({
            'type': 'SEVERE_OVERSTOCK',
            'severity': 'HIGH',
            'message': f"{metrics['dir']:.0f} days inventory, {metrics['excess_ratio']:.1f}x wind-down horizon"
        })
    elif metrics['excess_ratio'] > 1.0:
        risks.append({
            'type': 'OVERSTOCK',
            'severity': 'MEDIUM',
            'message': f"Excess inventory: {metrics['excess_ratio']:.1f}x wind-down timeline"
        })
    
    # Storage fee risk
    if metrics['storage_efficiency'] < 2.0:
        risks.append({
            'type': 'HIGH_STORAGE_COST',
            'severity': 'HIGH',
            'message': f"Storage ROI only {metrics['storage_efficiency']:.1f}x"
        })
    
    # LTSF risk
    days_in_fba = sku.days_in_fba or 0
    if days_in_fba > 275 and metrics['dir'] > 90:
        risks.append({
            'type': 'LTSF_APPROACHING',
            'severity': 'HIGH',
            'message': f"Long-term storage fee in {365 - days_in_fba} days"
        })
    
    # Slow mover
    if metrics['slow_mover_score'] > 0.7:
        risks.append({
            'type': 'CRITICAL_SLOW_MOVER',
            'severity': 'HIGH',
            'message': f"Slow mover score {metrics['slow_mover_score']:.2f}"
        })
    
    # Rapid decline
    if metrics['velocity_trend'] < -0.30:
        risks.append({
            'type': 'RAPID_DECLINE',
            'severity': 'HIGH',
            'message': f"Sales declining {abs(metrics['velocity_trend']):.0%} vs historical"
        })
    
    return risks


function generate_recommendation(sku, metrics, risks):
    """
    Generate action recommendation based on decision trees
    """
    
    # Check liquidation first
    should_liquidate = evaluate_liquidation_decision(sku, metrics)
    if should_liquidate:
        liquidation_method = select_liquidation_method(sku, metrics)
        return {
            'action': 'LIQUIDATE',
            'urgency': 'HIGH' if metrics['liquidation_priority'] > 0.7 else 'MEDIUM',
            'method': liquidation_method,
            'reasoning': get_liquidation_reasoning(sku, metrics, risks)
        }
    
    # Check restock need
    should_restock = evaluate_restock_decision(sku, metrics)
    if should_restock:
        restock_qty = calculate_restock_quantity(sku, metrics)
        return {
            'action': 'RESTOCK',
            'urgency': 'HIGH' if metrics['stockout_probability'] > 0.6 else 'MEDIUM',
            'quantity': restock_qty,
            'reasoning': get_restock_reasoning(sku, metrics, risks)
        }
    
    # No action needed
    return {
        'action': 'MONITOR',
        'urgency': 'LOW',
        'reasoning': 'Inventory levels healthy, continue normal sales'
    }


function evaluate_liquidation_decision(sku, metrics):
    """
    Decision tree for liquidation
    """
    
    # Immediate liquidation triggers
    if metrics['liquidation_priority'] > 0.7:
        return True
    
    if sku.days_in_fba > 275 and metrics['dir'] > 90:
        return True  # LTSF approaching
    
    if metrics['storage_efficiency'] < 2.0:
        return True  # Storage fees too high
    
    if metrics['velocity_trend'] < -0.30 and metrics['excess_ratio'] > 1.0:
        return True  # Declining + overstocked
    
    if metrics['dir'] > 180 and metrics['slow_mover_score'] > 0.5:
        return True  # Won't sell in time
    
    return False


function evaluate_restock_decision(sku, metrics):
    """
    Decision tree for restock
    """
    
    # Don't restock if stock is sufficient
    if sku.current_stock > metrics['rop']:
        return False
    
    # Don't restock rapidly declining SKUs
    if metrics['velocity_trend'] < -0.30:
        return False
    
    # Don't restock if won't sell before wind-down
    months_remaining = get_months_until_winddown_end()
    if months_remaining < 6:
        projected_sales = metrics['daily_velocity'] * (months_remaining * 30.4)
        if metrics['rop'] > projected_sales * 0.8:
            return False  # Would overstock
    
    # Don't restock if storage fees too high
    if metrics['storage_efficiency'] < 2.0:
        return False
    
    # Check stockout risk
    if metrics['dir'] < 30 and metrics['stockout_probability'] > 0.30:
        return True  # Urgent restock needed
    
    if sku.current_stock <= metrics['rop']:
        return True  # Normal restock trigger
    
    return False


function calculate_restock_quantity(sku, metrics):
    """
    Algorithm 10: Dynamic restock quantity
    """
    
    # Base EOQ calculation
    months_remaining = get_months_until_winddown_end()
    remaining_lifetime_demand = metrics['daily_velocity'] * months_remaining * 30.4
    
    order_cost = 500  # Estimated cost to place order
    holding_cost_per_unit = (sku.storage_fee_per_month + sku.cogs * 0.01) * 1.5  # Wind-down adjustment
    
    if holding_cost_per_unit > 0:
        eoq = sqrt((2 * remaining_lifetime_demand * order_cost) / holding_cost_per_unit)
    else:
        eoq = 100  # Fallback
    
    base_quantity = eoq
    
    # Seasonal adjustment
    next_month = get_next_month()
    seasonal_index = get_seasonal_index(next_month)
    if seasonal_index > 1.2:
        base_quantity *= 1.3
    elif seasonal_index < 0.8:
        base_quantity *= 0.7
    
    # Velocity trend adjustment
    if metrics['velocity_trend'] < -0.2:
        base_quantity *= 0.6
    elif metrics['velocity_trend'] > 0.1:
        base_quantity *= 1.2
    
    # Time remaining constraint
    max_reasonable = metrics['daily_velocity'] * months_remaining * 30.4 * 0.8
    base_quantity = min(base_quantity, max_reasonable)
    
    # Never order more than 6 months supply
    max_six_months = metrics['daily_velocity'] * 180
    base_quantity = min(base_quantity, max_six_months)
    
    # Storage capacity constraint
    available_capacity = get_available_fba_capacity()
    if available_capacity < (base_quantity * sku.unit_volume):
        base_quantity = available_capacity / sku.unit_volume
    
    # Round to case packs
    units_per_case = sku.case_pack_size or 1
    ideal_cases = ceil(base_quantity / units_per_case)
    
    # Don't over-order by more than half a case
    if (ideal_cases * units_per_case) - base_quantity > (units_per_case * 0.5):
        final_cases = ideal_cases - 1
    else:
        final_cases = ideal_cases
    
    final_quantity = max(final_cases * units_per_case, sku.minimum_order_qty or 0)
    
    return int(final_quantity)


function select_liquidation_method(sku, metrics):
    """
    Decision tree 3: Liquidation method
    """
    
    # High margin + high brand value → Try promotions first
    if sku.gross_margin > 0.40 and sku.brand_reputation == 'HIGH':
        return {
            'method': 'AMAZON_PROMOTION',
            'discount': 0.20,
            'duration_weeks': 3
        }
    
    # High volume → Lightning Deal
    if sku.current_stock > 500:
        return {
            'method': 'LIGHTNING_DEAL',
            'discount': 0.30
        }
    
    # Decent price + margin → Amazon Outlet
    if sku.unit_price > 15 and sku.gross_margin > 0.30:
        return {
            'method': 'AMAZON_OUTLET',
            'monitor_weeks': 6
        }
    
    # High volume or value → Bulk liquidator
    if sku.current_stock > 1000 or (sku.current_stock * sku.cogs) > 5000:
        return {
            'method': 'LIQUIDATION_COM',
            'expected_recovery': 0.20  # 20% of wholesale
        }
    
    # Tax benefit better than proceeds → Donate
    donation_value = sku.current_stock * sku.cogs * 0.30  # 30% tax benefit
    estimated_liquidation = sku.current_stock * sku.cogs * 0.10  # 10% recovery
    if donation_value > estimated_liquidation:
        return {
            'method': 'DONATION',
            'tax_benefit': donation_value
        }
    
    # Last resort
    return {
        'method': 'REMOVAL',
        'note': 'Storage fees exceed liquidation value'
    }
```

---

## Performance Optimization

**Computation Frequency:**
- Core metrics: Daily (overnight batch)
- Stockout risk: Daily for SKUs with DIR < 60
- Liquidation priority: Weekly
- Seasonal indices: Monthly recalculation

**Caching Strategy:**
```
Cache historical seasonal indices (recalculate monthly)
Cache SKU attributes (recalculate on changes only)
Incremental sales velocity (update daily with new sales)
```

**Parallel Processing:**
```
Process SKUs in parallel (batch of 50-100 at a time)
Separate urgent analysis (DIR < 30) from routine analysis
Priority queue: Stockout risks processed first
```

---

## Testing & Validation

**Unit Tests Required:**
1. Velocity calculation accuracy (compare to manual calculations)
2. Safety stock formulas (validate against statistical tables)
3. Seasonal adjustment (verify with known seasonal patterns)
4. Edge cases:
   - Zero sales SKUs
   - New SKUs with limited history
   - Negative trends
   - Division by zero protection

**Validation Metrics:**
```
Stockout Rate = Actual_Stockouts / Total_SKU_Days
Target: <5% for active SKUs during wind-down

Overstock Rate = SKUs_With_Excess_Ratio_>1.5 / Total_SKUs
Target: <10% after first quarter

Storage Fee % of Revenue = Total_Storage_Fees / Total_Revenue
Target: <3% (industry benchmark: 2-4%)

Forecast Accuracy (MAPE) = Avg(|Actual - Forecast| / Actual)
Target: <30% (acceptable for wind-down volatility)
```

---

## Integration Points

**Required Data Inputs (Amazon SP-API):**
- Inventory levels (daily)
- Sales by SKU (daily)
- Storage fees (monthly)
- FBA capacity limits (weekly)
- Inbound shipments (real-time)

**Output Interfaces:**
- Dashboard API (real-time metrics)
- Alert system (email/SMS for urgent actions)
- Restock recommendations (weekly report)
- Liquidation queue (prioritized list)

**External Integrations:**
- Supplier systems (for MOQ, lead times)
- Accounting system (for COGS, tax calculations)
- Freight forwarders (for shipment planning)

---

## Appendix: Parameter Tuning Guide

**Conservative Wind-Down (Minimize Risk):**
- Service level: 95% (z = 1.65)
- Wind-down risk tolerance: 0.2 (20%)
- Excess ratio threshold: 0.8
- Restock trigger: Stockout probability > 0.2

**Aggressive Wind-Down (Minimize Inventory):**
- Service level: 85% (z = 1.04)
- Wind-down risk tolerance: 0.4 (40%)
- Excess ratio threshold: 1.2
- Restock trigger: Stockout probability > 0.4

**Recommended (Balanced):**
- Service level: 90% (z = 1.28)
- Wind-down risk tolerance: 0.3 (30%)
- Excess ratio threshold: 1.0
- Restock trigger: Stockout probability > 0.3

Adjust based on:
- Category competitiveness (golf = moderate, can tolerate some stockouts)
- Margin levels (higher margin = can afford safety stock)
- Remaining wind-down time (closer to end = more aggressive)

---

**Document End**
