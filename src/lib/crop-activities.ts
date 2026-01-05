// Crop Activity Templates - Auto-generated tasks for each crop type
// Days are relative to planting date (negative = before planting, positive = after)

export interface CropActivityTemplate {
  name: string;
  description: string;
  dayOffset: number; // Days from planting date
  category: "LAND_PREPARATION" | "PLANTING" | "FERTILIZING" | "WEEDING" | "PEST_CONTROL" | "IRRIGATION" | "HARVESTING" | "POST_HARVEST";
  priority: "LOW" | "MEDIUM" | "HIGH" | "URGENT";
  durationDays?: number; // How long the activity window lasts
}

export interface CropActivityConfig {
  cropName: string;
  activities: CropActivityTemplate[];
}

// Generic activities that apply to most crops
const GENERIC_ACTIVITIES: CropActivityTemplate[] = [
  { name: "Land Preparation", description: "Clear land, remove weeds and debris, plough and harrow", dayOffset: -14, category: "LAND_PREPARATION", priority: "HIGH", durationDays: 7 },
  { name: "Soil Testing", description: "Test soil pH and nutrient levels", dayOffset: -10, category: "LAND_PREPARATION", priority: "MEDIUM" },
  { name: "Seed/Seedling Preparation", description: "Prepare seeds or seedlings for planting", dayOffset: -3, category: "PLANTING", priority: "HIGH" },
  { name: "Planting", description: "Plant seeds or transplant seedlings", dayOffset: 0, category: "PLANTING", priority: "URGENT" },
  { name: "First Watering", description: "Water immediately after planting", dayOffset: 0, category: "IRRIGATION", priority: "URGENT" },
  { name: "First Weeding", description: "Remove weeds around young plants", dayOffset: 14, category: "WEEDING", priority: "HIGH", durationDays: 3 },
  { name: "First Fertilizer Application", description: "Apply basal fertilizer (NPK)", dayOffset: 21, category: "FERTILIZING", priority: "HIGH" },
  { name: "Second Weeding", description: "Second round of weed control", dayOffset: 35, category: "WEEDING", priority: "MEDIUM", durationDays: 3 },
  { name: "Pest Inspection", description: "Check for pests and diseases", dayOffset: 28, category: "PEST_CONTROL", priority: "MEDIUM" },
  { name: "Top Dressing", description: "Apply nitrogen fertilizer (Urea/Sulphate of Ammonia)", dayOffset: 42, category: "FERTILIZING", priority: "HIGH" },
];

