# AI-Powered Teammate Matching Implementation

## 🎯 Overview

This feature uses Google's Gemini AI to automatically match users interested in the same event based on their skills, interests, and experiences. When two or more users mark interest in an event, the AI analyzes their compatibility and sends notifications to highly compatible pairs.

## ✅ Implemented Components

### 1. **Gemini Matching Service**
**File:** `src/services/geminiMatchingService.ts`

**Core Functions:**

#### `analyzeTeammateCompatibility(user1, user2)`
- Uses Gemini Pro AI model to analyze compatibility
- Compares skills, interests, and bio
- Returns match score (0-1), matching skills/interests, and AI reasoning
- Falls back to basic matching if AI fails

#### `findEventTeammates(eventId)`
- Fetches all users interested in an event
- Compares each pair of users
- Creates matches with score > 0.5
- Saves matches to `teammate_matches` table
- Sends notifications to matched users

#### `createMatchNotifications(match, eventId)`
- Creates notifications for both users
- Includes match details and AI reasoning
- Links to matched user and event

### 2. **Enhanced EventCard Component**
**File:** `src/components/EventCard.tsx`

**New Features:**
- ✅ Tracks user interest in database (`event_interests` table)
- ✅ Shows "Already Interested" state with check icon
- ✅ Triggers AI matching automatically after marking interest
- ✅ Loading states during processing
- ✅ Toast notifications for feedback

**Flow:**
1. User clicks "Interested" button
2. Interest saved to `event_interests` table
3. AI matching triggered in background
4. Other interested users compared
5. Matches created and notifications sent

### 3. **Teammate Match Notifications Component**
**File:** `src/components/TeammateMatchNotifications.tsx`

**Features:**
- 🎯 Floating notification badge (bottom-right)
- 📊 Match details dialog with:
  - Event information
  - Matched user profile
  - Visual match score bar
  - Matching skills/interests badges
  - AI reasoning explanation
- 🔔 Real-time updates via Supabase subscriptions
- 💬 "Send Message" button
- ✅ "Team Up!" accept button
- ❌ "Not Interested" reject button

**Added to:** `src/components/layout/AppLayout.tsx`

## 🗄️ Database Schema

The migration `20251109000000_add_advanced_features.sql` created:

### `event_interests` Table
```sql
CREATE TABLE event_interests (
  id uuid PRIMARY KEY,
  event_id uuid REFERENCES events(id),
  user_id uuid REFERENCES profiles(id),
  created_at timestamptz,
  UNIQUE(event_id, user_id)
);
```

### `teammate_matches` Table
```sql
CREATE TABLE teammate_matches (
  id uuid PRIMARY KEY,
  event_id uuid REFERENCES events(id),
  user1_id uuid REFERENCES profiles(id),
  user2_id uuid REFERENCES profiles(id),
  match_score decimal(3,2),  -- 0.00 to 1.00
  matching_skills text[],
  matching_interests text[],
  ai_reasoning text,
  status text DEFAULT 'pending',  -- pending/accepted/rejected
  created_at timestamptz,
  UNIQUE(event_id, user1_id, user2_id)
);
```

### `notifications` Table
```sql
CREATE TABLE notifications (
  id uuid PRIMARY KEY,
  user_id uuid REFERENCES profiles(id),
  type text NOT NULL,  -- 'teammate_match', etc.
  title text NOT NULL,
  message text NOT NULL,
  data jsonb,  -- Additional match details
  is_read boolean DEFAULT false,
  created_at timestamptz
);
```

## 🔑 Setup Instructions

### 1. Get Gemini API Key

1. Visit: https://makersuite.google.com/app/apikey
2. Sign in with Google account
3. Click "Create API Key"
4. Copy your API key

### 2. Add to Environment Variables

Edit `.env` file:
```env
VITE_GEMINI_API_KEY="your_actual_api_key_here"
```

**Important:** Replace `"YOUR_GEMINI_API_KEY_HERE"` with your real API key

### 3. Install Dependencies

Already installed:
```bash
npm install @google/generative-ai
```

### 4. Apply Database Migration

The migration should already be applied. If not:
1. Open Supabase Dashboard → SQL Editor
2. Run `supabase/migrations/20251109000000_add_advanced_features.sql`

## 📋 Usage Guide

### For Users:

1. **Mark Interest in Event:**
   - Navigate to Events page
   - Click "Interested" button on any event
   - Interest is saved automatically
   - AI matching starts in background

2. **Receive Match Notification:**
   - Floating badge appears in bottom-right corner
   - Shows number of potential matches
   - Click to view details

3. **Review Match:**
   - See matched user's profile
   - View match score (percentage)
   - Read matching skills/interests
   - Read AI's reasoning

4. **Take Action:**
   - **Team Up!** - Accept match, connect with teammate
   - **Send Message** - Start chatting
   - **Not Interested** - Decline match

### Complete Flow:

```
User A marks interest in "HackNIT 2025"
           ↓
Interest saved to event_interests
           ↓
User B marks interest in same event
           ↓
AI matching triggered automatically
           ↓
AI compares profiles:
  - Skills: Both have [JavaScript, Python]
  - Interests: Both like [AI, Web Dev]
  - Analyzes compatibility
           ↓
Match score: 0.85 (85%)
           ↓
Match saved to teammate_matches
           ↓
Notifications sent to both users
           ↓
Both see floating badge with "1 Teammate Match"
           ↓
Users can review and connect
```

