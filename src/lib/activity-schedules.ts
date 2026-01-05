// Activity Schedule Templates for Livestock and Crops
// Auto-generates tasks when animals or crops are added

// ============================================
// LIVESTOCK ACTIVITY SCHEDULES
// ============================================

export interface LivestockActivityTemplate {
  name: string;
  description: string;
  category: "FEEDING" | "HEALTH" | "VACCINATION" | "DEWORMING" | "BREEDING" | "PRODUCTION" | "GENERAL";
  frequency: "DAILY" | "TWICE_DAILY" | "WEEKLY" | "BIWEEKLY" | "MONTHLY" | "QUARTERLY" | "YEARLY" | "ONCE";
  priority: "LOW" | "MEDIUM" | "HIGH" | "URGENT";
  daysFromStart: number; // Days from acquisition date to first occurrence
  repeatInterval?: number; // Days between repeats (for recurring tasks)
  timeOfDay?: string; // e.g., "06:00", "18:00"
}

export interface LivestockSchedule {
  animalType: string;
  activities: LivestockActivityTemplate[];
}

// Livestock schedules by animal type
export const LIVESTOCK_SCHEDULES: Record<string, LivestockActivityTemplate[]> = {
  // POULTRY (Chickens, Layers, Broilers)
  "Chicken": [
    // Feeding Schedule
    { name: "Morning Feeding", description: "Provide feed and check feeders", category: "FEEDING", frequency: "DAILY", priority: "HIGH", daysFromStart: 0, repeatInterval: 1, timeOfDay: "06:00" },
    { name: "Evening Feeding", description: "Top up feed and provide supplements", category: "FEEDING", frequency: "DAILY", priority: "HIGH", daysFromStart: 0, repeatInterval: 1, timeOfDay: "17:00" },
    { name: "Water Check & Refill", description: "Clean and refill water containers", category: "FEEDING", frequency: "TWICE_DAILY", priority: "HIGH", daysFromStart: 0, repeatInterval: 1 },
    // Health Schedule
    { name: "Newcastle Disease Vaccination", description: "Administer Newcastle vaccine", category: "VACCINATION", frequency: "ONCE", priority: "URGENT", daysFromStart: 7 },
    { name: "Gumboro Vaccination", description: "Administer Gumboro vaccine", category: "VACCINATION", frequency: "ONCE", priority: "URGENT", daysFromStart: 14 },
    { name: "Fowl Pox Vaccination", description: "Administer Fowl Pox vaccine", category: "VACCINATION", frequency: "ONCE", priority: "HIGH", daysFromStart: 28 },
    { name: "Deworming", description: "Administer dewormer", category: "DEWORMING", frequency: "MONTHLY", priority: "MEDIUM", daysFromStart: 30, repeatInterval: 30 },
    { name: "Health Check", description: "Inspect birds for signs of illness", category: "HEALTH", frequency: "WEEKLY", priority: "MEDIUM", daysFromStart: 7, repeatInterval: 7 },
    // General
    { name: "Clean Coop/Pen", description: "Clean and disinfect housing", category: "GENERAL", frequency: "WEEKLY", priority: "MEDIUM", daysFromStart: 7, repeatInterval: 7 },
  ],
  
  "Broiler": [
    { name: "Morning Feeding", description: "Provide starter/grower feed", category: "FEEDING", frequency: "DAILY", priority: "HIGH", daysFromStart: 0, repeatInterval: 1, timeOfDay: "06:00" },
    { name: "Afternoon Feeding", description: "Top up feed", category: "FEEDING", frequency: "DAILY", priority: "HIGH", daysFromStart: 0, repeatInterval: 1, timeOfDay: "12:00" },
    { name: "Evening Feeding", description: "Provide feed before night", category: "FEEDING", frequency: "DAILY", priority: "HIGH", daysFromStart: 0, repeatInterval: 1, timeOfDay: "18:00" },
    { name: "Water Management", description: "Clean and refill water", category: "FEEDING", frequency: "TWICE_DAILY", priority: "HIGH", daysFromStart: 0, repeatInterval: 1 },
    { name: "Newcastle Vaccination", description: "First Newcastle vaccine", category: "VACCINATION", frequency: "ONCE", priority: "URGENT", daysFromStart: 7 },
    { name: "Gumboro Vaccination", description: "Gumboro vaccine", category: "VACCINATION", frequency: "ONCE", priority: "URGENT", daysFromStart: 14 },
    { name: "Booster Vaccination", description: "Newcastle booster", category: "VACCINATION", frequency: "ONCE", priority: "HIGH", daysFromStart: 21 },
    { name: "Weight Check", description: "Weigh sample birds to track growth", category: "HEALTH", frequency: "WEEKLY", priority: "MEDIUM", daysFromStart: 7, repeatInterval: 7 },
    { name: "Market Preparation", description: "Prepare birds for market (6-8 weeks)", category: "PRODUCTION", frequency: "ONCE", priority: "HIGH", daysFromStart: 42 },
  ],

  "Layer": [
    { name: "Morning Feeding", description: "Provide layer feed", category: "FEEDING", frequency: "DAILY", priority: "HIGH", daysFromStart: 0, repeatInterval: 1, timeOfDay: "06:00" },
    { name: "Evening Feeding", description: "Top up feed", category: "FEEDING", frequency: "DAILY", priority: "HIGH", daysFromStart: 0, repeatInterval: 1, timeOfDay: "17:00" },
    { name: "Water Management", description: "Clean and refill water", category: "FEEDING", frequency: "TWICE_DAILY", priority: "HIGH", daysFromStart: 0, repeatInterval: 1 },
    { name: "Egg Collection - Morning", description: "Collect eggs", category: "PRODUCTION", frequency: "DAILY", priority: "HIGH", daysFromStart: 0, repeatInterval: 1, timeOfDay: "08:00" },
    { name: "Egg Collection - Afternoon", description: "Collect remaining eggs", category: "PRODUCTION", frequency: "DAILY", priority: "MEDIUM", daysFromStart: 0, repeatInterval: 1, timeOfDay: "14:00" },
    { name: "Newcastle Vaccination", description: "Newcastle vaccine", category: "VACCINATION", frequency: "QUARTERLY", priority: "HIGH", daysFromStart: 90, repeatInterval: 90 },
    { name: "Deworming", description: "Administer dewormer", category: "DEWORMING", frequency: "MONTHLY", priority: "MEDIUM", daysFromStart: 30, repeatInterval: 30 },
    { name: "Calcium Supplement", description: "Provide oyster shell/calcium", category: "FEEDING", frequency: "WEEKLY", priority: "MEDIUM", daysFromStart: 7, repeatInterval: 7 },
  ],

  // CATTLE
  "Cattle": [
    { name: "Morning Feeding", description: "Provide feed/fodder", category: "FEEDING", frequency: "DAILY", priority: "HIGH", daysFromStart: 0, repeatInterval: 1, timeOfDay: "06:00" },
    { name: "Evening Feeding", description: "Provide evening feed", category: "FEEDING", frequency: "DAILY", priority: "HIGH", daysFromStart: 0, repeatInterval: 1, timeOfDay: "17:00" },
    { name: "Water Provision", description: "Ensure clean water available", category: "FEEDING", frequency: "DAILY", priority: "HIGH", daysFromStart: 0, repeatInterval: 1 },
    { name: "FMD Vaccination", description: "Foot and Mouth Disease vaccine", category: "VACCINATION", frequency: "YEARLY", priority: "URGENT", daysFromStart: 30, repeatInterval: 365 },
    { name: "Anthrax Vaccination", description: "Anthrax vaccine", category: "VACCINATION", frequency: "YEARLY", priority: "URGENT", daysFromStart: 60, repeatInterval: 365 },
    { name: "Deworming", description: "Administer dewormer", category: "DEWORMING", frequency: "QUARTERLY", priority: "HIGH", daysFromStart: 30, repeatInterval: 90 },
    { name: "Tick Treatment", description: "Apply acaricide for tick control", category: "HEALTH", frequency: "BIWEEKLY", priority: "MEDIUM", daysFromStart: 14, repeatInterval: 14 },
    { name: "Health Inspection", description: "Check for signs of illness", category: "HEALTH", frequency: "WEEKLY", priority: "MEDIUM", daysFromStart: 7, repeatInterval: 7 },
    { name: "Hoof Trimming", description: "Trim hooves if needed", category: "HEALTH", frequency: "QUARTERLY", priority: "LOW", daysFromStart: 90, repeatInterval: 90 },
  ],

  // GOATS
  "Goat": [
    { name: "Morning Feeding", description: "Provide feed and browse", category: "FEEDING", frequency: "DAILY", priority: "HIGH", daysFromStart: 0, repeatInterval: 1, timeOfDay: "06:30" },
    { name: "Evening Feeding", description: "Provide evening feed", category: "FEEDING", frequency: "DAILY", priority: "HIGH", daysFromStart: 0, repeatInterval: 1, timeOfDay: "17:30" },
    { name: "Water Provision", description: "Ensure clean water", category: "FEEDING", frequency: "DAILY", priority: "HIGH", daysFromStart: 0, repeatInterval: 1 },
    { name: "PPR Vaccination", description: "Peste des Petits Ruminants vaccine", category: "VACCINATION", frequency: "YEARLY", priority: "URGENT", daysFromStart: 30, repeatInterval: 365 },
    { name: "Deworming", description: "Administer dewormer", category: "DEWORMING", frequency: "QUARTERLY", priority: "HIGH", daysFromStart: 21, repeatInterval: 90 },
    { name: "Health Check", description: "Inspect for illness signs", category: "HEALTH", frequency: "WEEKLY", priority: "MEDIUM", daysFromStart: 7, repeatInterval: 7 },
    { name: "Hoof Trimming", description: "Trim hooves", category: "HEALTH", frequency: "QUARTERLY", priority: "LOW", daysFromStart: 90, repeatInterval: 90 },
  ],

  // SHEEP
  "Sheep": [
    { name: "Morning Feeding", description: "Provide feed and grazing", category: "FEEDING", frequency: "DAILY", priority: "HIGH", daysFromStart: 0, repeatInterval: 1, timeOfDay: "06:30" },
    { name: "Evening Feeding", description: "Provide evening feed", category: "FEEDING", frequency: "DAILY", priority: "HIGH", daysFromStart: 0, repeatInterval: 1, timeOfDay: "17:30" },
    { name: "Water Provision", description: "Ensure clean water", category: "FEEDING", frequency: "DAILY", priority: "HIGH", daysFromStart: 0, repeatInterval: 1 },
    { name: "PPR Vaccination", description: "PPR vaccine", category: "VACCINATION", frequency: "YEARLY", priority: "URGENT", daysFromStart: 30, repeatInterval: 365 },
    { name: "Deworming", description: "Administer dewormer", category: "DEWORMING", frequency: "QUARTERLY", priority: "HIGH", daysFromStart: 21, repeatInterval: 90 },
    { name: "Shearing", description: "Shear wool (if applicable)", category: "PRODUCTION", frequency: "YEARLY", priority: "MEDIUM", daysFromStart: 180, repeatInterval: 365 },
    { name: "Health Check", description: "Inspect for illness", category: "HEALTH", frequency: "WEEKLY", priority: "MEDIUM", daysFromStart: 7, repeatInterval: 7 },
  ],

  // PIGS
  "Pig": [
    { name: "Morning Feeding", description: "Provide pig feed", category: "FEEDING", frequency: "DAILY", priority: "HIGH", daysFromStart: 0, repeatInterval: 1, timeOfDay: "07:00" },
    { name: "Afternoon Feeding", description: "Second feeding", category: "FEEDING", frequency: "DAILY", priority: "HIGH", daysFromStart: 0, repeatInterval: 1, timeOfDay: "12:00" },
    { name: "Evening Feeding", description: "Evening feed", category: "FEEDING", frequency: "DAILY", priority: "HIGH", daysFromStart: 0, repeatInterval: 1, timeOfDay: "17:00" },
    { name: "Water Management", description: "Ensure clean water", category: "FEEDING", frequency: "DAILY", priority: "HIGH", daysFromStart: 0, repeatInterval: 1 },
    { name: "ASF Prevention Check", description: "Check for African Swine Fever signs", category: "HEALTH", frequency: "DAILY", priority: "URGENT", daysFromStart: 0, repeatInterval: 1 },
    { name: "Deworming", description: "Administer dewormer", category: "DEWORMING", frequency: "MONTHLY", priority: "HIGH", daysFromStart: 30, repeatInterval: 30 },
    { name: "Iron Injection (Piglets)", description: "Iron supplement for piglets", category: "HEALTH", frequency: "ONCE", priority: "HIGH", daysFromStart: 3 },
    { name: "Pen Cleaning", description: "Clean and disinfect pen", category: "GENERAL", frequency: "DAILY", priority: "MEDIUM", daysFromStart: 0, repeatInterval: 1 },
    { name: "Weight Check", description: "Weigh pigs for growth tracking", category: "HEALTH", frequency: "WEEKLY", priority: "MEDIUM", daysFromStart: 7, repeatInterval: 7 },
  ],

  // RABBITS
  "Rabbit": [
    { name: "Morning Feeding", description: "Provide pellets and hay", category: "FEEDING", frequency: "DAILY", priority: "HIGH", daysFromStart: 0, repeatInterval: 1, timeOfDay: "06:00" },
    { name: "Evening Feeding", description: "Provide vegetables and top up", category: "FEEDING", frequency: "DAILY", priority: "HIGH", daysFromStart: 0, repeatInterval: 1, timeOfDay: "18:00" },
    { name: "Water Check", description: "Ensure clean water", category: "FEEDING", frequency: "DAILY", priority: "HIGH", daysFromStart: 0, repeatInterval: 1 },
    { name: "Cage Cleaning", description: "Clean hutch/cage", category: "GENERAL", frequency: "WEEKLY", priority: "MEDIUM", daysFromStart: 7, repeatInterval: 7 },
    { name: "Health Inspection", description: "Check for illness signs", category: "HEALTH", frequency: "WEEKLY", priority: "MEDIUM", daysFromStart: 7, repeatInterval: 7 },
    { name: "Coccidiosis Prevention", description: "Administer coccidiostat", category: "HEALTH", frequency: "MONTHLY", priority: "MEDIUM", daysFromStart: 30, repeatInterval: 30 },
  ],
};

