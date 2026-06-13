import { createBottomTabNavigator, type BottomTabBarProps } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import React from 'react';
import { ActivityIndicator, View } from 'react-native';
import { useAuth } from '../auth/AuthContext';
import { BottomNav, type TabKey } from '../components/BottomNav';
import { colors } from '../theme/colors';
import { BiometricScreen } from '../screens/BiometricScreen';
import { BookingScreen } from '../screens/BookingScreen';
import { DriverScreen } from '../screens/DriverScreen';
import { HistoryScreen } from '../screens/HistoryScreen';
import { HomeScreen } from '../screens/HomeScreen';
import { KycScreen } from '../screens/KycScreen';
import { MatchingScreen } from '../screens/MatchingScreen';
import { ProfileScreen } from '../screens/ProfileScreen';
import { SignupScreen } from '../screens/SignupScreen';
import { TrackingScreen } from '../screens/TrackingScreen';
import { WelcomeScreen } from '../screens/WelcomeScreen';
import type { MainTabParamList, RootStackParamList } from './types';

const Tab = createBottomTabNavigator<MainTabParamList>();
const Stack = createNativeStackNavigator<RootStackParamList>();

// Variante Premium du suivi (Figma 23:2642) : même écran, autres données.
function TrackingPremiumScreen() {
  return (
    <TrackingScreen
      status="Trajet Premium"
      eta="Arrivée dans 16 mins"
      progress={10}
      name="Mélanie Lepenant"
      role="Chauffeur"
      rating="4.8"
      distance={undefined}
    />
  );
}

// Barre d'onglets personnalisée = notre BottomNav fidèle à la maquette.
function CustomTabBar({ state, navigation }: BottomTabBarProps) {
  const active = state.routeNames[state.index] as TabKey;
  return (
    <BottomNav
      active={active}
      onNavigate={(tab) => navigation.navigate(tab)}
    />
  );
}

function MainTabs() {
  return (
    <Tab.Navigator
      screenOptions={{ headerShown: false }}
      tabBar={(props) => <CustomTabBar {...props} />}
    >
      <Tab.Screen name="Accueil" component={HomeScreen} />
      <Tab.Screen name="Historique" component={HistoryScreen} />
      <Tab.Screen name="Profile" component={ProfileScreen} />
      <Tab.Screen name="Trajets" component={BookingScreen} />
    </Tab.Navigator>
  );
}

// Écran d'attente le temps de réhydrater la session (token persistant).
function SplashScreen() {
  return (
    <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.background }}>
      <ActivityIndicator size="large" color={colors.primary} />
    </View>
  );
}

/**
 * Pile racine gardée par l'authentification :
 *  - chargement de la session → Splash ;
 *  - non connecté → Welcome → Biometric ;
 *  - connecté → MainTabs + écrans de flux (Matching, Driver, Tracking).
 */
export function RootNavigator() {
  const { user, loading } = useAuth();

  if (loading) return <SplashScreen />;

  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      {user ? (
        <>
          <Stack.Screen name="MainTabs" component={MainTabs} />
          <Stack.Screen name="Kyc" component={KycScreen} />
          <Stack.Screen name="Matching" component={MatchingScreen} />
          <Stack.Screen name="Driver" component={DriverScreen} />
          <Stack.Screen name="Tracking" component={TrackingScreen} />
          <Stack.Screen name="TrackingPremium" component={TrackingPremiumScreen} />
        </>
      ) : (
        <>
          <Stack.Screen name="Welcome" component={WelcomeScreen} />
          <Stack.Screen name="Signup" component={SignupScreen} />
          <Stack.Screen name="Biometric" component={BiometricScreen} />
        </>
      )}
    </Stack.Navigator>
  );
}

export { TrackingPremiumScreen };
