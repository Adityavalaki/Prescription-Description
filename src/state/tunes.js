// state/tunes.js — reminder alarm tones: a bundled sound + a matching vibration pattern.
//
// `sound` is the name (no extension) of a .wav bundled into res/raw via the expo-notifications
// "sounds" config in app.json (assets/sounds/<id>.wav). The Notifee alarm channel plays it and
// loops it until the user acts. `vibration` is the channel's vibration pattern.
//
// Vibration pattern format (ms): [waitBeforeStart, vibrate, sleep, vibrate, …]

import { Vibration, Platform } from 'react-native';

export const TUNES = [
  { id: 'chime',   name: 'Soft Chime',    desc: 'Gentle ascending bells', sound: 'chime',   vibration: [0, 600] },
  { id: 'marimba', name: 'Marimba',       desc: 'Bright woody arpeggio',  sound: 'marimba', vibration: [0, 450, 200, 450] },
  { id: 'bells',   name: 'Calm Bells',    desc: 'Slow, airy bells',       sound: 'bells',   vibration: [0, 400, 180, 400, 180, 400] },
  { id: 'sunrise', name: 'Sunrise',       desc: 'Rising and hopeful',     sound: 'sunrise', vibration: [0, 1000] },
  { id: 'pulse',   name: 'Gentle Pulse',  desc: 'Steady reminder beeps',  sound: 'pulse',   vibration: [0, 350, 150, 350, 400, 350, 150, 350] },
  { id: 'classic', name: 'Classic Alarm', desc: 'Insistent two-tone',     sound: 'classic', vibration: [0, 600, 250, 600, 250, 600, 250, 600] },
];

export function tuneById(id) {
  return TUNES.find((t) => t.id === id) || TUNES[0];
}

// preview a tune by buzzing its pattern once
export function playTune(id) {
  if (Platform.OS === 'web') return;
  try { Vibration.vibrate(tuneById(id).vibration, false); } catch (_e) { /* no vibrator */ }
}
