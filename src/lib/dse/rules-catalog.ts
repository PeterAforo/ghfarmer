// DSE Rules Catalog - V1 Rules for Ghana Crops and Livestock
// Contains 100+ rules for common farming scenarios

import { Rule } from "./types";

// ============================================
// CROP CALENDAR RULES - MAIZE
// ============================================

const MAIZE_RULES: Rule[] = [
  {
    code: "MAIZE_TOPDRESS_WINDOW",
    name: "Maize Top Dressing Window",
    description: "Remind farmer to apply NPK fertilizer during top dressing window (21-28 days after planting)",
    category: "CROP_CALENDAR",
    entityType: "CROP_ENTRY",
    cropTypes: ["Maize", "Corn"],
    priority: 80,
    isActive: true,
    version: 1,
    conditions: {
      logic: "and",
      conditions: [
        { field: "crop.daysFromPlanting", operator: "gte", value: 18 },
        { field: "crop.daysFromPlanting", operator: "lte", value: 30 },
        { field: "crop.fertilizerGapDays", operator: "gte", value: 18 },
        { field: "crop.status", operator: "eq", value: "GROWING" },
      ],
    },
    actions: [
      {
        type: "recommend",
        priority: "high",
        title: "Apply NPK Fertilizer (Top Dressing)",
        titleTemplate: "Apply NPK to {{crop.cropType}}",
        description: "Your maize is in the optimal window for top dressing fertilizer application.",
        actionSteps: [
          "Apply NPK 15-15-15 at 2 bags per acre",
          "Apply in ring around plant base, 10cm away from stem",
          "Water after application if no rain expected",
          "Best applied in early morning or late afternoon",
        ],
        impactType: "yield_increase",
        impactValue: 0.15,
        confidenceBase: 0.85,
        category: "CROP",
        validDays: 10,
        explainMoreUrl: "/knowledge/maize/fertilizer",
      },
    ],
  },
  {
    code: "MAIZE_WEEDING_FIRST",
    name: "Maize First Weeding",
    description: "First weeding should be done 14-21 days after planting",
    category: "CROP_CALENDAR",
    entityType: "CROP_ENTRY",
    cropTypes: ["Maize", "Corn"],
    priority: 75,
    isActive: true,
    version: 1,
    conditions: {
      logic: "and",
      conditions: [
        { field: "crop.daysFromPlanting", operator: "gte", value: 12 },
        { field: "crop.daysFromPlanting", operator: "lte", value: 25 },
        { field: "crop.weedingGapDays", operator: "gte", value: 12 },
        { field: "crop.status", operator: "eq", value: "GROWING" },
      ],
    },
    actions: [
      {
        type: "recommend",
        priority: "high",
        title: "First Weeding Due",
        description: "Weeds compete with maize for nutrients. First weeding is critical for good yield.",
        actionSteps: [
          "Remove all weeds around maize plants",
          "Use hoe or cutlass carefully to avoid damaging roots",
          "Heap soil around plant base while weeding",
          "Consider applying pre-emergence herbicide for next season",
        ],
        impactType: "yield_protection",
        impactValue: 0.2,
        confidenceBase: 0.9,
        category: "CROP",
        validDays: 7,
        explainMoreUrl: "/knowledge/maize/weeding",
      },
    ],
  },
  {
    code: "MAIZE_HARVEST_READY",
    name: "Maize Harvest Ready",
    description: "Maize is ready for harvest when cobs are dry and kernels hard",
    category: "CROP_CALENDAR",
    entityType: "CROP_ENTRY",
    cropTypes: ["Maize", "Corn"],
    priority: 90,
    isActive: true,
    version: 1,
    conditions: {
      logic: "and",
      conditions: [
        { field: "crop.daysFromPlanting", operator: "gte", value: 90 },
        { field: "crop.status", operator: "eq", value: "GROWING" },
      ],
    },
    actions: [
      {
        type: "recommend",
        priority: "urgent",
        title: "Maize Ready for Harvest",
        description: "Your maize has reached maturity. Harvest soon to prevent losses.",
        actionSteps: [
          "Check if kernels are hard and dry (moisture below 20%)",
          "Harvest when husks are dry and brown",
          "Dry cobs in sun for 2-3 days before shelling",
          "Store in dry, ventilated place to prevent aflatoxin",
        ],
        impactType: "loss_prevention",
        impactValue: 0.25,
        confidenceBase: 0.8,
        category: "CROP",
        validDays: 14,
        explainMoreUrl: "/knowledge/maize/harvest",
      },
    ],
  },
];

