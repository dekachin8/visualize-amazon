# Marketing Council Implementation Notes

## Overview

This document provides practical implementation guidance for Phase 2 development of the VISUALIZE Sports Marketing Council.

---

## Phase 2 Development Tasks

### Priority 1: Core Infrastructure (Week 1-2)

#### Task 1.1: Data Pipeline Setup
**Effort:** 4-6 hours
**Owner:** Peekay

```
Steps:
1. Create data schema in Supabase
   - daily_metrics table
   - council_reports table
   - cost_log table
   - historical_baselines view

2. Build data collection script
   - Manual CSV upload parser first
   - Schema normalization
   - Derived metrics calculation

3. Test with sample data
   - Use exported Amazon reports
   - Verify all fields map correctly
```

**Deliverable:** Working data pipeline that can ingest CSV uploads

#### Task 1.2: Persona Prompt Library
**Effort:** 3-4 hours
**Owner:** Peekay

```
Steps:
1. Create personas/ directory structure
2. Write prompt templates for each persona
3. Test each persona individually with sample data
4. Tune prompts for consistent JSON output
5. Document token usage per persona
```

**Deliverable:** 5 tested persona prompts in `/personas/`

#### Task 1.3: Basic Council Runner
**Effort:** 4-5 hours
**Owner:** Peekay

```
Steps:
1. Create run-council.py main script
2. Implement parallel persona execution
3. Add error handling per persona
4. Generate basic JSON output
5. Write to reports/ directory
```

**Deliverable:** Working council session that produces JSON output

---

### Priority 2: Deliberation & Synthesis (Week 2-3)

#### Task 2.1: Deliberation Engine
**Effort:** 4-5 hours
**Owner:** Peekay

```
Steps:
1. Extract recommendations from persona outputs
2. Identify conflicting recommendations
3. Build debate prompt template
4. Implement voting system
5. Test with sample council outputs
```

**Deliverable:** Working deliberation that produces scored recommendations

#### Task 2.2: Report Synthesis
**Effort:** 3-4 hours
**Owner:** Peekay

```
Steps:
1. Create moderator prompt for synthesis
2. Generate markdown report template
3. Implement executive summary generation
4. Build alerts extraction
5. Create dissent preservation logic
```

**Deliverable:** Beautiful markdown reports from council sessions

---

### Priority 3: Delivery & Monitoring (Week 3-4)

#### Task 3.1: Telegram Delivery
**Effort:** 2-3 hours
**Owner:** Peekay

```
Steps:
1. Create delivery script
2. Format condensed message for Telegram
3. Add conditional notification logic
4. Test delivery to Tim's chat
5. Add retry logic
```

**Deliverable:** Morning briefs appearing in Telegram

#### Task 3.2: Cron Setup
**Effort:** 1-2 hours
**Owner:** Peekay

```
Steps:
1. Create cron entries
2. Set up log rotation
3. Test each job individually
4. Verify timing (MST considerations)
5. Add monitoring/alerting
```

**Deliverable:** Fully automated nightly runs

#### Task 3.3: Health Monitoring
**Effort:** 2-3 hours
**Owner:** Peekay

```
Steps:
1. Create health check script
2. Define failure thresholds
3. Implement alert triggers
4. Add dashboard status indicators
5. Document recovery procedures
```

**Deliverable:** Proactive alerting for pipeline issues

---

### Priority 4: Dashboard Integration (Week 4-5)

#### Task 4.1: Council Report View
**Effort:** 4-5 hours
**Owner:** Peekay

```
Steps:
1. Create /council route in Next.js app
2. Fetch latest report from Supabase
3. Render executive summary
4. Display top actions
5. Show alerts and metrics
6. Add historical report browser
```

**Deliverable:** Dashboard page showing council reports

#### Task 4.2: Action Tracking
**Effort:** 2-3 hours
**Owner:** Peekay

```
Steps:
1. Add action_status field to reports
2. Create UI for marking actions complete
3. Track completion rates
4. Feed back to weekly digest
```

