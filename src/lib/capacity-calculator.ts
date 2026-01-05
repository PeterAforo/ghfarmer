// Capacity Calculator for Plots, Crops, and Livestock

// ============================================
// CROP SPACING DATA (meters)
// ============================================

export interface CropSpacingInfo {
  plantSpacing: number;  // meters between plants in a row
  rowSpacing: number;    // meters between rows
  plantsPerHectare: number;
  description: string;
  daysToMaturity: number; // days from planting to harvest
  plantingMaterial: string; // seeds, seedlings, stumps, suckers, etc.
  seedUnit: string; // kg, pieces, cuttings, suckers, setts, etc.
  seedRatePerHectare: number; // quantity of seeds/planting material per hectare
}

export const CROP_SPACING: Record<string, CropSpacingInfo> = {
  // Cereals - seed rates in kg/ha
  "Maize": { plantSpacing: 0.25, rowSpacing: 0.75, plantsPerHectare: 53333, description: "75cm x 25cm spacing", daysToMaturity: 90, plantingMaterial: "seeds", seedUnit: "kg", seedRatePerHectare: 25 },
  "Corn": { plantSpacing: 0.25, rowSpacing: 0.75, plantsPerHectare: 53333, description: "75cm x 25cm spacing", daysToMaturity: 90, plantingMaterial: "seeds", seedUnit: "kg", seedRatePerHectare: 25 },
  "Rice": { plantSpacing: 0.20, rowSpacing: 0.20, plantsPerHectare: 250000, description: "20cm x 20cm spacing (transplanted)", daysToMaturity: 120, plantingMaterial: "seedlings", seedUnit: "pieces", seedRatePerHectare: 250000 },
  "Millet": { plantSpacing: 0.15, rowSpacing: 0.50, plantsPerHectare: 133333, description: "50cm x 15cm spacing", daysToMaturity: 75, plantingMaterial: "seeds", seedUnit: "kg", seedRatePerHectare: 8 },
  "Sorghum": { plantSpacing: 0.20, rowSpacing: 0.75, plantsPerHectare: 66667, description: "75cm x 20cm spacing", daysToMaturity: 100, plantingMaterial: "seeds", seedUnit: "kg", seedRatePerHectare: 10 },
  
  // Legumes - seed rates in kg/ha
  "Cowpea": { plantSpacing: 0.20, rowSpacing: 0.60, plantsPerHectare: 83333, description: "60cm x 20cm spacing", daysToMaturity: 70, plantingMaterial: "seeds", seedUnit: "kg", seedRatePerHectare: 20 },
  "Groundnut": { plantSpacing: 0.10, rowSpacing: 0.45, plantsPerHectare: 222222, description: "45cm x 10cm spacing", daysToMaturity: 100, plantingMaterial: "seeds", seedUnit: "kg", seedRatePerHectare: 80 },
  "Soybean": { plantSpacing: 0.05, rowSpacing: 0.60, plantsPerHectare: 333333, description: "60cm x 5cm spacing", daysToMaturity: 100, plantingMaterial: "seeds", seedUnit: "kg", seedRatePerHectare: 60 },
  
  // Root & Tubers - counted in pieces/cuttings/setts per hectare
  "Cassava": { plantSpacing: 1.00, rowSpacing: 1.00, plantsPerHectare: 10000, description: "1m x 1m spacing", daysToMaturity: 365, plantingMaterial: "stem cuttings", seedUnit: "cuttings", seedRatePerHectare: 10000 },
  "Yam": { plantSpacing: 1.00, rowSpacing: 1.20, plantsPerHectare: 8333, description: "1.2m x 1m spacing", daysToMaturity: 240, plantingMaterial: "setts", seedUnit: "setts", seedRatePerHectare: 8333 },
  "Sweet Potato": { plantSpacing: 0.30, rowSpacing: 1.00, plantsPerHectare: 33333, description: "1m x 30cm spacing", daysToMaturity: 120, plantingMaterial: "vine cuttings", seedUnit: "cuttings", seedRatePerHectare: 33333 },
  
  // Vegetables - seedlings counted in pieces, seeds in kg or grams
  "Tomato": { plantSpacing: 0.50, rowSpacing: 1.00, plantsPerHectare: 20000, description: "1m x 50cm spacing", daysToMaturity: 75, plantingMaterial: "seedlings", seedUnit: "pieces", seedRatePerHectare: 20000 },
  "Pepper": { plantSpacing: 0.45, rowSpacing: 0.90, plantsPerHectare: 24691, description: "90cm x 45cm spacing", daysToMaturity: 90, plantingMaterial: "seedlings", seedUnit: "pieces", seedRatePerHectare: 24691 },
  "Onion": { plantSpacing: 0.10, rowSpacing: 0.30, plantsPerHectare: 333333, description: "30cm x 10cm spacing", daysToMaturity: 120, plantingMaterial: "seedlings", seedUnit: "pieces", seedRatePerHectare: 333333 },
  "Okra": { plantSpacing: 0.30, rowSpacing: 0.60, plantsPerHectare: 55556, description: "60cm x 30cm spacing", daysToMaturity: 60, plantingMaterial: "seeds", seedUnit: "kg", seedRatePerHectare: 8 },
  "Garden Egg": { plantSpacing: 0.60, rowSpacing: 0.90, plantsPerHectare: 18519, description: "90cm x 60cm spacing", daysToMaturity: 80, plantingMaterial: "seedlings", seedUnit: "pieces", seedRatePerHectare: 18519 },
  "Cabbage": { plantSpacing: 0.45, rowSpacing: 0.60, plantsPerHectare: 37037, description: "60cm x 45cm spacing", daysToMaturity: 90, plantingMaterial: "seedlings", seedUnit: "pieces", seedRatePerHectare: 37037 },
  "Lettuce": { plantSpacing: 0.30, rowSpacing: 0.30, plantsPerHectare: 111111, description: "30cm x 30cm spacing", daysToMaturity: 45, plantingMaterial: "seedlings", seedUnit: "pieces", seedRatePerHectare: 111111 },
  "Cucumber": { plantSpacing: 0.60, rowSpacing: 1.50, plantsPerHectare: 11111, description: "1.5m x 60cm spacing", daysToMaturity: 55, plantingMaterial: "seeds", seedUnit: "kg", seedRatePerHectare: 3 },
  "Watermelon": { plantSpacing: 1.00, rowSpacing: 2.00, plantsPerHectare: 5000, description: "2m x 1m spacing", daysToMaturity: 80, plantingMaterial: "seeds", seedUnit: "kg", seedRatePerHectare: 2 },
  
  // Fruits - counted in suckers/seedlings
  "Pineapple": { plantSpacing: 0.30, rowSpacing: 0.90, plantsPerHectare: 37037, description: "90cm x 30cm spacing", daysToMaturity: 540, plantingMaterial: "suckers", seedUnit: "suckers", seedRatePerHectare: 37037 },
  "Banana": { plantSpacing: 3.00, rowSpacing: 3.00, plantsPerHectare: 1111, description: "3m x 3m spacing", daysToMaturity: 365, plantingMaterial: "suckers", seedUnit: "suckers", seedRatePerHectare: 1111 },
  "Plantain": { plantSpacing: 3.00, rowSpacing: 3.00, plantsPerHectare: 1111, description: "3m x 3m spacing", daysToMaturity: 365, plantingMaterial: "suckers", seedUnit: "suckers", seedRatePerHectare: 1111 },
  "Pawpaw": { plantSpacing: 2.50, rowSpacing: 2.50, plantsPerHectare: 1600, description: "2.5m x 2.5m spacing", daysToMaturity: 270, plantingMaterial: "seedlings", seedUnit: "pieces", seedRatePerHectare: 1600 },
  "Mango": { plantSpacing: 10.00, rowSpacing: 10.00, plantsPerHectare: 100, description: "10m x 10m spacing", daysToMaturity: 1825, plantingMaterial: "grafted seedlings", seedUnit: "pieces", seedRatePerHectare: 100 },
  "Orange": { plantSpacing: 6.00, rowSpacing: 6.00, plantsPerHectare: 278, description: "6m x 6m spacing", daysToMaturity: 1095, plantingMaterial: "grafted seedlings", seedUnit: "pieces", seedRatePerHectare: 278 },
  "Coconut": { plantSpacing: 8.00, rowSpacing: 8.00, plantsPerHectare: 156, description: "8m x 8m spacing", daysToMaturity: 2190, plantingMaterial: "seedlings", seedUnit: "pieces", seedRatePerHectare: 156 },
  
  // Cash Crops
  "Cocoa": { plantSpacing: 3.00, rowSpacing: 3.00, plantsPerHectare: 1111, description: "3m x 3m spacing", daysToMaturity: 1095, plantingMaterial: "seedlings", seedUnit: "pieces", seedRatePerHectare: 1111 },
  "Oil Palm": { plantSpacing: 9.00, rowSpacing: 9.00, plantsPerHectare: 143, description: "9m x 9m triangular", daysToMaturity: 1095, plantingMaterial: "seedlings", seedUnit: "pieces", seedRatePerHectare: 143 },
  "Cashew": { plantSpacing: 10.00, rowSpacing: 10.00, plantsPerHectare: 100, description: "10m x 10m spacing", daysToMaturity: 1095, plantingMaterial: "seedlings", seedUnit: "pieces", seedRatePerHectare: 100 },
  "Cotton": { plantSpacing: 0.30, rowSpacing: 0.90, plantsPerHectare: 37037, description: "90cm x 30cm spacing", daysToMaturity: 150, plantingMaterial: "seeds", seedUnit: "kg", seedRatePerHectare: 15 },
};

