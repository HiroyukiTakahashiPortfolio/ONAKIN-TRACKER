import React from 'react';
import { Pressable, Text } from 'react-native';
import styles from '../ui/styles';

export default function SecondaryButton({ label, onPress }: { label: string; onPress: () => void }) {
  return (
    <Pressable onPress={onPress} style={({ pressed }) => [
      styles.btn, styles.btnSecondary, pressed && { opacity: 0.9 }
    ]}>
      <Text style={[styles.btnText, { color: '#111827' }]}>{label}</Text>
    </Pressable>
  );
}
