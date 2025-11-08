import { useEffect, useState, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Send, Paperclip, Download, Loader2 } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { toast } from 'sonner';

interface Message {
  id: string;
  content: string;
  created_at: string;
  user_id: string;
  file_url?: string;
  file_name?: string;
  profiles: {
    username: string;
  };
}

interface ChatBoxProps {
  projectId: string;
}

export const ChatBox = ({ projectId }: ChatBoxProps) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [uploading, setUploading] = useState(false);
  const { user } = useAuth();
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    fetchMessages();
    
    const channel = supabase
      .channel('messages')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'messages',
          filter: `project_id=eq.${projectId}`,
        },
        (payload) => {
          const newMsg = payload.new as any;
          supabase
            .from('profiles')
            .select('username')
            .eq('id', newMsg.user_id)
            .single()
            .then(({ data }) => {
              setMessages((prev) => [...prev, { ...newMsg, profiles: data }]);
            });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [projectId]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const fetchMessages = async () => {
    const { data } = await supabase
      .from('messages')
      .select('*, profiles(username)')
      .eq('project_id', projectId)
      .order('created_at', { ascending: true });

    setMessages(data || []);
  };

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file || !user) return;

    // Check file size (10MB limit)
    if (file.size > 10 * 1024 * 1024) {
      toast.error('File size must be less than 10MB');
      return;
    }

    setUploading(true);

    try {
      // Upload to Supabase Storage
      const fileExt = file.name.split('.').pop();
      const fileName = `${Math.random()}.${fileExt}`;
      const filePath = `${projectId}/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('chat-files')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from('chat-files')
        .getPublicUrl(filePath);

      // Send message with file
      await supabase.from('messages').insert({
        content: newMessage.trim() || `Shared a file: ${file.name}`,
        project_id: projectId,
        user_id: user.id,
        file_url: publicUrl,
        file_name: file.name,
      });

      setNewMessage('');
      toast.success('File uploaded successfully');
    } catch (error: any) {
      console.error('Error uploading file:', error);
      toast.error('Failed to upload file');
    } finally {
      setUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const sendMessage = async () => {
    if (!newMessage.trim() || !user) return;

    await supabase
      .from('messages')
      .insert({
        content: newMessage,
        project_id: projectId,
        user_id: user.id,
      });

    setNewMessage('');
  };

  return (
    <div className="flex flex-col h-[500px]">
      <div className="flex-1 overflow-y-auto space-y-3 p-4">
        {messages.map((message) => (
          <div
            key={message.id}
            className={`flex gap-3 ${
              message.user_id === user?.id ? 'flex-row-reverse' : ''
            }`}
          >
            <Avatar className="h-8 w-8">
              <AvatarFallback>
                {message.profiles.username[0].toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <Card className={`p-3 max-w-[70%] ${
              message.user_id === user?.id ? 'bg-primary text-primary-foreground' : ''
            }`}>
              <p className="text-sm font-medium mb-1">{message.profiles.username}</p>
              <p className="text-sm">{message.content}</p>
              
              {/* File attachment */}
              {message.file_url && (
                <a
                  href={message.file_url}
                  download={message.file_name}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 mt-2 p-2 rounded bg-background/10 hover:bg-background/20 transition-colors"
                >
                  <Download className="h-4 w-4" />
                  <span className="text-xs truncate max-w-[200px]">
                    {message.file_name || 'Download file'}
                  </span>
                </a>
              )}
              
              <p className="text-xs opacity-70 mt-1">
                {formatDistanceToNow(new Date(message.created_at), { addSuffix: true })}
              </p>
            </Card>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      <div className="p-4 border-t flex gap-2">
        <input
          ref={fileInputRef}
          type="file"
          onChange={handleFileSelect}
          className="hidden"
          accept="*/*"
        />
        <Button
          variant="outline"
          size="icon"
          onClick={() => fileInputRef.current?.click()}
          disabled={uploading}
          title="Attach file"
        >
          {uploading ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Paperclip className="h-4 w-4" />
          )}
        </Button>
        <Input
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          placeholder="Type a message..."
          disabled={uploading}
          onKeyPress={(e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
              e.preventDefault();
              sendMessage();
            }
          }}
        />
        <Button onClick={sendMessage} size="icon" disabled={uploading}>
          <Send className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
};