// ============================================
// PEN TYPE MULTIPLIERS
// Different pen types affect capacity differently
// ============================================

export interface PenTypeMultiplier {
  multiplier: number;  // Multiplier applied to base capacity (>1 = more animals, <1 = fewer animals)
  description: string;
  bestFor: string[];   // Animal types this pen is best suited for
}

export const PEN_TYPE_MULTIPLIERS: Record<string, PenTypeMultiplier> = {
  // Battery Cage - highest density for layers
  "Battery Cage": { 
    multiplier: 2.5, 
    description: "High-density caged system, 2.5x base capacity",
    bestFor: ["Layer", "Layers", "Quail"]
  },
  // Deep Litter - moderate density, good for broilers and layers
  "Deep Litter": { 
    multiplier: 1.0, 
    description: "Standard floor-based system, base capacity",
    bestFor: ["Broiler", "Broilers", "Layer", "Layers", "Chicken", "Turkey", "Duck", "Guinea Fowl"]
  },
  // Open Pen - standard density
  "Open Pen": { 
    multiplier: 1.0, 
    description: "Standard open housing, base capacity",
    bestFor: ["Goat", "Sheep", "Pig", "Cattle", "Rabbit", "Grasscutter"]
  },
  // Enclosed - slightly higher density due to controlled environment
  "Enclosed": { 
    multiplier: 1.2, 
    description: "Enclosed housing with controlled environment, 1.2x base capacity",
    bestFor: ["Broiler", "Broilers", "Layer", "Layers", "Pig", "Rabbit"]
  },
  // Free Range - lowest density, animals need more space
  "Free Range": { 
    multiplier: 0.3, 
    description: "Free range system, 0.3x base capacity (more space per animal)",
    bestFor: ["Chicken", "Layer", "Layers", "Turkey", "Duck", "Guinea Fowl", "Goat", "Sheep", "Cattle"]
  },
  // Slatted Floor - good for pigs, moderate density
  "Slatted Floor": { 
    multiplier: 1.3, 
    description: "Slatted floor system, 1.3x base capacity",
    bestFor: ["Pig", "Pigs", "Goat", "Sheep"]
  },
  // Paddock - outdoor grazing area, low density
  "Paddock": { 
    multiplier: 0.2, 
    description: "Outdoor paddock/grazing, 0.2x base capacity",
    bestFor: ["Cattle", "Goat", "Sheep", "Horse"]
  },
  // Kraal - traditional enclosure, moderate density
  "Kraal": { 
    multiplier: 0.8, 
    description: "Traditional kraal/enclosure, 0.8x base capacity",
    bestFor: ["Cattle", "Goat", "Sheep"]
  },
};

