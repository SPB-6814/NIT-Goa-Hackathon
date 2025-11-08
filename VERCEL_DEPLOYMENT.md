# 🚀 Vercel Deployment Guide - NIT Goa Hackathon Project

## 📋 Pre-Deployment Checklist

- [ ] All code committed to Git
- [ ] `.env` file is NOT committed (in `.gitignore`)
- [ ] Environment variables documented in `.env.example`
- [ ] Build test passes locally
- [ ] Gemini API key ready
- [ ] Supabase project configured

---

## 🌐 **Method 1: Deploy via Vercel Dashboard** (Recommended - 5 minutes)

### **Step 1: Push Code to GitHub**

```bash
# Initialize git if not already done
git init

# Add all files
git add .

# Commit changes
git commit -m "Prepare for Vercel deployment"

# Create a new repository on GitHub (https://github.com/new)
# Then connect and push:
git remote add origin https://github.com/YOUR_USERNAME/YOUR_REPO_NAME.git
git branch -M main
git push -u origin main
```

### **Step 2: Import Project to Vercel**

1. **Go to Vercel**: https://vercel.com
2. **Sign Up/Login** with your GitHub account
3. **Click "Add New Project"**
4. **Import your GitHub repository**:
   - Select your repository from the list
   - Click "Import"

### **Step 3: Configure Build Settings**

Vercel will auto-detect your Vite project. Verify these settings:

- **Framework Preset**: `Vite`
- **Build Command**: `npm run build` (or `bun run build` if using Bun)
- **Output Directory**: `dist`
- **Install Command**: `npm install` (auto-detected)
- **Root Directory**: `./` (leave as default)

### **Step 4: Add Environment Variables**

Click on **"Environment Variables"** section and add:

| Variable Name | Value | Where to Get It |
|--------------|-------|-----------------|
| `VITE_SUPABASE_URL` | `https://mohdrsvjwspgiurbiquu.supabase.co` | Already in your .env.example |
| `VITE_SUPABASE_PUBLISHABLE_KEY` | `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...` | Already in your .env.example |
| `VITE_GEMINI_API_KEY` | `YOUR_GEMINI_API_KEY` | Get from https://aistudio.google.com/apikey |

**Important:** 
- Add these for **all environments** (Production, Preview, Development)
- You can get your Gemini API key from: https://aistudio.google.com/app/apikey

### **Step 5: Deploy**

1. Click **"Deploy"**
2. Wait 1-2 minutes for the build to complete
3. Get your live URL: `https://your-project-name.vercel.app`

### **Step 6: Test Your Deployment**

1. Visit your deployed URL
2. Test authentication (Sign up/Login)
3. Test the Events page
4. Test the AI matching feature:
   - Login as User 1, click "Interested" on an event
   - Login as User 2, click "Interested" on the same event
   - Check notifications for both users

---

## 💻 **Method 2: Deploy via Vercel CLI**

### **Step 1: Install Vercel CLI**

```bash
npm install -g vercel
```

### **Step 2: Login to Vercel**

```bash
vercel login
```

Follow the prompts to authenticate.

### **Step 3: Deploy**

```bash
# Navigate to your project directory
cd /home/piyush/NIT-Goa-Hackathon

# Run deployment (first time)
vercel

# Follow the prompts:
# ? Set up and deploy "~/NIT-Goa-Hackathon"? [Y/n] Y
# ? Which scope do you want to deploy to? [Your Account]
# ? Link to existing project? [y/N] N
# ? What's your project's name? nit-goa-hackathon
# ? In which directory is your code located? ./
# Auto-detected Project Settings (Vite):
# ? Want to override the settings? [y/N] N
```

### **Step 4: Add Environment Variables**

```bash
# Add Supabase URL
vercel env add VITE_SUPABASE_URL

# Add Supabase Key
vercel env add VITE_SUPABASE_PUBLISHABLE_KEY

# Add Gemini API Key
vercel env add VITE_GEMINI_API_KEY
```

For each command:
- Choose environment: `Production`, `Preview`, and `Development` (select all)
- Paste the value when prompted

### **Step 5: Deploy to Production**

```bash
# Deploy to production
vercel --prod
```

---

## 🔑 Environment Variables Reference

You need these three environment variables:

