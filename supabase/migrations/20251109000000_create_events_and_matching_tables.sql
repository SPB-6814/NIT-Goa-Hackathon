-- Create events table (if not exists)
CREATE TABLE IF NOT EXISTS public.events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  description text NOT NULL,
  event_date date NOT NULL,
  location text NOT NULL,
  event_type text NOT NULL,
  tags text[] DEFAULT '{}',
  poster_url text,
  registration_url text,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

-- Add missing columns to events table if they don't exist
ALTER TABLE public.events 
  ADD COLUMN IF NOT EXISTS tags text[] DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS poster_url text,
  ADD COLUMN IF NOT EXISTS registration_url text,
  ADD COLUMN IF NOT EXISTS created_at timestamp with time zone DEFAULT now(),
  ADD COLUMN IF NOT EXISTS updated_at timestamp with time zone DEFAULT now();

-- Enable RLS on events
ALTER TABLE public.events ENABLE ROW LEVEL SECURITY;

-- Events policies - everyone can view, only admins can create/edit
DROP POLICY IF EXISTS "Events are viewable by everyone" ON public.events;
CREATE POLICY "Events are viewable by everyone"
  ON public.events FOR SELECT
  USING (true);

DROP POLICY IF EXISTS "Authenticated users can create events" ON public.events;
CREATE POLICY "Authenticated users can create events"
  ON public.events FOR INSERT
  WITH CHECK (auth.role() = 'authenticated');

DROP POLICY IF EXISTS "Authenticated users can update events" ON public.events;
CREATE POLICY "Authenticated users can update events"
  ON public.events FOR UPDATE
  USING (auth.role() = 'authenticated');

-- Create event_interests table
CREATE TABLE IF NOT EXISTS public.event_interests (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id uuid REFERENCES public.events(id) ON DELETE CASCADE NOT NULL,
  user_id uuid REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  created_at timestamp with time zone DEFAULT now(),
  UNIQUE(event_id, user_id)
);

-- Enable RLS on event_interests
ALTER TABLE public.event_interests ENABLE ROW LEVEL SECURITY;

-- Event interests policies
DROP POLICY IF EXISTS "Event interests are viewable by everyone" ON public.event_interests;
CREATE POLICY "Event interests are viewable by everyone"
  ON public.event_interests FOR SELECT
  USING (true);

DROP POLICY IF EXISTS "Users can mark their own interests" ON public.event_interests;
CREATE POLICY "Users can mark their own interests"
  ON public.event_interests FOR INSERT
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can remove their own interests" ON public.event_interests;
CREATE POLICY "Users can remove their own interests"
  ON public.event_interests FOR DELETE
  USING (auth.uid() = user_id);

-- Create teammate_matches table
CREATE TABLE IF NOT EXISTS public.teammate_matches (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id uuid REFERENCES public.events(id) ON DELETE CASCADE NOT NULL,
  user1_id uuid REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  user2_id uuid REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  compatibility_score decimal(3,2) NOT NULL,
  matching_skills text[] DEFAULT '{}',
  matching_interests text[] DEFAULT '{}',
  ai_reasoning text,
  status text DEFAULT 'pending',
  created_at timestamp with time zone DEFAULT now(),
  UNIQUE(event_id, user1_id, user2_id)
);

-- Enable RLS on teammate_matches
ALTER TABLE public.teammate_matches ENABLE ROW LEVEL SECURITY;

-- Teammate matches policies
DROP POLICY IF EXISTS "Users can view their own matches" ON public.teammate_matches;
CREATE POLICY "Users can view their own matches"
  ON public.teammate_matches FOR SELECT
  USING (auth.uid() = user1_id OR auth.uid() = user2_id);

DROP POLICY IF EXISTS "System can create matches" ON public.teammate_matches;
CREATE POLICY "System can create matches"
  ON public.teammate_matches FOR INSERT
  WITH CHECK (true);

DROP POLICY IF EXISTS "Users can update their match status" ON public.teammate_matches;
CREATE POLICY "Users can update their match status"
  ON public.teammate_matches FOR UPDATE
  USING (auth.uid() = user1_id OR auth.uid() = user2_id);

-- Create notifications table
CREATE TABLE IF NOT EXISTS public.notifications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  type text NOT NULL,
  title text NOT NULL,
  message text NOT NULL,
  link text,
  metadata jsonb DEFAULT '{}',
  is_read boolean DEFAULT false,
  created_at timestamp with time zone DEFAULT now()
);

-- Enable RLS on notifications
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

-- Notifications policies
DROP POLICY IF EXISTS "Users can view their own notifications" ON public.notifications;
CREATE POLICY "Users can view their own notifications"
  ON public.notifications FOR SELECT
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "System can create notifications" ON public.notifications;
CREATE POLICY "System can create notifications"
  ON public.notifications FOR INSERT
  WITH CHECK (true);

