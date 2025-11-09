# Duplicate Join Request Fix ✅

## Problem 1: Duplicate Key Error
Users were getting this error when trying to send a join request:
```
duplicate key value violates unique constraint 
"project_join_requests_project_id_user_id_key"
```

## Problem 2: Requests Not Showing in Dashboard
After re-sending a rejected request, the owner couldn't see it in their dashboard.

## Root Causes

### Issue 1: No Duplicate Check
The `join_requests` table has a **unique constraint** on `(project_id, user_id)` to prevent duplicate requests. However, the code was not checking if a request already existed before trying to insert a new one.

### Issue 2: Table Name Inconsistency
Different parts of the codebase were using different table names:
- **ProjectShowcase.tsx**: Used `project_join_requests` ✅
- **ProjectDetailPage.tsx**: Used `join_requests` ❌
- **DashboardPage.tsx**: Mixed both - fetched from `project_join_requests` but updated `join_requests` ❌

The actual database table is `project_join_requests`, so all code needed to be updated to use this consistently.

## Solution

### Part 1: Added Duplicate Checking
Updated both places where join requests are created to:

1. **Check if request already exists** before inserting
2. **Handle different request statuses** appropriately:
   - `pending` → Show "already sent" message
   - `rejected` → Allow re-sending by updating the existing request
   - `approved` → Show "already approved" message
3. **Handle race conditions** by catching duplicate key errors (code `23505`)

### Part 2: Standardized Table Names
Changed all references from `join_requests` to `project_join_requests`:

## Files Modified

### 1. `/src/pages/ProjectDetailPage.tsx`
**Changes:**
- Changed `join_requests` → `project_join_requests` (3 locations)
- Updated `handleJoinRequest()` function with duplicate checking
- Updated `fetchProjectDetails()` to use correct table
- Added status-based logic
- Added duplicate key error handling

### 2. `/src/components/ProjectShowcase.tsx`
**Changes:**
- Already using `project_join_requests` ✅
- Updated `handleRequestToJoin()` function with duplicate checking
- Added status-based logic
- Added duplicate key error handling

### 3. `/src/pages/DashboardPage.tsx`
**Changes:**
- Changed `join_requests` → `project_join_requests` (3 locations)
- Updated `handleAcceptRequest()` to use correct table
- Updated `handleRejectRequest()` to use correct table
- Removed RPC call dependency for rejection

## Behavior After Fix

### Scenario 1: First Time Request
```
User clicks "Request to Join"
  ↓
Check existing request → None found
  ↓
Insert new request with status='pending'
  ↓
Show success: "Join request sent!"
```

### Scenario 2: Already Pending
```
User clicks "Request to Join"
  ↓
Check existing request → Found (status='pending')
  ↓
Show info: "You have already sent a join request"
  ↓
No database operation
```

### Scenario 3: Previously Rejected
```
User clicks "Request to Join"
  ↓
Check existing request → Found (status='rejected')
  ↓
Update existing request:
  - status = 'pending'
  - created_at = NOW()
  - message = new message
  ↓
Show success: "Join request re-sent!"
```

### Scenario 4: Already Approved
```
User clicks "Request to Join"
  ↓
Check existing request → Found (status='approved')
  ↓
Show info: "Your request has already been approved"
  ↓
No database operation
```

### Scenario 5: Race Condition
```
Two tabs send request simultaneously
  ↓
First request inserts successfully
  ↓
Second request gets duplicate key error (23505)
  ↓
Catch error and show: "You have already sent a join request"
  ↓
Graceful handling, no user-facing error
```

## Testing

### Test Case 1: Send First Request
1. Find a project you're not part of
2. Click "Request to Join"
3. ✅ Should show success message
4. ✅ Request should appear in database with status='pending'

### Test Case 2: Try Duplicate Request
1. Send a join request
2. Try to send another request for the same project
3. ✅ Should show "already sent" message
4. ✅ No new database record created

### Test Case 3: Re-send After Rejection
1. Project owner rejects your request (status='rejected')
2. Click "Request to Join" again
3. ✅ Should show "re-sent" message
4. ✅ Existing request updated to status='pending'

### Test Case 4: Multiple Tabs (Race Condition)
1. Open project in two browser tabs
2. Click "Request to Join" in both tabs quickly
3. ✅ First request succeeds
4. ✅ Second request shows friendly message
5. ✅ Only one request in database

## Database Schema

The unique constraint that was causing the error:

```sql
CREATE TABLE join_requests (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  project_id UUID REFERENCES projects(id),
  user_id UUID REFERENCES profiles(id),
  message TEXT,
  status TEXT DEFAULT 'pending',
  created_at TIMESTAMP DEFAULT NOW(),
  
  -- This constraint prevents duplicate requests
  CONSTRAINT project_join_requests_project_id_user_id_key 
    UNIQUE (project_id, user_id)
);
```

This constraint is **important** and should stay! It prevents:
- Multiple pending requests cluttering the owner's dashboard
- Database bloat from duplicate records
- Confusion about which request is "current"

Our fix **works with** this constraint instead of removing it.

## Code Comparison

### Before (Caused Error):
```typescript
const handleJoinRequest = async () => {
  const { error } = await supabase
    .from('join_requests')
    .insert({
      project_id: id,
      user_id: user.id,
    });

  if (error) throw error;
  toast.success('Join request sent!');
};
```

### After (Fixed):
```typescript
const handleJoinRequest = async () => {
  // Check if request exists
  const { data: existing } = await supabase
    .from('join_requests')
    .select('*')
    .eq('project_id', id)
    .eq('user_id', user.id)
    .single();

  if (existing) {
    // Handle based on status
    if (existing.status === 'pending') {
      toast.info('Already sent');
      return;
    }
    if (existing.status === 'rejected') {
      // Update to re-send
      await supabase
        .from('join_requests')
        .update({ status: 'pending' })
        .eq('id', existing.id);
      toast.success('Re-sent!');
      return;
    }
  }

  // Insert new request
  const { error } = await supabase
    .from('join_requests')
    .insert({ project_id: id, user_id: user.id });

  // Handle race condition
  if (error?.code === '23505') {
    toast.info('Already sent');
    return;
  }
  
  if (error) throw error;
  toast.success('Join request sent!');
};
```

## Benefits

1. ✅ **No more duplicate key errors** - Checked before insert
2. ✅ **Better user experience** - Clear messages for each scenario
3. ✅ **Re-send capability** - Users can retry after rejection
4. ✅ **Race condition handling** - Works even with multiple tabs
5. ✅ **Database integrity** - Unique constraint remains enforced
6. ✅ **No orphaned data** - Reuses existing records when appropriate

## Future Enhancements (Optional)

Could add these features later:

1. **Withdraw Request** - Let users cancel pending requests
2. **Edit Request** - Update message before owner reviews
3. **Request History** - Show all past requests with timestamps
4. **Request Expiry** - Auto-reject requests after X days
5. **Bulk Actions** - Owner can approve/reject multiple requests

But the current fix solves the immediate error! 🎉

## Verification

The fix has been applied to:
- ✅ ProjectDetailPage.tsx
- ✅ ProjectShowcase.tsx
- ✅ TypeScript compiles without errors
- ✅ Code is ready to test

**Next Step:** Test by sending join requests in the app!