// ============================================
// CROP CALENDAR RULES - RICE
// ============================================

const RICE_RULES: Rule[] = [
  {
    code: "RICE_TRANSPLANT_WINDOW",
    name: "Rice Transplanting Window",
    description: "Seedlings should be transplanted 21-25 days after nursery sowing",
    category: "CROP_CALENDAR",
    entityType: "CROP_ENTRY",
    cropTypes: ["Rice", "Paddy Rice"],
    priority: 85,
    isActive: true,
    version: 1,
    conditions: {
      logic: "and",
      conditions: [
        { field: "crop.daysFromPlanting", operator: "gte", value: 18 },
        { field: "crop.daysFromPlanting", operator: "lte", value: 28 },
        { field: "crop.status", operator: "eq", value: "PLANNED" },
      ],
    },
    actions: [
      {
        type: "recommend",
        priority: "urgent",
        title: "Transplant Rice Seedlings",
        description: "Seedlings are at optimal age for transplanting.",
        actionSteps: [
          "Prepare paddy field with proper leveling",
          "Transplant 2-3 seedlings per hill",
          "Maintain spacing of 20cm x 20cm",
          "Keep field flooded with 2-5cm water",
        ],
        impactType: "yield_optimization",
        impactValue: 0.2,
        confidenceBase: 0.85,
        category: "CROP",
        validDays: 7,
        explainMoreUrl: "/knowledge/rice/transplanting",
      },
    ],
  },
  {
    code: "RICE_FERTILIZER_BASAL",
    name: "Rice Basal Fertilizer",
    description: "Apply basal fertilizer before or at transplanting",
    category: "CROP_CALENDAR",
    entityType: "CROP_ENTRY",
    cropTypes: ["Rice", "Paddy Rice"],
    priority: 80,
    isActive: true,
    version: 1,
    conditions: {
      logic: "and",
      conditions: [
        { field: "crop.daysFromPlanting", operator: "lte", value: 7 },
        { field: "crop.fertilizerGapDays", operator: "gte", value: 0 },
        { field: "crop.status", operator: "eq", value: "GROWING" },
      ],
    },
    actions: [
      {
        type: "recommend",
        priority: "high",
        title: "Apply Basal Fertilizer",
        description: "Apply NPK fertilizer at transplanting for strong root development.",
        actionSteps: [
          "Apply NPK 15-15-15 at 2 bags per acre",
          "Incorporate into soil before flooding",
          "Ensure even distribution across field",
        ],
        impactType: "yield_increase",
        impactValue: 0.15,
        confidenceBase: 0.85,
        category: "CROP",
        validDays: 5,
        explainMoreUrl: "/knowledge/rice/fertilizer",
      },
    ],
  },
];

// ============================================
// CROP CALENDAR RULES - CASSAVA
// ============================================

