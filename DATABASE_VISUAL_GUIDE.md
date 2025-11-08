# 🎯 Visual Guide: Apply Database Migrations

## 📍 Where You Are Now

```
Your App  →  Supabase Client  →  ❌ Database (Migrations Not Applied)
   ↓              ↓                        ↓
 Ready!      Connected!              Missing Tables!
```

**Goal:** Apply migrations so database has all required tables and functions.

---

## 🗺️ Step-by-Step Visual Guide

### Step 1: Access Supabase Dashboard

**What to do:**
1. Open browser
2. Go to: https://supabase.com/dashboard
3. Log in with your credentials

**What you'll see:**
```
┌─────────────────────────────────────────┐
│  Supabase Dashboard                     │
├─────────────────────────────────────────┤
│                                         │
│  Your Projects:                         │
│                                         │
│  ┌─────────────────────────────────┐   │
│  │ qxwbqzkyjphrinpicjiv            │   │
│  │ Your Project Name               │   │
│  │ [Open Project]                  │   │ ← Click this!
│  └─────────────────────────────────┘   │
│                                         │
└─────────────────────────────────────────┘
```

---

### Step 2: Navigate to SQL Editor

**What you'll see after opening project:**

```
┌──────────────┬────────────────────────────────┐
│              │                                │
│ Left Sidebar │     Main Content Area          │
│              │                                │
│ 🏠 Home      │  Project Dashboard             │
│ 📊 Table     │                                │
│ 🔧 Database  │                                │
│ 💾 Storage   │                                │
│ 📝 SQL Editor│ ← Click this!                 │
│ 🔐 Auth      │                                │
│ ⚙️  Settings │                                │
│              │                                │
└──────────────┴────────────────────────────────┘
```

**Click: SQL Editor**

---

### Step 3: Create New Query

**What you'll see:**

```
┌─────────────────────────────────────────────────┐
│  SQL Editor                                     │
├─────────────────────────────────────────────────┤
│                                                 │
│  [+ New query]  [Templates ▾]  [History]       │
│                                                 │
│  ┌───────────────────────────────────────────┐ │
│  │                                           │ │
│  │  -- Write your SQL here                  │ │
│  │                                           │ │
│  │                                           │ │
│  │                                           │ │
│  └───────────────────────────────────────────┘ │
│                                                 │
│                        [Run] ← Will appear here│
└─────────────────────────────────────────────────┘
```

**Click: + New query**

---

### Step 4: Open Migration File

**In VS Code (or your editor):**

```
File Explorer:
├── supabase/
│   ├── migrations/
│   │   ├── 20251108065317_*.sql ← Base schema (maybe already applied)
│   │   ├── 20251108120000_create_messaging_system.sql ← THIS ONE!
│   │   └── 20251108130000_add_file_sharing_to_messages.sql ← THEN THIS!
```

**Steps:**
1. Open: `supabase/migrations/20251108120000_create_messaging_system.sql`
2. Press `Ctrl+A` (select all)
3. Press `Ctrl+C` (copy)

---

### Step 5: Paste and Run Migration 2

**In Supabase SQL Editor:**

```
┌─────────────────────────────────────────────────┐
│  SQL Editor                    [+ New query]    │
├─────────────────────────────────────────────────┤
│                                                 │
│  ┌───────────────────────────────────────────┐ │
│  │ -- Real-time Messaging System            │ │
│  │ CREATE TABLE IF NOT EXISTS conversations │ │
│  │   id uuid PRIMARY KEY...                 │ │
│  │   type text NOT NULL...                  │ │
│  │ ...                                       │ │
│  │ (292 lines of SQL)                        │ │ ← Paste here!
│  │ ...                                       │ │
│  │ CREATE FUNCTION get_or_create_direct...  │ │
│  └───────────────────────────────────────────┘ │
│                                                 │
│                                      [Run] ←Click│
└─────────────────────────────────────────────────┘
```

**After clicking Run, you'll see:**

✅ **Success:**
```
┌─────────────────────────────────────────────────┐
│  ✅ Success. No rows returned                   │
│  Rows: 0  Duration: 1.2s                        │
└─────────────────────────────────────────────────┘
```

OR

