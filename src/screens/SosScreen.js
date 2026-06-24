// screens/SosScreen.js — emergency screen that calls your contacts.
// Tapping a contact opens the phone dialer with their number pre-filled (one tap to connect)
// via Linking — no CALL_PHONE permission needed, which keeps the Play review clean.
import React from 'react';
import { View, Text, Pressable, ScrollView, Linking } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Icon from '../components/Icon';
import { Button, Toast, useToast } from '../components/ui';
import { C, F } from '../theme/colors';
import { useReka } from '../state/store';

const filled = (list) => (list || []).filter((c) => c.name && c.phone);
const telUri = (phone) => `tel:${String(phone).replace(/[^+\d]/g, '')}`;

// Open the dialer with the contact's number pre-filled; the user taps the call button.
async function placeCall(phone, toast) {
  try { await Linking.openURL(telUri(phone)); }
  catch (_e) { if (toast) toast('Couldn’t open the dialer', 'phoneOff'); }
}

export default function SosScreen({ navigation }) {
  const insets = useSafeAreaInsets();
  const [s] = useReka();
  const [msg, toast] = useToast();
  const contacts = s.settings.sos || [];
  const reachable = filled(contacts);
  const primary = reachable.find((c) => c.primary) || reachable[0];
  const others = primary ? reachable.filter((c) => c.id !== primary.id) : [];

  const dial = (c) => placeCall(c.phone, toast);

  // no contacts yet
  if (!primary) {
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
      <Toast msg={msg} />
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

      {/* primary contact — big one-tap call */}
      <View style={{ alignItems: 'center', paddingTop: 22, paddingHorizontal: 24 }}>
        <View style={{ width: 104, height: 104, borderRadius: 99, backgroundColor: 'rgba(255,255,255,0.95)', alignItems: 'center', justifyContent: 'center' }}>
          <Text style={{ fontFamily: F.display, fontSize: 40, color: primary.color }}>{primary.name[0]}</Text>
        </View>
        <Text style={{ fontFamily: F.display, fontSize: 26, color: '#fff', marginTop: 16, letterSpacing: -0.3 }}>{primary.name}</Text>
        <Text style={{ fontSize: 15, color: 'rgba(255,255,255,0.85)', marginTop: 3, fontFamily: F.ui }}>{primary.relation || 'Primary contact'} · {primary.phone}</Text>

        <Pressable onPress={() => dial(primary)} style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 12, height: 68, alignSelf: 'stretch', marginTop: 20, borderRadius: 999, backgroundColor: '#fff' }}>
          <Icon name="phone" size={26} color="#C0392B" stroke={2.4} />
          <Text style={{ fontSize: 20, fontFamily: F.uiBold, color: '#C0392B' }}>Call {primary.name.split(' ')[0]} now</Text>
        </Pressable>
      </View>

      {/* other contacts */}
      <View style={{ flex: 1, marginTop: 20, backgroundColor: C.paper, borderTopLeftRadius: 26, borderTopRightRadius: 26, overflow: 'hidden' }}>
        <ScrollView contentContainerStyle={{ padding: 16, paddingBottom: insets.bottom + 90 }}>
          <Text style={{ fontSize: 12, fontFamily: F.uiHeavy, letterSpacing: 1, color: C.inkFaint, paddingHorizontal: 4, paddingBottom: 10 }}>
            {others.length ? 'TAP ANYONE TO CALL THEM' : 'ADD MORE PEOPLE WHO CAN HELP'}
          </Text>
          <View style={{ gap: 10 }}>
            {others.map((c) => (
              <View key={c.id} style={{ flexDirection: 'row', alignItems: 'center', gap: 13, padding: 14, borderRadius: 18, backgroundColor: C.surface, borderWidth: 1, borderColor: C.lineSoft }}>
                <View style={{ width: 48, height: 48, borderRadius: 14, backgroundColor: c.color, alignItems: 'center', justifyContent: 'center' }}>
                  <Text style={{ color: '#fff', fontFamily: F.display, fontSize: 20 }}>{c.name[0]}</Text>
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={{ fontSize: 16.5, fontFamily: F.uiBold, color: C.ink }}>{c.name}</Text>
                  <Text style={{ fontSize: 13.5, color: C.inkFaint, fontFamily: F.ui }}>{c.relation} · {c.phone}</Text>
                </View>
                <Pressable onPress={() => dial(c)} style={{ width: 52, height: 52, borderRadius: 99, backgroundColor: C.sage, alignItems: 'center', justifyContent: 'center' }}>
                  <Icon name="phone" size={23} color="#fff" stroke={2.3} />
                </Pressable>
              </View>
            ))}
            {/* add-contact tile */}
            <Pressable onPress={() => navigation.navigate('SosContacts')} style={{ flexDirection: 'row', alignItems: 'center', gap: 13, padding: 14, borderRadius: 18, borderWidth: 1.5, borderStyle: 'dashed', borderColor: C.line, backgroundColor: C.surface }}>
              <View style={{ width: 48, height: 48, borderRadius: 14, backgroundColor: C.paper2, alignItems: 'center', justifyContent: 'center' }}>
                <Icon name="plusUser" size={23} color={C.inkFaint} stroke={2.1} />
              </View>
              <View>
                <Text style={{ fontSize: 16, fontFamily: F.uiBold, color: C.inkSoft }}>Add a contact</Text>
                <Text style={{ fontSize: 13, color: C.inkFaint, fontFamily: F.ui }}>Someone who can come help</Text>
              </View>
            </Pressable>
          </View>
        </ScrollView>

        {/* close */}
        <View style={{ position: 'absolute', left: 0, right: 0, bottom: 0, paddingTop: 12, paddingBottom: insets.bottom + 16, alignItems: 'center', backgroundColor: C.paper }}>
          <Pressable onPress={() => navigation.goBack()} style={{ height: 52, paddingHorizontal: 40, borderRadius: 999, backgroundColor: C.paper2, alignItems: 'center', justifyContent: 'center' }}>
            <Text style={{ color: C.inkSoft, fontSize: 16, fontFamily: F.uiBold }}>Close</Text>
          </Pressable>
        </View>
      </View>
    </LinearGradient>
  );
}