// ============================================
// CROP ACTIVITY SCHEDULES
// ============================================

export interface CropActivityTemplate {
  name: string;
  description: string;
  category: "LAND_PREPARATION" | "PLANTING" | "FERTILIZER" | "WEEDING" | "PEST_CONTROL" | "IRRIGATION" | "HARVESTING" | "POST_HARVEST" | "GENERAL";
  priority: "LOW" | "MEDIUM" | "HIGH" | "URGENT";
  daysFromPlanting: number; // Days from planting date
  durationDays?: number; // How many days this activity spans
}

// Crop schedules by crop type
export const CROP_SCHEDULES: Record<string, CropActivityTemplate[]> = {
  // CEREALS
  "Maize": [
    { name: "Land Preparation", description: "Clear, plough and harrow the land", category: "LAND_PREPARATION", priority: "HIGH", daysFromPlanting: -14, durationDays: 7 },
    { name: "Planting", description: "Plant maize seeds at recommended spacing", category: "PLANTING", priority: "URGENT", daysFromPlanting: 0 },
    { name: "First Weeding", description: "Remove weeds around young plants", category: "WEEDING", priority: "HIGH", daysFromPlanting: 14 },
    { name: "First Fertilizer Application", description: "Apply NPK fertilizer (basal)", category: "FERTILIZER", priority: "HIGH", daysFromPlanting: 14 },
    { name: "Second Weeding", description: "Second round of weeding", category: "WEEDING", priority: "HIGH", daysFromPlanting: 35 },
    { name: "Top Dressing", description: "Apply urea/sulphate of ammonia", category: "FERTILIZER", priority: "HIGH", daysFromPlanting: 42 },
    { name: "Pest Monitoring", description: "Check for fall armyworm and other pests", category: "PEST_CONTROL", priority: "HIGH", daysFromPlanting: 21 },
    { name: "Pest Control Application", description: "Apply pesticide if needed", category: "PEST_CONTROL", priority: "MEDIUM", daysFromPlanting: 28 },
    { name: "Harvest Preparation", description: "Prepare for harvest, check maturity", category: "HARVESTING", priority: "MEDIUM", daysFromPlanting: 80 },
    { name: "Harvesting", description: "Harvest mature maize", category: "HARVESTING", priority: "URGENT", daysFromPlanting: 90 },
    { name: "Drying", description: "Dry harvested maize to safe moisture", category: "POST_HARVEST", priority: "HIGH", daysFromPlanting: 92 },
    { name: "Storage", description: "Store dried maize properly", category: "POST_HARVEST", priority: "HIGH", daysFromPlanting: 100 },
  ],

  "Rice": [
    { name: "Land Preparation", description: "Prepare paddy field, level and flood", category: "LAND_PREPARATION", priority: "HIGH", daysFromPlanting: -21, durationDays: 14 },
    { name: "Nursery Preparation", description: "Prepare seedbed for transplanting", category: "LAND_PREPARATION", priority: "HIGH", daysFromPlanting: -21 },
    { name: "Transplanting", description: "Transplant seedlings to main field", category: "PLANTING", priority: "URGENT", daysFromPlanting: 0 },
    { name: "First Weeding", description: "Remove weeds", category: "WEEDING", priority: "HIGH", daysFromPlanting: 21 },
    { name: "First Fertilizer", description: "Apply basal fertilizer", category: "FERTILIZER", priority: "HIGH", daysFromPlanting: 14 },
    { name: "Second Fertilizer", description: "Apply top dressing", category: "FERTILIZER", priority: "HIGH", daysFromPlanting: 45 },
    { name: "Water Management", description: "Maintain proper water level", category: "IRRIGATION", priority: "HIGH", daysFromPlanting: 0 },
    { name: "Pest Monitoring", description: "Check for stem borers and rice bugs", category: "PEST_CONTROL", priority: "MEDIUM", daysFromPlanting: 30 },
    { name: "Drain Field", description: "Drain water before harvest", category: "IRRIGATION", priority: "HIGH", daysFromPlanting: 110 },
    { name: "Harvesting", description: "Harvest mature rice", category: "HARVESTING", priority: "URGENT", daysFromPlanting: 120 },
    { name: "Threshing", description: "Thresh harvested rice", category: "POST_HARVEST", priority: "HIGH", daysFromPlanting: 122 },
    { name: "Drying & Storage", description: "Dry and store rice", category: "POST_HARVEST", priority: "HIGH", daysFromPlanting: 125 },
  ],

  // ROOT & TUBERS
  "Cassava": [
    { name: "Land Preparation", description: "Clear and prepare land", category: "LAND_PREPARATION", priority: "HIGH", daysFromPlanting: -14 },
    { name: "Planting", description: "Plant cassava cuttings", category: "PLANTING", priority: "URGENT", daysFromPlanting: 0 },
    { name: "First Weeding", description: "Remove weeds", category: "WEEDING", priority: "HIGH", daysFromPlanting: 30 },
    { name: "Second Weeding", description: "Second weeding round", category: "WEEDING", priority: "HIGH", daysFromPlanting: 60 },
    { name: "Third Weeding", description: "Third weeding if needed", category: "WEEDING", priority: "MEDIUM", daysFromPlanting: 90 },
    { name: "Fertilizer Application", description: "Apply NPK if soil is poor", category: "FERTILIZER", priority: "MEDIUM", daysFromPlanting: 45 },
    { name: "Pest Check", description: "Check for cassava mosaic and mealybugs", category: "PEST_CONTROL", priority: "MEDIUM", daysFromPlanting: 60 },
    { name: "Maturity Check", description: "Check root development", category: "HARVESTING", priority: "MEDIUM", daysFromPlanting: 300 },
    { name: "Harvesting", description: "Harvest mature cassava", category: "HARVESTING", priority: "URGENT", daysFromPlanting: 365 },
    { name: "Processing", description: "Process or store cassava", category: "POST_HARVEST", priority: "HIGH", daysFromPlanting: 366 },
  ],

  "Yam": [
    { name: "Land Preparation", description: "Prepare mounds or ridges", category: "LAND_PREPARATION", priority: "HIGH", daysFromPlanting: -14 },
    { name: "Planting", description: "Plant yam setts", category: "PLANTING", priority: "URGENT", daysFromPlanting: 0 },
    { name: "Staking", description: "Provide stakes for vines", category: "GENERAL", priority: "HIGH", daysFromPlanting: 30 },
    { name: "First Weeding", description: "Remove weeds", category: "WEEDING", priority: "HIGH", daysFromPlanting: 30 },
    { name: "Second Weeding", description: "Second weeding", category: "WEEDING", priority: "HIGH", daysFromPlanting: 60 },
    { name: "Fertilizer Application", description: "Apply NPK fertilizer", category: "FERTILIZER", priority: "MEDIUM", daysFromPlanting: 45 },
    { name: "Pest & Disease Check", description: "Check for yam beetles and anthracnose", category: "PEST_CONTROL", priority: "MEDIUM", daysFromPlanting: 60 },
    { name: "Harvesting", description: "Harvest mature yams", category: "HARVESTING", priority: "URGENT", daysFromPlanting: 240 },
    { name: "Curing & Storage", description: "Cure and store yams", category: "POST_HARVEST", priority: "HIGH", daysFromPlanting: 242 },
  ],

  // VEGETABLES
  "Tomato": [
    { name: "Nursery Preparation", description: "Prepare seedbed", category: "LAND_PREPARATION", priority: "HIGH", daysFromPlanting: -21 },
    { name: "Transplanting", description: "Transplant seedlings", category: "PLANTING", priority: "URGENT", daysFromPlanting: 0 },
    { name: "Staking", description: "Provide stakes for plants", category: "GENERAL", priority: "HIGH", daysFromPlanting: 14 },
    { name: "First Weeding", description: "Remove weeds", category: "WEEDING", priority: "HIGH", daysFromPlanting: 14 },
    { name: "Basal Fertilizer", description: "Apply NPK fertilizer", category: "FERTILIZER", priority: "HIGH", daysFromPlanting: 7 },
    { name: "Top Dressing", description: "Apply nitrogen fertilizer", category: "FERTILIZER", priority: "HIGH", daysFromPlanting: 28 },
    { name: "Irrigation", description: "Regular watering", category: "IRRIGATION", priority: "HIGH", daysFromPlanting: 0 },
    { name: "Pest & Disease Spray", description: "Apply fungicide/insecticide", category: "PEST_CONTROL", priority: "HIGH", daysFromPlanting: 21 },
    { name: "Pruning", description: "Remove suckers and lower leaves", category: "GENERAL", priority: "MEDIUM", daysFromPlanting: 28 },
    { name: "First Harvest", description: "Begin harvesting ripe fruits", category: "HARVESTING", priority: "HIGH", daysFromPlanting: 60 },
    { name: "Continuous Harvest", description: "Regular harvesting", category: "HARVESTING", priority: "HIGH", daysFromPlanting: 75 },
  ],

  "Pepper": [
    { name: "Nursery Preparation", description: "Prepare seedbed", category: "LAND_PREPARATION", priority: "HIGH", daysFromPlanting: -28 },
    { name: "Transplanting", description: "Transplant seedlings", category: "PLANTING", priority: "URGENT", daysFromPlanting: 0 },
    { name: "First Weeding", description: "Remove weeds", category: "WEEDING", priority: "HIGH", daysFromPlanting: 14 },
    { name: "Basal Fertilizer", description: "Apply NPK", category: "FERTILIZER", priority: "HIGH", daysFromPlanting: 7 },
    { name: "Top Dressing", description: "Apply nitrogen", category: "FERTILIZER", priority: "HIGH", daysFromPlanting: 35 },
    { name: "Pest Control", description: "Control aphids and thrips", category: "PEST_CONTROL", priority: "HIGH", daysFromPlanting: 21 },
    { name: "Irrigation", description: "Regular watering", category: "IRRIGATION", priority: "HIGH", daysFromPlanting: 0 },
    { name: "First Harvest", description: "Begin harvesting", category: "HARVESTING", priority: "HIGH", daysFromPlanting: 75 },
    { name: "Continuous Harvest", description: "Regular harvesting", category: "HARVESTING", priority: "HIGH", daysFromPlanting: 90 },
  ],

  "Onion": [
    { name: "Nursery Preparation", description: "Prepare seedbed", category: "LAND_PREPARATION", priority: "HIGH", daysFromPlanting: -35 },
    { name: "Transplanting", description: "Transplant seedlings", category: "PLANTING", priority: "URGENT", daysFromPlanting: 0 },
    { name: "First Weeding", description: "Remove weeds carefully", category: "WEEDING", priority: "HIGH", daysFromPlanting: 14 },
    { name: "Second Weeding", description: "Second weeding", category: "WEEDING", priority: "HIGH", daysFromPlanting: 35 },
    { name: "Fertilizer Application", description: "Apply NPK", category: "FERTILIZER", priority: "HIGH", daysFromPlanting: 14 },
    { name: "Top Dressing", description: "Apply nitrogen", category: "FERTILIZER", priority: "HIGH", daysFromPlanting: 45 },
    { name: "Irrigation", description: "Regular watering", category: "IRRIGATION", priority: "HIGH", daysFromPlanting: 0 },
    { name: "Stop Irrigation", description: "Stop watering before harvest", category: "IRRIGATION", priority: "HIGH", daysFromPlanting: 100 },
    { name: "Harvesting", description: "Harvest when tops fall", category: "HARVESTING", priority: "URGENT", daysFromPlanting: 120 },
    { name: "Curing", description: "Cure onions in shade", category: "POST_HARVEST", priority: "HIGH", daysFromPlanting: 122 },
  ],

  // LEGUMES
  "Cowpea": [
    { name: "Land Preparation", description: "Prepare land", category: "LAND_PREPARATION", priority: "HIGH", daysFromPlanting: -7 },
    { name: "Planting", description: "Plant cowpea seeds", category: "PLANTING", priority: "URGENT", daysFromPlanting: 0 },
    { name: "First Weeding", description: "Remove weeds", category: "WEEDING", priority: "HIGH", daysFromPlanting: 14 },
    { name: "Second Weeding", description: "Second weeding", category: "WEEDING", priority: "HIGH", daysFromPlanting: 35 },
    { name: "Pest Control", description: "Control pod borers and aphids", category: "PEST_CONTROL", priority: "HIGH", daysFromPlanting: 35 },
    { name: "Flowering Spray", description: "Spray at flowering", category: "PEST_CONTROL", priority: "HIGH", daysFromPlanting: 45 },
    { name: "Harvesting", description: "Harvest mature pods", category: "HARVESTING", priority: "URGENT", daysFromPlanting: 70 },
    { name: "Drying & Threshing", description: "Dry and thresh", category: "POST_HARVEST", priority: "HIGH", daysFromPlanting: 72 },
  ],

  "Groundnut": [
    { name: "Land Preparation", description: "Prepare land, ensure good tilth", category: "LAND_PREPARATION", priority: "HIGH", daysFromPlanting: -7 },
    { name: "Planting", description: "Plant groundnut seeds", category: "PLANTING", priority: "URGENT", daysFromPlanting: 0 },
    { name: "First Weeding", description: "Remove weeds", category: "WEEDING", priority: "HIGH", daysFromPlanting: 21 },
    { name: "Earthing Up", description: "Earth up around plants", category: "GENERAL", priority: "HIGH", daysFromPlanting: 35 },
    { name: "Pest Check", description: "Check for leaf spots and rosette", category: "PEST_CONTROL", priority: "MEDIUM", daysFromPlanting: 45 },
    { name: "Harvesting", description: "Harvest when leaves yellow", category: "HARVESTING", priority: "URGENT", daysFromPlanting: 100 },
    { name: "Drying", description: "Dry pods properly", category: "POST_HARVEST", priority: "HIGH", daysFromPlanting: 102 },
  ],

  // FRUITS
  "Plantain": [
    { name: "Land Preparation", description: "Dig planting holes", category: "LAND_PREPARATION", priority: "HIGH", daysFromPlanting: -14 },
    { name: "Planting", description: "Plant suckers", category: "PLANTING", priority: "URGENT", daysFromPlanting: 0 },
    { name: "Mulching", description: "Apply mulch around plants", category: "GENERAL", priority: "HIGH", daysFromPlanting: 7 },
    { name: "First Weeding", description: "Remove weeds", category: "WEEDING", priority: "HIGH", daysFromPlanting: 30 },
    { name: "Fertilizer Application", description: "Apply NPK", category: "FERTILIZER", priority: "HIGH", daysFromPlanting: 30 },
    { name: "Desuckering", description: "Remove excess suckers", category: "GENERAL", priority: "MEDIUM", daysFromPlanting: 90 },
    { name: "Second Fertilizer", description: "Apply fertilizer", category: "FERTILIZER", priority: "MEDIUM", daysFromPlanting: 120 },
    { name: "Propping", description: "Support fruiting plants", category: "GENERAL", priority: "HIGH", daysFromPlanting: 300 },
    { name: "Harvesting", description: "Harvest mature bunches", category: "HARVESTING", priority: "URGENT", daysFromPlanting: 365 },
  ],

  "Banana": [
    { name: "Land Preparation", description: "Dig planting holes", category: "LAND_PREPARATION", priority: "HIGH", daysFromPlanting: -14 },
    { name: "Planting", description: "Plant suckers", category: "PLANTING", priority: "URGENT", daysFromPlanting: 0 },
    { name: "Mulching", description: "Apply mulch", category: "GENERAL", priority: "HIGH", daysFromPlanting: 7 },
    { name: "First Weeding", description: "Remove weeds", category: "WEEDING", priority: "HIGH", daysFromPlanting: 30 },
    { name: "Fertilizer Application", description: "Apply NPK", category: "FERTILIZER", priority: "HIGH", daysFromPlanting: 30 },
    { name: "Desuckering", description: "Remove excess suckers", category: "GENERAL", priority: "MEDIUM", daysFromPlanting: 90 },
    { name: "Propping", description: "Support fruiting plants", category: "GENERAL", priority: "HIGH", daysFromPlanting: 300 },
    { name: "Harvesting", description: "Harvest mature bunches", category: "HARVESTING", priority: "URGENT", daysFromPlanting: 365 },
  ],

  // CASH CROPS
  "Cocoa": [
    { name: "Land Preparation", description: "Clear and prepare land with shade", category: "LAND_PREPARATION", priority: "HIGH", daysFromPlanting: -30 },
    { name: "Planting", description: "Plant cocoa seedlings", category: "PLANTING", priority: "URGENT", daysFromPlanting: 0 },
    { name: "Shade Management", description: "Ensure adequate shade", category: "GENERAL", priority: "HIGH", daysFromPlanting: 30 },
    { name: "First Weeding", description: "Remove weeds", category: "WEEDING", priority: "HIGH", daysFromPlanting: 30 },
    { name: "Fertilizer Application", description: "Apply fertilizer", category: "FERTILIZER", priority: "MEDIUM", daysFromPlanting: 60 },
    { name: "Pest & Disease Check", description: "Check for black pod and capsids", category: "PEST_CONTROL", priority: "HIGH", daysFromPlanting: 90 },
    { name: "Pruning", description: "Shape young trees", category: "GENERAL", priority: "MEDIUM", daysFromPlanting: 180 },
    { name: "Regular Weeding", description: "Maintain weed-free field", category: "WEEDING", priority: "MEDIUM", daysFromPlanting: 90 },
    { name: "First Harvest (Year 3)", description: "Begin harvesting pods", category: "HARVESTING", priority: "HIGH", daysFromPlanting: 1095 },
  ],

  "Oil Palm": [
    { name: "Land Preparation", description: "Clear and prepare land", category: "LAND_PREPARATION", priority: "HIGH", daysFromPlanting: -30 },
    { name: "Planting", description: "Plant oil palm seedlings", category: "PLANTING", priority: "URGENT", daysFromPlanting: 0 },
    { name: "Ring Weeding", description: "Weed around palms", category: "WEEDING", priority: "HIGH", daysFromPlanting: 30 },
    { name: "Fertilizer Application", description: "Apply fertilizer", category: "FERTILIZER", priority: "HIGH", daysFromPlanting: 60 },
    { name: "Cover Crop Management", description: "Manage legume cover crop", category: "GENERAL", priority: "MEDIUM", daysFromPlanting: 90 },
    { name: "Pest Check", description: "Check for rhinoceros beetle", category: "PEST_CONTROL", priority: "HIGH", daysFromPlanting: 180 },
    { name: "Pruning", description: "Remove dead fronds", category: "GENERAL", priority: "MEDIUM", daysFromPlanting: 365 },
    { name: "First Harvest (Year 3)", description: "Begin harvesting FFB", category: "HARVESTING", priority: "HIGH", daysFromPlanting: 1095 },
  ],
};

