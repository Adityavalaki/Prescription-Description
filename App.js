// App.js — Medira root. Loads fonts, sets up the navigation stack.
import React from 'react';
import { View } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { useFonts } from 'expo-font';
import { Outfit_600SemiBold, Outfit_700Bold } from '@expo-google-fonts/outfit';
import { Figtree_400Regular, Figtree_600SemiBold, Figtree_700Bold, Figtree_800ExtraBold } from '@expo-google-fonts/figtree';
import { Caveat_600SemiBold } from '@expo-google-fonts/caveat';

import { C } from './src/theme/colors';
import MainTabs from './src/navigation/MainTabs';
import { useReka } from './src/state/store';
import { useReminders } from './src/services/notifications';

// Mounts the medication-reminder engine app-wide. UI-independent — keeps reminders
// scheduled from the store and routes notification Taken/Snooze taps back to the store.
function RemindersBridge() {
  const [s, A] = useReka();
  useReminders(s.meds, (action, data) => A.reminderAction(action, data));
  return null;
}

import LoginScreen from './src/screens/LoginScreen';
import ProfileScreen from './src/screens/ProfileScreen';
import MealTimesScreen from './src/screens/MealTimesScreen';
import WelcomeScreen from './src/screens/WelcomeScreen';
import ScanScreen from './src/screens/ScanScreen';
import ProcessingScreen from './src/screens/ProcessingScreen';
import ResultsScreen from './src/screens/ResultsScreen';
import MedDetailScreen from './src/screens/MedDetailScreen';
import ManualEntryScreen from './src/screens/ManualEntryScreen';
import AlarmSoundScreen from './src/screens/AlarmSoundScreen';
import EditReminderScreen from './src/screens/EditReminderScreen';
import SettingsScreen from './src/screens/SettingsScreen';
import SosScreen from './src/screens/SosScreen';
import SosContactsScreen from './src/screens/SosContactsScreen';

const Stack = createNativeStackNavigator();

export default function App() {
  const [loaded] = useFonts({
    Outfit_600SemiBold, Outfit_700Bold,
    Figtree_400Regular, Figtree_600SemiBold, Figtree_700Bold, Figtree_800ExtraBold,
    Caveat_600SemiBold,
  });

  if (!loaded) return <View style={{ flex: 1, backgroundColor: C.deep }} />;

  return (
    <SafeAreaProvider>
      <StatusBar style="dark" />
      <RemindersBridge />
      <NavigationContainer>
        <Stack.Navigator initialRouteName="Login" screenOptions={{ headerShown: false, contentStyle: { backgroundColor: C.paper } }}>
          {/* onboarding */}
          <Stack.Screen name="Login" component={LoginScreen} />
          <Stack.Screen name="Profile" component={ProfileScreen} />
          <Stack.Screen name="MealTimes" component={MealTimesScreen} />
          <Stack.Screen name="Welcome" component={WelcomeScreen} />
          {/* main app */}
          <Stack.Screen name="Main" component={MainTabs} />
          {/* flows presented over the tabs */}
          <Stack.Screen name="Scan" component={ScanScreen} options={{ presentation: 'fullScreenModal', animation: 'slide_from_bottom' }} />
          <Stack.Screen name="Processing" component={ProcessingScreen} options={{ presentation: 'fullScreenModal' }} />
          <Stack.Screen name="Results" component={ResultsScreen} options={{ presentation: 'fullScreenModal' }} />
          <Stack.Screen name="MedDetail" component={MedDetailScreen} />
          <Stack.Screen name="ManualEntry" component={ManualEntryScreen} />
          <Stack.Screen name="AlarmSound" component={AlarmSoundScreen} />
          <Stack.Screen name="EditReminder" component={EditReminderScreen} />
          <Stack.Screen name="Settings" component={SettingsScreen} />
          <Stack.Screen name="Sos" component={SosScreen} options={{ presentation: 'fullScreenModal', animation: 'slide_from_bottom' }} />
          <Stack.Screen name="SosContacts" component={SosContactsScreen} />
        </Stack.Navigator>
      </NavigationContainer>
    </SafeAreaProvider>
  );
}
