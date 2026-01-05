// Production Record Templates for Livestock
// Auto-generates expected production milestones when animals are added

export interface ProductionMilestone {
  type: "EGGS" | "MILK" | "WEIGHT" | "OTHER";
  name: string;
  description: string;
  daysFromAcquisition: number; // Days from acquisition to start production
  expectedDailyProduction?: number; // Expected daily output (eggs, liters, etc.)
  expectedWeeklyProduction?: number;
  productionUnit?: string; // eggs, liters, kg, etc.
  expectedRevenuePerUnit?: number; // GHS per unit
  durationDays?: number; // How long this production phase lasts
  notes?: string;
}

export interface ProductionSchedule {
  animalType: string;
  milestones: ProductionMilestone[];
}

// Production schedules by animal type
export const PRODUCTION_TEMPLATES: Record<string, ProductionMilestone[]> = {
  // LAYERS - Egg Production
  "Layer": [
    {
      type: "EGGS",
      name: "Point of Lay",
      description: "Layers begin egg production (18-20 weeks of age)",
      daysFromAcquisition: 126, // ~18 weeks if acquired as day-old chicks
      expectedDailyProduction: 0.5, // 50% production rate initially
      productionUnit: "eggs per bird",
      expectedRevenuePerUnit: 1.5, // GHS per egg
      durationDays: 14,
      notes: "Production starts slowly, expect 50% lay rate"
    },
    {
      type: "EGGS",
      name: "Peak Production Phase",
      description: "Peak egg production period (22-45 weeks)",
      daysFromAcquisition: 154, // ~22 weeks
      expectedDailyProduction: 0.85, // 85% production rate
      productionUnit: "eggs per bird",
      expectedRevenuePerUnit: 1.5,
      durationDays: 161, // ~23 weeks of peak
      notes: "Peak production - expect 80-90% lay rate"
    },
    {
      type: "EGGS",
      name: "Sustained Production",
      description: "Sustained production phase (45-72 weeks)",
      daysFromAcquisition: 315, // ~45 weeks
      expectedDailyProduction: 0.75, // 75% production rate
      productionUnit: "eggs per bird",
      expectedRevenuePerUnit: 1.5,
      durationDays: 189, // ~27 weeks
      notes: "Production gradually declines to 70-75%"
    },
    {
      type: "EGGS",
      name: "Late Production",
      description: "Late production phase (72+ weeks)",
      daysFromAcquisition: 504, // ~72 weeks
      expectedDailyProduction: 0.6, // 60% production rate
      productionUnit: "eggs per bird",
      expectedRevenuePerUnit: 1.5,
      durationDays: 84, // ~12 weeks before culling
      notes: "Consider culling or molting at this stage"
    },
  ],

  // BROILERS - Weight/Meat Production
  "Broiler": [
    {
      type: "WEIGHT",
      name: "Week 1 Weight Check",
      description: "First week weight monitoring",
      daysFromAcquisition: 7,
      expectedDailyProduction: 0.18, // Expected weight in kg
      productionUnit: "kg per bird",
      notes: "Target: 180g average weight"
    },
    {
      type: "WEIGHT",
      name: "Week 2 Weight Check",
      description: "Second week weight monitoring",
      daysFromAcquisition: 14,
      expectedDailyProduction: 0.45,
      productionUnit: "kg per bird",
      notes: "Target: 450g average weight"
    },
    {
      type: "WEIGHT",
      name: "Week 3 Weight Check",
      description: "Third week weight monitoring",
      daysFromAcquisition: 21,
      expectedDailyProduction: 0.85,
      productionUnit: "kg per bird",
      notes: "Target: 850g average weight"
    },
    {
      type: "WEIGHT",
      name: "Week 4 Weight Check",
      description: "Fourth week weight monitoring",
      daysFromAcquisition: 28,
      expectedDailyProduction: 1.4,
      productionUnit: "kg per bird",
      notes: "Target: 1.4kg average weight"
    },
    {
      type: "WEIGHT",
      name: "Week 5 Weight Check",
      description: "Fifth week weight monitoring",
      daysFromAcquisition: 35,
      expectedDailyProduction: 1.9,
      productionUnit: "kg per bird",
      notes: "Target: 1.9kg average weight"
    },
    {
      type: "WEIGHT",
      name: "Market Weight (Week 6)",
      description: "Ready for market - optimal weight reached",
      daysFromAcquisition: 42,
      expectedDailyProduction: 2.3,
      productionUnit: "kg per bird",
      expectedRevenuePerUnit: 35, // GHS per kg live weight
      notes: "Target: 2.3kg - Ready for sale"
    },
    {
      type: "WEIGHT",
      name: "Extended Growth (Week 7)",
      description: "Extended growth for larger birds",
      daysFromAcquisition: 49,
      expectedDailyProduction: 2.7,
      productionUnit: "kg per bird",
      expectedRevenuePerUnit: 35,
      notes: "Target: 2.7kg - Premium size"
    },
  ],

  // CATTLE - Dairy
  "Cattle": [
    {
      type: "MILK",
      name: "Early Lactation",
      description: "First 100 days after calving - peak milk production",
      daysFromAcquisition: 0, // Assumes dairy cow acquired
      expectedDailyProduction: 20, // liters per day
      productionUnit: "liters per cow",
      expectedRevenuePerUnit: 8, // GHS per liter
      durationDays: 100,
      notes: "Peak production period - ensure adequate nutrition"
    },
    {
      type: "MILK",
      name: "Mid Lactation",
      description: "Days 100-200 - sustained production",
      daysFromAcquisition: 100,
      expectedDailyProduction: 15,
      productionUnit: "liters per cow",
      expectedRevenuePerUnit: 8,
      durationDays: 100,
      notes: "Maintain body condition for next breeding"
    },
    {
      type: "MILK",
      name: "Late Lactation",
      description: "Days 200-305 - declining production",
      daysFromAcquisition: 200,
      expectedDailyProduction: 10,
      productionUnit: "liters per cow",
      expectedRevenuePerUnit: 8,
      durationDays: 105,
      notes: "Prepare for dry period"
    },
    {
      type: "WEIGHT",
      name: "Weight Monitoring",
      description: "Monthly weight check for beef cattle",
      daysFromAcquisition: 30,
      expectedDailyProduction: 0.8, // kg gain per day
      productionUnit: "kg daily gain",
      notes: "Target 0.8-1.2 kg daily weight gain"
    },
  ],

  // GOATS - Dairy/Meat
  "Goat": [
    {
      type: "MILK",
      name: "Peak Lactation",
      description: "First 2 months after kidding",
      daysFromAcquisition: 0,
      expectedDailyProduction: 2.5, // liters per day for dairy goats
      productionUnit: "liters per goat",
      expectedRevenuePerUnit: 12, // GHS per liter (goat milk premium)
      durationDays: 60,
      notes: "Peak milk production for dairy breeds"
    },
    {
      type: "MILK",
      name: "Mid Lactation",
      description: "Months 2-5 after kidding",
      daysFromAcquisition: 60,
      expectedDailyProduction: 1.5,
      productionUnit: "liters per goat",
      expectedRevenuePerUnit: 12,
      durationDays: 90,
      notes: "Sustained production phase"
    },
    {
      type: "WEIGHT",
      name: "Growth Monitoring",
      description: "Monthly weight check for meat goats",
      daysFromAcquisition: 30,
      expectedDailyProduction: 0.1, // kg gain per day
      productionUnit: "kg daily gain",
      notes: "Target 100g daily weight gain"
    },
  ],

  // SHEEP
  "Sheep": [
    {
      type: "MILK",
      name: "Lactation Period",
      description: "Milk production for dairy sheep",
      daysFromAcquisition: 0,
      expectedDailyProduction: 1.5,
      productionUnit: "liters per ewe",
      expectedRevenuePerUnit: 15,
      durationDays: 150,
      notes: "For dairy sheep breeds"
    },
    {
      type: "WEIGHT",
      name: "Lamb Growth",
      description: "Weight monitoring for meat production",
      daysFromAcquisition: 30,
      expectedDailyProduction: 0.25, // kg gain per day
      productionUnit: "kg daily gain",
      notes: "Target 200-300g daily gain for lambs"
    },
    {
      type: "OTHER",
      name: "Wool Production",
      description: "Annual wool shearing",
      daysFromAcquisition: 180,
      expectedDailyProduction: 4, // kg per year
      productionUnit: "kg wool per sheep",
      expectedRevenuePerUnit: 20,
      notes: "Annual shearing - varies by breed"
    },
  ],

  // PIGS
  "Pig": [
    {
      type: "WEIGHT",
      name: "Weaner Stage",
      description: "Post-weaning growth (8-12 weeks)",
      daysFromAcquisition: 0,
      expectedDailyProduction: 0.4, // kg gain per day
      productionUnit: "kg daily gain",
      durationDays: 28,
      notes: "Target 400g daily gain"
    },
    {
      type: "WEIGHT",
      name: "Grower Stage",
      description: "Growing phase (12-20 weeks)",
      daysFromAcquisition: 28,
      expectedDailyProduction: 0.7,
      productionUnit: "kg daily gain",
      durationDays: 56,
      notes: "Target 700g daily gain"
    },
    {
      type: "WEIGHT",
      name: "Finisher Stage",
      description: "Finishing phase (20-24 weeks)",
      daysFromAcquisition: 84,
      expectedDailyProduction: 0.9,
      productionUnit: "kg daily gain",
      durationDays: 28,
      notes: "Target 900g daily gain"
    },
    {
      type: "WEIGHT",
      name: "Market Weight",
      description: "Ready for market (90-110 kg)",
      daysFromAcquisition: 112,
      expectedDailyProduction: 100, // target weight in kg
      productionUnit: "kg live weight",
      expectedRevenuePerUnit: 25, // GHS per kg
      notes: "Target 90-110kg live weight for market"
    },
  ],

  // GUINEA FOWL
  "Guinea Fowl": [
    {
      type: "EGGS",
      name: "Egg Production Start",
      description: "Guinea fowl begin laying (26-28 weeks)",
      daysFromAcquisition: 182, // ~26 weeks
      expectedDailyProduction: 0.4, // 40% lay rate
      productionUnit: "eggs per bird",
      expectedRevenuePerUnit: 3, // Premium eggs
      durationDays: 180,
      notes: "Seasonal layers - peak in rainy season"
    },
    {
      type: "WEIGHT",
      name: "Market Weight",
      description: "Ready for meat market (14-16 weeks)",
      daysFromAcquisition: 98, // ~14 weeks
      expectedDailyProduction: 1.5,
      productionUnit: "kg per bird",
      expectedRevenuePerUnit: 45, // GHS per kg
      notes: "Target 1.3-1.8kg live weight"
    },
  ],

  // TURKEY
  "Turkey": [
    {
      type: "WEIGHT",
      name: "Week 8 Weight",
      description: "Early growth monitoring",
      daysFromAcquisition: 56,
      expectedDailyProduction: 2.5,
      productionUnit: "kg per bird",
      notes: "Target 2.5kg at 8 weeks"
    },
    {
      type: "WEIGHT",
      name: "Week 12 Weight",
      description: "Mid-growth monitoring",
      daysFromAcquisition: 84,
      expectedDailyProduction: 5,
      productionUnit: "kg per bird",
      notes: "Target 5kg at 12 weeks"
    },
    {
      type: "WEIGHT",
      name: "Market Weight (Hens)",
      description: "Female turkeys ready for market",
      daysFromAcquisition: 112, // 16 weeks
      expectedDailyProduction: 7,
      productionUnit: "kg per bird",
      expectedRevenuePerUnit: 40,
      notes: "Hens: 6-8kg live weight"
    },
    {
      type: "WEIGHT",
      name: "Market Weight (Toms)",
      description: "Male turkeys ready for market",
      daysFromAcquisition: 140, // 20 weeks
      expectedDailyProduction: 12,
      productionUnit: "kg per bird",
      expectedRevenuePerUnit: 40,
      notes: "Toms: 10-15kg live weight"
    },
  ],

  // DUCK
  "Duck": [
    {
      type: "EGGS",
      name: "Egg Production",
      description: "Duck egg production (20+ weeks)",
      daysFromAcquisition: 140, // ~20 weeks
      expectedDailyProduction: 0.7, // 70% lay rate
      productionUnit: "eggs per bird",
      expectedRevenuePerUnit: 2.5,
      durationDays: 365,
      notes: "Ducks can lay 200-300 eggs per year"
    },
    {
      type: "WEIGHT",
      name: "Market Weight",
      description: "Ready for meat market (7-8 weeks)",
      daysFromAcquisition: 49, // ~7 weeks
      expectedDailyProduction: 2.5,
      productionUnit: "kg per bird",
      expectedRevenuePerUnit: 35,
      notes: "Target 2.5-3kg live weight"
    },
  ],

  // RABBIT
  "Rabbit": [
    {
      type: "WEIGHT",
      name: "Weaning Weight",
      description: "Weight at weaning (8 weeks)",
      daysFromAcquisition: 56,
      expectedDailyProduction: 1.5,
      productionUnit: "kg per rabbit",
      notes: "Target 1.5kg at weaning"
    },
    {
      type: "WEIGHT",
      name: "Market Weight",
      description: "Ready for market (12-14 weeks)",
      daysFromAcquisition: 84, // ~12 weeks
      expectedDailyProduction: 2.5,
      productionUnit: "kg per rabbit",
      expectedRevenuePerUnit: 50, // GHS per kg
      notes: "Target 2-3kg live weight"
    },
    {
      type: "OTHER",
      name: "Breeding Cycle",
      description: "Does can breed every 6-8 weeks",
      daysFromAcquisition: 120, // Breeding age
      expectedDailyProduction: 6, // kits per litter
      productionUnit: "kits per litter",
      notes: "4-5 litters per year possible"
    },
  ],
};