// Default schedule for unknown crops/livestock
export const DEFAULT_CROP_SCHEDULE: CropActivityTemplate[] = [
  { name: "Land Preparation", description: "Prepare land for planting", category: "LAND_PREPARATION", priority: "HIGH", daysFromPlanting: -14 },
  { name: "Planting", description: "Plant crop", category: "PLANTING", priority: "URGENT", daysFromPlanting: 0 },
  { name: "First Weeding", description: "Remove weeds", category: "WEEDING", priority: "HIGH", daysFromPlanting: 21 },
  { name: "Fertilizer Application", description: "Apply fertilizer", category: "FERTILIZER", priority: "HIGH", daysFromPlanting: 21 },
  { name: "Second Weeding", description: "Second weeding", category: "WEEDING", priority: "MEDIUM", daysFromPlanting: 45 },
  { name: "Pest Monitoring", description: "Check for pests and diseases", category: "PEST_CONTROL", priority: "MEDIUM", daysFromPlanting: 30 },
  { name: "Harvesting", description: "Harvest crop", category: "HARVESTING", priority: "URGENT", daysFromPlanting: 90 },
];

export const DEFAULT_LIVESTOCK_SCHEDULE: LivestockActivityTemplate[] = [
  { name: "Morning Feeding", description: "Provide feed", category: "FEEDING", frequency: "DAILY", priority: "HIGH", daysFromStart: 0, repeatInterval: 1, timeOfDay: "06:00" },
  { name: "Evening Feeding", description: "Provide evening feed", category: "FEEDING", frequency: "DAILY", priority: "HIGH", daysFromStart: 0, repeatInterval: 1, timeOfDay: "17:00" },
  { name: "Water Provision", description: "Ensure clean water", category: "FEEDING", frequency: "DAILY", priority: "HIGH", daysFromStart: 0, repeatInterval: 1 },
  { name: "Health Check", description: "Inspect for illness", category: "HEALTH", frequency: "WEEKLY", priority: "MEDIUM", daysFromStart: 7, repeatInterval: 7 },
  { name: "Deworming", description: "Administer dewormer", category: "DEWORMING", frequency: "QUARTERLY", priority: "HIGH", daysFromStart: 30, repeatInterval: 90 },
];

// Helper function to get schedule for a crop
export function getCropSchedule(cropName: string): CropActivityTemplate[] {
  return CROP_SCHEDULES[cropName] || DEFAULT_CROP_SCHEDULE;
}

// Helper function to get schedule for livestock
export function getLivestockSchedule(animalType: string): LivestockActivityTemplate[] {
  return LIVESTOCK_SCHEDULES[animalType] || DEFAULT_LIVESTOCK_SCHEDULE;
}
