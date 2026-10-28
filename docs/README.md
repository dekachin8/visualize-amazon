# VISUALIZE Sports Inventory Intelligence System - Documentation Index

**Project:** Automated Inventory Management for Wind-Down Phase  
**Date:** March 26, 2026  
**Status:** ✅ Design Complete - Ready for Implementation

---

## 🎯 Start Here

**New to this project?** Read these in order:

1. **[EXECUTIVE_SUMMARY.md](EXECUTIVE_SUMMARY.md)** *(13 KB, 15-min read)*
   - High-level overview of the system
   - Business value and ROI
   - Implementation timeline
   - Next steps

2. **[inventory-notes.md](inventory-notes.md)** *(18 KB, 20-min read)*
   - Working notes and design decisions
   - Key highlights and quick reference
   - Questions for stakeholder review

---

## 📚 Core Documentation

### Algorithm Design

**[INVENTORY_ALGORITHM.md](INVENTORY_ALGORITHM.md)** *(33 KB, 45-min read)*

Complete mathematical foundation for the system:
- Core metrics (DIR, velocity, stockout risk, storage efficiency)
- Seasonal adjustment models
- Risk detection algorithms
- Restock quantity optimization (modified EOQ)
- Liquidation priority scoring
- Decision trees
- Pseudocode implementation

**When to read:** Before implementing calculations, need to understand the math

---

### Business Logic

**[RESTOCK_LOGIC.md](RESTOCK_LOGIC.md)** *(33 KB, 45-min read)*

Detailed decision rules and operational procedures:
- Input parameters specification
- Restock vs no-restock decision trees
- Quantity calculation logic
- Edge case handling (new products, volatile demand, etc.)
- Automation vs human approval thresholds
- Alert conditions and thresholds
- Operational procedures (daily/weekly/monthly)

**When to read:** Implementing decision logic, configuring automation rules

---

### Strategic Framework

**[WIND_DOWN_STRATEGY.md](WIND_DOWN_STRATEGY.md)** *(34 KB, 50-min read)*

Comprehensive wind-down business strategy:
- 4-phase timeline (Controlled → Decline → Liquidation → Exit)
- SKU tiering system (Core/Solid/Marginal/Poor performers)
- Inventory reduction targets and tracking
- Liquidation method hierarchy and decision matrix
- Financial optimization (pricing, margins, tax planning)
- Risk management (stockout vs overstock trade-offs)
- Exit criteria and success metrics

**When to read:** Strategic planning, quarterly reviews, phase transitions

---

### Technical Specifications

**[DATA_REQUIREMENTS.md](DATA_REQUIREMENTS.md)** *(28 KB, 40-min read)*

Complete data integration and storage specification:
- Amazon SP-API endpoints and data fields
- Historical data requirements (90-day minimum, 24-month recommended)
- External data sources (supplier info, business config)
- Database schema (if scaling beyond MVP)
- Data quality validation rules
- API integration guide with code examples

**When to read:** Setting up data pipeline, Amazon SP-API integration

---

### Implementation Guide

**[IMPLEMENTATION_ROADMAP.md](IMPLEMENTATION_ROADMAP.md)** *(24 KB, 35-min read)*

Step-by-step build plan:
- Phase 1: MVP (Weeks 1-2) - Prove value
- Phase 2: Automation (Weeks 3-4) - Reduce manual work
- Phase 3: Optimization (Month 2) - Improve accuracy
- Phase 4: Scale (Month 3+) - Production-grade
- Code structure and directory layout
- Testing strategy
- Deployment and operations

**When to read:** Before starting development, during implementation

---

## 🚀 Quick Start Guide

### For Tim (Business Owner)

**First 30 minutes:**
1. Read [EXECUTIVE_SUMMARY.md](EXECUTIVE_SUMMARY.md)
2. Review [inventory-notes.md](inventory-notes.md) - pay attention to "Questions for Tim" section
3. Decide: proceed with MVP or need more information?

