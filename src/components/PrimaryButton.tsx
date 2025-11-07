import React from 'react';
import { Pressable, Text } from 'react-native';
import styles from '../ui/styles';

export default function PrimaryButton({ label, onPress, disabled }: { label: string; onPress: () => void; disabled?: boolean }) {
  return (
    <Pressable disabled={disabled} onPress={onPress} style={({ pressed }) => [
      styles.btn,
      { backgroundColor: disabled ? '#64748b' : '#111827' },
      pressed && !disabled && { opacity: 0.9 },
    ]}>
      <Text style={styles.btnText}>{label}</Text>
    </Pressable>
  );
}
