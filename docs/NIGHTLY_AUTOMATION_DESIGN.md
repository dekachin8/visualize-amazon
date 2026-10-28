# VISUALIZE Sports Nightly Automation Design

## Overview

The nightly automation runs the Marketing Council session while Tim sleeps, producing a morning brief ready for review. The system is designed for **reliability, cost-efficiency, and actionability**.

---

## Schedule Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                    NIGHTLY SCHEDULE (MST)                        │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  02:00  ┌─────────────────────────────────────────────────────┐ │
│         │  DATA COLLECTION                                     │ │
│         │  • Pull Amazon Seller Central reports                │ │
│         │  • Scrape competitor prices                          │ │
│         │  • Fetch social metrics (if configured)              │ │
│         │  • Check Google Trends                               │ │
│         └─────────────────────────────────────────────────────┘ │
│                              ↓                                   │
│  02:30  ┌─────────────────────────────────────────────────────┐ │
│         │  DATA PREPROCESSING                                  │ │
│         │  • Normalize to standard schema                      │ │
│         │  • Calculate derived metrics                         │ │
│         │  • Flag anomalies                                    │ │
│         │  • Generate baseline comparisons                     │ │
│         └─────────────────────────────────────────────────────┘ │
│                              ↓                                   │
│  02:45  ┌─────────────────────────────────────────────────────┐ │
│         │  COUNCIL SESSION (Phase 1)                           │ │
│         │  • All 5 personas analyze in parallel                │ │
│         │  • Individual reports generated                      │ │
│         └─────────────────────────────────────────────────────┘ │
│                              ↓                                   │
│  03:00  ┌─────────────────────────────────────────────────────┐ │
│         │  COUNCIL SESSION (Phase 2 & 3)                       │ │
│         │  • Deliberation round                                │ │
│         │  • Voting and scoring                                │ │
│         │  • Synthesis and final report                        │ │
│         └─────────────────────────────────────────────────────┘ │
│                              ↓                                   │
│  03:20  ┌─────────────────────────────────────────────────────┐ │
│         │  REPORT GENERATION                                   │ │
│         │  • Generate markdown report                          │ │
│         │  • Create JSON archive                               │ │
│         │  • Update dashboard data                             │ │
│         └─────────────────────────────────────────────────────┘ │
│                              ↓                                   │
│  03:25  ┌─────────────────────────────────────────────────────┐ │
│         │  DELIVERY                                            │ │
│         │  • Send Telegram summary (if alerts)                 │ │
│         │  • Store full report for dashboard                   │ │
│         │  • Archive to historical log                         │ │
│         └─────────────────────────────────────────────────────┘ │
│                                                                  │
│  08:00  ┌─────────────────────────────────────────────────────┐ │
│  (SUN)  │  WEEKLY DIGEST                                       │ │
│         │  • Compile week's reports                            │ │
│         │  • Generate trend analysis                           │ │
│         │  • Create recommendations summary                    │ │
│         │  • Send to Tim via Telegram/Email                    │ │
│         └─────────────────────────────────────────────────────┘ │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

---

## Cron Configuration

```bash
# VISUALIZE Sports Marketing Council Automation
# Location: /etc/cron.d/visualize-council or crontab -e

# Data collection (2:00 AM MST daily)
0 2 * * * dekatim8 cd ~/shared/visualize-amazon && /usr/bin/node scripts/collect-data.js >> logs/collect.log 2>&1

# Council session (2:45 AM MST daily)
45 2 * * * dekatim8 cd ~/shared/visualize-amazon && /usr/bin/python3 scripts/run-council.py >> logs/council.log 2>&1

# Report delivery (3:25 AM MST daily)
25 3 * * * dekatim8 cd ~/shared/visualize-amazon && /usr/bin/node scripts/deliver-report.js >> logs/delivery.log 2>&1

# Weekly digest (8:00 AM MST Sundays)
0 8 * * 0 dekatim8 cd ~/shared/visualize-amazon && /usr/bin/python3 scripts/weekly-digest.py >> logs/weekly.log 2>&1

# Health check (hourly, lightweight)
0 * * * * dekatim8 cd ~/shared/visualize-amazon && /usr/bin/node scripts/health-check.js >> logs/health.log 2>&1
```