// ============================================
// LIVESTOCK SPACE REQUIREMENTS (sq meters per animal)
// ============================================

export interface LivestockSpaceInfo {
  spacePerAnimal: number;  // square meters per animal
  description: string;
  penType: string;
}

export const LIVESTOCK_SPACE: Record<string, LivestockSpaceInfo> = {
  // Poultry
  "Chicken": { spacePerAnimal: 0.1, description: "0.1 sq m per bird (intensive)", penType: "Poultry House" },
  "Broiler": { spacePerAnimal: 0.1, description: "10 birds per sq m", penType: "Broiler House" },
  "Broilers": { spacePerAnimal: 0.1, description: "10 birds per sq m", penType: "Broiler House" },
  "Layer": { spacePerAnimal: 0.2, description: "5 birds per sq m (cage-free)", penType: "Layer House" },
  "Layers": { spacePerAnimal: 0.2, description: "5 birds per sq m (cage-free)", penType: "Layer House" },
  "Turkey": { spacePerAnimal: 0.5, description: "2 birds per sq m", penType: "Turkey House" },
  "Duck": { spacePerAnimal: 0.25, description: "4 birds per sq m", penType: "Duck House" },
  "Guinea Fowl": { spacePerAnimal: 0.15, description: "6-7 birds per sq m", penType: "Guinea Fowl House" },
  "Quail": { spacePerAnimal: 0.02, description: "50 birds per sq m", penType: "Quail Cage" },
  
  // Cattle
  "Cattle": { spacePerAnimal: 10, description: "10 sq m per animal (housed)", penType: "Cattle Shed" },
  "Cow": { spacePerAnimal: 10, description: "10 sq m per animal", penType: "Cow Shed" },
  "Bull": { spacePerAnimal: 15, description: "15 sq m per animal", penType: "Bull Pen" },
  "Calf": { spacePerAnimal: 3, description: "3 sq m per calf", penType: "Calf Pen" },
  
  // Small Ruminants
  "Goat": { spacePerAnimal: 1.5, description: "1.5 sq m per goat", penType: "Goat Pen" },
  "Goats": { spacePerAnimal: 1.5, description: "1.5 sq m per goat", penType: "Goat Pen" },
  "Sheep": { spacePerAnimal: 1.5, description: "1.5 sq m per sheep", penType: "Sheep Pen" },
  "Ram": { spacePerAnimal: 2, description: "2 sq m per ram", penType: "Ram Pen" },
  
  // Pigs
  "Pig": { spacePerAnimal: 1.5, description: "1.5 sq m per pig (grower)", penType: "Pig Pen" },
  "Pigs": { spacePerAnimal: 1.5, description: "1.5 sq m per pig", penType: "Pig Pen" },
  "Piglet": { spacePerAnimal: 0.5, description: "0.5 sq m per piglet", penType: "Farrowing Pen" },
  "Sow": { spacePerAnimal: 4, description: "4 sq m per sow", penType: "Sow Pen" },
  "Boar": { spacePerAnimal: 6, description: "6 sq m per boar", penType: "Boar Pen" },
  
  // Others
  "Rabbit": { spacePerAnimal: 0.5, description: "0.5 sq m per rabbit", penType: "Rabbit Hutch" },
  "Rabbits": { spacePerAnimal: 0.5, description: "0.5 sq m per rabbit", penType: "Rabbit Hutch" },
  "Grasscutter": { spacePerAnimal: 0.3, description: "0.3 sq m per grasscutter", penType: "Grasscutter Cage" },
  "Snail": { spacePerAnimal: 0.01, description: "100 snails per sq m", penType: "Snailery" },
};

