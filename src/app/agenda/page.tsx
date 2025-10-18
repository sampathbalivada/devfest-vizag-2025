
import { getAgenda } from '@/app/agenda/actions';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { User, Clock } from 'lucide-react';
import type { AgendaItem } from '@/types';

export const dynamic = 'force-dynamic';

// Helper function to group and sort agenda items
function processAgenda(agendaItems: AgendaItem[]) {
  const tracks: { [key: string]: AgendaItem[] } = {};
  agendaItems.forEach(item => {
    const trackKey = item.trackName || 'Unassigned';
    if (!tracks[trackKey]) {
      tracks[trackKey] = [];
    }
    tracks[trackKey].push(item);
  });

  // Sort sessions within each track by start time
  for (const trackName in tracks) {
    tracks[trackName].sort((a, b) => a.startTime.localeCompare(b.startTime));
  }
  
  // Sort tracks alphabetically, except for a potential "Main Stage" or "General" track which should come first
  const sortedTrackNames = Object.keys(tracks).sort((a, b) => {
    if (a.toLowerCase().includes('main') || a.toLowerCase().includes('general')) return -1;
    if (b.toLowerCase().includes('main') || b.toLowerCase().includes('general')) return 1;
    return a.localeCompare(b);
  });

  return { tracks, sortedTrackNames };
}


export default async function AgendaPage() {
  const agendaItems = await getAgenda();
  const { tracks, sortedTrackNames } = processAgenda(agendaItems);

  return (
    <div className="container mx-auto py-12 px-4 animate-fade-in-up">
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold tracking-tight lg:text-5xl">
          Event Tentative Agenda
        </h1>
        <p className="mt-4 text-lg text-muted-foreground max-w-2xl mx-auto">
          Plan your day with our detailed schedule. Sessions for every interest!
        </p>
      </div>

      {sortedTrackNames.length > 0 ? (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
          {sortedTrackNames.map(trackName => (
            <div key={trackName} className="flex flex-col gap-6">
              <h2 className="text-2xl font-bold text-center lg:text-left">{trackName}</h2>
              {tracks[trackName].map(item => (
                <Card key={item.id}>
                  <CardHeader>
                    <div className="flex justify-between items-start gap-2">
                        <div className="flex-grow">
                            <CardTitle className="text-lg mb-2">{item.title}</CardTitle>
                            {item.category && <Badge variant="outline">{item.category}</Badge>}
                        </div>
                        <Badge variant="secondary" className="flex-shrink-0">
                            <Clock className="mr-1.5 h-4 w-4" />
                            {item.startTime} - {item.endTime}
                        </Badge>
                    </div>
                    {item.speaker && (
                        <div className="flex items-center text-sm text-muted-foreground pt-2">
                            <User className="mr-2 h-4 w-4" />
                            <span>{item.speaker}</span>
                        </div>
                    )}
                  </CardHeader>
                  {item.description && (
                    <CardContent>
                      <p className="text-sm text-muted-foreground">{item.description}</p>
                    </CardContent>
                  )}
                </Card>
              ))}
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-16">
          <p className="text-muted-foreground text-lg">The agenda is being finalized. Check back soon!</p>
        </div>
      )}
    </div>
  );
}
