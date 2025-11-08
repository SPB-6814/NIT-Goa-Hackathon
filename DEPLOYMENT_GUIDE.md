# 🚀 Deployment Guide - NIT Goa Hackathon Platform

## Deployment Platform: Vercel ✨

This guide will walk you through deploying your React + Vite + Supabase application to Vercel.

---

## 📋 Prerequisites

Before deploying, ensure you have:
- ✅ A GitHub account
- ✅ Your code pushed to a GitHub repository
- ✅ Supabase project is live and accessible
- ✅ Google Gemini API key

---

## 🎯 Step-by-Step Deployment

### Step 1: Prepare Your Repository

1. **Push your code to GitHub** (if not already done):
```bash
cd /home/piyush/NIT-Goa-Hackathon

# Initialize git (if not done)
git init

# Add all files
git add .

# Commit
git commit -m "Ready for deployment"

# Add remote (replace with your repo URL)
git remote add origin https://github.com/YOUR_USERNAME/YOUR_REPO_NAME.git

# Push to GitHub
git push -u origin main
```

### Step 2: Create Vercel Account

1. Go to [vercel.com](https://vercel.com)
2. Click **"Sign Up"**
3. Choose **"Continue with GitHub"**
4. Authorize Vercel to access your GitHub account

### Step 3: Import Your Project

1. Once logged in, click **"Add New..."** → **"Project"**
2. Click **"Import Git Repository"**
3. Find and select your `NIT-Goa-Hackathon` repository
4. Click **"Import"**

### Step 4: Configure Project Settings

Vercel will automatically detect Vite. Configure as follows:

**Framework Preset:** Vite ✅ (Auto-detected)

**Build Settings:**
- **Build Command:** `npm run build` ✅ (Auto-filled)
- **Output Directory:** `dist` ✅ (Auto-filled)
- **Install Command:** `npm install` ✅ (Auto-filled)

**Root Directory:** `./` (Leave as default)

### Step 5: Add Environment Variables

⚠️ **CRITICAL STEP** - Click "Environment Variables" and add these:

| Name | Value | Where to Find |
|------|-------|---------------|
| `VITE_SUPABASE_URL` | `https://mohdrsvjwspgiurbiquu.supabase.co` | Your .env file |
| `VITE_SUPABASE_PUBLISHABLE_KEY` | `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...` | Your .env file |
| `VITE_GEMINI_API_KEY` | `AIzaSyCTQFGjerSLXS0O_pio77WsZVvtYy-sAfk` | Your .env file |
| `VITE_SUPABASE_PROJECT_ID` | `mohdrsvjwspgiurbiquu` | Your .env file |

**How to add:**
1. Click **"Environment Variables"**
2. Enter the variable name (e.g., `VITE_SUPABASE_URL`)
3. Enter the value
4. Select which environments: **Production**, **Preview**, and **Development** (select all)
5. Click **"Add"**
6. Repeat for all 4 variables

### Step 6: Deploy!

1. Click **"Deploy"**
2. Wait 1-2 minutes while Vercel:
   - Clones your repository
   - Installs dependencies
   - Builds your project
   - Deploys to their global CDN

### Step 7: Configure Supabase for Production URL

After deployment, Vercel will give you a URL like: `https://your-project.vercel.app`

**Update Supabase Settings:**

1. Go to [Supabase Dashboard](https://supabase.com/dashboard)
2. Select your project: `mohdrsvjwspgiurbiquu`
3. Go to **Settings** → **API** → **URL Configuration**
4. Under **Site URL**, add your Vercel URL: `https://your-project.vercel.app`
5. Under **Redirect URLs**, add:
   - `https://your-project.vercel.app/**`
   - `https://your-project.vercel.app/auth/callback`

---

## ✅ Post-Deployment Checklist

After deployment, verify everything works:

- [ ] Visit your Vercel URL
- [ ] Test user registration/login
- [ ] Test creating a post
- [ ] Test creating a project
- [ ] Test event interest button
- [ ] Test AI teammate matching
- [ ] Test notifications
- [ ] Test messaging system
- [ ] Test profile updates
- [ ] Check mobile responsiveness

---

## 🔄 Continuous Deployment

Vercel automatically sets up continuous deployment:

✨ **Every time you push to `main` branch:**
- Vercel automatically builds and deploys
- Takes ~30-60 seconds
- Zero downtime deployments

✨ **For Pull Requests:**
- Vercel creates a preview deployment
- Get a unique URL to test changes
- Perfect for reviewing before merging

---

## 🛠️ Useful Vercel Commands

### Install Vercel CLI (optional):
```bash
npm install -g vercel
```

### Deploy from Terminal:
```bash
vercel
```

### Deploy to Production:
```bash
vercel --prod
```

### View Deployment Logs:
```bash
vercel logs [deployment-url]
```

---

## 🎨 Custom Domain (Optional)

Want a custom domain like `hackathon-nitgoa.com`?

1. Buy a domain from:
   - Namecheap
   - GoDaddy
   - Google Domains
   - Cloudflare

2. In Vercel Dashboard:
   - Go to your project
   - Click **"Settings"** → **"Domains"**
   - Click **"Add Domain"**
   - Enter your domain
   - Follow DNS configuration instructions

3. Vercel automatically provides:
   - Free SSL certificate
   - Automatic HTTPS redirect
   - Global CDN

---

## 🐛 Troubleshooting

### Build Fails

**Check Build Logs:**
1. Go to Vercel Dashboard
2. Click on your failed deployment
3. Check **"Build Logs"** tab
4. Fix errors in your code
5. Push to GitHub to redeploy

**Common Issues:**
- Missing environment variables
- TypeScript errors
- Missing dependencies in package.json

### Environment Variables Not Working

**Ensure:**
- Variable names start with `VITE_`
- Variables are added to "Production" environment
- Redeploy after adding variables

### Supabase Connection Issues

**Check:**
- Environment variables are correct
- Supabase project is not paused
- Redirect URLs are configured
- RLS policies allow public access where needed

### 404 Errors on Routes

**Add `vercel.json`:**
```json
{
  "rewrites": [
    { "source": "/(.*)", "destination": "/index.html" }
  ]
}
```

This ensures React Router works correctly.

---

## 📊 Monitoring & Analytics

### Built-in Vercel Analytics:

1. Go to your project in Vercel
2. Click **"Analytics"** tab
3. View:
   - Page views
   - Unique visitors
   - Top pages
   - Performance metrics

### Add Vercel Speed Insights:

```bash
npm install @vercel/speed-insights
```

In `src/main.tsx`:
```typescript
import { SpeedInsights } from '@vercel/speed-insights/react';

// Add to your app
<SpeedInsights />
```

---

## 💰 Pricing & Limits

### Vercel Free Tier (Hobby):
- ✅ Unlimited projects
- ✅ 100GB bandwidth/month
- ✅ Automatic HTTPS
- ✅ Preview deployments
- ✅ 100 builds/day
- ✅ 6,000 build minutes/month

**This is MORE than enough for your hackathon project!**

### If You Need More:
- **Pro Plan:** $20/month
  - 1TB bandwidth
  - Unlimited builds
  - Team collaboration
  - Advanced analytics

---

## 🔐 Security Best Practices

1. **Never commit `.env` to GitHub**
   - Already in `.gitignore` ✅
   - Only use Vercel's environment variables

2. **Use Supabase RLS Policies**
   - Already implemented ✅
   - Prevents unauthorized data access

3. **Rotate API Keys Regularly**
   - Change Gemini API key periodically
   - Update in Vercel environment variables

4. **Enable Supabase Security Features**
   - Enable email verification
   - Set up rate limiting
   - Monitor authentication logs

---

## 📱 Testing Your Production App

### Desktop Testing:
1. Chrome DevTools → Network tab
2. Check for errors
3. Test all features
4. Verify API calls work

### Mobile Testing:
1. Open on your phone
2. Test touch interactions
3. Check responsive design
4. Test notifications (if using PWA)

### Performance Testing:
1. Use [PageSpeed Insights](https://pagespeed.web.dev/)
2. Enter your Vercel URL
3. Aim for 90+ score
4. Fix any issues identified

---

## 🎯 Performance Optimization Tips

### 1. Code Splitting (Already Done with React Router)
```typescript
// Lazy load pages
const HomePage = lazy(() => import('./pages/HomePage'));
```

### 2. Image Optimization
- Use WebP format
- Compress images before uploading
- Use Supabase image transformation

### 3. Enable Vercel Analytics
```bash
npm install @vercel/analytics
```

### 4. Add Caching Headers (automatic with Vercel)
- Static assets cached for 1 year
- HTML cached for 0 seconds (always fresh)

---

## 📞 Support & Help

### Vercel Documentation:
- [Vite Deployment](https://vercel.com/docs/frameworks/vite)
- [Environment Variables](https://vercel.com/docs/projects/environment-variables)
- [Custom Domains](https://vercel.com/docs/custom-domains)

### Supabase Documentation:
- [Auth Setup](https://supabase.com/docs/guides/auth)
- [RLS Policies](https://supabase.com/docs/guides/auth/row-level-security)

### Community Support:
- [Vercel Discord](https://vercel.com/discord)
- [Supabase Discord](https://discord.supabase.com)

---

## 🎉 Success!

Once deployed, you'll have:
- ✅ Live production URL
- ✅ Automatic deployments on push
- ✅ HTTPS security
- ✅ Global CDN distribution
- ✅ Preview deployments for PRs
- ✅ Built-in analytics

**Your hackathon platform is now live! 🚀**

Share your Vercel URL with users and start testing!

---

## 🔄 Making Updates

### Quick Fix Workflow:
```bash
# Make your changes
git add .
git commit -m "Fix: description of fix"
git push

# Vercel automatically deploys! ✨
# Check Vercel dashboard for build status
```

### Feature Development Workflow:
```bash
# Create a new branch
git checkout -b feature/new-feature

# Make changes
git add .
git commit -m "Add: new feature"
git push origin feature/new-feature

# Create Pull Request on GitHub
# Vercel creates a preview deployment
# Test the preview URL
# Merge PR when ready
# Vercel auto-deploys to production
```

---

## 📝 Environment Variables Reference

For future reference, here are all your environment variables:

```bash
# Supabase Configuration
VITE_SUPABASE_URL=https://mohdrsvjwspgiurbiquu.supabase.co
VITE_SUPABASE_PUBLISHABLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1vaGRyc3Zqd3NwZ2l1cmJpcXV1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjI2MDc3NDgsImV4cCI6MjA3ODE4Mzc0OH0.8fHbiOZp1pZ_BESf8a9yDDyKtYFgdm6dUawqRcox1jA
VITE_SUPABASE_PROJECT_ID=mohdrsvjwspgiurbiquu

# AI Configuration
VITE_GEMINI_API_KEY=AIzaSyCTQFGjerSLXS0O_pio77WsZVvtYy-sAfk
```

⚠️ **IMPORTANT:** These values are shown for deployment reference. Keep them secure!

---

**Happy Deploying! 🎊**
