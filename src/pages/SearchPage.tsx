import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Search as SearchIcon, Github, Linkedin, X } from 'lucide-react';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { supabase } from '@/integrations/supabase/client';

interface Profile {
  id: string;
  username: string;
  college?: string;
  skills: string[];
  github_url?: string;
  linkedin_url?: string;
}

interface SearchFilters {
  query: string;
  skillFilter: string | null;
}

export default function SearchPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [filters, setFilters] = useState<SearchFilters>({
    query: '',
    skillFilter: null
  });
  const [recentProfiles, setRecentProfiles] = useState<Profile[]>([]);
  // Show recent searches by default (appear before any search input)
  const [showRecent, setShowRecent] = useState(true);

  useEffect(() => {
    try {
      const raw = localStorage.getItem('recentProfiles');
      if (raw) setRecentProfiles(JSON.parse(raw));
    } catch (e) {
      // ignore
    }
  }, []);

  const addToRecent = (p: Profile) => {
    try {
      const next = [p, ...recentProfiles.filter(r => r.id !== p.id)].slice(0, 10);
      setRecentProfiles(next);
      localStorage.setItem('recentProfiles', JSON.stringify(next));
    } catch (e) {
      // ignore
    }
  };

  const clearRecent = () => {
    setRecentProfiles([]);
    try { localStorage.removeItem('recentProfiles'); } catch (e) { /* ignore */ }
  };

  const removeFromRecent = (profileId: string, e: React.MouseEvent) => {
    e.preventDefault(); // Prevent navigation to profile
    e.stopPropagation(); // Prevent event bubbling to parent Link
    const next = recentProfiles.filter(p => p.id !== profileId);
    setRecentProfiles(next);
    try {
      if (next.length === 0) {
        localStorage.removeItem('recentProfiles');
      } else {
        localStorage.setItem('recentProfiles', JSON.stringify(next));
      }
    } catch (e) {
      // ignore
    }
  };

  // Debounce search query
  useEffect(() => {
    const timer = setTimeout(() => {
      setFilters(prev => ({ ...prev, query: searchQuery }));
    }, 300);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  // Fetch profiles when filters change
  useEffect(() => {
    const fetchProfiles = async () => {
      // Only fetch if there's a search query or skill filter
      if (!filters.query && !filters.skillFilter) {
        setProfiles([]);
        return;
      }
      
      setIsLoading(true);
      try {
        // For flexible searching (username, college, partial skill matches) we fetch a reasonable
        // number of profiles and perform client-side filtering. This keeps server logic simple
        // and supports partial matching inside skills arrays.
        const { data, error } = await supabase.from('profiles').select('*').limit(1000);
        if (error) throw error;

        let allProfiles = (data as Profile[]) || [];

        // If a text query is present, match username, college or any skill (partial, case-insensitive)
        if (filters.query) {
          const q = filters.query.toLowerCase();
          allProfiles = allProfiles.filter((p) =>
            (p.username || '').toLowerCase().includes(q) ||
            (p.college || '').toLowerCase().includes(q) ||
            (p.skills || []).some((s) => s.toLowerCase().includes(q))
          );
        }

        // If a skill filter badge is active, further narrow to profiles containing that skill
        if (filters.skillFilter) {
          const sf = filters.skillFilter.toLowerCase();
          allProfiles = allProfiles.filter((p) => (p.skills || []).some((s) => s.toLowerCase().includes(sf)));
        }

        setProfiles(allProfiles);
      } catch (error) {
        console.error('Error fetching profiles:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchProfiles();
  }, [filters]);

  const popularSkills = [
    'React', 'Python', 'JavaScript', 'TypeScript', 'Node.js',
    'Machine Learning', 'UI/UX Design', 'Figma', 'SQL', 'Git'
  ];

  return (
    <div className="p-6 max-w-5xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Search</h1>
        <p className="text-muted-foreground">Find projects and teammates by skills</p>
      </div>

      <div className="relative mb-8">
        <SearchIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-5 w-5" />
        <Input
          placeholder="Search by skills, interests, or keywords..."
          value={searchQuery}
          onChange={(e) => { setSearchQuery(e.target.value); setShowRecent(true); }}
          className="pl-10 h-12"
        />
      </div>

      <div className="mb-6">
        <h2 className="text-lg font-semibold mb-3">Popular Skills</h2>
        <div className="flex flex-wrap gap-2">
          {popularSkills.map((skill) => (
            <Badge
              key={skill}
              variant="outline"
              className={`cursor-pointer transition-colors ${
                filters.skillFilter === skill
                  ? 'bg-primary text-primary-foreground'
                  : 'hover:bg-primary hover:text-primary-foreground'
              }`}
              onClick={() => setFilters(prev => ({
                ...prev,
                skillFilter: prev.skillFilter === skill ? null : skill
              }))}
            >
              {skill}
            </Badge>
          ))}
        </div>
      </div>

      {isLoading ? (
        <Card>
          <CardContent className="p-6 text-center text-muted-foreground">
            Loading profiles...
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {showRecent && recentProfiles.length > 0 && (
            <div>
              <div className="flex items-center justify-between mb-2">
                <h4 className="text-sm font-medium">Recent searches</h4>
                <Button variant="ghost" size="sm" onClick={clearRecent}>Clear recent</Button>
              </div>
              <div className="flex flex-col gap-2 mb-4">
                {recentProfiles.map((rp) => (
                  <Card key={rp.id} className="hover:bg-accent/50 transition-colors">
                    <CardContent className="p-4 flex items-center gap-3">
                      <Link 
                        to={`/profile/${rp.id}`} 
                        onClick={() => addToRecent(rp)}
                        className="flex-1 flex items-center gap-3"
                      >
                        <Avatar className="h-10 w-10">
                          <AvatarFallback>{rp.username[0].toUpperCase()}</AvatarFallback>
                        </Avatar>
                        <div className="flex-1">
                          <div className="font-medium">{rp.username}</div>
                          {rp.college && <div className="text-sm text-muted-foreground">{rp.college}</div>}
                        </div>
                      </Link>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 p-0 hover:bg-destructive/10 hover:text-destructive"
                        onClick={(e) => removeFromRecent(rp.id, e)}
                      >
                        <X className="h-4 w-4" />
                        <span className="sr-only">Remove from recent searches</span>
                      </Button>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          )}

          {(filters.query || filters.skillFilter) && profiles.length > 0 ? (
            profiles.map((profile) => (
              <Link key={profile.id} to={`/profile/${profile.id}`} onClick={() => addToRecent(profile)}>
                <Card className="hover:bg-accent/50 transition-colors">
                  <CardContent className="p-6">
                    <div className="flex items-start gap-4">
                      <Avatar className="h-12 w-12">
                        <AvatarFallback>
                          {profile.username[0].toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1 space-y-2">
                        <div>
                          <h3 className="font-medium">{profile.username}</h3>
                          {profile.college && (
                            <p className="text-sm text-muted-foreground">
                              {profile.college}
                            </p>
                          )}
                        </div>
                        <div className="flex flex-wrap gap-2">
                          {profile.skills?.map((skill) => (
                            <Badge
                              key={skill}
                              variant={
                                filters.skillFilter &&
                                skill.toLowerCase().includes(filters.skillFilter.toLowerCase())
                                  ? 'default'
                                  : 'secondary'
                              }
                            >
                              {skill}
                            </Badge>
                          ))}
                        </div>
                        <div className="flex gap-4 text-sm text-muted-foreground">
                          {profile.github_url && (
                            <div className="flex items-center gap-1">
                              <Github className="h-4 w-4" />
                              GitHub
                            </div>
                          )}
                          {profile.linkedin_url && (
                            <div className="flex items-center gap-1">
                              <Linkedin className="h-4 w-4" />
                              LinkedIn
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))
          ) : (
            <Card>
              <CardContent className="p-6 text-center text-muted-foreground">
                {filters.query || filters.skillFilter
                  ? 'No profiles match your search criteria.'
                  : 'Start typing to search profiles or select a skill.'}
              </CardContent>
            </Card>
          )}
        </div>
      )}
    </div>
  );
}