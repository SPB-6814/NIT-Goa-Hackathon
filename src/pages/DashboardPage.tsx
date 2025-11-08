import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { ProjectCard } from '@/components/ProjectCard';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
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
    const { data } = await supabase
      .from('join_requests')
      .select(`
        *,
        profiles(*),
        projects(title)
      `)
      .in('project_id', myProjects.map(p => p.id));

    setJoinRequests(data || []);
  };

  const handleAcceptRequest = async (requestId: string, projectId: string, userId: string) => {
    try {
      await supabase.from('project_members').insert({
        project_id: projectId,
        user_id: userId,
      });

      await supabase.from('join_requests').delete().eq('id', requestId);

      toast.success('Request accepted!');
      fetchJoinRequests();
    } catch (error: any) {
      toast.error(error.message || 'Failed to accept request');
    }
  };

  const handleRejectRequest = async (requestId: string) => {
    try {
      await supabase.from('join_requests').delete().eq('id', requestId);
      toast.success('Request rejected');
      fetchJoinRequests();
    } catch (error: any) {
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
              No pending join requests
            </div>
          ) : (
            <div className="space-y-4">
              {joinRequests.map((request) => (
                <Card key={request.id}>
                  <CardContent className="pt-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-semibold">{request.profiles.username}</p>
                        <p className="text-sm text-muted-foreground">
                          {request.profiles.college}
                        </p>
                        <p className="text-sm mt-2">
                          wants to join <span className="font-medium">{request.projects.title}</span>
                        </p>
                        <div className="flex flex-wrap gap-1 mt-2">
                          {request.profiles.skills?.map((skill) => (
                            <span
                              key={skill}
                              className="text-xs bg-secondary px-2 py-1 rounded"
                            >
                              {skill}
                            </span>
                          ))}
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          onClick={() =>
                            handleAcceptRequest(
                              request.id,
                              request.project_id,
                              request.user_id
                            )
                          }
                        >
                          Accept
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleRejectRequest(request.id)}
                        >
                          Reject
                        </Button>
                      </div>
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