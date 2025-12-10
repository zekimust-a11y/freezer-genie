# Freezer Inventory Manager - React Native Specification

## App Overview

Build a mobile freezer inventory management app for iOS and Android using React Native/Expo. The app helps users track frozen food items across multiple freezers, manage expiration dates, view alerts, maintain shopping lists, and browse recipes.

---

## Navigation Structure

**Bottom Tab Navigation (4 tabs):**
1. **Inventory** - Main screen showing all freezer items
2. **Recipes** - Recipe suggestions based on ingredients
3. **Alerts** - Expiring/low stock notifications
4. **List** - Auto-generated shopping list

**Header:**
- App title on left
- Settings gear icon on right (opens Settings panel/modal)
- Optional: Voice control microphone button

---

## Data Models

### FreezerItem
```
{
  id: string (UUID),
  name: string (required),
  category: string (required),
  subCategory: string | null,
  quantity: number (default: 1),
  unit: string (default: "item"),
  expirationDate: date | null,
  notes: string | null,
  lowStockThreshold: number (default: 0),
  location: string (default: "unassigned"),
  freezerId: string (default: "default"),
  tags: string[] (optional),
  createdAt: timestamp
}
```

### Freezer
```
{
  id: string (UUID),
  name: string (required),
  type: "chest_freezer" | "upright_freezer" | "fridge_freezer" | "mini_freezer",
  createdAt: timestamp
}
```

### Categories (Built-in)
- meat_fish (with subcategories: chicken, beef, pork, lamb, game, fish, seafood, other_meat)
- produce (with subcategories: fruit, vegetable)
- prepared_meals (with subcategories: home_made, store_bought)
- frozen_goods (with subcategories: pizza, pasta, pastry, other_frozen)
- desserts (with subcategories: home_made, store_bought, cakes, sauces)
- bread
- dairy
- other

### Locations (Built-in)
- top_shelf, middle_shelf, bottom_shelf, door, drawer_1, drawer_2, drawer_3, unassigned

### Tags (Built-in)
- organic, vegan, vegetarian, free_range, gluten_free, low_fat, sugar_free, raw, cooked

---

## Screen Details

### 1. Inventory Screen (Main)

**Header:**
- Title: "Freezer Inventory" or freezer name
- Freezer selector dropdown (if multiple freezers)
- Search icon (expands to search bar)
- Sort dropdown (Use By Date, Name, Quantity, Recently Added)
- View toggle (Cards view / Table view)

**Category Filter Bar:**
- Horizontal scrollable row of category icons
- Tap to filter by category
- Shows subcategory pills when category with subcategories is selected

**Item Display:**
- **Cards View (default):** Grid of cards showing:
  - Category icon (color-coded)
  - Item name
  - Quantity and unit
  - Expiration status badge (color-coded: red=expired, orange=expiring soon, green=fresh)
  - Tags as small badges
  - Tap to edit

- **Table View:** Compact list showing:
  - Category icon
  - Name
  - Quantity
  - Expiration date
  - Swipe actions for quick edit/delete

**Floating Action Button:** "+" button to add new item

**Share Feature (Table view only):**
- Share inventory list via WhatsApp, Email, SMS, or Copy
- Centered share buttons with muted background

---

### 2. Add/Edit Item Screen

