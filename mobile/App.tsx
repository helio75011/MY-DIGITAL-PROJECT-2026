import { StatusBar } from 'expo-status-bar';
import { useState } from 'react';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { ScreenSwitcher } from './components/ScreenSwitcher';
import { BiometricScreen } from './screens/BiometricScreen';
import { HistoryScreen } from './screens/HistoryScreen';
import { HomeScreen } from './screens/HomeScreen';
import { WelcomeScreen } from './screens/WelcomeScreen';

// Catalogue des écrans pour le menu de dev (à remplacer par une vraie navigation).
const SCREENS = {
  Welcome: WelcomeScreen,
  Biometric: BiometricScreen,
  Home: HomeScreen,
  History: HistoryScreen,
} as const;

type ScreenName = keyof typeof SCREENS;

export default function App() {
  const [current, setCurrent] = useState<ScreenName>('Welcome');
  const Screen = SCREENS[current];

  return (
    <SafeAreaProvider>
      <StatusBar style="dark" />
      <Screen />
      <ScreenSwitcher
        screens={Object.keys(SCREENS) as ScreenName[]}
        current={current}
        onSelect={setCurrent}
      />
    </SafeAreaProvider>
  );
}
