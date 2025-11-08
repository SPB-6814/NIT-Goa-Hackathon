# Email Verification Issue - Solutions

## Problem
After creating an account, Supabase asks for email verification but no email is sent.

## Root Cause
By default, Supabase requires email confirmation but doesn't send emails in development mode unless you configure an email provider (SMTP).

## Solution Options

### Option 1: Disable Email Confirmation (Quick Fix - Recommended for Development)

This is the fastest solution for local development/testing:

1. **Go to Supabase Dashboard**:
   - Open: https://supabase.com/dashboard/project/qxwbqzkyjphrinpicjiv/auth/providers

2. **Navigate to Authentication → Email Auth**:
   - In the left sidebar, click **Authentication**
   - Click **Providers** tab
   - Find **Email** provider

3. **Disable Email Confirmation**:
   - Toggle OFF "Confirm email"
   - Click **Save**

4. **Users can now sign up immediately without email verification!**

---

### Option 2: Use Supabase Test Email (For Development)

Supabase provides a test inbox for development:

1. **Go to Authentication Settings**:
   - https://supabase.com/dashboard/project/qxwbqzkyjphrinpicjiv/auth/providers

2. **Keep Email Confirmation ON**

3. **View Confirmation Links**:
   - After a user signs up, go to **Authentication → Users**
   - You'll see the user with "unconfirmed" status
   - Click on the user
   - You'll see a "Send confirmation email" button or the confirmation link

4. **Alternative - Check Logs**:
   - Go to **Logs → Auth Logs**
   - You'll see the confirmation email with the verification link
   - Copy the link and open it in your browser

---

### Option 3: Configure Custom SMTP (For Production)

For production or if you want real emails:

1. **Go to Authentication → Email Templates**:
   - https://supabase.com/dashboard/project/qxwbqzkyjphrinpicjiv/auth/templates

2. **Configure SMTP Settings**:
   - In **Settings → Auth**
   - Scroll to "SMTP Settings"
   - Add your SMTP provider details:
     - Gmail
     - SendGrid
     - Mailgun
     - Amazon SES
     - etc.

3. **Example Gmail SMTP**:
   ```
   Host: smtp.gmail.com
   Port: 587
   User: your-email@gmail.com
   Password: your-app-password (not regular password!)
   Sender email: your-email@gmail.com
   Sender name: Campus Connect
   ```

4. **Get Gmail App Password**:
   - Go to: https://myaccount.google.com/apppasswords
   - Generate a new app password for "Mail"
   - Use this password in SMTP settings

---

## Recommended Approach

**For Hackathon/Development**: Use **Option 1** (Disable Email Confirmation)
- Fastest setup
- No configuration needed
- Users can sign up instantly
- Perfect for demo/testing

**For Production**: Use **Option 3** (Configure SMTP)
- Proper email verification
- Professional user experience
- Prevents spam accounts

---

## Quick Steps (Option 1 - Recommended)

1. Open: https://supabase.com/dashboard/project/qxwbqzkyjphrinpicjiv/auth/providers
2. Click on **Email** provider
3. Toggle OFF **"Confirm email"**
4. Click **Save**
5. Test by creating a new account - it should work immediately! ✅

---

## After Making Changes

1. **Clear existing unconfirmed users** (optional):
   - Go to **Authentication → Users**
   - Delete any test accounts with "unconfirmed" status

2. **Test the flow**:
   - Sign up with a new email
   - Should be able to sign in immediately (if confirmation is disabled)
   - Or check the confirmation email/logs (if using Option 2/3)

---

## Alternative: Auto-Confirm New Users

If you want to keep email verification ON but auto-confirm users, you can use a database trigger:

```sql
-- Run this in SQL Editor
CREATE OR REPLACE FUNCTION auto_confirm_user()
RETURNS TRIGGER AS $$
BEGIN
  NEW.email_confirmed_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER auto_confirm_users
  BEFORE INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION auto_confirm_user();
```

⚠️ **Warning**: This bypasses security - only use in development!

---

## Current Status

Your app is configured to:
- ✅ Create user accounts
- ✅ Store user metadata (username, college)
- ❌ Send verification emails (not configured)

**After applying Option 1**, it will be:
- ✅ Create user accounts
- ✅ Store user metadata
- ✅ Skip email verification
- ✅ Users can sign in immediately

---

## Need Help?

If you encounter issues:
1. Check **Authentication → Users** to see user status
2. Check **Logs → Auth Logs** for error messages
3. Ensure your Supabase project is not paused (free tier)
4. Try signing out completely and clearing browser cache

---

**TL;DR**: Go to Supabase Dashboard → Authentication → Providers → Email → Toggle OFF "Confirm email" → Save 🎉