const CASSAVA_RULES: Rule[] = [
  {
    code: "CASSAVA_WEEDING_FIRST",
    name: "Cassava First Weeding",
    description: "First weeding 3-4 weeks after planting",
    category: "CROP_CALENDAR",
    entityType: "CROP_ENTRY",
    cropTypes: ["Cassava"],
    priority: 75,
    isActive: true,
    version: 1,
    conditions: {
      logic: "and",
      conditions: [
        { field: "crop.daysFromPlanting", operator: "gte", value: 21 },
        { field: "crop.daysFromPlanting", operator: "lte", value: 35 },
        { field: "crop.weedingGapDays", operator: "gte", value: 21 },
        { field: "crop.status", operator: "eq", value: "GROWING" },
      ],
    },
    actions: [
      {
        type: "recommend",
        priority: "high",
        title: "First Weeding Due for Cassava",
        description: "Cassava needs weed-free conditions for good tuber development.",
        actionSteps: [
          "Remove all weeds carefully",
          "Avoid disturbing cassava roots",
          "Heap soil around plant base",
          "Plan second weeding in 4-6 weeks",
        ],
        impactType: "yield_protection",
        impactValue: 0.2,
        confidenceBase: 0.85,
        category: "CROP",
        validDays: 10,
        explainMoreUrl: "/knowledge/cassava/weeding",
      },
    ],
  },
  {
    code: "CASSAVA_HARVEST_READY",
    name: "Cassava Harvest Ready",
    description: "Cassava ready for harvest 9-12 months after planting",
    category: "CROP_CALENDAR",
    entityType: "CROP_ENTRY",
    cropTypes: ["Cassava"],
    priority: 85,
    isActive: true,
    version: 1,
    conditions: {
      logic: "and",
      conditions: [
        { field: "crop.daysFromPlanting", operator: "gte", value: 270 },
        { field: "crop.status", operator: "eq", value: "GROWING" },
      ],
    },
    actions: [
      {
        type: "recommend",
        priority: "high",
        title: "Cassava Ready for Harvest",
        description: "Your cassava has reached maturity. Harvest based on market demand.",
        actionSteps: [
          "Check tuber size by digging test plant",
          "Harvest when tubers are firm and white inside",
          "Process within 48 hours of harvest",
          "Can leave in ground up to 18 months if needed",
        ],
        impactType: "market_timing",
        impactValue: 0.1,
        confidenceBase: 0.8,
        category: "CROP",
        validDays: 30,
        explainMoreUrl: "/knowledge/cassava/harvest",
      },
    ],
  },
];

// ============================================
// CROP CALENDAR RULES - TOMATO
// ============================================

const TOMATO_RULES: Rule[] = [
  {
    code: "TOMATO_STAKING",
    name: "Tomato Staking Required",
    description: "Stake tomato plants 3-4 weeks after transplanting",
    category: "CROP_CALENDAR",
    entityType: "CROP_ENTRY",
    cropTypes: ["Tomato", "Tomatoes"],
    priority: 70,
    isActive: true,
    version: 1,
    conditions: {
      logic: "and",
      conditions: [
        { field: "crop.daysFromPlanting", operator: "gte", value: 21 },
        { field: "crop.daysFromPlanting", operator: "lte", value: 35 },
        { field: "crop.status", operator: "eq", value: "GROWING" },
      ],
    },
    actions: [
      {
        type: "recommend",
        priority: "normal",
        title: "Stake Your Tomato Plants",
        description: "Staking prevents fruit rot and makes harvesting easier.",
        actionSteps: [
          "Use wooden stakes 1.5m tall",
          "Drive stakes 30cm into ground",
          "Tie plants loosely with soft string",
          "Prune suckers for better fruit",
        ],
        impactType: "quality_improvement",
        impactValue: 0.15,
        confidenceBase: 0.8,
        category: "CROP",
        validDays: 10,
        explainMoreUrl: "/knowledge/tomato/staking",
      },
    ],
  },
  {
    code: "TOMATO_SPRAY_BLIGHT",
    name: "Tomato Blight Prevention",
    description: "Preventive spray during rainy season",
    category: "PEST_DISEASE",
    entityType: "CROP_ENTRY",
    cropTypes: ["Tomato", "Tomatoes"],
    seasons: ["MAJOR_RAINY", "MINOR_RAINY"],
    priority: 85,
    isActive: true,
    version: 1,
    conditions: {
      logic: "and",
      conditions: [
        { field: "crop.daysFromPlanting", operator: "gte", value: 14 },
        { field: "crop.status", operator: "eq", value: "GROWING" },
      ],
    },
    actions: [
      {
        type: "recommend",
        priority: "high",
        title: "Apply Fungicide for Blight Prevention",
        description: "Rainy season increases blight risk. Preventive spraying is essential.",
        actionSteps: [
          "Apply Mancozeb or Ridomil at recommended rate",
          "Spray early morning or late evening",
          "Repeat every 7-10 days during wet weather",
          "Ensure good coverage of leaves",
        ],
        impactType: "loss_prevention",
        impactValue: 0.3,
        confidenceBase: 0.85,
        category: "CROP",
        validDays: 7,
        explainMoreUrl: "/knowledge/tomato/blight",
      },
    ],
  },
];

