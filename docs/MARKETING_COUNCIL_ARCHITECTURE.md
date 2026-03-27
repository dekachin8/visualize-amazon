# VISUALIZE Sports AI Marketing Council Architecture

## Executive Summary

The Marketing Council is a multi-persona AI system that runs nightly to analyze VISUALIZE Sports' Amazon business and generate actionable marketing decisions. Unlike a single monolithic AI, this council approach leverages **specialized personas with distinct perspectives** that collaborate through a structured deliberation process.

**Why This Design Matters for Wind-Down:**
- Extracts maximum value from remaining 1-2 years
- Automates strategic thinking without Tim's daily involvement
- Surfaces opportunities a single perspective might miss
- Creates a "board of advisors" on autopilot

---

## Council Philosophy: Constructive Tension

The council operates on the principle of **constructive tension** — personas have different incentive frameworks that naturally create productive debate:

| Persona | Primary Incentive | Tension Point |
|---------|------------------|---------------|
| Data Analyst | Accuracy & evidence | Pushes back on hunches |
| SEO Strategist | Organic visibility | Competes with ads for attention |
| Ad Specialist | ROAS & paid efficiency | Advocates spending |
| Social Manager | Engagement & brand | Wants content investment |
| Brand Strategist | Long-term positioning | Balances short vs long |

This tension prevents groupthink and surfaces trade-offs Tim needs to consider.

---

## Architecture Overview

