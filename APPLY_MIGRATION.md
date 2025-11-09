# How to Apply the Database Migration

The error you're seeing occurs because the required database tables (`events`, `event_interests`, `teammate_matches`, `notifications`) don't exist in your Supabase database yet.

## Option 1: Apply Migration via Supabase Dashboard (Recommended)

1. **Open your Supabase Dashboard**
   - Go to https://supabase.com/dashboard
   - Select your project

2. **Navigate to SQL Editor**
   - Click on "SQL Editor" in the left sidebar
   - Click "New Query"

3. **Copy and Execute the Migration**
   - Open the file: `supabase/migrations/20251109000000_create_events_and_matching_tables.sql`
   - Copy the entire contents
   - Paste into the SQL Editor
   - Click "Run" or press Ctrl+Enter

4. **Verify Tables Were Created**
   - Go to "Table Editor" in the left sidebar
   - You should now see:
     - `events` (with 6 pre-populated events)
     - `event_interests`
     - `teammate_matches`
     - `notifications`
     - `posts`
     - Updated `profiles` and `projects` tables

## Option 2: Apply Migration via Supabase CLI

If you have Supabase CLI installed:

```bash
# Make sure you're in the project directory
cd /home/piyush/NIT-Goa-Hackathon

# Link to your Supabase project (if not already linked)
npx supabase link --project-ref YOUR_PROJECT_REF

# Push the migration to your database
npx supabase db push
```

## What This Migration Does

### Creates New Tables:
1. **events** - Stores event information (hackathons, workshops, etc.)
2. **event_interests** - Tracks which users are interested in which events
3. **teammate_matches** - Stores AI-generated teammate matches
4. **notifications** - Real-time notifications for users
5. **posts** - User posts/updates (for AI matching analysis)

### Updates Existing Tables:
- **profiles** - Adds `full_name`, `bio`, `interests`, `experience`, `avatar_url`
- **projects** - Adds `tags`, `github_url`, `demo_url`, `image_url`

### Pre-populates Data:
- Inserts 6 hardcoded events from EventsPage.tsx into the database

### Sets Up Security:
- Row Level Security (RLS) policies for all tables
- Proper foreign key constraints
- Real-time subscriptions for notifications

## After Migration

Once the migration is applied:
1. ✅ The "Interested" button will work without errors
2. ✅ AI teammate matching will function
3. ✅ Notifications will be sent when matches are found
4. ✅ All data will persist in the database

## Troubleshooting

### If you get "table already exists" errors:
This is fine - it means those tables were already created. The migration uses `IF NOT EXISTS` and `ON CONFLICT DO NOTHING` to be safe.

### If you get permission errors:
Make sure you're running the SQL as the database owner or have sufficient privileges.

### If events don't show up:
The `INSERT` statement uses `ON CONFLICT (id) DO NOTHING` with specific UUIDs. If those IDs already exist with different data, they won't be updated. You can manually verify the events table has 6 rows.

## Testing After Migration

1. **Test Interest Tracking:**
   - Go to Events page
   - Click "Interested" on any event
   - Should see filled star icon
   - No errors in console

2. **Test AI Matching:**
   - Use 2 different accounts
   - Both mark interest in the same event
   - Check Notifications page
   - Should see teammate match notification

3. **Check Database:**
   ```sql
   -- Verify events exist
   SELECT COUNT(*) FROM events;
   -- Should return 6
   
   -- Check your interests
   SELECT * FROM event_interests WHERE user_id = 'YOUR_USER_ID';
   
   -- Check matches
   SELECT * FROM teammate_matches;
   ```
