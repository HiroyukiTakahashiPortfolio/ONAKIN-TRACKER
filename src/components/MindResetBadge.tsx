// src/components/MindResetBadge.tsx
import React from 'react';
import { View, Text, Image } from 'react-native';

export default function MindResetBadge() {
  return (
    <View
      style={{
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 14,
        paddingVertical: 8,
        borderRadius: 9999,
        backgroundColor: '#020617',

        shadowColor: '#000',
        shadowOpacity: 0.3,
        shadowOffset: { width: 0, height: 10 },
        shadowRadius: 18,
        elevation: 6,
      }}
    >
      <Image
        source={require('../assets/mindreset-logo.png')}
        style={{
          width: 28,
          height: 28,
          marginRight: 8,
        }}
        resizeMode="contain"
      />
      <Text
        style={{
          color: '#e0f2fe',
          fontSize: 15,
          fontWeight: '600',
        }}
      >
        Mind Reset
      </Text>
    </View>
  );
}