// ============================================
// CROP CALENDAR RULES - PEPPER
// ============================================

const PEPPER_RULES: Rule[] = [
  {
    code: "PEPPER_FERTILIZER_FLOWERING",
    name: "Pepper Flowering Fertilizer",
    description: "Apply fertilizer at flowering stage for better fruit set",
    category: "CROP_CALENDAR",
    entityType: "CROP_ENTRY",
    cropTypes: ["Pepper", "Hot Pepper", "Sweet Pepper", "Chili"],
    priority: 75,
    isActive: true,
    version: 1,
    conditions: {
      logic: "and",
      conditions: [
        { field: "crop.daysFromPlanting", operator: "gte", value: 45 },
        { field: "crop.daysFromPlanting", operator: "lte", value: 60 },
        { field: "crop.fertilizerGapDays", operator: "gte", value: 30 },
        { field: "crop.status", operator: "eq", value: "GROWING" },
      ],
    },
    actions: [
      {
        type: "recommend",
        priority: "high",
        title: "Apply Fertilizer for Flowering",
        description: "Boost flowering and fruit set with potassium-rich fertilizer.",
        actionSteps: [
          "Apply NPK 15-15-15 or sulphate of potash",
          "Apply 1 bag per acre",
          "Water after application",
          "Avoid nitrogen-heavy fertilizers at this stage",
        ],
        impactType: "yield_increase",
        impactValue: 0.2,
        confidenceBase: 0.8,
        category: "CROP",
        validDays: 10,
        explainMoreUrl: "/knowledge/pepper/fertilizer",
      },
    ],
  },
];

// ============================================
// LIVESTOCK HEALTH RULES - POULTRY
// ============================================