**Form Fields:**
1. **Name** (text input with autocomplete from previous items)
2. **Barcode Scanner Button** (camera icon to scan barcodes)
3. **Category Selector** (visual grid of category icons, large touch targets)
4. **Subcategory Selector** (appears when category has subcategories)
5. **Quantity** (number input with +/- buttons)
6. **Unit Selector** (item, kg, g, lb, oz, pack, box, bag, portion)
7. **Expiration Date** (date picker, can be empty)
8. **Freezer Selector** (dropdown of user's freezers)
9. **Location Selector** (dropdown of locations)
10. **Low Stock Threshold** (number input)
11. **Tags** (multi-select chips)
12. **Notes** (text input with autocomplete from previous notes)

**Actions:**
- Save button
- Delete button (edit mode only, with confirmation)
- Cancel/Back

---

### 3. Alerts Screen

**Sections:**
1. **Expired Items** (red badge, items past expiration date)
2. **Expiring Soon** (orange badge, items expiring within 7 days)
3. **Low Stock** (yellow badge, items at or below threshold)

Each alert shows:
- Item name with category icon
- Days expired/until expiry OR current quantity vs threshold
- Tap to edit item

---

### 4. Shopping List Screen

**Auto-generated from:**
- Items at or below their low stock threshold

**Features:**
- Grouped by category
- Shows item name, current quantity, threshold
- Checkboxes to mark as "bought" (temporary, clears on refresh)
- Share list via WhatsApp, Email, SMS, Copy

---

### 5. Recipes Screen

**Recipe Matching:**
- Analyzes freezer inventory for ingredients
- Shows recipes that match available items
- Highlights which ingredients user has vs needs

**Recipe Display:**
- Recipe image thumbnail
- Recipe name
- Ingredient list (matched ingredients highlighted in green)
- External link to BBC Good Food or similar
- Heart icon to save as favorite

**Saved Recipes Section:**
- List of favorited recipes
- Share saved recipes feature

---

### 6. Settings Panel (Modal/Screen)

**Sections:**

**Defaults:**
- Default Category (dropdown)
- Default Expiry Period (none, 1 week, 2 weeks, 1-12 months)
- Default Low Stock Threshold (0-10)

**Display:**
- Date Format (Dec 15, 2024 / 15/12/2024 / 12/15/2024 / 2024-12-15)
- Weight Units (Metric kg/g or Imperial lb/oz)

**Custom Locations:**
- Add/remove custom shelf/drawer names

**Custom Categories:**
- Add/remove custom categories

**Freezer Management:**
- Add new freezer (name + type)
- Edit/delete existing freezers
- Set default freezer for new items

**Tags:**
- Enable/disable default tags
- Add custom tags

**Appearance:**
- Dark Mode toggle
- Theme color selection (optional)

**App Info:**
- Version number (e.g., 0.0.1)

---

## Key Features to Implement

### 1. Barcode Scanning
- Use Expo Camera/BarCodeScanner
- Lookup product info via Open Food Facts API or similar
- Auto-fill item name from barcode

### 2. Voice Control (Optional)
- "Add [item name]" - opens add form with name pre-filled
- "Search [query]" - filters inventory
- "Show expired" - switches to alerts tab

### 3. Expiration Tracking
- Color-coded status badges:
  - Red: Expired (past date)
  - Orange: Expiring soon (within 7 days)
  - Green: Fresh (more than 7 days)
  - Gray: No expiration date set

### 4. Multi-Freezer Support
- Users can manage multiple freezers
- Filter inventory by freezer
- Assign items to specific freezers

### 5. Autocomplete
- Item names suggest from previously added items
- Notes field suggests from previous notes
- Helps with consistent naming

### 6. Sharing
- Generate text list of inventory/shopping list
- Share via native share sheet, WhatsApp, Email, SMS
- Copy to clipboard option

---

## Design Guidelines

### Color Scheme
- Clean, modern design
- Light and dark mode support
- Category colors:
  - Meat/Fish: Red tones
  - Produce: Green tones
  - Prepared Meals: Orange tones
  - Desserts: Pink/Purple tones
  - Bread: Amber/Brown tones
  - Dairy: Blue tones
  - Frozen Goods: Cyan tones
  - Other: Gray tones

### Typography
- Clear hierarchy with headings and body text
- Readable font sizes for mobile

### Icons
- Use consistent icon library (Lucide, Ionicons, or similar)
- Each category has a distinct icon

### Interactions
- Smooth animations for transitions
- Pull-to-refresh on lists
- Swipe actions for quick edit/delete
- Haptic feedback on important actions

---

## Backend API Endpoints

```
GET    /api/items          - Get all freezer items
POST   /api/items          - Create new item
PATCH  /api/items/:id      - Update item
DELETE /api/items/:id      - Delete item

GET    /api/freezers       - Get all freezers
POST   /api/freezers       - Create new freezer
PATCH  /api/freezers/:id   - Update freezer
DELETE /api/freezers/:id   - Delete freezer

GET    /api/locations      - Get custom locations
POST   /api/locations      - Create custom location
DELETE /api/locations/:id  - Delete custom location
```

---

## Local Storage (Device)

Store user preferences locally:
- Selected freezer filter
- View mode preference (cards/table)
- Sort preference
- Date format
- Weight unit
- Default category
- Default expiry period
- Custom categories
- Custom locations
- Custom tags
- Saved recipe favorites
- Theme preference (light/dark)

---

## Testing Notes

- Test on both iOS and Android via Expo Go
- Test barcode scanning with real products
- Test offline functionality
- Test with 100+ items for performance
- Test all sharing methods

---

## Priority Order for Development

1. Data models and storage
2. Basic CRUD for freezer items
3. Inventory screen with cards view
4. Add/Edit item form
5. Category filtering
6. Search and sort
7. Alerts screen
8. Shopping list screen
9. Settings panel
10. Multiple freezer support
11. Recipes screen
12. Barcode scanning
13. Sharing features
14. Voice control (optional)
15. Polish and animations