// Default production schedule for unknown animal types
export const DEFAULT_PRODUCTION_SCHEDULE: ProductionMilestone[] = [
  {
    type: "WEIGHT",
    name: "Initial Weight Recording",
    description: "Record baseline weight at acquisition",
    daysFromAcquisition: 0,
    productionUnit: "kg",
    notes: "Record initial weight for growth tracking"
  },
  {
    type: "WEIGHT",
    name: "Monthly Weight Check",
    description: "Regular weight monitoring",
    daysFromAcquisition: 30,
    productionUnit: "kg",
    notes: "Monthly weight recording for growth analysis"
  },
];

/**
 * Get production schedule for a specific animal type
 */
export function getProductionSchedule(animalType: string): ProductionMilestone[] {
  // Try exact match first
  if (PRODUCTION_TEMPLATES[animalType]) {
    return PRODUCTION_TEMPLATES[animalType];
  }

  // Try case-insensitive match
  const normalizedType = animalType.toLowerCase();
  for (const [key, schedule] of Object.entries(PRODUCTION_TEMPLATES)) {
    if (key.toLowerCase() === normalizedType) {
      return schedule;
    }
  }

  // Try partial match
  for (const [key, schedule] of Object.entries(PRODUCTION_TEMPLATES)) {
    if (
      normalizedType.includes(key.toLowerCase()) ||
      key.toLowerCase().includes(normalizedType)
    ) {
      return schedule;
    }
  }

  // Return default schedule
  return DEFAULT_PRODUCTION_SCHEDULE;
}

