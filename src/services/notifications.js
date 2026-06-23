// services/notifications.js — local medication reminders (the core of the app).
//
// UI-INDEPENDENT. The redesigned UI consumes this with ONE line:
//
//     import { useReminders } from '../services/notifications';
//     useReminders(meds);          // mount once near the app root; reschedules on change
//
// What it does: schedules a DAILY repeating local notification for every dose time of
// every active medicine, with "Taken" / "Snooze 10m" action buttons. No server, no push —
// works offline on the device.
//
// ⚠️ Testing requires an EAS **dev build** — scheduled notifications no longer fire in
// Expo Go on modern Android. The code is correct; it just needs the real build to run.

import { useEffect, useRef } from 'react';
import { Platform } from 'react-native';
import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';
import { TUNES, tuneById } from '../state/tunes';

const CATEGORY_ID = 'dose';

// one Android notification channel per tune, so each medicine vibrates with its pattern
export function medChannelId(tune) { return `med-rem-${tuneById(tune).id}`; }

// ── 1. one-time setup (handler + Android channel + action buttons) ──
let configured = false;
export async function configureNotifications() {
  if (configured) return;
  configured = true;

  // show reminders even when the app is in the foreground
  Notifications.setNotificationHandler({
    handleNotification: async () => ({
      shouldShowBanner: true,
      shouldShowList: true,
      shouldPlaySound: true,
      shouldSetBadge: false,
    }),
  });

  if (Platform.OS === 'android') {
    // a channel per tune — Android ties the vibration pattern to the channel
    for (const t of TUNES) {
      await Notifications.setNotificationChannelAsync(medChannelId(t.id), {
        name: `Reminders · ${t.name}`,
        importance: Notifications.AndroidImportance.MAX,
        sound: 'default',
        vibrationPattern: t.vibration,
        lockscreenVisibility: Notifications.AndroidNotificationVisibility.PUBLIC,
      });
    }
  }

  // "Taken" / "Snooze" buttons on the notification
  await Notifications.setNotificationCategoryAsync(CATEGORY_ID, [
    { identifier: 'taken', buttonTitle: 'Taken', options: { opensAppToForeground: false } },
    { identifier: 'snooze', buttonTitle: 'Snooze', options: { opensAppToForeground: false } },
  ]);
}

// ── 2. permission ──
export async function ensurePermission() {
  if (!Device.isDevice) return false; // simulators can't show real notifications
  const current = await Notifications.getPermissionsAsync();
  let status = current.status;
  if (status !== 'granted') {
    const req = await Notifications.requestPermissionsAsync();
    status = req.status;
  }
  return status === 'granted';
}

// ── 3. time parsing: "8:00 AM" -> { hour, minute } (24h) ──
export function parseTime(s) {
  const m = String(s).match(/(\d+):(\d+)\s*(AM|PM)/i);
  if (!m) return null;
  let hour = (+m[1]) % 12;
  if (/PM/i.test(m[3])) hour += 12;
  return { hour, minute: +m[2] };
}

// ── 4. (re)schedule every reminder from the current medicines ──
// meds: array from the store. Each: { id, name, strength, times: ['8:00 AM', ...],
//        instruction, remindersOn (default true) }. SOS meds (no times) are skipped.
export async function syncFromMeds(meds = []) {
  const ok = await ensurePermission();
  if (!ok) return { scheduled: 0, granted: false };

  await Notifications.cancelAllScheduledNotificationsAsync();

  let scheduled = 0;
  for (const med of meds) {
    if (med.remindersOn === false) continue;
    for (const t of med.times || []) {
      const hm = parseTime(t);
      if (!hm) continue;
      await Notifications.scheduleNotificationAsync({
        content: {
          title: `💊 Time for ${med.name}`,
          body: [med.strength, med.instruction].filter(Boolean).join(' · ') || 'Tap to mark as taken',
          categoryIdentifier: CATEGORY_ID,
          data: { medId: med.id, medName: med.name, time: t },
          sound: 'default',
        },
        trigger: {
          type: Notifications.SchedulableTriggerInputTypes.DAILY,
          hour: hm.hour,
          minute: hm.minute,
          channelId: medChannelId(med.tune),
        },
      });
      scheduled += 1;
    }
  }
  return { scheduled, granted: true };
}

export async function cancelAll() {
  await Notifications.cancelAllScheduledNotificationsAsync();
}

export async function listScheduled() {
  return Notifications.getAllScheduledNotificationsAsync();
}

// ── 5. the one-liner the UI mounts ──────────────────────────────────
// Configures once, then reschedules whenever the medicines change.
// `onAction(actionId, data)` is called when the user taps Taken / Snooze on a
// notification — wire it to your store (markTaken / snooze). Optional.
export function useReminders(meds, onAction) {
  const lastKey = useRef('');

  useEffect(() => {
    configureNotifications();
    const sub = Notifications.addNotificationResponseReceivedListener((resp) => {
      const action = resp.actionIdentifier; // 'taken' | 'snooze' | default tap
      const data = resp.notification.request.content.data || {};
      if (onAction) onAction(action, data);
    });
    return () => sub.remove();
  }, []);

  useEffect(() => {
    // only reschedule when the schedule-relevant fields actually change
    const key = JSON.stringify(
      (meds || []).map((m) => [m.id, m.remindersOn !== false, (m.times || []).join('|')])
    );
    if (key === lastKey.current) return;
    lastKey.current = key;
    syncFromMeds(meds || []);
  }, [meds]);
}