### 1. **VITE_SUPABASE_URL**
```
https://mohdrsvjwspgiurbiquu.supabase.co
```

### 2. **VITE_SUPABASE_PUBLISHABLE_KEY**
```
eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1vaGRyc3Zqd3NwZ2l1cmJpcXV1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjI2MDc3NDgsImV4cCI6MjA3ODE4Mzc0OH0.8fHbiOZp1pZ_BESf8a9yDDyKtYFgdm6dUawqRcox1jA
```

### 3. **VITE_GEMINI_API_KEY**
Get from: https://aistudio.google.com/app/apikey

**How to get Gemini API Key:**
1. Go to https://aistudio.google.com/app/apikey
2. Click "Create API Key"
3. Select a Google Cloud project (or create new)
4. Copy the generated API key

---

## 🔄 Continuous Deployment

After initial setup, every push to your `main` branch will automatically trigger a new deployment!

```bash
git add .
git commit -m "Update feature"
git push origin main
# Vercel automatically deploys! 🎉
```

---

## 🛠️ Troubleshooting

### Build fails with "Module not found"
- Make sure all dependencies are in `package.json`
- Run `npm install` locally to verify
- Check that `vercel.json` is correctly configured

### Environment variables not working
- Ensure variable names start with `VITE_` (required for Vite)
- Redeploy after adding env vars: `vercel --prod`
- Check Vercel dashboard → Your Project → Settings → Environment Variables

### 404 errors on refresh
- Already handled by `vercel.json` rewrites configuration ✅
- If still occurring, verify `vercel.json` is in root directory

### AI Matching not working
- Verify `VITE_GEMINI_API_KEY` is set in production
- Check browser console for API errors
- Ensure Gemini API is enabled in Google Cloud Console

---

## 📊 Monitoring

After deployment, monitor your app:

1. **Vercel Dashboard**: https://vercel.com/dashboard
   - View deployment logs
   - Check analytics
   - Monitor performance

2. **Supabase Dashboard**: https://supabase.com/dashboard
   - Check database activity
   - Monitor API usage
   - View authentication logs

3. **Gemini API Usage**: https://aistudio.google.com
   - Monitor API quota
   - Check request usage

---

## 🎯 Next Steps After Deployment

1. ✅ Test all features on production URL
2. ✅ Share URL with team/testers
3. ✅ Set up custom domain (optional)
4. ✅ Enable Vercel Analytics (optional)
5. ✅ Set up monitoring/error tracking

---

## 🌟 Custom Domain (Optional)

To add a custom domain:

1. Go to Vercel Dashboard → Your Project → Settings → Domains
2. Click "Add Domain"
3. Enter your domain name
4. Follow DNS configuration instructions
5. Wait for SSL certificate (automatic)

---

## ✅ Deployment Checklist

Before deploying:

- [ ] Code pushed to GitHub
- [ ] `.env` file not committed
- [ ] All dependencies in `package.json`
- [ ] `vercel.json` configured
- [ ] Build succeeds locally: `npm run build`
- [ ] Gemini API key obtained
- [ ] Supabase project accessible

During deployment:

- [ ] Project imported to Vercel
- [ ] Build settings verified
- [ ] All 3 environment variables added
- [ ] Deployment successful

After deployment:

- [ ] Test authentication
- [ ] Test event browsing
- [ ] Test AI matching (2 users, same event)
- [ ] Test notifications
- [ ] Check browser console for errors

---

## 🚀 Quick Deploy Commands

```bash
# One-time setup
npm install -g vercel
vercel login
vercel

# Add environment variables
vercel env add VITE_SUPABASE_URL
vercel env add VITE_SUPABASE_PUBLISHABLE_KEY
vercel env add VITE_GEMINI_API_KEY

# Deploy to production
vercel --prod

# Subsequent deployments (after code changes)
git add .
git commit -m "Your changes"
git push origin main  # Auto-deploys!
```

---

## 📝 Support

- **Vercel Docs**: https://vercel.com/docs
- **Vite Deployment**: https://vitejs.dev/guide/static-deploy.html#vercel
- **Supabase Docs**: https://supabase.com/docs
- **Gemini API Docs**: https://ai.google.dev/docs

---

**Happy Deploying! 🎉**
