# ✅ Database Connection Checklist

## 🎯 Your Mission: Apply 2 Database Migrations

---

## ✅ Pre-Flight Check (Already Done!)

- [x] ✅ Supabase project created
- [x] ✅ Database credentials in `.env` file
- [x] ✅ Supabase client configured
- [x] ✅ Project ID: `qxwbqzkyjphrinpicjiv`
- [x] ✅ URL: `https://qxwbqzkyjphrinpicjiv.supabase.co`

**Status:** 🟢 Connection ready! Just need to apply migrations.

---

## 📋 To-Do: Apply Migrations (You need to do this!)

### Step 1: Open Supabase Dashboard
- [ ] Go to https://supabase.com/dashboard
- [ ] Log in
- [ ] Open project: `qxwbqzkyjphrinpicjiv`

### Step 2: Navigate to SQL Editor
- [ ] Click "SQL Editor" in left sidebar
- [ ] Click "+ New query"

### Step 3: Apply Migration 2 (Chat System)
- [ ] Open file: `supabase/migrations/20251108120000_create_messaging_system.sql`
- [ ] Select all (Ctrl+A)
- [ ] Copy (Ctrl+C)
- [ ] Paste in SQL Editor
- [ ] Click "Run"
- [ ] See ✅ "Success. No rows returned"

### Step 4: Apply Migration 3 (File Sharing)
- [ ] Click "+ New query" again
- [ ] Open file: `supabase/migrations/20251108130000_add_file_sharing_to_messages.sql`
- [ ] Select all (Ctrl+A)
- [ ] Copy (Ctrl+C)
- [ ] Paste in SQL Editor
- [ ] Click "Run"
- [ ] See ✅ "Success"

---

## ✅ Verify Migrations Applied

### Check Tables
- [ ] Go to "Table Editor"
- [ ] See `conversations` table
- [ ] See `conversation_participants` table
- [ ] See `message_reads` table
- [ ] See `team_recommendations` table
- [ ] Click `messages` table → verify `file_url` and `file_name` columns exist

### Check Functions
- [ ] Go to "Database" → "Functions"
- [ ] See `get_or_create_direct_conversation`
- [ ] See `get_unread_count`

### Check Storage
- [ ] Go to "Storage"
- [ ] See `chat-files` bucket
- [ ] Bucket should be "Public"

---

## 🧪 Test the App

### Start Development Server
```bash
cd /home/piyush/NIT-Goa-Hackathon
npm run dev
```

- [ ] Server starts successfully
- [ ] Open http://localhost:5173
- [ ] App loads without errors

### Test Features
- [ ] Create an account (sign up)
- [ ] Go to another user's profile
- [ ] Click "Message" button → Chat opens (no error!)
- [ ] Send a message in the chat
- [ ] Go to Events → Calendar View
- [ ] Hover over event → Tooltip appears
- [ ] Go to a project → Team Chat tab
- [ ] See paperclip button for file upload
- [ ] Upload a file (< 10MB)
- [ ] Download the file

---

## 🎯 Quick Status Check

**Where are you now?**

Mark where you are:
- [ ] 📍 Haven't started yet
- [ ] 📍 Opened Supabase Dashboard
- [ ] 📍 Applied Migration 2
- [ ] 📍 Applied Migration 3
- [ ] 📍 Verified tables created
- [ ] 📍 Verified functions created
- [ ] 📍 Verified storage bucket created
- [ ] 📍 Tested app and everything works! 🎉

---

## 🚨 Having Issues?

### Error: "Failed to start conversation"
→ Migration 2 not applied yet. Go back and apply it.

### Error: "Failed to upload file"
→ Migration 3 not applied yet. Go back and apply it.

### Error: "Function does not exist"
→ Check Database → Functions. If empty, re-run Migration 2.

### Error: "Bucket does not exist"
→ Check Storage. If no chat-files bucket, re-run Migration 2.

### Calendar images overflow
→ Already fixed in code! Just refresh the page.

### Can't find SQL Editor
→ Look in left sidebar of Supabase Dashboard.

---

## 📞 Need Help?

**Detailed guides available:**
1. `DATABASE_SETUP_GUIDE.md` - Full documentation
2. `DATABASE_VISUAL_GUIDE.md` - Visual step-by-step
3. `FIXES_SUMMARY.md` - What was fixed
4. `CHAT_SYSTEM_COMPLETE.md` - Chat system docs
5. `EVENTS_SYSTEM_COMPLETE.md` - Events system docs

**Quick help:**
- Press F12 → Console tab to see errors
- Check Supabase Dashboard → Logs for database errors

---

## ✅ Success Criteria

You're done when:
- ✅ Both migrations applied without errors
- ✅ All new tables visible in Table Editor
- ✅ All functions visible in Database → Functions
- ✅ chat-files bucket visible in Storage
- ✅ App starts with `npm run dev`
- ✅ No errors in browser console
- ✅ Can send messages from profiles
- ✅ Can upload files in team chat
- ✅ Calendar view looks good with tooltips

---

## 🎉 Final Step

After everything works:

```bash
# Test the app one final time
npm run dev
```

Then celebrate! 🎊 Your database is fully connected and configured!

---

**Time estimate:** 5-10 minutes to apply migrations and verify

**Difficulty:** ⭐ Easy (just copy-paste and click Run)

**Status:** Your credentials are ready, you just need to apply the SQL migrations!

---

**Start here:** Open https://supabase.com/dashboard 👈
