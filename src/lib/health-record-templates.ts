// Health Record Templates for Livestock
// Auto-generates vaccination and deworming schedules when animals are added

export interface HealthRecordTemplate {
  type: "VACCINATION" | "DEWORMING";
  name: string;
  description: string;
  daysFromAcquisition: number; // Days from acquisition date
  repeatIntervalDays?: number; // For recurring treatments
  priority: "LOW" | "MEDIUM" | "HIGH" | "URGENT";
  dosageInfo?: string;
  notes?: string;
}

export interface AnimalHealthSchedule {
  animalType: string;
  records: HealthRecordTemplate[];
}

// Health schedules by animal type
export const HEALTH_RECORD_TEMPLATES: Record<string, HealthRecordTemplate[]> = {
  // POULTRY - Chickens
  "Chicken": [
    // Vaccinations
    {
      type: "VACCINATION",
      name: "Newcastle Disease (First Dose)",
      description: "First Newcastle Disease vaccination - critical for poultry health",
      daysFromAcquisition: 7,
      priority: "URGENT",
      dosageInfo: "Eye drop or drinking water method",
      notes: "Ensure birds are healthy before vaccination"
    },
    {
      type: "VACCINATION",
      name: "Gumboro Disease (IBD)",
      description: "Infectious Bursal Disease vaccination",
      daysFromAcquisition: 14,
      priority: "URGENT",
      dosageInfo: "Drinking water method",
      notes: "Critical for young birds"
    },
    {
      type: "VACCINATION",
      name: "Newcastle Disease (Booster)",
      description: "Newcastle Disease booster vaccination",
      daysFromAcquisition: 21,
      priority: "HIGH",
      dosageInfo: "Eye drop or drinking water method"
    },
    {
      type: "VACCINATION",
      name: "Fowl Pox",
      description: "Fowl Pox vaccination - wing web method",
      daysFromAcquisition: 28,
      priority: "HIGH",
      dosageInfo: "Wing web scarification",
      notes: "Check for take after 7-10 days"
    },
    {
      type: "VACCINATION",
      name: "Fowl Typhoid",
      description: "Fowl Typhoid vaccination",
      daysFromAcquisition: 42,
      priority: "MEDIUM",
      dosageInfo: "Subcutaneous injection"
    },
    // Deworming
    {
      type: "DEWORMING",
      name: "First Deworming",
      description: "Initial deworming treatment",
      daysFromAcquisition: 21,
      repeatIntervalDays: 30,
      priority: "MEDIUM",
      dosageInfo: "Piperazine or Levamisole in drinking water"
    },
    {
      type: "DEWORMING",
      name: "Monthly Deworming",
      description: "Regular monthly deworming",
      daysFromAcquisition: 51,
      repeatIntervalDays: 30,
      priority: "MEDIUM",
      dosageInfo: "Rotate dewormers to prevent resistance"
    },
  ],

  // Broilers
  "Broiler": [
    {
      type: "VACCINATION",
      name: "Newcastle Disease (Day 7)",
      description: "First Newcastle Disease vaccination",
      daysFromAcquisition: 7,
      priority: "URGENT",
      dosageInfo: "Eye drop or drinking water"
    },
    {
      type: "VACCINATION",
      name: "Gumboro Disease",
      description: "IBD vaccination",
      daysFromAcquisition: 14,
      priority: "URGENT",
      dosageInfo: "Drinking water method"
    },
    {
      type: "VACCINATION",
      name: "Newcastle Booster",
      description: "Newcastle Disease booster",
      daysFromAcquisition: 21,
      priority: "HIGH",
      dosageInfo: "Drinking water method"
    },
    {
      type: "DEWORMING",
      name: "Pre-Market Deworming",
      description: "Deworming before market age",
      daysFromAcquisition: 28,
      priority: "MEDIUM",
      dosageInfo: "Use approved dewormer with short withdrawal period"
    },
  ],

  // Layers
  "Layer": [
    {
      type: "VACCINATION",
      name: "Newcastle Disease (Day 7)",
      description: "First Newcastle vaccination",
      daysFromAcquisition: 7,
      priority: "URGENT",
      dosageInfo: "Eye drop method"
    },
    {
      type: "VACCINATION",
      name: "Gumboro Disease",
      description: "IBD vaccination",
      daysFromAcquisition: 14,
      priority: "URGENT",
      dosageInfo: "Drinking water"
    },
    {
      type: "VACCINATION",
      name: "Newcastle Booster",
      description: "Newcastle booster",
      daysFromAcquisition: 21,
      priority: "HIGH"
    },
    {
      type: "VACCINATION",
      name: "Fowl Pox",
      description: "Fowl Pox vaccination",
      daysFromAcquisition: 35,
      priority: "HIGH",
      dosageInfo: "Wing web method"
    },
    {
      type: "VACCINATION",
      name: "Newcastle (Pre-Lay)",
      description: "Newcastle vaccination before point of lay",
      daysFromAcquisition: 112,
      repeatIntervalDays: 90,
      priority: "HIGH",
      notes: "Repeat every 3 months during production"
    },
    {
      type: "DEWORMING",
      name: "Monthly Deworming",
      description: "Regular deworming schedule",
      daysFromAcquisition: 30,
      repeatIntervalDays: 30,
      priority: "MEDIUM",
      dosageInfo: "Use layer-safe dewormers"
    },
  ],

  // CATTLE
  "Cattle": [
    {
      type: "VACCINATION",
      name: "Foot and Mouth Disease (FMD)",
      description: "FMD vaccination - mandatory in endemic areas",
      daysFromAcquisition: 14,
      repeatIntervalDays: 180,
      priority: "URGENT",
      dosageInfo: "Intramuscular injection",
      notes: "Repeat every 6 months"
    },
    {
      type: "VACCINATION",
      name: "Anthrax",
      description: "Anthrax vaccination",
      daysFromAcquisition: 30,
      repeatIntervalDays: 365,
      priority: "URGENT",
      dosageInfo: "Subcutaneous injection",
      notes: "Annual vaccination required"
    },
    {
      type: "VACCINATION",
      name: "Black Quarter (BQ)",
      description: "Blackleg vaccination",
      daysFromAcquisition: 45,
      repeatIntervalDays: 365,
      priority: "HIGH",
      dosageInfo: "Subcutaneous injection"
    },
    {
      type: "VACCINATION",
      name: "Hemorrhagic Septicemia (HS)",
      description: "HS vaccination",
      daysFromAcquisition: 60,
      repeatIntervalDays: 365,
      priority: "HIGH",
      dosageInfo: "Subcutaneous injection"
    },
    {
      type: "VACCINATION",
      name: "Brucellosis",
      description: "Brucellosis vaccination for heifers",
      daysFromAcquisition: 90,
      priority: "HIGH",
      dosageInfo: "Single dose for female calves 3-8 months",
      notes: "One-time vaccination for heifers only"
    },
    {
      type: "DEWORMING",
      name: "Quarterly Deworming",
      description: "Regular deworming treatment",
      daysFromAcquisition: 30,
      repeatIntervalDays: 90,
      priority: "HIGH",
      dosageInfo: "Ivermectin or Albendazole based on weight"
    },
  ],

  // GOATS
  "Goat": [
    {
      type: "VACCINATION",
      name: "PPR (Peste des Petits Ruminants)",
      description: "PPR vaccination - essential for goats",
      daysFromAcquisition: 14,
      repeatIntervalDays: 365,
      priority: "URGENT",
      dosageInfo: "Subcutaneous injection",
      notes: "Annual vaccination"
    },
    {
      type: "VACCINATION",
      name: "Goat Pox",
      description: "Goat Pox vaccination",
      daysFromAcquisition: 30,
      repeatIntervalDays: 365,
      priority: "HIGH",
      dosageInfo: "Subcutaneous injection"
    },
    {
      type: "VACCINATION",
      name: "Enterotoxemia",
      description: "Clostridial vaccination",
      daysFromAcquisition: 45,
      repeatIntervalDays: 180,
      priority: "HIGH",
      dosageInfo: "Subcutaneous injection",
      notes: "Repeat every 6 months"
    },
    {
      type: "VACCINATION",
      name: "Foot Rot",
      description: "Foot rot vaccination if endemic",
      daysFromAcquisition: 60,
      repeatIntervalDays: 180,
      priority: "MEDIUM",
      dosageInfo: "Subcutaneous injection"
    },
    {
      type: "DEWORMING",
      name: "First Deworming",
      description: "Initial deworming after acquisition",
      daysFromAcquisition: 14,
      priority: "HIGH",
      dosageInfo: "Albendazole or Ivermectin"
    },
    {
      type: "DEWORMING",
      name: "Quarterly Deworming",
      description: "Regular deworming schedule",
      daysFromAcquisition: 90,
      repeatIntervalDays: 90,
      priority: "HIGH",
      dosageInfo: "Rotate dewormers"
    },
  ],

  // SHEEP
  "Sheep": [
    {
      type: "VACCINATION",
      name: "PPR",
      description: "Peste des Petits Ruminants vaccination",
      daysFromAcquisition: 14,
      repeatIntervalDays: 365,
      priority: "URGENT",
      dosageInfo: "Subcutaneous injection"
    },
    {
      type: "VACCINATION",
      name: "Sheep Pox",
      description: "Sheep Pox vaccination",
      daysFromAcquisition: 30,
      repeatIntervalDays: 365,
      priority: "HIGH",
      dosageInfo: "Subcutaneous injection"
    },
    {
      type: "VACCINATION",
      name: "Enterotoxemia",
      description: "Clostridial diseases vaccination",
      daysFromAcquisition: 45,
      repeatIntervalDays: 180,
      priority: "HIGH",
      dosageInfo: "Subcutaneous injection"
    },
    {
      type: "VACCINATION",
      name: "Foot Rot",
      description: "Foot rot prevention",
      daysFromAcquisition: 60,
      repeatIntervalDays: 180,
      priority: "MEDIUM"
    },
    {
      type: "DEWORMING",
      name: "Initial Deworming",
      description: "First deworming treatment",
      daysFromAcquisition: 14,
      priority: "HIGH",
      dosageInfo: "Albendazole or Fenbendazole"
    },
    {
      type: "DEWORMING",
      name: "Quarterly Deworming",
      description: "Regular deworming",
      daysFromAcquisition: 90,
      repeatIntervalDays: 90,
      priority: "HIGH"
    },
  ],

  // PIGS
  "Pig": [
    {
      type: "VACCINATION",
      name: "African Swine Fever Awareness",
      description: "No vaccine available - focus on biosecurity",
      daysFromAcquisition: 1,
      priority: "URGENT",
      notes: "Implement strict biosecurity measures"
    },
    {
      type: "VACCINATION",
      name: "Classical Swine Fever",
      description: "CSF vaccination if available in region",
      daysFromAcquisition: 21,
      repeatIntervalDays: 180,
      priority: "HIGH",
      dosageInfo: "Intramuscular injection"
    },
    {
      type: "VACCINATION",
      name: "Erysipelas",
      description: "Swine Erysipelas vaccination",
      daysFromAcquisition: 56,
      repeatIntervalDays: 180,
      priority: "HIGH",
      dosageInfo: "Intramuscular injection"
    },
    {
      type: "VACCINATION",
      name: "Porcine Parvovirus",
      description: "PPV vaccination for breeding stock",
      daysFromAcquisition: 120,
      repeatIntervalDays: 180,
      priority: "MEDIUM",
      notes: "Important for breeding sows"
    },
    {
      type: "DEWORMING",
      name: "Initial Deworming",
      description: "First deworming treatment",
      daysFromAcquisition: 21,
      priority: "HIGH",
      dosageInfo: "Ivermectin or Fenbendazole"
    },
    {
      type: "DEWORMING",
      name: "Monthly Deworming",
      description: "Regular deworming schedule",
      daysFromAcquisition: 60,
      repeatIntervalDays: 30,
      priority: "MEDIUM"
    },
  ],

  // RABBITS
  "Rabbit": [
    {
      type: "VACCINATION",
      name: "Rabbit Hemorrhagic Disease (RHD)",
      description: "RHD vaccination if available",
      daysFromAcquisition: 42,
      repeatIntervalDays: 365,
      priority: "HIGH",
      dosageInfo: "Subcutaneous injection"
    },
    {
      type: "VACCINATION",
      name: "Myxomatosis",
      description: "Myxomatosis vaccination if endemic",
      daysFromAcquisition: 56,
      repeatIntervalDays: 180,
      priority: "MEDIUM"
    },
    {
      type: "DEWORMING",
      name: "Initial Deworming",
      description: "First deworming",
      daysFromAcquisition: 28,
      priority: "MEDIUM",
      dosageInfo: "Piperazine or Fenbendazole"
    },
    {
      type: "DEWORMING",
      name: "Quarterly Deworming",
      description: "Regular deworming",
      daysFromAcquisition: 90,
      repeatIntervalDays: 90,
      priority: "MEDIUM"
    },
  ],

  // GUINEA FOWL
  "Guinea Fowl": [
    {
      type: "VACCINATION",
      name: "Newcastle Disease",
      description: "Newcastle vaccination",
      daysFromAcquisition: 14,
      repeatIntervalDays: 90,
      priority: "HIGH",
      dosageInfo: "Eye drop or drinking water"
    },
    {
      type: "VACCINATION",
      name: "Fowl Pox",
      description: "Fowl Pox vaccination",
      daysFromAcquisition: 42,
      priority: "MEDIUM",
      dosageInfo: "Wing web method"
    },
    {
      type: "DEWORMING",
      name: "Monthly Deworming",
      description: "Regular deworming",
      daysFromAcquisition: 30,
      repeatIntervalDays: 30,
      priority: "MEDIUM"
    },
  ],

  // TURKEY
  "Turkey": [
    {
      type: "VACCINATION",
      name: "Newcastle Disease",
      description: "Newcastle vaccination",
      daysFromAcquisition: 7,
      priority: "URGENT",
      dosageInfo: "Eye drop method"
    },
    {
      type: "VACCINATION",
      name: "Fowl Cholera",
      description: "Pasteurella vaccination",
      daysFromAcquisition: 56,
      repeatIntervalDays: 180,
      priority: "HIGH"
    },
    {
      type: "VACCINATION",
      name: "Fowl Pox",
      description: "Fowl Pox vaccination",
      daysFromAcquisition: 42,
      priority: "MEDIUM",
      dosageInfo: "Wing web or thigh stick"
    },
    {
      type: "DEWORMING",
      name: "Monthly Deworming",
      description: "Regular deworming",
      daysFromAcquisition: 30,
      repeatIntervalDays: 30,
      priority: "MEDIUM"
    },
  ],

  // DUCK
  "Duck": [
    {
      type: "VACCINATION",
      name: "Duck Plague",
      description: "Duck viral enteritis vaccination",
      daysFromAcquisition: 14,
      repeatIntervalDays: 365,
      priority: "HIGH"
    },
    {
      type: "VACCINATION",
      name: "Duck Cholera",
      description: "Pasteurella vaccination",
      daysFromAcquisition: 42,
      repeatIntervalDays: 180,
      priority: "MEDIUM"
    },
    {
      type: "DEWORMING",
      name: "Monthly Deworming",
      description: "Regular deworming",
      daysFromAcquisition: 30,
      repeatIntervalDays: 30,
      priority: "MEDIUM"
    },
  ],
};

