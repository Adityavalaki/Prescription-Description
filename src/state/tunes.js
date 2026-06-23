// state/tunes.js — reminder "tones" implemented as distinct vibration patterns.
//
// We don't bundle audio files; instead each option is a recognisable vibration pattern.
// On Android the pattern is applied to a per-tune notification channel (see
// services/notifications.js), so each medicine buzzes differently. In-app preview uses
// the React Native Vibration API.
//
// Pattern format (ms): [waitBeforeStart, vibrate, sleep, vibrate, …]

import { Vibration, Platform } from 'react-native';

// Patterns are deliberately long/repeated so the buzz is strong and unmissable for a
// medicine alarm (Android can't raise amplitude from JS, so length + repetition = strength).
export const TUNES = [
  { id: 'chime', name: 'Single Buzz', desc: 'One firm buzz', vibration: [0, 600] },
  { id: 'marimba', name: 'Double Buzz', desc: 'Two strong buzzes', vibration: [0, 450, 200, 450] },
  { id: 'bells', name: 'Triple Buzz', desc: 'Three strong buzzes', vibration: [0, 400, 180, 400, 180, 400] },
  { id: 'sunrise', name: 'Long Buzz', desc: 'One long, strong buzz', vibration: [0, 1000] },
  { id: 'pulse', name: 'Heartbeat', desc: 'Repeating double pulse', vibration: [0, 350, 150, 350, 400, 350, 150, 350] },
  { id: 'classic', name: 'Alarm', desc: 'Insistent, repeating', vibration: [0, 600, 250, 600, 250, 600, 250, 600] },
];

export function tuneById(id) {
  return TUNES.find((t) => t.id === id) || TUNES[0];
}

// preview a tune by buzzing its pattern once
export function playTune(id) {
  if (Platform.OS === 'web') return;
  try { Vibration.vibrate(tuneById(id).vibration, false); } catch (_e) { /* no vibrator */ }
}
