// Livestock Maturity Data - Days from birth to maturity for common Ghana livestock
// These are default values; actual maturity depends on breed, nutrition, and management

export interface LivestockMaturityInfo {
  maturityDays: number;
  description: string;
  prefix: string; // For auto-generating names/tags
}

export const LIVESTOCK_MATURITY: Record<string, LivestockMaturityInfo> = {
  // ============ POULTRY ============
  // Database names (exact match - these take priority)
  "Layer Chicken": { maturityDays: 140, description: "Point of lay at 20 weeks", prefix: "LYR" },
  "Broiler Chicken": { maturityDays: 42, description: "Market weight at 6 weeks", prefix: "BRL" },
  "Local Chicken": { maturityDays: 180, description: "Dual purpose, mature at 6 months", prefix: "LCK" },
  "Turkey": { maturityDays: 150, description: "Market weight at 20-22 weeks", prefix: "TRK" },
  "Duck": { maturityDays: 70, description: "Market weight at 10 weeks", prefix: "DCK" },
  "Guinea Fowl": { maturityDays: 120, description: "Market weight at 16-18 weeks", prefix: "GNF" },
  "Quail": { maturityDays: 42, description: "Market weight at 6 weeks", prefix: "QUL" },
  "Pigeon": { maturityDays: 180, description: "Breeding age at 6 months", prefix: "PGN" },
  "Ostrich": { maturityDays: 730, description: "Sexual maturity at 2 years", prefix: "OST" },
  
  // Legacy/alternate names for backward compatibility
  "Chicken": { maturityDays: 180, description: "Local chicken: 6 months", prefix: "CHK" },
  "Broiler": { maturityDays: 42, description: "Market weight at 6 weeks", prefix: "BRL" },
  "Layer": { maturityDays: 140, description: "Point of lay at 20 weeks", prefix: "LYR" },
  "Layers": { maturityDays: 140, description: "Point of lay at 20 weeks", prefix: "LYR" },
  "Broilers": { maturityDays: 42, description: "Market weight at 6 weeks", prefix: "BRL" },
  "Poultry": { maturityDays: 56, description: "General poultry maturity", prefix: "PLT" },
  
  // ============ RUMINANTS ============
  "Cattle": { maturityDays: 730, description: "Sexual maturity at 2 years", prefix: "CTL" },
  "Cow": { maturityDays: 730, description: "Sexual maturity at 2 years", prefix: "COW" },
  "Bull": { maturityDays: 730, description: "Sexual maturity at 2 years", prefix: "BUL" },
  "Beef Cattle": { maturityDays: 548, description: "Market weight at 18 months", prefix: "BCT" },
  "Dairy Cattle": { maturityDays: 730, description: "First calving at 2 years", prefix: "DCT" },
  "Goat": { maturityDays: 365, description: "Sexual maturity at 12 months", prefix: "GOT" },
  "Goats": { maturityDays: 365, description: "Sexual maturity at 12 months", prefix: "GOT" },
  "Sheep": { maturityDays: 365, description: "Sexual maturity at 12 months", prefix: "SHP" },
  "Ram": { maturityDays: 365, description: "Sexual maturity at 12 months", prefix: "RAM" },
  "Ewe": { maturityDays: 365, description: "Sexual maturity at 12 months", prefix: "EWE" },
  "Camel": { maturityDays: 1825, description: "Sexual maturity at 5 years", prefix: "CML" },
  
  // ============ PIGS ============
  "Pig": { maturityDays: 180, description: "Market weight at 6 months", prefix: "PIG" },
  "Pigs": { maturityDays: 180, description: "Market weight at 6 months", prefix: "PIG" },
  "Swine": { maturityDays: 180, description: "Market weight at 6 months", prefix: "SWN" },
  "Piglet": { maturityDays: 180, description: "Market weight at 6 months", prefix: "PGL" },
  "Sow": { maturityDays: 240, description: "First farrowing at 8 months", prefix: "SOW" },
  "Boar": { maturityDays: 240, description: "Breeding age at 8 months", prefix: "BOR" },
  
  // ============ NON-CONVENTIONAL ============
  "Rabbit": { maturityDays: 120, description: "Sexual maturity at 4 months", prefix: "RBT" },
  "Rabbits": { maturityDays: 120, description: "Sexual maturity at 4 months", prefix: "RBT" },
  "Grasscutter": { maturityDays: 240, description: "Sexual maturity at 8 months", prefix: "GRC" },
  "Cane Rat": { maturityDays: 240, description: "Sexual maturity at 8 months", prefix: "CNR" },
  "Snail": { maturityDays: 365, description: "Market size at 12 months", prefix: "SNL" },
  "Snails": { maturityDays: 365, description: "Market size at 12 months", prefix: "SNL" },
  "Giant African Snail": { maturityDays: 365, description: "Market size at 12 months", prefix: "GAS" },
  "Honey Bee": { maturityDays: 21, description: "Worker bee lifecycle 21 days, colony harvest 1 year", prefix: "HBE" },
  "Bee": { maturityDays: 365, description: "Colony established in 1 year", prefix: "BEE" },
  "Bees": { maturityDays: 365, description: "Colony established in 1 year", prefix: "BEE" },
  "Honeybee": { maturityDays: 365, description: "Colony established in 1 year", prefix: "HBE" },
  "Donkey": { maturityDays: 1095, description: "Sexual maturity at 3 years", prefix: "DNK" },
  "Horse": { maturityDays: 1460, description: "Sexual maturity at 4 years", prefix: "HRS" },
  "Dog": { maturityDays: 365, description: "Sexual maturity at 1 year", prefix: "DOG" },
  "Cat": { maturityDays: 365, description: "Sexual maturity at 1 year", prefix: "CAT" },
  
  // ============ AQUACULTURE ============
  "Tilapia": { maturityDays: 180, description: "Market size at 6 months", prefix: "TLP" },
  "Catfish": { maturityDays: 180, description: "Market size at 6 months", prefix: "CTF" },
  "Carp": { maturityDays: 365, description: "Market size at 12 months", prefix: "CRP" },
  "Fish": { maturityDays: 180, description: "General fish maturity", prefix: "FSH" },
};

