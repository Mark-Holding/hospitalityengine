# Menu Costing Calculator - Build Guide for Claude Code

## Project Overview
Build a comprehensive Menu Costing Calculator tool with multiple tabs for managing menu items, ingredients, components, and suppliers. Users should only see data for their own business.


## Database Tables Required

Create these tables for now so details can be added as we build the UI.

- menu_items - stores menu item details
- ingredients - ingredient lookup data
- components - component lookup data (can be added from menu items)
- suppliers - supplier information
- menu_item_ingredients - junction table for menu items and their ingredients/components
- All tables created should have `business_id` foreign key for Row Level Security (RLS). 

---

## BUILD STEPS (Follow in Order)

### PHASE 1: FOUNDATION & LAYOUT

#### Step 1: Create Tab Navigation Component

**Requirements**:
- Create a tab navigation component with 5 tabs:
  1. List View (default/active)
  2. Menu Item (appears when clicked on from List view or '+ new menu item' button)
  3. Ingredients Lookup
  4. Components Lookup
  5. Suppliers
- Use state management to track active tab
- Style tabs clearly showing active state
- Make responsive for mobile/tablet/desktop

**Acceptance Criteria**:
- Clicking tabs switches view
- Active tab is visually distinct
- Tab state persists during session

---

#### Step 2: update Main Layout Container


**Requirements**:
- Import TabNavigation component
- Conditionally render content based on active tab
- Ensure layout fits viewport height without scrolling (unless content overflow)
- Add proper spacing and padding

**Acceptance Criteria**:
- Tab navigation appears at top
- Content area below tabs
- No unnecessary scrolling by default
- Clean, professional layout

---

### PHASE 2: LIST VIEW (Main View)

#### Step 3: Create List View Table Component


**Requirements**:
- Create table with columns: ID, Name, Cost (£), Selling Price, % COGS, GP %, Last Updated
- Add "+ New Menu Item" button at top right
- Add search/filter input at top left
- Each row should have Edit/Delete actions
- Use Supabase to fetch menu items filtered by current user's business_id
- Implement real-time search filtering (client-side for now)
- Format currency values to 2 decimal places
- Format percentages to 1 decimal place with % symbol
- Sort by Last Updated (newest first) by default

**Acceptance Criteria**:
- Table displays all menu items for current business
- Search filters results in real-time
- Edit button opens Menu Item tab with that item loaded
- Delete button shows confirmation modal then deletes
- "+ New Menu Item" button opens blank Menu Item tab
- Data loads on component mount

---

#### Step 4: Implement Delete Functionality

**Requirements**:
- Create delete confirmation modal
- On confirm, delete menu item from Supabase
- Also delete related records in menu_item_ingredients junction table
- Show success/error toast notification
- Refresh list after deletion
- Handle loading state during deletion

**Acceptance Criteria**:
- Confirmation modal appears with item name
- Successful deletion removes item from list
- Error handling with user feedback
- Related data cleaned up (cascade delete)

---

### PHASE 3: INGREDIENTS LOOKUP TAB

#### Step 5: Create Ingredients Lookup Table

**Requirements**:
- Create table with columns: Supplier Name (dropdown), Product Code, Name, Unit, Cost per Unit (£)
- Add "+ New Ingredient" button at top
- Fetch suppliers from Supabase for dropdown
- Fetch ingredients filtered by business_id
- Each row should be editable inline or via edit icon
- Each row should have delete option
- Product Code: alphanumeric input
- Name: text input
- Unit: text input (e.g., "kg", "L", "each")
- Cost per Unit: numeric input (2 decimal places)
- Add validation for required fields

**Acceptance Criteria**:
- Can add new ingredient inline or via modal
- Supplier dropdown populated from suppliers table
- Can edit existing ingredients
- Can delete ingredients (with confirmation)
- Data saves to Supabase in real-time or on blur
- Proper validation and error handling

---

#### Step 6: Add Search/Filter to Ingredients

**Requirements**:
- Add search input at top of table
- Filter by ingredient name, product code, or supplier name
- Real-time filtering as user types
- Show count of filtered results

**Acceptance Criteria**:
- Search works across multiple columns
- Results update instantly
- Clear search button when text entered

---

### PHASE 4: COMPONENTS LOOKUP TAB

#### Step 7: Create Components Lookup Table

