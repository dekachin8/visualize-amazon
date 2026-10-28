# VISUALIZE Sports Inventory Intelligence - Implementation Roadmap

**Version:** 1.0  
**Date:** March 26, 2026  
**Purpose:** Step-by-step implementation guide with timeline and code structure

---

## Table of Contents

1. [Project Overview](#project-overview)
2. [Technology Stack](#technology-stack)
3. [Phase 1: MVP (Weeks 1-2)](#phase-1-mvp-weeks-1-2)
4. [Phase 2: Automation (Weeks 3-4)](#phase-2-automation-weeks-3-4)
5. [Phase 3: Optimization (Month 2)](#phase-3-optimization-month-2)
6. [Phase 4: Scale (Month 3+)](#phase-4-scale-month-3)
7. [Code Structure](#code-structure)
8. [Deployment & Operations](#deployment--operations)

---

## Project Overview

**Goal:** Build automated inventory intelligence system for VISUALIZE Sports wind-down

**Key Deliverables:**
1. Daily inventory analysis and recommendations
2. Automated restock calculations
3. Liquidation priority rankings
4. Storage fee optimization
5. Weekly reports and critical alerts

**Success Criteria:**
- Reduce manual inventory decision time from ~10 hrs/week to <1 hr/week
- Avoid 100% of LTSF charges
- Maintain storage fees <3% of revenue
- Smooth inventory reduction following wind-down curve

---

## Technology Stack

### Core Technologies

**Language:** Python 3.9+
- Reason: Rich data science libraries, Amazon SDK support

**Data Storage (MVP):** JSON files
- Reason: Simple, no database setup, version-controllable
- Upgrade path: PostgreSQL when >100 SKUs or >6 months history

**Libraries:**
```
pandas>=1.5.0          # Data manipulation
numpy>=1.23.0          # Numerical calculations
requests>=2.28.0       # API calls
python-dateutil>=2.8.0 # Date handling
matplotlib>=3.5.0      # Visualization (optional, for charts)
openpyxl>=3.0.0        # Excel export
python-dotenv>=0.20.0  # Environment variables
```

**Amazon Integration:**
```
sp-api>=0.11.0         # Amazon Selling Partner API client
```

**Optional (Phase 3+):**
```
plotly>=5.10.0         # Interactive dashboards
flask>=2.2.0           # Web dashboard (if desired)
celery>=5.2.0          # Task scheduling (alternative to cron)
redis>=4.3.0           # Celery backend
```

---

## Phase 1: MVP (Weeks 1-2)

**Goal:** Prove value with basic system

**Timeline:** 10-15 hours of development

### Week 1: Data Pipeline

**Tasks:**

**1. Amazon SP-API Setup (2 hours)**
```
□ Register for Amazon SP-API access
□ Get LWA credentials (refresh token, client ID/secret)
□ Test API connection
□ Implement authentication helper
```

**Code:**
```python
# src/amazon_client.py
import requests
from datetime import datetime, timedelta
import os
from dotenv import load_dotenv

load_dotenv()

class AmazonSPAPI:
    def __init__(self):
        self.refresh_token = os.getenv('AMAZON_REFRESH_TOKEN')
        self.client_id = os.getenv('AMAZON_CLIENT_ID')
        self.client_secret = os.getenv('AMAZON_CLIENT_SECRET')
        self.marketplace_id = 'ATVPDKIKX0DER'  # US
        self.access_token = None
        self.token_expiry = None
    
    def get_access_token(self):
        """Get or refresh access token"""
        if self.access_token and datetime.now() < self.token_expiry:
            return self.access_token
        
        # Token refresh logic (see DATA_REQUIREMENTS.md)
        # ...
        
    def fetch_inventory(self):
        """Fetch FBA inventory summary"""
        # Implementation (see DATA_REQUIREMENTS.md)
        # ...
```

**2. Data Fetch Scripts (4 hours)**
```
□ fetch_inventory.py - Get current FBA inventory
□ fetch_sales.py - Get daily sales by ASIN
□ fetch_fees.py - Get storage fees
□ Save to JSON files (data/inventory/, data/sales/, etc.)
```

**Directory Structure:**
```
visualize-inventory/
├── .env                    # API credentials (DO NOT COMMIT)
├── .gitignore
├── requirements.txt
├── README.md
├── src/
│   ├── __init__.py
│   ├── amazon_client.py    # SP-API wrapper
│   ├── fetch_data.py       # Data fetching orchestration
│   └── config.py           # Configuration
├── data/
│   ├── inventory/
│   │   └── 2026-03-26.json
│   ├── sales/
│   │   └── 2026-03-26.json
│   └── catalog/
│       └── products.json   # Manual SKU catalog
└── tests/
    └── test_amazon_client.py
```

**3. Product Catalog Setup (2 hours)**
```
□ Create products.json with SKU details
□ Include: ASIN, SKU, COGS, dimensions, supplier info
□ Import from existing spreadsheet/system if available
```

**Example products.json:**
```json
{
  "products": [
    {
      "asin": "B08XYZ123",
      "sku": "VIS-GLF-001",
      "product_name": "Golf Ball Marker Set",
      "cogs": 4.00,
      "list_price": 19.99,
      "volume_cubic_feet": 0.15,
      "case_pack_size": 24,
      "minimum_order_qty": 500,
      "lead_time_days": 21,
      "supplier": "Acme Golf Supplies",
      "tier": 1
    }
  ]
}
```

**4. Test Data Pipeline (1 hour)**
```
□ Run fetch scripts manually
□ Verify JSON output looks correct
□ Check for missing data or errors
```

---

### Week 2: Calculations & Reports

**Tasks:**

**1. Core Metrics Calculator (4 hours)**
```
□ calculate_metrics.py - Implement algorithms
□ DIR, velocity, safety stock, ROP
□ Stockout probability
□ Storage efficiency
```

**Code:**
```python
# src/metrics.py
import numpy as np
from scipy.stats import norm

def calculate_dir(current_stock, daily_velocity):
    """Days of inventory remaining"""
    if daily_velocity == 0:
        return float('inf')
    return current_stock / daily_velocity

def calculate_velocity(sales_history, days=30):
    """Calculate average daily velocity"""
    recent_sales = sales_history[-days:]
    return np.mean(recent_sales)

def calculate_safety_stock(demand_std_dev, lead_time_days, service_level=0.90):
    """Safety stock for target service level"""
    z_score = norm.ppf(service_level)
    return z_score * demand_std_dev * np.sqrt(lead_time_days)

def calculate_stockout_probability(current_stock, lead_time_demand, demand_std_dev, lead_time_days):
    """Probability of stockout during lead time"""
    if demand_std_dev == 0:
        return 0.0 if current_stock >= lead_time_demand else 1.0
    
    z_score = (current_stock - lead_time_demand) / (demand_std_dev * np.sqrt(lead_time_days))
    return 1 - norm.cdf(z_score)

# ... more metrics
```

**2. Recommendation Engine (3 hours)**
```
□ recommendations.py - Decision tree logic
□ Restock vs no-restock rules
□ Quantity calculations
□ Urgency classification
```

**Code:**
```python
# src/recommendations.py

def should_restock(sku, metrics):
    """Decision tree: restock or not?"""
    
    # Pre-qualification checks
    if metrics['available_stock'] > metrics['rop']:
        return {'action': 'NO_RESTOCK_NEEDED', 'reason': 'Stock above ROP'}
    
    if metrics['velocity_trend'] < -0.30:
        return {'action': 'DO_NOT_RESTOCK', 'reason': 'Declining >30%'}
    
    if metrics['slow_mover_score'] > 0.7 and metrics['dir'] > 180:
        return {'action': 'DO_NOT_RESTOCK', 'reason': 'Critical slow mover'}
    
    # ... more rules (see RESTOCK_LOGIC.md)
    
    return {'action': 'RESTOCK', 'quantity': calculate_restock_qty(sku, metrics)}

def calculate_urgency(metrics):
    """Classify urgency level"""
    if metrics['stockout_probability'] > 0.60 or metrics['dir'] < 14:
        return 'CRITICAL'
    elif metrics['stockout_probability'] > 0.30 or metrics['dir'] < 30:
        return 'HIGH'
    elif metrics['stockout_probability'] > 0.15 or metrics['dir'] < 45:
        return 'MEDIUM'
    else:
        return 'LOW'
```

**3. Weekly Report Generator (2 hours)**
```
□ generate_report.py - Create email-friendly report
□ Critical actions section
□ High priority section
□ Do-not-restock section
□ Summary statistics
```

**Example Output:**
```
VISUALIZE Sports Weekly Restock Report
Week of: March 24-30, 2026

=== CRITICAL ACTIONS (Order Today) ===

1. Golf Ball Marker Set (VIS-GLF-001)
   Current: 215 units | DIR: 18 days | Stockout Risk: 68%
   Recommendation: Order 1,200 units ($4,800)
   Reason: High stockout risk, peak season approaching

... (more items)

=== SUMMARY ===
Total SKUs Analyzed: 127
Restock Recommended: 12 (9.4%)
Total Recommended Order Value: $18,400
```

**4. Test End-to-End (1 hour)**
```
□ Run full pipeline: fetch → calculate → recommend → report
□ Verify output makes sense
□ Check edge cases (zero sales, new products, etc.)
```

---

**MVP Deliverable (End of Week 2):**
- Working data pipeline (manual execution)
- Core calculations implemented
- Weekly restock report generated
- **Value:** Tim sees actionable recommendations, can make informed decisions

---

## Phase 2: Automation (Weeks 3-4)

**Goal:** Reduce manual intervention, add alerts

**Timeline:** 10-12 hours

### Week 3: Automation

**Tasks:**

**1. Daily Automation Script (2 hours)**
```
□ run_daily.py - Orchestrates entire pipeline
□ Error handling and logging
□ Email output on completion
```

**Code:**
```python
# src/run_daily.py
import logging
from datetime import datetime
from fetch_data import fetch_all_data
from metrics import calculate_all_metrics
from recommendations import generate_all_recommendations
from reports import generate_daily_summary
from alerts import check_alerts

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

def main():
    logger.info(f"Starting daily pipeline: {datetime.now()}")
    
    try:
        # 1. Fetch data
        logger.info("Fetching data from Amazon...")
        inventory, sales = fetch_all_data()
        
        # 2. Calculate metrics
        logger.info("Calculating metrics...")
        metrics = calculate_all_metrics(inventory, sales)
        
        # 3. Generate recommendations
        logger.info("Generating recommendations...")
        recommendations = generate_all_recommendations(metrics)
        
        # 4. Check for alerts
        logger.info("Checking alert conditions...")
        alerts = check_alerts(metrics, recommendations)
        
        # 5. Generate summary
        summary = generate_daily_summary(metrics, recommendations, alerts)
        
        # 6. Send if action needed
        if alerts or recommendations:
            send_email(summary)
        
        logger.info("Daily pipeline completed successfully")
        
    except Exception as e:
        logger.error(f"Pipeline failed: {e}")
        send_error_alert(e)

if __name__ == "__main__":
    main()
```

**2. Cron Job Setup (1 hour)**
```
□ Set up cron to run daily at 2 AM
□ Log output to file
□ Email on errors
```

**Crontab:**
```bash
# Daily inventory analysis (2 AM)
0 2 * * * cd /path/to/visualize-inventory && /usr/bin/python3 src/run_daily.py >> logs/daily.log 2>&1

# Weekly report (Monday 8 AM)
0 8 * * 1 cd /path/to/visualize-inventory && /usr/bin/python3 src/run_weekly.py
```

**3. Alert System (3 hours)**
```
□ alerts.py - Alert condition checking
□ Email alerts for critical issues
□ SMS for urgent stockouts (optional, via Twilio)
```

**Alert Types:**
```python
# src/alerts.py

def check_alerts(metrics, recommendations):
    alerts = []
    
    # Critical stockout risk
    for sku in metrics:
        if sku['stockout_probability'] > 0.70 or sku['dir'] < 14:
            alerts.append({
                'type': 'CRITICAL_STOCKOUT',
                'severity': 'HIGH',
                'sku': sku['asin'],
                'message': f"Stockout risk {sku['stockout_probability']:.0%}, {sku['dir']:.0f} days remaining"
            })
    
    # LTSF approaching
    for sku in metrics:
        if sku['days_in_fba'] > 275 and sku['dir'] > 90:
            alerts.append({
                'type': 'LTSF_APPROACHING',
                'severity': 'HIGH',
                'sku': sku['asin'],
                'message': f"LTSF in {365 - sku['days_in_fba']} days"
            })
    
    # Storage capacity critical
    total_volume = sum(sku['volume'] * sku['current_stock'] for sku in metrics)
    capacity_pct = total_volume / FBA_STORAGE_LIMIT
    if capacity_pct > 0.95:
        alerts.append({
            'type': 'STORAGE_CAPACITY',
            'severity': 'CRITICAL',
            'message': f"FBA storage at {capacity_pct:.0%}"
        })
    
    return alerts
```

---

### Week 4: Auto-Approval & Dashboard

**Tasks:**

**1. Auto-Approval Logic (2 hours)**
```
□ Implement approval thresholds
□ Generate purchase orders for auto-approved items
□ Email summary of auto-approvals
```

**2. Dashboard (Optional, 4 hours)**
```
□ Simple Flask web app
□ Show current metrics for all SKUs
□ Drill-down by SKU
□ Recommendation status
```

**Simple HTML Dashboard:**
```python
# src/dashboard.py (optional)
from flask import Flask, render_template
import json

app = Flask(__name__)

@app.route('/')
def index():
    # Load latest metrics
    with open('data/metrics/latest.json') as f:
        metrics = json.load(f)
    
    return render_template('dashboard.html', metrics=metrics)

if __name__ == '__main__':
    app.run(debug=True, port=5000)
```

---

**Phase 2 Deliverable (End of Week 4):**
- Fully automated daily pipeline
- Critical alerts sent automatically
- Auto-approval for low-risk restocks
- **Value:** System runs unattended, Tim only acts on exceptions

---

## Phase 3: Optimization (Month 2)

**Goal:** Improve accuracy, track performance

**Timeline:** 8-10 hours

**Tasks:**

**1. Forecast Accuracy Tracking (3 hours)**
```
□ Calculate MAPE (mean absolute percentage error)
□ Track by SKU and overall
□ Identify problem SKUs (consistently poor forecasts)
□ Tune seasonal adjustments
```

**Code:**
```python
# src/accuracy.py

def calculate_mape(actual, forecast):
    """Mean Absolute Percentage Error"""
    return np.mean(np.abs((actual - forecast) / actual)) * 100

def track_forecast_accuracy():
    # Compare last week's forecasts to actual sales
    forecasts = load_forecasts(date=today - timedelta(days=7))
    actuals = load_sales(date=today)
    
    for sku in forecasts:
        mape = calculate_mape(actuals[sku], forecasts[sku])
        
        # Store accuracy metric
        save_accuracy_metric(sku, mape, date=today)
        
        # Alert if consistently poor
        if mape > 40:  # >40% error
            create_alert(f"SKU {sku} forecast accuracy poor: MAPE {mape:.1f}%")
```

**2. Liquidation Tracking (2 hours)**
```
□ Track liquidation attempts and outcomes
□ Recovery rate by method
□ Time to clear inventory
□ Optimize method selection based on results
```

**3. Seasonal Tuning (2 hours)**
```
□ Compare predicted seasonal pattern to actual
□ Adjust indices if needed
□ Validate golf seasonality assumptions
```

**4. Parameter Optimization (2 hours)**
```
□ Backtest different safety stock levels
□ Optimize restock quantity formulas
□ A/B test decision thresholds
```

---

**Phase 3 Deliverable (End of Month 2):**
- Improved forecast accuracy (target: <25% MAPE)
- Optimized liquidation strategy
- Validated seasonal adjustments
- **Value:** System is more accurate, fewer surprises

---

## Phase 4: Scale (Month 3+)

**Goal:** Handle full catalog, production-grade

**Timeline:** 15-20 hours

**Tasks:**

**1. Database Migration (6 hours)**
```
□ Set up PostgreSQL
□ Define schema (see DATA_REQUIREMENTS.md)
□ Migrate historical JSON data to DB
□ Update code to use DB instead of files
```

**Schema:**
```sql
-- See DATA_REQUIREMENTS.md for full schema
-- Key tables: inventory_snapshots, sales_history, calculated_metrics, recommendations
```

**2. Advanced Dashboard (6 hours)**
```
□ Interactive charts (Plotly)
□ Trend analysis
□ SKU comparison
□ Drill-down by tier, category, etc.
□ Mobile-responsive
```

**3. Performance Optimization (3 hours)**
```
□ Parallel processing for SKU calculations
□ Cache frequently accessed data
□ Optimize SQL queries
□ Target: <5 min to process 200+ SKUs
```

**4. Integration Enhancements (4 hours)**
```
□ Supplier order automation (email POs)
□ Price optimization suggestions
□ Competitor price tracking (optional)
□ Integration with accounting system
```

---

**Phase 4 Deliverable (End of Month 3):**
- Production-grade system
- Handles full SKU catalog efficiently
- Advanced analytics and insights
- **Value:** Scalable to 500+ SKUs, <1 hr/week maintenance

---

## Code Structure

### Final Directory Layout

```
visualize-inventory/
├── .env                           # Credentials (not committed)
├── .gitignore
├── requirements.txt
├── README.md
├── setup.py                       # Package setup
├── config/
│   ├── config.yaml                # System configuration
│   └── seasonal_indices.json     # Seasonal adjustments
├── src/
│   ├── __init__.py
│   ├── amazon_client.py           # SP-API wrapper
│   ├── fetch_data.py              # Data fetching
│   ├── metrics.py                 # Metric calculations
│   ├── recommendations.py         # Decision logic
│   ├── alerts.py                  # Alert system
│   ├── reports.py                 # Report generation
│   ├── email_client.py            # Email sending
│   ├── database.py                # DB operations (Phase 4)
│   ├── dashboard.py               # Web dashboard (Phase 4)
│   ├── run_daily.py               # Daily orchestration
│   ├── run_weekly.py              # Weekly reports
│   └── utils.py                   # Helper functions
├── data/                          # JSON storage (MVP)
│   ├── inventory/
│   ├── sales/
│   ├── metrics/
│   └── catalog/
├── logs/
│   ├── daily.log
│   └── errors.log
├── tests/
│   ├── test_metrics.py
│   ├── test_recommendations.py
│   └── test_amazon_client.py
├── docs/
│   ├── INVENTORY_ALGORITHM.md     # From design phase
│   ├── RESTOCK_LOGIC.md
│   ├── WIND_DOWN_STRATEGY.md
│   └── DATA_REQUIREMENTS.md
└── scripts/
    ├── setup_database.sql         # DB schema
    ├── migrate_json_to_db.py      # Migration script
    └── backfill_historical.py     # Import old data
```

---

## Deployment & Operations

### Development Environment

**Setup:**
```bash
# Clone repo
git clone https://github.com/visualize/inventory-intelligence.git
cd inventory-intelligence

# Create virtual environment
python3 -m venv venv
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Set up environment variables
cp .env.example .env
# Edit .env with API credentials

# Test connection
python src/amazon_client.py --test

# Run test pipeline
python src/run_daily.py --dry-run
```

---

### Production Deployment

**Server Requirements:**
- Linux (Ubuntu 20.04+)
- Python 3.9+
- PostgreSQL 13+ (Phase 4)
- 2GB RAM, 20GB disk
- Cron or systemd timer

**Deployment:**
```bash
# SSH to server
ssh user@server

# Clone repo
git clone https://github.com/visualize/inventory-intelligence.git
cd inventory-intelligence

# Install system dependencies
sudo apt install python3-pip python3-venv postgresql

# Set up Python environment
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt

# Configure environment
cp .env.example .env
nano .env  # Add credentials

# Set up cron jobs
crontab -e
# Add jobs (see Phase 2 for cron syntax)

# Test
python src/run_daily.py

# Monitor logs
tail -f logs/daily.log
```

---

### Monitoring & Maintenance

**Daily Checks (Automated):**
- Data fetch success/failure
- Calculation completion
- Alert delivery
- Error log review

**Weekly Reviews:**
- Forecast accuracy trends
- Restock execution rate
- Alert response time
- Storage fee tracking

**Monthly Reviews:**
- Overall system performance
- Parameter tuning needs
- Phase transition planning
- Wind-down trajectory vs target

---

### Backup & Recovery

**Backup Strategy:**
```bash
# Daily backup (add to cron)
0 4 * * * tar -czf /backup/visualize-inventory-$(date +\%Y\%m\%d).tar.gz /path/to/visualize-inventory/data

# Database backup (if using PostgreSQL)
0 4 * * * pg_dump visualize_inventory > /backup/db-$(date +\%Y\%m\%d).sql

# Retention: Keep 30 days
find /backup -name "*.tar.gz" -mtime +30 -delete
```

**Recovery:**
```bash
# Restore from backup
tar -xzf /backup/visualize-inventory-20260326.tar.gz -C /path/to/visualize-inventory/

# Restore database
psql visualize_inventory < /backup/db-20260326.sql
```

---

## Testing Strategy

### Unit Tests

**Run:**
```bash
pytest tests/
```

**Coverage Target:** >80%

**Key Tests:**
```python
# tests/test_metrics.py
def test_dir_calculation()
def test_velocity_calculation()
def test_safety_stock()
def test_stockout_probability()

# tests/test_recommendations.py
def test_restock_decision()
def test_quantity_calculation()
def test_urgency_classification()

# tests/test_amazon_client.py
def test_authentication()
def test_fetch_inventory()
def test_rate_limiting()
```

---

### Integration Tests

**Test End-to-End Pipeline:**
```bash
python tests/integration_test.py
```

**Validates:**
- Data fetch → calculation → recommendation
- Alert triggering
- Report generation
- Email delivery

---

### Manual Testing Checklist

**Before Production:**
```
□ Test with real Amazon API (not sandbox)
□ Verify all SKUs appear in reports
□ Check calculations against manual spreadsheet
□ Validate seasonal adjustments
□ Test alert delivery (email/SMS)
□ Verify auto-approval thresholds
□ Review first week of recommendations with Tim
```

---

## Cost Estimates

### Development Costs

**Phase 1 (MVP):** 15 hours × $100/hr = $1,500 (if outsourcing)  
**Phase 2 (Automation):** 12 hours × $100/hr = $1,200  
**Phase 3 (Optimization):** 10 hours × $100/hr = $1,000  
**Phase 4 (Scale):** 20 hours × $100/hr = $2,000  

**Total Development:** ~$5,700 (or DIY with Tim's time)

---

### Operational Costs

**Monthly:**
- Server hosting: $20-50/month (DigitalOcean, AWS Lightsail)
- Database (if cloud): $15-30/month
- Email service (SendGrid): Free tier (up to 100 emails/day)
- SMS alerts (Twilio): ~$5/month (if used)

**Total:** $40-85/month

**ROI:** Saves 10+ hours/week of manual work = $4,000+/month value

---

## Success Criteria

**MVP Success (End of Phase 1):**
- [ ] System generates weekly restock report
- [ ] Recommendations are actionable and accurate
- [ ] Tim finds it useful (subjective but critical)

**Automation Success (End of Phase 2):**
- [ ] System runs daily without manual intervention
- [ ] Critical alerts delivered within 1 hour
- [ ] <1 hour/week of Tim's time required

**Optimization Success (End of Phase 3):**
- [ ] Forecast accuracy MAPE <25%
- [ ] Liquidation recovery rates meet targets
- [ ] Storage fees <3% of revenue

**Scale Success (End of Phase 4):**
- [ ] Handles 200+ SKUs in <5 minutes
- [ ] Dashboard provides insights Tim uses regularly
- [ ] System is maintainable by Tim or future hire

---

## Risks & Contingencies

**Risk 1: Amazon API Access Denied**
- Contingency: Manual data export from Seller Central, import to system

**Risk 2: Forecasts Inaccurate**
- Contingency: Start with conservative safety stock, tune over time

**Risk 3: Tim Overwhelmed by Alerts**
- Contingency: Adjust thresholds, batch alerts into daily digest

**Risk 4: Development Takes Longer**
- Contingency: Launch MVP first, iterate. Value from Phase 1 alone justifies effort.

---

## Next Steps

1. **Get Tim's Approval**
   - Review strategy and approach
   - Confirm priorities and timeline
   - Address questions (see inventory-notes.md)

2. **Secure Amazon SP-API Access**
   - Register developer account
   - Get credentials
   - Test API connection

3. **Kickoff Phase 1**
   - Set up development environment
   - Build MVP (2 weeks)
   - Deliver first weekly report

4. **Iterate Based on Feedback**
   - Tune parameters
   - Add features as needed
   - Scale when confident

---

**Document End**

This roadmap provides a clear path from concept to production system. Adjust timelines and priorities based on Tim's feedback and business needs.
