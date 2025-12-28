# Freezer Genie 🧊

A modern freezer inventory management application built with React, TypeScript, and PostgreSQL.

## Features

- 📱 **Mobile-First Design**: Optimized for mobile devices with responsive design
- 🧊 **Freezer Management**: Track multiple freezers with custom locations
- 🏷️ **Item Categorization**: Organize items with categories, subcategories, and tags
- ⏰ **Expiration Tracking**: Get alerts for expiring items and low stock
- 📋 **Shopping Lists**: Auto-generated shopping lists based on low stock items
- 🍳 **Recipe Suggestions**: Get recipe ideas based on your freezer inventory
- 📷 **Barcode Scanning**: Scan barcodes to quickly add items
- 🎤 **Voice Control**: Voice commands for hands-free operation

## Tech Stack

- **Frontend**: React 18, TypeScript, Tailwind CSS, Shadcn/ui
- **Backend**: Netlify Functions (serverless)
- **Database**: PostgreSQL with Drizzle ORM
- **State Management**: TanStack Query
- **Routing**: Wouter
- **Deployment**: Netlify

## Quick Start

### Prerequisites

- Node.js 18+
- PostgreSQL database
- GitHub account (for deployment)

### Local Development

1. **Clone the repository**
   ```bash
   git clone https://github.com/zekimust-a11y/freezer-genie.git
   cd freezer-genie
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   ```bash
   cp .env.example .env
   # Edit .env with your DATABASE_URL
   ```

4. **Set up the database**
   ```bash
   npm run db:push
   ```

5. **Start development server**
   ```bash
   npm run dev
   ```

## Deployment to Netlify 🚀

### 1. Database Setup

Choose a PostgreSQL provider:
- **Supabase** (free tier available)
- **Railway** (free tier available)
- **PlanetScale** (free tier available)

Get your `DATABASE_URL` connection string.

### 2. Deploy to Netlify

1. **Connect Repository**
   - Go to [netlify.com](https://netlify.com)
   - Click "New site from Git"
   - Connect your GitHub repository

2. **Configure Build Settings**
   - **Base directory**: (leave empty)
   - **Build command**: `npm run build`
   - **Publish directory**: `dist/public`

3. **Set Environment Variables**
   - Go to Site settings > Environment variables
   - Add: `DATABASE_URL=your_postgresql_connection_string`

4. **Deploy**
   - Netlify will automatically build and deploy
   - First deployment may take 5-10 minutes

### 3. Run Database Migrations

After deployment:
```bash
# Install Netlify CLI
npm install -g netlify-cli
netlify login
netlify link  # Link to your site
netlify functions:invoke netlify:db-push --payload '{}'
```

### 4. Access Your App

Your Freezer Genie app will be available at: `https://your-site-name.netlify.app`

## Environment Variables

| Variable | Description | Required |
|----------|-------------|----------|
| `DATABASE_URL` | PostgreSQL connection string | Yes |
| `NODE_ENV` | Environment (auto-set by Netlify) | No |

## Project Structure

```
├── client/                 # React frontend
│   ├── src/
│   │   ├── components/     # Reusable UI components
│   │   ├── pages/         # Page components
│   │   ├── hooks/         # Custom React hooks
│   │   └── lib/           # Utilities and configurations
├── server/                 # Express server (development only)
├── netlify/
│   └── functions/          # Netlify serverless functions
├── shared/                 # Shared types and schemas
└── script/                 # Build scripts
```

## API Endpoints

- `GET/POST/PUT/DELETE /api/items` - Freezer items CRUD
- `GET/POST/PUT/DELETE /api/freezers` - Freezer management
- `GET/POST/DELETE /api/custom-locations` - Custom locations
- `GET /api/auth/user` - Authentication status

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test locally
5. Submit a pull request

## License

MIT License - see LICENSE file for details

## Support

For issues and questions:
- Create an issue on GitHub
- Check the [Netlify Deployment Guide](./NETLIFY_DEPLOYMENT.md) for deployment help
