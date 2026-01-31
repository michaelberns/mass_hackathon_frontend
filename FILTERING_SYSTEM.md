# Unified Job Filtering System

## Overview
A comprehensive, production-ready filtering system that works seamlessly across both Browse Jobs (list view) and Map Jobs pages.

## Features Implemented

### 1. Filter Types
- **Price Range**: Min and max budget filtering
- **Text Search**: Search job titles and descriptions
- **Location**: Filter by location text
- **Skills**: Multi-select tag input (e.g., "plumbing", "electrical", "painting")

### 2. Architecture

#### Shared State Hook: `useJobFilters()`
- Location: `src/hooks/useJobFilters.ts`
- Manages filter state centrally
- Syncs filters with URL query params for persistence
- Provides `filters`, `setFilters`, `clearFilters`, `hasActiveFilters`, `queryString`

#### Reusable Component: `FilterPanel`
- Location: `src/components/FilterPanel.tsx`
- Clean, modern UI with responsive grid layout
- Price range inputs (min/max)
- Text search input
- Location text input
- Skills tag input with add/remove functionality
- "Apply Filters" and "Clear all" buttons
- Controlled inputs with local state

#### API Integration
- Location: `src/services/api.ts`
- `getJobs(filters)` - Fetches filtered jobs for list view
- `getJobsForMap(filters)` - Fetches filtered jobs for map view
- `buildFilterQuery()` - Helper to convert filters to query params

### 3. Query Parameters Format
```
?minBudget=100
&maxBudget=500
&q=plumbing
&location=Victoria
&skills=plumbing,electrical
```

### 4. Pages Updated

#### Browse Jobs Page
- Location: `src/pages/BrowseJobs.tsx`
- Filter panel at top
- Re-fetches jobs when filters change
- Loading spinner during fetch
- Enhanced empty state with "No jobs found" message
- "Clear Filters" button when active filters exist

#### Map Page
- Location: `src/pages/MapPage.tsx`
- Same filter panel for consistency
- Re-renders markers based on filtered results
- Loading overlay on map
- Empty state overlay when no jobs match
- Location search bar remains functional

### 5. UX Features

#### Loading States
- Spinner during data fetching
- Disabled inputs (map overlay on Map page)
- Count updates ("X jobs found")

#### Empty States
- "No jobs found" message
- Different messages for filtered vs unfiltered states
- "Clear Filters" or "Create Job" buttons as appropriate
- Icons for visual clarity

#### URL Persistence
- Filters sync to URL query params
- Shareable URLs with active filters
- Browser back/forward navigation support

## Usage

### Browse Jobs
```typescript
import { useJobFilters } from '../hooks/useJobFilters';
import { FilterPanel } from '../components/FilterPanel';

const { filters, setFilters, clearFilters, hasActiveFilters } = useJobFilters();

// In render:
<FilterPanel
  filters={filters}
  onApply={setFilters}
  onClear={clearFilters}
  hasActiveFilters={hasActiveFilters}
/>
```

### API Calls
```typescript
import { getJobs, getJobsForMap } from '../services/api';

// List view
const jobs = await getJobs(filters);

// Map view
const mapJobs = await getJobsForMap(filters);
```

## Technical Details

### Filter State Flow
1. User modifies filters in `FilterPanel`
2. Local state updates (controlled inputs)
3. User clicks "Apply Filters"
4. `setFilters` called → Updates URL + triggers re-fetch
5. `useEffect` in page component detects filter change
6. API called with new filters
7. Results rendered (list or map markers)

### Performance
- Server-side filtering (backend handles queries)
- Debounced inputs (via "Apply" button, not auto-apply)
- URL sync via `replace: true` (no history spam)
- Loading states prevent duplicate requests

### Accessibility
- Proper labels on all inputs
- Keyboard navigation support
- ARIA labels for remove buttons
- Focus management

## Files Created/Modified

### New Files
- `src/types/index.ts` - Added `JobFilters` interface
- `src/hooks/useJobFilters.ts` - Filter state management hook
- `src/components/FilterPanel.tsx` - Reusable filter UI component

### Modified Files
- `src/services/api.ts` - Updated `getJobs` and `getJobsForMap` to accept filters
- `src/pages/BrowseJobs.tsx` - Integrated filter panel and loading states
- `src/pages/MapPage.tsx` - Integrated filter panel and empty states

## Testing Checklist

- [ ] Filter by price range works
- [ ] Text search finds matching jobs
- [ ] Location filter works
- [ ] Skills filter (multiple tags) works
- [ ] "Apply Filters" triggers re-fetch
- [ ] "Clear Filters" resets all inputs
- [ ] URL params sync correctly
- [ ] Loading states appear during fetch
- [ ] Empty states show appropriate messages
- [ ] Filters work on Browse page
- [ ] Filters work on Map page
- [ ] Browser back/forward navigation works
- [ ] Shareable URLs with filters work

## Future Enhancements (Optional)
- Auto-apply filters with debounce (instead of "Apply" button)
- Date range filter (job creation date)
- Sort options (price, date, distance)
- Save filter presets
- Filter by job status
- Advanced location (radius search)
- Export filtered results
