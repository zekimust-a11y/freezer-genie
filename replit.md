# Freezer Inventory Manager

## Overview

A household freezer inventory management application that helps users track frozen food items, their quantities, categories, and expiration dates. Built with a modern full-stack architecture using Express.js backend and React frontend with TypeScript throughout.

The application provides a clean, productivity-focused interface for managing freezer contents with features including categorization, search, filtering, and expiration tracking to help users avoid food waste and easily find what they need.

## User Preferences

Preferred communication style: Simple, everyday language.

**Version Management**: Current version is 0.0.1 (in client/src/components/settings-panel.tsx). Increment by 0.0.1 on each publish (e.g., 0.0.1 → 0.0.2 → 0.0.3).

## System Architecture

### Frontend Architecture

**Framework & Routing**
- React 18 with TypeScript for type safety
- Wouter for lightweight client-side routing
- Single-page application (SPA) architecture with a single main route (home page)

**State Management**
- TanStack Query (React Query) for server state management and caching
- React hooks for local component state
- No global state management library (Redux/Zustand) - keeps things simple

**UI Component Library**
- Shadcn/ui components built on Radix UI primitives
- Tailwind CSS for styling with a custom design system
- Theme system supporting light/dark modes with local storage persistence
- Design inspired by Material Design and productivity tools (Notion, Todoist)

**Form Handling**
- React Hook Form for form state management
- Zod for schema validation on both client and server
- Form schemas defined in shared directory for consistency

**Key Design Decisions**
- Card-based layout for inventory items with responsive grid
- Sticky header with integrated search
- Category filtering with icon-based visual indicators
- Expiration status badges with color-coded urgency levels
- Mobile-first responsive design

### Backend Architecture

**Server Framework**
- Express.js with TypeScript
- HTTP server for REST API endpoints
- Development mode uses Vite middleware for HMR (Hot Module Replacement)
- Production mode serves static built files

**API Design**
- RESTful API pattern with CRUD operations
- Routes defined in `/api/*` namespace
- JSON request/response format
- Schema validation using Zod on incoming requests

**Storage Layer**
- Currently uses in-memory storage (MemStorage class) for development
- Storage interface (IStorage) defined for easy swapping to database implementation
- Designed to support PostgreSQL via Drizzle ORM (configuration present but not yet connected)

**Key Design Decisions**
- Separation of concerns: routes, storage, and static file serving in separate modules
- Interface-based storage allows switching from memory to database without changing business logic
- Request/response logging middleware for debugging
- Raw body capture for webhook/payment integrations (prepared for future use)

### Data Schema

**Freezer Item Model**
- Unique ID (UUID/VARCHAR)
- Name (required text field)
- Category (string - supports both built-in and custom categories)
- Quantity (integer, default 1)
- Unit (text, default "item")
- Expiration date (optional date field)
- Notes (optional text field)
- Location (optional - shelf/drawer assignment)
- Low stock threshold (optional integer)

**Built-in Categories**
- meat_fish, produce, prepared_meals, frozen_goods, dairy, desserts, bread, other

**Custom Categories**
- Users can add custom categories via Settings
- Custom categories stored in localStorage
- Custom categories appear in category dropdowns and filters
- Custom categories use a default icon and gray styling

**Validation Strategy**
- Shared Zod schemas between frontend and backend
- Insert schema omits auto-generated fields (like ID)
- Frontend-specific schema adds additional validation rules (min/max lengths, number coercion)
- Database schema defined using Drizzle ORM for future PostgreSQL integration

### Build & Development

**Development Setup**
- Vite dev server for frontend with HMR
- TSX for running TypeScript server code directly
- Concurrent frontend/backend development
- Hot reload on both client and server changes

**Production Build**
- esbuild bundles server code with selective dependency bundling
- Vite builds optimized client bundle
- Server serves pre-built static files
- Single-file server output (dist/index.cjs) for easy deployment

**Key Build Decisions**
- Server dependencies selectively bundled (allowlist approach) to reduce cold start time
- Source maps preserved for debugging
- Incremental TypeScript compilation for faster rebuilds

## External Dependencies

### UI Component Libraries
- Radix UI primitives for accessible, unstyled components
- Lucide React for iconography
- date-fns for date manipulation and formatting
- Tailwind CSS for utility-first styling

### Form & Validation
- React Hook Form for performant form handling
- Zod for runtime type validation
- zod-validation-error for user-friendly error messages
- @hookform/resolvers for Zod integration

### Data Fetching
- TanStack Query (React Query) for server state and caching
- Native fetch API for HTTP requests

### Database (Configured, Not Yet Active)
- Drizzle ORM for type-safe database queries
- PostgreSQL as target database (via DATABASE_URL environment variable)
- drizzle-kit for schema migrations
- Connection setup requires DATABASE_URL environment variable

### Session Management (Prepared)
- express-session support configured
- connect-pg-simple for PostgreSQL session store
- Currently unused but infrastructure in place

### Development Tools
- Replit-specific plugins for development banner, error overlay, and cartographer
- TypeScript for type safety across the stack
- ESLint/Prettier configurations (implicit via tooling)

### Styling
- class-variance-authority for component variant management
- clsx and tailwind-merge (via cn utility) for conditional class handling
- PostCSS with Autoprefixer for CSS processing

**Note on Database**: The application is configured to use PostgreSQL via Drizzle ORM but currently uses in-memory storage. The database schema is defined and migrations are configured, requiring only a DATABASE_URL environment variable to activate PostgreSQL persistence.