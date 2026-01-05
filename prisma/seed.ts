import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

// Ghana Regions and Districts
const ghanaRegions = [
  {
    name: "Greater Accra",
    districts: ["Accra Metropolitan", "Tema Metropolitan", "Ga East", "Ga West", "Ga Central", "Ga South", "Ledzokuku", "Krowor", "La Dade Kotopon", "La Nkwantanang Madina", "Adentan", "Ashaiman", "Ada East", "Ada West", "Ningo Prampram", "Shai Osudoku"],
  },
  {
    name: "Ashanti",
    districts: ["Kumasi Metropolitan", "Obuasi Municipal", "Ejisu", "Asante Akim North", "Asante Akim Central", "Asante Akim South", "Bosomtwe", "Atwima Kwanwoma", "Atwima Nwabiagya North", "Atwima Nwabiagya South", "Amansie Central", "Amansie South", "Amansie West", "Adansi North", "Adansi South", "Bekwai Municipal", "Bosome Freho", "Ahafo Ano North", "Ahafo Ano South East", "Ahafo Ano South West"],
  },
  {
    name: "Western",
    districts: ["Sekondi-Takoradi Metropolitan", "Ahanta West", "Shama", "Wassa East", "Mpohor", "Tarkwa Nsuaem", "Prestea Huni Valley", "Ellembelle", "Nzema East", "Jomoro"],
  },
  {
    name: "Central",
    districts: ["Cape Coast Metropolitan", "Komenda Edina Eguafo Abirem", "Mfantsiman", "Abura Asebu Kwamankese", "Twifo Atti Morkwa", "Twifo Hemang Lower Denkyira", "Upper Denkyira East", "Upper Denkyira West", "Assin North", "Assin Central", "Assin South", "Ajumako Enyan Essiam", "Gomoa East", "Gomoa Central", "Gomoa West", "Effutu", "Awutu Senya East", "Awutu Senya West", "Agona East", "Agona West"],
  },
  {
    name: "Eastern",
    districts: ["New Juaben South", "New Juaben North", "Koforidua", "Akuapim North", "Akuapim South", "Akyem Mansa", "Birim North", "Birim Central", "Birim South", "West Akim", "East Akim", "Kwaebibirem", "Denkyembour", "Atiwa East", "Atiwa West", "Fanteakwa North", "Fanteakwa South", "Yilo Krobo", "Lower Manya Krobo", "Upper Manya Krobo", "Asuogyaman", "Suhum", "Ayensuano", "Upper West Akim", "Kwahu East", "Kwahu West", "Kwahu South", "Kwahu Afram Plains North", "Kwahu Afram Plains South"],
  },
  {
    name: "Volta",
    districts: ["Ho Municipal", "Ho West", "Adaklu", "Agortime Ziope", "South Tongu", "Central Tongu", "North Tongu", "Keta", "Ketu South", "Ketu North", "Akatsi South", "Akatsi North", "South Dayi", "North Dayi", "Afadzato South", "Hohoe"],
  },
  {
    name: "Northern",
    districts: ["Tamale Metropolitan", "Sagnarigu", "Savelugu", "Nanton", "Kumbungu", "Tolon", "Kpandai", "Nanumba North", "Nanumba South", "Zabzugu", "Tatale Sanguli", "Yendi", "Mion", "Saboba", "Chereponi", "Gushegu", "Karaga"],
  },
  {
    name: "Upper East",
    districts: ["Bolgatanga Municipal", "Bolgatanga East", "Bongo", "Talensi", "Nabdam", "Kassena Nankana West", "Kassena Nankana East", "Builsa North", "Builsa South", "Bawku Municipal", "Bawku West", "Binduri", "Garu", "Tempane", "Pusiga"],
  },
  {
    name: "Upper West",
    districts: ["Wa Municipal", "Wa East", "Wa West", "Nadowli Kaleo", "Daffiama Bussie Issa", "Jirapa", "Lambussie Karni", "Lawra", "Nandom", "Sissala East", "Sissala West"],
  },
  {
    name: "Bono",
    districts: ["Sunyani Municipal", "Sunyani West", "Dormaa Central", "Dormaa East", "Dormaa West", "Berekum East", "Berekum West", "Jaman North", "Jaman South", "Tain", "Wenchi", "Banda"],
  },
  {
    name: "Bono East",
    districts: ["Techiman Municipal", "Techiman North", "Nkoranza North", "Nkoranza South", "Atebubu Amantin", "Sene East", "Sene West", "Pru East", "Pru West", "Kintampo North", "Kintampo South"],
  },
  {
    name: "Ahafo",
    districts: ["Asunafo North", "Asunafo South", "Asutifi North", "Asutifi South", "Tano North", "Tano South"],
  },
  {
    name: "Western North",
    districts: ["Sefwi Wiawso", "Sefwi Akontombra", "Sefwi Bibiani Anhwiaso Bekwai", "Juaboso", "Bia East", "Bia West", "Bodi", "Suaman", "Aowin"],
  },
  {
    name: "Oti",
    districts: ["Krachi East", "Krachi West", "Krachi Nchumuru", "Nkwanta North", "Nkwanta South", "Biakoye", "Kadjebi", "Jasikan"],
  },
  {
    name: "North East",
    districts: ["Nalerigu Gambaga", "East Mamprusi", "West Mamprusi", "Mamprugu Moagduri", "Bunkpurugu Nakpanduri", "Yunyoo Nasuan"],
  },
  {
    name: "Savannah",
    districts: ["Damongo", "West Gonja", "Central Gonja", "East Gonja", "North Gonja", "Sawla Tuna Kalba", "Bole"],
  },
];

