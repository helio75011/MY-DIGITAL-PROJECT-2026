import { Feather } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import React from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { AppHeader } from '../components/AppHeader';
import { BottomNav } from '../components/BottomNav';
import { Companion, CompanionCard } from '../components/CompanionCard';
import { RouteCard } from '../components/RouteCard';
import { goToTab } from '../navigation/helpers';
import type { RootStackParamList } from '../navigation/types';
import { colors } from '../theme/colors';

// Accompagnatrices à proximité (Figma 23:2122).
const COMPANIONS: Companion[] = [
  { id: '1', name: 'Lia Presko', rating: '4.8', time: '1 min', distance: '40m' },
  { id: '2', name: 'Laure Peri', rating: '5', time: '6 min', distance: '420m' },
  { id: '3', name: 'Marie Benet', rating: '4.9', time: '3 min', distance: '240m' },
  { id: '4', name: 'Sara Digne', rating: '4.6', time: '10 min', distance: '800m' },
  { id: '5', name: 'Clara Dias', rating: '3.2', time: '2 min', distance: '150m' },
];

/**
 * Écran "Trouver une accompagnatrice" (Figma 23:2122).
 * Carte itinéraire, liste des accompagnatrices à proximité ; sélectionner
 * une accompagnatrice ouvre le suivi de trajet (Tracking).
 */
export function MatchingScreen() {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();

  return (
    <View style={styles.root}>
      <AppHeader />

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        {/* Titre */}
        <View style={styles.titleRow}>
          <Pressable hitSlop={8} onPress={() => navigation.goBack()}>
            <Feather name="chevron-left" size={26} color={colors.navy} />
          </Pressable>
          <Text style={styles.pageTitle}>Trouver une accompagnatrice</Text>
        </View>

        {/* Carte itinéraire */}
        <View style={styles.routeWrap}>
          <RouteCard position="62 Rue de la Paix, Paris" destination="Gare du Nord, 75010" />
        </View>

        {/* Liste à proximité */}
        <Text style={styles.sectionTitle}>À proximité</Text>
        <View style={styles.list}>
          {COMPANIONS.map((c) => (
            <CompanionCard key={c.id} companion={c} onSelect={() => navigation.navigate('Tracking')} />
          ))}
        </View>
      </ScrollView>

      <BottomNav active="Trajets" onNavigate={(tab) => goToTab(navigation, tab)} />
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
  header: {
    height: 60,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    backgroundColor: '#ffffff',
  },
  headerLogo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  headerLogoText: {
    fontSize: 11,
    color: colors.primary,
  },
  content: {
    paddingHorizontal: 24,
    paddingTop: 4,
    paddingBottom: 24,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  pageTitle: {
    flex: 1,
    fontSize: 26,
    fontWeight: '800',
    color: colors.navy,
    letterSpacing: -0.65,
  },
  routeWrap: {
    marginTop: 20,
  },
  sectionTitle: {
    color: colors.navy,
    fontSize: 16,
    fontWeight: '700',
    marginTop: 24,
    marginBottom: 16,
  },
  list: {
    gap: 12,
  },
});
