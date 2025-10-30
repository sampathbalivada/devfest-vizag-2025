
'use server';

import { adminDb } from '@/lib/firebase-admin';
import { AgendaItem, AgendaTrack, agendaCategories } from '@/types';
import { z } from 'zod';
import { isAdmin } from '../volunteer/actions';
import { revalidatePath } from 'next/cache';

const AgendaItemSchema = z.object({
  id: z.string().optional(),
  title: z.string().min(3, 'Title is required.'),
  speaker: z.string().optional(),
  description: z.string().optional(),
  trackId: z.string().min(1, 'A track must be selected.'),
  startTime: z.string().regex(/^\d{2}:\d{2}$/, 'Start time must be in HH:MM format.'),
  endTime: z.string().regex(/^\d{2}:\d{2}$/, 'End time must be in HH:MM format.'),
  category: z.enum(agendaCategories).optional(),
}).refine(data => data.endTime > data.startTime, {
  message: "End time must be after start time.",
  path: ["endTime"],
});

const AgendaTrackSchema = z.object({
  id: z.string().optional(),
  name: z.string().min(1, 'Track name cannot be empty.'),
  order: z.coerce.number().optional(),
});

export async function getAgenda(): Promise<AgendaItem[]> {
  try {
    const snapshot = await adminDb.collection('agenda').orderBy('startTime').get();
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as AgendaItem));
  } catch (error) {
    console.error("Error fetching agenda: ", error);
    return [];
  }
}

export async function manageAgendaItem(formData: FormData, token: string) {
  const adminCheck = await isAdmin(token);
  if (!adminCheck.isAdmin) {
    return { error: 'Unauthorized' };
  }

  const rawData = Object.fromEntries(formData.entries());
  const validation = AgendaItemSchema.safeParse(rawData);

  if (!validation.success) {
    const errorDetails = validation.error.flatten().fieldErrors;
    console.error("Validation failed:", errorDetails);
    return { error: 'Invalid data', details: errorDetails };
  }

  const { id, trackId, ...itemData } = validation.data;
  
  const trackDoc = await adminDb.collection('agendaTracks').doc(trackId).get();
  if (!trackDoc.exists) {
    return { error: 'Selected track does not exist.' };
  }
  const trackName = trackDoc.data()?.name;

  const finalItemData = { ...itemData, trackId, trackName };

  try {
    if (id) {
      await adminDb.collection('agenda').doc(id).update(finalItemData);
    } else {
      await adminDb.collection('agenda').add(finalItemData);
    }
    revalidatePath('/agenda');
    revalidatePath('/admin');
    return { success: true };
  } catch (error) {
    console.error("Error managing agenda item:", error);
    return { error: 'Failed to save agenda item.' };
  }
}

export async function deleteAgendaItem(id: string, token: string) {
  const adminCheck = await isAdmin(token);
  if (!adminCheck.isAdmin) {
    return { error: 'Unauthorized' };
  }

  try {
    await adminDb.collection('agenda').doc(id).delete();
    revalidatePath('/agenda');
    revalidatePath('/admin');
    return { success: true };
  } catch (error) {
    console.error("Error deleting agenda item:", error);
    return { error: 'Failed to delete agenda item.' };
  }
}

// Track Actions
export async function getAgendaTracks(): Promise<AgendaTrack[]> {
    try {
        const snapshot = await adminDb.collection('agendaTracks').orderBy('order').orderBy('name').get();
        return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as AgendaTrack));
    } catch (error) {
        console.error("Error fetching agenda tracks: ", error);
        return [];
    }
}

export async function manageAgendaTrack(formData: FormData, token: string) {
    const adminCheck = await isAdmin(token);
    if (!adminCheck.isAdmin) return { error: 'Unauthorized' };

    const rawData = Object.fromEntries(formData.entries());
    const validation = AgendaTrackSchema.safeParse(rawData);

    if (!validation.success) {
        return { error: 'Invalid data', details: validation.error.flatten().fieldErrors };
    }
    
    const { id, ...data } = validation.data;

    try {
        if (id) {
            // Update existing track and denormalized data in agenda items
            const trackRef = adminDb.collection('agendaTracks').doc(id);
            const batch = adminDb.batch();
            
            batch.update(trackRef, { name: data.name, order: data.order ?? 100 });

            if (data.name) {
              const itemsToUpdateSnapshot = await adminDb.collection('agenda').where('trackId', '==', id).get();
              itemsToUpdateSnapshot.docs.forEach(doc => {
                  batch.update(doc.ref, { trackName: data.name });
              });
            }
            
            await batch.commit();
        } else {
             const trackCount = (await adminDb.collection('agendaTracks').count().get()).data().count;
            // Add new track
            await adminDb.collection('agendaTracks').add({ 
              name: data.name, 
              order: data.order ?? (trackCount + 1) * 10 
            });
        }
        revalidatePath('/admin');
        revalidatePath('/agenda');
        return { success: true };
    } catch (error) {
        console.error("Error managing agenda track: ", error);
        return { error: 'Failed to save track.' };
    }
}

export async function deleteAgendaTrack(id: string, token: string) {
    const adminCheck = await isAdmin(token);
    if (!adminCheck.isAdmin) return { error: 'Unauthorized' };
    
    try {
        const itemsInTrack = await adminDb.collection('agenda').where('trackId', '==', id).limit(1).get();
        if (!itemsInTrack.empty) {
            return { error: 'Cannot delete track. It is currently in use by one or more agenda items.' };
        }
        
        await adminDb.collection('agendaTracks').doc(id).delete();
        revalidatePath('/admin');
        return { success: true };
    } catch (error) {
        console.error("Error deleting agenda track: ", error);
        return { error: 'Failed to delete track.' };
    }
}
