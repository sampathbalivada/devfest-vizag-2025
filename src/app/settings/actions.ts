'use server';

import { adminDb } from '@/lib/firebase-admin';
import type { SiteSettings } from '@/types';
import { isAdmin } from '@/app/volunteer/actions';
import { revalidatePath } from 'next/cache';

const SETTINGS_DOC_ID = 'main';

export async function getSiteSettings(): Promise<SiteSettings> {
  try {
    const doc = await adminDb.collection('settings').doc(SETTINGS_DOC_ID).get();
    if (doc.exists) {
      return doc.data() as SiteSettings;
    }
    // Return default settings if document doesn't exist
    return {
      showLiveAgenda: false,
    };
  } catch (error) {
    console.error("Error fetching site settings: ", error);
    // Return default settings on error
    return {
      showLiveAgenda: false,
    };
  }
}

export async function updateSiteSettings(
  settings: Partial<SiteSettings>,
  token: string
): Promise<{ success?: boolean; error?: string }> {
  const adminCheck = await isAdmin(token);
  if (!adminCheck.isAdmin) {
    return { error: 'Unauthorized' };
  }

  try {
    await adminDb.collection('settings').doc(SETTINGS_DOC_ID).set(settings, { merge: true });
    
    // Revalidate paths where these settings might be used
    revalidatePath('/');
    revalidatePath('/admin');
    
    return { success: true };
  } catch (error) {
    console.error("Error updating site settings:", error);
    const errorMessage = error instanceof Error ? error.message : String(error);
    return { error: `Failed to update settings: ${errorMessage}` };
  }
}