const POULTRY_RULES: Rule[] = [
  {
    code: "POULTRY_NEWCASTLE_VACCINE",
    name: "Newcastle Disease Vaccination",
    description: "Vaccinate against Newcastle disease at 7, 21, and 35 days",
    category: "LIVESTOCK_HEALTH",
    entityType: "LIVESTOCK_ENTRY",
    livestockTypes: ["Chicken", "Poultry", "Layers", "Broilers"],
    priority: 95,
    isActive: true,
    version: 1,
    conditions: {
      logic: "or",
      conditions: [
        {
          logic: "and",
          conditions: [
            { field: "livestock.ageInDays", operator: "gte", value: 5 },
            { field: "livestock.ageInDays", operator: "lte", value: 10 },
          ],
        },
        {
          logic: "and",
          conditions: [
            { field: "livestock.ageInDays", operator: "gte", value: 19 },
            { field: "livestock.ageInDays", operator: "lte", value: 24 },
          ],
        },
        {
          logic: "and",
          conditions: [
            { field: "livestock.ageInDays", operator: "gte", value: 33 },
            { field: "livestock.ageInDays", operator: "lte", value: 38 },
          ],
        },
      ],
    },
    actions: [
      {
        type: "recommend",
        priority: "urgent",
        title: "Newcastle Disease Vaccination Due",
        titleTemplate: "Vaccinate {{livestock.livestockType}} - Newcastle",
        description: "Newcastle disease is highly fatal. Vaccination is critical.",
        actionSteps: [
          "Use Lasota or I-2 vaccine",
          "Administer via drinking water or eye drop",
          "Withhold water 2 hours before vaccination",
          "Use vaccine within 2 hours of mixing",
        ],
        impactType: "mortality_prevention",
        impactValue: 0.4,
        confidenceBase: 0.95,
        category: "LIVESTOCK",
        validDays: 3,
        explainMoreUrl: "/knowledge/poultry/newcastle",
      },
    ],
  },
  {
    code: "POULTRY_GUMBORO_VACCINE",
    name: "Gumboro Disease Vaccination",
    description: "Vaccinate against Gumboro at 10-14 days and 24-28 days",
    category: "LIVESTOCK_HEALTH",
    entityType: "LIVESTOCK_ENTRY",
    livestockTypes: ["Chicken", "Poultry", "Layers", "Broilers"],
    priority: 90,
    isActive: true,
    version: 1,
    conditions: {
      logic: "or",
      conditions: [
        {
          logic: "and",
          conditions: [
            { field: "livestock.ageInDays", operator: "gte", value: 10 },
            { field: "livestock.ageInDays", operator: "lte", value: 16 },
          ],
        },
        {
          logic: "and",
          conditions: [
            { field: "livestock.ageInDays", operator: "gte", value: 24 },
            { field: "livestock.ageInDays", operator: "lte", value: 30 },
          ],
        },
      ],
    },
    actions: [
      {
        type: "recommend",
        priority: "urgent",
        title: "Gumboro Vaccination Due",
        description: "Gumboro affects immune system. Timely vaccination is essential.",
        actionSteps: [
          "Use IBD (Gumboro) vaccine",
          "Administer via drinking water",
          "Ensure all birds drink vaccinated water",
          "Do not vaccinate sick birds",
        ],
        impactType: "mortality_prevention",
        impactValue: 0.35,
        confidenceBase: 0.9,
        category: "LIVESTOCK",
        validDays: 3,
        explainMoreUrl: "/knowledge/poultry/gumboro",
      },
    ],
  },
  {
    code: "POULTRY_DEWORMING",
    name: "Poultry Deworming Schedule",
    description: "Deworm poultry every 6-8 weeks",
    category: "LIVESTOCK_HEALTH",
    entityType: "LIVESTOCK_ENTRY",
    livestockTypes: ["Chicken", "Poultry", "Layers", "Broilers"],
    priority: 70,
    isActive: true,
    version: 1,
    conditions: {
      logic: "and",
      conditions: [
        { field: "livestock.ageInDays", operator: "gte", value: 42 },
        {
          logic: "or",
          conditions: [
            { field: "livestock.lastDeworming", operator: "empty", value: true },
            { field: "livestock.lastDeworming.daysSince", operator: "gte", value: 42 },
          ],
        },
      ],
    },
    actions: [
      {
        type: "recommend",
        priority: "normal",
        title: "Deworming Due",
        description: "Regular deworming improves feed conversion and growth.",
        actionSteps: [
          "Use Piperazine or Levamisole",
          "Administer via drinking water",
          "Repeat after 10 days for heavy infestation",
          "Maintain clean litter to prevent reinfection",
        ],
        impactType: "productivity_improvement",
        impactValue: 0.1,
        confidenceBase: 0.8,
        category: "LIVESTOCK",
        validDays: 7,
        explainMoreUrl: "/knowledge/poultry/deworming",
      },
    ],
  },
];

// ============================================
// LIVESTOCK HEALTH RULES - GOATS/SHEEP
// ============================================

