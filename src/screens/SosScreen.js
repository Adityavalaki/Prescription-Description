// screens/SosScreen.js — emergency call screen that cascades through contacts.
import React, { useState, useEffect } from 'react';
import { View, Text, Pressable, ScrollView } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Icon from '../components/Icon';
import { Chip, Button } from '../components/ui';
import { C, F } from '../theme/colors';
import { useReka } from '../state/store';

const filled = (list) => list.filter((c) => c.name && c.phone);

export default function SosScreen({ navigation }) {
  const insets = useSafeAreaInsets();
  const [s] = useReka();
  const contacts = s.settings.sos;
  const reachable = filled(contacts);
  const primary = reachable.find((c) => c.primary) || reachable[0];
  const queue = primary ? [primary, ...reachable.filter((c) => c.id !== primary.id)] : [];

  const [activeId, setActiveId] = useState((primary || {}).id);
  const [phase, setPhase] = useState('calling'); // calling → connected
  const [auto, setAuto] = useState(true);
  const [missed, setMissed] = useState([]);
  const active = contacts.find((c) => c.id === activeId) || reachable[0];
  const qi = queue.findIndex((c) => c.id === activeId);

  useEffect(() => {
    setPhase('calling');
    if (auto && qi > -1 && qi < queue.length - 1) {
      const t = setTimeout(() => {
        setMissed((m) => [...m, activeId]);
        setActiveId(queue[qi + 1].id);
      }, 4500);
      return () => clearTimeout(t);
    }
    const t = setTimeout(() => setPhase('connected'), 2600);
    return () => clearTimeout(t);
  }, [activeId, auto]);

  const [secs, setSecs] = useState(0);
  useEffect(() => {
    if (phase !== 'connected') { setSecs(0); return; }
    const i = setInterval(() => setSecs((x) => x + 1), 1000);
    return () => clearInterval(i);
  }, [phase]);
  const mmss = `${String(Math.floor(secs / 60)).padStart(2, '0')}:${String(secs % 60).padStart(2, '0')}`;

  const call = (id) => { setAuto(false); setActiveId(id); };

  if (!active) {
    return (
      <LinearGradient colors={['#C0392B', '#8E2419']} style={{ flex: 1, alignItems: 'center', justifyContent: 'center', padding: 30 }}>
        <Text style={{ fontFamily: F.display, fontSize: 24, color: '#fff', textAlign: 'center' }}>No SOS contacts yet</Text>
        <Text style={{ color: 'rgba(255,255,255,0.85)', fontSize: 15.5, lineHeight: 23, marginVertical: 16, textAlign: 'center', fontFamily: F.ui }}>Add a doctor or someone who can help, so one tap can reach them in an emergency.</Text>
        <Button variant="ghost" icon="plusUser" onPress={() => navigation.navigate('SosContacts')} style={{ backgroundColor: '#fff', maxWidth: 280 }}>Add a contact</Button>
        <Pressable onPress={() => navigation.goBack()} style={{ marginTop: 16 }}><Text style={{ color: 'rgba(255,255,255,0.85)', fontSize: 15, fontFamily: F.uiBold }}>Close</Text></Pressable>
      </LinearGradient>
    );
  }

  return (
    <LinearGradient colors={['#C0392B', '#8E2419']} style={{ flex: 1 }}>
      {/* header */}
      <View style={{ paddingTop: insets.top + 8, paddingHorizontal: 18, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 7, height: 32, paddingHorizontal: 12, borderRadius: 99, backgroundColor: 'rgba(255,255,255,0.18)' }}>
          <View style={{ width: 8, height: 8, borderRadius: 99, backgroundColor: '#fff' }} />
          <Text style={{ fontSize: 12.5, fontFamily: F.uiHeavy, color: '#fff', letterSpacing: 1 }}>EMERGENCY SOS</Text>
        </View>
        <Pressable onPress={() => navigation.navigate('SosContacts')} style={{ width: 38, height: 38, borderRadius: 99, backgroundColor: 'rgba(255,255,255,0.18)', alignItems: 'center', justifyContent: 'center' }}>
          <Icon name="edit" size={18} color="#fff" stroke={2.2} />
        </Pressable>
      </View>

      {/* active call */}
      <View style={{ alignItems: 'center', paddingTop: 26 }}>
        <View style={{ width: 104, height: 104, borderRadius: 99, backgroundColor: 'rgba(255,255,255,0.95)', alignItems: 'center', justifyContent: 'center' }}>
          <Text style={{ fontFamily: F.display, fontSize: 40, color: active.color }}>{active.name[0]}</Text>
        </View>
        <Text style={{ fontFamily: F.display, fontSize: 26, color: '#fff', marginTop: 18, letterSpacing: -0.3 }}>{active.name}</Text>
        <Text style={{ fontSize: 15, color: 'rgba(255,255,255,0.85)', marginTop: 3, fontFamily: F.ui }}>{active.relation}</Text>
        <Text style={{ fontSize: 14.5, fontFamily: F.uiBold, color: '#fff', marginTop: 12 }}>{phase === 'calling' ? 'Calling…' : `In call · ${mmss}`}</Text>
        {missed.length > 0 && phase === 'calling' ? (
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 7, marginTop: 8, height: 28, paddingHorizontal: 12, borderRadius: 99, backgroundColor: 'rgba(255,255,255,0.18)' }}>
            <Icon name="phoneOff" size={14} color="#fff" stroke={2.3} />
            <Text style={{ color: '#fff', fontSize: 12.5, fontFamily: F.uiBold }}>No answer — calling next</Text>
          </View>
        ) : null}
      </View>

      {/* contact list */}
      <View style={{ flex: 1, marginTop: 18, backgroundColor: C.paper, borderTopLeftRadius: 26, borderTopRightRadius: 26, overflow: 'hidden' }}>
        <ScrollView contentContainerStyle={{ padding: 16, paddingBottom: 120 }}>
          <Text style={{ fontSize: 12, fontFamily: F.uiHeavy, letterSpacing: 1, color: C.inkFaint, paddingHorizontal: 4, paddingBottom: 10 }}>ALL CONTACTS ARE CALLED IN ORDER</Text>
          <View style={{ gap: 10 }}>
            {contacts.map((c) => {
              const empty = !(c.name && c.phone);
              if (empty) {
                return (
                  <Pressable key={c.id} onPress={() => navigation.navigate('SosContacts')} style={{ flexDirection: 'row', alignItems: 'center', gap: 13, padding: 14, borderRadius: 18, borderWidth: 1.5, borderStyle: 'dashed', borderColor: C.line, backgroundColor: C.surface }}>
                    <View style={{ width: 48, height: 48, borderRadius: 14, backgroundColor: C.paper2, alignItems: 'center', justifyContent: 'center' }}>
                      <Icon name="plusUser" size={23} color={C.inkFaint} stroke={2.1} />
                    </View>
                    <View>
                      <Text style={{ fontSize: 16, fontFamily: F.uiBold, color: C.inkSoft }}>Add a contact</Text>
                      <Text style={{ fontSize: 13, color: C.inkFaint, fontFamily: F.ui }}>Someone who can come help</Text>
                    </View>
                  </Pressable>
                );
              }
              const isActive = c.id === activeId;
              const order = queue.findIndex((q) => q.id === c.id) + 1;
              const wasMissed = missed.includes(c.id) && !isActive;
              return (
                <View key={c.id} style={{ flexDirection: 'row', alignItems: 'center', gap: 13, padding: 14, borderRadius: 18, backgroundColor: C.surface, borderWidth: isActive ? 2 : 1, borderColor: isActive ? C.berry : C.lineSoft }}>
                  <View style={{ width: 48, height: 48, borderRadius: 14, backgroundColor: c.color, alignItems: 'center', justifyContent: 'center' }}>
                    <Text style={{ color: '#fff', fontFamily: F.display, fontSize: 20 }}>{c.name[0]}</Text>
                  </View>
                  <View style={{ flex: 1 }}>
                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                      <Text style={{ fontSize: 16.5, fontFamily: F.uiBold, color: C.ink }}>{c.name}</Text>
                      {order > 0 ? <Chip tint={order === 1 ? C.berryTint : C.paper2} fg={order === 1 ? C.berry : C.inkSoft} style={{ height: 22, paddingHorizontal: 8 }} textStyle={{ fontSize: 11 }}>{order === 1 ? 'Called 1st' : order === 2 ? 'Called 2nd' : 'Called 3rd'}</Chip> : null}
                    </View>
                    <Text style={{ fontSize: 13.5, color: wasMissed ? C.berry : C.inkFaint, fontFamily: wasMissed ? F.uiBold : F.ui }}>{wasMissed ? 'No answer · ' : ''}{c.relation} · {c.phone}</Text>
                  </View>
                  <Pressable onPress={() => call(c.id)} style={{ width: 48, height: 48, borderRadius: 99, backgroundColor: isActive ? C.inkFaint : C.sage, alignItems: 'center', justifyContent: 'center' }}>
                    <Icon name="phone" size={22} color="#fff" stroke={2.2} />
                  </Pressable>
                </View>
              );
            })}
          </View>
        </ScrollView>

        {/* end call */}
        <View style={{ position: 'absolute', left: 0, right: 0, bottom: 0, paddingTop: 14, paddingBottom: insets.bottom + 20, alignItems: 'center', backgroundColor: C.paper }}>
          <Pressable onPress={() => navigation.goBack()} style={{ flexDirection: 'row', alignItems: 'center', gap: 10, height: 62, paddingHorizontal: 30, borderRadius: 999, backgroundColor: C.berry }}>
            <Icon name="phoneOff" size={22} color="#fff" stroke={2.3} />
            <Text style={{ color: '#fff', fontSize: 18, fontFamily: F.uiBold }}>End call</Text>
          </Pressable>
        </View>
      </View>
    </LinearGradient>
  );
}
