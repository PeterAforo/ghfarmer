// DSE Types and Interfaces

// ============================================
// RULE DSL TYPES
// ============================================

export type ConditionOperator =
  | "eq"      // equals
  | "neq"     // not equals
  | "gt"      // greater than
  | "gte"     // greater than or equal
  | "lt"      // less than
  | "lte"     // less than or equal
  | "in"      // in array
  | "nin"     // not in array
  | "between" // between two values
  | "contains"// string contains
  | "exists"  // field exists
  | "empty"   // field is empty/null

export type LogicalOperator = "and" | "or" | "not";

export interface Condition {
  field: string;           // e.g., "crop.daysFromPlanting", "weather.windSpeed"
  operator: ConditionOperator;
  value: any;              // comparison value
  unit?: string;           // optional unit for display
}

export interface ConditionGroup {
  logic: LogicalOperator;
  conditions: (Condition | ConditionGroup)[];
}

export interface RuleAction {
  type: "recommend" | "alert" | "task" | "notification";
  priority: "urgent" | "high" | "normal" | "low";
  title: string;
  titleTemplate?: string;  // Template with {{variables}}
  description?: string;
  descriptionTemplate?: string;
  actionSteps: string[];
  actionStepsTemplate?: string[];
  impactType?: string;
  impactValue?: number;
  confidenceBase: number;  // Base confidence 0-1
  category: string;
  validDays?: number;      // How long recommendation is valid
  explainMoreUrl?: string;
}

export interface Rule {
  code: string;            // Unique rule identifier
  name: string;
  description?: string;
  category: RuleCategory;
  entityType?: EntityType;
  
  // Targeting
  cropTypes?: string[];    // Specific crops this applies to
  livestockTypes?: string[];
  regions?: string[];
  seasons?: Season[];
  
  // Conditions
  conditions: ConditionGroup;
  
  // Actions
  actions: RuleAction[];
  
  // Metadata
  priority: number;        // Higher = evaluated first
  isActive: boolean;
  version: number;
}

export type RuleCategory =
  | "CROP_CALENDAR"
  | "LIVESTOCK_HEALTH"
  | "WEATHER_ALERT"
  | "MARKET_ALERT"
  | "FINANCIAL"
  | "PEST_DISEASE"
  | "GENERAL";

export type EntityType =
  | "FARM"
  | "CROP_ENTRY"
  | "LIVESTOCK_ENTRY"
  | "POND_ENTRY"
  | "TASK"
  | "EXPENSE"
  | "INCOME";

export type Season = "MAJOR_RAINY" | "MINOR_RAINY" | "MAJOR_DRY" | "MINOR_DRY";

// ============================================
// CONTEXT TYPES (Data available to rules)
// ============================================

export interface CropContext {
  id: string;
  cropType: string;
  variety?: string;
  plantingDate: Date;
  daysFromPlanting: number;
  expectedHarvestDate?: Date;
  daysToHarvest?: number;
  status: string;
  areaPlanted?: number;
  areaUnit?: string;
  
  // Activities
  lastActivity?: {
    type: string;
    date: Date;
    daysSince: number;
  };
  activitiesLogged: {
    type: string;
    count: number;
    lastDate?: Date;
  }[];
  
  // Gaps
  fertilizerGapDays?: number;
  weedingGapDays?: number;
  
  // Yield
  yieldQuantity?: number;
  yieldUnit?: string;
}

export interface LivestockContext {
  id: string;
  livestockType: string;
  breed?: string;
  quantity: number;
  dateAcquired: Date;
  ageInDays: number;
  status: string;
  
  // Health
  lastVaccination?: {
    name: string;
    date: Date;
    daysSince: number;
  };
  lastDeworming?: {
    date: Date;
    daysSince: number;
  };
  vaccinationsDue: {
    name: string;
    dueDate: Date;
    daysOverdue: number;
  }[];
  
  // Production
  mortalityRate?: number;
  productionRate?: number;
}

