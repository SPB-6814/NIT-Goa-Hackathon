# Advanced Features Implementation Guide

## Overview
This guide covers the implementation of 6 major features for the Campus Connect platform.

## Quick Setup

### 1. Apply Database Migration

**Run this in Supabase SQL Editor:**

1. Go to: https://supabase.com/dashboard/project/qxwbqzkyjphrinpicjiv/sql
2. Copy the file: `supabase/migrations/20251109000000_add_advanced_features.sql`
3. Paste and click **RUN**

This migration creates:
- ✅ Tags for posts (Technical, Cultural, etc.)
- ✅ Tags for events
- ✅ Event interests tracking
- ✅ Project join requests system
- ✅ Notifications system
- ✅ AI teammate matching tables

---

## Features Implemented

### ✅ Feature 1: User Posts in Profile
**Status**: COMPLETE

- Posts now display in a grid on the user's profile page (Instagram-style)
- Shows post count badge
- Hover shows likes count
- Click to view full post
- Empty state for users with no posts

**Files Changed:**
- `src/pages/ProfilePage.tsx` - Added posts grid section

---

### ✅ Feature 2: Clickable Post Creators
**Status**: COMPLETE

- Click on profile picture or username in posts to visit their profile
- Hover effects added for better UX
- Uses React Router navigation

**Files Changed:**
- `src/components/PostCard.tsx` - Added onClick handlers

---

### 🔧 Feature 3: Post Filters & Tags
**Status**: MIGRATION READY, UI PENDING

**What's Done:**
- Database migration adds `tags` column to posts table
- Tags are indexed for fast filtering

**Next Steps:**
1. Update `CreatePostDialog.tsx` to include tag selection
2. Add filter buttons to `HomePage.tsx`
3. Filter posts based on selected tags

**Tag Options:**
- All Posts (default)
- Technical
- Cultural
- Academic
- Social
- Sports

---

### 🔧 Feature 4: Project Showcase on HomePage
**Status**: MIGRATION READY, UI PENDING

**What's Done:**
- `project_join_requests` table created
- RLS policies configured
- Helper functions: `approve_join_request`, `reject_join_request`

**Next Steps:**
1. Create `ProjectShowcase.tsx` component
2. Add to HomePage below Campus Feed
3. Show projects with `looking_for_members: true`
4. "Request to Join" button
5. Show pending requests in Active Projects tab

**Implementation:**
```tsx
// ProjectShowcase.tsx
- Query projects WHERE looking_for_members = true
- Show project cards with skills needed
- "Request to Join" button → creates project_join_request
- Toast notification on success
```

---

### 🔧 Feature 5: Event Filters & Tags
**Status**: MIGRATION READY, UI PENDING

**What's Done:**
- Database migration adds `tags` column to events table
- `event_interests` table created for tracking interested users
- Tags indexed for performance

**Next Steps:**
1. Add filter buttons to `EventsPage.tsx`
2. Update event creation to include tag selection
3. Filter events by selected tag

**Tag Options:**
- All Events (default)
- Technical Events
- Cultural Events
- Sports Events
- Workshops
- Hackathons

---

### 🔧 Feature 6: AI Teammate Matching
**Status**: MIGRATION READY, NEEDS GEMINI API INTEGRATION

**What's Done:**
- `event_interests` table tracks who's interested in which events
- `teammate_matches` table stores AI-generated matches
- `notifications` table for alerting users about matches

**How It Works:**
1. User clicks "Interested" on an event → saved to `event_interests`
2. When 2+ users mark interest → trigger AI matching
3. Gemini API compares:
   - Skills (`profiles.skills`)
   - Interests/Tags
   - Experience level
4. If match score > 0.7 → create `teammate_match` record
5. Send notification to both users

