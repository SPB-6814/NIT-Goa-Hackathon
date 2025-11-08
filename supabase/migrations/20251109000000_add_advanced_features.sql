-- Add comprehensive features for posts, events, projects, and AI matching
-- Migration: 20251109000000_add_advanced_features.sql

-- ==========================================
-- 1. ADD TAGS TO POSTS
-- ==========================================
ALTER TABLE public.posts 
  ADD COLUMN IF NOT EXISTS tags text[] DEFAULT '{}';

CREATE INDEX IF NOT EXISTS idx_posts_tags ON public.posts USING GIN(tags);

COMMENT ON COLUMN public.posts.tags IS 'Array of tags for categorization (Technical, Cultural, etc.)';

-- ==========================================
-- 2. ADD TAGS TO EVENTS  
-- ==========================================
ALTER TABLE public.events
  ADD COLUMN IF NOT EXISTS tags text[] DEFAULT '{}';

CREATE INDEX IF NOT EXISTS idx_events_tags ON public.events USING GIN(tags);

COMMENT ON COLUMN public.events.tags IS 'Array of tags for categorization (Technical, Cultural, etc.)';

-- ==========================================
-- 3. EVENT INTERESTS TRACKING
-- ==========================================
CREATE TABLE IF NOT EXISTS public.event_interests (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id uuid REFERENCES public.events(id) ON DELETE CASCADE NOT NULL,
  user_id uuid REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  created_at timestamptz DEFAULT now(),
  UNIQUE(event_id, user_id)
);

CREATE INDEX IF NOT EXISTS idx_event_interests_event ON public.event_interests(event_id);
CREATE INDEX IF NOT EXISTS idx_event_interests_user ON public.event_interests(user_id);

-- Enable RLS
ALTER TABLE public.event_interests ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Anyone can view event interests" ON public.event_interests;
DROP POLICY IF EXISTS "Authenticated users can mark interest" ON public.event_interests;
DROP POLICY IF EXISTS "Users can remove their interest" ON public.event_interests;

-- Create policies
CREATE POLICY "Anyone can view event interests"
  ON public.event_interests FOR SELECT
  USING (true);

CREATE POLICY "Authenticated users can mark interest"
  ON public.event_interests FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can remove their interest"
  ON public.event_interests FOR DELETE
  USING (auth.uid() = user_id);

-- ==========================================
-- 4. PROJECT JOIN REQUESTS
-- ==========================================
CREATE TABLE IF NOT EXISTS public.project_join_requests (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id uuid REFERENCES public.projects(id) ON DELETE CASCADE NOT NULL,
  user_id uuid REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  message text,
  status text DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  reviewed_by uuid REFERENCES public.profiles(id),
  reviewed_at timestamptz,
  UNIQUE(project_id, user_id)
);

CREATE INDEX IF NOT EXISTS idx_join_requests_project ON public.project_join_requests(project_id);
CREATE INDEX IF NOT EXISTS idx_join_requests_user ON public.project_join_requests(user_id);
CREATE INDEX IF NOT EXISTS idx_join_requests_status ON public.project_join_requests(status);

-- Enable RLS
ALTER TABLE public.project_join_requests ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Users can view requests for their projects" ON public.project_join_requests;
DROP POLICY IF EXISTS "Authenticated users can create join requests" ON public.project_join_requests;
DROP POLICY IF EXISTS "Project owners can update request status" ON public.project_join_requests;

-- Create policies
CREATE POLICY "Users can view requests for their projects"
  ON public.project_join_requests FOR SELECT
  USING (
    -- Project owner can see all requests for their project
    project_id IN (
      SELECT id FROM public.projects WHERE owner_id = auth.uid()
    )
    OR
    -- Users can see their own requests
    user_id = auth.uid()
  );

CREATE POLICY "Authenticated users can create join requests"
  ON public.project_join_requests FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Project owners can update request status"
  ON public.project_join_requests FOR UPDATE
  USING (
    project_id IN (
      SELECT id FROM public.projects WHERE owner_id = auth.uid()
    )
  );

-- ==========================================
-- 5. NOTIFICATIONS SYSTEM
-- ==========================================
CREATE TABLE IF NOT EXISTS public.notifications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  type text NOT NULL, -- 'teammate_match', 'join_request', 'request_approved', etc.
  title text NOT NULL,
  message text NOT NULL,
  data jsonb, -- Additional data (user ids, project ids, etc.)
  is_read boolean DEFAULT false,
  created_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_notifications_user ON public.notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_read ON public.notifications(is_read);
CREATE INDEX IF NOT EXISTS idx_notifications_created ON public.notifications(created_at DESC);

-- Enable RLS
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Users can view their own notifications" ON public.notifications;
DROP POLICY IF EXISTS "Users can update their own notifications" ON public.notifications;
DROP POLICY IF EXISTS "System can create notifications" ON public.notifications;

-- Create policies
CREATE POLICY "Users can view their own notifications"
  ON public.notifications FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own notifications"
  ON public.notifications FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "System can create notifications"
  ON public.notifications FOR INSERT
  WITH CHECK (true);

