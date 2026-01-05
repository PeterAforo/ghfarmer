// DSE Rules Engine - Evaluates rules against farm context

import {
  Rule,
  Condition,
  ConditionGroup,
  ConditionOperator,
  EvaluationContext,
  RecommendationCard,
  RuleAction,
} from "./types";

// ============================================
// CONDITION EVALUATOR
// ============================================

function getNestedValue(obj: any, path: string): any {
  return path.split(".").reduce((current, key) => {
    if (current === null || current === undefined) return undefined;
    return current[key];
  }, obj);
}

function evaluateCondition(condition: Condition, context: EvaluationContext): boolean {
  const value = getNestedValue(context, condition.field);
  const compareValue = condition.value;

  switch (condition.operator) {
    case "eq":
      return value === compareValue;
    case "neq":
      return value !== compareValue;
    case "gt":
      return typeof value === "number" && value > compareValue;
    case "gte":
      return typeof value === "number" && value >= compareValue;
    case "lt":
      return typeof value === "number" && value < compareValue;
    case "lte":
      return typeof value === "number" && value <= compareValue;
    case "in":
      return Array.isArray(compareValue) && compareValue.includes(value);
    case "nin":
      return Array.isArray(compareValue) && !compareValue.includes(value);
    case "between":
      if (Array.isArray(compareValue) && compareValue.length === 2) {
        return typeof value === "number" && value >= compareValue[0] && value <= compareValue[1];
      }
      return false;
    case "contains":
      return typeof value === "string" && value.toLowerCase().includes(String(compareValue).toLowerCase());
    case "exists":
      return value !== undefined && value !== null;
    case "empty":
      return value === undefined || value === null || value === "" || (Array.isArray(value) && value.length === 0);
    default:
      return false;
  }
}

function evaluateConditionGroup(group: ConditionGroup, context: EvaluationContext): boolean {
  const results = group.conditions.map((item) => {
    if ("logic" in item) {
      return evaluateConditionGroup(item as ConditionGroup, context);
    }
    return evaluateCondition(item as Condition, context);
  });

  switch (group.logic) {
    case "and":
      return results.every(Boolean);
    case "or":
      return results.some(Boolean);
    case "not":
      return !results[0];
    default:
      return false;
  }
}

// ============================================
// TEMPLATE PROCESSOR
// ============================================

function processTemplate(template: string, context: EvaluationContext, entityContext?: any): string {
  return template.replace(/\{\{([^}]+)\}\}/g, (match, path) => {
    // First try entity context, then general context
    let value = entityContext ? getNestedValue(entityContext, path.trim()) : undefined;
    if (value === undefined) {
      value = getNestedValue(context, path.trim());
    }
    return value !== undefined ? String(value) : match;
  });
}

// ============================================
// RULE EVALUATOR
// ============================================

interface RuleMatch {
  rule: Rule;
  entityType?: string;
  entityId?: string;
  entityContext?: any;
}

function checkRuleApplicability(rule: Rule, context: EvaluationContext): RuleMatch[] {
  const matches: RuleMatch[] = [];

  // Check region filter
  if (rule.regions && rule.regions.length > 0) {
    if (!context.farm?.region || !rule.regions.includes(context.farm.region)) {
      return [];
    }
  }

  // Check season filter
  if (rule.seasons && rule.seasons.length > 0) {
    if (!rule.seasons.includes(context.currentSeason)) {
      return [];
    }
  }

  // Check entity type and find matching entities
  if (rule.entityType === "CROP_ENTRY" && rule.cropTypes) {
    for (const crop of context.crops) {
      if (rule.cropTypes.includes(crop.cropType) || rule.cropTypes.includes("*")) {
        matches.push({
          rule,
          entityType: "CROP_ENTRY",
          entityId: crop.id,
          entityContext: { crop },
        });
      }
    }
  } else if (rule.entityType === "LIVESTOCK_ENTRY" && rule.livestockTypes) {
    for (const livestock of context.livestock) {
      if (rule.livestockTypes.includes(livestock.livestockType) || rule.livestockTypes.includes("*")) {
        matches.push({
          rule,
          entityType: "LIVESTOCK_ENTRY",
          entityId: livestock.id,
          entityContext: { livestock },
        });
      }
    }
  } else {
    // General rule, applies to farm level
    matches.push({ rule });
  }

  return matches;
}

