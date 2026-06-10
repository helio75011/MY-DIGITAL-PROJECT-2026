import { Feather } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import React from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { AppHeader } from '../components/AppHeader';
import { ModeCard } from '../components/ModeCard';
import { RouteCard } from '../components/RouteCard';
import { colors } from '../theme/colors';
import type { RootStackParamList } from '../navigation/types';

/**
 * Écran "Réserver un trajet" (onglet "Trajets", Figma 23:2060).
 * Carte itinéraire (position → destination), choix du mode
 * (Accompagnement Solidaire → Matching / Chauffeur Premium → Driver).
 */
export function BookingScreen() {
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
          <Text style={styles.pageTitle}>Réserver un trajet</Text>
        </View>

        {/* Carte itinéraire */}
        <View style={styles.routeWrap}>
          <RouteCard position="62 Rue de la Paix, Paris" destination="Gare du Nord, 75010" />
        </View>

        {/* Modes de trajet */}
        <Text style={styles.sectionTitle}>Choisir votre mode de trajet</Text>

        <View style={styles.modes}>
          <ModeCard
            variant="solidaire"
            title="Accompagnement Solidaire"
            description="Profils vérifiés, femme à femme. Idéal pour les trajets quotidiens."
            eta="21 min"
            onPress={() => navigation.navigate('Matching')}
          />
          <ModeCard
            variant="premium"
            title="Chauffeur Premium"
            description="Agent certifié avec véhicule de veille. Protection maximale immédiate."
            eta="12 min"
            price="15,00€"
            onPress={() => navigation.navigate('Driver')}
          />
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: '#ffffff',
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
    fontSize: 30,
    fontWeight: '800',
    color: colors.navy,
    letterSpacing: -0.75,
  },
  routeWrap: {
    marginTop: 20,
  },
  sectionTitle: {
    color: colors.navy,
    fontSize: 16,
    fontWeight: '700',
    letterSpacing: 0.5,
    marginTop: 28,
    marginBottom: 16,
  },
  modes: {
    gap: 20,
  },
});