```
┌─────────────────────────────────────────────────────────────────┐
│                    NIGHTLY COUNCIL SESSION                       │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  ┌──────────────┐    ┌──────────────┐    ┌──────────────┐       │
│  │  DATA LAYER  │───▶│  COLLECTORS  │───▶│  RAW DATA    │       │
│  │  (Supabase)  │    │  (Scripts)   │    │  (JSON/CSV)  │       │
│  └──────────────┘    └──────────────┘    └──────────────┘       │
│         │                                       │                │
│         ▼                                       ▼                │
│  ┌────────────────────────────────────────────────────────────┐ │
│  │                   PHASE 1: ANALYSIS                         │ │
│  │  ┌────────┐ ┌────────┐ ┌────────┐ ┌────────┐ ┌────────┐    │ │
│  │  │  Data  │ │  SEO   │ │  Ads   │ │ Social │ │ Brand  │    │ │
│  │  │Analyst │ │Strat.  │ │Special.│ │Manager │ │Strat.  │    │ │
│  │  └───┬────┘ └───┬────┘ └───┬────┘ └───┬────┘ └───┬────┘    │ │
│  │      │          │          │          │          │          │ │
│  │      ▼          ▼          ▼          ▼          ▼          │ │
│  │  [Individual Analysis Reports - Parallel Execution]         │ │
│  └────────────────────────────────────────────────────────────┘ │
│                              │                                   │
│                              ▼                                   │
│  ┌────────────────────────────────────────────────────────────┐ │
│  │                  PHASE 2: DELIBERATION                      │ │
│  │                                                              │ │
│  │  Round 1: Each persona reviews others' analyses              │
│  │  Round 2: Debate on conflicting recommendations              │
│  │  Round 3: Priority ranking with reasoning                    │ │
│  │                                                              │ │
│  └────────────────────────────────────────────────────────────┘ │
│                              │                                   │
│                              ▼                                   │
│  ┌────────────────────────────────────────────────────────────┐ │
│  │                  PHASE 3: SYNTHESIS                         │ │
│  │                                                              │ │
│  │  Moderator AI consolidates into:                            │ │
│  │  - Top 3 Priority Actions                                   │ │
│  │  - Weekly Focus Recommendation                              │ │
│  │  - Alerts/Warnings                                          │ │
│  │  - Dissenting Opinions (preserved)                          │ │
│  │                                                              │ │
│  └────────────────────────────────────────────────────────────┘ │
│                              │                                   │
│                              ▼                                   │
│  ┌────────────────────────────────────────────────────────────┐ │
│  │                    OUTPUT & DELIVERY                        │ │
│  │                                                              │ │
│  │  • Daily Brief (Telegram/Email)                             │ │
│  │  • Dashboard Update                                          │ │
│  │  • Action Log (for tracking)                                │ │
│  │  • Weekly Digest (Sundays)                                  │ │
│  │                                                              │ │
│  └────────────────────────────────────────────────────────────┘ │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

---

## Decision-Making Framework

### Voting System: Weighted Consensus

Each persona votes on proposed actions with:
- **Strong Support** (+2)
- **Support** (+1)
- **Neutral** (0)
- **Oppose** (-1)
- **Strong Oppose** (-2)

**Vote weights by persona for different decision types:**

| Decision Type | Data | SEO | Ads | Social | Brand |
|--------------|------|-----|-----|--------|-------|
| Pricing Changes | 1.5x | 1x | 1x | 0.5x | 1.5x |
| Ad Spend Changes | 1.5x | 0.5x | 2x | 0.5x | 1x |
| Content/Copy Changes | 1x | 2x | 1x | 1.5x | 1x |
| Social Investment | 0.5x | 1x | 0.5x | 2x | 1x |
| Strategic Direction | 1x | 0.5x | 0.5x | 0.5x | 2x |

### Consensus Thresholds

- **Auto-Execute:** Score ≥ 6 AND no Strong Oppose → Flag for auto-implementation
- **Recommend:** Score ≥ 3 → Include in "Recommended Actions"
- **Present Options:** Score 0-3 → Include with pros/cons
- **Table:** Score < 0 → Log but don't recommend

### Dissent Preservation

If any persona casts **Strong Oppose**, their reasoning is ALWAYS included in the output, even if the action passes. This prevents important concerns from being buried.

---

## Council Session Flow

### Pre-Session (Automated - 2:00 AM MST)

1. **Data Collection** (30 min)
   - Amazon Seller Central API pull (sales, ads, search terms)
   - Social media metrics scrape (if accessible)
   - Competitor price checks
   - Google Trends for golf keywords

2. **Data Preprocessing**
   - Normalize to standard JSON schema
   - Calculate derived metrics (ACOS, conversion %, velocity)
   - Flag anomalies (>2 std dev from rolling average)

### Phase 1: Individual Analysis (Parallel - 2:30 AM)

Each persona runs independently with their data subset:

```json
{
  "persona": "data_analyst",
  "input": {
    "sales_data": "...",
    "traffic_data": "...",
    "historical_baseline": "..."
  },
  "prompt_template": "personas/data_analyst.md",
  "output_format": "analysis_report",
  "timeout_minutes": 5
}
```

All 5 personas complete in parallel, producing individual reports.

### Phase 2: Deliberation (Sequential - 2:45 AM)

**Round 1: Cross-Review (5 min)**
- Each persona reads all other reports
- Generates "reactions" to other analyses

**Round 2: Debate (10 min)**
- System identifies conflicting recommendations
- Personas engage in structured debate:
  ```
  SEO: "We should invest in A+ Content refresh"
  Ads: "That budget would be better spent on SP campaigns"
  Data: "A+ Content has shown 12% conversion lift historically"
  Brand: "In wind-down phase, conversion optimization > new content"
  ```

**Round 3: Voting (5 min)**
- Each recommendation is voted on
- Scores calculated with weights
- Rankings generated

### Phase 3: Synthesis (3:10 AM)

Moderator AI (neutral, no persona) creates final output:

1. **Executive Summary** (3 sentences max)
2. **Top 3 Actions This Week** with owner persona
3. **Metrics to Watch** with alert thresholds
4. **Dissenting Opinions** (if any)
5. **Council Confidence Score** (0-100)

### Delivery (3:15 AM)

- Telegram message to Tim with summary
- Dashboard update with full report
- Log entry for historical tracking

---

## Input/Output Specifications

### Input Data Schema

```typescript
interface CouncilInput {
  date: string; // ISO date
  period: 'daily' | 'weekly';
  
  sales: {
    orders: number;
    revenue: number;
    units: number;
    refunds: number;
    by_product: ProductSales[];
  };
  
  advertising: {
    spend: number;
    sales: number;
    acos: number;
    impressions: number;
    clicks: number;
    campaigns: CampaignData[];
  };
  
  traffic: {
    sessions: number;
    page_views: number;
    conversion_rate: number;
    by_source: TrafficSource[];
  };
  
  rankings: {
    keyword: string;
    organic_rank: number;
    sponsored_rank: number;
    search_volume: number;
  }[];
  
  competitors: {
    asin: string;
    price: number;
    rating: number;
    review_count: number;
    best_seller_rank: number;
  }[];
  
