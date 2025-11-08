import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Users, Sparkles, MessageCircle, User } from 'lucide-react';
import { toast } from 'sonner';
import { useNavigate } from 'react-router-dom';

interface TeammateMatch {
  id: string;
  event_id: string;
  user1_id: string;
  user2_id: string;
  match_score: number;
  matching_skills: string[];
  matching_interests: string[];
  ai_reasoning: string;
  status: 'pending' | 'accepted' | 'rejected';
  created_at: string;
  events: {
    title: string;
  };
  matched_user: {
    id: string;
    username: string;
    college: string;
    skills: string[];
    interests: string[];
  };
}

export const TeammateMatchNotifications = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [matches, setMatches] = useState<TeammateMatch[]>([]);
  const [selectedMatch, setSelectedMatch] = useState<TeammateMatch | null>(null);
  const [showMatchDialog, setShowMatchDialog] = useState(false);

  useEffect(() => {
    if (user) {
      fetchMatches();
      subscribeToMatches();
    }
  }, [user]);

  const fetchMatches = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('teammate_matches' as any)
        .select(`
          *,
          events!teammate_matches_event_id_fkey (title)
        `)
        .or(`user1_id.eq.${user.id},user2_id.eq.${user.id}`)
        .eq('status', 'pending')
        .order('created_at', { ascending: false });

      if (error) throw error;

      // Fetch matched user details for each match
      const enrichedMatches = await Promise.all(
        (data || []).map(async (match: any) => {
          const matchedUserId = match.user1_id === user.id ? match.user2_id : match.user1_id;
          
          const { data: matchedUser } = await supabase
            .from('profiles' as any)
            .select('id, username, college, skills, interests')
            .eq('id', matchedUserId)
            .single();

          return {
            ...match,
            matched_user: matchedUser,
          };
        })
      );

      setMatches(enrichedMatches);

      // Show toast for new matches
      if (enrichedMatches.length > 0 && !showMatchDialog) {
        toast.success(`You have ${enrichedMatches.length} potential teammate match${enrichedMatches.length > 1 ? 'es' : ''}!`, {
          description: 'Check your notifications to connect',
          icon: '🎯',
        });
      }
    } catch (error) {
      console.error('Error fetching teammate matches:', error);
    }
  };

  const subscribeToMatches = () => {
    if (!user) return;

    const subscription = supabase
      .channel('teammate_matches_channel')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'teammate_matches',
          filter: `user1_id=eq.${user.id},user2_id=eq.${user.id}`,
        },
        () => {
          fetchMatches();
        }
      )
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  };

  const handleAcceptMatch = async (matchId: string) => {
    try {
      const { error } = await supabase
        .from('teammate_matches' as any)
        .update({ status: 'accepted' })
        .eq('id', matchId);

      if (error) throw error;

      toast.success('Match accepted!', {
        description: 'You can now message your teammate',
      });

      fetchMatches();
      setShowMatchDialog(false);
    } catch (error: any) {
      toast.error('Failed to accept match', {
        description: error.message,
      });
    }
  };

  const handleRejectMatch = async (matchId: string) => {
    try {
      const { error } = await supabase
        .from('teammate_matches' as any)
        .update({ status: 'rejected' })
        .eq('id', matchId);

      if (error) throw error;

      toast.info('Match declined');
      fetchMatches();
      setShowMatchDialog(false);
    } catch (error: any) {
      toast.error('Failed to reject match', {
        description: error.message,
      });
    }
  };

  const handleMessage = (userId: string) => {
    // Navigate to chat/messages with this user
    toast.info('Opening chat...', {
      description: 'This will open a direct message',
    });
    // You can implement navigation to chat here
  };

  if (matches.length === 0) return null;

  return (
    <>
      {/* Floating notification badge */}
      <div className="fixed bottom-6 right-6 z-50">
        <Button
          size="lg"
          className="rounded-full shadow-2xl animate-bounce"
          onClick={() => {
            setSelectedMatch(matches[0]);
            setShowMatchDialog(true);
          }}
        >
          <Users className="h-5 w-5 mr-2" />
          {matches.length} Teammate Match{matches.length > 1 ? 'es' : ''}
          <Badge className="ml-2 bg-red-500">{matches.length}</Badge>
        </Button>
      </div>

      {/* Match Details Dialog */}
      <Dialog open={showMatchDialog} onOpenChange={setShowMatchDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-2xl">
              <Sparkles className="h-6 w-6 text-primary" />
              Teammate Match Found!
            </DialogTitle>
            <DialogDescription>
              AI has found a great potential teammate for you
            </DialogDescription>
          </DialogHeader>

          {selectedMatch && (
            <div className="space-y-6">
              {/* Event Info */}
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg">Event</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="font-semibold">{selectedMatch.events?.title}</p>
                </CardContent>
              </Card>

              {/* Matched User Info */}
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Avatar className="h-8 w-8">
                      <AvatarFallback>
                        <User className="h-4 w-4" />
                      </AvatarFallback>
                    </Avatar>
                    {selectedMatch.matched_user?.username}
                  </CardTitle>
                  <CardDescription>{selectedMatch.matched_user?.college}</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* Match Score */}
                  <div>
                    <p className="text-sm font-medium mb-2">Match Score</p>
                    <div className="flex items-center gap-2">
                      <div className="flex-1 h-2 bg-muted rounded-full overflow-hidden">
                        <div
                          className="h-full bg-gradient-to-r from-primary to-accent"
                          style={{ width: `${selectedMatch.match_score * 100}%` }}
                        />
                      </div>
                      <span className="text-sm font-semibold">
                        {Math.round(selectedMatch.match_score * 100)}%
                      </span>
                    </div>
                  </div>

                  {/* Matching Skills */}
                  {selectedMatch.matching_skills.length > 0 && (
                    <div>
                      <p className="text-sm font-medium mb-2">Matching Skills</p>
                      <div className="flex flex-wrap gap-1.5">
                        {selectedMatch.matching_skills.map((skill, idx) => (
                          <Badge key={idx} variant="secondary">
                            {skill}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Matching Interests */}
                  {selectedMatch.matching_interests.length > 0 && (
                    <div>
                      <p className="text-sm font-medium mb-2">Matching Interests</p>
                      <div className="flex flex-wrap gap-1.5">
                        {selectedMatch.matching_interests.map((interest, idx) => (
                          <Badge key={idx} variant="outline">
                            {interest}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* AI Reasoning */}
                  <div>
                    <p className="text-sm font-medium mb-2 flex items-center gap-2">
                      <Sparkles className="h-4 w-4 text-primary" />
                      AI Analysis
                    </p>
                    <p className="text-sm text-muted-foreground bg-muted p-3 rounded-md">
                      {selectedMatch.ai_reasoning}
                    </p>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          <DialogFooter className="flex gap-2">
            <Button
              variant="outline"
              onClick={() => selectedMatch && handleRejectMatch(selectedMatch.id)}
            >
              Not Interested
            </Button>
            <Button
              variant="default"
              onClick={() => selectedMatch && handleMessage(selectedMatch.matched_user.id)}
            >
              <MessageCircle className="h-4 w-4 mr-2" />
              Send Message
            </Button>
            <Button
              variant="gradient"
              onClick={() => selectedMatch && handleAcceptMatch(selectedMatch.id)}
            >
              <Users className="h-4 w-4 mr-2" />
              Team Up!
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};