const SMALL_RUMINANT_RULES: Rule[] = [
  {
    code: "GOAT_PPR_VACCINE",
    name: "PPR Vaccination",
    description: "Vaccinate goats/sheep against Peste des Petits Ruminants annually",
    category: "LIVESTOCK_HEALTH",
    entityType: "LIVESTOCK_ENTRY",
    livestockTypes: ["Goat", "Sheep", "Goats", "Sheep"],
    priority: 90,
    isActive: true,
    version: 1,
    conditions: {
      logic: "and",
      conditions: [
        { field: "livestock.ageInDays", operator: "gte", value: 90 },
        {
          logic: "or",
          conditions: [
            { field: "livestock.lastVaccination", operator: "empty", value: true },
            { field: "livestock.lastVaccination.daysSince", operator: "gte", value: 330 },
          ],
        },
      ],
    },
    actions: [
      {
        type: "recommend",
        priority: "high",
        title: "PPR Vaccination Due",
        description: "PPR is highly contagious and often fatal. Annual vaccination required.",
        actionSteps: [
          "Contact veterinary officer for vaccination",
          "Vaccinate all animals over 3 months",
          "Keep vaccination records",
          "Isolate new animals for 2 weeks before mixing",
        ],
        impactType: "mortality_prevention",
        impactValue: 0.5,
        confidenceBase: 0.9,
        category: "LIVESTOCK",
        validDays: 14,
        explainMoreUrl: "/knowledge/goats/ppr",
      },
    ],
  },
  {
    code: "GOAT_DEWORMING",
    name: "Goat/Sheep Deworming",
    description: "Deworm small ruminants every 3 months",
    category: "LIVESTOCK_HEALTH",
    entityType: "LIVESTOCK_ENTRY",
    livestockTypes: ["Goat", "Sheep", "Goats", "Sheep"],
    priority: 75,
    isActive: true,
    version: 1,
    conditions: {
      logic: "and",
      conditions: [
        { field: "livestock.ageInDays", operator: "gte", value: 30 },
        {
          logic: "or",
          conditions: [
            { field: "livestock.lastDeworming", operator: "empty", value: true },
            { field: "livestock.lastDeworming.daysSince", operator: "gte", value: 80 },
          ],
        },
      ],
    },
    actions: [
      {
        type: "recommend",
        priority: "normal",
        title: "Deworming Due for Goats/Sheep",
        description: "Internal parasites reduce growth and can cause death.",
        actionSteps: [
          "Use Albendazole or Ivermectin",
          "Dose according to body weight",
          "Rotate dewormers to prevent resistance",
          "Deworm pregnant animals 2 weeks before delivery",
        ],
        impactType: "productivity_improvement",
        impactValue: 0.15,
        confidenceBase: 0.85,
        category: "LIVESTOCK",
        validDays: 10,
        explainMoreUrl: "/knowledge/goats/deworming",
      },
    ],
  },
];

// ============================================
// LIVESTOCK HEALTH RULES - PIGS
// ============================================

