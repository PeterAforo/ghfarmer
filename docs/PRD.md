# Ghana Farmer - Product Requirements Document (PRD)

**Version:** 1.0  
**Date:** December 22, 2025  
**Document Owner:** [Your Name]  
**Status:** Draft

---

## 1. EXECUTIVE SUMMARY

### 1.1 Product Overview
Ghana Farmer is a mobile-first SaaS platform designed to empower Ghanaian crop and livestock farmers with digital tools for farm management, market access, financial tracking, and agricultural intelligence. The platform serves both smallholder and commercial farmers across all regions of Ghana.

### 1.2 Problem Statement
Ghanaian farmers face multiple challenges:
- Limited access to real-time market prices and buyers
- Poor record-keeping leading to inability to track profitability
- Lack of timely agricultural information (weather, pest alerts, best practices)
- Difficulty accessing financial services and government programs
- Fragmented supply chains and limited market linkages
- Knowledge gaps in modern farming techniques

### 1.3 Solution
A comprehensive mobile-first platform providing:
- Digital farm management tools (crop/livestock tracking)
- Market intelligence and buyer connections
- Financial management and mobile money integration
- Pre-populated agricultural knowledge base
- Weather and climate information
- Partnership integrations (MoFA, cooperatives, NGOs, financial institutions)

### 1.4 Success Metrics
- 50,000+ registered farmers within 12 months
- 70%+ monthly active user rate
- 30%+ increase in farmer income (measured through surveys)
- 100+ verified buyers/offtakers on platform
- 20+ strategic partnerships established
- 4.5+ star rating in app stores

---

## 2. PRODUCT VISION & GOALS

### 2.1 Vision Statement
"To digitally transform Ghanaian agriculture by putting comprehensive farm management, market access, and agricultural intelligence in the hands of every farmer."

### 2.2 Strategic Goals
1. **Accessibility**: Reach farmers in all regions with mobile-first, offline-capable, multi-language platform
2. **Comprehensiveness**: Support ALL crops and livestock farmed in Ghana
3. **Actionability**: Provide timely, relevant information that drives farmer decisions
4. **Profitability**: Help farmers increase income by 30% within first year
5. **Partnerships**: Integrate with government, NGOs, financial institutions, and buyers
6. **Sustainability**: Build a viable business model that sustains and grows the platform

### 2.3 Target Launch Date

#### Phase 1: Web SaaS Application
- **MVP Launch:** Q2 2026 (6 months from project start)
- **Full Version 1.0:** Q4 2026 (12 months from project start)

#### Phase 2: Native Mobile Apps
- **Mobile MVP:** Q1 2027 (15 months from project start)
- **Mobile V1.0:** Q2 2027 (18 months from project start)

---

## 3. TARGET USERS

### 3.1 Primary User Segments

#### 3.1.1 Smallholder Farmers (70% of user base)
- Farm size: 0.5 - 5 hectares
- Mixed farming (2-3 crops + 1-2 livestock types)
- Limited literacy (40-50% basic education)
- Income: GHS 5,000 - 30,000/year
- Mobile device: Basic smartphone (Android)
- Data access: Limited, intermittent connectivity
- Primary needs: Simple tracking, market prices, weather alerts, basic financials

#### 3.1.2 Commercial Farmers (30% of user base)
- Farm size: 5+ hectares or large livestock operations
- Specialized or diversified operations
- Higher education levels
- Income: GHS 30,000+/year
- Mobile device: Smartphones with better specs
- Data access: More consistent connectivity
- Primary needs: Advanced analytics, multi-farm management, staff tracking, detailed financials

### 3.2 Secondary Users
- **Extension Officers**: MoFA agents supporting farmers
- **Cooperative Managers**: Managing farmer groups
- **Buyers/Offtakers**: Sourcing produce from farmers
- **Input Suppliers**: Selling seeds, fertilizers, equipment
- **Financial Institutions**: Providing loans and insurance

---

## 4. USER PERSONAS

### Persona 1: Akosua (Smallholder Farmer)
- **Age:** 42
- **Location:** Ashanti Region (rural)
- **Education:** Basic education
- **Farm:** 2 hectares maize, 1 hectare cassava, 20 chickens (layers)
- **Languages:** Twi (primary), Basic English
- **Device:** Samsung Galaxy A04 (entry-level Android)
- **Connectivity:** 2G/3G, intermittent
- **Pain Points:** 
  - Doesn't know best prices for crops
  - Forgets when to apply fertilizer or vaccinate chickens
  - No idea if farming is profitable
  - Can't access loans due to poor records
- **Goals:** Increase income to pay children's school fees, reduce crop losses

### Persona 2: Kwame (Commercial Farmer)
- **Age:** 35
- **Location:** Brong-Ahafo Region
- **Education:** Agricultural diploma
- **Farm:** 20 hectares cashew, 10 hectares maize, 500 broilers
- **Languages:** English (primary), Twi
- **Device:** Samsung Galaxy S21 (mid-range smartphone)
- **Connectivity:** 4G, reliable
- **Pain Points:**
  - Managing multiple farm operations manually
  - Tracking 5 farm workers' activities
  - Analyzing which crops are most profitable
  - Meeting export quality standards for cashew
- **Goals:** Expand operations, improve efficiency, export cashew internationally

### Persona 3: Abena (Extension Officer)
- **Age:** 31
- **Location:** Central Region
- **Education:** BSc Agriculture
- **Responsibility:** 200+ farmers in 10 communities
- **Languages:** English, Fante, Twi
- **Pain Points:**
  - Can't track all farmers effectively
  - No digital way to share information
  - Difficult to report impact to MoFA
- **Goals:** Support more farmers efficiently, demonstrate impact

---

## 5. CORE FEATURES & REQUIREMENTS

