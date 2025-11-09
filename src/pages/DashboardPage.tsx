import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { ProjectCard } from '@/components/ProjectCard';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { CheckCircle, XCircle, Clock, User, FolderKanban } from 'lucide-react';
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
        .from('project_join_requests' as any)
        .select('project_id, user_id')
        .eq('id', requestId)
        .single();

      if (fetchError) throw fetchError;
      if (!request) throw new Error('Request not found');

      // Update request status to approved
      const { error: updateError } = await supabase
        .from('project_join_requests' as any)
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
      const { error } = await supabase
        .from('project_join_requests' as any)
        .update({ status: 'rejected' })
        .eq('id', requestId);

      if (error) throw error;

      toast.success('Request rejected');
      fetchJoinRequests();
    } catch (error: any) {
      console.error('Error rejecting request:', error);
      toast.error(error.message || 'Failed to reject request');
    }
  };

  return (
    <div className="p-3 sm:p-4 lg:p-6 max-w-7xl mx-auto">
      <h1 className="text-2xl sm:text-3xl font-bold mb-4 sm:mb-6">My Dashboard</h1>

      <Tabs defaultValue="projects">
        <TabsList className="w-full sm:w-auto">
          <TabsTrigger value="projects" className="flex-1 sm:flex-none">My Projects</TabsTrigger>
          <TabsTrigger value="requests" className="flex-1 sm:flex-none">
            Join Requests {joinRequests.length > 0 && `(${joinRequests.length})`}
          </TabsTrigger>
        </TabsList>

        <TabsContent value="projects" className="mt-4 sm:mt-6">
          {myProjects.length === 0 ? (
            <div className="text-center py-8 sm:py-12">
              <FolderKanban className="h-12 w-12 sm:h-16 sm:w-16 mx-auto text-muted-foreground mb-3 sm:mb-4 opacity-50" />
              <p className="text-muted-foreground text-sm sm:text-base">You haven't created any projects yet</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
              {myProjects.map((project) => (
                <ProjectCard 
                  key={project.id} 
                  id={project.id}
                  title={project.title}
                  description={project.description}
                  skills_needed={project.skills_needed}
                />
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="requests">
          {joinRequests.length === 0 ? (
            <div className="text-center py-8 sm:py-12 text-muted-foreground">
              <Clock className="h-12 w-12 sm:h-16 sm:w-16 mx-auto mb-3 sm:mb-4 opacity-50" />
              <p className="text-base sm:text-lg">No pending join requests</p>
              <p className="text-xs sm:text-sm mt-2">
                Requests to join your projects will appear here
              </p>
            </div>
          ) : (
            <div className="space-y-3 sm:space-y-4">
              {joinRequests.map((request) => (
                <Card key={request.id} className="hover:shadow-md transition-shadow">
                  <CardHeader className="p-4 sm:p-6">
                    <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
                      <div className="flex items-center gap-3">
                        <Avatar className="h-10 w-10 sm:h-12 sm:w-12">
                          <AvatarFallback>
                            <User className="h-4 w-4 sm:h-5 sm:w-5" />
                          </AvatarFallback>
                        </Avatar>
                        <div className="min-w-0 flex-1">
                          <CardTitle className="text-base sm:text-lg truncate">{request.profiles?.username}</CardTitle>
                          <p className="text-xs sm:text-sm text-muted-foreground truncate">
                            {request.profiles?.college}
                          </p>
                        </div>
                      </div>
                      <Badge variant="outline" className="gap-1 self-start">
                        <Clock className="h-3 w-3" />
                        Pending
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-3 sm:space-y-4 p-4 sm:p-6 pt-0">
                    <div>
                      <p className="text-xs sm:text-sm text-muted-foreground mb-1">
                        Requesting to join:
                      </p>
                      <p className="font-medium text-sm sm:text-base truncate">{request.projects?.title}</p>
                    </div>

                    {request.message && (
                      <div>
                        <p className="text-xs sm:text-sm text-muted-foreground mb-1">Message:</p>
                        <p className="text-xs sm:text-sm bg-muted p-2 sm:p-3 rounded-md line-clamp-3">
                          {request.message}
                        </p>
                      </div>
                    )}

                    {request.profiles?.skills && request.profiles.skills.length > 0 && (
                      <div>
                        <p className="text-xs sm:text-sm text-muted-foreground mb-2">Skills:</p>
                        <div className="flex flex-wrap gap-1 sm:gap-1.5">
                          {request.profiles.skills.map((skill: string) => (
                            <Badge key={skill} variant="secondary" className="text-xs">
                              {skill}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    )}

                    <div className="flex flex-col sm:flex-row gap-2 pt-2">
                      <Button
                        className="flex-1"
                        onClick={() => handleAcceptRequest(request.id)}
                        size="sm"
                      >
                        <CheckCircle className="h-4 w-4 mr-2" />
                        Accept
                      </Button>
                      <Button
                        className="flex-1"
                        variant="outline"
                        onClick={() => handleRejectRequest(request.id)}
                        size="sm"
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