# Project Collaboration Feature - Implementation Guide

## ✅ What's Been Implemented

### 1. Database Migration
**File:** `supabase/migrations/20251109000000_add_advanced_features.sql`

The migration has been **updated** to fix the column name issue (`owner_id` instead of `created_by`).

**What it creates:**
- `project_join_requests` table - Tracks join requests with status (pending/approved/rejected)
- `notifications` table - Sends notifications when requests are approved
- `approve_join_request()` function - Approves request, adds member, sends notification
- `reject_join_request()` function - Rejects a request
- Proper RLS policies for security
- Realtime subscriptions for live updates

### 2. Frontend Components

#### ProjectShowcase Component (`src/components/ProjectShowcase.tsx`)
A new component that displays projects looking for collaborators:
- Shows up to 6 projects from other users
- Displays project title, description, skills needed
- Shows member count
- "Request to Join" button with dialog
- Optional message when sending request
- Prevents duplicate requests (shows "Request Sent" if already requested)

#### Updated HomePage (`src/pages/HomePage.tsx`)
- **New Layout:** 2-column grid (posts on left, projects on right)
- Posts feed remains in main column
- Projects showcase in sticky sidebar
- Responsive design (stacks on mobile)

#### Updated DashboardPage (`src/pages/DashboardPage.tsx`)
- Enhanced "Join Requests" tab
- Shows pending requests for your projects
- Displays requester info, message, and skills
- **Accept** button - Calls `approve_join_request()` function
- **Reject** button - Calls `reject_join_request()` function
- Beautiful card-based UI with avatars and badges

## 📋 How to Use

### Step 1: Apply the Migration
1. Open Supabase Dashboard
2. Go to SQL Editor
3. Open the file: `supabase/migrations/20251109000000_add_advanced_features.sql`
4. Run the migration
5. Verify tables were created in Database → Tables

### Step 2: Test the Feature

#### As a User Looking to Join a Project:
1. Go to **Home** page
2. Look at the right sidebar "Projects"
3. Click "Request to Join" on any project
4. (Optional) Add a message explaining why you want to join
5. Click "Send Request"
6. Button changes to "Request Sent"

#### As a Project Owner:
1. Go to **Dashboard** (My Projects)
2. Click on "Join Requests" tab
3. You'll see all pending requests for your projects
4. Each request shows:
   - Requester's name and college
   - Which project they want to join
   - Their message (if provided)
   - Their skills
5. Click **Accept** to:
   - Approve the request
   - Add them to project members
   - Send them a notification
6. Click **Reject** to decline the request

#### As an Accepted Member:
Once approved:
- You'll receive a notification
- You'll be added to `project_members` table
- You can start chatting with other project members
- You'll see the project in relevant sections

## 🔄 The Complete Workflow

```
1. User A creates a project
   ↓
2. User B sees project in Home page sidebar
   ↓
3. User B clicks "Request to Join" and sends message
   ↓
4. Request appears in User A's Dashboard → Join Requests tab
   ↓
5. User A reviews request and clicks "Accept"
   ↓
6. System automatically:
   - Updates request status to 'approved'
   - Adds User B to project_members table
   - Sends notification to User B
   ↓
7. User B receives notification "Join Request Approved!"
   ↓
8. User B can now collaborate on the project
```

## 🔧 Technical Details

### Database Functions

#### approve_join_request(request_id uuid)
```sql
-- This function:
1. Finds the join request
2. Updates status to 'approved'
3. Adds user to project_members table
4. Creates a notification for the requester
5. Sets reviewed_by and reviewed_at fields
```

#### reject_join_request(request_id uuid)
```sql
-- This function:
1. Updates request status to 'rejected'
2. Sets reviewed_by and reviewed_at fields
```

### Security (RLS Policies)

**project_join_requests table:**
- Anyone can see their own requests
- Project owners can see requests for their projects
- Users can only create requests for themselves
- Only project owners can approve/reject requests

**notifications table:**
- Users can only see their own notifications
- Users can mark their notifications as read
- System can create notifications for any user

### API Calls

**Fetch projects (excluding your own):**
```typescript
const { data } = await supabase
  .from('projects')
  .select('*, profiles(*)')
  .neq('owner_id', user.id)
```

**Create join request:**
```typescript
const { error } = await supabase
  .from('project_join_requests')
  .insert({
    project_id: projectId,
    user_id: userId,
    message: 'Optional message',
    status: 'pending'
  })
```

**Approve request:**
```typescript
const { error } = await supabase.rpc('approve_join_request', {
  request_id: requestId
})
```

**Reject request:**
```typescript
const { error } = await supabase.rpc('reject_join_request', {
  request_id: requestId
})
```

## 🎨 UI Components Used

- `Card` - For project cards and request cards
- `Dialog` - For join request modal
- `Button` - Primary actions
- `Badge` - Skills and status indicators
- `Avatar` - User profile pictures
- `Textarea` - Message input
- `Tabs` - Dashboard navigation
- `Separator` - Visual dividers

## 🚀 Next Steps

After testing this feature, you can implement:

1. **Post Tags & Filters** - Filter posts by category
2. **Event Interest Tracking** - Mark interest in events
3. **AI Teammate Matching** - Gemini AI-powered matching
4. **Notifications UI** - Display notifications in app
5. **Real-time Updates** - Live request notifications

## ⚠️ Known Issues

**TypeScript Errors:**
The Supabase TypeScript errors in DashboardPage.tsx will be resolved after:
1. Applying the migration
2. Regenerating Supabase types

To regenerate types:
```bash
npx supabase gen types typescript --project-id YOUR_PROJECT_ID > src/integrations/supabase/types.ts
```

## 📝 Files Modified

1. ✅ `supabase/migrations/20251109000000_add_advanced_features.sql` - Database schema
2. ✅ `src/components/ProjectShowcase.tsx` - NEW component
3. ✅ `src/pages/HomePage.tsx` - Added project showcase sidebar
4. ✅ `src/pages/DashboardPage.tsx` - Updated join requests UI

---

**Status:** ✅ Ready to test after applying migration!
