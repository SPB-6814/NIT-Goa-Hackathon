import {
  Dialog,
  DialogContent,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { ExternalLink, Star, X } from 'lucide-react';
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

interface EventPosterModalProps {
  event: Event | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function EventPosterModal({ event, open, onOpenChange }: EventPosterModalProps) {
  if (!event) return null;

  const handleRegister = () => {
    if (event.registration_url) {
      window.open(event.registration_url, '_blank');
    } else {
      toast.success('Registration link will be available soon!');
    }
  };

  const handleInterested = () => {
    toast.success(`Marked as interested in ${event.title}!`, {
      description: 'You\'ll receive updates about this event.',
      icon: '⭐',
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl h-[95vh] p-0 bg-background/95 backdrop-blur-sm border-2 border-primary/20">
        {/* Close Button */}
        <button
          onClick={() => onOpenChange(false)}
          className="absolute right-4 top-4 z-50 rounded-full p-2 bg-background/80 backdrop-blur-sm border-2 border-border hover:bg-destructive hover:border-destructive transition-all duration-300 hover:scale-110 group"
        >
          <X className="h-5 w-5 group-hover:text-destructive-foreground" />
        </button>

        <div className="flex flex-col h-full">
          {/* Poster Image - Takes up most of the vertical space */}
          <div className="flex-1 overflow-y-auto p-6 flex items-center justify-center">
            <img
              src={event.poster_url || 'https://via.placeholder.com/600x800?text=Event+Poster'}
              alt={event.title}
              className="max-w-full h-auto max-h-full object-contain rounded-lg shadow-2xl shadow-primary/20"
            />
          </div>

          {/* Action Buttons at Bottom */}
          <div className="p-6 bg-gradient-to-t from-background via-background to-transparent border-t-2 border-border">
            <div className="flex gap-4">
              <Button
                variant="outline"
                size="lg"
                className="flex-1 font-semibold border-2 hover:scale-105 transition-all"
                onClick={handleInterested}
              >
                <Star className="mr-2 h-5 w-5" />
                Interested
              </Button>
              <Button
                variant="gradient"
                size="lg"
                className="flex-1 font-semibold shadow-glow-lg hover:shadow-glow-orange hover:scale-105 transition-all"
                onClick={handleRegister}
              >
                <ExternalLink className="mr-2 h-5 w-5" />
                Register Now
              </Button>
            </div>
            <p className="text-xs text-center text-muted-foreground mt-3">
              {event.title} • {event.location}
            </p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