### 5.1 FEATURE PRIORITY FRAMEWORK

**P0 (Must Have - MVP):** Critical for launch  
**P1 (Should Have - V1.0):** Important for full version  
**P2 (Nice to Have - Future):** Enhancement for later versions

---

### 5.2 AUTHENTICATION & USER MANAGEMENT

#### 5.2.1 Registration & Onboarding (P0)
**Requirements:**
- Phone number-based registration (SMS OTP verification)
- Alternative: Email registration
- Profile setup wizard:
  - Personal info (name, location: region/district/community)
  - Farm size
  - Primary language selection (English, Twi, Ga, Ewe, Hausa, Dagbani)
  - Farmer type (smallholder/commercial)
  - Enterprise selection (crops & livestock)
- Tutorial/walkthrough on first launch
- Terms of service and privacy policy acceptance

**User Stories:**
- As a new user, I want to register using my phone number so that I can access the platform quickly
- As a farmer, I want to select my language preference so that I can use the app in my native language
- As a farmer, I want to specify what I farm during onboarding so that the app shows relevant information

#### 5.2.2 User Profile Management (P0)
**Requirements:**
- View and edit profile information
- Change language preference
- Manage notification preferences
- Profile photo upload
- Farmer ID integration (for MoFA partnership)
- Account deletion option

---

### 5.3 FARM MANAGEMENT SYSTEM

#### 5.3.1 Farm Setup (P0)
**Requirements:**
- Add multiple farms/locations
- Specify farm size (hectares/acres)
- Map location (GPS coordinates)
- Photo upload for farm
- Farm naming/identification

#### 5.3.2 Crop Management (P0)

**Data Model:**
```
Crop Entry:
- Crop type (from predefined list)
- Variety/cultivar
- Land area planted
- Planting date
- Expected harvest date (auto-calculated from crop cycle)
- Status (planned, planted, growing, harvesting, completed)
- Plot/field identifier
- Photo documentation
```

**Features:**
- Add new crop entry (select from comprehensive list)
- Track multiple plantings of same crop
- Activity logging:
  - Land preparation (date, method, cost)
  - Planting (date, seed source, quantity, cost)
  - Fertilizer application (date, type, quantity, cost)
  - Pest/disease treatment (date, issue, treatment, cost)
  - Irrigation (frequency, method)
  - Weeding (date, method, cost)
  - Harvesting (date, quantity, quality grade)
- Photo uploads at each stage
- Notes/observations field
- Cost tracking per activity
- Yield recording
- Post-harvest management (storage, sales)

**Pre-populated Crop Data Required:**
For each crop (see full list in Section 6):
- Common diseases in Ghana (name, symptoms, photos, treatments)
- Common pests (name, identification, control methods)
- Recommended fertilizer schedule
- Typical crop cycle duration
- Water requirements
- Best planting seasons by region
- Recommended varieties for Ghana
- Harvest indicators
- Market quality standards
- Storage requirements

**User Stories:**
- As a farmer, I want to log when I planted maize so that I can track the growing season
- As a farmer, I want to see common maize diseases with photos so that I can identify problems early
- As a farmer, I want to record my harvest quantity so that I can track productivity

#### 5.3.3 Livestock Management (P0)

**Data Model:**
```
Livestock Entry:
- Animal type (from predefined list)
- Breed
- Identification (tag number, name, photo)
- Date acquired/birth date
- Age
- Gender
- Source (purchased, born on farm)
- Current status (active, sold, deceased)
- Location (pen/paddock/cage number)
```

**Features:**
- Animal registration (individual or batch for poultry)
- Health records:
  - Vaccination history (date, vaccine type, next due date with auto-reminders)
  - Deworming schedule
  - Disease/illness tracking (symptoms, diagnosis, treatment, cost)
  - Veterinary visits
  - Mortality records (date, cause)
- Breeding records:
  - Breeding date
  - Sire/Dam identification
  - Gestation/incubation tracking
  - Birth/hatching date
  - Offspring count
  - Weaning date
- Production tracking:
  - **For layers:** Daily egg count, egg grades
  - **For dairy:** Milk production volume
  - **For meat animals:** Weight measurements, growth rate
- Feeding records:
  - Feed type and quantity
  - Feeding costs
  - Feed conversion ratio (automatic calculation)
- Sales records:
  - Sale date, quantity/number, price, buyer

**Pre-populated Livestock Data Required:**
For each animal type (see full list in Section 6):
- Common diseases (name, symptoms, photos, treatments)
- Vaccination schedules (vaccine type, frequency, animal age)
- Deworming schedules
- Common medications
- Production cycles (gestation periods, egg-laying cycles, etc.)
- Feeding guidelines (type, quantity by age/weight)
- Growth benchmarks
- Breed characteristics
- Housing requirements
- Market weight targets

**User Stories:**
- As a farmer, I want to track each chicken's vaccination so that I don't miss any doses
- As a farmer, I want to log daily egg production so that I can identify low-performing birds
- As a farmer, I want to be reminded when deworming is due so that I maintain animal health

#### 5.3.4 Aquaculture Management (P1)

**Data Model:**
```
Pond/Tank Entry:
- Pond/tank identification
- Size (m² or m³)
- Fish species
- Stocking date
- Stocking density (fingerlings per m²)
- Current status
```

**Features:**
- Water quality monitoring (pH, temperature, dissolved oxygen)
- Feeding records and calculations
- Growth sampling
- Partial harvest tracking
- Disease monitoring
- Production cycle management

**Pre-populated Aquaculture Data:**
- Fish species profiles (tilapia, catfish)
- Water quality parameters
- Disease identification
- Feeding rates by fish size
- Growth benchmarks
- Market size targets

---

