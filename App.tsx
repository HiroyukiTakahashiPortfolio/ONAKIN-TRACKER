// App.tsx（ルート）
import React from 'react';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import AppRoot from './src/AppRoot';

export default function App() {
  return (
    <SafeAreaProvider>
      <AppRoot />
    </SafeAreaProvider>
  );
}
