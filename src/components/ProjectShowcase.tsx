import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Users, Briefcase, Send, CheckCircle } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';

interface Project {
  id: string;
  title: string;
  description: string;
  skills_needed: string[];
  owner_id: string;
  created_at: string;
  profiles: {
    username: string;
    college: string;
  };
  member_count?: number;
  has_requested?: boolean;
}

export const ProjectShowcase = () => {
  const [projects, setProjects] = useState<Project[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [requestMessage, setRequestMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { user } = useAuth();
  const { toast } = useToast();

  useEffect(() => {
    fetchProjects();
  }, [user]);

  const fetchProjects = async () => {
    if (!user) return;

    try {
      setIsLoading(true);

      // Fetch projects that are not owned by current user
      const { data: projectsData, error: projectsError } = await supabase
        .from('projects' as any)
        .select(`
          *,
          profiles!projects_owner_id_fkey (username, college)
        `)
        .neq('owner_id', user.id)
        .order('created_at', { ascending: false })
        .limit(6);

      if (projectsError) throw projectsError;

      if (!projectsData || projectsData.length === 0) {
        setProjects([]);
        setIsLoading(false);
        return;
      }

      // Fetch member counts for each project
      const projectIds = projectsData.map((p: any) => p.id);
      const { data: membersData } = await supabase
        .from('project_members' as any)
        .select('project_id')
        .in('project_id', projectIds);

      // Fetch existing join requests for current user
      const { data: requestsData } = await supabase
        .from('project_join_requests' as any)
        .select('project_id, status')
        .eq('user_id', user.id)
        .in('project_id', projectIds);

      // Count members per project
      const memberCounts = membersData?.reduce((acc: any, member: any) => {
        acc[member.project_id] = (acc[member.project_id] || 0) + 1;
        return acc;
      }, {}) || {};

      // Map requests to projects
      const requestsMap = requestsData?.reduce((acc: any, req: any) => {
        acc[req.project_id] = req.status;
        return acc;
      }, {}) || {};

      const enrichedProjects = projectsData.map((project: any) => ({
        ...project,
        member_count: memberCounts[project.id] || 0,
        has_requested: requestsMap[project.id] === 'pending' || requestsMap[project.id] === 'approved',
      }));

      setProjects(enrichedProjects);
    } catch (error) {
      console.error('Error fetching projects:', error);
      toast({
        title: 'Error',
        description: 'Failed to load projects',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleRequestToJoin = async () => {
    if (!selectedProject || !user) return;

    setIsSubmitting(true);
    try {
      const { error } = await supabase
        .from('project_join_requests' as any)
        .insert({
          project_id: selectedProject.id,
          user_id: user.id,
          message: requestMessage,
          status: 'pending',
        });

      if (error) throw error;

      toast({
        title: 'Request Sent!',
        description: 'Your join request has been sent to the project owner.',
      });

      setSelectedProject(null);
      setRequestMessage('');
      fetchProjects(); // Refresh to update button states
    } catch (error: any) {
      console.error('Error sending join request:', error);
      toast({
        title: 'Error',
        description: error.message || 'Failed to send join request',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="text-center py-8">
        <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-primary border-t-transparent"></div>
      </div>
    );
  }

  if (projects.length === 0) {
    return (
      <div className="text-center py-8">
        <Briefcase className="h-12 w-12 text-muted-foreground mx-auto mb-3 opacity-50" />
        <p className="text-muted-foreground">No projects looking for collaborators</p>
      </div>
    );
  }

  return (
    <>
      <div className="space-y-4">
        {projects.map((project) => (
          <Card key={project.id} className="flex flex-col hover:shadow-lg transition-shadow">
            <CardHeader className="pb-3">
              <CardTitle className="text-base md:text-lg line-clamp-1">{project.title}</CardTitle>
              <CardDescription className="line-clamp-2 text-sm">{project.description}</CardDescription>
            </CardHeader>
            <CardContent className="flex-1 pb-3">
              <div className="space-y-3">
                <div>
                  <p className="text-xs text-muted-foreground mb-1.5">Skills Needed:</p>
                  <div className="flex flex-wrap gap-1">
                    {project.skills_needed.slice(0, 3).map((skill, idx) => (
                      <Badge key={idx} variant="secondary" className="text-xs px-1.5 py-0.5">
                        {skill}
                      </Badge>
                    ))}
                    {project.skills_needed.length > 3 && (
                      <Badge variant="outline" className="text-xs px-1.5 py-0.5">
                        +{project.skills_needed.length - 3}
                      </Badge>
                    )}
                  </div>
                </div>
                <div className="flex items-center justify-between text-xs text-muted-foreground">
                  <div className="flex items-center gap-1.5">
                    <Users className="h-3.5 w-3.5" />
                    <span>{project.member_count} member{project.member_count !== 1 ? 's' : ''}</span>
                  </div>
                  <div>
                    by <span className="font-medium">{project.profiles?.username}</span>
                  </div>
                </div>
              </div>
            </CardContent>
            <CardFooter className="pt-0">
              {project.has_requested ? (
                <Button disabled className="w-full text-sm" size="sm" variant="outline">
                  <CheckCircle className="h-3.5 w-3.5 mr-1.5" />
                  Request Sent
                </Button>
              ) : (
                <Button 
                  className="w-full text-sm" 
                  size="sm"
                  onClick={() => setSelectedProject(project)}
                >
                  <Send className="h-3.5 w-3.5 mr-1.5" />
                  Request to Join
                </Button>
              )}
            </CardFooter>
          </Card>
        ))}
      </div>

      {/* Join Request Dialog */}
      <Dialog open={selectedProject !== null} onOpenChange={(open) => !open && setSelectedProject(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Request to Join Project</DialogTitle>
            <DialogDescription>
              Send a request to join "{selectedProject?.title}"
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div>
              <p className="text-sm font-medium mb-2">Project Owner</p>
              <p className="text-sm text-muted-foreground">{selectedProject?.profiles?.username}</p>
            </div>
            <div>
              <label className="text-sm font-medium mb-2 block">
                Message (Optional)
              </label>
              <Textarea
                placeholder="Tell the project owner why you'd like to join and what you can contribute..."
                value={requestMessage}
                onChange={(e) => setRequestMessage(e.target.value)}
                rows={4}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setSelectedProject(null)} disabled={isSubmitting}>
              Cancel
            </Button>
            <Button onClick={handleRequestToJoin} disabled={isSubmitting}>
              {isSubmitting ? 'Sending...' : 'Send Request'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};
