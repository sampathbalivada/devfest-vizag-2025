

import { getAgenda, getAgendaTracks } from '@/app/agenda/actions';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Clock } from 'lucide-react';
import type { AgendaItem, AgendaTrack } from '@/types';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';

export const revalidate = 0;
export const dynamic = 'force-dynamic';

function getDuration(startTime: string, endTime: string): string {
  try {
    const start = new Date(`1970-01-01T${startTime}:00`);
    const end = new Date(`1970-01-01T${endTime}:00`);
    const diff = (end.getTime() - start.getTime()) / (1000 * 60); // difference in minutes
    if (diff > 0) {
      return `${diff}min`;
    }
    return '';
  } catch (e) {
    return '';
  }
}

function AgendaCard({ item }: { item: AgendaItem }) {
  const hasDetails = item.speaker || item.description;

  return (
    <div className="py-4">
      <div className="flex items-start gap-4">
        <div className="w-24 text-right text-lg font-bold text-primary shrink-0">
          {item.startTime}
        </div>
        <div className="flex-1 min-w-0">
          {hasDetails ? (
             <Accordion type="single" collapsible>
                <AccordionItem value={item.id} className="border-none">
                    <AccordionTrigger className="p-0 hover:no-underline items-start text-left">
                        <div className="flex-1">
                            <p className="font-bold">{item.title}</p>
                            <div className="flex flex-wrap items-center gap-2 text-sm text-muted-foreground mt-1">
                                {item.speaker && <span className="font-medium">{item.speaker}</span>}
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
        <div className="w-20 text-sm text-muted-foreground text-right shrink-0">
          <div className="flex items-center justify-end gap-1">
            <Clock className="h-3 w-3" />
            <span>{getDuration(item.startTime, item.endTime)}</span>
          </div>
        </div>
      </div>
    </div>
  );
}


export default async function AgendaPage() {
  const [allAgendaItems, unsortedTracks] = await Promise.all([
    getAgenda(),
    getAgendaTracks()
  ]);

  const sortedTracks = [...unsortedTracks].sort((a, b) => (a.order ?? 999) - (b.order ?? 999));

  const defaultTab = sortedTracks.length > 0 ? sortedTracks[0].id : '';

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

      {sortedTracks.length > 0 ? (
         <Tabs defaultValue={defaultTab} className="w-full max-w-4xl mx-auto">
          <TabsList className="h-auto flex-wrap sm:flex-nowrap sm:overflow-x-auto sm:justify-start justify-center">
            {sortedTracks.map(track => (
              <TabsTrigger 
                key={track.id} 
                value={track.id} 
                className="data-[state=active]:bg-black data-[state=active]:text-white dark:data-[state=active]:bg-white dark:data-[state=active]:text-black"
              >
                {track.name}
              </TabsTrigger>
            ))}
          </TabsList>
          
          {sortedTracks.map(track => (
            <TabsContent key={track.id} value={track.id} className="mt-8">
                 <Card>
                    <CardContent className="divide-y">
                        {allAgendaItems
                          .filter(item => item.trackId === track.id)
                          .map(item => (
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
