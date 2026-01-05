// DSE - Decision Support Engine
// Main entry point

export * from "./types";
export { RulesEngine } from "./rule-engine";
export { buildEvaluationContext } from "./context-builder";
export { GHANA_CROP_RULES, GHANA_LIVESTOCK_RULES, ALL_RULES } from "./rules-catalog";