// ============================================
// CALCULATION FUNCTIONS
// ============================================

/**
 * Convert area between units
 */
export function convertArea(value: number, fromUnit: string, toUnit: string): number {
  // Convert to square meters first
  let sqMeters = value;
  switch (fromUnit.toUpperCase()) {
    case "HECTARES":
      sqMeters = value * 10000;
      break;
    case "ACRES":
      sqMeters = value * 4046.86;
      break;
    case "SQUARE_METERS":
      sqMeters = value;
      break;
  }
  
  // Convert from square meters to target unit
  switch (toUnit.toUpperCase()) {
    case "HECTARES":
      return sqMeters / 10000;
    case "ACRES":
      return sqMeters / 4046.86;
    case "SQUARE_METERS":
      return sqMeters;
    default:
      return sqMeters;
  }
}

/**
 * Calculate crop capacity for a given area
 */
export function calculateCropCapacity(
  cropName: string,
  areaSize: number,
  areaUnit: string = "HECTARES",
  customPlantSpacing?: number,
  customRowSpacing?: number
): {
  capacity: number;
  spacingInfo: CropSpacingInfo | null;
  areaInHectares: number;
} {
  const spacingInfo = getCropSpacingInfo(cropName);
  const areaInHectares = convertArea(areaSize, areaUnit, "HECTARES");
  
  if (customPlantSpacing && customRowSpacing) {
    // Custom spacing calculation
    const plantsPerHectare = Math.floor(10000 / (customPlantSpacing * customRowSpacing));
    const baseInfo = spacingInfo || { daysToMaturity: 90, plantingMaterial: "seeds", seedUnit: "kg", seedRatePerHectare: plantsPerHectare };
    // Recalculate seed rate based on custom spacing
    const customSeedRate = baseInfo.seedUnit === "kg" 
      ? baseInfo.seedRatePerHectare 
      : plantsPerHectare;
    return {
      capacity: Math.floor(plantsPerHectare * areaInHectares),
      spacingInfo: {
        plantSpacing: customPlantSpacing,
        rowSpacing: customRowSpacing,
        plantsPerHectare,
        description: `${customRowSpacing}m x ${customPlantSpacing}m custom spacing`,
        daysToMaturity: baseInfo.daysToMaturity,
        plantingMaterial: baseInfo.plantingMaterial,
        seedUnit: baseInfo.seedUnit,
        seedRatePerHectare: customSeedRate,
      },
      areaInHectares,
    };
  }
  
  if (spacingInfo) {
    return {
      capacity: Math.floor(spacingInfo.plantsPerHectare * areaInHectares),
      spacingInfo,
      areaInHectares,
    };
  }
  
  // Default spacing if crop not found (1m x 1m)
  return {
    capacity: Math.floor(10000 * areaInHectares),
    spacingInfo: null,
    areaInHectares,
  };
}