### 5.4 CALENDAR & TASK MANAGEMENT (P0)

**Requirements:**
- Unified calendar showing all farm activities
- Automatic task generation based on:
  - Crop cycles (fertilizer application, harvest windows)
  - Livestock schedules (vaccination due, deworming)
  - Custom tasks added by farmer
- Task categories:
  - Urgent (overdue, due today)
  - Upcoming (due within 7 days)
  - Planned (future tasks)
- Task completion marking
- Push notifications for upcoming/overdue tasks
- SMS reminders (for users with limited data)
- Filter by enterprise type (crops/livestock)

**User Stories:**
- As a farmer, I want to see all upcoming tasks in one place so that I don't forget important activities
- As a farmer, I want to receive reminders before vaccinations are due so that I can prepare
- As a farmer, I want to mark tasks as complete so that I can track what's been done

---

### 5.5 FINANCIAL MANAGEMENT (P0)

#### 5.5.1 Expense Tracking
**Requirements:**
- Log expenses by category:
  - Seeds/planting materials
  - Fertilizers
  - Pesticides/herbicides
  - Veterinary medicines
  - Feed
  - Labor
  - Equipment rental
  - Transportation
  - Other inputs
- Attach to specific crop/livestock
- Photo upload (receipts)
- Date, amount, description
- Payment method (cash, mobile money, credit)

#### 5.5.2 Income Tracking
**Requirements:**
- Log sales:
  - Product sold (crop/livestock/produce)
  - Quantity
  - Price per unit
  - Total amount
  - Buyer name/contact
  - Date
  - Payment method
- Bulk entry option for market sales
- Receipt generation (PDF)

#### 5.5.3 Financial Reports (P0)
**Requirements:**
- Dashboard showing:
  - Total income (current month, season, year)
  - Total expenses (current month, season, year)
  - Net profit/loss
  - Profit by enterprise (which crops/livestock are most profitable)
  - Cash flow visualization
- Filter by date range
- Filter by enterprise
- Export reports (PDF, Excel)
- Basic financial metrics:
  - Return on investment (ROI)
  - Cost per unit produced
  - Revenue per hectare/animal

#### 5.5.4 Mobile Money Integration (P1)
**Requirements:**
- Link MTN Mobile Money account
- Link Vodafone Cash account
- Link AirtelTigo Money account
- Automatic transaction import
- Categorization of imported transactions
- Payment links for buyers

**User Stories:**
- As a farmer, I want to track all my expenses so that I know how much I'm spending
- As a farmer, I want to see which crops are most profitable so that I can make better planting decisions
- As a farmer, I want to send invoices to buyers via mobile money so that I get paid faster

---

### 5.6 MARKET INTELLIGENCE (P0)

#### 5.6.1 Market Prices
**Requirements:**
- Daily price updates for all crops and livestock
- Prices by market location:
  - Accra (Agbogbloshie, Makola)
  - Kumasi (Kejetia)
  - Tamale (Central Market)
  - Techiman Market
  - Regional markets
- Price trends (7 days, 30 days, seasonal)
- Price comparison by location
- Price alerts (when price reaches target)
- Historical price data

#### 5.6.2 Marketplace (P1)
**Requirements:**
- List produce for sale:
  - Product type and quantity
  - Quality grade
  - Price expectation
  - Location
  - Available date
  - Photos
  - Contact preference
- Browse available produce
- Filter by product, location, quantity
- Contact seller (in-app messaging or direct call)
- Buyer verification system (ratings, reviews)
- Featured listings (for premium users)
- Transaction completion marking

#### 5.6.3 Buyer Directory (P1)
**Requirements:**
- Directory of verified buyers:
  - Aggregators
  - Processors
  - Exporters
  - Wholesalers
  - Retailers
- Buyer profiles:
  - Products they buy
  - Locations they operate
  - Contact information
  - Quality requirements
  - Payment terms
  - Ratings and reviews
- Contract farming opportunities
- Direct contact option

**User Stories:**
- As a farmer, I want to check current market prices before I sell so that I get fair prices
- As a farmer, I want to list my tomatoes for sale so that buyers can find me
- As a farmer, I want to find verified buyers for my cashew so that I don't get cheated

---

### 5.7 AGRICULTURAL INTELLIGENCE (P0)

#### 5.7.1 Weather Information
**Requirements:**
- Current weather by location
- 7-day forecast
- 14-day outlook (P1)
- Rainfall predictions
- Temperature alerts (extreme heat/cold)
- Planting window recommendations
- Harvest window alerts (rain forecasts)
- Wind speed (for spraying activities)
- Integration with Ghana Meteorological Agency data

#### 5.7.2 Pest & Disease Alerts (P1)
**Requirements:**
- Regional pest/disease outbreak notifications
- Seasonal alerts (e.g., fall armyworm season)
- Identification guides with photos
- Treatment recommendations
- Preventive measures
- Extension contact for serious outbreaks

#### 5.7.3 Advisory Services (P1)
**Requirements:**
- Seasonal farming advisories by region
- Best practice guides for each crop/livestock
- Video tutorials (short, mobile-optimized)
- MoFA bulletins and circulars
- Research findings (from CSIR institutes)
- Success stories from other farmers

#### 5.7.4 AI Crop/Livestock Diagnosis (P2)
**Requirements:**
- Photo upload of crop leaf/plant/animal
- AI identification of disease/pest
- Treatment recommendations
- Severity assessment
- Similar cases database

**User Stories:**
- As a farmer, I want to see the weather forecast so that I can plan spraying activities
- As a farmer, I want to be alerted about pest outbreaks in my region so that I can take preventive action
- As a farmer, I want to upload a photo of my sick crop to identify the disease

---

### 5.8 KNOWLEDGE BASE (P1)

