'use client';

import { useEffect, useState } from 'react';
import { useAuthState } from 'react-firebase-hooks/auth';
import { auth } from '@/lib/firebase';
import { getJobs, isAdmin, getApplications, getAdmins } from "@/app/volunteer/actions";
import { getAgenda, getAgendaTracks } from '@/app/agenda/actions';
import { getAnnouncements } from '@/app/announcements/actions';
import { getSiteSettings } from '@/app/settings/actions';
import AdminDashboard from "@/components/admin-dashboard";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Loader2, Terminal } from "lucide-react";
import type { Job, ClientJobApplication, AdminUser, AgendaItem, AgendaTrack, Announcement, SiteSettings } from '@/types';

const ITEMS_PER_PAGE = 10;

export default function AdminPage() {
  const [user, loading] = useAuthState(auth);
  const [status, setStatus] = useState({
    isLoading: true,
    isAuthorized: false,
    token: '',
    uid: ''
  });
  const [jobs, setJobs] = useState<Job[]>([]);
  const [applications, setApplications] = useState<ClientJobApplication[]>([]);
  const [nextCursor, setNextCursor] = useState<string | null>(null);
  const [admins, setAdmins] = useState<AdminUser[]>([]);
  const [agenda, setAgenda] = useState<AgendaItem[]>([]);
  const [agendaTracks, setAgendaTracks] = useState<AgendaTrack[]>([]);
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [settings, setSettings] = useState<SiteSettings | null>(null);
  const [refreshKey, setRefreshKey] = useState(0);

  const fetchData = async (idToken: string) => {
    try {
      const [
        initialJobs, 
        initialApplicationsData, 
        initialAdminsData, 
        initialAgendaData,
        initialAgendaTracksData,
        initialAnnouncementsData,
        initialSettingsData
      ] = await Promise.all([
        getJobs(),
        getApplications(idToken, { status: 'All', jobTitle: 'All' }, { limit: ITEMS_PER_PAGE }),
        getAdmins(idToken),
        getAgenda(),
        getAgendaTracks(),
        getAnnouncements(),
        getSiteSettings()
      ]);
      setJobs(initialJobs);
      setApplications(initialApplicationsData.applications);
      setNextCursor(initialApplicationsData.nextCursor);
      if (initialAdminsData.admins) {
        setAdmins(initialAdminsData.admins);
      } else if (initialAdminsData.error) {
        console.error("Error fetching admins:", initialAdminsData.error);
      }
      setAgenda(initialAgendaData);
      setAgendaTracks(initialAgendaTracksData);
      setAnnouncements(initialAnnouncementsData);
      setSettings(initialSettingsData);
    } catch (error) {
       console.error("Error fetching admin data:", error);
       setStatus({ isLoading: false, isAuthorized: false, token: '', uid: '' });
    }
  };

  useEffect(() => {
    const checkAdmin = async () => {
      if (user) {
        try {
          const idToken = await user.getIdToken();
          const adminCheck = await isAdmin(idToken);
          if (adminCheck.isAdmin) {
            setStatus({ isLoading: true, isAuthorized: true, token: idToken, uid: user.uid });
            await fetchData(idToken);
            setStatus(prev => ({ ...prev, isLoading: false }));
          } else {
            setStatus({ isLoading: false, isAuthorized: false, token: '', uid: '' });
          }
        } catch (error) {
           console.error("Error during admin check:", error);
           setStatus({ isLoading: false, isAuthorized: false, token: '', uid: '' });
        }
      } else {
        setStatus({ isLoading: false, isAuthorized: false, token: '', uid: '' });
      }
    };
    if (!loading) {
      checkAdmin();
    }
  }, [user, loading, refreshKey]);

  const handleDataRefresh = () => {
    setRefreshKey(prev => prev + 1);
  }

  if (status.isLoading || !settings) {
    return (
      <div className="container mx-auto py-12 px-4 flex justify-center items-center h-64">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  if (!status.isAuthorized) {
    return (
      <div className="container mx-auto py-12 px-4">
        <Alert variant="destructive">
          <Terminal className="h-4 w-4" />
          <AlertTitle>Access Denied</AlertTitle>
          <AlertDescription>
            You do not have permission to view this page. Please sign in with an admin account.
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-12 px-4">
      <div className="text-center mb-8">
        <h1 className="text-4xl font-bold tracking-tight lg:text-5xl">
          Admin Dashboard
        </h1>
        <p className="mt-4 text-lg text-muted-foreground">
          Manage job postings, applications, and administrators.
        </p>
      </div>
      <AdminDashboard 
        initialJobs={jobs}
        initialApplications={applications}
        initialNextCursor={nextCursor}
        initialAdmins={admins}
        initialAgenda={agenda}
        initialAgendaTracks={agendaTracks}
        initialAnnouncements={announcements}
        initialSettings={settings}
        currentUserUid={status.uid}
        token={status.token}
        onDataRefresh={handleDataRefresh}
      />
    </div>
  );
}
