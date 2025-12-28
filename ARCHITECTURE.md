# Freezer Genie - Project Architecture

## 📋 Project Overview

**Freezer Genie** is a Progressive Web App (PWA) for managing household freezer inventory with multi-user authentication. Each user has their own private inventory that can be accessed across devices.

- **Live URL**: https://freezer-genie.netlify.app
- **Repository**: https://github.com/zekimust-a11y/freezer-genie
- **Type**: Single Page Application (SPA) with serverless backend

---

## 🏗️ Technology Stack

### **Frontend**
- **Framework**: React 18.3.1 with TypeScript
- **Build Tool**: Vite 5.4.20
- **Routing**: Wouter 3.3.5 (lightweight React Router alternative)
- **State Management**: @tanstack/react-query 5.60.5 (TanStack Query)
- **UI Components**: Radix UI primitives + shadcn/ui
- **Styling**: Tailwind CSS 3.4.17 with custom design system
- **Icons**: Lucide React + React Icons
- **Animations**: Framer Motion 11.13.1

### **Backend**
- **Runtime**: Netlify Functions (Node.js 18)
- **API Style**: REST API with serverless functions
- **Database**: PostgreSQL (Neon.tech serverless)
- **ORM**: Drizzle ORM 0.39.3
- **Schema Validation**: Zod 3.24.2
- **Build**: esbuild (pre-bundled to CommonJS)

### **Authentication**
- **Provider**: Clerk (React SDK)
- **Method**: JWT tokens via Authorization header
- **Account Portal**: https://fluent-krill-11.accounts.dev/
- **OAuth Providers**: Email, Google, GitHub, etc.

### **Hosting & Deployment**
- **Frontend**: Netlify (Static Site Hosting)
- **Backend**: Netlify Functions (Serverless)
- **Database**: Neon PostgreSQL (Serverless)
- **CI/CD**: GitHub → Netlify (automatic deployments)

---

## 🎨 Architecture Diagram

```
┌─────────────────────────────────────────────────────────────┐
│                         CLIENT SIDE                          │
│  ┌────────────────────────────────────────────────────────┐ │
│  │  React App (Vite)                                       │ │
│  │  ├─ Clerk Authentication (JWT)                          │ │
│  │  ├─ Wouter Routing                                      │ │
│  │  ├─ TanStack Query (API State)                          │ │
│  │  └─ UI Components (Radix + Tailwind)                    │ │
│  └────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────┘
                              ↕ HTTPS
┌─────────────────────────────────────────────────────────────┐
│                      NETLIFY PLATFORM                        │
│  ┌────────────────────────────────────────────────────────┐ │
│  │  Static Assets (CDN)                                    │ │
│  │  └─ /dist/public/* (HTML, CSS, JS, Images)             │ │
│  └────────────────────────────────────────────────────────┘ │
│                              ↕                               │
│  ┌────────────────────────────────────────────────────────┐ │
│  │  Netlify Functions (Serverless)                         │ │
│  │  ├─ /api/items      (GET, POST, PUT, DELETE)           │ │
│  │  ├─ /api/freezers   (GET, POST, PUT, DELETE)           │ │
│  │  ├─ /api/custom-locations (GET, POST, PUT, DELETE)     │ │
│  │  └─ /api/user       (GET current user)                 │ │
│  │                                                          │ │
│  │  Auth: JWT validation via Clerk tokens                  │ │
│  └────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────┘
                              ↕ SQL
┌─────────────────────────────────────────────────────────────┐
│                   NEON PostgreSQL (Serverless)               │
│  ┌────────────────────────────────────────────────────────┐ │
│  │  Database Schema (Drizzle ORM)                          │ │
│  │  ├─ users (id, email, full_name, avatar_url)           │ │
│  │  ├─ freezer_items (id, user_id, name, category, ...)   │ │
│  │  ├─ freezers (id, user_id, name, type)                 │ │
│  │  └─ custom_locations (id, user_id, name)               │ │
│  └────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────┘
                              ↕
┌─────────────────────────────────────────────────────────────┐
│                    CLERK AUTHENTICATION                      │
│  Account Portal: https://fluent-krill-11.accounts.dev/      │
│  ├─ Sign In / Sign Up                                        │
│  ├─ OAuth Providers                                          │
│  └─ Session Management                                       │
└─────────────────────────────────────────────────────────────┘
```

---

## 🔐 Authentication Flow

1. **User visits app** → Redirected to `/login` if not authenticated
2. **User clicks "Log In"** → `openSignIn()` redirects to Clerk's hosted portal
3. **Clerk authenticates** → User signs in via email/OAuth
4. **Clerk redirects back** → User returns to app with JWT token
5. **App stores session** → Clerk manages session in cookies
6. **API calls include JWT** → Authorization: Bearer <token>
7. **Backend validates JWT** → Extracts user ID from token
8. **Data filtered by user** → Each user sees only their own items

