
'use client';

import { useState, useEffect, useMemo } from 'react';
import { getAgenda, getAgendaTracks } from '@/app/agenda/actions';
import { getSiteSettings } from '@/app/settings/actions';
import type { AgendaItem, AgendaTrack, SiteSettings } from '@/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import { Clock, Video } from 'lucide-react';
import Link from 'next/link';

// Helper to get current time in Asia/Kolkata
function getCurrentKolkataTime() {
    const now = new Date();
    const kolkataTime = new Date(now.toLocaleString('en-US', { timeZone: 'Asia/Kolkata' }));
    return kolkataTime;
}


// This component fetches data on the client side.
export function LiveAgendaSection() {
    const [settings, setSettings] = useState<SiteSettings | null>(null);
    const [agenda, setAgenda] = useState<AgendaItem[]>([]);
    const [tracks, setTracks] = useState<AgendaTrack[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [currentTime, setCurrentTime] = useState(getCurrentKolkataTime());

    useEffect(() => {
        const fetchData = async () => {
            setIsLoading(true);
            try {
                const [settingsData, agendaData, tracksData] = await Promise.all([
                    getSiteSettings(),
                    getAgenda(),
                    getAgendaTracks(),
                ]);
                setSettings(settingsData);
                setAgenda(agendaData);
                setTracks(tracksData);
            } catch (error) {
                console.error("Failed to fetch live agenda data:", error);
            } finally {
                setIsLoading(false);
            }
        };

        fetchData();

        // Update current time every minute
        const interval = setInterval(() => {
            setCurrentTime(getCurrentKolkataTime());
        }, 60000);

        return () => clearInterval(interval);
    }, []);

    const { happeningNow, upcoming } = useMemo(() => {
        if (!agenda.length) return { happeningNow: [], upcoming: [] };

        const now = currentTime;
        const todayDateStr = now.toISOString().split('T')[0];
        
        const nowTime = now.getHours() * 60 + now.getMinutes();

        const happeningNow: AgendaItem[] = [];
        const upcoming: AgendaItem[] = [];

        agenda.forEach(item => {
            const [startHour, startMinute] = item.startTime.split(':').map(Number);
            const [endHour, endMinute] = item.endTime.split(':').map(Number);
            
            const startTime = startHour * 60 + startMinute;
            const endTime = endHour * 60 + endMinute;

            if (nowTime >= startTime && nowTime < endTime) {
                happeningNow.push(item);
            } else if (startTime > nowTime && startTime <= nowTime + 60) {
                // Upcoming in the next 60 minutes
                upcoming.push(item);
            }
        });
        
        return {
            happeningNow,
            upcoming: upcoming.sort((a, b) => a.startTime.localeCompare(b.startTime)).slice(0, 2), // Limit to next 2
        };
    }, [agenda, currentTime]);
    
    if (isLoading) {
        return (
            <section className="w-full max-w-4xl mx-auto py-12 px-4">
                <Skeleton className="h-40 w-full" />
            </section>
        );
    }

    if (!settings?.showLiveAgenda) {
        return null;
    }
    
    const hasLiveOrUpcoming = happeningNow.length > 0 || upcoming.length > 0;

    return (
        <section id="live-now" className="w-full max-w-4xl mx-auto py-12 px-4 scroll-mt-20">
            <Card className="bg-background/80 backdrop-blur-sm">
                <CardHeader>
                    <CardTitle className="text-2xl md:text-3xl text-center">
                        Happening Now & Next
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    {hasLiveOrUpcoming ? (
                        <div className="space-y-6">
                            {happeningNow.length > 0 && (
                                <div className="space-y-4">
                                     <h3 className="text-lg font-semibold flex items-center gap-2 text-red-500">
                                        <Video className="animate-pulse" /> Live Now
                                    </h3>
                                    <div className="space-y-3">
                                        {happeningNow.map(item => <AgendaCard key={item.id} item={item} tracks={tracks} />)}
                                    </div>
                                </div>
                            )}
                             {upcoming.length > 0 && (
                                <div className="space-y-4">
                                     <h3 className="text-lg font-semibold flex items-center gap-2 text-blue-500">
                                        <Clock /> Upcoming
                                    </h3>
                                    <div className="space-y-3">
                                        {upcoming.map(item => <AgendaCard key={item.id} item={item} tracks={tracks} />)}
                                    </div>
                                </div>
                            )}
                        </div>
                    ) : (
                        <p className="text-muted-foreground text-center">
                            No sessions currently running. Check the full{' '}
                            <Link href="/agenda" className="text-primary hover:underline">agenda</Link> for details.
                        </p>
                    )}
                </CardContent>
            </Card>
        </section>
    );
}


function AgendaCard({ item, tracks }: { item: AgendaItem, tracks: AgendaTrack[] }) {
    const trackName = tracks.find(t => t.id === item.trackId)?.name;
    return (
        <div className="p-4 border rounded-lg bg-secondary/30">
            <div className="flex justify-between items-start">
                <div>
                    <p className="font-bold">{item.title}</p>
                    <p className="text-sm text-muted-foreground">{item.speaker}</p>
                </div>
                <Badge variant="outline">{item.startTime} - {item.endTime}</Badge>
            </div>
            {trackName && <Badge variant="secondary" className="mt-2">{trackName}</Badge>}
        </div>
    )
}
