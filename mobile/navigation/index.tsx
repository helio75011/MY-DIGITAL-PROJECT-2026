import { createBottomTabNavigator, type BottomTabBarProps } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import React from 'react';
import { ActivityIndicator, View } from 'react-native';
import { useAuth } from '../auth/AuthContext';
import { BottomNav, type NavTab, type TabKey } from '../components/BottomNav';
import { colors } from '../theme/colors';
import { ActorProfileScreen } from '../screens/ActorProfileScreen';
import { ActorRequestsScreen } from '../screens/ActorRequestsScreen';
import { ActorRidesScreen } from '../screens/ActorRidesScreen';
import { ActorVehicleScreen } from '../screens/ActorVehicleScreen';
import type { ActorTabParamList } from './types';
import { BiometricScreen } from '../screens/BiometricScreen';
import { BookingScreen } from '../screens/BookingScreen';
import { DriverScreen } from '../screens/DriverScreen';
import { HistoryScreen } from '../screens/HistoryScreen';
import { ContactsScreen } from '../screens/ContactsScreen';
import { HomeScreen } from '../screens/HomeScreen';
import { KycScreen } from '../screens/KycScreen';
import { MatchingScreen } from '../screens/MatchingScreen';
import { ProfileScreen } from '../screens/ProfileScreen';
import { SafeMatchScreen } from '../screens/SafeMatchScreen';
import { SafeZonesScreen } from '../screens/SafeZonesScreen';
import { SignupScreen } from '../screens/SignupScreen';
import { TrackingScreen } from '../screens/TrackingScreen';
import { WelcomeScreen } from '../screens/WelcomeScreen';
import type { MainTabParamList, RootStackParamList } from './types';

const Tab = createBottomTabNavigator<MainTabParamList>();
const ActorTab = createBottomTabNavigator<ActorTabParamList>();
const Stack = createNativeStackNavigator<RootStackParamList>();

// Onglets de l'expérience acteur (accompagnatrice / chauffeur).
const ACTOR_TABS: NavTab[] = [
  { key: 'Courses', icon: 'navigation', label: 'COURSES' },
  { key: 'MesTrajets', icon: 'clock', label: 'MES TRAJETS' },
  { key: 'MonProfil', icon: 'user', label: 'PROFIL' },
];

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

// Barre d'onglets acteur (liste ACTOR_TABS).
function ActorTabBar({ state, navigation }: BottomTabBarProps) {
  const active = state.routeNames[state.index];
  return (
    <BottomNav active={active} tabs={ACTOR_TABS} onNavigate={(tab) => navigation.navigate(tab)} />
  );
}

// Onglets pour les acteurs (accompagnatrice / chauffeur).
function ActorTabs() {
  return (
    <ActorTab.Navigator
      screenOptions={{ headerShown: false }}
      tabBar={(props) => <ActorTabBar {...props} />}
    >
      <ActorTab.Screen name="Courses" component={ActorRequestsScreen} />
      <ActorTab.Screen name="MesTrajets" component={ActorRidesScreen} />
      <ActorTab.Screen name="MonProfil" component={ActorProfileScreen} />
    </ActorTab.Navigator>
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
 *  - passagère connectée → MainTabs + écrans de flux (Matching, Driver, Tracking) ;
 *  - acteur connecté (GUARDIAN/DRIVER) → ActorTabs (Courses / Mes trajets / Profil).
 */
export function RootNavigator() {
  const { user, loading } = useAuth();

  if (loading) return <SplashScreen />;

  const isActor = user?.role === 'GUARDIAN' || user?.role === 'DRIVER';

  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      {!user ? (
        <>
          <Stack.Screen name="Welcome" component={WelcomeScreen} />
          <Stack.Screen name="Signup" component={SignupScreen} />
          <Stack.Screen name="Biometric" component={BiometricScreen} />
        </>
      ) : isActor ? (
        <>
          <Stack.Screen name="ActorTabs" component={ActorTabs} />
          <Stack.Screen name="ActorVehicle" component={ActorVehicleScreen} />
        </>
      ) : (
        <>
          <Stack.Screen name="MainTabs" component={MainTabs} />
          <Stack.Screen name="Kyc" component={KycScreen} />
          <Stack.Screen name="Contacts" component={ContactsScreen} />
          <Stack.Screen name="SafeZones" component={SafeZonesScreen} />
          <Stack.Screen name="Matching" component={MatchingScreen} />
          <Stack.Screen name="Driver" component={DriverScreen} />
          <Stack.Screen name="SafeMatch" component={SafeMatchScreen} />
          <Stack.Screen name="Tracking" component={TrackingScreen} />
          <Stack.Screen name="TrackingPremium" component={TrackingPremiumScreen} />
        </>
      )}
    </Stack.Navigator>
  );
}

export { TrackingPremiumScreen };
