import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { LayoutGrid, CalendarDays, ArrowLeft, Sparkles } from 'lucide-react';
import { EventCard } from '@/components/EventCard';
import { EventsCalendar } from '@/components/EventsCalendar';
import { EventDetailModal } from '@/components/EventDetailModal';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

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

type ViewMode = 'cards' | 'calendar';

export default function EventsPage() {
  const [viewMode, setViewMode] = useState<ViewMode>('cards');
  const [events, setEvents] = useState<Event[]>([]);
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);
  const [showEventModal, setShowEventModal] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchEvents();
  }, []);

  const fetchEvents = async () => {
    try {
      const { data, error } = await supabase
        .from('events' as any)
        .select('*')
        .order('event_date', { ascending: true });

      if (error) throw error;
      setEvents((data as any) || []);
    } catch (error) {
      console.error('Error fetching events:', error);
      toast.error('Failed to load events');
    } finally {
      setLoading(false);
    }
  };

  const handleEventClick = (event: Event) => {
    setSelectedEvent(event);
    setShowEventModal(true);
  };

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-bold text-gradient flex items-center gap-3 mb-2">
            <Sparkles className="h-8 w-8" />
            {viewMode === 'cards' ? 'Upcoming Events' : 'Events Calendar'}
          </h1>
          <p className="text-muted-foreground">
            {viewMode === 'cards' 
              ? 'Discover hackathons, workshops, and networking opportunities'
              : 'View all events in calendar format'}
          </p>
        </div>

        {/* View Toggle */}
        <div className="flex gap-2">
          {viewMode === 'calendar' && (
            <Button
              variant="outline"
              onClick={() => setViewMode('cards')}
              className="hover:scale-105 transition-transform"
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Cards
            </Button>
          )}
          
          {viewMode === 'cards' ? (
            <Button
              variant="gradient"
              onClick={() => setViewMode('calendar')}
              className="shadow-glow-md hover:shadow-glow-lg hover:scale-105"
            >
              <CalendarDays className="mr-2 h-5 w-5" />
              Calendar View
            </Button>
          ) : (
            <Button
              variant="gradient"
              onClick={() => setViewMode('cards')}
              className="shadow-glow-md hover:shadow-glow-lg hover:scale-105"
            >
              <LayoutGrid className="mr-2 h-5 w-5" />
              Card View
            </Button>
          )}
        </div>
      </div>

      {/* Loading State */}
      {loading ? (
        <div className="text-center py-12">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-primary border-t-transparent"></div>
          <p className="mt-4 text-muted-foreground">Loading events...</p>
        </div>
      ) : (
        <>
          {/* Card View */}
          {viewMode === 'cards' && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {events.length > 0 ? (
                events.map((event) => (
                  <EventCard
                    key={event.id}
                    event={event}
                    onClick={() => handleEventClick(event)}
                  />
                ))
              ) : (
                <div className="col-span-full text-center py-12">
                  <Sparkles className="h-16 w-16 mx-auto text-muted-foreground mb-4 opacity-50" />
                  <p className="text-xl text-muted-foreground">No events found</p>
                  <p className="text-sm text-muted-foreground mt-2">
                    Check back later for upcoming events!
                  </p>
                </div>
              )}
            </div>
          )}

          {/* Calendar View */}
          {viewMode === 'calendar' && (
            <EventsCalendar 
              events={events} 
              onEventClick={handleEventClick}
            />
          )}
        </>
      )}

      {/* Event Detail Modal */}
      <EventDetailModal
        event={selectedEvent}
        open={showEventModal}
        onOpenChange={setShowEventModal}
      />
    </div>
  );
}