DROP POLICY IF EXISTS "Users can update their own notifications" ON public.notifications;
CREATE POLICY "Users can update their own notifications"
  ON public.notifications FOR UPDATE
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can delete their own notifications" ON public.notifications;
CREATE POLICY "Users can delete their own notifications"
  ON public.notifications FOR DELETE
  USING (auth.uid() = user_id);

-- Enable realtime for notifications
DO $$
BEGIN
  ALTER PUBLICATION supabase_realtime ADD TABLE public.notifications;
EXCEPTION
  WHEN duplicate_object THEN
    NULL; -- Table already in publication
END $$;

-- Add missing columns to profiles table
ALTER TABLE public.profiles 
  ADD COLUMN IF NOT EXISTS full_name text,
  ADD COLUMN IF NOT EXISTS bio text,
  ADD COLUMN IF NOT EXISTS interests text[] DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS experience text,
  ADD COLUMN IF NOT EXISTS avatar_url text;

-- Create posts table
CREATE TABLE IF NOT EXISTS public.posts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  content text NOT NULL,
  images text[] DEFAULT '{}',
  tags text[] DEFAULT '{}',
  likes_count integer DEFAULT 0,
  comments_count integer DEFAULT 0,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

-- Enable RLS on posts
ALTER TABLE public.posts ENABLE ROW LEVEL SECURITY;

-- Posts policies
DROP POLICY IF EXISTS "Posts are viewable by everyone" ON public.posts;
CREATE POLICY "Posts are viewable by everyone"
  ON public.posts FOR SELECT
  USING (true);

DROP POLICY IF EXISTS "Authenticated users can create posts" ON public.posts;
CREATE POLICY "Authenticated users can create posts"
  ON public.posts FOR INSERT
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update their own posts" ON public.posts;
CREATE POLICY "Users can update their own posts"
  ON public.posts FOR UPDATE
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can delete their own posts" ON public.posts;
CREATE POLICY "Users can delete their own posts"
  ON public.posts FOR DELETE
  USING (auth.uid() = user_id);

-- Add tags column to projects table if it doesn't exist
ALTER TABLE public.projects 
  ADD COLUMN IF NOT EXISTS tags text[] DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS github_url text,
  ADD COLUMN IF NOT EXISTS demo_url text,
  ADD COLUMN IF NOT EXISTS image_url text;

-- Insert hardcoded events from EventsPage.tsx
INSERT INTO public.events (id, title, description, event_date, location, event_type, tags, poster_url, registration_url) VALUES
  ('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'HackNIT 2025', 'Annual hackathon bringing together the brightest minds to solve real-world problems', '2025-11-15', 'NIT Goa Campus', 'hackathon', ARRAY['Technical', 'Competition'], 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=600&h=800&fit=crop', 'https://example.com/register/hacknit2025'),
  ('b1eebc99-9c0b-4ef8-bb6d-6bb9bd380a22', 'AI/ML Workshop Series', 'Hands-on workshop covering latest trends in artificial intelligence and machine learning', '2025-11-20', 'Computer Lab, Block A', 'workshop', ARRAY['Technical', 'Workshop', 'Academic'], 'https://images.unsplash.com/photo-1677442136019-21780ecad995?w=600&h=800&fit=crop', 'https://example.com/register/aiml-workshop'),
  ('c2eebc99-9c0b-4ef8-bb6d-6bb9bd380a33', 'Code Sprint Championship', 'Competitive programming competition with exciting prizes and challenges', '2025-11-22', 'Auditorium Hall', 'competition', ARRAY['Technical', 'Competition'], 'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=600&h=800&fit=crop', 'https://example.com/register/code-sprint'),
  ('d3eebc99-9c0b-4ef8-bb6d-6bb9bd380a44', 'Tech Confluence 2025', 'Annual tech conference featuring industry leaders and innovative startups', '2025-11-25', 'Convention Center', 'conference', ARRAY['Technical', 'Academic'], 'https://images.unsplash.com/photo-1505373877841-8d25f7d46678?w=600&h=800&fit=crop', 'https://example.com/register/tech-confluence'),
  ('e4eebc99-9c0b-4ef8-bb6d-6bb9bd380a55', 'Web Development Bootcamp', 'Intensive 3-day bootcamp on modern web development frameworks and best practices', '2025-11-28', 'Lab 201, IT Block', 'workshop', ARRAY['Technical', 'Workshop'], 'https://images.unsplash.com/photo-1498050108023-c5249f4df085?w=600&h=800&fit=crop', 'https://example.com/register/webdev-bootcamp'),
  ('f5eebc99-9c0b-4ef8-bb6d-6bb9bd380a66', 'Innovation Challenge 2025', 'Showcase your innovative ideas and compete for funding and mentorship opportunities', '2025-12-05', 'Innovation Hub', 'competition', ARRAY['Technical', 'Competition'], 'https://images.unsplash.com/photo-1519389950473-47ba0277781c?w=600&h=800&fit=crop', 'https://example.com/register/innovation-challenge')
ON CONFLICT (id) DO NOTHING;