// Ghana Crops Database (49 crops from PRD)
const crops = [
  // Cereals
  { name: "Maize", category: "CEREALS_GRAINS", scientificName: "Zea mays", localNames: { twi: "Aburo", ga: "Abele", ewe: "Bli", hausa: "Masara", dagbani: "Kamana" }, growingSeasons: ["MAJOR", "MINOR"], daysToMaturity: { min: 90, max: 120 } },
  { name: "Rice", category: "CEREALS_GRAINS", scientificName: "Oryza sativa", localNames: { twi: "Emo", ga: "Momo", ewe: "Molu", hausa: "Shinkafa", dagbani: "Mui" }, growingSeasons: ["MAJOR", "MINOR"], daysToMaturity: { min: 120, max: 150 } },
  { name: "Millet", category: "CEREALS_GRAINS", scientificName: "Pennisetum glaucum", localNames: { twi: "Ayoyo", ga: "Ayilo", ewe: "Eli", hausa: "Gero", dagbani: "Zaafi" }, growingSeasons: ["MAJOR"], daysToMaturity: { min: 75, max: 90 } },
  { name: "Sorghum", category: "CEREALS_GRAINS", scientificName: "Sorghum bicolor", localNames: { twi: "Atoko", ga: "Atoko", ewe: "Atoko", hausa: "Dawa", dagbani: "Kaana" }, growingSeasons: ["MAJOR"], daysToMaturity: { min: 90, max: 120 } },
  { name: "Wheat", category: "CEREALS_GRAINS", scientificName: "Triticum aestivum", localNames: {}, growingSeasons: ["DRY"], daysToMaturity: { min: 100, max: 130 } },
  
  // Legumes
  { name: "Cowpea", category: "LEGUMES_PULSES", scientificName: "Vigna unguiculata", localNames: { twi: "Adua", ga: "Adua", ewe: "Ayikple", hausa: "Wake", dagbani: "Tuya" }, growingSeasons: ["MAJOR", "MINOR"], daysToMaturity: { min: 60, max: 90 } },
  { name: "Groundnut", category: "LEGUMES_PULSES", scientificName: "Arachis hypogaea", localNames: { twi: "Nkatie", ga: "Akate", ewe: "Aziti", hausa: "Gyada", dagbani: "Simkpang" }, growingSeasons: ["MAJOR", "MINOR"], daysToMaturity: { min: 90, max: 120 } },
  { name: "Soybean", category: "LEGUMES_PULSES", scientificName: "Glycine max", localNames: { twi: "Soya", hausa: "Soya" }, growingSeasons: ["MAJOR"], daysToMaturity: { min: 100, max: 130 } },
  { name: "Bambara Beans", category: "LEGUMES_PULSES", scientificName: "Vigna subterranea", localNames: { twi: "Aboboe", hausa: "Kwaruru" }, growingSeasons: ["MAJOR"], daysToMaturity: { min: 90, max: 150 } },
  { name: "Pigeon Pea", category: "LEGUMES_PULSES", scientificName: "Cajanus cajan", localNames: {}, growingSeasons: ["MAJOR"], daysToMaturity: { min: 120, max: 180 } },
  
  // Roots & Tubers
  { name: "Cassava", category: "ROOTS_TUBERS", scientificName: "Manihot esculenta", localNames: { twi: "Bankye", ga: "Duade", ewe: "Agbeli", hausa: "Rogo", dagbani: "Chinchinga" }, growingSeasons: ["MAJOR", "MINOR"], daysToMaturity: { min: 270, max: 365 } },
  { name: "Yam", category: "ROOTS_TUBERS", scientificName: "Dioscorea spp.", localNames: { twi: "Bayere", ga: "Yele", ewe: "Te", hausa: "Doya", dagbani: "Nyuli" }, growingSeasons: ["MAJOR"], daysToMaturity: { min: 240, max: 300 } },
  { name: "Cocoyam", category: "ROOTS_TUBERS", scientificName: "Colocasia esculenta", localNames: { twi: "Mankani", ga: "Mankani", ewe: "Mankani", hausa: "Gwaza" }, growingSeasons: ["MAJOR"], daysToMaturity: { min: 180, max: 270 } },
  { name: "Sweet Potato", category: "ROOTS_TUBERS", scientificName: "Ipomoea batatas", localNames: { twi: "Atomo", ga: "Atomo", ewe: "Atomo", hausa: "Dankali" }, growingSeasons: ["MAJOR", "MINOR"], daysToMaturity: { min: 90, max: 150 } },
  { name: "Potato", category: "ROOTS_TUBERS", scientificName: "Solanum tuberosum", localNames: {}, growingSeasons: ["DRY"], daysToMaturity: { min: 90, max: 120 } },
  { name: "Ginger", category: "ROOTS_TUBERS", scientificName: "Zingiber officinale", localNames: { twi: "Akakaduro" }, growingSeasons: ["MAJOR"], daysToMaturity: { min: 240, max: 300 } },
  { name: "Turmeric", category: "ROOTS_TUBERS", scientificName: "Curcuma longa", localNames: {}, growingSeasons: ["MAJOR"], daysToMaturity: { min: 240, max: 300 } },
  
  // Vegetables
  { name: "Tomato", category: "VEGETABLES", scientificName: "Solanum lycopersicum", localNames: { twi: "Ntomtom", ga: "Tomato", ewe: "Tomato", hausa: "Tumatur" }, growingSeasons: ["MAJOR", "MINOR", "DRY"], daysToMaturity: { min: 60, max: 90 } },
  { name: "Pepper", category: "VEGETABLES", scientificName: "Capsicum spp.", localNames: { twi: "Mako", ga: "Mako", ewe: "Atadi", hausa: "Barkono" }, growingSeasons: ["MAJOR", "MINOR", "DRY"], daysToMaturity: { min: 60, max: 90 } },
  { name: "Onion", category: "VEGETABLES", scientificName: "Allium cepa", localNames: { twi: "Gyeene", ga: "Sabola", ewe: "Sabala", hausa: "Albasa" }, growingSeasons: ["DRY"], daysToMaturity: { min: 90, max: 150 } },
  { name: "Garden Egg", category: "VEGETABLES", scientificName: "Solanum melongena", localNames: { twi: "Nyaadewa", ga: "Nyanya", ewe: "Agbitsa" }, growingSeasons: ["MAJOR", "MINOR"], daysToMaturity: { min: 70, max: 90 } },
  { name: "Okra", category: "VEGETABLES", scientificName: "Abelmoschus esculentus", localNames: { twi: "Nkruma", ga: "Nkruma", ewe: "Fetri", hausa: "Kubewa" }, growingSeasons: ["MAJOR", "MINOR"], daysToMaturity: { min: 50, max: 65 } },
  { name: "Cabbage", category: "VEGETABLES", scientificName: "Brassica oleracea", localNames: {}, growingSeasons: ["DRY"], daysToMaturity: { min: 70, max: 100 } },
  { name: "Lettuce", category: "VEGETABLES", scientificName: "Lactuca sativa", localNames: {}, growingSeasons: ["DRY"], daysToMaturity: { min: 45, max: 60 } },
  { name: "Carrot", category: "VEGETABLES", scientificName: "Daucus carota", localNames: {}, growingSeasons: ["DRY"], daysToMaturity: { min: 70, max: 80 } },
  { name: "Cucumber", category: "VEGETABLES", scientificName: "Cucumis sativus", localNames: {}, growingSeasons: ["MAJOR", "MINOR"], daysToMaturity: { min: 50, max: 70 } },
  { name: "Watermelon", category: "VEGETABLES", scientificName: "Citrullus lanatus", localNames: {}, growingSeasons: ["DRY"], daysToMaturity: { min: 70, max: 90 } },
  
  // Fruits
  { name: "Pineapple", category: "FRUITS", scientificName: "Ananas comosus", localNames: { twi: "Aborobe" }, growingSeasons: ["MAJOR"], daysToMaturity: { min: 540, max: 720 } },
  { name: "Mango", category: "FRUITS", scientificName: "Mangifera indica", localNames: { twi: "Amango", hausa: "Mangoro" }, growingSeasons: ["DRY"], daysToMaturity: { min: 1095, max: 1825 } },
  { name: "Pawpaw", category: "FRUITS", scientificName: "Carica papaya", localNames: { twi: "Bofre", hausa: "Gwanda" }, growingSeasons: ["MAJOR", "MINOR"], daysToMaturity: { min: 270, max: 365 } },
  { name: "Banana", category: "FRUITS", scientificName: "Musa spp.", localNames: { twi: "Kwadu", hausa: "Ayaba" }, growingSeasons: ["MAJOR"], daysToMaturity: { min: 270, max: 365 } },
  { name: "Plantain", category: "FRUITS", scientificName: "Musa paradisiaca", localNames: { twi: "Borode", ga: "Borode", ewe: "Abladzo", hausa: "Agede" }, growingSeasons: ["MAJOR"], daysToMaturity: { min: 270, max: 365 } },
  { name: "Orange", category: "FRUITS", scientificName: "Citrus sinensis", localNames: { twi: "Ankaa" }, growingSeasons: ["DRY"], daysToMaturity: { min: 1095, max: 1460 } },
  { name: "Coconut", category: "FRUITS", scientificName: "Cocos nucifera", localNames: { twi: "Kube" }, growingSeasons: ["MAJOR"], daysToMaturity: { min: 1825, max: 2190 } },
  { name: "Avocado", category: "FRUITS", scientificName: "Persea americana", localNames: { twi: "Paya" }, growingSeasons: ["MAJOR"], daysToMaturity: { min: 1095, max: 1460 } },
  
  // Cash Crops
  { name: "Cocoa", category: "TREE_CROPS", scientificName: "Theobroma cacao", localNames: { twi: "Kokoo" }, growingSeasons: ["MAJOR", "MINOR"], daysToMaturity: { min: 1095, max: 1460 } },
  { name: "Oil Palm", category: "TREE_CROPS", scientificName: "Elaeis guineensis", localNames: { twi: "Abe" }, growingSeasons: ["MAJOR"], daysToMaturity: { min: 1095, max: 1460 } },
  { name: "Cashew", category: "TREE_CROPS", scientificName: "Anacardium occidentale", localNames: {}, growingSeasons: ["DRY"], daysToMaturity: { min: 1095, max: 1460 } },
  { name: "Shea", category: "TREE_CROPS", scientificName: "Vitellaria paradoxa", localNames: { twi: "Nku", hausa: "Kadanya" }, growingSeasons: ["DRY"], daysToMaturity: { min: 5475, max: 7300 } },
  { name: "Cotton", category: "TREE_CROPS", scientificName: "Gossypium spp.", localNames: { hausa: "Auduga" }, growingSeasons: ["MAJOR"], daysToMaturity: { min: 150, max: 180 } },
  { name: "Tobacco", category: "TREE_CROPS", scientificName: "Nicotiana tabacum", localNames: { twi: "Tawa" }, growingSeasons: ["DRY"], daysToMaturity: { min: 90, max: 120 } },
  { name: "Rubber", category: "TREE_CROPS", scientificName: "Hevea brasiliensis", localNames: {}, growingSeasons: ["MAJOR"], daysToMaturity: { min: 2190, max: 2555 } },
  { name: "Coffee", category: "TREE_CROPS", scientificName: "Coffea spp.", localNames: {}, growingSeasons: ["MAJOR"], daysToMaturity: { min: 1095, max: 1460 } },
  { name: "Sugarcane", category: "TREE_CROPS", scientificName: "Saccharum officinarum", localNames: { twi: "Ahwedeɛ" }, growingSeasons: ["MAJOR"], daysToMaturity: { min: 300, max: 365 } },
  
  // Spices
  { name: "Black Pepper", category: "VEGETABLES", scientificName: "Piper nigrum", localNames: {}, growingSeasons: ["MAJOR"], daysToMaturity: { min: 1095, max: 1460 } },
  { name: "Chili Pepper", category: "VEGETABLES", scientificName: "Capsicum frutescens", localNames: { twi: "Mako ketewa" }, growingSeasons: ["MAJOR", "MINOR"], daysToMaturity: { min: 60, max: 90 } },
  
  // Others
  { name: "Kenaf", category: "VEGETABLES", scientificName: "Hibiscus cannabinus", localNames: {}, growingSeasons: ["MAJOR"], daysToMaturity: { min: 120, max: 150 } },
  { name: "Jute", category: "VEGETABLES", scientificName: "Corchorus spp.", localNames: {}, growingSeasons: ["MAJOR"], daysToMaturity: { min: 120, max: 150 } },
  { name: "Mushroom", category: "VEGETABLES", scientificName: "Various", localNames: { twi: "Mmire" }, growingSeasons: ["MAJOR", "MINOR"], daysToMaturity: { min: 21, max: 35 } },
];