**Requirements:**
- Searchable library organized by:
  - Crop type
  - Livestock type
  - Topic (planting, fertilizing, harvesting, disease management, etc.)
  - Language
- Content types:
  - Text articles
  - Videos (hosted externally, streamed)
  - Infographics
  - Photo galleries
  - Audio (for low-literacy users)
- Offline download option
- Bookmark favorite content
- Share content via WhatsApp, SMS
- User ratings and comments
- Recommended content based on user's enterprises

**Content Categories:**
- Land preparation techniques
- Planting best practices
- Fertilizer application guides
- Integrated pest management
- Harvesting and post-harvest handling
- Animal husbandry practices
- Disease management protocols
- Equipment operation and maintenance
- Financial management for farmers
- Market access strategies
- Climate-smart agriculture

---

### 5.9 COMMUNITY & SUPPORT (P1)

#### 5.9.1 Farmer Forum
**Requirements:**
- Q&A discussion board
- Post questions
- Answer questions
- Upvote helpful answers
- Tag by topic/crop/livestock
- Search past discussions
- Expert verification badge (for extension officers, verified experts)
- Moderation system
- Report inappropriate content

#### 5.9.2 Farmer Groups/Cooperatives
**Requirements:**
- Create or join groups
- Group chat/messaging
- Share documents, photos
- Announce meetings
- Group buying coordination
- Shared marketplace listings
- Group savings tracking (VSLA)
- Member directory

#### 5.9.3 Extension Officer Connection
**Requirements:**
- Find nearest extension officers
- Direct messaging
- Request farm visit
- Share farm data with extension officer
- Receive personalized advice

**User Stories:**
- As a farmer, I want to ask other farmers about cassava diseases so that I can learn from their experience
- As a farmer, I want to join my cooperative's group so that we can coordinate group sales
- As a farmer, I want to contact an extension officer when I have serious problems

---

### 5.10 GOVERNMENT & PROGRAM INTEGRATION (P1)

#### 5.10.1 Planting for Food and Jobs (PFJ)
**Requirements:**
- Program information and eligibility
- Application submission
- Subsidy tracking
- Input collection scheduling
- Compliance reporting

#### 5.10.2 Farmer Registration
**Requirements:**
- MoFA farmer ID integration
- Digital farmer profile
- Farm registration
- Export documents

#### 5.10.3 Subsidy Programs
**Requirements:**
- Program announcements
- Eligibility checker
- Application forms
- Status tracking
- Benefit history

---

### 5.11 INPUT SUPPLY CHAIN (P1)

**Requirements:**
- Directory of input suppliers:
  - Seed companies
  - Fertilizer dealers
  - Agro-chemical shops
  - Veterinary suppliers
  - Equipment vendors
  - Feed mills
- Supplier verification badges
- Product catalog with prices
- Location and contact
- Delivery services info
- Credit facility information
- User ratings and reviews
- Order placement (P2)
- Group buying coordination

---

### 5.12 FINANCIAL SERVICES INTEGRATION (P1)

#### 5.12.1 Agricultural Loans
**Requirements:**
- Loan products directory (banks, MFIs, credit unions)
- Eligibility calculator
- Application forms
- Required documents checklist
- Application status tracking
- Repayment schedule
- Payment reminders
- Loan history

#### 5.12.2 Insurance
**Requirements:**
- Crop insurance information
- Livestock insurance information
- Insurance provider directory
- Premium calculator
- Claims process guide
- Policy management

#### 5.12.3 Savings
**Requirements:**
- Savings goals tracking
- VSLA (Village Savings and Loan Association) management
- Contribution tracking
- Automated savings recommendations

**User Stories:**
- As a farmer, I want to see loan options so that I can finance my next planting season
- As a farmer, I want to track my VSLA contributions so that I know my savings balance

---

### 5.13 MULTI-LANGUAGE SUPPORT (P0)

**Requirements:**
- App interface translation in:
  - English
  - Twi
  - Ga
  - Ewe
  - Hausa
  - Dagbani
- Pre-populated data (crops, livestock, diseases) with local names
- Voice interface option (P2)
- Text-to-speech for key information (P2)
- Language switching in settings
- Default language based on location

---

### 5.14 OFFLINE FUNCTIONALITY (P0)

**Requirements:**
- Core features work offline:
  - Add/edit farm data
  - Log activities and expenses
  - View calendar and tasks
  - Access saved knowledge base content
- Data sync when connection available
- Sync status indicator
- Conflict resolution (last-write-wins with notification)
- Download content for offline use (weather, prices, articles)
- Offline data storage limit: 500MB

---

### 5.15 NOTIFICATIONS & ALERTS (P0)

**Requirements:**
- Push notifications (when app is installed)
- SMS fallback (when data is unavailable)
- Notification types:
  - Task reminders (vaccinations due, harvest window, etc.)
  - Weather alerts (rain, extreme conditions)
  - Market price alerts (target price reached)
  - Pest/disease outbreak alerts
  - Program announcements (government, partner organizations)
  - Messages from buyers/extension officers
- Notification preferences:
  - Enable/disable by type
  - Preferred time for non-urgent notifications
  - SMS vs. push preference
- In-app notification center

---

### 5.16 REPORTING & ANALYTICS (P1)

**Requirements:**
- Pre-built report templates:
  - Seasonal summary (crops planted, livestock raised, financials)
  - Enterprise profitability comparison
  - Input usage report
  - Production trends
  - Sales report
- Custom date ranges
- Visual charts and graphs
- Export to PDF, Excel, CSV
- Share reports (email, WhatsApp)

**Commercial Farmer Additional Analytics (P1):**
- Yield per hectare trends
- Labor productivity
- Feed conversion ratios
- Cost per unit analysis
- Multi-season comparisons
- Enterprise portfolio optimization suggestions

