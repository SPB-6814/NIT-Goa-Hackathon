import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { ProjectCard } from '@/components/ProjectCard';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { CheckCircle, XCircle, Clock, User } from 'lucide-react';
import { toast } from 'sonner';

interface Project {
  id: string;
  title: string;
  description: string;
  skills_needed: string[];
}

interface JoinRequest {
  id: string;
  project_id: string;
  user_id: string;
  message: string;
  status: 'pending' | 'approved' | 'rejected';
  created_at: string;
  profiles: {
    username: string;
    college: string;
    skills: string[];
  };
  projects: {
    title: string;
  };
}

export default function DashboardPage() {
  const { user } = useAuth();
  const [myProjects, setMyProjects] = useState<Project[]>([]);
  const [joinRequests, setJoinRequests] = useState<JoinRequest[]>([]);

  useEffect(() => {
    if (user) {
      fetchMyProjects();
      fetchJoinRequests();
    }
  }, [user]);

  const fetchMyProjects = async () => {
    const { data } = await supabase
      .from('projects')
      .select('*')
      .eq('owner_id', user?.id)
      .order('created_at', { ascending: false });

    setMyProjects(data || []);
  };

  const fetchJoinRequests = async () => {
    if (!user) return;

    // First get user's projects
    const { data: projects } = await supabase
      .from('projects' as any)
      .select('id')
      .eq('owner_id', user.id);

    if (!projects || projects.length === 0) {
      setJoinRequests([]);
      return;
    }

    const projectIds = projects.map((p: any) => p.id);

    // Then get join requests for those projects
    const { data, error } = await supabase
      .from('project_join_requests' as any)
      .select(`
        *,
        profiles!project_join_requests_user_id_fkey (username, college, skills),
        projects!project_join_requests_project_id_fkey (title)
      `)
      .in('project_id', projectIds)
      .eq('status', 'pending')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching join requests:', error);
      return;
    }

    setJoinRequests((data as any) || []);
  };

  const handleAcceptRequest = async (requestId: string) => {
    try {
      // Get request details first
      const { data: request, error: fetchError } = await supabase
        .from('join_requests')
        .select('project_id, user_id')
        .eq('id', requestId)
        .single();

      if (fetchError) throw fetchError;
      if (!request) throw new Error('Request not found');

      // Update request status to approved
      const { error: updateError } = await supabase
        .from('join_requests')
        .update({ status: 'approved' })
        .eq('id', requestId);

      if (updateError) throw updateError;

      // Add user to project_members table
      const { error: memberError } = await supabase
        .from('project_members')
        .insert({
          project_id: request.project_id,
          user_id: request.user_id,
        });

      if (memberError) {
        // If already a member, ignore the error
        if (memberError.code !== '23505') { // 23505 is duplicate key violation
          throw memberError;
        }
      }

      // Create notification for the user
      const { data: project, error: projectError } = await supabase
        .from('projects')
        .select('title')
        .eq('id', request.project_id)
        .single();

      if (!projectError && project) {
        await supabase
          .from('notifications')
          .insert({
            user_id: request.user_id,
            type: 'join_request_approved',
            title: 'Join Request Accepted!',
            message: `Your request to join "${project.title}" has been approved. You are now a collaborator!`,
            link: `/projects/${request.project_id}`,
            metadata: { projectId: request.project_id },
          });
      }

      toast.success('Request accepted! Member added to project.');
      fetchJoinRequests();
    } catch (error: any) {
      console.error('Error accepting request:', error);
      toast.error(error.message || 'Failed to accept request');
    }
  };

  const handleRejectRequest = async (requestId: string) => {
    try {
      const { error } = await (supabase.rpc as any)('reject_join_request', {
        request_id: requestId,
      });

      if (error) throw error;

      toast.success('Request rejected');
      fetchJoinRequests();
    } catch (error: any) {
      console.error('Error rejecting request:', error);
      toast.error(error.message || 'Failed to reject request');
    }
  };

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <h1 className="text-3xl font-bold mb-6">My Dashboard</h1>

      <Tabs defaultValue="projects">
        <TabsList>
          <TabsTrigger value="projects">My Projects</TabsTrigger>
          <TabsTrigger value="requests">
            Join Requests {joinRequests.length > 0 && `(${joinRequests.length})`}
          </TabsTrigger>
        </TabsList>

        <TabsContent value="projects">
          {myProjects.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              You haven't created any projects yet
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {myProjects.map((project) => (
                <ProjectCard key={project.id} {...project} />
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="requests">
          {joinRequests.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <Clock className="h-16 w-16 mx-auto mb-4 opacity-50" />
              <p className="text-lg">No pending join requests</p>
              <p className="text-sm mt-2">
                Requests to join your projects will appear here
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {joinRequests.map((request) => (
                <Card key={request.id} className="hover:shadow-md transition-shadow">
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-3">
                        <Avatar>
                          <AvatarFallback>
                            <User className="h-5 w-5" />
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <CardTitle className="text-lg">{request.profiles?.username}</CardTitle>
                          <p className="text-sm text-muted-foreground">
                            {request.profiles?.college}
                          </p>
                        </div>
                      </div>
                      <Badge variant="outline" className="gap-1">
                        <Clock className="h-3 w-3" />
                        Pending
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <p className="text-sm text-muted-foreground mb-1">
                        Requesting to join:
                      </p>
                      <p className="font-medium">{request.projects?.title}</p>
                    </div>

                    {request.message && (
                      <div>
                        <p className="text-sm text-muted-foreground mb-1">Message:</p>
                        <p className="text-sm bg-muted p-3 rounded-md">
                          {request.message}
                        </p>
                      </div>
                    )}

                    {request.profiles?.skills && request.profiles.skills.length > 0 && (
                      <div>
                        <p className="text-sm text-muted-foreground mb-2">Skills:</p>
                        <div className="flex flex-wrap gap-1.5">
                          {request.profiles.skills.map((skill: string) => (
                            <Badge key={skill} variant="secondary">
                              {skill}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    )}

                    <div className="flex gap-2 pt-2">
                      <Button
                        className="flex-1"
                        onClick={() => handleAcceptRequest(request.id)}
                      >
                        <CheckCircle className="h-4 w-4 mr-2" />
                        Accept
                      </Button>
                      <Button
                        className="flex-1"
                        variant="outline"
                        onClick={() => handleRejectRequest(request.id)}
                      >
                        <XCircle className="h-4 w-4 mr-2" />
                        Reject
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}