---

## Data Collection Process

### Step 1: Amazon Data Pull

```python
# scripts/collect-data.js (pseudocode)

async function collectAmazonData() {
    const today = new Date().toISOString().split('T')[0];
    
    // Option A: SP-API (if configured)
    if (config.amazon.sp_api_enabled) {
        const sales = await spApi.getSalesReport({
            reportType: 'GET_SALES_AND_TRAFFIC_REPORT',
            dataStartTime: yesterday,
            dataEndTime: today
        });
        
        const ads = await advertisingApi.getCampaignReport({
            reportType: 'SP_CAMPAIGNS',
            dateRange: 'YESTERDAY'
        });
        
        const searchTerms = await advertisingApi.getSearchTermReport({
            dateRange: 'YESTERDAY'
        });
    }
    
    // Option B: Manual CSV upload (fallback)
    else {
        // Check for uploaded files
        const uploadDir = './data/uploads';
        const salesFile = findLatestFile(uploadDir, 'sales');
        const adsFile = findLatestFile(uploadDir, 'ads');
        // Parse and normalize
    }
    
    // Normalize to standard schema
    const normalizedData = normalizeToSchema({
        sales, ads, searchTerms
    });
    
    // Calculate derived metrics
    normalizedData.derived = {
        acos: calculateACOS(normalizedData),
        conversionRate: calculateConversion(normalizedData),
        velocity: calculateVelocity(normalizedData),
        anomalies: detectAnomalies(normalizedData)
    };
    
    // Save to daily file
    await saveToFile(
        `./data/daily/${today}.json`,
        normalizedData
    );
    
    // Update Supabase
    await supabase.from('daily_metrics').upsert({
        date: today,
        data: normalizedData
    });
}
```

### Step 2: Competitor Data

```python
async function collectCompetitorData() {
    const competitors = config.competitors;
    const results = [];
    
    for (const asin of competitors) {
        // Use keepa/jungle scout API or scraping
        const data = await getCompetitorData(asin);
        results.push({
            asin,
            price: data.price,
            rating: data.rating,
            reviewCount: data.reviewCount,
            bsr: data.bestSellerRank,
            fetchedAt: new Date()
        });
    }
    
    await saveToFile(`./data/competitors/${today}.json`, results);
}
```

### Step 3: Social Media Metrics

```python
async function collectSocialMetrics() {
    // Only if API access is configured
    if (!config.social.enabled) {
        return { status: 'skipped', reason: 'not_configured' };
    }
    
    const instagram = await instagramApi.getAccountMetrics();
    const facebook = await facebookApi.getPageMetrics();
    
    return {
        instagram: {
            followers: instagram.followersCount,
            engagementRate: instagram.engagementRate,
            recentPosts: instagram.recentMedia.slice(0, 5)
        },
        facebook: {
            followers: facebook.fanCount,
            reach: facebook.reach,
            engagement: facebook.engagementRate
        }
    };
}
```

---

## Council Session Runner

### Main Orchestrator