// Default health schedule for unknown animal types
export const DEFAULT_HEALTH_SCHEDULE: HealthRecordTemplate[] = [
  {
    type: "VACCINATION",
    name: "Initial Health Check",
    description: "Veterinary health assessment after acquisition",
    daysFromAcquisition: 7,
    priority: "HIGH",
    notes: "Consult veterinarian for species-specific vaccination schedule"
  },
  {
    type: "DEWORMING",
    name: "Initial Deworming",
    description: "First deworming treatment",
    daysFromAcquisition: 14,
    priority: "MEDIUM",
    notes: "Consult veterinarian for appropriate dewormer"
  },
  {
    type: "DEWORMING",
    name: "Quarterly Deworming",
    description: "Regular deworming schedule",
    daysFromAcquisition: 90,
    repeatIntervalDays: 90,
    priority: "MEDIUM"
  },
];

/**
 * Get health record templates for a specific animal type
 */
export function getHealthSchedule(animalType: string): HealthRecordTemplate[] {
  // Try exact match first
  if (HEALTH_RECORD_TEMPLATES[animalType]) {
    return HEALTH_RECORD_TEMPLATES[animalType];
  }

  // Try case-insensitive match
  const normalizedType = animalType.toLowerCase();
  for (const [key, schedule] of Object.entries(HEALTH_RECORD_TEMPLATES)) {
    if (key.toLowerCase() === normalizedType) {
      return schedule;
    }
  }

  // Try partial match - check if animal type contains the template key
  // e.g., "Layer Chicken" should match "Layer", "Broiler Chicken" should match "Broiler"
  for (const [key, schedule] of Object.entries(HEALTH_RECORD_TEMPLATES)) {
    if (normalizedType.includes(key.toLowerCase())) {
      return schedule;
    }
  }

  // Try reverse partial match - check if template key contains the animal type
  for (const [key, schedule] of Object.entries(HEALTH_RECORD_TEMPLATES)) {
    if (key.toLowerCase().includes(normalizedType)) {
      return schedule;
    }
  }

  // Special mappings for common variations
  const specialMappings: Record<string, string> = {
    "local chicken": "Chicken",
    "broiler chicken": "Broiler",
    "layer chicken": "Layer",
    "guinea fowl": "Guinea Fowl",
    "local goat": "Goat",
    "local sheep": "Sheep",
    "local cattle": "Cattle",
    "local pig": "Pig",
  };

  const mappedType = specialMappings[normalizedType];
  if (mappedType && HEALTH_RECORD_TEMPLATES[mappedType]) {
    return HEALTH_RECORD_TEMPLATES[mappedType];
  }

  // Return default schedule
  return DEFAULT_HEALTH_SCHEDULE;
}
