// screens/ResultsScreen.js — detection cards with confidence + confirm bar.
// (The prototype also has "document" and "review" variants behind a Tweak; the
//  Cards layout is the default and is ported here.)
import React, { useState } from 'react';
import { View, Text, Pressable, ScrollView } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Icon from '../components/Icon';
import { Chip, Card, Button, ConfBar, MedBadge } from '../components/ui';
import { C, F } from '../theme/colors';
import { useReka } from '../state/store';

function confMeta(v) {
  if (v >= 0.9) return { c: C.sage, t: C.sageTint, label: 'High confidence' };
  if (v >= 0.85) return { c: C.amber, t: C.amberTint, label: 'Good match' };
  return { c: C.berry, t: C.berryTint, label: 'Please review' };
}

export default function ResultsScreen({ navigation, route }) {
  const insets = useSafeAreaInsets();
  const [, actions] = useReka();
  const [celebrate, setCelebrate] = useState(false);

  // real AI result handed over from Processing (empty if opened without a scan)
  const detected = route?.params?.detected || [];

  const onConfirm = () => {
    // actually persist every detected medicine into the plan (+ generates doses)
    detected.forEach((m) => actions.addMed(m));
    setCelebrate(true);
    setTimeout(() => navigation.reset({ index: 0, routes: [{ name: 'Main' }] }), 1700);
  };

  return (
    <View style={{ flex: 1, backgroundColor: C.paper }}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal: 18, paddingTop: insets.top + 8, paddingBottom: 110 }}>
        {/* header */}
        <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
          <Pressable onPress={() => navigation.reset({ index: 0, routes: [{ name: 'Main' }] })} style={{ width: 38, height: 38, borderRadius: 99, borderWidth: 1, borderColor: C.line, backgroundColor: C.surface, alignItems: 'center', justifyContent: 'center' }}>
            <Icon name="x" size={19} color={C.inkSoft} stroke={2.3} />
          </Pressable>
          <Chip icon="checkCircle" tint={C.sageTint} fg="#4F7A4C" style={{ height: 34 }}>Scan complete</Chip>
          <Pressable onPress={() => navigation.navigate('ManualEntry')} style={{ flexDirection: 'row', alignItems: 'center', gap: 6, height: 38, paddingHorizontal: 14, borderRadius: 99, backgroundColor: C.primaryTint }}>
            <Icon name="plus" size={16} color={C.primaryPress} stroke={2.6} />
            <Text style={{ color: C.primaryPress, fontSize: 13.5, fontFamily: F.uiBold }}>Add</Text>
          </Pressable>
        </View>
        <Text style={{ fontFamily: F.display, fontSize: 27, letterSpacing: -0.6, color: C.ink, marginTop: 16 }}>We found <Text style={{ color: C.primary }}>{detected.length} medication{detected.length === 1 ? '' : 's'}</Text></Text>
        <Text style={{ fontSize: 14.5, color: C.inkSoft, marginTop: 6, fontFamily: F.ui }}>Check our reading before saving — tap Review on anything unsure.</Text>

        {detected.length === 0 ? (
          <Card style={{ padding: 20, marginTop: 20, alignItems: 'center', gap: 6 }}>
            <Text style={{ fontFamily: F.uiBold, fontSize: 15, color: C.ink }}>No medicines detected</Text>
            <Text style={{ fontSize: 13, color: C.inkSoft, textAlign: 'center', fontFamily: F.ui }}>Try a clearer photo, or tap “Add” to enter them by hand.</Text>
          </Card>
        ) : null}

        {/* cards */}
        <View style={{ gap: 13, marginTop: 20 }}>
          {detected.map((m) => {
            const cm = confMeta(m.confidence);
            const low = m.confidence < 0.85;
            return (
              <Card key={m.id} style={{ padding: 16, borderWidth: 1.5, borderColor: low ? C.berryTint : C.lineSoft }}>
                <View style={{ flexDirection: 'row', alignItems: 'flex-start', gap: 13 }}>
                  <MedBadge color={m.color} icon="pill" size={48} />
                  <View style={{ flex: 1 }}>
                    <View style={{ flexDirection: 'row', alignItems: 'baseline', justifyContent: 'space-between', gap: 8 }}>
                      <Text style={{ fontSize: 18, fontFamily: F.uiHeavy, color: C.ink, letterSpacing: -0.2 }}>{m.name}</Text>
                      <Text style={{ fontSize: 15, fontFamily: F.uiBold, color: m.color }}>{m.strength}</Text>
                    </View>
                    <Text style={{ fontSize: 12.5, color: C.inkFaint, marginTop: 1, fontFamily: F.ui }}>{m.purpose}</Text>
                  </View>
                </View>
                {/* attribute chips */}
                <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 6, marginTop: 13 }}>
                  <Chip icon="pill">{m.dose}</Chip>
                  <Chip icon="clock">{m.frequency}</Chip>
                  <Chip icon="calendar">{m.duration}</Chip>
                  <Chip icon={m.instrIcon}>{m.instruction}</Chip>
                </View>
                {/* confidence */}
                <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 12, marginTop: 14, paddingTop: 13, borderTopWidth: 1, borderTopColor: C.lineSoft }}>
                  <View style={{ flex: 1 }}>
                    <Text style={{ fontSize: 11, fontFamily: F.uiBold, color: cm.c, marginBottom: 5 }}>{cm.label.toUpperCase()}</Text>
                    <ConfBar value={m.confidence} color={cm.c} />
                  </View>
                  {low ? (
                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 5, height: 34, paddingHorizontal: 14, borderRadius: 11, backgroundColor: C.berryTint }}>
                      <Icon name="edit" size={14} color={C.berry} stroke={2.3} />
                      <Text style={{ color: C.berry, fontFamily: F.uiBold, fontSize: 13 }}>Review</Text>
                    </View>
                  ) : (
                    <View style={{ width: 30, height: 30, borderRadius: 99, backgroundColor: C.sageTint, alignItems: 'center', justifyContent: 'center' }}>
                      <Icon name="check" size={16} color={C.sage} stroke={2.6} />
                    </View>
                  )}
                </View>
              </Card>
            );
          })}
        </View>
      </ScrollView>

      {/* confirm bar */}
      <View style={{ position: 'absolute', left: 0, right: 0, bottom: 0, paddingHorizontal: 18, paddingTop: 14, paddingBottom: insets.bottom + 14, backgroundColor: C.paper }}>
        <Button icon="check" onPress={onConfirm}>Add all to my plan</Button>
      </View>

      {/* success overlay */}
      {celebrate ? (
        <View style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: C.deep, alignItems: 'center', justifyContent: 'center', gap: 18 }}>
          <View style={{ width: 98, height: 98, borderRadius: 99, backgroundColor: C.mint, alignItems: 'center', justifyContent: 'center' }}>
            <Icon name="check" size={52} color={C.deep} stroke={2.7} />
          </View>
          <View style={{ alignItems: 'center', paddingHorizontal: 40 }}>
            <Text style={{ fontFamily: F.display, fontSize: 26, color: '#fff', letterSpacing: -0.3 }}>Plan added!</Text>
            <Text style={{ fontSize: 15, color: 'rgba(255,255,255,0.7)', marginTop: 7, lineHeight: 22, textAlign: 'center', fontFamily: F.ui }}>Your medicines are saved and alarms are set around your meals.</Text>
          </View>
        </View>
      ) : null}
    </View>
  );
}
