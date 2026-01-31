# Clinical Command Center

A real-time clinical trial management dashboard built as a prototype.

## Live Demo

[https://clinical-center.pockethost.io/](https://clinical-center.pockethost.io/)

### TLDR
- **OAuth Login** - Sign in with Google
- **Dashboard** - Real-time biomarker monitoring with sparklines and trend indicators
- **Amendment Diff** - Click any amendment in the feed to view a side-by-side visual comparison
- **Live Data** - All data fetched via PocketBase API with WebSocket-powered real-time updates

### Demo Heartbeat

The live demo includes a **pulse simulation** that periodically updates biomarker values in the background. This mimics real-world data changes (e.g., new lab results arriving) and demonstrates the real-time update capabilities. When values change, you'll see them flash briefly on the dashboard. The simulation uses leader election via BroadcastChannel so only one browser tab triggers updates, even if multiple tabs are open.

## Key Features

### Real-Time Data Architecture
- **WebSocket Subscriptions**: Live updates via PocketBase's real-time API - when a researcher in London updates a biomarker, the UI in New York reflects it instantly
- **Optimistic Cache Updates**: Uses Vue Query's `setQueryData` to surgically update records without refetching entire datasets
- **Visual Pulse Effects**: Changed values flash briefly to draw attention to updates

### High-Density Biomarker Dashboard
- **Sparkline Visualizations**: Compact SVG trend charts with threshold reference lines
- **Categorized Display**: Biomarkers organized by Safety, Efficacy, and Exploratory categories
- **Trend Indicators**: Visual up/down/neutral icons based on recent value trajectory

### Protocol Amendment Tracking
- **Timeline Feed**: Chronological view of protocol changes with semantic icons
- **Change Type Classification**: Distinguishes between threshold tightening/loosening, biomarker additions/removals, and criteria expansions
- **Visual Diffs**: Color-coded inline diffs showing old → new value transitions

### Side-by-Side Version Comparison
- **Synchronized Scrolling**: Left and right panels scroll in tandem for easy comparison
- **Cumulative Diff Computation**: Shows all changes from baseline to selected version
- **Inline Change Highlighting**: Added fields highlighted in green, removed in red, modified with strikethrough + new value

### Authentication & Navigation
- **OAuth2 Integration**: Google sign-in via PocketBase auth
- **Protected Routes**: Auth middleware redirects unauthenticated users
- **Collapsible Sidebar**: Resizable navigation with persistent state

### UI/UX Quality
- **Skeleton Loading States**: Prevents layout shift during data fetches
- **Dark/Light Mode**: Full theme support with consistent color semantics
- **Responsive Design**: Adapts from mobile to desktop with fluid grid layouts

## Tech Stack

| Layer | Technology |
|-------|------------|
| Framework | Nuxt 4 (SPA mode) |
| UI Components | Nuxt UI v4 + Tailwind CSS v4 |
| State Management | TanStack Vue Query |
| Backend | PocketBase v0.36 |
| Validation | Zod |
| Type Safety | TypeScript |
| Testing | Vitest + Playwright |

## Architecture Highlights

### Repository-Lite Service Layer
```
services/clinical.service.ts  →  Functional exports (easy to refactor)
composables/useBiomarkers.ts  →  Vue Query wrappers (caching + reactivity)
composables/useSyncBiomarkers.ts  →  Real-time subscription handlers
```

### Information Density Philosophy
Rather than displaying biomarkers in a simple table, the dashboard uses:
- Compact card grids with sparklines
- Multi-metric stat cards with trend indicators
- Nested diff visualization in amendment feeds

This approach maximizes actionable information per screen pixel while maintaining readability.

## Future Roadmap

If this were moving to production, the next priorities would be:
1.  **Audit Logging:** Immutable recording of *who* viewed *which* version of a protocol.
2.  **Role-Based Access Control (RBAC):** Restricting "Protocol Editing" to Medical Directors only.
3.  **Offline Support:** Leveraging PWA capabilities for researchers in poor connectivity zones.




## Running Locally

```bash
pnpm install
pnpm dev
```

PocketBase should be running at `http://localhost:8090` (configured in `services/pocketbase.ts`).

## Testing

```bash
pnpm test:unit
```

Unit tests cover core business logic in pure functions:

- **`utils/amendmentChange.ts`** - Change type styling and value transition logic
- **`utils/protocolDiff.ts`** - Version parsing, cumulative diff computation, version sorting
- **`services/mappers.ts`** - PocketBase record to domain type transformations

These functions are intentionally designed as pure transformations with no external dependencies, making them testable without mocks or complex setup.

## Project Structure

```
app/
├── components/
│   ├── dashboard/       # StatCard, SparklineChart, AmendmentFeed, TrendSection
│   └── protocol/        # VersionView (side-by-side diff)
├── composables/         # useAuth, useBiomarkers, useSync*, useProtocolWithHistory
├── pages/
│   ├── dashboard/       # Main dashboard + protocol detail view
│   └── login.vue        # OAuth2 login
├── services/            # PocketBase client + clinical data service
├── types/               # TypeScript interfaces
└── utils/               # Diff computation, change type styling
```

## Design Rationale

> "By implementing protocol amendment tracking with cumulative diff computation and side-by-side synchronized scrolling, researchers can instantly audit how design changes impact biomarker thresholds over the trial's lifecycle."

This treats trial amendments as first-class citizens - not just a log entry, but a queryable, comparable, visual audit trail.
