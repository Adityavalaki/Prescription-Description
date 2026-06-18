// screens/ScanScreen.js — camera mock with viewfinder, controls, manual shortcut.
import React, { useState } from 'react';
import { View, Text, Pressable } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Icon from '../components/Icon';
import RxPad from '../components/RxPad';
import { Toast, useToast } from '../components/ui';
import { C, F } from '../theme/colors';
import { pickPrescriptionImage } from '../services/extract';

export default function ScanScreen({ navigation }) {
  const insets = useSafeAreaInsets();
  const [flash, setFlash] = useState(false);
  const [msg, toast] = useToast();

  // capture (camera) or pick (gallery) -> hand the image bytes to Processing
  const grab = async (fromCamera) => {
    try {
      const img = await pickPrescriptionImage(fromCamera);
      if (!img) return; // user cancelled
      navigation.replace('Processing', { base64: img.base64, mime: img.mime });
    } catch (e) {
      toast(String(e.message || e), 'x');
    }
  };

  const corner = (x, y) => ({
    position: 'absolute', width: 30, height: 30,
    [x ? 'right' : 'left']: -12, [y ? 'bottom' : 'top']: -12,
    borderTopWidth: y ? 0 : 3, borderBottomWidth: y ? 3 : 0,
    borderLeftWidth: x ? 0 : 3, borderRightWidth: x ? 3 : 0, borderColor: '#fff',
  });

  return (
    <View style={{ flex: 1, backgroundColor: '#14110F' }}>
      <Toast msg={msg} />
      {/* top bar */}
      <View style={{ position: 'absolute', top: insets.top + 8, left: 0, right: 0, zIndex: 5, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 18 }}>
        <Pressable onPress={() => navigation.goBack()} style={{ width: 38, height: 38, borderRadius: 99, backgroundColor: 'rgba(255,255,255,0.14)', alignItems: 'center', justifyContent: 'center' }}>
          <Icon name="x" size={20} color="#fff" stroke={2.4} />
        </Pressable>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 7, height: 34, paddingHorizontal: 13, borderRadius: 99, backgroundColor: 'rgba(255,255,255,0.14)' }}>
          <Icon name="sparkle" size={15} color="#FFD9A0" stroke={2} />
          <Text style={{ color: '#fff', fontSize: 12.5, fontFamily: F.uiMed }}>Lay it flat & fill the frame</Text>
        </View>
        <View style={{ width: 38 }} />
      </View>

      {/* viewfinder */}
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
        <View style={{ width: 286, transform: [{ rotate: '-1.5deg' }] }}>
          <RxPad scale={0.92} />
          <View style={corner(0, 0)} />
          <View style={corner(1, 0)} />
          <View style={corner(0, 1)} />
          <View style={corner(1, 1)} />
        </View>
        <Text style={{ position: 'absolute', bottom: 150, color: 'rgba(255,255,255,0.7)', fontSize: 13, fontFamily: F.uiMed }}>Detecting prescription pad…</Text>
      </View>

      {/* manual entry shortcut */}
      <Pressable onPress={() => navigation.navigate('ManualEntry')} style={{ alignSelf: 'center', marginBottom: 6, flexDirection: 'row', alignItems: 'center', gap: 7, height: 38, paddingHorizontal: 16, borderRadius: 99, backgroundColor: 'rgba(255,255,255,0.14)' }}>
        <Icon name="edit" size={15} color="#fff" stroke={2.2} />
        <Text style={{ color: '#fff', fontSize: 13.5, fontFamily: F.uiBold }}>Type it in instead</Text>
      </Pressable>

      {/* controls */}
      <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 36, paddingBottom: insets.bottom + 30 }}>
        <Pressable onPress={() => grab(false)} style={{ width: 50, height: 50, borderRadius: 14, backgroundColor: 'rgba(255,255,255,0.14)', alignItems: 'center', justifyContent: 'center' }}>
          <Icon name="image" size={22} color="#fff" stroke={2} />
        </Pressable>
        <Pressable onPress={() => grab(true)} style={{ width: 78, height: 78, borderRadius: 99, borderWidth: 4, borderColor: 'rgba(255,255,255,0.35)', alignItems: 'center', justifyContent: 'center' }}>
          <View style={{ width: 60, height: 60, borderRadius: 99, backgroundColor: '#fff' }} />
        </Pressable>
        <Pressable onPress={() => { setFlash((f) => !f); toast(flash ? 'Flash off' : 'Flash on', 'bolt'); }} style={{ width: 50, height: 50, borderRadius: 14, backgroundColor: flash ? 'rgba(255,220,150,0.9)' : 'rgba(255,255,255,0.14)', alignItems: 'center', justifyContent: 'center' }}>
          <Icon name="bolt" size={22} color={flash ? '#7a5a10' : '#fff'} stroke={2} />
        </Pressable>
      </View>
    </View>
  );
}