---

### 5.17 SETTINGS & PREFERENCES (P0)

**Requirements:**
- Language selection
- Units of measurement (metric/imperial)
- Currency (GHS, USD)
- Notification preferences
- Data sync preferences (WiFi only, mobile data)
- Privacy settings
- Account management (change phone/email, password)
- App version info
- Help & support
- Terms of service
- Privacy policy

---

## 6. PRE-POPULATED DATA REQUIREMENTS

### 6.1 COMPREHENSIVE CROP DATABASE

For EACH of the following crops, the system must be pre-populated with:

#### 6.1.1 Crop List (All Categories)

**Cereals & Grains:**
1. Maize
2. Rice
3. Sorghum
4. Millet
5. Wheat

**Roots & Tubers:**
6. Cassava
7. Yam
8. Cocoyam (Xanthosoma)
9. Cocoyam (Colocasia)
10. Plantain
11. Sweet Potato

**Legumes & Pulses:**
12. Soybeans
13. Groundnuts/Peanuts
14. Cowpeas (Black-eyed peas)
15. Bambara beans

**Tree Crops:**
16. Cocoa
17. Cashew
18. Oil Palm
19. Shea
20. Rubber
21. Coconut
22. Mango (tree)
23. Coffee

**Vegetables:**
24. Tomatoes
25. Onions
26. Shallots
27. Sweet Peppers
28. Chili Peppers
29. Hot Peppers
30. Okra
31. Eggplant (Garden eggs)
32. African Eggplant
33. Cabbage
34. Carrots
35. Lettuce
36. Cucumber
37. Local Spinach (Amaranthus)
38. Kontomire (Cocoyam leaves)
39. Jute Mallow (Ayoyo)
40. Turkey Berry

**Fruits:**
41. Pineapple
42. Mango (fruit)
43. Papaya
44. Banana
45. Oranges
46. Lemons
47. Limes
48. Watermelon
49. Avocado

#### 6.1.2 Data Structure for Each Crop

```json
{
  "crop_id": "unique_identifier",
  "english_name": "Maize",
  "scientific_name": "Zea mays",
  "local_names": {
    "twi": "Aburo",
    "ga": "Akple",
    "ewe": "Bli",
    "hausa": "Masara",
    "dagbani": "Zaab"
  },
  "category": "cereals_grains",
  "varieties": [
    {
      "name": "Obatanpa",
      "type": "Improved variety",
      "maturity_days": 90,
      "characteristics": "High yielding, drought tolerant"
    }
  ],
  "crop_cycle": {
    "land_preparation_days": 7,
    "planting_to_germination_days": 7,
    "germination_to_flowering_days": 45,
    "flowering_to_maturity_days": 30,
    "total_days_to_harvest": 90,
    "post_harvest_handling": "Dry to 13% moisture"
  },
  "planting_info": {
    "best_planting_seasons": [
      {"region": "Northern", "months": ["May", "June"]},
      {"region": "Forest", "months": ["March", "April", "September"]}
    ],
    "seed_rate_per_hectare": "25-30 kg",
    "spacing": "75cm x 25cm",
    "planting_depth": "5-7 cm"
  },
  "soil_requirements": {
    "type": "Well-drained loam",
    "ph_range": "5.5 - 7.0"
  },
  "water_requirements": {
    "rainfall_mm": "500-800mm",
    "critical_stages": ["Flowering", "Grain filling"]
  },
  "fertilizer_schedule": [
    {
      "stage": "Basal application",
      "timing": "At planting",
      "type": "NPK 15-15-15",
      "rate_per_hectare": "250 kg"
    },
    {
      "stage": "Top dressing",
      "timing": "3-4 weeks after planting",
      "type": "Urea or Sulphate of Ammonia",
      "rate_per_hectare": "125 kg"
    }
  ],
  "common_diseases": [
    {
      "disease_id": "unique_id",
      "name": "Maize Streak Virus",
      "local_names": {"twi": "Name in Twi"},
      "symptoms": [
        "Yellow streaks on leaves",
        "Stunted growth",
        "Reduced yield"
      ],
      "causes": "Leafhopper transmission",
      "prevention": [
        "Plant resistant varieties",
        "Early planting",
        "Remove infected plants"
      ],
      "treatment": [
        "No cure available",
        "Control leafhopper vectors",
        "Use certified disease-free seeds"
      ],
      "photos": ["url1", "url2", "url3"]
    },
    {
      "disease_id": "unique_id",
      "name": "Fall Armyworm",
      "symptoms": ["Irregular holes in leaves", "Caterpillars in whorl"],
      "treatment": ["Neem-based pesticides", "Chemical pesticides (Lambda-cyhalothrin)"],
      "photos": ["url1", "url2"]
    }
  ],
  "common_pests": [
    {
      "pest_id": "unique_id",
      "name": "Stem Borer",
      "identification": "Small holes in stem, frass outside",
      "damage": "Stem tunneling, plant death",
      "control": [
        "Remove crop residues",
        "Use pesticides during early infestation",
        "Biological control with Trichogramma"
      ],
      "photos": ["url1", "url2"]
    }
  ],
  "harvest_indicators": [
    "Husks turn brown and dry",
    "Kernels hard and glossy",
    "Black layer formed at kernel base"
  ],
  "post_harvest": {
    "drying": "Sun dry to 13% moisture",
    "storage": "Store in moisture-proof bags or silos",
    "shelf_life": "6-8 months if properly dried",
    "storage_pests": ["Weevils", "Larger grain borer"]
  },
  "market_info": {
    "quality_grades": ["Grade 1", "Grade 2", "Grade 3"],
    "standard_units": ["50kg bag", "100kg bag", "Tonne"],
    "peak_market_months": ["August", "September", "October"],
    "export_potential": "Low",
    "major_buyers": ["Local markets", "Feed mills", "Breweries"]
  },
  "yield_benchmark": {
    "smallholder_tonnes_per_hectare": 1.5,
    "commercial_tonnes_per_hectare": 4.0,
    "research_station_tonnes_per_hectare": 6.0
  },
  "photos": {
    "field": "url",
    "plant": "url",
    "product": "url"
  },
  "videos": [
    {
      "title": "How to plant maize",
      "url": "youtube_or_vimeo_link",
      "duration_seconds": 300
    }
  ]
}
```