// Livestock Database (25 types from PRD)
const livestock = [
  // Poultry
  { name: "Local Chicken", category: "POULTRY", scientificName: "Gallus gallus domesticus", localNames: { twi: "Akoko", ga: "Koklo", ewe: "Koklotsu", hausa: "Kaza" }, maturityAge: 180, productionType: ["EGGS", "MEAT"] },
  { name: "Broiler Chicken", category: "POULTRY", scientificName: "Gallus gallus domesticus", localNames: {}, maturityAge: 42, productionType: ["MEAT"] },
  { name: "Layer Chicken", category: "POULTRY", scientificName: "Gallus gallus domesticus", localNames: {}, maturityAge: 140, productionType: ["EGGS"] },
  { name: "Turkey", category: "POULTRY", scientificName: "Meleagris gallopavo", localNames: { twi: "Krakum", hausa: "Talotalo" }, maturityAge: 150, productionType: ["MEAT"] },
  { name: "Duck", category: "POULTRY", scientificName: "Anas platyrhynchos", localNames: { twi: "Dabodabo", hausa: "Agwagwa" }, maturityAge: 70, productionType: ["EGGS", "MEAT"] },
  { name: "Guinea Fowl", category: "POULTRY", scientificName: "Numida meleagris", localNames: { twi: "Akokonini", hausa: "Zabo" }, maturityAge: 120, productionType: ["EGGS", "MEAT"] },
  { name: "Quail", category: "POULTRY", scientificName: "Coturnix coturnix", localNames: {}, maturityAge: 42, productionType: ["EGGS", "MEAT"] },
  { name: "Pigeon", category: "POULTRY", scientificName: "Columba livia", localNames: { twi: "Aboronoma" }, maturityAge: 180, productionType: ["MEAT"] },
  { name: "Ostrich", category: "POULTRY", scientificName: "Struthio camelus", localNames: {}, maturityAge: 730, productionType: ["EGGS", "MEAT", "LEATHER"] },
  
  // Ruminants
  { name: "Cattle", category: "RUMINANTS", scientificName: "Bos taurus", localNames: { twi: "Nantwi", ga: "Nao", ewe: "Nyitsu", hausa: "Shanu" }, maturityAge: 730, productionType: ["MILK", "MEAT", "LEATHER"] },
  { name: "Goat", category: "RUMINANTS", scientificName: "Capra aegagrus hircus", localNames: { twi: "Abirekyi", ga: "Aboo", ewe: "Gbɔ", hausa: "Akuya" }, maturityAge: 365, productionType: ["MILK", "MEAT"] },
  { name: "Sheep", category: "RUMINANTS", scientificName: "Ovis aries", localNames: { twi: "Odwan", ga: "Gbele", ewe: "Alẽ", hausa: "Tunkiya" }, maturityAge: 365, productionType: ["MEAT", "WOOL"] },
  
  // Pigs
  { name: "Pig", category: "PIGS", scientificName: "Sus scrofa domesticus", localNames: { twi: "Prako", ga: "Prako", ewe: "Ha", hausa: "Alade" }, maturityAge: 180, productionType: ["MEAT"] },
  
  // Rabbits
  { name: "Rabbit", category: "NON_CONVENTIONAL", scientificName: "Oryctolagus cuniculus", localNames: { twi: "Asoawa" }, maturityAge: 120, productionType: ["MEAT", "FUR"] },
  
  // Grasscutter
  { name: "Grasscutter", category: "NON_CONVENTIONAL", scientificName: "Thryonomys swinderianus", localNames: { twi: "Akrantie", ga: "Akrantie", ewe: "Eda", hausa: "Gafiya" }, maturityAge: 240, productionType: ["MEAT"] },
  
  // Snails
  { name: "Giant African Snail", category: "NON_CONVENTIONAL", scientificName: "Achatina achatina", localNames: { twi: "Nwa", ga: "Kpokpo", ewe: "Agbeli" }, maturityAge: 365, productionType: ["MEAT"] },
  
  // Bees
  { name: "Honey Bee", category: "NON_CONVENTIONAL", scientificName: "Apis mellifera", localNames: { twi: "Wo", hausa: "Zuma" }, maturityAge: 21, productionType: ["HONEY", "WAX"] },
  
  // Fish (Aquaculture)
  { name: "Tilapia", category: "AQUACULTURE", scientificName: "Oreochromis niloticus", localNames: { twi: "Apɛtɛ", hausa: "Karfasa" }, maturityAge: 180, productionType: ["MEAT"] },
  { name: "Catfish", category: "AQUACULTURE", scientificName: "Clarias gariepinus", localNames: { twi: "Adwene", hausa: "Tarwada" }, maturityAge: 180, productionType: ["MEAT"] },
  { name: "Carp", category: "AQUACULTURE", scientificName: "Cyprinus carpio", localNames: {}, maturityAge: 365, productionType: ["MEAT"] },
  
  // Others
  { name: "Donkey", category: "NON_CONVENTIONAL", scientificName: "Equus asinus", localNames: { twi: "Afunumu", hausa: "Jaki" }, maturityAge: 1095, productionType: ["DRAFT"] },
  { name: "Horse", category: "NON_CONVENTIONAL", scientificName: "Equus caballus", localNames: { twi: "Ɔpɔnkɔ", hausa: "Doki" }, maturityAge: 1460, productionType: ["DRAFT"] },
  { name: "Dog", category: "NON_CONVENTIONAL", scientificName: "Canis lupus familiaris", localNames: { twi: "Ɔkraman", hausa: "Kare" }, maturityAge: 365, productionType: ["GUARD"] },
  { name: "Cat", category: "NON_CONVENTIONAL", scientificName: "Felis catus", localNames: { twi: "Agyinamoa", hausa: "Kyanwa" }, maturityAge: 365, productionType: ["PEST_CONTROL"] },
  { name: "Camel", category: "RUMINANTS", scientificName: "Camelus dromedarius", localNames: { hausa: "Rakumi" }, maturityAge: 1825, productionType: ["MILK", "MEAT", "DRAFT"] },
];

