# Profile Page Update - Documentation

## New Features Added

### 1. Profile Picture Upload

#### Avatar Features
- **Upload Custom Profile Picture**: Click on avatar while in edit mode to upload
- **Image Preview**: See preview before saving
- **File Size Limit**: Maximum 5MB per image
- **Hover Effect**: Camera icon appears on hover in edit mode
- **Fallback Display**: Shows first letter of name if no picture uploaded
- **Storage Location**: Supabase Storage in `profile-media` bucket under `{user_id}/avatar/`

### 2. Enhanced Profile Display

#### Sidebar Changes
The sidebar now displays:
- **Profile Picture/Avatar** (uploadable, top)
- **Name** (below avatar, bold and prominent)
- **Branch & Year** (e.g., "Computer Science • Third Year")
- **College Name**
- **Contact Section**:
  - Email (clickable mailto link)
  - GitHub (clickable link)
  - LinkedIn (clickable link)

### 2. New Profile Fields

#### Avatar URL
- **Type**: Text (URL)
- **Purpose**: Stores the URL to the user's profile picture
- **Display**: Shows in sidebar as profile picture
- **Upload**: Click on avatar in edit mode to upload new picture

#### Branch
- **Type**: Text field
- **Purpose**: Student's department or course (e.g., "Computer Science", "IT", "BCA")
- **Display**: Shows below name in sidebar with year

#### Year
- **Type**: Text field
- **Purpose**: Student's current academic year (e.g., "First Year", "Second Year", "Third Year")
- **Display**: Shows next to branch in sidebar

#### Email
- **Type**: Text field (email)
- **Purpose**: Student's email address
- **Display**: Shows in Contact section with mail icon as clickable mailto link

### 3. Projects Section

The new **Projects** section allows students to showcase their work:

#### Project Fields:
1. **Title** - Project name
2. **Description** - Detailed description of the project
3. **URLs** - Multiple links (GitHub, demo, documentation, etc.)
4. **Images** - Multiple images with captions

#### Edit Mode Features:
- Add multiple projects
- Each project can have:
  - Multiple URLs (add/remove dynamically)
  - Multiple images with captions (upload + caption)
- Remove entire projects
- Organized in expandable cards

#### Display Mode Features:
- Projects shown as attractive cards
- Clickable URLs (truncated if too long)
- Image grid (2 columns)
- Hover effects for interactivity

## Database Changes

### Migration File
Location: `supabase/migrations/20251108110000_add_profile_fields.sql`

### New Columns in `profiles` Table:
```sql
avatar_url: text  -- URL to profile picture
branch: text      -- Student's department/course
year: text        -- Academic year
email: text       -- Email address
projects: text    -- JSON string with project data
```

### Projects Data Structure (JSON):
```json
[
  {
    "title": "Project Name",
    "description": "Project description...",
    "urls": [
      "https://github.com/username/repo",
      "https://demo.example.com"
    ],
    "images": [
      {
        "caption": "Screenshot 1",
        "url": "https://storage.url/image1.jpg"
      },
      {
        "caption": "Screenshot 2",
        "url": "https://storage.url/image2.jpg"
      }
    ]
  }
]
```

## How to Apply Changes

### Step 1: Apply Database Migration
1. Go to [Supabase Dashboard](https://supabase.com/dashboard)
2. Select your project
3. Click **SQL Editor** → **New Query**
4. Copy contents of `supabase/migrations/20251108110000_add_profile_fields.sql`
5. Paste and click **Run**

### Step 2: Regenerate TypeScript Types (Optional)
```bash
npx supabase gen types typescript --project-id YOUR_PROJECT_ID > src/integrations/supabase/types.ts
```

## User Experience Flow

### Viewing Profile (Read Mode)
1. **Sidebar displays**:
   - **Profile picture** (uploaded image or first letter of name)
   - Full name (bold, large)
   - Branch and year (e.g., "Computer Science • Third Year")
   - College name
   - Contact section with email, GitHub, LinkedIn

2. **Main area shows**:
   - Interests/Skills (badges)
   - Experience (text + images with captions)
   - Achievements (images with captions)
   - **Projects** (new!) - cards with:
     - Title
     - Description
     - Clickable URLs
     - Image gallery

### Editing Profile (Edit Mode)
1. Click **"Edit"** button (only visible on own profile)
2. **Upload profile picture**: Hover over avatar and click camera icon to select image
3. All fields become editable:
   - **Sidebar**: Name, Branch, Year, College, Email, GitHub, LinkedIn
   - **Skills**: Add/remove skills with tags
   - **Experience**: Text area + add multiple image items
   - **Achievements**: Add multiple image items
   - **Projects**: 
     - Add/remove projects
     - Each project: title, description, multiple URLs, multiple images

3. Click **"Save Changes"** to upload images (including avatar) and save all data
4. Automatically returns to display mode showing all updated content

## File Storage

Images are stored in Supabase Storage:

### Avatar Images
- **Bucket**: `profile-media`
- **Path**: `{user_id}/avatar/{timestamp}_{filename}`
- **Size Limit**: 5MB per file
- **Access**: Public (anyone can view)

### Project Images
- **Bucket**: `profile-media`
- **Path**: `{user_id}/projects/{timestamp}_{filename}`
- **Access**: Public (anyone can view)

## UI/UX Highlights

### Gamified Design
- Hover effects on cards
- Smooth transitions
- Rounded corners throughout
- Shadow effects on project cards
- Primary color on clickable links

### Responsive Layout
- Grid layout adapts to screen size
- Sidebar collapses on mobile
- Image grids responsive (2 columns on desktop, 1 on mobile)

### User Feedback
- Toast notifications on save
- Loading states during upload
- Error messages if save fails
- Confirmation before removing items

## Example Usage

### Student Profile Example:
```
[Avatar]
John Doe
Computer Science • Third Year
NIT Goa

Contact:
📧 john.doe@student.nitgoa.ac.in
🐙 GitHub
💼 LinkedIn

Skills: React, Python, Machine Learning, Web Dev

Experience:
- Internship at XYZ Corp (Summer 2024)
  [Image: Office photo]

Achievements:
- Won National Hackathon 2024
  [Image: Trophy photo]

Projects:
╔═══════════════════════════════╗
║ AI Chatbot for Students       ║
║ Built using Python and NLP... ║
║ 🔗 GitHub | 🔗 Demo           ║
║ [Screenshot 1] [Screenshot 2] ║
╚═══════════════════════════════╝
```

## Benefits

1. **Complete Profile**: Students can now showcase all aspects of their academic life
2. **Project Portfolio**: Display multiple projects with links and visuals
3. **Better Networking**: Email in contact section makes it easier to connect
4. **Academic Context**: Branch and year help identify peers and seniors
5. **Professional Appearance**: Organized layout makes profiles look polished

## Next Steps

After applying the migration:
1. Test profile editing with all new fields
2. Add sample data to verify display
3. Upload project images to test storage
4. Verify all links work correctly
5. Check responsive design on mobile

Enjoy the enhanced profile page! 🎉
