// Livestock Produce Types and Pricing Configuration

export interface ProduceType {
  id: string;
  name: string;
  unit: string;
  unitDescription: string;
  defaultPrice?: number;
}

export interface LivestockProduceConfig {
  animalType: string;
  produces: ProduceType[];
}

export const LIVESTOCK_PRODUCE: LivestockProduceConfig[] = [
  // ============ POULTRY ============
  // Layer Chicken - Primary: Eggs
  {
    animalType: "Layer Chicken",
    produces: [
      { id: "eggs_crate", name: "Eggs", unit: "crate", unitDescription: "Crate of 30 eggs", defaultPrice: 45 },
      { id: "meat_bird", name: "Meat (Spent Hen)", unit: "bird", unitDescription: "Per bird (after laying cycle)", defaultPrice: 35 },
    ],
  },
  // Broiler Chicken - Primary: Meat
  {
    animalType: "Broiler Chicken",
    produces: [
      { id: "meat_kg", name: "Meat", unit: "kg", unitDescription: "Per kilogram live weight", defaultPrice: 38 },
      { id: "meat_bird", name: "Meat", unit: "bird", unitDescription: "Per bird (whole)", defaultPrice: 80 },
    ],
  },
  // Local Chicken - Dual purpose
  {
    animalType: "Local Chicken",
    produces: [
      { id: "eggs_crate", name: "Eggs", unit: "crate", unitDescription: "Crate of 30 eggs", defaultPrice: 50 },
      { id: "meat_bird", name: "Meat", unit: "bird", unitDescription: "Per bird (whole)", defaultPrice: 70 },
      { id: "meat_kg", name: "Meat", unit: "kg", unitDescription: "Per kilogram live weight", defaultPrice: 45 },
    ],
  },
  // Turkey
  {
    animalType: "Turkey",
    produces: [
      { id: "meat_kg", name: "Meat", unit: "kg", unitDescription: "Per kilogram live weight", defaultPrice: 50 },
      { id: "meat_bird", name: "Meat", unit: "bird", unitDescription: "Per bird (whole)", defaultPrice: 350 },
      { id: "eggs_piece", name: "Eggs", unit: "piece", unitDescription: "Per egg", defaultPrice: 8 },
    ],
  },
  // Duck
  {
    animalType: "Duck",
    produces: [
      { id: "eggs_piece", name: "Eggs", unit: "piece", unitDescription: "Per egg", defaultPrice: 3 },
      { id: "meat_kg", name: "Meat", unit: "kg", unitDescription: "Per kilogram live weight", defaultPrice: 45 },
      { id: "meat_bird", name: "Meat", unit: "bird", unitDescription: "Per bird (whole)", defaultPrice: 90 },
    ],
  },
  // Guinea Fowl
  {
    animalType: "Guinea Fowl",
    produces: [
      { id: "eggs_piece", name: "Eggs", unit: "piece", unitDescription: "Per egg", defaultPrice: 2.5 },
      { id: "meat_bird", name: "Meat", unit: "bird", unitDescription: "Per bird (whole)", defaultPrice: 60 },
    ],
  },
  // Quail
  {
    animalType: "Quail",
    produces: [
      { id: "eggs_piece", name: "Eggs", unit: "piece", unitDescription: "Per egg", defaultPrice: 1 },
      { id: "meat_bird", name: "Meat", unit: "bird", unitDescription: "Per bird (whole)", defaultPrice: 15 },
    ],
  },
  // Pigeon
  {
    animalType: "Pigeon",
    produces: [
      { id: "meat_bird", name: "Meat", unit: "bird", unitDescription: "Per bird (whole)", defaultPrice: 25 },
    ],
  },
  // Ostrich
  {
    animalType: "Ostrich",
    produces: [
      { id: "eggs_piece", name: "Eggs", unit: "piece", unitDescription: "Per egg", defaultPrice: 150 },
      { id: "meat_kg", name: "Meat", unit: "kg", unitDescription: "Per kilogram", defaultPrice: 80 },
      { id: "leather", name: "Leather", unit: "piece", unitDescription: "Per hide", defaultPrice: 500 },
    ],
  },
  
  // ============ RUMINANTS ============
  // Cattle
  {
    animalType: "Cattle",
    produces: [
      { id: "milk_litre", name: "Milk", unit: "litre", unitDescription: "Per litre", defaultPrice: 12 },
      { id: "meat_kg", name: "Meat", unit: "kg", unitDescription: "Per kilogram", defaultPrice: 80 },
      { id: "meat_animal", name: "Meat", unit: "animal", unitDescription: "Per animal (live)", defaultPrice: 8000 },
      { id: "leather", name: "Leather/Hide", unit: "piece", unitDescription: "Per hide", defaultPrice: 200 },
    ],
  },
  // Goat
  {
    animalType: "Goat",
    produces: [
      { id: "milk_litre", name: "Milk", unit: "litre", unitDescription: "Per litre", defaultPrice: 15 },
      { id: "meat_kg", name: "Meat", unit: "kg", unitDescription: "Per kilogram", defaultPrice: 60 },
      { id: "meat_animal", name: "Meat", unit: "animal", unitDescription: "Per animal (live)", defaultPrice: 800 },
    ],
  },
  // Sheep
  {
    animalType: "Sheep",
    produces: [
      { id: "meat_kg", name: "Meat", unit: "kg", unitDescription: "Per kilogram", defaultPrice: 55 },
      { id: "meat_animal", name: "Meat", unit: "animal", unitDescription: "Per animal (live)", defaultPrice: 700 },
      { id: "wool_kg", name: "Wool", unit: "kg", unitDescription: "Per kilogram", defaultPrice: 20 },
    ],
  },
  // Camel
  {
    animalType: "Camel",
    produces: [
      { id: "milk_litre", name: "Milk", unit: "litre", unitDescription: "Per litre", defaultPrice: 25 },
      { id: "meat_kg", name: "Meat", unit: "kg", unitDescription: "Per kilogram", defaultPrice: 70 },
      { id: "meat_animal", name: "Meat", unit: "animal", unitDescription: "Per animal (live)", defaultPrice: 15000 },
    ],
  },
  
  // ============ PIGS ============
  {
    animalType: "Pig",
    produces: [
      { id: "meat_kg", name: "Meat", unit: "kg", unitDescription: "Per kilogram live weight", defaultPrice: 35 },
      { id: "meat_animal", name: "Meat", unit: "animal", unitDescription: "Per animal (live)", defaultPrice: 1500 },
    ],
  },
  
  // ============ NON-CONVENTIONAL ============
  // Rabbit
  {
    animalType: "Rabbit",
    produces: [
      { id: "meat_kg", name: "Meat", unit: "kg", unitDescription: "Per kilogram", defaultPrice: 50 },
      { id: "meat_animal", name: "Meat", unit: "animal", unitDescription: "Per animal", defaultPrice: 80 },
      { id: "fur", name: "Fur/Pelt", unit: "piece", unitDescription: "Per pelt", defaultPrice: 25 },
    ],
  },
  // Grasscutter
  {
    animalType: "Grasscutter",
    produces: [
      { id: "meat_kg", name: "Meat", unit: "kg", unitDescription: "Per kilogram", defaultPrice: 120 },
      { id: "meat_animal", name: "Meat", unit: "animal", unitDescription: "Per animal", defaultPrice: 250 },
    ],
  },
  // Giant African Snail
  {
    animalType: "Giant African Snail",
    produces: [
      { id: "meat_kg", name: "Meat", unit: "kg", unitDescription: "Per kilogram", defaultPrice: 40 },
      { id: "meat_piece", name: "Meat", unit: "piece", unitDescription: "Per snail", defaultPrice: 5 },
    ],
  },
  // Honey Bee
  {
    animalType: "Honey Bee",
    produces: [
      { id: "honey_kg", name: "Honey", unit: "kg", unitDescription: "Per kilogram", defaultPrice: 80 },
      { id: "honey_litre", name: "Honey", unit: "litre", unitDescription: "Per litre", defaultPrice: 100 },
      { id: "wax_kg", name: "Beeswax", unit: "kg", unitDescription: "Per kilogram", defaultPrice: 50 },
    ],
  },
  // Donkey
  {
    animalType: "Donkey",
    produces: [
      { id: "draft", name: "Draft Service", unit: "day", unitDescription: "Per day of work", defaultPrice: 50 },
      { id: "meat_animal", name: "Sale", unit: "animal", unitDescription: "Per animal (live)", defaultPrice: 2000 },
    ],
  },
  // Horse
  {
    animalType: "Horse",
    produces: [
      { id: "draft", name: "Draft/Riding Service", unit: "day", unitDescription: "Per day of service", defaultPrice: 100 },
      { id: "meat_animal", name: "Sale", unit: "animal", unitDescription: "Per animal (live)", defaultPrice: 5000 },
    ],
  },
  // Dog
  {
    animalType: "Dog",
    produces: [
      { id: "guard", name: "Guard Service", unit: "month", unitDescription: "Per month", defaultPrice: 0 },
      { id: "meat_animal", name: "Sale (Puppies)", unit: "animal", unitDescription: "Per puppy", defaultPrice: 200 },
    ],
  },
  // Cat
  {
    animalType: "Cat",
    produces: [
      { id: "pest_control", name: "Pest Control", unit: "month", unitDescription: "Per month", defaultPrice: 0 },
      { id: "meat_animal", name: "Sale (Kittens)", unit: "animal", unitDescription: "Per kitten", defaultPrice: 50 },
    ],
  },
  
  // ============ AQUACULTURE ============
  // Tilapia
  {
    animalType: "Tilapia",
    produces: [
      { id: "meat_kg", name: "Fish", unit: "kg", unitDescription: "Per kilogram", defaultPrice: 35 },
      { id: "fingerlings", name: "Fingerlings", unit: "piece", unitDescription: "Per fingerling", defaultPrice: 0.5 },
    ],
  },
  // Catfish
  {
    animalType: "Catfish",
    produces: [
      { id: "meat_kg", name: "Fish", unit: "kg", unitDescription: "Per kilogram", defaultPrice: 40 },
      { id: "fingerlings", name: "Fingerlings", unit: "piece", unitDescription: "Per fingerling", defaultPrice: 0.8 },
    ],
  },
  // Carp
  {
    animalType: "Carp",
    produces: [
      { id: "meat_kg", name: "Fish", unit: "kg", unitDescription: "Per kilogram", defaultPrice: 30 },
      { id: "fingerlings", name: "Fingerlings", unit: "piece", unitDescription: "Per fingerling", defaultPrice: 0.4 },
    ],
  },
];