/**
 * Get pen type multiplier info
 */
export function getPenTypeMultiplier(penType: string): PenTypeMultiplier | null {
  if (PEN_TYPE_MULTIPLIERS[penType]) {
    return PEN_TYPE_MULTIPLIERS[penType];
  }
  
  // Try case-insensitive match
  const lowerName = penType.toLowerCase();
  for (const [key, value] of Object.entries(PEN_TYPE_MULTIPLIERS)) {
    if (key.toLowerCase() === lowerName) {
      return value;
    }
  }
  
  return null;
}

/**
 * Calculate livestock capacity for a pen
 * Now factors in both animal type AND pen type
 */
export function calculateLivestockCapacity(
  animalType: string,
  penArea: number,
  penType?: string,
  customSpacePerAnimal?: number
): {
  capacity: number;
  spaceInfo: LivestockSpaceInfo | null;
  penArea: number;
  penTypeMultiplier?: PenTypeMultiplier;
  baseCapacity?: number;
} {
  const spaceInfo = getLivestockSpaceInfo(animalType);
  const penTypeInfo = penType ? getPenTypeMultiplier(penType) : null;
  const multiplier = penTypeInfo?.multiplier || 1.0;
  
  if (customSpacePerAnimal) {
    const baseCapacity = Math.floor(penArea / customSpacePerAnimal);
    return {
      capacity: Math.floor(baseCapacity * multiplier),
      spaceInfo: {
        spacePerAnimal: customSpacePerAnimal,
        description: `${customSpacePerAnimal} sq m per animal (custom)`,
        penType: "Custom",
      },
      penArea,
      penTypeMultiplier: penTypeInfo || undefined,
      baseCapacity,
    };
  }
  
  if (spaceInfo) {
    const baseCapacity = Math.floor(penArea / spaceInfo.spacePerAnimal);
    return {
      capacity: Math.floor(baseCapacity * multiplier),
      spaceInfo,
      penArea,
      penTypeMultiplier: penTypeInfo || undefined,
      baseCapacity,
    };
  }
  
  // Default: 2 sq m per animal
  const baseCapacity = Math.floor(penArea / 2);
  return {
    capacity: Math.floor(baseCapacity * multiplier),
    spaceInfo: null,
    penArea,
    penTypeMultiplier: penTypeInfo || undefined,
    baseCapacity,
  };
}

