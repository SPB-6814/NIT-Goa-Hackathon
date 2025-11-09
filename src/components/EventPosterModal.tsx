import { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { ExternalLink, Star, X } from 'lucide-react';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { findEventTeammates } from '@/services/geminiMatchingService';

interface Event {
  id: string;
  title: string;
  description: string;
  event_date: string;
  location: string;
  event_type: string;
  poster_url?: string;
  registration_url?: string;
}

interface EventPosterModalProps {
  event: Event | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function EventPosterModal({ event, open, onOpenChange }: EventPosterModalProps) {
  const { user } = useAuth();
  const [isInterested, setIsInterested] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (event && user) {
      checkIfInterested();
    }
  }, [event, user]);

  const checkIfInterested = async () => {
    if (!user || !event) return;
    
    try {
      const { data, error } = await supabase
        .from('event_interests')
        .select('*')
        .eq('event_id', event.id)
        .eq('user_id', user.id)
        .maybeSingle();

      if (error) {
        console.error('Error checking interest:', error);
        return;
      }

      setIsInterested(!!data);
    } catch (error) {
      console.error('Error checking interest:', error);
    }
  };

  const handleRegister = () => {
    if (event.registration_url) {
      window.open(event.registration_url, '_blank');
    } else {
      toast.success('Registration link will be available soon!');
    }
  };

  const handleInterested = async () => {
    if (!user || !event) {
      toast.error('Please log in to mark interest');
      return;
    }

    if (isInterested) {
      // Remove interest
      try {
        setIsLoading(true);
        const { error } = await supabase
          .from('event_interests')
          .delete()
          .eq('event_id', event.id)
          .eq('user_id', user.id);

        if (error) throw error;

        setIsInterested(false);
        toast.success('Interest removed', {
          description: 'You won\'t receive updates about this event.',
        });
      } catch (error) {
        console.error('Error removing interest:', error);
        toast.error('Failed to remove interest');
      } finally {
        setIsLoading(false);
      }
    } else {
      // Mark interest and trigger AI matching
      try {
        setIsLoading(true);
        const { error } = await supabase
          .from('event_interests')
          .insert({
            event_id: event.id,
            user_id: user.id,
          });

        if (error) throw error;

        setIsInterested(true);
        toast.success(`Marked as interested in ${event.title}!`, {
          description: 'Searching for compatible teammates...',
          icon: '⭐',
        });

        // Trigger AI teammate matching
        await findEventTeammates(event.id);
      } catch (error) {
        console.error('Error marking interest:', error);
        toast.error('Failed to mark interest');
      } finally {
        setIsLoading(false);
      }
    }
  };

  if (!event) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] p-0 bg-background border-2 border-primary/20 overflow-hidden">
        {/* Close Button */}
        <button
          onClick={() => onOpenChange(false)}
          className="absolute right-4 top-4 z-50 rounded-full p-2 bg-background/90 backdrop-blur-sm border-2 border-border hover:bg-destructive hover:border-destructive transition-all duration-300 hover:scale-110 group shadow-lg"
        >
          <X className="h-5 w-5 group-hover:text-destructive-foreground" />
        </button>

        <div className="flex flex-col h-full max-h-[90vh]">
          {/* Poster Image - Scrollable with controlled height */}
          <div className="flex-1 overflow-y-auto p-4 md:p-6 bg-gradient-to-b from-muted/20 to-background">
            <div className="flex items-center justify-center min-h-full">
              <img
                src={event.poster_url || 'https://via.placeholder.com/600x800?text=Event+Poster'}
                alt={event.title}
                className="w-full max-w-2xl h-auto rounded-lg shadow-2xl shadow-primary/20 border border-border/50"
              />
            </div>
          </div>

          {/* Action Buttons at Bottom - Fixed position, always visible */}
          <div className="flex-shrink-0 p-4 md:p-6 bg-gradient-to-t from-background via-background/95 to-background/80 border-t-2 border-primary/20 backdrop-blur-sm shadow-[0_-4px_12px_rgba(0,0,0,0.1)]">
            <div className="flex flex-col sm:flex-row gap-3">
              <Button
                variant={isInterested ? "default" : "outline"}
                size="lg"
                className="flex-1 font-semibold border-2 hover:scale-[1.02] hover:border-primary transition-all"
                onClick={handleInterested}
                disabled={isLoading}
              >
                {isInterested ? (
                  <Star className="mr-2 h-5 w-5 fill-current" />
                ) : (
                  <Star className="mr-2 h-5 w-5" />
                )}
                {isInterested ? 'Interested' : 'Mark Interested'}
              </Button>
              <Button
                variant="gradient"
                size="lg"
                className="flex-1 font-semibold shadow-lg hover:shadow-xl hover:scale-[1.02] transition-all"
                onClick={handleRegister}
              >
                <ExternalLink className="mr-2 h-5 w-5" />
                Register Now
              </Button>
            </div>
            <p className="text-xs text-center text-muted-foreground mt-3 font-medium">
              {event.title} • {event.location}
            </p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
