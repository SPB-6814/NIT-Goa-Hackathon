import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Calendar, MapPin } from 'lucide-react';

const events = [
  {
    id: 1,
    title: 'HackMIT 2024',
    description: "MIT's annual hackathon bringing together students from around the world",
    date: 'September 14-15, 2024',
    location: 'MIT Campus, Cambridge MA',
    type: 'Hackathon',
  },
  {
    id: 2,
    title: 'React Workshop',
    description: 'Learn modern React development with hooks and best practices',
    date: 'October 5, 2024',
    location: 'Online',
    type: 'Workshop',
  },
  {
    id: 3,
    title: 'Startup Weekend',
    description: '54-hour event where you can pitch ideas, form teams, and launch startups',
    date: 'November 1-3, 2024',
    location: 'Innovation Hub',
    type: 'Competition',
  },
  {
    id: 4,
    title: 'AI & ML Symposium',
    description: 'Explore the latest in artificial intelligence and machine learning',
    date: 'December 10, 2024',
    location: 'University Auditorium',
    type: 'Conference',
  },
];

export default function EventsPage() {
  return (
    <div className="p-6 max-w-5xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Upcoming Events</h1>
        <p className="text-muted-foreground">
          Discover hackathons, workshops, and networking opportunities
        </p>
      </div>

      <div className="grid gap-4">
        {events.map((event) => (
          <Card key={event.id} className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <div className="flex items-start justify-between">
                <div>
                  <CardTitle className="text-xl mb-2">{event.title}</CardTitle>
                  <CardDescription>{event.description}</CardDescription>
                </div>
                <Badge variant="outline">{event.type}</Badge>
              </div>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col gap-2 text-sm text-muted-foreground">
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4" />
                  {event.date}
                </div>
                <div className="flex items-center gap-2">
                  <MapPin className="h-4 w-4" />
                  {event.location}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}