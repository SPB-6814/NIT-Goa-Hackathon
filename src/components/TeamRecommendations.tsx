import { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Sparkles, UserPlus, RefreshCw, Loader2 } from 'lucide-react';
import { getTeamRecommendations, generateTeamRecommendations } from '@/lib/aiMatchmaking';
import { toast } from 'sonner';
import { useNavigate } from 'react-router-dom';

interface TeamRecommendationsProps {
  projectId: string;
}

export function TeamRecommendations({ projectId }: TeamRecommendationsProps) {
  const navigate = useNavigate();
  const [recommendations, setRecommendations] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);

  useEffect(() => {
    fetchRecommendations();
  }, [projectId]);

  const fetchRecommendations = async () => {
    setLoading(true);
    try {
      const data = await getTeamRecommendations(projectId);
      setRecommendations(data);
      
      // If no recommendations, generate them
      if (data.length === 0) {
        await handleGenerateRecommendations();
      }
    } catch (error) {
      console.error('Error fetching recommendations:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleGenerateRecommendations = async () => {
    setGenerating(true);
    try {
      await generateTeamRecommendations(projectId);
      const data = await getTeamRecommendations(projectId);
      setRecommendations(data);
      toast.success('AI recommendations generated! ✨');
    } catch (error) {
      console.error('Error generating recommendations:', error);
      toast.error('Failed to generate recommendations');
    } finally {
      setGenerating(false);
    }
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center p-8">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-gradient">
            <Sparkles className="h-6 w-6" />
            AI Team Recommendations
          </CardTitle>
          <Button
            onClick={handleGenerateRecommendations}
            disabled={generating}
            size="sm"
            variant="outline"
          >
            {generating ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Generating...
              </>
            ) : (
              <>
                <RefreshCw className="h-4 w-4 mr-2" />
                Refresh
              </>
            )}
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {recommendations.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <Sparkles className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>No recommendations yet</p>
            <p className="text-sm mt-1">Click "Refresh" to generate AI-powered teammate suggestions!</p>
          </div>
        ) : (
          <div className="space-y-4">
            {recommendations.map((rec) => {
              const compatibilityPercent = Math.round(rec.compatibility_score * 100);
              
              return (
                <Card 
                  key={rec.id} 
                  className="p-4 hover:shadow-lg transition-all cursor-pointer"
                  onClick={() => navigate(`/profile/${rec.recommended_user_id}`)}
                >
                  <div className="flex items-start gap-4">
                    <Avatar className="h-14 w-14">
                      {rec.profiles?.avatar_url ? (
                        <AvatarImage src={rec.profiles.avatar_url} />
                      ) : (
                        <AvatarFallback className="bg-gradient-to-br from-primary to-accent text-white">
                          {rec.profiles?.username?.[0]?.toUpperCase()}
                        </AvatarFallback>
                      )}
                    </Avatar>

                    <div className="flex-1 space-y-2">
                      <div className="flex items-start justify-between">
                        <div>
                          <h4 className="font-bold">{rec.profiles?.username}</h4>
                          {rec.profiles?.branch && (
                            <p className="text-sm text-muted-foreground">
                              {rec.profiles.branch}
                              {rec.profiles.year && ` • ${rec.profiles.year}`}
                            </p>
                          )}
                        </div>
                        <Badge 
                          variant={compatibilityPercent > 70 ? 'default' : 'secondary'}
                          className={compatibilityPercent > 70 ? 'bg-gradient-to-r from-primary to-accent' : ''}
                        >
                          {compatibilityPercent}% Match
                        </Badge>
                      </div>

                      <Progress value={compatibilityPercent} className="h-2" />

                      <p className="text-sm text-muted-foreground">{rec.reason}</p>

                      {rec.matching_skills && rec.matching_skills.length > 0 && (
                        <div className="flex flex-wrap gap-1">
                          {rec.matching_skills.map((skill: string, idx: number) => (
                            <Badge key={idx} variant="outline" className="text-xs">
                              {skill}
                            </Badge>
                          ))}
                        </div>
                      )}

                      <Button
                        size="sm"
                        variant="gradient"
                        className="mt-2"
                        onClick={(e) => {
                          e.stopPropagation();
                          navigate(`/profile/${rec.recommended_user_id}`);
                        }}
                      >
                        <UserPlus className="h-4 w-4 mr-2" />
                        View Profile
                      </Button>
                    </div>
                  </div>
                </Card>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
