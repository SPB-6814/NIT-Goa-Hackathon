# 🚀 Pre-Deployment Checklist

## ✅ Before Deploying to Vercel

### 1. Code Quality
- [ ] All TypeScript errors fixed
- [ ] No console errors in browser
- [ ] All features tested locally
- [ ] Responsive design tested on mobile

### 2. Environment Setup
- [ ] `.env` file is NOT committed to git (check `.gitignore`)
- [ ] All environment variables documented
- [ ] Supabase project is live and accessible
- [ ] Gemini API key is valid

### 3. Database & Backend
- [ ] All Supabase migrations applied
- [ ] RLS policies tested and working
- [ ] Storage buckets created:
  - [ ] `avatars`
  - [ ] `post-images`
  - [ ] `project-images`
  - [ ] `message-attachments`
- [ ] Sample data created for testing (optional)

### 4. Build Test
- [ ] Run `npm run build` locally to check for build errors
- [ ] Run `npm run preview` to test production build
- [ ] Check bundle size (should be < 1MB for optimal performance)

### 5. Security
- [ ] API keys are in `.env`, not hardcoded
- [ ] `.env` is in `.gitignore`
- [ ] Supabase RLS policies enabled on all tables
- [ ] CORS configured properly in Supabase

### 6. Git Repository
- [ ] Code pushed to GitHub
- [ ] Repository is public or Vercel has access
- [ ] `.gitignore` properly configured
- [ ] Main branch is `main` or `master`

---

## 🔧 Build Command Test

Run this before deploying:

```bash
# Clean install
rm -rf node_modules package-lock.json
npm install

# Build
npm run build

# Preview production build
npm run preview
```

If this works locally, Vercel deployment will work!

---

## 📝 Vercel Environment Variables Needed

Copy these to Vercel dashboard:

```
VITE_SUPABASE_URL
VITE_SUPABASE_PUBLISHABLE_KEY
VITE_SUPABASE_PROJECT_ID
VITE_GEMINI_API_KEY
```

---

## 🎯 Post-Deployment Tests

After deploying, test these features:

### Authentication
- [ ] Sign up with email
- [ ] Email verification (if enabled)
- [ ] Login
- [ ] Logout
- [ ] Password reset

### Profile
- [ ] View profile
- [ ] Edit profile
- [ ] Upload avatar
- [ ] Update skills/interests

### Posts
- [ ] Create post
- [ ] Upload post images
- [ ] Filter posts by tags
- [ ] Like/unlike posts
- [ ] Comment on posts

### Projects
- [ ] Create project
- [ ] Upload project image
- [ ] Request to join project
- [ ] Approve/reject join requests
- [ ] View project details

### Events
- [ ] View events
- [ ] Filter events by tags
- [ ] Mark interest in event
- [ ] AI teammate matching triggers
- [ ] Match notifications appear

### Notifications
- [ ] Receive teammate match notifications
- [ ] Mark notifications as read
- [ ] Delete notifications
- [ ] Real-time updates work

### Messaging
- [ ] Send message
- [ ] Receive message (test with 2 accounts)
- [ ] Upload attachment
- [ ] Real-time message updates

### UI/UX
- [ ] Dark/light mode toggle
- [ ] Mobile responsive
- [ ] Tablet responsive
- [ ] Desktop layout
- [ ] Loading states
- [ ] Error states

---

## 🐛 Common Deployment Issues & Fixes

### 1. Build Fails on Vercel
**Check:**
- Build logs in Vercel dashboard
- TypeScript errors
- Missing dependencies

**Fix:**
```bash
# Ensure build works locally first
npm run build
```

### 2. Blank Page After Deploy
**Check:**
- Browser console for errors
- Environment variables set correctly
- `vercel.json` routing configuration

**Fix:**
- Verify all env vars start with `VITE_`
- Check `vercel.json` exists

### 3. Supabase Connection Fails
**Check:**
- Environment variables are correct
- Supabase project is not paused
- Network tab shows API calls

**Fix:**
- Double-check Supabase URL and keys
- Verify redirect URLs in Supabase settings

### 4. 404 on Page Refresh
**Fix:**
- Ensure `vercel.json` has rewrite rules
- React Router needs SPA configuration

### 5. Images Not Loading
**Check:**
- Supabase storage buckets exist
- Storage policies allow public access
- Image URLs are correct

---

## 📊 Performance Targets

After deployment, aim for:

- ✅ **Lighthouse Score:** > 90
- ✅ **First Contentful Paint:** < 1.5s
- ✅ **Time to Interactive:** < 3.5s
- ✅ **Bundle Size:** < 1MB
- ✅ **API Response Time:** < 500ms

Test at: https://pagespeed.web.dev/

---

## 🎉 Ready to Deploy!

Once all checkboxes are ✅, you're ready to deploy to Vercel!

Follow the steps in `DEPLOYMENT_GUIDE.md`
