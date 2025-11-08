import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { ChevronLeft, ChevronRight, Sparkles, Calendar, MapPin } from 'lucide-react';
import { 
  format, 
  startOfMonth, 
  endOfMonth, 
  eachDayOfInterval, 
  isSameMonth, 
  isSameDay,
  addMonths,
  subMonths,
  startOfWeek,
  endOfWeek
} from 'date-fns';

interface Event {
  id: string;
  title: string;
  event_date: string;
  event_type: string;
  poster_url?: string;
  location?: string;
}

interface EventsCalendarProps {
  events: Event[];
  onDateClick: (date: Date, events: Event[]) => void;
}

export function EventsCalendar({ events, onDateClick }: EventsCalendarProps) {
  const [currentMonth, setCurrentMonth] = useState(new Date());

  const monthStart = startOfMonth(currentMonth);
  const monthEnd = endOfMonth(currentMonth);
  const calendarStart = startOfWeek(monthStart);
  const calendarEnd = endOfWeek(monthEnd);
  
  const days = eachDayOfInterval({ start: calendarStart, end: calendarEnd });
  const weekDays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  const getEventsForDay = (day: Date) => {
    return events.filter(event => 
      isSameDay(new Date(event.event_date), day)
    );
  };

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
    <div className="space-y-6 animate-scale-in">
      {/* Calendar Header */}
      <Card className="p-6 bg-gradient-to-r from-primary/10 via-accent/10 to-primary/10 border-2 border-primary/20">
        <div className="flex items-center justify-between">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setCurrentMonth(subMonths(currentMonth, 1))}
            className="hover:bg-primary/20 hover:scale-110 transition-all"
          >
            <ChevronLeft className="h-5 w-5" />
          </Button>
          
          <div className="text-center">
            <h2 className="text-3xl font-bold text-gradient flex items-center gap-2 justify-center">
              <Sparkles className="h-6 w-6" />
              {format(currentMonth, 'MMMM yyyy')}
            </h2>
            <p className="text-sm text-muted-foreground mt-1">
              {events.length} events this month
            </p>
          </div>
          
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setCurrentMonth(addMonths(currentMonth, 1))}
            className="hover:bg-primary/20 hover:scale-110 transition-all"
          >
            <ChevronRight className="h-5 w-5" />
          </Button>
        </div>
      </Card>

      {/* Calendar Grid */}
      <Card className="p-6">
        {/* Weekday Headers */}
        <div className="grid grid-cols-7 gap-2 mb-4">
          {weekDays.map(day => (
            <div key={day} className="text-center font-semibold text-sm text-muted-foreground p-2">
              {day}
            </div>
          ))}
        </div>

        {/* Calendar Days */}
        <div className="grid grid-cols-7 gap-2">
          {days.map((day, idx) => {
            const dayEvents = getEventsForDay(day);
            const isCurrentMonth = isSameMonth(day, currentMonth);
            const isToday = isSameDay(day, new Date());

            return (
              <div
                key={idx}
                className={`
                  min-h-[140px] p-2 rounded-xl border-2 transition-all duration-300 relative
                  ${isCurrentMonth ? 'bg-card border-border' : 'bg-muted/30 border-transparent opacity-40'}
                  ${isToday ? 'border-primary shadow-glow-sm' : ''}
                  ${dayEvents.length > 0 ? 'hover:shadow-glow-md cursor-pointer' : ''}
                `}
                onClick={() => dayEvents.length > 0 && onDateClick(day, dayEvents)}
              >
                <div className={`
                  text-sm font-semibold mb-2
                  ${isToday ? 'text-primary' : isCurrentMonth ? 'text-foreground' : 'text-muted-foreground'}
                `}>
                  {format(day, 'd')}
                </div>

                {dayEvents.length > 0 && (
                  <TooltipProvider>
                    <div className="space-y-1">
                      {/* Stacked mini poster cards with reduced size */}
                      {dayEvents.slice(0, 2).map((event, eventIdx) => (
                        <Tooltip key={event.id} delayDuration={200}>
                          <TooltipTrigger asChild>
                            <div
                              className={`
                                relative w-full h-12 rounded-md overflow-hidden border border-primary/30 shadow-sm
                                transition-all hover:shadow-glow-md hover:scale-105 hover:z-10
                              `}
                              style={{
                                marginTop: eventIdx > 0 ? '4px' : '0',
                              }}
                            >
                              <img
                                src={event.poster_url || 'https://via.placeholder.com/300x400?text=Event'}
                                alt={event.title}
                                className="w-full h-full object-cover"
                              />
                              {/* Gradient overlay */}
                              <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                              {/* Event title on image */}
                              <div className="absolute bottom-0 left-0 right-0 p-1">
                                <p className="text-white text-[9px] font-semibold truncate leading-tight">
                                  {event.title}
                                </p>
                              </div>
                            </div>
                          </TooltipTrigger>
                          <TooltipContent side="right" className="max-w-xs">
                            <div className="space-y-1">
                              <p className="font-bold text-sm">{event.title}</p>
                              <div className="flex items-center gap-1 text-xs text-muted-foreground">
                                <Calendar className="h-3 w-3" />
                                {format(new Date(event.event_date), 'MMM d, yyyy')}
                              </div>
                              {event.location && (
                                <div className="flex items-center gap-1 text-xs text-muted-foreground">
                                  <MapPin className="h-3 w-3" />
                                  {event.location}
                                </div>
                              )}
                            </div>
                          </TooltipContent>
                        </Tooltip>
                      ))}
                      
                      {dayEvents.length > 2 && (
                        <div className="text-[10px] text-center font-semibold text-primary mt-1 py-1">
                          +{dayEvents.length - 2} more
                        </div>
                      )}
                    </div>
                  </TooltipProvider>
                )}
              </div>
            );
          })}
        </div>
      </Card>
    </div>
  );
}