**Implementation Needed:**
```typescript
// src/lib/geminiMatching.ts
export async function matchTeammates(eventId: string) {
  // 1. Get all users interested in event
  const { data: interests } = await supabase
    .from('event_interests')
    .select('user_id, profiles(*)')
    .eq('event_id', eventId);
  
  // 2. For each pair, call Gemini API
  const prompt = `
    Compare these two students for team compatibility:
    Student 1: ${JSON.stringify(user1)}
    Student 2: ${JSON.stringify(user2)}
    
    Return JSON: {
      score: 0-1,
      matching_skills: [],
      matching_interests: [],
      reasoning: "why they'd make good teammates"
    }
  `;
  
  // 3. Save matches with score > 0.7
  // 4. Create notifications
}
```

---

## Implementation Priority

### Phase 1 (Quick Wins - 30 mins)
1. ✅ User posts in profile - DONE
2. ✅ Clickable post creators - DONE
3. 🔧 Apply database migration
4. 🔧 Add tag selection to CreatePostDialog
5. 🔧 Add post filters to HomePage

### Phase 2 (Medium - 1 hour)
6. 🔧 Update EventCard to track interests
7. 🔧 Add event filters to EventsPage
8. 🔧 Create ProjectShowcase component
9. 🔧 Add project showcase to HomePage

### Phase 3 (Complex - 2 hours)
10. 🔧 Create join requests UI in Active Projects
11. 🔧 Implement approve/reject functionality
12. 🔧 Set up Gemini API integration
13. 🔧 Implement AI matching algorithm
14. 🔧 Create notifications UI

---

## Next Steps

### Immediate (Do Now):
1. **Apply the migration** in Supabase SQL Editor
2. **Test user posts** - Go to your profile, posts should show in grid
3. **Test clickable creators** - Click username/avatar in a post

### Short Term (Today):
4. Add tag selection to post creation
5. Add filter buttons to HomePage
6. Test post filtering

### Medium Term (This Week):
7. Implement project showcase
8. Implement join requests system
9. Add event interest tracking

### Long Term (Next Week):
10. Set up Gemini API key
11. Implement AI matching
12. Create notifications UI

---

## Testing Checklist

After applying migration:

### Posts & Profiles
- [ ] Go to your profile → See "Posts" section
- [ ] Create a new post → Should appear in profile grid
- [ ] Click post creator name → Navigate to their profile
- [ ] Click post creator avatar → Navigate to their profile

### Tags (After UI implementation)
- [ ] Create post with tags → Tags saved
- [ ] Filter by "Technical" → Only technical posts show
- [ ] Filter by "All" → All posts show

### Projects (After UI implementation)
- [ ] See project showcase on HomePage
- [ ] Click "Request to Join" → Request created
- [ ] Project owner sees request in Active Projects
- [ ] Approve request → User added to project

### Events (After UI implementation)
- [ ] Filter events by tag
- [ ] Click "Interested" on event
- [ ] See other interested users
- [ ] Receive teammate match notification

---

## API Keys Needed

### Gemini API (for AI matching)
1. Get API key: https://makersuite.google.com/app/apikey
2. Add to `.env`:
   ```
   VITE_GEMINI_API_KEY=your_api_key_here
   ```

---

## Database Schema Summary

### New Tables:
1. **event_interests** - Tracks user interest in events
2. **project_join_requests** - Join requests for projects
3. **notifications** - User notifications
4. **teammate_matches** - AI-generated teammate matches

### New Columns:
1. **posts.tags** - Array of tags for filtering
2. **events.tags** - Array of tags for filtering

### New Functions:
1. **approve_join_request(uuid)** - Approves request and adds member
2. **reject_join_request(uuid)** - Rejects a request

---

## Support

If you encounter issues:
1. Check browser console for errors
2. Verify migration applied successfully in Supabase
3. Check RLS policies are enabled
4. Ensure user is authenticated

---

## Summary

**Completed:**
- ✅ User posts in profile (Instagram-style)
- ✅ Clickable post creators
- ✅ Database schema for all features

**Ready to Implement:**
- 🔧 Post tags & filters (30 min)
- 🔧 Event tags & filters (30 min)  
- 🔧 Project showcase (1 hour)
- 🔧 Join requests system (1 hour)
- 🔧 AI teammate matching (2 hours)

**Total Implementation Time:** ~5-6 hours

The foundation is complete - now we can build the UI! 🚀
