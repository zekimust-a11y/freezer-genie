# 🔐 Clerk Authentication Setup Guide

## Why Clerk Instead of Netlify Identity?

**Netlify Identity is deprecated**. Clerk is the modern, recommended alternative with:
- ✅ **Actively maintained** with regular updates
- ✅ **Generous free tier**: 10,000 monthly active users
- ✅ **Beautiful pre-built UI** components
- ✅ **Multiple OAuth providers**: Google, GitHub, Facebook, Apple, etc.
- ✅ **Advanced features**: MFA, sessions, webhooks, analytics
- ✅ **Better developer experience**

---

## 🚀 Setup Instructions

### Step 1: Create a Clerk Account

1. Go to https://dashboard.clerk.com
2. Sign up for a free account
3. Create a new application
4. Choose **"Sign in with Email"** and any OAuth providers you want (Google, GitHub, etc.)

### Step 2: Get Your API Keys

1. In your Clerk dashboard, go to **"API Keys"**
2. Copy your **Publishable Key** (starts with `pk_test_...`)
3. Copy your **Secret Key** (starts with `sk_test_...`) - **Keep this secure!**

### Step 3: Configure Environment Variables

#### **For Local Development:**
Create a `.env` file in the project root:
```bash
VITE_CLERK_PUBLISHABLE_KEY=pk_test_your_key_here
CLERK_SECRET_KEY=sk_test_your_secret_key_here
DATABASE_URL=your_database_url_here
```

⚠️ **Important**: Never commit `.env` to git! It's already in `.gitignore`.

#### **For Netlify Deployment:**
1. Go to your Netlify dashboard: https://app.netlify.com/sites/freezer-genie
2. Click **"Site configuration"** → **"Environment variables"**
3. Add the following variables:
   - **Key**: `VITE_CLERK_PUBLISHABLE_KEY`
     - **Value**: Your Clerk publishable key (starts with `pk_test_...`)
   - **Key**: `CLERK_SECRET_KEY` ⚠️ **CRITICAL FOR SECURITY**
     - **Value**: Your Clerk secret key (starts with `sk_test_...`)
   - **Key**: `DATABASE_URL`
     - **Value**: Your PostgreSQL connection string
4. Click **"Save"**
5. **Trigger a new deploy** for the changes to take effect

### Step 4: Configure Clerk Application Settings

In your Clerk dashboard (https://dashboard.clerk.com):

1. **Go to "Paths"**:
   - Sign-in URL: `/sign-in`
   - Sign-up URL: `/sign-up`
   - After sign-in URL: `/`
   - After sign-up URL: `/`

2. **Go to "Social Connections"** (Optional):
   - Enable Google, GitHub, or other OAuth providers
   - Follow Clerk's setup guides for each provider

3. **Go to "Sessions"**:
   - Set session lifetime (default 7 days is fine)

4. **Go to "User & Authentication"**:
   - Enable email address as identifier
   - Configure password requirements if needed

### Step 5: Update Database Schema

Your database needs `userId` columns. Choose one option:

#### **Option A: Fresh Start** (⚠️ Deletes existing data)
```sql
-- Connect to your Neon database and run:
DROP TABLE IF EXISTS freezer_items CASCADE;
DROP TABLE IF EXISTS freezers CASCADE;
DROP TABLE IF EXISTS custom_locations CASCADE;
-- The app will recreate tables on first use
```

#### **Option B: Preserve Data**
```sql
-- Connect to your Neon database and run:
ALTER TABLE freezer_items ADD COLUMN user_id VARCHAR REFERENCES users(id) ON DELETE CASCADE;
ALTER TABLE freezers ADD COLUMN user_id VARCHAR REFERENCES users(id) ON DELETE CASCADE;
ALTER TABLE custom_locations ADD COLUMN user_id VARCHAR REFERENCES users(id) ON DELETE CASCADE;

-- Update users table structure
ALTER TABLE users DROP COLUMN IF EXISTS first_name;
ALTER TABLE users DROP COLUMN IF EXISTS last_name;
ALTER TABLE users DROP COLUMN IF EXISTS profile_image_url;
ALTER TABLE users ADD COLUMN IF NOT EXISTS full_name VARCHAR;
ALTER TABLE users ADD COLUMN IF NOT EXISTS avatar_url VARCHAR;
ALTER TABLE users ALTER COLUMN email SET NOT NULL;
```

### Step 6: Deploy to Netlify

```bash
git push
```

Netlify will automatically:
1. Detect the changes
2. Build your app
3. Deploy with the new Clerk authentication

---

## 🧪 Testing the Authentication

1. Visit https://freezer-genie.netlify.app
2. You should see a login page
3. Click **"Sign Up"**
4. Create an account with:
   - **Email + Password**, OR
   - **OAuth provider** (Google, GitHub, etc.)
5. You'll be redirected to the home page
6. Try adding items - they'll be private to your account!
7. Log out using the logout button in the header
8. Try logging in with a different account - you won't see the first user's items

---

## 🎨 Features Included

### **User Interface**
- ✅ Beautiful Clerk sign-in/sign-up components
- ✅ Automatic redirects for protected routes
- ✅ User avatar in header
- ✅ Logout button

### **Security**
- ✅ JWT-based authentication
- ✅ Automatic token refresh
- ✅ Secure password hashing (handled by Clerk)
- ✅ MFA support (available in Clerk)
- ✅ Session management

### **Data Isolation**
- ✅ Each user has their own private data
- ✅ Users can only see/edit their own items
- ✅ Cascade delete on user removal

---

## 📱 OAuth Providers Configuration

### **Google OAuth**
1. In Clerk dashboard, go to **"Social Connections"** → **"Google"**
2. Click **"Enable"**
3. Clerk will guide you through creating OAuth credentials
4. Test by clicking "Sign in with Google"

### **GitHub OAuth**
1. In Clerk dashboard, go to **"Social Connections"** → **"GitHub"**
2. Click **"Enable"**
3. Follow Clerk's setup guide
4. Test by clicking "Sign in with GitHub"

---

## 🔧 Troubleshooting

### **"Missing Clerk Publishable Key" Error**
- Make sure `VITE_CLERK_PUBLISHABLE_KEY` is set in Netlify environment variables
- Redeploy after adding the variable

### **"Missing CLERK_SECRET_KEY" Error or 401 Unauthorized**
- ⚠️ **CRITICAL**: `CLERK_SECRET_KEY` must be set in Netlify environment variables
- This is required for JWT verification on the backend
- Get it from Clerk Dashboard → API Keys → Secret Keys
- Add it to: Netlify Dashboard → Site Settings → Environment Variables
- **Security**: This key should NEVER be exposed to the client or committed to git

### **Redirect Loop**
- Check that Clerk paths are configured correctly:
  - Sign-in URL: `/sign-in`
  - Sign-up URL: `/sign-up`
  - After sign-in: `/`

### **401 Unauthorized on API Calls**
- Check browser console for token errors
- Verify Clerk is properly initialized
- Make sure user is logged in

---

## 💡 Additional Resources

- **Clerk Documentation**: https://clerk.com/docs
- **Clerk Dashboard**: https://dashboard.clerk.com
- **Clerk React SDK**: https://clerk.com/docs/references/react/overview
- **Clerk Community**: https://discord.com/invite/b5rXHjAg7A

---

## 🎉 That's It!

Your Freezer Genie app now has modern, secure authentication powered by Clerk! Each user can manage their own private inventory with support for multiple login methods.