**If proceeding:**
4. Read [WIND_DOWN_STRATEGY.md](WIND_DOWN_STRATEGY.md) - validate business strategy
5. Review decision thresholds in [RESTOCK_LOGIC.md](RESTOCK_LOGIC.md)
6. Approve or adjust parameters (service levels, risk tolerance, etc.)

---

### For Developer (If Outsourcing)

**Before coding:**
1. Read [EXECUTIVE_SUMMARY.md](EXECUTIVE_SUMMARY.md) - understand the why
2. Read [IMPLEMENTATION_ROADMAP.md](IMPLEMENTATION_ROADMAP.md) - understand the how
3. Review [INVENTORY_ALGORITHM.md](INVENTORY_ALGORITHM.md) - understand the math
4. Scan [DATA_REQUIREMENTS.md](DATA_REQUIREMENTS.md) - understand data needs

**During development:**
5. Use [RESTOCK_LOGIC.md](RESTOCK_LOGIC.md) as specification for decision logic
6. Refer to pseudocode in [INVENTORY_ALGORITHM.md](INVENTORY_ALGORITHM.md)
7. Follow code structure in [IMPLEMENTATION_ROADMAP.md](IMPLEMENTATION_ROADMAP.md)

---

### For Future Maintainer

**Onboarding:**
1. Read [EXECUTIVE_SUMMARY.md](EXECUTIVE_SUMMARY.md) - context and goals
2. Read [inventory-notes.md](inventory-notes.md) - design decisions and rationale
3. Review codebase alongside [IMPLEMENTATION_ROADMAP.md](IMPLEMENTATION_ROADMAP.md)

**Operational tasks:**
4. Daily: Monitor alerts, approve high-value restocks
5. Weekly: Review restock report, check forecast accuracy
6. Monthly: Phase progress review using [WIND_DOWN_STRATEGY.md](WIND_DOWN_STRATEGY.md)

---

## 📊 Document Map

### By Role

**Business/Strategy:**
- EXECUTIVE_SUMMARY.md
- WIND_DOWN_STRATEGY.md
- inventory-notes.md

**Technical/Implementation:**
- IMPLEMENTATION_ROADMAP.md
- INVENTORY_ALGORITHM.md
- DATA_REQUIREMENTS.md

**Operations/Execution:**
- RESTOCK_LOGIC.md
- WIND_DOWN_STRATEGY.md
- inventory-notes.md

---

### By Phase

**Planning (Now):**
- EXECUTIVE_SUMMARY.md
- inventory-notes.md
- WIND_DOWN_STRATEGY.md

**Development (Weeks 1-4):**
- IMPLEMENTATION_ROADMAP.md
- INVENTORY_ALGORITHM.md
- DATA_REQUIREMENTS.md
- RESTOCK_LOGIC.md

**Operations (Ongoing):**
- RESTOCK_LOGIC.md
- WIND_DOWN_STRATEGY.md

**Review/Tuning (Monthly):**
- inventory-notes.md (update with learnings)
- WIND_DOWN_STRATEGY.md (phase transitions)

---

## 🔑 Key Concepts

### Inventory Metrics

**DIR (Days of Inventory Remaining)**
```
DIR = Current_Stock / Daily_Velocity
```
How many days until stock runs out at current sales rate.

**Stockout Probability**
```
P(stockout) = Probability stock depletes before restock arrives
```
Risk of running out during lead time.

**Storage Efficiency**
```
Efficiency = Revenue / Storage_Cost
```
How much revenue per dollar of storage fees.

**Excess Ratio**
```
Excess = Current_Inventory / Wind_Down_Appropriate_Level
```
Whether overstocked for remaining timeline.

---

### Decision Thresholds

**Service Level Targets (by phase):**
- Phase 1: 90% (10% stockout acceptable)
- Phase 2: 85% (15% stockout acceptable)
- Phase 3: 70% (30% stockout acceptable)
- Phase 4: 50% (winding down, stockouts OK)

**Auto-Approval Threshold:**
- <$1,000 order value: Auto-approve
- ≥$1,000: Require human approval

**Liquidation Triggers:**
- DIR >180 days (6 months excess)
- Storage efficiency <2.0 (fees >50% of profit)
- Velocity trend <-30% (rapid decline)
- Liquidation priority >0.7 (composite score)

