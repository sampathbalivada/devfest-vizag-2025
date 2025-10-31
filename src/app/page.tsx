
'use client';

import { Button } from "@/components/ui/button";
import { Instagram, Users, Calendar, MapPin, Ticket, BookOpen, ArrowUpRight } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { useAuthState } from 'react-firebase-hooks/auth';
import { auth } from '@/lib/firebase';
import { Skeleton } from "@/components/ui/skeleton";
import config from '@/config.json';
import { Sponsors } from "@/components/sponsors";
import { AnnouncementBanner } from "@/components/announcement-banner";
import { GDGVizagLogo } from "@/components/gdg-logo";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { StatsSection } from "@/components/stats-section";
import { AgendaPromoSection } from "@/components/agenda-promo-section";
import { WorkshopsSection } from "@/components/workshops-section";
import { LiveAgendaSection } from "@/components/live-agenda-section";

const timelines = [
  { event: "Early Bird Registration", date: "October 14" },
  { event: "General Entry Tickets", date: "October 15th - 31st October" },
  { event: "Workshop Agenda Release", date: "1st October" },
  { event: "Final Agenda & Speaker List Release", date: "1 week before event" }
];


export default function Home() {
  const [user, loading] = auth ? useAuthState(auth) : [null, true];

  const renderWelcomeMessage = () => {
    if (!auth) {
      return "Firebase is not configured. Please check your setup.";
    }
    if (loading) {
      return <Skeleton className="h-7 w-96 max-w-full" />;
    }
    if (user) {
      return `Welcome back, ${user.displayName}! We'll keep you updated on ticket availability.`;
    }
    return 'DevFest Vizag 2025 is on its way. Sign in to get notified and stay updated!';
  };

  return (
    <div className="flex flex-grow flex-col items-center animate-fade-in-up w-full">
      <AnnouncementBanner />
      <div className="relative w-full">
        <div className="absolute inset-0">
          <Image
            src="/images/gallery/IMG_00000.jpg"
            alt="DevFest Vizag event"
            fill
            className="object-cover"
            priority
          />
          <div className="absolute inset-0 bg-gradient-to-b from-background/80 via-background/90 to-background" />
        </div>
        <div className="relative z-10 flex flex-col items-center justify-center p-4 text-center pt-16 pb-12">
          
          <GDGVizagLogo className="h-16 md:h-24 w-auto mb-6" />

          <p className="mt-4 text-lg text-muted-foreground max-w-2xl mx-auto">
            Join us for the largest developer conference in Visakhapatnam, featuring expert speakers, hands-on workshops, and networking opportunities with the best in tech.
          </p>
          
          <div className="mt-8 flex flex-wrap justify-center items-center gap-x-6 gap-y-4 text-muted-foreground">
              <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4" />
                  <span>1st November 2025</span>
              </div>
              <div className="flex items-center gap-2">
                  <MapPin className="h-4 w-4" />
                  <Link href="https://share.google/0QmY64oA3sLoM9VMx" target="_blank" rel="noopener noreferrer" className="hover:underline">
                      GITAM University, Visakhapatnam
                  </Link>
              </div>
          </div>

          <div className="mt-8 flex flex-col items-center gap-6">
            <div className="flex flex-col sm:flex-row gap-4">
              <Button asChild size="lg">
                  <Link href="/agenda">
                      <BookOpen />
                      View Agenda
                  </Link>
              </Button>
            </div>
            <div className="flex flex-col sm:flex-row gap-4">
              <Button asChild variant="outline">
                <Link href={config.socials.instagram} target="_blank" rel="noopener noreferrer">
                  <Instagram />
                  Follow on Instagram
                </Link>
              </Button>
              <Button asChild variant="outline">
                <Link href={config.socials.community} target="_blank" rel="noopener noreferrer">
                  <Users />
                  Join Community
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </div>
      
      <LiveAgendaSection />
      
      <StatsSection />

      <AgendaPromoSection />
      
      <WorkshopsSection />

      <Sponsors />
    </div>
  );
}