/**
 * Get produce types for a specific animal type
 * Supports exact match, partial match, and keyword-based matching
 */
export function getProduceTypes(animalType: string): ProduceType[] {
  const normalizedType = animalType.toLowerCase().trim();
  
  // Try exact match first
  let config = LIVESTOCK_PRODUCE.find(
    (c) => c.animalType.toLowerCase() === normalizedType
  );
  
  if (config) {
    return config.produces;
  }
  
  // Try partial match (e.g., "Layer" matches "Layer Chicken")
  config = LIVESTOCK_PRODUCE.find(
    (c) => c.animalType.toLowerCase().includes(normalizedType) ||
           normalizedType.includes(c.animalType.toLowerCase())
  );
  
  if (config) {
    return config.produces;
  }
  
  // Keyword-based matching for common terms
  const keywords: Record<string, string> = {
    "layer": "Layer Chicken",
    "broiler": "Broiler Chicken",
    "chicken": "Local Chicken",
    "cow": "Cattle",
    "bull": "Cattle",
    "calf": "Cattle",
    "dairy": "Cattle",
    "beef": "Cattle",
    "ram": "Sheep",
    "ewe": "Sheep",
    "lamb": "Sheep",
    "buck": "Goat",
    "doe": "Goat",
    "kid": "Goat",
    "piglet": "Pig",
    "sow": "Pig",
    "boar": "Pig",
    "swine": "Pig",
    "hog": "Pig",
    "snail": "Giant African Snail",
    "bee": "Honey Bee",
    "fish": "Tilapia",
  };
  
  for (const [keyword, mappedType] of Object.entries(keywords)) {
    if (normalizedType.includes(keyword)) {
      config = LIVESTOCK_PRODUCE.find(
        (c) => c.animalType.toLowerCase() === mappedType.toLowerCase()
      );
      if (config) {
        return config.produces;
      }
    }
  }
  
  // Default produce types for unknown animals
  return [
    { id: "meat_kg", name: "Meat", unit: "kg", unitDescription: "Per kilogram" },
    { id: "meat_animal", name: "Sale", unit: "animal", unitDescription: "Per animal (live)" },
  ];
}

/**
 * Get a specific produce type by ID
 */
export function getProduceById(animalType: string, produceId: string): ProduceType | null {
  const produces = getProduceTypes(animalType);
  return produces.find((p) => p.id === produceId) || null;
}

/**
 * Format price with unit for display
 */
export function formatProducePrice(price: number, produce: ProduceType): string {
  return `GHS ${price.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })} / ${produce.unit}`;
}