**Note:** This complete structure should be replicated for ALL 49 crops listed above.

---

### 6.2 COMPREHENSIVE LIVESTOCK DATABASE

For EACH of the following livestock types, the system must be pre-populated with:

#### 6.2.1 Livestock List (All Categories)

**Ruminants:**
1. Cattle - Sanga
2. Cattle - West African Short Horn
3. Cattle - Ndama
4. Sheep - Djallonke
5. Sheep - Nungua Black Head
6. Sheep - Sahel
7. Goats - West African Dwarf
8. Goats - Sahel

**Poultry:**
9. Chickens - Layers (Local)
10. Chickens - Layers (Improved breeds)
11. Chickens - Broilers
12. Guinea Fowl
13. Ducks
14. Turkey
15. Ostrich

**Pigs:**
16. Pigs - Local breeds
17. Pigs - Large White
18. Pigs - Landrace
19. Pigs - Duroc

**Non-Conventional Livestock:**
20. Grasscutters (Cane rats)
21. Rabbits
22. Guinea Pigs
23. African Giant Snails

**Aquaculture:**
24. Nile Tilapia
25. African Catfish

#### 6.2.2 Data Structure for Each Livestock Type

```json
{
  "livestock_id": "unique_identifier",
  "english_name": "West African Dwarf Goat",
  "scientific_name": "Capra aegagrus hircus",
  "local_names": {
    "twi": "Aboa",
    "ga": "Aboa",
    "ewe": "Gbɔ̃",
    "hausa": "Akuya",
    "dagbani": "Bua"
  },
  "category": "ruminants",
  "sub_category": "goats",
  "breeds": [
    {
      "name": "West African Dwarf",
      "characteristics": [
        "Small size (20-30kg adult weight)",
        "Short legs",
        "Tolerant to trypanosomiasis",
        "Good for meat production"
      ],
      "suitability": "Suitable for all ecological zones"
    }
  ],
  "housing_requirements": {
    "space_per_animal": "1.5 - 2 sq meters",
    "housing_type": "Raised wooden pens or concrete floors",
    "ventilation": "Well-ventilated",
    "bedding": "Dry sawdust or wood shavings"
  },
  "feeding_guidelines": [
    {
      "age_stage": "Kids (0-3 months)",
      "feed_type": "Mother's milk, creep feed",
      "quantity": "Ad libitum",
      "frequency": "Multiple times daily"
    },
    {
      "age_stage": "Growers (3-6 months)",
      "feed_type": "Grass, legumes, concentrate (16% CP)",
      "quantity": "250-400g concentrate + forage",
      "frequency": "Twice daily"
    },
    {
      "age_stage": "Adults",
      "feed_type": "Grass, legumes, crop residues",
      "quantity": "3-5% of body weight",
      "frequency": "Twice daily"
    }
  ],
  "production_cycles": {
    "breeding_age": {
      "male_months": 6,
      "female_months": 7
    },
    "gestation_period_days": 150,
    "kidding_interval_months": 8,
    "litter_size": "1-3 kids",
    "weaning_age_weeks": 12,
    "market_weight_kg": 20,
    "market_age_months": 8
  },
  "vaccination_schedule": [
    {
      "vaccine_name": "Peste des Petits Ruminants (PPR)",
      "local_name": "PPR",
      "disease_prevented": "Goat plague",
      "first_dose_age_weeks": 12,
      "booster_required": true,
      "booster_frequency": "Annual",
      "administration_route": "Subcutaneous injection",
      "dosage": "1ml per animal",
      "cost_range_ghs": "2-5"
    },
    {
      "vaccine_name": "Anthrax Vaccine",
      "disease_prevented": "Anthrax",
      "frequency": "Annual",
      "administration_route": "Subcutaneous injection"
    }
  ],
  "deworming_schedule": [
    {
      "dewormer_type": "Broad spectrum (Albendazole, Ivermectin)",
      "first_dose_age_weeks": 8,
      "frequency": "Every 3 months",
      "dosage": "Based on body weight",
      "administration_route": "Oral or injectable"
    }
  ],
  "common_diseases": [
    {
      "disease_id": "unique_id",
      "name": "Peste des Petits Ruminants (PPR)",
      "local_names": {"twi": "Goat plague"},
      "type": "Viral",
      "symptoms": [
        "High fever",
        "Nasal and eye discharge",
        "Sores in mouth",
        "Diarrhea",
        "Sudden death"
      ],
      "transmission": "Contact with infected animals, contaminated feed/water",
      "prevention": [
        "Vaccination",
        "Quarantine new animals",
        "Good biosecurity"
      ],
      "treatment": [
        "No specific treatment",
        "Supportive care (antibiotics for secondary infections)",
        "Isolate sick animals"
      ],
      "photos": ["url1", "url2"]
    },
    {
      "disease_id": "unique_id",
      "name": "Pneumonia",
      "symptoms": ["Coughing", "Nasal discharge", "Difficulty breathing", "Fever"],
      "treatment": ["Antibiotics (Oxytetracycline)", "Warm shelter", "Good ventilation"],
      "photos": ["url1", "url2"]
    }
  ],
  "common_parasites": [
    {
      "parasite_id": "unique_id",
      "name": "Stomach Worms (Haemonchus contortus)",
      "type": "Internal parasite",
      "symptoms": ["Weight loss", "Pale mucous membranes", "Diarrhea", "Poor coat"],
      "control": [
        "Regular deworming",
        "Rotational grazing",
        "Good sanitation"
      ]
    },
    {
      "parasite_id": "unique_id",
      "name": "Ticks",
      "type": "External parasite",
      "symptoms": ["Visible ticks on skin", "Anemia", "Skin irritation"],
      "control": ["Acaricide sprays", "Dipping", "Manual removal"]
    }
  ],
  "health_monitoring": {
    "vital_signs": {
      "temperature_celsius": "38.5 - 40.0",
      "heart_rate_bpm": "70-90",
      "respiratory_rate": "15-30"
    },
    "body_condition_scoring": {
      "scale": "1-5",
      "ideal_score": "3-3.5"
    },
    "warning_signs": [
      "Loss of appetite",
      "Lethargy",
      "Abnormal discharge",
      "Difficulty breathing",
      "Sudden weight loss"
    ]
  },
  "breeding_management": {
    "heat_cycle_days": 21,
    "heat_duration_hours": "24-48",
    "signs_of_heat": [
      "Restlessness",
      "Frequent urination",
      "Tail wagging",
      "Mounting other goats"
    ],
    "gestation_care": [
      "Increase feed 4 weeks before kidding",
      "Provide clean kidding area",
      "Monitor closely for complications"
    ],
    "kidding_care": [
      "Ensure kids nurse within 1 hour",
      "Dip navel in iodine",
      "Provide warm shelter",
      "Assist weak kids"
    ]
  },
  "production_metrics": {
    "average_daily_gain_grams": "50-80",
    "feed_conversion_ratio": "6:1",
    "dressing_percentage": "48-52%",
    "milk_production_liters_per_day": "0.5-1.0 (if dairy)"
  },
  "market_info": {
    "market_weight_kg": "18-25",
    "price_range_per_kg_ghs": "15-25",
    "peak_demand_periods": ["Christmas", "Easter", "Islamic festivals"],
    "preferred_characteristics": ["Good body condition", "Young animals", "Male for meat"]
  },
  "financial_estimates": {
    "startup_cost_per_animal_ghs": "200-400",
    "monthly_feeding_cost_ghs": "30-50",
    "veterinary_cost_annual_ghs": "20-30",
    "expected_revenue_per_animal_ghs": "350-600",
    "profit_margin_percentage": "30-40%"
  },
  "best_practices": [
    "Provide clean water at all times",
    "Deworm regularly every 3 months",
    "Vaccinate against PPR annually",
    "Practice rotational grazing to reduce parasites",
    "Keep housing clean and dry",
    "Separate sick animals immediately",
    "Keep records of all activities"
  ],
  "photos": {
    "animal": "url",
    "housing": "url",
    "product": "url"
  },
  "videos": [
    {
      "title": "Goat farming basics",
      "url": "youtube_or_vimeo_link",
      "duration_seconds": 600
    }
  ]
}
```

