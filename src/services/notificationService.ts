/**
 * Browser-based local notification service for NoorSync.
 * Supports Web Notification API with graceful fallback and strict adherence
 * to user audio preference settings.
 */

import { playSampleAthan } from '../utils/audio';

export interface PrayerNotificationPayload {
  prayerName: string;
  prayerArabic?: string;
  prayerTime: string;
  cityName: string;
  audioAlerts: boolean;
  isTest?: boolean;
}

export function checkNotificationSupport(): boolean {
  return typeof window !== 'undefined' && 'Notification' in window;
}

export function getNotificationPermission(): NotificationPermission | 'unsupported' {
  if (!checkNotificationSupport()) return 'unsupported';
  return Notification.permission;
}

export async function requestNotificationPermission(): Promise<NotificationPermission | 'unsupported'> {
  if (!checkNotificationSupport()) return 'unsupported';
  try {
    const permission = await Notification.requestPermission();
    return permission;
  } catch (err) {
    console.warn('Error requesting notification permission:', err);
    return 'denied';
  }
}

/**
 * Triggers a subtle, non-intrusive prayer notification.
 * Respects the user's `audioAlerts` preference.
 */
export function sendPrayerNotification(payload: PrayerNotificationPayload): {
  browserSent: boolean;
  permission: NotificationPermission | 'unsupported';
} {
  const { prayerName, prayerArabic, prayerTime, cityName, audioAlerts, isTest } = payload;
  const permission = getNotificationPermission();
  let browserSent = false;

  // 1. Play audio chime/athan strictly if audioAlerts is enabled
  if (audioAlerts) {
    try {
      playSampleAthan();
    } catch (e) {
      console.warn('Could not play athan audio alert:', e);
    }
  }

  // 2. Dispatch native desktop/mobile notification if granted
  if (permission === 'granted') {
    try {
      const title = isTest
        ? `🔔 [Uji Notifikasi] Waktu Sholat ${prayerName}`
        : `🕌 Waktu Sholat ${prayerName} Telah Masuk`;

      const body = `${prayerArabic ? `${prayerArabic} • ` : ''}Panggilan sholat ${prayerName} (${prayerTime}) untuk wilayah ${cityName}. Mari tunaikan sholat tepat waktu.`;

      const notification = new Notification(title, {
        body,
        tag: `noorsync-prayer-${prayerName.toLowerCase()}-${isTest ? Date.now() : ''}`,
        silent: true, // We control audio synthesized playback through Web Audio to respect user's audioAlerts settings
        requireInteraction: false,
      });

      notification.onclick = () => {
        window.focus();
        notification.close();
      };

      browserSent = true;
    } catch (err) {
      // In some sandboxed iframes, Notification constructor might throw SecurityError
      console.warn('Native notification blocked or unavailable:', err);
    }
  }

  return { browserSent, permission };
}