```python
# scripts/run-council.py

import asyncio
import json
from datetime import datetime
from pathlib import Path

from personas import (
    DataAnalyst, SEOStrategist, AdSpecialist,
    SocialManager, BrandStrategist
)
from deliberation import run_deliberation
from synthesis import create_final_report

async def run_council_session():
    session_id = datetime.now().strftime('%Y%m%d_%H%M%S')
    log(f"Starting council session {session_id}")
    
    # Load today's data
    today = datetime.now().strftime('%Y-%m-%d')
    data = load_daily_data(today)
    
    if not data:
        raise Exception(f"No data available for {today}")
    
    # Phase 1: Individual Analysis (Parallel)
    personas = [
        DataAnalyst(data),
        SEOStrategist(data),
        AdSpecialist(data),
        SocialManager(data),
        BrandStrategist(data)
    ]
    
    log("Phase 1: Running individual analyses...")
    analyses = await asyncio.gather(
        *[p.analyze() for p in personas],
        return_exceptions=True
    )
    
    # Handle any failures
    valid_analyses = []
    absent_personas = []
    for persona, result in zip(personas, analyses):
        if isinstance(result, Exception):
            log(f"Persona {persona.name} failed: {result}")
            absent_personas.append(persona.name)
        else:
            valid_analyses.append({
                'persona': persona.name,
                'analysis': result
            })
    
    if len(valid_analyses) < 3:
        raise Exception("Too many personas failed, aborting session")
    
    # Phase 2: Deliberation
    log("Phase 2: Running deliberation...")
    deliberation_result = await run_deliberation(valid_analyses)
    
    # Phase 3: Synthesis
    log("Phase 3: Creating final report...")
    final_report = await create_final_report(
        analyses=valid_analyses,
        deliberation=deliberation_result,
        absent_personas=absent_personas
    )
    
    # Save results
    output_path = Path(f'./reports/{today}')
    output_path.mkdir(parents=True, exist_ok=True)
    
    with open(output_path / 'full_report.json', 'w') as f:
        json.dump(final_report, f, indent=2)
    
    with open(output_path / 'summary.md', 'w') as f:
        f.write(generate_markdown_report(final_report))
    
    log(f"Session {session_id} complete")
    return final_report

if __name__ == '__main__':
    asyncio.run(run_council_session())
```

### Persona Runner

```python
# personas/base.py

from anthropic import Anthropic
import json

class BasePersona:
    name: str
    model: str = "claude-3-haiku-20240307"  # Default
    prompt_template: str
    
    def __init__(self, data):
        self.data = data
        self.client = Anthropic()
    
    async def analyze(self) -> dict:
        prompt = self.build_prompt()
        
        response = await self.client.messages.create(
            model=self.model,
            max_tokens=1500,
            messages=[{
                "role": "user",
                "content": prompt
            }]
        )
        
        # Parse JSON from response
        try:
            result = json.loads(response.content[0].text)
            result['raw_response'] = response.content[0].text
            result['tokens_used'] = response.usage.total_tokens
            return result
        except json.JSONDecodeError:
            # Fallback: return as text
            return {
                'raw_response': response.content[0].text,
                'parse_error': True
            }
    
    def build_prompt(self) -> str:
        return self.prompt_template.format(
            **self.data
        )
```

### Deliberation Engine

```python
# deliberation.py

async def run_deliberation(analyses: list) -> dict:
    """
    Run structured deliberation between personas.
    """
    
    # Extract all recommendations
    all_recommendations = []
    for a in analyses:
        recs = extract_recommendations(a['analysis'])
        for rec in recs:
            rec['source_persona'] = a['persona']
            all_recommendations.append(rec)
    
    # Identify conflicts
    conflicts = identify_conflicts(all_recommendations)
    
    # Run debate on conflicts
    debates = []
    for conflict in conflicts:
        debate_result = await debate_conflict(
            conflict,
            [a for a in analyses if a['persona'] in conflict['involved_personas']]
        )
        debates.append(debate_result)
    
    # Vote on all recommendations
    votes = await vote_on_recommendations(all_recommendations, analyses)
    
    return {
        'recommendations': all_recommendations,
        'conflicts': conflicts,
        'debates': debates,
        'votes': votes
    }

async def debate_conflict(conflict, relevant_analyses):
    """
    Use LLM to simulate debate between personas.
    """
    prompt = f"""
    You are moderating a debate between marketing personas.
    
    CONFLICT:
    {conflict['description']}
    
    POSITIONS:
    {json.dumps(conflict['positions'], indent=2)}
    
    ANALYSES FROM EACH:
    {json.dumps(relevant_analyses, indent=2)}
    
    Simulate a 3-turn debate where each persona defends their position.
    Then provide a resolution recommendation.
    
    Output as JSON:
    {{
        "debate_turns": [...],
        "resolution": "...",
        "winning_position": "...",
        "confidence": 0.0-1.0
    }}
    """
    
    response = await client.messages.create(
        model="claude-sonnet-4-20250514",  # Use Sonnet for debate
        max_tokens=2000,
        messages=[{"role": "user", "content": prompt}]
    )
    
    return json.loads(response.content[0].text)
```

