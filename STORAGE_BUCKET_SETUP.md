# Storage Bucket Setup Guide

## Problem
You can't create storage buckets via SQL migrations - they must be created through the Supabase Dashboard.

## Solution: Create Buckets Manually

### Step 1: Create `post-images` Bucket

1. **Open Supabase Dashboard**:
   - Go to: https://supabase.com/dashboard/project/qxwbqzkyjphrinpicjiv/storage/buckets

2. **Click "New Bucket"**:
   - Click the **"New bucket"** button (top right)

3. **Configure Bucket**:
   - **Name**: `post-images`
   - **Public bucket**: Toggle **ON** ✅
   - Click **"Create bucket"**

4. **Done!** ✅

### Step 2: Verify `chat-files` Bucket Exists

1. **Check Storage Buckets**:
   - In the same Storage page, look for `chat-files` bucket

2. **If it doesn't exist, create it**:
   - Click **"New bucket"**
   - **Name**: `chat-files`
   - **Public bucket**: Toggle **ON** ✅
   - Click **"Create bucket"**

### Step 3: Apply Storage Policies

After creating the buckets, run the migration to set up security policies:

1. **Open SQL Editor**:
   - https://supabase.com/dashboard/project/qxwbqzkyjphrinpicjiv/sql

2. **Copy and run this**:
   ```sql
   -- Storage policies for post images
   DROP POLICY IF EXISTS "Anyone can view post images" ON storage.objects;
   DROP POLICY IF EXISTS "Authenticated users can upload post images" ON storage.objects;
   DROP POLICY IF EXISTS "Users can delete their own post images" ON storage.objects;

   CREATE POLICY "Anyone can view post images"
     ON storage.objects FOR SELECT
     USING (bucket_id = 'post-images');

   CREATE POLICY "Authenticated users can upload post images"
     ON storage.objects FOR INSERT
     WITH CHECK (
       bucket_id = 'post-images' AND
       auth.role() = 'authenticated'
     );

   CREATE POLICY "Users can delete their own post images"
     ON storage.objects FOR DELETE
     USING (
       bucket_id = 'post-images' AND
       auth.uid()::text = (storage.foldername(name))[1]
     );
   ```

3. **Click RUN** ✅

---

## Quick Checklist

### Required Storage Buckets

Go to: https://supabase.com/dashboard/project/qxwbqzkyjphrinpicjiv/storage/buckets

You should have:
- ✅ `chat-files` - For DM chat attachments (Public: ON)
- ✅ `post-images` - For feed post images (Public: ON)

### Bucket Settings

Both buckets should have:
- **Public bucket**: ON ✅
- **File size limit**: Default (or set to 10MB if you prefer)
- **Allowed MIME types**: Leave empty (allows all) or set to `image/*`

### After Creating Buckets

1. ✅ Run the storage policies SQL (see Step 3 above)
2. ✅ Test uploading a post with images
3. ✅ Test sending a file in chat

---

## Alternative: Create Buckets via Supabase CLI

If you have Supabase CLI installed, you can create buckets programmatically:

```bash
# Login first
supabase login

# Link to your project
supabase link --project-ref qxwbqzkyjphrinpicjiv

# Create buckets using SQL with proper permissions
supabase db execute "
  INSERT INTO storage.buckets (id, name, public)
  VALUES 
    ('post-images', 'post-images', true),
    ('chat-files', 'chat-files', true)
  ON CONFLICT (id) DO UPDATE SET public = EXCLUDED.public;
"
```

---

## Verification

After setup, test in your app:

### Test Post Images
1. Go to Home page
2. Click "Create Post"
3. Upload 1-2 images
4. Click "Post"
5. ✅ Images should display in feed

### Test Chat Files
1. Click floating chat button
2. Start a conversation
3. Click paperclip icon
4. Upload a file
5. ✅ File should appear with download link

---

## Troubleshooting

### Bucket Creation Fails
- Make sure you're logged into Supabase Dashboard
- Try refreshing the page
- Check your project isn't paused (free tier)

### Images Still Don't Show
1. Check bucket is **Public**: Storage → Buckets → post-images → Settings → Public bucket ON
2. Verify policies applied: Storage → post-images → Policies tab
3. Check browser console for 404/403 errors
4. Try uploading test image manually in Dashboard

### Upload Fails with "Bucket not found"
- The bucket wasn't created successfully
- Go back to Storage → Buckets and create it
- Make sure the name is exactly `post-images` (with hyphen)

---

## Summary

**Manual Steps Required:**

1. 🖱️ **Create `post-images` bucket** in Dashboard (Public: ON)
2. 🖱️ **Create `chat-files` bucket** in Dashboard (Public: ON) - if not exists
3. 📝 **Run storage policies SQL** in SQL Editor

After these 3 steps, both post images and chat file sharing will work! 🎉

**Why Manual?**
- Supabase doesn't allow SQL-based bucket creation for security
- Buckets must be created by project owners via Dashboard
- Policies can be applied via SQL after buckets exist