**Deliverable:** Ability to track which recommendations were implemented

---

## Technical Decisions

### Model Selection (Confirmed)

| Component | Model | Rationale |
|-----------|-------|-----------|
| Marcus, Aria, Derek | claude-3-haiku | Structured output, cost-efficient |
| Maya, Victor | claude-sonnet-4-20250514 | Creative/strategic reasoning |
| Deliberation | claude-sonnet-4-20250514 | Complex multi-party reasoning |
| Synthesis | claude-sonnet-4-20250514 | Quality final output |

### Data Storage

**Supabase Schema:**

```sql
-- Daily metrics (raw data)
CREATE TABLE daily_metrics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  date DATE UNIQUE NOT NULL,
  data JSONB NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Council reports
CREATE TABLE council_reports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  date DATE NOT NULL,
  session_id TEXT UNIQUE NOT NULL,
  executive_summary TEXT,
  confidence_score INTEGER,
  top_actions JSONB,
  alerts JSONB,
  full_report JSONB NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Action tracking
CREATE TABLE council_actions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  report_id UUID REFERENCES council_reports(id),
  action_text TEXT NOT NULL,
  owner_persona TEXT,
  status TEXT DEFAULT 'pending', -- pending, completed, skipped
  completed_at TIMESTAMPTZ,
  outcome TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Cost logging
CREATE TABLE cost_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id TEXT NOT NULL,
  model TEXT NOT NULL,
  tokens_in INTEGER,
  tokens_out INTEGER,
  cost_usd DECIMAL(10, 6),
  component TEXT, -- 'persona_marcus', 'deliberation', etc.
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_daily_metrics_date ON daily_metrics(date);
CREATE INDEX idx_council_reports_date ON council_reports(date);
CREATE INDEX idx_cost_log_session ON cost_log(session_id);
```

### File Structure (Recommended)

```
~/shared/visualize-amazon/
├── scripts/
│   ├── collect-data.js      # Node.js data collection
│   ├── run-council.py       # Python council runner
│   ├── deliver-report.js    # Node.js delivery
│   ├── weekly-digest.py     # Python weekly summary
│   └── health-check.js      # Node.js health monitoring
├── council/
│   ├── __init__.py
│   ├── personas/
│   │   ├── __init__.py
│   │   ├── base.py
│   │   ├── data_analyst.py
│   │   ├── seo_strategist.py
│   │   ├── ad_specialist.py
│   │   ├── social_manager.py
│   │   └── brand_strategist.py
│   ├── deliberation.py
│   ├── synthesis.py
│   └── utils.py
├── data/
│   ├── daily/               # YYYY-MM-DD.json
│   ├── competitors/         # YYYY-MM-DD.json
│   └── uploads/             # Manual CSV uploads
├── reports/
│   ├── 2026-03-26/
│   │   ├── full_report.json
│   │   └── summary.md
│   └── weekly/
│       └── 2026-W13.md
├── logs/
│   └── *.log
├── config/
│   └── council.yaml
└── docs/                    # This documentation
```

---

## Testing Strategy

### Unit Tests

```python
# tests/test_personas.py

def test_data_analyst_output_format():
    """Verify Marcus produces valid JSON with required fields."""
    sample_data = load_sample_data()
    analyst = DataAnalyst(sample_data)
    result = analyst.analyze()
    
    assert 'health_check' in result
    assert 'anomalies' in result
    assert 'questions_for_council' in result

def test_deliberation_conflict_detection():
    """Verify conflicting recommendations are identified."""
    analyses = [
        {'persona': 'aria', 'recommendations': [{'action': 'increase content'}]},
        {'persona': 'derek', 'recommendations': [{'action': 'cut content budget'}]}
    ]
    conflicts = identify_conflicts(analyses)
    
    assert len(conflicts) >= 1
    assert 'content' in conflicts[0]['topic']
```

### Integration Tests