---

## Report Generation

### Daily Report Format

```markdown
# VISUALIZE Sports Marketing Council
## Daily Brief: {DATE}

---

### 🎯 Executive Summary

{3-sentence summary of today's findings}

**Council Confidence Score:** {0-100}%

---

### ⚡ Top 3 Actions This Week

1. **{Action 1}** 
   - Owner: {Persona}
   - Effort: {Low/Medium/High}
   - Impact: {Expected outcome}
   - Vote Score: {+X}
   - Deadline: {Suggested date}

2. **{Action 2}**
   ...

3. **{Action 3}**
   ...

---

### 🚨 Alerts

{If critical alerts exist}

- **{CRITICAL}** {Alert message} — {Source persona}
- **{WARNING}** {Alert message} — {Source persona}

---

### 📊 Metrics Dashboard

| Metric | Today | vs 30d Avg | Trend |
|--------|-------|------------|-------|
| Revenue | ${X} | {+/-X%} | {↑/↓/→} |
| Units | {X} | {+/-X%} | {↑/↓/→} |
| ACOS | {X%} | {+/-X%} | {↑/↓/→} |
| Conversion | {X%} | {+/-X%} | {↑/↓/→} |

---

### 💬 Dissenting Opinions

{If any persona strongly opposed a passed recommendation}

> **{Persona}** disagreed on {topic}:
> "{Their concern}"

---

### 📝 Full Persona Reports

<details>
<summary>Marcus (Data Analyst)</summary>

{Marcus's full analysis}

</details>

<details>
<summary>Aria (SEO Strategist)</summary>

{Aria's full analysis}

</details>

...

---

*Generated automatically at {TIMESTAMP} MST*
*Session ID: {SESSION_ID}*
```

### Weekly Digest Format

```markdown
# VISUALIZE Sports Weekly Digest
## Week of {START_DATE} - {END_DATE}

---

### 📈 Week in Review

{Paragraph summarizing the week's performance}

**Overall Health:** {Good / Needs Attention / Concerning}

---

### 📊 Weekly Metrics

| Metric | This Week | Last Week | Change | 30d Trend |
|--------|-----------|-----------|--------|-----------|
| Revenue | ${X} | ${X} | {+/-X%} | {↑/↓/→} |
| Units | {X} | {X} | {+/-X%} | {↑/↓/→} |
| ACOS | {X%} | {X%} | {+/-X%} | {↑/↓/→} |
| Sessions | {X} | {X} | {+/-X%} | {↑/↓/→} |

---

### ✅ Completed Actions

{Actions recommended earlier that were implemented}

1. {Action} — Result: {Outcome}
2. ...

---

### 🎯 Priorities for Next Week

Based on this week's council deliberations:

1. **{Priority 1}** — {Why}
2. **{Priority 2}** — {Why}
3. **{Priority 3}** — {Why}

---

### 🔮 Strategic Outlook

{Victor's strategic assessment for the coming weeks}

**Wind-Down Progress:**
- Inventory velocity: {Assessment}
- Liquidation timeline: {On track / Behind / Ahead}
- Exit readiness: {Assessment}

---

### 📉 Concerning Trends

{If any negative trends were identified}

1. {Trend} — Council recommendation: {Action}
2. ...

---

### 💡 Opportunity Spotlight

{One opportunity the council identified this week}

{Description}

**Estimated Impact:** {Low/Medium/High}
**Required Effort:** {Low/Medium/High}
**Council Vote:** {+X}

---

*Weekly digest generated at {TIMESTAMP} MST*
```

---

## Delivery System

### Telegram Notification

