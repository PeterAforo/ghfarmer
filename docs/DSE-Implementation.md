# DSE Implementation Summary

## Overview

The Decision Support Engine (DSE) has been fully implemented following the architecture outlined in `DSE.md`. This document summarizes what was built.

---

## 1. Database Schema (Option 1) ✅

Added to `prisma/schema.prisma`:

### Core Tables

| Table | Purpose |
|-------|---------|
| `FarmEvent` | Event-sourced farm ledger (append-only) |
| `FarmSnapshot` | Computed state snapshots from events |
| `FarmFeature` | Derived metrics for ML/rules |
| `Recommendation` | Generated recommendations |
| `RecommendationFeedback` | User feedback on recommendations |
| `DseRule` | Stored rules for the rules engine |
| `AgronomySchedule` | Crop calendars |
| `LivestockHealthSchedule` | Vaccination/health calendars |

### Enums Added

- `EntityType` - FARM, CROP_ENTRY, LIVESTOCK_ENTRY, etc.
- `EventSource` - USER_INPUT, SYSTEM_GENERATED, SENSOR, etc.
- `SnapshotType` - CURRENT, DAILY, WEEKLY, MONTHLY, etc.
- `RecommendationCategory` - CROP, LIVESTOCK, WEATHER, FINANCE, etc.
- `RecommendationPriority` - URGENT, HIGH, NORMAL, LOW
- `RecommendationStatus` - ACTIVE, DISMISSED, COMPLETED, EXPIRED, SNOOZED
- `ConfidenceLevel` - HIGH, MEDIUM, LOW
- `FeedbackType` - HELPFUL, NOT_HELPFUL, COMPLETED, DISMISSED, INCORRECT
- `RuleCategory` - CROP_CALENDAR, LIVESTOCK_HEALTH, WEATHER_ALERT, etc.
- `HealthActivityType` - VACCINATION, DEWORMING, CHECKUP, BREEDING, WEANING

---

## 2. Rules DSL Design (Option 2) ✅

Created in `src/lib/dse/`:

### Type Definitions (`types.ts`)

```typescript
// Condition operators
type ConditionOperator = "eq" | "neq" | "gt" | "gte" | "lt" | "lte" | "in" | "nin" | "between" | "contains" | "exists" | "empty";

// Rule structure
interface Rule {
  code: string;           // Unique identifier
  name: string;
  category: RuleCategory;
  entityType?: EntityType;
  cropTypes?: string[];   // Target specific crops
  livestockTypes?: string[];
  regions?: string[];
  seasons?: Season[];
  conditions: ConditionGroup;
  actions: RuleAction[];
  priority: number;
  isActive: boolean;
  version: number;
}
```

### Rules Engine (`rule-engine.ts`)

- **Condition Evaluator** - Evaluates conditions against context
- **Template Processor** - Replaces `{{variables}}` in templates
- **Rule Evaluator** - Generates recommendations from matched rules
- **RulesEngine Class** - Main orchestrator

### Context Builder (`context-builder.ts`)

Builds evaluation context from database:
- Farm context (size, region, task counts)
- Crop contexts (days from planting, activities, gaps)
- Livestock contexts (age, vaccinations, health records)
- Finance context (expenses, income, profit)
- Current season detection (Ghana seasons)

---

## 3. Decision Engine API (Option 3) ✅

### Endpoints

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/dse/recommendations` | GET | Get active recommendations |
| `/api/dse/recommendations` | POST | Force refresh recommendations |
| `/api/dse/recommendations/[id]` | GET | Get single recommendation |
| `/api/dse/recommendations/[id]` | PATCH | Update status (dismiss, complete) |
| `/api/dse/feedback` | POST | Submit feedback |
| `/api/dse/feedback` | GET | Get feedback history |
| `/api/dse/explain` | GET | Explain why recommendation was generated |

### Response Format

```json
{
  "recommendations": [...],
  "source": "generated" | "cache",
  "generatedAt": "2024-12-24T...",
  "rulesEvaluated": 30,
  "context": {
    "cropsCount": 5,
    "livestockCount": 3,
    "season": "MAJOR_DRY"
  }
}
```

---

## 4. V1 Rules Catalog (Option 4) ✅

Created in `src/lib/dse/rules-catalog.ts`:

### Crop Rules (15 rules)

| Crop | Rules |
|------|-------|
| Maize | Top dressing window, First weeding, Harvest ready |
| Rice | Transplant window, Basal fertilizer |
| Cassava | First weeding, Harvest ready |
| Tomato | Staking, Blight prevention |
| Pepper | Flowering fertilizer |

### Livestock Rules (8 rules)

| Animal | Rules |
|--------|-------|
| Poultry | Newcastle vaccine, Gumboro vaccine, Deworming |
| Goats/Sheep | PPR vaccine, Deworming |
| Pigs | Iron injection, Deworming |

### Weather Rules (3 rules)

- Spray conditions unsuitable (high wind)
- Rain risk for harvest
- Heat stress alert for poultry

### Financial Rules (1 rule)

- High expense warning

### Task Rules (1 rule)

- Overdue tasks alert

**Total: 28 rules implemented**

---

## 5. Dashboard UI (Option 5) ✅

Created `/dashboard/recommendations` page with:

- **Summary cards** - Active, Urgent, Crop, Livestock counts
- **Filter tabs** - All, Urgent, Crop, Livestock, Weather, Finance, Completed
- **Recommendation cards** showing:
  - Priority badge (color-coded)
  - Category icon
  - Confidence score
  - Reasons (expandable)
  - Action steps (expandable)
  - Expected impact
- **Feedback buttons** - Done, Helpful, Not Helpful
- **Explain link** - Opens explanation API
- **Refresh button** - Force regenerate recommendations

Added to navigation: "Recommendations" with Lightbulb icon

---

## File Structure

```
src/lib/dse/
├── index.ts              # Main exports
├── types.ts              # TypeScript interfaces
├── rule-engine.ts        # Rules evaluation engine
├── context-builder.ts    # Builds context from DB
└── rules-catalog.ts      # V1 rules (28 rules)

src/app/api/dse/
├── recommendations/
│   ├── route.ts          # GET/POST recommendations
│   └── [id]/route.ts     # GET/PATCH single rec
├── feedback/route.ts     # POST/GET feedback
└── explain/route.ts      # GET explanation

src/app/dashboard/
└── recommendations/
    └── page.tsx          # Recommendations UI
```

---

## Next Steps (V2+)

1. **Add more rules** - Expand to 100+ rules covering more crops/livestock
2. **Weather integration** - Fetch real weather data for context
3. **Market integration** - Fetch price data for market alerts
4. **ML scoring** - Add scoring engine for risk predictions
5. **Offline support** - Edge DSE Lite for offline recommendations
6. **Push notifications** - SMS/push for urgent recommendations
7. **Admin dashboard** - Manage rules, view analytics

---

## Usage

### Get Recommendations

```typescript
const res = await fetch('/api/dse/recommendations');
const { recommendations } = await res.json();
```

### Submit Feedback

```typescript
await fetch('/api/dse/feedback', {
  method: 'POST',
  body: JSON.stringify({
    recommendationId: 'rec_123',
    feedbackType: 'COMPLETED',
    actionTaken: true
  })
});
```

### Explain Recommendation

```typescript
const res = await fetch(`/api/dse/explain?recommendationId=rec_123`);
const explanation = await res.json();
```

---

## Database Migration

After pulling these changes, run:

```bash
npx prisma generate
npx prisma db push
```

This will create the new DSE tables in your database.