```python
# tests/test_council_session.py

def test_full_council_session():
    """Run complete council session with sample data."""
    sample_data = load_sample_data()
    
    report = run_council_session(sample_data)
    
    assert report['confidence_score'] >= 0
    assert report['confidence_score'] <= 100
    assert len(report['top_actions']) <= 3
    assert report['executive_summary'] is not None

def test_council_graceful_degradation():
    """Verify session continues if 1-2 personas fail."""
    sample_data = load_sample_data()
    
    # Inject failure condition for one persona
    with mock_persona_failure('data_analyst'):
        report = run_council_session(sample_data)
    
    assert 'data_analyst' in report['absent_personas']
    assert report['confidence_score'] < 100  # Reduced confidence
```

### End-to-End Test

```bash
# scripts/test-full-pipeline.sh

#!/bin/bash
set -e

echo "Testing data collection..."
node scripts/collect-data.js --test

echo "Testing council session..."
python3 scripts/run-council.py --test

echo "Testing report delivery..."
node scripts/deliver-report.js --test --dry-run

echo "All tests passed!"
```

---

## Cost Optimization Notes

### Token Reduction Strategies

1. **Compress data context:**
   - Only include relevant fields per persona
   - Use abbreviations in data (e.g., "rev" not "revenue")
   - Summarize historical data rather than raw values

2. **Output constraints:**
   - Strict JSON schema enforcement
   - Max 3 recommendations per persona
   - 500-word limits on analysis sections

3. **Skip unnecessary steps:**
   - If no anomalies, skip anomaly debate
   - If all personas agree, skip full deliberation
   - If no alerts, skip alert synthesis

### Cost Tracking Dashboard

Add to existing dashboard:

```typescript
// components/CostTracking.tsx

export function CostTracking() {
  const { data: costs } = useSWR('/api/costs/summary');
  
  return (
    <Card>
      <CardTitle>Council Costs (MTD)</CardTitle>
      <CardContent>
        <Stat label="Sessions Run" value={costs.sessions} />
        <Stat label="Total Cost" value={`$${costs.total.toFixed(2)}`} />
        <Stat label="Avg per Session" value={`$${costs.average.toFixed(3)}`} />
        <Stat label="Model Breakdown">
          <div>Haiku: ${costs.haiku.toFixed(3)}</div>
          <div>Sonnet: ${costs.sonnet.toFixed(3)}</div>
        </Stat>
      </CardContent>
    </Card>
  );
}
```

---

## Known Challenges & Mitigations

### Challenge 1: Amazon API Access
**Issue:** SP-API requires complex OAuth and approval.
**Mitigation:** Start with manual CSV upload; build API integration later.

### Challenge 2: Persona Output Consistency
**Issue:** LLMs sometimes produce invalid JSON or miss fields.
**Mitigation:** 
- Use strict JSON schema in prompts
- Implement JSON repair for minor issues
- Retry once on parse failure

### Challenge 3: Deliberation Quality
**Issue:** Simulated debate may feel artificial.
**Mitigation:**
- Focus on surfacing trade-offs, not "winning"
- Keep debates short (3 turns max)
- Weight resolution by data evidence

### Challenge 4: Time Zone Handling
**Issue:** MST doesn't observe DST; cron timing matters.
**Mitigation:**
- Use explicit timezone in cron environment
- Test around DST transitions
- Log timestamps in UTC internally

---

## Rollout Plan

### Week 1: Foundation
- [ ] Data schema in Supabase
- [ ] CSV upload pipeline working
- [ ] 1 persona (Marcus) tested end-to-end

### Week 2: All Personas
- [ ] All 5 personas working
- [ ] Parallel execution tested
- [ ] Basic JSON report output

### Week 3: Deliberation
- [ ] Deliberation engine working
- [ ] Voting system implemented
- [ ] Markdown report generation

### Week 4: Delivery & Monitoring
- [ ] Telegram delivery working
- [ ] Cron jobs configured
- [ ] Health monitoring active

### Week 5: Dashboard Integration
- [ ] Council report page in dashboard
- [ ] Historical report browsing
- [ ] Action tracking