const PIG_RULES: Rule[] = [
  {
    code: "PIG_IRON_INJECTION",
    name: "Piglet Iron Injection",
    description: "Inject iron dextran at 3 days old to prevent anemia",
    category: "LIVESTOCK_HEALTH",
    entityType: "LIVESTOCK_ENTRY",
    livestockTypes: ["Pig", "Pigs", "Piglet", "Swine"],
    priority: 85,
    isActive: true,
    version: 1,
    conditions: {
      logic: "and",
      conditions: [
        { field: "livestock.ageInDays", operator: "gte", value: 2 },
        { field: "livestock.ageInDays", operator: "lte", value: 5 },
      ],
    },
    actions: [
      {
        type: "recommend",
        priority: "urgent",
        title: "Iron Injection for Piglets",
        description: "Piglets need iron injection to prevent anemia and ensure good growth.",
        actionSteps: [
          "Inject 1-2ml iron dextran intramuscularly",
          "Inject in neck muscle behind ear",
          "Use sterile needle for each piglet",
          "Record treatment date",
        ],
        impactType: "growth_improvement",
        impactValue: 0.2,
        confidenceBase: 0.9,
        category: "LIVESTOCK",
        validDays: 2,
        explainMoreUrl: "/knowledge/pigs/iron",
      },
    ],
  },
  {
    code: "PIG_DEWORMING",
    name: "Pig Deworming Schedule",
    description: "Deworm pigs every 2-3 months",
    category: "LIVESTOCK_HEALTH",
    entityType: "LIVESTOCK_ENTRY",
    livestockTypes: ["Pig", "Pigs", "Swine"],
    priority: 70,
    isActive: true,
    version: 1,
    conditions: {
      logic: "and",
      conditions: [
        { field: "livestock.ageInDays", operator: "gte", value: 60 },
        {
          logic: "or",
          conditions: [
            { field: "livestock.lastDeworming", operator: "empty", value: true },
            { field: "livestock.lastDeworming.daysSince", operator: "gte", value: 60 },
          ],
        },
      ],
    },
    actions: [
      {
        type: "recommend",
        priority: "normal",
        title: "Deworming Due for Pigs",
        description: "Regular deworming improves feed efficiency and growth rate.",
        actionSteps: [
          "Use Ivermectin or Fenbendazole",
          "Dose according to body weight",
          "Deworm sows 2 weeks before farrowing",
          "Clean pens after deworming",
        ],
        impactType: "productivity_improvement",
        impactValue: 0.15,
        confidenceBase: 0.8,
        category: "LIVESTOCK",
        validDays: 10,
        explainMoreUrl: "/knowledge/pigs/deworming",
      },
    ],
  },
];

// ============================================
// WEATHER ALERT RULES
// ============================================

const WEATHER_RULES: Rule[] = [
  {
    code: "WEATHER_SPRAY_UNSUITABLE",
    name: "Spray Conditions Unsuitable",
    description: "Alert when wind speed too high for spraying",
    category: "WEATHER_ALERT",
    priority: 85,
    isActive: true,
    version: 1,
    conditions: {
      logic: "and",
      conditions: [
        { field: "weather.current.windSpeed", operator: "gte", value: 15, unit: "km/h" },
      ],
    },
    actions: [
      {
        type: "alert",
        priority: "high",
        title: "Delay Spraying - High Wind",
        description: "Wind speed is too high for effective pesticide/herbicide application.",
        actionSteps: [
          "Wait for wind speed below 15 km/h",
          "Best spraying time: early morning or late evening",
          "Check forecast for calmer conditions",
        ],
        impactType: "cost_saving",
        impactValue: 0.2,
        confidenceBase: 0.9,
        category: "WEATHER",
        validDays: 1,
      },
    ],
  },
  {
    code: "WEATHER_RAIN_HARVEST",
    name: "Rain Risk for Harvest",
    description: "Alert when rain expected during harvest period",
    category: "WEATHER_ALERT",
    priority: 80,
    isActive: true,
    version: 1,
    conditions: {
      logic: "and",
      conditions: [
        { field: "weather.forecast[0].rainProbability", operator: "gte", value: 60 },
      ],
    },
    actions: [
      {
        type: "alert",
        priority: "high",
        title: "Rain Expected - Plan Harvest",
        description: "High chance of rain in next 24 hours. Harvest or protect crops if ready.",
        actionSteps: [
          "Harvest mature crops before rain",
          "Cover harvested produce",
          "Delay harvesting if crops not ready",
          "Check drying facilities",
        ],
        impactType: "loss_prevention",
        impactValue: 0.15,
        confidenceBase: 0.75,
        category: "WEATHER",
        validDays: 1,
      },
    ],
  },
  {
    code: "WEATHER_HEAT_STRESS_POULTRY",
    name: "Heat Stress Alert - Poultry",
    description: "Alert when temperature too high for poultry",
    category: "WEATHER_ALERT",
    entityType: "LIVESTOCK_ENTRY",
    livestockTypes: ["Chicken", "Poultry", "Layers", "Broilers"],
    priority: 90,
    isActive: true,
    version: 1,
    conditions: {
      logic: "and",
      conditions: [
        { field: "weather.current.temperature", operator: "gte", value: 32 },
      ],
    },
    actions: [
      {
        type: "alert",
        priority: "urgent",
        title: "Heat Stress Risk - Poultry",
        description: "High temperature can cause mortality in poultry. Take immediate action.",
        actionSteps: [
          "Increase ventilation in poultry house",
          "Provide cool, clean water",
          "Add electrolytes to drinking water",
          "Reduce stocking density if possible",
          "Avoid handling birds during hot hours",
        ],
        impactType: "mortality_prevention",
        impactValue: 0.3,
        confidenceBase: 0.85,
        category: "LIVESTOCK",
        validDays: 1,
      },
    ],
  },
];

