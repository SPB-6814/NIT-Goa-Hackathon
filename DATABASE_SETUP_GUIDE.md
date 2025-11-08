# 🗄️ Database Connection Guide

## ✅ Current Status

Your Supabase credentials are **already configured**!

- **Project ID:** `mohdrsvjwspgiurbiquu`
- **URL:** `https://mohdrsvjwspgiurbiquu.supabase.co`
- **Anon Key:** ✅ Configured in `.env`
- **Client:** ✅ Configured in `src/integrations/supabase/client.ts`

---

## 🎯 Next Steps: Apply Database Migrations

You have **3 migrations** that need to be applied to your Supabase database:

### Migration 1: Base Schema (Already Applied?)
**File:** `supabase/migrations/20251108065317_1ca1eb0c-5e22-47ca-97d7-60e8442afa0e.sql`

**Contains:**
- `profiles` table
- `projects` table
- `join_requests` table
- `project_members` table
- `comments` table
- `messages` table (for project chat)
- All RLS policies

### Migration 2: Chat System (NEW - Needs to be applied)
**File:** `supabase/migrations/20251108120000_create_messaging_system.sql`

**Contains:**
- `conversations` table (DM and group chats)
- `conversation_participants` table
- `messages` table (for DMs, separate from project messages)
- `message_reads` table
- `team_recommendations` table
- RPC functions:
  - `get_or_create_direct_conversation(user1_id, user2_id)`
  - `get_unread_count(user_uuid)`
- Storage bucket: `chat-files`

### Migration 3: File Sharing (NEW - Needs to be applied)
**File:** `supabase/migrations/20251108130000_add_file_sharing_to_messages.sql`

**Contains:**
- Adds `file_url` and `file_name` columns to project `messages` table
- Creates `chat-files` storage bucket (if not exists)
- Storage policies for file uploads

---

## 📋 Step-by-Step: Apply Migrations

### Step 1: Open Supabase Dashboard

1. Go to: https://supabase.com/dashboard
2. Log in with your account
3. Select your project: `mohdrsvjwspgiurbiquu`

### Step 2: Open SQL Editor

1. In the left sidebar, click **"SQL Editor"**
2. Click **"New query"** button

### Step 3: Apply Migration 2 (Chat System)

**Copy this entire file:**
```bash
/home/piyush/NIT-Goa-Hackathon/supabase/migrations/20251108120000_create_messaging_system.sql
```

**Steps:**
1. Open the file in VS Code
2. Press `Ctrl+A` to select all
3. Press `Ctrl+C` to copy
4. Go back to Supabase SQL Editor
5. Paste the entire SQL code
6. Click **"Run"** button (bottom right)
7. Wait for "Success. No rows returned" message

**Expected output:** ✅ Success (green checkmark)

### Step 4: Apply Migration 3 (File Sharing)

**Copy this entire file:**
```bash
/home/piyush/NIT-Goa-Hackathon/supabase/migrations/20251108130000_add_file_sharing_to_messages.sql
```

**Steps:**
1. Click **"New query"** again
2. Open the file in VS Code
3. Select all and copy
4. Paste into Supabase SQL Editor
5. Click **"Run"**
6. Wait for success message

**Expected output:** ✅ Success

---

## 🔍 Verify Database Setup

### Check Tables Created

1. In Supabase Dashboard, go to **"Table Editor"** (left sidebar)
2. You should see these tables:

**Original tables:**
- ✅ `profiles`
- ✅ `projects`
- ✅ `join_requests`
- ✅ `project_members`
- ✅ `comments`
- ✅ `messages` (for project chat)

**New chat tables:**
- ✅ `conversations`
- ✅ `conversation_participants`
- ✅ `messages` (for DMs - note: might be named differently to avoid conflict)
- ✅ `message_reads`
- ✅ `team_recommendations`

### Check RPC Functions

1. Go to **"Database"** → **"Functions"** (in left sidebar)
2. You should see:
   - ✅ `get_or_create_direct_conversation`
   - ✅ `get_unread_count`

### Check Storage Buckets

1. Go to **"Storage"** (left sidebar)
2. You should see:
   - ✅ `chat-files` bucket (public)

---

## 🧪 Test Database Connection

### Option 1: Test in Terminal

Run this command to test the connection:

```bash
npm run dev
```

Then open: http://localhost:5173

