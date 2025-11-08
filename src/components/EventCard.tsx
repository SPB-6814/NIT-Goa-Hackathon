import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Calendar, MapPin, Star, Check } from 'lucide-react';
import { format } from 'date-fns';
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { findEventTeammates } from '@/services/geminiMatchingService';
import { toast } from 'sonner';

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

interface EventCardProps {
  event: Event;
  onPosterClick: () => void;
  onInterested?: () => void; // Make optional since we'll handle it internally
}

export function EventCard({ event, onPosterClick, onInterested }: EventCardProps) {
  const eventDate = new Date(event.event_date);
  const { user } = useAuth();
  const [isInterested, setIsInterested] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    checkIfInterested();
  }, [event.id, user]);

  const checkIfInterested = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('event_interests' as any)
        .select('id')
        .eq('event_id', event.id)
        .eq('user_id', user.id)
        .single();

      if (!error && data) {
        setIsInterested(true);
      }
    } catch (error) {
      // User hasn't marked interest yet
      setIsInterested(false);
    }
  };

  const handleInterested = async () => {
    if (!user) {
      toast.error('Please sign in to mark interest');
      return;
    }

    if (isInterested) {
      toast.info('You already marked interest in this event');
      return;
    }

    setIsLoading(true);

    try {
      // Save interest to database
      const { error: insertError } = await supabase
        .from('event_interests' as any)
        .insert({
          event_id: event.id,
          user_id: user.id,
        });

      if (insertError) throw insertError;

      setIsInterested(true);
      
      // Call the optional callback
      if (onInterested) {
        onInterested();
      }

      toast.success('Marked as interested!', {
        description: 'We\'ll look for potential teammates for you.',
        icon: '⭐',
      });

      // Trigger AI matching in the background
      findEventTeammates(event.id).catch(error => {
        console.error('Error finding teammates:', error);
        // Don't show error to user, this happens in background
      });

    } catch (error: any) {
      console.error('Error marking interest:', error);
      toast.error('Failed to mark interest', {
        description: error.message || 'Please try again',
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="overflow-hidden group hover:shadow-glow-lg transition-all duration-300 hover:scale-[1.02] bg-card border-2 border-border">
      {/* Poster Image - Clickable */}
      <div 
        className="relative w-full aspect-[3/4] overflow-hidden cursor-pointer"
        onClick={onPosterClick}
      >
        <img
          src={event.poster_url || 'https://via.placeholder.com/600x800?text=Event+Poster'}
          alt={event.title}
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
        
        {/* Hover overlay with title */}
        <div className="absolute inset-x-0 bottom-0 p-4 translate-y-full group-hover:translate-y-0 transition-transform duration-300">
          <h3 className="text-white font-bold text-lg line-clamp-2">{event.title}</h3>
        </div>
      </div>

      {/* Footer with Date, Location, and Interested Button */}
      <div className="p-4 space-y-3 bg-gradient-to-b from-card to-card/80">
        <div className="flex items-center justify-between gap-2 text-sm">
          <div className="flex items-center gap-2 flex-1">
            <Calendar className="h-4 w-4 text-primary flex-shrink-0" />
            <span className="font-semibold text-foreground">
              {format(eventDate, 'MMM d, yyyy')}
            </span>
          </div>
          <div className="flex items-center gap-2 flex-1">
            <MapPin className="h-4 w-4 text-accent flex-shrink-0" />
            <span className="text-muted-foreground truncate text-xs">
              {event.location}
            </span>
          </div>
        </div>

        <Button
          variant={isInterested ? 'outline' : 'gradient'}
          size="sm"
          className="w-full font-semibold shadow-glow-md hover:shadow-glow-lg"
          onClick={(e) => {
            e.stopPropagation();
            handleInterested();
          }}
          disabled={isLoading || isInterested}
        >
          {isInterested ? (
            <>
              <Check className="mr-2 h-4 w-4" />
              Already Interested
            </>
          ) : (
            <>
              <Star className="mr-2 h-4 w-4" />
              {isLoading ? 'Processing...' : 'Interested'}
            </>
          )}
        </Button>
      </div>
    </Card>
  );
}