❌ **Error:**
```
┌─────────────────────────────────────────────────┐
│  ❌ Error: relation "conversations" already     │
│  exists                                         │
└─────────────────────────────────────────────────┘
```
**If error = "already exists":** ✅ Good! Migration already applied.

---

### Step 6: Apply Migration 3

**Repeat for file sharing:**

1. Click **[+ New query]**
2. Open: `supabase/migrations/20251108130000_add_file_sharing_to_messages.sql`
3. Copy all (`Ctrl+A` → `Ctrl+C`)
4. Paste in SQL Editor
5. Click **[Run]**

**Expected result:**
```
✅ Success. No rows returned
```

---

### Step 7: Verify Tables Created

**Navigate to Table Editor:**

```
┌──────────────┬────────────────────────────────┐
│              │                                │
│ Left Sidebar │     Table Editor               │
│              │                                │
│ 🏠 Home      │  Tables:                       │
│ 📊 Table     │  ┌──────────────────────────┐  │
│ 🔧 Database  │  │ ✅ profiles              │  │
│ 💾 Storage   │  │ ✅ projects              │  │
│ 📝 SQL Editor│  │ ✅ join_requests         │  │
│ 🔐 Auth      │  │ ✅ project_members       │  │
│ ⚙️  Settings │  │ ✅ comments              │  │
│              │  │ ✅ messages              │  │
│              │  │ ✅ conversations         │  │ ← NEW!
│              │  │ ✅ conversation_...      │  │ ← NEW!
│              │  │ ✅ message_reads         │  │ ← NEW!
│              │  │ ✅ team_recommendations  │  │ ← NEW!
│              │  └──────────────────────────┘  │
└──────────────┴────────────────────────────────┘
```

**Click: 📊 Table Editor**

**Look for:**
- ✅ `conversations` - NEW table
- ✅ `conversation_participants` - NEW table
- ✅ `message_reads` - NEW table
- ✅ `team_recommendations` - NEW table

---

### Step 8: Verify RPC Functions

**Navigate to Database → Functions:**

```
┌──────────────┬────────────────────────────────┐
│              │                                │
│ Left Sidebar │     Database Functions         │
│              │                                │
│ 🏠 Home      │  Functions:                    │
│ 📊 Table     │  ┌──────────────────────────┐  │
│ 🔧 Database  │  │ get_or_create_direct_... │  │ ← NEW!
│   Functions ←│  │ get_unread_count         │  │ ← NEW!
│   Extensions │  └──────────────────────────┘  │
│ 💾 Storage   │                                │
│ 📝 SQL Editor│                                │
└──────────────┴────────────────────────────────┘
```

**Click: Database → Functions**

**Look for:**
- ✅ `get_or_create_direct_conversation`
- ✅ `get_unread_count`

---

### Step 9: Verify Storage Bucket

**Navigate to Storage:**

```
┌──────────────┬────────────────────────────────┐
│              │                                │
│ Left Sidebar │     Storage Buckets            │
│              │                                │
│ 🏠 Home      │  Buckets:                      │
│ 📊 Table     │  ┌──────────────────────────┐  │
│ 🔧 Database  │  │ 📁 chat-files           │  │ ← NEW!
│ 💾 Storage  ←│  │    Public bucket         │  │
│ 📝 SQL Editor│  │    0 files               │  │
│ 🔐 Auth      │  └──────────────────────────┘  │
│ ⚙️  Settings │                                │
└──────────────┴────────────────────────────────┘
```

**Click: 💾 Storage**

**Look for:**
- ✅ `chat-files` bucket (public)

---

### Step 10: Check Messages Table Schema

**In Table Editor:**

1. Click on `messages` table
2. Click "Edit table schema" or view columns

**You should see these columns:**

```
messages table:
┌─────────────┬──────────┐
│ Column      │ Type     │
├─────────────┼──────────┤
│ id          │ uuid     │
│ content     │ text     │
│ project_id  │ uuid     │
│ user_id     │ uuid     │
│ file_url    │ text     │ ← NEW! (Migration 3)
│ file_name   │ text     │ ← NEW! (Migration 3)
│ created_at  │ timestamp│
└─────────────┴──────────┘
```

---

## ✅ Verification Checklist

After completing all steps, verify:

