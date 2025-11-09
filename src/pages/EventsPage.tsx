import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { LayoutGrid, CalendarDays, ArrowLeft, Sparkles } from 'lucide-react';
import { EventCard } from '@/components/EventCard';
import { EventsCalendar } from '@/components/EventsCalendar';
import { EventPosterModal } from '@/components/EventPosterModal';
import { DateEventsModal } from '@/components/DateEventsModal';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';

interface Event {
  id: string;
  title: string;
  description: string;
  event_date: string;
  location: string;
  event_type: string;
  tags?: string[];
  poster_url?: string;
  registration_url?: string;
}

type ViewMode = 'cards' | 'calendar';

const EVENT_FILTERS = ['All', 'Technical', 'Cultural', 'Academic', 'Sports', 'Workshop', 'Competition'];

// Hardcoded events with poster URLs and tags
// Using UUID format for compatibility with database
const HARDCODED_EVENTS: Event[] = [
  {
    id: 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11',
    title: 'HackNIT 2025',
    description: 'Annual hackathon bringing together the brightest minds to solve real-world problems',
    event_date: '2025-11-15',
    location: 'NIT Goa Campus',
    event_type: 'hackathon',
    tags: ['Technical', 'Competition'],
    poster_url: 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=600&h=800&fit=crop',
    registration_url: 'https://example.com/register/hacknit2025',
  },
  {
    id: 'b1eebc99-9c0b-4ef8-bb6d-6bb9bd380a22',
    title: 'AI/ML Workshop Series',
    description: 'Hands-on workshop covering latest trends in artificial intelligence and machine learning',
    event_date: '2025-11-20',
    location: 'Computer Lab, Block A',
    event_type: 'workshop',
    tags: ['Technical', 'Workshop', 'Academic'],
    poster_url: 'https://images.unsplash.com/photo-1677442136019-21780ecad995?w=600&h=800&fit=crop',
    registration_url: 'https://example.com/register/aiml-workshop',
  },
  {
    id: 'c2eebc99-9c0b-4ef8-bb6d-6bb9bd380a33',
    title: 'Code Sprint Championship',
    description: 'Competitive programming competition with exciting prizes and challenges',
    event_date: '2025-11-22',
    location: 'Auditorium Hall',
    event_type: 'competition',
    tags: ['Technical', 'Competition'],
    poster_url: 'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=600&h=800&fit=crop',
    registration_url: 'https://example.com/register/code-sprint',
  },
  {
    id: 'd3eebc99-9c0b-4ef8-bb6d-6bb9bd380a44',
    title: 'Tech Confluence 2025',
    description: 'Annual tech conference featuring industry leaders and innovative startups',
    event_date: '2025-11-25',
    location: 'Convention Center',
    event_type: 'conference',
    tags: ['Technical', 'Academic'],
    poster_url: 'https://images.unsplash.com/photo-1505373877841-8d25f7d46678?w=600&h=800&fit=crop',
    registration_url: 'https://example.com/register/tech-confluence',
  },
  {
    id: 'e4eebc99-9c0b-4ef8-bb6d-6bb9bd380a55',
    title: 'Web Development Bootcamp',
    description: 'Intensive 3-day bootcamp on modern web development frameworks and best practices',
    event_date: '2025-11-28',
    location: 'Lab 201, IT Block',
    event_type: 'workshop',
    tags: ['Technical', 'Workshop'],
    poster_url: 'https://images.unsplash.com/photo-1498050108023-c5249f4df085?w=600&h=800&fit=crop',
    registration_url: 'https://example.com/register/webdev-bootcamp',
  },
  {
    id: 'f5eebc99-9c0b-4ef8-bb6d-6bb9bd380a66',
    title: 'Innovation Challenge 2025',
    description: 'Showcase your innovative ideas and compete for funding and mentorship opportunities',
    event_date: '2025-12-05',
    location: 'Innovation Hub',
    event_type: 'competition',
    tags: ['Technical', 'Competition'],
    poster_url: 'https://images.unsplash.com/photo-1519389950473-47ba0277781c?w=600&h=800&fit=crop',
    registration_url: 'https://example.com/register/innovation-challenge',
  },
];