/**
 * Calculate expected production metrics for a livestock entry
 */
export function calculateExpectedProduction(
  animalType: string,
  quantity: number,
  daysFromAcquisition: number
): {
  currentPhase: ProductionMilestone | null;
  expectedDailyOutput: number;
  expectedDailyRevenue: number;
  productionUnit: string;
} {
  const schedule = getProductionSchedule(animalType);
  
  // Find current production phase
  let currentPhase: ProductionMilestone | null = null;
  for (const milestone of schedule) {
    const phaseEnd = milestone.durationDays 
      ? milestone.daysFromAcquisition + milestone.durationDays 
      : milestone.daysFromAcquisition + 30; // Default 30 days if no duration
    
    if (daysFromAcquisition >= milestone.daysFromAcquisition && daysFromAcquisition < phaseEnd) {
      currentPhase = milestone;
      break;
    }
  }

  if (!currentPhase) {
    return {
      currentPhase: null,
      expectedDailyOutput: 0,
      expectedDailyRevenue: 0,
      productionUnit: "units",
    };
  }

  const expectedDailyOutput = (currentPhase.expectedDailyProduction || 0) * quantity;
  const expectedDailyRevenue = expectedDailyOutput * (currentPhase.expectedRevenuePerUnit || 0);

  return {
    currentPhase,
    expectedDailyOutput,
    expectedDailyRevenue,
    productionUnit: currentPhase.productionUnit || "units",
  };
}
