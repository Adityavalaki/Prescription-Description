// screens/HistoryScreen.js — 14-day adherence bars + past scans.
import React from 'react';
import { View, Text, ScrollView } from 'react-native';
import Icon from '../components/Icon';
import { DeepHeader } from '../components/common';
import { Card, SectionLabel, IconChip } from '../components/ui';
import { C, F } from '../theme/colors';
import { ADHERENCE_14, HISTORY } from '../data/mockData';

export default function HistoryScreen({ navigation }) {
  return (
    <View style={{ flex: 1, backgroundColor: C.paper }}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 120 }}>
        <DeepHeader bottom={20}>
          <Text style={{ fontFamily: F.display, fontSize: 24, color: '#fff', letterSpacing: -0.3 }}>History</Text>
          <View style={{ flexDirection: 'row', gap: 11, marginTop: 14 }}>
            <View style={{ flex: 1, backgroundColor: 'rgba(255,255,255,0.1)', borderRadius: 16, padding: 13 }}>
              <Text style={{ fontFamily: F.display, fontSize: 26, color: C.mint }}>91%</Text>
              <Text style={{ fontSize: 12, color: 'rgba(255,255,255,0.65)', fontFamily: F.uiBold }}>on time · 14 days</Text>
            </View>
            <View style={{ flex: 1, backgroundColor: 'rgba(255,255,255,0.1)', borderRadius: 16, padding: 13 }}>
              <Text style={{ fontFamily: F.display, fontSize: 26, color: '#fff' }}>12</Text>
              <Text style={{ fontSize: 12, color: 'rgba(255,255,255,0.65)', fontFamily: F.uiBold }}>day streak</Text>
            </View>
          </View>
        </DeepHeader>

        <View style={{ paddingHorizontal: 18, paddingTop: 18 }}>
          <SectionLabel>Last 14 days</SectionLabel>
          <Card>
            <View style={{ flexDirection: 'row', gap: 5, alignItems: 'flex-end', height: 44 }}>
              {ADHERENCE_14.map((v, i) => (
                <View key={i} style={{ flex: 1, borderRadius: 5, height: v === 1 ? '100%' : v === 0.5 ? '55%' : '25%', backgroundColor: v === 1 ? C.primary : v === 0.5 ? C.amber : C.berryTint }} />
              ))}
            </View>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginTop: 8 }}>
              <Text style={{ fontSize: 10.5, color: C.inkFaint, fontFamily: F.uiBold }}>May 26</Text>
              <Text style={{ fontSize: 10.5, color: C.inkFaint, fontFamily: F.uiBold }}>Today</Text>
            </View>
          </Card>

          <View style={{ marginTop: 20 }}>
            <SectionLabel>Past scans</SectionLabel>
            <View style={{ gap: 10 }}>
              {HISTORY.map((h) => (
                <Card key={h.id} pad={13} onPress={() => h.id === 'h1' && navigation.navigate('Results')} style={{ flexDirection: 'row', alignItems: 'center', gap: 13 }}>
                  <IconChip icon="doc" size={44} />
                  <View style={{ flex: 1 }}>
                    <Text style={{ fontSize: 15, fontFamily: F.uiHeavy, color: C.deep }}>{h.title}</Text>
                    <Text style={{ fontSize: 12.5, color: C.inkSoft, fontFamily: F.ui }}>{h.doctor} · {h.date} · {h.meds} medicines</Text>
                  </View>
                  <Icon name="chevR" size={18} color={C.inkFaint} stroke={2.3} />
                </Card>
              ))}
            </View>
          </View>
        </View>
      </ScrollView>
    </View>
  );
}
