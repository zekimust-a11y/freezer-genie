# Freezer Inventory Manager - Design Guidelines

## Design Approach

**Selected Framework:** Design System Approach with Material Design principles, drawing inspiration from productivity tools like Notion and Todoist for clean data management interfaces.

**Rationale:** This is a utility-focused application prioritizing efficiency, learnability, and information density. Users need quick access to inventory data with minimal friction.

---

## Typography System

**Font Family:** Inter (Google Fonts) for optimal readability in data-dense interfaces

**Type Scale:**
- Page titles: text-2xl, font-semibold
- Section headers: text-lg, font-semibold  
- Item names: text-base, font-medium
- Metadata (dates, quantities): text-sm, font-normal
- Helper text: text-xs, font-normal

---

## Layout System

**Spacing Primitives:** Use Tailwind units of 2, 3, 4, 6, and 8 for consistent rhythm
- Component padding: p-4 or p-6
- Section gaps: gap-4 or gap-6
- Icon margins: mr-2 or mr-3
- Card spacing: space-y-4

**Container Strategy:**
- Main content: max-w-6xl mx-auto with px-4 sm:px-6 lg:px-8
- Single-column layout on mobile, adaptive grid on desktop
- Sticky header for navigation consistency

---

## Component Library

### Header/Navigation
- Fixed top bar with app title and primary action button ("Add Item")
- Search bar prominently placed in header
- Category filter chips/tabs below header
- Height: h-16 for main bar, additional h-12 for filter row

### Inventory Cards/List Items
- Card-based design with clear visual separation (rounded-lg, shadow-sm)
- Each card displays: item name, category icon, quantity badge, expiration date
- Compact list view option for users who prefer density
- Card padding: p-4
- Hover state with subtle shadow elevation

### Category Indicators
- Icon + label combination using Heroicons
- Categories: Meat, Vegetables, Fruits, Prepared Meals, Dairy, Frozen Goods, Other
- Consistent icon size: w-5 h-5 inline with text

### Expiration Date Indicators
- Visual badges showing time remaining
- States: "Fresh" (>7 days), "Use Soon" (3-7 days), "Urgent" (<3 days)
- Badge styling: rounded-full px-2 py-1 text-xs font-medium

### Forms (Add/Edit Item)
- Modal overlay for add/edit operations
- Form fields with clear labels above inputs
- Input height: h-10 or h-12
- Dropdown selects for categories
- Date picker for expiration dates
- Number input with increment/decrement buttons for quantities
- Form spacing: space-y-4

### Action Buttons
- Primary button (Add, Save): px-4 py-2, rounded-md, font-medium
- Secondary button (Cancel): outlined variant
- Icon buttons for edit/delete: w-8 h-8, rounded

### Empty States
- Centered illustration placeholder when no items exist
- Clear call-to-action to add first item
- Helpful text explaining how to get started

### Search & Filters
- Search input with icon prefix (magnifying glass)
- Real-time filtering as user types
- Category filter chips with active/inactive states
- "Clear filters" option when active

---

## Grid System

**Desktop (lg+):** 
- 3-column grid for inventory cards (grid-cols-3 gap-4)
- 2-column form layout for add/edit modal

**Tablet (md):**
- 2-column grid (grid-cols-2 gap-4)

**Mobile:**
- Single column (grid-cols-1 gap-3)
- List view optimized for thumb-friendly interactions

---

## Icons

**Library:** Heroicons (outline style for consistency)

**Key Icons:**
- Plus circle (add item)
- Pencil (edit)
- Trash (delete)
- Search (magnifying glass)
- Calendar (expiration dates)
- Archive box (freezer/category)

---

## Interaction Patterns

- Click card anywhere to expand details/edit
- Swipe left on mobile reveals delete action
- Inline quantity adjustment with +/- buttons
- Batch actions: select multiple items for deletion
- Sort options: by expiration date, category, name, date added

---

## Accessibility

- All form inputs with associated labels
- Keyboard navigation throughout (tab order, enter to submit)
- Focus indicators on all interactive elements (ring-2)
- Sufficient touch targets: minimum 44x44px
- Screen reader announcements for dynamic updates

---

## Data Display Priorities

**Primary Information:** Item name (largest text)
**Secondary Information:** Quantity, category
**Tertiary Information:** Expiration date, date added

---

## Special Considerations

- Quick-add functionality: minimal fields for speed
- Barcode scanning placeholder for future feature
- Export/print inventory list option
- Persistent storage warning if database is getting full