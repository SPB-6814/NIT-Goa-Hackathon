import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';
import { useAuth } from '@/contexts/AuthContext';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ChatBox } from '@/components/ChatBox';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { formatDistanceToNow } from 'date-fns';

interface Project {
  id: string;
  title: string;
  description: string;
  skills_needed: string[];
  owner_id: string;
  created_at: string;
}

interface Profile {
  id: string;
  username: string;
  college: string;
}

interface Comment {
  id: string;
  content: string;
  created_at: string;
  profiles: Profile;
}

export default function ProjectDetailPage() {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const [project, setProject] = useState<Project | null>(null);
  const [owner, setOwner] = useState<Profile | null>(null);
  const [comments, setComments] = useState<Comment[]>([]);
  const [newComment, setNewComment] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [hasRequested, setHasRequested] = useState(false);
  const [isMember, setIsMember] = useState(false);

  useEffect(() => {
    if (id) {
      fetchProjectDetails();
      checkMembershipStatus();
    }
  }, [id, user]);

  const fetchProjectDetails = async () => {
    try {
      const { data: projectData, error: projectError } = await supabase
        .from('projects')
        .select('*')
        .eq('id', id)
        .single();

      if (projectError) throw projectError;
      setProject(projectData);

      const { data: ownerData } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', projectData.owner_id)
        .single();

      setOwner(ownerData);

      const { data: commentsData } = await supabase
        .from('comments')
        .select('*, profiles(*)')
        .eq('project_id', id)
        .order('created_at', { ascending: false });

      setComments(commentsData || []);

      if (user) {
        const { data: requestData } = await supabase
          .from('project_join_requests' as any)
          .select('*')
          .eq('project_id', id)
          .eq('user_id', user.id)
          .single();

        setHasRequested(!!requestData);
      }
    } catch (error) {
      console.error('Error fetching project:', error);
      toast.error('Failed to load project');
    } finally {
      setIsLoading(false);
    }
  };

  const checkMembershipStatus = async () => {
    if (!user || !id) return;

    const { data } = await supabase
      .from('project_members')
      .select('*')
      .eq('project_id', id)
      .eq('user_id', user.id)
      .single();

    setIsMember(!!data || project?.owner_id === user.id);
  };

  const handleJoinRequest = async () => {
    if (!user || !id) return;

    try {
      // First, check if a request already exists
      const { data: existingRequest } = await supabase
        .from('project_join_requests' as any)
        .select('*')
        .eq('project_id', id)
        .eq('user_id', user.id)
        .single();

      if (existingRequest) {
        // If request exists and is pending
        if (existingRequest.status === 'pending') {
          toast.info('You have already sent a join request for this project');
          setHasRequested(true);
          return;
        }
        // If request was rejected, allow them to try again by updating the existing request
        if (existingRequest.status === 'rejected') {
          const { error: updateError } = await supabase
            .from('project_join_requests' as any)
            .update({ 
              status: 'pending',
              created_at: new Date().toISOString()
            })
            .eq('id', existingRequest.id);

          if (updateError) throw updateError;

          toast.success('Join request re-sent!');
          setHasRequested(true);
          return;
        }
        // If already approved
        if (existingRequest.status === 'approved') {
          toast.info('Your request has already been approved');
          setHasRequested(true);
          return;
        }
      }

      // No existing request, create new one
      const { error } = await supabase
        .from('project_join_requests' as any)
        .insert({
          project_id: id,
          user_id: user.id,
        });

      if (error) {
        // Handle duplicate key error gracefully (race condition)
        if (error.code === '23505') {
          toast.info('You have already sent a join request for this project');
          setHasRequested(true);
          return;
        }
        throw error;
      }

      toast.success('Join request sent!');
      setHasRequested(true);
    } catch (error: any) {
      console.error('Join request error:', error);
      toast.error(error.message || 'Failed to send request');
    }
  };

  const handlePostComment = async () => {
    if (!user || !newComment.trim()) return;

    try {
      const { error } = await supabase
        .from('comments')
        .insert({
          content: newComment,
          project_id: id,
          user_id: user.id,
        });

      if (error) throw error;

      toast.success('Comment posted!');
      setNewComment('');
      fetchProjectDetails();
    } catch (error: any) {
      toast.error(error.message || 'Failed to post comment');
    }
  };

  if (isLoading) {
    return <div className="p-6 text-center">Loading...</div>;
  }

  if (!project) {
    return <div className="p-6 text-center">Project not found</div>;
  }

  const isOwner = user?.id === project.owner_id;

  return (
    <div className="p-6 max-w-5xl mx-auto">
      <Card>
        <CardContent className="pt-6">
          <div className="mb-6">
            <h1 className="text-3xl font-bold mb-2">{project.title}</h1>
            <p className="text-muted-foreground mb-4">{project.description}</p>
            
            <div className="flex flex-wrap gap-2 mb-4">
              {project.skills_needed.map((skill) => (
                <Badge key={skill} variant="secondary">
                  {skill}
                </Badge>
              ))}
            </div>

            {owner && (
              <p className="text-sm text-muted-foreground">
                By {owner.username} {owner.college && `• ${owner.college}`}
              </p>
            )}
          </div>

          {!isOwner && !isMember && (
            <Button
              onClick={handleJoinRequest}
              disabled={hasRequested}
              className="mb-6"
            >
              {hasRequested ? 'Request Sent' : 'Request to Join'}
            </Button>
          )}

          <Tabs defaultValue="comments">
            <TabsList>
              <TabsTrigger value="comments">Comments</TabsTrigger>
              {(isMember || isOwner) && (
                <TabsTrigger value="chat">Team Chat</TabsTrigger>
              )}
            </TabsList>

            <TabsContent value="comments" className="space-y-4">
              <div>
                <Textarea
                  placeholder="Add a comment..."
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  rows={3}
                />
                <Button onClick={handlePostComment} className="mt-2">
                  Post Comment
                </Button>
              </div>

              <div className="space-y-4">
                {comments.map((comment) => (
                  <Card key={comment.id}>
                    <CardContent className="pt-4">
                      <div className="flex items-start gap-3">
                        <Avatar>
                          <AvatarFallback>
                            {comment.profiles.username[0].toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="font-semibold">{comment.profiles.username}</span>
                            <span className="text-xs text-muted-foreground">
                              {formatDistanceToNow(new Date(comment.created_at), { addSuffix: true })}
                            </span>
                          </div>
                          <p className="text-sm">{comment.content}</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>

            {(isMember || isOwner) && id && (
              <TabsContent value="chat">
                <ChatBox projectId={id} />
              </TabsContent>
            )}
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}