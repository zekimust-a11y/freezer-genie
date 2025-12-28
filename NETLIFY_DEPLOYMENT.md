# Netlify Deployment Guide

## Prerequisites

1. **GitHub Repository**: Your code should be pushed to GitHub
2. **PostgreSQL Database**: You need a PostgreSQL database hosted externally (Netlify doesn't provide PostgreSQL)

## Recommended Database Providers

Choose one of these PostgreSQL providers:
- **Supabase** (Free tier available)
- **Railway** (Free tier available)
- **PlanetScale** (Free tier available)
- **ElephantSQL** (Free tier available)
- **AWS RDS** (Paid)
- **Google Cloud SQL** (Paid)

## Environment Variables

Set these environment variables in your Netlify dashboard:

### Required
- `DATABASE_URL`: PostgreSQL connection string
  ```
  postgresql://username:password@host:port/database
  ```

### Optional
- `NODE_ENV`: Automatically set to `production` by Netlify

## Deployment Steps

1. **Connect to Netlify**:
   - Go to [netlify.com](https://netlify.com)
   - Sign up/Login with GitHub
   - Click "New site from Git"
   - Choose your GitHub repository

2. **Configure Build Settings**:
   - **Base directory**: (leave empty)
   - **Build command**: `npm run build`
   - **Publish directory**: `dist/public`

3. **Set Environment Variables**:
   - Go to Site settings > Environment variables
   - Add `DATABASE_URL` with your PostgreSQL connection string

4. **Deploy**:
   - Netlify will automatically build and deploy your site
   - The first deployment may take longer as it installs dependencies

## Database Setup

After deployment, you need to run the database migrations:

1. **Via Netlify CLI** (recommended):
   ```bash
   npm install -g netlify-cli
   netlify login
   netlify link  # Link to your site
   netlify functions:invoke db-push --payload '{}'
   ```

2. **Via Direct Database Connection**:
   - Connect to your PostgreSQL database directly
   - Run the Drizzle migrations manually

## Troubleshooting

### Build Fails
- Check that all dependencies are in `package.json`
- Verify `DATABASE_URL` is set correctly
- Check build logs in Netlify dashboard

### API Functions Fail
- Ensure `DATABASE_URL` environment variable is set
- Check that your PostgreSQL database is accessible
- Verify database credentials are correct

### Database Connection Issues
- Make sure your PostgreSQL provider allows connections from Netlify's IP ranges
- Check that the database server is running and accessible
- Verify the connection string format

## Post-Deployment

1. **Test the Application**:
   - Visit your Netlify site URL
   - Try adding/editing freezer items
   - Check that data persists in the database

2. **Custom Domain** (optional):
   - Go to Site settings > Domain management
   - Add your custom domain

3. **Monitoring**:
   - Check function logs in Netlify dashboard
   - Monitor database usage on your provider's dashboard

## File Structure

```
netlify/
  functions/
    _shared.ts          # Shared utilities for functions
    auth.ts            # Authentication endpoints
    items.ts           # Freezer items CRUD
    freezers.ts        # Freezer management
    custom-locations.ts # Custom location management
```

Each function handles the corresponding API endpoints with proper CORS headers and error handling.
