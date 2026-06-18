// state/tunes.js — alarm-tune metadata + a playback stub.
//
// The web prototype synthesized these tones live with the Web Audio API
// (oscillators), which has no direct React Native equivalent. For the app,
// bundle a short .m4a per tune under assets/tunes/ and play it with expo-av —
// the `notes` arrays below are kept so you can regenerate matching tones.

import { Platform } from 'react-native';

export const TUNES = [
  { id: 'chime', name: 'Soft Chime', desc: 'Warm & gentle', type: 'triangle', notes: [[523, 0, 0.5], [659, 0.18, 0.5], [784, 0.36, 0.7]] },
  { id: 'marimba', name: 'Marimba', desc: 'Bright & woody', type: 'sine', notes: [[523, 0, 0.22], [784, 0.14, 0.22], [1046, 0.28, 0.4]] },
  { id: 'bells', name: 'Calm Bells', desc: 'Slow & airy', type: 'sine', notes: [[1318, 0, 1.1], [988, 0.28, 1.2]] },
  { id: 'sunrise', name: 'Sunrise', desc: 'Rising & hopeful', type: 'triangle', notes: [[392, 0, 0.3], [523, 0.16, 0.3], [659, 0.32, 0.3], [784, 0.48, 0.6]] },
  { id: 'pulse', name: 'Gentle Pulse', desc: 'Soft heartbeat', type: 'sine', notes: [[440, 0, 0.16], [440, 0.34, 0.16], [440, 0.68, 0.16]] },
  { id: 'classic', name: 'Classic Alarm', desc: 'Clear & insistent', type: 'square', notes: [[880, 0, 0.14], [660, 0.18, 0.14], [880, 0.36, 0.14], [660, 0.54, 0.14]] },
];

// Wire this up with expo-av once you have bundled audio assets:
//
//   import { Audio } from 'expo-av';
//   const FILES = { chime: require('../../assets/tunes/chime.m4a'), ... };
//   export async function playTune(id) {
//     const { sound } = await Audio.Sound.createAsync(FILES[id] || FILES.chime);
//     await sound.playAsync();
//     sound.setOnPlaybackStatusUpdate(s => s.didJustFinish && sound.unloadAsync());
//   }
export function playTune(id) {
  // no-op stub in the starter — preview the choice visually for now
  if (Platform.OS === 'web') return;
}