**Note:** This complete structure should be replicated for ALL 25 livestock types listed above.

---

### 6.3 MEDICATIONS & TREATMENTS DATABASE

#### 6.3.1 Common Veterinary Medicines
Pre-populate with comprehensive list including:

```json
{
  "medicine_id": "unique_id",
  "name": "Oxytetracycline LA",
  "type": "Antibiotic",
  "form": "Injectable",
  "indications": ["Pneumonia", "Foot rot", "Mastitis"],
  "applicable_animals": ["Cattle", "Sheep", "Goats", "Pigs"],
  "dosage": "20mg per kg body weight",
  "administration_route": "Intramuscular injection",
  "withdrawal_period_days": 28,
  "storage": "Cool, dry place",
  "cost_range_ghs": "15-30 per 100ml",
  "common_brands": ["Terramycin LA", "Alamycin LA"]
}
```

Common medicines to include:
- Antibiotics (Oxytetracycline, Penicillin, Tylosin)
- Dewormers (Albendazole, Ivermectin, Levamisole)
- Vaccines (PPR, Newcastle Disease, Gumboro)
- Acaricides (tick control)
- Anti-parasitic (for internal and external parasites)
- Wound treatments
- Nutritional supplements
- Disinfectants

#### 6.3.2 Common Crop Pesticides & Herbicides
Pre-populate with:

```json
{
  "product_id": "unique_id",
  "name": "Lambda-cyhalothrin",
  "type": "Insecticide",
  "trade_names": ["Karate", "Kung Fu"],
  "target_pests": ["Fall armyworm", "Aphids", "Beetles"],
  "applicable_crops": ["Maize", "Vegetables", "Legumes"],
  "application_rate": "15-25ml per 15L water per 60m2",
  "application_method": "Foliar spray",
  "PHI_days": 7,
  "precautions": ["Wear protective equipment", "Do not spray near water bodies"],
  "cost_range_ghs": "25-40 per 100ml"
}
```

Common products to include:
- Insecticides (Lambda-cyhalothrin, Cypermethrin, Neem-based)
- Fungicides (Mancozeb, Copper-based)
- Herbicides (Glyphosate, 2,4-D)
- Biological controls
- Organic alternatives

---

### 6.4 FEED TYPES DATABASE

Pre-populate with common feed types:

