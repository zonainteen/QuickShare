import { ScheduledStatusItem, CapturedMedia } from '../types';

const SCHEDULED_STORAGE_KEY = 'quickstatus_scheduled_posts_v1';

export function getSavedScheduledStatuses(): ScheduledStatusItem[] {
  try {
    const raw = localStorage.getItem(SCHEDULED_STORAGE_KEY);
    if (raw) {
      return JSON.parse(raw);
    }
  } catch (err) {
    console.warn('Failed to read scheduled posts:', err);
  }
  return [];
}

export function saveScheduledStatus(
  media: CapturedMedia,
  scheduledTime: Date | string,
  platform: 'whatsapp' | 'instagram' | 'tiktok' | 'telegram' = 'whatsapp'
): { list: ScheduledStatusItem[]; item: ScheduledStatusItem } {
  try {
    const existing = getSavedScheduledStatuses();
    const isoScheduled = typeof scheduledTime === 'string' ? scheduledTime : scheduledTime.toISOString();

    const newItem: ScheduledStatusItem = {
      id: `sched_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      scheduledTime: isoScheduled,
      createdAt: new Date().toISOString(),
      platform,
      media: {
        ...media,
        timestamp: new Date(media.timestamp || Date.now()),
      },
      notified: false,
    };

    // Sort upcoming first
    const updated = [...existing, newItem].sort(
      (a, b) => new Date(a.scheduledTime).getTime() - new Date(b.scheduledTime).getTime()
    );

    localStorage.setItem(SCHEDULED_STORAGE_KEY, JSON.stringify(updated));

    // Request browser notification permission if not yet decided
    if (typeof window !== 'undefined' && 'Notification' in window && Notification.permission === 'default') {
      Notification.requestPermission().catch(() => {});
    }

    return { list: updated, item: newItem };
  } catch (err) {
    console.warn('Failed to save scheduled status:', err);
    return { list: getSavedScheduledStatuses(), item: {} as ScheduledStatusItem };
  }
}

export function deleteScheduledStatus(id: string): ScheduledStatusItem[] {
  try {
    const existing = getSavedScheduledStatuses();
    const updated = existing.filter((item) => item.id !== id);
    localStorage.setItem(SCHEDULED_STORAGE_KEY, JSON.stringify(updated));
    return updated;
  } catch (err) {
    console.warn('Failed to delete scheduled status:', err);
    return getSavedScheduledStatuses();
  }
}

export function markScheduledStatusNotified(id: string): ScheduledStatusItem[] {
  try {
    const existing = getSavedScheduledStatuses();
    const updated = existing.map((item) =>
      item.id === id ? { ...item, notified: true } : item
    );
    localStorage.setItem(SCHEDULED_STORAGE_KEY, JSON.stringify(updated));
    return updated;
  } catch (err) {
    console.warn('Failed to mark scheduled status as notified:', err);
    return getSavedScheduledStatuses();
  }
}

/**
 * Trigger system notification or return fallback info
 */
export function triggerSystemReminderNotification(item: ScheduledStatusItem): void {
  const title = `⏰ Waktunya Posting Status! (${item.platform.toUpperCase()})`;
  const body = item.media.caption || 'Konten status kamu sudah siap dibagikan.';

  if (typeof window !== 'undefined' && 'Notification' in window && Notification.permission === 'granted') {
    try {
      new Notification(title, {
        body,
        icon: '/favicon.ico',
      });
    } catch (e) {
      console.warn('Native notification failed:', e);
    }
  }
}
