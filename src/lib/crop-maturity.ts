// Crop Maturity Data - Days from planting to harvest for common Ghana crops
// These are default values; actual maturity depends on variety, weather, and management

export const CROP_MATURITY_DAYS: Record<string, number> = {
  // Cereals
  "Maize": 90,
  "Corn": 90,
  "Rice": 120,
  "Paddy Rice": 120,
  "Millet": 90,
  "Sorghum": 120,
  "Wheat": 120,
  
  // Legumes
  "Cowpea": 70,
  "Groundnut": 120,
  "Peanut": 120,
  "Soybean": 100,
  "Bambara Beans": 120,
  "Pigeon Pea": 150,
  "Black-eyed Peas": 70,
  
  // Root & Tubers
  "Cassava": 270,
  "Yam": 240,
  "Cocoyam": 240,
  "Taro": 240,
  "Sweet Potato": 120,
  "Potato": 90,
  
  // Vegetables
  "Tomato": 75,
  "Tomatoes": 75,
  "Pepper": 90,
  "Hot Pepper": 90,
  "Sweet Pepper": 90,
  "Chili": 90,
  "Onion": 120,
  "Okra": 60,
  "Garden Egg": 75,
  "Eggplant": 75,
  "Cabbage": 90,
  "Lettuce": 45,
  "Carrot": 75,
  "Cucumber": 50,
  "Watermelon": 80,
  "Pumpkin": 100,
  "Spinach": 45,
  "Amaranth": 30,
  "Kontomire": 60,
  "Cocoyam Leaves": 60,
  
  // Fruits
  "Pineapple": 540,
  "Banana": 365,
  "Plantain": 365,
  "Pawpaw": 270,
  "Papaya": 270,
  "Mango": 1095,
  "Orange": 1095,
  "Coconut": 1825,
  "Avocado": 1095,
  
  // Cash Crops
  "Cocoa": 1825,
  "Coffee": 1095,
  "Oil Palm": 1460,
  "Cashew": 1095,
  "Shea": 5475,
  "Cotton": 150,
  "Tobacco": 120,
  "Sugarcane": 365,
  
  // Spices
  "Ginger": 240,
  "Turmeric": 270,
  "Garlic": 150,
};

export function getMaturityDays(cropName: string): number | null {
  // Try exact match first
  if (CROP_MATURITY_DAYS[cropName]) {
    return CROP_MATURITY_DAYS[cropName];
  }
  
  // Try case-insensitive match
  const lowerName = cropName.toLowerCase();
  for (const [key, value] of Object.entries(CROP_MATURITY_DAYS)) {
    if (key.toLowerCase() === lowerName) {
      return value;
    }
  }
  
  // Try partial match
  for (const [key, value] of Object.entries(CROP_MATURITY_DAYS)) {
    if (lowerName.includes(key.toLowerCase()) || key.toLowerCase().includes(lowerName)) {
      return value;
    }
  }
  
  return null;
}

export function calculateExpectedHarvestDate(plantingDate: Date, maturityDays: number): Date | null {
  if (!plantingDate || isNaN(plantingDate.getTime()) || !maturityDays) {
    return null;
  }
  const harvestDate = new Date(plantingDate);
  harvestDate.setDate(harvestDate.getDate() + maturityDays);
  return harvestDate;
}

export function formatDateForInput(date: Date | null): string {
  if (!date || isNaN(date.getTime())) {
    return '';
  }
  return date.toISOString().split('T')[0];
}
