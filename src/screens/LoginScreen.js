// screens/LoginScreen.js — name + phone, or "Continue with Google".
import React, { useState } from 'react';
import { View, Text, TextInput, Pressable, ScrollView } from 'react-native';
import Svg, { Path } from 'react-native-svg';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Icon from '../components/Icon';
import { Logo } from '../components/common';
import { Button } from '../components/ui';
import { C, F } from '../theme/colors';
import { useReka } from '../state/store';

function GoogleG() {
  return (
    <Svg width={20} height={20} viewBox="0 0 48 48">
      <Path fill="#EA4335" d="M24 9.5c3.5 0 6.6 1.2 9 3.6l6.7-6.7C35.6 2.4 30.2 0 24 0 14.6 0 6.4 5.4 2.5 13.3l7.9 6.1C12.2 13.7 17.6 9.5 24 9.5z" />
      <Path fill="#4285F4" d="M46.5 24.5c0-1.6-.1-3.1-.4-4.5H24v9h12.7c-.5 3-2.2 5.5-4.7 7.2l7.3 5.7c4.3-3.9 6.7-9.7 6.7-16.4z" />
      <Path fill="#FBBC05" d="M10.4 28.6c-.5-1.5-.8-3-.8-4.6s.3-3.1.8-4.6l-7.9-6.1C.9 16.5 0 20.1 0 24s.9 7.5 2.5 10.7l7.9-6.1z" />
      <Path fill="#34A853" d="M24 48c6.5 0 11.9-2.1 15.9-5.8l-7.3-5.7c-2 1.4-4.7 2.3-8.6 2.3-6.4 0-11.8-4.2-13.6-9.9l-7.9 6.1C6.4 42.6 14.6 48 24 48z" />
    </Svg>
  );
}

function Input({ value, onChange, placeholder, icon, keyboardType }) {
  const [focus, setFocus] = useState(false);
  return (
    <View style={{ position: 'relative', justifyContent: 'center' }}>
      {icon ? <View style={{ position: 'absolute', left: 15, zIndex: 1 }}><Icon name={icon} size={19} color={C.inkFaint} stroke={2} /></View> : null}
      <TextInput
        value={value} onChangeText={onChange} placeholder={placeholder} placeholderTextColor={C.inkFaint}
        keyboardType={keyboardType} onFocus={() => setFocus(true)} onBlur={() => setFocus(false)}
        style={{ height: 54, borderRadius: 15, borderWidth: 1.5, borderColor: focus ? C.primary : C.line, backgroundColor: C.surface, paddingLeft: icon ? 44 : 16, paddingRight: 15, fontSize: 16.5, fontFamily: F.ui, color: C.ink }}
      />
    </View>
  );
}

export default function LoginScreen({ navigation }) {
  const insets = useSafeAreaInsets();
  const [, A] = useReka();
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const valid = name.trim().length > 1 && phone.replace(/\D/g, '').length >= 7;

  const cont = (n, p) => {
    A.setProfile({ name: (n || name).trim() || 'Maya', phone: p || phone, loggedIn: true });
    navigation.navigate('Profile');
  };
  const google = () => { setName('Maya Ferreira'); setPhone('(555) 018-2245'); cont('Maya Ferreira', '(555) 018-2245'); };

  return (
    <ScrollView style={{ flex: 1, backgroundColor: C.paper }} contentContainerStyle={{ flexGrow: 1, paddingHorizontal: 22, paddingTop: insets.top + 16, paddingBottom: 36 }} keyboardShouldPersistTaps="handled">
      <Logo size={28} />
      <View style={{ marginTop: 40 }}>
        <Text style={{ fontFamily: F.display, fontSize: 32, lineHeight: 35, letterSpacing: -0.6, color: C.ink }}>Hello there</Text>
        <Text style={{ fontSize: 16, lineHeight: 24, color: C.inkSoft, marginTop: 10, fontFamily: F.ui }}>Let's create your account so your medicines and reminders stay safe and synced.</Text>
      </View>

      <View style={{ gap: 14, marginTop: 30 }}>
        <View>
          <Text style={{ fontSize: 13.5, fontFamily: F.uiBold, color: C.inkSoft, marginBottom: 8 }}>Your name</Text>
          <Input value={name} onChange={setName} placeholder="e.g. Maya Ferreira" icon="user" />
        </View>
        <View>
          <Text style={{ fontSize: 13.5, fontFamily: F.uiBold, color: C.inkSoft, marginBottom: 8 }}>Phone number</Text>
          <Input value={phone} onChange={setPhone} placeholder="(555) 000-0000" icon="bell" keyboardType="phone-pad" />
        </View>
      </View>

      <View style={{ flex: 1, minHeight: 24 }} />

      <Button icon="arrowR" onPress={() => valid && cont()} style={{ opacity: valid ? 1 : 0.5 }}>Continue</Button>
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12, marginVertical: 16 }}>
        <View style={{ height: 1, flex: 1, backgroundColor: C.line }} />
        <Text style={{ fontSize: 13, color: C.inkFaint, fontFamily: F.uiMed }}>or</Text>
        <View style={{ height: 1, flex: 1, backgroundColor: C.line }} />
      </View>
      <Pressable onPress={google} style={{ height: 54, borderRadius: 999, borderWidth: 1.5, borderColor: C.line, backgroundColor: C.surface, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 11 }}>
        <GoogleG />
        <Text style={{ fontSize: 16, fontFamily: F.uiBold, color: C.ink }}>Continue with Google</Text>
      </Pressable>
      <Text style={{ fontSize: 11.5, color: C.inkFaint, textAlign: 'center', marginTop: 16, lineHeight: 17, fontFamily: F.ui }}>By continuing you agree to Medira's Terms & Privacy Policy.</Text>
    </ScrollView>
  );
}
