// screens/formBits.js — shared form controls (Field, TextField, Segmented, Stepper, ColorSwatches, TimePicker, Toggle).
import React, { useState } from 'react';
import { View, Text, TextInput, Pressable } from 'react-native';
import Icon from '../components/Icon';
import { C, F, MED_COLORS } from '../theme/colors';
import { toMins } from '../state/store';

export const TIME_PRESETS = ['7:30 AM', '8:00 AM', '9:00 AM', '12:00 PM', '2:00 PM', '6:00 PM', '8:00 PM', '9:00 PM', '10:00 PM'];

export function Field({ label, hint, children }) {
  return (
    <View style={{ marginBottom: 18 }}>
      <Text style={{ fontSize: 13, fontFamily: F.uiBold, color: C.inkSoft, marginBottom: 8 }}>
        {label}{hint ? <Text style={{ color: C.inkFaint, fontFamily: F.ui }}> · {hint}</Text> : null}
      </Text>
      {children}
    </View>
  );
}

export function TextField({ value, onChange, placeholder, keyboardType }) {
  const [focus, setFocus] = useState(false);
  return (
    <TextInput
      value={value} onChangeText={onChange} placeholder={placeholder} placeholderTextColor={C.inkFaint} keyboardType={keyboardType}
      onFocus={() => setFocus(true)} onBlur={() => setFocus(false)}
      style={{ height: 50, borderRadius: 14, borderWidth: 1.5, borderColor: focus ? C.primary : C.line, backgroundColor: C.surface, paddingHorizontal: 15, fontSize: 16, fontFamily: F.ui, color: C.ink }}
    />
  );
}

export function Segmented({ options, value, onChange }) {
  return (
    <View style={{ flexDirection: 'row', gap: 7, flexWrap: 'wrap' }}>
      {options.map((o) => {
        const on = value === o;
        return (
          <Pressable key={o} onPress={() => onChange(o)} style={{ height: 42, paddingHorizontal: 16, borderRadius: 12, borderWidth: 1.5, borderColor: on ? C.primary : C.line, backgroundColor: on ? C.primaryTint : C.surface, alignItems: 'center', justifyContent: 'center' }}>
            <Text style={{ color: on ? C.primaryPress : C.inkSoft, fontSize: 14, fontFamily: F.uiBold }}>{o}</Text>
          </Pressable>
        );
      })}
    </View>
  );
}

export function Stepper({ value, onChange, min = 1, max = 6, suffix }) {
  const btn = (label, fn, dis) => (
    <Pressable onPress={dis ? undefined : fn} style={{ width: 42, height: 42, borderRadius: 12, backgroundColor: dis ? C.paper2 : C.primaryTint, alignItems: 'center', justifyContent: 'center' }}>
      <Text style={{ color: dis ? C.inkFaint : C.primaryPress, fontSize: 22, fontFamily: F.display }}>{label}</Text>
    </Pressable>
  );
  return (
    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
      {btn('−', () => onChange(value - 1), value <= min)}
      <Text style={{ minWidth: 70, textAlign: 'center', fontSize: 17, fontFamily: F.uiBold, color: C.ink }}>{value}{suffix ? ` ${suffix}${value > 1 ? 's' : ''}` : ''}</Text>
      {btn('+', () => onChange(value + 1), value >= max)}
    </View>
  );
}

export function ColorSwatches({ value, onChange }) {
  return (
    <View style={{ flexDirection: 'row', gap: 10 }}>
      {MED_COLORS.map((c) => (
        <Pressable key={c} onPress={() => onChange(c)} style={{ width: 38, height: 38, borderRadius: 11, backgroundColor: c, alignItems: 'center', justifyContent: 'center', borderWidth: value === c ? 3 : 0, borderColor: C.paper }}>
          {value === c ? <Icon name="check" size={18} color="#fff" stroke={3} /> : null}
        </Pressable>
      ))}
    </View>
  );
}

export function TimePicker({ times, onChange }) {
  const toggle = (t) => onChange(times.includes(t) ? times.filter((x) => x !== t) : [...times, t].sort((a, b) => toMins(a) - toMins(b)));
  return (
    <View style={{ flexDirection: 'row', gap: 7, flexWrap: 'wrap' }}>
      {TIME_PRESETS.map((t) => {
        const on = times.includes(t);
        return (
          <Pressable key={t} onPress={() => toggle(t)} style={{ height: 38, paddingHorizontal: 13, borderRadius: 99, borderWidth: on ? 0 : 1.5, borderColor: C.line, backgroundColor: on ? C.primary : C.surface, flexDirection: 'row', alignItems: 'center', gap: 5 }}>
            {on ? <Icon name="check" size={13} color="#fff" stroke={3} /> : null}
            <Text style={{ color: on ? '#fff' : C.inkSoft, fontSize: 13, fontFamily: F.uiBold }}>{t}</Text>
          </Pressable>
        );
      })}
    </View>
  );
}

export function Toggle({ on, onChange }) {
  return (
    <Pressable onPress={() => onChange(!on)} style={{ width: 50, height: 30, borderRadius: 99, backgroundColor: on ? C.sage : C.line, justifyContent: 'center' }}>
      <View style={{ width: 24, height: 24, borderRadius: 99, backgroundColor: '#fff', marginLeft: on ? 23 : 3, shadowColor: '#000', shadowOpacity: 0.2, shadowRadius: 3, shadowOffset: { width: 0, height: 1 }, elevation: 2 }} />
    </Pressable>
  );
}
