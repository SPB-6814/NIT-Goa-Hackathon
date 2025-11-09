# 🎓 Campus Connect - NIT Goa Hackathon Project

> **AI-Powered College Collaboration Platform**  
> A modern web application that connects students, facilitates team formation, and fosters campus-wide collaboration through intelligent matching and real-time interactions.

[![TypeScript](https://img.shields.io/badge/TypeScript-5.8-blue.svg)](https://www.typescriptlang.org/)
[![React](https://img.shields.io/badge/React-18.3-61dafb.svg)](https://reactjs.org/)
[![Vite](https://img.shields.io/badge/Vite-5.4-646cff.svg)](https://vitejs.dev/)
[![Supabase](https://img.shields.io/badge/Supabase-2.80-3ecf8e.svg)](https://supabase.com/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-3.4-38bdf8.svg)](https://tailwindcss.com/)

---

## 📋 Table of Contents

- [Overview](#-overview)
- [Key Features](#-key-features)
- [Tech Stack](#-tech-stack)
- [Getting Started](#-getting-started)
- [Project Structure](#-project-structure)
- [Core Features](#-core-features)
- [AI Matching System](#-ai-matching-system)
- [Database Schema](#-database-schema)
- [Environment Setup](#-environment-setup)
- [Available Scripts](#-available-scripts)
- [Contributing](#-contributing)
- [Documentation](#-documentation)
- [License](#-license)

---

## 🌟 Overview

**Campus Connect** is an innovative platform designed to revolutionize how students collaborate on campus. Built with cutting-edge technologies and powered by Google's Gemini AI, it automatically matches students based on their skills, interests, and project needs, creating meaningful connections and fostering teamwork.

### 🎯 Mission
To eliminate the barriers students face when finding teammates, discovering opportunities, and building collaborative projects by leveraging AI-driven matching and real-time communication.

### 👥 Target Audience
- College students looking for project collaborators
- Event organizers seeking to connect attendees
- Students wanting to showcase their skills and projects
- Academic communities aiming to enhance collaboration

---

## ✨ Key Features

### 🤖 AI-Powered Smart Matching
- **Event-Based Team Formation**: Automatically matches users attending the same events based on shared interests and complementary skills
- **Project Collaboration**: Finds compatible teammates for projects using Gemini AI
- **Compatibility Scoring**: Advanced algorithms analyze profiles to calculate match strength (Strong/Good/Potential)
- **Intelligent Notifications**: Receive personalized collaboration suggestions with detailed reasoning

### 📱 Social Features
- **Campus Feed**: Share posts, updates, and achievements with tagged content (Technical, Cultural, Academic, Sports)
- **Project Showcase**: Display and discover student projects with detailed descriptions
- **Event Management**: Browse, register, and track campus events (Hackathons, Workshops, Competitions)
- **Real-Time Notifications**: Instant updates for join requests, matches, and collaborations

### 👤 Rich User Profiles
- **Comprehensive Profiles**: Showcase skills, interests, bio, college info, and social links
- **Project Portfolio**: Display owned and collaborative projects with role badges
- **Experience & Achievements**: Track and share accomplishments
- **Custom Avatars**: Personalized user identification

### 🔍 Discovery & Search
- **Advanced Search**: Find users by skills, interests, college, or name
- **Filter Options**: Narrow down results by department, year, or specialization
- **Event Discovery**: Browse events by category (Technical, Cultural, Academic, Sports)
- **Project Browsing**: Explore projects seeking collaborators

### 📊 Dashboard
- **Project Management**: Create, edit, and manage projects
- **Join Request Handling**: Accept/reject collaboration requests
- **Team Collaboration**: Auto-add approved members to project teams
- **Analytics**: Track project status and member contributions

### 📱 Responsive Design
- **Mobile-First**: Fully responsive layout optimized for all devices
- **Bottom Navigation**: Mobile-friendly navigation bar for easy access
- **Adaptive UI**: Automatically adjusts for tablet and desktop screens
- **Touch-Optimized**: Gesture-friendly interactions

---

## 🛠 Tech Stack

### Frontend
- **React 18.3** - Modern UI library with hooks
- **TypeScript 5.8** - Type-safe development
- **Vite 5.4** - Lightning-fast build tool with HMR
- **React Router 6.30** - Client-side routing
- **TanStack Query 5.83** - Powerful data fetching and caching

### UI & Styling
- **Tailwind CSS 3.4** - Utility-first CSS framework
- **shadcn/ui** - Beautiful, accessible component library
- **Radix UI** - Unstyled, accessible component primitives
- **Lucide React** - Beautiful icon library
- **Recharts** - Composable charting library

### Backend & Database
- **Supabase 2.80** - Backend-as-a-Service platform
  - PostgreSQL database
  - Real-time subscriptions
  - Authentication & authorization
  - Row-level security (RLS)
  - Storage for media files

### AI & Intelligence
- **Google Gemini AI** - Advanced AI for compatibility analysis
- **Custom Matching Algorithms** - Multi-layered scoring system
- **Natural Language Processing** - Profile and event analysis

### State Management
- **React Context API** - Authentication state
- **TanStack Query** - Server state management
- **Local Storage** - Persistent user preferences

### Form Handling
- **React Hook Form 7.61** - Performant form management
- **Zod 3.25** - TypeScript-first schema validation
- **@hookform/resolvers** - Schema validation integration

### Additional Libraries
- **date-fns** - Modern date utility library
- **Sonner** - Beautiful toast notifications
- **Leaflet** - Interactive maps
- **Embla Carousel** - Smooth carousel components

---

## 🚀 Getting Started

### Prerequisites

Before you begin, ensure you have the following installed:
- **Node.js** (v18 or higher)
- **npm** or **bun** package manager
- **Git** for version control
- **Supabase Account** (free tier available)
- **Google Gemini API Key** (for AI features)

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/SPB-6814/NIT-Goa-Hackathon.git
   cd NIT-Goa-Hackathon
   ```

2. **Install dependencies**
   ```bash
   npm install
   # or
   bun install
   ```

3. **Set up environment variables**
   
   Create a `.env` file in the root directory:
   ```env
   # Supabase Configuration
   VITE_SUPABASE_URL=your_supabase_project_url
   VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
   
   # Google Gemini AI
   VITE_GEMINI_API_KEY=your_gemini_api_key
   ```

4. **Set up Supabase Database**
   
   Run the migration file in your Supabase SQL Editor:
   ```bash
   # Copy and run the SQL from:
   supabase/migrations/20251108065317_1ca1eb0c-5e22-47ca-97d7-60e8442afa0e.sql
   ```

5. **Start the development server**
   ```bash
   npm run dev
   # or
   bun run dev
   ```

6. **Open your browser**
   
   Navigate to `http://localhost:8080`

---

## 📁 Project Structure

```
NIT-Goa-Hackathon/
├── public/                      # Static assets
│   ├── favicon.ico
│   ├── placeholder.svg
│   └── robots.txt
│
├── src/
│   ├── components/             # React components
│   │   ├── ui/                # shadcn/ui components
│   │   │   ├── button.tsx
│   │   │   ├── card.tsx
│   │   │   ├── dialog.tsx
│   │   │   ├── input.tsx
│   │   │   ├── toast.tsx
│   │   │   └── ... (40+ components)
│   │   │
│   │   ├── layout/            # Layout components
│   │   │   ├── AppLayout.tsx
│   │   │   ├── Sidebar.tsx
│   │   │   ├── TopBar.tsx
│   │   │   └── MobileBottomNav.tsx
│   │   │
│   │   ├── ChatBox.tsx        # Real-time chat
│   │   ├── EventCard.tsx      # Event display
│   │   ├── ProjectCard.tsx    # Project showcase
│   │   ├── PostCard.tsx       # Social feed posts
│   │   └── ... (20+ components)
│   │
│   ├── pages/                 # Page components
│   │   ├── HomePage.tsx       # Campus feed
│   │   ├── DashboardPage.tsx  # Project management
│   │   ├── EventsPage.tsx     # Event discovery
│   │   ├── ProfilePage.tsx    # User profiles
│   │   ├── SearchPage.tsx     # User search
│   │   ├── NotificationsPage.tsx
│   │   ├── ProjectDetailPage.tsx
│   │   ├── SettingsPage.tsx
│   │   ├── AuthPage.tsx       # Authentication
│   │   └── Index.tsx          # Route handler
│   │
│   ├── services/              # Business logic
│   │   └── geminiMatchingService.ts  # AI matching
│   │
│   ├── contexts/              # React contexts
│   │   └── AuthContext.tsx    # Authentication state
│   │
│   ├── hooks/                 # Custom hooks
│   │   ├── use-mobile.tsx
│   │   └── use-toast.ts
│   │
│   ├── integrations/          # External services
│   │   └── supabase/
│   │       ├── client.ts      # Supabase config
│   │       └── types.ts       # Database types
│   │
│   ├── lib/                   # Utilities
│   │   └── utils.ts           # Helper functions
│   │
│   ├── App.tsx                # Root component
│   ├── main.tsx               # Entry point
│   └── index.css              # Global styles
│
├── supabase/                  # Database migrations
│   ├── config.toml
│   └── migrations/
│       └── 20251108065317_*.sql
│
├── Configuration Files
├── package.json               # Dependencies
├── tsconfig.json             # TypeScript config
├── vite.config.ts            # Vite config
├── tailwind.config.ts        # Tailwind config
├── components.json           # shadcn config
├── eslint.config.js          # ESLint config
└── README.md                 # This file
```

---

## 🎯 Core Features

### 1. **Campus Feed** 📰
The heart of social interaction on campus.

**Features:**
- Create posts with images, text, and tags
- Filter by category (Technical, Cultural, Academic, Social, Sports)
- Real-time updates using Supabase subscriptions
- Like, comment, and share functionality
- User attribution with profile links

**Tech Implementation:**
- Real-time subscriptions for instant updates
- Optimistic UI updates for better UX
- Image upload with Supabase Storage
- Tag-based filtering system

### 2. **Project Management** 💼

**Creating Projects:**
- Title, description, and required skills
- Set project visibility (public/private)
- Define team size and roles
- Add project links and resources

**Managing Collaborations:**
- Review join requests with user profiles
- Accept/reject with automatic notifications
- Auto-add approved members to team
- Track member contributions

**Project Showcase:**
- Display owned and collaborative projects
- Badge system (Owner/Member)
- Project status tracking
- Team member listing

### 3. **Event System** 🎉

**Event Discovery:**
- Browse upcoming events (Hackathons, Workshops, Competitions)
- Filter by category and date
- Calendar view for planning
- Event posters and details

**Event Participation:**
- Mark interest with one click
- Automatic teammate matching
- Receive collaboration suggestions
- Track registered events

**Event Types:**
- Technical (Hackathons, Coding Competitions)
- Cultural (Fests, Performances)
- Academic (Workshops, Seminars)
- Sports (Tournaments, Matches)

### 4. **User Profiles** 👤

**Profile Sections:**
- **Basic Info**: Name, username, college, department, year
- **Bio**: Personal introduction and interests
- **Skills**: Technical and soft skills showcase
- **Interests**: Hobbies and areas of interest
- **Experience**: Work history and internships
- **Achievements**: Awards, certifications, accomplishments
- **Social Links**: GitHub, LinkedIn, Twitter, Portfolio

**Profile Features:**
- Avatar upload
- Public/private visibility
- Project portfolio display
- Collaborative project showcase

### 5. **Smart Search** 🔍

**Search Capabilities:**
- Search users by name, college, or username
- Filter by skills and interests
- Filter by department and year
- View detailed profiles from results

**Search Results:**
- User cards with key information
- Quick skill overview
- College and department info
- Direct profile access

### 6. **Notifications** 🔔

**Notification Types:**
- **Join Requests**: When someone wants to join your project
- **Request Accepted**: When your join request is approved
- **Match Found**: AI-suggested teammate for events
- **Potential Collaborator**: Event-based collaboration suggestions
- **System Updates**: Important platform announcements

**Notification Features:**
- Real-time badge count on sidebar
- Animated indicators for new notifications
- Click to navigate to relevant page
- Mark as read functionality
- Notification history

---

## 🤖 AI Matching System

### Overview
The **Gemini AI Matching System** is the core intelligence that powers team formation and collaboration suggestions. It uses multi-layered analysis to find compatible teammates.

### How It Works

#### 1. **Event-Based Matching**

When a user marks interest in an event:

```typescript
Event Interest Marked
    ↓
Analyze User Profile vs Event Details
    ↓
Calculate Event Relevance Score (0-1)
    ↓
Find Other Interested Users
    ↓
For Each User Pair:
    - Calculate Collaboration Score
    - Check Common Interests
    - Check Shared Skills
    - Verify Event Theme Alignment
    ↓
Create Notifications (if score ≥ 0.4)
```

#### 2. **Scoring System**

**Event Match Score:**
- User interests matching event keywords: **40%**
- User skills matching event requirements: **40%**
- Event type alignment: **20%**

**Collaboration Score:**
- Common interests between users: **30%**
- Shared skills: **30%**
- Both users match event theme: **30%**
- Same college bonus: **10%**

#### 3. **Match Strength Classification**

```typescript
Score ≥ 0.7 → "Strong Match" 🟢
Score ≥ 0.5 → "Good Match" 🟡
Score ≥ 0.4 → "Potential Match" 🟠
Score < 0.4 → No notification ⚫
```

### Example Scenario

**Event**: AI/ML Hackathon
**User A**: 
- Interests: ["AI", "Machine Learning", "Deep Learning"]
- Skills: ["Python", "TensorFlow", "PyTorch"]
- College: "NIT Goa"

**User B**:
- Interests: ["Machine Learning", "Data Science"]
- Skills: ["Python", "Scikit-learn"]
- College: "NIT Goa"

**Result**:
- Event relevance (A): 0.8 ✅
- Event relevance (B): 0.7 ✅
- Collaboration score: **0.85** (Strong Match!)
- Notification sent to both users with reasoning

### Key Functions

```typescript
// Main entry point for event-based matching
autoMatchOnEventInterest(userId, eventId)

// Analyze user profile against event
matchUserToEvent(userId, eventId)

// Calculate how well user fits event
calculateEventMatch(user, event)

// Measure collaboration potential
calculateCollaborationScore(user1, user2, event)

// Create mutual notifications
createCollaborationNotifications(userId1, userId2, eventId, compatibility)
```

### Features

✅ **Fuzzy Keyword Matching** - Handles variations in interests/skills  
✅ **Duplicate Prevention** - No spam notifications  
✅ **Detailed Reasoning** - Users know WHY they matched  
✅ **Performance Optimized** - Efficient querying and caching  
✅ **Real-Time Processing** - Instant match suggestions  

---

## 🗄 Database Schema

### Core Tables

#### **profiles**
```sql
- id (uuid, primary key)
- username (text, unique)
- college (text)
- department (text)
- year (integer)
- bio (text)
- skills (text[])
- interests (text[])
- avatar_url (text)
- github_url, linkedin_url, twitter_url, portfolio_url (text)
- created_at (timestamp)
```

#### **projects**
```sql
- id (uuid, primary key)
- user_id (uuid, foreign key → profiles)
- title (text)
- description (text)
- skills_needed (text[])
- is_looking_for_collaborators (boolean)
- created_at (timestamp)
```

#### **project_join_requests**
```sql
- id (uuid, primary key)
- project_id (uuid, foreign key → projects)
- user_id (uuid, foreign key → profiles)
- status (text) - 'pending' | 'accepted' | 'rejected'
- message (text)
- created_at (timestamp)
- UNIQUE(project_id, user_id)
```

#### **project_members**
```sql
- id (uuid, primary key)
- project_id (uuid, foreign key → projects)
- user_id (uuid, foreign key → profiles)
- role (text) - 'owner' | 'member'
- joined_at (timestamp)
```

#### **posts**
```sql
- id (uuid, primary key)
- user_id (uuid, foreign key → profiles)
- content (text)
- images (text[])
- tags (text[])
- created_at (timestamp)
```

#### **events**
```sql
- id (uuid, primary key)
- title (text)
- description (text)
- event_date (date)
- location (text)
- event_type (text)
- tags (text[])
- poster_url (text)
- registration_url (text)
- created_at (timestamp)
```

#### **event_interests**
```sql
- id (uuid, primary key)
- user_id (uuid, foreign key → profiles)
- event_id (uuid, foreign key → events)
- created_at (timestamp)
- UNIQUE(user_id, event_id)
```

#### **notifications**
```sql
- id (uuid, primary key)
- user_id (uuid, foreign key → profiles)
- type (text) - 'join_request' | 'request_accepted' | 'match_found' | 'potential_collaborator'
- title (text)
- message (text)
- link (text)
- metadata (jsonb)
- read (boolean, default false)
- created_at (timestamp)
```

#### **teammate_matches**
```sql
- id (uuid, primary key)
- event_id (uuid, foreign key → events)
- user1_id (uuid, foreign key → profiles)
- user2_id (uuid, foreign key → profiles)
- compatibility_score (numeric)
- ai_analysis (text)
- created_at (timestamp)
```

### Relationships

```
profiles
  ├── 1:N → projects (user_id)
  ├── 1:N → posts (user_id)
  ├── 1:N → project_join_requests (user_id)
  ├── 1:N → project_members (user_id)
  ├── 1:N → event_interests (user_id)
  ├── 1:N → notifications (user_id)
  └── 1:N → teammate_matches (user1_id, user2_id)

projects
  ├── N:1 → profiles (user_id)
  ├── 1:N → project_join_requests (project_id)
  └── 1:N → project_members (project_id)

events
  ├── 1:N → event_interests (event_id)
  └── 1:N → teammate_matches (event_id)
```

---

## 🔧 Environment Setup

### Supabase Configuration

1. **Create a Supabase Project**
   - Go to [supabase.com](https://supabase.com)
   - Click "New Project"
   - Note your Project URL and Anon Key

2. **Apply Database Migration**
   - Navigate to SQL Editor in Supabase Dashboard
   - Copy contents of `supabase/migrations/20251108065317_*.sql`
   - Execute the SQL

3. **Set Up Storage Buckets** (Optional)
   - Create bucket for avatars: `avatars`
   - Create bucket for post images: `post-images`
   - Set appropriate permissions (public read)

4. **Configure Authentication**
   - Enable Email authentication
   - (Optional) Enable Google/GitHub OAuth

### Google Gemini AI Setup

1. **Get API Key**
   - Visit [Google AI Studio](https://makersuite.google.com/app/apikey)
   - Create new API key
   - Copy the key

2. **Add to Environment**
   ```env
   VITE_GEMINI_API_KEY=your_api_key_here
   ```

3. **Configure Quota**
   - Free tier: 60 requests/minute
   - Monitor usage in Google Cloud Console

### Environment Variables

Create `.env` file:

```env
# Supabase
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key

# Google Gemini AI
VITE_GEMINI_API_KEY=your-gemini-api-key

# Optional: Analytics
VITE_GA_TRACKING_ID=your-google-analytics-id
```

---

## 📜 Available Scripts

### Development
```bash
# Start development server with HMR
npm run dev

# Start on different port
npm run dev -- --port 3000
```

### Building
```bash
# Production build
npm run build

# Development build (with source maps)
npm run build:dev

# Preview production build locally
npm run preview
```

### Linting
```bash
# Run ESLint
npm run lint

# Fix auto-fixable issues
npm run lint -- --fix
```

### Type Checking
```bash
# Check TypeScript types
npx tsc --noEmit
```

---

## 🤝 Contributing

We welcome contributions! Here's how you can help:

### Getting Started
1. Fork the repository
2. Create a feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

### Code Style
- Follow TypeScript best practices
- Use functional components with hooks
- Write meaningful commit messages
- Add comments for complex logic
- Ensure all types are properly defined

### Areas for Contribution
- 🐛 **Bug Fixes**: Check issues labeled `bug`
- ✨ **New Features**: Implement features from roadmap
- 📖 **Documentation**: Improve README and code comments
- 🎨 **UI/UX**: Enhance design and user experience
- ⚡ **Performance**: Optimize rendering and queries
- 🧪 **Testing**: Add unit and integration tests

---

## 📚 Documentation

Additional documentation available:

- **[Event Matching System](./EVENT_MATCHING_SYSTEM.md)** - Detailed AI matching documentation
- **[Responsive Design Guide](./RESPONSIVE_DESIGN.md)** - Mobile/tablet/desktop breakpoints
- **[Database Migration Guide](./supabase/migrations/)** - Database setup instructions
- **[API Documentation](./docs/API.md)** - Backend endpoints and usage *(coming soon)*
- **[Component Library](./docs/COMPONENTS.md)** - UI component usage *(coming soon)*

---

## 🗺 Roadmap

### Version 1.0 (Current) ✅
- [x] Core authentication and authorization
- [x] User profiles with skills and interests
- [x] Project creation and management
- [x] Join request workflow
- [x] Campus feed with posts
- [x] Event discovery and registration
- [x] AI-powered teammate matching
- [x] Real-time notifications
- [x] Responsive design for all devices
- [x] Event-based collaboration matching

### Version 1.1 (Planned) 🚧
- [ ] Direct messaging between users
- [ ] Group chat for project teams
- [ ] Advanced search filters
- [ ] User reputation system
- [ ] Project analytics dashboard
- [ ] Email notifications
- [ ] Mobile app (React Native)

### Version 2.0 (Future) 🔮
- [ ] Video conferencing integration
- [ ] AI-powered project idea suggestions
- [ ] Mentor-mentee matching
- [ ] Achievement badges and gamification
- [ ] College leaderboards
- [ ] Integration with college LMS
- [ ] API for third-party integrations

---

## 🔒 Security

### Authentication
- Supabase Auth with JWT tokens
- Row-level security (RLS) policies
- Secure password hashing
- Session management

### Data Privacy
- User data encrypted at rest
- HTTPS-only communication
- GDPR-compliant data handling
- User consent for AI matching

### Best Practices
- Input validation and sanitization
- XSS protection
- CSRF token validation
- Rate limiting on API endpoints

---

## 🐛 Known Issues

- [ ] Mobile keyboard may overlap input fields on some devices
- [ ] Image upload size limited to 5MB
- [ ] Calendar view needs horizontal scroll on small screens
- [ ] Dark mode toggle not yet implemented

Report new issues on [GitHub Issues](https://github.com/SPB-6814/NIT-Goa-Hackathon/issues)

---

## 📄 License

This project is licensed under the **MIT License** - see the [LICENSE](LICENSE) file for details.

```
MIT License

Copyright (c) 2025 NIT Goa Hackathon Team

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT.
```

---

## 🙏 Acknowledgments

- **shadcn/ui** - Beautiful component library
- **Supabase** - Amazing backend platform
- **Google Gemini** - Powerful AI capabilities
- **Vercel** - Hosting and deployment
- **Unsplash** - Event poster images
- **Lucide Icons** - Beautiful icon set
- **NIT Goa** - Inspiration and support

---

## 👥 Team

**Project Lead & Developer**: [SPB-6814](https://github.com/SPB-6814)

Built with ❤️ for NIT Goa Hackathon 2025

---

## 📞 Contact & Support

- **GitHub Issues**: [Report bugs or request features](https://github.com/SPB-6814/NIT-Goa-Hackathon/issues)
- **Email**: support@campusconnect.edu *(if available)*
- **Discord**: Join our community *(coming soon)*

---

## 🌟 Star History

If you find this project useful, please consider giving it a ⭐ on GitHub!

---

<div align="center">

**Built with modern web technologies**

React • TypeScript • Vite • Supabase • Tailwind CSS • Gemini AI

**[⬆ Back to Top](#-campus-connect---nit-goa-hackathon-project)**

</div>