### Week 6: Refinement
- [ ] Prompt tuning based on real outputs
- [ ] Cost optimization
- [ ] Documentation cleanup

---

## Success Criteria

**Phase 2 Complete When:**

1. ✅ Nightly council runs automatically at 2:45 AM MST
2. ✅ Tim receives morning brief via Telegram by 3:30 AM
3. ✅ Dashboard shows latest council report
4. ✅ Historical reports accessible
5. ✅ Cost per session < $0.10
6. ✅ <1 failure per week
7. ✅ Tim finds reports actionable (qualitative feedback)

**Stretch Goals:**
- Amazon SP-API integration
- Auto-execution of low-risk decisions
- Social media metrics integration

---

## Questions for Tim

Before proceeding with implementation, clarify:

1. **Data Access:** Do you have Amazon SP-API credentials, or should we start with CSV uploads?

2. **Notification Preference:** Telegram only, or also email/dashboard alerts?

3. **Action Authority:** Should the council ever auto-execute changes (bid adjustments), or always require Tim's approval?

4. **Social Media:** Do you have login credentials for VISUALIZE social accounts? Which platforms exist?

5. **Priority:** Is council implementation more urgent than other dashboard features?

---

## Creative Ideas Beyond the Basics

### Idea 1: "The Hot Seat"
Each week, one persona gets extra scrutiny. Others challenge their assumptions.
- Week 1: Ads (is our spend justified?)
- Week 2: SEO (are we missing opportunities?)
- Etc.

### Idea 2: "What If" Scenarios
Council runs alternate scenarios:
- "What if we cut ad spend 50%?"
- "What if a competitor dropped prices 20%?"
- Generate strategic contingency plans

### Idea 3: "Customer Voice Persona"
Add a 6th persona that represents customer sentiment:
- Analyzes reviews, questions, complaints
- Advocates for customer experience
- Provides qualitative balance

### Idea 4: "Exit Strategist Mode"
Toggle for wind-down focus:
- Heavier weight to liquidation recommendations
- Inventory velocity monitoring
- "Sunset alerts" for products

### Idea 5: "Social Experiments Board"
Council proposes small A/B tests:
- "Try this title variation for 1 week"
- "Post at 7 AM instead of 9 AM"
- Track experiments and report back

---

## Reference: Sample Council Output

```json
{
  "session_id": "20260326_024512",
  "date": "2026-03-26",
  "executive_summary": "Revenue stable but ACOS creeping up. Alignment stick sales dropped sharply — investigate listing or competitor activity. Social reactivation should begin this week.",
  "confidence_score": 78,
  "top_actions": [
    {
      "rank": 1,
      "action": "Investigate alignment stick sales drop - check for listing suppression or new competitor",
      "owner": "marcus",
      "effort": "low",
      "expected_impact": "Diagnose 45% sales drop to determine response",
      "vote_score": 8,
      "deadline_suggestion": "2026-03-27"
    },
    {
      "rank": 2,
      "action": "Reduce bid on 'golf practice equipment' keyword from $0.85 to $0.65",
      "owner": "derek",
      "effort": "low",
      "expected_impact": "Lower ACOS by ~3% with minimal volume loss",
      "vote_score": 6,
      "deadline_suggestion": "2026-03-26"
    },
    {
      "rank": 3,
      "action": "Post 'we're back' content on Instagram to begin social reactivation",
      "owner": "maya",
      "effort": "medium",
      "expected_impact": "Establish social presence before Masters week",
      "vote_score": 5,
      "deadline_suggestion": "2026-03-28"
    }
  ],
  "alerts": [
    {
      "severity": "warning",
      "message": "Alignment stick sales down 45% day-over-day (3.2 std dev)",
      "source_persona": "marcus"
    }
  ],
  "dissents": [],
  "absent_personas": []
}
```

---

*This implementation guide provides the roadmap for turning the council architecture into working code. Prioritize the core pipeline first, then add sophistication incrementally.*