### JWT Token Structure (Clerk)
```json
{
  "sub": "user_2abc123...",  // User ID
  "email": "user@example.com",
  "full_name": "John Doe",
  "image_url": "https://...",
  "iat": 1234567890,
  "exp": 1234567890
}
```

---

## 📁 Project Structure

```
freezer-genie/
├── client/                      # Frontend code
│   ├── src/
│   │   ├── components/          # Reusable UI components
│   │   │   ├── ui/              # shadcn/ui components
│   │   │   ├── category-filter.tsx
│   │   │   ├── freezer-item-card.tsx
│   │   │   ├── settings-panel.tsx
│   │   │   └── ...
│   │   ├── pages/               # Page components
│   │   │   ├── home.tsx         # Main inventory view
│   │   │   ├── add-edit-item.tsx
│   │   │   ├── login.tsx
│   │   │   └── not-found.tsx
│   │   ├── lib/                 # Utilities
│   │   │   ├── auth.tsx         # Clerk auth context
│   │   │   ├── queryClient.ts   # TanStack Query setup
│   │   │   └── utils.ts
│   │   ├── App.tsx              # Main app component
│   │   ├── main.tsx             # Entry point (ClerkProvider)
│   │   └── index.css            # Global styles
│   ├── index.html
│   └── public/                  # Static assets
├── netlify/
│   └── functions/               # Serverless API
│       ├── items.ts             # Item CRUD operations
│       ├── freezers.ts          # Freezer management
│       ├── custom-locations.ts  # Custom location management
│       ├── user.ts              # Get current user
│       ├── auth-utils.ts        # JWT validation helpers
│       └── schema.ts            # Database schema (copy)
├── shared/
│   └── schema.ts                # Shared database schema
├── server/                      # Local dev server (not deployed)
│   ├── db.ts
│   ├── storage.ts
│   └── routes.ts
├── script/
│   ├── build.ts                 # Build script
│   └── build-functions.ts       # Functions bundler
├── netlify.toml                 # Netlify configuration
├── drizzle.config.ts            # Drizzle ORM config
├── package.json
├── tsconfig.json
└── vite.config.ts
```

---

## 🗄️ Database Schema

### **users**
```sql
CREATE TABLE users (
  id VARCHAR PRIMARY KEY,              -- Clerk user ID
  email VARCHAR UNIQUE NOT NULL,
  full_name VARCHAR,
  avatar_url VARCHAR,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

### **freezer_items**
```sql
CREATE TABLE freezer_items (
  id VARCHAR PRIMARY KEY,
  user_id VARCHAR NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  category TEXT NOT NULL,              -- 'meat_fish', 'produce', etc.
  sub_category TEXT,                   -- 'chicken', 'beef', etc.
  quantity NUMERIC(10, 2) DEFAULT 1,
  unit TEXT DEFAULT 'item',
  expiration_date DATE,
  notes TEXT,
  low_stock_threshold INTEGER DEFAULT 0,
  location TEXT DEFAULT 'unassigned',
  freezer_id TEXT DEFAULT 'default',
  tags TEXT[],
  created_at TIMESTAMP DEFAULT NOW()
);
```

### **freezers**
```sql
CREATE TABLE freezers (
  id VARCHAR PRIMARY KEY,
  user_id VARCHAR NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  type TEXT DEFAULT 'fridge_freezer',  -- 'chest_freezer', 'upright_freezer', etc.
  created_at TIMESTAMP DEFAULT NOW()
);
```

### **custom_locations**
```sql
CREATE TABLE custom_locations (
  id VARCHAR PRIMARY KEY,
  user_id VARCHAR NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT NOW()
);
```

---

## 🔌 API Endpoints

All endpoints require `Authorization: Bearer <jwt_token>` header.

### **Items**
- `GET /api/items` - Get all user's items
- `GET /api/items/:id` - Get single item
- `POST /api/items` - Create new item
- `PUT /api/items/:id` - Update item
- `DELETE /api/items/:id` - Delete item

### **Freezers**
- `GET /api/freezers` - Get all user's freezers
- `GET /api/freezers/:id` - Get single freezer
- `POST /api/freezers` - Create new freezer
- `PUT /api/freezers/:id` - Update freezer
- `DELETE /api/freezers/:id` - Delete freezer

### **Custom Locations**
- `GET /api/custom-locations` - Get all user's custom locations
- `GET /api/custom-locations/:id` - Get single location
- `POST /api/custom-locations` - Create new location
- `PUT /api/custom-locations/:id` - Update location
- `DELETE /api/custom-locations/:id` - Delete location

### **User**
- `GET /api/user` - Get current authenticated user

---

## 🚀 Deployment Pipeline

```
Developer commits to GitHub
         ↓