export function getLivestockMaturityInfo(animalName: string): LivestockMaturityInfo | null {
  // Try exact match first (case-sensitive)
  if (LIVESTOCK_MATURITY[animalName]) {
    return LIVESTOCK_MATURITY[animalName];
  }
  
  // Try case-insensitive exact match
  const lowerName = animalName.toLowerCase().trim();
  for (const [key, value] of Object.entries(LIVESTOCK_MATURITY)) {
    if (key.toLowerCase() === lowerName) {
      return value;
    }
  }
  
  // Try partial match - prioritize longer/more specific matches
  // Sort keys by length (descending) to match more specific names first
  const sortedKeys = Object.keys(LIVESTOCK_MATURITY).sort((a, b) => b.length - a.length);
  
  for (const key of sortedKeys) {
    const keyLower = key.toLowerCase();
    // Check if the animal name contains this key OR this key contains the animal name
    if (lowerName.includes(keyLower) || keyLower.includes(lowerName)) {
      return LIVESTOCK_MATURITY[key];
    }
  }
  
  return null;
}

export function generateLivestockName(animalName: string, sequence: number): string {
  const info = getLivestockMaturityInfo(animalName);
  const prefix = info?.prefix || animalName.substring(0, 3).toUpperCase();
  const year = new Date().getFullYear().toString().slice(-2);
  const paddedSeq = sequence.toString().padStart(4, '0');
  return `${prefix}-${year}-${paddedSeq}`;
}

export function generateTagNumber(animalName: string, sequence: number): string {
  const info = getLivestockMaturityInfo(animalName);
  const prefix = info?.prefix || animalName.substring(0, 3).toUpperCase();
  const timestamp = Date.now().toString().slice(-6);
  return `GH-${prefix}-${timestamp}`;
}

export function calculateMaturityDate(birthDate: Date, maturityDays: number): Date {
  const maturityDate = new Date(birthDate);
  maturityDate.setDate(maturityDate.getDate() + maturityDays);
  return maturityDate;
}

export function formatDateForInput(date: Date): string {
  return date.toISOString().split('T')[0];
}