### Option 2: Quick Test Query

In Supabase SQL Editor, run:

```sql
-- Test query
SELECT * FROM profiles LIMIT 1;
```

**Expected:** Should return profiles (or empty if no users yet)

---

## 🚨 Troubleshooting

### Error: "relation does not exist"
**Solution:** Migration not applied. Go back to Step 3 and apply the migration.

### Error: "function does not exist"
**Solution:** RPC functions not created. Check Migration 2 was applied successfully.

### Error: "bucket does not exist"
**Solution:** Storage bucket not created. Check Migration 2 and 3 were applied.

### Error: "permission denied"
**Solution:** RLS policies might be blocking. Check you're logged in as the correct user.

---

## 📊 Database Schema Overview

### Chat System Schema

```
conversations
├── id (uuid, primary key)
├── type (text: 'direct', 'group', 'project')
├── name (text, for groups)
├── project_id (uuid, for project chats)
├── created_at
└── updated_at

conversation_participants
├── id (uuid, primary key)
├── conversation_id (uuid, foreign key)
├── user_id (uuid, foreign key)
├── joined_at
└── is_admin (boolean)

messages (DMs)
├── id (uuid, primary key)
├── conversation_id (uuid, foreign key)
├── sender_id (uuid, foreign key)
├── content (text)
├── file_url (text)
├── file_name (text)
├── file_type (text)
├── created_at
└── is_deleted (boolean)

message_reads
├── id (uuid, primary key)
├── message_id (uuid, foreign key)
├── user_id (uuid, foreign key)
└── read_at (timestamp)
```

### Project Chat Schema

```
messages (Project Chat)
├── id (uuid, primary key)
├── content (text)
├── project_id (uuid, foreign key)
├── user_id (uuid, foreign key)
├── file_url (text) ← Added by Migration 3
├── file_name (text) ← Added by Migration 3
└── created_at (timestamp)
```

---

## 🔐 Environment Variables Reference

Your `.env` file should have:

```bash
VITE_SUPABASE_PROJECT_ID="qxwbqzkyjphrinpicjiv"
VITE_SUPABASE_URL="https://qxwbqzkyjphrinpicjiv.supabase.co"
VITE_SUPABASE_PUBLISHABLE_KEY="eyJhbGci..."
```

**Status:** ✅ Already configured correctly!

---

## ✅ Final Checklist

Before testing the app:

- [ ] Migration 1 applied (base schema)
- [ ] Migration 2 applied (chat system)
- [ ] Migration 3 applied (file sharing)
- [ ] All tables visible in Table Editor
- [ ] RPC functions visible in Database → Functions
- [ ] chat-files bucket visible in Storage
- [ ] .env file has correct credentials
- [ ] npm run dev starts successfully

---

## 🎉 After Migrations Are Applied

### What Will Work:

1. **Profile Messaging:**
   - Click "Message" on any user profile
   - Opens chat dialog
   - Send/receive messages in real-time

2. **Floating Chat Button:**
   - Bottom-right corner
   - Shows unread count
   - Access all conversations

3. **Team Chat:**
   - Go to any project you're a member of
   - Click "Team Chat" tab
   - Upload files with paperclip button
   - Download shared files

4. **Events Calendar:**
   - Clean, compact layout
   - Hover tooltips with event details
   - No overflow issues

---

## 📞 Need Help?

### Check Logs:
- Browser Console: `F12` → Console tab
- Network Tab: `F12` → Network tab
- Supabase Logs: Dashboard → Database → Logs

### Common Issues:

**"Failed to start conversation"**
→ Migration 2 not applied, run it now

**"Failed to upload file"**
→ Migration 3 not applied, run it now

**"Table does not exist"**
→ Check Table Editor, verify tables created

---

## 🚀 Ready to Test!

Once migrations are applied:

```bash
npm run dev
```

Then test:
1. Create an account
2. Go to someone's profile
3. Click "Message" button
4. Send a message
5. Go to Events → Calendar view
6. Hover over events
7. Go to a project → Team Chat
8. Upload a file

**Everything should work perfectly!** 🎉

---

## 📝 Quick Command Reference

```bash
# Start dev server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview

# Check TypeScript errors
npm run build -- --mode development
```

---

**Next Step:** Apply Migration 2 and 3 in Supabase Dashboard, then test the app!
