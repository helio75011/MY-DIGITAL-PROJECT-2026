import { NavigationContainer, createNavigationContainerRef } from '@react-navigation/native';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { AuthProvider } from './auth/AuthContext';
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
      <AuthProvider>
        <NavigationContainer ref={navigationRef}>
          <RootNavigator />
          <ScreenSwitcher
            screens={DEV_SCREENS}
            current={'MainTabs'}
            onSelect={(screen) => {
              // Le menu de dev ne peut sauter que vers un écran de la pile active
              // (connecté vs non connecté) ; les sauts hors pile sont ignorés.
              if (navigationRef.isReady()) navigationRef.navigate(screen);
            }}
          />
        </NavigationContainer>
      </AuthProvider>
    </SafeAreaProvider>
  );
}
