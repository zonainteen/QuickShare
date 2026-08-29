/**
 * Utility to manage and retrieve the last captured photos
 * from device library / storage.
 */
const STORAGE_KEY = 'quickstatus_captured_library';
const PERMISSION_STORAGE_KEY = 'quickstatus_gallery_permission_granted';

export type GalleryPermissionState = 'prompt' | 'granted' | 'denied';

export function getGalleryPermissionState(): GalleryPermissionState {
  try {
    const val = localStorage.getItem(PERMISSION_STORAGE_KEY);
    if (val === 'granted' || val === 'denied') {
      return val;
    }
  } catch (err) {
    console.warn('Failed to read permission state:', err);
  }
  return 'prompt';
}

export function setGalleryPermissionState(state: GalleryPermissionState): void {
  try {
    localStorage.setItem(PERMISSION_STORAGE_KEY, state);
  } catch (err) {
    console.warn('Failed to store permission state:', err);
  }
}

export interface GalleryPhotoItem {
  id: string;
  url: string;
  timestamp: string;
  category?: string;
  caption?: string;
}

export function getSavedPhotosFromLibrary(): GalleryPhotoItem[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      return JSON.parse(raw);
    }
  } catch (err) {
    console.warn('Failed to load photos from library:', err);
  }
  return [];
}

export function savePhotoToLibrary(photo: {
  url: string;
  category?: string;
  caption?: string;
}): GalleryPhotoItem[] {
  try {
    const existing = getSavedPhotosFromLibrary();
    const newItem: GalleryPhotoItem = {
      id: `photo_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      url: photo.url,
      timestamp: new Date().toISOString(),
      category: photo.category || 'Capture',
      caption: photo.caption,
    };
    
    // Store latest 20 photos
    const updated = [newItem, ...existing.filter(p => p.url !== photo.url)].slice(0, 20);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    return updated;
  } catch (err) {
    console.warn('Failed to save photo to library:', err);
    return [];
  }
}

export function getLatestGalleryPhoto(): GalleryPhotoItem | null {
  const list = getSavedPhotosFromLibrary();
  return list.length > 0 ? list[0] : null;
}