-- ==========================================
-- 6. TEAMMATE MATCHES (AI-powered)
-- ==========================================
CREATE TABLE IF NOT EXISTS public.teammate_matches (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id uuid REFERENCES public.events(id) ON DELETE CASCADE NOT NULL,
  user1_id uuid REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  user2_id uuid REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  match_score decimal(3,2), -- 0.00 to 1.00
  matching_skills text[],
  matching_interests text[],
  ai_reasoning text, -- AI-generated explanation
  status text DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'rejected')),
  created_at timestamptz DEFAULT now(),
  UNIQUE(event_id, user1_id, user2_id)
);

CREATE INDEX IF NOT EXISTS idx_teammate_matches_event ON public.teammate_matches(event_id);
CREATE INDEX IF NOT EXISTS idx_teammate_matches_user1 ON public.teammate_matches(user1_id);
CREATE INDEX IF NOT EXISTS idx_teammate_matches_user2 ON public.teammate_matches(user2_id);
CREATE INDEX IF NOT EXISTS idx_teammate_matches_score ON public.teammate_matches(match_score DESC);

-- Enable RLS
ALTER TABLE public.teammate_matches ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Users can view their own matches" ON public.teammate_matches;
DROP POLICY IF EXISTS "System can create matches" ON public.teammate_matches;
DROP POLICY IF EXISTS "Users can update match status" ON public.teammate_matches;

-- Create policies
CREATE POLICY "Users can view their own matches"
  ON public.teammate_matches FOR SELECT
  USING (auth.uid() = user1_id OR auth.uid() = user2_id);

CREATE POLICY "System can create matches"
  ON public.teammate_matches FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Users can update match status"
  ON public.teammate_matches FOR UPDATE
  USING (auth.uid() = user1_id OR auth.uid() = user2_id);

-- ==========================================
-- 7. HELPER FUNCTIONS
-- ==========================================

-- Function to approve join request and add member to project
CREATE OR REPLACE FUNCTION approve_join_request(request_id uuid)
RETURNS void AS $$
DECLARE
  req_record RECORD;
BEGIN
  -- Get request details
  SELECT * INTO req_record FROM public.project_join_requests WHERE id = request_id;
  
  IF req_record IS NULL THEN
    RAISE EXCEPTION 'Request not found';
  END IF;
  
  -- Update request status
  UPDATE public.project_join_requests
  SET 
    status = 'approved',
    reviewed_by = auth.uid(),
    reviewed_at = now(),
    updated_at = now()
  WHERE id = request_id;
  
  -- Add user to project members
  INSERT INTO public.project_members (project_id, user_id)
  VALUES (req_record.project_id, req_record.user_id)
  ON CONFLICT (project_id, user_id) DO NOTHING;
  
  -- Create notification for requester
  INSERT INTO public.notifications (user_id, type, title, message, data)
  VALUES (
    req_record.user_id,
    'request_approved',
    'Join Request Approved!',
    'Your request to join the project has been approved.',
    jsonb_build_object('project_id', req_record.project_id, 'request_id', request_id)
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to reject join request
CREATE OR REPLACE FUNCTION reject_join_request(request_id uuid)
RETURNS void AS $$
BEGIN
  UPDATE public.project_join_requests
  SET 
    status = 'rejected',
    reviewed_by = auth.uid(),
    reviewed_at = now(),
    updated_at = now()
  WHERE id = request_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant permissions
GRANT EXECUTE ON FUNCTION approve_join_request(uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION reject_join_request(uuid) TO authenticated;

-- ==========================================
-- 8. REALTIME SUBSCRIPTIONS
-- ==========================================
-- Note: Tables may already be in publication, so we'll handle errors gracefully
DO $$
BEGIN
  -- Add event_interests to realtime
  BEGIN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.event_interests;
  EXCEPTION
    WHEN duplicate_object THEN
      NULL; -- Table already in publication, ignore
  END;

  -- Add project_join_requests to realtime
  BEGIN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.project_join_requests;
  EXCEPTION
    WHEN duplicate_object THEN
      NULL; -- Table already in publication, ignore
  END;

  -- Add notifications to realtime
  BEGIN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.notifications;
  EXCEPTION
    WHEN duplicate_object THEN
      NULL; -- Table already in publication, ignore
  END;

  -- Add teammate_matches to realtime
  BEGIN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.teammate_matches;
  EXCEPTION
    WHEN duplicate_object THEN
      NULL; -- Table already in publication, ignore
  END;
END $$;

-- ==========================================
-- 9. COMMENTS
-- ==========================================
COMMENT ON TABLE public.event_interests IS 'Tracks which users are interested in which events';
COMMENT ON TABLE public.project_join_requests IS 'Join requests for projects looking for collaborators';
COMMENT ON TABLE public.notifications IS 'User notifications for various events';
COMMENT ON TABLE public.teammate_matches IS 'AI-powered teammate matching for events';
COMMENT ON FUNCTION approve_join_request IS 'Approves a join request and adds user to project';
COMMENT ON FUNCTION reject_join_request IS 'Rejects a join request';
