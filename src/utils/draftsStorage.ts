import { CapturedMedia, DraftItem } from '../types';

const DRAFTS_STORAGE_KEY = 'quickstatus_drafts_v1';

/**
 * Retrieve all saved drafts from localStorage
 */
export function getSavedDrafts(): DraftItem[] {
  try {
    const raw = localStorage.getItem(DRAFTS_STORAGE_KEY);
    if (raw) {
      const parsed: DraftItem[] = JSON.parse(raw);
      // Ensure date objects inside media are revived if needed
      return parsed;
    }
  } catch (err) {
    console.warn('Failed to parse drafts from localStorage:', err);
  }
  return [];
}

/**
 * Save a media object as a new draft or update existing draft
 */
export function saveDraft(media: CapturedMedia, title?: string, existingId?: string): { drafts: DraftItem[]; savedDraft: DraftItem } {
  try {
    const drafts = getSavedDrafts();
    const now = new Date().toISOString();

    const newDraft: DraftItem = {
      id: existingId || `draft_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      createdAt: now,
      updatedAt: now,
      title: title || (media.isCollage ? 'Kolase Momen' : media.type === 'video' ? 'Video QuickClip' : 'Foto Status'),
      media: {
        ...media,
        timestamp: new Date(media.timestamp || Date.now()),
      },
    };

    // Filter out if existing ID is being overwritten
    const updated = [newDraft, ...drafts.filter((d) => d.id !== newDraft.id)].slice(0, 30);
    localStorage.setItem(DRAFTS_STORAGE_KEY, JSON.stringify(updated));
    return { drafts: updated, savedDraft: newDraft };
  } catch (err) {
    console.warn('Failed to save draft to localStorage:', err);
    return { drafts: getSavedDrafts(), savedDraft: {} as DraftItem };
  }
}

/**
 * Delete a specific draft by ID
 */
export function deleteDraft(id: string): DraftItem[] {
  try {
    const drafts = getSavedDrafts();
    const updated = drafts.filter((d) => d.id !== id);
    localStorage.setItem(DRAFTS_STORAGE_KEY, JSON.stringify(updated));
    return updated;
  } catch (err) {
    console.warn('Failed to delete draft:', err);
    return getSavedDrafts();
  }
}

/**
 * Clear all drafts
 */
export function clearAllDrafts(): void {
  try {
    localStorage.removeItem(DRAFTS_STORAGE_KEY);
  } catch (err) {
    console.warn('Failed to clear drafts:', err);
  }
}