export default function EventsPage() {
  const [viewMode, setViewMode] = useState<ViewMode>('cards');
  const [events, setEvents] = useState<Event[]>(HARDCODED_EVENTS);
  const [filteredEvents, setFilteredEvents] = useState<Event[]>(HARDCODED_EVENTS);
  const [selectedFilter, setSelectedFilter] = useState('All');
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);
  const [showPosterModal, setShowPosterModal] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [selectedDateEvents, setSelectedDateEvents] = useState<Event[]>([]);
  const [showDateEventsModal, setShowDateEventsModal] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Fetch events from database on mount
  useEffect(() => {
    fetchEvents();
  }, []);

  const fetchEvents = async () => {
    try {
      setIsLoading(true);
      const { data, error } = await supabase
        .from('events')
        .select('*')
        .order('event_date', { ascending: true });

      if (error) {
        console.error('Error fetching events:', error);
        // Use hardcoded events as fallback
        console.log('Using hardcoded events as fallback');
        setEvents(HARDCODED_EVENTS);
        setFilteredEvents(HARDCODED_EVENTS);
      } else if (data && data.length > 0) {
        // Use database events
        setEvents(data);
        setFilteredEvents(data);
      } else {
        // No events in database, use hardcoded
        console.log('No events in database, using hardcoded events');
        setEvents(HARDCODED_EVENTS);
        setFilteredEvents(HARDCODED_EVENTS);
      }
    } catch (error) {
      console.error('Error fetching events:', error);
      setEvents(HARDCODED_EVENTS);
      setFilteredEvents(HARDCODED_EVENTS);
    } finally {
      setIsLoading(false);
    }
  };

  // Filter events when filter changes
  const handleFilterChange = (filter: string) => {
    setSelectedFilter(filter);
    if (filter === 'All') {
      setFilteredEvents(events);
    } else {
      const filtered = events.filter(event => 
        event.tags && event.tags.includes(filter)
      );
      setFilteredEvents(filtered);
    }
  };

  const handlePosterClick = (event: Event) => {
    setSelectedEvent(event);
    setShowPosterModal(true);
  };

  const handleInterested = (event: Event) => {
    toast.success(`Marked as interested in ${event.title}!`, {
      description: 'You\'ll receive updates about this event.',
      icon: '⭐',
    });
  };

  const handleDateClick = (date: Date, dateEvents: Event[]) => {
    setSelectedDate(date);
    setSelectedDateEvents(dateEvents);
    setShowDateEventsModal(true);
  };

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6 h-full overflow-y-auto">
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

      {/* Card View - 3 Column Grid */}
      {viewMode === 'cards' && (
        <div className="space-y-6 animate-fade-in">
          {/* Filter Buttons */}
          <div className="flex flex-wrap gap-2 bg-card p-4 rounded-lg border">
            {EVENT_FILTERS.map((filter) => (
              <Button
                key={filter}
                variant={selectedFilter === filter ? 'default' : 'outline'}
                size="sm"
                onClick={() => handleFilterChange(filter)}
                className="text-xs md:text-sm"
              >
                {filter} {filter === 'All' ? 'Events' : ''}
              </Button>
            ))}
          </div>

          {/* Events Grid */}
          {isLoading ? (
            <div className="text-center py-12">
              <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
              <p className="text-muted-foreground mt-4">Loading events...</p>
            </div>
          ) : filteredEvents.length === 0 ? (
            <div className="text-center py-12">
              <Sparkles className="h-16 w-16 text-muted-foreground mx-auto mb-4 opacity-50" />
              <p className="text-muted-foreground text-lg">
                No {selectedFilter === 'All' ? '' : selectedFilter.toLowerCase()} events found
              </p>
              <p className="text-muted-foreground text-sm mt-2">
                Try selecting a different filter
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredEvents.map((event) => (
                <EventCard
                  key={event.id}
                  event={event}
                  onPosterClick={() => handlePosterClick(event)}
                  onInterested={() => handleInterested(event)}
                />
              ))}
            </div>
          )}
        </div>
      )}

      {/* Calendar View */}
      {viewMode === 'calendar' && (
        <div className="space-y-6 animate-fade-in">
          {/* Filter Buttons */}
          <div className="flex flex-wrap gap-2 bg-card p-4 rounded-lg border">
            {EVENT_FILTERS.map((filter) => (
              <Button
                key={filter}
                variant={selectedFilter === filter ? 'default' : 'outline'}
                size="sm"
                onClick={() => handleFilterChange(filter)}
                className="text-xs md:text-sm"
              >
                {filter} {filter === 'All' ? 'Events' : ''}
              </Button>
            ))}
          </div>

          {/* Calendar */}
          <EventsCalendar 
            events={filteredEvents} 
            onDateClick={handleDateClick}
          />
        </div>
      )}

      {/* Event Poster Modal - Maximized View */}
      <EventPosterModal
        event={selectedEvent}
        open={showPosterModal}
        onOpenChange={setShowPosterModal}
      />

      {/* Date Events Modal - Grid of events on a specific date */}
      <DateEventsModal
        events={selectedDateEvents}
        date={selectedDate}
        open={showDateEventsModal}
        onOpenChange={setShowDateEventsModal}
        onEventClick={handlePosterClick}
      />
    </div>
  );
}