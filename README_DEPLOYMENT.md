# 🎓 NIT Goa Hackathon Platform

A modern, feature-rich campus collaboration platform built for NIT Goa students to connect, collaborate, and create together.

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/YOUR_USERNAME/NIT-Goa-Hackathon)

## ✨ Features

### 🤝 Collaboration
- **Project Management** - Create, manage, and collaborate on projects
- **Team Building** - AI-powered teammate matching for events
- **Real-time Messaging** - Chat with fellow students
- **Join Requests** - Manage project collaboration requests

### 📱 Social Features
- **Campus Feed** - Share updates, thoughts, and achievements
- **Events Hub** - Discover and participate in campus events
- **User Profiles** - Showcase your skills and interests
- **Notifications** - Stay updated with real-time alerts

### 🤖 AI-Powered
- **Smart Teammate Matching** - Google Gemini AI analyzes compatibility based on skills and interests
- **Intelligent Notifications** - Get notified about perfect matches for event collaboration

### 🎨 Modern UI/UX
- **Responsive Design** - Works seamlessly on desktop, tablet, and mobile
- **Dark/Light Mode** - Choose your preferred theme
- **Intuitive Navigation** - Easy-to-use sidebar and navigation
- **Beautiful Components** - Built with shadcn/ui

## 🚀 Tech Stack

### Frontend
- **React 18** - Modern React with hooks
- **TypeScript** - Type-safe development
- **Vite** - Lightning-fast build tool
- **Tailwind CSS** - Utility-first styling
- **shadcn/ui** - High-quality component library
- **React Router** - Client-side routing
- **Tanstack Query** - Data fetching and caching

### Backend & Database
- **Supabase** - Backend as a Service
  - PostgreSQL database
  - Real-time subscriptions
  - Authentication
  - Storage (images, files)
  - Row Level Security (RLS)

### AI & External Services
- **Google Gemini Pro** - AI-powered teammate matching
- **Leaflet** - Interactive maps for events

## 📋 Prerequisites

- Node.js 18+ and npm
- Supabase account
- Google Gemini API key

## 🛠️ Installation

### 1. Clone the repository

```bash
git clone https://github.com/YOUR_USERNAME/NIT-Goa-Hackathon.git
cd NIT-Goa-Hackathon
```

### 2. Install dependencies

```bash
npm install
```

### 3. Set up environment variables

Create a `.env` file in the root directory:

```env
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_PUBLISHABLE_KEY=your_supabase_anon_key
VITE_SUPABASE_PROJECT_ID=your_project_id
VITE_GEMINI_API_KEY=your_gemini_api_key
```

### 4. Set up Supabase

1. Create a new Supabase project at [supabase.com](https://supabase.com)
2. Run the migrations in the `supabase/migrations` folder
3. Set up storage buckets:
   - `avatars`
   - `post-images`
   - `project-images`
   - `message-attachments`

### 5. Run the development server

```bash
npm run dev
```

Visit [http://localhost:8080](http://localhost:8080)

## 📦 Build for Production

```bash
npm run build
npm run preview
```

## 🚀 Deploy to Vercel

### Quick Deploy

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/YOUR_USERNAME/NIT-Goa-Hackathon)

### Manual Deploy

1. Push your code to GitHub
2. Go to [vercel.com](https://vercel.com)
3. Click "Import Project"
4. Select your repository
5. Add environment variables
6. Click "Deploy"

**Full deployment guide:** [DEPLOYMENT_GUIDE.md](./DEPLOYMENT_GUIDE.md)

## 📚 Documentation

- [Deployment Guide](./DEPLOYMENT_GUIDE.md) - Complete guide to deploying on Vercel
- [Pre-Deployment Checklist](./PRE_DEPLOYMENT_CHECKLIST.md) - Ensure everything is ready
- [AI Matching Implementation](./AI_MATCHING_IMPLEMENTATION.md) - Technical details
- [AI Matching Quickstart](./AI_MATCHING_QUICKSTART.md) - User guide
- [Project Collaboration Guide](./PROJECT_COLLABORATION_GUIDE.md) - How to use collaboration features
- [Filters Implementation](./FILTERS_IMPLEMENTATION.md) - Filtering system details

## 🗂️ Project Structure

```
NIT-Goa-Hackathon/
├── src/
│   ├── components/          # Reusable React components
│   │   ├── ui/             # shadcn/ui components
│   │   └── layout/         # Layout components
│   ├── pages/              # Page components
│   ├── contexts/           # React contexts (Auth, etc.)
│   ├── hooks/              # Custom React hooks
│   ├── integrations/       # External integrations (Supabase)
│   ├── lib/                # Utility functions
│   └── services/           # Business logic (AI matching)
├── supabase/
│   ├── migrations/         # Database migrations
│   └── config.toml         # Supabase config
├── public/                 # Static assets
└── docs/                   # Documentation
```

## 🔑 Key Features Explained

### AI Teammate Matching

When multiple users mark interest in an event, our AI analyzes:
- Skills and technical expertise
- Interests and hobbies
- Experience levels
- Availability

The Google Gemini Pro AI generates compatibility scores and personalized reasoning for each match, helping students find the perfect collaborators.

### Real-time Updates

Using Supabase's real-time capabilities:
- Instant message delivery
- Live notification updates
- Real-time match alerts
- Dynamic feed updates

### Secure by Default

- Row Level Security (RLS) on all database tables
- Authentication required for sensitive operations
- Environment variables for API keys
- HTTPS enforced in production

## 🤝 Contributing

Contributions are welcome! Please follow these steps:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📝 Environment Variables

| Variable | Description | Required |
|----------|-------------|----------|
| `VITE_SUPABASE_URL` | Your Supabase project URL | ✅ |
| `VITE_SUPABASE_PUBLISHABLE_KEY` | Supabase anonymous key | ✅ |
| `VITE_SUPABASE_PROJECT_ID` | Supabase project ID | ✅ |
| `VITE_GEMINI_API_KEY` | Google Gemini API key | ✅ |

## 🐛 Troubleshooting

### Build fails
- Ensure all dependencies are installed: `npm install`
- Check for TypeScript errors: `npm run lint`
- Verify environment variables are set

### Supabase connection issues
- Verify your Supabase project is active
- Check environment variables are correct
- Ensure RLS policies allow access

### AI matching not working
- Verify Gemini API key is valid
- Check browser console for errors
- Ensure users have filled skills/interests in profile

## 📄 License

This project is licensed under the MIT License.

## 👥 Authors

- **Your Name** - Initial work - [Your GitHub](https://github.com/YOUR_USERNAME)

## 🙏 Acknowledgments

- NIT Goa community
- shadcn/ui for beautiful components
- Supabase for amazing backend services
- Google Gemini for AI capabilities

## 📧 Contact

For questions or support, reach out to:
- Email: your.email@example.com
- GitHub Issues: [Create an issue](https://github.com/YOUR_USERNAME/NIT-Goa-Hackathon/issues)

---

**Built with ❤️ for NIT Goa Hackathon**

⭐ Star this repo if you find it helpful!
