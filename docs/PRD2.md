# GHANA FARMER — MVP PRODUCT REQUIREMENTS DOCUMENT (PRD)

**Version:** MVP 1.0
**Derived From:** Master PRD v1.0
**Scope:** P0 (Must-Have Only)
**Target Users:** Smallholder & Commercial Farmers (Primary)
**Platform:** Web SaaS (Mobile-First, PWA)
**Launch Target:** Q2 2026

---

## 1. MVP OBJECTIVE

Deliver a **mobile-first, offline-capable web application** that enables Ghanaian farmers to:

1. Digitally register and manage their farms
2. Track crops and livestock activities
3. Receive task reminders (calendar-driven)
4. Track expenses and income
5. View basic profitability
6. Access weather and market prices
7. Receive alerts via push & SMS

**Success Criteria (MVP):**

* 10,000+ registered farmers in 6 months
* ≥60% monthly active users
* ≥70% of users log at least one farm activity
* ≥50% of users view financial summary monthly

---

## 2. IN-SCOPE (MVP ONLY)

### Included

* Authentication & onboarding
* Farm setup
* Crop management
* Livestock management
* Calendar & task system
* Expense & income tracking
* Financial dashboard (basic)
* Market prices (read-only)
* Weather (read-only)
* Notifications (push + SMS)
* Multi-language support
* Offline data capture & sync

### Explicitly Excluded

❌ Marketplace
❌ Buyer messaging
❌ Loans, insurance, VSLA
❌ Community forum
❌ AI diagnosis
❌ Input ordering
❌ Government program applications
❌ Native mobile apps

---

## 3. TARGET MVP USERS

### Primary Users

1. **Smallholder Farmers**

   * Low literacy
   * Android smartphones
   * Intermittent connectivity
2. **Commercial Farmers**

   * Higher data usage
   * Multi-enterprise farms

> Extension officers, buyers, NGOs are **out of MVP scope**.

---

## 4. AUTHENTICATION & USER MANAGEMENT (MVP)

### 4.1 Registration

**Requirements**

* Phone number signup (SMS OTP)
* Optional email signup
* Language selection at signup:

  * English, Twi, Ga, Ewe, Hausa, Dagbani
* Accept Terms & Privacy Policy

### 4.2 Onboarding Wizard

Mandatory first-time steps:

1. Name
2. Location (Region → District → Community)
3. Farmer type (Smallholder / Commercial)
4. Farm size (hectares)
5. Enterprises selected (crops/livestock)

### 4.3 Profile Management

* Edit profile
* Change language
* Notification preferences
* Delete account

---

## 5. FARM MANAGEMENT (MVP CORE)

### 5.1 Farm Setup

* Add one or more farms
* Farm name
* Farm size
* GPS location (map pin)
* Optional photo

---

## 6. CROP MANAGEMENT (MVP)

### 6.1 Crop Entry

**Fields**

* Crop type (from pre-populated list)
* Variety (select or custom)
* Area planted
* Planting date
* Expected harvest date (auto-calculated)
* Status: Planned / Growing / Harvested

### 6.2 Crop Activity Logging

Farmers can log:

* Land preparation
* Planting
* Fertilizer application
* Pest/disease treatment
* Weeding
* Harvest

Each activity includes:

* Date
* Cost (GHS)
* Notes
* Optional photo

### 6.3 Yield Recording

* Quantity harvested
* Unit (kg, bags)
* Quality notes

---

## 7. LIVESTOCK MANAGEMENT (MVP)

### 7.1 Livestock Registration

* Animal type (pre-populated)
* Breed (select or custom)
* Quantity (batch allowed for poultry)
* Date acquired
* Gender (if applicable)

### 7.2 Health Records

* Vaccination entry
* Deworming entry
* Illness record
* Mortality record

### 7.3 Production Tracking

* Eggs per day (layers)
* Milk quantity (if applicable)
* Sale records (date, quantity, price)

---

## 8. CALENDAR & TASK SYSTEM (MVP)

### 8.1 Auto-Generated Tasks

System automatically generates tasks based on:

* Crop planting dates
* Fertilizer schedules
* Livestock vaccination schedules

### 8.2 Task Features

* View tasks by:

  * Today
  * Upcoming
  * Overdue
* Mark task as completed
* Manual task creation

### 8.3 Notifications

* Push notification (default)
* SMS fallback if offline
* Reminder timing:

  * 1 day before
  * Due date

---

## 9. FINANCIAL MANAGEMENT (MVP)

### 9.1 Expense Tracking

Categories:

* Seeds
* Fertilizer
* Pesticides
* Feed
* Veterinary
* Labor
* Transport
* Other

Each expense:

* Date
* Amount (GHS)
* Linked to crop/livestock
* Optional receipt photo

### 9.2 Income Tracking

* Product sold
* Quantity
* Unit price
* Buyer name (text)
* Payment method (cash / MoMo)

---

## 10. FINANCIAL DASHBOARD (MVP)

### Display:

* Total income (month & season)
* Total expenses
* Net profit/loss
* Profit by enterprise (basic)
* Cost per unit (simple)

### Export

* PDF
* Excel

---

## 11. MARKET PRICES (READ-ONLY MVP)

### Features

* Daily prices by market
* Crops & livestock
* Major markets only:

  * Accra
  * Kumasi
  * Techiman
  * Tamale

### No selling, no messaging (view only)

---

## 12. WEATHER (READ-ONLY MVP)

### Features

* Current weather
* 7-day forecast
* Rain alerts
* Temperature alerts

---

## 13. MULTI-LANGUAGE SUPPORT (MVP)

### Languages

* English
* Twi
* Ga
* Ewe
* Hausa
* Dagbani

### Requirements

* Full UI translation
* Crop & livestock local names
* Language switch in settings

---

## 14. OFFLINE FUNCTIONALITY (CRITICAL MVP)

### Offline-Capable

* Add/edit farm data
* Log activities
* Log expenses/income
* View calendar

### Sync Behavior

* Auto-sync when online
* Conflict rule: last write wins
* Sync status indicator

---

## 15. NOTIFICATIONS (MVP)

### Types

* Task reminders
* Weather alerts
* Price alerts (read-only)
* System announcements

### Channels

* Push (primary)
* SMS (fallback)

---

## 16. TECHNICAL MVP REQUIREMENTS

### Stack

* **Frontend:** Next.js 14 (App Router)
* **UI:** Tailwind CSS + shadcn/ui
* **Backend:** Next.js API Routes
* **Database:** PostgreSQL + JSONB
* **Auth:** NextAuth (Phone + OTP)
* **Storage:** Cloudinary / S3
* **Offline:** PWA + IndexedDB
* **Hosting:** Vercel or VPS

---

## 17. MVP OUT OF SCOPE (LOCKED)

These **must not** be built in MVP:

* Marketplace
* Buyer chat
* Loans & insurance
* AI diagnosis
* Government program integration
* Community forums
* Native mobile apps

---

## 18. MVP DELIVERABLES

1. Responsive PWA
2. Farmer onboarding flow
3. Farm, crop & livestock tracking
4. Calendar & reminders
5. Financial dashboard
6. Offline support
7. Multi-language UI

---

## 19. MVP SIGN-OFF CRITERIA

MVP is considered complete when:

* All features above are functional
* App works offline
* SMS notifications work
* Data exports work
* Deployed to production domain

---