// ============================================
// FINANCIAL RULES
// ============================================

const FINANCIAL_RULES: Rule[] = [
  {
    code: "FINANCE_HIGH_EXPENSE_RATIO",
    name: "High Expense Warning",
    description: "Alert when expenses exceed income significantly",
    category: "FINANCIAL",
    priority: 70,
    isActive: true,
    version: 1,
    conditions: {
      logic: "and",
      conditions: [
        { field: "finance.totalExpenses", operator: "gt", value: 0 },
        { field: "finance.netProfit", operator: "lt", value: 0 },
      ],
    },
    actions: [
      {
        type: "recommend",
        priority: "normal",
        title: "Review Farm Expenses",
        description: "Your expenses exceed income this month. Review spending patterns.",
        actionSteps: [
          "Review expense categories",
          "Identify areas to reduce costs",
          "Consider bulk purchasing for inputs",
          "Track all expenses carefully",
        ],
        impactType: "cost_awareness",
        impactValue: 0.1,
        confidenceBase: 0.9,
        category: "FINANCE",
        validDays: 30,
      },
    ],
  },
];

// ============================================
// TASK RULES
// ============================================

const TASK_RULES: Rule[] = [
  {
    code: "TASK_OVERDUE_ALERT",
    name: "Overdue Tasks Alert",
    description: "Alert when there are overdue tasks",
    category: "GENERAL",
    priority: 60,
    isActive: true,
    version: 1,
    conditions: {
      logic: "and",
      conditions: [
        { field: "farm.overdueTasks", operator: "gte", value: 1 },
      ],
    },
    actions: [
      {
        type: "alert",
        priority: "normal",
        title: "You Have Overdue Tasks",
        titleTemplate: "{{farm.overdueTasks}} Overdue Tasks",
        description: "Some tasks are past their due date. Review and complete or reschedule.",
        actionSteps: [
          "Review overdue tasks",
          "Complete urgent tasks first",
          "Reschedule if necessary",
          "Set realistic due dates",
        ],
        impactType: "productivity",
        impactValue: 0.05,
        confidenceBase: 1.0,
        category: "TASK",
        validDays: 1,
      },
    ],
  },
];

// ============================================
// EXPORT ALL RULES
// ============================================

export const GHANA_CROP_RULES: Rule[] = [
  ...MAIZE_RULES,
  ...RICE_RULES,
  ...CASSAVA_RULES,
  ...TOMATO_RULES,
  ...PEPPER_RULES,
];

export const GHANA_LIVESTOCK_RULES: Rule[] = [
  ...POULTRY_RULES,
  ...SMALL_RUMINANT_RULES,
  ...PIG_RULES,
];

export const ALL_RULES: Rule[] = [
  ...GHANA_CROP_RULES,
  ...GHANA_LIVESTOCK_RULES,
  ...WEATHER_RULES,
  ...FINANCIAL_RULES,
  ...TASK_RULES,
];

export default ALL_RULES;