// Fertilizers Database
const fertilizers = [
  { name: "NPK 15-15-15", type: "COMPOUND", composition: { N: 15, P: 15, K: 15 }, applicationRate: "200-400 kg/ha", description: "Balanced compound fertilizer for general use" },
  { name: "NPK 20-10-10", type: "COMPOUND", composition: { N: 20, P: 10, K: 10 }, applicationRate: "200-300 kg/ha", description: "High nitrogen compound for leafy crops" },
  { name: "NPK 23-10-5", type: "COMPOUND", composition: { N: 23, P: 10, K: 5 }, applicationRate: "200-300 kg/ha", description: "Cocoa fertilizer" },
  { name: "Urea", type: "NITROGEN", composition: { N: 46 }, applicationRate: "50-100 kg/ha", description: "High nitrogen fertilizer for top dressing" },
  { name: "Sulphate of Ammonia", type: "NITROGEN", composition: { N: 21, S: 24 }, applicationRate: "100-200 kg/ha", description: "Nitrogen and sulphur source" },
  { name: "Triple Super Phosphate", type: "PHOSPHORUS", composition: { P: 46 }, applicationRate: "50-100 kg/ha", description: "High phosphorus for root development" },
  { name: "Single Super Phosphate", type: "PHOSPHORUS", composition: { P: 18, S: 12 }, applicationRate: "100-200 kg/ha", description: "Phosphorus and sulphur source" },
  { name: "Muriate of Potash", type: "POTASSIUM", composition: { K: 60 }, applicationRate: "50-100 kg/ha", description: "High potassium for fruiting" },
  { name: "Sulphate of Potash", type: "POTASSIUM", composition: { K: 50, S: 18 }, applicationRate: "50-100 kg/ha", description: "Potassium and sulphur source" },
  { name: "Poultry Manure", type: "ORGANIC", composition: { N: 3, P: 2, K: 2 }, applicationRate: "2-5 tons/ha", description: "Organic fertilizer from poultry" },
  { name: "Cow Dung", type: "ORGANIC", composition: { N: 1.5, P: 1, K: 1.5 }, applicationRate: "5-10 tons/ha", description: "Organic fertilizer from cattle" },
  { name: "Compost", type: "ORGANIC", composition: { N: 1, P: 0.5, K: 1 }, applicationRate: "5-10 tons/ha", description: "Decomposed organic matter" },
];

// Ghana Markets
const markets = [
  // Greater Accra
  { name: "Makola Market", region: "Greater Accra", district: "Accra Metropolitan", type: "WHOLESALE", coordinates: { lat: 5.5500, lng: -0.2100 } },
  { name: "Agbogbloshie Market", region: "Greater Accra", district: "Accra Metropolitan", type: "WHOLESALE", coordinates: { lat: 5.5450, lng: -0.2250 } },
  { name: "Madina Market", region: "Greater Accra", district: "La Nkwantanang Madina", type: "RETAIL", coordinates: { lat: 5.6800, lng: -0.1700 } },
  { name: "Tema Market", region: "Greater Accra", district: "Tema Metropolitan", type: "WHOLESALE", coordinates: { lat: 5.6700, lng: -0.0200 } },
  { name: "Ashaiman Market", region: "Greater Accra", district: "Ashaiman", type: "RETAIL", coordinates: { lat: 5.6900, lng: -0.0400 } },
  
  // Ashanti
  { name: "Kumasi Central Market", region: "Ashanti", district: "Kumasi Metropolitan", type: "WHOLESALE", coordinates: { lat: 6.6885, lng: -1.6244 } },
  { name: "Kejetia Market", region: "Ashanti", district: "Kumasi Metropolitan", type: "WHOLESALE", coordinates: { lat: 6.6900, lng: -1.6200 } },
  { name: "Adum Market", region: "Ashanti", district: "Kumasi Metropolitan", type: "RETAIL", coordinates: { lat: 6.6850, lng: -1.6150 } },
  
  // Northern
  { name: "Tamale Central Market", region: "Northern", district: "Tamale Metropolitan", type: "WHOLESALE", coordinates: { lat: 9.4075, lng: -0.8533 } },
  
  // Western
  { name: "Takoradi Market", region: "Western", district: "Sekondi-Takoradi Metropolitan", type: "WHOLESALE", coordinates: { lat: 4.8900, lng: -1.7500 } },
  
  // Central
  { name: "Cape Coast Market", region: "Central", district: "Cape Coast Metropolitan", type: "RETAIL", coordinates: { lat: 5.1050, lng: -1.2450 } },
  
  // Eastern
  { name: "Koforidua Market", region: "Eastern", district: "New Juaben South", type: "WHOLESALE", coordinates: { lat: 6.0940, lng: -0.2570 } },
  
  // Volta
  { name: "Ho Market", region: "Volta", district: "Ho Municipal", type: "RETAIL", coordinates: { lat: 6.6000, lng: 0.4700 } },
  
  // Bono
  { name: "Sunyani Market", region: "Bono", district: "Sunyani Municipal", type: "RETAIL", coordinates: { lat: 7.3400, lng: -2.3300 } },
  { name: "Techiman Market", region: "Bono East", district: "Techiman Municipal", type: "WHOLESALE", coordinates: { lat: 7.5900, lng: -1.9400 } },
  
  // Upper East
  { name: "Bolgatanga Market", region: "Upper East", district: "Bolgatanga Municipal", type: "RETAIL", coordinates: { lat: 10.7900, lng: -0.8500 } },
  
  // Upper West
  { name: "Wa Market", region: "Upper West", district: "Wa Municipal", type: "RETAIL", coordinates: { lat: 10.0600, lng: -2.5000 } },
];

