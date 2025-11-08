import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ChevronLeft, ChevronRight, Sparkles } from 'lucide-react';
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
}

interface EventsCalendarProps {
  events: Event[];
  onEventClick: (event: Event) => void;
}

export function EventsCalendar({ events, onEventClick }: EventsCalendarProps) {
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
                  min-h-[100px] p-2 rounded-xl border-2 transition-all duration-300
                  ${isCurrentMonth ? 'bg-card border-border' : 'bg-muted/30 border-transparent opacity-40'}
                  ${isToday ? 'border-primary shadow-glow-sm' : ''}
                  ${dayEvents.length > 0 ? 'hover:shadow-glow-md hover:scale-105 cursor-pointer' : ''}
                `}
              >
                <div className={`
                  text-sm font-semibold mb-2
                  ${isToday ? 'text-primary' : isCurrentMonth ? 'text-foreground' : 'text-muted-foreground'}
                `}>
                  {format(day, 'd')}
                </div>

                {dayEvents.length > 0 && (
                  <div className="space-y-1">
                    {dayEvents.slice(0, 2).map(event => (
                      <Badge
                        key={event.id}
                        className={`w-full justify-start text-[10px] px-2 py-1 cursor-pointer bg-gradient-to-r ${getTypeColor(event.event_type)} text-white border-0 hover:scale-105 transition-transform`}
                        onClick={() => onEventClick(event)}
                      >
                        <span className="truncate">{event.title}</span>
                      </Badge>
                    ))}
                    {dayEvents.length > 2 && (
                      <div className="text-[10px] text-muted-foreground text-center">
                        +{dayEvents.length - 2} more
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </Card>

      {/* Legend */}
      <Card className="p-4">
        <p className="text-sm font-semibold mb-3">Event Types</p>
        <div className="flex flex-wrap gap-2">
          {['Hackathon', 'Workshop', 'Competition', 'Conference'].map(type => (
            <Badge 
              key={type}
              className={`bg-gradient-to-r ${getTypeColor(type)} text-white border-0 px-3 py-1`}
            >
              {type}
            </Badge>
          ))}
        </div>
      </Card>
    </div>
  );
}