**Requirements**:
- Create table with columns: ID, Name, Unit, Cost per Serving (£), Last Updated
- Fetch components filtered by business_id
- Each row should have Edit and Delete options
- Edit button should open the original Menu Item tab (if component was created from a menu item)
- Include picture icon that shows modal with menu item image (if exists)
- Show visual indicator if component was created from menu item vs manually added
- Add search/filter functionality

**Acceptance Criteria**:
- Table displays all components
- Edit opens correct menu item (if applicable)
- Picture modal displays image correctly
- Delete works with confirmation
- Search filters results
- Properly handles components created from menu items vs manual entries

---

### PHASE 5: SUPPLIERS TAB

#### Step 8: Create Suppliers Management

**Requirements**:
- Display list/grid of suppliers
- Add "+ New Supplier" button that opens modal
- Modal form fields:
  - Company Name (required)
  - Account Manager Name
  - Contact Phone Number(s) (allow multiple)
  - Address (multi-line)
  - Order Notes (text area for details like "Order by 3pm", delivery days, etc.)
- Each supplier card/row should have Edit and Delete options
- Store in Supabase suppliers table with business_id

**Acceptance Criteria**:
- Can add new supplier via modal
- Can edit existing supplier
- Can delete supplier (with confirmation if used in ingredients)
- Form validation for required fields
- Clean, organized display of supplier information

---

### PHASE 6: MENU ITEM PAGE (Core Functionality)

#### Step 9: Create Menu Item Page Header

**Requirements**:
- At top: ID (editable alphanumeric input) and Menu Item Name (editable text input)
- Add Edit/Save toggle button
- When Edit mode: fields are editable
- When View mode: fields are read-only with styled display
- Include Back to List button
- Store menu item name with auto-save or explicit save

**Acceptance Criteria**:
- Can enter/edit menu item name
- Edit/Save toggle works properly
- ID displays correctly (or "New" for unsaved items)
- Back button returns to List View with unsaved warning if applicable

---

#### Step 10: Create Ingredients/Components Table in Menu Item

**Requirements**:
- Create table with columns:
  - Ingredient Name (dropdown from Ingredients Lookup)
  - Component Name (dropdown from Components Lookup)
  - Unit (auto-fill from selected ingredient/component)
  - Cost per Unit (£) (auto-fill from selected ingredient/component)
  - Amount (user numeric input, 2 decimals)
  - Cost (£) (calculated: Cost per Unit × Amount)
- Start with 12 empty rows
- Add "Add Row" button to add more rows
- Each row has delete icon
- Total Cost row at bottom summing all Cost values
- Real-time calculation updates
- Allow selecting either ingredient OR component per row (not both)

**Acceptance Criteria**:
- Dropdowns populated from respective lookup tables
- Unit and Cost per Unit auto-fill when ingredient/component selected
- Cost calculates automatically when Amount entered
- Total updates in real-time
- Can add/remove rows
- Data persists to Supabase

---

#### Step 11: Add "Add to Components" Feature

**Requirements**:
- Add "Add to Components" button below the ingredients table
- When clicked:
  - Validate menu item is saved and has name
  - Create new component record in components table:
    - ID: auto-generated
    - Name: from menu item name
    - Unit: default to "Serving"
    - Cost per Serving: taken from calculated Costing Calculations Table
  - Show success notification
  - Optionally refresh Components Lookup tab data

**Acceptance Criteria**:
- Button only enabled when menu item has name and total cost
- Creates component successfully in database
- Component appears in Components Lookup tab
- Success feedback to user
- Handles errors gracefully

---

#### Step 12: Add Picture Upload Area

**Requirements**:
- Create image upload component below ingredients table
- Allow drag-and-drop or click to upload
- Accept common image formats (jpg, png, webp)
- Resize/optimize image for web viewing (max width ~800px, maintain aspect ratio)
- Store in Supabase Storage
- Display uploaded image as thumbnail with option to remove/replace
- Show loading state during upload

**Acceptance Criteria**:
- Can upload image via drag-drop or file picker
- Image optimized and uploaded to Supabase Storage
- Thumbnail displays after upload
- Can remove and replace image
- Proper error handling for failed uploads

---

#### Step 13: Add Allergen Checkboxes

**Requirements**:
- Create allergen section with checkboxes for all 14 allergens:
  - Celery
  - Cereals containing gluten
  - Crustaceans
  - Eggs
  - Fish
  - Lupin
  - Milk
  - Molluscs
  - Mustard
  - Nuts
  - Peanuts
  - Sesame seeds
  - Soya
  - Sulphur dioxide (Sulphites)
- Display in grid layout (2-3 columns)
- Store selected allergens as array in database
- Pre-check allergens when loading existing menu item