export interface WeatherContext {
  current: {
    temperature: number;
    humidity: number;
    windSpeed: number;
    condition: string;
    rainProbability: number;
  };
  forecast: {
    date: Date;
    tempHigh: number;
    tempLow: number;
    rainProbability: number;
    windSpeed: number;
    condition: string;
  }[];
  alerts: {
    type: string;
    severity: string;
    message: string;
  }[];
}

export interface MarketContext {
  prices: {
    product: string;
    market: string;
    price: number;
    unit: string;
    trend: "up" | "down" | "stable";
    changePercent: number;
  }[];
  alerts: {
    product: string;
    condition: "above" | "below";
    targetPrice: number;
    currentPrice: number;
  }[];
}

export interface FinanceContext {
  totalExpenses: number;
  totalIncome: number;
  netProfit: number;
  cashFlow: number;
  expensesByCategory: Record<string, number>;
  incomeByProduct: Record<string, number>;
}

export interface FarmContext {
  id: string;
  name: string;
  region?: string;
  district?: string;
  size?: number;
  sizeUnit?: string;
  
  // Aggregates
  totalCrops: number;
  totalLivestock: number;
  activeTasks: number;
  overdueTasks: number;
}

export interface EvaluationContext {
  userId: string;
  farm?: FarmContext;
  crops: CropContext[];
  livestock: LivestockContext[];
  weather?: WeatherContext;
  market?: MarketContext;
  finance?: FinanceContext;
  currentDate: Date;
  currentSeason: Season;
}

// ============================================
// RECOMMENDATION TYPES
// ============================================

export interface RecommendationCard {
  id: string;
  farmId?: string;
  priority: "urgent" | "high" | "normal" | "low";
  category: string;
  title: string;
  description?: string;
  actionSteps: string[];
  reason: string[];
  impact?: {
    type: string;
    value: number;
  };
  confidence: number;
  confidenceLabel: "high" | "medium" | "low";
  evidence: {
    rulesFired: string[];
    features: string[];
    weatherRef?: string;
    marketRef?: string;
  };
  validFrom: Date;
  validUntil?: Date;
  entityType?: EntityType;
  entityId?: string;
  explainMoreUrl?: string;
  modelVersion: string;
}

// ============================================
// FEATURE TYPES
// ============================================

export interface Feature {
  name: string;
  group: string;
  value: number;
  valueJson?: any;
  computedAt: Date;
  validFrom: Date;
  validUntil?: Date;
}

export interface FeatureDefinition {
  name: string;
  group: string;
  description: string;
  computation: (context: EvaluationContext) => number | null;
  entityType?: EntityType;
}

// ============================================
// EVENT TYPES
// ============================================

export type FarmEventType =
  // Crop events
  | "CROP_PLANTED"
  | "CROP_ACTIVITY_LOGGED"
  | "CROP_HARVESTED"
  | "CROP_STATUS_CHANGED"
  // Livestock events
  | "LIVESTOCK_ACQUIRED"
  | "LIVESTOCK_VACCINATION"
  | "LIVESTOCK_DEWORMING"
  | "LIVESTOCK_ILLNESS"
  | "LIVESTOCK_MORTALITY"
  | "LIVESTOCK_SALE"
  // Financial events
  | "EXPENSE_LOGGED"
  | "INCOME_LOGGED"
  // Task events
  | "TASK_CREATED"
  | "TASK_COMPLETED"
  | "TASK_OVERDUE"
  // System events
  | "WEATHER_ALERT"
  | "PRICE_ALERT"
  | "RECOMMENDATION_GENERATED"
  | "RECOMMENDATION_FEEDBACK";

export interface FarmEvent {
  id: string;
  userId: string;
  farmId?: string;
  entityType: EntityType;
  entityId?: string;
  eventType: FarmEventType;
  payload: Record<string, any>;
  occurredAt: Date;
  source: "USER_INPUT" | "SYSTEM_GENERATED" | "SENSOR" | "EXTERNAL_API" | "SYNC";
  offlineId?: string;
}
