import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { MessageCircle } from 'lucide-react';
import { ChatDialog } from './ChatDialog';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

export function FloatingChatButton() {
  const { user } = useAuth();
  const [showChat, setShowChat] = useState(false);
  const [totalUnread, setTotalUnread] = useState(0);

  useEffect(() => {
    if (!user) return;

    fetchUnreadCount();

    // Subscribe to message changes
    const subscription = supabase
      .channel('unread_messages')
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'messages'
      }, () => {
        fetchUnreadCount();
      })
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'message_reads'
      }, () => {
        fetchUnreadCount();
      })
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  }, [user]);

  const fetchUnreadCount = async () => {
    if (!user) return;

    try {
      const { data, error } = await (supabase.rpc as any)('get_unread_count', { user_uuid: user.id });

      if (error) throw error;

      const total = (data || []).reduce((sum: number, item: any) => {
        return sum + parseInt(item.unread_count);
      }, 0);

      setTotalUnread(total);
    } catch (error) {
      console.error('Error fetching unread count:', error);
    }
  };

  if (!user) return null;

  return (
    <>
      <div className="fixed bottom-6 right-6 z-50">
        <Button
          size="lg"
          variant="gradient"
          className="h-14 w-14 rounded-full shadow-glow-lg hover:shadow-glow-orange hover:scale-110 transition-all duration-300 relative"
          onClick={() => setShowChat(true)}
        >
          <MessageCircle className="h-6 w-6" />
          {totalUnread > 0 && (
            <Badge
              variant="destructive"
              className="absolute -top-1 -right-1 h-6 w-6 flex items-center justify-center p-0 rounded-full animate-bounce-subtle"
            >
              {totalUnread > 99 ? '99+' : totalUnread}
            </Badge>
          )}
        </Button>
      </div>

      <ChatDialog open={showChat} onOpenChange={setShowChat} />
    </>
  );
}
