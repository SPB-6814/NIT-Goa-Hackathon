# Fix for "event_interests violates foreign key constraint" Error

## Root Cause
The error occurred because:
1. Events were hardcoded in `EventsPage.tsx` as JavaScript constants
2. The `event_interests` table had a foreign key constraint to an `events` table
3. The `events` table didn't exist in the database
4. When clicking "Interested", the app tried to insert a record with an event_id that didn't exist

## Solution Applied

### 1. Created Database Migration
**File:** `supabase/migrations/20251109000000_create_events_and_matching_tables.sql`

This migration creates:
- ✅ `events` table - Stores all event data
- ✅ `event_interests` table - Tracks user interests in events
- ✅ `teammate_matches` table - AI-generated teammate suggestions
- ✅ `notifications` table - Real-time notifications
- ✅ `posts` table - User posts (for AI analysis)
- ✅ Updates to `profiles` and `projects` tables

### 2. Pre-populated Events
The migration automatically inserts the 6 hardcoded events into the database with their original UUIDs, so all existing code continues to work.

### 3. Updated EventsPage
**File:** `src/pages/EventsPage.tsx`

Now fetches events from the database:
- Tries to load from Supabase `events` table
- Falls back to hardcoded events if database is unavailable
- Shows loading state while fetching

## How to Apply the Fix

### Quick Fix (Supabase Dashboard):
1. Go to your Supabase Dashboard → SQL Editor
2. Copy the contents of `supabase/migrations/20251109000000_create_events_and_matching_tables.sql`
3. Paste and run the SQL
4. Refresh your app - "Interested" button should now work!

### Proper Fix (Supabase CLI):
```bash
npx supabase link --project-ref YOUR_PROJECT_REF
npx supabase db push
```

See `APPLY_MIGRATION.md` for detailed instructions.

## What Now Works

After applying the migration:

✅ **Interest Tracking**
- Click "Interested" on any event
- Star icon fills with color
- Interest saved to database
- Persists across sessions

✅ **AI Teammate Matching**
- When 2+ users interested in same event
- AI analyzes profiles, posts, projects
- Creates matches with compatibility scores
- Sends notifications to both users

✅ **Notifications**
- Real-time notifications
- Shows matched teammate suggestions
- Includes AI reasoning for the match

✅ **Minimal Data Support**
- Works even with new users (0-2 posts/projects)
- Basic compatibility matching as fallback
- Lower threshold (0.3) for matches

## Database Schema

### events
```sql
id uuid PRIMARY KEY
title text
description text
event_date date
location text
event_type text
tags text[]
poster_url text
registration_url text
```

### event_interests
```sql
id uuid PRIMARY KEY
event_id uuid → events(id)
user_id uuid → profiles(id)
UNIQUE(event_id, user_id)
```

### teammate_matches
```sql
id uuid PRIMARY KEY
event_id uuid → events(id)
user1_id uuid → profiles(id)
user2_id uuid → profiles(id)
compatibility_score decimal(3,2)
matching_skills text[]
matching_interests text[]
ai_reasoning text
status text
```

### notifications
```sql
id uuid PRIMARY KEY
user_id uuid → profiles(id)
type text
title text
message text
link text
metadata jsonb
is_read boolean
```

## Testing Checklist

- [ ] Migration applied successfully
- [ ] Events page loads without errors
- [ ] Can click "Interested" on events
- [ ] Star icon fills when interested
- [ ] Can toggle interest on/off
- [ ] Check `event_interests` table has records
- [ ] Test with 2 accounts on same event
- [ ] Verify notifications sent to both users
- [ ] Check AI matching logs in console
- [ ] Verify notifications page shows matches

## Rollback (If Needed)

If something goes wrong, you can drop the tables:

```sql
-- WARNING: This deletes all data!
DROP TABLE IF EXISTS public.notifications CASCADE;
DROP TABLE IF EXISTS public.teammate_matches CASCADE;
DROP TABLE IF EXISTS public.event_interests CASCADE;
DROP TABLE IF EXISTS public.posts CASCADE;
DROP TABLE IF EXISTS public.events CASCADE;
```

Then re-apply the migration.
