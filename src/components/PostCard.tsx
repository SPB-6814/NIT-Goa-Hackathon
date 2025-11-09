import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';
import { Heart, MessageCircle, Share2, Send } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

interface Post {
  id: string;
  user_id: string;
  content: string;
  images: string[];
  tags?: string[];
  created_at: string;
  profiles: {
    username: string;
    college: string;
  };
}

interface PostCardProps {
  post: Post;
  onUpdate?: () => void;
}

export function PostCard({ post, onUpdate }: PostCardProps) {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [likes, setLikes] = useState<number>(0);
  const [isLiked, setIsLiked] = useState(false);
  const [comments, setComments] = useState<any[]>([]);
  const [showComments, setShowComments] = useState(false);
  const [newComment, setNewComment] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleProfileClick = () => {
    navigate(`/profile/${post.user_id}`);
  };

  useEffect(() => {
    fetchLikes();
    fetchComments();
  }, [post.id]);

  const fetchLikes = async () => {
    try {
      const { data, error } = await supabase
        .from('post_likes' as any)
        .select('*')
        .eq('post_id', post.id);

      if (error) throw error;
      const likesData = data as any[] || [];
      setLikes(likesData.length);
      setIsLiked(likesData.some((like: any) => like.user_id === user?.id));
    } catch (error) {
      console.error('Error fetching likes:', error);
    }
  };

  const fetchComments = async () => {
    try {
      const { data, error } = await supabase
        .from('post_comments' as any)
        .select(`
          *,
          profiles (username)
        `)
        .eq('post_id', post.id)
        .order('created_at', { ascending: true });

      if (error) throw error;
      setComments((data as any) || []);
    } catch (error) {
      console.error('Error fetching comments:', error);
    }
  };

  const handleLike = async () => {
    if (!user) {
      toast.error('Please sign in to like posts');
      return;
    }

    try {
      if (isLiked) {
        // Unlike
        const { error } = await supabase
          .from('post_likes' as any)
          .delete()
          .eq('post_id', post.id)
          .eq('user_id', user.id);

        if (error) throw error;
        setIsLiked(false);
        setLikes(likes - 1);
      } else {
        // Like
        const { error } = await supabase
          .from('post_likes' as any)
          .insert({ post_id: post.id, user_id: user.id });

        if (error) throw error;
        setIsLiked(true);
        setLikes(likes + 1);
      }
    } catch (error) {
      console.error('Error toggling like:', error);
      toast.error('Failed to update like');
    }
  };

  const handleComment = async () => {
    if (!newComment.trim()) return;
    if (!user) {
      toast.error('Please sign in to comment');
      return;
    }

    setIsSubmitting(true);
    try {
      const { error } = await supabase.from('post_comments' as any).insert({
        post_id: post.id,
        user_id: user.id,
        content: newComment.trim(),
      });

      if (error) throw error;
      setNewComment('');
      fetchComments();
      toast.success('Comment added! 💬');
    } catch (error) {
      console.error('Error adding comment:', error);
      toast.error('Failed to add comment');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleShare = () => {
    const url = `${window.location.origin}/post/${post.id}`;
    navigator.clipboard.writeText(url);
    toast.success('Link copied to clipboard! 📋');
  };

  return (
    <Card className="card-interactive">
      <CardHeader>
        <div className="flex items-center gap-3">
          <Avatar 
            className="h-10 w-10 cursor-pointer hover:ring-2 hover:ring-primary transition-all"
            onClick={handleProfileClick}
          >
            <AvatarFallback className="bg-gradient-to-br from-primary to-accent text-white font-semibold">
              {post.profiles.username[0].toUpperCase()}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1">
            <p 
              className="font-semibold cursor-pointer hover:text-primary transition-colors"
              onClick={handleProfileClick}
            >
              {post.profiles.username}
            </p>
            <p className="text-xs text-muted-foreground">
              {post.profiles.college} • {formatDistanceToNow(new Date(post.created_at), { addSuffix: true })}
            </p>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {post.content && (
          <p className="text-sm leading-relaxed whitespace-pre-wrap">{post.content}</p>
        )}

        {post.tags && post.tags.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {post.tags.map((tag, idx) => (
              <Badge key={idx} variant="secondary" className="text-xs">
                {tag}
              </Badge>
            ))}
          </div>
        )}

        {post.images && post.images.length > 0 && (
          <div className={`grid gap-2 ${
            post.images.length === 1 ? 'grid-cols-1' : 
            post.images.length === 2 ? 'grid-cols-2' : 
            'grid-cols-2'
          }`}>
            {post.images.map((img, idx) => (
              <img
                key={idx}
                src={img}
                alt={`Post image ${idx + 1}`}
                className={`w-full rounded-xl object-cover ${
                  post.images.length === 1 ? 'max-h-[500px]' : 'h-64'
                }`}
              />
            ))}
          </div>
        )}
      </CardContent>

      <CardFooter className="flex flex-col gap-3">
        <div className="flex items-center gap-4 w-full">
          <Button
            variant="ghost"
            size="sm"
            onClick={handleLike}
            className={isLiked ? 'text-accent' : ''}
          >
            <Heart className={`h-5 w-5 mr-1 ${isLiked ? 'fill-current' : ''}`} />
            {likes}
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setShowComments(!showComments)}
          >
            <MessageCircle className="h-5 w-5 mr-1" />
            {comments.length}
          </Button>
          <Button variant="ghost" size="sm" onClick={handleShare}>
            <Share2 className="h-5 w-5 mr-1" />
            Share
          </Button>
        </div>

        {showComments && (
          <div className="w-full space-y-3 pt-3 border-t">
            {comments.map((comment) => (
              <div key={comment.id} className="flex gap-2">
                <Avatar className="h-8 w-8">
                  <AvatarFallback className="text-xs">
                    {comment.profiles?.username?.[0]?.toUpperCase() || 'U'}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 bg-secondary rounded-xl px-3 py-2">
                  <p className="text-sm font-semibold">{comment.profiles?.username || 'User'}</p>
                  <p className="text-sm">{comment.content}</p>
                </div>
              </div>
            ))}

            <div className="flex gap-2">
              <Input
                placeholder="Write a comment..."
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && !isSubmitting && handleComment()}
                className="flex-1"
              />
              <Button
                size="icon"
                variant="gradient"
                onClick={handleComment}
                disabled={isSubmitting || !newComment.trim()}
              >
                <Send className="h-4 w-4" />
              </Button>
            </div>
          </div>
        )}
      </CardFooter>
    </Card>
  );
}