## 🤖 AI Matching Algorithm

### Input to Gemini AI:
```
User 1 (Alice):
- Skills: JavaScript, React, Node.js
- Interests: Web Development, AI
- Bio: Full-stack developer passionate about AI

User 2 (Bob):
- Skills: Python, JavaScript, Machine Learning
- Interests: AI, Data Science
- Bio: ML engineer interested in web applications
```

### AI Analysis:
- Compares technical skills
- Finds common interests
- Analyzes complementary strengths
- Evaluates potential for collaboration
- Generates match score (0-1)
- Provides reasoning in natural language

### Output:
```json
{
  "match_score": 0.85,
  "matching_skills": ["JavaScript"],
  "matching_interests": ["AI"],
  "reasoning": "Both users have strong technical skills with JavaScript and share a passion for AI. Alice's web development expertise complements Bob's machine learning background, making them an excellent team for AI-powered web projects."
}
```

## 🎨 UI Components

### Match Notification Badge
- Fixed position: bottom-right corner
- Animated bounce effect
- Shows match count
- Red badge indicator
- Opens match dialog on click

### Match Details Dialog
- Event name at top
- Matched user avatar and name
- Visual progress bar for match score
- Categorized skill/interest badges
- AI reasoning in highlighted box
- Three action buttons

### EventCard States
1. **Default:** "Interested" button with star icon
2. **Loading:** "Processing..." with spinner
3. **Interested:** "Already Interested" with check icon (disabled)

## 🔧 Configuration

### Match Score Threshold
Currently set to `0.5` (50%) in `geminiMatchingService.ts`:

```typescript
if (matchResult.match_score > 0.5) {
  matches.push(matchResult);
}
```

**To adjust:**
- Lower threshold (e.g., 0.3) = More matches, lower quality
- Higher threshold (e.g., 0.7) = Fewer matches, higher quality

### Gemini Model
Current model: `gemini-pro`

**To use different model:**
```typescript
const model = genAI.getGenerativeModel({ 
  model: 'gemini-1.5-pro'  // or other available models
});
```

## 🚀 Advanced Features

### 1. Fallback Matching
If Gemini API fails, system uses basic algorithm:
- Counts common skills
- Counts common interests
- Calculates ratio: matches / total items
- Still creates matches, just simpler reasoning

### 2. Duplicate Prevention
- Checks `teammate_matches` table before creating
- Uses sorted pair key: `user1_id-user2_id`
- Prevents matching same pair multiple times

### 3. Real-time Updates
- Supabase realtime subscriptions
- Auto-refreshes when new matches created
- Instant notifications via WebSocket

### 4. Status Tracking
Match statuses:
- `pending` - Awaiting user action
- `accepted` - User agreed to team up
- `rejected` - User declined match

## 📊 Performance Considerations

### API Rate Limits
Gemini API has rate limits. For high-traffic events:

**Current:** Sequential matching (one pair at a time)
**Improvement:** Could batch requests or implement queue

### Database Queries
- Uses indexes on event_id, user_id
- Fetches only pending matches
- Efficient OR queries for bi-directional matching

### Background Processing
- Matching runs asynchronously
- Doesn't block UI
- Errors logged but not shown to users

## 🐛 Troubleshooting

### "VITE_GEMINI_API_KEY is not set"
**Solution:** Add your API key to `.env` file and restart dev server

### No matches created
**Possible causes:**
1. Less than 2 users interested
2. Match score below threshold (< 0.5)
3. Users already matched for this event
4. Missing skills/interests in profiles

**Check:**
- Supabase logs for errors
- Browser console for AI service errors
- Database for event_interests entries

### Matches not showing
**Possible causes:**
1. Realtime subscription not connected
2. Match status not 'pending'
3. Component not mounted

**Solution:**
- Check browser network tab for WebSocket
- Query database directly for matches
- Verify AppLayout includes TeammateMatchNotifications

## 🔐 Security & Privacy

### RLS Policies
- Users can only see their own matches
- Can't view matches for events they're not interested in
- Notifications private to recipient

### Data Protection
- User profiles queried only for interested users
- AI reasoning stored but not shared publicly
- Match acceptance required for contact

## 📈 Future Enhancements

1. **Group Matching** - Match 3+ users for team events
2. **Skill Weighting** - Prioritize certain skills
3. **Experience Levels** - Match based on expertise
4. **Location-based** - Prefer nearby teammates
5. **Availability** - Check schedule compatibility
6. **Past Collaboration** - Consider previous teamwork
7. **Preferences** - Let users set matching criteria
8. **Analytics** - Track match success rates

## 🎓 Example Use Cases

### Hackathon
- Match developers with complementary skills
- Find designer + developer pairs
- Connect beginners with mentors

### Workshop
- Pair students with similar interests
- Match based on experience level
- Create study groups

### Competition
- Form balanced teams
- Match specialists (frontend + backend)
- Connect competitors → collaborators

---

## ✅ Status: Fully Implemented!

All components ready to use. Just add your Gemini API key and start matching teammates! 🚀

