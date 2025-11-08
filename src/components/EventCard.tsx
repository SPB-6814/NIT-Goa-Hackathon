import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Calendar, MapPin, ExternalLink } from 'lucide-react';
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

interface EventCardProps {
  event: Event;
  onClick: () => void;
}

export function EventCard({ event, onClick }: EventCardProps) {
  const eventDate = new Date(event.event_date);
  
  const getTypeColor = (type: string) => {
    switch (type.toLowerCase()) {
      case 'hackathon': return 'bg-gradient-to-r from-primary to-accent';
      case 'workshop': return 'bg-gradient-to-r from-accent to-destructive';
      case 'competition': return 'bg-gradient-to-r from-success to-primary';
      case 'conference': return 'bg-gradient-to-r from-accent to-primary';
      default: return 'bg-primary';
    }
  };

  return (
    <Card 
      className="card-interactive cursor-pointer group hover:scale-[1.02] transition-all duration-300"
      onClick={onClick}
    >
      <CardHeader>
        <div className="flex items-start justify-between gap-3">
          <div className="flex-1">
            <CardTitle className="text-xl group-hover:text-primary transition-colors">
              {event.title}
            </CardTitle>
            <CardDescription className="mt-2 line-clamp-2">
              {event.description}
            </CardDescription>
          </div>
          <Badge className={`${getTypeColor(event.event_type)} text-white border-0 font-semibold px-3 py-1`}>
            {event.event_type}
          </Badge>
        </div>
      </CardHeader>
      
      <CardContent>
        <div className="flex flex-col gap-3">
          <div className="flex items-center gap-2 text-sm">
            <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center">
              <Calendar className="h-5 w-5 text-primary" />
            </div>
            <div>
              <p className="font-semibold">{format(eventDate, 'MMMM d, yyyy')}</p>
              <p className="text-xs text-muted-foreground">{format(eventDate, 'EEEE')}</p>
            </div>
          </div>
          
          <div className="flex items-center gap-2 text-sm">
            <div className="h-10 w-10 rounded-xl bg-accent/10 flex items-center justify-center">
              <MapPin className="h-5 w-5 text-accent" />
            </div>
            <p className="font-medium">{event.location}</p>
          </div>

          <Button 
            variant="gradient" 
            size="pill" 
            className="w-full mt-2 font-semibold group-hover:shadow-glow-lg"
            onClick={(e) => {
              e.stopPropagation();
              onClick();
            }}
          >
            View Details
            <ExternalLink className="ml-2 h-4 w-4" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
