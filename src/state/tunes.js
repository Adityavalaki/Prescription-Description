// state/tunes.js — reminder "tones" implemented as distinct vibration patterns.
//
// We don't bundle audio files; instead each option is a recognisable vibration pattern.
// On Android the pattern is applied to a per-tune notification channel (see
// services/notifications.js), so each medicine buzzes differently. In-app preview uses
// the React Native Vibration API.
//
// Pattern format (ms): [waitBeforeStart, vibrate, sleep, vibrate, …]

import { Vibration, Platform } from 'react-native';

export const TUNES = [
  { id: 'chime', name: 'Soft Pulse', desc: 'One gentle buzz', vibration: [0, 220] },
  { id: 'marimba', name: 'Double Tap', desc: 'Two quick taps', vibration: [0, 120, 90, 120] },
  { id: 'bells', name: 'Triple Ring', desc: 'Three light taps', vibration: [0, 90, 70, 90, 70, 90] },
  { id: 'sunrise', name: 'Long Gentle', desc: 'One long, soft buzz', vibration: [0, 500] },
  { id: 'pulse', name: 'Heartbeat', desc: 'Soft double rhythm', vibration: [0, 110, 70, 110, 260, 110, 70, 110] },
  { id: 'classic', name: 'Insistent', desc: 'Strong & clear', vibration: [0, 300, 140, 300, 140, 300] },
];

export function tuneById(id) {
  return TUNES.find((t) => t.id === id) || TUNES[0];
}

// preview a tune by buzzing its pattern once
export function playTune(id) {
  if (Platform.OS === 'web') return;
  try { Vibration.vibrate(tuneById(id).vibration, false); } catch (_e) { /* no vibrator */ }
}