```python
# scripts/deliver-report.js

import { Telegram } from 'telegraf';

async function deliverReport() {
    const today = new Date().toISOString().split('T')[0];
    const reportPath = `./reports/${today}/summary.md`;
    
    // Load report
    const fullReport = await loadReport(reportPath);
    const jsonReport = await loadJSON(`./reports/${today}/full_report.json`);
    
    // Determine if notification needed
    const shouldNotify = 
        jsonReport.alerts.some(a => a.severity === 'critical') ||
        jsonReport.confidence_score < 60 ||
        config.notification.always;
    
    if (shouldNotify) {
        // Create condensed message for Telegram
        const message = formatTelegramMessage(jsonReport);
        
        await telegram.sendMessage(
            config.telegram.chatId,
            message,
            { parse_mode: 'Markdown' }
        );
    }
    
    // Always update dashboard
    await updateDashboard(jsonReport);
    
    // Archive
    await archiveReport(today, jsonReport);
}

function formatTelegramMessage(report) {
    let msg = `📊 *VISUALIZE Council Report*\n\n`;
    
    // Executive summary
    msg += `${report.executive_summary}\n\n`;
    
    // Alerts first
    const criticalAlerts = report.alerts.filter(a => a.severity === 'critical');
    if (criticalAlerts.length > 0) {
        msg += `🚨 *ALERTS*\n`;
        for (const alert of criticalAlerts) {
            msg += `• ${alert.message}\n`;
        }
        msg += `\n`;
    }
    
    // Top actions
    msg += `⚡ *Top Actions*\n`;
    for (const action of report.top_actions.slice(0, 3)) {
        msg += `${action.rank}. ${action.action}\n`;
    }
    
    // Confidence
    msg += `\n📈 Confidence: ${report.confidence_score}%`;
    
    // Link to full report
    msg += `\n\n[View Full Report](${config.dashboard.url}/reports/${report.date})`;
    
    return msg;
}
```

### Dashboard Update

```python
async function updateDashboard(report) {
    // Update Supabase with latest report
    await supabase.from('council_reports').insert({
        date: report.date,
        session_id: report.session_id,
        executive_summary: report.executive_summary,
        confidence_score: report.confidence_score,
        top_actions: report.top_actions,
        alerts: report.alerts,
        full_report: report
    });
    
    // Update latest metrics for dashboard cards
    await supabase.from('current_metrics').upsert({
        id: 1,  // Single row for current state
        updated_at: new Date(),
        ...report.metrics_snapshot
    });
}
```

---

## Error Handling & Recovery

### Failure Modes

| Failure | Detection | Recovery |
|---------|-----------|----------|
| Data collection fails | No data file for today | Use cached data (up to 3 days), add warning |
| Single persona fails | Exception in analysis | Continue with remaining personas, note absence |
| Multiple personas fail | <3 valid analyses | Abort session, send alert to Tim |
| Deliberation fails | Timeout or exception | Use individual analyses without debate |
| Delivery fails | API error | Retry 3x, queue for next run |

### Health Check Script

```python
# scripts/health-check.js

async function healthCheck() {
    const checks = [];
    
    // Check data freshness
    const latestData = await getLatestDataFile();
    const dataAge = Date.now() - latestData.modifiedAt;
    checks.push({
        name: 'data_freshness',
        status: dataAge < 48 * 3600000 ? 'ok' : 'stale',
        value: `${Math.round(dataAge / 3600000)}h old`
    });
    
    // Check last successful council
    const lastReport = await getLatestReport();
    const reportAge = Date.now() - lastReport.createdAt;
    checks.push({
        name: 'council_run',
        status: reportAge < 26 * 3600000 ? 'ok' : 'missed',
        value: `${Math.round(reportAge / 3600000)}h ago`
    });
    
    // Check API connectivity
    const apiStatus = await testAnthropicAPI();
    checks.push({
        name: 'anthropic_api',
        status: apiStatus ? 'ok' : 'error',
        value: apiStatus ? 'connected' : 'unreachable'
    });
    
    // Alert if any failures
    const failures = checks.filter(c => c.status !== 'ok');
    if (failures.length > 0) {
        await sendHealthAlert(failures);
    }
    
    // Log status
    console.log(JSON.stringify({
        timestamp: new Date(),
        checks,
        overall: failures.length === 0 ? 'healthy' : 'degraded'
    }));
}
```

---

## Cost Tracking

### Per-Session Cost Breakdown

