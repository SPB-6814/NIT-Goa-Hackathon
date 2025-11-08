import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { PostCard } from '@/components/PostCard';
import { ProjectShowcase } from '@/components/ProjectShowcase';
import { Sparkles, Briefcase } from 'lucide-react';
import { Separator } from '@/components/ui/separator';
import { Button } from '@/components/ui/button';

interface Post {
  id: string;
  user_id: string;
  content: string;
  images: string[];
  tags: string[];
  created_at: string;
  profiles: {
    username: string;
    college: string;
  };
}

const POST_FILTERS = ['All', 'Technical', 'Cultural', 'Academic', 'Social', 'Sports', 'Other'];

export default function HomePage() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [filteredPosts, setFilteredPosts] = useState<Post[]>([]);
  const [selectedFilter, setSelectedFilter] = useState('All');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchPosts();
    
    // Subscribe to realtime updates
    const subscription = supabase
      .channel('posts_channel')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'posts' }, () => {
        fetchPosts();
      })
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  useEffect(() => {
    // Filter posts when filter changes
    if (selectedFilter === 'All') {
      setFilteredPosts(posts);
    } else {
      const filtered = posts.filter(post => 
        post.tags && post.tags.includes(selectedFilter)
      );
      setFilteredPosts(filtered);
    }
  }, [selectedFilter, posts]);

  const fetchPosts = async () => {
    try {
      const { data, error } = await supabase
        .from('posts' as any)
        .select(`
          *,
          profiles (username, college)
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setPosts((data as any) || []);
    } catch (error) {
      console.error('Error fetching posts:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-7xl mx-auto p-4 md:p-6">
        {/* Header */}
        <div className="mb-6 md:mb-8 text-center">
          <h1 className="text-2xl md:text-3xl font-bold text-gradient mb-2 flex items-center justify-center gap-2">
            <Sparkles className="h-6 w-6 md:h-8 md:w-8" />
            Campus Feed
          </h1>
          <p className="text-sm md:text-base text-muted-foreground">
            See what your fellow students are sharing
          </p>
        </div>

        <div className="grid lg:grid-cols-[1fr_400px] xl:grid-cols-[1fr_450px] gap-6 lg:gap-8">
          {/* Main Feed - Posts */}
          <div className="w-full">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl md:text-2xl font-semibold flex items-center gap-2">
                <Sparkles className="h-5 w-5 md:h-6 md:w-6 text-primary" />
                Latest Posts
              </h2>
            </div>

            {/* Filter Buttons */}
            <div className="mb-6 flex flex-wrap gap-2">
              {POST_FILTERS.map((filter) => (
                <Button
                  key={filter}
                  variant={selectedFilter === filter ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setSelectedFilter(filter)}
                  className="text-xs md:text-sm"
                >
                  {filter} {filter === 'All' ? 'Posts' : ''}
                </Button>
              ))}
            </div>

            {isLoading ? (
              <div className="text-center py-12">
                <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-primary border-t-transparent"></div>
                <p className="text-muted-foreground mt-4">Loading posts...</p>
              </div>
            ) : filteredPosts.length === 0 ? (
              <div className="text-center py-12">
                <Sparkles className="h-16 w-16 text-muted-foreground mx-auto mb-4 opacity-50" />
                <p className="text-muted-foreground text-lg">
                  {selectedFilter === 'All' ? 'No posts yet' : `No ${selectedFilter} posts found`}
                </p>
                <p className="text-muted-foreground text-sm mt-2">
                  {selectedFilter === 'All' 
                    ? 'Be the first to share something with the community!' 
                    : 'Try selecting a different filter'}
                </p>
              </div>
            ) : (
              <div className="space-y-6">
                {filteredPosts.map((post) => (
                  <PostCard key={post.id} post={post} onUpdate={fetchPosts} />
                ))}
              </div>
            )}
          </div>

          {/* Sidebar - Projects Looking for Collaborators */}
          <div className="w-full">
            <div className="lg:sticky lg:top-6">
              <h2 className="text-xl md:text-2xl font-semibold mb-4 flex items-center gap-2">
                <Briefcase className="h-5 w-5 md:h-6 md:w-6 text-primary" />
                Projects
              </h2>
              <p className="text-sm text-muted-foreground mb-4">
                Join exciting projects from fellow students
              </p>
              <Separator className="mb-4" />
              <ProjectShowcase />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}