async function main() {
  console.log("🌱 Starting seed...");

  // Seed Regions and Districts
  console.log("📍 Seeding regions and districts...");
  for (const region of ghanaRegions) {
    const createdRegion = await prisma.region.upsert({
      where: { name: region.name },
      update: {},
      create: { name: region.name },
    });

    for (const districtName of region.districts) {
      await prisma.district.upsert({
        where: {
          regionId_name: {
            regionId: createdRegion.id,
            name: districtName,
          },
        },
        update: {},
        create: {
          name: districtName,
          regionId: createdRegion.id,
        },
      });
    }
  }
  console.log(`✅ Seeded ${ghanaRegions.length} regions`);

  // Seed Crops
  console.log("🌾 Seeding crops...");
  for (const crop of crops) {
    const existing = await prisma.crop.findFirst({
      where: { englishName: crop.name },
    });
    if (!existing) {
      await prisma.crop.create({
        data: {
          englishName: crop.name,
          category: crop.category as any,
          scientificName: crop.scientificName,
          localNames: crop.localNames,
          plantingInfo: { growingSeasons: crop.growingSeasons },
          cropCycle: { daysToMaturity: crop.daysToMaturity },
        },
      });
    }
  }
  console.log(`✅ Seeded ${crops.length} crops`);

  // Seed Livestock
  console.log("🐄 Seeding livestock...");
  for (const animal of livestock) {
    const existing = await prisma.livestock.findFirst({
      where: { englishName: animal.name },
    });
    if (!existing) {
      await prisma.livestock.create({
        data: {
          englishName: animal.name,
          category: animal.category as any,
          scientificName: animal.scientificName,
          localNames: animal.localNames,
          productionMetrics: { maturityAgeDays: animal.maturityAge, productionTypes: animal.productionType },
        },
      });
    }
  }
  console.log(`✅ Seeded ${livestock.length} livestock types`);

  // Seed Livestock Breeds
  console.log("🐄 Seeding livestock breeds...");
  const livestockBreeds = [
    // Cattle breeds
    { livestockName: "Cattle", breeds: ["N'Dama", "West African Shorthorn", "Sanga", "Zebu", "Holstein Friesian", "Jersey", "Brown Swiss", "Brahman"] },
    // Goat breeds
    { livestockName: "Goat", breeds: ["West African Dwarf", "Sahelian", "Red Sokoto", "Boer", "Kalahari Red", "Anglo-Nubian"] },
    // Sheep breeds
    { livestockName: "Sheep", breeds: ["West African Dwarf", "Sahelian", "Djallonke", "Nungua Blackhead", "Dorper"] },
    // Pig breeds
    { livestockName: "Pig", breeds: ["Large White", "Landrace", "Duroc", "Hampshire", "Ashanti Black", "Local Pig"] },
    // Chicken breeds
    { livestockName: "Local Chicken", breeds: ["Naked Neck", "Frizzle Feather", "Normal Feather", "Dwarf"] },
    { livestockName: "Layer Chicken", breeds: ["Lohmann Brown", "Isa Brown", "Hyline", "Bovans", "Shaver"] },
    { livestockName: "Broiler Chicken", breeds: ["Cobb 500", "Ross 308", "Arbor Acres", "Hubbard"] },
    // Turkey breeds
    { livestockName: "Turkey", breeds: ["Bronze", "White Holland", "Bourbon Red", "Local Turkey"] },
    // Duck breeds
    { livestockName: "Duck", breeds: ["Khaki Campbell", "Pekin", "Muscovy", "Indian Runner", "Local Duck"] },
    // Rabbit breeds
    { livestockName: "Rabbit", breeds: ["New Zealand White", "Californian", "Chinchilla", "Dutch", "Local Rabbit"] },
  ];

  for (const item of livestockBreeds) {
    const livestock = await prisma.livestock.findFirst({
      where: { englishName: item.livestockName },
    });
    
    if (livestock) {
      for (const breedName of item.breeds) {
        const existingBreed = await prisma.livestockBreed.findFirst({
          where: { 
            livestockId: livestock.id,
            name: breedName,
          },
        });
        
        if (!existingBreed) {
          await prisma.livestockBreed.create({
            data: {
              livestockId: livestock.id,
              name: breedName,
            },
          });
        }
      }
    }
  }
  console.log(`✅ Seeded livestock breeds`);

  // Seed Fertilizers
  console.log("🧪 Seeding fertilizers...");
  for (const fertilizer of fertilizers) {
    const existing = await prisma.fertilizer.findFirst({
      where: { name: fertilizer.name },
    });
    if (!existing) {
      await prisma.fertilizer.create({
        data: {
          name: fertilizer.name,
          type: fertilizer.type,
          composition: fertilizer.composition,
          applicationRate: fertilizer.applicationRate,
        },
      });
    }
  }
  console.log(`✅ Seeded ${fertilizers.length} fertilizers`);

  // Seed Markets
  console.log("🏪 Seeding markets...");
  for (const market of markets) {
    const region = await prisma.region.findUnique({
      where: { name: market.region },
    });
    
    if (region) {
      const existing = await prisma.market.findFirst({
        where: { name: market.name },
      });
      if (!existing) {
        await prisma.market.create({
          data: {
            name: market.name,
            region: market.region,
            type: market.type,
            latitude: market.coordinates.lat,
            longitude: market.coordinates.lng,
          },
        });
      }
    }
  }
  console.log(`✅ Seeded ${markets.length} markets`);

  // Seed Test Users
  console.log("👤 Seeding test users...");
  const testUsers = [
    {
      email: "demo@ghfarmer.com",
      password: "Demo@123",
      name: "Demo Farmer",
      phone: "+233201234567",
      accountType: "FARMER",
      farmerType: "SMALLHOLDER",
      role: "USER",
      subscription: "FREE",
      region: "Greater Accra",
      district: "Accra Metropolitan",
    },
    {
      email: "admin@ghfarmer.com",
      password: "Admin@123",
      name: "Admin User",
      phone: "+233209876543",
      accountType: "FARMER",
      farmerType: "COMMERCIAL",
      role: "ADMIN",
      subscription: "ENTERPRISE",
      region: "Ashanti",
      district: "Kumasi Metropolitan",
    },
  ];

  for (const user of testUsers) {
    const existingUser = await prisma.user.findUnique({
      where: { email: user.email },
    });

    if (!existingUser) {
      const hashedPassword = await bcrypt.hash(user.password, 12);
      const createdUser = await prisma.user.create({
        data: {
          email: user.email,
          password: hashedPassword,
          name: user.name,
          phone: user.phone,
          accountType: user.accountType as any,
          farmerType: user.farmerType as any,
          role: user.role as any,
          subscription: user.subscription as any,
          region: user.region,
          district: user.district,
        },
      });

      // Create a sample farm for demo user
      if (user.email === "demo@ghfarmer.com") {
        await prisma.farm.create({
          data: {
            userId: createdUser.id,
            name: "Demo Farm",
            size: 5.5,
            sizeUnit: "HECTARES",
            region: user.region,
            district: user.district,
            address: "Near Tema Motorway, Accra",
            latitude: 5.6037,
            longitude: -0.1870,
          },
        });
      }
    }
  }
  console.log(`✅ Seeded ${testUsers.length} test users`);

  // Seed Service Providers
  console.log("🏪 Seeding service providers...");
  const serviceProviders = [
    {
      email: "vet@ghfarmer.com",
      password: "Vet@123",
      name: "Dr. Kwame Mensah",
      phone: "+233241234567",
      accountType: "VETERINARIAN",
      region: "Greater Accra",
      district: "Accra Metropolitan",
      businessName: "Accra Veterinary Services",
      businessType: "VETERINARIAN",
      description: "Experienced veterinarian specializing in livestock health, vaccinations, and disease treatment. Over 15 years of experience serving farmers in the Greater Accra region.",
      licenseNumber: "VET-GH-2010-0456",
      yearsExperience: 15,
      specializations: ["Cattle", "Poultry", "Goats", "Sheep", "Pigs"],
      services: [
        { title: "Farm Visit Consultation", category: "VETERINARY_CONSULTATION", price: 150, priceUnit: "per visit" },
        { title: "Vaccination Service", category: "VACCINATION_SERVICE", price: 20, priceUnit: "per animal" },
        { title: "Deworming Service", category: "DEWORMING_SERVICE", price: 15, priceUnit: "per animal" },
        { title: "Emergency Treatment", category: "VETERINARY_CONSULTATION", price: 250, priceUnit: "per visit" },
      ],
    },
    {
      email: "supplier@ghfarmer.com",
      password: "Supplier@123",
      name: "Kofi Asante",
      phone: "+233551234567",
      accountType: "SUPPLIER",
      region: "Ashanti",
      district: "Kumasi Metropolitan",
      businessName: "Kumasi Agro Supplies",
      businessType: "INPUT_SUPPLIER",
      description: "Your one-stop shop for quality agricultural inputs. We supply seeds, fertilizers, pesticides, and farm tools at competitive prices with delivery across Ashanti region.",
      yearsExperience: 8,
      specializations: ["Seeds", "Fertilizers", "Pesticides", "Farm Tools"],
      products: [
        { name: "NPK 15-15-15 Fertilizer", category: "FERTILIZERS", price: 280, unit: "50kg bag" },
        { name: "Urea Fertilizer", category: "FERTILIZERS", price: 220, unit: "50kg bag" },
        { name: "Maize Seeds (Obatanpa)", category: "SEEDS", price: 45, unit: "kg" },
        { name: "Tomato Seeds (Pectomech)", category: "SEEDS", price: 120, unit: "100g pack" },
        { name: "Glyphosate Herbicide", category: "HERBICIDES", price: 85, unit: "litre" },
      ],
    },
    {
      email: "extension@ghfarmer.com",
      password: "Extension@123",
      name: "Ama Serwaa",
      phone: "+233271234567",
      accountType: "EXTENSION_OFFICER",
      region: "Eastern",
      district: "Koforidua Municipal",
      businessName: "Eastern Region Agri Advisory",
      businessType: "EXTENSION_OFFICER",
      description: "Certified agricultural extension officer with expertise in crop management, soil health, and sustainable farming practices. I help farmers improve yields through modern techniques.",
      licenseNumber: "MOFA-EXT-2015-0123",
      yearsExperience: 10,
      specializations: ["Crop Management", "Soil Testing", "Pest Control", "Irrigation"],
      services: [
        { title: "Farm Assessment & Advisory", category: "FARM_ADVISORY", price: 200, priceUnit: "per visit" },
        { title: "Soil Testing & Analysis", category: "SOIL_TESTING", price: 150, priceUnit: "per sample" },
        { title: "Crop Disease Diagnosis", category: "DISEASE_DIAGNOSIS", price: 100, priceUnit: "per visit" },
        { title: "Farmer Training Workshop", category: "TRAINING_WORKSHOP", price: 50, priceUnit: "per person" },
      ],
    },
    {
      email: "buyer@ghfarmer.com",
      password: "Buyer@123",
      name: "Yaw Boateng",
      phone: "+233301234567",
      accountType: "BUYER",
      region: "Greater Accra",
      district: "Tema Metropolitan",
      businessName: "Tema Fresh Produce Aggregators",
      businessType: "OTHER",
      description: "We buy fresh produce directly from farmers at fair prices. Specializing in vegetables, fruits, and grains for export and local supermarkets.",
      yearsExperience: 12,
      specializations: ["Vegetables", "Fruits", "Grains", "Export Quality Produce"],
    },
    {
      email: "feedsupplier@ghfarmer.com",
      password: "Feed@123",
      name: "Abena Owusu",
      phone: "+233261234567",
      accountType: "SUPPLIER",
      region: "Ashanti",
      district: "Ejisu Municipal",
      businessName: "Golden Feeds Ghana",
      businessType: "FEED_SUPPLIER",
      description: "Premium quality animal feeds for poultry, cattle, pigs, and fish. Formulated by experts for optimal growth and health.",
      yearsExperience: 6,
      specializations: ["Poultry Feed", "Cattle Feed", "Pig Feed", "Fish Feed"],
      products: [
        { name: "Layer Mash Feed", category: "POULTRY_FEED", price: 185, unit: "50kg bag" },
        { name: "Broiler Starter Feed", category: "POULTRY_FEED", price: 195, unit: "50kg bag" },
        { name: "Broiler Finisher Feed", category: "POULTRY_FEED", price: 180, unit: "50kg bag" },
        { name: "Cattle Feed Concentrate", category: "CATTLE_FEED", price: 160, unit: "50kg bag" },
        { name: "Tilapia Floating Feed", category: "FISH_FEED", price: 250, unit: "25kg bag" },
      ],
    },
    {
      email: "livestockinputs@ghfarmer.com",
      password: "Livestock@123",
      name: "Emmanuel Adjei",
      phone: "+233241987654",
      accountType: "SUPPLIER",
      region: "Greater Accra",
      district: "Tema Metropolitan",
      businessName: "Tema Livestock Supplies",
      businessType: "LIVESTOCK_INPUT_SUPPLIER",
      description: "Complete livestock input solutions - from day-old chicks to vaccines, equipment, and feed supplements. Serving poultry, cattle, pig, and goat farmers across Ghana.",
      yearsExperience: 10,
      specializations: ["Poultry Inputs", "Cattle Inputs", "Pig Inputs", "Vaccines", "Equipment"],
      products: [
        { name: "Day-Old Broiler Chicks", category: "DAY_OLD_CHICKS", price: 12, unit: "chick" },
        { name: "Day-Old Layer Chicks", category: "DAY_OLD_CHICKS", price: 15, unit: "chick" },
        { name: "Newcastle Disease Vaccine", category: "VACCINES", price: 45, unit: "100 doses" },
        { name: "Gumboro Vaccine", category: "VACCINES", price: 55, unit: "100 doses" },
        { name: "Ivermectin Dewormer", category: "DEWORMERS", price: 35, unit: "100ml" },
        { name: "Vitamin Premix", category: "FEED_SUPPLEMENTS", price: 85, unit: "kg" },
        { name: "Calcium Supplement", category: "FEED_SUPPLEMENTS", price: 45, unit: "kg" },
        { name: "Poultry Drinker (5L)", category: "POULTRY_EQUIPMENT", price: 25, unit: "piece" },
        { name: "Poultry Feeder (10kg)", category: "POULTRY_EQUIPMENT", price: 35, unit: "piece" },
        { name: "Heat Lamp for Brooding", category: "POULTRY_EQUIPMENT", price: 120, unit: "piece" },
        { name: "Farm Disinfectant", category: "DISINFECTANTS", price: 65, unit: "5L" },
        { name: "Wood Shavings Bedding", category: "LIVESTOCK_BEDDING", price: 40, unit: "bale" },
      ],
    },
    {
      email: "hatchery@ghfarmer.com",
      password: "Hatchery@123",
      name: "Grace Osei",
      phone: "+233551876543",
      accountType: "SUPPLIER",
      region: "Ashanti",
      district: "Kumasi Metropolitan",
      businessName: "Kumasi Premier Hatchery",
      businessType: "HATCHERY_SUPPLIER",
      description: "Quality day-old chicks from imported parent stock. We supply broilers, layers, and local breeds with vaccination and delivery services.",
      yearsExperience: 7,
      specializations: ["Broiler DOCs", "Layer DOCs", "Local Breeds", "Hatching Eggs"],
      products: [
        { name: "Cobb 500 Broiler DOCs", category: "DAY_OLD_CHICKS", price: 14, unit: "chick" },
        { name: "Ross 308 Broiler DOCs", category: "DAY_OLD_CHICKS", price: 13, unit: "chick" },
        { name: "Lohmann Brown Layer DOCs", category: "DAY_OLD_CHICKS", price: 18, unit: "chick" },
        { name: "ISA Brown Layer DOCs", category: "DAY_OLD_CHICKS", price: 17, unit: "chick" },
        { name: "Local Sasso DOCs", category: "DAY_OLD_CHICKS", price: 20, unit: "chick" },
        { name: "Hatching Eggs (Fertile)", category: "DAY_OLD_CHICKS", price: 5, unit: "egg" },
      ],
    },
    {
      email: "animalhealth@ghfarmer.com",
      password: "Health@123",
      name: "Dr. Akosua Mensah",
      phone: "+233271654321",
      accountType: "SUPPLIER",
      region: "Eastern",
      district: "Koforidua Municipal",
      businessName: "Eastern Animal Health Products",
      businessType: "ANIMAL_HEALTH_SUPPLIER",
      description: "Licensed supplier of veterinary drugs, vaccines, and animal health products. We stock genuine products from reputable manufacturers.",
      licenseNumber: "FDA-VET-2018-0789",
      yearsExperience: 8,
      specializations: ["Vaccines", "Antibiotics", "Dewormers", "Supplements", "Disinfectants"],
      products: [
        { name: "Oxytetracycline Injectable", category: "ANTIBIOTICS", price: 120, unit: "100ml" },
        { name: "Tylosin Powder", category: "ANTIBIOTICS", price: 85, unit: "100g" },
        { name: "Albendazole Dewormer", category: "DEWORMERS", price: 45, unit: "1L" },
        { name: "Piperazine Dewormer", category: "DEWORMERS", price: 35, unit: "500ml" },
        { name: "Multivitamin Injection", category: "FEED_SUPPLEMENTS", price: 55, unit: "100ml" },
        { name: "Iron Dextran Injection", category: "FEED_SUPPLEMENTS", price: 65, unit: "100ml" },
        { name: "Foot & Mouth Disease Vaccine", category: "VACCINES", price: 150, unit: "50 doses" },
        { name: "Anthrax Vaccine", category: "VACCINES", price: 180, unit: "50 doses" },
        { name: "Virkon S Disinfectant", category: "DISINFECTANTS", price: 95, unit: "1kg" },
      ],
    },
  ];

  for (const provider of serviceProviders) {
    const existingUser = await prisma.user.findUnique({
      where: { email: provider.email },
    });

    if (!existingUser) {
      const hashedPassword = await bcrypt.hash(provider.password, 12);
      
      // Create user
      const createdUser = await prisma.user.create({
        data: {
          email: provider.email,
          password: hashedPassword,
          name: provider.name,
          phone: provider.phone,
          accountType: provider.accountType as any,
          farmerType: "SMALLHOLDER",
          role: "USER",
          subscription: "FREE",
          region: provider.region,
          district: provider.district,
        },
      });

      // Create service provider profile
      const createdProvider = await prisma.serviceProvider.create({
        data: {
          userId: createdUser.id,
          businessName: provider.businessName,
          businessType: provider.businessType as any,
          description: provider.description,
          phone: provider.phone,
          email: provider.email,
          region: provider.region,
          district: provider.district,
          licenseNumber: provider.licenseNumber,
          yearsExperience: provider.yearsExperience,
          specializations: provider.specializations,
          isVerified: provider.licenseNumber ? true : false,
          verifiedAt: provider.licenseNumber ? new Date() : null,
          rating: 4.0 + Math.random() * 0.9, // Random rating between 4.0 and 4.9
          reviewCount: Math.floor(Math.random() * 20) + 5,
        },
      });

      // Create services if any
      if ('services' in provider && provider.services) {
        for (const service of provider.services) {
          await prisma.serviceListing.create({
            data: {
              providerId: createdProvider.id,
              title: service.title,
              category: service.category as any,
              price: service.price,
              priceUnit: service.priceUnit,
              priceType: "FIXED",
              serviceLocation: "BOTH",
              isAvailable: true,
              status: "ACTIVE",
            },
          });
        }
      }

      // Create products if any
      if ('products' in provider && provider.products) {
        for (const product of provider.products) {
          await prisma.productListing.create({
            data: {
              providerId: createdProvider.id,
              name: product.name,
              category: product.category as any,
              price: product.price,
              unit: product.unit,
              inStock: true,
              stockQuantity: Math.floor(Math.random() * 100) + 20,
              status: "ACTIVE",
            },
          });
        }
      }

      console.log(`  ✓ Created provider: ${provider.businessName}`);
    }
  }
  console.log(`✅ Seeded ${serviceProviders.length} service providers`);

  // Seed Subscription Plans
  console.log("💳 Seeding subscription plans...");
  
  const subscriptionPlans = [
    {
      name: "Free",
      slug: "free",
      description: "Get started with basic farm management",
      priceMonthly: 0,
      priceYearly: 0,
      targetAudience: "FARMER",
      maxFarms: 1,
      maxPlots: 5,
      maxRecordsPerMonth: 50,
      maxUsers: 1,
      maxPriceAlerts: 3,
      maxDseRecommendations: 5,
      maxExportsPerMonth: 0,
      maxListings: 5,
      features: {
        advancedAnalytics: false,
        realTimePrices: false,
        weatherForecasts: false,
        exportReports: false,
        offlineMode: false,
        prioritySupport: false,
        inventoryManagement: false,
        multiUserAccess: false,
        apiAccess: false,
        bulkOperations: false,
        financialIntegration: false,
        loanEligibilityReports: false,
        unlimitedDse: false,
        supplierIntegration: false,
      },
      isPopular: false,
      displayOrder: 1,
    },
    {
      name: "Pro",
      slug: "pro",
      description: "For serious farmers who want to grow",
      priceMonthly: 65,
      priceYearly: 650,
      targetAudience: "FARMER",
      maxFarms: -1,
      maxPlots: -1,
      maxRecordsPerMonth: -1,
      maxUsers: 1,
      maxPriceAlerts: -1,
      maxDseRecommendations: 10,
      maxExportsPerMonth: 20,
      maxListings: 20,
      features: {
        advancedAnalytics: true,
        realTimePrices: true,
        weatherForecasts: true,
        exportReports: true,
        offlineMode: true,
        prioritySupport: true,
        inventoryManagement: false,
        multiUserAccess: false,
        apiAccess: false,
        bulkOperations: false,
        financialIntegration: false,
        loanEligibilityReports: false,
        unlimitedDse: false,
        supplierIntegration: false,
      },
      isPopular: true,
      displayOrder: 2,
    },
    {
      name: "Business",
      slug: "business",
      description: "For commercial farms and agribusinesses",
      priceMonthly: 200,
      priceYearly: 2000,
      targetAudience: "FARMER",
      maxFarms: -1,
      maxPlots: -1,
      maxRecordsPerMonth: -1,
      maxUsers: 5,
      maxPriceAlerts: -1,
      maxDseRecommendations: -1,
      maxExportsPerMonth: -1,
      maxListings: -1,
      features: {
        advancedAnalytics: true,
        realTimePrices: true,
        weatherForecasts: true,
        exportReports: true,
        offlineMode: true,
        prioritySupport: true,
        inventoryManagement: true,
        multiUserAccess: true,
        apiAccess: true,
        bulkOperations: true,
        financialIntegration: true,
        loanEligibilityReports: true,
        unlimitedDse: true,
        supplierIntegration: true,
      },
      isPopular: false,
      displayOrder: 3,
    },
    {
      name: "Enterprise",
      slug: "enterprise",
      description: "Custom solutions for large organizations",
      priceMonthly: 0,
      priceYearly: 0,
      targetAudience: "BOTH",
      maxFarms: -1,
      maxPlots: -1,
      maxRecordsPerMonth: -1,
      maxUsers: -1,
      maxPriceAlerts: -1,
      maxDseRecommendations: -1,
      maxExportsPerMonth: -1,
      maxListings: -1,
      features: {
        advancedAnalytics: true,
        realTimePrices: true,
        weatherForecasts: true,
        exportReports: true,
        offlineMode: true,
        prioritySupport: true,
        inventoryManagement: true,
        multiUserAccess: true,
        apiAccess: true,
        bulkOperations: true,
        financialIntegration: true,
        loanEligibilityReports: true,
        unlimitedDse: true,
        supplierIntegration: true,
        whiteLabel: true,
        dedicatedSupport: true,
        customReporting: true,
        slaGuarantee: true,
      },
      isPopular: false,
      displayOrder: 4,
    },
    // Service Provider Plans
    {
      name: "Provider Basic",
      slug: "provider-basic",
      description: "Free listing for service providers",
      priceMonthly: 0,
      priceYearly: 0,
      targetAudience: "SERVICE_PROVIDER",
      maxFarms: 0,
      maxPlots: 0,
      maxRecordsPerMonth: 0,
      maxUsers: 1,
      maxPriceAlerts: 0,
      maxDseRecommendations: 0,
      maxExportsPerMonth: 0,
      maxListings: 5,
      features: {
        verifiedBadge: false,
        featuredInSearch: false,
        analytics: false,
        directMessaging: false,
        bookingManagement: false,
        promotionalTools: false,
      },
      isPopular: false,
      displayOrder: 10,
    },
    {
      name: "Provider Verified",
      slug: "provider-verified",
      description: "Verified provider with enhanced visibility",
      priceMonthly: 100,
      priceYearly: 1000,
      targetAudience: "SERVICE_PROVIDER",
      maxFarms: 0,
      maxPlots: 0,
      maxRecordsPerMonth: 0,
      maxUsers: 1,
      maxPriceAlerts: 0,
      maxDseRecommendations: 0,
      maxExportsPerMonth: 0,
      maxListings: -1,
      features: {
        verifiedBadge: true,
        featuredInSearch: true,
        analytics: true,
        directMessaging: true,
        bookingManagement: true,
        promotionalTools: false,
      },
      isPopular: true,
      displayOrder: 11,
    },
    {
      name: "Provider Premium",
      slug: "provider-premium",
      description: "Premium provider with all features",
      priceMonthly: 300,
      priceYearly: 3000,
      targetAudience: "SERVICE_PROVIDER",
      maxFarms: 0,
      maxPlots: 0,
      maxRecordsPerMonth: 0,
      maxUsers: 3,
      maxPriceAlerts: 0,
      maxDseRecommendations: 0,
      maxExportsPerMonth: 0,
      maxListings: -1,
      features: {
        verifiedBadge: true,
        featuredInSearch: true,
        analytics: true,
        directMessaging: true,
        bookingManagement: true,
        promotionalTools: true,
        homepageFeatured: true,
        priorityRecommendations: true,
        bulkMessaging: true,
      },
      isPopular: false,
      displayOrder: 12,
    },
  ];

  for (const plan of subscriptionPlans) {
    const existingPlan = await prisma.subscriptionPlan.findUnique({
      where: { slug: plan.slug },
    });

    if (!existingPlan) {
      await prisma.subscriptionPlan.create({
        data: {
          name: plan.name,
          slug: plan.slug,
          description: plan.description,
          priceMonthly: plan.priceMonthly,
          priceYearly: plan.priceYearly,
          targetAudience: plan.targetAudience as any,
          maxFarms: plan.maxFarms,
          maxPlots: plan.maxPlots,
          maxRecordsPerMonth: plan.maxRecordsPerMonth,
          maxUsers: plan.maxUsers,
          maxPriceAlerts: plan.maxPriceAlerts,
          maxDseRecommendations: plan.maxDseRecommendations,
          maxExportsPerMonth: plan.maxExportsPerMonth,
          maxListings: plan.maxListings,
          features: plan.features,
          isPopular: plan.isPopular,
          displayOrder: plan.displayOrder,
          isActive: true,
        },
      });
      console.log(`  ✓ Created plan: ${plan.name}`);
    }
  }
  console.log(`✅ Seeded ${subscriptionPlans.length} subscription plans`);

  // Seed Feature Flags
  console.log("🚩 Seeding feature flags...");
  
  const featureFlags = [
    { name: "advanced_analytics", displayName: "Advanced Analytics", requiredPlan: "PROFESSIONAL" as const },
    { name: "real_time_prices", displayName: "Real-time Market Prices", requiredPlan: "PROFESSIONAL" as const },
    { name: "weather_forecasts", displayName: "7-Day Weather Forecasts", requiredPlan: "PROFESSIONAL" as const },
    { name: "export_reports", displayName: "Export Reports (PDF/Excel)", requiredPlan: "PROFESSIONAL" as const },
    { name: "offline_mode", displayName: "Offline Mode", requiredPlan: "PROFESSIONAL" as const },
    { name: "priority_support", displayName: "Priority Support", requiredPlan: "PROFESSIONAL" as const },
    { name: "inventory_management", displayName: "Inventory Management", requiredPlan: "ENTERPRISE" as const },
    { name: "multi_user_access", displayName: "Multi-user Access", requiredPlan: "ENTERPRISE" as const },
    { name: "api_access", displayName: "API Access", requiredPlan: "ENTERPRISE" as const },
    { name: "bulk_operations", displayName: "Bulk Operations", requiredPlan: "ENTERPRISE" as const },
    { name: "financial_integration", displayName: "Financial Integration", requiredPlan: "ENTERPRISE" as const },
    { name: "loan_eligibility_reports", displayName: "Loan Eligibility Reports", requiredPlan: "ENTERPRISE" as const },
    { name: "unlimited_dse", displayName: "Unlimited AI Recommendations", requiredPlan: "ENTERPRISE" as const },
    { name: "supplier_integration", displayName: "Supplier Integration", requiredPlan: "ENTERPRISE" as const },
  ];

  for (const flag of featureFlags) {
    const existing = await prisma.featureFlag.findUnique({
      where: { name: flag.name },
    });

    if (!existing) {
      await prisma.featureFlag.create({
        data: {
          name: flag.name,
          displayName: flag.displayName,
          requiredPlan: flag.requiredPlan as any,
          isEnabled: true,
          rolloutPercentage: 100,
        },
      });
    }
  }
  console.log(`✅ Seeded ${featureFlags.length} feature flags`);

  console.log("🎉 Seed completed successfully!");
}

main()
  .catch((e) => {
    console.error("❌ Seed failed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
