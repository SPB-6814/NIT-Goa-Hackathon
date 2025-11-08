import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { PostCard } from '@/components/PostCard';
import { Sparkles } from 'lucide-react';

interface Post {
  id: string;
  user_id: string;
  content: string;
  images: string[];
  created_at: string;
  profiles: {
    username: string;
    college: string;
  };
}

export default function HomePage() {
  const [posts, setPosts] = useState<Post[]>([]);
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
      <div className="max-w-2xl mx-auto p-6">
        {/* Header */}
        <div className="mb-6 text-center">
          <h1 className="text-3xl font-bold text-gradient mb-2 flex items-center justify-center gap-2">
            <Sparkles className="h-8 w-8" />
            Campus Feed
          </h1>
          <p className="text-muted-foreground">
            See what your fellow students are sharing
          </p>
        </div>

        {/* Posts Feed */}
        {isLoading ? (
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-primary border-t-transparent"></div>
            <p className="text-muted-foreground mt-4">Loading posts...</p>
          </div>
        ) : posts.length === 0 ? (
          <div className="text-center py-12">
            <Sparkles className="h-16 w-16 text-muted-foreground mx-auto mb-4 opacity-50" />
            <p className="text-muted-foreground text-lg">No posts yet</p>
            <p className="text-muted-foreground text-sm mt-2">
              Be the first to share something with the community!
            </p>
          </div>
        ) : (
          <div className="space-y-6">
            {posts.map((post) => (
              <PostCard key={post.id} post={post} onUpdate={fetchPosts} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}