  social?: {
    platform: string;
    followers: number;
    engagement_rate: number;
    recent_posts: PostMetrics[];
  }[];
}
```

### Output Report Schema

```typescript
interface CouncilOutput {
  session_id: string;
  generated_at: string;
  
  executive_summary: string; // 3 sentences max
  confidence_score: number; // 0-100
  
  top_actions: {
    rank: 1 | 2 | 3;
    action: string;
    owner: PersonaType;
    effort: 'low' | 'medium' | 'high';
    expected_impact: string;
    vote_score: number;
    deadline_suggestion: string;
  }[];
  
  alerts: {
    severity: 'info' | 'warning' | 'critical';
    message: string;
    source_persona: PersonaType;
    data_point?: string;
  }[];
  
  persona_reports: {
    persona: PersonaType;
    analysis_summary: string;
    recommendations: string[];
    metrics_cited: Metric[];
  }[];
  
  deliberation_log: {
    topic: string;
    positions: { persona: PersonaType; stance: string }[];
    resolution: string;
  }[];
  
  dissents: {
    persona: PersonaType;
    topic: string;
    concern: string;
    acknowledged: boolean;
  }[];
  
  metrics_to_watch: {
    metric: string;
    current_value: number;
    alert_threshold: number;
    trend: 'up' | 'down' | 'stable';
  }[];
}
```

---

## Technical Implementation

### Model Selection Strategy

| Phase | Model | Rationale |
|-------|-------|-----------|
| Individual Analysis | Haiku | Parallel, cost-efficient, structured output |
| Deliberation | Sonnet | Needs reasoning for debate |
| Synthesis | Sonnet | Quality final output |
| Alerts Only | Haiku | Quick anomaly detection |

**Estimated Cost per Session:**
- 5 Haiku personas × ~2K tokens = ~$0.005
- Deliberation ~10K tokens = ~$0.03
- Synthesis ~3K tokens = ~$0.01
- **Total: ~$0.05/night = ~$1.50/month**

### Cron Schedule

```cron
# Data collection
0 2 * * * /usr/bin/node ~/shared/visualize-amazon/scripts/collect-data.js

# Council session
30 2 * * * /usr/bin/python3 ~/shared/visualize-amazon/scripts/run-council.py

# Delivery
15 3 * * * /usr/bin/node ~/shared/visualize-amazon/scripts/deliver-report.js

# Weekly digest (Sundays)
0 8 * * 0 /usr/bin/python3 ~/shared/visualize-amazon/scripts/weekly-digest.py
```

### Error Handling

1. **API Failure:** Use cached data (up to 3 days old) with warning
2. **Persona Timeout:** Skip persona, note absence in report
3. **All Personas Fail:** Send alert, no report generation
4. **Delivery Failure:** Retry 3x, then log and alert

---

## Evolution Path

### Phase 1: Foundation (Current Design)
- Manual data upload
- Basic deliberation
- Telegram delivery

### Phase 2: Automation
- Direct Amazon SP-API integration
- Automated social scraping
- Dashboard integration

### Phase 3: Action
- Auto-execute low-risk decisions (bid adjustments)
- A/B test management
- Social post scheduling

### Phase 4: Learning
- Track recommendation outcomes
- Adjust persona weights based on accuracy
- Personalize to VISUALIZE's patterns

---

## Wind-Down Optimization

The council is specifically tuned for wind-down phase:

1. **Cash Flow Focus:** Prioritizes margin over growth
2. **Inventory Awareness:** Factors in remaining stock levels
3. **Sunset Signals:** Watches for exit timing indicators
4. **Minimal Investment Bias:** Favors optimization over new initiatives
5. **Liquidation Readiness:** Tracks when products should be clearance-priced

---

## Success Metrics

**Council Health:**
- Deliberation quality (dissent rate, resolution rate)
- Recommendation adoption rate by Tim
- Prediction accuracy (did forecast X happen?)

**Business Impact:**
- ACOS trend (target: declining)
- Organic ranking stability
- Revenue per dollar of effort
- Time saved for Tim (target: <1 hr/week on VISUALIZE)

---

*This architecture is designed to run autonomously while giving Tim confidence that strategic thinking is happening. The council doesn't replace human judgment — it prepares the decision space so Tim can make fast, informed choices when he engages.*
