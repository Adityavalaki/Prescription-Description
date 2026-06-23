// components/RxPad.js — the handwritten prescription pad (scan/processing/results).
import React from 'react';
import { View, Text, Pressable } from 'react-native';
import { C, F } from '../theme/colors';

// Self-contained placeholder letterhead (this whole component is a stand-in visual,
// removed in the live-camera redesign). No app/user data here.
const RX_SOURCE = { clinic: 'Sunrise Family Clinic', doctor: 'Dr. A. Mehta', date: 'Jun 6, 2026', patient: '—' };

const INK = '#33436b';
const MEDS = [
  { id: 'amox', lines: ['Amoxicillin 500mg', 'Cap i — TDS x 7 days, p.c.'] },
  { id: 'ibu', lines: ['Ibuprofen 400mg', 'Tab i — BD, p.r.n. pain'] },
  { id: 'panto', lines: ['Pantoprazole 40mg', 'Tab i — OD, a.c. breakfast'] },
];

export default function RxPad({ scale = 1, highlight = null, onLineTap, compact = false }) {
  return (
    <View style={{ backgroundColor: '#FFFEFA', borderRadius: 10, padding: compact ? 16 : 20, overflow: 'hidden' }}>
      {/* letterhead */}
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', borderBottomWidth: 1.5, borderBottomColor: '#e6e2d6', paddingBottom: 10, marginBottom: 12 }}>
        <View>
          <Text style={{ fontFamily: F.display, fontSize: 13 * scale, color: '#2b3a5e', letterSpacing: -0.2 }}>{RX_SOURCE.clinic}</Text>
          <Text style={{ fontFamily: F.ui, fontSize: 9.5 * scale, color: '#8b94a8', marginTop: 1 }}>{RX_SOURCE.doctor} · {RX_SOURCE.date}</Text>
        </View>
        <Text style={{ fontFamily: F.display, fontSize: 26 * scale, color: '#c9d0de' }}>℞</Text>
      </View>
      <Text style={{ fontFamily: F.ui, fontSize: 9.5 * scale, color: '#8b94a8', marginBottom: 10 }}>
        Patient: <Text style={{ color: '#5a6478', fontFamily: F.uiMed }}>{RX_SOURCE.patient}</Text>
      </Text>

      {/* handwritten body */}
      <View style={{ gap: 12 }}>
        {MEDS.map((m) => {
          const active = highlight === m.id;
          const Wrap = onLineTap ? Pressable : View;
          return (
            <Wrap key={m.id} onPress={onLineTap ? () => onLineTap(m.id) : undefined}
              style={{ paddingVertical: 4, paddingHorizontal: 8, marginHorizontal: -8, borderRadius: 7, backgroundColor: active ? 'rgba(220,122,87,0.16)' : 'transparent', borderWidth: active ? 1.5 : 0, borderColor: 'rgba(220,122,87,0.55)' }}>
              <Text style={{ fontFamily: F.script, fontSize: 19 * scale, color: INK, lineHeight: 24 * scale }}>{m.lines[0]}</Text>
              <Text style={{ fontFamily: F.script, fontSize: 16 * scale, color: '#5a6a92', paddingLeft: 10, lineHeight: 21 * scale }}>{m.lines[1]}</Text>
            </Wrap>
          );
        })}
      </View>

      {/* signature */}
      <View style={{ marginTop: 16, alignItems: 'flex-end' }}>
        <View style={{ alignItems: 'center' }}>
          <Text style={{ fontFamily: F.script, fontSize: 22 * scale, color: '#3a5a8a', transform: [{ rotate: '-4deg' }] }}>A. Mehta</Text>
          <Text style={{ fontFamily: F.ui, fontSize: 8.5 * scale, color: '#aab1c2', borderTopWidth: 1, borderTopColor: '#e6e2d6', paddingTop: 2, marginTop: 1 }}>Signature</Text>
        </View>
      </View>
    </View>
  );
}
