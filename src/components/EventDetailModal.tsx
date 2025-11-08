import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Calendar, MapPin, ExternalLink, FileText, Sparkles } from 'lucide-react';
import { format } from 'date-fns';

interface Event {
  id: string;
  title: string;
  description: string;
  event_date: string;
  location: string;
  event_type: string;
  brochure_url?: string;
  registration_url?: string;
}

interface EventDetailModalProps {
  event: Event | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function EventDetailModal({ event, open, onOpenChange }: EventDetailModalProps) {
  if (!event) return null;

  const getTypeColor = (type: string) => {
    switch (type.toLowerCase()) {
      case 'hackathon': return 'from-primary to-accent';
      case 'workshop': return 'from-accent to-destructive';
      case 'competition': return 'from-success to-primary';
      case 'conference': return 'from-accent to-primary';
      default: return 'from-primary to-accent';
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-start justify-between gap-4 mb-2">
            <DialogTitle className="text-3xl font-bold text-gradient flex items-center gap-2 flex-1">
              <Sparkles className="h-7 w-7" />
              {event.title}
            </DialogTitle>
            <Badge 
              className={`bg-gradient-to-r ${getTypeColor(event.event_type)} text-white border-0 px-3 py-1`}
            >
              {event.event_type}
            </Badge>
          </div>
          <DialogDescription className="text-base">
            {event.description}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 mt-4">
          {/* Event Details */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex items-center gap-3 p-3 rounded-xl bg-primary/10 border border-primary/20">
              <Calendar className="h-5 w-5 text-primary" />
              <div>
                <p className="text-xs text-muted-foreground">Date</p>
                <p className="font-semibold">
                  {format(new Date(event.event_date), 'PPP')}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3 p-3 rounded-xl bg-accent/10 border border-accent/20">
              <MapPin className="h-5 w-5 text-accent" />
              <div>
                <p className="text-xs text-muted-foreground">Location</p>
                <p className="font-semibold">{event.location}</p>
              </div>
            </div>
          </div>

          {/* Brochure Preview */}
          {event.brochure_url && (
            <div className="space-y-3">
              <h3 className="font-bold text-lg flex items-center gap-2">
                <FileText className="h-5 w-5 text-primary" />
                Event Brochure
              </h3>
              <div className="relative rounded-xl overflow-hidden border-2 border-primary/20 group">
                <img 
                  src={event.brochure_url} 
                  alt={`${event.title} brochure`}
                  className="w-full h-auto object-contain max-h-[400px] transition-transform duration-300 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              </div>
              <Button
                variant="outline"
                className="w-full hover:scale-105"
                onClick={() => window.open(event.brochure_url, '_blank')}
              >
                <FileText className="mr-2 h-4 w-4" />
                View Full Brochure
              </Button>
            </div>
          )}

          {/* Registration Button */}
          {event.registration_url && (
            <div className="space-y-3">
              <Button
                variant="gradient"
                size="lg"
                className="w-full text-lg font-bold shadow-glow-lg hover:shadow-glow-orange hover:scale-105"
                onClick={() => window.open(event.registration_url, '_blank')}
              >
                <ExternalLink className="mr-2 h-5 w-5" />
                Register Now
              </Button>
              <p className="text-xs text-center text-muted-foreground">
                You'll be redirected to the registration page
              </p>
            </div>
          )}

          {/* Additional Info */}
          <div className="p-4 rounded-xl bg-gradient-to-r from-primary/5 via-accent/5 to-primary/5 border border-primary/10">
            <p className="text-sm text-muted-foreground">
              <span className="font-semibold text-foreground">Pro Tip:</span> Don't miss out on this amazing opportunity! 
              {event.event_type.toLowerCase() === 'hackathon' && " Team up with fellow participants and build something incredible!"}
              {event.event_type.toLowerCase() === 'workshop' && " Enhance your skills with hands-on learning!"}
              {event.event_type.toLowerCase() === 'competition' && " Test your abilities and compete for exciting prizes!"}
              {event.event_type.toLowerCase() === 'conference' && " Network with industry professionals and gain valuable insights!"}
            </p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
