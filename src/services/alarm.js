// services/alarm.js — loud, looping medicine ALARMS via Notifee.
//
// Unlike a plain notification, these:
//   • play on a HIGH-importance alarm channel that BYPASSES Do Not Disturb,
//   • LOOP the sound + vibration until the user acts (loopSound + ongoing),
//   • use a full-screen action so they wake the screen on the lock screen,
//   • STOP the moment the user taps “✓ Taken” or “Snooze” (we cancel the notification),
//   • survive a background/cold tap via a small pending-action queue applied on foreground.
//
// ⚠️ Native (Notifee) — runs only in the EAS dev/preview/production build, not Expo Go.

import { Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import notifee, {
  AndroidImportance, AndroidVisibility, AndroidCategory,
  TriggerType, RepeatFrequency, EventType,
} from '@notifee/react-native';
import { tuneById } from '../state/tunes';
import { parseTime } from './notifications';

const PENDING_KEY = 'medira.pendingActions';
const BATTERY_PROMPTED_KEY = 'medira.batteryPrompted';

function reminderBody(med) {
  const parts = [med.strength, med.instruction].filter(Boolean).join(' · ');
  return parts ? `${parts} — tap “✓ Taken” when done` : 'Tap “✓ Taken” once you’ve taken your medicine';
}

// expo-style pattern [wait, on, off, …] → Notifee pattern [on, off, …] (even length, ≥2)
function notifeePattern(arr) {
  const p = (arr || []).slice(1);
  if (!p.length) return [400, 200];
  if (p.length % 2 !== 0) p.push(300);
  return p;
}

async function ensureChannel(tune) {
  const t = tuneById(tune);
  const id = `med-alarm-${t.id}`;
  await notifee.createChannel({
    id,
    name: `Medicine alarm · ${t.name}`,
    importance: AndroidImportance.HIGH,
    sound: 'default',
    vibration: true,
    vibrationPattern: notifeePattern(t.vibration),
    bypassDnd: true,
    visibility: AndroidVisibility.PUBLIC,
  });
  return id;
}

function alarmAndroid(channelId) {
  return {
    channelId,
    category: AndroidCategory.ALARM,
    importance: AndroidImportance.HIGH,
    loopSound: true,         // keep ringing until dismissed
    autoCancel: false,
    ongoing: true,
    fullScreenAction: { id: 'default' }, // wake the screen / show over lock screen
    pressAction: { id: 'default', launchActivity: 'default' },
    actions: [
      { title: '✓ Taken', pressAction: { id: 'taken', launchActivity: 'default' } },
      { title: 'Snooze', pressAction: { id: 'snooze', launchActivity: 'default' } },
    ],
  };
}

// next clock occurrence of "8:00 AM" as a Date (today if still ahead, else tomorrow)
function nextOccurrence(tm) {
  const m = parseTime(tm);
  if (!m) return null;
  const now = Date.now();
  const d = new Date();
  d.setHours(m.hour, m.minute, 0, 0);
  if (d.getTime() <= now + 1000) d.setDate(d.getDate() + 1);
  return d;
}

export async function requestAlarmPermission() {
  try { await notifee.requestPermission(); } catch (_e) { /* */ }
}

// (re)schedule a daily alarm for every dose time of every active medicine
export async function scheduleAllAlarms(meds = [], snoozeMin = 30) {
  await notifee.cancelTriggerNotifications();
  let count = 0;
  for (const med of meds) {
    if (med.remindersOn === false) continue;
    const channelId = await ensureChannel(med.tune);
    for (const tm of med.times || []) {
      const when = nextOccurrence(tm);
      if (!when) continue;
      await notifee.createTriggerNotification(
        {
          id: `med-${med.id}-${String(tm).replace(/\W/g, '')}`,
          title: `💊 Time to take ${med.name}`,
          body: reminderBody(med),
          android: alarmAndroid(channelId),
          data: {
            medId: med.id, medName: med.name, strength: med.strength || '',
            instruction: med.instruction || '', tune: med.tune || 'chime',
            snoozeMin: String(snoozeMin), time: String(tm),
          },
        },
        { type: TriggerType.TIMESTAMP, timestamp: when.getTime(), repeatFrequency: RepeatFrequency.DAILY, alarmManager: { allowWhileIdle: true } },
      );
      count += 1;
    }
  }
  return count;
}

// one-off alarm after the user's snooze interval
export async function scheduleSnoozeAlarm(data) {
  const mins = Number(data?.snoozeMin) || 30;
  const channelId = await ensureChannel(data?.tune);
  await notifee.createTriggerNotification(
    {
      title: `💊 Snoozed — time to take ${data?.medName || 'your medicine'}`,
      body: reminderBody({ strength: data?.strength, instruction: data?.instruction }),
      android: alarmAndroid(channelId),
      data: { ...data },
    },
    { type: TriggerType.TIMESTAMP, timestamp: Date.now() + Math.max(60, mins * 60) * 1000, alarmManager: { allowWhileIdle: true } },
  );
}

export async function cancelAllAlarms() {
  try { await notifee.cancelTriggerNotifications(); } catch (_e) { /* */ }
  try { await notifee.cancelDisplayedNotifications(); } catch (_e) { /* */ }
}

// fire a sample alarm now (preview). Auto-stops after a few seconds so it isn't annoying.
export async function previewAlarm(tune) {
  const channelId = await ensureChannel(tune);
  const id = 'med-alarm-preview';
  await notifee.displayNotification({
    id,
    title: '🔔 Alarm preview',
    body: 'This is how your medicine alarm will sound and feel.',
    android: { ...alarmAndroid(channelId), timeoutAfter: 4000, actions: undefined, fullScreenAction: undefined },
  });
  setTimeout(() => { notifee.cancelNotification(id).catch(() => {}); }, 4000);
}

// Stop the ringing + reschedule on snooze. Store updates go through a queue so they survive
// a background/cold tap; the app drains the queue when it’s next in the foreground.
async function processEvent(type, detail) {
  if (type !== EventType.ACTION_PRESS && type !== EventType.PRESS) return;
  const { notification, pressAction } = detail || {};
  const actionId = (pressAction && pressAction.id) || 'default';
  if (notification?.id) { try { await notifee.cancelNotification(notification.id); } catch (_e) { /* */ } } // STOP sound
  const data = notification?.data || {};
  if (actionId === 'snooze') { try { await scheduleSnoozeAlarm(data); } catch (_e) { /* */ } }
  if (actionId === 'taken' || actionId === 'snooze') {
    try {
      const raw = await AsyncStorage.getItem(PENDING_KEY);
      const arr = raw ? JSON.parse(raw) : [];
      arr.push({ action: actionId, data });
      await AsyncStorage.setItem(PENDING_KEY, JSON.stringify(arr));
    } catch (_e) { /* */ }
  }
}

// apply any queued Taken/Snooze actions into the store (call on app foreground)
export async function drainPendingActions(onAction) {
  try {
    const raw = await AsyncStorage.getItem(PENDING_KEY);
    if (!raw) return;
    await AsyncStorage.removeItem(PENDING_KEY);
    const arr = JSON.parse(raw) || [];
    for (const item of arr) if (onAction) onAction(item.action, item.data);
  } catch (_e) { /* */ }
}

// register ONCE at app-entry module scope (handles taps while app is backgrounded/killed)
export function registerAlarmBackgroundHandler() {
  try { notifee.onBackgroundEvent(async ({ type, detail }) => { await processEvent(type, detail); }); }
  catch (_e) { /* native missing (Expo Go) — ignore */ }
}

// foreground handler — stops sound, reschedules snooze, then drains into the store
export function registerAlarmForegroundHandler(onAction) {
  try {
    return notifee.onForegroundEvent(async ({ type, detail }) => {
      await processEvent(type, detail);
      await drainPendingActions(onAction);
    });
  } catch (_e) { return () => {}; }
}

// ── battery optimisation (so alarms aren't delayed/killed on aggressive Android OEMs) ──
// Returns { show, optimized, powerManager } — whether to show the one-time prompt.
export async function getBatteryGuidance() {
  if (Platform.OS !== 'android') return { show: false };
  try {
    const prompted = await AsyncStorage.getItem(BATTERY_PROMPTED_KEY);
    if (prompted) return { show: false };
    const optimized = await notifee.isBatteryOptimizationEnabled();
    let powerManager = null;
    try { powerManager = await notifee.getPowerManagerInfo(); } catch (_e) { /* */ }
    const hasOem = !!(powerManager && powerManager.activity);
    return { show: !!optimized || hasOem, optimized: !!optimized, powerManager };
  } catch (_e) { return { show: false }; }
}
export async function markBatteryPrompted() {
  try { await AsyncStorage.setItem(BATTERY_PROMPTED_KEY, '1'); } catch (_e) { /* */ }
}
export async function openBatteryOptimizationSettings() {
  try { await notifee.openBatteryOptimizationSettings(); } catch (_e) { /* */ }
}
export async function openPowerManagerSettings() {
  try { await notifee.openPowerManagerSettings(); } catch (_e) { /* */ }
}