| Component | Model | Est. Tokens | Est. Cost |
|-----------|-------|-------------|-----------|
| 5 Persona Analyses | Haiku | 5 × 4,000 | ~$0.005 |
| Deliberation | Sonnet | ~10,000 | ~$0.03 |
| Synthesis | Sonnet | ~3,000 | ~$0.01 |
| **Daily Total** | | | **~$0.05** |
| **Monthly Total** | | | **~$1.50** |

### Cost Logging

```python
def log_cost(session_id, model, tokens_in, tokens_out):
    costs = {
        'haiku': {'in': 0.25 / 1_000_000, 'out': 1.25 / 1_000_000},
        'sonnet': {'in': 3 / 1_000_000, 'out': 15 / 1_000_000}
    }
    
    cost = (tokens_in * costs[model]['in'] + 
            tokens_out * costs[model]['out'])
    
    supabase.from('cost_log').insert({
        'session_id': session_id,
        'model': model,
        'tokens_in': tokens_in,
        'tokens_out': tokens_out,
        'cost_usd': cost,
        'timestamp': datetime.now()
    })
```

---

## File Structure

```
~/shared/visualize-amazon/
├── scripts/
│   ├── collect-data.js      # Data collection
│   ├── run-council.py       # Main council runner
│   ├── deliver-report.js    # Notification delivery
│   ├── weekly-digest.py     # Weekly summary
│   └── health-check.js      # System health monitoring
├── personas/
│   ├── base.py              # Base persona class
│   ├── data_analyst.py      # Marcus
│   ├── seo_strategist.py    # Aria
│   ├── ad_specialist.py     # Derek
│   ├── social_manager.py    # Maya
│   └── brand_strategist.py  # Victor
├── data/
│   ├── daily/               # Daily JSON data files
│   ├── competitors/         # Competitor snapshots
│   ├── uploads/             # Manual CSV uploads
│   └── historical/          # Baseline data
├── reports/
│   ├── YYYY-MM-DD/          # Daily report folders
│   │   ├── full_report.json
│   │   └── summary.md
│   └── weekly/              # Weekly digests
├── logs/
│   ├── collect.log
│   ├── council.log
│   ├── delivery.log
│   └── health.log
└── config/
    └── council.yaml         # Configuration
```

---

## Configuration

```yaml
# config/council.yaml

amazon:
  sp_api_enabled: false  # Enable when credentials available
  refresh_token: ${AMAZON_REFRESH_TOKEN}
  client_id: ${AMAZON_CLIENT_ID}
  client_secret: ${AMAZON_CLIENT_SECRET}
  
anthropic:
  api_key: ${ANTHROPIC_API_KEY}
  default_model: claude-3-haiku-20240307
  deliberation_model: claude-sonnet-4-20250514
  
notification:
  telegram_enabled: true
  telegram_chat_id: ${TELEGRAM_CHAT_ID}
  telegram_bot_token: ${TELEGRAM_BOT_TOKEN}
  always_notify: false  # Only notify on alerts
  
social:
  enabled: false  # Enable when APIs configured
  instagram_token: ${INSTAGRAM_TOKEN}
  facebook_token: ${FACEBOOK_TOKEN}
  
competitors:
  - B07XYZ123  # Main competitor 1
  - B07ABC456  # Main competitor 2
  
schedule:
  timezone: America/Phoenix  # MST
  data_collection: "0 2 * * *"
  council_session: "45 2 * * *"
  delivery: "25 3 * * *"
  weekly_digest: "0 8 * * 0"
  
personas:
  data_analyst:
    model: claude-3-haiku-20240307
    max_tokens: 1500
  seo_strategist:
    model: claude-3-haiku-20240307
    max_tokens: 1500
  ad_specialist:
    model: claude-3-haiku-20240307
    max_tokens: 1500
  social_manager:
    model: claude-sonnet-4-20250514  # More creative
    max_tokens: 2000
  brand_strategist:
    model: claude-sonnet-4-20250514  # Strategic reasoning
    max_tokens: 2000
```

---

*This automation design prioritizes reliability and cost-efficiency while producing actionable morning briefs for Tim. The system degrades gracefully when components fail and maintains comprehensive logs for debugging.*