// Crop-specific activity configurations
export const CROP_ACTIVITIES: Record<string, CropActivityTemplate[]> = {
  // Cereals
  "Maize": [
    { name: "Land Preparation", description: "Clear land, plough to 15-20cm depth, create ridges", dayOffset: -14, category: "LAND_PREPARATION", priority: "HIGH", durationDays: 7 },
    { name: "Seed Treatment", description: "Treat seeds with fungicide/insecticide", dayOffset: -1, category: "PLANTING", priority: "HIGH" },
    { name: "Planting", description: "Plant 2-3 seeds per hole at 5cm depth, 75x40cm spacing", dayOffset: 0, category: "PLANTING", priority: "URGENT" },
    { name: "First Watering", description: "Water immediately after planting if no rain", dayOffset: 0, category: "IRRIGATION", priority: "URGENT" },
    { name: "Thinning", description: "Thin to 1-2 plants per stand", dayOffset: 10, category: "PLANTING", priority: "MEDIUM" },
    { name: "First Weeding", description: "Remove weeds, avoid damaging roots", dayOffset: 14, category: "WEEDING", priority: "HIGH", durationDays: 3 },
    { name: "NPK Application", description: "Apply NPK 15-15-15 at 2 bags/acre", dayOffset: 21, category: "FERTILIZING", priority: "HIGH" },
    { name: "Second Weeding", description: "Second weed control before canopy closure", dayOffset: 35, category: "WEEDING", priority: "MEDIUM", durationDays: 3 },
    { name: "Top Dressing", description: "Apply Sulphate of Ammonia or Urea", dayOffset: 42, category: "FERTILIZING", priority: "HIGH" },
    { name: "Pest Monitoring", description: "Check for stem borers, armyworms", dayOffset: 30, category: "PEST_CONTROL", priority: "HIGH" },
    { name: "Fall Armyworm Check", description: "Inspect for fall armyworm damage", dayOffset: 21, category: "PEST_CONTROL", priority: "URGENT" },
    { name: "Harvest Preparation", description: "Check maturity - husks brown, kernels hard", dayOffset: 85, category: "HARVESTING", priority: "MEDIUM" },
    { name: "Harvesting", description: "Harvest when moisture is 20-25%", dayOffset: 90, category: "HARVESTING", priority: "URGENT", durationDays: 7 },
    { name: "Drying", description: "Dry to 12-13% moisture for storage", dayOffset: 97, category: "POST_HARVEST", priority: "HIGH", durationDays: 7 },
  ],
  
  "Rice": [
    { name: "Land Preparation", description: "Plough, puddle and level field", dayOffset: -21, category: "LAND_PREPARATION", priority: "HIGH", durationDays: 7 },
    { name: "Nursery Preparation", description: "Prepare nursery bed for seedlings", dayOffset: -25, category: "PLANTING", priority: "HIGH" },
    { name: "Seed Soaking", description: "Soak seeds for 24 hours", dayOffset: -1, category: "PLANTING", priority: "HIGH" },
    { name: "Transplanting", description: "Transplant 21-day old seedlings", dayOffset: 0, category: "PLANTING", priority: "URGENT" },
    { name: "First Weeding", description: "Manual or herbicide weed control", dayOffset: 21, category: "WEEDING", priority: "HIGH" },
    { name: "First Fertilizer", description: "Apply NPK at transplanting", dayOffset: 7, category: "FERTILIZING", priority: "HIGH" },
    { name: "Second Weeding", description: "Second round of weed control", dayOffset: 42, category: "WEEDING", priority: "MEDIUM" },
    { name: "Panicle Initiation Fertilizer", description: "Apply urea at panicle initiation", dayOffset: 50, category: "FERTILIZING", priority: "HIGH" },
    { name: "Water Management", description: "Maintain 5-10cm water level", dayOffset: 14, category: "IRRIGATION", priority: "HIGH" },
    { name: "Pest Check", description: "Monitor for stem borers, rice bugs", dayOffset: 35, category: "PEST_CONTROL", priority: "MEDIUM" },
    { name: "Drain Field", description: "Drain water 2 weeks before harvest", dayOffset: 105, category: "IRRIGATION", priority: "HIGH" },
    { name: "Harvesting", description: "Harvest when 80% grains are golden", dayOffset: 120, category: "HARVESTING", priority: "URGENT", durationDays: 5 },
  ],
  
  // Legumes
  "Cowpea": [
    { name: "Land Preparation", description: "Light ploughing, no heavy tillage needed", dayOffset: -7, category: "LAND_PREPARATION", priority: "HIGH" },
    { name: "Planting", description: "Plant 2-3 seeds per hole, 60x20cm spacing", dayOffset: 0, category: "PLANTING", priority: "URGENT" },
    { name: "First Weeding", description: "Weed at 2 weeks after planting", dayOffset: 14, category: "WEEDING", priority: "HIGH" },
    { name: "Second Weeding", description: "Weed before flowering", dayOffset: 28, category: "WEEDING", priority: "MEDIUM" },
    { name: "Pest Monitoring", description: "Check for aphids, pod borers", dayOffset: 35, category: "PEST_CONTROL", priority: "HIGH" },
    { name: "Flower Stage Pest Control", description: "Spray for flower thrips if needed", dayOffset: 42, category: "PEST_CONTROL", priority: "HIGH" },
    { name: "First Harvest", description: "Harvest mature pods", dayOffset: 60, category: "HARVESTING", priority: "HIGH" },
    { name: "Final Harvest", description: "Complete harvesting", dayOffset: 70, category: "HARVESTING", priority: "URGENT" },
  ],
  
  "Groundnut": [
    { name: "Land Preparation", description: "Deep ploughing for good root development", dayOffset: -14, category: "LAND_PREPARATION", priority: "HIGH" },
    { name: "Seed Selection", description: "Select healthy, unbroken seeds", dayOffset: -3, category: "PLANTING", priority: "HIGH" },
    { name: "Planting", description: "Plant at 45x15cm spacing, 5cm depth", dayOffset: 0, category: "PLANTING", priority: "URGENT" },
    { name: "First Weeding", description: "Weed carefully to avoid disturbing pegs", dayOffset: 21, category: "WEEDING", priority: "HIGH" },
    { name: "Earthing Up", description: "Earth up soil around plants at flowering", dayOffset: 35, category: "WEEDING", priority: "HIGH" },
    { name: "Calcium Application", description: "Apply gypsum at pegging stage", dayOffset: 40, category: "FERTILIZING", priority: "MEDIUM" },
    { name: "Pest Check", description: "Monitor for leaf spots, rosette disease", dayOffset: 45, category: "PEST_CONTROL", priority: "MEDIUM" },
    { name: "Maturity Check", description: "Check pod maturity - 75% dark inner shell", dayOffset: 110, category: "HARVESTING", priority: "MEDIUM" },
    { name: "Harvesting", description: "Lift plants, shake off soil", dayOffset: 120, category: "HARVESTING", priority: "URGENT" },
    { name: "Drying", description: "Dry pods to 8% moisture", dayOffset: 125, category: "POST_HARVEST", priority: "HIGH", durationDays: 7 },
  ],
  
  // Root & Tubers
  "Cassava": [
    { name: "Land Preparation", description: "Clear and plough, make mounds or ridges", dayOffset: -14, category: "LAND_PREPARATION", priority: "HIGH", durationDays: 7 },
    { name: "Stem Cutting Preparation", description: "Select healthy stems, cut 25-30cm pieces", dayOffset: -3, category: "PLANTING", priority: "HIGH" },
    { name: "Planting", description: "Plant cuttings at 45° angle, 1x1m spacing", dayOffset: 0, category: "PLANTING", priority: "URGENT" },
    { name: "Gap Filling", description: "Replace failed cuttings", dayOffset: 21, category: "PLANTING", priority: "MEDIUM" },
    { name: "First Weeding", description: "Weed around young plants", dayOffset: 30, category: "WEEDING", priority: "HIGH" },
    { name: "Second Weeding", description: "Second weed control", dayOffset: 60, category: "WEEDING", priority: "MEDIUM" },
    { name: "Third Weeding", description: "Final weeding before canopy closure", dayOffset: 90, category: "WEEDING", priority: "LOW" },
    { name: "Fertilizer Application", description: "Apply NPK if soil is poor", dayOffset: 45, category: "FERTILIZING", priority: "MEDIUM" },
    { name: "Pest Monitoring", description: "Check for mealybugs, green mites", dayOffset: 60, category: "PEST_CONTROL", priority: "MEDIUM" },
    { name: "Maturity Check", description: "Check root development", dayOffset: 240, category: "HARVESTING", priority: "MEDIUM" },
    { name: "Harvesting", description: "Harvest roots carefully", dayOffset: 270, category: "HARVESTING", priority: "HIGH", durationDays: 30 },
  ],
  
  "Yam": [
    { name: "Land Preparation", description: "Make mounds 1m apart", dayOffset: -21, category: "LAND_PREPARATION", priority: "HIGH", durationDays: 14 },
    { name: "Sett Preparation", description: "Cut seed yams, treat with ash", dayOffset: -7, category: "PLANTING", priority: "HIGH" },
    { name: "Planting", description: "Plant setts in mounds, 10cm deep", dayOffset: 0, category: "PLANTING", priority: "URGENT" },
    { name: "Mulching", description: "Apply mulch to conserve moisture", dayOffset: 7, category: "PLANTING", priority: "HIGH" },
    { name: "Staking", description: "Provide stakes for vines to climb", dayOffset: 30, category: "PLANTING", priority: "HIGH" },
    { name: "First Weeding", description: "Weed around mounds", dayOffset: 30, category: "WEEDING", priority: "HIGH" },
    { name: "Second Weeding", description: "Continue weed control", dayOffset: 60, category: "WEEDING", priority: "MEDIUM" },
    { name: "Fertilizer Application", description: "Apply NPK around mounds", dayOffset: 45, category: "FERTILIZING", priority: "MEDIUM" },
    { name: "Pest Check", description: "Monitor for yam beetles, nematodes", dayOffset: 90, category: "PEST_CONTROL", priority: "MEDIUM" },
    { name: "Harvesting", description: "Harvest when leaves yellow and dry", dayOffset: 240, category: "HARVESTING", priority: "URGENT", durationDays: 14 },
    { name: "Curing", description: "Cure tubers before storage", dayOffset: 255, category: "POST_HARVEST", priority: "HIGH" },
  ],
  
  // Vegetables
  "Tomato": [
    { name: "Nursery Preparation", description: "Prepare nursery bed, sow seeds", dayOffset: -28, category: "PLANTING", priority: "HIGH" },
    { name: "Land Preparation", description: "Plough, make beds or ridges", dayOffset: -14, category: "LAND_PREPARATION", priority: "HIGH" },
    { name: "Transplanting", description: "Transplant 4-week old seedlings", dayOffset: 0, category: "PLANTING", priority: "URGENT" },
    { name: "Watering", description: "Water daily for first week", dayOffset: 1, category: "IRRIGATION", priority: "URGENT", durationDays: 7 },
    { name: "Staking", description: "Stake plants for support", dayOffset: 14, category: "PLANTING", priority: "HIGH" },
    { name: "First Weeding", description: "Weed and mulch", dayOffset: 14, category: "WEEDING", priority: "HIGH" },
    { name: "First Fertilizer", description: "Apply NPK at transplanting", dayOffset: 7, category: "FERTILIZING", priority: "HIGH" },
    { name: "Second Fertilizer", description: "Side dress with nitrogen", dayOffset: 28, category: "FERTILIZING", priority: "HIGH" },
    { name: "Pruning", description: "Remove suckers, maintain 2-3 stems", dayOffset: 21, category: "PLANTING", priority: "MEDIUM" },
    { name: "Pest Monitoring", description: "Check for whiteflies, fruit worms", dayOffset: 28, category: "PEST_CONTROL", priority: "HIGH" },
    { name: "Disease Check", description: "Monitor for blight, wilt", dayOffset: 35, category: "PEST_CONTROL", priority: "HIGH" },
    { name: "First Harvest", description: "Harvest ripe fruits", dayOffset: 60, category: "HARVESTING", priority: "HIGH" },
    { name: "Continuous Harvest", description: "Harvest every 3-4 days", dayOffset: 65, category: "HARVESTING", priority: "HIGH", durationDays: 30 },
  ],
  
  "Pepper": [
    { name: "Nursery Preparation", description: "Sow seeds in nursery", dayOffset: -35, category: "PLANTING", priority: "HIGH" },
    { name: "Land Preparation", description: "Prepare beds, add organic matter", dayOffset: -14, category: "LAND_PREPARATION", priority: "HIGH" },
    { name: "Transplanting", description: "Transplant 5-week old seedlings", dayOffset: 0, category: "PLANTING", priority: "URGENT" },
    { name: "Watering", description: "Regular watering, avoid waterlogging", dayOffset: 1, category: "IRRIGATION", priority: "HIGH" },
    { name: "First Weeding", description: "Weed and mulch around plants", dayOffset: 14, category: "WEEDING", priority: "HIGH" },
    { name: "First Fertilizer", description: "Apply NPK", dayOffset: 14, category: "FERTILIZING", priority: "HIGH" },
    { name: "Second Fertilizer", description: "Apply nitrogen at flowering", dayOffset: 35, category: "FERTILIZING", priority: "HIGH" },
    { name: "Pest Check", description: "Monitor for aphids, mites", dayOffset: 28, category: "PEST_CONTROL", priority: "MEDIUM" },
    { name: "First Harvest", description: "Harvest mature peppers", dayOffset: 75, category: "HARVESTING", priority: "HIGH" },
    { name: "Continuous Harvest", description: "Regular harvesting", dayOffset: 80, category: "HARVESTING", priority: "HIGH", durationDays: 45 },
  ],
  
  "Onion": [
    { name: "Nursery Preparation", description: "Sow seeds in nursery bed", dayOffset: -42, category: "PLANTING", priority: "HIGH" },
    { name: "Land Preparation", description: "Prepare raised beds", dayOffset: -14, category: "LAND_PREPARATION", priority: "HIGH" },
    { name: "Transplanting", description: "Transplant 6-week old seedlings", dayOffset: 0, category: "PLANTING", priority: "URGENT" },
    { name: "First Weeding", description: "Hand weed carefully", dayOffset: 21, category: "WEEDING", priority: "HIGH" },
    { name: "Second Weeding", description: "Continue weed control", dayOffset: 42, category: "WEEDING", priority: "MEDIUM" },
    { name: "First Fertilizer", description: "Apply NPK at transplanting", dayOffset: 7, category: "FERTILIZING", priority: "HIGH" },
    { name: "Second Fertilizer", description: "Side dress with nitrogen", dayOffset: 35, category: "FERTILIZING", priority: "HIGH" },
    { name: "Irrigation", description: "Regular irrigation, reduce before harvest", dayOffset: 14, category: "IRRIGATION", priority: "HIGH" },
    { name: "Stop Irrigation", description: "Stop watering 2 weeks before harvest", dayOffset: 100, category: "IRRIGATION", priority: "HIGH" },
    { name: "Harvesting", description: "Harvest when tops fall over", dayOffset: 120, category: "HARVESTING", priority: "URGENT" },
    { name: "Curing", description: "Cure bulbs in shade for 2 weeks", dayOffset: 125, category: "POST_HARVEST", priority: "HIGH", durationDays: 14 },
  ],
};