---

### Wind-Down Phases

| Phase | Timeline | Inventory Target | Strategy |
|-------|----------|-----------------|----------|
| 1 - Controlled | Months 1-6 | 85-90% | Business as usual, cull worst 20% |
| 2 - Decline | Months 7-12 | 50-60% | Restock top 30% only, liquidate mid-tier |
| 3 - Liquidation | Months 13-18 | 10-20% | STOP restocking, deep discounts |
| 4 - Exit | Months 19-24 | 0% | Final clearance, close account |

---

## 📈 Success Metrics

**System Performance:**
- Forecast accuracy (MAPE): <25% (good), <20% (excellent)
- Time savings: 9+ hours/week
- Stockout rate: <10% (Phase 1)

**Financial:**
- Storage fees: <3% of revenue
- LTSF charges: $0 (zero tolerance)
- Liquidation recovery: >70% (promotions), >20% (bulk)

**Operational:**
- Manual intervention: <1 hour/week
- Alert response time: <24 hours
- Forecast-to-actual variance: ±15%

---

## 🛠️ Technology Overview

**Core Stack:**
- Python 3.9+ (pandas, numpy, scipy)
- Amazon SP-API client
- JSON files (MVP) or PostgreSQL (scale)
- Cron for scheduling
- Email/SMS for alerts

**No exotic dependencies, proven technologies.**

---

## 💰 Investment Summary

**Development:**
- Phase 1 (MVP): 15 hours (~$1,500 or DIY)
- Phase 2 (Automation): 12 hours (~$1,200)
- Phase 3 (Optimization): 10 hours (~$1,000)
- Phase 4 (Scale): 20 hours (~$2,000)
- **Total: ~$5,700 or 60 hours DIY**

**Operational:**
- $40-85/month (hosting, email, database)

**ROI:**
- Time savings: $46,800/year (9 hrs/week × $100/hr)
- Storage fee savings: $20,000-40,000 over wind-down
- **Payback: 2-3 weeks**

---

## 📝 Version History

**v1.0 (March 26, 2026)**
- Initial design complete
- All core documents delivered
- Ready for stakeholder review and implementation kickoff

---

## 🤝 Next Steps

1. **Stakeholder Review** - Tim reviews EXECUTIVE_SUMMARY and provides feedback
2. **Q&A Session** - Address questions from inventory-notes.md
3. **Parameter Approval** - Confirm risk tolerance, thresholds, timeline
4. **Amazon API Setup** - Get SP-API credentials
5. **Phase 1 Kickoff** - Begin MVP development (2 weeks)

---

## 📧 Contact

**Project Owner:** Tim O'Hagan (VISUALIZE Sports)  
**Designer:** Peekay (AI Assistant)  
**Date:** March 26, 2026

---

## 📂 File Listing

All documentation located in: `~/shared/visualize-amazon/docs/`

```
EXECUTIVE_SUMMARY.md        13 KB  Overview and business case
inventory-notes.md           18 KB  Working notes and decisions
INVENTORY_ALGORITHM.md       33 KB  Mathematical formulas
RESTOCK_LOGIC.md             33 KB  Decision rules and logic
WIND_DOWN_STRATEGY.md        34 KB  Business strategy
DATA_REQUIREMENTS.md         28 KB  Data specs and API guide
IMPLEMENTATION_ROADMAP.md    24 KB  Build plan and timeline
README.md                     (this file)
```

**Total Documentation:** ~183 KB of comprehensive specifications

---

## ✅ Design Checklist

- [x] Inventory analysis algorithms designed
- [x] Restock recommendation logic specified
- [x] Storage fee optimization strategy defined
- [x] Wind-down phases and milestones planned
- [x] Liquidation framework established
- [x] Data requirements documented
- [x] Implementation roadmap created
- [x] Edge cases identified and handled
- [x] Testing strategy outlined
- [x] Success metrics defined
- [x] Risk mitigation planned
- [x] Documentation complete

**Status: ✅ Ready for Implementation**

---

**Happy Building! 🚀**
