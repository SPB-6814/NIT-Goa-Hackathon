import { useState, useEffect, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { Card } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { formatDistanceToNow } from 'date-fns';
import { Loader2 } from 'lucide-react';

interface Conversation {
  id: string;
  type: string;
  name?: string;
  updated_at: string;
  participants: {
    user_id: string;
    profiles: {
      username: string;
      avatar_url?: string;
    };
  }[];
  lastMessage?: {
    content: string;
    created_at: string;
    sender_id: string;
  };
  unread_count: number;
}

interface ConversationListProps {
  onSelectConversation: (conversationId: string) => void;
  selectedId?: string;
}

export function ConversationList({ onSelectConversation, selectedId }: ConversationListProps) {
  const { user } = useAuth();
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [loading, setLoading] = useState(true);
  const [unreadCounts, setUnreadCounts] = useState<Record<string, number>>({});

  useEffect(() => {
    if (!user) return;
    fetchConversations();
    fetchUnreadCounts();

    // Subscribe to realtime updates
    const subscription = supabase
      .channel('conversations_channel')
      .on('postgres_changes', { 
        event: '*', 
        schema: 'public', 
        table: 'messages' 
      }, () => {
        fetchConversations();
        fetchUnreadCounts();
      })
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'conversations'
      }, () => {
        fetchConversations();
      })
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  }, [user]);

  const fetchUnreadCounts = async () => {
    if (!user) return;
    
    try {
      const { data, error } = await (supabase.rpc as any)('get_unread_count', { user_uuid: user.id });
      
      if (error) throw error;
      
      const counts: Record<string, number> = {};
      (data || []).forEach((item: any) => {
        counts[item.conversation_id] = parseInt(item.unread_count);
      });
      setUnreadCounts(counts);
    } catch (error) {
      console.error('Error fetching unread counts:', error);
    }
  };

  const fetchConversations = async () => {
    if (!user) return;

    try {
      // Get conversations user is part of
      const { data: participantData, error: partError } = await supabase
        .from('conversation_participants' as any)
        .select(`
          conversation_id,
          conversations:conversation_id (
            id,
            type,
            name,
            updated_at
          )
        `)
        .eq('user_id', user.id);

      if (partError) throw partError;

      const convIds = participantData?.map((p: any) => p.conversation_id) || [];

      if (convIds.length === 0) {
        setConversations([]);
        setLoading(false);
        return;
      }

      // Get all participants for these conversations
      const { data: allParticipants, error: allPartError } = await supabase
        .from('conversation_participants' as any)
        .select(`
          conversation_id,
          user_id,
          profiles:user_id (
            username,
            avatar_url
          )
        `)
        .in('conversation_id', convIds);

      if (allPartError) throw allPartError;

      // Get last message for each conversation
      const { data: lastMessages, error: msgError } = await supabase
        .from('chat_messages' as any)
        .select('conversation_id, content, created_at, sender_id')
        .in('conversation_id', convIds)
        .order('created_at', { ascending: false });

      if (msgError) throw msgError;

      // Build conversations array
      const convs: Conversation[] = (participantData?.map((p: any) => {
        const conv = p.conversations;
        const participants = allParticipants?.filter(
          (ap: any) => ap.conversation_id === conv.id
        ) || [];
        
        const lastMsg = lastMessages?.find(
          (m: any) => m.conversation_id === conv.id
        );

        return {
          id: conv.id,
          type: conv.type,
          name: conv.name,
          updated_at: conv.updated_at,
          participants,
          lastMessage: lastMsg,
          unread_count: unreadCounts[conv.id] || 0
        };
      }) as any) || [];

      // Sort by last activity
      convs.sort((a, b) => {
        const aTime = a.lastMessage?.created_at || a.updated_at;
        const bTime = b.lastMessage?.created_at || b.updated_at;
        return new Date(bTime).getTime() - new Date(aTime).getTime();
      });

      setConversations(convs);
    } catch (error) {
      console.error('Error fetching conversations:', error);
    } finally {
      setLoading(false);
    }
  };

  const getConversationName = (conv: Conversation) => {
    if (conv.type === 'group' || conv.type === 'project') {
      return conv.name || 'Group Chat';
    }
    // For DMs, show other person's name
    const otherPerson = conv.participants.find(p => p.user_id !== user?.id);
    return otherPerson?.profiles?.username || 'Unknown';
  };

  const getConversationAvatar = (conv: Conversation) => {
    if (conv.type !== 'direct') return null;
    const otherPerson = conv.participants.find(p => p.user_id !== user?.id);
    return otherPerson?.profiles?.avatar_url;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (conversations.length === 0) {
    return (
      <div className="p-6 text-center text-muted-foreground">
        <p>No conversations yet</p>
        <p className="text-sm mt-1">Visit a profile and click "Message" to start chatting!</p>
      </div>
    );
  }

  return (
    <div className="space-y-2 p-2">
      {conversations.map((conv) => {
        const name = getConversationName(conv);
        const avatar = getConversationAvatar(conv);
        const isSelected = selectedId === conv.id;
        const unread = unreadCounts[conv.id] || 0;

        return (
          <Card
            key={conv.id}
            className={`p-3 cursor-pointer transition-all duration-200 hover:scale-[1.02] hover:shadow-md ${
              isSelected ? 'bg-primary/10 border-primary' : ''
            }`}
            onClick={() => onSelectConversation(conv.id)}
          >
            <div className="flex items-start gap-3">
              <Avatar className="h-12 w-12">
                {avatar ? (
                  <AvatarImage src={avatar} alt={name} />
                ) : (
                  <AvatarFallback className="bg-gradient-to-br from-primary to-accent text-white">
                    {name[0]?.toUpperCase()}
                  </AvatarFallback>
                )}
              </Avatar>

              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between">
                  <p className="font-semibold truncate">{name}</p>
                  {unread > 0 && (
                    <Badge variant="default" className="ml-2 bg-accent">
                      {unread}
                    </Badge>
                  )}
                </div>

                {conv.lastMessage && (
                  <p className="text-sm text-muted-foreground truncate">
                    {conv.lastMessage.sender_id === user?.id && 'You: '}
                    {conv.lastMessage.content}
                  </p>
                )}

                {conv.lastMessage && (
                  <p className="text-xs text-muted-foreground mt-1">
                    {formatDistanceToNow(new Date(conv.lastMessage.created_at), { addSuffix: true })}
                  </p>
                )}
              </div>
            </div>
          </Card>
        );
      })}
    </div>
  );
}