**Acceptance Criteria**:
- All 14 allergens displayed clearly
- Can check/uncheck multiple allergens
- Selected allergens save to database
- Loads existing allergen selections correctly

---

#### Step 14: Add Preparation Method Text Box

**Requirements**:
- Add multi-line text area for preparation method
- Allow rich text or markdown (optional enhancement)
- Auto-save on blur or manual save
- Reasonable character limit with counter (e.g., 5000 chars)

**Acceptance Criteria**:
- Can enter multi-line preparation instructions
- Text saves properly to database
- Character counter displays
- Loads existing preparation method correctly

---

#### Step 15: Add Costing Calculations Table

**Requirements**:
- Create 2-column table/box below preparation method:
  
  **Column 1 (Labels):**
  - Total Cost (£)
  - Servings
  - Cost Per Serving (£)
  - Selling Price (£)
  - COGS %
  - GP %
  
  **Column 2 (Values):**
  - Total Cost: pulled from ingredients table total
  - Servings: numeric input (0 decimal places, integer)
  - Cost Per Serving: calculated (Total Cost ÷ Servings)
  - Selling Price: numeric input (2 decimal places)
  - COGS %: calculated ((Cost Per Serving ÷ Selling Price) × 100)
  - GP %: calculated (((Selling Price - Cost Per Serving) ÷ Selling Price) × 100)

- All calculations update in real-time
- Format currency to 2 decimals with £ symbol
- Format percentages to 1 decimal with % symbol
- Handle division by zero gracefully (show "-" or 0)

**Acceptance Criteria**:
- Total Cost pulls from ingredients table
- User can enter Servings and Selling Price
- All calculations update automatically
- Proper formatting of currency and percentages
- No errors when fields are empty

---

#### Step 16: Optimize Menu Item Page Layout

**Requirements**:
- Arrange all sections to fit in viewport height without scrolling by default
- Use grid or flexbox layout
- Sections in order:
  1. Header (ID, Name, Edit/Save buttons)
  2. Ingredients/Components table (scrollable if >12 rows)
  3. Add to Components button
  4. Picture upload (thumbnail size)
  5. Allergens (compact grid)
  6. Preparation method (medium height text area)
  7. Costing calculations (compact table)
- If content exceeds viewport, make ingredients table scrollable
- Responsive design for different screen sizes

**Acceptance Criteria**:
- Default view fits in viewport on desktop (1920x1080)
- No unnecessary white space
- All sections visible without scrolling (unless extra rows added)
- Clean, organized, professional appearance
- Mobile responsive

---

### PHASE 7: DATA INTEGRATION & POLISH

#### Step 17: Implement Row-Level Security Validation
**Files**: All component files

**Requirements**:
- Verify all Supabase queries include business_id filter
- Ensure users can only access their own business data
- Add middleware/utility function to get current user's business_id
- Handle cases where business_id is missing
- Add error boundaries for unauthorized access

**Acceptance Criteria**:
- All data fetches filtered by business_id
- Users cannot access other businesses' data
- Proper error handling for auth issues
- Security tested manually

---

#### Step 18: Add Loading States
**Files**: All component files

**Requirements**:
- Add skeleton loaders for tables while data fetching
- Show spinners for save/delete operations
- Disable buttons during async operations
- Show loading state for image uploads
- Use consistent loading UI across all components

**Acceptance Criteria**:
- No blank screens during data load
- User knows when operations are in progress
- Cannot trigger duplicate operations
- Smooth user experience

---

#### Step 19: Add Error Handling & Validation
**Files**: All component files

**Requirements**:
- Add form validation for required fields
- Show inline error messages
- Display toast notifications for success/error
- Validate numeric inputs (no negative numbers for costs, etc.)
- Handle Supabase errors gracefully
- Add user-friendly error messages

**Acceptance Criteria**:
- Required fields validated before save
- Clear error messages shown to user
- No cryptic technical errors displayed
- Validation prevents invalid data entry

---

#### Step 20: Implement Auto-Save Functionality
**Files**: Menu Item, Ingredients Lookup

**Requirements**:
- Auto-save menu item changes after 1-2 second debounce
- Show "Saving..." indicator
- Show "Saved" confirmation
- Handle save conflicts (if user edits multiple fields rapidly)
- Option to manually save via Save button
- Don't auto-save invalid data

**Acceptance Criteria**:
- Changes save automatically after short delay
- User sees save status
- No data loss on navigation (or warn if unsaved)
- Manual save button works as backup