/**
 * Calculate pen area from dimensions
 */
export function calculatePenArea(length: number, width: number): number {
  return length * width;
}

/**
 * Get crop spacing info by name
 */
export function getCropSpacingInfo(cropName: string): CropSpacingInfo | null {
  // Try exact match
  if (CROP_SPACING[cropName]) {
    return CROP_SPACING[cropName];
  }
  
  // Try case-insensitive match
  const lowerName = cropName.toLowerCase();
  for (const [key, value] of Object.entries(CROP_SPACING)) {
    if (key.toLowerCase() === lowerName) {
      return value;
    }
  }
  
  // Try partial match
  for (const [key, value] of Object.entries(CROP_SPACING)) {
    if (lowerName.includes(key.toLowerCase()) || key.toLowerCase().includes(lowerName)) {
      return value;
    }
  }
  
  return null;
}

/**
 * Get livestock space info by name
 */
export function getLivestockSpaceInfo(animalType: string): LivestockSpaceInfo | null {
  // Try exact match
  if (LIVESTOCK_SPACE[animalType]) {
    return LIVESTOCK_SPACE[animalType];
  }
  
  // Try case-insensitive match
  const lowerName = animalType.toLowerCase();
  for (const [key, value] of Object.entries(LIVESTOCK_SPACE)) {
    if (key.toLowerCase() === lowerName) {
      return value;
    }
  }
  
  // Try partial match
  for (const [key, value] of Object.entries(LIVESTOCK_SPACE)) {
    if (lowerName.includes(key.toLowerCase()) || key.toLowerCase().includes(lowerName)) {
      return value;
    }
  }
  
  return null;
}

/**
 * Calculate remaining farm space after plot allocations
 */
export function calculateRemainingSpace(
  totalFarmSize: number,
  farmSizeUnit: string,
  allocatedPlots: { size: number; sizeUnit: string }[]
): {
  remaining: number;
  unit: string;
  percentUsed: number;
} {
  const totalInSqMeters = convertArea(totalFarmSize, farmSizeUnit, "SQUARE_METERS");
  
  let allocatedInSqMeters = 0;
  for (const plot of allocatedPlots) {
    allocatedInSqMeters += convertArea(plot.size, plot.sizeUnit, "SQUARE_METERS");
  }
  
  const remainingInSqMeters = totalInSqMeters - allocatedInSqMeters;
  const remaining = convertArea(remainingInSqMeters, "SQUARE_METERS", farmSizeUnit);
  const percentUsed = (allocatedInSqMeters / totalInSqMeters) * 100;
  
  return {
    remaining: Math.max(0, remaining),
    unit: farmSizeUnit,
    percentUsed: Math.min(100, percentUsed),
  };
}

/**
 * Suggest optimal pen dimensions for a given capacity
 */
export function suggestPenDimensions(
  animalType: string,
  desiredCapacity: number
): {
  length: number;
  width: number;
  area: number;
  actualCapacity: number;
} {
  const spaceInfo = getLivestockSpaceInfo(animalType);
  const spacePerAnimal = spaceInfo?.spacePerAnimal || 2;
  
  const requiredArea = desiredCapacity * spacePerAnimal;
  
  // Suggest dimensions with 3:2 ratio
  const width = Math.ceil(Math.sqrt(requiredArea * 2 / 3));
  const length = Math.ceil(requiredArea / width);
  const actualArea = length * width;
  const actualCapacity = Math.floor(actualArea / spacePerAnimal);
  
  return {
    length,
    width,
    area: actualArea,
    actualCapacity,
  };
}