### Tables
- [ ] ✅ `conversations` exists
- [ ] ✅ `conversation_participants` exists
- [ ] ✅ `message_reads` exists
- [ ] ✅ `team_recommendations` exists
- [ ] ✅ `messages` has `file_url` column
- [ ] ✅ `messages` has `file_name` column

### Functions
- [ ] ✅ `get_or_create_direct_conversation` exists
- [ ] ✅ `get_unread_count` exists

### Storage
- [ ] ✅ `chat-files` bucket exists
- [ ] ✅ `chat-files` bucket is public

---

## 🧪 Test the Connection

**In your terminal:**

```bash
cd /home/piyush/NIT-Goa-Hackathon
npm run dev
```

**Expected output:**

```
  VITE v5.x.x  ready in xxx ms

  ➜  Local:   http://localhost:5173/
  ➜  Network: use --host to expose
  ➜  press h + enter to show help
```

**Open browser:**
- Go to: http://localhost:5173
- You should see your app!

---

## 🎯 Quick Test Scenarios

### Test 1: Create Account
1. Click "Sign Up"
2. Enter email, password, username
3. Submit

**Expected:** ✅ Account created, redirected to home

### Test 2: Profile Message Button
1. Go to another user's profile
2. Look for "Message" button
3. Click it

**Before migrations:** ❌ "Failed to start conversation"
**After migrations:** ✅ Chat dialog opens!

### Test 3: Team Chat File Upload
1. Go to a project you're in
2. Click "Team Chat" tab
3. Look for paperclip button

**Before migration 3:** ❌ No paperclip button
**After migration 3:** ✅ Paperclip button visible!

### Test 4: Calendar View
1. Go to Events page
2. Click "Calendar View"
3. Hover over event images

**Expected:** ✅ Compact images, tooltip appears with event details

---

## 🚨 Troubleshooting Visual Guide

### Error: "Function does not exist"

**What you see:**
```
❌ function get_or_create_direct_conversation does not exist
```

**Solution:**
```
Go to: SQL Editor
Run: Migration 2 (20251108120000_create_messaging_system.sql)
Verify: Database → Functions shows the function
```

### Error: "Relation does not exist"

**What you see:**
```
❌ relation "conversations" does not exist
```

**Solution:**
```
Go to: SQL Editor
Run: Migration 2 again
Verify: Table Editor shows conversations table
```

### Error: "Bucket does not exist"

**What you see in console:**
```
❌ Error uploading file: bucket 'chat-files' does not exist
```

**Solution:**
```
Go to: SQL Editor
Run: Migration 2 (creates bucket)
Verify: Storage shows chat-files bucket
```

---

## 📊 Migration Progress Tracker

```
┌─────────────────────────────────────────────┐
│  Database Migration Status                  │
├─────────────────────────────────────────────┤
│                                             │
│  Migration 1: Base Schema                   │
│  Status: ✅ Applied (or need to check)      │
│                                             │
│  Migration 2: Chat System                   │
│  Status: ⏳ Waiting for you to apply        │
│  Action: Copy & run in SQL Editor           │
│                                             │
│  Migration 3: File Sharing                  │
│  Status: ⏳ Waiting for you to apply        │
│  Action: Copy & run in SQL Editor           │
│                                             │
└─────────────────────────────────────────────┘
```

**After applying all migrations:**

```
┌─────────────────────────────────────────────┐
│  Database Migration Status                  │
├─────────────────────────────────────────────┤
│                                             │
│  Migration 1: Base Schema                   │
│  Status: ✅ Applied                         │
│                                             │
│  Migration 2: Chat System                   │
│  Status: ✅ Applied                         │
│                                             │
│  Migration 3: File Sharing                  │
│  Status: ✅ Applied                         │
│                                             │
│  🎉 All migrations complete!                │
│  Ready to test the app!                     │
│                                             │
└─────────────────────────────────────────────┘
```

---

## 🎉 Success! What's Next?

Once all migrations are applied:

1. **Start the app:** `npm run dev`
2. **Create test accounts**
3. **Test messaging features**
4. **Test file uploads**
5. **Test events calendar**

**Everything should work perfectly!** 🚀

---

**Need more help?** See `DATABASE_SETUP_GUIDE.md` for detailed documentation.