---

#### Step 21: Add Picture Icon to Components Table Rows

**Requirements**:
- Add picture icon to each row in ingredients table (in Menu Item page)
- When clicked, show modal popup with picture from original menu item/component
- Modal should display image, name, and basic info
- Handle cases where no image exists
- Implement same feature in Components Lookup table

**Acceptance Criteria**:
- Picture icons appear in appropriate rows
- Clicking icon opens modal with image
- Modal displays correctly sized image
- Graceful handling when no image exists
- Close modal functionality works

---

#### Step 22: Add Instructions Tab (Placeholder)

**Requirements**:
- Create basic component for Instructions tab
- Add placeholder text: "Instructions coming soon. This section will contain video tutorials and documentation."
- Style consistently with other tabs
- Leave hooks for future video/content integration

**Acceptance Criteria**:
- Instructions tab displays placeholder
- Matches design of other tabs
- Ready for future content addition

---

### PHASE 8: TESTING & REFINEMENT

#### Step 23: Manual Testing Checklist
**All Files**

**Requirements**:
Manually test the following flows:
1. **List View**: Create, edit, delete menu items
2. **Menu Item**: 
   - Add ingredients and components
   - Upload picture
   - Select allergens
   - Enter preparation method
   - Verify all calculations
   - Add to components
3. **Ingredients Lookup**: Add, edit, delete ingredients
4. **Components Lookup**: View, edit, delete components
5. **Suppliers**: Add, edit, delete suppliers
6. **Business Isolation**: Test with multiple users/businesses (data shouldn't cross)
7. **Responsive Design**: Test on mobile, tablet, desktop
8. **Error Scenarios**: Network errors, invalid data, missing auth

**Acceptance Criteria**:
- All features work as expected
- No console errors
- Good performance (no lag)
- Data persists correctly
- Security working (RLS)

---

#### Step 24: Performance Optimization
**Files**: All component files

**Requirements**:
- Implement React.memo for components that re-render unnecessarily
- Use useMemo/useCallback for expensive calculations
- Optimize Supabase queries (only fetch needed columns)
- Lazy load images
- Debounce search inputs
- Consider pagination for large datasets (future enhancement)

**Acceptance Criteria**:
- App feels snappy and responsive
- No unnecessary re-renders
- Images load efficiently
- Search doesn't cause lag

---

#### Step 25: Final Polish & UI Consistency
**Files**: All component files

**Requirements**:
- Ensure consistent spacing, colors, fonts across all tabs
- Add hover states to buttons and interactive elements
- Ensure proper focus states for accessibility
- Add smooth transitions where appropriate
- Review and fix any UI bugs or inconsistencies
- Ensure mobile responsiveness
- Add tooltips for complex features

**Acceptance Criteria**:
- Consistent visual design
- Professional appearance
- Good accessibility
- Smooth interactions
- Mobile-friendly

---

## COMPLETION CHECKLIST

Before marking as complete, verify:
- [ ] All 5 tabs implemented and working
- [ ] List View displays all menu items correctly
- [ ] Menu Item page has all required sections
- [ ] Ingredients Lookup allows full CRUD operations
- [ ] Components Lookup displays and links correctly
- [ ] Suppliers management fully functional
- [ ] All calculations working in real-time
- [ ] Picture upload and display working
- [ ] Allergen selection working
- [ ] Business-level data isolation enforced
- [ ] Auto-save functionality working
- [ ] Loading states implemented
- [ ] Error handling implemented
- [ ] Mobile responsive
- [ ] No console errors
- [ ] Performance is good

---

## NOTES FOR CLAUDE CODE

- **Build incrementally**: Complete each step fully before moving to the next
- **Test after each step**: Ensure the step works before proceeding
- **Ask questions**: If anything is unclear, ask for clarification
- **Database**: Assume tables exist with proper RLS policies
- **Authentication**: Assume user is authenticated and business_id is available via Supabase auth
- **Styling**: Use Tailwind CSS or component library defaults
- **Real-time**: Calculations should update immediately as user types
- **Validation**: Add sensible validation but don't over-complicate
- **Focus on UX**: The tool should be intuitive and easy to use

---

## FUTURE ENHANCEMENTS (Not in this build)
- Export menu items to PDF/Excel
- Batch import ingredients from CSV
- Recipe scaling calculator
- Cost trend analysis over time
- Multi-currency support
- Mobile app version
- Barcode scanning for ingredients
- Integration with POS systems
- Recipe versioning/history
