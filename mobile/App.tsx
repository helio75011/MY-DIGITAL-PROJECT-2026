import { NavigationContainer, createNavigationContainerRef } from '@react-navigation/native';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { ScreenSwitcher } from './components/ScreenSwitcher';
import { RootNavigator } from './navigation';
import type { RootStackParamList } from './navigation/types';

// Réf de navigation partagée avec le menu de dev (saut direct vers un écran).
const navigationRef = createNavigationContainerRef<RootStackParamList>();

// Écrans atteignables depuis le menu de dev (ScreenSwitcher).
const DEV_SCREENS: (keyof RootStackParamList)[] = [
  'Welcome',
  'Biometric',
  'MainTabs',
  'Matching',
  'Driver',
  'Tracking',
  'TrackingPremium',
];

export default function App() {
  return (
    <SafeAreaProvider>
      <StatusBar style="dark" />
      <NavigationContainer ref={navigationRef}>
        <RootNavigator />
        <ScreenSwitcher
          screens={DEV_SCREENS}
          current={'MainTabs'}
          onSelect={(screen) => {
            if (navigationRef.isReady()) navigationRef.navigate(screen);
          }}
        />
      </NavigationContainer>
    </SafeAreaProvider>
  );
}
