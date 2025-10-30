import { getAgenda, getAgendaTracks } from '@/app/agenda/actions';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { User, Clock } from 'lucide-react';
import type { AgendaItem, AgendaTrack } from '@/types';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';

export const dynamic = 'force-dynamic';

function AgendaCard({ item }: { item: AgendaItem }) {
  const hasDetails = item.speaker || item.description;

  return (
    <div className="py-4">
      <div className="flex items-start gap-4">
        <div className="w-24 text-right text-sm font-semibold text-primary">
          {item.startTime}
        </div>
        <div className="flex-1">
          {hasDetails ? (
             <Accordion type="single" collapsible>
                <AccordionItem value={item.id} className="border-none">
                    <AccordionTrigger className="p-0 hover:no-underline">
                        <div className="flex-1 text-left">
                            <p className="font-bold">{item.title}</p>
                            <div className="flex items-center gap-2 text-sm text-muted-foreground mt-1">
                                {item.speaker && <span>{item.speaker}</span>}
                                {item.category && <Badge variant="outline">{item.category}</Badge>}
                            </div>
                        </div>
                    </AccordionTrigger>
                    <AccordionContent className="pt-4 pb-0">
                         {item.description && <p className="text-sm text-muted-foreground">{item.description}</p>}
                    </AccordionContent>
                </AccordionItem>
            </Accordion>
          ) : (
             <div>
                <p className="font-bold">{item.title}</p>
                 <div className="flex items-center gap-2 text-sm text-muted-foreground mt-1">
                    {item.category && <Badge variant="outline">{item.category}</Badge>}
                </div>
            </div>
          )}
        </div>
        <div className="w-20 text-sm text-muted-foreground">
          <div className="flex items-center gap-1">
            <Clock className="h-3 w-3" />
            <span>{item.startTime}</span>
          </div>
        </div>
      </div>
    </div>
  );
}


export default async function AgendaPage() {
  const allAgendaItems = await getAgenda();
  const allTracks = await getAgendaTracks();

  // Sort all items by start time initially for the 'All' tab
  const sortedAllItems = [...allAgendaItems].sort((a, b) => a.startTime.localeCompare(b.startTime));

  // Get a sorted list of track names for the tabs
  const sortedTrackNames = allTracks.map(t => t.name).sort((a, b) => {
    if (a.toLowerCase().includes('main') || a.toLowerCase().includes('general')) return -1;
    if (b.toLowerCase().includes('main') || b.toLowerCase().includes('general')) return 1;
    return a.localeCompare(b);
  });
  
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

      {sortedAllItems.length > 0 ? (
         <Tabs defaultValue="all" className="w-full max-w-4xl mx-auto">
          <TabsList className="grid w-full grid-cols-2 md:grid-cols-4 lg:grid-cols-5 mb-8">
            <TabsTrigger value="all">All</TabsTrigger>
            {allTracks.map(track => (
              <TabsTrigger key={track.id} value={track.id}>{track.name}</TabsTrigger>
            ))}
          </TabsList>
          
          <TabsContent value="all">
            <Card>
                <CardContent className="divide-y">
                    {sortedAllItems.map(item => <AgendaCard key={item.id} item={item} />)}
                </CardContent>
            </Card>
          </TabsContent>

          {allTracks.map(track => (
            <TabsContent key={track.id} value={track.id}>
                 <Card>
                    <CardContent className="divide-y">
                        {sortedAllItems.filter(item => item.trackId === track.id).map(item => (
                            <AgendaCard key={item.id} item={item} />
                        ))}
                    </CardContent>
                </Card>
            </TabsContent>
          ))}
        </Tabs>
      ) : (
        <div className="text-center py-16">
          <p className="text-muted-foreground text-lg">The agenda is being finalized. Check back soon!</p>
        </div>
      )}
    </div>
  );
}