// Get activities for a crop, falling back to generic if not found
export function getCropActivities(cropName: string): CropActivityTemplate[] {
  // Try exact match
  if (CROP_ACTIVITIES[cropName]) {
    return CROP_ACTIVITIES[cropName];
  }
  
  // Try case-insensitive match
  const lowerName = cropName.toLowerCase();
  for (const [key, activities] of Object.entries(CROP_ACTIVITIES)) {
    if (key.toLowerCase() === lowerName) {
      return activities;
    }
  }
  
  // Try partial match
  for (const [key, activities] of Object.entries(CROP_ACTIVITIES)) {
    if (lowerName.includes(key.toLowerCase()) || key.toLowerCase().includes(lowerName)) {
      return activities;
    }
  }
  
  // Return generic activities
  return GENERIC_ACTIVITIES;
}

// Calculate actual dates for activities based on planting date
export function calculateActivityDates(
  plantingDate: Date,
  activities: CropActivityTemplate[]
): Array<CropActivityTemplate & { scheduledDate: Date; endDate?: Date }> {
  return activities.map((activity) => {
    const scheduledDate = new Date(plantingDate);
    scheduledDate.setDate(scheduledDate.getDate() + activity.dayOffset);
    
    let endDate: Date | undefined;
    if (activity.durationDays) {
      endDate = new Date(scheduledDate);
      endDate.setDate(endDate.getDate() + activity.durationDays);
    }
    
    return {
      ...activity,
      scheduledDate,
      endDate,
    };
  });
}

// Get priority color for UI
export function getPriorityColor(priority: string): string {
  switch (priority) {
    case "URGENT": return "bg-red-100 text-red-700 border-red-200";
    case "HIGH": return "bg-orange-100 text-orange-700 border-orange-200";
    case "MEDIUM": return "bg-yellow-100 text-yellow-700 border-yellow-200";
    case "LOW": return "bg-green-100 text-green-700 border-green-200";
    default: return "bg-gray-100 text-gray-700 border-gray-200";
  }
}

// Get category icon name for UI
export function getCategoryIcon(category: string): string {
  switch (category) {
    case "LAND_PREPARATION": return "Shovel";
    case "PLANTING": return "Sprout";
    case "FERTILIZING": return "Droplets";
    case "WEEDING": return "Scissors";
    case "PEST_CONTROL": return "Bug";
    case "IRRIGATION": return "CloudRain";
    case "HARVESTING": return "Wheat";
    case "POST_HARVEST": return "Package";
    default: return "ClipboardList";
  }
}