GitHub webhook triggers Netlify
         ↓
Netlify clones repository
         ↓
Runs: npm install
         ↓
Runs: npm run build
  ├─ tsx script/build.ts (builds React app)
  └─ tsx script/build-functions.ts (bundles functions)
         ↓
Deploys to CDN
  ├─ Static assets → CDN edge nodes
  └─ Functions → Serverless runtime
         ↓
Site live at freezer-genie.netlify.app
```

---

## 🔧 Environment Variables

### **Netlify (Production)**
```bash
VITE_CLERK_PUBLISHABLE_KEY=pk_live_...
DATABASE_URL=postgresql://...
```

### **Local Development**
```bash
# .env or .env.local
VITE_CLERK_PUBLISHABLE_KEY=pk_test_...
DATABASE_URL=postgresql://...
```

---

## 🎯 Key Features

### **Multi-User Support**
- Each user has private data
- Clerk handles authentication
- JWT tokens identify users
- Database filters by `user_id`

### **Progressive Web App**
- Installable on mobile devices
- Service worker for offline support
- App manifest for home screen
- Responsive design

### **Inventory Management**
- Add/edit/delete items
- Multiple categories with icons
- Expiration date tracking
- Low stock alerts
- Barcode scanning
- Search and filtering
- Multiple freezers support

### **User Experience**
- Modern, clean UI
- Dark mode support
- Mobile-first design
- Voice commands (removed in current version)
- Share inventory via email/SMS/WhatsApp
- Print-friendly views

---

## 📦 Build Process

### **Client Build** (script/build.ts)
1. Vite builds React app
2. Outputs to `dist/public/`
3. Assets are hashed for cache busting
4. CSS is minified and combined

### **Functions Build** (script/build-functions.ts)
1. esbuild bundles each function
2. Converts TypeScript to JavaScript
3. Outputs to CommonJS format (for pg compatibility)
4. Bundles dependencies into single files
5. Outputs to `netlify/functions/*.js`

### **Why CommonJS?**
The `pg` (PostgreSQL) library requires CommonJS format in Node.js environments. Functions are pre-bundled with esbuild using `format: 'cjs'`.

---

## 🔒 Security

### **Authentication**
- JWT tokens (short-lived, auto-refreshed)
- Secure cookie storage
- OAuth 2.0 flows
- HTTPS only

### **Authorization**
- User ID extracted from JWT
- All queries filtered by `user_id`
- Row-level security via foreign keys
- No user can access other users' data

### **Database**
- Parameterized queries (SQL injection protection)
- TLS/SSL connections
- Serverless architecture (no persistent connections)
- Automatic backups (Neon)

---

## 📊 Performance

### **Frontend**
- Code splitting (automatic via Vite)
- Lazy loading for routes
- Image optimization
- Gzip compression
- CDN distribution

### **Backend**
- Serverless functions (pay per request)
- Cold start optimization
- Connection pooling (Neon)
- Efficient SQL queries
- Response caching headers

### **Database**
- Indexed columns (id, user_id)
- Neon autoscaling
- Serverless (no idle costs)
- Connection pooling

---

## 🐛 Debugging

### **Local Development**
```bash
npm run dev          # Start Vite dev server
npm run build        # Build for production
npm run db:push      # Push schema to database
```

### **View Logs**
- **Client**: Browser DevTools console
- **Functions**: Netlify Functions logs
- **Database**: Neon dashboard

### **Common Issues**
1. **401 Unauthorized**: Check Clerk token in Authorization header
2. **404 on API calls**: Check netlify.toml redirects
3. **Database connection**: Verify DATABASE_URL in Netlify env vars
4. **CORS errors**: Functions include CORS headers (see auth-utils.ts)

---

## 📚 Additional Documentation

- **Clerk Setup**: See `CLERK_SETUP.md`
- **API Documentation**: See function files for detailed endpoints
- **Component Library**: See `client/src/components/ui/`

---

## 🔗 Important Links

- **Live App**: https://freezer-genie.netlify.app
- **GitHub Repo**: https://github.com/zekimust-a11y/freezer-genie
- **Netlify Dashboard**: https://app.netlify.com/sites/freezer-genie
- **Clerk Dashboard**: https://dashboard.clerk.com
- **Neon Database**: https://console.neon.tech
- **Clerk Account Portal**: https://fluent-krill-11.accounts.dev

---

## 👥 Contributors

- Primary Developer: Zeki
- AI Assistant: Claude (Anthropic)

---

**Last Updated**: December 2024

