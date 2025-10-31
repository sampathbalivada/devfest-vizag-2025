
import type { Timestamp } from "firebase-admin/firestore";

export interface Job {
  id: string;
  title: string;
  description: string;
  category: 'Lead' | 'Volunteer';
  additionalQuestions?: string[];
  status?: 'open' | 'closed';
}

export type ApplicationStatus = 'Applied' | 'Shortlisted' | 'Accepted' | 'Rejected';

export interface JobApplication {
    id: string; // The firestore document ID
    jobId: string;
    jobTitle: string;
    userId: string;
    userEmail: string;
    fullName: string;
    phone: string;
    whatsapp: string;
    answers: Record<string, string>;
    submittedAt: Timestamp;
    status: ApplicationStatus;
}


// A version of JobApplication that is safe to pass to client components
export type ClientJobApplication = Omit<JobApplication, 'submittedAt'> & {
  submittedAt: string; // Serialized from Timestamp
};

export interface AdminUser {
  uid: string;
  email: string;
}

export type UserRole = 'Admin' | 'Team Lead' | 'Volunteer' | 'Speaker' | 'Attendee';

export interface Volunteer {
  id: string; // This will be the user's UID
  fullName: string;
  email: string;
  phone: string;
  jobTitle: string;
  teamId?: string | null;
  isLead?: boolean;
}

export interface Team {
  id:string;
  name: string;
}

export type TaskStatus = 'To Do' | 'In Progress' | 'Done';

export interface Task {
  id: string;
  title: string;
  description?: string;
  status: TaskStatus;
  assigneeId: string; // UID of the volunteer
  assigneeName: string; 
  teamId: string | null;
  dueDate?: string | null; // ISO string
  createdAt: string; // ISO string
  createdBy: string; // UID of creator
  creatorName: string;
}

export interface AgendaTrack {
  id: string;
  name: string;
  order?: number;
}

export const agendaCategories = ['Cloud', 'AI', 'Web', 'Mobile', 'Firebase', 'Entrepreneurship', 'Other'] as const;
export type AgendaCategory = (typeof agendaCategories)[number];

export const difficultyLevels = ['Beginners', 'Intermediate', 'Experts'] as const;
export type Difficulty = (typeof difficultyLevels)[number];

export interface AgendaItem {
  id: string;
  title: string;
  speaker?: string;
  description?: string;
  trackId: string;
  trackName: string; // Denormalized for easier display
  startTime: string; // HH:MM
  endTime: string; // HH:MM
  category?: AgendaCategory;
  difficulty?: Difficulty[];
}

export interface Announcement {
  id: string;
  content: string;
  createdAt: string; // ISO string date
}

export interface SiteSettings {
  showLiveAgenda: boolean;
}
