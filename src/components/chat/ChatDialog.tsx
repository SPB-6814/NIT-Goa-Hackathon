import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ConversationList } from './ConversationList';
import { MessageList } from './MessageList';
import { MessageCircle, Users, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface ChatDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  initialConversationId?: string;
}

export function ChatDialog({ open, onOpenChange, initialConversationId }: ChatDialogProps) {
  const [selectedConversationId, setSelectedConversationId] = useState<string | undefined>(
    initialConversationId
  );
  const [activeTab, setActiveTab] = useState('direct');

  const handleSelectConversation = (id: string) => {
    setSelectedConversationId(id);
  };

  const handleBack = () => {
    setSelectedConversationId(undefined);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl h-[80vh] flex flex-col p-0">
        <DialogHeader className="px-6 py-4 border-b">
          <div className="flex items-center gap-3">
            {selectedConversationId && (
              <Button variant="ghost" size="icon" onClick={handleBack}>
                <ArrowLeft className="h-5 w-5" />
              </Button>
            )}
            <MessageCircle className="h-6 w-6 text-primary" />
            <DialogTitle className="text-2xl font-bold text-gradient">
              {selectedConversationId ? 'Chat' : 'Messages'}
            </DialogTitle>
          </div>
        </DialogHeader>

        <div className="flex-1 overflow-hidden">
          {selectedConversationId ? (
            <MessageList conversationId={selectedConversationId} />
          ) : (
            <Tabs value={activeTab} onValueChange={setActiveTab} className="h-full flex flex-col">
              <TabsList className="mx-6 mt-4">
                <TabsTrigger value="direct" className="flex items-center gap-2">
                  <MessageCircle className="h-4 w-4" />
                  Direct Messages
                </TabsTrigger>
                <TabsTrigger value="groups" className="flex items-center gap-2">
                  <Users className="h-4 w-4" />
                  Groups & Projects
                </TabsTrigger>
              </TabsList>

              <TabsContent value="direct" className="flex-1 overflow-auto mt-0">
                <ConversationList
                  onSelectConversation={handleSelectConversation}
                  selectedId={selectedConversationId}
                />
              </TabsContent>

              <TabsContent value="groups" className="flex-1 overflow-auto mt-0">
                <ConversationList
                  onSelectConversation={handleSelectConversation}
                  selectedId={selectedConversationId}
                />
              </TabsContent>
            </Tabs>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