```json
{
  "feed_id": "unique_id",
  "name": "Layer Mash",
  "type": "Complete feed",
  "applicable_animals": ["Chickens - Layers"],
  "composition": {
    "crude_protein_percentage": 16,
    "metabolizable_energy_kcal_per_kg": 2700,
    "calcium_percentage": 3.5,
    "phosphorus_percentage": 0.6
  },
  "recommended_usage": "From point of lay onwards",
  "feeding_rate": "120g per bird per day",
  "storage": "Dry, rodent-proof storage",
  "shelf_life_months": 3,
  "cost_range_per_50kg_bag_ghs": "180-220",
  "common_brands": ["Darko Farms", "Chi Farms", "GAFCO"]
}
```

Feed categories to include:
- **Poultry:** Chick mash, Grower mash, Layer mash, Broiler starter, Broiler finisher
- **Ruminants:** Concentrate, Mineral lick, Hay, Silage
- **Pigs:** Pig starter, Grower, Finisher, Sow feed
- **Fish:** Floating pellets, Sinking pellets (by protein percentage)

---

### 6.5 FERTILIZER DATABASE

Pre-populate with common fertilizers:

```json
{
  "fertilizer_id": "unique_id",
  "name": "NPK 15-15-15",
  "type": "Compound fertilizer",
  "composition": {
    "nitrogen_percentage": 15,
    "phosphorus_percentage": 15,
    "potassium_percentage": 15
  },
  "applicable_crops": ["Maize", "Rice", "Vegetables"],
  "application_rate_kg_per_hectare": "200-300",
  "application_timing": ["Basal application", "Top dressing"],
  "cost_per_50kg_bag_ghs": "180-220",
  "common_brands": ["Yara", "Golden Fertilizer", "Wienco"]
}
```

Fertilizers to include:
- NPK variations (15-15-15, 23-10-5, etc.)
- Straight fertilizers (Urea, Sulphate of Ammonia, Single Super Phosphate)
- Organic fertilizers (Compost, Poultry manure)
- Foliar fertilizers
- Micronutrients

---

### 6.6 GHANA MARKETS DATABASE

Pre-populate with major markets:

```json
{
  "market_id": "unique_id",
  "name": "Techiman Market",
  "region": "Bono East",
  "type": "Wholesale & Retail",
  "market_days": ["Monday", "Thursday"],
  "specialties": ["Foodstuffs", "Vegetables", "Livestock"],
  "location": {
    "latitude": 7.5936,
    "longitude": -1.9370
  },
  "contact": "+233 XX XXX XXXX",
  "opening_hours": "5:00 AM - 6:00 PM"
}
```

Major markets to include:
- Accra (Agbogbloshie, Makola, Kaneshie, Madina)
- Kumasi (Kejetia, Bantama)
- Techiman Market
- Tamale Central Market
- Takoradi Market Circle
- Cape Coast Market
- Sunyani Market
- Ho Market
- Regional markets

---

### 6.7 GHANA REGIONS & DISTRICTS

Pre-populate all administrative regions and districts for location selection.

---

### 6.8 SEASONAL CALENDAR DATABASE

Pre-populate with:
- Planting seasons by crop and region
- Harvest seasons
- Major farming activities by month
- Weather patterns by region
- Market price trends by season

---

### 6.9 USER-ADDED DATA CAPABILITY

**Critical Requirement:** While the system should be pre-populated with comprehensive data, users MUST be able to add:

1. **Custom Crop Varieties** - If a farmer uses a variety not in the system
2. **Custom Livestock Breeds** - Local or uncommon breeds
3. **Custom Diseases/Pests** - New or unrecorded issues
4. **Custom Treatments** - Traditional or local remedies
5. **Custom Feed Types** - Self-mixed feeds
6. **Custom Fertilizers** - Organic or locally made
7. **Custom Markets** - Local village markets not in database
8. **Notes & Observations** - Farmer's own knowledge

**Implementation:**
- "Add Custom" button in all relevant sections
- User-added items marked as "Custom" or "User-defined"
- Option to share custom entries with community (admin moderation)
- Ability to suggest additions to official database

---

## 7. TECHNICAL REQUIREMENTS

### 7.1 PLATFORM & ARCHITECTURE

**Platform Type:** Web SaaS Application (Phase 1) + Native Mobile Apps (Phase 2)

#### Phase 1 - Web SaaS Application
- **Framework:** Next.js 14+ (App Router) with TypeScript
- **Styling:** Tailwind CSS + shadcn/ui components
- **Database:** PostgreSQL (single database with JSONB for flexible data)
- **ORM:** Prisma
- **Authentication:** NextAuth.js (Auth.js)
- **File Storage:** Cloud storage (AWS S3 or Cloudinary)
- **API:** Next.js API Routes + Server Actions
- **Real-time:** Server-Sent Events or Pusher/Ably
- **Hosting:** Vercel or self-hosted
- **PWA:** Service Workers for offline capability

#### Phase 2 - Native Mobile Applications
- **Framework:** React Native or Expo (sharing business logic with web)
- **API:** Consumption from Phase 1 backend
- **Offline:** Enhanced offline-first with local SQLite
- **Native Features:** Camera, GPS, push notifications

---

### 7.2 DEVELOPMENT PHASES

#### Phase 1: Web SaaS Application (Q1-Q4 2026)

**Scope:**
- Full-featured responsive web application
- PWA capabilities for mobile browser access
- Offline-first architecture with service workers
- All P0 and P1 features

**Rationale:**
- Faster development cycle with single codebase
- Easier iteration and deployment
- PWA provides mobile-like experience
- Lower initial development cost
- Broader device compatibility (any device with browser)

#### Phase 2: Native Mobile Apps (Q1-Q2 2027)

**Scope:**
- iOS and Android native applications
- Enhanced offline capabilities
- Native device features (camera, GPS, push notifications)
- Shared backend with web application

**Rationale:**
- Better performance for low-end devices
- Enhanced offline experience for rural areas
- Native push notifications
- App store presence for discoverability

