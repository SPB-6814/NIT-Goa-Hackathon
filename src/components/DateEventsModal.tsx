import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Calendar } from 'lucide-react';
import { format } from 'date-fns';

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

interface DateEventsModalProps {
  events: Event[];
  date: Date | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onEventClick: (event: Event) => void;
}

export function DateEventsModal({ events, date, open, onOpenChange, onEventClick }: DateEventsModalProps) {
  if (!date) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh]">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold text-gradient flex items-center gap-2">
            <Calendar className="h-6 w-6" />
            Events on {format(date, 'MMMM d, yyyy')}
          </DialogTitle>
        </DialogHeader>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 overflow-y-auto max-h-[70vh] p-2">
          {events.map((event) => (
            <div
              key={event.id}
              className="relative group cursor-pointer overflow-hidden rounded-lg border-2 border-border hover:border-primary transition-all duration-300 hover:shadow-glow-md hover:scale-[1.02]"
              onClick={() => {
                onEventClick(event);
                onOpenChange(false);
              }}
            >
              <div className="aspect-[3/4] overflow-hidden">
                <img
                  src={event.poster_url || 'https://via.placeholder.com/400x600?text=Event+Poster'}
                  alt={event.title}
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                />
              </div>
              
              {/* Overlay with title and location */}
              <div className="absolute inset-0 bg-gradient-to-t from-black via-black/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-end p-4">
                <h3 className="text-white font-bold text-lg mb-1">{event.title}</h3>
                <p className="text-white/80 text-sm">{event.location}</p>
              </div>
            </div>
          ))}
        </div>

        {events.length === 0 && (
          <div className="text-center py-12 text-muted-foreground">
            <Calendar className="h-16 w-16 mx-auto mb-4 opacity-20" />
            <p>No events on this date</p>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
