# Quick Fix Guide - Interest Button Not Working

## Problem
The "Interested" button doesn't work because the database tables don't exist yet.

## Solution (Choose One)

### Option A: Via Supabase Dashboard (EASIEST - 2 minutes)

1. **Open Supabase Dashboard**
   ```
   https://supabase.com/dashboard
   ```

2. **Select your project** from the list

3. **Go to SQL Editor**
   - Click "SQL Editor" in the left sidebar
   - Click "+ New Query" button

4. **Run the migration**
   - Open this file: `supabase/migrations/20251109000000_create_events_and_matching_tables.sql`
   - Copy ALL contents (it's a long file)
   - Paste into the SQL Editor
   - Click "RUN" button (bottom right) or press `Ctrl+Enter`

5. **Verify success**
   - You should see "Success. No rows returned"
   - Go to "Table Editor" in left sidebar
   - You should now see these NEW tables:
     - ✅ events (with 6 rows)
     - ✅ event_interests
     - ✅ teammate_matches
     - ✅ notifications
     - ✅ posts

6. **Test the app**
   - Refresh your React app
   - Go to Events page
   - Click "Interested" on any event
   - ✅ Should work now!

---

### Option B: Via Supabase CLI

```bash
cd /home/piyush/NIT-Goa-Hackathon

# Install Supabase CLI if not installed
npm install -g supabase

# Link to your project
supabase link --project-ref YOUR_PROJECT_REF

# Push migration
supabase db push

# Verify
supabase db dump --data-only --table events
```

---

## How to Find Your Project Reference

1. Go to Supabase Dashboard → Project Settings
2. Look for "Reference ID" or "Project URL"
3. Example: If URL is `https://abc123def.supabase.co`
   - Your project ref is: `abc123def`

---

## Still Not Working?

### Check Browser Console

Open browser DevTools (F12) → Console tab

**If you see:**
```
relation "public.event_interests" does not exist
```
→ You haven't applied the migration yet. Follow Option A above.

**If you see:**
```
violates foreign key constraint "event_interests_event_id_fkey"
```
→ Migration partially applied. Go to Supabase Dashboard → SQL Editor and run:
```sql
-- Check if events exist
SELECT COUNT(*) FROM events;
-- Should return 6

-- If not, insert events manually
INSERT INTO public.events (id, title, description, event_date, location, event_type, tags, poster_url, registration_url) VALUES
  ('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'HackNIT 2025', 'Annual hackathon bringing together the brightest minds to solve real-world problems', '2025-11-15', 'NIT Goa Campus', 'hackathon', ARRAY['Technical', 'Competition'], 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=600&h=800&fit=crop', 'https://example.com/register/hacknit2025'),
  ('b1eebc99-9c0b-4ef8-bb6d-6bb9bd380a22', 'AI/ML Workshop Series', 'Hands-on workshop covering latest trends in artificial intelligence and machine learning', '2025-11-20', 'Computer Lab, Block A', 'workshop', ARRAY['Technical', 'Workshop', 'Academic'], 'https://images.unsplash.com/photo-1677442136019-21780ecad995?w=600&h=800&fit=crop', 'https://example.com/register/aiml-workshop'),
  ('c2eebc99-9c0b-4ef8-bb6d-6bb9bd380a33', 'Code Sprint Championship', 'Competitive programming competition with exciting prizes and challenges', '2025-11-22', 'Auditorium Hall', 'competition', ARRAY['Technical', 'Competition'], 'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=600&h=800&fit=crop', 'https://example.com/register/code-sprint'),
  ('d3eebc99-9c0b-4ef8-bb6d-6bb9bd380a44', 'Tech Confluence 2025', 'Annual tech conference featuring industry leaders and innovative startups', '2025-11-25', 'Convention Center', 'conference', ARRAY['Technical', 'Academic'], 'https://images.unsplash.com/photo-1505373877841-8d25f7d46678?w=600&h=800&fit=crop', 'https://example.com/register/tech-confluence'),
  ('e4eebc99-9c0b-4ef8-bb6d-6bb9bd380a55', 'Web Development Bootcamp', 'Intensive 3-day bootcamp on modern web development frameworks and best practices', '2025-11-28', 'Lab 201, IT Block', 'workshop', ARRAY['Technical', 'Workshop'], 'https://images.unsplash.com/photo-1498050108023-c5249f4df085?w=600&h=800&fit=crop', 'https://example.com/register/webdev-bootcamp'),
  ('f5eebc99-9c0b-4ef8-bb6d-6bb9bd380a66', 'Innovation Challenge 2025', 'Showcase your innovative ideas and compete for funding and mentorship opportunities', '2025-12-05', 'Innovation Hub', 'competition', ARRAY['Technical', 'Competition'], 'https://images.unsplash.com/photo-1519389950473-47ba0277781c?w=600&h=800&fit=crop', 'https://example.com/register/innovation-challenge')
ON CONFLICT (id) DO NOTHING;
```

**If you see:**
```
Failed to mark interest
(no additional details)
```
→ Check Supabase Dashboard → Authentication → Users
   - Make sure you're logged in
   - Check if your user ID exists

---

## Verification Checklist

After applying migration, verify these in Supabase Dashboard:

### Table Editor
- [ ] `events` table exists with 6 rows
- [ ] `event_interests` table exists (empty is OK)
- [ ] `teammate_matches` table exists (empty is OK)
- [ ] `notifications` table exists (empty is OK)
- [ ] `posts` table exists (empty is OK)
- [ ] `profiles` table has new columns: `full_name`, `bio`, `interests`, `experience`, `avatar_url`
- [ ] `projects` table has new columns: `tags`, `github_url`, `demo_url`, `image_url`

### Test in App
1. [ ] Events page loads
2. [ ] Click "Interested" on an event
3. [ ] No error in console
4. [ ] Star icon fills with color
5. [ ] Refresh page - star stays filled
6. [ ] Go to Supabase → Table Editor → event_interests
7. [ ] See your interest record there

---

## What Changed in Code

I also fixed two bugs in the React code:

### 1. EventCard.tsx
- Changed `.single()` to `.maybeSingle()` (prevents error when no record exists)
- Removed `as any` type casts
- Added ability to toggle interest on/off

### 2. EventPosterModal.tsx
- Same fixes as EventCard
- Now properly tracks and saves interest state

These changes are already in your code. You just need to apply the database migration!

---

## Need Help?

If you're still stuck:
1. Take a screenshot of the browser console error
2. Check Supabase Dashboard → Settings → API
   - Make sure VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY match your .env file
3. Check if you can create a simple profile in Supabase Dashboard manually

The most common issue is: **Migration not applied**. Please try Option A first!
