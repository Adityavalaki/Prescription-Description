// navigation/MainTabs.js — bottom tabs (Today / Meds / Scan FAB / Schedule / History)
// with the prototype's frosted-glass floating dock.

import React from 'react';
import { View, Text, Pressable } from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { BlurView } from 'expo-blur';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Icon from '../components/Icon';
import { C, F } from '../theme/colors';
import { shadow } from '../components/ui';

import HomeScreen from '../screens/HomeScreen';
import MedsScreen from '../screens/MedsScreen';
import ScheduleScreen from '../screens/ScheduleScreen';
import HistoryScreen from '../screens/HistoryScreen';

const Tab = createBottomTabNavigator();

const TABS = [
  { name: 'Home', label: 'Today', icon: 'home' },
  { name: 'Meds', label: 'Meds', icon: 'pill' },
  { name: 'Scan', label: 'Scan', icon: 'scan', fab: true },
  { name: 'Schedule', label: 'Schedule', icon: 'calendar' },
  { name: 'History', label: 'History', icon: 'clock' },
];

function GlassTabBar({ state, navigation }) {
  const insets = useSafeAreaInsets();
  const activeRoute = state.routes[state.index].name;

  const go = (name) => {
    if (name === 'Scan') { navigation.navigate('Scan'); return; }
    const event = navigation.emit({ type: 'tabPress', target: name, canPreventDefault: true });
    if (!event.defaultPrevented) navigation.navigate(name);
  };

  return (
    <View style={{ position: 'absolute', left: 14, right: 14, bottom: Math.max(insets.bottom, 12) }}>
      <BlurView intensity={40} tint="light" style={{ flexDirection: 'row', alignItems: 'stretch', borderRadius: 28, paddingVertical: 8, paddingHorizontal: 10, borderWidth: 1, borderColor: 'rgba(255,255,255,0.75)', overflow: 'hidden', backgroundColor: 'rgba(255,255,255,0.66)', ...shadow('md') }}>
        {TABS.map((t) => {
          if (t.fab) {
            return (
              <View key={t.name} style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
                <Pressable onPress={() => go('Scan')} style={{ width: 56, height: 56, borderRadius: 99, borderWidth: 3, borderColor: 'rgba(255,255,255,0.9)', backgroundColor: C.primary, alignItems: 'center', justifyContent: 'center', marginTop: -32, ...shadow('md', C.primary) }}>
                  <Icon name="scan" size={26} color="#fff" stroke={2.4} />
                </Pressable>
              </View>
            );
          }
          const active = activeRoute === t.name;
          return (
            <Pressable key={t.name} onPress={() => go(t.name)} style={{ flex: 1, alignItems: 'center', justifyContent: 'center', gap: 3, paddingVertical: 6, borderRadius: 15, backgroundColor: active ? C.primaryTint : 'transparent' }}>
              <Icon name={t.icon} size={24} color={active ? C.primaryPress : C.inkFaint} stroke={active ? 2.6 : 2.1} />
              <Text style={{ fontSize: 10.5, fontFamily: F.uiHeavy, color: active ? C.primaryPress : C.inkFaint }}>{t.label}</Text>
            </Pressable>
          );
        })}
      </BlurView>
    </View>
  );
}

export default function MainTabs() {
  return (
    <Tab.Navigator
      screenOptions={{ headerShown: false, lazy: true, freezeOnBlur: true }}
      tabBar={(props) => <GlassTabBar {...props} />}
      backBehavior="history"
    >
      <Tab.Screen name="Home" component={HomeScreen} />
      <Tab.Screen name="Meds" component={MedsScreen} />
      <Tab.Screen name="Schedule" component={ScheduleScreen} />
      <Tab.Screen name="History" component={HistoryScreen} />
    </Tab.Navigator>
  );
}
