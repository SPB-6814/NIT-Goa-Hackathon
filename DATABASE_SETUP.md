# Database Setup Guide

## Applying the Database Migration

Your social features (posts, likes, comments) and events system require database tables. Follow these steps to set up your database:

### Step 1: Access Supabase Dashboard
1. Go to [https://supabase.com/dashboard](https://supabase.com/dashboard)
2. Sign in to your account
3. Select your project (the one you're using for this app)

### Step 2: Run the SQL Migration
1. In the left sidebar, click on **SQL Editor**
2. Click **New Query** button
3. Copy the entire contents of `supabase/migrations/20251108100000_create_posts_system.sql`
4. Paste it into the SQL editor
5. Click **Run** button (or press Ctrl+Enter / Cmd+Enter)

### Step 3: Verify Tables Created
1. In the left sidebar, click on **Table Editor**
2. You should now see these new tables:
   - `posts` - User posts with images and content
   - `post_likes` - Likes on posts
   - `post_comments` - Comments on posts
   - `events` - Event listings with dates, locations, brochures

### Step 4: Regenerate TypeScript Types (Optional)
To remove TypeScript warnings, regenerate your Supabase types:

```bash
npx supabase gen types typescript --project-id YOUR_PROJECT_ID > src/integrations/supabase/types.ts
```

Replace `YOUR_PROJECT_ID` with your actual Supabase project ID (found in project settings).

## Database Schema Overview

### Posts Table
- User-generated content with images
- Multiple images supported (stored as text array)
- Timestamps for created_at
- RLS policies: Users can CRUD their own posts, read all posts

### Post Likes Table
- Tracks which users liked which posts
- Unique constraint: one like per user per post
- RLS policies: Users can like/unlike, read all likes

### Post Comments Table
- Comments on posts
- Nested comment support via parent_id
- RLS policies: Users can comment, edit/delete own comments, read all

### Events Table
- Event listings with comprehensive details
- Fields:
  - `title` - Event name
  - `description` - Event details
  - `event_date` - When the event happens
  - `location` - Where it takes place
  - `event_type` - hackathon/workshop/competition/conference
  - `brochure_url` - Link to event brochure image
  - `registration_url` - Registration form link
- RLS policies: Public read access, authenticated users can create

## Storage Buckets

The migration also creates two storage buckets:

1. **`post-images`** - For user post images
   - Public bucket (images are viewable by anyone)
   - Upload limit: 5MB per file

2. **`event-brochures`** - For event brochure PDFs/images
   - Public bucket
   - Upload limit: 10MB per file

## Realtime Subscriptions

Realtime is enabled for:
- `posts` table - See new posts instantly
- `post_likes` table - Live like counts
- `post_comments` table - Live comment updates

## Testing Your Setup

After running the migration, test the features:

1. **Create a Post**: Click "Create Post" in sidebar
2. **Like/Comment**: Interact with posts on homepage
3. **View Events**: Go to Events tab, toggle between card/calendar views
4. **Add Event**: Use Supabase Table Editor to add sample events

## Sample Event Data

To test the events system, add this sample event via SQL Editor:

```sql
INSERT INTO events (title, description, event_date, location, event_type, registration_url)
VALUES (
  'HackNIT 2024',
  'Annual hackathon bringing together the best student developers',
  '2024-12-15',
  'NIT Goa Campus',
  'hackathon',
  'https://example.com/register'
);
```

## Troubleshooting

**Problem**: TypeScript errors for new tables
- **Solution**: This is normal until types are regenerated. Use `as any` type assertion or regenerate types as shown above.

**Problem**: RLS policy errors when inserting
- **Solution**: Make sure you're authenticated (logged in). RLS policies require authentication for write operations.

**Problem**: Images not uploading
- **Solution**: Check that storage buckets exist and have public access enabled.

## Next Steps

Once the migration is applied:
1. ✅ Posts system will work (create, like, comment)
2. ✅ Events will display in card and calendar views
3. ✅ All realtime features will be active
4. ✅ You can start adding events and creating posts!

Enjoy your gamified student collaboration platform! 🚀✨