function evaluateRule(
  match: RuleMatch,
  context: EvaluationContext
): RecommendationCard[] {
  const { rule, entityType, entityId, entityContext } = match;

  // Merge entity context into evaluation context
  const evalContext = entityContext
    ? { ...context, ...entityContext }
    : context;

  // Evaluate conditions
  if (!evaluateConditionGroup(rule.conditions, evalContext)) {
    return [];
  }

  // Generate recommendations from actions
  return rule.actions.map((action) => {
    const title = action.titleTemplate
      ? processTemplate(action.titleTemplate, context, entityContext)
      : action.title;

    const description = action.descriptionTemplate
      ? processTemplate(action.descriptionTemplate, context, entityContext)
      : action.description;

    const actionSteps = action.actionStepsTemplate
      ? action.actionStepsTemplate.map((t) => processTemplate(t, context, entityContext))
      : action.actionSteps;

    // Calculate confidence
    let confidence = action.confidenceBase;
    // Adjust based on data completeness (simplified)
    if (context.weather) confidence = Math.min(confidence + 0.1, 1);
    if (context.market) confidence = Math.min(confidence + 0.05, 1);

    const confidenceLabel = confidence >= 0.8 ? "high" : confidence >= 0.5 ? "medium" : "low";

    const validUntil = action.validDays
      ? new Date(Date.now() + action.validDays * 24 * 60 * 60 * 1000)
      : undefined;

    return {
      id: `rec_${rule.code}_${entityId || "farm"}_${Date.now()}`,
      farmId: context.farm?.id,
      priority: action.priority,
      category: action.category,
      title,
      description,
      actionSteps,
      reason: generateReasons(rule, evalContext, entityContext),
      impact: action.impactType
        ? { type: action.impactType, value: action.impactValue || 0 }
        : undefined,
      confidence,
      confidenceLabel,
      evidence: {
        rulesFired: [rule.code],
        features: extractUsedFeatures(rule.conditions),
        weatherRef: context.weather ? `weather_${new Date().toISOString().split("T")[0]}` : undefined,
      },
      validFrom: new Date(),
      validUntil,
      entityType: entityType as any,
      entityId,
      explainMoreUrl: action.explainMoreUrl,
      modelVersion: `rules_v${rule.version}`,
    };
  });
}

function generateReasons(rule: Rule, context: EvaluationContext, entityContext?: any): string[] {
  const reasons: string[] = [];

  // Extract reasons from conditions
  function extractReasons(group: ConditionGroup) {
    for (const item of group.conditions) {
      if ("logic" in item) {
        extractReasons(item as ConditionGroup);
      } else {
        const condition = item as Condition;
        const value = getNestedValue(entityContext || context, condition.field);
        if (value !== undefined) {
          reasons.push(formatConditionReason(condition, value));
        }
      }
    }
  }

  extractReasons(rule.conditions);
  return reasons.slice(0, 5); // Limit to 5 reasons
}

function formatConditionReason(condition: Condition, actualValue: any): string {
  const fieldName = condition.field.split(".").pop() || condition.field;
  const readableName = fieldName.replace(/([A-Z])/g, " $1").toLowerCase();

  switch (condition.operator) {
    case "gte":
      return `${readableName} is ${actualValue}${condition.unit ? ` ${condition.unit}` : ""} (threshold: ${condition.value})`;
    case "lte":
      return `${readableName} is ${actualValue}${condition.unit ? ` ${condition.unit}` : ""} (max: ${condition.value})`;
    case "between":
      return `${readableName} is ${actualValue} (expected: ${condition.value[0]}-${condition.value[1]})`;
    case "empty":
      return `No ${readableName} recorded yet`;
    default:
      return `${readableName}: ${actualValue}`;
  }
}

function extractUsedFeatures(group: ConditionGroup): string[] {
  const features: string[] = [];

  function extract(g: ConditionGroup) {
    for (const item of g.conditions) {
      if ("logic" in item) {
        extract(item as ConditionGroup);
      } else {
        features.push((item as Condition).field);
      }
    }
  }

  extract(group);
  return [...new Set(features)];
}

// ============================================
// MAIN ENGINE
// ============================================

export class RulesEngine {
  private rules: Rule[] = [];

  constructor(rules: Rule[] = []) {
    this.rules = rules.sort((a, b) => b.priority - a.priority);
  }

  addRule(rule: Rule): void {
    this.rules.push(rule);
    this.rules.sort((a, b) => b.priority - a.priority);
  }

  addRules(rules: Rule[]): void {
    this.rules.push(...rules);
    this.rules.sort((a, b) => b.priority - a.priority);
  }

  evaluate(context: EvaluationContext): RecommendationCard[] {
    const recommendations: RecommendationCard[] = [];
    const seenKeys = new Set<string>();

    for (const rule of this.rules) {
      if (!rule.isActive) continue;

      const matches = checkRuleApplicability(rule, context);

      for (const match of matches) {
        const recs = evaluateRule(match, context);

        for (const rec of recs) {
          // Deduplicate by rule + entity
          const key = `${rule.code}_${rec.entityId || "farm"}`;
          if (!seenKeys.has(key)) {
            seenKeys.add(key);
            recommendations.push(rec);
          }
        }
      }
    }

    // Sort by priority
    const priorityOrder = { urgent: 0, high: 1, normal: 2, low: 3 };
    return recommendations.sort(
      (a, b) => priorityOrder[a.priority] - priorityOrder[b.priority]
    );
  }

  getRules(): Rule[] {
    return this.rules;
  }

  getActiveRules(): Rule[] {
    return this.rules.filter((r) => r.isActive);
  }
}

export default RulesEngine;
