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
// Matching/Driver sont exclus : ils exigent des params (rideRef, itinéraire)
// fournis par le flux de réservation et ne peuvent pas être ouverts directement.
// Ce type ne liste que des écrans SANS params (navigate sans 2e argument).
type DevScreen = 'Welcome' | 'Biometric' | 'MainTabs' | 'Tracking' | 'TrackingPremium';
const DEV_SCREENS: DevScreen[] = [
  'Welcome',
  'Biometric',
  'MainTabs',
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
